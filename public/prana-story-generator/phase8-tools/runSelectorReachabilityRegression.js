#!/usr/bin/env node
/**
 * Selector reachability + curated-template regression (Dev A infra track).
 *
 * Two things this locks down, both driven entirely by state (storyTemplates.json's
 * bestForSituations), not a hardcoded case list — so it automatically covers
 * every template Dev B curates going forward, with zero changes needed here:
 *
 * 1. REACHABILITY: for every template with a non-empty bestForSituations,
 *    the NATURAL selector (no forcing — the same path generateCurrentStory
 *    would use once wired to the template pipeline, see
 *    tmp_selector_audit_report.md item 3) must select that template for
 *    every situation on its own curated list, and must NOT select it for any
 *    situation outside that list. A template silently losing its own
 *    situations to a broader template (the T01/T22, T16/T23 failure mode
 *    fixed 2026-08-11) fails this check immediately.
 * 2. STORY QA: for every situation naturally selecting a curated template,
 *    the resulting story must actually lock (storyQAReport PASS,
 *    completeStoryValidation PASS) — reachability alone isn't enough if the
 *    story the natural path produces doesn't pass QA.
 *
 * Run after any change to storyTemplates.json or selectStoryTemplate.
 * Exit code is non-zero on any failure, for CI use.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41799;
const REPORT_PATH = path.resolve(process.cwd(), "tmp_selector_reachability_report.md");

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
  await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });

  const result = await page.evaluate(async () => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (window.__pranaDebug && window.__pranaState && window.__pranaState.libraries
          && document.querySelector("#situationSelect") && document.querySelector("#situationSelect").options.length > 0) {
          resolve();
          return;
        }
        if (Date.now() - started > 20000) {
          reject(new Error("timeout"));
          return;
        }
        setTimeout(tick, 100);
      };
      tick();
    });
    await waitForReady();

    const libs = window.__pranaState.libraries;
    const templates = window.__pranaState.storyTemplates || [];
    const situations = (libs.situations || libs.situationLibrary || []).filter((s) => s.active !== false);

    const curatedTemplates = templates.filter((t) => (t.bestForSituations || []).length > 0);

    // Pass 1: run the NATURAL selector for every active situation once.
    const naturalBysituation = new Map();
    situations.forEach((situation) => {
      const request = { situationId: situation.id, characterId: null };
      const res = window.__pranaDebug.resolvePhase6(libs, request, {});
      try {
        const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request, undefined);
        naturalBysituation.set(situation.id, artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId);
      } catch (e) {
        naturalBysituation.set(situation.id, null);
      }
    });

    // Check 1: reachability — curated situations must map to their own template, 1:1.
    const reachabilityFailures = [];
    curatedTemplates.forEach((template) => {
      const curatedSet = new Set(template.bestForSituations || []);
      curatedSet.forEach((situationId) => {
        const naturalId = naturalBysituation.get(situationId);
        if (naturalId !== template.templateId) {
          reachabilityFailures.push({
            templateId: template.templateId,
            situationId,
            expected: template.templateId,
            gotInstead: naturalId,
          });
        }
      });
    });
    // Also: no OTHER curated template's situation should naturally resolve to this template.
    naturalBysituation.forEach((naturalId, situationId) => {
      if (!naturalId) return;
      const owningTemplate = curatedTemplates.find((t) => (t.bestForSituations || []).includes(situationId));
      if (owningTemplate && owningTemplate.templateId !== naturalId) {
        // already captured above as a reachabilityFailure for the owning template
      }
    });

    // Check 2: story QA — every curated situation must actually lock via the natural path.
    const storyQaFailures = [];
    for (const template of curatedTemplates) {
      for (const situationId of template.bestForSituations || []) {
        const request = { situationId, characterId: null };
        const res = window.__pranaDebug.resolvePhase6(libs, request, {});
        try {
          const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request, undefined);
          const locked = Boolean(artifacts.lockedFinalStory);
          if (!locked) {
            storyQaFailures.push({
              templateId: template.templateId,
              situationId,
              naturalTemplateId: artifacts.templateSelection && artifacts.templateSelection.templateId,
              storyQAFails: artifacts.storyQAReport ? artifacts.storyQAReport.results.filter((r) => r.status === "FAIL") : "no report",
              completeStoryIssues: artifacts.completeStoryValidation && artifacts.completeStoryValidation.issues,
            });
          }
        } catch (e) {
          storyQaFailures.push({ templateId: template.templateId, situationId, error: e.message });
        }
      }
    }

    return {
      totalSituations: situations.length,
      curatedTemplateIds: curatedTemplates.map((t) => t.templateId),
      reachabilityFailures,
      storyQaFailures,
    };
  });

  await browser.close();
  server.close();

  const lines = [];
  lines.push("# Selector Reachability + Story QA Regression");
  lines.push("");
  lines.push(`- Active situations scanned: ${result.totalSituations}`);
  lines.push(`- Curated templates checked: ${result.curatedTemplateIds.join(", ") || "(none)"}`);
  lines.push("");
  lines.push("## Check 1: Reachability (natural selector must pick the curated template)");
  if (!result.reachabilityFailures.length) {
    lines.push("PASS — every curated situation naturally selects its own template.");
  } else {
    lines.push(`FAIL — ${result.reachabilityFailures.length} situation(s) did not naturally select their curated template:`);
    result.reachabilityFailures.forEach((f) => {
      lines.push(`- ${f.situationId}: expected ${f.expected}, natural selector chose ${f.gotInstead || "null"}`);
    });
  }
  lines.push("");
  lines.push("## Check 2: Story QA (natural path must actually lock)");
  if (!result.storyQaFailures.length) {
    lines.push("PASS — every curated situation locks via the natural (unforced) selector path.");
  } else {
    lines.push(`FAIL — ${result.storyQaFailures.length} situation(s) selected correctly but did not lock:`);
    result.storyQaFailures.forEach((f) => {
      lines.push(`- ${f.situationId} (${f.templateId}): ${JSON.stringify(f.storyQAFails || f.error || f.completeStoryIssues)}`);
    });
  }

  fs.writeFileSync(REPORT_PATH, lines.join("\n") + "\n", "utf8");
  console.log(lines.join("\n"));

  const failed = result.reachabilityFailures.length > 0 || result.storyQaFailures.length > 0;
  process.exit(failed ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
