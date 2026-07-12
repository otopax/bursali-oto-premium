const https = require('https');

async function runPageSpeed(url) {
  console.log(`🔍 [PageSpeed] ${url} adresi için analiz başlatılıyor...`);
  console.log(`Lütfen bekleyin (yaklaşık 10-15 saniye sürebilir)...\n`);

  const strategies = ['mobile', 'desktop'];

  for (const strategy of strategies) {
    const apiURL = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&strategy=${strategy}`;
    
    try {
      const data = await new Promise((resolve, reject) => {
        https.get(apiURL, (res) => {
          let rawData = '';
          res.on('data', (chunk) => rawData += chunk);
          res.on('end', () => {
            try {
              resolve(JSON.parse(rawData));
            } catch (e) {
              reject(e);
            }
          });
        }).on('error', reject);
      });

      if (data.error) {
        console.error(`❌ [Hata] ${strategy} analizi başarısız:`, data.error.message);
        continue;
      }

      const score = Math.round(data.lighthouseResult.categories.performance.score * 100);
      const metrics = data.lighthouseResult.audits;
      
      console.log(`=============================================`);
      console.log(`📱 Cihaz Tipi: ${strategy.toUpperCase()}`);
      console.log(`⭐️ Performans Skoru: ${score} / 100`);
      console.log(`=============================================`);
      console.log(`⏱️ First Contentful Paint (FCP): ${metrics['first-contentful-paint'].displayValue}`);
      console.log(`⏱️ Largest Contentful Paint (LCP): ${metrics['largest-contentful-paint'].displayValue}`);
      console.log(`⏱️ Total Blocking Time (TBT): ${metrics['total-blocking-time'].displayValue}`);
      console.log(`⏱️ Cumulative Layout Shift (CLS): ${metrics['cumulative-layout-shift'].displayValue}`);
      console.log(`⏱️ Speed Index: ${metrics['speed-index'].displayValue}`);
      console.log(``);

    } catch (error) {
      console.error(`❌ [Hata] ${strategy} taraması sırasında ağ hatası oluştu:`, error.message);
    }
  }
}

// Varsayılan URL veya argüman olarak gelen URL
const targetUrl = process.argv[2] || 'https://www.bursaliotoservis.com/tr';
runPageSpeed(targetUrl);
