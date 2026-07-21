# Operations (Operasyon Sütunu)

Uygulamanın günlük rutin bakımını, kriz yönetimi adımlarını ve felaket kurtarma senaryolarını standartlaştırır. Acil bir durumda teknik ekibin başvuru noktasıdır.

## Temel Başlıklar (Faz 2 ve 3'te Eklenecektir)
- **Runbooks:** Her servisin nasıl debug edileceği, yeniden başlatılacağı ve krizin nasıl çözüleceğine dair adım adım kılavuzlar (Örn: DB Restore Runbook).
- **Incident Management:** Incident komutanının kim olduğu, PagerDuty entegrasyonu ve iletişim şablonları.
- **Postmortems:** Geçmiş arızaların Blameless (suçlamasız) analiz raporları.
- **Release & Canary:** Yeni bir kodun %10 kullanıcıya açılıp sonra %100'e çıkarılması politikası.
- **Disaster Recovery (DR) & BCP:** Tamamen çökme veya Vendor (Railway, OpenAI) risklerine karşı planlar.

## Operasyon Prensipleri
1. **Infrastructure as Code (IaC):** Hiçbir ayar Railway paneline elle tıklayarak yapılmaz; `railway.json` ve CI/CD ile koda bağımlı tutulur.
2. **Zero Downtime:** Deploy'lar (Migration dahil) canlı sistemi kesmeyecek şekilde (Blue-Green) planlanır.
3. **No Heroics:** Kimse gece yarısı kahramanlık yapıp doğrudan DB'ye SQL yazamaz; her operasyon bir Playbook üzerinden ilerler.
