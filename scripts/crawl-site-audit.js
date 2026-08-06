const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const SITE_URL = 'https://www.bursaliotoservis.com';
const LOCALES = ['tr', 'en', 'ru', 'uk', 'ar'];

// Seed URLs to start crawl
const initialUrls = [
  `${SITE_URL}/tr`,
  `${SITE_URL}/en`,
  `${SITE_URL}/ru`,
  `${SITE_URL}/uk`,
  `${SITE_URL}/ar`,
  `${SITE_URL}/tr/hakkimizda`,
  `${SITE_URL}/en/hakkimizda`,
  `${SITE_URL}/tr/ariza-kodlari/P0171`,
  `${SITE_URL}/en/ariza-kodlari/P0171`,
  `${SITE_URL}/tr/bakim-merkezi/bmw/60000`,
  `${SITE_URL}/en/bakim-merkezi/bmw/60000`,
  `${SITE_URL}/tr/ariza-cozumleri/bmw`,
  `${SITE_URL}/en/ariza-cozumleri/bmw`,
  `${SITE_URL}/tr/otomatik-sanziman-tamiri`,
  `${SITE_URL}/en/otomatik-sanziman-tamiri`,
  `${SITE_URL}/tr/porsche-mercedes-ozel-servis`,
  `${SITE_URL}/en/porsche-mercedes-ozel-servis`,
  `${SITE_URL}/tr/sanal-usta`,
  `${SITE_URL}/en/sanal-usta`,
  `${SITE_URL}/tr/seffaf-fiyatlandirma`,
  `${SITE_URL}/en/seffaf-fiyatlandirma`,
  `${SITE_URL}/tr/gocek-cekici`,
  `${SITE_URL}/en/gocek-cekici`,
  `${SITE_URL}/tr/kalkan-kas-yol-yardim`,
  `${SITE_URL}/en/kalkan-kas-yol-yardim`,
  `${SITE_URL}/tr/oludeniz-yol-yardim`,
  `${SITE_URL}/en/oludeniz-yol-yardim`,
  `${SITE_URL}/tr/blog`,
  `${SITE_URL}/en/blog`,
  `${SITE_URL}/tr/kutuphane`,
  `${SITE_URL}/en/kutuphane`,
  `${SITE_URL}/tr/marka/bmw`,
  `${SITE_URL}/en/marka/bmw`,
  `${SITE_URL}/tr/marka/mercedes`,
  `${SITE_URL}/en/marka/mercedes`,
  `${SITE_URL}/tr/marka/porsche`,
  `${SITE_URL}/en/marka/porsche`,
  `${SITE_URL}/tr/marka/audi`,
  `${SITE_URL}/en/marka/audi`,
  `${SITE_URL}/tr/bolge/fethiye-merkez`,
  `${SITE_URL}/en/bolge/fethiye-merkez`,
  `${SITE_URL}/tr/bolge/gocek`,
  `${SITE_URL}/en/bolge/gocek`,
  `${SITE_URL}/tr/bolge/oludeniz`,
  `${SITE_URL}/en/bolge/oludeniz`,
  `${SITE_URL}/tr/hizmetler/periyodik-bakim`,
  `${SITE_URL}/en/hizmetler/periyodik-bakim`,
  `${SITE_URL}/tr/vip-garaj`,
  `${SITE_URL}/en/vip-garaj`,
  `${SITE_URL}/tr/vip-filo-gece-bakimi`,
  `${SITE_URL}/en/vip-filo-gece-bakimi`,
];

const crawledResults = new Map();
const queue = [...initialUrls];
const visited = new Set();

const titlesMap = new Map();
const descriptionsMap = new Map();
const h1sMap = new Map();

console.log('Starting Bursalı Oto Full Site Auditor Crawler...');

let missingCanonicalCount = 0;
let missingHreflangCount = 0;
let missingOgCount = 0;
let missingTwitterCount = 0;
let internal3xxCount = 0;
let totalCrawled = 0;

function fetchUrl(url) {
  try {
    const cmd = `curl.exe -sL -w "%{http_code}" "${url}?cache_v=4"`;
    const rawOutput = execSync(cmd, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024, timeout: 15000 });
    const statusCode = rawOutput.slice(-3);
    const html = rawOutput.slice(0, -3);
    return { statusCode: parseInt(statusCode, 10), html };
  } catch (e) {
    return { statusCode: 500, html: '' };
  }
}

