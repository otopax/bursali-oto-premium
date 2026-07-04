# BURSALI OTO DİJİTAL YÖNETİM SİSTEMİ - VİZYON VE DURUM RAPORU

Bu belge, projenin geçmişini, mevcut durumunu, gelecek vizyonunu ve kaynak kod mimarisini detaylı bir şekilde açıklamak amacıyla, hem proje sahipleri hem de otonom denetçi ajanlar (Gemini Ajan Botları) için bir referans noktası olarak hazırlanmıştır.

## 1. PROJE VİZYONU
Bursalı Oto Dijital Yönetim Sistemi, Fethiye bölgesinde Premium segment (Porsche, Mercedes, BMW, Audi, Land Rover vb.) araç sahiplerine hitap eden, sıradan bir oto tamirhane sitesinden ziyade **"Klinik Hassasiyetinde, Şeffaf ve Kurumsal Bir Otomotiv Dijital Deneyimi"** sunmayı hedefler. 
Müşterilerin araçlarındaki sorunları yapay zeka desteğiyle önceden anlayabildikleri, onarım süreçlerini şeffafça takip edebildikleri ve teknik bilgiye doğrudan ulaşabildikleri bir platform inşa edilmektedir.

## 2. NEREDEN NEREYE GELDİ? (GEÇMİŞ)
- **Başlangıç Noktası:** Proje, standart, statik ve kullanıcı etkileşimi düşük bir web sitesi fikrinden yola çıktı.
- **Dönüşüm:** Kullanıcı talepleri ve premium vizyon doğrultusunda, Next.js (App Router) kullanılarak modern, yüksek performanslı ve SEO uyumlu bir altyapıya taşındı.
- **Sorunların Aşılması:** 
  - Dinamik sayfa rotalamalarında yaşanan çakışmalar (özellikle katalog ve arıza çözümleri sayfaları arasında) tespit edilerek giderildi.
  - Web crawler (örümcek) botlarının sigorta şemalarını yanlışlıkla motor arıza kodu veritabanına kaydetmesiyle oluşan veri kirliliği (Örn: Acura_adx_fuses) özel temizlik betikleriyle kalıcı olarak silindi ve veritabanı steril hale getirildi.
  - Önbellek (cache) ve sunucu sorunları PM2 yapılandırmaları ve Next.js önbellek temizleme işlemleriyle aşıldı.

## 3. NELER YAPILDI? (MEVCUT DURUM)
- **Teknoloji Yığını (Tech Stack):** 
  - Frontend: Next.js 14+ (App Router), React, Vanilla CSS (Glassmorphism & Dark Mode).
  - Backend: Node.js, Next.js API Routes.
  - Veritabanı: Prisma ORM, SQLite/PostgreSQL.
- **Aktif Modüller:**
  - **Çoklu Dil Desteği:** Türkçe ve İngilizce (`/tr`, `/en`) altyapısı kuruldu.
  - **Akıllı Arıza Çözüm Merkezi:** OBD-II hata kodlarının (P0171, P0420 vb.) Gemini AI kullanılarak analiz edildiği, kullanıcılara çözüm adımlarının sunulduğu sistem aktiftir.
  - **Teknik ve Sigorta Kütüphanesi:** Marka, model ve yıl bazlı sigorta kutusu şemaları ve teknik veriler için hiyerarşik yapı kuruldu (`/sigorta-kutuphanesi`).
  - **Premium UI/UX:** Altın sarısı vurgular, cam efekti (glassmorphism), karanlık tema (dark mode) ve mikro animasyonlarla lüks araç hissiyatı arayüze yansıtıldı.
  - **Canlı Sunucu Entegrasyonu:** PM2 ile arka planda kesintisiz çalışan production (üretim) sunucusu ayarlandı.

## 4. NELER YAPILACAK? (GELECEK VİZYONU)
- **Otonom Ajan Denetimi:** Siteyi 7/24 denetleyen, eksikleri raporlayan Proje Yönetim ve Müşteri Ajan botlarının entegrasyonu.
- **ERP ve İş Emri Yönetimi:** Servisteki araçların durumunun, değişen parçaların ve işçiliğin dijital ortamda takip edileceği arka plan yönetim paneli.
- **Kişiselleştirilmiş Müşteri Paneli:** Müşterilerin giriş yaparak kendi araçlarının servis geçmişini, faturalarını ve yaklaşan bakım zamanlarını görebilecekleri portal.
- **Canlı AI Asistan:** Site ziyaretçilerine anlık olarak fiyat tahmini, randevu oluşturma ve teknik destek sunacak "Sanal Usta" modülünün tamamen interaktif hale getirilmesi.
- **Online Randevu Sistemi:** Kapasite ve usta müsaitliğine göre akıllı randevu planlama.

## 5. DENETÇİ AJANLAR İÇİN KAYNAK KOD HARİTASI
Denetçi botların (Proje Yöneticisi ve Müşteri Botu) siteyi analiz ederken referans alacağı dosya mimarisi:

- `src/app/[locale]/`: Tüm kullanıcı arayüzü sayfaları burada bulunur. Çoklu dil desteği klasör yapısına entegredir.
  - `/ariza-cozumleri/`: OBD2 hata kodları arama ve AI analiz sayfaları.
  - `/sigorta-kutuphanesi/`: Araç sigorta paneli ve şema verileri.
- `src/components/`: Tekrar kullanılabilir UI bileşenleri (Navbar, Footer, SearchBars).
- `src/lib/`: İş mantığı, Prisma veritabanı bağlantıları (`prisma.js`) ve veri çekme fonksiyonları (`fuseboxDb.js`, `faultCodeUtils.js`).
- `prisma/schema.prisma`: Veritabanı modellerinin (FaultCode, FuseBox vb.) tanımlandığı ana şema dosyası.
- `scripts/`: Veritabanı bakım, temizlik ve test işlemlerini yürüten otomasyon dosyaları.
- `gemini_ajan_bot/`: Otonom değerlendirme yapan, projeyi ve müşteri deneyimini test eden scriptlerin/ajanların bulunduğu klasör.

---
**Durum:** Stabil ve Geliştirmeye Açık.
**Son Güncelleme:** Veritabanı arındırması ve rota düzeltmeleri tamamlandı. UI temiz.
**Odak:** Müşteri deneyimini artırmak ve otonom test sistemlerini çalıştırmak.
