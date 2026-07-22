const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function generateReport() {
  try {
    const total = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "FaultCode"`;
    const withEmbedding = await prisma.$queryRaw`SELECT COUNT(*) as count FROM "FaultCode" WHERE embedding IS NOT NULL`;
    
    console.log("=== EMBEDDING COVERAGE REPORT ===");
    console.log(`Total Fault Codes: ${Number(total[0].count)}`);
    console.log(`With Embeddings: ${Number(withEmbedding[0].count)}`);
    console.log(`Coverage: ${((Number(withEmbedding[0].count) / Number(total[0].count)) * 100).toFixed(2)}%`);
    
  } catch(e) {
    console.error("Error generating report:", e);
  } finally {
    await prisma.$disconnect();
  }
}

generateReport();
