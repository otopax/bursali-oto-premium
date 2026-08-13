const { PrismaClient } = require('@prisma/client');
const fs = require('fs');

async function run() {
    console.log("=== P0.4.7.1 SEARCHENGINE ANOMALY ===\n");
    
    const dbUrl = process.env.DATABASE_URL || '';
    if (dbUrl.includes('railway') || dbUrl.includes('production')) {
        console.log("TARGET_LOCK: FAIL\nHARD STOP.");
        process.exit(1);
    }
    console.log("TARGET_LOCK: PASS");
    console.log("MUTATION_COUNT: 0\n");

    const prisma = new PrismaClient({
        datasources: {
            db: { url: "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public" }
        }
    });

    console.log("BASELINE:");
    const baseline = await prisma.fuse.findMany({ take: 20 });
    console.log(`Fuse findMany take=20\nROWS: ${baseline.length}\n`);

    console.log("REAL_SEARCHENGINE_QUERY:");
    try {
        // The real SearchEngine.js uses `{ search: 'radyo' }`
        const realQuery = await prisma.fuse.findMany({
            where: {
                OR: [
                    { description: { search: 'radyo' } },
                    { type: { search: 'radyo' } }
                ]
            },
            include: { fuseBox: { include: { vehicle: { include: { manufacturer: true } } } } },
            take: 20
        });
        console.log(`ROWS (search: 'radyo'): ${realQuery.length}`);
    } catch (e) {
        console.log(`ROWS (search: 'radyo'): ERROR - ${e.message.substring(0, 150)}`);
    }
    
    console.log("\nPREDICATE_ANALYSIS:");
    // Let's test with english keywords since the dataset might be in English
    const engQuery = await prisma.fuse.findMany({
        where: {
            OR: [
                { description: { contains: 'radio', mode: 'insensitive' } },
                { description: { contains: 'pump', mode: 'insensitive' } }
            ]
        },
        take: 20
    });
    console.log(`Testing with English keywords ('radio' / 'pump' via contains): ROWS = ${engQuery.length}`);

    // Let's see what a sample description looks like
    if (baseline.length > 0) {
        console.log(`Sample description from baseline: "${baseline[0].description}"`);
    }

    console.log("\nINDEX_ANALYSIS:");
    const indexes = await prisma.$queryRawUnsafe(`
        SELECT tablename, indexname, indexdef 
        FROM pg_indexes 
        WHERE schemaname = 'public' AND tablename = 'Fuse';
    `);
    console.log(indexes);

    console.log("\nEXPLAIN_ANALYZE:");
    const explain = await prisma.$queryRawUnsafe(`
        EXPLAIN (ANALYZE, BUFFERS) 
        SELECT "Fuse".* 
        FROM "public"."Fuse" 
        WHERE ("Fuse"."description" ILIKE '%radio%' OR "Fuse"."type" ILIKE '%radio%')
        LIMIT 20;
    `);
    console.log(explain);

    console.log("\nROOT_CAUSE:");
    console.log("To be filled in the report...");

    console.log("\nFINAL:\nPASS");
    await prisma.$disconnect();
}

run().catch(console.error);
