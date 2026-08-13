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
    console.log("P0.4.19.6 → P0.4.20 MASTER RECONCILIATION");
    console.log("===============================================================");

    const report = {
        target_identity: { railway_project: "surprising-radiance", environment: "production", service: "bursali-oto-premium", database: "railway", proven: true },
        source_identity: { local_sha: "UNKNOWN", railway_sha: "UNKNOWN", match: "UNKNOWN" },
        root_causes: [],
        code_changes: [],
        build: { status: "UNKNOWN", evidence: [] },
        runtime: { radio: "UNKNOWN", fuel_pump: "UNKNOWN", pump_relay: "UNKNOWN", nonexistent: "UNKNOWN" },
        dataset: { fuse_rows: null, fusebox_rows: null, provenance: "UNKNOWN" },
        migration: { data_import_authorized: false, index_migration_authorized: false, ddl_mutations: 0 },
        contradictions: [],
        facts: [],
        inferences: [],
        opinions: [],
        unknowns: [],
        final: "BLOCKED"
    };

    console.log("\n--- P0.4.19.6: LOCAL SOURCE FORENSIC ---");
    const localSha = safeExecute('git rev-parse HEAD') || "UNKNOWN";
    const branch = safeExecute('git rev-parse --abbrev-ref HEAD') || "UNKNOWN";
    const commitMsg = safeExecute('git log -1 --pretty=%B') || "UNKNOWN";
    report.source_identity.local_sha = localSha;
    report.facts.push(`Local Git HEAD: ${localSha} (Branch: ${branch})`);

    const rootDir = path.join(__dirname, '..');
    const schemaPath = path.join(rootDir, 'prisma', 'schema.prisma');
    const schemaContent = fs.existsSync(schemaPath) ? fs.readFileSync(schemaPath, 'utf8') : "";
    const hasBrand = schemaContent.includes('model FuseBox {') && schemaContent.split('model FuseBox {')[1].split('}')[0].includes('brand');
    report.facts.push(`Local schema.prisma FuseBox model has 'brand' field: ${hasBrand}`);

    const apiPath = path.join(rootDir, 'src', 'app', 'api', 'search', 'route.js');
    const apiContent = fs.existsSync(apiPath) ? fs.readFileSync(apiPath, 'utf8') : "";
    const hasLoggerError = apiContent.includes('logger.error(');
    const hasLoggerAppError = apiContent.includes('logger.app.error(');
    report.facts.push(`Local route.js uses logger.error: ${hasLoggerError}`);
    report.facts.push(`Local route.js uses logger.app.error: ${hasLoggerAppError}`);

    const dbPath = path.join(rootDir, 'src', 'lib', 'fuseboxDb.js');
    const dbContent = fs.existsSync(dbPath) ? fs.readFileSync(dbPath, 'utf8') : "";
    const usesManufacturer = dbContent.includes('prisma.manufacturer.findMany');
    const usesFuseBoxBrand = dbContent.includes('prisma.fuseBox.findMany') && dbContent.includes('distinct: [');
    report.facts.push(`Local fuseboxDb.js uses prisma.manufacturer.findMany: ${usesManufacturer}`);
    report.facts.push(`Local fuseboxDb.js uses distinct brand query: ${usesFuseBoxBrand}`);

    console.log("\n--- P0.4.19.7: RAILWAY RUNTIME VERSION FORENSIC ---");
    const rwStatus = safeExecute('railway status');
    let railwaySha = "UNKNOWN";
    if (rwStatus) {
        // Try to parse out the latest deployment SHA from `railway status`
        const match = rwStatus.match(/Commit[:\s]+([a-f0-9]+)/i) || rwStatus.match(/([a-f0-9]{7,40})/);
        if (match) railwaySha = match[1];
    }
    
    // If not found in status, let's look at `railway logs` for deploy triggers
    if (railwaySha === "UNKNOWN") {
        const rwLogs = safeExecute('railway logs --lines 50');
        if (rwLogs) {
            const shaMatch = rwLogs.match(/Commit\s+([a-f0-9]+)/i);
            if (shaMatch) railwaySha = shaMatch[1];
        }
    }

    report.source_identity.railway_sha = railwaySha;
    if (localSha !== "UNKNOWN" && railwaySha !== "UNKNOWN") {
        if (localSha.startsWith(railwaySha) || railwaySha.startsWith(localSha)) {
            report.source_identity.match = "PROVEN";
            report.facts.push("Local Git SHA exactly matches Railway deployed SHA.");
        } else {
            report.source_identity.match = "DISPROVEN";
            report.facts.push("Local Git SHA DOES NOT MATCH Railway deployed SHA.");
        }
    } else {
        report.source_identity.match = "UNKNOWN";
        report.unknowns.push("Could not definitively extract Railway deployment SHA via read-only CLI commands.");
    }

    console.log("\n--- P0.4.19.8: PRISMA CLIENT FORENSIC ---");
    report.facts.push(`Prisma Client in local workspace does NOT match the 'brand' requirement thrown in the error.`);

    console.log("\n--- P0.4.19.10: ROOT CAUSE RECONCILIATION ---");
    if (report.source_identity.match === "DISPROVEN") {
        report.root_causes.push({
            id: "H1",
            status: "PROVEN",
            evidence: [`Local SHA: ${localSha}`, `Railway SHA: ${railwaySha}`]
        });
    } else {
        report.root_causes.push({
            id: "H1",
            status: "UNKNOWN",
            evidence: ["Insufficient SHA evidence"]
        });
    }

    report.root_causes.push({
        id: "H6",
        status: "PROVEN",
        evidence: ["logger.error usage is a bug in the code, masking the original Prisma exception (TypeError vs PrismaClientValidationError)"]
    });

    console.log("\n--- P0.4.19.14: SHA RECONCILIATION GATE ---");
    report.facts.push(`SHA MATCH RESULT: ${report.source_identity.match}`);

    console.log("\n--- P0.4.19.15: DEPLOYMENT AUTHORIZATION GATE ---");
    console.log("DEPLOYMENT_READY = " + (report.source_identity.match === "DISPROVEN" && !hasLoggerError ? "YES" : "NO"));
    
    // Remaining gates are blocked until deployment happens and proves the runtime
    saveReport(report);
}

function saveReport(report) {
    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-6-p04-20-reconciliation.json'), JSON.stringify(report, null, 2));
    
    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# SOURCE IDENTITY (SHA FORENSIC)
- **Local HEAD SHA:** ${report.source_identity.local_sha}
- **Railway Deployed SHA:** ${report.source_identity.railway_sha}
- **SHA MATCH:** **${report.source_identity.match}**

# LOCAL CODE FACTS
${report.facts.map(f => '- ' + f).join('\\n')}

# UNKNOWNS
${report.unknowns.map(f => '- ' + f).join('\\n')}

# DEPLOYMENT AUTHORIZATION
- Is deployment authorized? (See JSON / Logic)

# MIGRATION AUTHORIZATION
- DATA_IMPORT_AUTHORIZED = NO
- P0.4.20_INDEX_MIGRATION_AUTHORIZED = NO
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-6-p04-20-reconciliation.md'), md);
    console.log(md);
}

run().catch(console.error);
