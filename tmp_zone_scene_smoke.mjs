import fs from "node:fs/promises";
import path from "node:path";
import { chromium } from "playwright";

const baseUrl = "http://127.0.0.1:5174/";
const profileId = "profile_live_scene_smoke";
const outputDir = path.resolve("tmp/scene-smoke");

const scenePlan = [
  { zone: "symbol-mountain", scene: "modak" },
  { zone: "symbol-mountain", scene: "pond" },
  { zone: "symbol-mountain", scene: "symbol" },
  { zone: "symbol-mountain", scene: "final-scene" },
  { zone: "shloka-river", scene: "vakratunda-grove" },
  { zone: "shloka-river", scene: "suryakoti-bank" },
  { zone: "shloka-river", scene: "nirvighnam-chant" },
  { zone: "shloka-river", scene: "sarvakaryeshu-chant" },
  { zone: "shloka-river", scene: "shloka-river-finale" },
  { zone: "festival-square", scene: "game1" },
  { zone: "festival-square", scene: "game2" },
  { zone: "festival-square", scene: "game3" },
  { zone: "festival-square", scene: "game4" },
];

const zoneScenes = {
  "symbol-mountain": ["modak", "pond", "symbol", "final-scene"],
  "shloka-river": [
    "vakratunda-grove",
    "suryakoti-bank",
    "nirvighnam-chant",
    "sarvakaryeshu-chant",
    "shloka-river-finale",
  ],
  "festival-square": ["game1", "game2", "game3", "game4"],
  "cave-of-secrets": [
    "vakratunda-mahakaya",
    "suryakoti-samaprabha",
    "nirvighnam-kurumedeva",
    "sarvakaryeshu-sarvada",
    "final-meaning-scene",
  ],
  "about-me-hut": ["family-tree", "favorite-food", "dreams-wishes", "my-indian-story"],
};

function buildProfileState(targetZone, targetScene) {
  const now = Date.now();
  const profiles = {
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
        currentZone: targetZone,
        currentScene: targetScene,
      },
    },
    lastUpdated: now,
  };

  const progress = {
    totalStars: 0,
    completedScenes: 0,
    currentZone: targetZone,
    currentScene: targetScene,
    zones: {},
  };

  for (const [zoneId, scenes] of Object.entries(zoneScenes)) {
    progress.zones[zoneId] = {
      unlocked: true,
      stars: 0,
      completed: false,
      scenes: {},
    };
    for (const sceneId of scenes) {
      progress.zones[zoneId].scenes[sceneId] = {
        completed: false,
        stars: 0,
        symbols: {},
        lastPlayed: null,
        unlocked: true,
      };
    }
  }

  const tempSession = {
    zone: targetZone,
    scene: targetScene,
    timestamp: now,
    lastSaved: now,
    completed: false,
    phase: "resume-test",
  };

  const currentSceneLocation = {
    zone: targetZone,
    scene: targetScene,
    timestamp: now,
    profileId,
  };

  return {
    profiles,
    progress,
    tempSession,
    currentSceneLocation,
  };
}

function sanitizeFilePart(value) {
  return value.replace(/[^a-z0-9-_]+/gi, "_");
}

