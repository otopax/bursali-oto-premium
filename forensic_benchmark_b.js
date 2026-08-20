const http = require('http');

async function measure(url, label) {
  const start = process.hrtime.bigint();
  return new Promise((resolve) => {
    http.get(url, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        const end = process.hrtime.bigint();
        const duration = Number(end - start) / 1e6;
        console.log(`[${label}] Status: ${res.statusCode} | Time: ${duration.toFixed(2)}ms`);
        resolve(duration);
      });
    }).on('error', (err) => {
      console.log(`[${label}] Error: ${err.message}`);
      resolve(0);
    });
  });
}

async function run() {
  console.log('--- WARMING UP ---');
  await measure('http://127.0.0.1:3005/tr', 'WARMUP /tr');
  await measure('http://127.0.0.1:3005/tr/ariza-kodlari/P0300', 'WARMUP /P0300');
  
  console.log('\n--- TEST B (RATE LIMIT BYPASS) BENCHMARK ---');
  await measure('http://127.0.0.1:3005/tr', 'ROOT /tr');
  await measure('http://127.0.0.1:3005/tr/ariza-kodlari/P0300', 'P0300');
  await measure('http://127.0.0.1:3005/tr/ariza-cozumleri', 'ARIZA-COZUMLERI');
}

run();
