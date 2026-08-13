const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function run() {
  const formattedQuery = 'radyo';
  try {
    console.log("Running Fast Path...");
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
    console.log("Fast Path Succeeded!", rawResults);
  } catch (e) {
    console.log("Fast Path FAILED!", e);
  }
}

run();
