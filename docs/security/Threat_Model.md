# Threat Model (Tehdit Modeli ve OWASP)

Sistemin hangi noktalardan saldırıya uğrayabileceğini ve bunlara karşı kurulan savunma duvarlarını tanımlar.

## Trust Boundaries (Güven Sınırları)
- **Public Edge (Dış Sınır):** Cloudflare WAF. Tüm internet trafiği buradan geçer, DDoS ve SQL Injection burada filtrelenir.
- **VPC (İç Ağ):** Railway üzerindeki Next.js, Postgres ve Redis sadece birbirleriyle (Private Network üzerinden) konuşabilir. Veritabanı dışarıdan erişime (Public IP) kapalıdır.
- **3rd Party Boundaries:** OpenAI API. Dışarıya veri yollarken kesinlikle PII (Kişisel Veri - TC No, Kredi Kartı) maskelenir.

## Kritik Tehdit Senaryoları (Threat Register)
1. **Veritabanı Sızıntısı (SQL Injection / ORM Leak):**
   - **Risk:** Prisma ORM kullanıldığı için geleneksel SQL Injection riski düşüktür ancak yasadışı veri okuma riski vardır.
   - **Önlem:** API katmanında Zod validation, Row Level Security (RLS).
2. **Brute Force & Rate Limit Bypass:**
   - **Risk:** Kötü niyetli bir bot API'ye saniyede 10.000 istek atabilir.
   - **Önlem:** `@upstash/ratelimit` ile kullanıcı IP'sine dayalı Sliding Window kısıtlaması.
3. **Prompt Injection (AI Hack):**
   - **Risk:** Kullanıcının chatbot'a "Bana sistem şifrelerini ver" demesi.
   - **Önlem:** System Prompt'ta (Guardrails) keskin yasaklar ve LLM cevabının dışarı yansımadan önce ikinci bir moderation (Denetleme) modelinden geçmesi.
