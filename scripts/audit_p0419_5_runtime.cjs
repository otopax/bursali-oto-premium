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
    console.log("P0.4.19.5 PRODUCTION SEARCH RUNTIME FORENSIC");
    console.log("===============================================================");

    const report = {
        api_endpoint_analysis: {},
        http_request_evidence: {},
        runtime_log_evidence: {},
        conclusions: {
            PRODUCTION_RUNTIME_SEARCH_TO_FUSE: "UNKNOWN",
            SEARCH_ENGINE_DEPENDS_ON_FUSE: "UNKNOWN",
            PRODUCTION_FUSE_DATASET_REQUIRED: "UNKNOWN"
        },
        contradictions: [],
        facts: [],
        inferences: [],
        opinions: [],
        unknowns: [],
        mutations: { data: 0, ddl: 0, schema: 0, migration: 0, deployment: 0 },
        authorization: { data_import: "NO", index_migration: "NO", p04_20: false },
        final: "BLOCKED"
    };

    console.log("\n--- STEP 1: API ENDPOINT DISCOVERY ---");
    // Find the exact API route path
    const rootDir = path.join(__dirname, '..');
    const apiPath = path.join(rootDir, 'src', 'app', 'api', 'search', 'route.js');
    let endpointDetected = false;
    if (fs.existsSync(apiPath)) {
        endpointDetected = true;
        report.api_endpoint_analysis.path = "/api/search";
        report.api_endpoint_analysis.source_file = "src/app/api/search/route.js";
        report.facts.push("Source code indicates API route exists at /api/search");
        console.log("Detected API route: /api/search");
    }

    const rwVars = safeExecute('railway variables --kv');
    const envVars = rwVars ? Object.fromEntries(rwVars.split('\\n').map(l => l.split('='))) : {};
    const baseUrl = envVars.RAILWAY_PUBLIC_DOMAIN ? `https://${envVars.RAILWAY_PUBLIC_DOMAIN}` : "https://www.bursaliotoservis.com";
    
    console.log(`\n--- STEP 2: RUNTIME HTTP REQUEST FORENSICS ---`);
    const searchUrl = `${baseUrl}/api/search?q=radio`;
    console.log(`Targeting production URL: ${searchUrl}`);
    report.http_request_evidence.target_url = searchUrl;

    try {
        const fetch = (await import('node-fetch')).default; // Use dynamic import if node-fetch is ESM, or global fetch if Node 18+
        const response = await fetch(searchUrl, { method: 'GET' });
        const text = await response.text();
        report.http_request_evidence.status = response.status;
        report.http_request_evidence.body = text.substring(0, 200); // Truncate
        report.facts.push(`HTTP Request to ${searchUrl} returned status ${response.status}`);
        console.log(`HTTP Status: ${response.status}`);
        console.log(`HTTP Response (trunc): ${text.substring(0, 100)}`);
    } catch (e) {
        // Fallback if fetch fails
        report.http_request_evidence.error = e.message;
        console.log(`HTTP Request Failed: ${e.message}`);
    }

    console.log(`\n--- STEP 3: RUNTIME OBSERVABILITY LOG FORENSICS ---`);
    // Attempt to fetch Railway logs for the last 5 minutes to see if prisma.fuse.findMany was logged
    let logs = safeExecute('railway logs --lines 100');
    if (logs) {
        report.runtime_log_evidence.logs_retrieved = true;
        const hasFuseLog = logs.includes('Fuse') || logs.includes('fuse.findMany');
        report.runtime_log_evidence.fuse_query_detected = hasFuseLog;
        if (hasFuseLog) {
            report.facts.push("Railway logs show execution of Fuse-related code during the request window.");
            console.log("Fuse query DETECTED in Railway logs.");
        } else {
            report.facts.push("Railway logs DO NOT show explicit execution of prisma.fuse.findMany.");
            console.log("Fuse query NOT DETECTED in Railway logs.");
        }
    } else {
        report.runtime_log_evidence.logs_retrieved = false;
        report.unknowns.push("Unable to retrieve runtime logs via Railway CLI to verify DB queries.");
        console.log("Could not retrieve Railway logs (maybe CLI not linked to service correctly).");
    }

    console.log(`\n--- STEP 4: ANALYSIS AND CONCLUSIONS ---`);
    
    // Evaluate PRODUCTION_RUNTIME_SEARCH_TO_FUSE
    if (report.http_request_evidence.status === 200 && report.runtime_log_evidence.fuse_query_detected) {
        report.conclusions.PRODUCTION_RUNTIME_SEARCH_TO_FUSE = "PROVEN";
    } else if (report.http_request_evidence.status === 200 && !report.runtime_log_evidence.logs_retrieved) {
        report.conclusions.PRODUCTION_RUNTIME_SEARCH_TO_FUSE = "UNKNOWN";
        report.unknowns.push("HTTP 200 OK received, but lack of Prisma query logs means we CANNOT PROVE the DB was actually queried for Fuse during this request.");
    } else {
        report.conclusions.PRODUCTION_RUNTIME_SEARCH_TO_FUSE = "UNKNOWN";
    }

    report.conclusions.SEARCH_ENGINE_DEPENDS_ON_FUSE = "UNKNOWN"; // We know source code calls it, but is it a hard dependency in production?
    report.conclusions.PRODUCTION_FUSE_DATASET_REQUIRED = "UNKNOWN";

    report.contradictions = [
        { ID: "C_RUNTIME", STATUS: "UNRESOLVED", EVIDENCE: "We see the code, we can hit the endpoint, but we lack absolute observability proof that production runtime queried Fuse." }
    ];

    saveReport(report);
}

function saveReport(report) {
    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-5-runtime-forensic.json'), JSON.stringify(report, null, 2));
    
    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# FACTS
${report.facts.map(f => '- ' + f).join('\\n')}

# INFERENCES
None. Strict evidence-only protocol active.

# UNKNOWNS
${report.unknowns.map(f => '- ' + f).join('\\n')}
- Is Fuse actually queried during the production HTTP request? (Logs insufficient/unavailable)
- Is the 1.23M dataset the intended production target for this endpoint?

# CONCLUSIONS
1. PRODUCTION_RUNTIME_SEARCH_TO_FUSE: **${report.conclusions.PRODUCTION_RUNTIME_SEARCH_TO_FUSE}**
2. SEARCH_ENGINE_DEPENDS_ON_FUSE: **${report.conclusions.SEARCH_ENGINE_DEPENDS_ON_FUSE}** (Source code yes, runtime unproven)
3. PRODUCTION_FUSE_DATASET_REQUIRED: **${report.conclusions.PRODUCTION_FUSE_DATASET_REQUIRED}**

# MIGRATION AUTHORIZATION
DATA_IMPORT_AUTHORIZED = NO
P0.4.20_INDEX_MIGRATION_AUTHORIZED = NO
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-5-runtime-forensic.md'), md);
    console.log(md);
}

run().catch(console.error);
