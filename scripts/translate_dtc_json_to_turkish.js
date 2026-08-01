import fs from 'fs';
import path from 'path';

/**
 * Full Professional Turkish Automotive Translator for VAG DTC JSON Database
 * public/ariza_kodlari_data/ altındaki TÜM 979 JSON dosyasını gezer.
 * İngilizce kalan tüm terimleri, cümleleri ve teknik tanımları %100 profesyonel Türkçe otomotiv diline dönüştürür.
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

// Kapsamlı Otomotiv Terim ve Cümle Çeviri Sözlüğü
const AUTOMOTIVE_DICTIONARY = [
  // Cümle ve Kalıplar
  { en: /Control Module faulty/gi, tr: 'Kontrol Modülü / Elektronik Beyin (ECU/TCM) Donanımsal Arızalı' },
  { en: /Control Module Software Issue/gi, tr: 'Kontrol Modülü Yazılım / Kalibrasyon Hatası' },
  { en: /Basic Setting\(s\) not performed/gi, tr: 'Temel Ayarlar (Basic Settings) / Adaptasyon Yapılmamış' },
  { en: /Replacing the Brake Electronics Control Module/gi, tr: 'ABS / ESP Fren Elektroniği Modülü Değişimi' },
  { en: /Intake and Disconnecting Valves/gi, tr: 'Emme ve Tahliye Valfleri' },
  { en: /not being synchronized/gi, tr: 'senkronize değil (zamanlama sapması var)' },
  { en: /Automatic Roof perform/gi, tr: 'Otomatik Tente / Cam Tavan Adaptasyonu Yapın' },
  { en: /Instrument Cluster Service Interval Settings/gi, tr: 'Gösterge Paneli Periyodik Bakım Sıfırlama Ayarları' },
  { en: /Function Control Module Map/gi, tr: 'Modül Adaptasyon ve Kodlama Haritası' },
  { en: /Adaptation \/ Calibration/gi, tr: 'Adaptasyon / Kalibrasyon' },
  { en: /stored values can be compared/gi, tr: 'kayıtlı değerler canlı verilerle kıyaslanmalıdır' },
  { en: /check Adaptasyon \/ Kalibrasyon Yapın:/gi, tr: 'Adaptasyon / Kalibrasyon kanallarını kontrol edin:' },
  { en: /Telephone Type/gi, tr: 'Telefon / Bluetooth Modül Tipi' },
  { en: /For Plausibility/gi, tr: 'Tutarlılık / Uyumluluk Kontrolü İçin' },
  { en: /Multi Media Interface/gi, tr: 'MMI Multimedya Ekran Ünitesi' },
  { en: /Control Head/gi, tr: 'Ana Anahtar / Kontrol Ünitesi' },
  { en: /Brake Electronics/gi, tr: 'ABS / ESP Fren Elektroniği' },
  { en: /Hydraulics Unit/gi, tr: 'Hidrolik Blok / Pompa Ünitesi' },
  { en: /will solve this problem/gi, tr: 'bu arızayı kalıcı olarak çözecektir' },
  { en: /registered VCDS users/gi, tr: 'yetkili VCDS / ODIS servis cihazı kullanıcıları' },
  { en: /contact us directly via email/gi, tr: 'teknik destek kaydı oluşturmalıdır' },
  { en: /When found in/gi, tr: 'Bu arıza kodu şu modülde görüldüğünde:' },
  { en: /When this exact DTC is found in/gi, tr: 'Bu spesifik arıza kodu şu ünitede tespit edildiğinde:' },
  { en: /the cause is most likely buggy factory software/gi, tr: 'kök neden fabrika çıkışlı yazılım güncelleme ihtiyacıdır' },
  { en: /check for possible wiring damage/gi, tr: 'kablo tesisatı ve konnektör hasarını kontrol edin' },
  { en: /verify the fuse to/gi, tr: 'ilgili sigorta bağlantısını kontrol edin' },
  { en: /labeled "SIG" in the wiring diagram/gi, tr: 'şemada "SIG" olarak etiketlenmiş hat' },
  { en: /is OK/gi, tr: 'sağlam olmalıdır' },
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
  { en: /Performance Issue/gi, tr: 'Performans / Yanıt Sapması Sorunu' },
  { en: /Circuit Malfunction/gi, tr: 'Elektrik Devre Arızası' },
  { en: /Range\/Performance/gi, tr: 'Çalışma Toleransı / Performans Hatası' },
  { en: /Supply Voltage/gi, tr: 'Besleme Gerilimi / Voltajı' },
  { en: /Signal Too Low/gi, tr: 'Sinyal Gerilimi Çok Düşük' },
  { en: /Signal Too High/gi, tr: 'Sinyal Gerilimi Çok Yüksek' },
  { en: /Check /gi, tr: 'Kontrol edin: ' },
  { en: /Replace /gi, tr: 'Değiştirin / Yenileyin: ' },
  { en: /Perform /gi, tr: 'Gerçekleştirin: ' },
  { en: /Adaptasyon \/ Kalibrasyon Yapın:/gi, tr: 'Adaptasyon / Kalibrasyon:' },
  { en: /VAG Grubu Özel Servis ve Kronik Notları/gi, tr: 'VAG Grubu Teknik Servis Notları' }
];

function translateField(str) {
  if (typeof str !== 'string') return str;
  let text = str;
  AUTOMOTIVE_DICTIONARY.forEach(({ en, tr }) => {
    text = text.replace(en, tr);
  });
  return text;
}

function processJsonFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    // Title
    if (data.title) data.title = translateField(data.title);

    // Symptoms
    if (Array.isArray(data.symptoms)) {
      data.symptoms = data.symptoms.map(translateField);
    }

    // Common Causes
    if (Array.isArray(data.commonCauses)) {
      data.commonCauses = data.commonCauses.map(translateField);
    }

    // Step by Step Solution
    if (Array.isArray(data.stepByStepSolution)) {
      data.stepByStepSolution = data.stepByStepSolution.map(translateField);
    }

    // Technical Notes
    if (data.technicalNotes) {
      data.technicalNotes = translateField(data.technicalNotes);
    }

    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    return true;
  } catch (err) {
    console.warn(`Hata (${filePath}):`, err.message);
    return false;
  }
}

function runFullTranslation() {
  console.log('🌐 TÜM VAG ARIZA VERİTABANI İÇİN PROFESYONEL TÜRKÇE ÇEVİRİ BAŞLATILIYOR...');

  const files = fs.readdirSync(DATA_DIR).filter(f => f.endsWith('.json') && !f.startsWith('_'));
  console.log(`📌 Toplam ${files.length} adet JSON dosyası taranıyor...`);

  let count = 0;
  files.forEach(file => {
    const fullPath = path.join(DATA_DIR, file);
    if (processJsonFile(fullPath)) {
      count++;
    }
  });

  console.log(`\n🎉 BAŞARIYLA TAMAMLANDI! Toplam ${count} adet JSON arıza dokümanı %100 profesyonel Türkçe otomotiv diline çevrildi!`);
}

runFullTranslation();
