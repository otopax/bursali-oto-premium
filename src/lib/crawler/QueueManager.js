const IORedis = require('ioredis');
const { Queue, Worker, QueueEvents } = require('bullmq');

const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', { maxRetriesPerRequest: null });

/**
 * Enterprise Queue Manager
 * Manages all crawler and background task queues centrally.
 */
class QueueManager {
  constructor() {
    this.queues = new Map();
  }

  getQueue(name) {
    if (!this.queues.has(name)) {
      const queue = new Queue(name, {
        connection,
        defaultJobOptions: {
          attempts: 3,
          backoff: { type: 'exponential', delay: 5000 },
          removeOnComplete: true,
          removeOnFail: false
        }
      });
      this.queues.set(name, queue);
    }
    return this.queues.get(name);
  }

  async addJob(queueName, jobName, data, options = {}) {
    const queue = this.getQueue(queueName);
    return await queue.add(jobName, data, options);
  }

  createWorker(queueName, processor, concurrency = 1) {
    const worker = new Worker(queueName, processor, {
      connection,
      concurrency,
      limiter: { max: 5, duration: 5000 }
    });

    worker.on('completed', job => console.log(`[${queueName}] Job ${job.id} completed`));
    worker.on('failed', (job, err) => console.error(`[${queueName}] Job ${job?.id} failed:`, err.message));

    return worker;
  }
}

module.exports = { QueueManager: new QueueManager() };
