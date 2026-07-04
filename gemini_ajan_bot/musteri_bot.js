const fs = require('fs');
const path = require('path');

const RAPOR_KLASORU = path.join(__dirname, 'raporlar', 'musteri_raporlari');
if (!fs.existsSync(RAPOR_KLASORU)) {
    fs.mkdirSync(RAPOR_KLASORU, { recursive: true });
}

// Simüle edilecek premium müşteri profilleri
const MUSTERI_PROFILLERI = [
    { marka: 'Porsche', model: 'Taycan', profil: 'Teknoloji odaklı, hıza önem veren, şeffaflık arayan elit müşteri.' },
    { marka: 'Mercedes', model: 'S-Class', profil: 'Konfor ve güvenilirlik arayan, fiyata değil kaliteye bakan iş insanı.' },
    { marka: 'BMW', model: 'M5', profil: 'Performans tutkunu, aracının ince ayarlarına kadar bilmek isteyen meraklı müşteri.' },
    { marka: 'Audi', model: 'Q8', profil: 'Premium SUV kullanıcısı, aile güvenliği ve servis garantisi arıyor.' },
    { marka: 'Land Rover', model: 'Range Rover', profil: 'Lüks ve arazi yeteneği arayan, VIP hizmet bekleyen müşteri.' }
];

// Olası müşteri geri bildirimleri (Rastgele seçilmek üzere)
const OLUMLU_YORUMLAR = [
    "Sitenin tasarımı (Dark mode ve altın detaylar) aracıma uygun premium bir his verdi.",
    "Arıza kodumu (OBD2) girdiğimde direkt yapay zeka ile Türkçe çözüm almam harika bir özellik.",
    "Fiyatlandırmanın şeffaf olması, yetkili servislerden en büyük farkınız. Kesinlikle tercih sebebim.",
    "Sigorta kütüphanesi çok faydalı, sanayideki ustalar yerine burayı tercih edeceğim."
];

const GELISTIRME_ONERILERI = [
    "Randevu almak için sadece iletişim formu var, doğrudan takvim üzerinden online randevu oluşturabilmek isterdim.",
    "Aracımın şasi numarasını (VIN) girerek aracıma özel geçmiş bakım kayıtlarını görebileceğim bir portalınız var mı?",
    "Fethiye dışındayken yolda kalırsam Sanal Usta ile canlı görüntülü görüşme veya Whatsapp botu entegrasyonu harika olurdu.",
    "Mobil uygulaması olsa çok daha pratik olurdu, her seferinde tarayıcıdan girmek istemiyorum."
];

function musteriZiyaretiSimuleEt() {
    const musteri = MUSTERI_PROFILLERI[Math.floor(Math.random() * MUSTERI_PROFILLERI.length)];
    const olumlu = OLUMLU_YORUMLAR[Math.floor(Math.random() * OLUMLU_YORUMLAR.length)];
    const oneri = GELISTIRME_ONERILERI[Math.floor(Math.random() * GELISTIRME_ONERILERI.length)];

    const tarih = new Date();
    const dosyaAdi = `Musteri_${musteri.marka}_${tarih.getTime()}.md`;
    
    let rapor = `# MÜŞTERİ ZİYARET VE DEĞERLENDİRME RAPORU\n`;
    rapor += `*Tarih: ${tarih.toLocaleString('tr-TR')}*\n\n`;
    rapor += `## Müşteri Profili\n`;
    rapor += `- **Araç:** ${musteri.marka} ${musteri.model}\n`;
    rapor += `- **Müşteri Tipi:** ${musteri.profil}\n\n`;
    
    rapor += `## Ziyaret Geri Bildirimi\n`;
    rapor += `### Neden Sitenizi Tercih Etti (Olumlu İzlenimler)\n`;
    rapor += `> "${olumlu}"\n\n`;
    
    rapor += `### Tespit Ettiği Eksikler (Geliştirme Tavsiyeleri)\n`;
    rapor += `> "${oneri}"\n\n`;
    
    rapor += `--- \n`;
    rapor += `*Bu rapor Gemini Müşteri Ajan Botu tarafından otonom olarak üretilmiştir.*\n`;

    const raporYolu = path.join(RAPOR_KLASORU, dosyaAdi);
    fs.writeFileSync(raporYolu, rapor);
    
    console.log(`👤 Müşteri Ziyareti Simüle Edildi: ${musteri.marka} ${musteri.model} -> Rapor: ${dosyaAdi}`);
}

// Botu çalıştır
musteriZiyaretiSimuleEt();

// PM2 ile sürekli çalıştırılırsa, her 4 saatte bir yeni müşteri ziyareti simüle et
setInterval(musteriZiyaretiSimuleEt, 1000 * 60 * 60 * 4);
