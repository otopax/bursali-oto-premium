import os from 'os';

const isProduction = process.env.NODE_ENV === 'production';
const hostname = os.hostname();

import { getRequestContext } from './context.js';

export const logger = {
  info: (message, meta = {}) => log('INFO', message, meta),
  warn: (message, meta = {}) => log('WARN', message, meta),
  error: (message, meta = {}) => log('ERROR', message, meta),
  debug: (message, meta = {}) => log('DEBUG', message, meta),
};

function log(level, message, meta = {}) {
  const reqContext = getRequestContext();
  
  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    host: hostname,
    pid: process.pid,
    env: process.env.NODE_ENV || 'development',
    
    // Zorunlu observability alanları
    traceId: reqContext.traceId || meta.traceId || 'N/A',
    spanId: reqContext.spanId || meta.spanId || 'N/A',
    requestId: reqContext.requestId || meta.requestId || 'N/A',
    userId: reqContext.userId || meta.userId || 'anonymous',
    sessionId: reqContext.sessionId || meta.sessionId || 'N/A',
    method: reqContext.method || meta.method || 'N/A',
    url: reqContext.url || meta.url || 'N/A',
    status: reqContext.status || meta.status || 'N/A',
    latency: reqContext.latency || meta.latency || 0,
    
    ...meta
  };

  // Vercel / Cloud environments handle stdout gracefully
  if (isProduction || level === 'ERROR') {
    if (level === 'ERROR') {
      console.error(JSON.stringify(logEntry));
    } else {
      console.log(JSON.stringify(logEntry));
    }
  } else {
    // Development fallback (human readable)
    const color = level === 'ERROR' ? '\x1b[31m' : level === 'WARN' ? '\x1b[33m' : '\x1b[36m';
    console.log(`${color}[${level}] \x1b[0m${message} | Trace: ${logEntry.traceId}`, Object.keys(meta).length ? meta : '');
  }
}
