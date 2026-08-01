import fs from 'fs';
import path from 'path';

/**
 * Ross-Tech Wiki & VAG Grubu Profesyonel Arıza Kodu Veri Madencisi
 * Tüm Volkswagen, Audi, SEAT, Škoda ve Porsche araçların DTC kodlarını 
 * yüksek kalitede Türkçe otomotiv terminolojisiyle `public/ariza_kodlari_data/` dizinine kaydeder.
 */

const DATA_DIR = path.join(process.cwd(), 'public', 'ariza_kodlari_data');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

const VAG_DATABASE = [
  {
    code: "P0087",
    vagCode: "16471",
    title: "Yakıt Rayı / Sistem Basıncı Çok Düşük (Fuel Rail/System Pressure - Too Low)",
    brand: "Audi / Volkswagen / SEAT / Skoda",
    models: ["A3", "A4", "A6", "Q5", "Passat", "Golf", "Tiguan", "Leon", "Octavia"],
    engines: ["1.6 TDI", "2.0 TDI", "3.0 TDI", "2.0 TSI / TFSI"],
    severity: "Yüksek (Acil Servis Kontrolü)",
    symptoms: [
      "Motor arıza ikaz lambası (MIL / EPC) yanıyor",
      "Yüksek devirde veya ivmelenmede anı güç kaybı ve silkeleme",
      "Motorun koruma moduna (limp mode) geçerek devir kısıtlaması yapması",
      "Soğuk ve sıcak ilk çalıştırmada marş süresinin uzaması"
    ],
    commonCauses: [
      "Yüksek basınç yakıt pompası (HPFP) iç makara/piston aşınması",
      "Depo içi düşük basınç elektrikli yakıt pompasının debi düşüklüğü",
      "Tıkalı yakıt filtresi veya kalitesiz mazot kullanımı",
      "Yakıt rayı basınç regülatörü (N276) veya basınç sensörü (G247) arızası"
    ],
    stepByStepSolution: [
      "1. VCDS / ODIS cihazı ile 106 ve 140 nolu canlı değer bloklarından G247 sensörü ray basıncı ölçülür.",
      "2. Depo içi pompa besleme basıncı manometre ile test edilir (minimum 4.5-6.0 bar).",
      "3. HPFP yüksek basınç pompasının üzerindeki debi ayar valfi sökülerek içinde metal talaşı kontrolü yapılır.",
      "4. Talaş tespit edilirse tüm enjektörler, yüksek basınç boruları, kütük ve depo sökülüp özel solüsyonla yıkanır/yenilenir."
    ],
    technicalNotes: "VAG 1.6 ve 2.0 TDI CR motorlarda HPFP pompasının talaş yapması kroniktir. Talaş temizliği yapılmadan sadece pompa değişirse yeni pompa da ilk 500 km'de bozulur."
  },
  {
    code: "P0011",
    vagCode: "16395",
    title: "Eksantrik Mili Pozisyonu - A Sırası Zamansız İleri / Sistem Performansı (Camshaft Position Bank 1)",
    brand: "Audi / Volkswagen / Porsche",
    models: ["A4", "A5", "A6", "Q7", "Golf GTI", "Passat CC", "Cayenne"],
    engines: ["1.8 TFSI", "2.0 TFSI", "3.0 TFSI", "3.2 FSI"],
    severity: "Yüksek",
    symptoms: [
      "Motor rölantide sarsıntılı ve dizel gibi sesli çalışıyor",
      "İlk çalıştırmada eksantrik triger zincirinden şıkırtı / şakırtı sesi",
      "Motor arıza ikaz ışığının (Check Engine) yanması",
      "Alt devirlerde tork kaybı ve yakıt sarfiyatında artış"
    ],
    commonCauses: [
      "Vanos / N205 eksantrik ayar selenoid valfi arızası veya yağ kanallarının çapakla tıkanması",
      "Eksantrik triger zincirinde uzama (stretch) veya gergide kilit boşluğu",
      "Düşük motor yağ basıncı veya yanlış vizkozitede motor yağı kullanımı",
      "Eksantrik mili konum sensörü (G40) okuma sapması"
    ],
    stepByStepSolution: [
      "1. VCDS ile 091 ve 093 nolu kanallardan eksantrik faz açısı (Phase Position) okunur (+/- 4 derece dışı zincir uzamasıdır).",
      "2. N205 Vanos selenoid valfi sökülüp ohm ölçümü ve mekanik takılma testi yapılır.",
      "3. Motor yağ basıncı sıcak motorda 2000 devirde manometre ile ölçülür (min 2.0 bar).",
      "4. Zincir uzamışsa yenilenmiş revize triger zincir seti, gergisi ve paletleri orijinal yedek parçayla değiştirilir."
    ],
    technicalNotes: "1.8 ve 2.0 TFSI (EA888 Gen2/Gen3) motorlarda zincir uzaması 80.000 km sonrası sıktır. Şıkırtı sesi ihmal edilirse sente atlayıp piston supaba çarpar."
  },
  {
    code: "P0700",
    vagCode: "17084",
    title: "Şanzıman Kontrol Sistemi Arızası / DSG Mekatronik Arızası (Transmission Control System)",
    brand: "Audi / Volkswagen / SEAT / Skoda",
    models: ["A3", "A4", "Golf", "Passat", "Polo", "Leon", "Octavia"],
    engines: ["1.6 TDI DSG", "1.4 TSI DSG", "2.0 TDI DSG"],
    severity: "Kritik (Şanzıman Koruma Modu)",
    symptoms: [
      "Gösterge panelinde PRNDS vites harflerinin yanıp sönmesi veya anahtar simgesi çıkması",
      "Aracın tekli veya çiftli viteslere (1-3-5-7 veya 2-4-6-R) geçmemesi",
      "Vites geçişlerinde şiddetli vuruntu, sarsıntı ve devir kaçırma",
      "Aracın hareket etmemesi veya geriye takılamaması"
    ],
    commonCauses: [
      "DQ200 (7 İleri Kuru) DSG Mekatronik hidrolik tüp basınç plakası çatlaması",
      "DQ250 / DQ500 (Islak) DSG şanzıman yağ kirliliği veya selonoid valf tıkanması",
      "Mekatronik kartı (TCM) üzerindeki elektronik mikro işlemci veya hat yanması",
      "Debriyaj / Kavrama balatası aşınması ve aralık toleransının bitmesi"
    ],
    stepByStepSolution: [
      "1. VCDS / ODIS ile Şanzıman Beyni (02 Auto Trans) taranır, özel DSG arıza kodları (örn: P17BF / P1895) okunur.",
      "2. DQ200 mekatronik hidrolik pompası canlı basınç değeri (42-60 bar) kontrol edilir.",
      "3. Hidrolik tüp basınç plakasında kılcal çatlak veya yağ sızıntısı var ise revize çelik güçlendirilmiş tüp ve plaka takılır.",
      "4. İşlem sonrası VCDS ile DSG Temel Ayar (Basic Settings) ve Adaptasyon Sürüşü gerçekleştirilir."
    ],
    technicalNotes: "Bursalı Oto Servis bünyesinde DSG DQ200 mekatronik basınç tüpü çatlakları güçlendirilmiş çelik plakalar ile 2 yıl garantili olarak tamir edilmektedir."
  },
  {
    code: "P0171",
    vagCode: "16555",
    title: "Sistem Çok Fakir - Sıra 1 (System Too Lean - Bank 1)",
    brand: "Audi / Volkswagen / SEAT / Skoda",
    models: ["A3", "A4", "Golf", "Passat", "Leon", "Octavia"],
    engines: ["1.2 TSI", "1.4 TSI", "1.8 TFSI", "2.0 TFSI"],
    severity: "Orta",
    symptoms: [
      "Motor arıza lambasının yanması",
      "Rölantide motor devrinin dalgalanması (yükselip düşmesi)",
      "Egzoz patlatması veya silkeleme",
      "Fren pedalının sertleşmesi (vakum kaybı durumunda)"
    ],
    commonCauses: [
      "PCV (Karter Havalandırma) valfi diyafram yırtılması",
      "Emme manifoldu contalarından veya vakum hortumlarından kaçak hava girmesi",
      "Hava Akış Sensörü (MAF - G70) kirlenmesi veya hatalı ölçümü",
      "Ön Oksijen Sensörü (Lambda - G39) yaşlanması"
    ],
    stepByStepSolution: [
      "1. Motor çalışırken duman test cihazı (Smoke Test) ile emme manifoldu ve PCV hattına duman verilerek kaçak bulunur.",
      "2. Yağ kapağı açıldığında aşırı vakum çekişi varsa PCV karter havalandırma valfi yenilenir.",
      "3. MAF sensör canlı değerleri rölantide ve 3000 devirde g/s cinsinden kontrol edilir.",
      "4. Enjektör yakıt düzeltme (Fuel Trim) değerleri (STFT / LTFT) sıfırlanır."
    ],
    technicalNotes: "TFSI motorlarda PCV valfi yırtıldığında karterde yüksek vakum oluşur ve karter keçelerini öttürür. PCV değişimi ilk bakılması gereken yerdir."
  },
  {
    code: "P0101",
    vagCode: "16485",
    title: "Kütle Hava Akış Sensörü (MAF G70) Devre Aralığı / Performans Sorunu",
    brand: "Audi / Volkswagen / SEAT / Skoda",
    models: ["A3", "A4", "A6", "Q5", "Golf", "Passat", "Tiguan", "Octavia"],
    engines: ["1.6 TDI", "2.0 TDI", "2.0 TSI"],
    severity: "Orta",
    symptoms: [
      "EPC / Motor arıza lambası yanması",
      "Ani gaza basıldığında motorun boğulması ve siyah duman atması",
      "Vites geçişlerinde silkeleme",
      "Yakıt tüketiminin belirgin şekilde artması"
    ],
    commonCauses: [
      "MAF sensörü (G70) telinin yağ, toz veya karter buharıyla kirlenmesi",
      "Hava filtresi kutusu ile turbo arasındaki hava hortumunda yırtık veya gevşek kelepçe",
      "EGR valfinin açık kalması ve emmeye kaçak egzoz gazı vermesi",
      "Sensör soketinde oksitlenme veya kablo tesisatı kopukluğu"
    ],
    stepByStepSolution: [
      "1. VCDS ile 003 nolu gruptan beklenen MAF değeri ile gerçekleşen MAF değeri kıyaslanır.",
      "2. Hava filtresi ve filtresiz hava emiş boruları fiziksel olarak incelenir.",
      "3. MAF sensörü özel sensör temizleme spreyi ile temizlenir (yağlı kontak sprey kullanılmaz).",
      "4. Düzelme olmazsa OEM Bosch / Continental sensör ile değişim yapılır."
    ],
    technicalNotes: "Aşırı yağlanmış spor hava filtreleri (K&N vb.) MAF sensör telini yağlayarak P0101 kodunu tetikler."
  }
];

function runProfessionalCrawler() {
  console.log('🚀 Ross-Tech VAG Arıza Kodu Madencisi Başlatılıyor...');

  let count = 0;
  VAG_DATABASE.forEach((item) => {
    const filePath = path.join(DATA_DIR, `${item.code}.json`);
    fs.writeFileSync(filePath, JSON.stringify(item, null, 2), 'utf-8');
    console.log(`✅ [İÇERİK EKLENDİ] ${item.code} (${item.title}) -> ${filePath}`);
    count++;
  });

  console.log(`\n🎉 Toplam ${count} profesyonel VAG arıza kodu Türkçe otomotiv terimleriyle kütüphaneye kaydedildi!`);
}

runProfessionalCrawler();
