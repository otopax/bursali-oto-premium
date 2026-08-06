
const fs = require('fs');
const { execSync } = require('child_process');

const SITE_URL = 'https://www.bursaliotoservis.com';
const LOCALES = ['tr', 'en', 'ru', 'uk', 'ar'];

const seedUrls = [
  'https://www.bursaliotoservis.com/tr',
  'https://www.bursaliotoservis.com/en',
  'https://www.bursaliotoservis.com/ru',
  'https://www.bursaliotoservis.com/uk',
  'https://www.bursaliotoservis.com/ar',
  'https://www.bursaliotoservis.com/tr/hakkimizda',
  'https://www.bursaliotoservis.com/en/hakkimizda',
  'https://www.bursaliotoservis.com/tr/ariza-kodlari/P0171',
  'https://www.bursaliotoservis.com/en/ariza-kodlari/P0171',
  'https://www.bursaliotoservis.com/tr/bakim-merkezi/bmw/60000',
  'https://www.bursaliotoservis.com/en/bakim-merkezi/bmw/60000',
  'https://www.bursaliotoservis.com/tr/ariza-cozumleri/bmw',
  'https://www.bursaliotoservis.com/en/ariza-cozumleri/bmw',
  'https://www.bursaliotoservis.com/tr/otomatik-sanziman-tamiri',
  'https://www.bursaliotoservis.com/en/otomatik-sanziman-tamiri',
  'https://www.bursaliotoservis.com/tr/porsche-mercedes-ozel-servis',
  'https://www.bursaliotoservis.com/en/porsche-mercedes-ozel-servis',
  'https://www.bursaliotoservis.com/tr/sanal-usta',
  'https://www.bursaliotoservis.com/en/sanal-usta',
  'https://www.bursaliotoservis.com/tr/seffaf-fiyatlandirma',
  'https://www.bursaliotoservis.com/en/seffaf-fiyatlandirma',
  'https://www.bursaliotoservis.com/tr/gocek-cekici',
  'https://www.bursaliotoservis.com/en/gocek-cekici',
  'https://www.bursaliotoservis.com/tr/kalkan-kas-yol-yardim',
  'https://www.bursaliotoservis.com/en/kalkan-kas-yol-yardim',
  'https://www.bursaliotoservis.com/tr/oludeniz-yol-yardim',
  'https://www.bursaliotoservis.com/en/oludeniz-yol-yardim',
  'https://www.bursaliotoservis.com/tr/blog',
  'https://www.bursaliotoservis.com/en/blog',
  'https://www.bursaliotoservis.com/tr/kutuphane',
  'https://www.bursaliotoservis.com/en/kutuphane',
  'https://www.bursaliotoservis.com/tr/marka/bmw',
  'https://www.bursaliotoservis.com/en/marka/bmw',
  'https://www.bursaliotoservis.com/tr/marka/mercedes',
  'https://www.bursaliotoservis.com/en/marka/mercedes',
  'https://www.bursaliotoservis.com/tr/marka/porsche',
  'https://www.bursaliotoservis.com/en/marka/porsche',
  'https://www.bursaliotoservis.com/tr/marka/audi',
  'https://www.bursaliotoservis.com/en/marka/audi',
  'https://www.bursaliotoservis.com/tr/bolge/fethiye-merkez',
  'https://www.bursaliotoservis.com/en/bolge/fethiye-merkez',
  'https://www.bursaliotoservis.com/tr/bolge/gocek',
  'https://www.bursaliotoservis.com/en/bolge/gocek',
  'https://www.bursaliotoservis.com/tr/bolge/oludeniz',
  'https://www.bursaliotoservis.com/en/bolge/oludeniz',
  'https://www.bursaliotoservis.com/tr/hizmetler/periyodik-bakim',
  'https://www.bursaliotoservis.com/en/hizmetler/periyodik-bakim',
  'https://www.bursaliotoservis.com/tr/vip-garaj',
  'https://www.bursaliotoservis.com/en/vip-garaj',
  'https://www.bursaliotoservis.com/tr/vip-filo-gece-bakimi',
  'https://www.bursaliotoservis.com/en/vip-filo-gece-bakimi',
];

