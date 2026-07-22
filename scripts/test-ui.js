const { chromium } = require('playwright-core');
const path = require('path');
const fs = require('fs');

async function run() {
  const executablePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const browser = await chromium.launch({ executablePath, headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } });
  const page = await context.newPage();

  // Wait a bit for Next.js to compile the pages
  await new Promise(r => setTimeout(r, 10000));

  try {
    console.log('Navigating to /tr/ariza-cozumleri...');
    await page.goto('http://localhost:3000/tr/ariza-cozumleri', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join('C:\\Users\\xbors\\.gemini\\antigravity\\brain\\6c4fd489-c19f-4918-b153-cade4621aec2', 'screenshot_ariza.png') });
    console.log('Saved screenshot_ariza.png');

    console.log('Navigating to /tr/kutuphane...');
    await page.goto('http://localhost:3000/tr/kutuphane', { waitUntil: 'networkidle', timeout: 30000 });
    await page.screenshot({ path: path.join('C:\\Users\\xbors\\.gemini\\antigravity\\brain\\6c4fd489-c19f-4918-b153-cade4621aec2', 'screenshot_kutuphane.png') });
    console.log('Saved screenshot_kutuphane.png');

  } catch (err) {
    console.error('Error during testing:', err);
  } finally {
    await browser.close();
  }
}

run();
