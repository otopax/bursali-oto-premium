import fs from 'fs';
import path from 'path';

/**
 * Ross-Tech Wiki & VAG Arıza Kodu İşleyici ve Oluşturucu
 * Bu script VAG Grubu (Audi, VW, Seat, Skoda, Porsche) araçların 
 * DTC arıza kodlarını standart JSON formatında `public/ariza_kodlari_data/` dizinine kaydeder.
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

// Örnek Ross-Tech VAG Arıza Kodu Şablon Veritabanı
const VAG_FAULT_CODES = [
  {
    code: "P0087",
    vagCode: "16471",
    title: "Yakıt Rayı / Sistem Basıncı Çok Düşük (Fuel Rail/System Pressure - Too Low)",
    brand: "Audi / Volkswagen",
    models: ["A3", "A4", "A6", "Q5", "Passat", "Golf", "Tiguan"],
    engines: ["2.0 TDI", "3.0 TDI", "2.0 TSI / TFSI"],
    severity: "Yüksek (Acil Servis Kontrolü)",
    symptoms: [
      "Motor arıza lambası (MIL) yanıyor",
      "Yüksek devirde veya anı hızlanmada güç kaybı ve pürüzlü çalışma",
      "Motorun limp moda (koruma modu) geçmesi",
      "Soğuk ve sıcak ilk çalıştırmada marş süresinin uzaması"
    ],
    commonCauses: [
      "Yüksek basınç yakıt pompası (HPFP) iç aşınması ve kam mili takipçisi (cam follower) arızası",
      "Depo içi düşük basınç yakıt pompasının debi düşüklüğü",
      "Tıkalı veya kirlenmiş yakıt filtresi",
      "Yakıt rayı basınç regülatörü (N276) veya basınç sensörü (G247) arızası"
    ],
    stepByStepSolution: [
      "1. VCDS / ODIS ile ölçüm bloklarından (Measuring Blocks) G247 sensörü canlı ray basınç verisi kontrol edilir.",
      "2. Depo içi elektrikli besleme pompasının basıncı (minimum 4.5-6 bar arası) test edilir.",
      "3. HPFP yüksek basınç pompasının üzerindeki valf sökülerek içinde metal talaşı olup olmadığı mikroskop altında incelenir.",
      "4. Talaş tespit edilirse tüm enjektörler, yüksek basınç boruları ve yakıt deposu yıkanmalı/değiştirilmelidir."
    ],
    technicalNotes: "VAG 2.0 TDI CR motorlarda HPFP pompa talaşı yapması kronik bir durumdur. Pompa sökülmeden sadece sensör değiştirilirse yeni sensör de kısa sürede bozulur."
  },
  {
    code: "P0011",
    vagCode: "16395",
    title: "Eksantrik Mili Pozisyonu - A Sırası Zamansız İleri / Sistem Performansı (Camshaft Position Bank 1)",
    brand: "Audi / Volkswagen / Porsche",
    models: ["A4", "A5", "A6", "Q7", "Golf GTI", "Cayenne"],
    engines: ["1.8 TFSI", "2.0 TFSI", "3.0 TFSI", "3.2 FSI"],
    severity: "Orta-Yüksek",
    symptoms: [
      "Motor rölantide sarsıntılı çalışıyor",
      "Eksantrik zincirinden gürültü / şıkırtı sesi gelmesi",
      "Motor arıza ışığı (Check Engine) yanması",
      "Yakıt tüketiminde artış"
    ],
    commonCauses: [
      "Vanos / N205 eksantrik ayar selenoid valfi arızası veya yağ kanallarının tıkanması",
      "Eksantrik triger zincirinde uzama (stretch) veya gergide boşluk",
      "Düşük motor yağ basıncı veya yanlış vizkozitede yağ kullanımı",
      "Eksantrik mili konum sensörü (G40) arızası"
    ],
    stepByStepSolution: [
      "1. VCDS ile 091 ve 093 nolu kanallardan eksantrik açı değerleri (Phase Position) okunur (+/- 5 derece dışı zincir uzamasını gösterir).",
      "2. N205 Vanos selenoid valfi sökülüp direnç ve mekanik takılma testi yapılır.",
      "3. Motor yağ basıncı mekanik manometre ile sıcak motorda ölçülür.",
      "4. Zincir uzamışsa triger zincir seti ve gergi bilyası orijinal parçayla yenilenir."
    ],
    technicalNotes: "1.8 ve 2.0 TFSI motorlarda 100.000 km üzeri zincir uzaması çok sık görülür. Şıkırtı sesi ihmal edilirse sente atlayarak supap eğilmesine sebep olur."
  }
];

function runCrawler() {
  console.log('🚀 Ross-Tech VAG Arıza Kodu Madencisi Başlatılıyor...');

  let createdCount = 0;
  VAG_FAULT_CODES.forEach((data) => {
    const filePath = path.join(DATA_DIR, `${data.code}.json`);
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf-8');
    console.log(`✅ [KAYDEDİLDİ] ${data.code} -> ${filePath}`);
    createdCount++;
  });

  console.log(`\n🎉 Toplam ${createdCount} arıza kodu başarıyla güncellendi ve kütüphaneye işlendi!`);
}

runCrawler();
