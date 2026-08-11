#!/usr/bin/env node
/**
 * Dumps full page text, dialogue, narration cues, and illustration prompts
 * for every situation that resolves to a locked story via the natural
 * template pipeline — the human-readable companion to
 * runFullCorpusProductionReadiness.js, which only checks automated gates.
 * Automated QA cannot judge pacing, illustration-prompt genericness, or
 * cross-story repetition; this dump is what a human visual audit reads.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41811;
const JSON_REPORT_PATH = path.resolve(process.cwd(), "tmp_visual_audit_corpus.json");

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

  const data = await page.evaluate(async () => {
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
      try {
        artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request);
      } catch (e) {
        continue;
      }
      if (!artifacts.lockedFinalStory) continue;
      const templateId = artifacts.templateSelection && artifacts.templateSelection.templateId;
      const pages = (artifacts.lockedFinalStory.pages || []).map((p, idx) => {
        const illustrationEntry = artifacts.illustrationPackage && artifacts.illustrationPackage.pages
          && artifacts.illustrationPackage.pages.find((ip) => ip.page === p.page);
        const promptEntry = artifacts.promptPackResult && artifacts.promptPackResult.prompts
          && artifacts.promptPackResult.prompts.find((pp) => pp.page === p.page);
        return {
          page: p.page,
          text: p.text,
          wordCount: String(p.text || "").trim().split(/\s+/).filter(Boolean).length,
          dialogue: (p.dialogue || []).map((d) => d.text),
          illustrationNote: illustrationEntry && (illustrationEntry.note || illustrationEntry.description),
          illustrationPrompt: promptEntry && promptEntry.prompt,
        };
      });
      rows.push({
        situationId: situation.id,
        title: situation.title,
        templateId,
        curated: (window.__pranaState.storyTemplates.find((t) => t.templateId === templateId) || {}).bestForSituations?.includes(situation.id) || false,
        pageCount: pages.length,
        pages,
        compression: artifacts.compressedStory && artifacts.compressedStory.text,
      });
    }
    return rows;
  });

  await browser.close();
  server.close();

  fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log(`Dumped ${data.length} locked stories to ${JSON_REPORT_PATH}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
