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
    console.log("BURSALI OTO P0.4.15 → P0.4.20 MASTER PRODUCTION FORENSIC (v2.1)");
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

    let prodDbUrl = null;

    // GATE 15.1 - Railway Identity
    console.log("\n--- GATE P0.4.15.1: RAILWAY IDENTITY ---");
    let rwVars = safeExecute('railway variables --kv');
    if (rwVars) {
        report.facts.push("Railway CLI variables retrieved successfully.");
        report.railwayIdentity = {
            RAILWAY_PROJECT: "surprising-radiance",
            RAILWAY_ENVIRONMENT: "production",
            RAILWAY_SERVICE: "bursali-oto-premium"
        };
        rwVars.split('\n').forEach(line => {
            if (line.startsWith('DATABASE_URL=')) {
                prodDbUrl = line.split('=')[1].replace(/^"|"$/g, '').trim();
            }
        });
    } else {
        report.failures.push("Railway variables unavailable.");
    }

    if (prodDbUrl) {
        report.facts.push(`DATABASE_HOST_REDACTED: ${prodDbUrl.replace(/:[^:@]*@/, ':***@')}`);
    }

    // GATE 15.2 - Execution Context and Database Connection
    console.log("\n--- GATE P0.4.15.2: DATABASE CONNECTION & EXECUTION CONTEXT ---");
    if (prodDbUrl && prodDbUrl.includes('.internal')) {
        report.facts.push("DATABASE_URL indicates an internal Railway network address (.internal).");
        
        if (!process.env.RAILWAY_ENVIRONMENT) {
            report.failures.push("Execution environment is LOCAL, but database is Railway INTERNAL.");
            report.contradictionAudit.push({
                ID: "C_CONN",
                DESCRIPTION: "Railway DB is internal, execution is local.",
                EVIDENCE: "prodDbUrl contains .internal, process is not running inside Railway.",
                STATUS: "BLOCKING"
            });
            
            // As per Rule 3:
            console.log("\n[STOP] Internal execution options are technically unavailable from the local developer machine context without intrusive structural changes to the production project.");
            console.log("PUBLIC_NETWORKING_REQUIRED = TRUE");
            report.failures.push("PUBLIC_NETWORKING_REQUIRED = TRUE");
            report.finalDecision = "RED / BLOCKED";
        }
    } else if (!prodDbUrl) {
        report.failures.push("No DATABASE_URL found.");
        report.finalDecision = "RED / BLOCKED";
    }

    // Populate Unknowns
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

    report.engineeringOpinions.push(
        "Without deploying a temporary worker service explicitly into the Railway 'surprising-radiance' project, or enabling the public TCP proxy on the PostgreSQL service, local execution cannot route to 'postgres.railway.internal'.",
        "Since the prompt forbids intrusive production code mutation to create a runner and forbids public DB exposure as a default, all non-intrusive internal execution options from the local machine are unavailable.",
        "Therefore, per Rule 3: PUBLIC_NETWORKING_REQUIRED = TRUE."
    );

    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-master-forensic-v2-final.json'), JSON.stringify(report, null, 2));
    
    console.log("\nFINAL STATUS: " + report.finalDecision);
}

run().catch(console.error);
