/**
 * BURSALI OTO — Veri Kapsamı Ölçümü (Bilgi Grafiği doluluk raporu)
 *
 * AMAÇ: "Mükemmel arıza teşhisi + parça önerisi" özelliğinin gerçek mi hayali mi
 * olduğunu KANITLAMAK. Tablolar boşsa önce veri (seed/mining) gerekir, kod değil.
 *
 * ÇALIŞTIRMA (üretim verisiyle):
 *   railway run node scripts/db-coverage.js
 */
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

(async () => {
  try {
    const [faultCodes, parts, videos, diag, diagWithOutcome, customerVehicles] = await Promise.all([
      prisma.faultCode.count(),
      prisma.part.count(),
      prisma.repairVideo.count(),
      prisma.diagnosticLog.count(),
      prisma.diagnosticLog.count({ where: { actualOutcome: { not: null } } }),
      prisma.customerVehicle.count(),
    ]);

    const partsWithPrice = await prisma.part.count({ where: { price: { not: null } } });
    const partsInStock   = await prisma.part.count({ where: { stock: { gt: 0 } } });
    const fcWithParts    = await prisma.faultCode.count({ where: { parts: { some: {} } } });
    const fcWithVideos   = await prisma.faultCode.count({ where: { repairVideos: { some: {} } } });
    const fcWithSolution = await prisma.faultCode.count({ where: { stepByStepSolution: { not: null } } });

    let fcWithEmbedding = 'n/a';
    try {
      const r = await prisma.$queryRawUnsafe(`SELECT COUNT(*)::int AS c FROM "FaultCode" WHERE embedding IS NOT NULL`);
      fcWithEmbedding = r && r[0] ? r[0].c : 'n/a';
    } catch (e) { fcWithEmbedding = 'sorgu hatası: ' + e.message; }

    const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) + '%' : '—');

    console.log('\n===================== BURSALI OTO — VERİ KAPSAMI =====================');
    console.log('FaultCode (arıza kodu) toplam :', faultCodes);
    console.log('   • parçası bağlı olan       :', fcWithParts,   `(${pct(fcWithParts, faultCodes)})`);
    console.log('   • onarım videosu olan      :', fcWithVideos,  `(${pct(fcWithVideos, faultCodes)})`);
    console.log('   • çözüm adımı (JSON) olan  :', fcWithSolution,`(${pct(fcWithSolution, faultCodes)})`);
    console.log('   • embedding (vektör) olan  :', fcWithEmbedding);
    console.log('---------------------------------------------------------------------');
    console.log('Part (parça) toplam           :', parts);
    console.log('   • fiyatı (price) dolu      :', partsWithPrice, `(${pct(partsWithPrice, parts)})`);
    console.log('   • stokta (stock>0)         :', partsInStock,   `(${pct(partsInStock, parts)})`);
    console.log('RepairVideo toplam            :', videos);
    console.log('---------------------------------------------------------------------');
    console.log('DiagnosticLog (teşhis kaydı)  :', diag);
    console.log('   • actualOutcome DOLU       :', diagWithOutcome, '  <-- öğrenme döngüsü bunu besler');
    console.log('CustomerVehicle (VIP araç)    :', customerVehicles);
    console.log('=====================================================================');

    console.log('\nYORUM (otomatik):');
    if (faultCodes === 0) console.log(' - FaultCode tablosu BOŞ → arıza analizi JSON dosyalarından geliyor. DB grafiği kullanılmıyor.');
    if (parts === 0)      console.log(' - Part tablosu BOŞ → parça önerisi için ÖNCE veri girişi/seed gerekir (kod tek başına yetmez).');
    if (parts > 0 && fcWithParts === 0) console.log(' - Parça var ama hiçbir FaultCode\'a bağlı değil → FaultCodeParts ilişkisi doldurulmalı.');
    if (diagWithOutcome === 0) console.log(' - Doğrulanmış teşhis kaydı yok → getDiagnosticHistory boş döner; öğrenme döngüsü henüz veri toplamıyor.');
  } catch (e) {
    console.error('Ölçüm hatası:', e.message);
    process.exitCode = 1;
  } finally {
    await prisma.$disconnect();
  }
})();
