const { chromium } = require('playwright');

const OUT = process.argv[2] || '.';
const WORD_TO_DIGIT = {
  zero: '0', one: '1', two: '2', three: '3', four: '4',
  five: '5', six: '6', seven: '7', eight: '8', nine: '9'
};

async function hideLoader(page) {
  await page.evaluate(() => {
    const el = document.querySelector('.enhanced-loading-screen');
    if (el) el.style.display = 'none';
  }).catch(() => {});
}

async function waitReady(page, maxMs = 60000) {
  const start = Date.now();
  while (Date.now() - start < maxMs) {
    await hideLoader(page);
    const text = await page.evaluate(() => document.body.innerText).catch(() => '');
    if (text && text.trim().length > 0) return text;
    await page.waitForTimeout(800);
  }
  return '';
}

async function shot(page, name) {
  await hideLoader(page);
  await page.waitForTimeout(400);
  await page.screenshot({ path: `${OUT}/${name}.png` });
  console.log('saved', name);
}

async function clickText(page, text, { exact = false } = {}) {
  const loc = page.getByText(text, { exact }).first();
  await loc.waitFor({ state: 'visible', timeout: 15000 });
  await loc.click();
}

async function solveParentGate(page) {
  // Loop in case of wrong-code retries
  for (let attempt = 0; attempt < 6; attempt++) {
    await page.waitForTimeout(500);
    const text = await page.evaluate(() => document.body.innerText);
    const m = text.match(/([A-Z]+),\s*([A-Z]+),\s*([A-Z]+),\s*([A-Z]+)/i);
    if (!m) { await page.waitForTimeout(500); continue; }
    const digits = m.slice(1, 5).map(w => WORD_TO_DIGIT[w.toLowerCase()]);
    if (digits.includes(undefined)) { await page.waitForTimeout(500); continue; }
    for (const d of digits) {
      const btn = page.getByRole('button', { name: d, exact: true }).first();
      await btn.click();
      await page.waitForTimeout(150);
    }
    await page.waitForTimeout(800);
    const after = await page.evaluate(() => document.body.innerText);
    if (!/grown-ups only/i.test(after)) return true; // moved on
  }
  return false;
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 844, height: 390 } });
  page.on('pageerror', e => console.log('pageerror', e.message));

  await page.goto('http://localhost:5173', { waitUntil: 'load' });
  await waitReady(page);
  await shot(page, '00-welcome');

  // Begin -> device choice -> Continue here
  await clickText(page, 'Begin');
  await page.waitForTimeout(1000);
  const hasDeviceModal = await page.getByText('Continue here').isVisible().catch(() => false);
  if (hasDeviceModal) {
    await clickText(page, 'Continue here');
  }

  // Parent gate (wait up to 15s for it to appear)
  let gateAppeared = false;
  for (let i = 0; i < 15; i++) {
    const t = await page.evaluate(() => document.body.innerText).catch(() => '');
    if (/grown-ups only/i.test(t)) { gateAppeared = true; break; }
    await page.waitForTimeout(1000);
  }
  if (gateAppeared) {
    await solveParentGate(page);
  }

  await waitReady(page);
  await page.waitForTimeout(1000);

  // Sign-in card -> Skip for now (if present)
  const skipVisible = await page.getByText('Skip for now').isVisible().catch(() => false);
  if (skipVisible) {
    await clickText(page, 'Skip for now');
  }

  await page.waitForTimeout(1500);

  // Name step
  const nameInput = page.getByPlaceholder('Enter their name');
  if (await nameInput.isVisible().catch(() => false)) {
    await nameInput.fill('Ravi');
    await page.locator('button:has(svg), button').filter({ hasText: '' }).first(); // no-op
    // Click the arrow/continue button (it's an icon-only button near input)
    const continueBtn = page.locator('button').last();
    await continueBtn.click();
  }

  await page.waitForTimeout(1000);
  // Age step -> Next
  if (await page.getByText('Next').isVisible().catch(() => false)) {
    await clickText(page, 'Next');
  }

  await page.waitForTimeout(1000);
  // All set -> Start Adventure
  if (await page.getByText('Start Adventure').isVisible().catch(() => false)) {
    await clickText(page, 'Start Adventure');
  }

  await page.waitForTimeout(1500);
  // Friend picker -> Let's go
  if (await page.getByText("Let's go").isVisible().catch(() => false)) {
    await clickText(page, "Let's go");
  }

  await page.waitForTimeout(2000);
  await hideLoader(page);

  // Meet Ganesha intro -> Skip
  for (let i = 0; i < 3; i++) {
    const skipBtn = page.getByText('Skip', { exact: true });
    if (await skipBtn.isVisible().catch(() => false)) {
      await skipBtn.click();
      await page.waitForTimeout(1500);
      await hideLoader(page);
    } else break;
  }

  await page.waitForTimeout(1500);
  await hideLoader(page);
  await shot(page, '02-map');

  const text = await page.evaluate(() => document.body.innerText);
  console.log('MAP TEXT:', text);

  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
