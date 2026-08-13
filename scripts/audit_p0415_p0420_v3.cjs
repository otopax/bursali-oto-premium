const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function safeExecute(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return null;
    }
}

async function run() {
    console.log("===============================================================");
    console.log("PHASE 0 — CONNECTION PREFLIGHT");
    console.log("===============================================================");

    const report = {
        lifecycle: "P0.4.15-P0.4.20",
        railwayIdentity: {},
        databaseIdentity: {},
        productionTargetIdentity: {},
        datasetIdentity: {},
        schemaCompatibility: {},
        prismaSqlEvidence: {},
        baseline: {},
        candidateIndexStrategy: {},
        migrationAuthorization: {},
        migrationExecution: {},
        indexVerification: {},
        afterBenchmark: {},
        beforeAfterComparison: {},
        queryNormalization: {},
        trEnMapping: {},
        applicationTests: {},
        rollback: {},
        contradictionAudit: [],
        securityAudit: {},
        facts: [],
        unknowns: [],
        failures: [],
        engineeringOpinions: [],
        finalDecision: "RED / BLOCKED"
    };

    let forensicUrl = process.env.DATABASE_FORENSIC_URL;

    if (!forensicUrl) {
        report.failures.push("DATABASE_FORENSIC_URL environment variable is not set. TCP proxy URL was not provided to the execution context.");
        report.contradictionAudit.push({
            ID: "C_CONN_FORENSIC",
            DESCRIPTION: "Forensic URL missing",
            EVIDENCE: "process.env.DATABASE_FORENSIC_URL is empty.",
            STATUS: "BLOCKING"
        });
        report.finalDecision = "RED / BLOCKED";
        
        console.log("\n[STOP] TARGET_IDENTITY_PROVEN, DATABASE_IDENTITY_PROVEN, RAILWAY_IDENTITY_PROVEN, PRODUCTION_CONTACT_PROVEN cannot be verified.");
    } else {
        // Redacted output
        const redactedUrl = forensicUrl.replace(/:[^:@]*@/, ':***@');
        console.log(`DATABASE_FORENSIC_URL_REDACTED: ${redactedUrl}`);
        
        try {
            const { PrismaClient } = require('@prisma/client');
            const prisma = new PrismaClient({ datasources: { db: { url: forensicUrl } } });
            await prisma.$connect();
            // This would continue if we actually had a valid URL
        } catch (e) {
            report.failures.push(`Connection failed: ${e.message.split('\\n')[0]}`);
            report.finalDecision = "RED / BLOCKED";
        }
    }

    report.unknowns.push(
        "DATABASE_IDENTITY_PROVEN",
        "DATASET_IDENTITY_PROVEN",
        "SCHEMA_COMPATIBILITY",
        "PRISMA_COMPATIBILITY",
        "MIGRATION_EXECUTED",
        "PERFORMANCE_IMPROVED",
        "CBO_BEHAVIOR",
        "TR_EN_MAPPING"
    );

    report.facts.push("DDL_MUTATION_COUNT = 0");

    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-20-final-forensic.json'), JSON.stringify(report, null, 2));
    
    console.log("\nFINAL STATUS: " + report.finalDecision);
}

run().catch(console.error);
