const { execSync } = require('child_process');

const serviceName = process.env.RAILWAY_SERVICE_NAME || '';

if (serviceName.toLowerCase().includes('worker') || process.env.IS_WORKER === 'true') {
  console.log('👷 Worker service detected via RAILWAY_SERVICE_NAME. Skipping Next.js build to save memory.');
  process.exit(0);
}

// === ÖLÇÜM: builder'ın gerçek RAM'ini ve cgroup bellek limitini yazdır (tahmin değil, kanıt) ===
try {
  const os = require('os');
  const fs = require('fs');
  console.log(`[build-mem] os.totalmem: ${(os.totalmem() / 1024 / 1024).toFixed(0)} MB, freemem: ${(os.freemem() / 1024 / 1024).toFixed(0)} MB, cpus: ${os.cpus().length}`);
  let cg = 'bilinmiyor';
  if (fs.existsSync('/sys/fs/cgroup/memory.max')) {
    cg = 'v2 memory.max=' + fs.readFileSync('/sys/fs/cgroup/memory.max', 'utf8').trim();
  } else if (fs.existsSync('/sys/fs/cgroup/memory/memory.limit_in_bytes')) {
    cg = 'v1 limit_in_bytes=' + fs.readFileSync('/sys/fs/cgroup/memory/memory.limit_in_bytes', 'utf8').trim();
  }
  console.log(`[build-mem] cgroup: ${cg}  (bu değer builder'ın gerçek bellek duvarıdır)`);
} catch (e) {
  console.log('[build-mem] ölçüm alınamadı:', e.message);
}

console.log('🚀 Running standard Next.js build...');
try {
  // GERÇEK KÖK NEDEN (kanıt: builder 58GB RAM, limit YOK — ama build 384MB'da OOM ediyordu):
  // Railway'de tanımlı NODE_OPTIONS env'i Node heap'ini DÜŞÜK sabitliyordu (ör. --max-old-space-size=384).
  // Çözüm: env'deki bu değeri derlemede KULLANMA; NODE_OPTIONS'ı temiz ve yüksek bir heap ile EZ.
  // (Gelen değeri kanıt için logluyoruz. --trace_gc kaldırıldı: Node onu NODE_OPTIONS'ta kabul etmiyordu.)
  console.log('[build-mem] gelen process.env.NODE_OPTIONS =', JSON.stringify(process.env.NODE_OPTIONS || '(yok)'));
  const NODE_OPTIONS = '--max-old-space-size=4096';
  execSync('next build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS },
  });
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}
