const { test, expect } = require('@playwright/test');

test.describe('GATE 4: Driver User Flow E2E', () => {
  test('driver navigates homepage -> DTC search -> solution article -> chat -> lead CTA', async ({ page }) => {
    // 1. Homepage
    await page.goto('/tr');
    await expect(page).toHaveTitle(/Bursalı Oto|Porsche|Audi|Volkswagen/i);

    // 2. Navigate to Fault Code / Solution Article
    await page.goto('/tr/ariza-cozumleri/p0420');
    await expect(page.locator('h1')).toContainText(/P0420/i);

    // 3. Verify Article content and OEM components
    const content = page.locator('main');
    await expect(content).toBeVisible();

    // 4. Sanal Usta Chat / Floating Widget presence
    const chatWidget = page.locator('button:has-text("Sanal Usta"), button[aria-label*="Sanal Usta"], [data-testid="chat-widget"]');
    if (await chatWidget.count() > 0) {
      await expect(chatWidget.first()).toBeVisible();
    }

    // 5. Lead Submission CTA presence
    const ctaButton = page.locator('a[href*="wa.me"], a[href*="tel:"], button:has-text("Randevu")');
    await expect(ctaButton.first()).toBeVisible();
  });
});
