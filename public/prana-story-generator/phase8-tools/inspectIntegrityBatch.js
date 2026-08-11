#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41733;
const CASES = ["SIT040", "SIT060", "SIT132", "SIT133", "SIT137", "SIT141", "SIT148", "SIT157"];

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
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });
    const results = await page.evaluate(async (caseIds) => {
      const waitForReady = () => new Promise((resolve, reject) => {
        const started = Date.now();
        const tick = () => {
          if (window.__pranaDebug && window.__pranaState && window.__pranaState.libraries) {
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
      return caseIds.map((situationId) => {
        const request = { situationId, characterId: null };
        const result = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
        return {
          situationId,
          status: result.status,
          title: result.context && result.context.situation && result.context.situation.title,
          characterId: result.context && result.context.character && result.context.character.id,
          characterName: result.context && result.context.character && result.context.character.name,
          missionId: result.context && result.context.mission && result.context.mission.id,
          logicId: result.context && result.context.logic && result.context.logic.id,
          warnings: (result.issues || []).filter((issue) => issue.severity === "WARNING").map((issue) => issue.message),
          failures: (result.issues || []).filter((issue) => issue.severity === "FAIL").map((issue) => issue.message),
        };
      });
    }, CASES);

    console.log(JSON.stringify(results, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
