# Engineering (Mühendislik ve Geliştirici Deneyimi Sütunu)

Kodun yazılma, test edilme ve depoya gönderilme standartlarını belirler. DX (Developer Experience) süreçlerinin merkezidir.

## Temel Başlıklar (Faz 2 ve 3'te Eklenecektir)
- **Developer Onboarding:** Yeni bir yazılımcının `git clone` aşamasından ilk PR'ına kadar geçeceği yol.
- **Internal Developer Portal:** Backend, Frontend ve API yapılarına ulaşmak için "Golden Path" tanımları.
- **Git Strategy & CI/CD:** Branch yapısı (Trunk-based), Conventional Commits, Lint/Test bariyerleri.
- **Feature Flags:** Henüz hazır olmayan kodun ana dalda (main) gizli şekilde yaşayabilmesi (Dark Launch).

## Yazılım Prensipleri (Coding Principles)
1. **SOLID:** Sınıfların ve servislerin tek sorumluluk prensibine (Single Responsibility) göre bölünmesi.
2. **DRY & KISS:** Don't Repeat Yourself (Kendini tekrar etme) ve Keep It Simple, Stupid (Sade tut).
3. **Domain-Driven Design (DDD):** Kod dizinlerinin teknolojiye (controllers, views) göre değil; iş mantığına göre (Appointments, Invoices, Customers) ayrılması.
4. **Strict Types:** TypeScript her zaman "strict" modda çalışır, `ignoreBuildErrors: true` kullanmak kesinlikle yasaktır.
