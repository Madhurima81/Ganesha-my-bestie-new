#!/usr/bin/env node
/**
 * Builds a blind editorial review pack for the 30-story corpus.
 *
 * Outputs:
 * - tmp_editorial_review_pack.md
 * - tmp_editorial_review_answer_key.md
 * - tmp_editorial_review_summary.md
 *
 * The blind pack hides SIT ids, Forms, Templates, hero metadata, beliefs,
 * and QA labels. It includes the final story text plus the 50-70 word
 * compression for comparison, a reviewer rubric, FAIL flags, and recurring
 * pattern prompts.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41734;
const PACK_PATH = path.resolve(process.cwd(), "tmp_editorial_review_pack.md");
const KEY_PATH = path.resolve(process.cwd(), "tmp_editorial_review_answer_key.md");
const SUMMARY_PATH = path.resolve(process.cwd(), "tmp_editorial_review_summary.md");
const SHUFFLE_SEED = 20260810;

const CASES = [
  { situationId: "SIT005", templateId: "T03", form: "F01" },
  { situationId: "SIT020", templateId: "T03", form: "F01" },
  { situationId: "SIT049", templateId: "T03", form: "F01" },
  { situationId: "SIT101", templateId: "T03", form: "F01" },
  { situationId: "SIT113", templateId: "T03", form: "F01" },

  { situationId: "SIT045", templateId: "T22", form: "F02" },
  { situationId: "SIT083", templateId: "T22", form: "F02" },
  { situationId: "SIT139", templateId: "T22", form: "F02" },
  { situationId: "SIT148", templateId: "T22", form: "F02" },
  { situationId: "SIT154", templateId: "T22", form: "F02" },

  { situationId: "SIT040", templateId: "T16", form: "F03" },
  { situationId: "SIT064", templateId: "T16", form: "F03" },
  { situationId: "SIT067", templateId: "T16", form: "F03" },
  { situationId: "SIT077", templateId: "T16", form: "F03" },
  { situationId: "SIT128", templateId: "T16", form: "F03" },

  { situationId: "SIT042", templateId: "T23", form: "F04" },
  { situationId: "SIT086", templateId: "T23", form: "F04" },
  { situationId: "SIT089", templateId: "T23", form: "F04" },
  { situationId: "SIT123", templateId: "T23", form: "F04" },
  { situationId: "SIT158", templateId: "T23", form: "F04" },

  { situationId: "SIT006", templateId: "T21", form: "F05" },
  { situationId: "SIT111", templateId: "T21", form: "F05" },
  { situationId: "SIT118", templateId: "T21", form: "F05" },
  { situationId: "SIT120", templateId: "T21", form: "F05" },
  { situationId: "SIT164", templateId: "T21", form: "F05" },

  { situationId: "SIT060", templateId: "T16", form: "F03" },
  { situationId: "SIT132", templateId: "T16", form: "F03" },
  { situationId: "SIT133", templateId: "T23", form: "F04" },
  { situationId: "SIT141", templateId: "T22", form: "F02" },
  { situationId: "SIT157", templateId: "T21", form: "F05" },
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

function mulberry32(seed) {
  let t = seed >>> 0;
  return () => {
    t += 0x6D2B79F5;
    let value = Math.imul(t ^ t >>> 15, 1 | t);
    value ^= value + Math.imul(value ^ value >>> 7, 61 | value);
    return ((value ^ value >>> 14) >>> 0) / 4294967296;
  };
}

function shuffleDeterministically(items, seed) {
  const copy = items.slice();
  const rand = mulberry32(seed);
  for (let index = copy.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(rand() * (index + 1));
    [copy[index], copy[swapIndex]] = [copy[swapIndex], copy[index]];
  }
  return copy;
}

function normalizeStoryText(text) {
  return String(text || "")
    .replace(/\r/g, "")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

async function runCase(page, testCase) {
  return page.evaluate(async ({ situationId, templateId }) => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (
          window.generateEventPlannerStory &&
          window.__pranaDebug &&
          window.__pranaDebug.buildStoryArtifactsWithEventPlanner &&
          window.__pranaState &&
          window.__pranaState.libraries &&
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

    const request = { situationId, characterId: null };
    const result = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
    const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, templateId);
    const story = artifacts && artifacts.lockedFinalStory;
    const pages = story && story.pages ? story.pages.map((item) => item.text) : [];
    return {
      situationId,
      templateId,
      ok: Boolean(story),
      title: artifacts && artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
      storyText: artifacts && artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
      finalStoryText: pages.join("\n\n"),
      compressedStory: artifacts && artifacts.compressedStory && artifacts.compressedStory.text,
      compressedWordCount: artifacts && artifacts.compressedStory && artifacts.compressedStory.wordCount,
      storyQA: artifacts && artifacts.storyQAReport && artifacts.storyQAReport.status,
      productionQA: artifacts && artifacts.productionQAReport && artifacts.productionQAReport.status,
    };
  }, testCase);
}

function buildRubricBlock() {
  return [
    "Reviewer Scores (1-5):",
    "- Child appeal: ____",
    "- Natural/story-like writing: ____",
    "- Situation recognizability: ____",
    "- Emotional authenticity: ____",
    "- Character agency: ____",
    "- Supporting-character usefulness: ____",
    "- Template mechanic invisibility (doesn't feel like a template): ____",
    "- Belief/insight earned rather than preached: ____",
    "- Ending satisfaction: ____",
    "- Overall 'would a 5-12-year-old actually enjoy this?': ____",
    "",
    "FAIL Flags (check any that apply):",
    "- [ ] Database-generated feel",
    "- [ ] Preachy / lesson-first",
    "- [ ] Repetitive phrasing",
    "- [ ] Adult-written rather than child-facing",
    "- [ ] Emotionally flat",
    "- [ ] Structure feels obvious / template-visible",
    "- [ ] Supporting cast collapses or feels token",
    "- [ ] Weak noun/object specificity",
    "",
    "Reviewer Notes:",
    "",
    "Recurring Pattern Tags (optional):",
    "- [ ] solo-story fake actor language",
    "- [ ] 3+ cast flattening",
    "- [ ] weak noun recovery / generic object language",
    "- [ ] turning point too close to ending",
    "- [ ] scaffold-like sentence construction",
    "- [ ] insight feels stated more than earned",
  ].join("\n");
}

function buildPack(stories) {
  const lines = [];
  lines.push("# Blind Editorial Review Pack");
  lines.push("");
  lines.push("Instructions:");
  lines.push("- This pack is intentionally blind.");
  lines.push("- Review only the child-facing story and the short compression.");
  lines.push("- Do not infer or score based on hidden template/structure metadata.");
  lines.push("- Use the FAIL flags for any story that feels database-generated, preachy, repetitive, adult-written, emotionally flat, or structurally obvious.");
  lines.push("- Note recurring patterns across multiple stories, not just isolated weaknesses.");
  lines.push("");
  lines.push("Scoring Guide:");
  lines.push("- `1` = very weak");
  lines.push("- `2` = weak");
  lines.push("- `3` = mixed / adequate");
  lines.push("- `4` = strong");
  lines.push("- `5` = excellent");
  lines.push("");
  lines.push("Recurring Pattern Summary Notes:");
  lines.push("");
  lines.push("- Most common strengths across the pack:");
  lines.push("");
  lines.push("- Most common weaknesses across the pack:");
  lines.push("");
  lines.push("- Stories that feel especially publication-ready:");
  lines.push("");
  lines.push("- Stories that most need revision:");
  lines.push("");

  stories.forEach((story, index) => {
    const storyNumber = String(index + 1).padStart(2, "0");
    lines.push("");
    lines.push(`## Story ${storyNumber}`);
    lines.push("");
    lines.push("Final Story:");
    lines.push("");
    lines.push(story.finalStoryText);
    lines.push("");
    lines.push("Compression:");
    lines.push("");
    lines.push(story.compressedStory || "[missing compression]");
    lines.push("");
    lines.push(buildRubricBlock());
  });

  return `${lines.join("\n")}\n`;
}

function buildAnswerKey(stories) {
  const lines = [];
  lines.push("# Blind Editorial Review Answer Key");
  lines.push("");
  lines.push(`Shuffle seed: ${SHUFFLE_SEED}`);
  lines.push("");
  lines.push("| Story # | SIT | Form | Template |");
  lines.push("| --- | --- | --- | --- |");
  stories.forEach((story, index) => {
    const storyNumber = String(index + 1).padStart(2, "0");
    lines.push(`| Story ${storyNumber} | ${story.situationId} | ${story.form} | ${story.templateId} |`);
  });
  lines.push("");
  return `${lines.join("\n")}\n`;
}

function buildSummary(stories) {
  const lines = [];
  lines.push("# Editorial Review Pack Summary");
  lines.push("");
  lines.push("- Blind pack file: `tmp_editorial_review_pack.md`");
  lines.push("- Answer key file: `tmp_editorial_review_answer_key.md`");
  lines.push("- Stories included: 30");
  lines.push(`- Shuffle seed: ${SHUFFLE_SEED}`);
  lines.push("- Final story text included: yes");
  lines.push("- Compression included: yes");
  lines.push("- Hidden from reviewers: SIT IDs, Forms, Templates, hero metadata, beliefs, QA labels, PASS/WARNING labels");
  lines.push("");
  lines.push("Story Order:");
  stories.forEach((story, index) => {
    const storyNumber = String(index + 1).padStart(2, "0");
    lines.push(`- Story ${storyNumber}`);
  });
  lines.push("");
  return `${lines.join("\n")}\n`;
}

async function main() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });

    const collected = [];
    for (const testCase of CASES) {
      const result = await runCase(page, testCase);
      if (!result.ok) {
        throw new Error(`Blind review pack failed: ${testCase.situationId} -> ${testCase.templateId} did not produce a locked final story.`);
      }
      collected.push({
        ...testCase,
        finalStoryText: normalizeStoryText(result.finalStoryText || result.storyText),
        compressedStory: String(result.compressedStory || "").trim(),
        compressedWordCount: result.compressedWordCount,
      });
    }

    const shuffled = shuffleDeterministically(collected, SHUFFLE_SEED);
    fs.writeFileSync(PACK_PATH, buildPack(shuffled), "utf8");
    fs.writeFileSync(KEY_PATH, buildAnswerKey(shuffled), "utf8");
    fs.writeFileSync(SUMMARY_PATH, buildSummary(shuffled), "utf8");

    console.log(`Blind editorial review pack written to ${PACK_PATH}`);
    console.log(`Answer key written to ${KEY_PATH}`);
    console.log(`Summary written to ${SUMMARY_PATH}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
