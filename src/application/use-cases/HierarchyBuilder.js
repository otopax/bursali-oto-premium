import { getCache, setCache, CACHE_TTL } from '@/lib/cache';
import { singleFlight } from '@/lib/singleFlight';

const memoryHierarchyCache = new Map();

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

  async build(locale = 'tr', folder = 'faults') {
    const cacheKey = `hierarchy:${locale}:${folder}`;

    // 1. L1 Process RAM Cache (0-5ms Instant Response)
    if (memoryHierarchyCache.has(cacheKey)) {
      return memoryHierarchyCache.get(cacheKey);
    }

    // 2. Single-Flight Coalescing (Thundering Herd Defense)
    return singleFlight(cacheKey, async () => {
      // Re-check L1 in case another concurrent in-flight completed
      if (memoryHierarchyCache.has(cacheKey)) {
        return memoryHierarchyCache.get(cacheKey);
      }

      // 3. L3 Storage Fetch (Markdown Repository)
      const posts = await this.contentRepository.getSortedPostsData(locale, folder);
      const hierarchy = {};

      posts.forEach(post => {
        let rawBrands = [];
        if (Array.isArray(post.brands) && post.brands.length > 0) {
          rawBrands = post.brands;
        } else if (typeof post.brand === 'string') {
          rawBrands = post.brand.split('/').map(b => b.trim());
        } else {
          rawBrands = ['Diğer'];
        }

        let rawModels = [];
        if (Array.isArray(post.models) && post.models.length > 0) {
          rawModels = post.models;
        } else if (typeof post.model === 'string') {
          rawModels = post.model.split(',').map(m => m.trim());
        } else {
          rawModels = ['Genel'];
        }

        rawBrands.forEach(brandName => {
          let cleanBrandName = brandName;
          if (cleanBrandName.toUpperCase() === 'MERCEDES') cleanBrandName = 'Mercedes-Benz';
          if (cleanBrandName.toUpperCase() === 'VW') cleanBrandName = 'Volkswagen';

          const brandSlug = this.slugify(cleanBrandName);

          if (!hierarchy[brandSlug]) {
            hierarchy[brandSlug] = {
              name: cleanBrandName,
              models: {}
            };
          }

          rawModels.forEach(modelName => {
            const cleanModelName = modelName.trim();
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
      });

      memoryHierarchyCache.set(cacheKey, hierarchy);
      return hierarchy;
    });
  }
}
