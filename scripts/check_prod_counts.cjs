const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log("Connecting to Database:", process.env.DATABASE_URL ? process.env.DATABASE_URL.split('@')[1].split('/')[0] : "UNKNOWN");
  try {
    const [m, f, fb, fc, p] = await Promise.all([
      prisma.manufacturer.count(),
      prisma.fuse.count(),
      prisma.fuseBox.count(),
      prisma.faultCode.count(),
      prisma.part.count()
    ]);
    console.log(`Manufacturer: ${m}`);
    console.log(`Fuse: ${f}`);
    console.log(`FuseBox: ${fb}`);
    console.log(`FaultCode: ${fc}`);
    console.log(`Part: ${p}`);
  } catch(e) {
    console.error("Error querying counts:", e.message);
  } finally {
    await prisma.$disconnect();
  }
}
main();
