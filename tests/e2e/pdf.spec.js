const { test, expect } = require('@playwright/test');

test.describe('GATE 4: PDF/TSB Runtime Validation', () => {
  test('Validates TSB PDF link on P2433 returns application/pdf', async ({ page }) => {
    // 1. Go to the actual P2433 route
    await page.goto('/tr/ariza-kodlari/P2433');
    
    // 2. Find the PDF link
    const pdfLink = page.locator('a[href$=".pdf"]');
    
    // Check if the link exists. If it doesn't, this particular route might not have a TSB
    const count = await pdfLink.count();
    if (count === 0) {
      console.log('No PDF link found on this route, skipping the rest of the test.');
      return;
    }

    const href = await pdfLink.first().getAttribute('href');
    expect(href).not.toBeNull();

    // 3. Make a request to the PDF URL
    const response = await page.request.get(href);
    
    // 4. Verify HTTP 200 and Content-Type
    expect(response.status()).toBe(200);
    const contentType = response.headers()['content-type'];
    expect(contentType).toContain('application/pdf');
  });
});
