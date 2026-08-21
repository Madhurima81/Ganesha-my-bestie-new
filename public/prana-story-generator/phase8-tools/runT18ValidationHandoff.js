#!/usr/bin/env node
/**
 * Dev A handoff runner for the T18 realization validation loop.
 *
 * Purpose:
 * - prepare a single source of truth for the T18 validation pass
 * - document the exact commands/metrics Dev A will run later
 * - refuse to run automatically during prep
 *
 * This file is intentionally conservative. It does not run the quality
 * verdict by default. The actual validation loop only runs when invoked
 * later with `--execute`, after Dev B explicitly reports that the T18
 * implementation and 5-case pilot are complete.
 */

import fs from "node:fs";
import path from "node:path";
import { spawnSync } from "node:child_process";

const ROOT = process.cwd();
const TOOLS_DIR = path.resolve(ROOT, "public", "prana-story-generator", "phase8-tools");
const TEMPLATES_PATH = path.resolve(ROOT, "public", "prana-story-generator", "phase8-data", "storyTemplates.json");
const CONTRACT_PATH = path.resolve(ROOT, "tmp", "t18_waiting_growth_realization_contract.md");
const GAP_REPORT_PATH = path.resolve(ROOT, "docs", "prana-kids", "REALIZATION_QUALITY_GAP_REPORT_2026-08-12.md");
const OUTPUT_DIR = path.resolve(ROOT, "tmp", "t18-validation");
const PREP_PATH = path.resolve(OUTPUT_DIR, "prep-manifest.json");

const COMMANDS = [
  {
    id: "selector_reachability",
    description: "Selector/reachability + frozen-template regression",
    command: "node public/prana-story-generator/phase8-tools/runSelectorReachabilityRegression.js",
  },
  {
    id: "production_readiness",
    description: "139/139 production-readiness regression",
    command: "node public/prana-story-generator/phase8-tools/runFullCorpusProductionReadiness.js",
  },
  {
    id: "corpus_quality",
    description: "Cross-story verbatim reuse + corpus quality metrics",
    command: "node public/prana-story-generator/phase8-tools/runCorpusQualityAudit.js",
  },
  {
    id: "blind_pack",
    description: "Blind-read review pack generation",
    command: "node public/prana-story-generator/phase8-tools/buildBlindEditorialReviewPack.js",
  },
];

function ensureDir(dirPath) {
  fs.mkdirSync(dirPath, { recursive: true });
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, "utf8"));
}

function readText(filePath) {
  return fs.existsSync(filePath) ? fs.readFileSync(filePath, "utf8") : "";
}

function extractT18Template() {
  const templates = readJson(TEMPLATES_PATH);
  const template = templates.find((item) => item.templateId === "T18");
  if (!template) throw new Error("T18 not found in storyTemplates.json");
  return template;
}

function extractPilotSet(contractText) {
  const marker = "Representative pilot set:";
  const index = contractText.indexOf(marker);
  if (index === -1) return [];
  return contractText
    .slice(index + marker.length)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.startsWith("- "))
    .map((line) => line.replace(/^- /, "").trim())
    .filter(Boolean);
}

function buildManifest() {
  const t18 = extractT18Template();
  const contractText = readText(CONTRACT_PATH);
  const gapReportText = readText(GAP_REPORT_PATH);
  const pilotSet = extractPilotSet(contractText);

  const baseline = {
    sourceDate: "2026-08-12",
    genericFallbackUsage: {
      status: "prepared",
      baselineValue: "103/139 stories (74%) reused the generic fallback sentence set",
      source: path.relative(ROOT, GAP_REPORT_PATH),
    },
    sentenceReuse: {
      status: "prepared",
      baselineValue: "Six identical sentences repeated across 103/139 stories",
      source: path.relative(ROOT, GAP_REPORT_PATH),
    },
    situationGrounding: {
      status: "prepared",
      measurementPlan: "Use runCorpusQualityAudit.js criterion C1 plus blind-read notes tagged 'Situation recognizability'.",
      source: "public/prana-story-generator/phase8-tools/runCorpusQualityAudit.js",
    },
    mechanismVisibility: {
      status: "prepared",
      measurementPlan: "Use runCorpusQualityAudit.js criterion C6 plus blind-read notes tagged 'Template mechanic invisibility'.",
      source: "public/prana-story-generator/phase8-tools/runCorpusQualityAudit.js",
    },
  };

  return {
    status: "PREPARED_NOT_RUN",
    preparedOn: "2026-08-12",
    waitCondition: "Run only after Dev B explicitly reports that the T18 implementation and 5-case pilot are complete.",
    doNotDoYet: [
      "run the T18 quality verdict",
      "declare T18 PASS/FAIL",
      "modify T18 prose/code",
      "modify selector, taxonomy, QA thresholds, or frozen templates",
    ],
    t18: {
      templateId: t18.templateId,
      name: t18.name,
      curatedSituations: t18.bestForSituations || [],
      pilotSituations: pilotSet,
      logicFamilies: t18.bestForLogicFamilies || [],
      needs: t18.bestForNeeds || [],
    },
    baselines: baseline,
    commands: COMMANDS,
    expectedOutputs: [
      "tmp_selector_reachability_report.md",
      "tmp_full_corpus_production_readiness.md",
      "tmp_full_corpus_production_readiness.json",
      "tmp_story_quality_report.md",
      "tmp_editorial_review_pack.md",
      "tmp_editorial_review_answer_key.md",
      "tmp_editorial_review_summary.md",
    ],
    notes: {
      contractPresent: Boolean(contractText),
      gapReportPresent: Boolean(gapReportText),
    },
  };
}

function runCommand(command) {
  const result = spawnSync(command, {
    cwd: ROOT,
    stdio: "inherit",
    shell: true,
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function main() {
  ensureDir(OUTPUT_DIR);
  const manifest = buildManifest();
  fs.writeFileSync(PREP_PATH, JSON.stringify(manifest, null, 2) + "\n", "utf8");

  if (!process.argv.includes("--execute")) {
    console.log("T18 validation handoff is prepared but NOT RUN.");
    console.log(`Prep manifest: ${PREP_PATH}`);
    console.log("When Dev B reports completion, rerun with:");
    console.log("node public/prana-story-generator/phase8-tools/runT18ValidationHandoff.js --execute");
    process.exit(0);
  }

  console.log("Running prepared T18 validation loop...");
  for (const step of COMMANDS) {
    console.log(`\n[${step.id}] ${step.command}`);
    runCommand(step.command);
  }
}

main();
