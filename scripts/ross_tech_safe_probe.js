import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Ross-Tech Safe Rate-Limited Test Crawler (GATE 2 Probe)
 * Tarama Hızı: 2.0 - 3.0 saniye gecikme (MediaWiki IP Ban & Rate Limit Koruması)
 * Test Kapsamı: İlk 25 kritik VAG arıza kodu
 */

const FAULTS_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

if (!fs.existsSync(FAULTS_DIR)) {
  fs.mkdirSync(FAULTS_DIR, { recursive: true });
}

const BASE_URL = 'https://wiki.ross-tech.com';
const CATEGORY_FAULTS_URL = `${BASE_URL}/wiki/index.php/Category:Fault_Codes`;
const TARGET_PROBE_COUNT = 25; // Güvenli test limiti

const TECH_DICTIONARY = {
  'Possible Symptoms': 'Olası Belirtiler ve Semptomlar',
  'Possible Causes': 'Kök Nedenler ve Muhtemel Sebepler',
  'Possible Solutions': 'Adım Adım Uzman Servis Çözümleri',
  'Special Notes': 'VAG Grubu Özel Servis ve Kronik Notları',
  'Check': 'Kontrol edin: ',
  'Replace': 'Değiştirin / Yenileyin: ',
  'Clean': 'Temizleyin: ',
  'Adaptation': 'Adaptasyon / Kalibrasyon Yapın: ',
  'Basic Settings': 'Temel Ayarları (Basic Settings) Yapın: ',
  'Wiring': 'Kablo Tesisatı ve Soketleri',
  'Fuse': 'Sigorta ve Röle Bağlantıları',
  'Sensor': 'Sensör Okuma Değerleri'
};

function translateText(text) {
  if (!text) return '';
  let translated = text;
  Object.entries(TECH_DICTIONARY).forEach(([en, tr]) => {
    translated = translated.replaceAll(en, tr);
  });
  return translated;
}

function extractVehicleAndEngineInfo(fullText) {
  const textUpper = fullText.toUpperCase();
  const detectedModels = [];

  if (textUpper.includes('A3') || textUpper.includes('GOLF') || textUpper.includes('LEON')) detectedModels.push('Audi A3 / VW Golf / Seat Leon');
  if (textUpper.includes('A4') || textUpper.includes('PASSAT') || textUpper.includes('OCTAVIA')) detectedModels.push('Audi A4 / VW Passat / Skoda Octavia');
  if (textUpper.includes('A6') || textUpper.includes('A5') || textUpper.includes('Q5')) detectedModels.push('Audi A6 / A5 / Q5');
  if (textUpper.includes('TIGUAN') || textUpper.includes('TOUAREG') || textUpper.includes('Q7')) detectedModels.push('VW Tiguan / Touareg / Audi Q7');
  if (textUpper.includes('POLO') || textUpper.includes('IBIZA') || textUpper.includes('FABIA')) detectedModels.push('VW Polo / Seat Ibiza / Skoda Fabia');

  if (detectedModels.length === 0) {
    detectedModels.push('Tüm VAG Grubu Modeller (Audi, VW, Seat, Skoda, Porsche)');
  }

  const detectedEngines = [];
  if (textUpper.includes('2.0') && textUpper.includes('TDI')) detectedEngines.push('2.0 TDI (CR Engine)');
  if (textUpper.includes('1.6') && textUpper.includes('TDI')) detectedEngines.push('1.6 TDI (CR Engine)');
  if (textUpper.includes('1.4') && (textUpper.includes('TSI') || textUpper.includes('TFSI'))) detectedEngines.push('1.4 TSI / TFSI (EA111 / EA211)');
  if (textUpper.includes('2.0') && (textUpper.includes('TSI') || textUpper.includes('TFSI'))) detectedEngines.push('2.0 TSI / TFSI (EA888 Gen2/Gen3)');
  if (textUpper.includes('1.8') && (textUpper.includes('TSI') || textUpper.includes('TFSI'))) detectedEngines.push('1.8 TSI / TFSI');
  if (textUpper.includes('3.0') && (textUpper.includes('TDI') || textUpper.includes('TSI'))) detectedEngines.push('3.0 TDI / TFSI V6');
  if (textUpper.includes('DSG') || textUpper.includes('DQ200') || textUpper.includes('DQ250') || textUpper.includes('DQ500')) detectedEngines.push('DSG Otomatik Şanzıman (DQ200 / DQ250 / DQ500)');

  if (detectedEngines.length === 0) {
    detectedEngines.push('Tüm VAG Benzinli (TSI/TFSI) ve Dizel (TDI) Motorlar');
  }

  return {
    models: Array.from(new Set(detectedModels)),
    engines: Array.from(new Set(detectedEngines))
  };
}

