const { chromium } = require('playwright');
const path = require('path');

const out = path.resolve(__dirname, 'screenshots', 'requested', 'pond-inner-mandala-mobile-740x360.png');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    viewport: { width: 740, height: 360 },
    deviceScaleFactor: 1,
    isMobile: true,
    hasTouch: true,
  });

  page.on('console', (msg) => {
    const text = msg.text();
    if (/error|failed|complete|mandala|phase/i.test(text)) console.log(`[browser] ${text}`);
  });

  await page.goto('http://127.0.0.1:5173/game-test.html?game=sm-pond', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.evaluate(() => {
    localStorage.clear();
    sessionStorage.clear();
    const profile = {
      id: 'audit-child',
      name: 'Aarav',
      age: 6,
      avatar: 'monkey',
      createdAt: Date.now(),
      lastPlayed: Date.now(),
    };
    localStorage.setItem('activeProfileId', profile.id);
    localStorage.setItem('gmb_active_profile', JSON.stringify(profile));
    localStorage.setItem('gmb_child_profiles', JSON.stringify([profile]));
  });
  await page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 });

  await page.waitForTimeout(4000);
  await page.locator('button').filter({ hasText: /start|begin|continue|let/i }).first().click({ timeout: 5000 }).catch(() => {});
  await page.waitForTimeout(1500);

  const stage = page.locator('.pond-scene-container, .pond-game-container, .pond-scene, .game-layout, .pond-stage').first();
  await stage.waitFor({ timeout: 30000 });
  const box = await stage.boundingBox();
  if (!box) throw new Error('No pond stage box');

  const tapAt = async (xPct, yPct, holdMs = 100) => {
    const x = box.x + box.width * xPct;
    const y = box.y + box.height * yPct;
    await page.mouse.move(x, y);
    await page.mouse.down();
    await page.waitForTimeout(holdMs);
    await page.mouse.up();
  };

  const drag = async (fromXPct, fromYPct, toXPct, toYPct) => {
    const x1 = box.x + box.width * fromXPct;
    const y1 = box.y + box.height * fromYPct;
    const x2 = box.x + box.width * toXPct;
    const y2 = box.y + box.height * toYPct;
    await page.mouse.move(x1, y1);
    await page.mouse.down();
    await page.mouse.move(x2, y2, { steps: 18 });
    await page.waitForTimeout(250);
    await page.mouse.up();
  };

  // Rock hold, reeds drag, trunk reveal.
  await tapAt(0.49, 0.52, 2200);
  await page.waitForTimeout(1600);
  await drag(0.53, 0.64, 0.72, 0.64);
  await page.waitForTimeout(4500);
  await page.mouse.click(box.x + box.width * 0.78, box.y + box.height * 0.82).catch(() => {});
  await page.waitForTimeout(2500);

  // Lotus hold, lotus reveal, fireworks, mandala.
  await tapAt(0.739, 0.61, 2400);
  await page.waitForTimeout(5000);
  await page.mouse.click(box.x + box.width * 0.78, box.y + box.height * 0.82).catch(() => {});
  await page.waitForSelector('.inner-mandala-overlay', { timeout: 20000 });
  await page.waitForTimeout(2800);

  await page.screenshot({ path: out, fullPage: false });
  console.log(out);
  await browser.close();
}

main().catch(async (err) => {
  console.error(err);
  process.exit(1);
});
