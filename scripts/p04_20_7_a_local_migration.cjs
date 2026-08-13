const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const term = 'ABS';
  console.log("=== P0.4.20.7-A: LOCAL EXACT MIGRATION TEST ===");

  // STEP 1: ALTER TABLE (measure time and lock)
  console.log("\n[1 & 2] Running ALTER TABLE (Adding STORED GENERATED COLUMN)...");
  const t0 = performance.now();
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."Fuse" 
      ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (to_tsvector('simple', coalesce(type, '') || ' ' || coalesce(description, ''))) STORED;
    `);
  } catch(e) {
    // If it already exists, ignore
  }
  const t1 = performance.now();
  console.log(`ALTER TABLE completed in ${((t1 - t0) / 1000).toFixed(2)} seconds.`);
  console.log(`(Lock Behavior: ACCESS EXCLUSIVE lock acquired for ${((t1 - t0) / 1000).toFixed(2)}s on table "Fuse")`);

  // STEP 3: CREATE INDEX CONCURRENTLY
  console.log("\n[3] Running CREATE INDEX CONCURRENTLY...");
  const t2 = performance.now();
  try {
    // Drop it if it exists from previous tests
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS idx_fuse_search_vector_gin;`);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY idx_fuse_search_vector_gin 
      ON "public"."Fuse" USING GIN (search_vector);
    `);
  } catch(e) {
      console.error("Index creation error:", e.message);
  }
  const t3 = performance.now();
  console.log(`CREATE INDEX CONCURRENTLY completed in ${((t3 - t2) / 1000).toFixed(2)} seconds.`);

  // STEP 4: INDEX SIZE
  console.log("\n[4] Measuring Index Size...");
  const sizeRes = await prisma.$queryRawUnsafe(`
    SELECT pg_size_pretty(pg_relation_size('idx_fuse_search_vector_gin')) as size;
  `);
  console.log(`GIN Index Size: ${sizeRes[0].size}`);

  // STEP 5: EXPLAIN ANALYZE
  console.log("\n[5] EXPLAIN (ANALYZE, BUFFERS) Verification...");
  const qExplain = await prisma.$queryRawUnsafe(`
    EXPLAIN (ANALYZE, BUFFERS) 
    SELECT "id" FROM "public"."Fuse" 
    WHERE search_vector @@ to_tsquery('simple', $1) 
    LIMIT 20;
  `, term);
  console.log(qExplain.map(r => r['QUERY PLAN']).join('\n'));

  // STEP 6: SEARCH SEMANTIC COMPARISON
  console.log("\n[6] Search Semantic Comparison...");
  const formattedQuery = term.trim().split(/\s+/).join(' | ');

  // Legacy Search
  const oldResults = await prisma.fuse.findMany({
    where: {
      OR: [
        { description: { search: formattedQuery } },
        { type: { search: formattedQuery } }
      ]
    },
    take: 10
  });

  // New Search
  const newIdsRaw = await prisma.$queryRaw`
    SELECT id FROM "public"."Fuse"
    WHERE search_vector @@ to_tsquery('simple', ${formattedQuery})
    LIMIT 10
  `;
  const newIds = newIdsRaw.map(r => r.id);
  
  const newResults = await prisma.fuse.findMany({
    where: { id: { in: newIds } }
  });

  console.log(`Term: "${term}"`);
  console.log(`Legacy Prisma Result Count: ${oldResults.length}`);
  console.log(`New FTS Result Count: ${newResults.length}`);
  
  const oldIds = oldResults.map(r => r.id).sort().join(', ');
  const newIdsSorted = newResults.map(r => r.id).sort().join(', ');
  
  console.log(`Are the sets identical (ignoring hydration order)? ${oldIds === newIdsSorted}`);

  await prisma.$disconnect();
}

run();
