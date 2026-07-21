# Knowledge Management (Bilgi Yönetimi)

Otomotiv bilgi tabanının (Kütüphane ve Arıza Çözümleri) yaşam döngüsü.

**Source (Kaynak) -> Review (İnceleme) -> Approved (Onaylı) -> Embedding (Vektörel) -> Published (Yayınlandı) -> Archived (Arşivlendi)**

## Süreç
1. **İçerik Üretimi:** MDX formatında yazılır (veya AI Mining Script tarafından üretilir).
2. **Review:** Kıdemli Usta (Master Technician) bilgileri doğrular.
3. **Embedding:** `gemini-embedding-001` kullanılarak vektörel forma (pgvector) çevrilir.
4. **Publish:** Vercel/Railway'de yayınlanır ve Sanal Usta'nın (AI) okumasına açılır.
