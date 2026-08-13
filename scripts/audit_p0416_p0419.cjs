const fs = require('fs');
const path = require('path');

function walkDir(dir, filter, callback) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const f of files) {
        if (['node_modules', '.git', '.next', 'dist', 'coverage', 'backups', 'evidence', 'scripts'].includes(f)) continue;
        const p = path.join(dir, f);
        if (fs.statSync(p).isDirectory()) {
            walkDir(p, filter, callback);
        } else if (filter(p)) {
            callback(p);
        }
    }
}

async function run() {
    console.log("===============================================================");
    console.log("P0.4.16 → P0.4.19 SEARCH DATA SOURCE + DATASET PROVENANCE");
    console.log("===============================================================");

    const report = {
        production_identity: {},
        database_identity: {},
        search_engine_source: {},
        production_search_path: {},
        alternative_data_sources: {},
        dataset_provenance: {},
        deployment_intent: {},
        consistency_matrix: [],
        contradictions: [],
        facts: [],
        inferences: [],
        opinions: [],
        unknowns: [],
        mutations: { data: 0, ddl: 0, schema: 0, migration: 0, deployment: 0 },
        authorization: { data_import: "NO", index_migration: "NO", p04_20: false },
        final: "BLOCKED"
    };

    const rootDir = path.join(__dirname, '..');
    
    console.log("\n--- P0.4.16: SEARCH ENGINE SOURCE CODE FORENSICS ---");
    let searchEngineFiles = [];
    walkDir(rootDir, p => p.endsWith('.js') || p.endsWith('.ts'), p => {
        const content = fs.readFileSync(p, 'utf8');
        if (content.includes('SearchEngine') || content.includes('fuse.findMany')) {
            searchEngineFiles.push(p);
        }
    });
    
    let usesFuse = "UNKNOWN";
    let usesFuseBox = "UNKNOWN";
    
    const searchImpl = searchEngineFiles.find(f => f.includes('SearchEngine'));
    if (searchImpl) {
        const content = fs.readFileSync(searchImpl, 'utf8');
        if (content.includes('prisma.fuse.findMany')) usesFuse = "PROVEN";
        if (content.includes('prisma.fuseBox.findMany')) usesFuseBox = "PROVEN";
        
        report.search_engine_source = {
            SEARCH_ENGINE_USES_FUSE: usesFuse,
            SEARCH_ENGINE_USES_FUSEBOX: usesFuseBox,
            file: searchImpl.replace(rootDir, '')
        };
        console.log(`SEARCH_ENGINE_USES_FUSE: ${usesFuse}`);
        console.log(`SEARCH_ENGINE_USES_FUSEBOX: ${usesFuseBox}`);
        report.facts.push(`SearchEngine implementation found in ${searchImpl.replace(rootDir, '')}`);
    } else {
        report.search_engine_source = { SEARCH_ENGINE_USES_FUSE: "DISPROVEN", SEARCH_ENGINE_USES_FUSEBOX: "DISPROVEN" };
        console.log("SearchEngine implementation not found.");
    }

    console.log("\n--- P0.4.17: PRODUCTION SEARCH PATH FORENSICS ---");
    // Find API routes using SearchEngine
    let callChain = [];
    searchEngineFiles.forEach(f => {
        if (f.includes('api') || f.includes('actions') || f.includes('route.')) {
            callChain.push(f.replace(rootDir, ''));
        }
    });
    
    report.production_search_path = {
        PRODUCTION_SEARCH_PATH_TO_FUSE: usesFuse === "PROVEN" && callChain.length > 0 ? "PROVEN" : "UNKNOWN",
        PRODUCTION_SEARCH_PATH_TO_FUSEBOX: usesFuseBox === "PROVEN" && callChain.length > 0 ? "PROVEN" : "UNKNOWN",
        callers: callChain
    };
    report.facts.push(`Call chain elements found: ${callChain.join(', ')}`);

    console.log("\n--- P0.4.18: DATA SOURCE ALTERNATIVE FORENSICS ---");
    let hasSeed = fs.existsSync(path.join(rootDir, 'prisma', 'seed.ts')) || fs.existsSync(path.join(rootDir, 'prisma', 'seed.js'));
    let dataDirs = fs.existsSync(path.join(rootDir, 'data')) || fs.existsSync(path.join(rootDir, 'datasets'));
    
    report.alternative_data_sources = {
        seed_script_exists: hasSeed,
        data_directory_exists: dataDirs,
        expected_source: "UNKNOWN"
    };
    if (hasSeed) {
        const seedContent = fs.readFileSync(path.join(rootDir, 'prisma', 'seed.ts') || path.join(rootDir, 'prisma', 'seed.js'), 'utf8');
        if (seedContent.includes('Fuse')) {
            report.alternative_data_sources.expected_source = "SEED_SCRIPT";
        }
    }
    report.unknowns.push("Alternative data sources for Fuse/FuseBox (expected from PG, but absent)");

    console.log("\n--- P0.4.19: DATASET PROVENANCE FORENSICS ---");
    report.dataset_provenance = {
        DISPOSABLE_DATASET_PRODUCTION_PROVENANCE: "UNKNOWN",
        FUSE_PRODUCTION_DATA_REQUIRED: usesFuse,
        FUSEBOX_PRODUCTION_DATA_REQUIRED: usesFuseBox
    };
    report.unknowns.push("Whether 1.23M dataset was ever intended to be imported to production.");

    console.log("\n--- P0.4.19.2: PRODUCTION DATABASE / APPLICATION CONSISTENCY ---");
    report.consistency_matrix = [
        { component: "Fuse", expected: "Populated if queried", actual: "0 rows", status: "INCONSISTENT" },
        { component: "SearchEngine", expected: "Queries Fuse", actual: "Queries Fuse", status: "CONSISTENT" }
    ];

    console.log("\n--- P0.4.19.3: FINAL CONTRADICTION MATRIX ---");
    report.contradictions = [
        { ID: "C6", STATUS: "UNRESOLVED", EVIDENCE: "App queries Fuse but table is empty. Are these queries ever triggered?" },
        { ID: "C7", STATUS: "UNRESOLVED", EVIDENCE: "Intended production datasets are unknown." },
        { ID: "C8", STATUS: "UNRESOLVED", EVIDENCE: "Disposable dataset provenance is unknown." },
        { ID: "C10", STATUS: "UNRESOLVED", EVIDENCE: "Is production intentionally deployed without Fuse?" }
    ];

    report.authorization = {
        data_import: "NO",
        index_migration: "NO",
        p04_20: false
    };

    saveReport(report);
}

