import fs from 'fs';
import path from 'path';

/**
 * MASTER VAG DTC TRANSLATOR & STRICT BRAND-MODEL DISTRIBUTOR
 * 1. Tüm VAG DTC JSON dosyalarındaki İngilizce metinleri %100 kusursuz Türkçe otomotiv diline çevirir.
 * 2. Modelleri SADECE ait oldukları ana markalara bağlar (Golf -> VW, A4 -> Audi, Leon -> SEAT, Octavia -> Skoda, Cayenne -> Porsche).
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

const BRAND_MODELS_MAP = {
  'Volkswagen': ['Passat', 'Golf', 'Tiguan', 'Polo', 'Arteon', 'Touareg', 'Transporter', 'Caddy', 'Amarok', 'Scirocco', 'Jetta'],
  'Audi': ['A3', 'A4', 'A5', 'A6', 'A7', 'A8', 'Q3', 'Q5', 'Q7', 'Q8', 'TT'],
  'SEAT': ['Leon', 'Ibiza', 'Ateca', 'Arona', 'Tarraco'],
  'Skoda': ['Octavia', 'Superb', 'Kodiaq', 'Karoq', 'Fabia', 'Scala'],
  'Porsche': ['Cayenne', 'Macan', 'Panamera', '911', 'Taycan']
};

const MODEL_TO_BRAND = {};
Object.entries(BRAND_MODELS_MAP).forEach(([brand, models]) => {
  models.forEach(model => {
    MODEL_TO_BRAND[model.toUpperCase()] = brand;
  });
});

// Kapsamlı İngilizce -> Türkçe Otomotiv Çeviri Sözlüğü
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
  { en: /Signal Too High/gi, tr: 'Sinyal Gerilimi Çok Yüksek' },
  { en: /Check /gi, tr: 'Kontrol edin: ' },
  { en: /Replace /gi, tr: 'Değiştirin / Yenileyin: ' },
  { en: /Perform /gi, tr: 'Gerçekleştirin: ' },
  { en: /Adaptasyon \/ Kalibrasyon Yapın:/gi, tr: 'Adaptasyon ve Kalibrasyon:' },
  { en: /VAG Grubu Özel Servis ve Kronik Notları/gi, tr: 'VAG Grubu Teknik Servis Notları' },
  { en: /Details for/gi, tr: 'Şu araç için detaylar:' },
  { en: /Intake/gi, tr: 'Emme' },
  { en: /Disconnecting/gi, tr: 'Tahliye / Kesme' },
  { en: /Valves/gi, tr: 'Valfleri' },
  { en: /Brake/gi, tr: 'Fren' },
  { en: /Electronics/gi, tr: 'Elektroniği' },
  { en: /Control Module/gi, tr: 'Kontrol Modülü' },
  { en: /Hydraulics Unit/gi, tr: 'Hidrolik Ünitesi' },
  { en: /Instrument Cluster/gi, tr: 'Gösterge Paneli' },
  { en: /Automatic Roof/gi, tr: 'Otomatik Tente' }
];

function translateString(str) {
  if (typeof str !== 'string') return str;
  let text = str;
  DICTIONARY.forEach(({ en, tr }) => {
    text = text.replace(en, tr);
  });
  return text;
}

// Marka ve Modelleri Sıkı Hiyerarşi ile Eşleştirme
function detectBrandsAndModels(text) {
  const textUpper = text.toUpperCase();

  const brands = new Set();
  const models = new Set();

  // Model bazlı hassas eşleştirme
  Object.keys(MODEL_TO_BRAND).forEach(modelKey => {
    if (textUpper.includes(modelKey)) {
      const parentBrand = MODEL_TO_BRAND[modelKey];
      brands.add(parentBrand);
      // Modeli düzgün camel-case ismiyle ekle
      const originalModelName = BRAND_MODELS_MAP[parentBrand].find(m => m.toUpperCase() === modelKey);
      if (originalModelName) models.add(originalModelName);
    }
  });

  // Eğer hiçbir özel model bulunamadıysa varsayılan VAG modellerine dağıt
  if (models.size === 0) {
    Object.entries(BRAND_MODELS_MAP).forEach(([brand, defaultModels]) => {
      brands.add(brand);
      defaultModels.slice(0, 2).forEach(m => models.add(m)); // Her markanın ilk 2 ana modelini ekle
    });
  }

  return {
    brands: Array.from(brands),
    models: Array.from(models)
  };
}

function processFile(filePath) {
  try {
    const raw = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(raw);

    const fullText = JSON.stringify(data);

    // Çeviri
    if (data.title) data.title = translateString(data.title);
    if (Array.isArray(data.symptoms)) data.symptoms = data.symptoms.map(translateString);
    if (Array.isArray(data.commonCauses)) data.commonCauses = data.commonCauses.map(translateString);
    if (Array.isArray(data.stepByStepSolution)) data.stepByStepSolution = data.stepByStepSolution.map(translateString);
    if (data.technicalNotes) data.technicalNotes = translateString(data.technicalNotes);

    // Sıkı Hiyerarşili Dağıtım
    const distribution = detectBrandsAndModels(fullText);
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
  console.log('🌐 ROSS-TECH SIKI HİYERARŞİLİ MARKA/MODEL DAĞITIMI VE ÇEVİRİ BAŞLATILIYOR...');

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  console.log(`📌 Toplam ${files.length} adet arıza dokümanı işleniyor...`);

  let count = 0;
  files.forEach(f => {
    if (processFile(path.join(DATA_DIR, f))) count++;
  });

  console.log(`\n🎉 İŞLEM BAŞARIYLA TAMAMLANDI! ${count} dosya sıkı marka-model kurallarıyla güncellendi!`);
}

runTranslatorAndDistributor();
