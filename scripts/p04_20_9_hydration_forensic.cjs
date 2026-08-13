const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runForensics() {
  console.log("=== P0.4.20.9 PRISMA HYDRATION FORENSICS ===\n");

  // Step 1: Get 20 real IDs using the exact FTS query for 'ABS'
  console.log("1. Fetching 20 IDs for baseline (Query: ABS)...");
  const rawResults = await prisma.$queryRaw`
      WITH matches AS MATERIALIZED (
        SELECT id
        FROM "public"."Fuse"
        WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', 'ABS')
      )
      SELECT id
      FROM matches
      ORDER BY id ASC
      LIMIT 20
  `;
  const ids = rawResults.map(r => r.id);
  
  if (ids.length === 0) {
      console.log("No IDs found. Cannot perform hydration test.");
      return;
  }
  console.log(`Found ${ids.length} IDs.\n`);

  const measure = async (name, includeObj) => {
      const tStart = Date.now();
      await prisma.fuse.findMany({
          where: { id: { in: ids } },
          include: includeObj
      });
      return Date.now() - tStart;
  };

  // Warmup to avoid cold start skew (just a simple query)
  await prisma.$queryRaw`SELECT 1`;

  // Iteration 1
  console.log("--- TEST RUN ---");
  
  const timeL0 = await measure("Level 0: Fuse (No includes)", undefined);
  console.log(`Level 0 (Fuse only):                  ${timeL0} ms`);
  
  const timeL1 = await measure("Level 1: Fuse + FuseBox", { fuseBox: true });
  console.log(`Level 1 (+ FuseBox):                  ${timeL1} ms`);
  
  const timeL2 = await measure("Level 2: Fuse + FuseBox + Vehicle", { 
      fuseBox: { include: { vehicle: true } } 
  });
  console.log(`Level 2 (+ Vehicle):                  ${timeL2} ms`);
  
  const timeL3 = await measure("Level 3: Fuse + FuseBox + Vehicle + Manufacturer", { 
      fuseBox: { include: { vehicle: { include: { manufacturer: true } } } } 
  });
  console.log(`Level 3 (+ Manufacturer) [FULL]:      ${timeL3} ms`);
  
  console.log("\n--- DELTA ANALYSIS ---");
  console.log(`Cost of fetching Fuse rows:           ${timeL0} ms`);
  console.log(`Additional cost for FuseBox:          ${timeL1 - timeL0} ms`);
  console.log(`Additional cost for Vehicle:          ${timeL2 - timeL1} ms`);
  console.log(`Additional cost for Manufacturer:     ${timeL3 - timeL2} ms`);

}

runForensics()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
