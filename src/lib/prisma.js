import { PrismaClient } from '@prisma/client';
import '@/env'; // Validate environment variables when Prisma initializes
import { Logger } from '@/lib/observability/Logger';

/**
 * Prisma Query Interceptor for Audit Logging
 * Saves differences (diff) on UPDATE and old states on DELETE.
 *
 * KRITIK DUZELTME (connection leak fix):
 * Onceki surum her UPDATE/DELETE isleminde `new PrismaClient()` olusturuyor
 * ve asla kapatmiyordu. Her kacak istemci kendi baglanti havuzunu actigi icin
 * Postgres baglanti limiti doluyor ve uretimde "critical" 503 hatasi olusuyordu.
 * Artik eklenti, disaridan verilen TEK paylasilan istemciyi kullaniyor.
 */

const SENSITIVE_FIELDS = ['passwordHash', 'mfaSecret', 'creditCard', 'token', 'jwt', 'authorization', 'cookie', 'apikey', 'iban', 'tc', 'vin'];
const PARTIAL_MASK_FIELDS = ['email', 'phone'];

const maskValue = (key, value) => {
  if (value === null || value === undefined) return value;
  const k = key.toLowerCase();
  if (SENSITIVE_FIELDS.some(f => k.includes(f))) return '***MASKED***';
  if (PARTIAL_MASK_FIELDS.some(f => k.includes(f))) {
    const str = String(value);
    if (str.length > 4) return str.substring(0, 2) + '***' + str.substring(str.length - 2);
    return '***';
  }
  return value;
};

// Prisma model adi PascalCase gelir (orn. 'User'); istemci ozelligi camelCase'tir ('user').
const toClientProp = (model) => model.charAt(0).toLowerCase() + model.slice(1);

function createAuditLogExtension(baseClient) {
  return {
    query: {
      $allModels: {
        async update({ model, operation, args, query }) {
          if (model === 'AuditLog') return query(args);

          let oldData = null;
          try {
            const delegate = baseClient[toClientProp(model)];
            if (delegate) {
              oldData = await delegate.findUnique({ where: args.where });
            }
          } catch (e) {
            // Ignore error if we can't find it (e.g. compound keys not properly mapped)
          }

          const result = await query(args);

          if (oldData && result && result.id) {
            const oldValues = {};
            const newValues = {};
            let hasChanges = false;

            if (args.data) {
              for (const key of Object.keys(args.data)) {
                // Sadece db'de degisenleri logla
                if (oldData[key] !== undefined && result[key] !== undefined && oldData[key] !== result[key]) {
                  oldValues[key] = maskValue(key, oldData[key]);
                  newValues[key] = maskValue(key, result[key]);
                  hasChanges = true;
                }
              }
            }

            if (hasChanges) {
              baseClient.auditLog.create({
                data: {
                  action: 'UPDATE',
                  entityType: model,
                  entityId: String(result.id),
                  oldValues,
                  newValues,
                }
              }).catch(err => console.error('[AuditLog Error]', err.message));
            }
          }

          return result;
        },

        async delete({ model, operation, args, query }) {
          if (model === 'AuditLog') return query(args);

          let oldData = null;
          try {
            const delegate = baseClient[toClientProp(model)];
            if (delegate) {
              oldData = await delegate.findUnique({ where: args.where });
            }
          } catch (e) {}

          const result = await query(args);

          if (oldData && result && result.id) {
            const maskedOldData = {};
            for (const key of Object.keys(oldData)) {
              maskedOldData[key] = maskValue(key, oldData[key]);
            }

            baseClient.auditLog.create({
              data: {
                action: 'DELETE',
                entityType: model,
                entityId: String(result.id),
                oldValues: maskedOldData,
              }
            }).catch(err => console.error('[AuditLog Error]', err.message));
          }

          return result;
        }
      }
    }
  };
}

const basePrismaSingleton = () => {
  let url = process.env.DATABASE_URL;
  if (url && !url.includes('connection_limit=')) {
    url = `${url}${url.includes('?') ? '&' : '?'}connection_limit=20&pool_timeout=15`;
  }
  const options = {};
  if (url) {
    options.datasources = { db: { url } };
  }
  return new PrismaClient(options);
};

const globalForPrisma = globalThis;

// Uretimde de global'de sakla: Vercel warm lambda'lari module scope'u yeniden
// kullanir; global saklama HMR (dev) ve yeniden import senaryolarinda
// coklu istemci olusmasini engeller.
const basePrisma = globalForPrisma.__basePrisma ?? basePrismaSingleton();
globalForPrisma.__basePrisma = basePrisma;

export const prisma = globalForPrisma.__prisma ?? basePrisma.$extends(createAuditLogExtension(basePrisma));
globalForPrisma.__prisma = prisma;

// 🚀 Graceful Shutdown (Sprint 8: Production Readiness)
// Prevents connection leaks when the container/server stops
if (process.env.NODE_ENV !== 'development') {
  const shutdown = async () => {
    Logger.info('[Prisma] Disconnecting database gracefully due to process termination signal...');
    await basePrisma.$disconnect();
    process.exit(0);
  };

  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);
}
