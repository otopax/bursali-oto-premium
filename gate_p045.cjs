const { PrismaClient } = require('@prisma/client');

async function run() {
    console.log("=== P0.4.5 SCHEMA RECONCILIATION ===");
    console.log("\n--- TARGET ---");
    console.log("postgresql://admin:<REDACTED>@127.0.0.1:5433/disposable_import_p04?schema=public");
    
    console.log("\n--- PRISMA TABLE COUNT ---");
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public"
            }
        }
    });

    try {
        const tables = await prisma.$queryRaw`
            SELECT table_schema, table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public' 
            ORDER BY table_name;
        `;
        
        // Print nicely formatted
        for (const t of tables) {
            console.log(`${t.table_schema} | ${t.table_name}`);
        }
        
    } catch(e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
    console.log("\n=== P0.4.5 END ===");
}

run();
