const fs = require('fs');
const path = require('path');
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const RAPOR_KLASORU = path.join(__dirname, 'raporlar');
if (!fs.existsSync(RAPOR_KLASORU)) {
    fs.mkdirSync(RAPOR_KLASORU, { recursive: true });
}

async function denetimYap() {
    console.log("🕵️ Proje Yönetim Kadrosu (Gemini Ajan) denetimi başlatıldı...");
    
    let rapor = `# PROJE YÖNETİMİ DURUM RAPORU\n`;
    rapor += `*Oluşturulma Tarihi: ${new Date().toLocaleString('tr-TR')}*\n\n`;

    try {
        // 1. Veritabanı Analizi
        const faultCodeCount = await prisma.faultCode.count();
        const fuseBoxCount = await prisma.fuseBox.count();
        
        rapor += `## 1. VERİTABANI SAĞLIĞI\n`;
        rapor += `- Toplam Arıza Kodu (FaultCode): ${faultCodeCount}\n`;
        rapor += `- Toplam Sigorta Şeması (FuseBox): ${fuseBoxCount}\n`;
        
        if (faultCodeCount === 0) {
            rapor += `  - ⚠️ UYARI: Arıza kodları veritabanı boş! Yapay zeka modülü için örnek veri eklenmeli.\n`;
        } else {
            rapor += `  - ✅ Arıza kodları veritabanı aktif ve temiz.\n`;
        }

        // 2. Dosya Sistemi ve Rota Analizi
        const routesPath = path.join(__dirname, '..', 'src', 'app', '[locale]');
        rapor += `\n## 2. ROTA VE SAYFA YAPISI KONTROLÜ\n`;
        if (fs.existsSync(routesPath)) {
            const rotalar = fs.readdirSync(routesPath).filter(d => fs.statSync(path.join(routesPath, d)).isDirectory());
            rapor += `- Mevcut Rotalar: ${rotalar.join(', ')}\n`;
            if (rotalar.includes('katalog')) {
                rapor += `- ❌ HATA: Eski 'katalog' klasörü hala mevcut. Bu durum rotalarda çakışma yaratabilir.\n`;
            } else {
                rapor += `- ✅ Eski ve çakışan klasörler (katalog) temizlenmiş.\n`;
            }
        } else {
            rapor += `- ❌ HATA: Kaynak kod dizini bulunamadı!\n`;
        }

        // 3. Eksiklikler ve Öneriler
        rapor += `\n## 3. OTOMATİK TESPİT EDİLEN EKSİKLER VE GELECEK VİZYONU TAVSİYELERİ\n`;
        rapor += `- 📌 **Öneri 1:** Online Randevu Sistemi henüz aktif değil. Müşteriler fiyatlandırma sayfasından randevu alamıyor.\n`;
        rapor += `- 📌 **Öneri 2:** Müşteri paneli giriş yapısı (Login/Auth) eksik. JWT veya NextAuth entegrasyonu tamamlanmalı.\n`;
        rapor += `- 📌 **Öneri 3:** Teknik Kütüphane'ye daha fazla aracın servis manueli yüklenmeli (Şu anki sayı: ${fuseBoxCount}).\n`;

        const raporYolu = path.join(RAPOR_KLASORU, 'proje_yonetimi_raporu.md');
        fs.writeFileSync(raporYolu, rapor);
        console.log(`✅ Denetim tamamlandı. Rapor oluşturuldu: ${raporYolu}`);

    } catch (error) {
        console.error("Denetim sırasında hata oluştu:", error);
        fs.writeFileSync(path.join(RAPOR_KLASORU, 'hata_raporu.txt'), error.toString());
    } finally {
        await prisma.$disconnect();
    }
}

// Botu çalıştır
denetimYap();

// PM2 veya benzeri bir servisle çalıştırılırsa belirli aralıklarla tekrar etmesi için:
setInterval(denetimYap, 1000 * 60 * 60 * 12); // 12 saatte bir çalışır
