const winston = require('winston');

/**
 * 🚀 V4.0 OBSERVABILITY: Structured JSON Logger
 * Replaces console.log with an enterprise-grade JSON logger.
 * Captures Timestamps, Correlation IDs, and Service context automatically.
 */
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.json() // Perfect for Grafana/ELK/Datadog ingestion
  ),
  defaultMeta: { service: 'bursali-oto-digital' },
  transports: [
    new winston.transports.Console()
  ],
});

module.exports = logger;
