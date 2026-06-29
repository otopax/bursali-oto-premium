import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const FAULT_CODES_DIR = path.join(PUBLIC_DIR, 'ariza_kodlari');

export function getAvailableFaultBrands() {
  if (!fs.existsSync(FAULT_CODES_DIR)) return [];
  return fs.readdirSync(FAULT_CODES_DIR).filter(file => fs.statSync(path.join(FAULT_CODES_DIR, file)).isDirectory()).sort();
}

export function getModelsForFaultBrand(brandSlug) {
  const brandDir = path.join(FAULT_CODES_DIR, brandSlug);
  if (!fs.existsSync(brandDir)) return [];
  return fs.readdirSync(brandDir).filter(file => fs.statSync(path.join(brandDir, file)).isDirectory()).sort();
}

export function getCodesForModel(brandSlug, modelSlug) {
  const modelDir = path.join(FAULT_CODES_DIR, brandSlug, modelSlug);
  if (!fs.existsSync(modelDir)) return [];
  return fs.readdirSync(modelDir).filter(file => fs.statSync(path.join(modelDir, file)).isDirectory()).sort();
}

export function getFaultCodeData(brandSlug, modelSlug, codeSlug) {
  const dataPath = path.join(FAULT_CODES_DIR, brandSlug, modelSlug, codeSlug, 'data.json');
  if (fs.existsSync(dataPath)) {
    try {
      const content = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error reading fault data for ${brandSlug}/${modelSlug}/${codeSlug}`, e);
    }
  }
  return null;
}
