#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41913;
const situationId = process.env.SITUATION_ID || "SIT098";
const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };

async function main() {
  const server = http.createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : req.url || "/index.html";
    const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0]));
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) { res.writeHead(404); res.end(); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { "Content-Type": types[ext] || "application/octet-stream" });
    fs.createReadStream(filePath).pipe(res);
  });
  await new Promise((resolve) => server.listen(PORT, resolve));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });

  const data = await page.evaluate(async (sid) => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (window.__pranaDebug && window.__pranaState && window.__pranaState.libraries) { resolve(); return; }
        if (Date.now() - started > 20000) { reject(new Error("timeout")); return; }
        setTimeout(tick, 100);
      };
      tick();
    });
    await waitForReady();
    const request = { situationId: sid, characterId: null };
    const result = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
    const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, "T18");
    const pages = artifacts && artifacts.polishedManuscript && artifacts.polishedManuscript.pages
      ? artifacts.polishedManuscript.pages.map((p) => p.text) : null;
    return {
      events: artifacts.eventChainResult.events.map(e => ({ label: e.label, action: e.action })),
      pages,
      storyText: artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
      storyQAReport: artifacts.storyQAReport,
    };
  }, situationId);

  console.log(JSON.stringify(data, null, 2));
  await browser.close();
  server.close();
}

main().catch((e) => { console.error(e); process.exit(1); });
