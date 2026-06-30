import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

export async function POST(req) {
  try {
    const { workOrder, vehicle, customer, items } = await req.json();

    if (!workOrder || !vehicle) {
      return NextResponse.json({ error: 'Eksik veri' }, { status: 400 });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GOOGLE_GENERATIVE_AI_API_KEY });
    
    // İşlemleri metne çevir
    const doneItems = items && items.length > 0 
      ? items.map(i => i.name).join(', ') 
      : 'Genel Bakım ve Kontrol';

    const prompt = `
    Sen Bursalı Oto Servis'in (Fethiye'de premium araç servisi) sosyal medya ve SEO uzmanısın.
    Aşağıdaki tamamlanan servis işlemi için Google İşletme Profili (Google My Business) veya Instagram'da paylaşılacak çok dikkat çekici, güven veren ve SEO uyumlu bir gönderi metni hazırla.
    
    Araç: ${vehicle.year || ''} ${vehicle.brand} ${vehicle.model}
    Şikayet: ${workOrder.complaint || 'Periyodik bakım zamanı gelmişti.'}
    Yapılan İşlemler: ${doneItems}
    
    Kurallar:
    1. Metin çok uzun olmasın (max 3-4 paragraf).
    2. Müşteri adını (Gizlilik gereği) KULLANMA.
    3. Fethiye, premium servis, orijinal cihaz, garantili onarım vurguları yap.
    4. Emojiler kullan.
    5. Gönderinin sonuna alakalı hashtagler ekle (Örn: #FethiyeBMWServisi #FethiyeOtoTamir #AudiQ5 vs.)
    6. Sondaki iletişim bilgisi olarak şu formatı kullan: 📍 Yeni Sanayi Sitesi, Fethiye 📞 0554 881 20 21
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return NextResponse.json({ success: true, post: response.text });
  } catch (error) {
    console.error('Google Post API Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
