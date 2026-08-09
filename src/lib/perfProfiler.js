/**
 * Performance Profiler and Metrics Tracker for ISR, Memory, and Load Execution
 */
class PerformanceProfiler {
  constructor() {
    this.metrics = new Map();
  }

  /**
   * Track process memory usage (RSS, Heap Total, Heap Used)
   * @returns {Object} Memory usage formatted in MB
   */
  getMemoryUsage() {
    const mem = process.memoryUsage();
    return {
      rssMB: (mem.rss / 1024 / 1024).toFixed(2),
      heapTotalMB: (mem.heapTotal / 1024 / 1024).toFixed(2),
      heapUsedMB: (mem.heapUsed / 1024 / 1024).toFixed(2),
      externalMB: (mem.external / 1024 / 1024).toFixed(2)
    };
  }

  /**
   * Log execution metrics for ISR Revalidation, Render, or Data Ingestion
   * @param {string} label - Metric identifier (e.g. 'ISR_REVALIDATE_P2433')
   * @param {number} durationMs - Execution time in milliseconds
   * @param {Object} [meta={}] - Context details
   */
  logMetric(label, durationMs, meta = {}) {
    const memory = this.getMemoryUsage();
    const entry = {
      label,
      durationMs: Number(durationMs.toFixed(2)),
      memory,
      timestamp: new Date().toISOString(),
      ...meta
    };

    this.metrics.set(`${label}:${Date.now()}`, entry);

    if (process.env.NODE_ENV !== 'production' || durationMs > 1000) {
      console.log(`⏱️ [PERF_PROFILE] ${label} - ${entry.durationMs}ms | Heap: ${memory.heapUsedMB}MB / ${memory.heapTotalMB}MB`);
    }

    // Alert if memory usage exceeds threshold (e.g. 1500MB)
    if (parseFloat(memory.heapUsedMB) > 1500) {
      console.warn(`⚠️ [HIGH_MEMORY_WARNING] Heap used: ${memory.heapUsedMB}MB approaching Railway heap limit!`);
    }

    return entry;
  }

  /**
   * Measure execution time of an async function
   * @param {string} label 
   * @param {Function} fn 
   * @returns {Promise<any>} Function return value
   */
  async measureAsync(label, fn) {
    const start = performance.now();
    try {
      return await fn();
    } finally {
      const duration = performance.now() - start;
      this.logMetric(label, duration);
    }
  }
}

export const perfProfiler = new PerformanceProfiler();
