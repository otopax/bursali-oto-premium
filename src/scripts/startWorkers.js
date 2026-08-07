// 🚀 V5.0: Lider seçimi ile sadece 1 pod'un cron çalıştırmasını sağla.
const http = require('http');
const Redlock = require('../lib/locks/Redlock');
const { relayEvents } = require('./OutboxRelay');

// Railway Healthcheck Server for Worker Container
const port = process.env.PORT || 8080;
const server = http.createServer((req, res) => {
  if (req.url === '/api/health' || req.url === '/health' || req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ status: 'ok', worker: true, timestamp: new Date().toISOString() }));
  } else {
    res.writeHead(404);
    res.end();
  }
});

server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.warn(`[Worker Health Server] Port ${port} in use, skipping HTTP health listener.`);
  } else {
    console.error('[Worker Health Server] Error:', err);
  }
});

server.listen(port, () => {
  console.log(`[Worker Health Server] 🩺 Listening on port ${port}`);
});

async function leaderCron() {
  setInterval(async () => {
    try {
      await Redlock.withLock('cron:outbox', async () => {
        console.log('[Leader] 👑 Lider benim! OutboxRelay çalıştırılıyor.');
        await relayEvents();
      }, 15000);
    } catch (err) {
      // Lock not acquired in non-leader instances
    }
  }, 10000);
}

leaderCron();
console.log('[Worker] 🚀 Liderlik yarışı başladı...');
