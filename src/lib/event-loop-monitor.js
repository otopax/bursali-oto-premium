const { monitorEventLoopDelay } = require('perf_hooks');

function startEventLoopMonitor() {
  const monitor = monitorEventLoopDelay({ resolution: 20 });
  monitor.enable();

  let lastWarnTime = Date.now();

  setInterval(() => {
    const lag = monitor.mean;
    if (lag > 100000000) { // 100ms
      const lagMs = lag / 1000000;
      console.warn(`\n[EVENT LOOP LAG DETECTED] Mean Lag: ${lagMs.toFixed(2)}ms`);
      
      if (lagMs > 500) {
        console.error(`🚨 SEVERE EVENT LOOP BLOCKAGE 🚨 Mean Lag: ${lagMs.toFixed(2)}ms`);
      }
    }
    monitor.reset();
  }, 1000).unref();
}

module.exports = { startEventLoopMonitor };
