# AI (Yapay Zeka Yönetişimi Sütunu)

Sistemin kalbindeki LLM (Büyük Dil Modeli) ajanlarının nasıl yönetileceği, Prompt'ların nasıl versiyonlanacağı ve çıktı kalitesinin nasıl denetleneceği prensiplerini içerir.

## Temel Başlıklar (Faz 2 ve 3'te Eklenecektir)
- **Prompt Registry:** Sistemdeki tüm prompt'ların, versiyonlarının ve etki analizlerinin listesi.
- **Embedding Registry:** RAG için PDF ve veri metinlerinin chunking (bölme) ve gömme (embedding) yaşam döngüsü.
- **Evaluation & Metrics:** Hallucination Rate, Faithfulness, Precision@K ve nDCG (Arama Kesinliği) ölçüm boru hatları (Pipelines).
- **AI Risk Register:** Prompt Injection, Memory Poisoning, Tool Abuse tehlikeleri ve engelleme yolları.
- **AI Cost Model:** Token başına girdi, çıktı ve Cache-Hit tasarruf grafiklerini hesaplama mantığı.

## AI Geliştirme Prensipleri
1. **Never Trust User Input (Prompt Guard):** Kullanıcıdan gelen her girdi potansiyel bir Prompt Injection saldırısı kabul edilir; araya LLM Router veya Moderation konur.
2. **Context Window Optimization:** Sistem belleği (Conversation Context) sınırsız büyüyemez, Sliding Window veya Vector Retrieval ile yönetilir.
3. **Deterministic Fallbacks:** AI halüsinasyon gördüğünde veya limitlere takıldığında, standart sistem (Deterministic) "Şu an cevap veremiyorum, lütfen arayın" yanıtına geçer.
