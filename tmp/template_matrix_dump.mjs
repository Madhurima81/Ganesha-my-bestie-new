#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const OUT_PATH = path.resolve(process.cwd(), "tmp", "template_matrix_dump.json");
const PORT = Number(process.env.PORT || "0");
const SITUATION_IDS = (process.env.SITUATION_IDS || "").split(",").map((v) => v.trim()).filter(Boolean);

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  res.writeHead(200, { "Content-Type": CONTENT_TYPES[ext] || "application/octet-stream" });
  fs.createReadStream(filePath).pipe(res);
}

function createStaticServer() {
  return http.createServer((req, res) => {
    const requestPath = req.url === "/" ? "/index.html" : req.url || "/index.html";
    const filePath = path.join(ROOT, decodeURIComponent(requestPath.split("?")[0]));
    if (!filePath.startsWith(ROOT) || !fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    sendFile(res, filePath);
  });
}

async function main() {
  if (!SITUATION_IDS.length) {
    throw new Error("Set SITUATION_IDS to a comma-separated list.");
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  const address = server.address();
  const activePort = address && typeof address === "object" ? address.port : PORT;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`http://127.0.0.1:${activePort}/index.html`, { waitUntil: "networkidle" });
    const results = await page.evaluate(async (situationIds) => {
      const waitForReady = () => new Promise((resolve, reject) => {
        const started = Date.now();
        const tick = () => {
          if (window.__pranaDebug && window.__pranaState && window.__pranaState.libraries && window.__pranaState.storyTemplates) {
            resolve();
            return;
          }
          if (Date.now() - started > 20000) {
            reject(new Error("Boot timeout"));
            return;
          }
          setTimeout(tick, 100);
        };
        tick();
      });

      await waitForReady();
      const out = [];

      for (const situationId of situationIds) {
        const request = { situationId, characterId: null };
        const resolved = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
        window.__pranaState.recipe = resolved;
        const situationSelect = document.getElementById("situationSelect");
        if (situationSelect) situationSelect.value = situationId;
        const runBtn = document.getElementById("runTemplateMatrixBtn");
        runBtn.click();
        const report = window.__lastTemplateMatrixReport;
        const situation = resolved && resolved.context && resolved.context.situation;
        out.push({
          situationId,
          title: situation && situation.title,
          storySeed: situation && situation.storySeed,
          ontology: situation && situation.ontology,
          matrix: report,
        });
      }

      return out;
    }, SITUATION_IDS);

    fs.writeFileSync(OUT_PATH, JSON.stringify(results, null, 2), "utf8");
    console.log(`Wrote ${OUT_PATH}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
