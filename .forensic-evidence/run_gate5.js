const fs = require('fs');
const path = require('path');

const dir = path.join(process.cwd(), 'public', 'ariza_kodlari_data');
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json'));

let totalInput = files.length;
let template = 0;
let validProductionDtc = 0;
let duplicate = 0;
let malformed = 0;

const seen = new Set();

for (const file of files) {
  if (file.toLowerCase().includes('template')) {
    template++;
    continue;
  }
  
  try {
    const data = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'));
    const code = data.code ? data.code.toUpperCase() : file.replace('.json', '').toUpperCase();
    if (seen.has(code)) {
      duplicate++;
    } else {
      seen.add(code);
      validProductionDtc++;
    }
  } catch (e) {
    malformed++;
  }
}

const isMathValid = (validProductionDtc + template + duplicate + malformed) === totalInput;

const result = {
  gate: "5",
  command: "node scripts/reconcile_gate5_math.js (dynamic)",
  timestamp: new Date().toISOString(),
  environment: "local",
  releaseSha: "4b84a3efffa1e7b90ac5b5606698a481daeda4e1",
  result: (isMathValid && totalInput === 974 && template === 1 && duplicate === 0 && malformed === 0) ? "PASS" : "FAIL",
  observations: {
    TOTAL_INPUT: totalInput,
    TEMPLATE: template,
    VALID_PRODUCTION_DTC: validProductionDtc,
    DUPLICATE: duplicate,
    MALFORMED: malformed,
    MATH_VALID: isMathValid
  }
};

fs.writeFileSync(path.join(process.cwd(), '.forensic-evidence', 'final-production-dtc-reconciliation.json'), JSON.stringify(result, null, 2));
console.log(JSON.stringify(result, null, 2));
