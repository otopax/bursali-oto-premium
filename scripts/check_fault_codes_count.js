const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const count = await prisma.faultCode.count();
  console.log('Total fault codes:', count);
}

main().catch(console.error).finally(() => prisma.$disconnect());
