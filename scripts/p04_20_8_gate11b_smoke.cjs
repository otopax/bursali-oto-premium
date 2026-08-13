async function fetchSearch(term) {
  const res = await fetch(`https://bursaliotoservis.com/api/search?q=${encodeURIComponent(term)}&type=fuse`);
  const data = await res.json();
  return { status: res.status, data };
}

async function run() {
  console.log("=== GATE 11-B: POST-DEPLOY SMOKE TEST ===\n");
  const terms = ['ABS', 'motor', 'motors', 'radyo'];

  for (const term of terms) {
    const start = Date.now();
    try {
      const res = await fetchSearch(term);
      const latency = Date.now() - start;
      const count = res.data.results?.fuses?.count || 0;
      const timeMs = res.data.timeMs;
      
      console.log(`Query: ${term}`);
      console.log(`  HTTP Status: ${res.status}`);
      console.log(`  Count: ${count}`);
      console.log(`  Total Latency: ${latency}ms`);
      console.log(`  DB Time (from API): ${timeMs}ms`);
      if (res.status >= 500) {
         console.log(`  Error: ${JSON.stringify(res.data)}`);
      }
      console.log("------------------------");
    } catch(e) {
      console.log(`Query: ${term} - FAILED: ${e.message}`);
    }
  }
}

run();
