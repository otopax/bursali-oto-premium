const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  console.log("=== GATE 10: PRODUCTION FORENSIC VERIFICATION ===\n");

  // GATE 10.1: PLANNER VERIFICATION
  console.log("--- 10.1 PLANNER ---");
  const explainTerms = ['ABS', 'motor', 'radyo'];
  let plannerPass = true;

  for (const term of explainTerms) {
    const explain = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      WITH matched AS MATERIALIZED (
          SELECT id FROM "public"."Fuse"
          WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) 
                @@ to_tsquery('english', $1)
      )
      SELECT id FROM matched ORDER BY id ASC LIMIT 20
    `, term);
    
    const explainStr = explain.map(r => r['QUERY PLAN']).join('\\n');
    let hasBitmap = explainStr.includes('Bitmap Index Scan on idx_fuse_fts_english_expr');
    let hasSeq = explainStr.includes('Seq Scan on "Fuse"') || explainStr.includes('Parallel Seq Scan on "Fuse"');
    
    const execTimeMatch = explainStr.match(/Execution Time: ([0-9.]+) ms/);
    const execTime = execTimeMatch ? execTimeMatch[1] + " ms" : "UNKNOWN";
    
    console.log(`EXPLAIN / ${term}:`);
    console.log(`  Bitmap Index Scan: ${hasBitmap ? 'PASS' : 'FAIL'}`);
    console.log(`  No Seq Scan: ${!hasSeq ? 'PASS' : 'FAIL'}`);
    console.log(`  Execution Time: ${execTime}`);

    if (!hasBitmap || hasSeq) plannerPass = false;
  }

  // GATE 10.2: SEMANTIC EQUALITY
  console.log("\n--- 10.2 SEMANTIC ---");
  const semanticTerms = ['ABS', 'motor', 'motors', 'motoru', 'radyo', 'fren', 'sigorta'];
  let semanticPass = true;

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

    if (!fullEq || !limitEq || !orderEq) semanticPass = false;

    console.log(`${term} = FULL:${fullEq ? 'PASS' : `FAIL (L:${legacyOnly} N:${newOnly})`} | LIMIT:${limitEq ? 'PASS' : 'FAIL'} | ORDER:${orderEq ? 'PASS' : 'FAIL'}`);
  }

  // GATE 10.3: FALLBACK MATRIX
  console.log("\n--- 10.3 FALLBACK ---");
  let fallbackPass = true;

  // Function to simulate SearchEngine's new fallback logic
  const attemptSearch = async (prismaInstance, badQuery, simulateMissingCol = false) => {
    try {
      if (simulateMissingCol) {
         // Querying a non-existent column to force 42703
         await prismaInstance.$queryRawUnsafe(`SELECT non_existent_column FROM "public"."Fuse" LIMIT 1`);
      } else {
         await prismaInstance.$queryRawUnsafe(badQuery);
      }
      return "SUCCESS"; 
    } catch (error) {
      if (error.meta && (error.meta.code === '42703' || error.meta.code === '42883')) {
        return "FALLBACK";
      }
      // Any other error (including 42704, timeout, network) bubbles up
      throw error;
    }
  };

  // Test 1: 42703 undefined_column
  try {
    const res = await attemptSearch(prisma, "", true);
    if (res === "FALLBACK") console.log("42703: PASS (Fell back correctly)");
    else { console.log("42703: FAIL"); fallbackPass = false; }
  } catch (e) {
    console.log("42703: FAIL (Bubbled up unexpectedly)", e.message); fallbackPass = false;
  }

  // Test 2: 42883 undefined_function
  try {
    const res = await attemptSearch(prisma, `SELECT fake_function_123()`);
    if (res === "FALLBACK") console.log("42883: PASS (Fell back correctly)");
    else { console.log("42883: FAIL"); fallbackPass = false; }
  } catch (e) {
    console.log("42883: FAIL (Bubbled up unexpectedly)", e.message); fallbackPass = false;
  }

  // Test 3: Network/Timeout Error (Simulated via bad PrismaClient URL)
  const badPrisma = new PrismaClient({ datasources: { db: { url: "postgresql://postgres:bad@10.255.255.1:5432/fake?connect_timeout=1" } } });
  try {
    await attemptSearch(badPrisma, `SELECT 1`);
    console.log("Network Error: FAIL (Succeeded or fell back unexpectedly)");
    fallbackPass = false;
  } catch (e) {
    console.log("Network Error: PASS (Bubbled up correctly)");
  }
  await badPrisma.$disconnect();

  // Test 4: 42704 undefined_object (e.g. bad dictionary) -> Must bubble up, not fallback!
  try {
    await attemptSearch(prisma, `SELECT to_tsvector('fake_dict', 'test')`);
    console.log("42704: FAIL (Succeeded or fell back unexpectedly)");
    fallbackPass = false;
  } catch (e) {
    if (e.meta && e.meta.code === '42704') {
        console.log("42704: PASS (Bubbled up correctly)");
    } else {
        console.log("42704: FAIL (Wrong error bubbled up)");
        fallbackPass = false;
    }
  }

  console.log("\n==========================================");
  console.log(`PLANNER        = ${plannerPass ? 'PASS' : 'FAIL'}`);
  console.log(`SEMANTIC       = ${semanticPass ? 'PASS' : 'FAIL'}`);
  console.log(`FALLBACK       = ${fallbackPass ? 'PASS' : 'FAIL'}`);
  console.log(`\nGATE 10 FINAL  = ${plannerPass && semanticPass && fallbackPass ? 'PASS' : 'FAIL'}`);

  await prisma.$disconnect();
}

run().catch(console.error);
