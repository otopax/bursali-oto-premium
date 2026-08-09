const fs = require('fs');
const path = require('path');
const winston = require('winston');

// Ensure log directory exists
const LOG_DIR = path.join(process.cwd(), 'logs');
if (!fs.existsSync(LOG_DIR)) {
  fs.mkdirSync(LOG_DIR, { recursive: true });
}

// Configure Winston logger for audit trails
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bursali-oto-etl-audit' },
  transports: [
    new winston.transports.File({ 
      filename: path.join(LOG_DIR, 'etl-audit-error.log'), 
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5
    }),
    new winston.transports.File({ 
      filename: path.join(LOG_DIR, 'etl-audit.log'),
      maxsize: 10485760, // 10MB
      maxFiles: 5
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.printf(({ timestamp, level, message, type, ...meta }) => {
        const metaStr = Object.keys(meta).length ? JSON.stringify(meta) : '';
        return `[${timestamp}] [${level}] [${type || 'AUDIT'}] ${message} ${metaStr}`;
      })
    )
  }));
}

/**
 * Log ETL auditing events (filtering, normalization, transformations)
 * @param {string} type - Event category (e.g. 'FILTER_TEMPLATE', 'NORMALIZE_BRAND', 'INGEST_DTC')
 * @param {string} message - Human readable log description
 * @param {Object} [meta={}] - Contextual metadata (filename, originalValue, newValue, status)
 */
function logEvent(type, message, meta = {}) {
  const payload = {
    type,
    timestamp: new Date().toISOString(),
    ...meta
  };
  
  if (type.includes('ERROR') || type.includes('FAIL')) {
    logger.error(message, payload);
  } else if (type.includes('WARN') || type.includes('SKIP')) {
    logger.warn(message, payload);
  } else {
    logger.info(message, payload);
  }

  return payload;
}

module.exports = {
  logEvent,
  logger
};
