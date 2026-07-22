const { execSync } = require('child_process');

const serviceName = process.env.RAILWAY_SERVICE_NAME || '';

if (serviceName.toLowerCase().includes('worker') || process.env.IS_WORKER === 'true') {
  console.log('👷 Worker service detected via RAILWAY_SERVICE_NAME. Skipping Next.js build to save memory.');
  process.exit(0);
}

console.log('🚀 Running standard Next.js build...');
try {
  execSync('next build', { stdio: 'inherit' });
} catch (error) {
  console.error('❌ Next.js build failed:', error.message);
  process.exit(1);
}
