const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient({ log: ['query'] });

async function run() {
  const term = 'motor';
  const limit = 20;
  
  // 1. Prisma Legacy
  const legacyResults = await prisma.fuse.findMany({
    where: { OR: [{ description: { search: term } }, { type: { search: term } }] },
    select: { id: true },
    take: limit
  });
  
  // 2. Fast Path (ORDER BY id ASC)
  const fastResults = await prisma.$queryRawUnsafe(`
    SELECT id FROM "public"."Fuse"
    WHERE search_vector_english @@ to_tsquery('english', $1)
    ORDER BY id ASC
    LIMIT $2
  `, term, limit);

  const legacyIds = legacyResults.map(r => r.id);
  const fastIds = fastResults.map(r => r.id);

  let isSetEq = legacyIds.length === fastIds.length;
  let isOrderEq = true;
  for(let i=0; i<legacyIds.length; i++) {
    if(legacyIds[i] !== fastIds[i]) isOrderEq = false;
  }

  console.log(`LEGACY IDs:`, legacyIds.slice(0, 5));
  console.log(`FAST IDs  :`, fastIds.slice(0, 5));
  console.log(`SET EQ: ${isSetEq}, ORDER EQ: ${isOrderEq}`);

  await prisma.$disconnect();
}
run().catch(console.error);
