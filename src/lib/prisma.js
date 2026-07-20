import { PrismaClient } from '@prisma/client';

/**
 * Prisma Query Interceptor for Audit Logging
 * Saves differences (diff) on UPDATE and old states on DELETE.
 */
function createAuditLogExtension() {
  return {
    query: {
      $allModels: {
        async update({ model, operation, args, query }) {
          if (model === 'AuditLog') return query(args);

          const prismaBase = new PrismaClient();
          let oldData = null;
          
          try {
            // Find existing record before update
            oldData = await prismaBase[model].findUnique({ where: args.where });
          } catch (e) {
            // Ignore error if we can't find it (e.g. compound keys not properly mapped)
          }

          const result = await query(args);

          if (oldData && result && result.id) {
            const oldValues = {};
            const newValues = {};
            let hasChanges = false;

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

            if (args.data) {
              for (const key of Object.keys(args.data)) {
                // Sadece db'de değişenleri logla
                if (oldData[key] !== undefined && result[key] !== undefined && oldData[key] !== result[key]) {
                  oldValues[key] = maskValue(key, oldData[key]);
                  newValues[key] = maskValue(key, result[key]);
                  hasChanges = true;
                }
              }
            }

            if (hasChanges) {
              // AsyncLocalStorage entegrasyonu (ileriki fazda correlationId ve userId için eklenebilir)
              prismaBase.auditLog.create({
                data: {
                  action: 'UPDATE',
                  entityType: model,
                  entityId: String(result.id),
                  oldValues,
                  newValues,
                  // userId: process.env.ALS_USER_ID, // Example for AsyncLocalStorage
                }
              }).catch(err => console.error('[AuditLog Error]', err.message));
            }
          }
          
          return result;
        },

        async delete({ model, operation, args, query }) {
          if (model === 'AuditLog') return query(args);

          const prismaBase = new PrismaClient();
          let oldData = null;
          try {
            oldData = await prismaBase[model].findUnique({ where: args.where });
          } catch (e) {}

          const result = await query(args);

          if (oldData && result.id) {
            const maskedOldData = {};
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
            
            for (const key of Object.keys(oldData)) {
              maskedOldData[key] = maskValue(key, oldData[key]);
            }
            
            prismaBase.auditLog.create({
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

const prismaClientSingleton = () => {
  let url = process.env.DATABASE_URL;
  if (url && !url.includes('connection_limit=')) {
    url = `${url}${url.includes('?') ? '&' : '?'}connection_limit=1`;
  }
  const client = new PrismaClient({
    datasources: {
      db: { url }
    }
  });
  return client.$extends(createAuditLogExtension());
};

const globalForPrisma = globalThis;

export const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;
