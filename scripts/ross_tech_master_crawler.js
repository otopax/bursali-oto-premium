import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Ross-Tech Wiki MASTER Web Crawler & Parser (Araç ve Motor Kodu Ayrıştırmalı)
 * Tüm VAG (VW, Audi, SEAT, Škoda, Porsche) arıza kodlarını Ross-Tech Wiki'nin
 * TÜM sayfalarından tarar. Metin içinden Marka, Araç Modeli ve Spesifik Motor Kodlarını (2.0 TDI, 1.4 TSI, EA888, DQ200 vb.) 
 * otomatik ayrıştırarak `public/ariza_kodlari_data/` dizinine kaydeder.
 */

const FAULTS_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

if (!fs.existsSync(FAULTS_DIR)) {
  fs.mkdirSync(FAULTS_DIR, { recursive: true });
}

const BASE_URL = 'https://wiki.ross-tech.com';
const CATEGORY_FAULTS_URL = `${BASE_URL}/wiki/index.php/Category:Fault_Codes`;

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

// Araç Modeli ve Motor Kodu Otomatik Tespit Fonksiyonu
function extractVehicleAndEngineInfo(fullText) {
  const textUpper = fullText.toUpperCase();

  // Model tespiti
  const detectedModels = [];
  if (textUpper.includes('A3') || textUpper.includes('GOLF') || textUpper.includes('LEON')) detectedModels.push('Audi A3 / VW Golf / Seat Leon');
  if (textUpper.includes('A4') || textUpper.includes('PASSAT') || textUpper.includes('OCTAVIA')) detectedModels.push('Audi A4 / VW Passat / Skoda Octavia');
  if (textUpper.includes('A6') || textUpper.includes('A5') || textUpper.includes('Q5')) detectedModels.push('Audi A6 / A5 / Q5');
  if (textUpper.includes('TIGUAN') || textUpper.includes('TOUAREG') || textUpper.includes('Q7')) detectedModels.push('VW Tiguan / Touareg / Audi Q7');
  if (textUpper.includes('POLO') || textUpper.includes('IBIZA') || textUpper.includes('FABIA')) detectedModels.push('VW Polo / Seat Ibiza / Skoda Fabia');

  if (detectedModels.length === 0) {
    detectedModels.push('Tüm VAG Grubu Modeller (Audi, VW, Seat, Skoda, Porsche)');
  }

  // Motor Kodu ve Şanzıman Tespiti
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

async function fetchAllFaultLinks(initialUrl) {
  let currentUrl = initialUrl;
  let allLinks = [];
  let pageCounter = 1;

  while (currentUrl && pageCounter <= 50) {
    try {
      console.log(`📡 Kategori Sayfası ${pageCounter} taranıyor: ${currentUrl}`);
      const response = await axios.get(currentUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept-Language': 'en-US,en;q=0.9'
        },
        timeout: 10000
      });

      const $ = cheerio.load(response.data);
      let pageLinksCount = 0;

      $('#mw-pages .mw-category a, #mw-pages .mw-content-ltr a').each((_, el) => {
        const href = $(el).attr('href');
        const title = $(el).text().trim();
        if (href && !href.includes('Category:') && !href.includes('Special:')) {
          allLinks.push({
            title,
            url: href.startsWith('http') ? href : `${BASE_URL}${href}`
          });
          pageLinksCount++;
        }
      });

      console.log(`  -> Bu sayfada ${pageLinksCount} arıza linki bulundu.`);

      const nextLinkEl = $('#mw-pages a:contains("next page"), #mw-pages a:contains("next 200")').first();
      if (nextLinkEl && nextLinkEl.attr('href')) {
        const nextHref = nextLinkEl.attr('href');
        currentUrl = nextHref.startsWith('http') ? nextHref : `${BASE_URL}${nextHref}`;
        pageCounter++;
        await new Promise((r) => setTimeout(r, 1500));
      } else {
        currentUrl = null;
      }

    } catch (err) {
      console.warn(`⚠ Sayfa taranamadı: ${currentUrl}`, err.message);
      break;
    }
  }

  return allLinks;
}

async function startMasterCrawl() {
  console.log('🌐 ========================================================');
  console.log('🚀 SINIRSIZ GÜVENLİ ROSS-TECH MASTER CRAWLER (MOTOR & MODEL AYRIŞTIRMALI)...');
  console.log('  -> IP Ban Koruması: 2.0 - 3.0 Saniye Dinamik Gecikme');
  console.log('🌐 ========================================================\n');

  const faultLinks = await fetchAllFaultLinks(CATEGORY_FAULTS_URL);
  console.log(`\n📌 TOPLAM BULUNAN TÜM VAG ARIZA KODU SAYISI: ${faultLinks.length}\n`);

  let savedFaults = 0;
  for (let i = 0; i < faultLinks.length; i++) {
    const link = faultLinks[i];
    const pageData = await scrapeFaultPage(link.url, link.title);
    if (pageData) {
      const filePath = path.join(FAULTS_DIR, `${pageData.code}.json`);
      fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2), 'utf-8');
      console.log(`  [${i + 1}/${faultLinks.length}] ✅ ${pageData.code} -> Model: ${pageData.models.join(', ')} | Motor: ${pageData.engines.join(', ')}`);
      savedFaults++;
    }
    const delay = 2000 + Math.floor(Math.random() * 1000);
    await new Promise((r) => setTimeout(r, delay));
  }

  console.log(`\n🎉 TAM PARSING CRAWLER TAMAMLANDI!`);
  console.log(`✅ Toplam ${savedFaults} VAG arıza çözümü Araç ve Motor Kodu ayrıştırması ile kütüphaneye kaydedildi.\n`);
}

async function scrapeFaultPage(pageUrl, rawTitle) {
  try {
    const response = await axios.get(pageUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      },
      timeout: 8000
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

    // Otomatik Araç ve Motor Kodu Ayrıştırma
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
    return null;
  }
}

startMasterCrawl();
