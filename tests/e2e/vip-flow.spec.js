const { test, expect } = require('@playwright/test');

test.describe('GATE 4: VIP Customer Flow E2E', () => {
  test('unauthenticated VIP customer is redirected to login', async ({ page }) => {
    await page.goto('/tr/vip-garaj');
    await expect(page).toHaveURL(/\/login/);
  });

  test('VIP customer can render login form controls', async ({ page }) => {
    await page.goto('/tr/login');
    const emailInput = page.getByPlaceholder('admin@bursalioto.com');
    await expect(emailInput).toBeVisible();
  });
});
