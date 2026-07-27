const { execSync } = require('child_process');

const serviceName = process.env.RAILWAY_SERVICE_NAME || '';

if (serviceName.toLowerCase().includes('worker') || process.env.IS_WORKER === 'true') {
  console.log('👷 Worker service detected via RAILWAY_SERVICE_NAME. Skipping Next.js build to save memory.');
  process.exit(0);
}

console.log('🚀 Running standard Next.js build...');
try {
  // BUILD OOM FIX: 2320+ statik sayfa (generateStaticParams) build anında üretiliyor;
  // Node varsayılan heap'i (küçük cgroup'ta ~384MB) yetmeyip "JavaScript heap out of memory"
  // ile patlıyordu. Heap limitini açıkça yükseltiyoruz (Railway builder RAM'i buna yeter).
  const memFlag = '--max-old-space-size=4096';
  const NODE_OPTIONS = `${process.env.NODE_OPTIONS || ''} ${memFlag}`.trim();
  execSync('next build', {
    stdio: 'inherit',
    env: { ...process.env, NODE_OPTIONS },
  });
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}
