const { chromium } = require('playwright');

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 740, height: 360 } });
  await page.goto('http://127.0.0.1:5173/game-test.html?game=sm-pond', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await page.waitForTimeout(10000);
  console.log(await page.evaluate(() => {
    const els = [...document.querySelectorAll('body *')].slice(0, 200).map(el => ({
      tag: el.tagName,
      cls: typeof el.className === 'string' ? el.className : '',
      id: el.id,
      text: (el.textContent || '').trim().slice(0, 80),
      rect: (() => { const r = el.getBoundingClientRect(); return {x: r.x, y: r.y, w: r.width, h: r.height}; })()
    })).filter(x => x.cls || x.id || x.text);
    return JSON.stringify(els, null, 2);
  }));
  await page.screenshot({ path: 'screenshots/requested/pond-probe.png', fullPage: false });
  await browser.close();
}
main().catch(err => { console.error(err); process.exit(1); });
