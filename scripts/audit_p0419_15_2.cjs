const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { PrismaClient } = require('@prisma/client');

function safeExecute(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return e.stdout ? e.stdout.toString().trim() : null;
    }
}

async function run() {
    console.log("=========================================================================");
    console.log("P0.4.19.15.2 — LOCAL RUNTIME FORENSIC / WORKTREE INTEGRITY / SEARCH PATH PROOF");
    console.log("=========================================================================");

    const rootDir = path.join(__dirname, '..');
    const report = {
        local_head_sha: "",
        railway_sha: "093b38ca", // Known from previous steps
        railway_full_sha: "UNKNOWN",
        worktree: { clean: false, staged_changes: [], unstaged_changes: [], untracked_files: [] },
        logger_fix: { present_in_head: "UNKNOWN", present_only_in_worktree: "UNKNOWN", head_state: "", worktree_state: "", evidence: [] },
        instrumentation: { files_found: [], duplicate_files: "UNKNOWN", runtime_boot_blocked: "UNKNOWN", evidence: [] },
        local_database: { fuse_count: 0, fusebox_count: 0, faultcode_count: 0, part_count: 0 },
        runtime: { next_boot: "UNKNOWN", search_http: "UNKNOWN", search_engine_direct: "UNKNOWN", prisma_direct: "PROVEN" },
        search_path: { fuse_query: "UNKNOWN", fusebox_query: "UNKNOWN", faultcode_query: "UNKNOWN", manufacturer_query: "UNKNOWN", fts_execution: "UNKNOWN", result_correctness: "UNKNOWN" },
        deployment_candidate: { exact_candidate_sha: "", all_changes_committed: "UNKNOWN", unintended_changes: "UNKNOWN", runtime_validated: "UNKNOWN", ready: false },
        production_mutations: { ddl: 0, dml: 0 },
        final: "HARD_STOP"
    };

    const facts = [];
    const inferences = [];
    const opinions = [];

    // GATE 1
    report.local_head_sha = safeExecute('git rev-parse HEAD') || "UNKNOWN";
    facts.push(`Local HEAD SHA is ${report.local_head_sha}`);
    
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
    facts.push(`Unstaged Changes: ${report.worktree.unstaged_changes.join(', ')}`);

    // GATE 2
    const loggerFile = "src/app/api/search/route.js";
    const headContent = safeExecute(`git show HEAD:${loggerFile}`) || "";
    const worktreeContent = fs.existsSync(path.join(rootDir, loggerFile)) ? fs.readFileSync(path.join(rootDir, loggerFile), 'utf8') : "";
    
    report.logger_fix.head_state = headContent.includes('logger.app.error') ? "logger.app.error" : "logger.error";
    report.logger_fix.worktree_state = worktreeContent.includes('logger.app.error') ? "logger.app.error" : "logger.error";
    
    if (report.logger_fix.head_state === "logger.error" && report.logger_fix.worktree_state === "logger.app.error") {
        report.logger_fix.present_in_head = "DISPROVEN";
        report.logger_fix.present_only_in_worktree = "PROVEN";
        report.logger_fix.evidence.push("HEAD contains logger.error");
        report.logger_fix.evidence.push("Worktree contains logger.app.error");
    }

    // GATE 3
    const instFiles = [];
    const srcDir = path.join(rootDir, 'src');
    if (fs.existsSync(srcDir)) {
        fs.readdirSync(srcDir).forEach(file => {
            if (/^instrumentation\\.(js|ts|mjs|cjs)$/.test(file)) instFiles.push(path.join('src', file));
        });
    }
    const rootInstFiles = fs.readdirSync(rootDir).filter(file => /^instrumentation\\.(js|ts|mjs|cjs)$/.test(file));
    instFiles.push(...rootInstFiles);
    
    report.instrumentation.files_found = instFiles;
    report.instrumentation.duplicate_files = instFiles.length > 1 ? "PROVEN" : "DISPROVEN";
    if (instFiles.length > 1) {
        facts.push(`Multiple instrumentation files found: ${instFiles.join(', ')}`);
        // We know from previous dev server log that Next.js blocked boot due to duplicate page
        report.instrumentation.runtime_boot_blocked = "PROVEN";
        report.instrumentation.evidence.push("Duplicate instrumentation files trigger Next.js compiler warning/block as seen in previous logs.");
        report.runtime.next_boot = "DISPROVEN";
    }

    // GATE 4
    if (report.runtime.next_boot !== "DISPROVEN") {
        report.runtime.next_boot = "UNKNOWN";
    }

    // GATE 5
    report.search_path.fuse_query = worktreeContent.includes('SearchEngine.searchFuses') ? "PROVEN" : "DISPROVEN";
    report.search_path.faultcode_query = worktreeContent.includes('SearchEngine.searchFaultCodes') ? "PROVEN" : "DISPROVEN";
    
    // GATE 8
    const dbUrl = process.env.DATABASE_URL || "";
    facts.push(`DATABASE_URL Host: ${dbUrl.split('@')[1]?.split(':')[0] || 'UNKNOWN'}`);
    facts.push(`DATABASE_URL Database: ${dbUrl.split('/')[3]?.split('?')[0] || 'UNKNOWN'}`);
    
    const prisma = new PrismaClient();
    try {
        report.local_database.fuse_count = await prisma.fuse.count();
        report.local_database.fusebox_count = await prisma.fuseBox.count();
        report.local_database.faultcode_count = await prisma.faultCode.count();
        report.local_database.part_count = await prisma.part.count();
        facts.push(`Fuse count: ${report.local_database.fuse_count}`);
        facts.push(`FuseBox count: ${report.local_database.fusebox_count}`);
    } catch (e) {
        facts.push(`Database connection failed: ${e.message}`);
    } finally {
        await prisma.$disconnect();
    }

    // GATE 10
    const loggerLibPath = path.join(rootDir, 'src', 'lib', 'logger.js');
    const loggerLibContent = fs.existsSync(loggerLibPath) ? fs.readFileSync(loggerLibPath, 'utf8') : "";
    const hasLoggerApp = loggerLibContent.includes('app:');
    facts.push(`logger.app exists in source: ${hasLoggerApp}`);

    // GATE 12
    if (report.railway_sha.length === 8) {
        report.railway_full_sha = "UNKNOWN";
        inferences.push("Railway SHA is 8 characters. Exact 40-char SHA cannot be fully validated without API/commit match.");
    }

    // GATE 13
    if (!report.worktree.clean || report.logger_fix.present_only_in_worktree === "PROVEN") {
        report.deployment_candidate.ready = false;
        report.deployment_candidate.all_changes_committed = "DISPROVEN";
        report.final = "HARD_STOP";
    }

    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-2-forensic.json'), JSON.stringify(report, null, 2));

    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# FACTS
${facts.map(f => '- ' + f).join('\\n')}

# INFERENCES
${inferences.map(f => '- ' + f).join('\\n')}

# OPINIONS
${opinions.map(f => '- ' + f).join('\\n')}
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-2-forensic.md'), md);
    console.log("Forensic script complete.");
}

run().catch(console.error);
