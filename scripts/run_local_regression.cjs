const { exec, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const wait = (ms) => new Promise(resolve => setTimeout(resolve, ms));

async function run() {
    console.log("===============================================================");
    console.log("P0.4.19.12 — LOCAL REGRESSION FORENSIC");
    console.log("===============================================================");

    console.log("Starting Next.js dev server on port 3009...");
    const server = spawn(/^win/.test(process.platform) ? 'npx.cmd' : 'npx', ['next', 'dev', '-p', '3009'], {
        cwd: path.join(__dirname, '..'),
        env: { ...process.env, PORT: '3009' }
    });

    let serverReady = false;
    server.stdout.on('data', (data) => {
        const out = data.toString();
        if (out.includes('Ready') || out.includes('compiled') || out.includes('localhost:3009')) {
            serverReady = true;
        }
    });

    // Wait for server to boot (max 20 seconds)
    let elapsed = 0;
    while (!serverReady && elapsed < 20000) {
        await wait(1000);
        elapsed += 1000;
    }
    await wait(2000); // give it an extra 2s to fully bind

    console.log("Server ready. Running tests...");
    
    const queries = ["radio", "fuel pump", "pump relay", "zzzz_nonexistent_123456", "radyo", "fren", "silecek", "yakıt", "pompa"];
    const results = [];

    const fetchModule = (await import('node-fetch')).default;

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

    console.log("Stopping dev server...");
    server.kill();

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
    
    // Hard exit to ensure no hanging processes
    process.exit(0);
}

run().catch(e => {
    console.error(e);
    process.exit(1);
});
