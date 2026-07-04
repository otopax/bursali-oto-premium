const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const showcase = await prisma.faultCode.findMany({ 
    take: 10,
    orderBy: { createdAt: 'asc' }
  }); 
  console.log(JSON.stringify(showcase.map(c => ({ code: c.code, description: c.description })), null, 2)); 
} 

main().catch(console.error).finally(() => prisma.$disconnect());
