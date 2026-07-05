const { PrismaClient } = require('@prisma/client');
const fs = require('fs');
const path = require('path');
// Note: Requires @google/genai package
// const { GoogleGenAI } = require('@google/genai');

const prisma = new PrismaClient();
// const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

const DATA_DIR = path.join(__dirname, '../data/raw');

async function getEmbedding(text) {
  // Placeholder for real Gemini embedding generation
  // const response = await ai.models.embedContent({
  //   model: 'text-embedding-004',
  //   contents: text,
  // });
  // return response.embeddings[0].values;
  
  // Return a dummy vector of 3072 dimensions for testing
  return Array(3072).fill(0.1);
}

async function processFaultCodes() {
  console.log('🚀 RAG Eğitimi Başlıyor...');
  
  if (!fs.existsSync(DATA_DIR)) {
    console.log(`⚠️ Veri klasörü bulunamadı: ${DATA_DIR}. Klasör oluşturuluyor...`);
    fs.mkdirSync(DATA_DIR, { recursive: true });
    console.log('Lütfen eğitilecek JSON dosyalarını bu klasöre ekleyin.');
    return;
  }

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json'));
  
  if (files.length === 0) {
    console.log('⚠️ Eğitim için JSON dosyası bulunamadı.');
    return;
  }

  let totalProcessed = 0;

  for (const file of files) {
    const filePath = path.join(DATA_DIR, file);
    console.log(`📄 İşleniyor: ${file}`);
    
    try {
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Varsayım: JSON formatı [{ code: "P0171", description: "...", symptoms: "..." }]
      for (const item of data) {
        if (!item.code) continue;

        // 1. Prisma ile veritabanına kaydet veya güncelle
        const faultCode = await prisma.faultCode.upsert({
          where: { code: item.code },
          update: {
            description: item.description,
            symptoms: item.symptoms,
            commonCauses: item.commonCauses,
          },
          create: {
            code: item.code,
            description: item.description || 'Bilinmeyen Arıza',
            severity: item.severity || 'MEDIUM',
            symptoms: item.symptoms,
            commonCauses: item.commonCauses,
          }
        });

        // 2. İçeriği birleştir ve vektör embedding oluştur
        const contentForAI = `Arıza Kodu: ${item.code}. Açıklama: ${item.description}. Belirtiler: ${JSON.stringify(item.symptoms)}. Nedenler: ${JSON.stringify(item.commonCauses)}`;
        const vector = await getEmbedding(contentForAI);
        const vectorString = `[${vector.join(',')}]`;

        // 3. pgvector alanını Raw SQL ile güncelle (Prisma Unsupported type)
        await prisma.$executeRaw`
          UPDATE "FaultCode" 
          SET embedding = ${vectorString}::vector,
              "embeddingModel" = 'gemini-text-embedding-004',
              "embeddingVersion" = 1
          WHERE id = ${faultCode.id}
        `;
        
        totalProcessed++;
        if (totalProcessed % 10 === 0) {
          console.log(`⏳ İşlenen kod sayısı: ${totalProcessed}`);
        }
      }
    } catch (err) {
      console.error(`❌ ${file} işlenirken hata oluştu:`, err.message);
    }
  }

  console.log(`✅ RAG Eğitimi Tamamlandı! Toplam ${totalProcessed} arıza kodu vektör veritabanına işlendi.`);
}

processFaultCodes()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
