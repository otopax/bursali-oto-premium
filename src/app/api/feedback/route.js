import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

// GBP Linki - BURSALI OTO Fethiye için gerçek Place ID linkinizle değiştirin
const GBP_REVIEW_URL = 'https://search.google.com/local/writereview?placeid=ChIJN1t_tDeuEmsRUsoyG83frY4'; 

export async function POST(req) {
  try {
    const body = await req.json();
    const { workOrderId, tenantId, rating, comment } = body;

    if (!rating || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Geçersiz değerlendirme puanı.' }, { status: 400 });
    }

    // Yüksek Puan (4 ve 5 yıldız) - Doğrudan GBP'ye yönlendir
    if (rating >= 4) {
      // Yine de arka planda istatistik için kaydedebiliriz
      await prisma.feedback.create({
        data: {
          workOrderId: workOrderId || null,
          tenantId: tenantId || null,
          rating,
          comment: comment || 'Redirected to GBP',
          status: 'RESOLVED' // Başarılı sayılır
        }
      });
      return NextResponse.json({ success: true, redirectUrl: GBP_REVIEW_URL });
    }

    // Düşük Puan (1, 2, 3 yıldız) - İç sisteme kaydet, GBP'ye gönderme
    await prisma.feedback.create({
      data: {
        workOrderId: workOrderId || null,
        tenantId: tenantId || null,
        rating,
        comment: comment || '',
        status: 'PENDING' // Müşteri temsilcisi arayacak
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Değerlendirmeniz için teşekkürler. Kalite standartlarımızı artırmak için şikayetinizi yetkili ustabaşımıza ilettik. En kısa sürede sizinle iletişime geçilecektir.',
      redirectUrl: null
    });

  } catch (error) {
    console.error('Feedback POST Error:', error);
    return NextResponse.json({ success: false, error: 'Internal Server Error' }, { status: 500 });
  }
}
