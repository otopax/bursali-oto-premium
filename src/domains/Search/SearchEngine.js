import { prisma } from '@/lib/prisma';

export class SearchEngine {
  /**
   * 1 Milyon+ sigorta verisi içerisinde Yüksek Performanslı Tam Metin Araması (Full-Text Search) yapar.
   * @param {string} query - Aranacak kelime (Örn: "radyo", "klima")
   * @param {number} limit - Maksimum sonuç sayısı (Varsayılan: 20)
   * @returns {Promise<Array>} Arama sonuçları
   */
  static async searchFuses(query, limit = 20) {
    if (!query || query.trim() === '') {
      return [];
    }

    const formattedQuery = query.trim().split(/\s+/).join(' | ');

    try {
      // FAST PATH: Raw SQL with 'english' GIN index
      // Candidate D: TS_RANK optimization. Forces GIN index usage and avoids Materialized CTE heap fetch penalty.
      const rawResults = await prisma.$queryRaw`
        SELECT id
        FROM "public"."Fuse"
        WHERE to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')) @@ to_tsquery('english', ${formattedQuery})
        ORDER BY ts_rank(to_tsvector('english', coalesce(type, '') || ' ' || coalesce(description, '')), to_tsquery('english', ${formattedQuery})) DESC, id ASC
        LIMIT ${limit}
      `;
      
      const ids = rawResults.map(r => r.id);
      
      if (ids.length === 0) {
        return [];
      }

      // Prisma Hydration
      const hydratedResults = await prisma.fuse.findMany({
        where: { id: { in: ids } },
        include: {
          fuseBox: {
            include: {
              vehicle: {
                include: { manufacturer: true }
              }
            }
          }
        }
      });

      // Semantic Order Restoration
      const resultsMap = new Map();
      hydratedResults.forEach(item => resultsMap.set(item.id, item));
      
      const orderedResults = [];
      for (const id of ids) {
        if (resultsMap.has(id)) {
          orderedResults.push(resultsMap.get(id));
        }
      }

      return orderedResults;

    } catch (error) {
      // Check if it's a missing column error (42703 - undefined_column)
      // This allows graceful fallback only if the DDL hasn't been applied yet
      const isMissingColumn = error.meta && error.meta.code === '42703';
      const isUnknownFunction = error.meta && error.meta.code === '42883'; // Just in case
      
      if (!isMissingColumn && !isUnknownFunction) {
        console.error("SearchEngine Fast Path Error (Infrastructure/DB failure):", error);
        throw new Error("Arama sırasında veritabanı hatası oluştu.");
      }
      
      console.warn("SearchEngine Fast Path failed (Missing column/function). Falling back to Legacy Prisma Search.");

      // LEGACY FALLBACK
      try {
        const legacyResults = await prisma.fuse.findMany({
          where: {
            OR: [
              { description: { search: formattedQuery } },
              { type: { search: formattedQuery } }
            ]
          },
          include: {
            fuseBox: {
              include: {
                vehicle: {
                  include: { manufacturer: true }
                }
              }
            }
          },
          take: limit,
        });

        return legacyResults;
      } catch (fallbackError) {
        console.error("SearchEngine Legacy Fallback Error:", fallbackError);
        throw new Error("Arama sırasında veritabanı hatası oluştu.");
      }
    }
  }

  /**
   * Arıza kodları içinde tam metin arama
   */
  static async searchFaultCodes(query, limit = 20) {
    if (!query || query.trim() === '') return [];
    
    const formattedQuery = query.trim().split(/\s+/).join(' | ');

    return await prisma.faultCode.findMany({
      where: {
        OR: [
          { description: { search: formattedQuery } },
          { code: { search: formattedQuery } }
        ]
      },
      include: {
        vehicle: true
      },
      take: limit,
    });
  }
}
