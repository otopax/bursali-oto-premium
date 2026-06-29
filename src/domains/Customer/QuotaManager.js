const IORedis = require('ioredis');
const { PrismaClient } = require('@prisma/client');
const { Outbox } = require('../../lib/events/Outbox');

const prisma = new PrismaClient();
const redisClient = new IORedis(process.env.REDIS_URL || 'redis://localhost:6379');
redisClient.on('error', (err) => console.error('Redis Client Error', err));

// 🚀 V4.0 PLATFORM RELIABILITY: REDIS LUA SCRIPT
// Ensures Check-And-Set is 100% atomic, preventing any race conditions even if 10.000 requests hit simultaneously.
redisClient.defineCommand('atomicConsume', {
  numberOfKeys: 1,
  lua: `
    local current = redis.call('get', KEYS[1])
    local limit = tonumber(ARGV[1])
    if current and tonumber(current) >= limit then
      return -1 -- Rate limit exceeded
    end
    local usage = redis.call('incr', KEYS[1])
    if usage == 1 then
      redis.call('expire', KEYS[1], tonumber(ARGV[2]))
    end
    return usage
  `
});

class QuotaManager {
  static async checkGuestQuota(ipAddress) {
    const redisKey = `quota:guest:${ipAddress}`;
    const usageStr = await redisClient.get(redisKey);
    const usage = usageStr ? parseInt(usageStr) : 0;
    const FREE_LIMIT = 3;

    if (usage >= FREE_LIMIT) {
      return { allowed: false, remaining: 0, reason: "Limit Aşımı: Lütfen sisteme üye olun." };
    }
    return { allowed: true, remaining: FREE_LIMIT - usage };
  }

  static async consumeGuestQuota(ipAddress) {
    const redisKey = `quota:guest:${ipAddress}`;
    const limit = 3;
    const ttl = 30 * 24 * 60 * 60; // 30 days
    
    // 1. Atomic Check & Increment (Zero Race Condition)
    const usage = await redisClient.atomicConsume(redisKey, limit, ttl);
    if (usage === -1) {
      throw new Error("Limit Aşımı: Lütfen sisteme üye olun.");
    }

    try {
      // 2. Transactional Outbox: Persist DB & Event together safely
      await prisma.$transaction(async (tx) => {
        await tx.usageLog.create({
          data: { ipAddress, action: 'AI_QUERY', credits: 1 }
        });
        
        await Outbox.publishEvent(tx, 'User_Query_Started', { 
          identifier: ipAddress, 
          type: 'GUEST',
          credits: 1 
        });
      });
      return usage;
    } catch (dbError) {
      // 3. Compensation
      console.error(`[QuotaManager] ❌ DB Transaction failed! Rolling back Redis quota for IP: ${ipAddress}`);
      await redisClient.decr(redisKey);
      throw new Error("Transaction failed. Credit refunded.");
    }
  }

  static async checkUserQuota(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });
    if (!user) return { allowed: false, reason: "Kullanıcı bulunamadı." };

    const planLimit = user.subscription ? user.subscription.monthlyQuota : 10;
    const redisKey = `quota:user:${userId}`;
    const usageStr = await redisClient.get(redisKey);
    const usage = usageStr ? parseInt(usageStr) : 0;

    if (usage >= planLimit) return { allowed: false, remaining: 0, reason: "Aylık limitiniz doldu." };
    return { allowed: true, remaining: planLimit - usage };
  }

  static async consumeUserQuota(userId) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { subscription: true }
    });
    if (!user) throw new Error("Kullanıcı bulunamadı.");

    const planLimit = user.subscription ? user.subscription.monthlyQuota : 10;
    const redisKey = `quota:user:${userId}`;
    const ttl = 30 * 24 * 60 * 60;
    
    const usage = await redisClient.atomicConsume(redisKey, planLimit, ttl);
    if (usage === -1) {
      throw new Error("Aylık limitiniz doldu.");
    }

    try {
      await prisma.$transaction(async (tx) => {
        await tx.usageLog.create({
          data: { userId, action: 'AI_QUERY', credits: 1 }
        });
        await Outbox.publishEvent(tx, 'User_Query_Started', { 
          identifier: userId, 
          type: 'USER',
          credits: 1 
        });
      });
      return usage;
    } catch (dbError) {
      console.error(`[QuotaManager] ❌ DB Transaction Failed! Rolling back Redis quota for User: ${userId}`);
      await redisClient.decr(redisKey);
      throw new Error("Quota consumption failed. Credit refunded.");
    }
  }
}

module.exports = { QuotaManager };
