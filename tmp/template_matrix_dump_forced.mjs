#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const OUT_PATH = path.resolve(process.cwd(), "tmp", "template_matrix_forced_dump.json");
const PORT = Number(process.env.PORT || "0");
const CASES = JSON.parse(process.env.CASES_JSON || "[]");

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
  if (!CASES.length) {
    throw new Error("Set CASES_JSON to a JSON array of { situationId, templateId }.");
  }

  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));
  const address = server.address();
  const activePort = address && typeof address === "object" ? address.port : PORT;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`http://127.0.0.1:${activePort}/index.html`, { waitUntil: "networkidle" });
    const results = await page.evaluate(async (casesToRun) => {
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
      const characterId = window.__pranaState.characters && window.__pranaState.characters[0] && window.__pranaState.characters[0].id;

      for (const item of casesToRun) {
        const request = { situationId: item.situationId, characterId };
        const resolved = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
        const artifacts = window.__pranaDebug.buildStoryArtifactsWithTemplate(resolved, request, item.templateId);
        out.push({
          situationId: item.situationId,
          templateId: item.templateId,
          title: resolved && resolved.context && resolved.context.situation && resolved.context.situation.title,
          matrixRun: {
            templateId: item.templateId,
            situationId: resolved && resolved.context && resolved.context.situation && resolved.context.situation.id,
            characterId: resolved && resolved.context && resolved.context.character && resolved.context.character.id,
            preAssertion: artifacts.templatePreAssertion && artifacts.templatePreAssertion.status,
            preAssertionIssues: (artifacts.templatePreAssertion && artifacts.templatePreAssertion.issues) || [],
            postAssertion: artifacts.templatePostAssertion && artifacts.templatePostAssertion.status,
            postAssertionIssues: (artifacts.templatePostAssertion && artifacts.templatePostAssertion.issues) || [],
            completeStoryValidation: artifacts.completeStoryValidation && artifacts.completeStoryValidation.status,
            storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
            storyQAErrors: (artifacts.storyQAReport && artifacts.storyQAReport.errors || []).map((error) => error.ruleId),
            productionQA: artifacts.productionQAReport && artifacts.productionQAReport.status,
            title: artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
            storyText: artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
          },
        });
      }

      return out;
    }, CASES);

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
