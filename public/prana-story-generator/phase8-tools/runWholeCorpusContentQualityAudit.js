#!/usr/bin/env node
/**
 * Whole-corpus content quality audit — PREP TOOL, NOT YET FOR ACTIVE USE.
 *
 * This tool is prepared to run the FULL active situation corpus through the
 * natural (unforced) template pipeline once T19 and all currently active
 * templates are frozen. It is intentionally built now, in advance, so it is
 * ready to run immediately at that point — but it is not part of any current
 * gate and should not be run destructively or treated as a release signal
 * until that freeze happens.
 *
 * It deliberately keeps its 7 quality dimensions UNMERGED. There is no single
 * combined/overall numeric score anywhere in this file's output, on purpose:
 * situation grounding, mechanism visibility, cross-story verbatim reuse,
 * same-mode convergence, and compression quality measure fundamentally
 * different failure modes. Averaging them into one number would hide which
 * dimension is actually broken, which defeats the point of a diagnostic
 * report. See the "Content-quality scorecard" section of the generated
 * markdown for the explicit per-dimension breakdown and a repeated note
 * explaining this choice.
 *
 * This file is standalone and self-contained by design — it does NOT import
 * anything from runCorpusQualityAudit.js or runFullCorpusProductionReadiness.js,
 * so that changes to those files (or to this one) can never silently break
 * the other. A handful of small pure helper functions (normalize/words/
 * countWords/overlapCount/splitSentences, the cross-story verbatim reuse
 * scan, the TURNING_LABEL_BY_TEMPLATE map, the CONTRACT_TEMPLATES_FOR_REUSE_CHECK
 * set, and the per-template C6 mechanism-visibility regex table) are adapted
 * from runCorpusQualityAudit.js and copied here verbatim/near-verbatim rather
 * than imported, per instruction. This file does not read, write, or modify
 * phase6-app.js, phase6-data, phase8-data, or any other phase8-tools script —
 * it only reads the live app via Playwright (read-only) and writes its own
 * two tmp_ output files.
 *
 * Run-only-after: T19 frozen + all active templates frozen.
 * Outputs:
 *   tmp_whole_corpus_content_quality_audit.json
 *   tmp_whole_corpus_content_quality_audit.md
 */

import http from "node:http";
import fs from "node:fs";
import path from "node:path";
import { chromium } from "playwright";

const ROOT = path.resolve(process.cwd(), "public", "prana-story-generator");
const PORT = 41911;
const JSON_REPORT_PATH = path.resolve(process.cwd(), "tmp_whole_corpus_content_quality_audit.json");
const MD_REPORT_PATH = path.resolve(process.cwd(), "tmp_whole_corpus_content_quality_audit.md");

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

// ---------------------------------------------------------------------------
// Small pure helpers — adapted from runCorpusQualityAudit.js. Kept local so
// this file has no cross-file import dependency.
// ---------------------------------------------------------------------------

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

const MIN_SENTENCE_WORDS = 6;
function splitSentences(text) {
  return String(text || "")
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence && countWords(sentence) >= MIN_SENTENCE_WORDS);
}

// Templates that already have a real, mode-detected Realization Contract (own
// mechanism-specific event chain + prose), mirrors CONTRACT_TEMPLATES_FOR_REUSE_CHECK
// in runCorpusQualityAudit.js / TEMPLATES_WITH_REALIZATION_CONTRACT in
// phase6-app.js. Copied here, not imported. Update this set when new
// templates get frozen with a real contract.
const CONTRACT_TEMPLATES_FOR_REUSE_CHECK = new Set(["T03", "T04", "T05", "T09", "T14", "T15", "T16", "T18", "T19", "T21", "T22", "T23"]);

// Turning-point event label per template — copied from runCorpusQualityAudit.js.
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

