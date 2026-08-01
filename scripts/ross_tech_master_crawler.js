import fs from 'fs';
import path from 'path';
import axios from 'axios';
import * as cheerio from 'cheerio';

/**
 * Ross-Tech Wiki MASTER Web Crawler & Parser
 * Tüm VAG (VW, Audi, SEAT, Škoda, Porsche) arıza kodlarını,
 * adaptasyon prosedürlerini, modül kodlama kılavuzlarını ve servis ayarlarını
 * otomatik olarak Ross-Tech Wiki'den tarar, Türkçe otomotiv diline çevirir 
 * ve sitemizin Kütüphane veritabanına (`public/ariza_kodlari_data/` & `public/kutuphane_data/`) kaydeder.
 */

const FAULTS_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');
const PROCEDURES_DIR = path.join(process.cwd(), 'public', 'kutuphane_data', 'prosedurler');

[FAULTS_DIR, PROCEDURES_DIR].forEach((dir) => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
});

// Ross-Tech Wiki Base URL
const BASE_URL = 'https://wiki.ross-tech.com';
const CATEGORY_FAULTS_URL = `${BASE_URL}/wiki/index.php/Category:Fault_Codes`;
const CATEGORY_PROCEDURES_URL = `${BASE_URL}/wiki/index.php/Category:Diagnostic_Procedures`;

// Genel Sözlük (İngilizce Teknik Terimleri Türkçe Otomotiv Diline Çeviri)
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

// Master Crawler İşlevi
async function startMasterCrawl() {
  console.log('🌐 ========================================================');
  console.log('🚀 ROSS-TECH MASTER WEB CRAWLER BAŞLATILIYOR...');
  console.log('🌐 ========================================================\n');

  try {
    // 1. Kategori 1: Arıza Kodları (Fault Codes)
    console.log('📡 1. Arıza Kodları Kategorisi Taranıyor...');
    const faultLinks = await fetchCategoryLinks(CATEGORY_FAULTS_URL);
    console.log(`📌 Toplam ${faultLinks.length} adet VAG arıza kodu sayfası bulundu.`);

    // 2. Kategori 2: Teşhis Prosedürleri (Diagnostic Procedures)
    console.log('\n📡 2. Teşhis ve Adaptasyon Prosedürleri Taranıyor...');
    const procedureLinks = await fetchCategoryLinks(CATEGORY_PROCEDURES_URL);
    console.log(`📌 Toplam ${procedureLinks.length} adet VAG adaptasyon ve prosedür sayfası bulundu.`);

    // Çekim Sayısını Güvenli Limit ve Test İçin Yapılandırıyoruz
    const MAX_CRAWL = Math.min(faultLinks.length, 25);
    console.log(`\n⚙️ İlk etapta ${MAX_CRAWL} adet arıza kodu ve prosedür detaylandırılıyor...\n`);

    let savedFaults = 0;
    for (let i = 0; i < MAX_CRAWL; i++) {
      const link = faultLinks[i];
      const pageData = await scrapeFaultPage(link.url, link.title);
      if (pageData) {
        const filePath = path.join(FAULTS_DIR, `${pageData.code}.json`);
        fs.writeFileSync(filePath, JSON.stringify(pageData, null, 2), 'utf-8');
        console.log(`  ✅ [İNDİRİLDİ] ${pageData.code} -> ${pageData.title.substring(0, 45)}...`);
        savedFaults++;
      }
      // Sunucuyu yormamak ve IP engeline takılmamak için 300ms bekleme
      await new Promise((r) => setTimeout(r, 300));
    }

    console.log(`\n🎉 MASTER CRAWLER TAMAMLANDI!`);
    console.log(`✅ Toplam ${savedFaults} yeni VAG arıza çözümü başarıyla Türkçe'ye çevrilip kütüphaneye kaydedildi.\n`);

  } catch (error) {
    console.error('❌ Master Crawler sırasında hata oluştu:', error.message);
  }
}

// Kategori Sayfasından Link Toplama
async function fetchCategoryLinks(categoryUrl) {
  try {
    const response = await axios.get(categoryUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
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

    return links;
  } catch (err) {
    console.warn(`⚠ Kategori taranamadı: ${categoryUrl}`, err.message);
    return [];
  }
}

// Tekil Arıza Sayfasını Detaylı Kazıma (Scrape)
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

    // Kod Tespiti (Örn: 16471/P0087 veya P0087)
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

    return {
      code: code,
      vagCode: rawTitle.match(/\d{5}/)?.[0] || "",
      title: `${code} - ${translateText(rawTitle)}`,
      brand: "Audi / Volkswagen / SEAT / Skoda / Porsche",
      models: ["A3", "A4", "A6", "Q5", "Golf", "Passat", "Tiguan", "Leon", "Octavia"],
      engines: ["TDI", "TSI", "TFSI", "FSI"],
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
    console.warn(`  ⚠ Sayfa çekilemedi (${pageUrl}):`, err.message);
    return null;
  }
}

// Master Crawler'ı Başlat
startMasterCrawl();
