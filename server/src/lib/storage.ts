import fs from 'fs';
import path from 'path';

// Define the root upload directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads');
const VIDEOS_DIR = path.join(UPLOADS_DIR, 'videos');
const THUMBNAILS_DIR = path.join(UPLOADS_DIR, 'thumbnails');
const AUDIO_DIR = path.join(UPLOADS_DIR, 'audio');

// Ensure directory exists
[VIDEOS_DIR, THUMBNAILS_DIR, AUDIO_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

export const getStoragePath = (filename: string) => {
  return path.join(VIDEOS_DIR, filename);
};

export const getThumbnailPath = (filename: string) => {
  return path.join(THUMBNAILS_DIR, filename);
};

export const getAudioPath = (filename: string) => {
  return path.join(AUDIO_DIR, filename);
};

export const getFileSize = (filePath: string): number => {
  try {
    const stat = fs.statSync(filePath);
    return stat.size;
  } catch (error) {
    return 0;
  }
};

export const getFileStream = (filePath: string, start: number, end: number) => {
  return fs.createReadStream(filePath, { start, end });
};
