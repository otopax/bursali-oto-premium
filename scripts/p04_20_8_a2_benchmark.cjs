const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const { performance } = require('perf_hooks');

async function run() {
  console.log("=== P0.4.20.8 A2 EXPRESSION GIN FORENSIC BENCHMARK ===\n");

  // GATE 1 & 2: Local cleanup and A2 creation
  console.log("--- GATE 1 & 2: IMMUTABLE EXPRESSION & INDEX CREATION ---");
  
  // Prove immutability
  const pgProc = await prisma.$queryRawUnsafe(`
    SELECT p.proname, p.provolatile 
    FROM pg_proc p 
    WHERE p.proname IN ('to_tsvector', 'concat_ws')
  `);
  console.log("pg_proc details:");
  pgProc.forEach(p => console.log(`  ${p.proname} = ${p.provolatile}`));

  // Cleanup old structures if they exist
  console.log("\nCleaning up old experimental structures...");
  try {
     await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS "idx_fuse_search_vector_english"`);
     await prisma.$executeRawUnsafe(`ALTER TABLE "Fuse" DROP COLUMN IF EXISTS "search_vector_english"`);
  } catch (e) {
     console.log("Cleanup skipped or failed", e.message);
  }

  // Create new Expression GIN index
  console.log("Measuring CREATE INDEX CONCURRENTLY...");
  const startIdx = performance.now();
  await prisma.$executeRawUnsafe(`
    CREATE INDEX CONCURRENTLY idx_fuse_fts_english_expr 
    ON "public"."Fuse" 
    USING GIN (to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')));
  `);
  const endIdx = performance.now();
  console.log(`CREATE INDEX CONCURRENTLY duration: ${((endIdx - startIdx) / 1000).toFixed(2)}s`);

  // Verify index
  const idxCheck = await prisma.$queryRawUnsafe(`
    SELECT indisvalid FROM pg_index 
    WHERE indexrelid = 'idx_fuse_fts_english_expr'::regclass
  `);
  console.log(`Index Valid: ${idxCheck.length > 0 && idxCheck[0].indisvalid ? 'YES' : 'NO'}`);


  // GATE 3 & 4: EXPLAIN & ZERO-RESULT
  console.log("\n--- GATE 3 & 4: EXPLAIN & ZERO-RESULT ---");
  const terms = ['motor', 'radyo'];
  for (const term of terms) {
    const explain = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      WITH matched AS MATERIALIZED (
          SELECT id
          FROM "public"."Fuse"
          WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) 
                @@ to_tsquery('english', $1)
      )
      SELECT id FROM matched ORDER BY id ASC LIMIT 20
    `, term);
    
    const explainStr = explain.map(r => r['QUERY PLAN']).join('\\n');
    let hasBitmap = explainStr.includes('Bitmap Index Scan on idx_fuse_fts_english_expr');
    let hasSeq = explainStr.includes('Seq Scan on "Fuse"') || explainStr.includes('Parallel Seq Scan on "Fuse"');
    const execTimeMatch = explainStr.match(/Execution Time: ([0-9.]+) ms/);
    
    console.log(`\nEXPLAIN / ${term}:`);
    console.log(`  Bitmap Index Scan: ${hasBitmap}`);
    console.log(`  No Seq Scan: ${!hasSeq}`);
    console.log(`  Execution Time: ${execTimeMatch ? execTimeMatch[1] + " ms" : "UNKNOWN"}`);
  }


  // GATE 5 & 6: SEMANTIC & ORDERING EQUALITY
  console.log("\n--- GATE 5 & 6: SEMANTIC & ORDERING EQUALITY ---");
  const semanticTerms = ['ABS', 'motor', 'motors', 'motoru', 'radyo', 'fren', 'sigorta'];
  
  let allFullEq = true;
  let allLimitEq = true;
  let allOrderEq = true;

  for (const term of semanticTerms) {
    const formattedQuery = term.trim().split(/\\s+/).join(' | ');

    // Legacy FULL
    const legacyFull = await prisma.fuse.findMany({
      where: { OR: [{ description: { search: formattedQuery } }, { type: { search: formattedQuery } }] },
      select: { id: true }
    });
    
    // Fast FULL
    const fastFull = await prisma.$queryRawUnsafe(`
      WITH matched AS MATERIALIZED (
          SELECT id FROM "public"."Fuse"
          WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) 
                @@ to_tsquery('english', $1)
      )
      SELECT id FROM matched ORDER BY id ASC
    `, formattedQuery);

    const legacyFullIds = new Set(legacyFull.map(r => r.id));
    const fastFullIds = new Set(fastFull.map(r => r.id));
    
    let fullEq = legacyFullIds.size === fastFullIds.size;
    let legacyOnly = 0, newOnly = 0;
    for (const id of legacyFullIds) if (!fastFullIds.has(id)) { fullEq = false; legacyOnly++; }
    for (const id of fastFullIds) if (!legacyFullIds.has(id)) { fullEq = false; newOnly++; }

    // Legacy LIMIT
    const legacyLimit = await prisma.fuse.findMany({
      where: { OR: [{ description: { search: formattedQuery } }, { type: { search: formattedQuery } }] },
      select: { id: true },
      take: 20
    });
    
    // Fast LIMIT
    const fastLimit = await prisma.$queryRawUnsafe(`
      WITH matched AS MATERIALIZED (
          SELECT id FROM "public"."Fuse"
          WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) 
                @@ to_tsquery('english', $1)
      )
      SELECT id FROM matched ORDER BY id ASC LIMIT 20
    `, formattedQuery);

    const legacyLimitIds = legacyLimit.map(r => r.id);
    const fastLimitIds = fastLimit.map(r => r.id);

    let limitEq = legacyLimitIds.length === fastLimitIds.length;
    for (const id of legacyLimitIds) {
       if (!fastLimitIds.includes(id)) { limitEq = false; break; }
    }

    let orderEq = true;
    for (let i = 0; i < legacyLimitIds.length; i++) {
       if (legacyLimitIds[i] !== fastLimitIds[i]) { orderEq = false; break; }
    }

    if (!fullEq) allFullEq = false;
    if (!limitEq) allLimitEq = false;
    if (!orderEq) allOrderEq = false;

    console.log(`${term} = FULL:${fullEq ? 'PASS' : `FAIL (LegacyOnly:${legacyOnly} NewOnly:${newOnly})`} | LIMIT:${limitEq ? 'PASS' : 'FAIL'} | ORDER:${orderEq ? 'PASS' : 'FAIL'}`);
  }

  // GATE 7: FALLBACK ERROR MATRIX
  console.log("\n--- GATE 7: FALLBACK ERROR MATRIX ---");
  // Simulate 42704 / 42883 (undefined function/dict)
  let catch42883 = false;
  try {
     await prisma.$queryRawUnsafe(`
        WITH matched AS MATERIALIZED (
            SELECT id FROM "public"."Fuse"
            WHERE to_tsvector('fake_dict', coalesce(type, '') || ' ' || coalesce(description, '')) 
                  @@ to_tsquery('fake_dict', 'motor')
        )
        SELECT id FROM matched ORDER BY id ASC LIMIT 20
     `);
  } catch (e) {
     if (e.meta && (e.meta.code === '42883' || e.meta.code === '42704')) catch42883 = true;
  }
  
  console.log(`Fallback 42883/42704 caught correctly: ${catch42883}`);

  await prisma.$disconnect();
}

run().catch(console.error);
