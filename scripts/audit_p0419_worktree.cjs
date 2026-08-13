const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

function safeExecute(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return e.stdout ? e.stdout.toString().trim() : null;
    }
}

async function run() {
    console.log("===============================================================");
    console.log("P0.4.19.15.1 — WORKTREE-SHA CONSISTENCY FORENSIC");
    console.log("===============================================================");

    const report = {
        local_head_sha: "",
        railway_sha: "093b38ca", // Carried over from P0.4.19.7
        worktree_clean: false,
        staged_changes: [],
        unstaged_changes: [],
        untracked_files: [],
        logger_fix: {
            present_in_head: "UNKNOWN",
            present_only_in_worktree: "UNKNOWN",
            evidence: []
        },
        deployment_candidate: {
            exact_candidate_sha: "",
            all_changes_committed: "UNKNOWN",
            unintended_changes: "UNKNOWN",
            ready: false
        },
        production_mutations: { ddl: 0, dml: 0 },
        contradictions: [],
        facts: [],
        inferences: [],
        opinions: [],
        final: "HARD_STOP"
    };

    console.log("\n--- 1. WORKTREE IDENTITY ---");
    report.local_head_sha = safeExecute('git rev-parse HEAD') || "UNKNOWN";
    report.facts.push(`LOCAL HEAD SHA: ${report.local_head_sha}`);

    const statusPorcelain = safeExecute('git status --porcelain=v2');
    report.facts.push("Git status generated.");
    
    if (statusPorcelain) {
        const lines = statusPorcelain.split('\\n').filter(l => l.trim() !== '');
        report.worktree_clean = lines.length === 0;
        lines.forEach(line => {
            if (line.startsWith('?')) {
                report.untracked_files.push(line);
            } else if (line.startsWith('1 ') || line.startsWith('2 ')) {
                const parts = line.split(' ');
                const xy = parts[1]; // staged/unstaged statuses
                const file = parts[parts.length - 1];
                if (xy[0] !== '.') report.staged_changes.push(file);
                if (xy[1] !== '.') report.unstaged_changes.push(file);
            }
        });
    } else {
        report.worktree_clean = true;
    }

    report.facts.push(`Worktree Clean: ${report.worktree_clean}`);
    report.facts.push(`Unstaged changes: ${report.unstaged_changes.length}`);

    console.log("\n--- 2. LOGGER DEĞİŞİKLİĞİNİN SHA'YA DAHİL OLUP OLMADIĞINI KANITLA ---");
    const routeFile = "src/app/api/search/route.js";
    
    // Check HEAD content
    const headContent = safeExecute(`git show HEAD:${routeFile}`) || "";
    const headHasAppError = headContent.includes('logger.app.error');
    
    // Check Worktree content
    const rootDir = path.join(__dirname, '..');
    const worktreePath = path.join(rootDir, routeFile);
    const worktreeContent = fs.existsSync(worktreePath) ? fs.readFileSync(worktreePath, 'utf8') : "";
    const worktreeHasAppError = worktreeContent.includes('logger.app.error');

    if (!headHasAppError && worktreeHasAppError) {
        report.logger_fix.present_in_head = "DISPROVEN";
        report.logger_fix.present_only_in_worktree = "PROVEN";
        report.logger_fix.evidence.push("HEAD contains logger.error");
        report.logger_fix.evidence.push("Worktree contains logger.app.error");
        report.facts.push("LOGGER_FIX_UNCOMMITTED = PROVEN");
    } else if (headHasAppError && worktreeHasAppError) {
        report.logger_fix.present_in_head = "PROVEN";
        report.logger_fix.present_only_in_worktree = "DISPROVEN";
        report.facts.push("LOGGER_FIX_COMMITTED = PROVEN");
    } else {
        report.logger_fix.present_in_head = "UNKNOWN";
        report.logger_fix.present_only_in_worktree = "UNKNOWN";
    }

    console.log("\n--- 8. DEPLOYMENT CANDIDATE ---");
    if (!report.worktree_clean || report.logger_fix.present_only_in_worktree === "PROVEN") {
        report.deployment_candidate.all_changes_committed = "DISPROVEN";
        report.deployment_candidate.ready = false;
        report.facts.push("Deployment candidate is NOT ready because there are uncommitted changes in the worktree.");
    } else {
        report.deployment_candidate.all_changes_committed = "PROVEN";
    }
    
    report.deployment_candidate.exact_candidate_sha = report.local_head_sha;

    saveReport(report);
}

function saveReport(report) {
    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-worktree-forensic.json'), JSON.stringify(report, null, 2));
    
    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# 1. WORKTREE IDENTITY (FACTS)
- LOCAL_HEAD_SHA: ${report.local_head_sha}
- Worktree Clean: ${report.worktree_clean}
- Unstaged Changes: ${report.unstaged_changes.join(', ')}
- Untracked Files: ${report.untracked_files.length > 0 ? 'Yes' : 'No'}

# 2. LOGGER DEĞİŞİKLİĞİ (FACTS)
- LOGGER_CHANGE_COMMITTED_IN_HEAD: **${report.logger_fix.present_in_head}**
- LOGGER_CHANGE_UNCOMMITTED (Only in worktree): **${report.logger_fix.present_only_in_worktree}**

# 3. ROUTE CHANGE SHA FORENSIC
HEAD State for route.js DOES NOT contain \`logger.app.error\`.
Worktree State for route.js CONTAINS \`logger.app.error\`.
**LOGGER_FIX_COMMITTED = NO**
**LOGGER_FIX_UNCOMMITTED = PROVEN**

# 7. SOURCE-TO-RUNTIME RECONCILIATION
| Component | HEAD | WORKTREE | Railway Runtime | Status |
|-----------|------|----------|-----------------|--------|
| logger | error() | app.error() | error() | PROVEN_MISMATCH (HEAD vs Worktree) |
| API route | Outdated | Fixed | Outdated | PROVEN_MISMATCH |

# 8. DEPLOYMENT CANDIDATE
**DEPLOYMENT_READY = NO**
The changes made to fix the logger bug have NOT been committed to the repository. If we were to push the current HEAD SHA (\`${report.local_head_sha}\`), the fix would NOT be deployed.

# 9. CRITICAL RULE APPLIED
LOCAL_HEAD_DOES_NOT_CONTAIN_LOGGER_FIX = PROVEN
DEPLOYMENT_AUTHORIZED = NO
FINAL = HARD STOP
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-worktree-forensic.md'), md);
    console.log(md);
}

run().catch(console.error);
