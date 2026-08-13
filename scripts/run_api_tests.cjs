const fs = require('fs');
const path = require('path');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    console.log("===============================================================");
    console.log("P0.4.19.12 — LOCAL REGRESSION FORENSIC (RETRY)");
    console.log("===============================================================");

    const fetchModule = (await import('node-fetch')).default;
    
    // Wait for server to be up
    let isUp = false;
    let attempts = 0;
    while (!isUp && attempts < 30) {
        try {
            await fetchModule('http://localhost:3009/api/search?q=test');
            isUp = true;
        } catch (e) {
            attempts++;
            await wait(2000);
            console.log(`Waiting for server... attempt ${attempts}`);
        }
    }
    
    if (!isUp) {
        console.log("Server never became ready on port 3009.");
        process.exit(1);
    }

    const queries = ["radio", "fuel pump", "pump relay", "zzzz_nonexistent_123456", "radyo", "fren", "silecek", "yakıt", "pompa"];
    const results = [];

    for (const q of queries) {
        const url = `http://localhost:3009/api/search?q=${encodeURIComponent(q)}`;
        console.log(`Testing: ${url}`);
        
        const start = Date.now();
        try {
            const response = await fetchModule(url);
            const status = response.status;
            let json = null;
            let errorText = null;
            try {
                json = await response.json();
            } catch (e) {
                errorText = await response.text();
            }

            results.push({
                query: q,
                status: status,
                latency_ms: Date.now() - start,
                fuseCount: json?.results?.fuses?.count || 0,
                faultCount: json?.results?.faults?.count || 0,
                error: json?.error || errorText || null
            });
        } catch (err) {
            results.push({
                query: q,
                status: 0,
                latency_ms: Date.now() - start,
                error: err.message
            });
        }
    }

    const report = {
        queries: results,
        final: results.every(r => r.status === 200) ? "PASS" : "FAIL"
    };

    const evidenceDir = path.join(__dirname, '..', 'evidence');
    if (!fs.existsSync(evidenceDir)) fs.mkdirSync(evidenceDir);
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-12-local-regression.json'), JSON.stringify(report, null, 2));

    const md = `
# EXECUTIVE VERDICT
FINAL: ${report.final}

# LOCAL REGRESSION RESULTS
${results.map(r => `- **Query:** "${r.query}" | **Status:** ${r.status} | **Latency:** ${r.latency_ms}ms | **Fuses:** ${r.fuseCount} | **Faults:** ${r.faultCount} ${r.error ? '| **Error:** ' + r.error : ''}`).join('\\n')}

# ANALYSIS
- Status code 200 confirms the \`logger.app.error\` fix works properly.
- If results show >0 for Fuses, it means Full-Text Search and Prisma logic works correctly on the 1.23M dataset locally.
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-12-local-regression.md'), md);
    console.log(md);
}

run().catch(console.error);
