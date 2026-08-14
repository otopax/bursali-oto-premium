const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
async function run() {
    const rawResults = await prisma.$queryRawUnsafe(`
        SELECT id
        FROM "public"."Fuse"
        WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', 'motor')
        ORDER BY ts_rank(to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')), to_tsquery('english', 'motor')) DESC, id ASC
        LIMIT 20
    `);
    console.log("Raw Result sample:", rawResults[0]);
    console.log("Raw Result Length:", rawResults.length);
}
run().catch(console.error).finally(() => prisma.$disconnect());
