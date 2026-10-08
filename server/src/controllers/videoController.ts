import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getStoragePath, getFileSize, getFileStream } from '../lib/storage';

// Helper to serialize BigInt properties from Prisma
const serializeVideo = (video: any) => ({
  ...video,
  size: video.size != null ? video.size.toString() : video.size,
});

import { extractVideoMetadata, generateThumbnail, extractAudio } from '../lib/ffmpeg';
import { getThumbnailPath, getAudioPath } from '../lib/storage';

const processVideoInBackground = async (videoId: number, filename: string) => {
  try {
    const videoPath = getStoragePath(filename);
    
    // 1. Extract Metadata
    const metadata = await extractVideoMetadata(videoPath);
    
    // 2. Generate Thumbnail
    const thumbnailFilename = filename.replace(/\.[^/.]+$/, "") + '.jpg';
    const thumbnailPath = getThumbnailPath(thumbnailFilename);
    await generateThumbnail(videoPath, thumbnailPath);

    // 3. Extract Audio
    const audioFilename = filename.replace(/\.[^/.]+$/, "") + '.mp3';
    const audioPath = getAudioPath(audioFilename);
    await extractAudio(videoPath, audioPath);

    // 4. Update DB
    await prisma.video.update({
      where: { id: videoId },
      data: { 
        duration: metadata.duration,
        thumbnailPath: `/uploads/thumbnails/${thumbnailFilename}`,
        audioPath: `/uploads/audio/${audioFilename}`,
        status: 'READY'
      }
    });

  } catch (error: any) {
    console.error(`Error processing video ${videoId}:`, error);
    await prisma.video.update({
      where: { id: videoId },
      data: { 
        status: 'ERROR',
        errorMessage: error.message
      }
    });
  }
};

export const uploadVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const file = req.file;

    if (!file) {
      res.status(400).json({ error: 'No video file uploaded' });
      return;
    }

    const title = req.body.title || file.originalname;

    const video = await prisma.video.create({
      data: {
        userId,
        title,
        filename: file.filename,
        storagePath: getStoragePath(file.filename),
        mimeType: file.mimetype,
        size: file.size,
        status: 'PROCESSING'
      }
    });

    // Fire and forget processing
    processVideoInBackground(video.id, file.filename);

    res.status(201).json({ video: serializeVideo(video) });
  } catch (error) {
    console.error('Error uploading video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const listVideos = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const videos = await prisma.video.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' }
    });

    res.json({ videos: videos.map(serializeVideo) });
  } catch (error) {
    console.error('Error listing videos:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const getVideoDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id: parseInt(id as string, 10) }
    });

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    // Ownership check
    if (video.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ video: serializeVideo(video) });
  } catch (error) {
    console.error('Error getting video:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

export const streamVideo = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as any).userId;
    const { id } = req.params;

    const video = await prisma.video.findUnique({
      where: { id: parseInt(id as string, 10) }
    });

    if (!video) {
      res.status(404).json({ error: 'Video not found' });
      return;
    }

    if (video.userId !== userId) {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const filePath = video.storagePath;
    const videoSize = getFileSize(filePath);
    
    if (videoSize === 0) {
      res.status(404).json({ error: 'Video file not found on disk' });
      return;
    }

    const range = req.headers.range;
    if (!range) {
      res.status(400).json({ error: 'Requires Range header' });
      return;
    }

    const CHUNK_SIZE = 10 ** 6; // 1MB
    const start = Number(range.replace(/\D/g, ''));
    const end = Math.min(start + CHUNK_SIZE, videoSize - 1);

    const contentLength = end - start + 1;
    const headers = {
      'Content-Range': `bytes ${start}-${end}/${videoSize}`,
      'Accept-Ranges': 'bytes',
      'Content-Length': contentLength,
      'Content-Type': video.mimeType,
    };

    res.writeHead(206, headers);
    const videoStream = getFileStream(filePath, start, end);
    videoStream.pipe(res);
  } catch (error) {
    console.error('Error streaming video:', error);
    if (!res.headersSent) {
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};
