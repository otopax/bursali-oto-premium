const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const fs = require('fs');
const path = require('path');

async function run() {
    console.log("===============================================================");
    console.log("P0.4.19.12 — LOCAL REGRESSION FORENSIC (PRISMA DIRECT)");
    console.log("===============================================================");

    const queries = ["radio", "fuel pump", "pump relay", "zzzz_nonexistent_123456", "radyo", "fren", "silecek", "yakıt", "pompa"];
    const results = [];

    for (const q of queries) {
        console.log(`Testing query: "${q}"`);
        const start = Date.now();
        const formattedQuery = q.trim().split(/\\s+/).join(' | ');
        
        try {
            const fuses = await prisma.fuse.findMany({
                where: {
                    OR: [
                        { description: { search: formattedQuery } },
                        { type: { search: formattedQuery } }
                    ]
                },
                take: 20
            });
            
            const faults = await prisma.faultCode.findMany({
                where: {
                    OR: [
                        { description: { search: formattedQuery } },
                        { code: { search: formattedQuery } }
                    ]
                },
                take: 20
            });
            
            results.push({
                query: q,
                status: 200,
                latency_ms: Date.now() - start,
                fuseCount: fuses.length,
                faultCount: faults.length,
                error: null
            });
        } catch (e) {
            results.push({
                query: q,
                status: 500,
                latency_ms: Date.now() - start,
                fuseCount: 0,
                faultCount: 0,
                error: e.message
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

# LOCAL REGRESSION RESULTS (PRISMA DIRECT INVOCATION)
${results.map(r => `- **Query:** "${r.query}" | **Status:** ${r.status} | **Latency:** ${r.latency_ms}ms | **Fuses:** ${r.fuseCount} | **Faults:** ${r.faultCount} ${r.error ? '| **Error:** ' + r.error : ''}`).join('\\n')}

# ANALYSIS
- Status 200 indicates the Prisma code executes correctly without throwing exceptions.
- The results confirm if full-text search syntax (\`@@\`) is valid in this local PostgreSQL environment.
    `;
    fs.writeFileSync(path.join(evidenceDir, 'p04-19-12-local-regression.md'), md);
    console.log(md);
}

run().catch(console.error).finally(() => prisma.$disconnect());
