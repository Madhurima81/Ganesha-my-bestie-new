import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41932;
const CASES = [
  { situationId: "SIT028", templateId: "T15" },
  { situationId: "SIT024", templateId: "T15" },
  { situationId: "SIT034", templateId: "T15" },
  { situationId: "SIT119", templateId: "T15" },
  { situationId: "SIT156", templateId: "T15" },
  { situationId: "SIT142", templateId: "T15" },
  { situationId: "SIT099", templateId: "T15" }
];
const CONTENT_TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };
function sendFile(res, filePath) { const ext = path.extname(filePath).toLowerCase(); res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream" }); fs.createReadStream(filePath).pipe(res); }
function createStaticServer() { return http.createServer((req, res) => { const requestPath = req.url === "/" ? "/index.html" : req.url || "/index.html"; const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0])); if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end("Forbidden"); return; } if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end("Not found"); return; } sendFile(res, filePath); }); }
async function runCase(page, testCase) { return page.evaluate(async ({ situationId, templateId }) => {
  const waitForReady = () => new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.generateEventPlannerStory && window.__pranaDebug && window.__pranaState && window.__pranaState.libraries && document.querySelector("#situationSelect") && document.querySelector("#situationSelect").options.length > 0) { resolve(); return; }
      if (Date.now() - started > 20000) { reject(new Error("boot timeout")); return; }
      setTimeout(tick, 100);
    };
    tick();
  });
  await waitForReady();
  const request = { situationId, characterId: null };
  const resolved = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
  const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(resolved, request, templateId);
  return {
    situationId,
    forcedTemplateId: templateId,
    actualTemplateId: artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId,
    title: artifacts && artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
    storyText: artifacts && artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
    compressedStory: artifacts && artifacts.compressedStory && artifacts.compressedStory.text,
    compressedStoryWordCount: artifacts && artifacts.compressedStory && artifacts.compressedStory.wordCount,
    storyQA: artifacts && artifacts.storyQAReport && artifacts.storyQAReport.status,
    productionQA: artifacts && artifacts.productionQAReport && artifacts.productionQAReport.status,
    eventLabels: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.events ? artifacts.eventChainResult.events.map((e) => e.label) : [],
    eventActions: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.events ? artifacts.eventChainResult.events.map((e) => ({ label: e.label, action: e.action || e.reinterpretation || "" })) : []
  };
}, testCase); }
const server = createStaticServer();
await new Promise((resolve) => server.listen(PORT, resolve));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
const out = [];
for (const c of CASES) out.push(await runCase(page, c));
console.log(JSON.stringify(out, null, 2));
await browser.close();
server.close();
