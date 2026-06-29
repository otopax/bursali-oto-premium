/**
 * Enterprise Observability Logger
 * Tracks request timelines, slow queries, and AI latency.
 */

class Logger {
  
  /**
   * Times a block of code and logs if it exceeds a threshold
   * @param {string} operationName 
   * @param {number} thresholdMs 
   * @param {Function} asyncOperation 
   */
  static async trackLatency(operationName, thresholdMs, asyncOperation) {
    const startTime = Date.now();
    
    try {
      const result = await asyncOperation();
      const duration = Date.now() - startTime;
      
      if (duration > thresholdMs) {
        console.warn(`[OBSERVABILITY] ⚠️ SLOW OPERATION: ${operationName} took ${duration}ms (Threshold: ${thresholdMs}ms)`);
        // Here we could send metrics to Datadog or Prometheus
      } else {
        console.log(`[OBSERVABILITY] ⚡ ${operationName} completed in ${duration}ms`);
      }
      
      return result;
    } catch (error) {
      const duration = Date.now() - startTime;
      console.error(`[OBSERVABILITY] ❌ FAILED: ${operationName} failed after ${duration}ms. Error: ${error.message}`);
      throw error;
    }
  }

  static info(correlationId, message, metadata = {}) {
    console.log(JSON.stringify({
      level: 'INFO',
      timestamp: new Date().toISOString(),
      correlationId,
      message,
      ...metadata
    }));
  }

  static error(correlationId, message, error) {
    console.error(JSON.stringify({
      level: 'ERROR',
      timestamp: new Date().toISOString(),
      correlationId,
      message,
      stack: error.stack
    }));
  }
}

module.exports = { Logger };
