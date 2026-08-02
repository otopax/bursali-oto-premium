import { gracefulShutdown } from '../../lib/bullmq/QueueFactory.js';
import { appointmentWorker } from '../../workers/appointmentWorker.js';
import { crawlerWorker } from '../../workers/crawlerWorker.js';
import { embeddingWorker } from '../../workers/embeddingWorker.js';
import { logger } from '../../lib/logger.js';
import http from 'http';

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
const server = http.createServer((req, res) => {
  if (req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' });
    res.end('Worker is alive');
  } else {
    res.writeHead(404);
    res.end('Not found');
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`🩺 Health check listening on port ${PORT}`);
});
