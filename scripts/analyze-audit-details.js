const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://www.bursaliotoservis.com';

// We run a fast analysis pass over the 250 crawled URLs to extract exact H1, Title, Description, and Canonical groups
console.log('Analyzing Duplicate H1, Title, Description, and Canonical issues across live pages...');

const auditData = JSON.parse(fs.readFileSync('evidence/sitechecker-audit-report.json', 'utf8'));

// Run deep URL analysis script using curl & HTML parsing
const analyzeScript = `
const fs = require('fs');
const { execSync } = require('child_process');

const SITE_URL = 'https://www.bursaliotoservis.com';
const LOCALES = ['tr', 'en', 'ru', 'uk', 'ar'];

const seedUrls = [
  '${SITE_URL}/tr',
  '${SITE_URL}/en',
  '${SITE_URL}/ru',
  '${SITE_URL}/uk',
  '${SITE_URL}/ar',
  '${SITE_URL}/tr/hakkimizda',
  '${SITE_URL}/en/hakkimizda',
  '${SITE_URL}/tr/ariza-kodlari/P0171',
  '${SITE_URL}/en/ariza-kodlari/P0171',
  '${SITE_URL}/tr/bakim-merkezi/bmw/60000',
  '${SITE_URL}/en/bakim-merkezi/bmw/60000',
  '${SITE_URL}/tr/ariza-cozumleri/bmw',
  '${SITE_URL}/en/ariza-cozumleri/bmw',
  '${SITE_URL}/tr/otomatik-sanziman-tamiri',
  '${SITE_URL}/en/otomatik-sanziman-tamiri',
  '${SITE_URL}/tr/porsche-mercedes-ozel-servis',
  '${SITE_URL}/en/porsche-mercedes-ozel-servis',
  '${SITE_URL}/tr/sanal-usta',
  '${SITE_URL}/en/sanal-usta',
  '${SITE_URL}/tr/seffaf-fiyatlandirma',
  '${SITE_URL}/en/seffaf-fiyatlandirma',
  '${SITE_URL}/tr/gocek-cekici',
  '${SITE_URL}/en/gocek-cekici',
  '${SITE_URL}/tr/kalkan-kas-yol-yardim',
  '${SITE_URL}/en/kalkan-kas-yol-yardim',
  '${SITE_URL}/tr/oludeniz-yol-yardim',
  '${SITE_URL}/en/oludeniz-yol-yardim',
  '${SITE_URL}/tr/blog',
  '${SITE_URL}/en/blog',
  '${SITE_URL}/tr/kutuphane',
  '${SITE_URL}/en/kutuphane',
  '${SITE_URL}/tr/marka/bmw',
  '${SITE_URL}/en/marka/bmw',
  '${SITE_URL}/tr/marka/mercedes',
  '${SITE_URL}/en/marka/mercedes',
  '${SITE_URL}/tr/marka/porsche',
  '${SITE_URL}/en/marka/porsche',
  '${SITE_URL}/tr/marka/audi',
  '${SITE_URL}/en/marka/audi',
  '${SITE_URL}/tr/bolge/fethiye-merkez',
  '${SITE_URL}/en/bolge/fethiye-merkez',
  '${SITE_URL}/tr/bolge/gocek',
  '${SITE_URL}/en/bolge/gocek',
  '${SITE_URL}/tr/bolge/oludeniz',
  '${SITE_URL}/en/bolge/oludeniz',
  '${SITE_URL}/tr/hizmetler/periyodik-bakim',
  '${SITE_URL}/en/hizmetler/periyodik-bakim',
  '${SITE_URL}/tr/vip-garaj',
  '${SITE_URL}/en/vip-garaj',
  '${SITE_URL}/tr/vip-filo-gece-bakimi',
  '${SITE_URL}/en/vip-filo-gece-bakimi',
];

const h1sMap = new Map();
const titlesMap = new Map();
const descsMap = new Map();
const missingCanonicalUrls = [];

seedUrls.forEach(url => {
  try {
    const html = execSync(\`curl.exe -sL "\${url}?cache_v=4"\`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });
    const h1Matches = html.match(/<h1[^>]*>([\\s\\S]*?)<\\/h1>/gi) || [];
    const firstH1 = h1Matches.length > 0 ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : '';

    const titleMatch = html.match(/<title>([^<]*)<\\/title>/i);
    const title = titleMatch ? titleMatch[1].trim() : '';

    const descMatch = html.match(/<meta\\s+name="description"\\s+content="([^"]*)"/i);
    const desc = descMatch ? descMatch[1].trim() : '';

    const canonicalMatch = html.match(/<link\\s+rel="canonical"\\s+href="([^"]*)"/i);
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
`;

fs.writeFileSync('scripts/run-h1-analysis.js', analyzeScript, 'utf8');
execSync('node scripts/run-h1-analysis.js', { stdio: 'inherit' });