// Per-template mechanism-visibility (C6-style) checks — copied verbatim from
// runCorpusQualityAudit.js's scoreCriteria C6 block, as a lookup table keyed
// by templateId so new templates are easy to add later without touching the
// rest of this file. Each entry returns { status, note } given normalized
// story text (textNorm).
const MECHANISM_VISIBILITY_CHECK_BY_TEMPLATE = {
  T03: (textNorm) =>
    /\bwait\b/.test(textNorm) && /\btried\b/.test(textNorm) && /\bthis time\b/.test(textNorm)
      ? { status: "PASS", note: "Three-tries mechanic is visible on the page." }
      : { status: "WARNING", note: "Three-tries structure passes validation but reads flatter than the intended mechanic." },
  T16: (textNorm) =>
    /\bthanks for telling me\b|\bi think i actually know this\b|\bmemory surfaced\b|\bheavier the longer\b|\bnothing new to find yet\b|\bkept talking\b|\bnobody even noticed\b/.test(textNorm)
      ? { status: "PASS", note: "Reinterpretation mechanic is visible." }
      : { status: "WARNING", note: "Belief-reassessment structure is present, but the evidence-turn is thin in prose." },
  T21: (textNorm) =>
    /\bfell flat\b|\bbarely any of it had actually landed\b|\bwas the wrong way\b|\bfun had gone thin\b|\bmore people were talking now\b/.test(textNorm)
      ? { status: "PASS", note: "Disrupted-plan mechanic is clearly visible." }
      : { status: "WARNING", note: "Disrupted-plan structure passes, but the two-step disruption may read formulaically." },
  T22: (textNorm) => {
    const turningPointVisible = /\b(stopped|paused|stood still|went quiet|held it still|sat with|took (a|one) (slow )?breath|a beat before|for a second)\b/i.test(textNorm);
    const heroActsVisible = /\b(chose|decided|carried|walked|asked|said|picked|reached)\b/i.test(textNorm);
    return turningPointVisible && heroActsVisible
      ? { status: "PASS", note: "Reframe-trail mechanic is visible." }
      : { status: "FAIL", note: "Object/pattern reinterpretation is not concrete enough in the prose." };
  },
  T23: (textNorm) =>
    /\bthe same wave as any other day\b|\bjust as glad to hear it now\b|\bwere not opposites\b|\bstopped on its own\b/.test(textNorm)
      ? { status: "PASS", note: "Self-reinterpretation mechanic is clearly visible." }
      : { status: "WARNING", note: "Self-reinterpretation structure passes, but the mechanism-specific beat may read formulaically." },
  T18: (textNorm) =>
    /\bpaused instead of\b/.test(textNorm) && /\bthis time\b/.test(textNorm)
      ? { status: "PASS", note: "Escalate-then-pause mechanic is visible on the page." }
      : { status: "WARNING", note: "Escalate-then-pause structure passes validation but reads flatter than the intended mechanic." },
  T14: (textNorm) => {
    const remembersEarlierHelp = /\b(remembering|just like|the same way)\b/i.test(textNorm);
    const heroGivesVisible = /\b(walked over|made room|crouched down|said something true|helped .* find|asked the other child|stepped in|offered)\b/i.test(textNorm);
    return remembersEarlierHelp && heroGivesVisible
      ? { status: "PASS", note: "Receive-remember-give mechanic is clearly visible." }
      : { status: "WARNING", note: "Receive-remember-give structure passes, but the give-back beat may read thin in prose." };
  },
  T15: (textNorm) => {
    const secondLookVisible = /\b(then|second (,|\s)?closer look|remembered|noticed)\b/i.test(textNorm);
    const contributionVisible = /\b(missing piece|turned out to|contributed|helped|stayed|offered|answered)\b/i.test(textNorm);
    return secondLookVisible && contributionVisible
      ? { status: "PASS", note: "Assumption-then-reversal mechanic is clearly visible." }
      : { status: "WARNING", note: "Assumption-then-reversal structure passes, but the second-look/contribution beat may read thin in prose." };
  },
  T04: (textNorm) => {
    const questionChainVisible = /\b(wonder|question|asked)\b/i.test(textNorm);
    const revelationVisible = /\b(understood|folded into|already knew)\b/i.test(textNorm);
    return questionChainVisible && revelationVisible
      ? { status: "PASS", note: "Question-chain-then-revelation mechanic is clearly visible." }
      : { status: "WARNING", note: "Question-chain structure passes, but the revelation beat may read thin in prose." };
  },
  T09: (textNorm) => {
    const bigAttemptVisible = /\b(big|loud|louder|forceful|frantic|running|shouting|pushing|forcing)\b/i.test(textNorm);
    const quietQualityVisible = /\b(quiet|stopped|paused|calm|calmly|noticed|still)\b/i.test(textNorm);
    return bigAttemptVisible && quietQualityVisible
      ? { status: "PASS", note: "Big-attempt-fails-then-quiet-quality mechanic is clearly visible." }
      : { status: "WARNING", note: "Big-attempt-then-quiet-quality structure passes, but the inversion may read thin in prose." };
  },
  T05: (textNorm) => {
    const mirrorReturnVisible = /\b(again|came around again|same kind of|similar moment)\b/i.test(textNorm);
    const changedResponseVisible = /\bthis time\b/i.test(textNorm);
    return mirrorReturnVisible && changedResponseVisible
      ? { status: "PASS", note: "Mirror-return-then-changed-response mechanic is clearly visible." }
      : { status: "WARNING", note: "Mirror-return structure passes, but the contrast between old and new reaction may read thin in prose." };
  },
  T19: (textNorm) => {
    const crossroadsVisible = /\b(two different paths|one path|the other path)\b/i.test(textNorm);
    const deliberateChoiceVisible = /\b(chose|choice|decided|on purpose)\b/i.test(textNorm);
    return crossroadsVisible && deliberateChoiceVisible
      ? { status: "PASS", note: "Crossroads-then-deliberate-choice mechanic is clearly visible." }
      : { status: "WARNING", note: "Crossroads structure passes, but the choice moment may read thin in prose." };
  },
};

