import { createWorker } from '../lib/bullmq/QueueFactory.js';
import { logger } from '../lib/logger.js';

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

if (crawlerWorker && typeof crawlerWorker.on === 'function') {
  crawlerWorker.on('failed', (job, err) => {
    logger.app.error(`[Crawler Worker] Job ${job?.id} failed:`, err.message);
  });
}
