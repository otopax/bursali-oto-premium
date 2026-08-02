const { test, expect } = require('@playwright/test');

test.describe('GATE 4: Negative Authorization E2E', () => {
  test('DENIES Guest user access to protected routes (/teknik-kutuphane)', async ({ page }) => {
    await page.goto('/tr/teknik-kutuphane');
    await expect(page).toHaveURL(/\/login/);
  });

  test('DENIES Guest user access to protected routes (/vip-garaj)', async ({ page }) => {
    await page.goto('/tr/vip-garaj');
    await expect(page).toHaveURL(/\/login/);
  });

  test('DENIES invalid admin header access to protected admin API', async ({ request }) => {
    const res = await request.get('/api/admin/check-embeddings', {
      headers: { 'x-admin-secret': 'invalid_secret_key' }
    });
    expect(res.status()).toBe(401);
  });
});
