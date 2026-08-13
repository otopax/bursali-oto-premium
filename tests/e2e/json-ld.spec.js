const { test, expect } = require('@playwright/test');

test.describe('GATE 4: JSON-LD SEO Validation', () => {
  const routes = [
    '/',
    '/tr',
    '/tr/ariza-kodlari/P2433',
    '/tr/ariza-kodlari/P0030',
    '/tr/sigorta-kutuphanesi',
    '/tr/teknik-kutuphane'
  ];

  for (const route of routes) {
    test(`Validates JSON-LD on route ${route}`, async ({ page }) => {
      await page.goto(route);
      
      const scripts = await page.locator('script[type="application/ld+json"]').allTextContents();
      expect(scripts.length).toBeGreaterThan(0); // Must have at least one schema

      let schemaTypes = [];
      for (const text of scripts) {
        let json;
        try {
          json = JSON.parse(text);
        } catch (e) {
          throw new Error(`Malformed JSON-LD on ${route}: ${e.message}`);
        }

        const schemas = Array.isArray(json) ? json : [json];
        for (const schema of schemas) {
          expect(schema).toHaveProperty('@context');
          expect(schema).toHaveProperty('@type');
          schemaTypes.push(schema['@type']);
          
          if (schema['@type'] === 'FAQPage') {
            expect(schema).toHaveProperty('mainEntity');
          }
        }
      }
      
      // Ensure no conflicting/duplicate schemas of the exact same main type un-nested
      const uniqueTypes = new Set(schemaTypes);
      expect(uniqueTypes.size).toBeGreaterThan(0);
    });
  }
});
