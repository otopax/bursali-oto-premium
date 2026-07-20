import { test, expect } from '@playwright/test';

test.describe('Login & Authentication Flows (Faz 3 / Sprint 3)', () => {
  test('should render the login page', async ({ page }) => {
    // Navigating to the TR locale login
    await page.goto('/tr/login');
    
    // Check if the page contains some standard login fields or headers
    // Note: Adjust the selectors according to your actual UI
    await expect(page).toHaveTitle(/Bursalı Oto Servis/);
    
    // Look for Admin login form
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    
    // We only check if inputs are present. We can't log in without actual DB seed data.
    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });
  
  test('should have a customer VIP login tab', async ({ page }) => {
    await page.goto('/tr/login');
    // Müşteri portalı (Plaka & Tel) formu veya tabı var mı kontrol et
    const phoneInput = page.locator('input[type="text"]').first();
    await expect(phoneInput).toBeVisible();
  });
});
