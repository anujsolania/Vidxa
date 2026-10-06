import { Request, Response } from 'express';
import { prisma } from '../lib/prisma';
import { getStoragePath, getFileSize, getFileStream } from '../lib/storage';

// Helper to serialize BigInt properties from Prisma
const serializeVideo = (video: any) => ({
  ...video,
  size: video.size != null ? video.size.toString() : video.size,
});

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
        status: 'READY' // Phase 3 sets this directly. In Phase 5, this will be 'PROCESSING'
      }
    });

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
