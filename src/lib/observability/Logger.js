/**
 * Enterprise Observability Logger (OpenTelemetry Format)
 * 
 * Standart bir JSON log yapısı sağlar. Tüm sistem (Worker, Next.js Middleware, API'ler)
 * boyunca izlenebilirliği (traceId, spanId) kolaylaştırır.
 */

export const Logger = {
  /**
   * 
   * @param {'info' | 'warn' | 'error' | 'debug'} level 
   * @param {string} message 
   * @param {object} context - Ek bağlam (correlationId, spanId, durationMs vb.)
   */
  log(level, message, context = {}) {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      message,
      correlationId: context.correlationId || 'unknown',
      traceId: context.traceId || context.correlationId || 'unknown',
      spanId: context.spanId || null,
      requestId: context.requestId || null,
      userId: context.userId || 'guest',
      organizationId: context.organizationId || null,
      route: context.route || 'unknown',
      durationMs: context.durationMs || 0,
      ...context.extra
    };

    const logString = JSON.stringify(logEntry);

    // Development ortamında daha okunabilir, Prod'da saf JSON
    if (process.env.NODE_ENV === 'development') {
      const colors = {
        INFO: '\x1b[32m',
        WARN: '\x1b[33m',
        ERROR: '\x1b[31m',
        DEBUG: '\x1b[36m'
      };
      const reset = '\x1b[0m';
      console[level === 'error' ? 'error' : 'log'](
        `${colors[logEntry.level]}[${logEntry.level}]${reset} [${logEntry.correlationId}] ${message} ${context.durationMs ? `(+${context.durationMs}ms)` : ''}`
      );
    } else {
      // Production: Splunk, Datadog, ELK, Grafana Loki uyumlu tek satır JSON
      console[level === 'error' ? 'error' : 'log'](logString);
    }
  },

  info(message, context) {
    this.log('info', message, context);
  },
  warn(message, context) {
    this.log('warn', message, context);
  },
  error(message, context) {
    this.log('error', message, context);
  },
  debug(message, context) {
    this.log('debug', message, context);
  }
};
