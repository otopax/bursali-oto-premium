import { Queue, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';

let connection = null;
let crawlerQueue = null;

if (!isBuildPhase && process.env.REDIS_URL && !process.env.REDIS_URL.includes('localhost') && !process.env.REDIS_URL.includes('127.0.0.1')) {
  try {
    connection = new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null, lazyConnect: true });
    connection.on('error', (err) => console.error('[BullMQ Redis Error]', err.message));
    crawlerQueue = new Queue('crawler-queue', { connection });
    const queueEvents = new QueueEvents('crawler-queue', { connection });

    queueEvents.on('completed', ({ jobId }) => {
      console.log(`[BULLMQ] İşlem başarıyla tamamlandı: ${jobId}`);
    });

    queueEvents.on('failed', ({ jobId, failedReason }) => {
      console.error(`[BULLMQ] İşlem HATASI: ${jobId} - Sebep: ${failedReason}`);
    });
  } catch (e) {
    console.warn('[BullMQ] Queue initialization bypassed:', e.message);
  }
}

export { crawlerQueue };

export async function addCrawlerJob(jobName, payload) {
  if (!crawlerQueue) {
    console.warn('[BullMQ] Queue not active. Skipping job.');
    return null;
  }
  return await crawlerQueue.add(jobName, payload, {
    attempts: 5,
    backoff: {
      type: 'exponential',
      delay: 60000
    }
  });
}
