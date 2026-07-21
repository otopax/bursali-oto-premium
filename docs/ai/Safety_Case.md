# AI Safety Case (Yapay Zeka Güvenlik Gerekçesi)

AI botumuzun güvenli ve yasalara uygun hareket ettiğini kanıtlayan kısıtlamalar.

## 1. İzin Verilen Kullanımlar
- Araç arıza teşhisi, periyodik bakım tavsiyesi, servis fiyat teklifi (Tahmini), randevu yönlendirmesi.

## 2. Yasaklanan Kullanımlar
- Motor yazılımı (Chip tuning, DPF iptali) hakkında yasadışı tavsiye vermek.
- Müşterinin veya başka müşterilerin kişisel verilerini (PII) ifşa etmek.
- Rakipler hakkında yorum yapmak.

## 3. Güven Eşiği (Confidence Threshold)
- Model, bir arızanın %90 üzerinde fren/direksiyon gibi hayati bir parçadan kaynaklandığını düşünüyorsa "Kesinlikle aracı sürmeyin, çekici yollayalım" fallback'ine geçmelidir.
