import { prisma } from '@/lib/prisma';
import { getAllPostIds } from '@/lib/blog';
import { articles } from '@/lib/articles';
import { SEO_PRIORITY } from '@/data/seo-oncelik';

/**
 * Kurumsal Dinamik Sitemap Generator (Faz A / Görev 1)
 * - 4 dil (tr, en, ru, uk) × tüm public sayfalar
 * - Dinamik sayfalar: blog, katalog, ariza-cozumleri, sigorta-kutuphanesi, bilgi-bankasi
 * - hreflang alternates.languages her URL için (Google multi-locale SEO)
 * - Base URL www'lu (canlı deploy www.bursaliotoservis.com'da)
 */

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.bursaliotoservis.com';
const LOCALES = ['tr', 'en', 'ru', 'uk', 'ar'];
const DEFAULT_LOCALE = 'tr';

const STATIC_PATHS = [
  '', // ana sayfa
  '/sanal-usta',
  '/ariza-cozumleri',
  '/sigorta-kutuphanesi',
  '/teknik-kutuphane',
  // SEO landing pages
  '/fethiye-7-24-oto-cekici',
  '/english-speaking-mechanic',
  '/porsche-mercedes-ozel-servis',
  '/otomatik-sanziman-tamiri',
  '/seffaf-fiyatlandirma',
  '/vip-filo-gece-bakimi',
  '/hakkimizda',
];

// Programmatic SEO — marka bazlı service pages
const SEO_BRAND_SLUGS = [
  'bmw', 'mercedes', 'audi', 'porsche',
  'volkswagen', 'land-rover', 'volvo', 'range-rover', 'mini', 'skoda', 'seat'
];

// YENİ: Agresif Yerel SEO (Bölgeler)
const SEO_DISTRICTS = [
  'fethiye', 'gocek', 'oludeniz', 'dalaman', 'kas', 'kalkan', 'seydikemer', 'ortaca', 'koycegiz'
];

// YENİ: Popüler Motor Kodları
const SEO_ENGINE_CODES = [
  'ea888', 'ea211', 'b48', 'b58', 'n20', 'om651', 'om654', 'm271', 'm274'
];

/**
 * Verilen path için tüm dillerde alternates map'i döndürür.
 * Google hreflang için sitemap standard formatı.
 */
function buildAlternates(path) {
  const languages = {};
  LOCALES.forEach((loc) => {
    languages[loc] = `${BASE_URL}/${loc}${path}`;
  });
  languages['x-default'] = `${BASE_URL}/${DEFAULT_LOCALE}${path}`;
  return { languages };
}

/**
 * Tek path'i 4 dil için sitemap entry'sine çevirir.
 */
function expandLocales(path, opts = {}) {
  const {
    changeFrequency = 'weekly',
    priority = 0.7,
    lastModified = new Date(),
  } = opts;

  return LOCALES.map((locale) => ({
    url: `${BASE_URL}/${locale}${path}`,
    lastModified: lastModified instanceof Date ? lastModified : new Date(lastModified),
    changeFrequency,
    priority,
    alternates: buildAlternates(path),
  }));
}

export const revalidate = 86400; // 24 hours ISR

