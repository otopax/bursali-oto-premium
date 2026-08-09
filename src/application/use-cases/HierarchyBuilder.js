import { getCache, setCache, CACHE_TTL } from '@/lib/cache';
import { singleFlight } from '@/lib/singleFlight';

const memoryHierarchyCache = new Map();

const CANONICAL_BRANDS = [
  "Volkswagen",
  "Audi",
  "BMW",
  "Mercedes-Benz",
  "Porsche",
  "Seat",
  "Skoda",
  "Volvo"
];

const BRAND_ALIAS = {
  'VW': 'Volkswagen',
  'MERCEDES': 'Mercedes-Benz',
  'MERCEDES BENZ': 'Mercedes-Benz',
  'SEAT': 'Seat',
  'SKODA': 'Skoda'
};

const MODEL_TO_BRAND = {
  'golf': { brand: 'Volkswagen', model: 'Golf' },
  'passat': { brand: 'Volkswagen', model: 'Passat' },
  'polo': { brand: 'Volkswagen', model: 'Polo' },
  'tiguan': { brand: 'Volkswagen', model: 'Tiguan' },
  'touareg': { brand: 'Volkswagen', model: 'Touareg' },
  'a3': { brand: 'Audi', model: 'A3' },
  'a4': { brand: 'Audi', model: 'A4' },
  'a6': { brand: 'Audi', model: 'A6' },
  'q5': { brand: 'Audi', model: 'Q5' },
  'q7': { brand: 'Audi', model: 'Q7' },
  '3 series': { brand: 'BMW', model: '3 Serisi' },
  '5 series': { brand: 'BMW', model: '5 Serisi' },
  'c-class': { brand: 'Mercedes-Benz', model: 'C-Serisi' },
  'e-class': { brand: 'Mercedes-Benz', model: 'E-Serisi' },
  '911': { brand: 'Porsche', model: '911' },
  'cayenne': { brand: 'Porsche', model: 'Cayenne' },
  'leon': { brand: 'Seat', model: 'Leon' },
  'ibiza': { brand: 'Seat', model: 'Ibiza' },
  'octavia': { brand: 'Skoda', model: 'Octavia' },
  'superb': { brand: 'Skoda', model: 'Superb' },
  'xc60': { brand: 'Volvo', model: 'XC60' },
  'xc90': { brand: 'Volvo', model: 'XC90' }
};

export class HierarchyBuilder {
  /**
   * @param {import('../interfaces/IContentRepository').IContentRepository} contentRepository 
   */
  constructor(contentRepository) {
    this.contentRepository = contentRepository;
  }

  slugify(text) {
    if (!text) return 'diger';
    const trMap = {
      'çÇ':'c', 'ğĞ':'g', 'şŞ':'s', 'üÜ':'u', 'ıİ':'i', 'öÖ':'o'
    };
    for(let key in trMap) {
      text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
    }

    return text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
  }

  normalizeBrandAndModel(rawBrandStr, rawModelStr) {
    const brandsSet = new Set();
    let modelName = rawModelStr || 'Genel';

    // 1. Split compound brand strings
    const tokens = (rawBrandStr || '').split(/[\/&,]/).map(t => t.trim()).filter(Boolean);

    tokens.forEach(token => {
      const lower = token.toLowerCase();
      
      // Check if token is actually a known model name
      if (MODEL_TO_BRAND[lower]) {
        brandsSet.add(MODEL_TO_BRAND[lower].brand);
        modelName = MODEL_TO_BRAND[lower].model;
        return;
      }

      // Check alias map
      const upper = token.toUpperCase();
      const mappedBrand = BRAND_ALIAS[upper] || CANONICAL_BRANDS.find(cb => cb.toLowerCase() === lower);

      if (mappedBrand) {
        brandsSet.add(mappedBrand);
      }
    });

    // Default to Volkswagen if no canonical brand matched
    if (brandsSet.size === 0) {
      brandsSet.add('Volkswagen');
    }

    return {
      brands: Array.from(brandsSet),
      model: modelName
    };
  }

  async build(locale = 'tr', folder = 'faults') {
    const cacheKey = `hierarchy:${locale}:${folder}`;
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';

    if ((folder !== 'faults' || isBuildPhase) && memoryHierarchyCache.has(cacheKey)) {
      return memoryHierarchyCache.get(cacheKey);
    }

    return singleFlight(cacheKey, async () => {
      if ((folder !== 'faults' || isBuildPhase) && memoryHierarchyCache.has(cacheKey)) {
        return memoryHierarchyCache.get(cacheKey);
      }

      const posts = await this.contentRepository.getSortedPostsData(locale, folder);
      const hierarchy = {};

      // Initialize all 8 canonical brands in the hierarchy
      CANONICAL_BRANDS.forEach(brandName => {
        const brandSlug = this.slugify(brandName);
        hierarchy[brandSlug] = {
          name: brandName,
          models: {}
        };
      });

      posts.forEach(post => {
        const rawBrandStr = Array.isArray(post.brands) ? post.brands.join('/') : (post.brand || '');
        const rawModelStr = Array.isArray(post.models) ? post.models[0] : (post.model || 'Genel');

        const { brands, model } = this.normalizeBrandAndModel(rawBrandStr, rawModelStr);

        brands.forEach(cleanBrandName => {
          const brandSlug = this.slugify(cleanBrandName);
          if (!hierarchy[brandSlug]) return; // Skip non-canonical

          const cleanModelName = model.trim();
          const modelSlug = this.slugify(cleanModelName);

          if (!hierarchy[brandSlug].models[modelSlug]) {
            hierarchy[brandSlug].models[modelSlug] = {
              name: cleanModelName,
              items: []
            };
          }

          const exists = hierarchy[brandSlug].models[modelSlug].items.some(item => item.id === post.id);
          if (!exists) {
            hierarchy[brandSlug].models[modelSlug].items.push({
              ...post,
              brand: cleanBrandName,
              model: cleanModelName
            });
          }
        });
      });

      memoryHierarchyCache.set(cacheKey, hierarchy);
      return hierarchy;
    });
  }
}
