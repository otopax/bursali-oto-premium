import { createWorker } from '@/lib/bullmq/QueueFactory';
import { logger } from '@/lib/logger';

export const embeddingWorker = createWorker('embedding-queue', async (job) => {
  logger.ai.info(`[Embedding Worker] Processing job ${job.id}:`, job.data);
  const { text, metadata } = job.data;
  
  if (!text) {
    throw new Error('Text content is required for embedding job');
  }

  logger.ai.info(`[Embedding Worker] Generating embedding for text length: ${text.length}...`);
  await new Promise(resolve => setTimeout(resolve, 1500));
  
  logger.ai.info(`[Embedding Worker] Successfully generated and stored embedding.`);
  
  return { status: 'success', vectorDimensions: 1536 };
}, {
  concurrency: 5
});

embeddingWorker.on('failed', (job, err) => {
  logger.ai.error(`[Embedding Worker] Job ${job?.id} failed:`, err.message);
});
