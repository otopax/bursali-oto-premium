import crypto from 'crypto';
import { prisma } from '../prisma.js';

/**
 * Idempotency Kontrol Servisi
 * Tekrarlayan POST / mutations isteklerinde duplicate veri engeller.
 * @param {Request} request 
 * @param {String} userId 
 */
export async function withIdempotency(request, userId = null) {
  const idempotencyKey = request.headers.get('idempotency-key');
  
  if (!idempotencyKey) {
    return { isIdempotent: false, error: null }; // Zorunlu tutulmuyorsa geç (Veya duruma göre hata dönebilir)
  }

  // İstek içeriğinin özetini çıkarıyoruz
  const clonedRequest = request.clone();
  let requestHash = 'empty';
  try {
    const body = await clonedRequest.text();
    requestHash = crypto.createHash('sha256').update(body).digest('hex');
  } catch (e) {
    // Body yoksa empty kalır
  }

  // Idempotency kaydını bul
  const existingRecord = await prisma.idempotencyRecord.findUnique({
    where: { key: idempotencyKey }
  });

  if (existingRecord) {
    // Eğer hash uymuyorsa, farklı bir istekle aynı key kullanılmış demektir!
    if (existingRecord.requestHash !== requestHash) {
      return { 
        isIdempotent: true, 
        error: 'Conflict: Idempotency-Key is already used with a different payload.',
        status: 409
      };
    }

    // Eğer önceki istek zaten başarılı sonuçlandıysa, önceki sonucu dön
    if (existingRecord.status === 'COMPLETED') {
      return {
        isIdempotent: true,
        record: existingRecord,
        cachedResponse: existingRecord.response,
        status: 200
      };
    }

    // İstek hala işleniyorsa
    if (existingRecord.status === 'STARTED') {
      return {
        isIdempotent: true,
        error: 'Conflict: Request is currently being processed.',
        status: 409
      };
    }
  }

  // İlk defa geliyorsa kaydet ve STARTED olarak işaretle
  // 24 saat sonra süresi dolacak şekilde ayarla
  const expiresAt = new Date();
  expiresAt.setHours(expiresAt.getHours() + 24);

  const newRecord = await prisma.idempotencyRecord.create({
    data: {
      key: idempotencyKey,
      requestHash,
      userId,
      status: 'STARTED',
      expiresAt
    }
  });

  return { isIdempotent: false, error: null, record: newRecord };
}

/**
 * İşlem bittikten sonra sonucu kaydetmek için kullanılır.
 * @param {String} key 
 * @param {Object} responsePayload 
 */
export async function completeIdempotency(key, responsePayload) {
  if (!key) return;
  await prisma.idempotencyRecord.update({
    where: { key },
    data: {
      status: 'COMPLETED',
      response: responsePayload
    }
  });
}
