import { getFaultCodeData, getAvailableFaultBrands, getModelsForFaultBrand, getCodesForModel } from './faultCodeUtils';
import { getFuseboxData, getAvailableFuseboxBrands, getModelsForFuseboxBrand } from './fuseboxUtils';
import { prisma } from './prisma';

// ==========================================
// 1. JSON FILE PROVIDER (MEVCUT AKTİF SİSTEM)
// ==========================================
class JsonFileProvider {
  async getFaultBrands() {
    return getAvailableFaultBrands();
  }

  async getFaultModels(brandSlug) {
    return getModelsForFaultBrand(brandSlug);
  }

  async getFaultCodes(brandSlug, modelSlug) {
    return getCodesForModel(brandSlug, modelSlug);
  }

  async getFaultCodeAnalysis(brandSlug, modelSlug, codeSlug) {
    return getFaultCodeData(brandSlug, modelSlug, codeSlug);
  }

  async getFuseboxBrands() {
    return getAvailableFuseboxBrands();
  }

  async getFuseboxModels(brandSlug) {
    return getModelsForFuseboxBrand(brandSlug);
  }

  async getFuseboxDiagrams(brandSlug, modelSlug) {
    return getFuseboxData(brandSlug, modelSlug);
  }
}

// ==========================================
// 2. POSTGRESQL PROVIDER (HAZIRLIK AŞAMASI)
// ==========================================
class PostgresProvider {
  // Bu sınıf ileride Prisma ORM ile doldurulacaktır.
  async getFaultBrands() {
    const brands = await prisma.brand.findMany({ orderBy: { name: 'asc' } });
    return brands.map(b => b.slug);
  }

  async getFaultModels(brandSlug) {
    const brand = await prisma.brand.findUnique({ 
      where: { slug: brandSlug }, 
      include: { models: { orderBy: { name: 'asc' } } } 
    });
    if (!brand) return [];
    return brand.models.map(m => m.slug);
  }

  async getFaultCodes(brandSlug, modelSlug) {
    const model = await prisma.model.findUnique({ 
      where: { slug: modelSlug }, 
      include: { faultCodes: { orderBy: { code: 'asc' } } } 
    });
    if (!model) return [];
    return model.faultCodes.map(c => c.code);
  }

  async getFaultCodeAnalysis(brandSlug, modelSlug, codeSlug) {
    // 1. Postgres'ten dene
    const model = await prisma.model.findUnique({ where: { slug: modelSlug } });
    let data = null;
    
    if (model) {
      data = await prisma.faultCode.findUnique({
        where: { code_modelId: { code: codeSlug, modelId: model.id } }
      });
    }
    
    // 2. Fallback (Mavi-Yeşil Geçiş)
    if (!data) {
       console.log(`[Fallback] ${codeSlug} veritabanında yok, JSON'dan okunuyor.`);
       return getFaultCodeData(brandSlug, modelSlug, codeSlug);
    }
    
    return {
      faultCode: data.code,
      brand: brandSlug,
      model: modelSlug,
      aiAnalysis: data.aiAnalysis,
      videos: data.videos
    };
  }

  async getFuseboxBrands() {
    return null; // Fallback to JSON
  }

  async getFuseboxModels(brandSlug) {
    return null; // Fallback to JSON
  }

  async getFuseboxDiagrams(brandSlug, modelSlug) {
    return null; // Fallback to JSON
  }
}

// ==========================================
// 3. PROVIDER SEÇİCİ (FACTORY)
// ==========================================
const currentProviderType = process.env.DATA_PROVIDER || 'json'; // Varsayılan olarak JSON okur

let activeProvider;
if (currentProviderType === 'postgres') {
  activeProvider = new PostgresProvider();
} else {
  activeProvider = new JsonFileProvider();
}

// Uygulamanın geri kalanı (Chatbot vb.) bu objeyi kullanacak.
// Veritabanına geçtiğimiz gün, .env.local dosyasına gidip DATA_PROVIDER=postgres yazmamız yeterli olacak!
export const DataAccessLayer = activeProvider;
