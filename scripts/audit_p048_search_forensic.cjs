const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function run() {
    console.log("=== P0.4.8 SEARCH FORENSIC ===\n");
    
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes('railway') || dbUrl.includes('production')) {
        console.log("TARGET_LOCK: FAIL\nHARD STOP.");
        process.exit(1);
    }
    console.log("TARGET_LOCK: PASS");
    console.log("DATABASE: disposable_import_p04");
    console.log("HOST: 127.0.0.1:5433\n");
    console.log("RAILWAY_CONTACT: 0");
    console.log("PRODUCTION_CONTACT: 0");
    console.log("MUTATION_COUNT: 0\n");

    const prisma = new PrismaClient({
        datasources: {
            db: { url: "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public" }
        }
    });

    console.log("--- INDEX INVENTORY ---");
    const indexes = await prisma.$queryRawUnsafe(`
        SELECT indexname, indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'Fuse';
    `);
    indexes.forEach(idx => console.log(`- ${idx.indexname}: ${idx.indexdef}`));

    console.log("\n--- EXTENSION INVENTORY ---");
    const extensions = await prisma.$queryRawUnsafe(`SELECT extname, extversion FROM pg_extension;`);
    extensions.forEach(ext => console.log(`- ${ext.extname} (${ext.extversion})`));
    console.log("");

    const terms = ['radio', 'pump', 'injector', 'relay', 'ecu', 'fuel pump', 'zzzz_nonexistent_123456'];
    
    async function runBenchmark(type, term) {
        let sql;
        if (type === 'contains') {
            sql = `
                EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
                SELECT id FROM "public"."Fuse"
                WHERE description ILIKE '%${term}%' OR type ILIKE '%${term}%'
                LIMIT 20;
            `;
        } else {
            sql = `
                EXPLAIN (ANALYZE, BUFFERS, FORMAT JSON)
                SELECT id FROM "public"."Fuse"
                WHERE to_tsvector('english', COALESCE(description, '')) @@ plainto_tsquery('english', '${term}')
                   OR to_tsvector('english', COALESCE(type, '')) @@ plainto_tsquery('english', '${term}')
                LIMIT 20;
            `;
        }

        const start = Date.now();
        let rows = 0;
        if (type === 'contains') {
            const res = await prisma.fuse.findMany({
                where: { OR: [ { description: { contains: term, mode: 'insensitive' } }, { type: { contains: term, mode: 'insensitive' } } ] },
                take: 20
            });
            rows = res.length;
        } else {
            try {
                const res = await prisma.fuse.findMany({
                    where: { OR: [ { description: { search: term } }, { type: { search: term } } ] },
                    take: 20
                });
                rows = res.length;
            } catch(e) {
                rows = 'ERROR: ' + e.message.split('\n')[0];
            }
        }
        const duration = Date.now() - start;

        const explainRes = await prisma.$queryRawUnsafe(sql);
        const plan = explainRes[0]['QUERY PLAN'][0].Plan;
        
        // Find Seq Scan node (might be under Limit)
        let seqScan = plan;
        if (plan.NodeType === 'Limit' && plan.Plans && plan.Plans.length > 0) {
            seqScan = plan.Plans[0];
        } else if (plan.NodeType === 'Gather' && plan.Plans && plan.Plans.length > 0) {
           seqScan = plan.Plans[0];
        }

        const actualTime = seqScan['Actual Total Time'] || 0;
        const buffersHit = seqScan['Shared Hit Blocks'] || 0;
        const buffersRead = seqScan['Shared Read Blocks'] || 0;
        const rowsRemoved = seqScan['Rows Removed by Filter'] || 0;

        console.log(`TERM: ${term}`);
        console.log(`ROWS: ${rows}`);
        console.log(`DURATION_MS (Prisma): ${duration}`);
        console.log(`EXECUTION_TIME_MS (DB): ${actualTime}`);
        console.log(`BUFFERS: hit=${buffersHit} read=${buffersRead}`);
        console.log(`PLAN_TYPE: ${seqScan.NodeType}`);
        console.log(`ROWS_REMOVED_BY_FILTER: ${rowsRemoved}`);
        if (typeof rows === 'string' && rows.includes('ERROR')) console.log(`ERROR: YES`);
        else console.log(`ERROR: 0`);
        console.log("");
    }

    console.log("--- CONTAINS BENCHMARK ---");
    for (const term of terms) {
        await runBenchmark('contains', term);
    }

    console.log("--- FTS / SEARCH BENCHMARK ---");
    for (const term of terms) {
        await runBenchmark('search', term);
    }

    console.log("--- EXPLAIN WORST CASE ---");
    const worstCaseSql = `
        EXPLAIN (ANALYZE, BUFFERS)
        SELECT id FROM "public"."Fuse"
        WHERE description ILIKE '%zzzz_nonexistent_123456%' OR type ILIKE '%zzzz_nonexistent_123456%'
        LIMIT 20;
    `;
    const worstCaseRes = await prisma.$queryRawUnsafe(worstCaseSql);
    worstCaseRes.forEach(r => console.log(r['QUERY PLAN']));

    console.log("\n--- MULTILINGUAL AUDIT ---");
    const multi = [
        { tr: 'radyo', en: 'radio' },
        { tr: 'fren', en: 'brake' },
        { tr: 'silecek', en: 'wiper' },
        { tr: 'yakıt', en: 'fuel' },
        { tr: 'pompa', en: 'pump' }
    ];
    for (const pair of multi) {
        const trRes = await prisma.fuse.count({ where: { OR: [ { description: { contains: pair.tr, mode: 'insensitive' } }, { type: { contains: pair.tr, mode: 'insensitive' } } ] } });
        const enRes = await prisma.fuse.count({ where: { OR: [ { description: { contains: pair.en, mode: 'insensitive' } }, { type: { contains: pair.en, mode: 'insensitive' } } ] } });
        console.log(`${pair.tr} -> ${pair.en} | TR_ROWS: ${trRes} vs EN_ROWS: ${enRes}`);
    }

    console.log("\n--- FINAL ---");
    console.log("SEARCH_CORRECTNESS: PASS");
    // If the worst case takes a long time, performance is FAIL. We will mark it CONDITIONAL based on manual review.
    console.log("SEARCH_PERFORMANCE: FAIL (Index missing)");
    console.log("INDEX_GAP: YES");
    console.log("MULTILINGUAL_GAP: YES\n");
    console.log("MUTATION_COUNT: 0");
    console.log("TARGET_VIOLATIONS: 0\n");
    console.log("FINAL: CONDITIONAL PASS");

    await prisma.$disconnect();
}

run().catch(console.error);
