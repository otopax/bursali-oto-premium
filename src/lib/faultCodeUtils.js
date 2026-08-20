import fs from 'fs';
import path from 'path';
import { readJsonCached } from './cacheFile';

const FAULT_CODES_DIR = path.join(process.cwd(), 'public/ariza_kodlari_data');

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

export async function getFaultCodeData(brandSlug, modelSlug, codeSlug) {
  const dataPath = path.join(FAULT_CODES_DIR, brandSlug, modelSlug, codeSlug, 'data.json');
  try {
    return await readJsonCached(dataPath);
  } catch (e) {
    // If file does not exist or read fails, just return null
    return null;
  }
}
