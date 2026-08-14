import { monitorEventLoopDelay } from 'perf_hooks';

export function startEventLoopMonitor() {
  const monitor = monitorEventLoopDelay({ resolution: 20 });
  monitor.enable();

  let lastWarnTime = Date.now();

  setInterval(() => {
    const lag = monitor.mean;
    // Eğer ortalama gecikme 100ms'yi aşarsa uyarı ver
    if (lag > 100000000) { // monitorEventLoopDelay nanosecond (ns) cinsindendir. 100ms = 100,000,000 ns
      const lagMs = lag / 1000000;
      console.warn(`\n[EVENT LOOP LAG DETECTED] Mean Lag: ${lagMs.toFixed(2)}ms`);
      
      // Çok şiddetli ise (500ms üstü) kırmızı bas
      if (lagMs > 500) {
        console.error(`🚨 SEVERE EVENT LOOP BLOCKAGE 🚨 Mean Lag: ${lagMs.toFixed(2)}ms`);
      }
    }
    
    // Her 5 saniyede bir normal heartbeat bas (Sistemin hayatta olduğunu görmek için)
    if (Date.now() - lastWarnTime > 5000) {
       // console.log(`[Event Loop Heartbeat] Current Mean Lag: ${(lag / 1000000).toFixed(2)}ms`);
       lastWarnTime = Date.now();
    }
    
    // Geçmiş veriyi sıfırla ki anlık dalgalanmaları görelim
    monitor.reset();
  }, 1000).unref(); // unref ile process'in kapanmasını engellememesini sağlıyoruz
}
