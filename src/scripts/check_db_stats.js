const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkStats() {
  console.log("=== DB STATS ===");
  const manufacturers = await prisma.manufacturer.count();
  const vehicles = await prisma.vehicle.count();
  const fuseBoxes = await prisma.fuseBox.count();
  const fuses = await prisma.fuse.count();

  console.log(`Manufacturers: ${manufacturers}`);
  console.log(`Vehicles: ${vehicles}`);
  console.log(`FuseBoxes: ${fuseBoxes}`);
  console.log(`Fuses: ${fuses}`);
}

checkStats()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
