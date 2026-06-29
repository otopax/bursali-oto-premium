const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });
const { GoogleGenAI } = require('@google/genai');
const { PrismaClient } = require('@prisma/client');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
const prisma = new PrismaClient();

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function run() {
  console.log('=== GEÇMİŞ VERİLER İÇİN VEKTÖR (EMBEDDING) ÜRETİMİ BAŞLIYOR ===');
  
  // Veritabanındaki tüm arıza kodlarını çek
  const faultCodes = await prisma.faultCode.findMany({
    include: {
      model: {
        include: { brand: true }
      }
    }
  });

  console.log(`Toplam ${faultCodes.length} adet arıza kodu bulundu.`);

  for (let i = 0; i < faultCodes.length; i++) {
    const fc = faultCodes[i];
    
    // Eğer yapay zeka analizi yoksa atla
    if (!fc.aiAnalysis) {
      console.log(`[ATLANDI] ${fc.code} (Analiz verisi yok)`);
      continue;
    }

    // Halihazırda vektörü var mı kontrol et (RAW query ile, çünkü Unsupported field'lar normal select ile gelmez)
    const existingVector = await prisma.$queryRaw`SELECT embedding FROM "FaultCode" WHERE id = ${fc.id} AND embedding IS NOT NULL`;
    if (existingVector.length > 0) {
      console.log(`[MEVCUT] ${fc.code} zaten vektörlenmiş.`);
      continue;
    }

    try {
      // Vektör modeline yedirilecek olan Zengin Metin (Context)
      const aiData = fc.aiAnalysis;
      const textToEmbed = `Arıza Kodu: ${fc.code}. Araç: ${fc.model.brand.name} ${fc.model.name}. Açıklama: ${aiData.description}. Belirtiler: ${(aiData.symptoms || []).join(', ')}. Nedenler: ${(aiData.commonCauses || aiData.causes || []).join(', ')}. Çözümler: ${(aiData.stepByStepSolution || []).join(', ')}.`;

      // API limitlerine takılmamak için bekle
      await delay(2000);

      // Gemini'den vektörü al
      const response = await ai.models.embedContent({
        model: 'gemini-embedding-001',
        contents: textToEmbed,
      });

      const vector = response.embeddings[0].values;
      
      // PostgreSQL'e raw SQL ile yaz (Prisma'da Unsupported tip olduğu için array -> string formatında postgres'e yollanır)
      // Ancak Prisma driver vector'ü doğrudan kabul etmeyebilir, JSON.stringify edip cast etmemiz gerekebilir.
      // PgVector array cast formatı: '[1.0, 2.0, ...]'::vector
      const vectorStr = `[${vector.join(',')}]`;
      
      await prisma.$executeRawUnsafe(
        `UPDATE "FaultCode" SET embedding = $1::vector WHERE id = $2`, 
        vectorStr, 
        fc.id
      );

      console.log(`[BAŞARILI] ${fc.code} vektöre çevrilip veritabanına işlendi. (${i + 1}/${faultCodes.length})`);
    } catch (err) {
      console.error(`[HATA] ${fc.code} vektörlenirken hata oluştu: ${err.message}`);
    }
  }

  console.log('=== VEKTÖR ÜRETİMİ TAMAMLANDI ===');
  await prisma.$disconnect();
}

run();
