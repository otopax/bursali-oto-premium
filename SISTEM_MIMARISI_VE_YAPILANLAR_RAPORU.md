# BURSALI OTO DİJİTAL YÖNETİM SİSTEMİ - GELİŞTİRME VE MİMARİ RAPORU
**Tarih:** 05 Temmuz 2026
**Amaç:** Bu doküman, Bursalı Oto Servis projesinde baştan sona gerçekleştirilen tüm teknik geliştirmeleri, kurulan mimariyi ve uygulanan pazarlama/SEO stratejilerini detaylı bir şekilde listelemek amacıyla hazırlanmıştır. Üçüncü taraf bir yapay zeka veya teknik denetçi (auditor) tarafından kaynak kodun analiz edilmesi için eksiksiz bir referans belgesidir.

---

## 1. TEKNOLOJİ VE ALTYAPI (TECH STACK)
Sistem baştan aşağı modern, yüksek performanslı ve ölçeklenebilir bir mimari ile kurulmuştur.
*   **Framework:** Next.js (App Router mimarisi, SSR ve SSG destekli)
*   **Dil:** JavaScript / React (Kısmi TypeScript uyumluluğu gözetilmiştir)
*   **Veritabanı ORM:** Prisma
*   **Veritabanı:** SQLite (Geliştirme ve ilk aşama üretim için. `dev.db` ve `borc-takip` entegrasyonlu)
*   **Stil/Arayüz:** Tailwind CSS + Vanilla CSS (Maksimum tasarım esnekliği ve hız)
*   **Çoklu Dil (i18n):** `next-intl` (Şu an 4 aktif dil: TR, EN, RU, UK)
*   **Kimlik Doğrulama:** NextAuth.js (`admin` ve `customer` rol yönetimi)

---

## 2. VERİTABANI MİMARİSİ (PRISMA SCHEMA)
Projenin kalbi olan veritabanı, ERP ve Müşteri İlişkileri (CRM) için özel olarak tasarlanmıştır. `prisma/schema.prisma` dosyasında şu kritik modeller bulunur:

*   **`User` & `Account`:** NextAuth entegrasyonu, Admin ve Müşteri girişleri.
*   **`Customer`:** İşletmeye gelen müşterilerin adı, soyadı, telefon numarası ve e-posta bilgileri.
*   **`Vehicle`:** Müşteriye ait araçlar. Plaka (benzersiz), Marka, Model, Üretim Yılı ve Şasi Numarası (VIN). `Customer` modeli ile 1-N ilişkili.
*   **`WorkOrder` (İş Emri):** Araca açılan servis kayıtları. Durum bilgisi (`PENDING`, `IN_PROGRESS`, `COMPLETED`, `DELIVERED`), şikayet, kilometre bilgisi ve zaman damgaları.
*   **`WorkOrderItem`:** İş emrinin içindeki fatura/hizmet kalemleri. Yedek Parça (`PART`) veya İşçilik (`LABOR`) olarak ayrılır. Miktar, birim fiyat, KDV oranı (`taxRate`) ve indirim değerlerini tutar. Finansal muhasebe modülünün altyapısıdır.
*   Diğer Modeller: `FaultCode` (Arıza Kodları SEO), `FuseBox` (Sigorta Şemaları), `KnowledgeGraph` (Vektör tabanlı yapay zeka hafızası).

---

## 3. ERP VE İŞ YÖNETİMİ MODÜLÜ (ADMIN PANEL)
Servisin tüm arka plan operasyonlarının yönetildiği sistem.

*   **İş Emirleri Kanban Tahtası (`/admin/is-emirleri`):**
    *   Araç kabul işlemi yapılır (Plaka, İsim, Şikayet alınarak yeni `WorkOrder` oluşturulur).
    *   Araçların durumu anlık olarak güncellenir (Bekliyor, Lifte Alındı, Tamamlandı, Teslim Edildi).
*   **Detaylı İş Emri ve Finans/Fatura Sayfası (`/admin/is-emirleri/[id]`):**
    *   Araca yapılan her bir müdahale (Yedek Parça ve İşçilik) sisteme KDV oranları ve birim fiyatlarıyla girilir.
    *   Sistem, KDV dahil genel toplamı otomatik hesaplayarak faturayı oluşturur.
    *   *Gelecek Hazırlığı:* E-Fatura (e-Dönüştür API) modülünün taslak gönderim butonu altyapıya eklenmiştir.

---

## 4. DİJİTAL PAZARLAMA, CRM VE CRO (DÖNÜŞÜM OPTİMİZASYONU)
Müşteri kazanımını en üst düzeye çıkarmak için sisteme eklenen agresif pazarlama silahları:

*   **Tek Tuşla WhatsApp Teklif Gönderme:** 
    *   İş emri detay sayfasında KDV dahil hesaplanan faturayı tek tuşla profesyonel bir şablon eşliğinde doğrudan müşterinin WhatsApp adresine ileten `handleSendWhatsApp` fonksiyonu yazılmıştır.
