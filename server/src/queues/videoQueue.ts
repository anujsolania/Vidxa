import { Queue } from 'bullmq';
import { redisConnection } from '../lib/redis';

export interface VideoJobData {
  videoId: number;
  filename: string;
}

export const videoQueue = new Queue<VideoJobData>('video-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: {
      type: 'exponential',
      delay: 2000,
    },
    removeOnComplete: true,
    removeOnFail: false,
  },
});

export const addVideoProcessingJob = async (videoId: number, filename: string) => {
  return await videoQueue.add('process-video', { videoId, filename });
};
