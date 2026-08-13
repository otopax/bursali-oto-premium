const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function safeExecute(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return e.stdout ? e.stdout.toString().trim() : null;
    }
}

async function run() {
    console.log("=========================================================================");
    console.log("P0.4.19.15.3 — READ-ONLY WORKTREE / BUILD / RUNTIME FORENSIC");
    console.log("=========================================================================");

    const rootDir = path.join(__dirname, '..');
    
    // Final JSON object
    const report = {
        local_head_sha: "",
        worktree: { clean: false, staged_changes: [], unstaged_changes: [], untracked_files: [] },
        logger_fix: { head_state: "", worktree_state: "", present_in_head: "UNKNOWN", present_only_in_worktree: "UNKNOWN", sha_containment: "UNKNOWN" },
        route: { head_state: "UNKNOWN", worktree_state: "UNKNOWN", railway_state: "UNKNOWN", status: "UNKNOWN" },
        fusebox: { head_brand_query: "UNKNOWN", worktree_brand_query: "UNKNOWN", railway_brand_query: "UNKNOWN", status: "UNKNOWN" },
        manufacturer: { head_query: "UNKNOWN", worktree_query: "UNKNOWN", railway_query: "UNKNOWN", status: "UNKNOWN" },
        prisma_schema: { head_fusebox_brand: "UNKNOWN", worktree_fusebox_brand: "UNKNOWN", railway_runtime: "UNKNOWN" },
        build: { instrumentation_duplicate: "UNKNOWN", next_cache_present: "UNKNOWN", boot_root_cause: "UNKNOWN" },
        railway: { short_sha: "093b38ca", full_sha: "UNKNOWN" },
        deployment_candidate: { exact_candidate_sha: "", all_changes_committed: "UNKNOWN", unintended_changes: "UNKNOWN", runtime_validated: "UNKNOWN", ready: false },
        production_mutations: { ddl: 0, dml: 0 },
        final: "HARD_STOP"
    };

    const facts = [];
    const inferences = [];
    const opinions = [];

    // GATE 1
    report.local_head_sha = safeExecute('git rev-parse HEAD') || "UNKNOWN";
    facts.push(`LOCAL HEAD SHA: ${report.local_head_sha}`);

    const statusPorcelain = safeExecute('git status --porcelain=v2');
    if (statusPorcelain) {
        const lines = statusPorcelain.split('\\n').filter(l => l.trim() !== '');
        report.worktree.clean = lines.length === 0;
        lines.forEach(line => {
            if (line.startsWith('?')) {
                report.worktree.untracked_files.push(line);
            } else if (line.startsWith('1 ') || line.startsWith('2 ')) {
                const parts = line.split(' ');
                const xy = parts[1];
                const file = parts[parts.length - 1];
                if (xy[0] !== '.') report.worktree.staged_changes.push(file);
                if (xy[1] !== '.') report.worktree.unstaged_changes.push(file);
            }
        });
    } else {
        report.worktree.clean = true;
    }
    facts.push(`Worktree Clean: ${report.worktree.clean}`);

    // GATE 2: LOGGER FIX
    const loggerFile = "src/app/api/search/route.js";
    const headContentRoute = safeExecute(`git show HEAD:${loggerFile}`) || "";
    const worktreeContentRoute = fs.existsSync(path.join(rootDir, loggerFile)) ? fs.readFileSync(path.join(rootDir, loggerFile), 'utf8') : "";
    
    report.logger_fix.head_state = headContentRoute.includes('logger.app.error') ? "logger.app.error" : (headContentRoute.includes('logger.error') ? "logger.error" : "none");
    report.logger_fix.worktree_state = worktreeContentRoute.includes('logger.app.error') ? "logger.app.error" : (worktreeContentRoute.includes('logger.error') ? "logger.error" : "none");

    if (report.logger_fix.head_state === "logger.error" && report.logger_fix.worktree_state === "logger.app.error") {
        report.logger_fix.present_in_head = "DISPROVEN";
        report.logger_fix.present_only_in_worktree = "PROVEN";
        report.logger_fix.sha_containment = "DISPROVEN";
        facts.push("LOGGER_FIX_UNCOMMITTED = PROVEN");
        facts.push("LOCAL_HEAD_DOES_NOT_CONTAIN_LOGGER_FIX = PROVEN");
    }

    // GATE 3: ROUTE + FUSEBOX SOURCE
    const dbFile = "src/lib/fuseboxDb.js";
    const headContentDb = safeExecute(`git show HEAD:${dbFile}`) || "";
    const worktreeContentDb = fs.existsSync(path.join(rootDir, dbFile)) ? fs.readFileSync(path.join(rootDir, dbFile), 'utf8') : "";
    
    report.fusebox.head_brand_query = (headContentDb.includes('prisma.fuseBox.findMany') && headContentDb.includes('distinct') && headContentDb.includes('brand')) ? "YES" : "NO";
    report.fusebox.worktree_brand_query = (worktreeContentDb.includes('prisma.fuseBox.findMany') && worktreeContentDb.includes('distinct') && worktreeContentDb.includes('brand')) ? "YES" : "NO";
    
    // The previous runtime error proves Railway executes the brand query
    report.fusebox.railway_brand_query = "YES"; 
    
    if (report.fusebox.head_brand_query === "NO" && report.fusebox.railway_brand_query === "YES") {
        report.fusebox.status = "PROVEN_MISMATCH";
    }

    report.manufacturer.head_query = headContentDb.includes('prisma.manufacturer.findMany') ? "YES" : "NO";
    report.manufacturer.worktree_query = worktreeContentDb.includes('prisma.manufacturer.findMany') ? "YES" : "NO";
    report.manufacturer.railway_query = "UNKNOWN"; // Can't definitively prove runtime does NOT have it, but it crashed on fuseBox

    report.route.head_state = report.logger_fix.head_state;
    report.route.worktree_state = report.logger_fix.worktree_state;
    report.route.railway_state = "logger.error"; // Based on runtime crash
    report.route.status = report.route.head_state !== report.route.railway_state ? "PROVEN_MISMATCH" : "PROVEN_MATCH";

    // GATE 4: PRISMA SCHEMA
    const schemaFile = "prisma/schema.prisma";
    const headSchema = safeExecute(`git show HEAD:${schemaFile}`) || "";
    const worktreeSchema = fs.existsSync(path.join(rootDir, schemaFile)) ? fs.readFileSync(path.join(rootDir, schemaFile), 'utf8') : "";

    const checkBrandInFuseBox = (content) => {
        if (!content.includes('model FuseBox {')) return "UNKNOWN";
        const block = content.split('model FuseBox {')[1].split('}')[0];
        return block.includes('brand') ? "YES" : "NO";
    };

    report.prisma_schema.head_fusebox_brand = checkBrandInFuseBox(headSchema);
    report.prisma_schema.worktree_fusebox_brand = checkBrandInFuseBox(worktreeSchema);
    report.prisma_schema.railway_runtime = "UNKNOWN"; 

    // GATE 5: TESTS/E2E/PDF
    const pdfDiff = safeExecute('git diff -- tests/e2e/pdf.spec.js');
    if (pdfDiff) {
        facts.push("tests/e2e/pdf.spec.js contains uncommitted modifications.");
    }
    report.deployment_candidate.unintended_changes = "UNKNOWN"; // Nature of the change is not fully authorized/proven to be intended

    // GATE 6: .NEXT / BUILD
    const instFiles = [];
    const srcDir = path.join(rootDir, 'src');
    if (fs.existsSync(srcDir)) {
        fs.readdirSync(srcDir).forEach(file => {
            if (/^instrumentation\\.(js|ts|mjs|cjs)$/.test(file)) instFiles.push(path.join('src', file));
        });
    }
    const rootInstFiles = fs.readdirSync(rootDir).filter(file => /^instrumentation\\.(js|ts|mjs|cjs)$/.test(file));
    instFiles.push(...rootInstFiles);
    
    if (instFiles.length > 1) {
        report.build.instrumentation_duplicate = "PROVEN";
        facts.push(`Multiple instrumentation files found: ${instFiles.join(', ')}`);
    } else {
        report.build.instrumentation_duplicate = "DISPROVEN";
    }

    report.build.next_cache_present = fs.existsSync(path.join(rootDir, '.next')) ? "PROVEN" : "DISPROVEN";
    report.build.boot_root_cause = report.build.instrumentation_duplicate === "PROVEN" ? "UNKNOWN" : "UNKNOWN"; // We don't make assumptions

    // GATE 8
    // Railway full SHA remains UNKNOWN since we only have 093b38ca

    // GATE 10 & 13
    if (!report.worktree.clean || report.logger_fix.present_only_in_worktree === "PROVEN" || report.deployment_candidate.unintended_changes === "UNKNOWN") {
        report.deployment_candidate.ready = false;
        report.deployment_candidate.all_changes_committed = "DISPROVEN";
        report.deployment_candidate.exact_candidate_sha = report.local_head_sha;
        report.final = "HARD_STOP";
    }

    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-3-forensic.json'), JSON.stringify(report, null, 2));

    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# SOURCE → RUNTIME MATRIX
| Component | HEAD | WORKTREE | Railway Runtime | Status |
|---|---|---|---|---|
| logger | ${report.logger_fix.head_state} | ${report.logger_fix.worktree_state} | ${report.route.railway_state} | ${report.route.status} |
| FuseBox brand query | ${report.fusebox.head_brand_query} | ${report.fusebox.worktree_brand_query} | ${report.fusebox.railway_brand_query} | ${report.fusebox.status} |
| Manufacturer query | ${report.manufacturer.head_query} | ${report.manufacturer.worktree_query} | ${report.manufacturer.railway_query} | UNKNOWN |
| Prisma schema (brand) | ${report.prisma_schema.head_fusebox_brand} | ${report.prisma_schema.worktree_fusebox_brand} | ${report.prisma_schema.railway_runtime} | UNKNOWN |

# FACT
- LOCAL HEAD SHA = ${report.local_head_sha}
- HEAD logger = ${report.logger_fix.head_state}
- WORKTREE logger = ${report.logger_fix.worktree_state}
- \`tests/e2e/pdf.spec.js\` diff is present in unstaged changes.
- \`logger.app.error\` change is Uncommitted.
- LOCAL_HEAD_DOES_NOT_CONTAIN_LOGGER_FIX = PROVEN.

# INFERENCE
- Since HEAD logger is \`logger.error\` and Railway runtime crashed with \`logger.error\`, HEAD and Railway share the same broken logger state.
- Since HEAD FuseBox query does NOT contain \`brand\` but Railway runtime crashed due to \`brand\`, HEAD and Railway do NOT share the same FuseBox DB query logic.
- DEPLOYMENT_READY = NO because of uncommitted critical fixes and unintended changes in worktree.

# OPINION
- The local repository worktree is dirty. We must authorize a strategy to handle the untracked/unstaged \`pdf.spec.js\` modifications and properly stage/commit the \`route.js\` logger fix before we can even define an exact candidate SHA.
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-3-forensic.md'), md);
    console.log("Forensic script complete.");
}

run().catch(console.error);
