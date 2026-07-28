import { Queue, Worker, QueueEvents } from 'bullmq';
import { getBullRedisClient } from '../redis/client.js';

// 1. Enterprise Redis Connection for BullMQ
export const redisConnection = getBullRedisClient();

// 2. Enterprise Queue Defaults (Retry Matrix, DLQ, Backoff)
const defaultQueueOptions = {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 5, // Retry Matrix: Max 5 attempts
    backoff: {
      type: 'exponential',
      delay: 2000 // Starts with 2s, 4s, 8s, 16s, 32s...
    },
    removeOnComplete: {
      age: 3600, // keep completed jobs for 1 hour
      count: 1000, // max 1000 completed jobs
    },
    removeOnFail: {
      age: 24 * 3600 // keep failed jobs (DLQ) for 24 hours
    }
  }
};

/**
 * Creates an Enterprise Grade BullMQ Queue
 * Includes DLQ (Dead Letter Queue) support.
 */
export function createQueue(queueName) {
  return new Queue(queueName, defaultQueueOptions);
}

/**
 * Creates an Enterprise Grade Worker with Error Tracking and Poison Queue handling.
 */
export function createWorker(queueName, processor, options = {}) {
  const worker = new Worker(queueName, async (job) => {
    // Idempotency check can be handled by job.id
    console.log(`[Worker][${queueName}] Processing Job: ${job.id} - Attempt: ${job.attemptsMade + 1}`);
    return await processor(job);
  }, {
    connection: redisConnection,
    concurrency: options.concurrency || 5,
    limiter: options.rateLimit || {
      max: 100, // Rate limit: 100 jobs
      duration: 1000 // per 1 second
    },
    ...options
  });

  // Global Error Handlers (Poison Queue tracking)
  worker.on('failed', (job, err) => {
    console.error(`[Worker][${queueName}] Job ${job?.id} Failed:`, err.message);
    if (job?.attemptsMade >= job?.opts?.attempts) {
      console.error(`[Worker][${queueName}] Job ${job?.id} moved to DLQ (Dead Letter Queue)`);
      // Here we could emit an event to Sentry or OpenTelemetry
    }
  });

  worker.on('error', err => {
    console.error(`[Worker][${queueName}] Critical Redis/Network Error:`, err);
  });

  return worker;
}

/**
 * Graceful Shutdown Logic for Workers
 */
export async function gracefulShutdown(workers) {
  console.log('Shutting down workers gracefully...');
  for (const worker of workers) {
    await worker.close();
  }
  await redisConnection.quit();
  console.log('Workers stopped.');
  process.exit(0);
}
