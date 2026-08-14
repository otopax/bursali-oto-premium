const path = require('path');
const moduleAlias = require('module-alias');
moduleAlias.addAlias('@', path.join(__dirname, 'src'));

const { SearchEngine } = require('./src/domains/Search/SearchEngine.js');

async function validate() {
  const terms = ['radyo', 'motor', 'amf', 'fren', 'zzzzz_nonexistent'];
  for (const term of terms) {
    const start = Date.now();
    const results = await SearchEngine.searchFuses(term, 20);
    const ms = Date.now() - start;
    console.log([Validation] Term:  | Time:  ms | Results: );
  }

  // Check determinism for 'motor'
  console.log(\n--- Determinism Test ---);
  const motor1 = await SearchEngine.searchFuses('motor', 20);
  const motor2 = await SearchEngine.searchFuses('motor', 20);
  
  const ids1 = motor1.map(r => r.id).join(',');
  const ids2 = motor2.map(r => r.id).join(',');
  console.log(Run 1 IDs: );
  console.log(Run 2 IDs: );
  console.log(Match: );
}
validate().catch(console.error).finally(() => process.exit(0));
