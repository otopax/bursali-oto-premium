import fs from 'fs';
import path from 'path';

const PUBLIC_DIR = path.join(process.cwd(), 'public');
const FUSEBOX_DIR = path.join(PUBLIC_DIR, 'fusebox_data');

export function getAvailableFuseboxBrands() {
  if (!fs.existsSync(FUSEBOX_DIR)) return [];
  return fs.readdirSync(FUSEBOX_DIR).filter(file => fs.statSync(path.join(FUSEBOX_DIR, file)).isDirectory()).sort();
}

export function getModelsForFuseboxBrand(brandSlug) {
  const brandDir = path.join(FUSEBOX_DIR, brandSlug);
  if (!fs.existsSync(brandDir)) return [];
  return fs.readdirSync(brandDir).filter(file => fs.statSync(path.join(brandDir, file)).isDirectory()).sort();
}

export function getFuseboxData(brandSlug, modelSlug) {
  const dataPath = path.join(FUSEBOX_DIR, brandSlug, modelSlug, 'data.json');
  if (fs.existsSync(dataPath)) {
    try {
      const content = fs.readFileSync(dataPath, 'utf-8');
      return JSON.parse(content);
    } catch (e) {
      console.error(`Error reading fusebox data for ${brandSlug}/${modelSlug}`, e);
    }
  }
  return null;
}
