# FinOps & Maliyet Modeli

Bulut (Cloud) ve AI maliyetlerinin kontrolsüz büyümesini engellemek için kurduğumuz finansal operasyon metrikleri ve bütçe sınırları.

## 1. Maliyet Kalemleri (Cost Matrix)
Platform aylık olarak aşağıdaki sabit ve değişken maliyet kalemlerine ayrılır:
- **Compute (Railway):** vCPU ve RAM tabanlı faturalandırma (Next.js & Worker).
- **Veritabanı (Postgres):** Depolama (GB) ve I/O trafiği.
- **Cache & Kuyruk (Upstash):** İşlem başına (Per Command) ücretlendirme. İstek sayısı minimize edilmelidir.
- **AI (OpenAI):** Girdi (Input) ve Çıktı (Output) token maliyetleri.

## 2. AI Token & Cost Dashboard
Her bir LLM isteği (Örn: RAG Chat) bir maliyet oluşturur. 
- **Girdi (Input):** Bağlam (Context) ne kadar büyükse maliyet o kadar artar. Vector Search ile sadece ilgili chunk'lar alınarak bu maliyet %80 azaltılır.
- **Çıktı (Output):** AI'ın ürettiği kelime sayısı. Limitlenmelidir (Örn: `max_tokens: 500`).
- **Cache Hit Savings:** Daha önce sorulmuş bir soru (Örn: "Adresiniz nedir?") Redis'ten (Semantic Cache) dönerse, maliyet **Sıfır ($0)** olur.

## 3. Kapasite Ölçekleme Planı (Capacity Planning)
- **100 Kullanıcı:** Tek bir Railway container'ı (1GB RAM) yeterlidir.
- **10,000 Kullanıcı:** Container sayısı otomatik 3'e (Auto-scaling) çıkar. Redis Cache TTL (Time-to-live) süreleri artırılarak DB yükü düşürülür.
- **1 Milyon Kullanıcı:** Veritabanına Read Replica (Okuma kopyası) eklenir, AI istekleri için Load Balancer ve birden fazla LLM sağlayıcısı (Router) devreye alınır.