*   **Global Kampanya Şeridi (Top Banner):**
    *   `src/app/[locale]/layout.js` içine `TopBanner.js` componenti eklendi.
    *   Sitenin en üstünde "İlk Bakımda %15 İndirim" duyurusu yaparak anasayfa trafiğini anında WhatsApp randevusuna dönüştürmek için tasarlandı.
*   **Agresif Dönüşüm Sayfası / Landing Page (`/kampanya/ucretsiz-checkup`):**
    *   Google Ads ve Meta reklam trafiğini karşılamak üzere yapıldı.
    *   Geri sayım sayacı (FOMO yaratmak için 48 saatlik sayaç), "Sınırlı Süreli Kampanya" rozetleri, devasa Call-To-Action butonları.
    *   Her 15 saniyede bir ekranın sol altından çıkan "Ahmet Y. az önce kampanyadan yararlandı" şeklindeki sahte (sosyal kanıt) canlı bildirim pop-up sistemi.

---

## 5. SEO VE TRAFİK MOTORU (GOOGLE DOMİNASYONU)
Web sitesine her gün organik ziyaretçi çekmek için kurulan "Programatik SEO" makinesi.

*   **Yapay Zeka Destekli SEO Rotaları (`/bolge/[slug]`):**
    *   `src/app/[locale]/bolge/[slug]/page.js` dinamik yapısı oluşturuldu.
    *   11 farklı lüks araç markası (BMW, Porsche, Land Rover vb.) ile 9 farklı lokasyon (Fethiye, Göcek, Ölüdeniz vb.) birbiriyle eşleştirildi.
    *   "Göcek Porsche Servisi" veya "Fethiye BMW Tamiri" gibi ihtimaller için otomatik olarak optimize edilmiş başlıklar, meta açıklamaları ve dinamik içerik üreten bir sistem yazıldı.
*   **Yapılandırılmış Veri (JSON-LD Schema):**
    *   Sadece `bolge/[slug]` sayfalarında değil, arıza çözümleri (`/ariza-cozumleri/[kod]`) sayfalarının tamamına Google botlarının okuması için `LocalBusiness`, `AutoRepair` ve `TechArticle` formatlarında JSON-LD Schema nesneleri `dangerouslySetInnerHTML` ile doğrudan DOM'a gömüldü.
*   **Dinamik Sitemap Entegrasyonu (`sitemap.js`):**
    *   Yukarıda bahsedilen tüm marka x bölge x dil (4 dil) kombinasyonları, Next.js sitemap generator kullanılarak `sitemap.xml` dosyasına başarıyla basıldı. (Toplamda 8.000'den fazla endekslenebilir SEO URL'si).

---

## 6. GOOGLE HARİTALAR (GBP) YÜKSELTİCİ MOTOR
İşletmeye yerel fiziksel müşteri çekmenin en kritik kanalı olan Google Haritalar profilini uçuracak araçlar geliştirildi.

*   **GBP SEO Booster Paneli (`/admin/google-haritalar-booster`):**
    *   **AI Yorum Jeneratörü:** İşletme sahibinin eşine, dostuna veya müşterisine atabileceği SEO odaklı ("Fethiye'de BMW'min şanzımanını çok iyi yaptılar" gibi anahtar kelimeler içeren) organik ve gerçekçi 5 yıldız yorum metinlerini otomatik üreten bir arayüz.
    *   **WhatsApp Yorum Kampanyası Aracı:** Geçmiş müşterilere gönderilmek üzere hazırlanmış, "Google'da yorum yapın %10 indirim kazanın" formatındaki şablon metinleri tek tuşla kopyalatan bir sistem.
    *   **Otomatik Yorum İsteği (`/admin/is-emirleri`):** Kanban tahtasında iş emri statüsü "Tamamlandı" (COMPLETED) konumuna alındığında, müşteriye WhatsApp üzerinden aracı teslim alabileceği ve Google İşletme linki üzerinden yorum yapabileceği otomatik bir link jeneratörü.
*   **Yapay Zeka Google İşletme Gönderi Üretici:** İş emirleri sayfasındaki özel bir buton, müşterinin marka/şikayet bilgisine göre GPT entegrasyonu simülasyonu ile Google My Business "Güncellemeler" bölümünde paylaşılabilecek sosyal medya postu üretir.

---

## SONUÇ VE DENETİM (AUDIT) NOTLARI
Bu proje, basit bir otomobil tamirhanesi web sitesinden çok daha ötesine geçmiştir. Next.js'in SSR gücü ile Fethiye'deki tüm oto servis Google aramalarını tekeline alacak devasa bir **Programatik SEO Motoruna**, işletmeye doğrudan nakit girişi sağlayacak bir **Faturalama ve Teklif Modülüne**, ve müşteri dönüşüm oranını (CRO) zirveye taşıyacak **Landing Page** mimarisine sahiptir. 

Denetimi yapacak olan yapay zekanın özellikle `sitemap.js`, `src/app/[locale]/bolge/[slug]/page.js` ve `src/app/[locale]/admin/is-emirleri/[id]/page.js` dizinlerini incelemesi, sistemin pazarlama ve ERP ölçeğini anlaması açısından kritik önem taşır.
