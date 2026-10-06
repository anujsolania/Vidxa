import { Router } from 'express';
import multer from 'multer';
import { uploadVideo, listVideos, getVideoDetails, streamVideo } from '../controllers/videoController';
import { requireAuth } from '../middlewares/authMiddleware';
import { getStoragePath } from '../lib/storage';

const router = Router();

// Configure multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    // Multer will place files here temporarily until storage logic handles it
    cb(null, getStoragePath(''));
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});
const upload = multer({ storage });

router.post('/upload', requireAuth, upload.single('video'), uploadVideo);
router.get('/', requireAuth, listVideos);
router.get('/:id', requireAuth, getVideoDetails);
router.get('/:id/stream', requireAuth, streamVideo);

export default router;
