const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
require('dotenv').config({ path: path.join(__dirname, '../../.env') }); // DB URL is in .env

const prisma = new PrismaClient();
const PUBLIC_DIR = path.join(__dirname, '../../public');
const FAULT_CODES_DIR = path.join(PUBLIC_DIR, 'ariza_kodlari');

async function migrate() {
  console.log('=== BÜYÜK GÖÇ BAŞLIYOR (JSON -> POSTGRESQL) ===');
  
  if (!fs.existsSync(FAULT_CODES_DIR)) {
    console.error('Hata: public/ariza_kodlari klasörü yok!');
    return;
  }

  const brands = fs.readdirSync(FAULT_CODES_DIR).filter(file => fs.statSync(path.join(FAULT_CODES_DIR, file)).isDirectory());
  
  let totalCodesInserted = 0;

  for (const brandSlug of brands) {
    // 1. Markayı veritabanında bul veya oluştur
    const brandName = brandSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    const brand = await prisma.brand.upsert({
      where: { slug: brandSlug },
      update: {},
      create: { slug: brandSlug, name: brandName }
    });

    console.log(`[Marka] ${brand.name} eklendi.`);

    const brandPath = path.join(FAULT_CODES_DIR, brandSlug);
    const models = fs.readdirSync(brandPath).filter(file => fs.statSync(path.join(brandPath, file)).isDirectory());

    for (const modelSlug of models) {
      // 2. Modeli veritabanında bul veya oluştur
      const modelName = modelSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const model = await prisma.model.upsert({
        where: { slug: modelSlug },
        update: {},
        create: { slug: modelSlug, name: modelName, brandId: brand.id }
      });

      const modelPath = path.join(brandPath, modelSlug);
      const codes = fs.readdirSync(modelPath).filter(file => fs.statSync(path.join(modelPath, file)).isDirectory());

      for (const faultCode of codes) {
        // 3. Klasördeki data.json'ı oku (eğer varsa)
        const codePath = path.join(modelPath, faultCode);
        const dataPath = path.join(codePath, 'data.json');
        
        let aiAnalysis = null;
        let videos = null;

        if (fs.existsSync(dataPath)) {
          const rawData = JSON.parse(fs.readFileSync(dataPath, 'utf-8'));
          aiAnalysis = rawData.aiAnalysis || null;
          videos = rawData.videos || null;
        }

        // 4. Arıza kodunu veritabanına JSON verileriyle birlikte bas
        // Prisma upsert kullanarak eğer kod zaten varsa güncelleyeceğiz
        await prisma.faultCode.upsert({
          where: {
            code_modelId: {
              code: faultCode,
              modelId: model.id
            }
          },
          update: {
            aiAnalysis: aiAnalysis ? aiAnalysis : undefined,
            videos: videos ? videos : undefined,
          },
          create: {
            code: faultCode,
            modelId: model.id,
            aiAnalysis: aiAnalysis,
            videos: videos
          }
        });

        totalCodesInserted++;
        if (totalCodesInserted % 100 === 0) {
          console.log(`  └─ ${totalCodesInserted} adet arıza kodu taşındı...`);
        }
      }
    }
  }

  console.log(`\n=== GÖÇ TAMAMLANDI ===`);
  console.log(`Toplam ${totalCodesInserted} adet arıza kodu PostgreSQL'e aktarıldı.`);
  await prisma.$disconnect();
}

migrate().catch(e => {
  console.error(e);
  process.exit(1);
});
