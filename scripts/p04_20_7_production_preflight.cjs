const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== P0.4.20.7 PRODUCTION PRE-FLIGHT READ-ONLY ===\n");

  // 1. Table Counts
  console.log("[1] Checking Table Counts...");
  const counts = {
    Manufacturer: await prisma.manufacturer.count(),
    Vehicle: await prisma.vehicle.count(),
    FuseBox: await prisma.fuseBox.count(),
    Fuse: await prisma.fuse.count()
  };
  console.table([counts]);

  // 2. Check if column exists
  console.log("\n[2] Checking if 'search_vector_english' column exists...");
  const cols = await prisma.$queryRawUnsafe(`
    SELECT column_name 
    FROM information_schema.columns 
    WHERE table_name = 'Fuse' AND column_name = 'search_vector_english';
  `);
  console.log(`Column exists: ${cols.length > 0}`);

  // 3. Check if index exists
  console.log("\n[3] Checking if 'idx_fuse_search_vector_english' index exists...");
  const idxs = await prisma.$queryRawUnsafe(`
    SELECT indexname 
    FROM pg_indexes 
    WHERE tablename = 'Fuse' AND indexname = 'idx_fuse_search_vector_english';
  `);
  console.log(`Index exists: ${idxs.length > 0}`);

  // 4. Active Connections
  console.log("\n[4] Checking Active Connections...");
  const conns = await prisma.$queryRawUnsafe(`
    SELECT count(*)::int as active_connections 
    FROM pg_stat_activity 
    WHERE datname = current_database();
  `);
  console.log(`Active Connections: ${conns[0].active_connections}`);

  // 5. Database Size
  console.log("\n[5] Checking Database Size...");
  const dbSize = await prisma.$queryRawUnsafe(`
    SELECT pg_size_pretty(pg_database_size(current_database())) as size;
  `);
  console.log(`Database Size: ${dbSize[0].size}`);

  await prisma.$disconnect();
}

run().catch(e => {
  console.error("PRE-FLIGHT ERROR:", e);
  process.exit(1);
});
