const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const term = 'radyo';
  console.log("=== GATE 2 & 3: LOCAL INDEX BENCHMARK ===");
  
  try {
    // BASELINE (No explicit config)
    const qBase = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT "id" FROM "public"."Fuse" 
      WHERE to_tsvector(concat_ws(' ', "type", "description")) @@ to_tsquery($1) 
      LIMIT 20;
    `, term);
    console.log("\n[BASELINE] No Index (Prisma Default Expression)");
    console.log(qBase.map(r => r['QUERY PLAN']).join('\n'));

    // CREATE INDEX B
    console.log("\n--- CREATING INDEX B (Generated tsvector Column + GIN) ---");
    // We use coalesce and || because concat_ws is STABLE, not IMMUTABLE in PostgreSQL.
    await prisma.$queryRawUnsafe(`
      ALTER TABLE "public"."Fuse" 
      ADD COLUMN search_vector tsvector 
      GENERATED ALWAYS AS (to_tsvector('simple', coalesce(type, '') || ' ' || coalesce(description, ''))) STORED;
    `);
    await prisma.$queryRawUnsafe(`
      CREATE INDEX idx_b_fuse ON "public"."Fuse" USING GIN (search_vector);
    `);

    const qB = await prisma.$queryRawUnsafe(`
      EXPLAIN (ANALYZE, BUFFERS) 
      SELECT "id" FROM "public"."Fuse" 
      WHERE search_vector @@ to_tsquery('simple', $1) 
      LIMIT 20;
    `, term);
    console.log("\n[CANDIDATE B] Generated Column + GIN ('simple')");
    console.log(qB.map(r => r['QUERY PLAN']).join('\n'));

    // CLEANUP
    await prisma.$queryRawUnsafe(`DROP INDEX idx_b_fuse;`);
    await prisma.$queryRawUnsafe(`ALTER TABLE "public"."Fuse" DROP COLUMN search_vector;`);
    console.log("--- CLEANUP COMPLETE ---");

  } catch (e) {
    console.error("BENCHMARK ERROR:", e);
  } finally {
    await prisma.$disconnect();
  }
}

run();
