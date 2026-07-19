const fs = require('fs');
const path = require('path');

const faultsDir = path.join(__dirname, '../src/content/faults');
const indexFile = path.join(__dirname, '../src/content/fault-codes-index.json');

// Ensure the directory exists
if (!fs.existsSync(faultsDir)) {
  fs.mkdirSync(faultsDir, { recursive: true });
}

// A curated list of highly searched OBD2 codes
const baseCodes = [
  { code: 'P0420', title: 'Katalitik Konvertör Sistem Verimliliği Sınırın Altında', system: 'Egzoz/Emisyon', risk: 'Orta', canDrive: 'Evet, ancak performans düşebilir', estTime: '2-4 Saat', estCost: 'Orta-Yüksek', causes: ['Arızalı Katalitik Konvertör', 'Bozuk Oksijen (O2) Sensörü', 'Egzoz Kaçağı'] },
  { code: 'P0171', title: 'Sistem Çok Fakir (Bank 1)', system: 'Yakıt Sistemi', risk: 'Yüksek', canDrive: 'Kısa mesafe sürülebilir, motor hasarı riski var', estTime: '1-3 Saat', estCost: 'Değişken', causes: ['Vakum Kaçağı', 'Kirli MAF Sensörü', 'Zayıf Yakıt Pompası', 'Tıkalı Yakıt Enjektörü'] },
  { code: 'P0300', title: 'Rastgele/Birden Fazla Silindirde Tekleme (Misfire)', system: 'Ateşleme', risk: 'Kritik', canDrive: 'Hayır - Acil durdurun', estTime: '1-4 Saat', estCost: 'Orta', causes: ['Aşınmış Bujiler', 'Bozuk Ateşleme Bobini', 'Düşük Yakıt Basıncı', 'Kötü Yakıt'] },
  { code: 'P2002', title: 'Dizel Partikül Filtresi (DPF) Verimliliği Sınırın Altında', system: 'DPF', risk: 'Yüksek', canDrive: 'Hayır - Çekici Çağırın', estTime: '3-5 Saat', estCost: 'Yüksek', causes: ['Tıkalı DPF', 'Kötü Kaliteli Yakıt', 'EGR Valfi Sorunu'] },
  { code: 'P2458', title: 'Dizel Partikül Filtresi Rejenerasyon Süresi Hatası', system: 'DPF', risk: 'Yüksek', canDrive: 'Kısa mesafe', estTime: '2-4 Saat', estCost: 'Orta-Yüksek', causes: ['DPF Tıkanıklığı', 'Egzoz Basınç Sensörü Arızası'] }
];

const premiumBrands = ['BMW', 'Mercedes', 'Audi', 'Porsche', 'Volkswagen'];
const jsonIndex = {};

console.log(`Generating highly enriched pSEO pages for ${baseCodes.length} codes across ${premiumBrands.length} brands...`);

baseCodes.forEach(item => {
  premiumBrands.forEach(brand => {
    const brandSlug = brand.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    const codeSlug = item.code.toLowerCase();
    const fileName = `${brandSlug}-${codeSlug}-ariza-kodu-cozumu.mdx`;
    const filePath = path.join(faultsDir, fileName);

    // Populate JSON index mapping raw code to slug
    // e.g. "P0420 BMW" -> "bmw-p0420-ariza-kodu-cozumu"
    const searchKey = `${item.code} ${brand}`.toUpperCase();
    jsonIndex[searchKey] = fileName.replace('.mdx', '');
    
    // Also map just the raw code to the first generated slug (as a fallback)
    if (!jsonIndex[item.code.toUpperCase()]) {
      jsonIndex[item.code.toUpperCase()] = fileName.replace('.mdx', '');
    }

    const content = `---
title: "${item.code} ${brand} Arıza Kodu: ${item.title}"
date: "${new Date().toISOString()}"
updated: "${new Date().toISOString()}"
brand: "${brand}"
model: "Tüm Modeller"
system: "${item.system}"
riskLevel: "${item.risk}"
canDrive: "${item.canDrive}"
estimatedTime: "${item.estTime}"
estimatedCost: "${item.estCost}"
potentialCauses: "${item.causes.join(', ')}"
description: "${brand} marka araçlarda karşılaşılan ${item.code} (${item.title}) arıza kodunun nedenleri, risk durumu ve Fethiye Bursalı Oto Servis'te garantili çözümü."
---

# ${brand} ${item.code} Arıza Kodu Nedir?

Aracınızın OBD-II taramasında veya gösterge panelinde **${item.code}** hata koduyla karşılaşıyorsanız, bu durum **${brand}** markalı aracınızın **${item.system}** sisteminde "${item.title}" sorununa işaret eder.

Özellikle premium segment ${brand} araçlarda bu arıza kodu, sürüş güvenliğini ve motor ömrünü doğrudan etkileyebileceğinden acil müdahale gerektirir.

## ${item.code} Arızasının Belirtileri
- Motor arıza lambasının (Check Engine) yanması.
- Performans kaybı ve hızlanmada zorlanma.
- Yakıt tüketiminde artış.
- Rölantide dalgalanma veya motorun sarsıntılı çalışması.

## ${brand} Araçlarda ${item.code} Neden Olur?
Bu arızanın tetiklenmesinin en yaygın nedenleri şunlardır:
${item.causes.map(cause => `- **${cause}**`).join('\n')}
- ${brand} markasına özgü kronik donanım yorgunlukları.
- Kötü yakıt kalitesi veya zamanında yapılmayan periyodik bakımlar.

## Fethiye'de ${brand} ${item.code} Arızasının Kesin Çözümü
"Deneme-yanılma" yöntemi, premium araçlarda yüksek maliyetli hasarlara yol açar. **Bursalı Oto Servis** olarak Fethiye'de, **${brand}** aracınızdaki ${item.code} arızasını markaya özel orijinal lisanslı diyagnoz cihazlarımızla noktasal olarak tespit ediyoruz.

1. **Gelişmiş Arıza Tespiti:** Arızanın sensörden mi yoksa mekanik bir parçadan mı kaynaklandığı kesin olarak bulunur.
2. **Orijinal Parça (OEM) Değişimi:** Sadece fabrika standartlarındaki parçalar kullanılır.
3. **Adaptasyon ve Kalibrasyon:** Yeni parça araca tanıtılır ve beyin yazılımı güncellenir.
4. **Test Sürüşü:** Aracınız sorunsuz bir şekilde, işçilik ve parça garantisiyle teslim edilir.

Aracınız yolda kaldıysa veya bu arıza kodunu alıyorsanız, Fethiye ve çevre bölgelerde (Göcek, Ölüdeniz, Kalkan) 7/24 hizmet veren VIP çekici servisimizle aracınızı güvenle servisimize alıyoruz.
`;

    fs.writeFileSync(filePath, content, 'utf8');
  });
});

// Save JSON Index
fs.writeFileSync(indexFile, JSON.stringify(jsonIndex, null, 2), 'utf8');
console.log(`Successfully generated ${baseCodes.length * premiumBrands.length} pSEO pages and saved JSON index to ${indexFile}`);
