/**
 * Makale ↔ Araç eşleşme erişimi (src/content/faults/_vehicle_map.json).
 * Motor kodu + kasa/şasi + model adı ile 102/102 makale eşlendi.
 * Keşfedilebilirlik: makale sayfasında "uyumlu araçlar" + JSON-LD; araç sayfasında makale listesi.
 */
import fs from 'fs';
import path from 'path';

const MAP_PATH = path.join(process.cwd(), 'src', 'content', 'faults', '_vehicle_map.json');

let _cache = null;
function load() {
  if (_cache) return _cache;
  try {
    _cache = JSON.parse(fs.readFileSync(MAP_PATH, 'utf-8'));
  } catch (_) {
    _cache = { byArticle: {}, byModel: {}, byGeneration: {} };
  }
  return _cache;
}

/** Bir makalenin uyumlu olduğu araçlar: { brand, brandSlug, engineFamilies, models, generations } */
export function getVehiclesForArticle(articleId) {
  const m = load();
  return (m.byArticle && m.byArticle[articleId]) || null;
}

/** Bir tree modeline (ör. brandSlug=bmw, modelName=3) ait makale id listesi */
export function getArticleIdsForModel(brandSlug, modelName) {
  const m = load();
  return (m.byModel && m.byModel[brandSlug] && m.byModel[brandSlug][modelName]) || [];
}

/** Bir nesle (modelId=d_xxx) ait makale id listesi */
export function getArticleIdsForGeneration(brandSlug, modelId) {
  const m = load();
  return (m.byGeneration && m.byGeneration[brandSlug] && m.byGeneration[brandSlug][modelId]) || [];
}

/** Bir markanın tüm eşleşen makale id'leri (tekil) */
export function getArticleIdsForBrand(brandSlug) {
  const m = load();
  const byModel = (m.byModel && m.byModel[brandSlug]) || {};
  const set = new Set();
  Object.values(byModel).forEach(ids => ids.forEach(id => set.add(id)));
  return [...set];
}
