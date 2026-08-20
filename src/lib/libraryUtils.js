import fs from 'fs';
import path from 'path';
import { readJsonCached } from './cacheFile';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const SRC_DATA_DIR = path.join(process.cwd(), 'src', 'data');

const FUSEBOX_DIR = fs.existsSync(path.join(SRC_DATA_DIR, 'fuseboxes'))
  ? path.join(SRC_DATA_DIR, 'fuseboxes')
  : path.join(PUBLIC_DIR, 'fusebox_data');

const MANUALS_DIR = path.join(PUBLIC_DIR, 'startmycar_manuals');

export function getAvailableBrands() {
  const brands = new Set();
  
  if (fs.existsSync(FUSEBOX_DIR)) {
    const fbBrands = fs.readdirSync(FUSEBOX_DIR).filter(file => fs.statSync(path.join(FUSEBOX_DIR, file)).isDirectory());
    fbBrands.forEach(b => brands.add(b));
  }
  
  if (fs.existsSync(MANUALS_DIR)) {
    const manBrands = fs.readdirSync(MANUALS_DIR).filter(file => fs.statSync(path.join(MANUALS_DIR, file)).isDirectory());
    manBrands.forEach(b => brands.add(b));
  }
  
  return Array.from(brands)
    .filter(b => b.toLowerCase() !== 'fuse_box_diagrams')
    .sort();
}

export function getModelsForBrand(brandSlug) {
  const models = new Set();
  
  const fbBrandDir = path.join(FUSEBOX_DIR, brandSlug);
  if (fs.existsSync(fbBrandDir)) {
    const fbModels = fs.readdirSync(fbBrandDir).filter(file => fs.statSync(path.join(fbBrandDir, file)).isDirectory());
    fbModels.forEach(m => models.add(m));
  }
  
  const manBrandDir = path.join(MANUALS_DIR, brandSlug);
  if (fs.existsSync(manBrandDir)) {
    const manModels = fs.readdirSync(manBrandDir).filter(file => fs.statSync(path.join(manBrandDir, file)).isDirectory());
    manModels.forEach(m => models.add(m));
  }
  
  return Array.from(models).sort();
}

export async function getFuseBoxDataForModel(brandSlug, modelSlug) {
  const modelDir = path.join(FUSEBOX_DIR, brandSlug, modelSlug);
  const dataPath = path.join(modelDir, 'data.json');
  
  try {
    return await readJsonCached(dataPath);
  } catch (e) {
    // If file does not exist or read fails, just return null
    return null;
  }
}

export async function getManualsDataForModel(brandSlug, modelSlug) {
  const modelDir = path.join(MANUALS_DIR, brandSlug, modelSlug);
  const dataPath = path.join(modelDir, 'data.json');
  
  try {
    return await readJsonCached(dataPath);
  } catch (e) {
    // If file does not exist or read fails, just return null
    return null;
  }
}
