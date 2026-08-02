const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const minedDataPath = path.join(__dirname, '..', 'public', 'data', 'fault_codes_mined.json');
const targetDir = path.join(__dirname, '..', 'public', 'ariza_kodlari_data');

async function purgeAndSync() {
  console.log("🧹 1. Eski 979 adet sahte/scraped JSON dosyaları temizleniyor...");

  if (fs.existsSync(targetDir)) {
    const files = fs.readdirSync(targetDir);
    for (const file of files) {
      fs.unlinkSync(path.join(targetDir, file));
    }
  } else {
    fs.mkdirSync(targetDir, { recursive: true });
  }

  console.log("✅ Eski ariza_kodlari_data klasörü tamamen sıfırlandı!");

  // Mined JSON verisini oku
  if (!fs.existsSync(minedDataPath)) {
    console.error("❌ minedDataPath bulunamadı!");
    return;
  }

  const minedData = JSON.parse(fs.readFileSync(minedDataPath, 'utf-8'));
  console.log(`📥 2. Taze ${minedData.length} adet VAG & BMW arıza verisi yazılıyor...`);

  for (const item of minedData) {
    const fileName = `${item.code.toLowerCase()}.json`;
    const filePath = path.join(targetDir, fileName);

    const fileContent = {
      code: item.code,
      title: `${item.code} - ${item.description_tr}`,
      brand: item.vehicles && item.vehicles[0] ? item.vehicles[0].split(' ')[0] : 'VAG',
      brands: item.vehicles.map(v => v.split(' ')[0]),
      models: item.vehicles,
      category: item.category,
      severity: item.severity || 'Yüksek',
      symptoms: [
        `${item.description_tr} Uyarısı (Ekranda MIL / Arıza Lambası Yandı)`,
        "Performans Kaybı ve Çekiş Düşüklüğü"
      ],
      commonCauses: [
        `${item.description_en} bileşeninde aşınma veya sinyal hatası`,
        "Kablo demeti tıkanıklığı veya sensör arızası"
      ],
      stepByStepSolution: [
        "Orijinal Yetkili Servis Diagnostic Cihazı ile canlı değer (measuring block) analizi",
        "Sensör besleme hatlarının ve vakum borularının fiziki kontrolü",
        "Orijinal OEM yedek parça değişimi ve kalibrasyon"
      ],
      technicalNotes: "Bursalı Oto Servis: Arıza tekrarlamaması için orijinal kalibrasyon önerilir."
    };

    fs.writeFileSync(filePath, JSON.stringify(fileContent, null, 2), 'utf-8');
  }

  console.log(`🎉 ${minedData.length} adet taze, temiz arıza dosyası public/ariza_kodlari_data içine başarıyla yazıldı!`);
}

purgeAndSync()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
