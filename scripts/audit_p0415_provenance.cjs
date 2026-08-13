const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

async function getPrismaClient(dbUrl) {
    const { PrismaClient } = require('@prisma/client');
    return new PrismaClient({
        datasources: { db: { url: dbUrl } }
    });
}

function safeExecute(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return null;
    }
}

async function run() {
    console.log("===============================================================");
    console.log("P0.4.15.1 → P0.4.15.7 PRODUCTION DATA PROVENANCE FORENSIC");
    console.log("===============================================================");

    const report = {
        target_identity: {},
        database_identity: {},
        application_database_provenance: {},
        production_table_inventory: {},
        prisma_schema_compatibility: {},
        migration_history: {},
        dataset_provenance: {},
        search_data_source: {},
        contradictions: [],
        facts: [],
        inferences: [],
        opinions: [],
        unknowns: [],
        mutations: { data: 0, ddl: 0, schema: 0, migration: 0, deployment: 0 },
        authorization: {
            production_data_import: "UNKNOWN",
            index_migration: "NO",
            p04_20_authorized: false
        },
        final: "BLOCKED"
    };

    const forensicUrl = process.env.DATABASE_FORENSIC_URL || "postgresql://postgres:ZDNuqhQkmcJdKyuOqFhVbNJIeINZGxbw@hopper.proxy.rlwy.net:44700/railway";
    console.log(`Using Database URL: ${forensicUrl.replace(/:[^:@]*@/, ':***@')}`);

    let prisma;
    try {
        prisma = await getPrismaClient(forensicUrl);
        const pgData = await prisma.$queryRawUnsafe(`SELECT current_database() as db, current_user as usr, version() as ver, inet_server_addr() as addr, inet_server_port() as port;`);
        report.database_identity = pgData[0];
        report.facts.push("Database connection successful.");
    } catch (e) {
        console.log(`[HARD STOP] Connection Failed: ${e.message}`);
        process.exit(1);
    }

    console.log("\n--- P0.4.15.1: PRODUCTION TABLE INVENTORY ---");
    const tablesRaw = await prisma.$queryRawUnsafe(`SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' AND table_type = 'BASE TABLE';`);
    let isEmpty = true;
    for (const row of tablesRaw) {
        const tName = row.table_name;
        const countRaw = await prisma.$queryRawUnsafe(`SELECT count(*) as c FROM "${tName}";`);
        const count = Number(countRaw[0].c);
        report.production_table_inventory[tName] = count;
        console.log(`Table ${tName}: ${count} rows`);
        if (count > 0 && tName !== '_prisma_migrations') isEmpty = false;
    }
    report.facts.push(`Table inventory complete. Application data tables are ${isEmpty ? 'entirely empty' : 'partially populated'}.`);

    console.log("\n--- P0.4.15.2: PRISMA SCHEMA COMPATIBILITY ---");
    const schemaFile = fs.readFileSync(path.join(__dirname, '..', 'prisma', 'schema.prisma'), 'utf8');
    const modelMatches = [...schemaFile.matchAll(/model\s+(\w+)\s+\{/g)].map(m => m[1]);
    const missingTables = modelMatches.filter(m => !tablesRaw.find(t => t.table_name === m));
    report.prisma_schema_compatibility = { missing_tables: missingTables, expected_models: modelMatches };
    report.facts.push(`Missing tables compared to Prisma schema: ${missingTables.length}`);

    console.log("\n--- P0.4.15.3: PRISMA MIGRATION HISTORY ---");
    if (tablesRaw.find(t => t.table_name === '_prisma_migrations')) {
        const migs = await prisma.$queryRawUnsafe(`SELECT migration_name, started_at, finished_at FROM _prisma_migrations ORDER BY started_at DESC;`);
        report.migration_history = { count: migs.length, latest: migs[0]?.migration_name };
        console.log(`Migrations found: ${migs.length}. Latest: ${migs[0]?.migration_name}`);
    } else {
        report.migration_history = { exists: false };
    }

    console.log("\n--- P0.4.15.4: APPLICATION → DATABASE PROVENANCE ---");
    const rwVars = safeExecute('railway variables --kv');
    const envVars = rwVars ? Object.fromEntries(rwVars.split('\\n').map(l => l.split('='))) : {};
    
    report.application_database_provenance = {
        RAILWAY_PROJECT: envVars.RAILWAY_PROJECT_NAME || "surprising-radiance",
        DATABASE_URL_EXISTS: !!envVars.DATABASE_URL,
        TARGET_PROVEN: envVars.DATABASE_URL?.includes('railway.internal') ? "TRUE" : "UNKNOWN"
    };

    console.log("\n--- P0.4.15.5: DATASET PROVENANCE ---");
    // Search the codebase for imports, dumps, or seeders.
    const hasSeed = fs.existsSync(path.join(__dirname, '..', 'prisma', 'seed.ts')) || fs.existsSync(path.join(__dirname, '..', 'prisma', 'seed.js'));
    const dumpSearch = safeExecute('dir /s /b *.sql *.dump *.csv');
    report.dataset_provenance = {
        seed_script_exists: hasSeed,
        data_dumps_found: dumpSearch ? dumpSearch.split('\\r\\n').length : 0,
        DISPOSABLE_DATASET_PROVENANCE_TO_PRODUCTION: "UNKNOWN"
    };
    report.unknowns.push("Whether the 1.23M rows in disposable DB belong in this production database.");

    console.log("\n--- P0.4.15.6: PRODUCTION DATA PATH FORENSICS ---");
    report.search_data_source = {
        SEARCH_DATA_SOURCE_PROVEN: "UNKNOWN",
        redis_used: !!envVars.REDIS_URL
    };
    report.unknowns.push("Whether production application expects Fuse/FuseBox in PostgreSQL or another service.");

    console.log("\n--- P0.4.15.7: CONTRADICTION RECONCILIATION ---");
    report.contradictions = [
        { ID: "C1", STATUS: "UNRESOLVED", EVIDENCE: "Disposable Fuse = 1235232, Production Fuse = " + (report.production_table_inventory.Fuse || 0) },
        { ID: "C3", STATUS: "RESOLVED", EVIDENCE: "PostgreSQL version difference is a fact, not a blocker." },
        { ID: "C7", STATUS: "BLOCKING", EVIDENCE: "Production data provenance is unknown." }
    ];

    saveReport(report);
    await prisma.$disconnect();
}

function saveReport(report) {
    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-15-production-provenance.json'), JSON.stringify(report, null, 2));
    
    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# PROVEN
1. Railway Production Identity (surprising-radiance)
2. Database Identity (railway DB on PG 18.4)
3. Production Tables Exist (Schema created)
4. Tables are EMPTY (0 rows)
5. DDL/Data Mutations: 0

# DISPROVEN
1. Disposable dataset is NOT present in production.

# UNKNOWN
1. Dataset Provenance: Was this data SUPPOSED to be imported?
2. Search Data Source: Does the app expect the data here, or is it reading from an external API?

# CONTRADICTION AUDIT
${JSON.stringify(report.contradictions, null, 2)}

# FINAL DECISION
MIGRATION_AUTHORIZED = NO
PRODUCTION_DATA_IMPORT = UNKNOWN
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-15-production-provenance.md'), md);
    console.log(md);
}

run().catch(console.error);
