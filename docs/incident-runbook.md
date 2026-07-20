# Incident Runbook (Operasyonel Müdahale Rehberi)

## 1. Redis Erişilemiyor (Redis Unavailable)
**Semptomlar:** 
- `logger` üzerinde `Redis connection timeout` hataları görülmesi.
- Müşteri portalında "Fail-Open" loglarının artması.
- Admin, Finans ve ERP kısımlarında "Sistem Şu Anda Kullanılamıyor" hataları (Fail-Closed).

**Müdahale Adımları:**
1. Vercel / Upstash paneline girip Redis instance'ının durumunu kontrol edin.
2. Bağlantı limiti (connection limit) dolmuşsa, Edge Middleware üzerindeki gereksiz preflight check'leri azaltın veya Redis planını ölçeklendirin.
3. Sorun Upstash kaynaklıysa, `.env` içerisindeki `NEXTAUTH_SECRET` mekanizmasıyla geçici olarak salt DB tabanlı auth'a dönüş yapmak için `ENABLE_REDIS_AUTH=false` flag'ini set edip projeyi yeniden deploy edin.

## 2. Veritabanı (Prisma) Timeout 
**Semptomlar:**
- `P2024: Timed out fetching a new connection from the connection pool`.
- Health API degraded status.

**Müdahale Adımları:**
1. Vercel dashboard'dan Supabase / PostgreSQL metriklerine (CPU, RAM) bakın.
2. Açık bağlantı sayısı (Active Connections) sınırda ise, `DATABASE_URL` içindeki `connection_limit` parametresini kontrol edin.
3. Uzun süren raporlama sorguları varsa, okuma (read-replica) veritabanına yönlendirin.

## 3. Gemini / OpenAI API Timeout (AI Çökmesi)
**Semptomlar:**
- Kullanıcıların araç arıza sorgulama modülünde uzun süre beklemesi.
- `logger.warn('Circuit Breaker OPEN for Gemini')` logları.

**Müdahale Adımları:**
1. Servis geçici olarak düştüyse, Fallback senaryosuna geçilmesini bekleyin (Örn: Claude'a veya offline DB analizine yönlendirme).
2. Rate limit aşıldıysa, faturalandırma ve kota durumunu kontrol edin.

## 4. Disaster Recovery (DR) Kriterleri
- **RTO (Recovery Time Objective):** Maksimum 30 dakika (Sistemin ayağa kaldırılma süresi).
- **RPO (Recovery Point Objective):** Maksimum 15 dakika (Tolere edilebilecek veri kaybı aralığı - Point-in-time recovery kullanılarak DB geri dönülür).
