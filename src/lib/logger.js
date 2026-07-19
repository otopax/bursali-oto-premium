import winston from 'winston';

/**
 * 🚀 V4.0 OBSERVABILITY: Structured JSON Logger (Phase 4)
 * Categorized logs for production monitoring
 */
const createCategorizedLogger = (category) => {
  return winston.createLogger({
    level: process.env.LOG_LEVEL || 'info',
    format: winston.format.combine(
      winston.format.timestamp(),
      winston.format.errors({ stack: true }),
      winston.format.json()
    ),
    defaultMeta: { service: 'bursali-oto-digital', category },
    transports: [
      new winston.transports.Console()
    ],
  });
};

export const logger = {
  // 1. Application Logs (Sistem hataları, genel metrikler)
  app: createCategorizedLogger('APPLICATION'),
  
  // 2. Audit Logs (Kullanıcının yaptığı önemli eylemler)
  audit: createCategorizedLogger('AUDIT'),
  
  // 3. Security Logs (Giriş denemeleri, şüpheli hareketler)
  security: createCategorizedLogger('SECURITY'),
  
  // 4. AI Logs (Tool çağrıları, süreleri, API Timeout durumları)
  ai: createCategorizedLogger('AI_DIAGNOSTICS'),
  
  // 5. Business Logs (Kritik iş metrikleri - Randevu, teklif)
  business: createCategorizedLogger('BUSINESS'),
};
