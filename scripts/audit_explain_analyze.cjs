const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  try {
    const term = 'radyo';
    console.log("=== EXPLAIN ANALYZE: PRISMA GENERATED (NO EXPLICIT CONFIG) ===");
    const q1 = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT "id" FROM "public"."Fuse" 
      WHERE to_tsvector(concat_ws(' ', "type", "description")) @@ to_tsquery($1) 
      LIMIT 20;
    `, term);
    console.log(q1.map(r => r['QUERY PLAN']).join('\n'));

    console.log("\n=== EXPLAIN ANALYZE: EXPLICIT CONFIG CANDIDATE ('simple') ===");
    const q2 = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT "id" FROM "public"."Fuse" 
      WHERE to_tsvector('simple', concat_ws(' ', "type", "description")) @@ to_tsquery('simple', $1) 
      LIMIT 20;
    `, term);
    console.log(q2.map(r => r['QUERY PLAN']).join('\n'));

  } catch (e) {
    console.error(e);
  } finally {
    await prisma.$disconnect();
  }
}
run();
