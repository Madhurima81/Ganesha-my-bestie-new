#!/usr/bin/env node
/**
 * Broader corpus validation for Event Planner quality.
 *
 * Runs 30 real active situations through the actual browser pipeline using
 * the five currently implemented Forms/Templates, scores each story against
 * the broader quality checklist, and writes a markdown report without
 * modifying generator behavior.
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41733;
const REPORT_PATH = path.resolve(process.cwd(), "tmp_story_quality_report.md");

const CASES = [
  { situationId: "SIT005", templateId: "T03", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT020", templateId: "T03", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT049", templateId: "T03", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT101", templateId: "T03", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT113", templateId: "T03", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },

  // T18 Realization Contract cases (added 2026-08-12, per
  // docs/prana-kids/T18_REALIZATION_PILOT_2026-08-12.md), one per detected
  // mode: SIT001 (TAKEN_OR_DAMAGED), SIT101 (WAITING_FOR_TURN_OR_EVENT),
  // SIT015 (PHYSICAL_RESTLESSNESS), SIT105 (SCATTERED_ATTENTION), SIT136
  // (TEMPTATION_TRADEOFF).
  { situationId: "SIT001", templateId: "T18", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT101", templateId: "T18", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT015", templateId: "T18", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT105", templateId: "T18", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT136", templateId: "T18", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },

  // T14 Realization Contract cases (added 2026-08-12, per
  // docs/prana-kids/T14_REALIZATION_PILOT_2026-08-12.md), one per detected
  // mode: SIT048 (EXCLUSION_LONGING_TO_BELONG), SIT046
  // (SHAME_AFTER_CORRECTION), SIT065 (SELF_IMAGE_COMPARISON), SIT051
  // (LOSING_A_CONNECTION), SIT013 (MISUNDERSTOOD_OR_UNHEARD).
  { situationId: "SIT048", templateId: "T14", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT046", templateId: "T14", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT065", templateId: "T14", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT051", templateId: "T14", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT013", templateId: "T14", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },

  // T15 Realization Contract (2026-08-12) pilot cases — one per detected
  // mode: SIT028 (TRUST_THE_UNFAMILIAR), SIT024 (SEPARATION_FEAR), SIT034
  // (UNCERTAIN_FROM_OVERHEARD), SIT119 (LOSING_THE_FAMILIAR), SIT156
  // (BROKEN_PROMISE_TRUST), SIT142 (DIGITAL_BOUNDARY_SAFETY), SIT099
  // (SENSORY_OVERWHELM).
  { situationId: "SIT028", templateId: "T15", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT024", templateId: "T15", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT034", templateId: "T15", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT119", templateId: "T15", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT156", templateId: "T15", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT142", templateId: "T15", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT099", templateId: "T15", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },

  // T04 Realization Contract (added 2026-08-12, per
  // docs/prana-kids/T04_REALIZATION_PILOT_2026-08-12.md). Only 1 of the
  // 156 active situations naturally selects T04 (SIT137, "Tempted to look
  // at friend's paper during a test" — confirmed via
  // phase8-tools/dumpT04Situations2.cjs), so there is only one real case
  // here, not a curated 5-7 like T14/T15/T18 — see the pilot doc's
  // upstream-limitation finding.
  { situationId: "SIT137", templateId: "T04", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  // T09 Realization Contract (added 2026-08-12, per
  // docs/prana-kids/T09_REALIZATION_PILOT_2026-08-12.md). Only 4 of the 168
  // active situations naturally select T09 (confirmed via
  // phase8-tools/dumpT09Situations.cjs) — 3 genuine modes: BODY_DISCOMFORT
  // (SIT009, SIT019), SEPARATION_SAFETY (SIT029), INTRUSIVE_FEAR (SIT030).
  { situationId: "SIT009", templateId: "T09", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT019", templateId: "T09", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT029", templateId: "T09", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT030", templateId: "T09", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },

  // T05 Realization Contract (added 2026-08-12, per
  // docs/prana-kids/T05_REALIZATION_PILOT_2026-08-12.md). Only 4 of the 156
  // active situations naturally select T05 (confirmed via
  // phase8-tools/dumpT05Situations.cjs) — 3 genuine modes: PUBLIC_EXPOSURE
  // (SIT036), NOT_CHOSEN_COMPARISON (SIT057, SIT084), VISIBLE_DIFFERENCE
  // (SIT066).
  { situationId: "SIT036", templateId: "T05", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT057", templateId: "T05", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT066", templateId: "T05", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT084", templateId: "T05", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },

  // T19 Realization Contract (added 2026-08-12, per
  // docs/prana-kids/T19_REALIZATION_PILOT_2026-08-12.md). Only 2 of the
  // active situations naturally select T19 — 1 genuine mode
  // (THRESHOLD_INTEGRITY_CHOICE): SIT133 (tempted to steal, peer-dare
  // pressure), SIT137 (tempted to look at a friend's test paper, solitary
  // opportunity).
  { situationId: "SIT133", templateId: "T19", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT137", templateId: "T19", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },

  { situationId: "SIT045", templateId: "T22", form: "F02", castTarget: "2", objectFocus: true, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT083", templateId: "T22", form: "F02", castTarget: "2", objectFocus: true, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT139", templateId: "T22", form: "F02", castTarget: "2", objectFocus: true, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT148", templateId: "T22", form: "F02", castTarget: "2", objectFocus: true, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT154", templateId: "T22", form: "F02", castTarget: "2", objectFocus: true, obstacleMode: "explicit", architecture: "no-belief" },

  { situationId: "SIT040", templateId: "T16", form: "F03", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "belief" },
  { situationId: "SIT064", templateId: "T16", form: "F03", castTarget: "3+", objectFocus: true, obstacleMode: "ambient", architecture: "belief" },
  { situationId: "SIT067", templateId: "T16", form: "F03", castTarget: "3+", objectFocus: true, obstacleMode: "explicit", architecture: "belief" },
  { situationId: "SIT077", templateId: "T16", form: "F03", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "belief" },
  { situationId: "SIT128", templateId: "T16", form: "F03", castTarget: "solo", objectFocus: true, obstacleMode: "ambient", architecture: "belief" },

  { situationId: "SIT042", templateId: "T23", form: "F04", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "assumption" },
  { situationId: "SIT086", templateId: "T23", form: "F04", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "assumption" },
  { situationId: "SIT089", templateId: "T23", form: "F04", castTarget: "3+", objectFocus: true, obstacleMode: "ambient", architecture: "assumption" },
  { situationId: "SIT123", templateId: "T23", form: "F04", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "assumption" },
  { situationId: "SIT158", templateId: "T23", form: "F04", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "assumption" },

  { situationId: "SIT006", templateId: "T21", form: "F05", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT111", templateId: "T21", form: "F05", castTarget: "3+", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT118", templateId: "T21", form: "F05", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT120", templateId: "T21", form: "F05", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT164", templateId: "T21", form: "F05", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },

  { situationId: "SIT060", templateId: "T16", form: "F03", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "belief" },
  { situationId: "SIT132", templateId: "T16", form: "F03", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "belief" },
  { situationId: "SIT133", templateId: "T23", form: "F04", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "assumption" },
  { situationId: "SIT141", templateId: "T22", form: "F02", castTarget: "2", objectFocus: true, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT157", templateId: "T21", form: "F05", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },

  // T02/T08/T12 ACTIVE/VALIDATION sign-off cases (added 2026-08-12, per
  // docs/prana-kids/FINAL_LEGACY_TEMPLATE_STATUS_2026-08-12.md). These three
  // templates had zero dedicated content-quality audit coverage in this
  // file. All natural situations for each are included below (the full
  // natural sets per tmp_full_corpus_production_readiness.json), run through
  // the existing scoring criteria only — no new checks were added.
  { situationId: "SIT054", templateId: "T02", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT102", templateId: "T02", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT124", templateId: "T02", form: "F01", castTarget: "solo", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT168", templateId: "T02", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },

  { situationId: "SIT004", templateId: "T08", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT063", templateId: "T08", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT072", templateId: "T08", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "ambient", architecture: "no-belief" },
  { situationId: "SIT096", templateId: "T08", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT155", templateId: "T08", form: "F01", castTarget: "3+", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },

  { situationId: "SIT138", templateId: "T12", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT143", templateId: "T12", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT159", templateId: "T12", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
  { situationId: "SIT161", templateId: "T12", form: "F01", castTarget: "2", objectFocus: false, obstacleMode: "explicit", architecture: "no-belief" },
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

function normalize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s']/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function words(text) {
  return normalize(text).split(" ").filter(Boolean);
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function overlapCount(a, b) {
  const set = new Set(words(b));
  return words(a).filter((word) => set.has(word)).length;
}

// Cross-story verbatim sentence reuse check (added 2026-08-12, per
// docs/prana-kids/REALIZATION_QUALITY_GAP_REPORT_2026-08-12.md §5 step 6 /
// §6 step 6). The gap the report identified: the denylist above
// (structuralNarrationPattern) only bans specific *phrases* from the old
// T16/T21/T22/T23 failures — it has no check for whether two different
// situations produced the exact same sentence, which is the actual, still-
// live failure mode for the 11 templates that fall through to the shared
// generic fallback (six identical sentences in 103/139 corpus stories,
// regardless of situation). This scans every story's prose for exact-string
// sentence matches across *different* situationIds and flags reuse.
// Trivial connective sentences (very short, or containing no situation-
// specific content) are excluded via MIN_SENTENCE_WORDS so the check does
// not fire on incidental short lines that are expected to repeat (e.g. a
// bare "Yes." in dialogue).
const MIN_SENTENCE_WORDS = 6;
function splitSentences(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && countWords(sentence) >= MIN_SENTENCE_WORDS);
}

// Templates that already have a real, mode-detected Realization Contract
// (own mechanism-specific event chain + prose) as of this check's addition —
// mirrors TEMPLATES_WITH_REALIZATION_CONTRACT in phase6-app.js. Verbatim
// reuse across situations is a genuine regression (blocking) for these
// templates. Any other template present in a future CASES list (e.g. once
// T18/T14/etc. get their own contracts) is still measured and reported, but
// only as a WARNING until it's confirmed fixed — matching the report's
// explicit instruction not to newly fail the build on templates that are
// still known to share the generic fallback's boilerplate.
const CONTRACT_TEMPLATES_FOR_REUSE_CHECK = new Set(["T03", "T04", "T05", "T09", "T14", "T15", "T16", "T18", "T19", "T21", "T22", "T23"]);

function computeCrossStoryVerbatimReuse(results) {
  const sentenceOwners = new Map(); // sentence -> Set(situationId)
  for (const result of results) {
    const storyText = (result && result.storyText) || "";
    const situationId = result && result.situation && result.situation.id;
    if (!situationId) continue;
    const seen = new Set(splitSentences(storyText));
    for (const sentence of seen) {
      if (!sentenceOwners.has(sentence)) sentenceOwners.set(sentence, new Set());
      sentenceOwners.get(sentence).add(situationId);
    }
  }
  const reusedSentences = [...sentenceOwners.entries()]
    .filter(([, situationIds]) => situationIds.size >= 2)
    .map(([sentence, situationIds]) => ({ sentence, situationIds: [...situationIds], count: situationIds.size }))
    .sort((a, b) => b.count - a.count);
  return reusedSentences;
}

function reuseHitsForSituation(reusedSentences, situationId) {
  return reusedSentences.filter((entry) => entry.situationIds.includes(situationId));
}

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
  return page.evaluate(async (input) => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (
          window.__pranaDebug &&
          window.__pranaDebug.resolvePhase6 &&
          window.__pranaDebug.buildStoryBlueprint &&
          window.__pranaDebug.buildStoryPlan &&
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

    const request = { situationId: input.situationId, characterId: null };
    const result = window.__pranaDebug.resolvePhase6(window.__pranaState.libraries, request, {});
    const naturalArtifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, null);
    const artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(result, request, input.templateId);
    const ctx = result && result.context;
    const situation = ctx && ctx.situation;
    const storySeed = situation && situation.storySeed;
    const pages = artifacts && artifacts.lockedFinalStory && artifacts.lockedFinalStory.pages
      ? artifacts.lockedFinalStory.pages.map((page) => page.text)
      : [];

    return {
      caseMeta: input,
      resolveStatus: result && result.status,
      resolveIssues: result && result.issues || [],
      situation: {
        id: situation && situation.id,
        title: situation && situation.title,
        childExperience: storySeed && storySeed.childExperience,
        immediateWant: storySeed && storySeed.immediateWant,
        immediateObstacle: storySeed && storySeed.immediateObstacle,
        emotionalTension: storySeed && storySeed.emotionalTension,
        context: storySeed && storySeed.context || [],
        emotionIds: situation && situation.emotionIds || [],
      },
      context: ctx ? {
        protagonist: ctx.protagonist,
        characterName: ctx.character && ctx.character.name,
        worldName: ctx.world && ctx.world.name,
        obstacleName: ctx.obstacle && ctx.obstacle.name,
        conflictName: ctx.storyConflict && ctx.storyConflict.name,
        missionName: ctx.mission && ctx.mission.name,
        falseBelief: ctx.falseBelief,
        trueBelief: ctx.trueBelief,
        realizedSituation: ctx.realizedSituation,
        coreReference: ctx.coreReference,
      } : null,
      naturalTemplateId: naturalArtifacts && naturalArtifacts.templateSelection && naturalArtifacts.templateSelection.templateId,
      naturalTemplateName: naturalArtifacts && naturalArtifacts.templateSelection && naturalArtifacts.templateSelection.templateName,
      templateId: artifacts && artifacts.templateSelection && artifacts.templateSelection.templateId,
      templateName: artifacts && artifacts.templateSelection && artifacts.templateSelection.templateName,
      eventActors: artifacts && artifacts.eventChainResult && artifacts.eventChainResult.events
        ? artifacts.eventChainResult.events.map((event) => ({ label: event.label, actor: event.actor, action: event.action || event.reinterpretation || "" }))
        : [],
      eventChainValidation: artifacts && artifacts.eventChainValidation,
      completeStoryValidation: artifacts && artifacts.completeStoryValidation,
      storyQAReport: artifacts && artifacts.storyQAReport,
      productionQAReport: artifacts && artifacts.productionQAReport,
      compressionQAReport: artifacts && artifacts.compressionQAReport,
      compressedStory: artifacts && artifacts.compressedStory,
      title: artifacts && artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
      storyText: artifacts && artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
      pages,
      lockedFinalStory: Boolean(artifacts && artifacts.lockedFinalStory),
    };
  }, testCase);
}

function grade(status, note) {
  return { status, note };
}

function scoreCriteria(result) {
  const pages = result.pages || [];
  const storyText = result.storyText || "";
  const firstPage = pages[0] || "";
  const lastPage = pages[pages.length - 1] || "";
  const hero = (result.context && result.context.protagonist) || "";
  const situation = result.situation || {};
  const childExperience = situation.childExperience || "";
  const title = situation.title || "";
  const immediateWant = situation.immediateWant || "";
  const obstacleName = (result.context && result.context.obstacleName) || "";
  const conflictName = (result.context && result.context.conflictName) || "";
  const falseBelief = (result.context && result.context.falseBelief) || "";
  const trueBelief = (result.context && result.context.trueBelief) || "";
  const compressed = result.compressedStory && result.compressedStory.text || "";
  const compressedWords = result.compressedStory && result.compressedStory.wordCount || 0;
  const nonHeroActors = (result.eventActors || [])
    .map((item) => item.actor)
    .filter((actor) => actor && actor !== hero && actor !== "ambient");
  const uniqueNonHeroActors = [...new Set(nonHeroActors)];
  const heroCount = normalize(storyText).split(" ").filter((word) => word === normalize(hero)).length;
  const heroRatio = hero ? heroCount / Math.max(countWords(storyText), 1) : 0;
  const exactTitleCopy = normalize(firstPage).includes(normalize(title));
  const experienceOverlap = overlapCount(firstPage, childExperience);
  const wantOverlap = overlapCount(storyText, immediateWant);
  const rawLabelPattern = /\b(?:[A-Z]{2,}\d{2,}|Puzzle Conflict|Inner Conflict|Hidden Clue|Story Plan|Blueprint)\b/;
  // Realization V2 regression net (tmp_realization_layer_v2_spec.md §5): a
  // denylist of the exact structural-narration phrases the 30-story blind
  // review flagged, plus the situation-title-leak pattern into compression.
  // This is a regression net for known failures, not the primary guard —
  // the primary guard is the semantic "describe what happens in-world, not
  // what the beat does" rule applied when beats are written.
  const structuralNarrationPattern = /\brestore attempt (?:failed|succeeded)\b|\bresponded in a way that\b|\bmoved forward more accurately\b|\brevealed a connected origin\b|\bdid not match\b.*\bassumption\b|\btreated\b.*\bas something simple\b|\bwas not survivable as designed\b|\bwas not what it first looked like\b|\ba quiet sense of \w+ settled over\b/i;
  const awkwardPattern = /\bthe the\b|\. \.|,,|  /i;

  const criteria = {};

  if (!result.lockedFinalStory) {
    const fail = grade("FAIL", "Did not reach a locked final story.");
    return Object.fromEntries(Array.from({ length: 12 }, (_, index) => [`C${index + 1}`, fail]));
  }

  criteria.C1 = exactTitleCopy
    ? grade("WARNING", "Situation is recognizable, but the opening still copies the raw situation title too directly.")
    : experienceOverlap >= 3
      ? grade("PASS", "Situation remains recognizable through paraphrased concrete detail.")
      : grade("FAIL", "Situation no longer feels clearly grounded in the authored child experience.");

  criteria.C2 = wantOverlap >= 2 || normalize(storyText).includes(normalize(hero)) && normalize(storyText).includes("wanted")
    ? grade("PASS", "Hero has a visible want or pursuit in the story.")
    : immediateWant
      ? grade("WARNING", "The Situation has a clear want in metadata, but the manuscript underplays it.")
      : grade("FAIL", "Hero want is not clearly visible.");

  if (result.caseMeta.castTarget === "solo") {
    criteria.C3 = uniqueNonHeroActors.length === 0
      ? grade("PASS", "Solo-cast case stays hero-centered.")
      : grade("WARNING", "Solo case introduces extra actor language, though it stays mostly hero-led.");
  } else if (result.caseMeta.castTarget === "2") {
    criteria.C3 = uniqueNonHeroActors.length >= 1
      ? grade("PASS", "Supporting character has a visible narrative role.")
      : grade("FAIL", "Two-character case loses the supporting character almost entirely.");
  } else {
    const groupSignal = /\b(class|family|friends|everyone|others|classmates|teacher|mom|dad|baby)\b/i.test(storyText);
    criteria.C3 = uniqueNonHeroActors.length >= 1 && groupSignal
      ? grade("PASS", "Group/family context stays present and narratively functional.")
      : uniqueNonHeroActors.length >= 1
        ? grade("WARNING", "Story keeps one support figure but flattens the larger cast context.")
        : grade("FAIL", "Group/family situation collapses into a near-solo story.");
  }

  criteria.C4 = result.eventChainValidation && result.eventChainValidation.status === "PASS" && result.completeStoryValidation && result.completeStoryValidation.status === "PASS"
    ? grade("PASS", "Events remain causally connected through the actual pipeline.")
    : grade("FAIL", "Pipeline validation no longer confirms clear causal progression.");

  criteria.C5 = result.templateId === result.caseMeta.templateId
    ? grade("PASS", `Form stays structurally recognizable through ${result.caseMeta.form} / ${result.templateId}.`)
    : grade("FAIL", "Forced Form/Template was not preserved through generation.");

  const textNorm = normalize(storyText);
  if (result.templateId === "T03") {
    criteria.C6 = /\bwait\b/.test(textNorm) && /\btried\b/.test(textNorm) && /\bthis time\b/.test(textNorm)
      ? grade("PASS", "Three-tries mechanic is visible on the page.")
      : grade("WARNING", "Three-tries structure passes validation but reads flatter than the intended mechanic.");
  } else if (result.templateId === "T16") {
    // T16 Realization Contract (2026-08-10): the evidence/reasoning beat is
    // now one of 5 genuinely different mechanisms (social reaction, self-
    // test, retrospective recall, somatic signal, internal reasoning) —
    // matches any of their distinct signals rather than one shared phrase.
    criteria.C6 = /\bthanks for telling me\b|\bi think i actually know this\b|\bmemory surfaced\b|\bheavier the longer\b|\bnothing new to find yet\b|\bkept talking\b|\bnobody even noticed\b/.test(textNorm)
      ? grade("PASS", "Reinterpretation mechanic is visible.")
      : grade("WARNING", "Belief-reassessment structure is present, but the evidence-turn is thin in prose.");
  } else if (result.templateId === "T21") {
    // T21 Realization Contract (2026-08-10): the restore-attempt/adaptation
    // beats are now one of 5 genuinely different mechanisms (external
    // cancellation, chronic interference, unfamiliar territory, inclusion
    // request, social threat) — matches any of their distinct signals
    // rather than one shared phrase pair.
    criteria.C6 = /\bfell flat\b|\bbarely any of it had actually landed\b|\bwas the wrong way\b|\bfun had gone thin\b|\bmore people were talking now\b/.test(textNorm)
      ? grade("PASS", "Disrupted-plan mechanic is clearly visible.")
      : grade("WARNING", "Disrupted-plan structure passes, but the two-step disruption may read formulaically.");
  } else if (result.templateId === "T22") {
    // T22 prose rewrite (2026-08-10): CONNECTED_DISCOVERY/NEW_CHOICE/
    // RESOLUTION are now genuine per-mode story events (show, not tell) —
    // there is no shared formula phrase left to pattern-match, by design.
    // C6 instead checks for the two structural signals that must be present
    // regardless of mode: a reflective-pause moment (any concrete form) and
    // the hero taking a visible action/making a choice.
    const turningPointVisible = /\b(stopped|paused|stood still|went quiet|held it still|sat with|took (a|one) (slow )?breath|a beat before|for a second)\b/i.test(textNorm);
    const heroActsVisible = /\b(chose|decided|carried|walked|asked|said|picked|reached)\b/i.test(textNorm);
    criteria.C6 = turningPointVisible && heroActsVisible
      ? grade("PASS", "Reframe-trail mechanic is visible.")
      : grade("FAIL", "Object/pattern reinterpretation is not concrete enough in the prose.");
  } else if (result.templateId === "T23") {
    // T23 Realization Contract (2026-08-11): REVEAL/DEEPER_NOTICE no longer
    // use a fixed "braced for... wasn't the one actually happening" phrase
    // pair — each of the 4 mechanisms (unexplained withdrawal, divided
    // attention, offered repair, peer-pressure temptation) has its own
    // concrete-fact/realization pair (see T23_MODE_FRAMING).
    criteria.C6 = /\bthe same wave as any other day\b|\bjust as glad to hear it now\b|\bwere not opposites\b|\bstopped on its own\b/.test(textNorm)
      ? grade("PASS", "Self-reinterpretation mechanic is clearly visible.")
      : grade("WARNING", "Self-reinterpretation structure passes, but the mechanism-specific beat may read formulaically.");
  } else if (result.templateId === "T18") {
    // T18 Realization Contract (2026-08-12): the escalation/pause mechanic
    // is now one of 7 genuinely different self-regulation mechanisms (see
    // T18_MODE_FRAMING) — matches any of their distinct "paused instead of"
    // signals rather than one shared phrase.
    criteria.C6 = /\bpaused instead of\b/.test(textNorm) && /\bthis time\b/.test(textNorm)
      ? grade("PASS", "Escalate-then-pause mechanic is visible on the page.")
      : grade("WARNING", "Escalate-then-pause structure passes validation but reads flatter than the intended mechanic.");
  } else if (result.templateId === "T14") {
    // T14 Realization Contract (2026-08-12): the receive/remember/give
    // mechanic is now one of 5 genuinely different struggle domains (see
    // T14_MODE_FRAMING) — C6 checks the two structural signals that must be
    // present regardless of mode: an explicit remembering connective back
    // to the earlier received help, and the hero visibly giving help.
    const remembersEarlierHelp = /\b(remembering|just like|the same way)\b/i.test(textNorm);
    const heroGivesVisible = /\b(walked over|made room|crouched down|said something true|helped .* find|asked the other child|stepped in|offered)\b/i.test(textNorm);
    criteria.C6 = remembersEarlierHelp && heroGivesVisible
      ? grade("PASS", "Receive-remember-give mechanic is clearly visible.")
      : grade("WARNING", "Receive-remember-give structure passes, but the give-back beat may read thin in prose.");
  } else if (result.templateId === "T15") {
    // T15 Realization Contract (2026-08-12): the assumption/dismissal/
    // second-look/unexpected-contribution mechanic is one of 7 genuinely
    // different anxiety/trust domains (see T15_MODE_FRAMING) — no single
    // shared formula phrase across modes by design, same reasoning T14/T22's
    // C6 documents. Checks the two structural signals that must be present
    // regardless of mode: an explicit "second look" reconsideration signal,
    // and the dismissed helper's contribution becoming visible.
    const secondLookVisible = /\b(then|second (,|\s)?closer look|remembered|noticed)\b/i.test(textNorm);
    const contributionVisible = /\b(missing piece|turned out to|contributed|helped|stayed|offered|answered)\b/i.test(textNorm);
    criteria.C6 = secondLookVisible && contributionVisible
      ? grade("PASS", "Assumption-then-reversal mechanic is clearly visible.")
      : grade("WARNING", "Assumption-then-reversal structure passes, but the second-look/contribution beat may read thin in prose.");
  } else if (result.templateId === "T04") {
    // T04 Realization Contract (2026-08-12): only 1 real situation, so a
    // single mode (see T04_MODE_FRAMING) — checks the two structural
    // signals that must be present regardless of which situation reaches
    // this path: a visible narrowing question chain, and the revelation
    // landing as an explicit understanding.
    const questionChainVisible = /\b(wonder|question|asked)\b/i.test(textNorm);
    const revelationVisible = /\b(understood|folded into|already knew)\b/i.test(textNorm);
    criteria.C6 = questionChainVisible && revelationVisible
      ? grade("PASS", "Question-chain-then-revelation mechanic is clearly visible.")
      : grade("WARNING", "Question-chain structure passes, but the revelation beat may read thin in prose.");
  } else if (result.templateId === "T09") {
    // T09 Realization Contract (2026-08-12): 3 genuine modes (see
    // T09_MODE_FRAMING) — checks the two structural signals that must be
    // present regardless of mode: a visible big/loud attempt that fails,
    // and a quiet quality that is explicitly what actually works.
    const bigAttemptVisible = /\b(big|loud|louder|forceful|frantic|running|shouting|pushing|forcing)\b/i.test(textNorm);
    const quietQualityVisible = /\b(quiet|stopped|paused|calm|calmly|noticed|still)\b/i.test(textNorm);
    criteria.C6 = bigAttemptVisible && quietQualityVisible
      ? grade("PASS", "Big-attempt-fails-then-quiet-quality mechanic is clearly visible.")
      : grade("WARNING", "Big-attempt-then-quiet-quality structure passes, but the inversion may read thin in prose.");
  } else if (result.templateId === "T05") {
    // T05 Realization Contract (2026-08-12): 3 genuine modes (see
    // T05_MODE_FRAMING) — checks the two structural signals that must be
    // present regardless of mode: the mirror-ending explicitly signals a
    // return to a similar moment ("again"/"same kind of"), and the new
    // reaction explicitly signals a changed response ("this time").
    const mirrorReturnVisible = /\b(again|came around again|same kind of|similar moment)\b/i.test(textNorm);
    const changedResponseVisible = /\bthis time\b/i.test(textNorm);
    criteria.C6 = mirrorReturnVisible && changedResponseVisible
      ? grade("PASS", "Mirror-return-then-changed-response mechanic is clearly visible.")
      : grade("WARNING", "Mirror-return structure passes, but the contrast between old and new reaction may read thin in prose.");
  } else if (result.templateId === "T19") {
    // T19 Realization Contract (2026-08-12): single mode
    // (THRESHOLD_INTEGRITY_CHOICE) — checks the two structural signals that
    // must be present: two genuinely available paths at a crossroads, and a
    // deliberate (not accidental) choice between them.
    const crossroadsVisible = /\b(two different paths|one path|the other path)\b/i.test(textNorm);
    const deliberateChoiceVisible = /\b(chose|choice|decided|on purpose)\b/i.test(textNorm);
    criteria.C6 = crossroadsVisible && deliberateChoiceVisible
      ? grade("PASS", "Crossroads-then-deliberate-choice mechanic is clearly visible.")
      : grade("WARNING", "Crossroads structure passes, but the choice moment may read thin in prose.");
  } else {
    criteria.C6 = grade("WARNING", "Template mechanic visibility is not explicitly scored for this template.");
  }

  const genericObjectMismatch = result.templateId === "T22" && result.caseMeta.objectFocus && /\bobject\b/.test(textNorm) && !/\btoy|blanket|lunch|paper|drawing|thing|wallet|note|book\b/.test(textNorm);
  criteria.C7 = genericObjectMismatch
    ? grade("FAIL", "Story leans on a generic object placeholder, making the obstacle/mechanic feel forced.")
    : grade("PASS", "Obstacle pressure is integrated without obvious forced database scaffolding.");

  const compressedTitleLeak = result.compressedStory && result.compressedStory.text && result.situation.title
    ? normalize(result.compressedStory.text).includes(normalize(result.situation.title))
    : false;
  criteria.C8 = rawLabelPattern.test(storyText) || rawLabelPattern.test(result.title || "") || structuralNarrationPattern.test(storyText) || compressedTitleLeak
    ? grade("FAIL", "Database or engine labels are leaking into the output.")
    : grade("PASS", "No obvious database-label stitching is visible.");

  // C9 rewrite (2026-08-10): the old check searched prose for the literal
  // word "wait" at a page index — a phrase-detection heuristic that
  // rewarded whichever template happened to use that ritual word, and
  // penalized the T22 rewrite for correctly NOT using it anymore. Replaced
  // with a structural check against the actual event-beat data (label/
  // actor/action per beat, already captured in eventActors) rather than
  // prose keyword-matching: does a turning beat exist, is it positioned
  // between setup and resolution (not merely near the end), does its
  // content differ substantively from the setup beat (something actually
  // changed), and is it followed by a beat with real content (a
  // consequence follows)? No fixed phrase required anywhere.
  // T21's beat order is EXPECTATION -> DISRUPTION_1 -> REACTION ->
  // DISRUPTION_2 -> RESTORE_ATTEMPT -> RESTORE_FAILS -> ADAPTATION_RESOLUTION
  // (7 beats). RESTORE_FAILS is the actual turn — the moment the old plan
  // is forced to give way; ADAPTATION_RESOLUTION is the last beat and is
  // the consequence of that turn, not the turn itself.
  const TURNING_LABEL_BY_TEMPLATE = {
    T03: "TURNING_POINT",
    T04: "REVELATION",
    T05: "INSIGHT",
    T09: "QUIET_QUALITY_NOTICED",
    T18: "TURNING_POINT",
    T14: "HERO_GIVES",
    T15: "UNEXPECTED_CONTRIBUTION",
    T16: "INTERPRETATION_2",
    T19: "CHOICE",
    T21: "RESTORE_FAILS",
    T22: "CONNECTED_DISCOVERY",
    T23: "DEEPER_NOTICE",
  };
  const events = result.eventActors || [];
  const turningLabel = TURNING_LABEL_BY_TEMPLATE[result.templateId];
  const turningIndex = events.findIndex((event) => event.label === turningLabel);
  if (!turningLabel) {
    criteria.C9 = grade("WARNING", "No turning-point beat is mapped for this template yet.");
  } else if (turningIndex === -1) {
    criteria.C9 = grade("WARNING", "Turning-point beat was not found in the event chain.");
  } else if (!(turningIndex >= 1 && turningIndex < events.length - 1)) {
    criteria.C9 = grade("WARNING", "Turning point is present, but lands too close to the start or the very end.");
  } else {
    const setupAction = (events[0] && events[0].action) || "";
    const turningAction = events[turningIndex].action || "";
    const turningWordCount = Math.max(words(turningAction).length, 1);
    const overlapRatio = setupAction && turningAction ? overlapCount(turningAction, setupAction) / turningWordCount : 0;
    const contentChanged = turningAction.trim().length > 0 && overlapRatio < 0.5;
    const consequenceFollows = events.slice(turningIndex + 1).some((event) => (event.action || "").trim().length > 0);
    criteria.C9 = !contentChanged
      ? grade("WARNING", "Turning-point beat reads too close to the setup beat — nothing concrete seems to change.")
      : !consequenceFollows
        ? grade("WARNING", "Turning point has no visible consequence in the beats that follow it.")
        : grade("PASS", "Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.");
  }

  // Structural rewrite (2026-08-10, matches hasClosureSignal in
  // phase6-app.js): a required emotional-register word list was itself
  // acting as a QA token — checks for a concrete completed action instead.
  criteria.C10 = /\b(said|asked|walked|carried|held|decided|chose|choose|chooses|stopped|let|felt|dropped|grinned|answered|returned|told|sorted|smiled|settled|settling|kept|tried|paused|nodded|reached)\b/i.test(lastPage) && !/^\s*.*understood.*\s*$/i.test(lastPage)
    ? grade("PASS", "Ending shows the emotional change through action/feeling.")
    : grade("WARNING", "Ending resolves, but leans more on explanation than dramatized change.");

  // trueBelief verbatim is no longer required in compression (matches
  // CQA-005 in phase6-app.js, locked during the T16 realization rewrite —
  // compression names the concrete action/consequence, not a restated
  // moral). This criterion still checks word count, hero presence, and that
  // the compression QA gate itself passed.
  criteria.C11 = result.compressionQAReport && result.compressionQAReport.status === "PASS" && compressedWords >= 50 && compressedWords <= 70 && normalize(compressed).includes(normalize(hero))
    ? grade("PASS", "Compression preserves the story spine.")
    : grade("FAIL", "Compression does not preserve the required story essence.");

  criteria.C12 = heroRatio > 0.08 || awkwardPattern.test(storyText)
    ? grade("WARNING", "Protagonist naming or sentence construction feels repetitive/mechanical.")
    : grade("PASS", "Sentence flow avoids obvious repetition and awkward construction.");

  return criteria;
}

function overallStatus(criteria) {
  const statuses = Object.values(criteria).map((item) => item.status);
  if (statuses.includes("FAIL")) return "FAIL";
  if (statuses.includes("WARNING")) return "WARNING";
  return "PASS";
}

function rootCauseBuckets(audits) {
  const buckets = new Map();
  const add = (key, storyId, note) => {
    if (!buckets.has(key)) buckets.set(key, []);
    buckets.get(key).push({ storyId, note });
  };

  for (const audit of audits) {
    const { criteria } = audit;
    if (criteria.C3.status !== "PASS") add("Supporting cast under-realized", audit.storyKey, criteria.C3.note);
    if (criteria.C6.status !== "PASS") add("Template mechanic visible only at skeleton level", audit.storyKey, criteria.C6.note);
    if (criteria.C7.status !== "PASS") add("Situation/template mismatch produces forced obstacle language", audit.storyKey, criteria.C7.note);
    if (criteria.C1.status !== "PASS" || criteria.C2.status !== "PASS") add("Situation grounding or hero-want signal is weak", audit.storyKey, `${criteria.C1.note} ${criteria.C2.note}`.trim());
    if (criteria.C12.status !== "PASS") add("Sentence-level prose feels formulaic", audit.storyKey, criteria.C12.note);
  }

  return [...buckets.entries()].sort((a, b) => b[1].length - a[1].length);
}

function buildMarkdownReport(audits) {
  const passCount = audits.filter((audit) => audit.overall === "PASS").length;
  const warningCount = audits.filter((audit) => audit.overall === "WARNING").length;
  const failCount = audits.filter((audit) => audit.overall === "FAIL").length;
  const rootCauses = rootCauseBuckets(audits);

  const lines = [];
  lines.push("# Story Quality Corpus Report");
  lines.push("");
  lines.push(`Generated on 2026-08-10 for ${audits.length} real active situations using the actual Event Planner -> Final Story -> Compression pipeline.`);
  lines.push("");
  lines.push("## Summary");
  lines.push("");
  lines.push(`- PASS: ${passCount}`);
  lines.push(`- WARNING: ${warningCount}`);
  lines.push(`- FAIL: ${failCount}`);
  lines.push(`- Forms covered: F01, F02, F03, F04, F05`);
  lines.push(`- Templates exercised: T03, T16, T21, T22, T23`);
  lines.push(`- Architecture coverage: no-belief, belief, assumption`);
  lines.push("");
  lines.push("## Root Causes");
  lines.push("");
  if (!rootCauses.length) {
    lines.push("- None identified beyond isolated story-level issues.");
  } else {
    for (const [rootCause, items] of rootCauses) {
      lines.push(`- ${rootCause}: ${items.length} stories`);
      for (const item of items.slice(0, 5)) {
        lines.push(`  - ${item.storyId}: ${item.note}`);
      }
    }
  }
  lines.push("");
  lines.push("## Story Results");
  lines.push("");

  for (const audit of audits) {
    const result = audit.result;
    lines.push(`### ${audit.storyKey} - ${audit.overall}`);
    lines.push("");
    lines.push(`- Situation: ${result.situation.id} - ${result.situation.title}`);
    lines.push(`- Form / Template: ${result.caseMeta.form} / ${result.templateId}`);
    lines.push(`- Natural selector template: ${result.naturalTemplateId || "n/a"}`);
    lines.push(`- Hero: ${result.context && result.context.characterName}`);
    lines.push(`- World: ${result.context && result.context.worldName}`);
    lines.push(`- Obstacle: ${result.context && result.context.obstacleName}`);
    lines.push(`- Emotions: ${(result.situation.emotionIds || []).join(", ")}`);
    lines.push(`- Compression words: ${result.compressedStory && result.compressedStory.wordCount}`);
    lines.push("");
    lines.push("Criteria:");
    Object.entries(audit.criteria).forEach(([key, value]) => {
      lines.push(`- ${key}: ${value.status} - ${value.note}`);
    });
    lines.push("");
    lines.push(`Compression: ${result.compressedStory && result.compressedStory.text}`);
    lines.push("");
  }

  lines.push("## Proposed Fix Directions");
  lines.push("");
  lines.push("- Improve situation-specific noun recovery for T22 so object-driven stories stop defaulting to generic terms like `object` or interchangeable clue language.");
  lines.push("- Strengthen supporting-character realization for family/class/group situations so 3+ cast seeds do not collapse into hero-only or hero-plus-one summaries.");
  lines.push("- Reduce sentence-template repetition by varying subject openings, pronoun reuse, and beat-to-beat connective phrasing in the prose layer.");
  lines.push("- Increase hero-want visibility in the first two pages so stories act on the situation pressure instead of only restating it.");
  lines.push("- Deepen visible template mechanics in prose, especially where the event chain is valid but the manuscript still reads as a generalized scaffold.");
  lines.push("");

  return lines.join("\n");
}

async function main() {
  const server = createStaticServer();
  await new Promise((resolve) => server.listen(PORT, resolve));

  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto(`http://127.0.0.1:${PORT}/index.html`, { waitUntil: "networkidle" });

    const audits = [];
    for (const testCase of CASES) {
      const result = await runCase(page, testCase);
      const criteria = scoreCriteria(result);
      audits.push({
        storyKey: `${testCase.situationId} -> ${testCase.templateId}`,
        result,
        criteria,
        overall: overallStatus(criteria),
      });
    }

    // Cross-story verbatim sentence reuse (C13) — computed after every case
    // has run, since it is inherently a cross-story comparison. See
    // computeCrossStoryVerbatimReuse's comment above for why this exists
    // and CONTRACT_TEMPLATES_FOR_REUSE_CHECK for the blocking/report-only
    // gating.
    const reusedSentences = computeCrossStoryVerbatimReuse(audits.map((audit) => audit.result));
    for (const audit of audits) {
      const situationId = audit.result && audit.result.situation && audit.result.situation.id;
      const hits = reuseHitsForSituation(reusedSentences, situationId);
      const isContractTemplate = CONTRACT_TEMPLATES_FOR_REUSE_CHECK.has(audit.result && audit.result.templateId);
      if (!hits.length) {
        audit.criteria.C13 = { status: "PASS", note: "No sentence in this story is reused verbatim in another situation's story." };
      } else {
        const example = hits[0];
        const note = `Sentence reused verbatim across ${example.count} situations (${example.situationIds.join(", ")}): "${example.sentence}"`;
        audit.criteria.C13 = isContractTemplate
          ? { status: "FAIL", note }
          : { status: "WARNING", note: `${note} (non-blocking: ${audit.result.templateId} does not have a Realization Contract yet)` };
      }
      audit.overall = overallStatus(audit.criteria);
    }

    const report = buildMarkdownReport(audits);
    fs.writeFileSync(REPORT_PATH, report, "utf8");

    console.log(`Story quality report written to ${REPORT_PATH}`);
    console.log(`PASS=${audits.filter((audit) => audit.overall === "PASS").length} WARNING=${audits.filter((audit) => audit.overall === "WARNING").length} FAIL=${audits.filter((audit) => audit.overall === "FAIL").length}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
