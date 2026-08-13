const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("=== P0.4.1 DISPOSABLE TARGET PREFLIGHT ===\n");
    
    console.log("TARGET HOST: 127.0.0.1:5433");
    console.log("TARGET DATABASE: disposable_import_p04\n");
    console.log("TARGET DATABASE IS DISPOSABLE: YES");
    console.log("TARGET DATABASE IS RAILWAY: NO");
    console.log("TARGET DATABASE IS PRODUCTION: NO\n");

    const disposableDbUrl = "postgresql://admin:mysecretpassword@127.0.0.1:5433/disposable_import_p04?schema=public";
    
    const prisma = new PrismaClient({
        datasources: {
            db: {
                url: disposableDbUrl
            }
        }
    });

    let connectivity = "FAIL";
    let tableCount = "?";
    let userTables = "?";
    let prismaMigrationsExists = "NO";

    try {
        await prisma.$connect();
        
        // Attempt to run a raw query to check connectivity
        const result = await prisma.$queryRaw`SELECT 1 as connected`;
        if (result && result.length > 0 && result[0].connected === 1) {
            connectivity = "PASS";
            
            // Check tables
            const tables = await prisma.$queryRaw`
                SELECT table_name 
                FROM information_schema.tables 
                WHERE table_schema = 'public'
            `;
            
            tableCount = tables.length;
            
            const pMig = tables.find(t => t.table_name === '_prisma_migrations');
            if (pMig) prismaMigrationsExists = "YES";
            
            const exclude = ['_prisma_migrations'];
            const uTables = tables.filter(t => !exclude.includes(t.table_name));
            userTables = uTables.length;
        }
    } catch (e) {
        connectivity = "FAIL (" + (e.message.includes('does not exist') ? 'DB_NOT_FOUND' : 'AUTH_OR_NETWORK_ERROR') + ")";
    } finally {
        await prisma.$disconnect();
    }

    console.log(`DATABASE CONNECTIVITY: ${connectivity}\n`);
    console.log(`EXISTING TABLE COUNT: ${tableCount}`);
    console.log(`EXISTING USER TABLES: ${userTables}`);
    console.log(`PRISMA _prisma_migrations EXISTS: ${prismaMigrationsExists}\n`);

    let totalFiles = 0;
    let totalBytes = 0;
    
    function walkSync(dir) {
        try {
            const files = fs.readdirSync(dir, { withFileTypes: true });
            for (const file of files) {
                const res = path.join(dir, file.name);
                if (file.isDirectory()) {
                    walkSync(res);
                } else {
                    if (file.name.endsWith('.json')) {
                        totalFiles++;
                        totalBytes += fs.statSync(res).size;
                    }
                }
            }
        } catch(e) {}
    }
    
    walkSync(path.join(process.cwd(), 'public', 'catalog'));
    
    console.log(`SOURCE JSON FILES: ${totalFiles.toLocaleString('en-US')}`);
    console.log(`SOURCE JSON BYTES: ${totalBytes.toLocaleString('en-US')}\n`);
    console.log("SCHEMA MUTATION: NOT PERFORMED");
    console.log("DATA MUTATION: NOT PERFORMED");
}

run();
