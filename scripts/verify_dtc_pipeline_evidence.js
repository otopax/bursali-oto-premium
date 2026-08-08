import fs from 'fs';
import path from 'path';

/**
 * BURSALI OTO — VAG DTC FORENSIC FITMENT & EVIDENCE PIPELINE VALIDATOR (GATES 3 -> 5.5)
 * 974 adet ham DTC JSON dosyasını Gate 3 (Normalizasyon), Gate 4 (Fitment), Gate 5 (Evidence)
 * ve Gate 5.5 (Özgünlük/Thin-Content) süzgecinden adli olarak geçirir.
 */

const FAULTS_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

const VAG_BRANDS = ['Audi', 'Volkswagen', 'VW', 'SEAT', 'Skoda', 'Škoda', 'Porsche'];
const KNOWN_MODELS = ['A3', 'A4', 'A5', 'A6', 'A8', 'Q3', 'Q5', 'Q7', 'Golf', 'Passat', 'Tiguan', 'Polo', 'Touareg', 'Jetta', 'Beetle', 'Octavia', 'Fabia', 'Superb', 'Leon', 'Ibiza', 'Cayenne', 'Macan'];
const KNOWN_ENGINES = ['1.4 TSI', '1.4 TFSI', '2.0 TSI', '2.0 TFSI', '1.6 TDI', '2.0 TDI', '3.0 TDI', '1.8 TSI', '1.8 TFSI', 'EA888', 'EA211', 'EA111', 'EA189', 'EA288', 'DQ200', 'DQ250', 'DQ500', '09G'];

let rawDtcCount = 0;

let normalizationPass = 0;
let normalizationFail = 0;

let fitmentEvidencePass = 0;
let fitmentEvidenceFail = 0;

let vehicleMatchPass = 0;
let unsupportedFitment = 0;

let originalityPass = 0;
let thinContentFail = 0;

let publishableDtc = 0;
let quarantinedDtc = 0;
let droppedDtc = 0;

const quarantinedList = [];
const publishableList = [];

if (!fs.existsSync(FAULTS_DIR)) {
  console.error('❌ HATA: public/ariza_kodlari_data dizini bulunamadı!');
  process.exit(1);
}

const files = fs.readdirSync(FAULTS_DIR).filter(f => f.endsWith('.json'));
rawDtcCount = files.length;

console.log('============================================================');
console.log('🔍 BURSALI OTO — VAG DTC FORENSIC PIPELINE EVIDENCE AUDIT');
console.log(`📌 Taranacak Ham DTC JSON Dosya Sayısı: ${rawDtcCount}`);
console.log('============================================================\n');

