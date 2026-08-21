const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { chromium } = require("playwright");

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const IDS = ["SIT021", "SIT023", "SIT027", "SIT106", "SIT126", "SIT134", "SIT163"];
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css",
};

function createServer() {
  return http.createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : (req.url || "/index.html");
    const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0]));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end();
      return;
    }
    res.writeHead(200, { "Content-Type": TYPES[path.extname(filePath)] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
}

(async () => {
  const server = createServer();
  await new Promise((resolve) => server.listen(0, resolve));
  const port = server.address().port;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${port}/index.html`, { waitUntil: "networkidle" });
  const rows = await page.evaluate(async (ids) => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (window.__pranaDebug && window.__pranaState && window.__pranaState.libraries
          && document.querySelector("#situationSelect")?.options.length > 0) {
          resolve();
          return;
        }
        if (Date.now() - started > 20000) {
          reject(new Error("timeout"));
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    });
    await waitForReady();
    return ids.map((situationId) => {
      const request = { situationId, characterId: null };
      const res = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
      const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request);
      const text = (artifacts?.lockedFinalStory?.pages || []).map((p) => p.text).join("\n\n");
      return {
        situationId,
        templateId: artifacts?.templateSelection?.templateId,
        completeStoryStatus: artifacts?.completeStoryValidation?.status,
        completeStoryIssues: artifacts?.completeStoryValidation?.issues || [],
        storyQA: artifacts?.storyQAReport?.status,
        storyQAErrors: artifacts?.storyQAReport?.errors || [],
        productionQA: artifacts?.productionQAReport?.status,
        masterText: artifacts?.completeStoryMaster?.storyText || "",
        text,
      };
    });
  }, IDS);
  console.log(JSON.stringify(rows, null, 2));
  await browser.close();
  server.close();
})().catch((err) => {
  console.error(err);
  process.exit(1);
});
