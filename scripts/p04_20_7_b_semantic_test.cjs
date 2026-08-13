const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');
const prisma = new PrismaClient();

function getHash(ids) {
  const sorted = [...ids].sort().join(',');
  return crypto.createHash('sha256').update(sorted).digest('hex').substring(0, 16);
}

async function run() {
  const terms = ['ABS', 'radyo', 'fren', 'motor', 'sigorta'];
  
  console.log("=== P0.4.20.7-B: SEMANTIC FORENSIC TEST ===\n");

  for (const term of terms) {
    const formattedQuery = term.trim().split(/\s+/).join(' | ');

    // 1. LEGACY FTS (Prisma OR)
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

    // 2. NEW FTS (Candidate B - Simple Config)
    const newRaw = await prisma.$queryRawUnsafe(`
      SELECT id FROM "public"."Fuse"
      WHERE search_vector @@ to_tsquery('simple', $1)
    `, formattedQuery);
    const newIds = new Set(newRaw.map(r => r.id));

    // 3 & 4. HASHES
    const oldHash = getHash(oldIds);
    const newHash = getHash(newIds);

    // 5. DIFFERENCES
    let legacyOnly = 0;
    for (const id of oldIds) { if (!newIds.has(id)) legacyOnly++; }
    
    let newOnly = 0;
    for (const id of newIds) { if (!oldIds.has(id)) newOnly++; }

    console.log(`TERM: "${term}"`);
    console.log(`LEGACY COUNT : ${oldIds.size}`);
    console.log(`NEW COUNT    : ${newIds.size}`);
    console.log(`SET EQUALITY : ${oldHash === newHash ? 'TRUE (Identical)' : 'FALSE'}`);
    console.log(`LEGACY-ONLY  : ${legacyOnly}`);
    console.log(`NEW-ONLY     : ${newOnly}`);
    console.log(`----------------------------------------`);
  }

  await prisma.$disconnect();
}

run().catch(e => {
  console.error(e);
  process.exit(1);
});