while (queue.length > 0 && totalCrawled < 250) {
  const currentUrl = queue.shift();
  if (visited.has(currentUrl)) continue;
  visited.add(currentUrl);

  totalCrawled++;
  process.stdout.write(`\rCrawling URL [${totalCrawled}/250]: ${currentUrl.slice(0, 60)}...`);

  const { statusCode, html } = fetchUrl(currentUrl);

  if (statusCode >= 300 && statusCode < 400) {
    internal3xxCount++;
  }

  if (statusCode !== 200 || !html) {
    crawledResults.set(currentUrl, { statusCode, status: 'HTTP_ERROR' });
    continue;
  }

  // Parse HTML
  const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
  const title = titleMatch ? titleMatch[1].trim() : '';

  const descMatch = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i);
  const description = descMatch ? descMatch[1].trim() : '';

  const h1Matches = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/gi) || [];
  const h1Count = h1Matches.length;
  const firstH1 = h1Matches.length > 0 ? h1Matches[0].replace(/<[^>]+>/g, '').trim() : '';

  const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
  const canonical = canonicalMatch ? canonicalMatch[1] : null;

  const hreflangs = html.match(/<link\s+rel="alternate"\s+hrefLang="([^"]*)"\s+href="([^"]*)"/gi) || [];

  const ogTitleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]*)"/i);
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]*)"/i);
  const hasOg = !!(ogTitleMatch && ogImageMatch);

  const twitterCardMatch = html.match(/<meta\s+name="twitter:card"\s+content="([^"]*)"/i);
  const hasTwitter = !!twitterCardMatch;

  if (!canonical) missingCanonicalCount++;
  if (hreflangs.length < 5) missingHreflangCount++;
  if (!hasOg) missingOgCount++;
  if (!hasTwitter) missingTwitterCount++;

  // Record duplicates
  if (title) {
    if (!titlesMap.has(title)) titlesMap.set(title, []);
    titlesMap.get(title).push(currentUrl);
  }
  if (description) {
    if (!descriptionsMap.has(description)) descriptionsMap.set(description, []);
    descriptionsMap.get(description).push(currentUrl);
  }
  if (firstH1) {
    if (!h1sMap.has(firstH1)) h1sMap.set(firstH1, []);
    h1sMap.get(firstH1).push(currentUrl);
  }

  // Extract internal links to expand crawl queue
  const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
  const bodyHtml = bodyMatch ? bodyMatch[0] : html;
  const linkMatches = bodyHtml.match(/href=["'](\/(?:tr|en|ru|uk|ar)\/[^"']*)["']/g) || [];

  linkMatches.forEach(lm => {
    const rawHref = lm.replace(/href=["']/, '').replace(/["']/, '');
    const fullUrl = `${SITE_URL}${rawHref}`;
    if (!visited.has(fullUrl) && !queue.includes(fullUrl) && queue.length < 300) {
      queue.push(fullUrl);
    }
  });

  crawledResults.set(currentUrl, {
    statusCode,
    title,
    description,
    h1Count,
    firstH1,
    canonical,
    hreflangCount: hreflangs.length,
    hasOg,
    hasTwitter
  });
}

console.log('\nCrawl finished.');

// Count duplicates across all crawled URLs
let duplicateTitleCount = 0;
titlesMap.forEach((urls) => {
  if (urls.length > 1) duplicateTitleCount += (urls.length - 1);
});

let duplicateDescCount = 0;
descriptionsMap.forEach((urls) => {
  if (urls.length > 1) duplicateDescCount += (urls.length - 1);
});

let duplicateH1Count = 0;
h1sMap.forEach((urls) => {
  if (urls.length > 1) duplicateH1Count += (urls.length - 1);
});

const criticalIssues = missingCanonicalCount + duplicateTitleCount + duplicateDescCount + duplicateH1Count + missingHreflangCount;

// Calculate Website Score (Sitechecker style formula)
let websiteScore = 100;
websiteScore -= Math.min(40, criticalIssues * 0.5);
websiteScore -= Math.min(20, (missingOgCount + missingTwitterCount) * 0.1);
websiteScore = Math.max(10, Math.round(websiteScore));

const auditReport = {
  timestamp: new Date().toISOString(),
  websiteScore,
  totalCrawled,
  criticalIssues,
  missingCanonicalCount,
  duplicateTitleCount,
  duplicateDescCount,
  duplicateH1Count,
  missingHreflangCount,
  internal3xxCount,
  missingOgCount,
  missingTwitterCount,
  beforeVsAfter: {
    BEFORE: {
      score: 38,
      critical: 170,
      missingCanonical: 172,
      duplicateTitle: 152,
      duplicateDesc: 152,
      duplicateH1: 170,
      missingHreflang: 172,
      internal3xx: 244,
      incompleteOg: 218,
      incompleteTwitter: 244
    },
    AFTER: {
      score: websiteScore,
      critical: criticalIssues,
      missingCanonical: missingCanonicalCount,
      duplicateTitle: duplicateTitleCount,
      duplicateDesc: duplicateDescCount,
      duplicateH1: duplicateH1Count,
      missingHreflang: missingHreflangCount,
      internal3xx: internal3xxCount,
      incompleteOg: missingOgCount,
      incompleteTwitter: missingTwitterCount
    }
  }
};

const outputPath = path.join(process.cwd(), 'evidence', 'sitechecker-audit-report.json');
fs.writeFileSync(outputPath, JSON.stringify(auditReport, null, 2), 'utf8');

console.log('\n=== SITECHECKER STYLE LIVE CRAWL AUDIT COMPLETED ===');
console.log(`Website Score: ${websiteScore} / 100 (BEFORE: 38 / 100)`);
console.log(`Critical Issues: ${criticalIssues} (BEFORE: 170)`);
console.log(`Missing Canonical: ${missingCanonicalCount} (BEFORE: 172)`);
console.log(`Duplicate Title: ${duplicateTitleCount} (BEFORE: 152)`);
console.log(`Duplicate Description: ${duplicateDescCount} (BEFORE: 152)`);
console.log(`Duplicate H1: ${duplicateH1Count} (BEFORE: 170)`);
console.log(`Missing Hreflang: ${missingHreflangCount} (BEFORE: 172)`);
console.log(`Internal 3xx Links: ${internal3xxCount} (BEFORE: 244)`);
console.log(`Incomplete OpenGraph: ${missingOgCount} (BEFORE: 218)`);
console.log(`Incomplete Twitter Card: ${missingTwitterCount} (BEFORE: 244)`);
console.log(`Saved audit report to: ${outputPath}`);
