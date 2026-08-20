import { prisma } from '@/lib/prisma';
import { singleFlight } from '@/lib/singleFlight';

const memoryGraphCache = new Map();

function slugify(text) {
    if (!text) return 'diger';
    const trMap = {
      'çÇ':'c', 'ğĞ':'g', 'şŞ':'s', 'üÜ':'u', 'ıİ':'i', 'öÖ':'o'
    };
    for(let key in trMap) {
      text = text.replace(new RegExp('['+key+']','g'), trMap[key]);
    }
    const res = text.toString().toLowerCase()
      .replace(/\s+/g, '-')
      .replace(/[^\w\-]+/g, '')
      .replace(/\-\-+/g, '-')
      .replace(/^-+/, '')
      .replace(/-+$/, '');
      
    return res || 'diger';
}

export class GraphProvider {
  /**
   * Returns the entire vehicle tree for UI and sitemap generation.
   * Caches in memory to avoid repeated DB hits during runtime.
   */
  async buildTree() {
    const cacheKey = `graph:tree`;
    
    // In build phase, we don't query the DB to avoid empty-state cache poisoning.
    // The sitemap and pages MUST use `force-dynamic` to bypass static generation.
    const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build' || process.env.BUILDING === 'true' || process.env.IS_BUILD === 'true';
    if (isBuildPhase) {
      throw new Error("GraphProvider called during static build. Please ensure export const dynamic = 'force-dynamic' is set on the page/sitemap.");
    }

    if (memoryGraphCache.has(cacheKey)) {
      return memoryGraphCache.get(cacheKey);
    }

    return singleFlight(cacheKey, async () => {
      if (memoryGraphCache.has(cacheKey)) {
        return memoryGraphCache.get(cacheKey);
      }

      const manufacturers = await prisma.manufacturer.findMany({
        include: { vehicles: true }
      });

      const hierarchy = {};

      manufacturers.forEach(brand => {
        const brandSlug = slugify(brand.name);
        if (!hierarchy[brandSlug]) {
          hierarchy[brandSlug] = {
            id: brand.id,
            name: brand.name,
            models: {}
          };
        }

        brand.vehicles.forEach(vehicle => {
          let modelSlug = slugify(vehicle.model);
          
          // Collision resolver for empty/undefined models mapping to 'diger'
          if (modelSlug === 'diger') {
            const shortId = vehicle.id.split('-')[0];
            modelSlug = `diger-${shortId}`;
          }

          hierarchy[brandSlug].models[modelSlug] = {
            id: vehicle.id,
            name: vehicle.model || 'Diğer',
            generation: vehicle.generation,
            yearStart: vehicle.yearStart,
            yearEnd: vehicle.yearEnd
          };
        });
      });

      memoryGraphCache.set(cacheKey, hierarchy);
      return hierarchy;
    });
  }

  /**
   * Fetches specific engine variants for a given vehicle ID.
   */
  async getVehicleEngines(vehicleId) {
    return prisma.engine.findMany({
      where: { vehicleId },
      include: { variants: true },
      orderBy: { engineCode: 'asc' }
    });
  }
}
