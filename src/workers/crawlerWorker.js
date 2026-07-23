import { createWorker } from '@/lib/bullmq/QueueFactory';

export const crawlerWorker = createWorker('crawler-queue', async (job) => {
  console.log(`[Crawler Worker] Processing job ${job.id}:`, job.data);
  const { url, depth } = job.data;
  
  if (!url) {
    throw new Error('URL is required for crawler job');
  }

  // Simulate crawling
  console.log(`[Crawler Worker] Crawling ${url} up to depth ${depth || 1}...`);
  await new Promise(resolve => setTimeout(resolve, 2000));
  
  console.log(`[Crawler Worker] Successfully crawled ${url}.`);
  
  return { status: 'success', crawledUrl: url, extractedPages: 5 };
}, {
  concurrency: 2 // Crawling is I/O bound
});

// Fallback error handlers
crawlerWorker.on('failed', (job, err) => {
  console.error(`[Crawler Worker] Job ${job?.id} failed:`, err.message);
});
