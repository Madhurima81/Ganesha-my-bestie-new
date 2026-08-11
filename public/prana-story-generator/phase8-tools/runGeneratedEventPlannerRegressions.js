#!/usr/bin/env node
/**
 * Generated Event Planner regression runner.
 *
 * Serves the real story generator, invokes the actual Event Planner in a
 * headless browser, and lints the generated event-chain plans against the
 * locked 7F constraints.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";
import { TemplateQaLinter } from "./templateQaLinter.js";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41731;

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
        ok: Boolean(generated && generated.ok),
        generated,
        lint,
      });
    }

    console.log("GENERATED EVENT PLANNER REGRESSION SUITE");
    console.log("Runs the actual Event Planner, then lints the generated plan.");
    console.log("");

    let failures = 0;
    for (const result of results) {
      const status = result.lint && result.lint.valid ? "PASS" : "FAIL";
      if (status !== "PASS") failures += 1;
      console.log(`${result.situationId} -> ${result.templateId}: ${status}`);
      if (!result.generated) {
        console.log("  No generated payload returned.");
        continue;
      }
      if (!result.generated.ok) {
        console.log(`  Event Planner did not reach final story: ${result.generated.reason}`);
      }
      if (result.generated.eventChainValidation && result.generated.eventChainValidation.issues && result.generated.eventChainValidation.issues.length) {
        console.log(`  Event Planner validation: ${result.generated.eventChainValidation.issues.join(" | ")}`);
      }
      if (!result.lint && result.generated.generatedPlan) {
        console.log(`  Generated plan was returned but linter was not constructed.`);
      }
      if (result.lint && result.lint.errors.length) {
        console.log(`  Linter errors: ${result.lint.errors.join(" | ")}`);
      }
      if (result.lint && result.lint.warnings.length) {
        console.log(`  Linter warnings: ${result.lint.warnings.join(" | ")}`);
      }
      if (status !== "PASS") {
        console.log(`  Generated plan snapshot: ${JSON.stringify(result.generated.generatedPlan || null)}`);
        console.log(`  Generated payload snapshot: ${JSON.stringify(result.generated)}`);
      }
    }

    console.log("");
    console.log(`Summary: ${results.length - failures}/${results.length} generated regressions passed.`);
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
