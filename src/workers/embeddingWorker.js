import { createWorker } from '@/lib/bullmq/QueueFactory';

export const embeddingWorker = createWorker('embedding-queue', async (job) => {
  console.log(`[Embedding Worker] Processing job ${job.id}:`, job.data);
  const { text, metadata } = job.data;
  
  if (!text) {
    throw new Error('Text content is required for embedding job');
  }

  // Simulate embedding generation
  console.log(`[Embedding Worker] Generating embedding for text length: ${text.length}...`);
  await new Promise(resolve => setTimeout(resolve, 1500)); // Simulate API call to Gemini/OpenAI
  
  console.log(`[Embedding Worker] Successfully generated and stored embedding.`);
  
  return { status: 'success', vectorDimensions: 1536 };
}, {
  concurrency: 5 // Embedding API calls can be parallelized
});

// Fallback error handlers
embeddingWorker.on('failed', (job, err) => {
  console.error(`[Embedding Worker] Job ${job?.id} failed:`, err.message);
});
