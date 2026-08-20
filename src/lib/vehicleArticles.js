/**
 * Makale ↔ Araç eşleşme erişimi (src/content/faults/_vehicle_map.json).
 * Motor kodu + kasa/şasi + model adı ile 102/102 makale eşlendi.
 * Keşfedilebilirlik: makale sayfasında "uyumlu araçlar" + JSON-LD; araç sayfasında makale listesi.
 */
import path from 'path';
import { readJsonCached } from './cacheFile';

const MAP_PATH = path.join(process.cwd(), 'src', 'content', 'faults', '_vehicle_map.json');

async function load() {
  try {
    return await readJsonCached(MAP_PATH);
  } catch (_) {
    return { byArticle: {}, byModel: {}, byGeneration: {} };
  }
}

/** Bir makalenin uyumlu olduğu araçlar: { brand, brandSlug, engineFamilies, models, generations } */
export async function getVehiclesForArticle(articleId) {
  const m = await load();
  return (m.byArticle && m.byArticle[articleId]) || null;
}

/** Bir tree modeline (ör. brandSlug=bmw, modelName=3) ait makale id listesi */
export async function getArticleIdsForModel(brandSlug, modelName) {
  const m = await load();
  return (m.byModel && m.byModel[brandSlug] && m.byModel[brandSlug][modelName]) || [];
}

/** Bir nesle (modelId=d_xxx) ait makale id listesi */
export async function getArticleIdsForGeneration(brandSlug, modelId) {
  const m = await load();
  return (m.byGeneration && m.byGeneration[brandSlug] && m.byGeneration[brandSlug][modelId]) || [];
}

/** Bir markanın tüm eşleşen makale id'leri (tekil) */
export async function getArticleIdsForBrand(brandSlug) {
  const m = await load();
  const byModel = (m.byModel && m.byModel[brandSlug]) || {};
  const set = new Set();
  Object.values(byModel).forEach(ids => ids.forEach(id => set.add(id)));
  return [...set];
}
