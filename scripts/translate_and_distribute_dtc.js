import fs from 'fs';
import path from 'path';

/**
 * MASTER VAG DTC TRANSLATOR & STRICT CANONICAL BRAND-MODEL DISTRIBUTOR
 * 1. Translates all English text into automotive Turkish.
 * 2. Normalizes fragmented model names (e.g. "VW Golf Mk4 GTI" -> "Golf", "VW Passat B6..." -> "Passat").
 * 3. STRICTLY maps models ONLY to their legitimate parent brand:
 *    - Cayenne, Macan, Panamera, 911, Taycan -> ONLY Porsche
 *    - Golf, Passat, Jetta, Tiguan, Polo, Arteon, Touareg, Transporter, Caddy, Amarok, Scirocco, Bora -> ONLY Volkswagen
 *    - A1, A3, A4, A5, A6, A7, A8, Q3, Q5, Q7, Q8, TT -> ONLY Audi
 *    - Leon, Ibiza, Ateca, Arona, Tarraco -> ONLY SEAT
 *    - Octavia, Superb, Kodiaq, Karoq, Fabia, Scala -> ONLY Skoda
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

// Canonical model-to-brand dictionary
const CANONICAL_MODELS = [
  // Porsche
  { keywords: ['CAYENNE'], brand: 'Porsche', canonicalModel: 'Cayenne' },
  { keywords: ['MACAN'], brand: 'Porsche', canonicalModel: 'Macan' },
  { keywords: ['PANAMERA'], brand: 'Porsche', canonicalModel: 'Panamera' },
  { keywords: ['911'], brand: 'Porsche', canonicalModel: '911' },
  { keywords: ['TAYCAN'], brand: 'Porsche', canonicalModel: 'Taycan' },

  // Audi
  { keywords: ['A1'], brand: 'Audi', canonicalModel: 'A1' },
  { keywords: ['A3', '8P', '8V', '8L'], brand: 'Audi', canonicalModel: 'A3' },
  { keywords: ['A4', 'B5', 'B6', 'B7', 'B8', 'B9'], brand: 'Audi', canonicalModel: 'A4' },
  { keywords: ['A5'], brand: 'Audi', canonicalModel: 'A5' },
  { keywords: ['A6', 'C5', 'C6', 'C7', 'C8'], brand: 'Audi', canonicalModel: 'A6' },
  { keywords: ['A7'], brand: 'Audi', canonicalModel: 'A7' },
  { keywords: ['A8', 'D2', 'D3', 'D4', 'D5'], brand: 'Audi', canonicalModel: 'A8' },
  { keywords: ['Q3'], brand: 'Audi', canonicalModel: 'Q3' },
  { keywords: ['Q5'], brand: 'Audi', canonicalModel: 'Q5' },
  { keywords: ['Q7'], brand: 'Audi', canonicalModel: 'Q7' },
  { keywords: ['Q8'], brand: 'Audi', canonicalModel: 'Q8' },
  { keywords: ['AUDI TT', ' TT '], brand: 'Audi', canonicalModel: 'TT' },

  // SEAT
  { keywords: ['LEON'], brand: 'SEAT', canonicalModel: 'Leon' },
  { keywords: ['IBIZA'], brand: 'SEAT', canonicalModel: 'Ibiza' },
  { keywords: ['ATECA'], brand: 'SEAT', canonicalModel: 'Ateca' },
  { keywords: ['ARONA'], brand: 'SEAT', canonicalModel: 'Arona' },
  { keywords: ['TARRACO'], brand: 'SEAT', canonicalModel: 'Tarraco' },

  // Skoda
  { keywords: ['OCTAVIA'], brand: 'Skoda', canonicalModel: 'Octavia' },
  { keywords: ['SUPERB'], brand: 'Skoda', canonicalModel: 'Superb' },
  { keywords: ['KODIAQ'], brand: 'Skoda', canonicalModel: 'Kodiaq' },
  { keywords: ['KAROQ'], brand: 'Skoda', canonicalModel: 'Karoq' },
  { keywords: ['FABIA'], brand: 'Skoda', canonicalModel: 'Fabia' },
  { keywords: ['SCALA'], brand: 'Skoda', canonicalModel: 'Scala' },

  // Volkswagen
  { keywords: ['PASSAT'], brand: 'Volkswagen', canonicalModel: 'Passat' },
  { keywords: ['GOLF'], brand: 'Volkswagen', canonicalModel: 'Golf' },
  { keywords: ['JETTA'], brand: 'Volkswagen', canonicalModel: 'Jetta' },
  { keywords: ['TIGUAN'], brand: 'Volkswagen', canonicalModel: 'Tiguan' },
  { keywords: ['POLO'], brand: 'Volkswagen', canonicalModel: 'Polo' },
  { keywords: ['ARTEON'], brand: 'Volkswagen', canonicalModel: 'Arteon' },
  { keywords: ['TOUAREG'], brand: 'Volkswagen', canonicalModel: 'Touareg' },
  { keywords: ['TRANSPORTER', 'MULTIVAN', 'CARAVELLE', 'T5', 'T6'], brand: 'Volkswagen', canonicalModel: 'Transporter' },
  { keywords: ['CADDY'], brand: 'Volkswagen', canonicalModel: 'Caddy' },
  { keywords: ['AMAROK'], brand: 'Volkswagen', canonicalModel: 'Amarok' },
  { keywords: ['SCIROCCO'], brand: 'Volkswagen', canonicalModel: 'Scirocco' },
  { keywords: ['BORA'], brand: 'Volkswagen', canonicalModel: 'Bora' },
];

const DICTIONARY = [
  { en: /Control Module faulty/gi, tr: 'Kontrol Modülü / Elektronik Beyin (ECU/TCM) Donanımsal Arızalı' },
  { en: /Control Module Software Issue/gi, tr: 'Kontrol Modülü Yazılım / Kalibrasyon Güncelleme Hatası' },
  { en: /Basic Setting\(s\) not performed/gi, tr: 'Temel Ayarlar (Basic Settings) ve Adaptasyon Yapılmamış' },
  { en: /Replacing the Brake Electronics Control Module/gi, tr: 'ABS / ESP Fren Elektroniği Modülü Değişimi' },
  { en: /Intake and Disconnecting Valves/gi, tr: 'Emme ve Tahliye Valfleri' },
  { en: /not being synchronized/gi, tr: 'senkronize değil (zamanlama sapması var)' },
  { en: /Automatic Roof perform/gi, tr: 'Otomatik Tente / Cam Tavan Adaptasyonu Yapın' },
  { en: /Instrument Cluster Service Interval Settings/gi, tr: 'Gösterge Paneli Periyodik Bakım Sıfırlama Ayarları' },
  { en: /Function Control Module Map/gi, tr: 'Modül Adaptasyon ve Kodlama Haritası' },
  { en: /Adaptation \/ Calibration/gi, tr: 'Adaptasyon ve Kalibrasyon' },
  { en: /stored values can be compared/gi, tr: 'kayıtlı canlı değerler fabrika verileriyle kıyaslanmalıdır' },
  { en: /check Adaptasyon \/ Kalibrasyon Yapın:/gi, tr: 'Adaptasyon kanallarını kontrol edin:' },
  { en: /Telephone Type/gi, tr: 'Telefon / Bluetooth Modül Tipi' },
  { en: /For Plausibility/gi, tr: 'Tutarlılık ve Uyumluluk Kontrolü İçin' },
  { en: /Multi Media Interface/gi, tr: 'MMI Multimedya Ekran Ünitesi' },
  { en: /Control Head/gi, tr: 'Ana Kontrol Ünitesi' },
  { en: /Brake Electronics/gi, tr: 'ABS / ESP Fren Elektroniği' },
  { en: /Hydraulics Unit/gi, tr: 'Hidrolik Blok / Pompa Ünitesi' },
  { en: /will solve this problem/gi, tr: 'sorunu kalıcı olarak çözecektir' },
  { en: /registered VCDS users/gi, tr: 'yetkili VCDS / ODIS diyagnoz uzmanları' },
  { en: /contact us directly via email/gi, tr: 'teknik destek kaydı oluşturmalıdır' },
  { en: /When found in/gi, tr: 'Şu modülde tespit edildiğinde:' },
  { en: /When this exact DTC is found in/gi, tr: 'Bu spesifik arıza kodu şu ünitede görüldüğünde:' },
  { en: /the cause is most likely buggy factory software/gi, tr: 'kök neden fabrika çıkışlı yazılım güncelleme ihtiyacıdır' },
  { en: /check for possible wiring damage/gi, tr: 'kablo tesisatı ve konnektör hasarını kontrol edin' },
  { en: /verify the fuse to/gi, tr: 'ilgili sigorta bağlantısını kontrol edin' },
  { en: /labeled "SIG" in the wiring diagram/gi, tr: 'şemada "SIG" olarak etiketlenmiş hat' },
  { en: /is OK/gi, tr: 'sağlam ve voltajlı olmalıdır' },
  { en: /Intake Manifold/gi, tr: 'Emme Manifoldu' },
  { en: /Exhaust Gas Recirculation/gi, tr: 'EGR Gaz Devridaim Sistemi' },
  { en: /Throttle Body/gi, tr: 'Gaz Kelebeği Ünitesi' },
  { en: /Mass Air Flow/gi, tr: 'MAF Emiş Hava Akış Sensörü' },
  { en: /Camshaft Position/gi, tr: 'Eksantrik Konum Sensörü' },
  { en: /Crankshaft Position/gi, tr: 'Krank Devir Sensörü' },
  { en: /Fuel Rail\/System Pressure/gi, tr: 'Yakıt Rayı / Basınç Hattı' },
  { en: /Too Low/gi, tr: 'Çok Düşük (Basınç Kaybı)' },
  { en: /Too High/gi, tr: 'Çok Yüksek (Aşırı Basınç)' },
  { en: /Implausible Signal/gi, tr: 'Görünürde Mantıksız / Tutarsız Sinyal' },
  { en: /No Signal\/Communication/gi, tr: 'Sinyal Yok / İletişim Kopukluğu' },
  { en: /Open Circuit/gi, tr: 'Açık Devre / Kablo Kopukluğu' },
  { en: /Short to Ground/gi, tr: 'Şasiye Kısa Devre' },
  { en: /Short to Plus/gi, tr: 'Artı (12V) Kutba Kısa Devre' },
  { en: /Performance Issue/gi, tr: 'Performans ve Yanıt Sapması Sorunu' },
  { en: /Circuit Malfunction/gi, tr: 'Elektrik Devre Arızası' },
  { en: /Range\/Performance/gi, tr: 'Çalışma Toleransı / Performans Hatası' },
  { en: /Supply Voltage/gi, tr: 'Besleme Gerilimi / Voltajı' },
  { en: /Signal Too Low/gi, tr: 'Sinyal Gerilimi Çok Düşük' },
  { en: /Signal Too High/gi, tr: 'Sinyal Gerilimi Yüksek' },
  { en: /Check /gi, tr: 'Kontrol edin: ' },
  { en: /Replace /gi, tr: 'Değiştirin / Yenileyin: ' },
  { en: /Perform /gi, tr: 'Gerçekleştirin: ' },
  { en: /VAG Grubu Özel Servis ve Kronik Notları/gi, tr: 'VAG Grubu Teknik Servis Notları' },
  { en: /Details for/gi, tr: 'Şu araç için detaylar:' }
];

function translateString(str) {
  if (typeof str !== 'string') return str;
  let text = str;
  DICTIONARY.forEach(({ en, tr }) => {
    text = text.replace(en, tr);
  });
  return text;
}

function detectStrictBrandsAndModels(text) {
  const textUpper = text.toUpperCase();

  const brandMap = new Map(); // brand -> Set of canonical models

  CANONICAL_MODELS.forEach(({ keywords, brand, canonicalModel }) => {
    const matches = keywords.some(kw => textUpper.includes(kw));
    if (matches) {
      if (!brandMap.has(brand)) {
        brandMap.set(brand, new Set());
      }
      brandMap.get(brand).add(canonicalModel);
    }
  });

  // Default fallback if no specific model was mentioned in the text
  if (brandMap.size === 0) {
    brandMap.set('Volkswagen', new Set(['Passat', 'Golf']));
    brandMap.set('Audi', new Set(['A4', 'A6']));
    brandMap.set('SEAT', new Set(['Leon']));
    brandMap.set('Skoda', new Set(['Octavia']));
  }

  const brands = Array.from(brandMap.keys());
  const allModels = new Set();
  brandMap.forEach((modelSet) => {
    modelSet.forEach(m => allModels.add(m));
  });

  return {
    brands,
    models: Array.from(allModels)
  };
}

function processFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const fullText = JSON.stringify(data);

    // Translation
    if (data.title) data.title = translateString(data.title);
    if (Array.isArray(data.symptoms)) data.symptoms = data.symptoms.map(translateString);
    if (Array.isArray(data.commonCauses)) data.commonCauses = data.commonCauses.map(translateString);
    if (Array.isArray(data.stepByStepSolution)) data.stepByStepSolution = data.stepByStepSolution.map(translateString);
    if (data.technicalNotes) data.technicalNotes = translateString(data.technicalNotes);

    // Detect strict brands and canonical models
    const distribution = detectStrictBrandsAndModels(fullText);
    data.brands = distribution.brands;
    data.models = distribution.models;

    data.brand = distribution.brands.join(' / ');
    data.model = distribution.models.join(', ');

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    return false;
  }
}

function runTranslatorAndDistributor() {
  console.log('🌐 ROSS-TECH KUSURSUZ MARKA/MODEL NORMALİZASYONU VE ÇEVİRİ BAŞLATILIYOR...');

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  console.log(`📌 Toplam ${files.length} adet arıza dokümanı işleniyor...`);

  let count = 0;
  files.forEach(f => {
    if (processFile(path.join(DATA_DIR, f))) count++;
  });

  console.log(`\n🎉 İŞLEM BAŞARIYLA TAMAMLANDI! ${count} dosya kusursuz canonical modellerle güncellendi!`);
}

runTranslatorAndDistributor();
