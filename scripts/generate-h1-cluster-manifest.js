const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://www.bursaliotoservis.com';

const seedUrls = [
  `${SITE_URL}/tr`, `${SITE_URL}/en`, `${SITE_URL}/ru`, `${SITE_URL}/uk`, `${SITE_URL}/ar`,
  `${SITE_URL}/tr/hakkimizda`, `${SITE_URL}/en/hakkimizda`, `${SITE_URL}/ru/hakkimizda`, `${SITE_URL}/uk/hakkimizda`, `${SITE_URL}/ar/hakkimizda`,
  `${SITE_URL}/tr/ariza-kodlari/P0171`, `${SITE_URL}/en/ariza-kodlari/P0171`, `${SITE_URL}/ru/ariza-kodlari/P0171`, `${SITE_URL}/uk/ariza-kodlari/P0171`, `${SITE_URL}/ar/ariza-kodlari/P0171`,
  `${SITE_URL}/tr/bakim-merkezi/bmw/60000`, `${SITE_URL}/en/bakim-merkezi/bmw/60000`, `${SITE_URL}/ru/bakim-merkezi/bmw/60000`, `${SITE_URL}/uk/bakim-merkezi/bmw/60000`, `${SITE_URL}/ar/bakim-merkezi/bmw/60000`,
  `${SITE_URL}/tr/ariza-cozumleri/bmw`, `${SITE_URL}/en/ariza-cozumleri/bmw`, `${SITE_URL}/ru/ariza-cozumleri/bmw`, `${SITE_URL}/uk/ariza-cozumleri/bmw`, `${SITE_URL}/ar/ariza-cozumleri/bmw`,
  `${SITE_URL}/tr/otomatik-sanziman-tamiri`, `${SITE_URL}/en/otomatik-sanziman-tamiri`, `${SITE_URL}/ru/otomatik-sanziman-tamiri`, `${SITE_URL}/uk/otomatik-sanziman-tamiri`, `${SITE_URL}/ar/otomatik-sanziman-tamiri`,
  `${SITE_URL}/tr/porsche-mercedes-ozel-servis`, `${SITE_URL}/en/porsche-mercedes-ozel-servis`, `${SITE_URL}/ru/porsche-mercedes-ozel-servis`, `${SITE_URL}/uk/porsche-mercedes-ozel-servis`, `${SITE_URL}/ar/porsche-mercedes-ozel-servis`,
  `${SITE_URL}/tr/sanal-usta`, `${SITE_URL}/en/sanal-usta`, `${SITE_URL}/ru/sanal-usta`, `${SITE_URL}/uk/sanal-usta`, `${SITE_URL}/ar/sanal-usta`,
  `${SITE_URL}/tr/seffaf-fiyatlandirma`, `${SITE_URL}/en/seffaf-fiyatlandirma`, `${SITE_URL}/ru/seffaf-fiyatlandirma`, `${SITE_URL}/uk/seffaf-fiyatlandirma`, `${SITE_URL}/ar/seffaf-fiyatlandirma`,
  `${SITE_URL}/tr/gocek-cekici`, `${SITE_URL}/en/gocek-cekici`, `${SITE_URL}/ru/gocek-cekici`, `${SITE_URL}/uk/gocek-cekici`, `${SITE_URL}/ar/gocek-cekici`,
  `${SITE_URL}/tr/kalkan-kas-yol-yardim`, `${SITE_URL}/en/kalkan-kas-yol-yardim`, `${SITE_URL}/ru/kalkan-kas-yol-yardim`, `${SITE_URL}/uk/kalkan-kas-yol-yardim`, `${SITE_URL}/ar/kalkan-kas-yol-yardim`,
  `${SITE_URL}/tr/oludeniz-yol-yardim`, `${SITE_URL}/en/oludeniz-yol-yardim`, `${SITE_URL}/ru/oludeniz-yol-yardim`, `${SITE_URL}/uk/oludeniz-yol-yardim`, `${SITE_URL}/ar/oludeniz-yol-yardim`,
  `${SITE_URL}/tr/blog`, `${SITE_URL}/en/blog`, `${SITE_URL}/ru/blog`, `${SITE_URL}/uk/blog`, `${SITE_URL}/ar/blog`,
  `${SITE_URL}/tr/kutuphane`, `${SITE_URL}/en/kutuphane`, `${SITE_URL}/ru/kutuphane`, `${SITE_URL}/uk/kutuphane`, `${SITE_URL}/ar/kutuphane`,
  `${SITE_URL}/tr/marka/bmw`, `${SITE_URL}/en/marka/bmw`, `${SITE_URL}/ru/marka/bmw`, `${SITE_URL}/uk/marka/bmw`, `${SITE_URL}/ar/marka/bmw`,
  `${SITE_URL}/tr/marka/mercedes`, `${SITE_URL}/en/marka/mercedes`, `${SITE_URL}/ru/marka/mercedes`, `${SITE_URL}/uk/marka/mercedes`, `${SITE_URL}/ar/marka/mercedes`,
  `${SITE_URL}/tr/marka/porsche`, `${SITE_URL}/en/marka/porsche`, `${SITE_URL}/ru/marka/porsche`, `${SITE_URL}/uk/marka/porsche`, `${SITE_URL}/ar/marka/porsche`,
  `${SITE_URL}/tr/marka/audi`, `${SITE_URL}/en/marka/audi`, `${SITE_URL}/ru/marka/audi`, `${SITE_URL}/uk/marka/audi`, `${SITE_URL}/ar/marka/audi`,
  `${SITE_URL}/tr/bolge/fethiye-merkez`, `${SITE_URL}/en/bolge/fethiye-merkez`, `${SITE_URL}/ru/bolge/fethiye-merkez`, `${SITE_URL}/uk/bolge/fethiye-merkez`, `${SITE_URL}/ar/bolge/fethiye-merkez`,
  `${SITE_URL}/tr/bolge/gocek`, `${SITE_URL}/en/bolge/gocek`, `${SITE_URL}/ru/bolge/gocek`, `${SITE_URL}/uk/bolge/gocek`, `${SITE_URL}/ar/bolge/gocek`,
  `${SITE_URL}/tr/bolge/oludeniz`, `${SITE_URL}/en/bolge/oludeniz`, `${SITE_URL}/ru/bolge/oludeniz`, `${SITE_URL}/uk/bolge/oludeniz`, `${SITE_URL}/ar/bolge/oludeniz`,
  `${SITE_URL}/tr/vip-garaj`, `${SITE_URL}/en/vip-garaj`, `${SITE_URL}/ru/vip-garaj`, `${SITE_URL}/uk/vip-garaj`, `${SITE_URL}/ar/vip-garaj`,
  `${SITE_URL}/tr/vip-filo-gece-bakimi`, `${SITE_URL}/en/vip-filo-gece-bakimi`, `${SITE_URL}/ru/vip-filo-gece-bakimi`, `${SITE_URL}/uk/vip-filo-gece-bakimi`, `${SITE_URL}/ar/vip-filo-gece-bakimi`,
  `${SITE_URL}/tr/kampanya/ucretsiz-checkup`, `${SITE_URL}/en/kampanya/ucretsiz-checkup`, `${SITE_URL}/ru/kampanya/ucretsiz-checkup`, `${SITE_URL}/uk/kampanya/ucretsiz-checkup`, `${SITE_URL}/ar/kampanya/ucretsiz-checkup`,
];

