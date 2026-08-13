const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function safeExecute(cmd) {
    try {
        return execSync(cmd, { stdio: 'pipe' }).toString().trim();
    } catch (e) {
        return null;
    }
}

async function run() {
    console.log("=========================================================================");
    console.log("P0.4.19.15.4 — PDF E2E WORKTREE DELTA FORENSIC");
    console.log("=========================================================================");

    const rootDir = path.join(__dirname, '..');
    const targetFile = "tests/e2e/pdf.spec.js";
    
    const report = {
        file: targetFile,
        head_exists: "UNKNOWN",
        worktree_exists: "UNKNOWN",
        diff_present: "UNKNOWN",
        change: {
            nature: "UNKNOWN",
            production_source: "UNKNOWN",
            next_config: "UNKNOWN",
            package_dependencies: "UNKNOWN",
            environment: "UNKNOWN"
        },
        intent: "UNKNOWN",
        deployment_impact: "UNKNOWN",
        unintended_change: "UNKNOWN",
        evidence: [],
        final: "HARD_STOP"
    };

    const facts = [];
    const inferences = [];
    const opinions = [];

    // 2. HEAD VERSION
    const headContent = safeExecute(`git show HEAD:${targetFile}`);
    if (headContent !== null) {
        report.head_exists = "PROVEN";
        facts.push(`File ${targetFile} EXISTS in HEAD.`);
    } else {
        report.head_exists = "DISPROVEN";
        facts.push(`HEAD_FILE = ABSENT for ${targetFile}.`);
    }

    // 3. WORKTREE VERSION
    const worktreePath = path.join(rootDir, targetFile);
    let worktreeContent = null;
    if (fs.existsSync(worktreePath)) {
        worktreeContent = fs.readFileSync(worktreePath, 'utf8');
        report.worktree_exists = "PROVEN";
        facts.push(`File ${targetFile} EXISTS in worktree.`);
    } else {
        report.worktree_exists = "DISPROVEN";
        facts.push(`File ${targetFile} is ABSENT in worktree.`);
    }

    // 1. EXACT DIFF
    const rawDiff = safeExecute(`git diff -- ${targetFile}`) || "";
    if (rawDiff.length > 0) {
        report.diff_present = "PROVEN";
        report.evidence.push("Diff content retrieved successfully.");
        facts.push(`git diff reveals modifications in ${targetFile}.`);
    } else if (report.head_exists === "PROVEN" && report.worktree_exists === "PROVEN" && headContent !== worktreeContent) {
        report.diff_present = "PROVEN";
    } else {
        report.diff_present = "DISPROVEN";
    }

    // 4. CHANGE CLASSIFICATION
    if (report.diff_present === "PROVEN") {
        const isE2E = targetFile.includes('tests/e2e/');
        const isSpec = targetFile.endsWith('.spec.js');
        
        if (isE2E && isSpec) {
            report.change.nature = "TEST_ONLY";
            facts.push(`Change is strictly inside a test file (${targetFile}).`);
        } else {
            report.change.nature = "UNKNOWN";
        }
        
        report.change.production_source = "NO";
        report.change.next_config = "NO";
        report.change.package_dependencies = "NO";
        report.change.environment = "NO";
        
        facts.push("Change DOES NOT modify production source code.");
        facts.push("Change DOES NOT modify next.config.*.");
        facts.push("Change DOES NOT modify package dependencies.");
        facts.push("Change DOES NOT modify .env files.");
    }

    // 6. DEPLOYMENT IMPACT
    if (report.change.nature === "TEST_ONLY") {
        // Since Vercel/Railway default deployments do not run Playwright tests unless specifically configured, 
        // the impact on the production runtime is typically NONE, but we can't assume pipeline configuration completely.
        // The file itself won't be executed in production runtime.
        report.deployment_impact = "INDIRECT";
        inferences.push("Because the change is in an E2E test file, it does not directly mutate the Next.js production build output. Its impact is indirect (only affecting CI/CD pipelines if they run E2E tests).");
    }

    // 5. INTENT MUST NOT BE ASSUMED
    report.intent = "UNKNOWN";
    report.unintended_change = "UNKNOWN";
    facts.push("CHANGE_INTENT = UNKNOWN (Intent is not explicitly provided by the user).");
    facts.push("UNINTENDED_CHANGE = UNKNOWN (No explicit proof that this change was unwanted).");

    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-4-forensic.json'), JSON.stringify(report, null, 2));

    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# FACT
${facts.map(f => '- ' + f).join('\\n')}
- Raw Diff Snippet:
\`\`\`diff
${rawDiff.split('\\n').slice(0, 15).join('\\n')}
\`\`\`

# INFERENCE
${inferences.map(f => '- ' + f).join('\\n')}

# OPINION
- As the file \`${targetFile}\` is isolated to the E2E testing suite, its presence in a deployment candidate does not affect the production runtime artifact (the Next.js standalone build). However, for absolute forensic cleanliness, you may choose to either stash this file or commit it separately before dealing with the critical logger fix.
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-15-4-forensic.md'), md);
    console.log("Forensic script complete.");
}

run().catch(console.error);
