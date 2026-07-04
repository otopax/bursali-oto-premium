require('dotenv').config({ path: '.env.local' });
const fs = require('fs');
const path = require('path');
const { searchYouTubeVideos } = require('../src/lib/youtubeScraper');
const { GoogleGenAI } = require('@google/genai');

const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });

const DATA_DIR = path.join(__dirname, '../public/ariza_kodlari_data');
const STATE_FILE = path.join(DATA_DIR, '_miner_state.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Bazı yaygın OBD2 kodları (Test için 10 adet)
const CODES_TO_MINE = [
  "P0171", "P0420", "P0300", "P0455", "P0133", "P0430", "P0128", "P0174", "P0340", "P0113"
];

const { YoutubeTranscript } = require('youtube-transcript');

async function generateAIAnalysis(code) {
  const prompt = `
  Sen uzman bir otomotiv teknisyenisin. Lütfen "${code}" OBD-II arıza kodunu analiz et.
  Çıktıyı SADECE JSON formatında ver, hiçbir markdown veya açıklama ekleme.
  Format şu şekilde olmalı:
  {
    "description": "Kısa teknik açıklama",
    "severity": "Low" | "Medium" | "High" | "Critical",
    "symptoms": ["Belirti 1", "Belirti 2"],
    "commonCauses": ["Sebep 1", "Sebep 2"],
    "stepByStepSolution": ["Adım 1", "Adım 2"],
    "estimatedCostInfo": "Tahmini maliyet ve süre açıklaması"
  }
  `;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json"
      }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.error(`Gemini AI Error for ${code}:`, error.message);
    return null;
  }
}

async function analyzeVideoTranscript(url, code) {
  try {
    const transcriptArray = await YoutubeTranscript.fetchTranscript(url);
    const fullText = transcriptArray.map(t => t.text).join(' ');

    const prompt = `
Sen uzman bir baş ustasın. Aşağıdaki metin, bir mekanik ustasının ${code} arıza kodunu tamir ederken çektiği bir YouTube videosunun İngilizce (veya Türkçe) otomatik altyazı dökümüdür.
Metni analiz et ve bu videoda ustanın tam olarak ne yaptığını Türkçe olarak özetle. Çıktıyı SADECE JSON formatında ver.
Format:
{
  "summary": "Ustanın videoda genel olarak ne yaptığı (1-2 cümle)",
  "partsReplacedOrCleaned": ["Temizlenen veya değişen parça 1"],
  "mechanicTips": ["Ustanın verdiği teknik bir ipucu veya uyarı"]
}
VİDEO ALTYAZISI:
${fullText}
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: { responseMimeType: "application/json" }
    });

    return JSON.parse(response.text);
  } catch (error) {
    console.log(`- Video analysis skipped (no transcript or error): ${error.message}`);
    return null;
  }
}

async function mineFaultCode(code) {
  console.log(`\n🔍 Mining started for: ${code}`);

  // 1. YouTube Videos
  console.log(`- Fetching videos...`);
  const videos = await searchYouTubeVideos(`${code} obd2 repair tutorial`, 3);

  // 2. Analyze Top Video Transcript
  let topVideoAnalysis = null;
  if (videos && videos.length > 0) {
    console.log(`- Analyzing top video transcript...`);
    topVideoAnalysis = await analyzeVideoTranscript(videos[0].url, code);
  }

  // 3. AI Analysis
  console.log(`- Generating overall AI analysis...`);
  const aiAnalysis = await generateAIAnalysis(code);

  if (!aiAnalysis) {
    console.log(`❌ Failed to generate AI analysis for ${code}`);
    return false;
  }

  const output = {
    code,
    ...aiAnalysis,
    videos,
    videoAnalysis: topVideoAnalysis
  };

  const filePath = path.join(DATA_DIR, `${code}.json`);
  fs.writeFileSync(filePath, JSON.stringify(output, null, 2), 'utf-8');
  console.log(`✅ Saved ${code} to ${filePath}`);
  return true;
}

async function runMiner() {
  console.log("🚀 Fault Code Miner Started...");
  
  let state = { completed: [] };
  if (fs.existsSync(STATE_FILE)) {
    state = JSON.parse(fs.readFileSync(STATE_FILE, 'utf-8'));
  }

  for (const code of CODES_TO_MINE) {
    if (state.completed.includes(code)) {
      console.log(`⏭️ Skipping ${code} (Already completed)`);
      continue;
    }

    const success = await mineFaultCode(code);
    if (success) {
      state.completed.push(code);
      fs.writeFileSync(STATE_FILE, JSON.stringify(state, null, 2));
    }

    // Rate limiting: wait 3 seconds before next request
    await new Promise(r => setTimeout(r, 3000));
  }

  console.log("\n🎉 Mining Complete!");
}

runMiner();
