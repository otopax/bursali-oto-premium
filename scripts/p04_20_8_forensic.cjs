const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function measureSearch(term) {
  const formattedQuery = term.trim().split(/\s+/).join(' | ');
  
  // 1. FTS SQL
  const t1 = Date.now();
  const rawResults = await prisma.$queryRaw`
      WITH matches AS MATERIALIZED (
        SELECT id
        FROM "public"."Fuse"
        WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', ${formattedQuery})
      )
      SELECT id
      FROM matches
      ORDER BY id ASC
      LIMIT 20
  `;
  const ftsMs = Date.now() - t1;
  const ids = rawResults.map(r => r.id);

  if (ids.length === 0) {
     return { ftsMs, hydrationMs: 0, totalDb: ftsMs };
  }

  // 2. Hydration
  const t2 = Date.now();
  const hydratedResults = await prisma.fuse.findMany({
      where: { id: { in: ids } },
      include: {
        fuseBox: { include: { vehicle: { include: { manufacturer: true } } } }
      }
  });
  const hydrationMs = Date.now() - t2;

  return { ftsMs, hydrationMs, totalDb: ftsMs + hydrationMs };
}

async function measurePlan(term) {
   const formattedQuery = term.trim().split(/\s+/).join(' | ');
   const explain = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS)
      WITH matches AS MATERIALIZED (
        SELECT id
        FROM "public"."Fuse"
        WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
      )
      SELECT id
      FROM matches
      ORDER BY id ASC
      LIMIT 20
   `, formattedQuery);
   return explain.map(row => row['QUERY PLAN']).join('\n');
}

async function run() {
  console.log("=== GATE 11-B FORENSIC ===");
  const terms = ['ABS', 'motor', 'radyo'];
  
  for (const term of terms) {
    console.log(`\nQuery: ${term}`);
    
    // EXPLAIN
    const explainOutput = await measurePlan(term);
    const hasBitmap = explainOutput.includes("Bitmap Index Scan on idx_fuse_fts_english_expr");
    const hasSeqScan = explainOutput.includes("Seq Scan on");
    console.log(`  Bitmap Index Scan: ${hasBitmap}`);
    console.log(`  Seq Scan: ${hasSeqScan}`);
    
    // TIMING
    const timings = await measureSearch(term);
    console.log(`  FTS SQL Duration: ${timings.ftsMs} ms`);
    console.log(`  Hydration Duration: ${timings.hydrationMs} ms`);
    console.log(`  Total DB Time: ${timings.totalDb} ms`);
  }
}

run().catch(console.error).finally(() => prisma.$disconnect());
