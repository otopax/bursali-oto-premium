// Resilient Categorized Structured Logger
let winston = null;
try {
  winston = require('winston');
} catch (e) {
  // Winston is not bundled in standalone mode; fallback to structured console logging
}

const createCategorizedLogger = (category) => {
  if (winston && typeof winston.createLogger === 'function') {
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
  }

  // Native Structured JSON Logger Fallback
  const formatPayload = (level, message, ...args) => {
    return JSON.stringify({
      timestamp: new Date().toISOString(),
      service: 'bursali-oto-digital',
      category,
      level,
      message: typeof message === 'object' ? JSON.stringify(message) : String(message),
      extra: args.length > 0 ? args : undefined
    });
  };

  return {
    info: (msg, ...args) => console.log(formatPayload('info', msg, ...args)),
    error: (msg, ...args) => console.error(formatPayload('error', msg, ...args)),
    warn: (msg, ...args) => console.warn(formatPayload('warn', msg, ...args)),
    debug: (msg, ...args) => console.log(formatPayload('debug', msg, ...args)),
  };
};

export const logger = {
  app: createCategorizedLogger('APPLICATION'),
  audit: createCategorizedLogger('AUDIT'),
  security: createCategorizedLogger('SECURITY'),
  ai: createCategorizedLogger('AI_DIAGNOSTICS'),
  business: createCategorizedLogger('BUSINESS'),
};
