const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function main() {
  const explainQuery = `
    EXPLAIN (ANALYZE, BUFFERS)
    WITH search_results AS MATERIALIZED (
      SELECT id
      FROM "public"."Fuse"
      WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', 'motor')
    )
    SELECT id FROM search_results
    ORDER BY id ASC
    LIMIT 20;
  `;
  const explain = await prisma.$queryRawUnsafe(explainQuery);
  console.log(JSON.stringify(explain, null, 2));
}
main().finally(() => prisma.$disconnect());