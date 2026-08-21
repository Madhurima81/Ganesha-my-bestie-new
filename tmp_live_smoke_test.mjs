import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:5174/";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });

const consoleMessages = [];
page.on("console", (msg) => {
  consoleMessages.push({
    type: msg.type(),
    text: msg.text(),
  });
});

const pageErrors = [];
page.on("pageerror", (error) => {
  pageErrors.push(String(error));
});

await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(1500);

const initialTitle = await page.title();
const beginButton = page.getByRole("button", { name: "Begin", exact: true });
let beginVisible = await beginButton.isVisible().catch(() => false);

if (!beginVisible) {
  await page.waitForTimeout(12000);
  beginVisible = await beginButton.isVisible().catch(() => false);
}

let mainWelcomeAppeared = false;
if (!beginVisible) {
  mainWelcomeAppeared = await page
    .locator(".main-welcome-container")
    .waitFor({ state: "visible", timeout: 10000 })
    .then(() => true)
    .catch(() => false);
  beginVisible = await beginButton.isVisible().catch(() => false);
}

let postBeginUrl = null;
let postBeginText = null;
let beginClickError = null;
let finalBodyText = null;
let buttonTexts = [];
let screenshotPath = "tmp/live-smoke-final.png";
let screenState = null;

if (beginVisible) {
  try {
    await beginButton.click({ timeout: 10000 });
    await page.waitForTimeout(3000);
    postBeginUrl = page.url();
    postBeginText = (await page.locator("body").innerText()).slice(0, 1200);
  } catch (error) {
    beginClickError = String(error);
  }
}

finalBodyText = (await page.locator("body").innerText()).slice(0, 1200);
buttonTexts = await page.locator("button").evaluateAll((els) =>
  els.map((el) => (el.textContent || "").trim()).filter(Boolean)
);
screenState = {
  loadingScreens: await page.locator(".enhanced-loading-screen").count(),
  mainWelcomeScreens: await page.locator(".main-welcome-container").count(),
  viewTransitions: await page.locator(".view-transition").count(),
  rootHtmlSnippet: (await page.locator("#root").innerHTML()).slice(0, 2000),
};
await page.screenshot({ path: screenshotPath, fullPage: true });

const result = {
  baseUrl,
  initialTitle,
  beginVisible,
  postBeginUrl,
  beginClickError,
  mainWelcomeAppeared,
  pageErrors,
  consoleMessages,
  finalBodyText,
  buttonTexts,
  screenState,
  screenshotPath,
  postBeginText,
};

console.log(JSON.stringify(result, null, 2));

await browser.close();
