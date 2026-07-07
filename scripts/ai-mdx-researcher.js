const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });

// Destructure from genai
const { GoogleGenAI } = require('@google/genai');

const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY;
if (!apiKey) {
  console.error("HATA: GOOGLE_GENERATIVE_AI_API_KEY .env.local dosyasında bulunamadı.");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey: apiKey });
const FAULTS_DIR = path.join(__dirname, '../src/content/faults');

async function processMdxFile(filePath, fileName) {
  const fileContent = fs.readFileSync(filePath, 'utf-8');
  const parsed = matter(fileContent);
  const data = parsed.data; // frontmatter (title, brand, model, slug, image)
  
  const currentContent = parsed.content.trim();
  
  // Eğer içerik zaten uzunsa (400 kelimeden fazlaysa) atla
  if (currentContent.split(' ').length > 300) {
    console.log(`[ATLANDI] ${fileName} zaten zenginleştirilmiş.`);
    return true;
  }
  
  console.log(`[ARAŞTIRILIYOR] ${fileName}...`);
  
  const prompt = `Sen 20 yıllık uzman bir Alman araç mekaniği ve teknik yazarısın. Senden "Bursalı Oto Servis" (Fethiye'de bir özel servis) web sitesi için bir SEO blog/arıza makalesi yazmanı istiyorum.

Araç Markası: ${data.brand}
Araç Modelleri: ${data.model}
Arıza Başlığı: ${data.title}
Şu anki kısa notlar: ${currentContent}

Lütfen bu arıza için internetteki Bimmerpost, MBWorld veya resmi teknik bülten (TSB) verilerini sentezleyerek EN AZ 400 kelimelik DEVASA ve TEKNİK bir makale yaz. 

Makalede MUTLAKA şu Markdown başlıkları (##) olsun:
## Şikayet ve Belirtiler
(Sürücünün hissettiği detaylı sorunlar, sesler, ışıklar, performans kayıpları vs.)

## Kök Neden (Teknik Analiz)
(Arızanın mekanik/elektronik olarak neden olduğu. Hatalı plastik kullanımı, ısıya dayanıksızlık, yanlış yağ kullanımı vb. Varsa bilinen parça numaraları veya TSB detayları.)

## Çözüm ve Onarım Süreci
(Hangi parçalar değişmeli? Revize edilmiş yeni parça takılması gerekiyor mu? Ustanın yapacağı işlemler.)

## Bursalı Oto Uzman Tavsiyesi
(Bu arıza acil midir? Yolda bırakır mı? Fethiye'deki Bursalı Oto servisimize neden gelmeliler? Tahmini zorluk derecesi nedir?)

SADECE MAKALENİN İÇERİĞİNİ YAZ. Başka hiçbir giriş/çıkış cümlesi kurma. Markdown formatında olsun.`;

  let retries = 5;
  while (retries > 0) {
    try {
      const response = await ai.models.generateContent({
          model: 'gemini-2.5-flash',
          contents: prompt,
      });
      
      const newContent = response.text;
      
      // Yeni MDX içeriğini oluştur (Frontmatter'ı koruyarak)
      const newFileContent = matter.stringify(newContent, data);
      
      fs.writeFileSync(filePath, newFileContent);
      console.log(`[BAŞARILI] ${fileName} detaylı olarak yeniden yazıldı.`);
      return true;
    } catch (error) {
      console.warn(`[UYARI] Hata oluştu: ${error.message}. ${fileName} için 60 saniye bekleniyor... Kalan deneme: ${retries}`);
      await delay(60000); // 60 saniye bekle
      retries--;
    }
  }
  console.error(`[HATA] ${fileName} maksimum deneme sayısına ulaştı, atlanıyor.`);
  return false;
}

async function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function main() {
  const files = fs.readdirSync(FAULTS_DIR).filter(f => f.endsWith('.mdx'));
  console.log(`Toplam ${files.length} MDX dosyası bulundu. Araştırma başlıyor...\n`);
  
  for (let i = 0; i < files.length; i++) {
    const fileName = files[i];
    const filePath = path.join(FAULTS_DIR, fileName);
    
    const success = await processMdxFile(filePath, fileName);
    
    // Rate limit yememek için 4 saniye bekle
    if (success && i < files.length - 1) {
      console.log(`Rate-limit koruması: 4 saniye bekleniyor... (${i+1}/${files.length})`);
      await delay(4000);
    }
  }
  
  console.log("\n✅ TÜM ARIZA MAKALELERİ YAPAY ZEKA İLE ZENGİNLEŞTİRİLDİ!");
}

main();
