#!/usr/bin/env node
/**
 * Complete pipeline Event Planner regression runner.
 *
 * Serves the real story generator, invokes the actual Event Planner in a
 * headless browser, lints the generated plan against the locked 7F
 * constraints, and only passes when the full pipeline reaches:
 * Form -> Template -> Story Plan -> Event Chain -> Final Story ->
 * Production QA -> 50-70 word compression QA.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { TemplateQaLinter } from "./templateQaLinter.js";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41732;

const CASES = [
  { situationId: "SIT005", templateId: "T03" },
  { situationId: "SIT067", templateId: "T16" },
  { situationId: "SIT111", templateId: "T21" },
  { situationId: "SIT148", templateId: "T22" },
  { situationId: "SIT089", templateId: "T23" },
];
const FILTER = process.env.REGRESSION_CASE || "";

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
  ".ico": "image/x-icon",
};

function sendFile(res, filePath) {
  const ext = path.extname(filePath).toLowerCase();
  const type = CONTENT_TYPES[ext] || "application/octet-stream";
  res.writeHead(200, { "Content-Type": type });
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
          window.__pranaState &&
          window.__pranaState.libraries &&
          window.__pranaState.storyTemplates &&
          document.querySelector("#situationSelect") &&
          document.querySelector("#situationSelect").options.length > 0
        ) {
          resolve();
          return;
        }
        if (Date.now() - started > 20000) {
          reject(new Error("Story generator did not finish booting within 20s."));
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    });

    await waitForReady();
    return window.generateEventPlannerStory(situationId, templateId);
  }, testCase);
}

function passesFullPipeline(result) {
  return Boolean(
    result.generated
    && result.generated.ok
    && result.lint
    && result.lint.valid
    && result.generated.storyQA === "PASS"
    && result.generated.productionQA === "PRODUCTION_READY"
    && result.generated.compressionQA === "PASS"
    && typeof result.generated.compressedStoryWordCount === "number"
    && result.generated.compressedStoryWordCount >= 50
    && result.generated.compressedStoryWordCount <= 70
  );
}

async function main() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });

    const activeCases = FILTER
      ? CASES.filter((testCase) => `${testCase.situationId}_${testCase.templateId}` === FILTER || testCase.situationId === FILTER || testCase.templateId === FILTER)
      : CASES;
    const results = [];
    for (const testCase of activeCases) {
      const generated = await runCase(page, testCase);
      const plan = generated && generated.generatedPlan;
      const lint = plan ? new TemplateQaLinter(plan).lint().getReport() : null;
      results.push({
        ...testCase,
        generated,
        lint,
      });
    }

    console.log("COMPLETE EVENT PLANNER PIPELINE REGRESSION SUITE");
    console.log("Requires actual plan generation, template lint pass, locked final story, production QA, and 50-70 word compression QA.");
    console.log("");

    let failures = 0;
    for (const result of results) {
      const status = passesFullPipeline(result) ? "PASS" : "FAIL";
      if (status !== "PASS") failures += 1;
      console.log(`${result.situationId} -> ${result.templateId}: ${status}`);
      if (status === "PASS") {
        console.log(`  Compression (${result.generated.compressedStoryWordCount} words): ${result.generated.compressedStory}`);
        continue;
      }
      if (!result.generated) {
        console.log("  No generated payload returned.");
        continue;
      }
      if (!result.generated.ok) {
        console.log(`  Final story gate failed: ${result.generated.reason}`);
      }
      if (!(result.lint && result.lint.valid)) {
        console.log(`  Template lint failed: ${result.lint ? result.lint.errors.join(" | ") : "no lint report"}`);
      }
      if (result.generated.storyQA !== "PASS") {
        console.log(`  Story QA: ${result.generated.storyQA}`);
      }
      if (result.generated.productionQA !== "PRODUCTION_READY") {
        console.log(`  Production QA: ${result.generated.productionQA}`);
      }
      if (result.generated.compressionQA !== "PASS") {
        console.log(`  Compression QA: ${result.generated.compressionQA}`);
      }
      if (typeof result.generated.compressedStoryWordCount === "number") {
        console.log(`  Compression words: ${result.generated.compressedStoryWordCount}`);
      }
      if (result.generated.compressedStory) {
        console.log(`  Compression text: ${result.generated.compressedStory}`);
      }
    }

    console.log("");
    console.log(`Summary: ${results.length - failures}/${results.length} complete pipeline regressions passed.`);
    process.exitCode = failures ? 1 : 0;
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