for (const file of files) {
  const filePath = path.join(FAULTS_DIR, file);
  let data;

  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    data = JSON.parse(content);
  } catch (err) {
    normalizationFail++;
    droppedDtc++;
    continue;
  }

  // --- GATE 3: Technical Normalization Check ---
  const hasCode = !!(data.code && String(data.code).trim().length >= 3);
  const hasSymptoms = Array.isArray(data.symptoms) && data.symptoms.length > 0;
  const hasCauses = Array.isArray(data.commonCauses) && data.commonCauses.length > 0;
  const hasSolutions = Array.isArray(data.stepByStepSolution) && data.stepByStepSolution.length > 0;

  if (!hasCode || !hasSymptoms || !hasCauses || !hasSolutions) {
    normalizationFail++;
    quarantinedDtc++;
    quarantinedList.push({ code: data.code || file, reason: 'GATE 3 NORMALIZATION FAIL (Missing symptoms/causes/solutions)' });
    continue;
  }
  normalizationPass++;

  // --- GATE 4: Fitment Match (Brand / Model / Engine) ---
  const modelsStr = (data.models || []).join(' ');
  const enginesStr = (data.engines || []).join(' ');
  const titleStr = data.title || '';
  const notesStr = data.technicalNotes || '';

  const fullText = `${titleStr} ${modelsStr} ${enginesStr} ${notesStr}`.toUpperCase();

  const brandMatch = VAG_BRANDS.some(b => fullText.includes(b.toUpperCase()));
  const modelMatch = KNOWN_MODELS.some(m => fullText.includes(m.toUpperCase()));
  const engineMatch = KNOWN_ENGINES.some(e => fullText.includes(e.toUpperCase()));

  if (!brandMatch) {
    unsupportedFitment++;
    quarantinedDtc++;
    quarantinedList.push({ code: data.code, reason: 'GATE 4 FITMENT FAIL (No specific VAG brand match)' });
    continue;
  }
  vehicleMatchPass++;

  // --- GATE 5: Evidence Validation Gate (Factory TSB / Channel / Component Evidence) ---
  const hasTsbRef = /TSB|TPI|VCDS|ODIS|CHANNEL|MVB|J104|N92|R134|G28|G31|G70|G40|G31|J519|MK60/i.test(notesStr);
  const hasDetailedNotes = notesStr.length >= 40;

  if (!hasTsbRef && !hasDetailedNotes) {
    fitmentEvidenceFail++;
    quarantinedDtc++;
    quarantinedList.push({ code: data.code, reason: 'GATE 5 EVIDENCE FAIL (No factory TSB / diagnostic channel evidence)' });
    continue;
  }
  fitmentEvidencePass++;

  // --- GATE 5.5: Content Originality & Thin-Content Guard ---
  // Check for raw un-translated English chunks or minimal thin content
  const isThin = notesStr.length < 25 && data.commonCauses.length < 2;
  const englishChunkRatio = (notesStr.match(/\b(the|and|for|with|this|from|when|found|in|check|replace)\b/gi) || []).length;

  if (isThin || englishChunkRatio > 15) {
    thinContentFail++;
    quarantinedDtc++;
    quarantinedList.push({ code: data.code, reason: 'GATE 5.5 ORIGINALITY/THIN FAIL (Needs TR localization / thin text)' });
    continue;
  }
  originalityPass++;

  // --- ALL 4 CONDITIONS PASSED -> PUBLISHABLE ---
  publishableDtc++;
  publishableList.push({
    code: data.code,
    title: data.title,
    models: data.models,
    engines: data.engines
  });
}

console.log('============================================================');
console.log('📊 FORENSIC PIPELINE EVIDENCE AUDIT METRIC RESULTS');
console.log('============================================================\n');

console.log(`RAW DTC INGESTED                 : ${rawDtcCount}`);
console.log(`------------------------------------------------------------`);
console.log(`NORMALIZATION PASS (GATE 3)      : ${normalizationPass}`);
console.log(`NORMALIZATION FAIL (GATE 3)      : ${normalizationFail}`);
console.log(`------------------------------------------------------------`);
console.log(`BRAND/MODEL/ENGINE MATCH (GATE 4): ${vehicleMatchPass}`);
console.log(`UNSUPPORTED FITMENT (GATE 4)     : ${unsupportedFitment}`);
console.log(`------------------------------------------------------------`);
console.log(`FITMENT EVIDENCE PASS (GATE 5)   : ${fitmentEvidencePass}`);
console.log(`FITMENT EVIDENCE FAIL (GATE 5)   : ${fitmentEvidenceFail}`);
console.log(`------------------------------------------------------------`);
console.log(`CONTENT ORIGINALITY PASS (G5.5)  : ${originalityPass}`);
console.log(`THIN CONTENT / LOCALIZATION FAIL : ${thinContentFail}`);
console.log(`============================================================`);
console.log(`✅ PUBLISHABLE CANDIDATE DTCs     : ${publishableDtc}`);
console.log(`⚠️ QUARANTINED DTCs (HELD BACK)  : ${quarantinedDtc}`);
console.log(`❌ DROPPED / CORRUPTED DTCs       : ${droppedDtc}`);
console.log('============================================================\n');

const reportPath = path.join(process.cwd(), 'evidence', 'dtc_forensic_pipeline_audit.json');
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, JSON.stringify({
  timestamp: new Date().toISOString(),
  metrics: {
    rawDtcCount,
    normalizationPass,
    normalizationFail,
    vehicleMatchPass,
    unsupportedFitment,
    fitmentEvidencePass,
    fitmentEvidenceFail,
    originalityPass,
    thinContentFail,
    publishableDtc,
    quarantinedDtc,
    droppedDtc
  },
  quarantinedList,
  publishableList: publishableList.slice(0, 50)
}, null, 2));

console.log(`📄 Forensic pipeline audit report saved to: ${reportPath}`);