async function runScene(browser, item) {
  const { zone, scene } = item;
  const sceneKey = `${zone}__${scene}`;
  const screenshotPath = path.join(outputDir, `${sanitizeFilePart(sceneKey)}.png`);
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await context.newPage();

  const logs = [];
  const errors = [];
  const warnings = [];

  page.on("console", (msg) => {
    const entry = {
      type: msg.type(),
      text: msg.text(),
    };
    logs.push(entry);
    if (entry.type === "error") errors.push(entry.text);
    if (entry.type === "warning" || entry.type === "warn") warnings.push(entry.text);
  });
  page.on("pageerror", (error) => {
    errors.push(String(error));
  });

  const state = buildProfileState(zone, scene);

  await page.addInitScript(
    ({ targetZone, targetScene, seededProfileId, seededState }) => {
      localStorage.clear();
      sessionStorage.clear();

      localStorage.setItem("activeProfileId", seededProfileId);
      localStorage.setItem("parentConsent", "true");
      localStorage.setItem("ganesha_audio_enabled", "false");
      localStorage.setItem(`ganeshaStoryShown_${seededProfileId}`, "1");
      localStorage.setItem("gameProfiles", JSON.stringify(seededState.profiles));
      localStorage.setItem(`${seededProfileId}_gameProgress`, JSON.stringify(seededState.progress));
      localStorage.setItem(
        `temp_session_${seededProfileId}_${targetZone}_${targetScene}`,
        JSON.stringify(seededState.tempSession)
      );
      localStorage.setItem("currentSceneLocation", JSON.stringify(seededState.currentSceneLocation));
      localStorage.setItem("lastSceneLocation", JSON.stringify(seededState.currentSceneLocation));
    },
    {
      targetZone: zone,
      targetScene: scene,
      seededProfileId: profileId,
      seededState: state,
    }
  );

  let status = "pass";
  let failureReason = null;

  try {
    await page.goto(baseUrl, { waitUntil: "domcontentloaded", timeout: 30000 });
    await page.waitForTimeout(1500);

    const continueButton = page.getByRole("button", { name: "Continue Adventure", exact: true });
    await continueButton.waitFor({ state: "visible", timeout: 35000 });
    await continueButton.click({ timeout: 10000 });

    await page.waitForTimeout(2000);

    const loadingCleared = await page
      .waitForFunction(
        () => !document.querySelector(".enhanced-loading-screen"),
        {},
        { timeout: 30000 }
      )
      .then(() => true)
      .catch(() => false);

    await page.waitForTimeout(2000);

    const htmlState = await page.evaluate(() => ({
      rootSnippet: (document.querySelector("#root")?.innerHTML || "").slice(0, 3000),
      bodyText: (document.body?.innerText || "").slice(0, 1200),
      buttonTexts: Array.from(document.querySelectorAll("button"))
        .map((el) => (el.textContent || "").trim())
        .filter(Boolean)
        .slice(0, 20),
      loadingScreens: document.querySelectorAll(".enhanced-loading-screen").length,
      currentViewSeen: document.body?.innerHTML?.includes("view-transition") || false,
    }));

    await page.screenshot({ path: screenshotPath, fullPage: true });

    const relevantLogs = logs.filter(
      (entry) =>
        entry.text.includes("current view: scene") ||
        (entry.text.includes("Current zone:") && entry.text.includes(zone) && entry.text.includes(scene)) ||
        entry.text.includes("ErrorBoundary") ||
        entry.text.includes("not found in SCENE_MAPPING")
    );

    if (!loadingCleared || htmlState.loadingScreens > 0) {
      status = "fail";
      failureReason = "scene stayed on loading screen";
    } else if (errors.length > 0) {
      status = "fail";
      failureReason = "console/page errors during load";
    } else if (!relevantLogs.some((entry) => entry.text.includes("current view: scene"))) {
      status = "warn";
      failureReason = "scene loaded but did not log scene view transition";
    }

    const result = {
      zone,
      scene,
      status,
      failureReason,
      loadingCleared,
      errors,
      warnings,
      relevantLogs,
      bodyText: htmlState.bodyText,
      buttonTexts: htmlState.buttonTexts,
      rootSnippet: htmlState.rootSnippet,
      screenshotPath,
    };

    await context.close();
    return result;
  } catch (error) {
    await page.screenshot({ path: screenshotPath, fullPage: true }).catch(() => {});
    await context.close();
    return {
      zone,
      scene,
      status: "fail",
      failureReason: String(error),
      errors,
      warnings,
      relevantLogs: logs.slice(-20),
      bodyText: "",
      buttonTexts: [],
      rootSnippet: "",
      screenshotPath,
    };
  }
}

await fs.mkdir(outputDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const results = [];

for (const item of scenePlan) {
  results.push(await runScene(browser, item));
}

await browser.close();

const summary = {
  baseUrl,
  testedAt: new Date().toISOString(),
  totals: {
    total: results.length,
    passed: results.filter((r) => r.status === "pass").length,
    warned: results.filter((r) => r.status === "warn").length,
    failed: results.filter((r) => r.status === "fail").length,
  },
  results,
};

const summaryPath = path.join(outputDir, "summary.json");
await fs.writeFile(summaryPath, JSON.stringify(summary, null, 2));

console.log(JSON.stringify({ summaryPath, summary }, null, 2));
