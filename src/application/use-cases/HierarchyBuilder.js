import { getCache, setCache, CACHE_TTL } from '@/lib/cache';

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
    const cached = await getCache('page', cacheKey);
    if (cached) {
      try {
        return typeof cached === 'string' ? JSON.parse(cached) : cached;
      } catch (e) {
        console.warn('HierarchyCache JSON parse error, rebuilding...');
      }
    }

    const posts = await this.contentRepository.getSortedPostsData(locale, folder);
    const hierarchy = {};

    posts.forEach(post => {
      let brandName = post.brand || 'Diğer';
      brandName = brandName.trim();
      if (brandName.toUpperCase() === 'MERCEDES') brandName = 'Mercedes-Benz';
      if (brandName.toUpperCase() === 'VW') brandName = 'Volkswagen';
      if (brandName.toUpperCase().includes('AUDI / VW') || brandName.toUpperCase().includes('GENEL / PREMIUM')) brandName = 'Genel / Premium';
      if (brandName.toUpperCase().includes('GENEL / PORSCHE')) brandName = 'Porsche';

      let modelName = post.model || 'Genel';
      modelName = modelName.trim();

      const brandSlug = this.slugify(brandName);
      const modelSlug = this.slugify(modelName);

      if (!hierarchy[brandSlug]) {
        hierarchy[brandSlug] = {
          name: brandName,
          models: {}
        };
      }

      if (!hierarchy[brandSlug].models[modelSlug]) {
        hierarchy[brandSlug].models[modelSlug] = {
          name: modelName,
          items: []
        };
      }

      hierarchy[brandSlug].models[modelSlug].items.push(post);
    });

    await setCache('page', cacheKey, JSON.stringify(hierarchy), CACHE_TTL.PAGE || 86400);
    return hierarchy;
  }
}
