const { test, expect } = require('@playwright/test');

test.describe('GATE 4: Admin Flow E2E', () => {
  test('unauthenticated request to /admin redirects to login with callbackUrl', async ({ page }) => {
    await page.goto('/tr/admin');
    await expect(page).toHaveURL(/\/login/);
    expect(page.url()).toContain('callbackUrl');
  });

  test('unauthenticated API call to /api/admin/metrics returns 401 Unauthorized', async ({ request }) => {
    const response = await request.get('/api/admin/metrics');
    expect(response.status()).toBe(401);
    const body = await response.json();
    expect(body.error).toContain('admin access required');
  });
});
