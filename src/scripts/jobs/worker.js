import { gracefulShutdown } from '@/lib/bullmq/QueueFactory';
import { appointmentWorker } from '@/workers/appointmentWorker';

const workers = [
  appointmentWorker,
  // Diğer worker'lar buraya eklenebilir
];

console.log('🚀 BullMQ Enterprise Worker System Started.');
console.log(`[Registered Workers]: ${workers.length}`);

// Graceful Shutdown for SigTerm and SigInt (Docker/Kubernetes/Railway)
const shutdown = async () => {
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
