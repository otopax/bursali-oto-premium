const { test, expect } = require('@playwright/test');

test.describe('GATE 4: H1 Validation', () => {
  // ─────────────────────────────────────────────────────────────
  // STATIC ROUTES: These render without a database connection.
  // They MUST always pass in CI regardless of infrastructure.
  // ─────────────────────────────────────────────────────────────
  const staticRoutes = [
    '/',
    '/tr',
  ];

  test('Validates H1 count on static routes', async ({ page }) => {
    const h1Map = new Map();
    for (const route of staticRoutes) {
      await page.goto(route);

      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Route ${route} must have exactly 1 H1`).toBe(1);

      const h1Text = await page.locator('h1').first().textContent();
      h1Map.set(h1Text, route);
    }
  });

  // ─────────────────────────────────────────────────────────────
  // DB-DEPENDENT ROUTES: These require a running Prisma/PostgreSQL
  // connection. They timeout in standalone mode without a DB.
  // Skipped in CI unless DATABASE_URL is available.
  // ─────────────────────────────────────────────────────────────
  const dbRoutes = [
    '/tr/ariza-kodlari/P2433',
    '/tr/ariza-kodlari/P0030',
    '/tr/ariza-kodlari/P0420',
    '/tr/sigorta-kutuphanesi',
    '/tr/kutuphane',
  ];

  // Only run if DATABASE_URL is present (indicates a live DB)
  const hasDb = !!process.env.DATABASE_URL;
  const dbTest = hasDb ? test : test.skip;

  dbTest('Validates H1 count on DB-dependent routes', async ({ page }) => {
    const h1Map = new Map();
    for (const route of dbRoutes) {
      await page.goto(route, { timeout: 60000 });

      const h1Count = await page.locator('h1').count();
      expect(h1Count, `Route ${route} must have exactly 1 H1`).toBe(1);

      const h1Text = await page.locator('h1').first().textContent();

      if (h1Map.has(h1Text) && route.includes('/ariza-kodlari/')) {
        throw new Error(`Identical H1 found: "${h1Text}" on ${route} and ${h1Map.get(h1Text)}`);
      }
      h1Map.set(h1Text, route);
    }
  });
});
