const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function fastSearch(query, limit = 20) {
  if (!query || query.trim() === '') return [];
  const formattedQuery = query.trim().split(/\s+/).join(' | ');

  try {
    const rawResults = await prisma.$queryRaw`
      SELECT id
      FROM "public"."Fuse"
      WHERE search_vector_english @@ to_tsquery('english', ${formattedQuery})
      ORDER BY id ASC
      LIMIT ${limit}
    `;
    const ids = rawResults.map(r => r.id);
    if (ids.length === 0) return [];

    const hydratedResults = await prisma.fuse.findMany({
      where: { id: { in: ids } },
      include: { fuseBox: { include: { vehicle: { include: { manufacturer: true } } } } }
    });

    const resultsMap = new Map();
    hydratedResults.forEach(item => resultsMap.set(item.id, item));
    
    const orderedResults = [];
    for (const id of ids) {
      if (resultsMap.has(id)) orderedResults.push(resultsMap.get(id));
    }
    return orderedResults;
  } catch (error) {
    const isMissingColumn = error.meta && error.meta.code === '42703';
    const isUnknownFunction = error.meta && error.meta.code === '42883';
    if (!isMissingColumn && !isUnknownFunction) throw error;
    
    return await prisma.fuse.findMany({
      where: {
        OR: [{ description: { search: formattedQuery } }, { type: { search: formattedQuery } }]
      },
      include: { fuseBox: { include: { vehicle: { include: { manufacturer: true } } } } },
      take: limit,
    });
  }
}

async function run() {
  console.log("=== P0.4.20.7 FINAL SEARCH FORENSIC ===\n");
  const terms = ['ABS', 'motor', 'motors', 'motoru', 'radyo', 'fren', 'sigorta'];
  
  let allSemanticEq = true;
  let allOrderEq = true;
  let hasSeqScan = false;
  let fallbackPass = true;

  for (const term of terms) {
    const formattedQuery = term.trim().split(/\s+/).join(' | ');

    // 1. LEGACY RUN
    const t0 = performance.now();
    const legacyResults = await prisma.fuse.findMany({
      where: {
        OR: [{ description: { search: formattedQuery } }, { type: { search: formattedQuery } }]
      },
      include: { fuseBox: { include: { vehicle: { include: { manufacturer: true } } } } },
      take: 20
    });
    const legacyTime = performance.now() - t0;

    // 2. FAST RUN
    const t1 = performance.now();
    const fastResults = await fastSearch(term, 20);
    const fastTime = performance.now() - t1;

    // 3. COMPARISON
    const legacyIds = legacyResults.map(r => r.id);
    const fastIds = fastResults.map(r => r.id);
    
    const setLegacy = new Set(legacyIds);
    const setFast = new Set(fastIds);
    
    let isSetEq = legacyIds.length === fastIds.length;
    for(const id of setLegacy) if(!setFast.has(id)) isSetEq = false;

    let isOrderEq = true;
    for(let i=0; i<legacyIds.length; i++) {
      if(legacyIds[i] !== fastIds[i]) isOrderEq = false;
    }

    console.log(`TERM: ${term}`);
    console.log(`Legacy count: ${legacyIds.length}`);
    console.log(`Fast count: ${fastIds.length}`);
    console.log(`ID SET: ${isSetEq ? 'MATCH' : 'MISMATCH'}`);
    console.log(`ORDER: ${isOrderEq ? 'MATCH' : 'MISMATCH'}`);
    console.log(`Latency: Legacy ${legacyTime.toFixed(2)}ms, Fast ${fastTime.toFixed(2)}ms`);

    // Only print differences if there are any, for debugging
    if (!isOrderEq && legacyIds.length > 0) {
      console.log(`   Legacy IDs : ${legacyIds.slice(0, 5).join(', ')} ...`);
      console.log(`   Fast IDs   : ${fastIds.slice(0, 5).join(', ')} ...`);
    }
    console.log("-------------------------------------------------");

    if (!isSetEq) allSemanticEq = false;
    if (!isOrderEq) allOrderEq = false;
  }

  // EXPLAIN
  console.log("\n=== EXPLAIN (ANALYZE, BUFFERS) ===");
  const explain = await prisma.$queryRawUnsafe(`
    EXPLAIN (ANALYZE, BUFFERS)
    SELECT
        id,
        ts_rank(search_vector_english, to_tsquery('english', 'motor')) AS rank
    FROM "public"."Fuse"
    WHERE search_vector_english @@ to_tsquery('english', 'motor')
    ORDER BY rank DESC, id ASC
    LIMIT 20
  `);
  const explainStr = explain.map(r => r['QUERY PLAN']).join('\\n');
  console.log(explainStr);
  if (explainStr.includes('Seq Scan') && !explainStr.includes('Bitmap Index Scan')) {
    hasSeqScan = true;
  }

  // FALLBACK TEST
  console.log("\n=== FALLBACK TEST ===");
  try {
    // We intentionally run a failing raw query to trigger fallback by mocking the behavior internally?
    // Let's just drop the column temporarily to test fallback
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Fuse" RENAME COLUMN search_vector_english TO tmp_search_vector_english;`);
    const tFail = performance.now();
    const fallbackResults = await SearchEngine.searchFuses('ABS', 5);
    const failTime = performance.now() - tFail;
    
    if (fallbackResults.length > 0) {
      console.log(`Fallback triggered successfully! Recovered ${fallbackResults.length} items in ${failTime.toFixed(2)}ms`);
    } else {
      fallbackPass = false;
    }
    await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Fuse" RENAME COLUMN tmp_search_vector_english TO search_vector_english;`);
  } catch (e) {
    console.error("Fallback failed:", e);
    fallbackPass = false;
    // restore column if it failed
    try { await prisma.$executeRawUnsafe(`ALTER TABLE "public"."Fuse" RENAME COLUMN tmp_search_vector_english TO search_vector_english;`); } catch(ex){}
  }

  console.log("\n==========================================");
  console.log(`SEMANTIC EQUALITY = ${allSemanticEq ? 'PASS' : 'FAIL'}`);
  console.log(`ORDER EQUALITY     = ${allOrderEq ? 'PASS' : 'FAIL'}`);
  console.log(`GIN PLAN           = ${!hasSeqScan ? 'PASS' : 'FAIL'}`);
  console.log(`FALLBACK           = ${fallbackPass ? 'PASS' : 'FAIL'}`);

  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
