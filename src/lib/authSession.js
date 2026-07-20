import { prisma } from './prisma';
import { redis } from './cache';

/**
 * Kullanıcının token versiyonunu artırarak tüm aktif oturumlarını geçersiz kılar (Logout all devices).
 * @param {string} userId - İşlem yapılacak kullanıcının ID'si
 * @returns {Promise<boolean>}
 */
export async function revokeAllSessions(userId) {
  try {
    // 1. Veritabanındaki versiyonu artır
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        tokenVersion: { increment: 1 }
      }
    });

    // 2. Redis Cache'teki versiyonu da hemen güncelle (5 dk TTL)
    const redisKey = `auth:tokenVer:${userId}`;
    await redis.setex(redisKey, 300, updatedUser.tokenVersion);

    return true;
  } catch (error) {
    console.error(`[SessionRevocation] Failed for user ${userId}:`, error.message);
    return false;
  }
}
