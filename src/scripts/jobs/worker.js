import { gracefulShutdown } from '@/lib/bullmq/QueueFactory';
import { appointmentWorker } from '@/workers/appointmentWorker';
import { crawlerWorker } from '@/workers/crawlerWorker';
import { embeddingWorker } from '@/workers/embeddingWorker';
import { logger } from '@/lib/logger';

const workers = [
  appointmentWorker,
  crawlerWorker,
  embeddingWorker
];

logger.app.info('🚀 BullMQ Enterprise Worker System Started.');
logger.app.info(`[Registered Workers]: ${workers.length}`);

// Graceful Shutdown for SigTerm and SigInt (Docker/Kubernetes/Railway)
const shutdown = async () => {
  logger.app.info('Shutting down workers gracefully...');
  await gracefulShutdown(workers);
};

process.on('SIGINT', shutdown);
process.on('SIGTERM', shutdown);

// Simple Health Check Endpoint for Railway/Vercel to ensure Worker is alive
import http from 'http';
const server = http.createServer((req, res) => {
  if (req.url === '/health') {
    res.writeHead(200);
    res.end('Worker is alive');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});
server.listen(process.env.PORT || 8080, () => {
  console.log(`🩺 Health check listening on port ${process.env.PORT || 8080}`);
});
