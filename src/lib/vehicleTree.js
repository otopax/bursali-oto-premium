/**
 * Araç Bilgi Ağacı erişim katmanı — public/vehicle_tree/*.json (crawler çıktısı).
 * Marka → Model → Nesil/Şasi → Motor. Tüm yüzeyler (Sanal Usta, Kütüphane,
 * Arıza Çözümleri, VIP Garaj) tek kaynak olarak bunu kullanır.
 * JSON dosyaları uygulamayla deploy olur; bellek içinde önbeklenir.
 */
import fs from 'fs';
import path from 'path';

const DIR = path.join(process.cwd(), 'public/vehicle_tree');

export const vtSlug = (s) => (s || '').toString().toLowerCase()
  .replace(/ç/g, 'c').replace(/ğ/g, 'g').replace(/ı/g, 'i').replace(/ö/g, 'o').replace(/ş/g, 's').replace(/ü/g, 'u')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');

let _cache = null;
function loadAll() {
  if (_cache) return _cache;
  const map = {};
  try {
    const files = fs.readdirSync(DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
    for (const f of files) {
      try {
        const t = JSON.parse(fs.readFileSync(path.join(DIR, f), 'utf-8'));
        if (t && t.make && Array.isArray(t.models)) map[vtSlug(t.make)] = t;
      } catch (_) { /* bozuk dosyayı atla */ }
    }
  } catch (_) { /* klasör yoksa boş dön */ }
  _cache = map;
  return map;
}

export function getBrands() {
  const map = loadAll();
  return Object.values(map)
    .map(t => ({ slug: vtSlug(t.make), name: t.make, makeId: t.makeId, modelCount: (t.models || []).length }))
    .sort((a, b) => a.name.localeCompare(b.name, 'tr'));
}

export function getBrandTree(brandSlug) {
  const map = loadAll();
  return map[brandSlug] || map[vtSlug(brandSlug)] || null;
}

export function getModels(brandSlug) {
  const t = getBrandTree(brandSlug);
  if (!t) return [];
  return (t.models || []).map(m => ({
    name: m.name,
    years: m.years || null,
    modelGroupId: m.modelGroupId,
    image: m.imageLocal || m.image || null,
    generationCount: (m.generations || []).length,
  }));
}

export function getGenerations(brandSlug, modelGroupId) {
  const t = getBrandTree(brandSlug);
  if (!t) return [];
  const m = (t.models || []).find(x => x.modelGroupId === modelGroupId);
  if (!m) return [];
  return (m.generations || []).map(g => ({
    name: g.name,
    chassis: g.chassis || null,
    years: g.years || null,
    modelId: g.modelId,
    image: g.imageLocal || g.image || null,
    engineCount: (g.engines || []).length,
  }));
}

const _clean = (s) => (typeof s === 'string' ? s.replace(/\s+/g, ' ').trim() : s);
const _cleanEngine = (e) => ({
  tip: _clean(e.tip),
  motorKodu: _clean(e.motorKodu),
  kapasiteCc: _clean(e.kapasiteCc),
  gucKw: _clean(e.gucKw),
  modelYili: _clean(e.modelYili),
});

export function getEngines(brandSlug, modelId) {
  const t = getBrandTree(brandSlug);
  if (!t) return [];
  for (const m of (t.models || [])) {
    for (const g of (m.generations || [])) {
      if (g.modelId === modelId) return (g.engines || []).map(_cleanEngine);
    }
  }
  return [];
}

/** Serbest metinden (marka+model) en yakın düğümü bulmaya çalışır (Sanal Usta/VIP eşleme için) */
export function findVehicle(brandName, modelName) {
  const bSlug = vtSlug(brandName);
  const t = getBrandTree(bSlug);
  if (!t) return null;
  const mSlug = vtSlug(modelName);
  const model = (t.models || []).find(m => vtSlug(m.name) === mSlug)
    || (t.models || []).find(m => mSlug && vtSlug(m.name).includes(mSlug))
    || null;
  return { brand: t.make, makeId: t.makeId, model };
}
