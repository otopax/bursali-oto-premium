const { PrismaClient } = require('@prisma/client');

async function run() {
    console.log("=== P0.4.8.1 SEARCH SQL + PLAN FORENSIC ===\n");
    
    let capturedQueries = [];
    
    const prisma = new PrismaClient({
        datasources: {
            db: { url: "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public" }
        },
        log: [
            { emit: 'event', level: 'query' },
            { emit: 'event', level: 'error' }
        ]
    });

    prisma.$on('query', (e) => {
        capturedQueries.push({
            sql: e.query,
            params: e.params,
            duration: e.duration
        });
    });

    prisma.$on('error', (e) => {
        // console.error("PRISMA ERROR EVENT:", e.message);
    });

    console.log("--- A. PRISMA CONTAINS REAL SQL ---");
    capturedQueries = [];
    await prisma.fuse.findMany({
        where: { OR: [ { description: { contains: 'radio', mode: 'insensitive' } }, { type: { contains: 'radio', mode: 'insensitive' } } ] },
        take: 1
    });
    console.log("CONTAINS (radio) SQL:");
    console.log(capturedQueries[capturedQueries.length - 1].sql);
    console.log("PARAMS:", capturedQueries[capturedQueries.length - 1].params, "\n");

    console.log("--- B. PRISMA SEARCH REAL SQL ---");
    capturedQueries = [];
    try {
        await prisma.fuse.findMany({
            where: { OR: [ { description: { search: 'radio' } }, { type: { search: 'radio' } } ] },
            take: 1
        });
        console.log("SEARCH (radio) SQL:");
        console.log(capturedQueries[capturedQueries.length - 1].sql);
        console.log("PARAMS:", capturedQueries[capturedQueries.length - 1].params, "\n");
    } catch(e) {}

    console.log("--- C. FUEL PUMP FTS ERROR ROOT CAUSE ---");
    capturedQueries = [];
    try {
        await prisma.fuse.findMany({
            where: { OR: [ { description: { search: 'fuel pump' } }, { type: { search: 'fuel pump' } } ] },
            take: 1
        });
        console.log("fuel pump search succeeded!?");
    } catch(e) {
        console.log("ERROR RECEIVED FOR 'fuel pump':");
        console.log(e.message.substring(0, 300));
        if (capturedQueries.length > 0) {
            console.log("\nSQL GENERATED BEFORE ERROR:");
            console.log(capturedQueries[capturedQueries.length - 1].sql);
            console.log("PARAMS:", capturedQueries[capturedQueries.length - 1].params);
        } else {
            console.log("\nNO SQL GENERATED. This means Prisma's Query Engine rejected the syntax before sending to PostgreSQL.");
        }
    }
    console.log("");

    console.log("--- D. EXPLAIN (ANALYZE, BUFFERS) ---");
    
    async function explainQuery(name, sql) {
        try {
            const res = await prisma.$queryRawUnsafe(`EXPLAIN (ANALYZE, BUFFERS) ${sql}`);
            console.log(`[${name}]`);
            res.forEach(r => console.log(r['QUERY PLAN']));
            console.log("");
        } catch(e) {
            console.log(`[${name}] ERROR:`, e.message.split('\n')[0], "\n");
        }
    }

    // Explaining the exact Prisma generated SQL but substituting parameters
    await explainQuery(
        "CONTAINS: radio", 
        `SELECT "public"."Fuse"."id" FROM "public"."Fuse" WHERE ("public"."Fuse"."description" ILIKE '%radio%' OR "public"."Fuse"."type" ILIKE '%radio%') LIMIT 20 OFFSET 0`
    );

    await explainQuery(
        "CONTAINS: injector", 
        `SELECT "public"."Fuse"."id" FROM "public"."Fuse" WHERE ("public"."Fuse"."description" ILIKE '%injector%' OR "public"."Fuse"."type" ILIKE '%injector%') LIMIT 20 OFFSET 0`
    );

    await explainQuery(
        "CONTAINS: zzzz_nonexistent", 
        `SELECT "public"."Fuse"."id" FROM "public"."Fuse" WHERE ("public"."Fuse"."description" ILIKE '%zzzz_nonexistent_123456%' OR "public"."Fuse"."type" ILIKE '%zzzz_nonexistent_123456%') LIMIT 20 OFFSET 0`
    );
    
    await explainQuery(
        "SEARCH: radio",
        `SELECT "public"."Fuse"."id" FROM "public"."Fuse" WHERE (
            (to_tsvector('simple', "public"."Fuse"."description") @@ to_tsquery('simple', 'radio')) OR 
            (to_tsvector('simple', "public"."Fuse"."type") @@ to_tsquery('simple', 'radio'))
        ) LIMIT 20 OFFSET 0`
    );

    console.log("--- E. POSTGRESQL METADATA (READ-ONLY) ---");
    
    const am = await prisma.$queryRawUnsafe(`SELECT amname FROM pg_am WHERE amname IN ('btree', 'gin', 'gist');`);
    console.log("Available Index Methods (pg_am):", am.map(a => a.amname).join(', '));
    
    const opclasses = await prisma.$queryRawUnsafe(`SELECT opcname FROM pg_opclass WHERE opcname IN ('gin_trgm_ops', 'gist_trgm_ops');`);
    console.log("Available Operator Classes (pg_opclass):", opclasses.length > 0 ? opclasses.map(o => o.opcname).join(', ') : 'NONE (pg_trgm not installed?)');

    const extensions = await prisma.$queryRawUnsafe(`SELECT extname FROM pg_extension;`);
    console.log("Installed Extensions:", extensions.map(e => e.extname).join(', '));

    console.log("\n--- FINAL ---");
    console.log("FORENSIC: COMPLETE");
    await prisma.$disconnect();
}

run().catch(console.error);
