#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41912;
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };

async function main() {
  const server = http.createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : req.url || "/index.html";
    const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0]));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end();
      return;
    }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  page.on("console", (m) => console.log("PAGE:", m.text()));
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });

  const data = await page.evaluate(async () => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (window.__pranaDebug && window.__pranaDebug.resolvePhase6 && window.__pranaState && window.__pranaState.libraries
          && document.querySelector("#situationSelect") && document.querySelector("#situationSelect").options.length > 0) {
          resolve();
          return;
        }
        if (Date.now() - started > 20000) { reject(new Error("timeout")); return; }
        setTimeout(tick, 100);
      };
      tick();
    });
    await waitForReady();

    const libs = window.__pranaState.libraries;
    const situations = (libs.situations || libs.situationLibrary || []).filter((s) => s.active !== false);
    const targetIds = ["SIT002", "SIT101", "SIT015", "SIT001", "SIT098", "SIT104", "SIT136"];
    const out = [];
    for (const situation of situations) {
      if (!targetIds.includes(situation.id)) continue;
      const request = { situationId: situation.id, characterId: null };
      const result = window.__pranaDebug.resolvePhase6(libs, request, {});
      const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, null);
      const templateId = artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId;
      const story = artifacts && artifacts.completeStoryMaster;
      out.push({
        id: situation.id,
        templateId,
        beatTexts: story && story.beatTexts,
      });
    }
    return out;
  });

  fs.writeFileSync(path.resolve(process.cwd(), "tmp_t18_samples.json"), JSON.stringify(data, null, 2), "utf8");
  console.log("done", data.length);
  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
