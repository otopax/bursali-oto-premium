import { prisma } from '@/lib/prisma';
import { container } from '@/application/di/container';
import { articles } from '@/lib/articles';
import { SEO_PRIORITY } from '@/data/seo-oncelik';

/**
 * Kurumsal Dinamik Sitemap Generator
 * - 5 dil (tr, en, ru, uk, ar) × tüm public sayfalar
 * - Dinamik sayfalar: blog, katalog, ariza-cozumleri, sigorta-kutuphanesi, bilgi-bankasi
 * - Maximum 10,000 URL emniyet sınırı (Next.js sitemap 50,000 limit koruması)
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
  '/kutuphane',
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

// Yerel SEO (Bölgeler)
const SEO_DISTRICTS = [
  'fethiye', 'gocek', 'oludeniz', 'dalaman', 'kas', 'kalkan', 'seydikemer', 'ortaca', 'koycegiz'
];

// Popüler Motor Kodları
const SEO_ENGINE_CODES = [
  'ea888', 'ea211', 'b48', 'b58', 'n20', 'om651', 'om654', 'm271', 'm274'
];

function buildAlternates(path) {
  const languages = {};
  LOCALES.forEach((loc) => {
    languages[loc] = `${BASE_URL}/${loc}${path}`;
  });
  languages['x-default'] = `${BASE_URL}/${DEFAULT_LOCALE}${path}`;
  return { languages };
}

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

  // 1) Statik public sayfalar × 5 dil
  STATIC_PATHS.forEach((path) => {
    const priority = path === '' ? 1.0 : 0.8;
    entries.push(...expandLocales(path, { changeFrequency: 'daily', priority, lastModified: now }));
  });

  // 2) Programmatic SEO brand pages × 5 dil
  SEO_BRAND_SLUGS.forEach((brand) => {
    entries.push(...expandLocales(`/hizmetler/${brand}-otomatik-sanziman-tamiri-fethiye`, {
      changeFrequency: 'weekly',
      priority: 0.85,
      lastModified: now,
    }));

    entries.push(...expandLocales(`/marka/${brand}`, {
      changeFrequency: 'weekly',
      priority: 0.95,
      lastModified: now,
    }));

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

  // 3) Blog yazıları × 5 dil
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

  // 4) Fault Codes & Kütüphane (Hierarchy) - Sınırlandırılmış Harita
  try {
    const hierarchy = await container.hierarchyBuilder.build('tr', 'faults');
    
    Object.entries(hierarchy).forEach(([marka, data]) => {
      entries.push(...expandLocales(`/ariza-cozumleri/${marka}`, { changeFrequency: 'weekly', priority: 0.9, lastModified: now }));
      entries.push(...expandLocales(`/kutuphane/${marka}`, { changeFrequency: 'weekly', priority: 0.8, lastModified: now }));
      
      Object.keys(data.models).forEach(model => {
        entries.push(...expandLocales(`/ariza-cozumleri/${marka}/${model}`, { changeFrequency: 'weekly', priority: 0.85, lastModified: now }));
        entries.push(...expandLocales(`/kutuphane/${marka}/${model}`, { changeFrequency: 'weekly', priority: 0.75, lastModified: now }));
        
        // Model başına ilk 10 popüler arızayı sitemap'e al (sitemap şişmesini önle)
        const topItems = (data.models[model].items || []).slice(0, 10);
        topItems.forEach(post => {
          entries.push(...expandLocales(`/kutuphane/${marka}/${model}/arizalar/${post.id}`, { changeFrequency: 'monthly', priority: 0.8, lastModified: now }));
        });
      });
    });
  } catch (e) {
    console.warn('[Sitemap] Fault codes & Kütüphane yüklenemedi:', e.message);
  }

  // 5) Motor Kodları
  SEO_ENGINE_CODES.forEach((engine) => {
    entries.push(...expandLocales(`/motor/${engine}`, {
      changeFrequency: 'monthly',
      priority: 0.85,
      lastModified: now,
    }));
  });

  return entries;
}