// Concrete-action verb list — copied from runCorpusQualityAudit.js's C10 check.
const CONCRETE_ACTION_VERBS_RE = /\b(said|asked|walked|carried|held|decided|chose|choose|chooses|stopped|let|felt|dropped|grinned|answered|returned|told|sorted|smiled|settled|settling|kept|tried|paused|nodded|reached)\b/i;

// Generic-moral-language markers — a documented pattern list of moral
// phrasing plus an abstract-lesson-without-concrete-action heuristic, per
// spec. Extends the spirit of structuralNarrationPattern from
// runCorpusQualityAudit.js (line ~370) with explicit moral-statement markers.
const GENERIC_MORAL_MARKERS_RE = /\b(learned that|the lesson|realized that (it's|it is) important|understood that (kindness|patience|courage|honesty|responsibility) (matters|is important))\b/i;

// ---------------------------------------------------------------------------
// Dimension 1: Situation grounding (adapted from C1/C2 in runCorpusQualityAudit.js)
// ---------------------------------------------------------------------------
function scoreGrounding(record) {
  const pages = record.pages || [];
  const firstPage = pages[0] || "";
  const storyText = record.storyText || "";
  const situation = record.situation || {};
  const title = situation.title || "";
  const childExperience = situation.childExperience || "";
  const immediateWant = situation.immediateWant || "";

  const exactTitleCopy = normalize(firstPage).includes(normalize(title)) && Boolean(title);
  const experienceOverlap = overlapCount(firstPage, childExperience);
  const wantOverlap = overlapCount(storyText, immediateWant);

  let status;
  let note;
  if (exactTitleCopy) {
    status = "WARNING";
    note = "Opening copies the raw situation title too directly.";
  } else if (experienceOverlap >= 3) {
    status = "PASS";
    note = "Situation remains recognizable through paraphrased concrete detail.";
  } else {
    status = "FAIL";
    note = "Situation no longer feels clearly grounded in the authored child experience.";
  }

  const wantStatus = wantOverlap >= 2
    ? "PASS"
    : immediateWant
      ? "WARNING"
      : "FAIL";

  return {
    status,
    note,
    exactTitleCopy,
    experienceOverlap,
    wantOverlap,
    wantStatus,
  };
}

// ---------------------------------------------------------------------------
// Dimension 2: Mechanism visibility
// ---------------------------------------------------------------------------
function scoreMechanismVisibility(record) {
  const templateId = record.templateId;
  const check = MECHANISM_VISIBILITY_CHECK_BY_TEMPLATE[templateId];
  if (!check) {
    return { status: "NOT_YET_SCORED_GENERIC_FALLBACK", note: "No mechanism-visibility check is defined for this template yet." };
  }
  const textNorm = normalize(record.storyText || "");
  return check(textNorm);
}

// ---------------------------------------------------------------------------
// Dimension 3: Generic fallback usage
// ---------------------------------------------------------------------------
function isGenericFallback(templateId) {
  return Boolean(templateId) && !CONTRACT_TEMPLATES_FOR_REUSE_CHECK.has(templateId);
}

// ---------------------------------------------------------------------------
// Dimension 4: Cross-story verbatim reuse, 3-tier severity
// ---------------------------------------------------------------------------
function buildSentenceOwners(records) {
  const sentenceOwners = new Map(); // sentence -> Set(situationId)
  for (const record of records) {
    const situationId = record.situationId;
    if (!situationId) continue;
    const seen = new Set(splitSentences(record.storyText || ""));
    for (const sentence of seen) {
      if (!sentenceOwners.has(sentence)) sentenceOwners.set(sentence, new Set());
      sentenceOwners.get(sentence).add(situationId);
    }
  }
  return sentenceOwners;
}

function storySeedBagForSituation(record) {
  const situation = record.situation || {};
  const text = [situation.childExperience, situation.immediateWant, situation.immediateObstacle].filter(Boolean).join(" ");
  return new Set(words(text));
}

function turningEventActionForRecord(record) {
  const label = TURNING_LABEL_BY_TEMPLATE[record.templateId];
  if (!label) return "";
  const events = record.eventActors || [];
  const event = events.find((e) => e.label === label);
  return (event && event.action) || "";
}

function wordOverlapRatio(sentenceWords, targetWords) {
  if (!sentenceWords.length) return 0;
  const targetSet = new Set(targetWords);
  const hit = sentenceWords.filter((w) => targetSet.has(w)).length;
  return hit / sentenceWords.length;
}

function classifyCrossStoryReuse(records) {
  const byId = new Map(records.map((r) => [r.situationId, r]));
  const sentenceOwners = buildSentenceOwners(records);

  const reusedSentences = [...sentenceOwners.entries()]
    .filter(([, situationIds]) => situationIds.size >= 2)
    .map(([sentence, situationIds]) => ({ sentence, situationIds: [...situationIds], count: situationIds.size }))
    .sort((a, b) => b.count - a.count);

  const low = [];
  const medium = [];
  const high = [];
  const genericFallbackReuse = [];

  for (const entry of reusedSentences) {
    const owners = entry.situationIds.map((id) => byId.get(id)).filter(Boolean);
    const contractOwners = owners.filter((r) => CONTRACT_TEMPLATES_FOR_REUSE_CHECK.has(r.templateId));

    // Split: any owner that is a generic-fallback template contributes to the
    // "known, accepted shared-pool debt" bucket, reported separately and
    // never mixed into severity classification used for release-blocking.
    const hasGenericFallbackOwner = owners.some((r) => isGenericFallback(r.templateId));
    if (hasGenericFallbackOwner) {
      genericFallbackReuse.push(entry);
    }

    // Only classify severity using contract-template owners — per spec,
    // "real" reuse severity is only computed for CONTRACT_TEMPLATES_FOR_REUSE_CHECK.
    if (contractOwners.length < 2) continue;

    const sentenceWords = words(entry.sentence);
    const shortSentence = countWords(entry.sentence) <= 10;

    // "no concrete content noun tied to any situation's storySeed" heuristic:
    // overlap with ANY reusing situation's storySeed text is < 2 words.
    const maxSeedOverlap = Math.max(
      0,
      ...contractOwners.map((r) => wordOverlapCountWords(sentenceWords, storySeedBagForSituation(r)))
    );
    const noConcreteSeedTie = maxSeedOverlap < 2;

    if (shortSentence || noConcreteSeedTie) {
      low.push({ ...entry, reason: shortSentence ? "short connective sentence (<=10 words)" : "no concrete content-noun tie to any sharing situation's storySeed" });
      continue;
    }

    // Compare against each contract owner's turning-point action text: is the
    // reused sentence NOT substantially contained in/overlapping that turning
    // event's action text for that owner? If true for all -> medium.
    // If the reused sentence itself IS the turning-point payoff sentence
    // (>=70% overlap) for 2+ sharing situations -> high.
    let turningMatchCount = 0;
    for (const owner of contractOwners) {
      const turningAction = turningEventActionForRecord(owner);
      if (!turningAction) continue;
      const turningWords = words(turningAction);
      const ratio = wordOverlapRatio(sentenceWords, turningWords);
      if (ratio >= 0.7) turningMatchCount += 1;
    }

    if (turningMatchCount >= 2) {
      high.push({ ...entry, turningMatchCount, reason: `Reused sentence overlaps >=70% with the turning-point action text for ${turningMatchCount} sharing situations — the mechanism-payoff sentence itself is duplicated verbatim.` });
    } else {
      medium.push({ ...entry, turningMatchCount, reason: "Reused sentence has concrete storySeed overlap but is not the turning-point payoff sentence." });
    }
  }

  return {
    allReusedSentences: reusedSentences,
    lowSeverity: low,
    mediumSeverity: medium,
    highSeverity: high,
    genericFallbackReuse,
  };
}

function wordOverlapCountWords(sentenceWords, targetWordSet) {
  return sentenceWords.filter((w) => targetWordSet.has(w)).length;
}

// ---------------------------------------------------------------------------
// Dimension 5: Same-mode convergence (skeleton-based Jaccard clustering)
// ---------------------------------------------------------------------------
function skeletonMaskTokens(record) {
  const situation = record.situation || {};
  const ctx = record.context || {};
  const maskWords = new Set();
  [ctx.characterName, ctx.worldName, ctx.obstacleName, ctx.conflictName].forEach((name) => {
    if (name) String(name).split(/\s+/).forEach((w) => { if (w) maskWords.add(w.toLowerCase()); });
  });
  [situation.childExperience, situation.immediateWant, situation.immediateObstacle].forEach((text) => {
    if (text) words(text).forEach((w) => maskWords.add(w));
  });
  return maskWords;
}

function buildSkeletonSentences(record) {
  const maskWords = skeletonMaskTokens(record);
  const sentences = splitSentences(record.storyText || "");
  return sentences.map((sentence) => {
    const tokens = normalize(sentence).split(" ").filter(Boolean);
    const masked = tokens.map((tok) => (maskWords.has(tok) ? "_" : tok));
    const collapsed = [];
    for (const tok of masked) {
      if (tok === "_" && collapsed[collapsed.length - 1] === "_") continue;
      collapsed.push(tok);
    }
    return collapsed.join(" ");
  });
}

function jaccard(setA, setB) {
  if (!setA.size && !setB.size) return 0;
  let intersection = 0;
  for (const item of setA) if (setB.has(item)) intersection += 1;
  const union = setA.size + setB.size - intersection;
  return union === 0 ? 0 : intersection / union;
}

function findConvergenceClusters(records) {
  // Group by templateId ("mode")
  const byTemplate = new Map();
  const skeletonMap = new Map(); // situationId -> {sentences: Set, sample}
  for (const record of records) {
    if (!record.templateId) continue;
    const skeletonSentences = buildSkeletonSentences(record);
    skeletonMap.set(record.situationId, {
      set: new Set(skeletonSentences),
      sample: skeletonSentences[0] || "",
    });
    if (!byTemplate.has(record.templateId)) byTemplate.set(record.templateId, []);
    byTemplate.get(record.templateId).push(record.situationId);
  }

  const edges = []; // {a, b, similarity, templateId}
  for (const [templateId, situationIds] of byTemplate.entries()) {
    for (let i = 0; i < situationIds.length; i += 1) {
      for (let j = i + 1; j < situationIds.length; j += 1) {
        const a = situationIds[i];
        const b = situationIds[j];
        const skelA = skeletonMap.get(a);
        const skelB = skeletonMap.get(b);
        if (!skelA || !skelB || !skelA.set.size || !skelB.set.size) continue;
        const similarity = jaccard(skelA.set, skelB.set);
        if (similarity >= 0.5) edges.push({ a, b, similarity, templateId });
      }
    }
  }

  // Union-find over edges to build connected components (clusters)
  const parent = new Map();
  const find = (x) => {
    if (!parent.has(x)) parent.set(x, x);
    if (parent.get(x) !== x) parent.set(x, find(parent.get(x)));
    return parent.get(x);
  };
  const union = (x, y) => {
    const rx = find(x);
    const ry = find(y);
    if (rx !== ry) parent.set(rx, ry);
  };
  edges.forEach((edge) => union(edge.a, edge.b));

  const clusterMembers = new Map(); // root -> Set(situationId)
  edges.forEach((edge) => {
    [edge.a, edge.b].forEach((id) => {
      const root = find(id);
      if (!clusterMembers.has(root)) clusterMembers.set(root, new Set());
      clusterMembers.get(root).add(id);
    });
  });

  const clusters = [...clusterMembers.entries()].map(([root, members]) => {
    const situationIds = [...members];
    const templateId = byTemplate.size ? edges.find((e) => situationIds.includes(e.a))?.templateId : null;
    const sampleSituation = situationIds[0];
    const sample = skeletonMap.get(sampleSituation);
    return {
      templateId: templateId || null,
      situationIds,
      size: situationIds.length,
      sampleSkeletonSentence: sample ? sample.sample : "",
    };
  }).sort((a, b) => b.size - a.size);

  return { edges, clusters };
}

// ---------------------------------------------------------------------------
// Dimension 6: Compression quality
// ---------------------------------------------------------------------------
function scoreCompressionQuality(record) {
  const compressedText = (record.compressedStory && record.compressedStory.text) || "";
  if (!compressedText) {
    return { status: "WARNING", note: "No compressed story text available to score." };
  }
  const hasConcreteVerb = CONCRETE_ACTION_VERBS_RE.test(compressedText);
  const hasGenericMoralMarker = GENERIC_MORAL_MARKERS_RE.test(compressedText);

  if (hasConcreteVerb && !hasGenericMoralMarker) {
    return { status: "PASS", note: "Compression is anchored in a concrete verb+object rather than an abstract moral statement.", hasConcreteVerb, hasGenericMoralMarker };
  }
  if (hasGenericMoralMarker && !hasConcreteVerb) {
    return { status: "FLAG", note: "Compression reads as an abstract stated moral without a concrete action.", hasConcreteVerb, hasGenericMoralMarker };
  }
  if (!hasConcreteVerb) {
    return { status: "WARNING", note: "Compression lacks a recognizable concrete action verb.", hasConcreteVerb, hasGenericMoralMarker };
  }
  return { status: "PASS", note: "Compression contains a concrete action verb; generic moral marker also present but not dominant.", hasConcreteVerb, hasGenericMoralMarker };
}

// ---------------------------------------------------------------------------
// Dimension 7: Template coverage map
// ---------------------------------------------------------------------------
function templateCoverageRow(record) {
  return {
    situationId: record.situationId,
    templateId: record.templateId || null,
    isContractTemplate: record.templateId ? CONTRACT_TEMPLATES_FOR_REUSE_CHECK.has(record.templateId) : false,
    coverageLabel: !record.templateId
      ? "no_template_selected"
      : CONTRACT_TEMPLATES_FOR_REUSE_CHECK.has(record.templateId)
        ? record.templateId
        : "generic_fallback",
    selectionMode: "natural",
  };
}

// ---------------------------------------------------------------------------
// Static server + browser harness (pattern matches the two existing tools)
// ---------------------------------------------------------------------------
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

async function collectWholeCorpus(page) {
  return page.evaluate(async () => {
    const waitForReady = () => new Promise((resolve, reject) => {
      const started = Date.now();
      const tick = () => {
        if (
          window.__pranaDebug &&
          window.__pranaDebug.resolvePhase6 &&
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

    const libs = window.__pranaState.libraries;
    const situations = (libs.situations || libs.situationLibrary || []).filter((s) => s.active !== false);

    const records = [];
    for (const situation of situations) {
      const request = { situationId: situation.id, characterId: null };
      const res = window.__pranaDebug.resolvePhase6(libs, request, {});
      let artifacts = {};
      let buildError = null;
      try {
        artifacts = window.__pranaDebug.buildStoryArtifactsWithEventPlanner(res, request);
      } catch (e) {
        buildError = e.message;
      }
      const ctx = res && res.context;
      const storySeed = situation.storySeed || {};
      const pages = artifacts.lockedFinalStory && artifacts.lockedFinalStory.pages
        ? artifacts.lockedFinalStory.pages.map((p) => p.text)
        : [];

      records.push({
        situationId: situation.id,
        title: situation.title,
        situation: {
          id: situation.id,
          title: situation.title,
          childExperience: storySeed.childExperience,
          immediateWant: storySeed.immediateWant,
          immediateObstacle: storySeed.immediateObstacle,
          emotionalTension: storySeed.emotionalTension,
        },
        context: ctx ? {
          protagonist: ctx.protagonist,
          characterName: ctx.character && ctx.character.name,
          worldName: ctx.world && ctx.world.name,
          obstacleName: ctx.obstacle && ctx.obstacle.name,
          conflictName: ctx.storyConflict && ctx.storyConflict.name,
        } : null,
        resolveStatus: res && res.status,
        templateId: artifacts.templateSelection && artifacts.templateSelection.templateId || null,
        templateName: artifacts.templateSelection && artifacts.templateSelection.templateName || null,
        storyText: artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText || "",
        pages,
        eventActors: artifacts.eventChainResult && artifacts.eventChainResult.events
          ? artifacts.eventChainResult.events.map((e) => ({ label: e.label, actor: e.actor, action: e.action || e.reinterpretation || "" }))
          : [],
        compressedStory: artifacts.compressedStory || null,
        completeStoryValidation: artifacts.completeStoryValidation || null,
        storyQAReport: artifacts.storyQAReport || null,
        productionQAReport: artifacts.productionQAReport || null,
        lockedFinalStory: Boolean(artifacts.lockedFinalStory),
        buildError,
      });
    }

    return { totalActiveSituations: situations.length, records };
  });
}

// ---------------------------------------------------------------------------
// Report assembly
// ---------------------------------------------------------------------------
function buildAggregates(scoredRecords) {
  const byTemplate = new Map();
  for (const r of scoredRecords) {
    const key = r.templateId || "NO_TEMPLATE";
    if (!byTemplate.has(key)) {
      byTemplate.set(key, {
        templateId: key,
        count: 0,
        isContractTemplate: CONTRACT_TEMPLATES_FOR_REUSE_CHECK.has(key),
        groundingPass: 0,
        groundingTotal: 0,
        mechanismPass: 0,
        mechanismScored: 0,
        mechanismNotYetScored: 0,
        genericFallbackCount: 0,
        compressionPass: 0,
        compressionTotal: 0,
      });
    }
    const bucket = byTemplate.get(key);
    bucket.count += 1;
    bucket.groundingTotal += 1;
    if (r.dimensions.grounding.status === "PASS") bucket.groundingPass += 1;
    if (r.dimensions.mechanismVisibility.status === "NOT_YET_SCORED_GENERIC_FALLBACK") {
      bucket.mechanismNotYetScored += 1;
    } else {
      bucket.mechanismScored += 1;
      if (r.dimensions.mechanismVisibility.status === "PASS") bucket.mechanismPass += 1;
    }
    if (r.dimensions.genericFallback) bucket.genericFallbackCount += 1;
    bucket.compressionTotal += 1;
    if (r.dimensions.compressionQuality.status === "PASS") bucket.compressionPass += 1;
  }
  return [...byTemplate.values()].sort((a, b) => b.count - a.count);
}

function buildMarkdown({ totalActiveSituations, scoredRecords, reuseResult, convergenceResult, aggregates }) {
  const lines = [];
  lines.push("# Whole-Corpus Content Quality Audit");
  lines.push("");
  lines.push("_Prep tool output — intended to run once T19 and all active templates are frozen. See top-of-file comment in `runWholeCorpusContentQualityAudit.js` for scope and the reason dimensions are not merged into one score._");
  lines.push("");
  lines.push("## Overall corpus stats");
  lines.push("");
  lines.push(`- Total active situations: ${totalActiveSituations}`);
  lines.push(`- Records scored: ${scoredRecords.length}`);
  lines.push(`- Resolved to a template (natural selection): ${scoredRecords.filter((r) => r.templateId).length}`);
  lines.push(`- No template selected: ${scoredRecords.filter((r) => !r.templateId).length}`);
  lines.push(`- Generic-fallback template stories: ${scoredRecords.filter((r) => r.dimensions.genericFallback).length}`);
  lines.push(`- Contract-template stories: ${scoredRecords.filter((r) => !r.dimensions.genericFallback && r.templateId).length}`);
  lines.push("");

  lines.push("## Content-quality scorecard (dimensions reported SEPARATELY, not combined)");
  lines.push("");
  lines.push("> **Note:** These 7 dimensions are intentionally NOT combined into a single overall score. Situation grounding, mechanism visibility, cross-story reuse severity, same-mode convergence, and compression quality measure fundamentally different failure modes that are not commensurable — averaging or otherwise combining them would hide which dimension is actually broken. Each is reported here with its own pass-rate/summary independently.");
  lines.push("");
  const groundingScored = scoredRecords.filter((r) => r.templateId);
  const groundingPassCount = groundingScored.filter((r) => r.dimensions.grounding.status === "PASS").length;
  lines.push(`1. **Situation grounding**: ${groundingPassCount}/${groundingScored.length} PASS`);
  const mechScored = scoredRecords.filter((r) => r.dimensions.mechanismVisibility.status !== "NOT_YET_SCORED_GENERIC_FALLBACK" && r.templateId);
  const mechPassCount = mechScored.filter((r) => r.dimensions.mechanismVisibility.status === "PASS").length;
  const mechNotYet = scoredRecords.filter((r) => r.dimensions.mechanismVisibility.status === "NOT_YET_SCORED_GENERIC_FALLBACK").length;
  lines.push(`2. **Mechanism visibility**: ${mechPassCount}/${mechScored.length} PASS among scored templates; ${mechNotYet} stories NOT_YET_SCORED_GENERIC_FALLBACK`);
  const genericCount = scoredRecords.filter((r) => r.dimensions.genericFallback).length;
  lines.push(`3. **Generic fallback usage**: ${genericCount}/${scoredRecords.length} stories on generic-fallback templates`);
  lines.push(`4. **Cross-story verbatim reuse (contract templates only)**: low=${reuseResult.lowSeverity.length}, medium=${reuseResult.mediumSeverity.length}, high=${reuseResult.highSeverity.length} reused-sentence entries; generic-fallback (known/accepted debt, reported separately)=${reuseResult.genericFallbackReuse.length}`);
  lines.push(`5. **Same-mode convergence**: ${convergenceResult.clusters.length} convergence clusters found (Jaccard >= 0.5 within same template)`);
  const compressionScored = scoredRecords.filter((r) => r.templateId);
  const compressionPassCount = compressionScored.filter((r) => r.dimensions.compressionQuality.status === "PASS").length;
  lines.push(`6. **Compression quality**: ${compressionPassCount}/${compressionScored.length} PASS`);
  lines.push(`7. **Template coverage map**: see per-situation rows in the JSON output (\`templateCoverage\`)`);
  lines.push("");

  lines.push("## Per-template breakdown");
  lines.push("");
  for (const bucket of aggregates) {
    lines.push(`### ${bucket.templateId}`);
    lines.push("");
    lines.push(`- Story count: ${bucket.count}`);
    lines.push(`- Contract template: ${bucket.isContractTemplate ? "yes" : "no (generic fallback)"}`);
    lines.push(`- Grounding pass rate: ${bucket.groundingPass}/${bucket.groundingTotal}`);
    lines.push(bucket.mechanismScored
      ? `- Mechanism-visibility pass rate: ${bucket.mechanismPass}/${bucket.mechanismScored}`
      : `- Mechanism-visibility: not yet scored (${bucket.mechanismNotYetScored} stories, generic fallback)`);
    lines.push(`- Generic-fallback flagged stories: ${bucket.genericFallbackCount}`);
    lines.push(`- Compression pass rate: ${bucket.compressionPass}/${bucket.compressionTotal}`);
    lines.push("");
  }

  lines.push("## Top repeated sentences");
  lines.push("");
  const topReused = [...reuseResult.highSeverity, ...reuseResult.mediumSeverity, ...reuseResult.lowSeverity]
    .sort((a, b) => b.count - a.count)
    .slice(0, 20);
  if (!topReused.length) {
    lines.push("- None found among contract-template stories.");
  } else {
    for (const entry of topReused) {
      const severity = reuseResult.highSeverity.includes(entry) ? "HIGH" : reuseResult.mediumSeverity.includes(entry) ? "MEDIUM" : "LOW";
      lines.push(`- [${severity}] (${entry.count}x, ${entry.situationIds.join(", ")}) "${entry.sentence}"`);
    }
  }
  lines.push("");
  lines.push(`_Generic-fallback reuse (known/accepted shared-pool debt, not release-blocking): ${reuseResult.genericFallbackReuse.length} sentence entries — not itemized here, see JSON \`crossStoryReuse.genericFallbackReuse\`._`);
  lines.push("");

  lines.push("## Top generic-skeleton clusters");
  lines.push("");
  const topClusters = convergenceResult.clusters.slice(0, 15);
  if (!topClusters.length) {
    lines.push("- None found at Jaccard >= 0.5 threshold.");
  } else {
    for (const cluster of topClusters) {
      lines.push(`- Template ${cluster.templateId || "?"}, ${cluster.size} situations: ${cluster.situationIds.join(", ")}`);
      lines.push(`  - Sample skeleton sentence: "${cluster.sampleSkeletonSentence}"`);
    }
  }
  lines.push("");

  lines.push("## Highest-risk templates/stories");
  lines.push("");
  const riskyTemplates = aggregates.filter((b) => !b.isContractTemplate && b.count > 0);
  if (riskyTemplates.length) {
    lines.push("Generic-fallback templates (expected reuse debt, monitor for growth):");
    riskyTemplates.forEach((b) => lines.push(`- ${b.templateId}: ${b.count} stories`));
  }
  lines.push("");
  const multiFailStories = scoredRecords.filter((r) => {
    let failCount = 0;
    if (r.dimensions.grounding.status !== "PASS") failCount += 1;
    if (r.dimensions.mechanismVisibility.status === "FAIL" || r.dimensions.mechanismVisibility.status === "WARNING") failCount += 1;
    if (r.dimensions.compressionQuality.status === "FLAG" || r.dimensions.compressionQuality.status === "WARNING") failCount += 1;
    return failCount >= 2;
  });
  lines.push(`Stories failing/warning on 2+ dimensions: ${multiFailStories.length}`);
  multiFailStories.slice(0, 30).forEach((r) => {
    lines.push(`- ${r.situationId} (${r.templateId || "no template"}) "${r.title}"`);
  });
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

    const { totalActiveSituations, records } = await collectWholeCorpus(page);

    // Dimensions computed OUTSIDE the browser, in plain Node.
    const scoredRecords = records.map((record) => {
      const grounding = scoreGrounding(record);
      const mechanismVisibility = scoreMechanismVisibility(record);
      const genericFallback = isGenericFallback(record.templateId);
      const compressionQuality = scoreCompressionQuality(record);
      return {
        situationId: record.situationId,
        title: record.title,
        templateId: record.templateId,
        templateName: record.templateName,
        resolveStatus: record.resolveStatus,
        lockedFinalStory: record.lockedFinalStory,
        buildError: record.buildError,
        situation: record.situation,
        context: record.context,
        storyText: record.storyText,
        pages: record.pages,
        eventActors: record.eventActors,
        compressedStory: record.compressedStory,
        completeStoryValidation: record.completeStoryValidation,
        storyQAReport: record.storyQAReport,
        productionQAReport: record.productionQAReport,
        dimensions: {
          grounding,
          mechanismVisibility,
          genericFallback,
          compressionQuality,
        },
      };
    });

    const reuseResult = classifyCrossStoryReuse(scoredRecords);
    const convergenceResult = findConvergenceClusters(scoredRecords);
    const templateCoverage = scoredRecords.map(templateCoverageRow);
    const aggregates = buildAggregates(scoredRecords);

    const jsonOutput = {
      generatedAt: new Date().toISOString(),
      note: "Prep tool output. Dimensions are intentionally not combined into a single score — see markdown scorecard note.",
      totalActiveSituations,
      records: scoredRecords,
      crossStoryReuse: {
        allReusedSentences: reuseResult.allReusedSentences,
        lowSeverity: reuseResult.lowSeverity,
        mediumSeverity: reuseResult.mediumSeverity,
        highSeverity: reuseResult.highSeverity,
        genericFallbackReuse: reuseResult.genericFallbackReuse,
      },
      convergenceClusters: convergenceResult.clusters,
      templateCoverage,
      aggregatesByTemplate: aggregates,
    };

    fs.writeFileSync(JSON_REPORT_PATH, JSON.stringify(jsonOutput, null, 2), "utf8");

    const markdown = buildMarkdown({ totalActiveSituations, scoredRecords, reuseResult, convergenceResult, aggregates });
    fs.writeFileSync(MD_REPORT_PATH, markdown, "utf8");

    console.log(`Whole-corpus content quality audit written:\n- ${JSON_REPORT_PATH}\n- ${MD_REPORT_PATH}`);
  } finally {
    await browser.close();
    server.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