export default async function sitemap() {
  const now = new Date();
  const entries = [];

  // 1) Statik public sayfalar × 4 dil
  STATIC_PATHS.forEach((path) => {
    const priority = path === '' ? 1.0 : 0.8;
    entries.push(...expandLocales(path, { changeFrequency: 'daily', priority, lastModified: now }));
  });

  // 2) Programmatic SEO brand pages × 4 dil
  SEO_BRAND_SLUGS.forEach((brand) => {
    // Hizmet sayfaları
    entries.push(...expandLocales(`/hizmetler/${brand}-otomatik-sanziman-tamiri-fethiye`, {
      changeFrequency: 'weekly',
      priority: 0.85,
      lastModified: now,
    }));

    // YENİ: Dinamik Marka Hub Sayfaları
    entries.push(...expandLocales(`/marka/${brand}`, {
      changeFrequency: 'weekly',
      priority: 0.95,
      lastModified: now,
    }));

    // YENİ: Tam Programatik Local SEO (Her Marka x Her Bölge) -> /bolge/bmw-servisi-gocek
    // GÖREV A3: Kademeli İndeksleme (Sadece TIER1 kombinasyonları haritaya eklenir)
    SEO_DISTRICTS.forEach((district) => {
      const s1 = `${brand}-servisi-${district}`;
      if (SEO_PRIORITY.isTier1(s1)) {
        entries.push(...expandLocales(`/bolge/${s1}`, {
          changeFrequency: 'monthly',
          priority: 0.8,
          lastModified: now,
        }));
      }
      const s2 = `${brand}-tamiri-${district}`;
      if (SEO_PRIORITY.isTier1(s2)) {
        entries.push(...expandLocales(`/bolge/${s2}`, {
          changeFrequency: 'monthly',
          priority: 0.7,
          lastModified: now,
        }));
      }
    });
  });

  // 3) Blog yazıları (articles.js — statik data source) × 4 dil
  try {
    articles.forEach((article) => {
      const lastMod = article.date ? new Date(article.date) : now;
      entries.push(...expandLocales(`/blog/${article.slug}`, {
        changeFrequency: 'monthly',
        priority: 0.7,
        lastModified: lastMod,
      }));
    });
  } catch (e) {
    console.warn('[Sitemap] Blog yüklenemedi:', e.message);
  }

  // 6) Fault Codes (MDX) → /ariza-cozumleri/[kod]
  try {
    const faultCodes = getAllPostIds('faults');
    faultCodes.forEach((f) => {
      entries.push(...expandLocales(`/ariza-cozumleri/${f.params.slug}`, {
        changeFrequency: 'monthly',
        priority: 0.8,
        lastModified: now,
      }));
    });
  } catch (e) {
    console.warn('[Sitemap] Fault codes yüklenemedi:', e.message);
  }

  // 6.5) Motor Kodları Hub Sayfaları
  SEO_ENGINE_CODES.forEach((engine) => {
    entries.push(...expandLocales(`/motor/${engine}`, {
      changeFrequency: 'monthly',
      priority: 0.85,
      lastModified: now,
    }));
  });


  // 4) Manufacturers (DB) → /katalog/[marka]
  try {
    const manufacturers = await prisma.manufacturer.findMany({ select: { name: true } });
    manufacturers.forEach((m) => {
      const slug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      entries.push(...expandLocales(`/katalog/${slug}`, {
        changeFrequency: 'weekly',
        priority: 0.75,
        lastModified: now,
      }));
    });
  } catch (e) {
    console.warn('[Sitemap] Manufacturers yüklenemedi:', e.message);
  }

  // 5) Vehicles (DB) → /katalog/[marka]/[id]
  try {
    const vehicles = await prisma.vehicle.findMany({
      select: { id: true, manufacturer: { select: { name: true } } },
      take: 5000, // sitemap boyutunu koru
    });
    vehicles.forEach((v) => {
      const brandSlug = v.manufacturer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      entries.push(...expandLocales(`/katalog/${brandSlug}/${v.id}`, {
        changeFrequency: 'weekly',
        priority: 0.65,
        lastModified: now,
      }));
    });
  } catch (e) {
    console.warn('[Sitemap] Vehicles yüklenemedi:', e.message);
  }


  // 7) Sigorta kütüphanesi (fusebox) — public'lerden liste (path locale'siz)
  try {
    const fuseBoxVehicles = await prisma.vehicle.findMany({
      where: { fuseBoxes: { some: {} } },
      select: { manufacturer: { select: { name: true } } },
      distinct: ['manufacturerId'],
    });
    fuseBoxVehicles.forEach((v) => {
      const brandSlug = v.manufacturer.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      entries.push(...expandLocales(`/sigorta-kutuphanesi/${brandSlug}`, {
        changeFrequency: 'weekly',
        priority: 0.7,
        lastModified: now,
      }));
    });
  } catch (e) {
    console.warn('[Sitemap] Sigorta kütüphanesi yüklenemedi:', e.message);
  }

  // 8) Bilgi bankası — make bazında
  try {
    const bilgiMakes = await prisma.manufacturer.findMany({ select: { name: true }, take: 100 });
    bilgiMakes.forEach((m) => {
      const slug = m.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      entries.push(...expandLocales(`/bilgi-bankasi/${slug}`, {
        changeFrequency: 'monthly',
        priority: 0.6,
        lastModified: now,
      }));
    });
  } catch (e) {
    console.warn('[Sitemap] Bilgi bankası yüklenemedi:', e.message);
  }

  return entries;
}