const h1Map = new Map();

console.log(`Executing Fresh NOCACHE H1 Forensic Cluster Analysis across ${seedUrls.length} live URLs...`);

seedUrls.forEach(url => {
  try {
    const timestamp = Date.now() + Math.floor(Math.random() * 10000);
    const nocacheUrl = `${url}?nocache=${timestamp}`;
    const html = execSync(`curl.exe -sL "${nocacheUrl}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const firstH1 = h1Matches.length > 0 ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : '';

    if (firstH1) {
      if (!h1Map.has(firstH1)) {
        h1Map.set(firstH1, []);
      }
      const localeMatch = url.match(/bursaliotoservis\.com\/([a-z]{2})/);
      const loc = localeMatch ? localeMatch[1] : 'tr';
      h1Map.get(firstH1).push({ url, locale: loc });
    }
  } catch (e) {}
});

const clusters = [];
let crossLocaleCount = 0;
let trueSameLanguageCount = 0;
const affectedUrlSet = new Set();
const routeFamiliesSet = new Set();

h1Map.forEach((entryList, h1Text) => {
  if (entryList.length > 1) {
    const urls = entryList.map(e => e.url);
    const locales = Array.from(new Set(entryList.map(e => e.locale)));

    urls.forEach(u => affectedUrlSet.add(u));

    let family = 'Statik Sayfalar';
    if (urls[0].includes('/ariza-kodlari/')) family = '/ariza-kodlari/*';
    else if (urls[0].includes('/ariza-cozumleri/')) family = '/ariza-cozumleri/*';
    else if (urls[0].includes('/bakim-merkezi/')) family = '/bakim-merkezi/*';
    else if (urls[0].includes('/kutuphane/')) family = '/kutuphane/*';
    else if (urls[0].includes('/marka/')) family = '/marka/*';
    else if (urls[0].includes('/motor/')) family = '/motor/*';
    else if (urls[0].includes('/blog/')) family = '/blog/*';
    else if (urls[0].includes('/bolge/')) family = '/bolge/*';

    routeFamiliesSet.add(family);

    const isCrossLocale = locales.length > 1;
    if (isCrossLocale) {
      crossLocaleCount += (urls.length - 1);
    } else {
      trueSameLanguageCount += (urls.length - 1);
    }

    clusters.push({
      h1Text,
      count: urls.length,
      clusterType: isCrossLocale ? 'Cross-Locale Duplicate (Un-translated H1)' : 'True Same-Language Duplicate',
      locales,
      template: family,
      urls
    });
  }
});

const output = {
  timestamp: new Date().toISOString(),
  summary: {
    totalDuplicateH1Instances: Array.from(h1Map.values()).reduce((acc, list) => acc + (list.length > 1 ? list.length - 1 : 0), 0),
    uniqueDuplicateH1Strings: clusters.length,
    uniqueAffectedURLs: affectedUrlSet.size,
    routeFamiliesCount: routeFamiliesSet.size,
    crossLocaleDuplicates: crossLocaleCount,
    trueSameLanguageDuplicates: trueSameLanguageCount,
    crossLocalePercentage: `${((crossLocaleCount / (crossLocaleCount + trueSameLanguageCount || 1)) * 100).toFixed(1)}%`
  },
  clusters
};

const outputPath = path.join(process.cwd(), 'evidence', 'h1-cluster-manifest.json');
fs.writeFileSync(outputPath, JSON.stringify(output, null, 2), 'utf8');

console.log(`=== H1 FORENSIC CLUSTER MANIFEST GENERATED ===`);
console.log(`Unique Duplicate H1 Strings: ${clusters.length}`);
console.log(`Unique Affected URLs: ${affectedUrlSet.size}`);
console.log(`Cross-Locale Duplicates: ${crossLocaleCount}`);
console.log(`True Same-Language Duplicates: ${trueSameLanguageCount}`);
console.log(`Saved cluster report to: ${outputPath}`);
