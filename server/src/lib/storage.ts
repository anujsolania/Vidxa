import fs from 'fs';
import path from 'path';

// Define the root upload directory
const UPLOADS_DIR = path.join(process.cwd(), 'uploads', 'videos');

// Ensure directory exists
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

export const getStoragePath = (filename: string) => {
  return path.join(UPLOADS_DIR, filename);
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
