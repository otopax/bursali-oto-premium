// 🚀 V5.0: Lider seçimi ile sadece 1 pod'un cron çalıştırmasını sağla.
const Redlock = require('../lib/locks/Redlock');
const { relayEvents } = require('./OutboxRelay');

async function leaderCron() {
  // Her 10 saniyede bir liderlik yarışı
  setInterval(async () => {
    await Redlock.withLock('cron:outbox', async () => {
      console.log('[Leader] 👑 Lider benim! OutboxRelay çalıştırılıyor.');
      await relayEvents();
    }, 15000); // 15 saniye lock TTL
  }, 10000);
}

leaderCron();
console.log('[Worker] 🚀 Liderlik yarışı başladı...');