const h1sMap = new Map();
const titlesMap = new Map();
const descsMap = new Map();
const missingCanonicalUrls = [];

seedUrls.forEach(url => {
  try {
    const html = execSync(`curl.exe -sL "${url}?cache_v=4"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
    const firstH1 = h1Matches.length > 0 ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : '';

    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
    const desc = descMatch ? descMatch[1].trim() : '';

    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
    if (!canonicalMatch) missingCanonicalUrls.push(url);

    if (firstH1) {
      if (!h1sMap.has(firstH1)) h1sMap.set(firstH1, []);
      h1sMap.get(firstH1).push(url);
    }
    if (title) {
      if (!titlesMap.has(title)) titlesMap.set(title, []);
      titlesMap.get(title).push(url);
    }
    if (desc) {
      if (!descsMap.has(desc)) descsMap.set(desc, []);
      descsMap.get(desc).push(url);
    }
  } catch (e) {}
});

function groupUrlsByFamily(urls) {
  const groups = {
    '/ariza-kodlari/*': [],
    '/ariza-cozumleri/*': [],
    '/bakim-merkezi/*': [],
    '/kutuphane/*': [],
    '/marka/*': [],
    '/motor/*': [],
    '/blog/*': [],
    '/bolge/*': [],
    'Statik Sayfalar': []
  };

  urls.forEach(u => {
    if (u.includes('/ariza-kodlari/')) groups['/ariza-kodlari/*'].push(u);
    else if (u.includes('/ariza-cozumleri/')) groups['/ariza-cozumleri/*'].push(u);
    else if (u.includes('/bakim-merkezi/')) groups['/bakim-merkezi/*'].push(u);
    else if (u.includes('/kutuphane/')) groups['/kutuphane/*'].push(u);
    else if (u.includes('/marka/')) groups['/marka/*'].push(u);
    else if (u.includes('/motor/')) groups['/motor/*'].push(u);
    else if (u.includes('/blog/')) groups['/blog/*'].push(u);
    else if (u.includes('/bolge/')) groups['/bolge/*'].push(u);
    else groups['Statik Sayfalar'].push(u);
  });

  return groups;
}

const duplicateH1Details = [];
h1sMap.forEach((urls, h1Text) => {
  if (urls.length > 1) {
    duplicateH1Details.push({
      h1Text,
      count: urls.length,
      urls,
      familyBreakdown: groupUrlsByFamily(urls)
    });
  }
});

const duplicateTitleDetails = [];
titlesMap.forEach((urls, titleText) => {
  if (urls.length > 1) {
    duplicateTitleDetails.push({
      titleText,
      count: urls.length,
      urls
    });
  }
});

const duplicateDescDetails = [];
descsMap.forEach((urls, descText) => {
  if (urls.length > 1) {
    duplicateDescDetails.push({
      descText,
      count: urls.length,
      urls
    });
  }
});

const output = {
  timestamp: new Date().toISOString(),
  duplicateH1: {
    totalDuplicateH1Instances: duplicateH1Details.reduce((sum, d) => sum + (d.count - 1), 0),
    groups: duplicateH1Details
  },
  duplicateTitle: {
    totalDuplicateTitleInstances: duplicateTitleDetails.reduce((sum, d) => sum + (d.count - 1), 0),
    groups: duplicateTitleDetails
  },
  duplicateDescription: {
    totalDuplicateDescInstances: duplicateDescDetails.reduce((sum, d) => sum + (d.count - 1), 0),
    groups: duplicateDescDetails
  },
  missingCanonical: {
    count: missingCanonicalUrls.length,
    urls: missingCanonicalUrls
  }
};

fs.writeFileSync('evidence/h1-and-duplicates-forensic-report.json', JSON.stringify(output, null, 2), 'utf8');
console.log('Forensic Duplicate Analysis Saved to evidence/h1-and-duplicates-forensic-report.json');
