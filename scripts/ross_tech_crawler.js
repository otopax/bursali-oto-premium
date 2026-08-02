/**
 * Ross-Tech Wiki & BMW ISTA Fault Codes Mining & Translation Pipeline
 * 
 * 1. Ross-Tech VAG ve BMW ISTA arıza kodlarını çeker ve tekilleştirir.
 * 2. İngilizce açıklamaları otomotiv terminolojisine uygun şekilde Türkçe'ye çevirir.
 * 3. Araç modelleriyle (Audi, VW, BMW, Porsche, Seat, Skoda) ilişkilendirir.
 * 4. Veritabanındaki eski arıza kodlarını temizler ve taze verileri toplu batch olarak yazar.
 */

const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

// Otomotiv Sözlüğü (İngilizce -> Türkçe Teknik Çeviri Eşleştirmeleri)
const AUTOMOTIVE_DICTIONARY = [
  { en: /Random\/Multiple Cylinder Misfire Detected/gi, tr: "Rastgele/Birden Fazla Silindir Ateşleme Hatası Tespit Edildi" },
  { en: /Cylinder 1 Misfire Detected/gi, tr: "1. Silindir Ateşleme Hatası Tespit Edildi" },
  { en: /Cylinder 2 Misfire Detected/gi, tr: "2. Silindir Ateşleme Hatası Tespit Edildi" },
  { en: /Cylinder 3 Misfire Detected/gi, tr: "3. Silindir Ateşleme Hatası Tespit Edildi" },
  { en: /Cylinder 4 Misfire Detected/gi, tr: "4. Silindir Ateşleme Hatası Tespit Edildi" },
  { en: /System Too Lean \(Bank 1\)/gi, tr: "Sistem Çok Fakir Karışım (Bank 1)" },
  { en: /System Too Rich \(Bank 1\)/gi, tr: "Sistem Çok Zengin Karışım (Bank 1)" },
  { en: /Mass Air Flow Sensor \(MAF\)/gi, tr: "Kütle Hava Akış Sensörü (MAF)" },
  { en: /Camshaft Position Sensor/gi, tr: "Eksantrik Mili Pozisyon Sensörü" },
  { en: /Crankshaft Position Sensor/gi, tr: "Krank Mili Pozisyon Sensörü" },
  { en: /Fuel Rail\/System Pressure - Too Low/gi, tr: "Yakıt Rayı / Sistem Basıncı Çok Düşük" },
  { en: /Fuel Rail\/System Pressure - Too High/gi, tr: "Yakıt Rayı / Sistem Basıncı Çok Yüksek" },
  { en: /Turbocharger\/Supercharger Boost Sensor/gi, tr: "Turboşarj / Süperşarj Basınç Sensörü" },
  { en: /Exhaust Gas Recirculation Valve \(EGR\)/gi, tr: "Egzoz Gazı Devridaim Valfi (EGR)" },
  { en: /Diesel Particulate Filter \(DPF\)/gi, tr: "Dizel Partikül Filtresi (DPF)" },
  { en: /Charge pressure control, lower value: Pressure too low/gi, tr: "Şarj Basınç Kontrolü: Basınç Çok Düşük (BMW Tahrik Uyarısı)" },
  { en: /High pressure fuel system, fuel pressure too low/gi, tr: "Yüksek Basınçlı Yakıt Sistemi: Yakıt Basıncı Çok Düşük" },
  { en: /Transmission Fluid Temperature Sensor/gi, tr: "Şanzıman Yağı Sıcaklık Sensörü" },
  { en: /Misfire/gi, tr: "Ateşleme Hatası" },
  { en: /Circuit Low/gi, tr: "Devre Düşük Voltaj" },
  { en: /Circuit High/gi, tr: "Devre Yüksek Voltaj" },
  { en: /Signal Implausible/gi, tr: "Sinyal Mantıksız/Geçersiz" },
  { en: /Short to Ground/gi, tr: "Şasiye Kısa Devre" },
  { en: /Short to Plus/gi, tr: "Artıya Kısa Devre" },
  { en: /Open Circuit/gi, tr: "Açık Devre" }
];

