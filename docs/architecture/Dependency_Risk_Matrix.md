# Dependency Risk Matrix (Bağımlılık Risk Matrisi)

Platformumuzun dış sistemlere (3rd Party) bağımlılığı ve bu servisler çöktüğünde (Downtime) alınacak aksiyonlar:

| Bağımlılık (Dependency) | Etki / Risk | Mitigasyon Planı (Mitigation) |
| :--- | :--- | :--- |
| **Railway (PaaS)** | High | Uygulamanın Vercel veya AWS'ye taşınabilecek şekilde Dockerize edilmiş olması (Multi-region plan). |
| **PostgreSQL (DB)** | High | Günlük otomatik yedekleme (Backup) ve Point-In-Time Recovery (PITR) aktif. |
| **Upstash (Redis)** | Medium | Çökerse In-Memory (LRU) fallback moduna geçilir. Hız düşer ama sistem ayakta kalır. |
| **OpenAI API** | High | LLM Gateway/Router kullanılarak kesinti anında Google Gemini veya Claude'a otomatik yönlendirme. |
| **Cloudflare (CDN)** | Medium | CDN düşerse doğrudan Railway Domain üzerinden kısıtlı hizmet devam eder. |
