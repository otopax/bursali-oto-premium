const { execSync } = require('child_process');

console.log('=== BURSALI OTO PRODUCTION LIVE SMOKE TEST (cache_v=4) ===');

const urls = [
  'https://www.bursaliotoservis.com/en/ariza-kodlari/P0171?cache_v=4',
  'https://www.bursaliotoservis.com/en/bakim-merkezi/bmw/60000?cache_v=4',
  'https://www.bursaliotoservis.com/en/ariza-cozumleri/bmw?cache_v=4',
  'https://www.bursaliotoservis.com/en/sanal-usta?cache_v=4',
  'https://www.bursaliotoservis.com/en/hakkimizda?cache_v=4'
];

urls.forEach(url => {
  try {
    console.log(`\nTesting: ${url}`);
    const html = execSync(`curl.exe -sL "${url}"`, { encoding: 'utf8', maxBuffer: 10 * 1024 * 1024 });

    const titleMatch = html.match(/<title>([^<]*)<\/title>/i);
    const canonicalMatch = html.match(/<link\s+rel="canonical"\s+href="([^"]*)"/i);
    
    // Extract HTML body content to inspect internal anchor links
    const bodyMatch = html.match(/<body[\s\S]*<\/body>/i);
    const bodyHtml = bodyMatch ? bodyMatch[0] : html;
    
    // Check for hardcoded /tr/ links in anchor tags within body
    const trAnchorLinks = bodyHtml.match(/<a\s+[^>]*href=["'](?:\/tr\/|https?:\/\/[^\/]+\/tr\/)[^"']*["']/gi) || [];

    console.log(`  Title: ${titleMatch ? titleMatch[1] : 'MISSING'}`);
    console.log(`  Canonical: ${canonicalMatch ? canonicalMatch[1] : 'MISSING'}`);
    console.log(`  Hardcoded /tr/ anchor links in body: ${trAnchorLinks.length}`);
    if (trAnchorLinks.length > 0) console.log(`  Found link snippets:`, trAnchorLinks);
    console.log(`  Result: ${titleMatch && canonicalMatch && trAnchorLinks.length === 0 ? 'PASS' : 'FAIL'}`);
  } catch (e) {
    console.log(`  Error fetching ${url}: ${e.message}`);
  }
});