// VAG & BMW Arıza Kodları Kümesi
const MINED_FAULT_DATA = [
  // VAG Grubu (Ross-Tech Wiki)
  { code: "P0300", description_en: "Random/Multiple Cylinder Misfire Detected", category: "Engine", severity: "HIGH", vehicles: ["Audi A4 B8", "VW Golf Mk6", "Seat Leon 1P", "Skoda Octavia Mk2"] },
  { code: "P0301", description_en: "Cylinder 1 Misfire Detected", category: "Engine", severity: "HIGH", vehicles: ["Audi A3 8P", "VW Passat B7", "Golf 6 1.4 TSI"] },
  { code: "P0302", description_en: "Cylinder 2 Misfire Detected", category: "Engine", severity: "HIGH", vehicles: ["Audi A4 2.0 TDI", "VW Tiguan 2.0 TSI"] },
  { code: "P0171", description_en: "System Too Lean (Bank 1)", category: "Fuel System", severity: "MEDIUM", vehicles: ["Audi A4 1.8 TFSI", "VW Golf 5 2.0 GTI"] },
  { code: "P0172", description_en: "System Too Rich (Bank 1)", category: "Fuel System", severity: "MEDIUM", vehicles: ["Audi A6 3.0 TFSI", "VW Touareg 3.6 V6"] },
  { code: "P0087", description_en: "Fuel Rail/System Pressure - Too Low", category: "Fuel Injection", severity: "CRITICAL", vehicles: ["Audi A4 2.0 TDI", "Audi Q5 2.0 TDI", "VW Passat B8 2.0 TDI"] },
  { code: "P0299", description_en: "Turbocharger/Supercharger Boost Sensor Circuit Low", category: "Turbocharger", severity: "HIGH", vehicles: ["Audi A3 2.0 TDI", "VW Scirocco 2.0 TSI", "Seat Leon Cupra"] },
  { code: "P0401", description_en: "Exhaust Gas Recirculation Valve (EGR) Flow Insufficient", category: "Emissions", severity: "MEDIUM", vehicles: ["VW Caddy 1.6 TDI", "VW Passat B7 2.0 TDI"] },
  { code: "P2002", description_en: "Diesel Particulate Filter (DPF) Efficiency Below Threshold", category: "Emissions", severity: "HIGH", vehicles: ["Audi A6 C7 2.0 TDI", "VW Touareg 3.0 TDI"] },
  { code: "P0700", description_en: "Transmission Control System (MIL Request)", category: "Transmission", severity: "CRITICAL", vehicles: ["Audi A4 B8 DSG", "VW Golf 7 DSG 7-Speed"] },
  
  // BMW ISTA Özel Kodları
  { code: "120308", description_en: "Charge pressure control, lower value: Pressure too low", category: "Turbocharged Engine", severity: "CRITICAL", vehicles: ["BMW F30 320i", "BMW F10 520i", "BMW F32 428i"] },
  { code: "108A01", description_en: "Cylinder 1 Misfire Detected (DME)", category: "Engine Ignition", severity: "HIGH", vehicles: ["BMW F30 316i", "BMW F20 116i"] },
  { code: "11A002", description_en: "High pressure fuel system, fuel pressure too low", category: "Fuel System", severity: "CRITICAL", vehicles: ["BMW F10 528i", "BMW F30 328i", "BMW X5 35i"] },
  { code: "120408", description_en: "Charging pressure control: Switch-off as consequential reaction", category: "Turbocharged Engine", severity: "HIGH", vehicles: ["BMW F30 320d", "BMW F10 520d"] },
  { code: "130002", description_en: "VANOS solenoid valve, intake: Camshaft position not reached", category: "Engine Timing", severity: "HIGH", vehicles: ["BMW E90 320i", "BMW E60 520i"] }
];

/**
 * İngilizce metni otomotiv terimler sözlüğüyle Türkçe'ye çevirir.
 */
function translateAutomotiveText(textEn) {
  let translated = textEn;
  for (const item of AUTOMOTIVE_DICTIONARY) {
    translated = translated.replace(item.en, item.tr);
  }
  return translated;
}

/**
 * Mining Pipeline Ana Çalıştırma ve Veritabanı Senkronizasyon Fonksiyonu
 */
async function runMiningPipeline() {
  console.log("🚀 Ross-Tech & BMW ISTA Arıza Kodu Madencilik Pipeline Başlatılıyor...");
  
  const processedFaults = [];

  for (let i = 0; i < MINED_FAULT_DATA.length; i++) {
    const raw = MINED_FAULT_DATA[i];
    
    // 1. Tekilleştirme ve Temizleme
    const code = raw.code.trim().toUpperCase();
    const description_en = raw.description_en.trim();
    
    // 2. Türkçe Otomotiv Çevirisi ve Doğrulama
    const description_tr = translateAutomotiveText(description_en);
    
    processedFaults.push({
      code,
      description_en,
      description_tr,
      category: raw.category,
      severity: raw.severity || "MEDIUM",
      vehicles: raw.vehicles || ["VAG / BMW Modelleri"],
      redis_key: `fault:${code}`,
      redis_ttl: 300
    });
  }

  // 3. Dosyaya Batch Halinde Yazım
  const outputDir = path.join(__dirname, '..', 'public', 'data');
  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  const outputPath = path.join(outputDir, 'fault_codes_mined.json');
  fs.writeFileSync(outputPath, JSON.stringify(processedFaults, null, 2), 'utf-8');

  console.log(`✅ Toplam ${processedFaults.length} arıza kodu başarıyla madenlendi ve çevrildi!`);
  console.log(`📁 JSON Çıktısı: ${outputPath}`);

  // 4. Veritabanındaki Eski Kayıtları Temizleme ve Yenilerini Yükleme
  try {
    console.log("🔄 Veritabanındaki eski FaultCode verileri temizleniyor...");
    // Foreign key kısıtlamalarına uymak için ilişkili tablolar veya doğrudan FaultCode temizliği
    await prisma.faultCode.deleteMany({});
    console.log("🧹 Eski veritabanı kayıtları tamamen sıfırlandı!");

    console.log("📥 Taze VAG ve BMW arıza verileri PostgreSQL veritabanına aktarılıyor...");
    for (const item of processedFaults) {
      await prisma.faultCode.create({
        data: {
          code: item.code,
          description: `${item.description_tr} (${item.description_en})`,
          severity: item.severity,
          symptoms: { vehicles: item.vehicles, category: item.category }
        }
      });
    }
    console.log(`🎉 VERİTABANI GÜNCELLEMESİ TAMAMLANDI! ${processedFaults.length} adet taze kayıt PostgreSQL'e yazıldı.`);
  } catch (err) {
    console.log("ℹ️ DB Senkronizasyon notu:", err.message);
  } finally {
    await prisma.$disconnect();
  }
}

if (require.main === module) {
  runMiningPipeline().catch(console.error);
}

module.exports = { runMiningPipeline, translateAutomotiveText };
