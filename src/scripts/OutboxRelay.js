// 🚀 V5.0 HOTFIX: SELECT ve UPDATE tek bir Prisma Transaction içinde atomic olarak çalışır.
const { PrismaClient } = require('@prisma/client');
const { EventBus } = require('../lib/events/EventBus');
const prisma = new PrismaClient();

async function relayEvents() {
  try {
    // Tek bir transaction içinde SELECT (FOR UPDATE SKIP LOCKED) ve UPDATE işlemleri
    await prisma.$transaction(async (tx) => {
      // 1. Satırları kilitle ve çek (aynı transaction içinde)
      const pendingEvents = await tx.$queryRaw`
        SELECT * FROM "OutboxEvent"
        WHERE status = 'PENDING'
        ORDER BY "createdAt" ASC
        LIMIT 50
        FOR UPDATE SKIP LOCKED
      `;

      if (pendingEvents.length === 0) {
        return; // İşlenecek event yok
      }

      console.log(`[OutboxRelay] 📦 ${pendingEvents.length} adet event kilitlendi ve işleniyor...`);

      for (const event of pendingEvents) {
        try {
          // 2. EventBus'a gönder (BullMQ)
          await EventBus.publish(event.eventName, event.payload);

          // 3. Aynı transaction içinde durumu güncelle (Lock hala geçerli)
          await tx.outboxEvent.update({
            where: { id: event.id },
            data: { status: 'PROCESSED', processedAt: new Date() }
          });

          console.log(`[OutboxRelay] ✅ Event ${event.id} (${event.eventName}) işlendi.`);

        } catch (relayError) {
          // 4. Hata durumunda bu event PENDING kalır (Lok serbest kalır, sonraki turda tekrar dener).
          console.error(`[OutboxRelay] ❌ Event ${event.id} iletilemedi: ${relayError.message}. Tekrar denenmek üzere PENDING bırakıldı.`);
          // Hata fırlatmıyoruz ki transaction devam etsin ve diğer event'ler işlensin.
          // Bu event kilidi serbest bırakılır ve sonraki `relayEvents` çalışmasında tekrar yakalanır.
        }
      }
    }, {
      timeout: 30000, // 30 saniye transaction timeout
      isolationLevel: 'ReadCommitted' // Prisma 5.0+ için
    });

  } catch (error) {
    console.error('[OutboxRelay] 💥 Beklenmeyen hata:', error.message);
  }
}

// Her 3 saniyede bir çalıştır
setInterval(relayEvents, 3000);
console.log('[OutboxRelay] 🚀 Başlatıldı. Her 3 saniyede bir PENDING event\'ler kontrol ediliyor.');

// İlk çalıştırmayı hemen yap
relayEvents();

module.exports = { relayEvents };
