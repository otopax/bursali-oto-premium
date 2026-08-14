const { prisma } = require('../src/lib/prisma');
const { SearchEngine } = require('../src/domains/Search/SearchEngine.js');

async function validate() {
  const terms = ['radyo', 'motor', 'amf', 'fren', 'zzzzz_nonexistent'];
  for (const term of terms) {
    const start = Date.now();
    const results = await SearchEngine.searchFuses(term, 20);
    const ms = Date.now() - start;
    console.log(`[Validation] Term: ${term.padEnd(20)} | Time: ${ms} ms | Results: ${results.length}`);
  }

  // Check determinism for 'motor'
  console.log(`\n--- Determinism Test ---`);
  const motor1 = await SearchEngine.searchFuses('motor', 20);
  const motor2 = await SearchEngine.searchFuses('motor', 20);
  
  const ids1 = motor1.map(r => r.id).join(',');
  const ids2 = motor2.map(r => r.id).join(',');
  console.log(`Run 1 IDs: ${ids1}`);
  console.log(`Run 2 IDs: ${ids2}`);
  console.log(`Match: ${ids1 === ids2 ? 'YES' : 'NO'}`);
}
validate().catch(console.error).finally(() => process.exit(0));
