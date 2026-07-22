import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const totalResult = await prisma.$queryRawUnsafe(`SELECT count(id) as c FROM "FaultCode"`);
  const embeddedResult = await prisma.$queryRawUnsafe(`SELECT count(id) as c FROM "FaultCode" WHERE embedding IS NOT NULL`);
  
  const totalFaults = Number(totalResult[0]?.c || 0);
  const withEmbedding = Number(embeddedResult[0]?.c || 0);

  const coverage = totalFaults > 0 ? ((withEmbedding / totalFaults) * 100).toFixed(2) : '100.00';
  console.log(`
  ========================================
  📊 EMBEDDING COVERAGE REPORT
  ----------------------------------------
  Total Fault Codes   : ${totalFaults}
  Embedded            : ${withEmbedding}
  Missing             : ${totalFaults - withEmbedding}
  Coverage            : ${coverage}%
  ========================================
  `);

  if (parseFloat(coverage) < 95 && totalFaults > 0) {
    console.warn('⚠️ Coverage %95 altında, yeniden üretim gerekli.');
  }
}

main().finally(() => prisma.$disconnect());
