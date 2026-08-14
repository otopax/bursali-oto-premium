const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function runExplain(term) {
    const rawSql = `
        EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
        SELECT id
        FROM "public"."Fuse"
        WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', '${term}')
        ORDER BY ts_rank(to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')), to_tsquery('english', '${term}')) DESC, id ASC
        LIMIT 20;
    `;
    const explainResults = await prisma.$queryRawUnsafe(rawSql);
    console.log(`\n=== EXPLAIN FOR '${term}' ===`);
    console.log(JSON.stringify(explainResults[0]['QUERY PLAN'][0], null, 2));
}

async function main() {
    console.log("Running EXPLAIN (ANALYZE, BUFFERS) on Production DB for Candidate D");
    // Warm up DB
    await runExplain('radyo');
    
    await runExplain('amf');
    await runExplain('fren');
    await runExplain('zzzzz_nonexistent');
    await runExplain('motor');
}

main().catch(console.error).finally(() => prisma.$disconnect());
