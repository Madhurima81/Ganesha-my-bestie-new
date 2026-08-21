import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:5174/";
const profileId = "profile_live_scene_smoke";
const now = Date.now();

const profileState = {
  schemaVersion: 1,
  profiles: {
    [profileId]: {
      id: profileId,
      name: "Smoke Test",
      avatar: "owl",
      color: "#7B6D9E",
      age: 8,
      createdAt: now,
      lastPlayed: now,
      totalStars: 0,
      completedScenes: 0,
      currentZone: "symbol-mountain",
      currentScene: "modak",
    },
  },
  lastUpdated: now,
};

const progressState = {
  totalStars: 0,
  completedScenes: 0,
  currentZone: "symbol-mountain",
  currentScene: "modak",
  zones: {
    "symbol-mountain": {
      unlocked: true,
      stars: 0,
      completed: false,
      scenes: {
        modak: { completed: false, stars: 0, symbols: {}, unlocked: true },
        pond: { completed: false, stars: 0, symbols: {}, unlocked: true },
        symbol: { completed: false, stars: 0, symbols: {}, unlocked: true },
        "final-scene": { completed: false, stars: 0, symbols: {}, unlocked: true },
      },
    },
  },
};

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({ viewport: { width: 1440, height: 900 } });
const page = await context.newPage();

const logs = [];
page.on("console", (msg) => logs.push({ type: msg.type(), text: msg.text() }));
page.on("pageerror", (err) => logs.push({ type: "pageerror", text: String(err) }));

await page.addInitScript(
  ({ seededProfileId, seededProfiles, seededProgress, seededNow }) => {
    localStorage.clear();
    sessionStorage.clear();
    localStorage.setItem("activeProfileId", seededProfileId);
    localStorage.setItem("parentConsent", "true");
    localStorage.setItem("ganesha_audio_enabled", "false");
    localStorage.setItem(`ganeshaStoryShown_${seededProfileId}`, "1");
    localStorage.setItem("gameProfiles", JSON.stringify(seededProfiles));
    localStorage.setItem(`${seededProfileId}_gameProgress`, JSON.stringify(seededProgress));
    localStorage.setItem(
      `temp_session_${seededProfileId}_symbol-mountain_modak`,
      JSON.stringify({
        zone: "symbol-mountain",
        scene: "modak",
        timestamp: seededNow,
        lastSaved: seededNow,
        completed: false,
        phase: "resume-test",
      })
    );
  },
  {
    seededProfileId: profileId,
    seededProfiles: profileState,
    seededProgress: progressState,
    seededNow: now,
  }
);

await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
await page.waitForTimeout(35000);

const preClick = await page.evaluate(() => ({
  bodyText: (document.body?.innerText || "").slice(0, 1200),
  buttonTexts: Array.from(document.querySelectorAll("button"))
    .map((el) => (el.textContent || "").trim())
    .filter(Boolean),
  rootSnippet: (document.querySelector("#root")?.innerHTML || "").slice(0, 2500),
}));

const continueLocator = page.locator("button").filter({ hasText: "Continue Adventure" }).first();
const continueVisible = await continueLocator.isVisible().catch(() => false);

let clickResult = "not-clicked";
if (continueVisible) {
  await continueLocator.click({ timeout: 10000 });
  await page.waitForTimeout(20000);
  clickResult = "clicked";
}

const postClick = await page.evaluate(() => ({
  bodyText: (document.body?.innerText || "").slice(0, 1200),
  buttonTexts: Array.from(document.querySelectorAll("button"))
    .map((el) => (el.textContent || "").trim())
    .filter(Boolean),
  loadingScreens: document.querySelectorAll(".enhanced-loading-screen").length,
  rootSnippet: (document.querySelector("#root")?.innerHTML || "").slice(0, 2500),
}));

await page.screenshot({ path: "tmp/scene-smoke/modak-recheck.png", fullPage: true });

console.log(
  JSON.stringify(
    {
      continueVisible,
      clickResult,
      preClick,
      postClick,
      relevantLogs: logs.filter(
        (entry) =>
          entry.text.includes("current view:") ||
          entry.text.includes("Current zone:") ||
          entry.type === "pageerror"
      ),
    },
    null,
    2
  )
);

await context.close();
await browser.close();
