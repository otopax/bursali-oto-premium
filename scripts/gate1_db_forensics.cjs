const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('=== 1. DATABASE VERSION ===');
  const version = await prisma.$queryRawUnsafe('SELECT version();');
  console.log(version[0].version);

  console.log('\n---');
  console.log('=== 2. PG_EXTENSION ===');
  const extensions = await prisma.$queryRawUnsafe('SELECT extname FROM pg_extension;');
  console.log(extensions);

  console.log('\n---');
  console.log('=== 3. PUBLIC INDEXES ===');
  const indexes = await prisma.$queryRawUnsafe(`
    SELECT tablename, indexname, indexdef 
    FROM pg_indexes 
    WHERE schemaname = 'public' 
    ORDER BY tablename, indexname;
  `);
  console.log(JSON.stringify(indexes, null, 2));

  console.log('\n---');
  console.log('=== 4. ROW COUNTS (CARDINALITY) ===');
  const tables = ['"Fuse"', '"FuseBox"', '"Vehicle"', '"Manufacturer"', '"FaultCode"', '"VagDtcCode"'];
  for (const table of tables) {
    try {
      const count = await prisma.$queryRawUnsafe(`SELECT count(*) as count FROM public.${table};`);
      console.log(`${table}:`, count[0].count.toString());
    } catch (e) {
      console.log(`Failed for ${table}:`, e.message);
    }
  }

  console.log('\n---');
  console.log('=== 5. EXPLAIN (ANALYZE, BUFFERS) FOR SEARCT ===');
  try {
    const explainQuery = `
      EXPLAIN (ANALYZE, BUFFERS)
      WITH search_results AS MATERIALIZED (
        SELECT id
        FROM public."Fuse"
        WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', 'radyo')
      )
      SELECT id FROM search_results;
    `;
    const explain = await prisma.$queryRawUnsafe(explainQuery);
    console.log(JSON.stringify(explain, null, 2));
  } catch(e) {
    console.log('EXPLAIN failed:', e.message);
  }

  console.log('\n---');
  console.log('=== 6. PG_STAT_STATEMENTS (TOP 5) ===');
  try {
    const stats = await prisma.$queryRawUnsafe(`
      SELECT query, calls, total_time, mean_time 
      FROM pg_stat_statements 
      ORDER BY total_time DESC 
      LIMIT 5;
    `);
    console.log(JSON.stringify(stats, null, 2));
  } catch (e) {
    console.log('pg_stat_statements skipped/failed:', e.message);
  }
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });