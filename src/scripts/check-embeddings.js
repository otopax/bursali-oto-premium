import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkEmbeddings() {
  console.log("Checking Embedding Coverage...");
  try {
    const totalResult = await prisma.$queryRawUnsafe(`SELECT count(id) as c FROM "FaultCode"`);
    const embeddedResult = await prisma.$queryRawUnsafe(`SELECT count(id) as c FROM "FaultCode" WHERE embedding IS NOT NULL`);
    
    const totalCount = Number(totalResult?.[0]?.c || 0);
    const embeddedCount = Number(embeddedResult?.[0]?.c || 0);
    const coverage = totalCount > 0 ? ((embeddedCount / totalCount) * 100).toFixed(2) : '100.00';

    console.log(`Fault Codes: ${totalCount}`);
    console.log(`Embedded: ${embeddedCount}`);
    console.log(`Coverage: %${coverage}`);
    
    process.exit(0);
  } catch (error) {
    console.error("Error checking embeddings:", error);
    process.exit(1);
  }
}

checkEmbeddings();
