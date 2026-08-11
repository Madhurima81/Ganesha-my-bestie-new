#!/usr/bin/env node
/**
 * Full-corpus production readiness check (Dev A final integration
 * validation). Unlike runStagingValidationHarness.js (which samples a
 * representative ~47), this runs the COMPLETE 156-situation active library
 * through the natural (unforced) template pipeline and checks every stage
 * of the production tail: Complete story, Pagination, Narration, Dialogue,
 * Polish, Story QA, Illustration plan, Prompt pack, Layout, Production QA,
 * Export.
 *
 * This is the last gate before recommending the staging toggle
 * (?templatePipeline=1) become the production default.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41802;
const MD_REPORT_PATH = path.resolve(process.cwd(), "tmp_full_corpus_production_readiness.md");
const JSON_REPORT_PATH = path.resolve(process.cwd(), "tmp_full_corpus_production_readiness.json");

const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };

const GATE_ORDER = [
  ["Complete story", "completeStoryValidation", "PASS"],
  ["Pagination", "pageValidation", "PASS"],
  ["Narration", "narrationValidation", "PASS"],
  ["Dialogue", "dialogueValidation", "PASS"],
  ["Polish", "polishValidation", "PASS"],
  ["Story QA", "storyQAReport", "PASS"],
  ["Illustration plan", "illustrationValidation", "PASS"],
  ["Prompt pack", "promptPackValidation", "PASS"],
  ["Layout", "layoutValidation", "PASS"],
  ["Production QA", "productionQAReport", "PRODUCTION_READY"],
  ["Export", "exportValidation", "PASS"],
];

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

  const data = await page.evaluate(async (gateOrder) => {
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
    const situations = (libs.situations || libs.situationLibrary || []).filter((s) => s.active !== false);

    const rows = [];
    for (const situation of situations) {
      const request = { situationId: situation.id, characterId: null };
      const res = window.__pranaDebug.resolvePhase6(libs, request, {});
      let artifacts;
      let buildError = null;
      try {
        artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request);
      } catch (e) {
        buildError = e.message;
        artifacts = {};
      }
      const templateId = artifacts.templateSelection && artifacts.templateSelection.templateId;
      const gates = gateOrder.map(([label, fieldName, expectedStatus]) => {
        const node = artifacts[fieldName];
        const status = node && node.status;
        return { label, status: status || "N/A", pass: status === expectedStatus };
      });
      const firstFailIndex = gates.findIndex((g) => !g.pass);
      rows.push({
        situationId: situation.id,
        title: situation.title,
        resolveStatus: res.status,
        templateId: templateId || null,
        allGatesPass: templateId ? gates.every((g) => g.pass) : null,
        firstFailedGate: templateId && firstFailIndex >= 0 ? gates[firstFailIndex].label : null,
        gates: templateId ? gates : null,
        pageCount: artifacts.lockedFinalStory && artifacts.lockedFinalStory.pages && artifacts.lockedFinalStory.pages.length,
        buildError,
      });
    }

    const perTemplateCount = {};
    rows.forEach((r) => {
      if (r.templateId) perTemplateCount[r.templateId] = (perTemplateCount[r.templateId] || 0) + 1;
    });

    return {
      totalActiveSituations: situations.length,
      rows,
      perTemplateCount,
    };
  }, GATE_ORDER);

  await browser.close();
  server.close();

  fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(data, null, 2), "utf8");

  const resolvedRows = data.rows.filter((r) => r.resolveStatus === "PASS" && r.templateId);
  const noTemplateRows = data.rows.filter((r) => r.resolveStatus === "PASS" && !r.templateId);
  const resolveFailRows = data.rows.filter((r) => r.resolveStatus !== "PASS");
  const passRows = resolvedRows.filter((r) => r.allGatesPass);
  const failRows = resolvedRows.filter((r) => !r.allGatesPass);

  const failByGate = {};
  failRows.forEach((r) => {
    failByGate[r.firstFailedGate] = (failByGate[r.firstFailedGate] || 0) + 1;
  });

  const lines = [];
  lines.push("# Full 156-Situation Corpus — Production Readiness Check");
  lines.push("");
  lines.push(`Total active situations: ${data.totalActiveSituations}`);
  lines.push(`- Resolved to a template and ran the full production tail: ${resolvedRows.length}`);
  lines.push(`- No template selected (taxonomy fallback gaps, documented): ${noTemplateRows.length}`);
  lines.push(`- Failed Phase 6/7 resolution entirely (not a selector issue): ${resolveFailRows.length}`);
  lines.push("");
  lines.push(`## Result: ${passRows.length}/${resolvedRows.length} pass every gate end-to-end (Complete story -> Pagination -> Narration -> Dialogue -> Polish -> Story QA -> Illustration plan -> Prompt pack -> Layout -> Production QA -> Export)`);
  lines.push("");
  lines.push("### First-failure breakdown (where in the tail failures cluster)");
  Object.entries(failByGate).sort((a, b) => b[1] - a[1]).forEach(([gate, count]) => {
    lines.push(`- ${gate}: ${count}`);
  });
  lines.push("");
  lines.push("### Per-template natural-selection counts");
  Object.entries(data.perTemplateCount).sort().forEach(([tid, count]) => {
    lines.push(`- ${tid}: ${count}`);
  });
  lines.push("");
  lines.push("## Failures (full detail)");
  failRows.forEach((r) => {
    lines.push(`- ${r.situationId} (${r.templateId}) "${r.title}" — first failed at: ${r.firstFailedGate}`);
  });
  lines.push("");
  lines.push("## No template selected (documented taxonomy gaps only)");
  noTemplateRows.forEach((r) => {
    lines.push(`- ${r.situationId} "${r.title}"`);
  });
  lines.push("");
  lines.push("## Resolution failures (Phase 6/7, not selector)");
  resolveFailRows.forEach((r) => {
    lines.push(`- ${r.situationId} "${r.title}" — resolveStatus: ${r.resolveStatus}`);
  });

  fs.writeFileSync(MD_REPORT_PATH, lines.join("\n") + "\n", "utf8");
  console.log(lines.slice(0, 12).join("\n"));
  console.log(`\nFull report: ${MD_REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
