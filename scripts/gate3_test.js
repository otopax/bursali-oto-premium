const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const terms = [
  { name: 'LOW (amf)', query: 'amf' },
  { name: 'MEDIUM (fren)', query: 'fren' },
  { name: 'HIGH (motor)', query: 'motor' }
];

const queries = {
  'A_MATERIALIZED': `
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    WITH search_results AS MATERIALIZED (
      SELECT id
      FROM "public"."Fuse"
      WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
    )
    SELECT id FROM search_results
    ORDER BY id ASC
    LIMIT 20;
  `,
  'B_NOT_MATERIALIZED': `
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    WITH search_results AS NOT MATERIALIZED (
      SELECT id
      FROM "public"."Fuse"
      WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
    )
    SELECT id FROM search_results
    ORDER BY id ASC
    LIMIT 20;
  `,
  'C_DIRECT': `
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT id
    FROM "public"."Fuse"
    WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
    ORDER BY id ASC
    LIMIT 20;
  `,
  'D_TS_RANK': `
    EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
    SELECT id
    FROM "public"."Fuse"
    WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', $1)
    ORDER BY ts_rank(to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')), to_tsquery('english', $1)) DESC, id ASC
    LIMIT 20;
  `
};

function findNode(plan, type) {
  if (plan['Node Type'] === type) return plan;
  if (plan.Plans) {
    for (const child of plan.Plans) {
      const found = findNode(child, type);
      if (found) return found;
    }
  }
  return null;
}

async function run() {
  for (const term of terms) {
    console.log(`\n========================================`);
    console.log(`TESTING TERM: ${term.name}`);
    console.log(`========================================`);
    for (const [qName, qStr] of Object.entries(queries)) {
      try {
        const sql = qStr.replace(/\$1/g, `'${term.query}'`);
        const result = await prisma.$queryRawUnsafe(sql);
        const plan = result[0]['QUERY PLAN'][0];
        console.log(`\n--- Candidate: ${qName} ---`);
        console.log(`Planning Time: ${plan['Planning Time']} ms`);
        console.log(`Execution Time: ${plan['Execution Time']} ms`);
        
        const root = plan.Plan;
        console.log(`Actual Rows: ${root['Actual Rows']} - Hit: ${root['Shared Hit Blocks']} - Read: ${root['Shared Read Blocks']}`);

        const bmScan = findNode(root, 'Bitmap Index Scan');
        if (bmScan) console.log(`[Bitmap Scan] Rows: ${bmScan['Actual Rows']} | Hit: ${bmScan['Shared Hit Blocks']} | Read: ${bmScan['Shared Read Blocks']}`);
        
        const bhScan = findNode(root, 'Bitmap Heap Scan');
        if (bhScan) console.log(`[Heap Fetch] Rows: ${bhScan['Actual Rows']} | Exact: ${bhScan['Exact Heap Blocks']||0} | Hit: ${bhScan['Shared Hit Blocks']||0} | Lossy: ${bhScan['Lossy Heap Blocks']||0}`);

        const sort = findNode(root, 'Sort');
        if (sort) console.log(`[Sort] Method: ${sort['Sort Method']} | Space: ${sort['Sort Space Used']} kB`);
      } catch (err) {
        console.log(`\n--- Candidate: ${qName} --- FAILED: ${err.message}`);
      }
    }
  }
}

run().finally(() => prisma.$disconnect());
