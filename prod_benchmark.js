const http = require('https');
const { performance } = require('perf_hooks');

async function measure(url, label, index) {
  return new Promise((resolve) => {
    const start = performance.now();
    let ttfb = 0;
    
    const req = http.get(url, (res) => {
      ttfb = performance.now() - start;
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const total = performance.now() - start;
        console.log(`[${label} #${index}] Status: ${res.statusCode} | TTFB: ${ttfb.toFixed(2)}ms | Total: ${total.toFixed(2)}ms`);
        resolve({ ttfb, total, status: res.statusCode });
      });
    }).on('error', (err) => {
      console.log(`[${label} #${index}] Error: ${err.message}`);
      resolve({ ttfb: 0, total: 0, status: 0 });
    });
    
    // Set a timeout of 15 seconds
    req.setTimeout(15000, () => {
      req.destroy(new Error('Timeout'));
    });
  });
}

async function runSeq(url, label, count) {
  console.log(`\n--- Benchmarking ${label} (${count} iterations) ---`);
  const results = [];
  for (let i = 1; i <= count; i++) {
    const res = await measure(url, label, i);
    results.push(res);
    // short pause between requests
    await new Promise(r => setTimeout(r, 100));
  }
  
  const valid = results.filter(r => r.status === 200);
  if (valid.length === 0) {
    console.log(`All requests failed or returned non-200.`);
    return;
  }
  
  const avgTtfb = valid.reduce((acc, curr) => acc + curr.ttfb, 0) / valid.length;
  const avgTotal = valid.reduce((acc, curr) => acc + curr.total, 0) / valid.length;
  
  console.log(`\n[${label}] Summary over ${valid.length} successful requests:`);
  console.log(`Avg TTFB: ${avgTtfb.toFixed(2)}ms`);
  console.log(`Avg Total: ${avgTotal.toFixed(2)}ms`);
}

async function run() {
  console.log('GATE 5C.10 - PRODUCTION RUNTIME RE-DISCOVERY');
  console.log('Targeting: https://www.bursaliotoservis.com\n');
  
  // Warmup
  console.log('Warming up...');
  await measure('https://www.bursaliotoservis.com/tr', 'WARMUP /tr', 0);
  
  // Sequential tests
  await runSeq('https://www.bursaliotoservis.com/tr', '/tr', 10);
  await runSeq('https://www.bursaliotoservis.com/tr/ariza-kodlari/P0300', 'P0300', 10);
  await runSeq('https://www.bursaliotoservis.com/tr/hizmetler', '/hizmetler', 10);
  await runSeq('https://www.bursaliotoservis.com/tr/ariza-cozumleri', '/ariza-cozumleri', 10);
  
  console.log('\nTesting /api/v1/health ...');
  await measure('https://www.bursaliotoservis.com/api/v1/health', '/health', 1);
}

run();