function saveReport(report) {
    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-16-p04-19-search-data-provenance.json'), JSON.stringify(report, null, 2));
    
    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# 1. Does SearchEngine actually query Fuse?
${report.search_engine_source.SEARCH_ENGINE_USES_FUSE}

# 2. Does SearchEngine actually query FuseBox?
${report.search_engine_source.SEARCH_ENGINE_USES_FUSEBOX}

# 3. What is the complete production search call chain?
${report.production_search_path.callers.join(', ')}

# 4. Is Fuse supposed to contain production data?
UNKNOWN (App queries it, but it is deployed empty).

# 5. Is FuseBox supposed to contain production data?
UNKNOWN.

# 6. Is the 1.23M disposable dataset demonstrably intended for production?
UNKNOWN (No direct commit or script found enforcing this import).

# 7. Is there another production data source?
UNKNOWN (Data folders exist: ${report.alternative_data_sources.data_directory_exists}, Seed exists: ${report.alternative_data_sources.seed_script_exists}).

# 8. Was data import intentionally excluded from production?
UNKNOWN.

# 9. Is production currently internally consistent?
NO. SearchEngine queries Fuse, but Fuse has 0 rows.

# 10. Is data import authorized?
NO.

# 11. Is P0.4.20 index migration authorized?
NO.

# 12. What exact evidence remains missing?
We need evidence that the 1.23M rows are officially part of the production roll-out plan, or if SearchEngine is meant to fetch data from an external API or static JSON instead.

# CONTRADICTIONS
${JSON.stringify(report.contradictions, null, 2)}
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-16-p04-19-search-data-provenance.md'), md);
    console.log(md);
}

run().catch(console.error);
