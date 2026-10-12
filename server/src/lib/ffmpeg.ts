import ffmpeg from 'fluent-ffmpeg';
import path from 'path';

export interface VideoMetadata {
  duration: number; // in seconds
  width: number;
  height: number;
  hasAudio: boolean;
}

export const extractVideoMetadata = (videoPath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      const audioStream = metadata.streams.find(s => s.codec_type === 'audio');
      if (!videoStream) return reject(new Error('No video stream found'));

      resolve({
        duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0,
        hasAudio: !!audioStream
      });
    });
  });
};

export const generateThumbnail = (videoPath: string, thumbnailPath: string, duration: number = 0): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Generate a thumbnail at 1-second mark, or 0s if video is shorter
    const timestamp = duration > 1 ? 1 : 0;
    const filename = path.basename(thumbnailPath);
    const folder = path.dirname(thumbnailPath);

    ffmpeg(videoPath)
      .screenshots({
        timestamps: [timestamp],
        filename,
        folder,
        size: '320x180'
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
};

export const extractAudio = (videoPath: string, audioPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .noVideo() // Strip video
      .audioCodec('libmp3lame') // Convert audio to mp3
      .on('end', () => resolve())
      .on('error', (err) => reject(err))
      .save(audioPath); // Simpler, idiomatic, auto-triggers execution without needing explicit .run()
  });
};
