# AI Evaluation Pipeline (Yapay Zeka Değerlendirme Hattı)

AI ajanımızın (Sanal Usta / RAG) üretim ortamında (Production) yanlış bilgi (Halüsinasyon) vermesini engellemek için kurulan otomatik test mekanizmasıdır.

## 1. Test Veri Seti (Golden Dataset)
Test için hazırlanmış, 100 soruluk "kesin doğru" (Ground Truth) cevapların olduğu bir JSON seti. Örn: "Audi A3 periyodik bakımında hangi yağ kullanılır?" -> "Castrol 5W-30".

## 2. Değerlendirme Metrikleri (Evaluation Metrics)
Bir test koşulduğunda aşağıdaki değerler ölçülür:
- **Groundedness (Dayanaklılık):** Modelin verdiği cevabın, tamamen Vector DB'den (pgvector) gelen belgelere mi yoksa uydurmaya mı dayandığı. (Beklenen: > 0.95)
- **Faithfulness (Sadakat):** Çıktının, firmanın kurallarına (Fiyat vermeme vb.) sadık kalma oranı.
- **Precision@5:** RAG algoritmasının, kullanıcının sorusuyla alakalı bulduğu ilk 5 dokümanın (chunk) gerçekten doğru konuyla ilgili olma yüzdesi.
- **Hallucination Rate (Halüsinasyon Oranı):** Olmayan bir servisi veya yanlış bir arıza kodunu uydurma sıklığı. (Beklenen: %0.01 altı)

## 3. Judge LLM (Hakem Model)
Her deploy (CI/CD) öncesinde `GPT-4o-mini` modeli "Hakem" olarak atanır. RAG sistemimizin ürettiği 100 cevabı, Golden Dataset ile kıyaslar ve yukarıdaki metrikler doğrultusunda 1 ile 5 arası puanlar. Eğer puan ortalaması (Threshold) 4.5'un altındaysa kod canlıya alınmaz (Deploy Block).
