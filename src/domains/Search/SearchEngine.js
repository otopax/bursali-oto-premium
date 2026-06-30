import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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

    // Arama terimini Prisma'nın beklediği formata çeviriyoruz (Örn: "radyo|klima")
    // "radyo sigortası" -> "radyo | sigortası"
    const formattedQuery = query.trim().split(/\s+/).join(' | ');

    try {
      const results = await prisma.fuse.findMany({
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
                include: {
                  manufacturer: true
                }
              }
            }
          }
        },
        take: limit,
      });

      return results;
    } catch (error) {
      console.error("SearchEngine Error:", error);
      throw new Error("Arama sırasında veritabanı hatası oluştu.");
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
