import { createWorker } from '@/lib/bullmq/QueueFactory';
import { logger } from '@/lib/logger';

export const crawlerWorker = createWorker('crawler-queue', async (job) => {
  logger.app.info(`[Crawler Worker] Processing job ${job.id}:`, job.data);
  const { url, depth } = job.data;
  
  if (!url) {
    throw new Error('URL is required for crawler job');
  }

  logger.app.info(`[Crawler Worker] Crawling ${url} up to depth ${depth || 1}...`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  logger.app.info(`[Crawler Worker] Successfully crawled ${url}.`);
  
  return { status: 'success', crawledUrl: url, extractedPages: 5 };
}, {
  concurrency: 2
});

crawlerWorker.on('failed', (job, err) => {
  logger.app.error(`[Crawler Worker] Job ${job?.id} failed:`, err.message);
});
