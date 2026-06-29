const fs = require('fs');
const path = require('path');
const { addCrawlerJob } = require('../lib/queue');

const PUBLIC_DIR = path.join(__dirname, '../../public');
const FAULT_CODES_DIR = path.join(PUBLIC_DIR, 'ariza_kodlari');
const DATA_DIR = path.join(__dirname, '../data');
const CODES_FILE = path.join(DATA_DIR, 'obd2_codes.json');

const delay = ms => new Promise(res => setTimeout(res, ms));

async function startProducer() {
  console.log(`=== BULLMQ ÜRETİCİ (PRODUCER) MOTORU BAŞLATILIYOR ===\n`);
  
  if (!fs.existsSync(CODES_FILE)) {
    console.error('Hata: obd2_codes.json bulunamadı.');
    return;
  }

  const faultCodes = JSON.parse(fs.readFileSync(CODES_FILE, 'utf-8'));
  const brands = fs.readdirSync(FAULT_CODES_DIR).filter(file => fs.statSync(path.join(FAULT_CODES_DIR, file)).isDirectory());
  
  console.log(`Hedef: ${faultCodes.length} Kod x ${brands.length} Marka\n`);

  let addedJobs = 0;

  for (const faultCode of faultCodes) {
    for (const brand of brands) {
      const brandPath = path.join(FAULT_CODES_DIR, brand);
      const models = fs.readdirSync(brandPath).filter(file => fs.statSync(path.join(brandPath, file)).isDirectory());
      
      for (const model of models) {
        const codePath = path.join(brandPath, model, faultCode);
        const dataPath = path.join(codePath, 'data.json');
        
        // Eğer veri daha önce indirildiyse atla
        if (fs.existsSync(dataPath)) {
          continue;
        }

        const cleanBrand = brand.replace(/-/g, ' ');
        const cleanModel = model.replace(/-/g, ' ');
        
        // İşçi (Worker) için iş paketini hazırla
        const payload = {
          brand: cleanBrand,
          model: cleanModel,
          faultCode: faultCode,
          codePath: codePath,
          dataPath: dataPath
        };

        // Kuyruğa ekle
        await addCrawlerJob(`scrape_${faultCode}`, payload);
        addedJobs++;
        
        console.log(`[KUYRUĞA EKLENDİ] ${faultCode} | ${cleanBrand} ${cleanModel}`);
        
        // Üreticiyi çok hızlı boğmamak için ufak bekleme
        await delay(100); 
      }
    }
  }
  
  console.log(`\n=== ÜRETİCİ GÖREVİNİ TAMAMLADI ===`);
  console.log(`Toplam ${addedJobs} adet iş başarıyla kuyruğa fırlatıldı!`);
  process.exit(0);
}

startProducer();
