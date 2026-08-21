#!/usr/bin/env node
import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41961;
const CASES = [
  { situationId: "SIT009", templateId: "T09" },
  { situationId: "SIT019", templateId: "T09" },
  { situationId: "SIT029", templateId: "T09" },
  { situationId: "SIT030", templateId: "T09" }
];
const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".ico": "image/x-icon"
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
    if (!filePath.startsWith(ROOT)) {
      res.writeHead(403);
      res.end("Forbidden");
      return;
    }
    if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
      res.writeHead(404);
      res.end("Not found");
      return;
    }
    sendFile(res, filePath);
  });
}

async function runCase(page, testCase) {
  return page.evaluate(async ({ situationId, templateId }) => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (
          window.generateEventPlannerStory &&
          window.__pranaDebug &&
          window.__pranaState &&
          window.__pranaState.libraries &&
          document.querySelector("#situationSelect") &&
          document.querySelector("#situationSelect").options.length > 0
        ) {
          resolve();
          return;
        }
        if (Date.now() - started > 20000) {
          reject(new Error("boot timeout"));
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    });
    await waitForReady();
    const request = { situationId, characterId: null };
    const resolved = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
    const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(resolved, request, templateId);
    const pages = artifacts && artifacts.lockedFinalStory && artifacts.lockedFinalStory.pages
      ? artifacts.lockedFinalStory.pages.map((item) => item.text).join("\n\n")
      : "";
    return {
      situationId,
      actualTemplateId: artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId,
      title: artifacts && artifacts.lockedFinalStory && artifacts.lockedFinalStory.metadata && artifacts.lockedFinalStory.metadata.title,
      storyText: pages,
      compressedStory: artifacts && artifacts.compressedStory && artifacts.compressedStory.text,
      storyQA: artifacts && artifacts.storyQAReport && artifacts.storyQAReport.status,
      productionQA: artifacts && artifacts.productionQAReport && artifacts.productionQAReport.status,
      eventLabels: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.events
        ? artifacts.eventChainResult.events.map((e) => e.label)
        : [],
      eventActions: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.events
        ? artifacts.eventChainResult.events.map((e) => ({ label: e.label, action: e.action || "" }))
        : [],
      realizedWant: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.ctx && artifacts.eventChainResult.ctx.realizedSituation
        ? artifacts.eventChainResult.ctx.realizedSituation.want
        : "",
      falseBelief: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.ctx
        ? artifacts.eventChainResult.ctx.falseBelief
        : "",
      trueBelief: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.ctx
        ? artifacts.eventChainResult.ctx.trueBelief
        : ""
    };
  }, testCase);
}

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
