const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function getHash(ids) {
  const sorted = [...ids].sort().join(',');
  return crypto.createHash('sha256').update(sorted).digest('hex').substring(0, 16);
}

async function run() {
  console.log("=== P0.4.20.7-D: ENGLISH EXACT SEMANTIC EQUIVALENCE TEST ===\n");

  // Step 1: Create the english vector column
  console.log("[1] Creating search_vector_english and GIN index...");
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "public"."Fuse" 
      ADD COLUMN search_vector_english tsvector 
      GENERATED ALWAYS AS (to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, ''))) STORED;
    `);
  } catch(e) { } // Ignore if exists
  
  try {
    await prisma.$executeRawUnsafe(`DROP INDEX IF EXISTS idx_fuse_search_vector_english;`);
    await prisma.$executeRawUnsafe(`
      CREATE INDEX CONCURRENTLY idx_fuse_search_vector_english 
      ON "public"."Fuse" USING GIN (search_vector_english);
    `);
  } catch(e) { } // Ignore if exists

  // Step 2 & 3: Semantic Comparison
  const terms = ['ABS', 'motor', 'motors', 'motoru', 'radyo', 'fren', 'sigorta'];
  
  console.log("\n[2] FULL ID-SET COMPARISON (No LIMIT)");
  for (const term of terms) {
    const formattedQuery = term.trim().split(/\s+/).join(' | ');

    // Legacy FTS
    const oldResults = await prisma.fuse.findMany({
      where: {
        OR: [
          { description: { search: formattedQuery } },
          { type: { search: formattedQuery } }
        ]
      },
      select: { id: true }
    });
    const oldIds = new Set(oldResults.map(r => r.id));

    // New FTS (english)
    const newRaw = await prisma.$queryRawUnsafe(`
      SELECT id FROM "public"."Fuse"
      WHERE search_vector_english @@ to_tsquery('english', $1)
    `, formattedQuery);
    const newIds = new Set(newRaw.map(r => r.id));

    let legacyOnly = 0;
    for (const id of oldIds) { if (!newIds.has(id)) legacyOnly++; }
    
    let newOnly = 0;
    for (const id of newIds) { if (!oldIds.has(id)) newOnly++; }

    console.log(`\nTERM: "${term}"`);
    console.log(`LEGACY COUNT : ${oldIds.size}`);
    console.log(`NEW COUNT    : ${newIds.size}`);
    console.log(`SET EQUALITY : ${oldIds.size === newIds.size && legacyOnly === 0 && newOnly === 0 ? 'TRUE (Exact Equality)' : 'FALSE'}`);
    console.log(`LEGACY-ONLY  : ${legacyOnly}`);
    console.log(`NEW-ONLY     : ${newOnly}`);
  }

  // Step 4: Explain Analyze Verification
  console.log("\n[3] EXPLAIN (ANALYZE, BUFFERS) Verification...");
  const qExplain = await prisma.$queryRawUnsafe(`
    EXPLAIN (ANALYZE, BUFFERS) 
    SELECT "id" FROM "public"."Fuse" 
    WHERE search_vector_english @@ to_tsquery('english', 'motor') 
    LIMIT 20;
  `);
  console.log(qExplain.map(r => r['QUERY PLAN']).join('\n'));

  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
