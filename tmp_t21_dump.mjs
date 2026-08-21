import { chromium } from "playwright";
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41771;
const types = {".html":"text/html",".js":"text/javascript",".json":"application/json",".css":"text/css"};
const server = http.createServer((req, res) => {
  const requestPath = req.url === "/" ? "/index.html" : req.url || "/index.html";
  const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0]));
  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end(); return; }
  const ext = path.extname(filePath);
  res.writeHead(200, {"Content-Type": types[ext] || "application/octet-stream"});
  fs.createReadStream(filePath).pipe(res);
});
await new Promise(r => server.listen(PORT, r));
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
const CASES = ["SIT006","SIT111","SIT118","SIT120","SIT164","SIT157"];
let out = "# T21 — Full Blind Read — 6 Story Dump\n\n---\n";
for (const sid of CASES) {
  const r = await page.evaluate(async (input) => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (window.__pranaDebug && window.__pranaState && window.__pranaState.libraries && document.querySelector("#situationSelect") && document.querySelector("#situationSelect").options.length > 0) { resolve(); return; }
        if (Date.now() - started > 20000) { reject(new Error("timeout")); return; }
        setTimeout(tick, 100);
      };
      tick();
    });
    await waitForReady();
    const request = { situationId: input.situationId, characterId: null };
    const res = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
    const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request, "T21");
    const fails = artifacts.storyQAReport ? artifacts.storyQAReport.results.filter(x => x.status === "FAIL") : "no report";
    const pages = (artifacts.lockedFinalStory && artifacts.lockedFinalStory.pages) || [];
    return {
      locked: Boolean(artifacts.lockedFinalStory),
      fails,
      pages: pages.map(p => p.text || p),
      compression: artifacts.compressedStory && artifacts.compressedStory.text,
      falseBelief: res.ctx && res.ctx.falseBelief,
      trueBelief: res.ctx && res.ctx.trueBelief,
      title: res.situation && (res.situation.title || res.situation.name || res.situation.label),
    };
  }, { situationId: sid });
  out += `\n## ${sid} — "${r.title || ""}" (locked=${r.locked})\n\n`;
  if (r.fails && r.fails.length) {
    out += `**FAILS:** ${JSON.stringify(r.fails)}\n\n`;
  }
  (r.pages || []).forEach((t, i) => { out += `**Page ${i+1}:** ${t}\n\n`; });
  out += `\n**Compression:** ${r.compression}\n\n---\n`;
}
fs.writeFileSync(path.resolve(process.cwd(), "tmp_t21_story_read.md"), out, "utf8");
console.log("written");
await browser.close();
server.close();
