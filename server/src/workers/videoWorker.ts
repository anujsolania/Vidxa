import { Worker, Job } from 'bullmq';
import { redisConnection } from '../lib/redis';
import { prisma } from '../lib/prisma';
import { getStoragePath, getThumbnailPath, getAudioPath } from '../lib/storage';
import { extractVideoMetadata, generateThumbnail, extractAudio } from '../lib/ffmpeg';
import { transcribeAudio } from '../lib/whisper';
import { VideoJobData } from '../queues/videoQueue';

export const videoWorker = new Worker<VideoJobData>(
  'video-processing',
  async (job: Job<VideoJobData>) => {
    const { videoId, filename } = job.data;
    console.log(`[Worker] Processing video ID: ${videoId} (Attempt ${job.attemptsMade + 1})`);

    const videoPath = getStoragePath(filename);

    // 1. Extract Metadata
    const metadata = await extractVideoMetadata(videoPath);

    // 2. Generate Thumbnail
    const thumbnailFilename = filename.replace(/\.[^/.]+$/, '') + '.jpg';
    const thumbnailPath = getThumbnailPath(thumbnailFilename);
    await generateThumbnail(videoPath, thumbnailPath, metadata.duration);

    // 3. Extract Audio (if stream exists)
    let audioRelPath: string | null = null;
    let fullAudioPath: string | null = null;
    if (metadata.hasAudio) {
      const audioFilename = filename.replace(/\.[^/.]+$/, '') + '.mp3';
      fullAudioPath = getAudioPath(audioFilename);
      await extractAudio(videoPath, fullAudioPath);
      audioRelPath = `/uploads/audio/${audioFilename}`;
    }

    // 4. Transcribe Audio with Whisper (if audio was extracted)
    if (fullAudioPath) {
      console.log(`[Worker] Transcribing audio for video ID: ${videoId}...`);
      const segments = await transcribeAudio(fullAudioPath);
      console.log(`[Worker] Generated ${segments.length} transcript segments for video ID: ${videoId}`);

      // Delete existing segments (for reprocess safety) and bulk insert
      await prisma.transcriptSegment.deleteMany({
        where: { videoId },
      });

      if (segments.length > 0) {
        await prisma.transcriptSegment.createMany({
          data: segments.map((seg) => ({
            videoId,
            start: seg.start,
            end: seg.end,
            text: seg.text,
          })),
        });
      }
    }

    // 5. Update Database
    await prisma.video.update({
      where: { id: videoId },
      data: {
        duration: metadata.duration,
        thumbnailPath: `/uploads/thumbnails/${thumbnailFilename}`,
        audioPath: audioRelPath,
        status: 'READY',
        errorMessage: null,
      },
    });

    console.log(`[Worker] Successfully finished processing video ID: ${videoId}`);
  },
  {
    connection: redisConnection,
    concurrency: 2, // Process up to 2 videos concurrently
  }
);

videoWorker.on('completed', (job: Job<VideoJobData>) => {
  console.log(`[Worker] Job ${job.id} completed for video ID: ${job.data.videoId}`);
});

videoWorker.on('failed', async (job: Job<VideoJobData> | undefined, err: Error) => {
  if (job) {
    console.error(`[Worker] Job ${job.id} failed for video ID: ${job.data.videoId}:`, err.message);

    const maxAttempts = job.opts.attempts || 3;
    if (job.attemptsMade >= maxAttempts) {
      console.error(`[Worker] All ${maxAttempts} retry attempts exhausted for video ID: ${job.data.videoId}`);
      await prisma.video.update({
        where: { id: job.data.videoId },
        data: {
          status: 'ERROR',
          errorMessage: err.message,
        },
      });
    }
  }
});
