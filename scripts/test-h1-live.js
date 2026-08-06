const { execSync } = require('child_process');

console.log('=== BURSALI OTO LIVE H1 LOCALIZATION VERIFICATION ===');

const routes = [
  '/marka/bmw',
  '/bolge/fethiye-merkez',
  '/ariza-kodlari/P0171',
  '/vip-filo-gece-bakimi',
  '/vip-garaj'
];

const locales = ['tr', 'en', 'ru', 'uk', 'ar'];

routes.forEach(r => {
  console.log(`\nRoute Family: ${r}`);
  locales.forEach(loc => {
    const url = `https://www.bursaliotoservis.com/${loc}${r}?cache_v=4`;
    try {
      const html = execSync(`curl.exe -sL "${url}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
      const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
      const h1Text = h1Match ? h1Match[1].replace(/<[^>]+>/g, '').trim() : 'MISSING H1';
      console.log(`  [${loc.toUpperCase()}] H1: "${h1Text}"`);
    } catch (e) {
      console.log(`  [${loc.toUpperCase()}] Error: ${e.message}`);
    }
  });
});
