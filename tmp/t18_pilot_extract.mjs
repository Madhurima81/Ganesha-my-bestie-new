import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41921;
const CASES = [
  { situationId: "SIT008", templateId: "T18" },
  { situationId: "SIT086", templateId: "T18" },
  { situationId: "SIT101", templateId: "T18" },
  { situationId: "SIT108", templateId: "T18" },
  { situationId: "SIT112", templateId: "T18" },
  { situationId: "SIT101", templateId: "T03" }
];
const CONTENT_TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript; charset=utf-8", ".json": "application/json; charset=utf-8", ".css": "text/css; charset=utf-8", ".svg": "image/svg+xml", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp", ".ico": "image/x-icon" };
function sendFile(res, filePath) { const ext = path.extname(filePath).toLowerCase(); res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream" }); fs.createReadStream(filePath).pipe(res); }
function createStaticServer() { return http.createServer((req, res) => { const requestPath = req.url === "/" ? "/index.html" : req.url || "/index.html"; const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0])); if (!filePath.startsWith(ROOT)) { res.writeHead(403); res.end("Forbidden"); return; } if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end("Not found"); return; } sendFile(res, filePath); }); }
async function runCase(page, testCase) { return page.evaluate(async ({ situationId, templateId }) => {
  const waitForReady = () => new Promise((resolve, reject) => {
    const started = Date.now();
    const tick = () => {
      if (window.generateEventPlannerStory && window.__pranaState && window.__pranaState.libraries && document.querySelector("#situationSelect") && document.querySelector("#situationSelect").options.length > 0) { resolve(); return; }
      if (Date.now() - started > 20000) { reject(new Error("boot timeout")); return; }
      setTimeout(tick, 100);
    };
    tick();
  });
  await waitForReady();
  return window.generateEventPlannerStory(situationId, templateId);
}, testCase); }
const server = createStaticServer();
await new Promise((resolve) => server.listen(PORT, resolve));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
const out = [];
for (const c of CASES) {
  const r = await runCase(page, c);
  out.push({
    situationId: c.situationId,
    forcedTemplateId: c.templateId,
    ok: r.ok,
    templateId: r.templateId,
    storyQA: r.storyQA,
    productionQA: r.productionQA,
    compressionQA: r.compressionQA,
    compressedStoryWordCount: r.compressedStoryWordCount,
    title: r.title,
    storyText: r.storyText,
    compressedStory: r.compressedStory
  });
}
console.log(JSON.stringify(out, null, 2));
await browser.close();
server.close();
