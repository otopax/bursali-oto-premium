# Bursalı Oto Servis - Mobil Canlı Test Kontrol Listesi
*Bu liste her büyük canlı yayından (deploy) önce mobil cihazlarda veya tarayıcının geliştirici araçları üzerinden 5 dakikada kontrol edilmesi gereken kritik noktaları içerir.*

## 1. Temel Görünüm ve Düzen
- [ ] Sayfada sağa sola kayma (yatay taşma / horizontal scroll) yok. (`100vw` dışına taşan eleman yok).
- [ ] Alt yapışkan menü (`MobileStickyCTA`) içeriği örtmüyor, footer rahatça görülebiliyor.
- [ ] Tarayıcının adres çubuğu açılıp kapandığında arayüzde bozulma olmuyor (`100dvh` düzgün çalışıyor).
- [ ] iPhone cihazlardaki çentik/home indicator bölümleri için (safe-area) boşluklar yeterli.

## 2. Etkileşim ve Dokunma
- [ ] Header/Navigasyon menüsündeki tüm linklere rahatça basılabiliyor (min 44x44px kuralı).
- [ ] "Ara" ve "WhatsApp" butonlarına basıldığında hızlıca ilgili uygulamaya yönlendiriyor.
- [ ] Açılır menüler varsa (hover gerektiren) dokunarak da rahatça açılabiliyor.

## 3. Formlar ve Klavyeler
- [ ] Arama kutusuna veya formlara tıklanıldığında iOS cihazlarda istenmeyen "otomatik zoom" **olmuyor** (16px kuralı).
- [ ] Telefon numarası girmesi gereken alanlarda **rakam klavyesi** açılıyor.

## 4. Sanal Usta (AI) Deneyimi
- [ ] Chat alanına (input) dokunulup klavye açıldığında input **klavyenin altında** gizlenmiyor.
- [ ] Usta cevap yazarken sayfa otomatik olarak yukarı doğru kaydırılıyor (scrolling), manuel müdahale gerekmiyor.
- [ ] Yan yana dizilmiş hızlı cevap butonları (çipleri) parmakla rahatça kaydırılabiliyor.

## 5. Hız ve Bileşenler
- [ ] Harita bölümüne gelindiğinde, parmağı aşağı kaydırırken harita ekranı kilitleyip "Haritayı taşımak için iki parmağınızı kullanın" gibi bir sorun yaratmıyor (`MapFacade` çalışıyor).
- [ ] Lighthouse Mobile skoru ortalamanın altına (%90 altı SEO/Erişilebilirlik) düşmemiş durumda.
