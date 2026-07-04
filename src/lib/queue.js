import { Queue, Worker, QueueEvents } from 'bullmq';
import IORedis from 'ioredis';

// Redis bağlantısı — REDIS_URL varsa onu kullan, yoksa host/port env'lerine düş
const connection = process.env.REDIS_URL
  ? new IORedis(process.env.REDIS_URL, { maxRetriesPerRequest: null })
  : new IORedis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379', 10),
      maxRetriesPerRequest: null // BullMQ için zorunlu ayar
    });

export const crawlerQueue = new Queue('crawler-queue', { connection });

// Olay dinleyici (Başarı ve hataları loglamak için)
const queueEvents = new QueueEvents('crawler-queue', { connection });

queueEvents.on('completed', ({ jobId }) => {
  console.log(`[BULLMQ] İşlem başarıyla tamamlandı: ${jobId}`);
});

queueEvents.on('failed', ({ jobId, failedReason }) => {
  console.error(`[BULLMQ] İşlem HATASI: ${jobId} - Sebep: ${failedReason}`);
});

// Kuyruğa iş ekleme fonksiyonu
export async function addCrawlerJob(jobName, payload) {
  return await crawlerQueue.add(jobName, payload, {
    attempts: 5, // Gemini 429 hatası verirse 5 kez dene
    backoff: {
      type: 'exponential', // Her hatada bekleme süresini katlayarak artır
      delay: 60000 // İlk hata sonrası 60 saniye bekle
    }
  });
}
