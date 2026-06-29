const fs = require('fs');
const path = require('path');
const axios = require('axios');
const cheerio = require('cheerio');
require('dotenv').config({ path: path.join(__dirname, '../../.env.local') });

// Setup Gemini
const { GoogleGenAI } = require('@google/genai');
const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
const { YoutubeTranscript } = require('youtube-transcript');

const FAULT_CODE = process.argv[2];

if (!FAULT_CODE) {
  console.error('Kullanım: node crawlModelFaultCodes.js <ARIZA_KODU>');
  console.error('Örnek: node crawlModelFaultCodes.js P0171');
  process.exit(1);
}

const PUBLIC_DIR = path.join(__dirname, '../../public');
const FAULT_CODES_DIR = path.join(PUBLIC_DIR, 'ariza_kodlari');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function scrapeDuckDuckGo(query) {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const response = await axios.get(url, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });
    
    const $ = cheerio.load(response.data);
    const results = [];
    
    $('.result').each((i, el) => {
      if (i >= 3) return; // Top 3 results
      const title = $(el).find('.result__title a').text().trim();
      const snippet = $(el).find('.result__snippet').text().trim();
      const link = $(el).find('.result__title a').attr('href');
      
      if (title && snippet) {
        results.push({ title, snippet, link: link ? `https:${link}` : '' });
      }
    });
    
    return results;
  } catch (err) {
    console.error(`Arama hatası (${query}):`, err.message);
    return [];
  }
}

async function getAIFaultAnalysis(brand, model, faultCode, transcriptText = "") {
  try {
    const prompt = `
Sen uzman bir Alman araç mekanik ustasısın. 
Şu araç ve arıza kodu için bana detaylı bir analiz ver:
Araç: ${brand} ${model}
Arıza Kodu: ${faultCode}

${transcriptText ? `EK BİLGİ (İnternetten bulunan bir tamir videosunun deşifresi/konuşmaları):\n${transcriptText}\nLütfen bu videodaki usta konuşmalarını dikkatlice analiz et ve ustanın yaptığı müdahaleyi arıza çözümüne ve video senaryosuna yansıt.` : ""}

Lütfen cevabını tamamen Türkçe ve aşağıdaki JSON formatında ver. Sadece geçerli bir JSON döndür, hiçbir markdown veya açıklama ekleme.

{
  "description": "Arıza kodunun kısa teknik açıklaması",
  "symptoms": ["Belirti 1", "Belirti 2"],
  "commonCauses": ["Sebep 1", "Sebep 2"],
  "stepByStepSolution": [
    "Çözüm adımı 1",
    "Çözüm adımı 2"
  ],
  "estimatedCostInfo": "Maliyet ve onarım süresi hakkında kısa bilgi",
  "severity": "Low | Medium | High | Critical",
  "aiVideoScript": "Kendi YouTube kanalımızda yayınlayacağımız, profesyonel bir dış sesin okuyabileceği 1 dakikalık akıcı bir 'Arıza Çözüm Senaryosu'. Mutlaka videonun girişinde veya bir yerinde 'Bursalı Oto'nun babadan oğula geçen 40 yıllık tecrübesiyle...' gibi güven verici bir ifade kullan. (Eğer varsa videodaki tamir aşamalarını da içersin)"
}
`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    const text = response.text;
    // Extract JSON block if it's wrapped in markdown
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.error(`AI API Hatası (${brand} ${model}):`, err.message);
    return null;
  }
}

async function startCrawler() {
  console.log(`=== [AI Destekli] Arıza Kodu Tarayıcı Başlatıldı: ${FAULT_CODE} ===\n`);
  
  if (!fs.existsSync(FAULT_CODES_DIR)) {
    console.error('ariza_kodlari klasörü yok. Lütfen önce initFaultCodesTree.js çalıştırın.');
    return;
  }

  const brands = fs.readdirSync(FAULT_CODES_DIR).filter(file => fs.statSync(path.join(FAULT_CODES_DIR, file)).isDirectory());
  
  let totalProcessed = 0;

  for (const brand of brands) {
    const brandPath = path.join(FAULT_CODES_DIR, brand);
    const models = fs.readdirSync(brandPath).filter(file => fs.statSync(path.join(brandPath, file)).isDirectory());
    
    for (const model of models) {
      // SADECE TEST İÇİN İLK 3 MODELİ TARA (Kotaları tüketmemek için)
      // Gerçek kullanımda bu satırı kaldırabilirsiniz:
      // if (totalProcessed >= 3) break; 

      const codePath = path.join(brandPath, model, FAULT_CODE);
      const dataPath = path.join(codePath, 'data.json');
      
      if (fs.existsSync(dataPath)) {
        console.log(`[ATLANDI] ${brand} ${model} için ${FAULT_CODE} zaten mevcut.`);
        continue;
      }

      console.log(`\n🔍 Analiz Ediliyor: ${brand} ${model} -> ${FAULT_CODE}`);
      
      const cleanBrand = brand.replace(/-/g, ' ');
      const cleanModel = model.replace(/-/g, ' ');
      
      console.log(` └─ YouTube'da tamir videoları aranıyor...`);
      // Arama: YouTube Videoları
      const videoQuery = `"${cleanBrand}" "${cleanModel}" "${FAULT_CODE}" fix site:youtube.com`;
      const rawVideos = await scrapeDuckDuckGo(videoQuery);
      
      const videos = rawVideos.map(v => {
        const match = v.link.match(/uddg=([^&]+)/);
        const actualUrl = match ? decodeURIComponent(match[1]) : v.link;
        return { title: v.title, url: actualUrl, snippet: v.snippet };
      }).filter(v => v.url.includes('youtube.com/watch'));

      let transcriptText = "";
      if (videos.length > 0) {
        console.log(` └─ İlk video için konuşma dökümü (Transcript) çekiliyor...`);
        try {
          const transcript = await YoutubeTranscript.fetchTranscript(videos[0].url);
          transcriptText = transcript.map(t => t.text).join(' ');
          if (transcriptText.length > 8000) {
            transcriptText = transcriptText.substring(0, 8000) + "...";
          }
          console.log(`    └─ Başarılı! (${transcriptText.length} karakter metin alındı)`);
        } catch (e) {
          console.log(`    └─ Bu video için altyazı bulunamadı veya çekilemedi.`);
        }
      }

      console.log(` └─ Gemini Yapay Zeka ile arıza analizi yapılıyor...`);
      // Gemini API ile arıza analizi
      const aiAnalysis = await getAIFaultAnalysis(cleanBrand, cleanModel, FAULT_CODE, transcriptText);
      
      if (!aiAnalysis) {
        console.log(` └─ AI verisi alınamadı, atlanıyor.`);
        await delay(2000);
        continue;
      }

      const data = {
        faultCode: FAULT_CODE,
        brand: cleanBrand,
        model: cleanModel,
        updatedAt: new Date().toISOString(),
        aiAnalysis: aiAnalysis,
        videos: videos
      };

      // Kaydet
      fs.mkdirSync(codePath, { recursive: true });
      fs.writeFileSync(dataPath, JSON.stringify(data, null, 2), 'utf-8');
      
      console.log(` └─ [KAYDEDİLDİ] Başarılı! (${videos.length} video)`);
      totalProcessed++;
      
      await delay(3000); // Rate limit koruması
    }
  }
  
  console.log(`\n=== Tarama Tamamlandı ===`);
}

startCrawler();
