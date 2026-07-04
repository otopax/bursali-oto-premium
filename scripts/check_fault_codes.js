const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const codes = await prisma.faultCode.findMany({ include: { vehicle: true }, take: 10 });
  console.log(JSON.stringify(codes, null, 2));
}

main().catch(console.error).finally(() => prisma.$disconnect());
