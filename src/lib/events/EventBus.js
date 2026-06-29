// 🚀 V5.0 FEATURE 1: Idempotency Key ile BullMQ Consumer güvenliği.
const { Queue, Worker } = require('bullmq');
const redisClient = require('../redis/client');
const crypto = require('crypto');

class PersistentEventBus {
  constructor() {
    this.queueName = 'enterprise-event-bus';
    this.eventQueue = new Queue(this.queueName, { connection: redisClient });

    // Idempotency Shield: İşlenen event'leri 24 saat boyunca hatırla
    this.processedKeyPrefix = 'idempotent:event:';

    this.worker = new Worker(this.queueName, async (job) => {
      const { eventName, payload, eventId } = job.data;

      // ** IDEMPOTENCY KONTROLÜ **
      const idKey = this.processedKeyPrefix + eventId;
      const isProcessed = await redisClient.setnx(idKey, '1');
      if (!isProcessed) {
        console.log(`[EventBus] ♻️ Idempotency: Event ${eventId} zaten işlenmiş. Atlanıyor.`);
        return; // Sessizce başarılı say
      }
      // 24 saat sonra otomatik silinsin
      await redisClient.expire(idKey, 86400);

      // İşleyicileri çalıştır
      if (this.handlers[eventName]) {
        for (const handler of this.handlers[eventName]) {
          await handler(payload);
        }
      }
    }, { connection: redisClient });

    this.handlers = {};
    this.worker.on('failed', (job, err) => {
      console.error(`[EventBus] ❌ Event ${job.id} başarısız: ${err.message}`);
    });
  }

  async publish(eventName, payload, eventId = null) {
    const id = eventId || crypto.randomUUID();
    await this.eventQueue.add(eventName, { eventName, payload, eventId: id }, {
      attempts: 3,
      backoff: { type: 'exponential', delay: 2000 },
      removeOnComplete: true,
      removeOnFail: false,
      jobId: id // BullMQ'da aynı id ile ikinci kez eklenmesini engeller
    });
    console.log(`[EventBus] 📤 Event ${eventName} (ID: ${id}) kuyruğa alındı.`);
  }

  subscribe(eventName, callback) {
    if (!this.handlers[eventName]) this.handlers[eventName] = [];
    this.handlers[eventName].push(callback);
  }
}

module.exports = { EventBus: new PersistentEventBus() };
