const { PrismaClient } = require('@prisma/client');
const { execSync } = require('child_process');

async function run() {
    console.log("=== P0.4.1 DISPOSABLE ENVIRONMENT PREFLIGHT ===");
    
    // We will use the local docker postgres, but a completely new database name.
    const disposableDbUrl = "postgresql://postgres:postgres@127.0.0.1:5433/disposable_import_p04";
    
    // Check if Railway or Production
    const isRailway = disposableDbUrl.includes('railway.internal') || disposableDbUrl.includes('railway.app');
    const isProduction = isRailway || disposableDbUrl.includes('production');
    const isDisposable = !isRailway && disposableDbUrl.includes('127.0.0.1') && disposableDbUrl.includes('disposable_import_p04');

    console.log(`TARGET DATABASE HOST (REDACTED): 127.0.0.1:5433`);
    console.log(`TARGET DATABASE NAME: disposable_import_p04`);
    console.log(`TARGET DATABASE IS DISPOSABLE: ${isDisposable ? 'YES' : 'NO'}`);
    console.log(`TARGET DATABASE IS RAILWAY: ${isRailway ? 'YES' : 'NO'}`);
    console.log(`TARGET DATABASE IS PRODUCTION: ${isProduction ? 'YES' : 'NO'}`);
    
    if (isRailway || isProduction) {
        console.error("HARD-STOP: Target database is NOT disposable.");
        process.exit(1);
    }
    
    // Push the schema to the disposable DB
    console.log("Applying schema to disposable DB...");
    try {
        // use db push to apply schema without migrations history, perfect for disposable DB
        execSync('npx prisma db push --skip-generate', {
            env: { ...process.env, DATABASE_URL: disposableDbUrl, DIRECT_URL: disposableDbUrl },
            stdio: 'pipe'
        });
        console.log("SCHEMA PRESENT: YES");
        console.log("PRISMA MIGRATIONS APPLIED: NO (using db push for disposable schema)");
    } catch (e) {
        console.log("SCHEMA PRESENT: NO");
        console.log(`Error applying schema: ${e.message}`);
        if (e.stdout) console.log(e.stdout.toString());
        if (e.stderr) console.log(e.stderr.toString());
        process.exit(1);
    }
    
    // Verify source files
    const fs = require('fs');
    const path = require('path');
    
    let totalFiles = 0;
    let totalBytes = 0;
    
    function walkSync(dir) {
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
    }
    
    try {
        walkSync(path.join(process.cwd(), 'public', 'catalog'));
        console.log(`SOURCE JSON FILES: ${totalFiles}`);
        console.log(`SOURCE JSON BYTES: ${totalBytes}`);
    } catch(e) {
        console.log(`Error reading source: ${e.message}`);
    }
    
    console.log("=== P0.4.1 END ===");
}

run();
