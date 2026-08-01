/**
 * MERKEZİ URL ÜRETİCİ (Single Source of Truth for internal links)
 *
 * Arıza çözümü sayfalarının fiziksel rotası 3-seviyelidir:
 *   /{locale}/ariza-cozumleri/{markaSlug}/{modelSlug}/{kod}
 * ve [marka]/[model]/[kod]/page.js `dynamicParams = false` olduğu için
 * SADECE generateStaticParams'ta üretilen (HierarchyBuilder slug'ları) yollar 200 döner.
 *
 * Bu yüzden marka/model slug'ları HierarchyBuilder.js ile BİREBİR aynı
 * normalizasyon + slugify mantığıyla üretilmelidir. Aksi halde link 404/boş sayfaya düşer.
 * Kaynak: src/application/use-cases/HierarchyBuilder.js (build + slugify).
 */

const TR_MAP = { 'çÇ': 'c', 'ğĞ': 'g', 'şŞ': 's', 'üÜ': 'u', 'ıİ': 'i', 'öÖ': 'o' };

export function slugify(text) {
  if (!text) return 'diger';
  let t = String(text);
  for (const key in TR_MAP) {
    t = t.replace(new RegExp('[' + key + ']', 'g'), TR_MAP[key]);
  }
  return t.toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\w\-]+/g, '')
    .replace(/\-\-+/g, '-')
    .replace(/^-+/, '')
    .replace(/-+$/, '');
}

/** HierarchyBuilder.build() ile aynı marka normalizasyonu. */
export function normalizeBrand(brand) {
  let b = (brand || 'Diğer').trim();
  const U = b.toUpperCase();
  if (U === 'MERCEDES') b = 'Mercedes-Benz';
  if (U === 'VW') b = 'Volkswagen';
  if (U.includes('AUDI / VW') || U.includes('GENEL / PREMIUM')) b = 'Genel / Premium';
  if (U.includes('GENEL / PORSCHE')) b = 'Porsche';
  return b;
}

export function markaSlug(brand) {
  return slugify(normalizeBrand(brand));
}

export function modelSlug(model) {
  return slugify((model || 'Genel').trim());
}

/**
 * Bir arıza (fault/post) nesnesi için kanonik 3-seviye URL üretir.
 * @param {string} locale - 'tr' | 'en' | 'ru' | 'uk' | 'ar'
 * @param {{brand?: string, model?: string, id: string}} fault
 * @returns {string} örn: /tr/ariza-cozumleri/volkswagen/passat/volkswagen-p2458-ariza-kodu-cozumu
 */
export function arizaUrl(locale, fault) {
  if (!fault || !fault.id) return `/${locale}/kutuphane`;
  return `/${locale}/kutuphane/${markaSlug(fault.brand)}/${modelSlug(fault.model)}/arizalar/${fault.id}`;
}

/** Locale önekli path'ten (canonical/sitemap için) locale'siz sürüm. */
export function arizaPath(locale, fault) {
  return arizaUrl(locale, fault).replace(`/${locale}/`, '/');
}
