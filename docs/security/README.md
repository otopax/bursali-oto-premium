# Security (Güvenlik Sütunu)

Platformun siber tehditlere karşı savunma hatlarını, risk kayıtlarını (Risk Register) ve kurumsal uyumluluğunu (Compliance) yönetir.

## Temel Başlıklar (Faz 2 ve 3'te Eklenecektir)
- **Threat Model & OWASP ASVS:** Data Flow Diagramları ve Trust Boundaries analizi.
- **Risk Register:** Mevcut tüm zafiyet riskleri ve Mitigation (Önlem) matrisleri.
- **Security Playbooks:** Olası bir Veri Sızıntısı (Data Leak) anında izlenecek acil durum senaryoları.
- **Compliance Matrix:** KVKK, GDPR, ISO 27001 gereksinimlerinin sisteme nasıl eşlendiği.

## Güvenlik Prensipleri
1. **Least Privilege (En Az Yetki):** Her servis ve kullanıcı sadece ihtiyacı olan veriye erişir (Örn: BullMQ worker'ı kullanıcı şifrelerini okuyamaz).
2. **Defense in Depth (Derinlemesine Savunma):** Sadece Edge Firewall (Cloudflare WAF) değil, API içinde Rate Limiting ve DB düzeyinde Row Level Security kullanılır.
3. **Secret Management:** Hardcoded şifre kesinlikle yasaktır, tüm anahtarlar ENV/Vault ile yönetilir.
