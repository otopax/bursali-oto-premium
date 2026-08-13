require('dotenv').config();
const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("=== P0.4.14 PRODUCTION MIGRATION PREFLIGHT ===");

    const dbUrl = process.env.DATABASE_URL || '';
    console.log(`FOUND DATABASE_URL: ${dbUrl.replace(/:[^:@]*@/, ':***@')}`);

    // RULE: "If the target is not exactly: 127.0.0.1:5433/disposable_import_p04 ABORT IMMEDIATELY."
    if (!dbUrl.includes('127.0.0.1:5433/disposable_import_p04')) {
        console.log("TARGET_LOCK: FAIL");
        console.log("CONTRADICTION DETECTED: The Master Prompt instructs to verify the production database identity for P0.4.14, but explicitly mandates a HARD STOP if the target is NOT 127.0.0.1:5433/disposable_import_p04. Since the current environment DATABASE_URL points to /bursali_oto, this violates the Absolute Principle target lock.");
        
        const report = {
            TARGET_LOCK: "FAIL",
            DATABASE_VERSION: "UNKNOWN",
            SCHEMA_COMPATIBILITY: "UNKNOWN",
            EXTENSION_STATUS: "UNKNOWN",
            INDEX_BASELINE: "UNKNOWN",
            LOCK_BASELINE: "UNKNOWN",
            ACTIVITY_BASELINE: "UNKNOWN",
            BACKUP_STATUS: "UNKNOWN",
            PRODUCTION_CONTACT: 0,
            MUTATION_COUNT: 0,
            QUERY_ERRORS: 0,
            FINAL: "BLOCKED"
        };
        
        const evidenceDir = path.join(__dirname, '..', 'evidence');
        if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
        fs.writeFileSync(path.join(evidenceDir, 'p04-gate-14-production-preflight.json'), JSON.stringify(report, null, 2));
        
        console.log("\nFINAL: BLOCKED");
        console.log("ABORT IMMEDIATELY as instructed by Rule 4.");
        process.exit(1);
    }
}

run().catch(console.error);
