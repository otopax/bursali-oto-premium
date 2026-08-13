const { test, expect } = require('@playwright/test');

test.describe('GATE 4: VIP Customer Flow E2E', () => {
  test('unauthenticated VIP customer is redirected to login', async ({ page }) => {
    await page.goto('/tr/vip-garaj');
    await expect(page).toHaveURL(/\/login/);
  });

  test('VIP customer can render login form controls', async ({ page }) => {
    await page.goto('/tr/login');

    // LoginForm is wrapped in <Suspense> due to useSearchParams().
    // In standalone mode, the Suspense boundary resolves asynchronously.
    // We must wait for the actual form to hydrate past the "Yükleniyor..." fallback.
    const emailInput = page.getByTestId('login-email-input');
    await expect(emailInput).toBeVisible({ timeout: 15000 });
  });
});
