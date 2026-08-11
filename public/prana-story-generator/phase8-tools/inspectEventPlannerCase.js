#!/usr/bin/env node

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = Number(process.env.PORT || "0");
const situationId = process.env.SITUATION_ID || "SIT148";
const templateId = process.env.TEMPLATE_ID || "T22";

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
  const address = server.address();
  const activePort = address && typeof address === "object" ? address.port : PORT;
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();
  try {
    await page.goto(`http://127.0.0.1:${activePort}/index.html`, { waitUntil: "networkidle" });
    const result = await page.evaluate(async ({ situationId, templateId }) => {
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
      const request = { situationId, characterId: null };
      const result = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
      const storyBlueprint = window.__pranaDebug.buildStoryBlueprint(result, request);
      const storyPlan = storyBlueprint ? window.__pranaDebug.buildStoryPlan(storyBlueprint, window.__pranaState.libraries) : null;
      const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, templateId);
      return {
        resolveStatus: result && result.status,
        resolveIssues: result && result.issues,
        contextSituation: result && result.context && result.context.situation && result.context.situation.title,
        contextCharacter: result && result.context && result.context.character && result.context.character.id,
        contextNeed: result && result.context && result.context.need && result.context.need.id,
        contextBelief: result && result.context && result.context.belief,
        blueprintId: storyBlueprint && storyBlueprint.blueprintId,
        blueprintBelief: storyBlueprint && storyBlueprint.belief,
        storyPlanExists: Boolean(storyPlan),
        storyPlanStoryFlow: storyPlan && storyPlan.storyFlow,
        forcedTemplateSelection: artifacts && artifacts.templateSelection,
        eventChainResult: artifacts && artifacts.eventChainResult,
        eventChainValidation: artifacts && artifacts.eventChainValidation,
        completeStoryValidation: artifacts && artifacts.completeStoryValidation,
        pageValidation: artifacts && artifacts.pageValidation,
        narrationValidation: artifacts && artifacts.narrationValidation,
        dialogueValidation: artifacts && artifacts.dialogueValidation,
        polishValidation: artifacts && artifacts.polishValidation,
        storyQAReport: artifacts && artifacts.storyQAReport,
        lockedFinalStory: artifacts && artifacts.lockedFinalStory,
        productionQAReport: artifacts && artifacts.productionQAReport,
      };
    }, { situationId, templateId });

    console.log(JSON.stringify(result, null, 2));
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
