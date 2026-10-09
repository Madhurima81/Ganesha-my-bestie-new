const { chromium } = require('playwright');
const path = require('path');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 740, height: 360 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });

  await page.goto('http://127.0.0.1:5173/mandala-capture.html', { waitUntil: 'networkidle', timeout: 60000 });
  await page.waitForSelector('.inner-mandala-overlay', { timeout: 30000 });
  await page.waitForTimeout(3400);

  const out = path.resolve(__dirname, 'screenshots', 'requested', 'pond-inner-mandala-mobile-740x360.png');
  await page.screenshot({ path: out, fullPage: false });
  console.log(out);
  await browser.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
