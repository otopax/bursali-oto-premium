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
    console.log("=== P0.4.15 → P0.4.20 RAILWAY-INTERNAL PRODUCTION FORENSIC (v2.1) ===");

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

    let failReason = null;
    let prodDbUrl = null;

    // P0.4.15.1 - Railway Identity
    console.log("\n--- GATE P0.4.15.1 ---");
    let rwVars = safeExecute('railway variables --kv');
    if (rwVars) {
        report.facts.push("Railway CLI variables retrieved successfully.");
        report.railwayIdentity = {
            project: "surprising-radiance",
            environment: "production",
            service: "bursali-oto-premium"
        };
        rwVars.split('\n').forEach(line => {
            if (line.startsWith('DATABASE_URL=')) {
                prodDbUrl = line.split('=')[1].replace(/^"|"$/g, '').trim();
            }
        });
    } else {
        failReason = "Railway variables unavailable.";
        report.failures.push(failReason);
    }

    // P0.4.15.2 - Database Connection
    console.log("\n--- GATE P0.4.15.2 ---");
    if (prodDbUrl) {
        if (prodDbUrl.includes('.internal')) {
            report.facts.push("DATABASE_URL indicates an internal Railway network address (.internal).");
            // Check if we are running inside Railway
            if (!process.env.RAILWAY_ENVIRONMENT) {
                failReason = "RAILWAY_INTERNAL_CONNECTIVITY: Cannot reach .internal network from local machine.";
                report.failures.push(failReason);
                report.contradictionAudit.push({
                    ID: "C_CONN",
                    DESCRIPTION: "Railway DB is internal, execution is local.",
                    EVIDENCE: "prodDbUrl contains .internal, no TCP proxy available",
                    STATUS: "BLOCKING"
                });
            }
        }
    } else {
        failReason = failReason || "No DATABASE_URL found.";
    }

    report.unknowns.push(
        "DATABASE_IDENTITY_PROVEN",
        "DATASET_IDENTITY_PROVEN",
        "SCHEMA_COMPATIBILITY",
        "PRISMA_COMPATIBILITY",
        "MIGRATION_EXECUTED",
        "PERFORMANCE_IMPROVED"
    );

    report.engineeringOpinions.push(
        "The forensic runner must be executed INSIDE the Railway network (e.g. as a temporary deployed service or worker) to resolve the postgres.railway.internal address, since we are explicitly rejecting the public TCP proxy option. Until such a runner is deployed into the Railway environment, the execution remains blocked at P0.4.15."
    );

    if (failReason) {
        report.finalDecision = "RED / BLOCKED";
        console.log(`\n[BLOCKED] ${failReason}`);
    }

    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-master-forensic-v2-final.json'), JSON.stringify(report, null, 2));
}

run().catch(console.error);
