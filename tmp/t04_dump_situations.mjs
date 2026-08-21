#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41951;
const TYPES = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".json": "application/json",
  ".css": "text/css"
};

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
    res.writeHead(200, { "Content-Type": TYPES[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });

  const data = await page.evaluate(async () => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (
          window.__pranaDebug &&
          window.__pranaDebug.resolvePhase6 &&
          window.__pranaState &&
          window.__pranaState.libraries &&
          document.querySelector("#situationSelect") &&
          document.querySelector("#situationSelect").options.length > 0
        ) {
          resolve();
          return;
        }
        if (Date.now() - started > 45000) {
          reject(new Error("timeout"));
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    });
    await waitForReady();

    const libs = window.__pranaState.libraries;
    const situations = (libs.situations || libs.situationLibrary || []).filter((s) => s.active !== false);
    const out = [];
    for (const situation of situations) {
      const request = { situationId: situation.id, characterId: null };
      const result = window.__pranaDebug.resolvePhase6(libs, request, {});
      const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, null);
      const templateId = artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId;
      const ctx = result && result.context;
      if (templateId === "T04") {
        out.push({
          id: situation.id,
          title: situation.title,
          storySeed: situation.storySeed,
          narrativeSummarySentences: ctx && ctx.narrativeSummarySentences
        });
      }
    }
    return out;
  });

  fs.writeFileSync(path.resolve(process.cwd(), "tmp_t04_situations.json"), JSON.stringify(data, null, 2), "utf8");
  console.log("count", data.length);
  await browser.close();
  server.close();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
