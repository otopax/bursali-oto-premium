const axios = require('axios');

const DEFAULT_LOCALES = ['tr', 'en', 'ru', 'uk', 'ar'];
const BASE_URL = process.env.SITE_URL || 'https://www.bursaliotoservis.com';

/**
 * Validate Hreflang links across all configured locales for 200 OK responses
 * @param {Array<string>} locales - Array of active locales
 * @param {Array<string>} paths - Sample key paths to cross-check
 */
async function validateHreflangLinks(locales = DEFAULT_LOCALES, paths = ['', '/kutuphane', '/kutuphane/audi/a4/arizalar/P0030']) {
  console.log(`🔍 Starting Hreflang Cross-Check Validation for ${locales.length} locales across ${paths.length} target routes...\n`);

  const results = {
    totalChecked: 0,
    passed: 0,
    failed: 0,
    details: []
  };

  for (const path of paths) {
    console.log(`📍 Testing route path: "${path || '/'}"`);
    for (const locale of locales) {
      const targetUrl = `${BASE_URL}/${locale}${path}`;
      results.totalChecked++;

      try {
        const response = await axios.get(targetUrl, {
          timeout: 5000,
          validateStatus: false,
          headers: { 'User-Agent': 'BursaliOto-HreflangValidator/1.0' }
        });

        if (response.status === 200) {
          results.passed++;
          console.log(`  [PASS] ${locale.toUpperCase()} -> ${targetUrl} (Status: 200)`);
          results.details.push({ locale, url: targetUrl, status: 200, valid: true });
        } else {
          results.failed++;
          console.error(`  [FAIL] ${locale.toUpperCase()} -> ${targetUrl} (Status: ${response.status})`);
          results.details.push({ locale, url: targetUrl, status: response.status, valid: false });
        }
      } catch (err) {
        results.failed++;
        console.error(`  [ERROR] ${locale.toUpperCase()} -> ${targetUrl} (${err.message})`);
        results.details.push({ locale, url: targetUrl, error: err.message, valid: false });
      }
    }
  }

  console.log('\n📊 HREFLANG VALIDATION SUMMARY:');
  console.log(`Total Checked: ${results.totalChecked}`);
  console.log(`Passed (200 OK): ${results.passed}`);
  console.log(`Failed: ${results.failed}`);

  if (results.failed > 0) {
    console.error('❌ Hreflang Validation failed! Fix missing target routes before deploying.');
    if (process.env.CI) process.exit(1);
  } else {
    console.log('✅ All Hreflang target URLs responded with HTTP 200 OK!');
  }

  return results;
}

if (require.main === module) {
  validateHreflangLinks();
}

module.exports = {
  validateHreflangLinks
};
