#!/usr/bin/env node
/**
 * Staging validation harness (Dev A infra track).
 *
 * Runs a representative set of situations through the COMPLETE template
 * pipeline exactly as a real user would hit it with the staging toggle on
 * (buildStoryArtifactsWithEventPlanner, natural selectStoryTemplate, no
 * forced template — never the QA-only forced path), and reports, per
 * situation:
 *
 *   situation -> selected template -> realization family -> every QA gate -> export -> final story
 *
 * This is the evidence gate before the template pipeline toggle
 * (state.useTemplatePipelineOverride / ?templatePipeline=1) becomes the
 * default for real users. It does not change any generation behavior; it
 * only observes and reports.
 *
 * Representative set = every curated situation (T16/T21/T22/T23, so their
 * realization families get exercised) + one situation per every OTHER
 * template the natural selector currently reaches at least once (T01-T15,
 * T17-T20 minus whichever are still fully orphaned) + the known
 * zero-tier-fallback situations (SAFETY/CONTENTMENT/AUTONOMY, see
 * tmp_dev_a_infra_report.md item 2) so the dashboard also shows what
 * "still needs a template" looks like, not just the successes.
 *
 * Outputs:
 *   - tmp_staging_validation_report.md  (human-readable table + detail)
 *   - tmp_staging_validation_report.json (raw data, for the HTML dashboard)
 *
 * Run after any storyTemplates.json curation change, or before flipping the
 * staging toggle for a broader real-traffic test.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41798;
const MD_REPORT_PATH = path.resolve(process.cwd(), "tmp_staging_validation_report.md");
const JSON_REPORT_PATH = path.resolve(process.cwd(), "tmp_staging_validation_report.json");

const types = { ".html": "text/html", ".js": "text/javascript", ".json": "application/json", ".css": "text/css" };

// Field name (on the artifacts object) + expected status per gate, in
// summarizeArtifactReadiness's own order. Kept as data (not getter
// functions) because this whole list crosses the page.evaluate() boundary,
// which drops functions silently — a getter-based version here would look
// fine locally and throw at runtime inside the browser context.
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
    const templates = window.__pranaState.storyTemplates || [];
    const situations = (libs.situations || libs.situationLibrary || []).filter((s) => s.active !== false);

    // Build the representative set: every curated situation, plus one
    // situation per every other template the natural selector reaches at
    // least once, plus the known zero-tier fallback situations.
    const curatedSituationIds = new Set();
    templates.forEach((t) => (t.bestForSituations || []).forEach((sid) => curatedSituationIds.add(sid)));

    const naturalByTemplate = new Map();
    const naturalBySituation = new Map();
    for (const situation of situations) {
      const request = { situationId: situation.id, characterId: null };
      const res = window.__pranaDebug.resolvePhase6(libs, request, {});
      try {
        const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request);
        const tid = artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId;
        naturalBySituation.set(situation.id, tid);
        if (tid && !naturalByTemplate.has(tid)) naturalByTemplate.set(tid, situation.id);
      } catch (e) {
        naturalBySituation.set(situation.id, null);
      }
    }

    const zeroTierFallbackIds = situations
      .filter((s) => {
        const needId = s.ontology && s.ontology.needId;
        if (!needId) return false;
        const inAnyTemplate = templates.some((t) => (t.bestForNeeds || []).includes(needId));
        return !inAnyTemplate;
      })
      .slice(0, 3)
      .map((s) => s.id);

    const representativeIds = new Set([
      ...curatedSituationIds,
      ...naturalByTemplate.values(),
      ...zeroTierFallbackIds,
    ]);

    const modeDetectors = {
      T16: window.__pranaDebug.detectT16RealizationMode,
      T21: window.__pranaDebug.detectT21RealizationMode,
      T22: window.__pranaDebug.detectT22RealizationMode,
      T23: window.__pranaDebug.detectT23RealizationMode,
    };

    const rows = [];
    for (const situationId of representativeIds) {
      const situation = situations.find((s) => s.id === situationId);
      const request = { situationId, characterId: null };
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
      let realizationFamily = "N/A (generic Phase-7 event chain — no per-mechanism realization modes authored for this template yet)";
      if (templateId && modeDetectors[templateId] && artifacts.eventChainResult && artifacts.eventChainResult.ctx) {
        try {
          realizationFamily = modeDetectors[templateId](artifacts.eventChainResult.ctx);
        } catch (e) {
          realizationFamily = `error detecting mode: ${e.message}`;
        }
      }
      rows.push({
        situationId,
        title: situation && situation.title,
        curated: curatedSituationIds.has(situationId),
        isZeroTierFallback: zeroTierFallbackIds.includes(situationId),
        needId: situation && situation.ontology && situation.ontology.needId,
        templateId: templateId || null,
        templateName: artifacts.templateSelection && artifacts.templateSelection.templateName,
        selectionReason: artifacts.templateSelection && artifacts.templateSelection.selectionReason,
        realizationFamily,
        gates,
        allGatesPass: gates.every((g) => g.pass),
        pageCount: artifacts.lockedFinalStory && artifacts.lockedFinalStory.pages && artifacts.lockedFinalStory.pages.length,
        compression: artifacts.compressedStory && artifacts.compressedStory.text,
        buildError,
      });
    }

    return {
      totalActiveSituations: situations.length,
      representativeCount: rows.length,
      rows,
    };
  }, GATE_ORDER);

  await browser.close();
  server.close();

  fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(data, null, 2), "utf8");

  const lines = [];
  lines.push("# Staging Validation Harness — Template Pipeline End-to-End");
  lines.push("");
  lines.push(`Situations scanned: ${data.totalActiveSituations} active. Representative set run through the complete pipeline: ${data.representativeCount}.`);
  lines.push("");
  lines.push("| Situation | Need | Selected Template | Realization Family | All Gates | Pages |");
  lines.push("|---|---|---|---|---|---|");
  data.rows
    .sort((a, b) => (a.templateId || "").localeCompare(b.templateId || "") || a.situationId.localeCompare(b.situationId))
    .forEach((r) => {
      const tag = r.curated ? " (curated)" : r.isZeroTierFallback ? " (fallback gap)" : "";
      lines.push(`| ${r.situationId}${tag} | ${r.needId || "—"} | ${r.templateId || "NONE"} | ${r.realizationFamily} | ${r.allGatesPass ? "PASS" : "FAIL"} | ${r.pageCount || 0} |`);
    });
  lines.push("");
  lines.push("## Detail");
  data.rows.forEach((r) => {
    lines.push("");
    lines.push(`### ${r.situationId} — "${r.title}"`);
    lines.push(`- Need: ${r.needId || "—"}`);
    lines.push(`- Selected template: ${r.templateId || "NONE"} (${r.templateName || "n/a"})`);
    lines.push(`- Selection reason: ${r.selectionReason || "n/a"}`);
    lines.push(`- Realization family: ${r.realizationFamily}`);
    lines.push(`- Gates: ${r.gates.map((g) => `${g.label}=${g.pass ? "PASS" : g.status}`).join(", ")}`);
    lines.push(`- Final story pages: ${r.pageCount || 0}`);
    if (r.compression) lines.push(`- Compression: ${r.compression}`);
    if (r.buildError) lines.push(`- BUILD ERROR: ${r.buildError}`);
  });

  fs.writeFileSync(MD_REPORT_PATH, lines.join("\n") + "\n", "utf8");
  console.log(`Wrote ${MD_REPORT_PATH} and ${JSON_REPORT_PATH}`);
  console.log(`${data.rows.filter((r) => r.allGatesPass).length}/${data.rows.length} representative situations pass every gate end-to-end.`);

  const anyFail = data.rows.some((r) => !r.allGatesPass && !r.isZeroTierFallback);
  process.exit(anyFail ? 1 : 0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
