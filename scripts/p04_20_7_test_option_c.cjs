const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== P0.4.20.7-C OPTION C FORENSIC ===\n");
  const terms = ['motor', 'ABS', 'radyo'];
  let allSetEq = true;
  let allOrderEq = true;

  for (const term of terms) {
    console.log(`\n--- TERM: ${term} ---`);
    
    // EXPLAIN ANALYZE
    const explain = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      WITH matches AS MATERIALIZED (
          SELECT id
          FROM "public"."Fuse"
          WHERE search_vector_english @@ to_tsquery('english', $1)
      )
      SELECT id
      FROM matches
      ORDER BY id ASC
      LIMIT 20
    `, term);
    
    const explainStr = explain.map(r => r['QUERY PLAN']).join('\n');
    console.log("GIN PLAN:");
    if (explainStr.includes('Bitmap Index Scan on idx_fuse_search_vector_english')) {
       console.log("  Bitmap Index Scan: PASS");
    } else {
       console.log("  Bitmap Index Scan: FAIL");
    }
    if (explainStr.includes('Seq Scan on "Fuse"') || explainStr.includes('Parallel Seq Scan on "Fuse"')) {
       console.log("  No Seq Scan: FAIL");
    } else {
       console.log("  No Seq Scan: PASS");
    }
    
    // FULL ID SET COMPARISON
    const legacyFull = await prisma.fuse.findMany({
      where: { OR: [{ description: { search: term } }, { type: { search: term } }] },
      select: { id: true }
    });
    
    const fastFull = await prisma.$queryRawUnsafe(`
      WITH matches AS MATERIALIZED (
          SELECT id FROM "public"."Fuse"
          WHERE search_vector_english @@ to_tsquery('english', $1)
      )
      SELECT id FROM matches ORDER BY id ASC
    `, term);
    
    const legacyFullIds = new Set(legacyFull.map(r => r.id));
    const fastFullIds = new Set(fastFull.map(r => r.id));
    
    let fullMatch = legacyFullIds.size === fastFullIds.size;
    for(const id of legacyFullIds) if(!fastFullIds.has(id)) fullMatch = false;
    console.log(`FULL SET (${legacyFull.length}): ${fullMatch ? 'PASS' : 'FAIL'}`);
    
    // LIMIT 20 COMPARISON
    const legacyLimit = await prisma.fuse.findMany({
      where: { OR: [{ description: { search: term } }, { type: { search: term } }] },
      select: { id: true },
      take: 20
    });
    
    const fastLimit = await prisma.$queryRawUnsafe(`
      WITH matches AS MATERIALIZED (
          SELECT id FROM "public"."Fuse"
          WHERE search_vector_english @@ to_tsquery('english', $1)
      )
      SELECT id FROM matches ORDER BY id ASC LIMIT 20
    `, term);
    
    const legacyLimitIds = legacyLimit.map(r => r.id);
    const fastLimitIds = fastLimit.map(r => r.id);
    
    let limitSetMatch = legacyLimitIds.length === fastLimitIds.length;
    for(const id of legacyLimitIds) if(!fastLimitIds.includes(id)) limitSetMatch = false;
    
    let limitOrderMatch = true;
    for(let i=0; i<legacyLimitIds.length; i++) {
       if(legacyLimitIds[i] !== fastLimitIds[i]) limitOrderMatch = false;
    }
    
    console.log(`LIMIT 20 SET: ${limitSetMatch ? 'PASS' : 'FAIL'}`);
    console.log(`ORDER: ${limitOrderMatch ? 'PASS' : 'FAIL'}`);
  }

  // REAL FALLBACK TEST
  console.log(`\n--- FALLBACK 42703 TEST ---`);
  await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Fuse" RENAME COLUMN search_vector_english TO mock_deleted_vector;`);
  try {
     const res = await prisma.$queryRawUnsafe(`
        WITH matches AS MATERIALIZED (
            SELECT id FROM "public"."Fuse"
            WHERE search_vector_english @@ to_tsquery('english', 'motor')
        )
        SELECT id FROM matches ORDER BY id ASC LIMIT 20
     `);
     console.log("FALLBACK 42703: FAIL (Query succeeded unexpectedly)");
  } catch (e) {
     if (e.meta && e.meta.code === '42703') {
        console.log("FALLBACK 42703: PASS (Error 42703 properly caught)");
     } else {
        console.log("FALLBACK 42703: FAIL (Unexpected error)", e);
     }
  }
  // Restore column
  await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Fuse" RENAME COLUMN mock_deleted_vector TO search_vector_english;`);

  await prisma.$disconnect();
}
run().catch(console.error);
