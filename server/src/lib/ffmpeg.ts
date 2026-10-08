import ffmpeg from 'fluent-ffmpeg';

export interface VideoMetadata {
  duration: number; // in seconds
  width: number;
  height: number;
}

export const extractVideoMetadata = (videoPath: string): Promise<VideoMetadata> => {
  return new Promise((resolve, reject) => {
    ffmpeg.ffprobe(videoPath, (err, metadata) => {
      if (err) return reject(err);

      const videoStream = metadata.streams.find(s => s.codec_type === 'video');
      if (!videoStream) return reject(new Error('No video stream found'));

      resolve({
        duration: metadata.format.duration ? Math.round(metadata.format.duration) : 0,
        width: videoStream.width || 0,
        height: videoStream.height || 0
      });
    });
  });
};

export const generateThumbnail = (videoPath: string, thumbnailPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    // Generate a thumbnail at the 1-second mark
    ffmpeg(videoPath)
      .screenshots({
        timestamps: [1],
        filename: thumbnailPath.split('/').pop(), // fluent-ffmpeg expects just the filename here
        folder: thumbnailPath.split('/').slice(0, -1).join('/'), // and the folder here
        size: '320x180'
      })
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
};

export const extractAudio = (videoPath: string, audioPath: string): Promise<void> => {
  return new Promise((resolve, reject) => {
    ffmpeg(videoPath)
      .output(audioPath)
      .noVideo() // Strip video
      .audioCodec('libmp3lame') // Convert audio to mp3
      .on('end', () => resolve())
      .on('error', (err) => reject(err));
  });
};