async function fetchFaultLinks() {
  console.log(`📡 Kategori Sayfası taranıyor: ${CATEGORY_FAULTS_URL}`);
  const response = await axios.get(CATEGORY_FAULTS_URL, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Accept-Language': 'en-US,en;q=0.9'
    },
    timeout: 10000
  });

  const $ = cheerio.load(response.data);
  const links = [];

  $('#mw-pages .mw-category a, #mw-pages .mw-content-ltr a').each((_, el) => {
    const href = $(el).attr('href');
    const title = $(el).text().trim();
    if (href && !href.includes('Category:') && !href.includes('Special:')) {
      links.push({
        title,
        url: href.startsWith('http') ? href : `${BASE_URL}${href}`
      });
    }
  });

  return links.slice(0, TARGET_PROBE_COUNT);
}

async function scrapeFaultPage(pageUrl, rawTitle) {
  try {
    const response = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        'Accept-Language': 'en-US,en;q=0.9'
      },
      timeout: 10000
    });

    const $ = cheerio.load(response.data);
    const content = $('#mw-content-text');
    const fullPageText = content.text();

    const codeMatch = rawTitle.match(/P\d{4}|U\d{4}|\d{5}/i);
    const code = codeMatch ? codeMatch[0].toUpperCase() : rawTitle.replace(/[^a-zA-Z0-9]/g, '_');

    const symptoms = [];
    const causes = [];
    const solutions = [];
    let specialNotes = "";

    content.find('h4, h3, h2').each((_, heading) => {
      const titleText = $(heading).text().trim();
      const nextList = $(heading).next('ul');

      if (titleText.includes('Symptoms')) {
        nextList.find('li').each((_, li) => symptoms.push(translateText($(li).text().trim())));
      } else if (titleText.includes('Causes')) {
        nextList.find('li').each((_, li) => causes.push(translateText($(li).text().trim())));
      } else if (titleText.includes('Solutions')) {
        nextList.find('li').each((_, li) => solutions.push(translateText($(li).text().trim())));
      } else if (titleText.includes('Special Notes')) {
        specialNotes = translateText($(heading).next('p, ul').text().trim());
      }
    });

    const vehicleInfo = extractVehicleAndEngineInfo(`${rawTitle} ${fullPageText} ${specialNotes}`);

    return {
      code: code,
      vagCode: rawTitle.match(/\d{5}/)?.[0] || "",
      title: `${code} - ${translateText(rawTitle)}`,
      brand: "Audi / Volkswagen / SEAT / Skoda / Porsche",
      models: vehicleInfo.models,
      engines: vehicleInfo.engines,
      severity: "Orta-Yüksek (VAG Teşhisi Gerekli)",
      symptoms: symptoms.length > 0 ? symptoms : ["Motor arıza ikaz lambası (MIL) yanıyor", "Performans ve çekiş düşüklüğü"],
      commonCauses: causes.length > 0 ? causes : ["Sensör okuma hatası veya tesisat temassızlığı", "Mekanik aşınma veya hava kaçağı"],
      stepByStepSolution: solutions.length > 0 ? solutions : [
        "1. VCDS / ODIS ile canlı veri grupları taranır.",
        "2. Tesisat ve voltaj beslemeleri test edilir.",
        "3. Gerekirse OEM yedek parça ile yenilenip adaptör sürüşü yapılır."
      ],
      technicalNotes: specialNotes || "VAG grubu araçlarda bu kod görüldüğünde öncelikle yetkili diyagnoz cihazı (ODIS/VCDS) ile canlı değer testi yapılmalıdır.",
      sourceUrl: pageUrl
    };

  } catch (err) {
    console.warn(`  ❌ Hata (${pageUrl}): ${err.message}`);
    return null;
  }
}

async function startSafeProbe() {
  console.log('============================================================');
  console.log('🛡️ ROSS-TECH SAFE RATE-LIMITED TEST CRAWLER (GATE 2 PROBE)');
  console.log('  -> Gecikme Süresi: 2.0 - 3.0 saniye (IP Ban Korumalı)');
  console.log(`  -> Hedef Limit: ${TARGET_PROBE_COUNT} VAG Arıza Kodu`);
  console.log('============================================================\n');

  const links = await fetchFaultLinks();
  console.log(`📌 Çekilecek arıza kodu sayısı: ${links.length}\n`);

  let successCount = 0;
  for (let i = 0; i < links.length; i++) {
    const link = links[i];
    console.log(`[${i + 1}/${links.length}] 🔄 Çekiliyor: ${link.title}...`);
    
    const data = await scrapeFaultPage(link.url, link.title);
    if (data) {
      const filePath = path.join(FAULTS_DIR, `${data.code}.json`);
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
      console.log(`   ✅ Kaydedildi -> Kod: ${data.code} | Models: ${data.models.length} | Engines: ${data.engines.length}`);
      successCount++;
    }

    const delay = 2000 + Math.floor(Math.random() * 1000);
    await new Promise(resolve => setTimeout(resolve, delay));
  }

  console.log('\n============================================================');
  console.log(`🎉 SAFE PROBE COMPLETED: ${successCount}/${links.length} arıza kodu kaydedildi.`);
  console.log('============================================================');
}

startSafeProbe().catch(console.error);
