// 🚀 V5.0 HOTFIX: SELECT ve UPDATE tek bir Prisma Transaction içinde atomic olarak çalışır.
const { PrismaClient } = require('@prisma/client');
const { EventBus } = require('../lib/events/EventBus');
const prisma = new PrismaClient();

let tableChecked = false;

async function ensureOutboxTable() {
  if (tableChecked) return;
  try {
    await prisma.$executeRawUnsafe(`
      CREATE TABLE IF NOT EXISTS "OutboxEvent" (
        "id" VARCHAR(255) PRIMARY KEY,
        "eventName" VARCHAR(255) NOT NULL,
        "payload" JSONB NOT NULL,
        "status" VARCHAR(50) DEFAULT 'PENDING',
        "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
        "processedAt" TIMESTAMP(3)
      );
    `);
    tableChecked = true;
  } catch (err) {
    // Ignore if table exists or permission issue
  }
}

async function relayEvents() {
  try {
    await ensureOutboxTable();

    await prisma.$transaction(async (tx) => {
      const pendingEvents = await tx.$queryRaw`
        SELECT * FROM "OutboxEvent"
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      `;

      if (!pendingEvents || pendingEvents.length === 0) {
        return;
      }

      console.log(`[OutboxRelay] 📦 ${pendingEvents.length} adet event kilitlendi ve işleniyor...`);

      for (const event of pendingEvents) {
        try {
          await EventBus.publish(event.eventName, event.payload);

          await tx.$executeRawUnsafe(
            `UPDATE "OutboxEvent" SET "status" = 'PROCESSED', "processedAt" = NOW() WHERE "id" = $1`,
            event.id
          );

          console.log(`[OutboxRelay] ✅ Event ${event.id} (${event.eventName}) işlendi.`);
        } catch (relayError) {
          console.error(`[OutboxRelay] ❌ Event ${event.id} iletilemedi: ${relayError.message}`);
        }
      }
    }, {
      timeout: 30000,
      isolationLevel: 'ReadCommitted'
    });

  } catch (error) {
    if (error.message && error.message.includes('OutboxEvent')) {
      // Gracefully handle if database table creation is pending
      return;
    }
    console.error('[OutboxRelay] 💥 Beklenmeyen hata:', error.message);
  }
}

// Her 3 saniyede bir çalıştır
setInterval(relayEvents, 3000);
console.log('[OutboxRelay] 🚀 Başlatıldı. Her 3 saniyede bir PENDING event\'ler kontrol ediliyor.');

// İlk çalıştırmayı hemen yap
relayEvents();

module.exports = { relayEvents };
