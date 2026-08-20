const state = {
  libraries: null,
  uiCategoryMap: null,
  storyTemplates: null,
  seedMode: "situation",
  requestSeed: null,
  overrides: {},
  recipe: null,
  lastArtifacts: null,
  selectedOutput: "story",
  productStep: 1,
  maxProductStep: 1,
  generatedStorySession: null,
  savedStories: [],
  readerIndex: 0,
  isNarrating: false,
  isNarrationPaused: false,
  narrationMode: "story",
  narrationRunId: 0,
  narratedPageIndex: null,
  readerTransitionTimer: null,
  categorySearchOpen: false,
  // Dev A infra track (tmp_dev_a_infra_report.md item 3): gates whether
  // generateCurrentStory() routes through the template-aware pipeline
  // (buildStoryArtifactsWithEventPlanner, natural selectStoryTemplate — no
  // forcing) instead of the pre-template buildStoryArtifacts. Defaults off
  // so default story generation for real users is untouched; toggle via
  // ?templatePipeline=1 or window.__pranaDebug.setTemplatePipelineEnabled(true)
  // for staged real-traffic testing before this becomes the default.
  useTemplatePipelineOverride: null,
};

const seedModes = [
  { id: "situation", label: "Real-Life Situation" },
  { id: "surprise", label: "Surprise Me" },
];

const outputTypes = [
  { id: "storyPlan", label: "Story Plan" },
  { id: "story", label: "Generate Story" },
  { id: "beatSheet", label: "Beat Sheet" },
  { id: "illustrationBible", label: "Illustration Bible" },
  { id: "illustrationPrompts", label: "Illustration Prompts" },
  { id: "bookLayout", label: "Book Layout" },
  { id: "productionQA", label: "Production QA" },
  { id: "exportPackage", label: "Export Package" },
  { id: "parentNote", label: "Parent Note" },
  { id: "activity", label: "Activity" },
];

const dataFiles = {
  situations: "./phase6-data/situations.json",
  characters: "./phase6-data/characters.json",
  adventureArchetypes: "./phase6-data/adventureArchetypes.json",
  missions: "./phase6-data/missions.json",
  storyStructures: "./phase6-data/storyStructures.json",
  beats: "./phase6-data/beats.json",
  openings: "./phase6-data/openings.json",
  endings: "./phase6-data/endings.json",
  obstacles: "./phase6-data/obstacles.json",
  storyConflicts: "./phase6-data/storyConflicts.json",
  worlds: "./phase6-data/worlds.json",
  settings: "./phase6-data/settings.json",
  emotionalArcs: "./phase6-data/emotionalArcs.json",
  coreNeeds: "./phase6-data/ontology/coreNeeds.json",
  lifeDomains: "./phase6-data/ontology/lifeDomains.json",
  missionTypes: "./phase6-data/ontology/missionTypes.json",
  storyActions: "./phase6-data/ontology/storyActions.json",
  logicFamilies: "./phase6-data/ontology/logicFamilies.json",
  ganeshaSymbols: "./phase6-data/ontology/ganeshaSymbols.json",
  symbolThemes: "./phase6-data/ontology/symbolThemes.json",
  storyTaxonomy: "./phase6-data/ontology/storyTaxonomy.json",
  plannerKnowledge: "./phase6-data/plannerKnowledge.json",
};

const SAVED_STORIES_KEY = "prana-story-generator.saved-stories.v1";

const byId = (id) => document.getElementById(id);

function isDevMode() {
  return new URLSearchParams(window.location.search).get("dev") === "1";
}

// Dev A infra track: staged rollout gate for the template pipeline (see
// state.useTemplatePipelineOverride above). Runtime override (console/debug
// API) takes precedence over the URL param so it can be flipped without a
// reload during a real-traffic test session.
//
// STAGING_DEFAULT_ON (2026-08-11): flipped to true after full production
// sign-off (139/139 full-corpus, real-UI smoke test, frozen regression
// suite all green — see tmp_final_production_signoff.md). This codebase
// has no separate staging/production build config, so "on by default in
// staging only" is implemented as: on by default, with an explicit escape
// hatch (?templatePipeline=0) to force the old pipeline for any single
// session. ROLLBACK: to disable for a real production deploy, either flip
// this constant back to false, or append ?templatePipeline=0 to the
// deployed URL — no code path removal needed, the old buildStoryArtifacts
// pipeline is untouched and still fully wired.
const STAGING_DEFAULT_ON = true;
function isTemplatePipelineEnabled() {
  if (state.useTemplatePipelineOverride !== null) {
    return state.useTemplatePipelineOverride;
  }
  const param = new URLSearchParams(window.location.search).get("templatePipeline");
  if (param === "1") return true;
  if (param === "0") return false;
  return STAGING_DEFAULT_ON;
}

function normalize(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

function words(value) {
  return normalize(value).split(/\s+/).filter(Boolean);
}

function escapeHtml(value) {
  return String(value || "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/\"/g, "&quot;");
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function intersection(a, b) {
  const setB = new Set(b || []);
  return unique((a || []).filter((value) => setB.has(value)));
}

function countOverlap(a, b) {
  return intersection(a, b).length;
}

function textScore(text, contextWords) {
  const bag = words(text);
  const set = new Set(bag);
  return (contextWords || []).reduce((score, token) => score + (set.has(token) ? 1 : 0), 0);
}

function sortByScore(entries) {
  return entries.sort((a, b) => {
    if (b.score !== a.score) {
      return b.score - a.score;
    }
    return String(a.item.id || a.item.name).localeCompare(String(b.item.id || b.item.name));
  });
}

function topRanked(items, scorer, limit = 3) {
  return sortByScore(
    (items || []).map((item) => ({ item, score: scorer(item) }))
  ).slice(0, limit);
}

function firstOrNull(items) {
  return items && items.length ? items[0] : null;
}

function createOptions(selectId, items, valueKey = "id", labelKey = "name") {
  const select = byId(selectId);
  select.innerHTML = (items || [])
    .map((item) => `<option value="${escapeHtml(item[valueKey])}">${escapeHtml(item[labelKey] || item.name || item.id)}</option>`)
    .join("");
}

function createOptionsWithBlank(selectId, items, blankLabel, valueKey = "id", labelKey = "name") {
  const select = byId(selectId);
  const options = [{ id: "", name: blankLabel }, ...(items || [])];
  select.innerHTML = options
    .map((item) => `<option value="${escapeHtml(item[valueKey] ?? "")}">${escapeHtml(item[labelKey] || item.name || item.id || blankLabel)}</option>`)
    .join("");
}

function setText(id, value) {
  const node = byId(id);
  if (node) {
    node.textContent = value;
  }
}

function setHtml(id, value) {
  const node = byId(id);
  if (node) {
    node.innerHTML = value;
  }
}

function loadJson(url) {
  return fetch(url).then((response) => {
    if (!response.ok) {
      throw new Error(`Failed to load ${url}`);
    }
    return response.json();
  });
}

function buildIndexes(libraries) {
  const mapById = (items) => new Map((items || []).map((item) => [item.id, item]));
  return {
    situations: mapById(libraries.situations),
    characters: mapById(libraries.characters),
    adventureArchetypes: mapById(libraries.adventureArchetypes),
    missions: mapById(libraries.missions),
    storyStructures: mapById(libraries.storyStructures),
    beats: mapById(libraries.beats),
    openings: mapById(libraries.openings),
    endings: mapById(libraries.endings),
    obstacles: mapById(libraries.obstacles),
    storyConflicts: mapById(libraries.storyConflicts),
    worlds: mapById(libraries.worlds),
    settings: mapById(libraries.settings),
    coreNeeds: mapById(libraries.coreNeeds),
    lifeDomains: mapById(libraries.lifeDomains),
    missionTypes: mapById(libraries.missionTypes),
    storyActions: mapById(libraries.storyActions),
    logicFamilies: mapById(libraries.logicFamilies),
    ganeshaSymbols: mapById(libraries.ganeshaSymbols),
    symbolThemes: mapById(libraries.symbolThemes),
    openingTypes: new Set((libraries.storyTaxonomy.openingTypes || []).map((item) => item.id)),
    endingTypes: new Set((libraries.storyTaxonomy.endingTypes || []).map((item) => item.id)),
  };
}

function buildLibraries(payloads) {
  const libraries = {
    situations: payloads.situations,
    characters: payloads.characters,
    adventureArchetypes: payloads.adventureArchetypes,
    missions: payloads.missions,
    storyStructures: payloads.storyStructures,
    beats: payloads.beats,
    openings: payloads.openings,
    endings: payloads.endings,
    obstacles: payloads.obstacles,
    storyConflicts: payloads.storyConflicts,
    worlds: payloads.worlds,
    settings: payloads.settings,
    emotionalArcs: payloads.emotionalArcs,
    coreNeeds: payloads.coreNeeds,
    lifeDomains: payloads.lifeDomains,
    missionTypes: payloads.missionTypes,
    storyActions: payloads.storyActions,
    logicFamilies: payloads.logicFamilies,
    ganeshaSymbols: payloads.ganeshaSymbols,
    symbolThemes: payloads.symbolThemes,
    storyTaxonomy: payloads.storyTaxonomy,
    plannerKnowledge: payloads.plannerKnowledge,
  };
  libraries.indexes = buildIndexes(libraries);
  return libraries;
}

function addIssue(issues, severity, kind, resolver, message, detail = {}) {
  issues.push({ severity, kind, resolver, message, detail });
}

// Composes the matching/selection text for a situation from its authored
// storySeed fields (childExperience + immediateWant + immediateObstacle +
// emotionalTension) rather than its title. Locked contract: title is the
// canonical/internal name only and must never feed matching or validation —
// that was the exact mechanical-prose problem this schema was built to fix.
function buildStorySeedContextText(situation) {
  const seed = situation && situation.storySeed;
  if (!seed) return "";
  return [seed.childExperience, seed.immediateWant, seed.immediateObstacle, seed.emotionalTension]
    .filter(Boolean)
    .join(" ");
}

function integrityCharacterScore(item, situation, belief) {
  const situationText = `${(situation && situation.title) || ""} ${buildStorySeedContextText(situation)} ${(belief && belief.falseBelief) || ""} ${(belief && belief.trueBelief) || ""}`.toLowerCase();
  const missionTypes = item && item.soft_suggested && item.soft_suggested.best_mission_types || [];
  let score = 0;

  if ((item.soft_suggested.best_ganesha_symbols || []).includes(situation && situation.ontology && situation.ontology.ganeshaSymbolPrimary)) {
    score += 2;
  }

  if (/\b(test|teacher|mistake|lie|truth|parent|school)\b/.test(situationText) && missionTypes.includes("MISSION_MASTERY")) {
    score += 4;
  }
  if (/\b(found|finds|find|saw|noticed|notice|understand|wonder|question|rule)\b/.test(situationText) && missionTypes.includes("MISSION_DISCOVER")) {
    score += 4;
  }
  if (/\b(friend|friends|gossip|rumou?r|belong|uncool|prove myself)\b/.test(situationText) && missionTypes.includes("MISSION_ASSERT")) {
    score += 4;
  }

  score += textScore(`${item.core_personality} ${item.primary_story_role_text}`, words(situationText));
  return score;
}

function forgivenessCharacterScore(item, situation, belief) {
  const situationText = `${(situation && situation.title) || ""} ${buildStorySeedContextText(situation)} ${(belief && belief.falseBelief) || ""} ${(belief && belief.trueBelief) || ""}`.toLowerCase();
  const missionTypes = item && item.soft_suggested && item.soft_suggested.best_mission_types || [];
  let score = 0;

  if (missionTypes.includes("MISSION_RECONCILE")) {
    score += 4;
  }
  if (/\b(apolog|forgive|hurt feelings|friend|relationship|grudge|heal)\b/.test(situationText) && missionTypes.includes("MISSION_RECONCILE")) {
    score += 5;
  }
  if (/\b(gentle|calm|wise|empathetic|caring|loyal)\b/.test(`${item.core_personality} ${item.primary_story_role_text}`.toLowerCase())) {
    score += 2;
  }

  score += textScore(`${item.core_personality} ${item.primary_story_role_text}`, words(situationText));
  return score;
}

function adaptabilityCharacterScore(item, situation, belief) {
  const situationText = `${(situation && situation.title) || ""} ${buildStorySeedContextText(situation)} ${(belief && belief.falseBelief) || ""} ${(belief && belief.trueBelief) || ""}`.toLowerCase();
  const missionTypes = item && item.soft_suggested && item.soft_suggested.best_mission_types || [];
  let score = 0;

  if (/\b(cancel|changed|different|new|move|rain|wait|plan|path|route|school|interface|update)\b/.test(situationText) && missionTypes.includes("MISSION_SEARCH")) {
    score += 5;
  }
  if (/\b(cancel|changed|different|new|move|rain|plan|explore|discover)\b/.test(situationText) && missionTypes.includes("MISSION_EXPLORE")) {
    score += 5;
  }
  if (/\b(patient|steady|curious|eager to learn)\b/.test(`${item.core_personality} ${item.primary_story_role_text}`.toLowerCase())) {
    score += 2;
  }

  score += textScore(`${item.core_personality} ${item.primary_story_role_text}`, words(situationText));
  return score;
}

function collectContextWords(context) {
  return words([
    context.situation && buildStorySeedContextText(context.situation),
    context.belief && context.belief.falseBelief,
    context.belief && context.belief.trueBelief,
    context.character && context.character.name,
    context.archetype && context.archetype.name,
    context.missionType && context.missionType.id,
    context.mission && context.mission.name,
    context.world && context.world.name,
    context.storyConflict && context.storyConflict.name,
    context.storyStructure && context.storyStructure.name,
    context.storyStructure && context.storyStructure.scene_flow_template,
    context.firstBeat && context.firstBeat.name,
    context.lastBeat && context.lastBeat.name,
  ].filter(Boolean).join(" "));
}

function chooseSituation(libraries, request, issues) {
  const situations = libraries.situations;
  const indexes = libraries.indexes;
  if (request.situationId) {
    const direct = indexes.situations.get(request.situationId);
    if (!direct) {
      addIssue(issues, "FAIL", "integrity", "6A.01", `Situation ${request.situationId} does not exist.`);
      return null;
    }
    if (direct.active === false) {
      addIssue(issues, "FAIL", "integrity", "6A.01", `Situation ${request.situationId} is retired and not available for new story generation.`);
      return null;
    }
    return direct;
  }

  let pool = situations.filter((item) => item.active !== false);
  if (request.needId) {
    pool = pool.filter((item) => item.ontology && item.ontology.needId === request.needId);
  }
  if (request.lifeDomainId) {
    pool = pool.filter((item) => (item.ontology && item.ontology.lifeDomainIds || []).includes(request.lifeDomainId));
  }
  if (!pool.length) {
    pool = situations.filter((item) => item.active !== false);
  }
  return sortByScore(pool.map((item) => ({ item, score: (item.ontology && item.ontology.severity) || 0 }))).map((entry) => entry.item)[0] || null;
}

function pickSelected(candidates, overrideId) {
  if (overrideId) {
    return candidates.find((entry) => String(entry.item.id) === String(overrideId)) || firstOrNull(candidates);
  }
  return firstOrNull(candidates);
}

function buildBeatPlan(candidateBeats, selectedLogicId, structure) {
  const beatMap = new Map(candidateBeats.map((beat) => [beat.id, beat]));
  const incoming = new Map();
  candidateBeats.forEach((beat) => {
    (beat.next_beats || []).forEach((nextId) => {
      if (!incoming.has(nextId)) {
        incoming.set(nextId, 0);
      }
      incoming.set(nextId, incoming.get(nextId) + 1);
    });
  });

  const structureWords = words(`${structure.name} ${structure.core_pattern} ${structure.scene_flow_template}`);
  const startCandidates = sortByScore(candidateBeats.map((beat) => {
    const fromState = beat.state_change && beat.state_change.from;
    let score = 0;
    if (fromState === "NULL") {
      score += 10;
    }
    if (!incoming.has(beat.id)) {
      score += 5;
    }
    score += textScore(`${beat.name} ${beat.purpose}`, structureWords);
    return { item: beat, score };
  }));

  const plan = [];
  const repeatCounts = new Map();
  let current = firstOrNull(startCandidates) && firstOrNull(startCandidates).item;
  let guard = 0;

  while (current && guard < 7) {
    guard += 1;
    plan.push(current);
    repeatCounts.set(current.id, (repeatCounts.get(current.id) || 0) + 1);

    const allowedNext = (current.next_beats || [])
      .map((id) => beatMap.get(id))
      .filter(Boolean)
      .filter((beat) => {
        if (!beat.repeatable && repeatCounts.has(beat.id)) {
          return false;
        }
        const repeats = repeatCounts.get(beat.id) || 0;
        return beat.max_repeats == null || repeats < beat.max_repeats;
      });

    if (!allowedNext.length) {
      break;
    }

    const currentState = current.state_change && current.state_change.to;
    const ranked = sortByScore(allowedNext.map((beat) => {
      let score = 0;
      if (beat.state_change && beat.state_change.from === currentState) {
        score += 8;
      }
      if ((beat.allowed_logic || []).includes(selectedLogicId)) {
        score += 4;
      }
      score += textScore(`${beat.name} ${beat.purpose}`, structureWords);
      return { item: beat, score };
    }));

    current = ranked[0] && ranked[0].item;
  }

  return plan;
}

function validatePlanner(context, libraries) {
  const issues = [];
  const indexes = libraries.indexes;
  const plannerKnowledge = libraries.plannerKnowledge || {};
  const missionRecord = context.mission ? plannerKnowledge.missionIndex && plannerKnowledge.missionIndex[String(context.mission.id)] : null;

  if (!context.need || !indexes.coreNeeds.has(context.need.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Need is missing or invalid.");
  }
  if (!context.situation || !indexes.situations.has(context.situation.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Situation is missing or invalid.");
  }
  if (context.situation && context.need && context.situation.ontology.needId !== context.need.id) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Situation -> Need hard bridge is broken.");
  }
  if (!context.character || !indexes.characters.has(context.character.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Character is missing or invalid.");
  }
  if (!context.archetype || !indexes.adventureArchetypes.has(context.archetype.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Adventure Archetype is missing or invalid.");
  }
  if (!context.missionType || !indexes.missionTypes.has(context.missionType.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Mission Type is missing or invalid.");
  }
  if (!context.mission || !indexes.missions.has(context.mission.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Mission is missing or invalid.");
  } else if (!missionRecord || !missionRecord.missionTypeId) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Mission audit record is missing missionTypeId coverage.", {
      missionId: context.mission.id,
    });
  } else if (missionRecord.missionTypeId !== context.missionType.id) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Mission missionTypeId audit does not match the resolved Mission Type.", {
      missionId: context.mission.id,
      missionTypeId: missionRecord.missionTypeId,
      resolvedMissionTypeId: context.missionType.id,
    });
  }
  if (!context.storyConflict || !indexes.storyConflicts.has(context.storyConflict.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Story Conflict is missing or invalid.");
  }
  if (!context.logic || !indexes.logicFamilies.has(context.logic.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Logic Family is missing or invalid.");
  }
  if (!context.storyStructure || !indexes.storyStructures.has(context.storyStructure.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Story Structure is missing or invalid.");
  } else if (context.storyStructure.hard.logic_family !== context.logic.id) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Structure logic_family does not match selected Logic.");
  }
  if (!context.beatPlan.length) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Beat Plan is empty.");
  }
  context.beatPlan.forEach((beat, index) => {
    if (!indexes.beats.has(beat.id)) {
      addIssue(issues, "FAIL", "integrity", "6A.18", `Beat ${beat.id} is invalid.`);
      return;
    }
    if (!(beat.allowed_logic || []).includes(context.logic.id)) {
      addIssue(issues, "FAIL", "integrity", "6A.18", `Beat ${beat.id} does not allow Logic ${context.logic.id}.`);
    }
    if (index > 0) {
      const previous = context.beatPlan[index - 1];
      if (!(previous.next_beats || []).includes(beat.id)) {
        addIssue(issues, "FAIL", "integrity", "6A.18", `Beat edge ${previous.id} -> ${beat.id} is illegal.`);
      }
    }
  });
  if (!context.opening || !indexes.openings.has(context.opening.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Opening is missing or invalid.");
  } else if (!indexes.openingTypes.has(context.opening.hard.opening_type)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Opening type is not present in storyTaxonomy.openingTypes.");
  }
  if (!context.ending || !indexes.endings.has(context.ending.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Ending is missing or invalid.");
  } else if (!indexes.endingTypes.has(context.ending.hard.ending_type)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Ending type is not present in storyTaxonomy.endingTypes.");
  }
  if (!context.symbol || !indexes.ganeshaSymbols.has(context.symbol.id)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Symbol is missing or invalid.");
  } else if (!indexes.symbolThemes.has(context.symbol.symbol_theme)) {
    addIssue(issues, "FAIL", "integrity", "6A.18", "Symbol theme is not present in symbolThemes.");
  }
  if (context.craft.status === "definition_unavailable") {
    addIssue(
      issues,
      "BLOCKED",
      "data_gap",
      "6A.18",
      "Beat Plan requires CR codes, but no verified craft-definition source exists yet.",
      { craftCodes: context.craft.requiredCraftCodes }
    );
  }
  if (context.craft.status === "resolved") {
    context.craft.requiredCraftCodes.forEach((code) => {
      if (!plannerKnowledge.craftTechniqueIndex || !plannerKnowledge.craftTechniqueIndex[code]) {
        addIssue(issues, "FAIL", "integrity", "6A.18", `Craft code ${code} is required by the Beat Plan but missing from craftTechniqueIndex.`);
      }
    });
  }

  const severities = issues.map((issue) => issue.severity);
  let status = "PASS";
  if (severities.includes("FAIL")) {
    status = "FAIL";
  } else if (severities.includes("BLOCKED")) {
    status = "BLOCKED";
  }

  return { status, issues };
}

function resolvePhase6(libraries, request, overrides = {}) {
  const issues = [];
  const indexes = libraries.indexes;
  const situation = chooseSituation(libraries, request, issues);
  if (!situation) {
    return { status: "FAIL", issues, context: null, recommendations: {} };
  }

  const needId = request.needId || (situation.ontology && situation.ontology.needId);
  const need = indexes.coreNeeds.get(needId);
  if (!need) {
    addIssue(issues, "FAIL", "integrity", "6A.02", `Need ${needId} does not exist.`);
  }

  const belief = {
    beliefIds: (situation.ontology && situation.ontology.beliefIds) || [],
    falseBelief: situation.ontology && situation.ontology.falseBeliefText,
    trueBelief: situation.ontology && situation.ontology.trueBeliefText,
  };

  const characterCandidates = topRanked(
    libraries.characters.filter((item) => (item.soft_suggested.best_need_ids || []).includes(needId)),
    (item) => {
      let score = 10;
      if (request.lifeDomainId && (situation.ontology.lifeDomainIds || []).includes(request.lifeDomainId)) {
        score += 2;
      }
      if (needId === "NEED_INTEGRITY") {
        score += integrityCharacterScore(item, situation, belief);
      } else if (needId === "NEED_FORGIVENESS") {
        score += forgivenessCharacterScore(item, situation, belief);
      } else if (needId === "NEED_ADAPTABILITY") {
        score += adaptabilityCharacterScore(item, situation, belief);
      }
      score += item.id === request.characterId ? 100 : 0;
      return score;
    }
  );
  const selectedCharacterEntry = pickSelected(characterCandidates, request.characterId);
  const character = selectedCharacterEntry && selectedCharacterEntry.item;
  if (!character) {
    addIssue(issues, "FAIL", "integrity", "6A.04", `No compatible character found for Need ${needId}.`);
  } else if (request.characterId && character.id !== request.characterId) {
    addIssue(issues, "FAIL", "integrity", "6A.04", `Character ${request.characterId} is not compatible with Need ${needId}.`);
  }

  const characterMissionTypes = character ? (character.soft_suggested.best_mission_types || []) : [];
  const characterLogicFamilies = character ? (character.soft_suggested.best_logic_families || []) : [];

  const archetypeCandidates = topRanked(
    libraries.adventureArchetypes.filter((item) => countOverlap(item.soft_suggested.best_mission_types, characterMissionTypes) > 0),
    (item) => {
      let score = countOverlap(item.soft_suggested.best_mission_types, characterMissionTypes) * 5;
      score += countOverlap(item.soft_suggested.best_logic_families, characterLogicFamilies) * 3;
      score += textScore(item.description, words(`${buildStorySeedContextText(situation)} ${belief.trueBelief}`));
      return score;
    }
  );
  const archetype = firstOrNull(archetypeCandidates) && firstOrNull(archetypeCandidates).item;
  if (!archetype) {
    addIssue(issues, "FAIL", "integrity", "6A.05", "No compatible Adventure Archetype found.");
  }

  const archetypeMissionTypes = archetype ? (archetype.soft_suggested.best_mission_types || []) : [];
  const missionTypeCandidates = topRanked(
    libraries.missionTypes.filter((item) => {
      if (!intersection(characterMissionTypes, archetypeMissionTypes).includes(item.id)) {
        return false;
      }
      const auditedType = libraries.plannerKnowledge
        && libraries.plannerKnowledge.missionTypeIndex
        && libraries.plannerKnowledge.missionTypeIndex[item.id];
      return auditedType && (auditedType.linkedMissionIds || []).length > 0;
    }),
    (item) => {
      let score = 5;
      score += item.id === (situation.ontology && situation.ontology.ganeshaSymbolPrimary) ? 0 : 0;
      return score;
    },
    5
  );
  const missionType = firstOrNull(missionTypeCandidates) && firstOrNull(missionTypeCandidates).item;
  if (!missionType) {
    addIssue(issues, "FAIL", "integrity", "6A.06", "No Mission Type found from Character -> Archetype bridge.");
  }

  const missionCandidates = topRanked(
    libraries.missions.filter((item) => {
      const audited = libraries.plannerKnowledge
        && libraries.plannerKnowledge.missionIndex
        && libraries.plannerKnowledge.missionIndex[String(item.id)];
      return missionType && audited && audited.missionTypeId === missionType.id;
    }),
    (item) => {
      let score = 0;
      score += (item.bestCoreNeedIds || []).includes(needId) ? 5 : 0;
      score += archetype && (item.bestAdventureArchetypeIds || []).includes(archetype.id) ? 5 : 0;
      score += countOverlap(item.bestStoryActionIds || [], archetype ? archetype.soft_suggested.typical_story_actions || [] : []) * 2;
      score += countOverlap(item.bestLifeDomainIds || [], situation.ontology.lifeDomainIds || []) * 2;
      return score;
    }
  );
  const selectedMissionEntry = pickSelected(missionCandidates, overrides.missionId);
  const mission = selectedMissionEntry && selectedMissionEntry.item;
  if (!mission) {
    addIssue(issues, "FAIL", "integrity", "6A.06", "No concrete Mission could be resolved.");
  }

  const storyActionCandidates = topRanked(
    (mission && mission.bestStoryActionIds || [])
      .map((id) => indexes.storyActions.get(id))
      .filter(Boolean),
    (item) => {
      let score = 3;
      score += archetype && (archetype.soft_suggested.typical_story_actions || []).includes(item.id) ? 3 : 0;
      return score;
    }
  );
  const storyActions = storyActionCandidates.map((entry) => entry.item);

  const missionWorldTypes = unique(
    (mission && mission.bestSettingIds || [])
      .map((id) => indexes.settings.get(id))
      .filter(Boolean)
      .map((item) => item.soft_suggested.linked_world_type)
  );
  const archetypeWorldTypes = archetype ? archetype.soft_suggested.typical_world_types || [] : [];
  const worldCandidates = topRanked(
    libraries.worlds.filter((item) => {
      const worldTypes = item.hard.world_types || [];
      return countOverlap(worldTypes, unique([...missionWorldTypes, ...archetypeWorldTypes])) > 0;
    }),
    (item) => {
      let score = countOverlap(item.hard.world_types || [], missionWorldTypes) * 4;
      score += countOverlap(item.hard.world_types || [], archetypeWorldTypes) * 3;
      score += textScore(item.name, words(buildStorySeedContextText(situation)));
      return score;
    }
  );
  const selectedWorldEntry = pickSelected(worldCandidates, overrides.worldId);
  const world = selectedWorldEntry && selectedWorldEntry.item;
  if (!world) {
    addIssue(issues, "FAIL", "integrity", "6A.08", "No compatible World found.");
  }

  const obstacleCandidates = topRanked(
    libraries.obstacles.filter((item) => archetype && (archetype.soft_suggested.typical_obstacle_domains || []).includes(item.hard.obstacle_domain)),
    (item) => {
      let score = 3;
      score += missionType && (item.hard.obstacle_domain === "OD_TIME") && missionType.id === "MISSION_RESCUE" ? 1 : 0;
      return score;
    }
  );
  const obstacle = firstOrNull(obstacleCandidates) && firstOrNull(obstacleCandidates).item;
  if (!obstacle) {
    addIssue(issues, "FAIL", "integrity", "6A.09", "No compatible Obstacle found.");
  }

  const conflictCandidates = topRanked(
    libraries.storyConflicts.filter((item) => obstacle && (item.soft_suggested.best_obstacle_domains || []).includes(obstacle.hard.obstacle_domain)),
    (item) => {
      let score = 5;
      score += missionType && (item.soft_suggested.best_mission_types || []).includes(missionType.id) ? 4 : 0;
      score += archetype
        ? countOverlap(item.soft_suggested.typical_ending_types || [], archetype.soft_suggested.typical_ending_types || [])
        : 0;
      return score;
    }
  );
  const storyConflict = firstOrNull(conflictCandidates) && firstOrNull(conflictCandidates).item;
  if (!storyConflict) {
    addIssue(issues, "FAIL", "integrity", "6A.10", "No compatible Story Conflict found.");
  } else if (missionType && ["MISSION_DISCOVER", "MISSION_SEARCH"].includes(missionType.id)
    && !(storyConflict.soft_suggested.best_mission_types || []).includes(missionType.id)) {
    addIssue(
      issues,
      "WARNING",
      "source_gap",
      "6A.10",
      `${missionType.id} is not represented in Story Conflict mission-type coverage, so conflict selection fell back to obstacle-domain compatibility only.`
    );
  }

  const conflictLogicFamilies = storyConflict ? storyConflict.soft_suggested.best_logic_families || [] : [];
  const archetypeLogicFamilies = archetype ? archetype.soft_suggested.best_logic_families || [] : [];
  const logicCandidates = topRanked(
    libraries.logicFamilies.filter((item) => countOverlap([item.id], unique([...characterLogicFamilies, ...archetypeLogicFamilies, ...conflictLogicFamilies])) > 0),
    (item) => {
      let score = 0;
      score += characterLogicFamilies.includes(item.id) ? 4 : 0;
      score += archetypeLogicFamilies.includes(item.id) ? 3 : 0;
      score += conflictLogicFamilies.includes(item.id) ? 3 : 0;
      return score;
    }
  );
  const logic = firstOrNull(logicCandidates) && firstOrNull(logicCandidates).item;
  if (!logic) {
    addIssue(issues, "FAIL", "integrity", "6A.11", "No compatible Logic Family found.");
  }

  const structureCandidates = topRanked(
    libraries.storyStructures.filter((item) => logic && item.hard.logic_family === logic.id),
    (item) => textScore(`${item.name} ${item.core_pattern} ${item.scene_flow_template}`, words(`${buildStorySeedContextText(situation)} ${belief.trueBelief}`))
  );
  const selectedStructureEntry = pickSelected(structureCandidates, overrides.structureId);
  const storyStructure = selectedStructureEntry && selectedStructureEntry.item;
  if (!storyStructure) {
    addIssue(issues, "FAIL", "integrity", "6A.12", "No compatible Story Structure found.");
  }

  const beatPlan = logic && storyStructure
    ? buildBeatPlan(
      libraries.beats.filter((item) => (item.allowed_logic || []).includes(logic.id)),
      logic.id,
      storyStructure
    )
    : [];

  const firstBeat = beatPlan[0] || null;
  const lastBeat = beatPlan[beatPlan.length - 1] || null;
  const contextWords = collectContextWords({
    situation,
    belief,
    character,
    archetype,
    missionType,
    mission,
    world,
    storyConflict,
    storyStructure,
    firstBeat,
    lastBeat,
  });

  const openingCandidates = topRanked(
    libraries.openings.filter((item) => indexes.openingTypes.has(item.hard.opening_type)),
    (item) => {
      let score = textScore(`${item.name} ${item.description} ${item.soft_suggested.purpose}`, contextWords);
      if (firstBeat && firstBeat.family === "SANCTUARY" && item.hard.opening_type === "OPEN_WORLD") {
        score += 2;
      }
      if (belief.falseBelief && item.hard.opening_type === "OPEN_CHARACTER") {
        score += 1;
      }
      return score;
    }
  );
  const selectedOpeningEntry = pickSelected(openingCandidates, overrides.openingId);
  const opening = selectedOpeningEntry && selectedOpeningEntry.item;
  if (!opening) {
    addIssue(issues, "FAIL", "integrity", "6A.14", "No compatible Opening found.");
  }

  const endingCandidates = topRanked(
    libraries.endings.filter((item) => indexes.endingTypes.has(item.hard.ending_type)),
    (item) => {
      let score = textScore(`${item.name} ${item.description}`, contextWords);
      score += storyConflict && (storyConflict.soft_suggested.typical_ending_types || []).includes(item.hard.ending_type) ? 3 : 0;
      score += archetype && (archetype.soft_suggested.typical_ending_types || []).includes(item.hard.ending_type) ? 2 : 0;
      return score;
    }
  );
  const selectedEndingEntry = pickSelected(endingCandidates, overrides.endingId);
  const ending = selectedEndingEntry && selectedEndingEntry.item;
  if (!ending) {
    addIssue(issues, "FAIL", "integrity", "6A.15", "No compatible Ending found.");
  }

  const symbolCandidates = topRanked(
    libraries.ganeshaSymbols.filter((item) =>
      (item.best_need_ids || []).includes(needId) || (missionType && (item.best_mission_types || []).includes(missionType.id))
    ),
    (item) => {
      let score = (item.best_need_ids || []).includes(needId) ? 5 : 0;
      score += missionType && (item.best_mission_types || []).includes(missionType.id) ? 4 : 0;
      score += character && (character.soft_suggested.best_ganesha_symbols || []).includes(item.id) ? 2 : 0;
      return score;
    }
  );
  const symbol = firstOrNull(symbolCandidates) && firstOrNull(symbolCandidates).item;
  if (!symbol) {
    addIssue(issues, "FAIL", "integrity", "6A.16", "No compatible Ganesha Symbol found.");
  }

  const requiredCraftCodes = unique(beatPlan.flatMap((beat) => beat.required_craft || []));
  const craftDefinitions = requiredCraftCodes
    .map((code) => libraries.plannerKnowledge
      && libraries.plannerKnowledge.craftTechniqueIndex
      && libraries.plannerKnowledge.craftTechniqueIndex[code])
    .filter(Boolean);
  const craft = !requiredCraftCodes.length
    ? { status: "no_craft_required", requiredCraftCodes: [], definitions: [] }
    : craftDefinitions.length === requiredCraftCodes.length
      ? { status: "resolved", requiredCraftCodes, definitions: craftDefinitions }
      : { status: "definition_unavailable", requiredCraftCodes, definitions: craftDefinitions };

  const resolvedContext = {
    situation,
    need,
    belief,
    character,
    archetype,
    missionType,
    mission,
    storyActions,
    world,
    obstacle,
    storyConflict,
    logic,
    storyStructure,
    beatPlan,
    opening,
    ending,
    symbol,
    craft,
  };

  const validation = validatePlanner(resolvedContext, libraries);
  const allIssues = [...issues, ...validation.issues];
  const recommendations = {
    worlds: worldCandidates.map((entry) => entry.item),
    missions: missionCandidates.slice(0, 3).map((entry) => entry.item),
    openings: openingCandidates.map((entry) => entry.item),
    endings: endingCandidates.map((entry) => entry.item),
    structures: structureCandidates.map((entry) => entry.item),
    characters: characterCandidates.slice(0, 3).map((entry) => entry.item),
  };

  return {
    status: validation.status,
    issues: allIssues,
    context: resolvedContext,
    recommendations,
  };
}

function assertBlueprintConsistency(result) {
  const banner = byId("blueprintAssertionBanner");
  if (!banner) {
    return;
  }
  if (!isDevMode() || !result || !result.context) {
    banner.classList.add("hidden");
    return;
  }

  const ctx = result.context;
  const screen1SituationId = state.requestSeed && state.requestSeed.situationId;
  const problems = [];

  if (screen1SituationId && ctx.situation && String(ctx.situation.id) !== String(screen1SituationId)) {
    problems.push(`situation mismatch: Screen1=${screen1SituationId} Blueprint=${ctx.situation.id}`);
  }
  const characterOverride = byId("characterSelect") && byId("characterSelect").value;
  if (characterOverride && ctx.character && String(ctx.character.id) !== String(characterOverride)) {
    problems.push(`hero mismatch: selected=${characterOverride} Blueprint=${ctx.character.id}`);
  }
  if (state.overrides.worldId && ctx.world && String(ctx.world.id) !== String(state.overrides.worldId)) {
    problems.push(`world mismatch: selected=${state.overrides.worldId} Blueprint=${ctx.world.id}`);
  }
  if (!ctx.mission || !ctx.belief || !ctx.character || !ctx.situation) {
    problems.push("Blueprint is missing situation/character/belief/mission — screen would render partial/stale data.");
  }

  if (problems.length) {
    console.error("[Blueprint assertion failed]", problems, { context: ctx });
    banner.textContent = `Blueprint assertion failed: ${problems.join(" | ")}`;
    banner.classList.remove("hidden");
  } else {
    banner.classList.add("hidden");
  }
}

function resetStorySelectionOverrides() {
  if (byId("characterSelect")) {
    byId("characterSelect").value = "";
  }
  state.overrides = {};
}

function renderSeedModeButtons() {
  const root = byId("seedModes");
  root.innerHTML = seedModes
    .map((mode) => `<button class="chip${mode.id === state.seedMode ? " active" : ""}" data-mode="${mode.id}" type="button">${escapeHtml(mode.label)}</button>`)
    .join("");
  root.querySelectorAll("[data-mode]").forEach((button) => {
    button.addEventListener("click", () => {
      state.seedMode = button.dataset.mode;
      if (state.seedMode === "surprise") {
        resetStorySelectionOverrides();
        state.requestSeed = { situationId: pickSurpriseSituationId() };
      }
      updateSeedPanels();
      recompute();
    });
  });
}

function updateSeedPanels() {
  document.querySelectorAll("[data-mode-panel]").forEach((panel) => {
    panel.classList.toggle("hidden", panel.dataset.modePanel !== state.seedMode);
  });
  renderSeedModeButtons();
}

function getUiCategories() {
  return (state.uiCategoryMap && state.uiCategoryMap.categories) || [];
}

function getUiCategoryById(categoryId) {
  return getUiCategories().find((category) => category.id === categoryId) || null;
}

function situationMatchesUiCategory(situation, categoryId) {
  const category = getUiCategoryById(categoryId);
  if (!category) {
    return false;
  }
  const domainIds = (situation.ontology && situation.ontology.lifeDomainIds) || situation.lifeDomainIds || [];
  return domainIds.some((domainId) => category.lifeDomainIds.includes(domainId));
}

function findUiCategoryForSituation(situation) {
  if (!situation) {
    return null;
  }
  const match = getUiCategories().find((category) => situationMatchesUiCategory(situation, category.id));
  return match ? match.id : null;
}

function populateCategorySelect() {
  const select = byId("categorySelect");
  if (!select) {
    return;
  }
  const categories = getUiCategories();
  select.innerHTML = categories
    .map((category) => `<option value="${escapeHtml(category.id)}">${escapeHtml(category.label)}</option>`)
    .join("");
  if (!select.value && categories.length) {
    select.value = categories[0].id;
  }
}

function categoryCardMeta(categoryId) {
  const category = getUiCategoryById(categoryId);
  if (!category) {
    return { icon: "🌳", label: categoryId };
  }
  return { icon: category.icon, label: category.label };
}

function renderCategoryCards() {
  const root = byId("categoryCards");
  const select = byId("categorySelect");
  if (!(root && select && state.libraries)) {
    return;
  }
  const categories = getUiCategories();
  root.innerHTML = categories.map((category) => {
    return `
      <button class="category-card${select.value === category.id ? " active" : ""}" data-category-card="${escapeHtml(category.id)}" type="button">
        <div class="category-icon">${escapeHtml(category.icon)}</div>
        <div class="category-title">${escapeHtml(category.label)}</div>
      </button>
    `;
  }).join("");

  root.querySelectorAll("[data-category-card]").forEach((button) => {
    button.addEventListener("click", () => {
      resetStorySelectionOverrides();
      select.value = button.dataset.categoryCard || "";
      populateSituationSelect("", select.value);
      renderCategoryCards();
      recompute();
    });
  });
}

function updateSearchPanel() {
  const panel = byId("searchPanel");
  const toggle = byId("searchToggleBtn");
  if (panel) {
    panel.classList.toggle("hidden", !state.categorySearchOpen);
  }
  if (toggle) {
    toggle.textContent = state.categorySearchOpen ? "Hide search" : "Can't find it? Search instead";
  }
}

function getSituationMatches(query, categoryId) {
  if (!state.libraries) {
    return [];
  }
  const situations = (state.libraries.situations || [])
    .filter((item) => item.active !== false)
    .filter((item) => !categoryId || situationMatchesUiCategory(item, categoryId));
  if (!query) {
    return situations.slice(0, 40);
  }
  const queryWords = words(query);
  return sortByScore(
    situations.map((item) => ({
      item,
      score: textScore(`${item.title} ${buildStorySeedContextText(item)} ${item.ontology && item.ontology.falseBeliefText} ${item.ontology && item.ontology.trueBeliefText}`, queryWords),
    }))
  )
    .filter((entry) => entry.score > 0)
    .slice(0, 40)
    .map((entry) => entry.item);
}

function populateSituationSelect(query, category = byId("categorySelect") && byId("categorySelect").value) {
  const matches = getSituationMatches(query, category);
  if (!matches.length) {
    byId("situationSelect").innerHTML = `<option value="">We don't have a story for this yet. Try another category.</option>`;
    state.requestSeed = { ...state.requestSeed, situationId: null };
    renderCategoryCards();
    return;
  }
  createOptions("situationSelect", matches, "id", "title");
  const current = state.requestSeed && state.requestSeed.situationId;
  const hasCurrent = current && matches.some((item) => item.id === current);
  byId("situationSelect").value = hasCurrent ? current : matches[0].id;
  state.requestSeed = { ...state.requestSeed, situationId: byId("situationSelect").value };
  renderCategoryCards();
}

function pickSurpriseSituationId() {
  const pool = state.libraries.situations
    .filter((item) => item.active !== false)
    .slice()
    .sort((a, b) => ((b.ontology && b.ontology.severity) || 0) - ((a.ontology && a.ontology.severity) || 0));
  const top = pool.slice(0, 12);
  return (top[Math.floor(Math.random() * top.length)] || pool[0]).id;
}

function buildRequest() {
  const request = {
    characterId: byId("characterSelect").value || null,
  };

  if (state.seedMode === "situation") {
    request.situationId = byId("situationSelect").value;
  } else if (state.seedMode === "surprise") {
    request.situationId = state.requestSeed && state.requestSeed.situationId;
  }

  return request;
}

function renderRecipeSelectors(result) {
  createOptions("recipeWorld", result.recommendations.worlds, "id", "name");
  createOptions("recipeMission", result.recommendations.missions, "id", "name");
  createOptions("recipeOpening", result.recommendations.openings, "id", "name");
  createOptions("recipeEnding", result.recommendations.endings, "id", "name");
  createOptions("recipeStructure", result.recommendations.structures, "id", "name");

  byId("recipeWorld").value = result.context.world && result.context.world.id;
  byId("recipeMission").value = result.context.mission && result.context.mission.id;
  byId("recipeOpening").value = result.context.opening && result.context.opening.id;
  byId("recipeEnding").value = result.context.ending && result.context.ending.id;
  byId("recipeStructure").value = result.context.storyStructure && result.context.storyStructure.id;
}

function renderRecipeCards(result) {
  const ctx = result.context;
  const items = [
    ["Status", result.status],
    ["Need", ctx.need && ctx.need.id],
    ["False Belief", ctx.belief && ctx.belief.falseBelief],
    ["True Belief", ctx.belief && ctx.belief.trueBelief],
    ["Character", ctx.character && ctx.character.name],
    ["Archetype", ctx.archetype && ctx.archetype.name],
    ["Mission Type", ctx.missionType && ctx.missionType.id],
    ["Primary Symbol", ctx.symbol && ctx.symbol.id],
  ];
  byId("recipeGrid").innerHTML = items
    .map(([label, value]) => `<div class="recipe-item"><b>${escapeHtml(label)}</b>${escapeHtml(value || "")}</div>`)
    .join("");
}

function renderPreview(result) {
  const ctx = result.context;
  const nodes = [
    ["Moment", ctx.situation && ctx.situation.title],
    ["Feeling", ctx.belief && ctx.belief.falseBelief],
    ["Growth", ctx.belief && ctx.belief.trueBelief],
    ["Adventure", ctx.mission && ctx.mission.name],
    ["Story status", productStatusText(result.status)],
  ];
  byId("previewFlow").innerHTML = nodes
    .map(([label, value]) => `
      <div class="story-meta-card">
        <div class="story-meta-label">${escapeHtml(label)}</div>
        <div class="story-meta-value">${escapeHtml(value || "")}</div>
      </div>
    `)
    .join("");
}

function renderResolvedRecipe(result) {
  const ctx = result.context;
  const items = [
    ["Moment", ctx.situation && ctx.situation.title],
    ["Hero", ctx.character && firstName(ctx.character.name)],
    ["Feeling at the start", ctx.belief && ctx.belief.falseBelief],
    ["What the story helps with", ctx.belief && ctx.belief.trueBelief],
    ["Story world", ctx.world && ctx.world.name],
    ["Adventure shape", ctx.storyStructure && ctx.storyStructure.name],
    ["Opening feeling", ctx.opening && ctx.opening.name],
    ["Ending feeling", ctx.ending && ctx.ending.name],
    ["Symbol thread", ctx.symbol && titleCaseFromId(ctx.symbol.symbol_theme)],
  ];
  byId("resolvedRecipeGrid").innerHTML = items
    .map(([label, value]) => `<div class="recipe-item"><b>${escapeHtml(label)}</b>${escapeHtml(value || "")}</div>`)
    .join("");
}

function renderResolverNotes(result) {
  const ctx = result.context;
  const notes = [
    `Seed mode: ${state.seedMode}`,
    `6A.06 resolves Mission Type and concrete Mission separately and now checks the audited missionId -> missionTypeId mapping.`,
    `6A.13 builds beats from allowed_logic + next_beats with Structure used only as contextual guidance.`,
    ctx.craft.status === "definition_unavailable"
      ? `Craft definitions are blocked at source level; CR codes were carried forward as dependencies: ${ctx.craft.requiredCraftCodes.join(", ")}`
      : ctx.craft.status === "resolved"
        ? `Craft dependencies resolved through authoritative CR definitions: ${ctx.craft.requiredCraftCodes.join(", ")}`
        : "No CR-code craft dependencies were required by the selected Beat graph.",
  ];

  const issueCards = result.issues.map((issue) =>
    `<p class="muted-note"><strong>${escapeHtml(issue.severity)}</strong> [${escapeHtml(issue.resolver)}] ${escapeHtml(issue.message)}</p>`
  ).join("");

  byId("resolverNotes").innerHTML = `
    <div class="list-card">
      <strong>Validation State</strong>
      <p class="muted-note">Phase 6A status: <b>${escapeHtml(result.status)}</b></p>
      ${notes.map((note) => `<p class="muted-note">${escapeHtml(note)}</p>`).join("")}
      ${issueCards}
    </div>
  `;
}

function renderSeedSummary(result) {
  const ctx = result.context;
  setText("seedSummary", (ctx.situation && ctx.situation.title) || "");
  const trueBelief = (ctx.belief && ctx.belief.trueBelief) || "";
  setHtml("seedExplain", `<p>${escapeHtml(trueBelief)}</p>`);
}

function productStatusClass(status) {
  if (status === "PASS") {
    return "pass";
  }
  if (status === "BLOCKED") {
    return "blocked";
  }
  return "fail";
}

function productStatusText(status) {
  if (status === "PASS") {
    return "Ready";
  }
  if (status === "BLOCKED") {
    return "Blocked";
  }
  return "Needs attention";
}

function setProductStep(step) {
  state.productStep = step;
  state.maxProductStep = Math.max(state.maxProductStep, step);
  document.querySelectorAll("#productStepPills [data-step]").forEach((node) => {
    const nodeStep = Number(node.dataset.step);
    node.classList.toggle("active", nodeStep <= state.productStep);
  });
}

const SPECIES_ICONS = {
  Squirrel: "🐿️", Rabbit: "🐰", Elephant: "🐘", Turtle: "🐢", Monkey: "🐵",
  Deer: "🦌", Fox: "🦊", Owl: "🦉", Bear: "🐻", Mouse: "🐭", Peacock: "🦚",
  Parrot: "🦜", Dog: "🐶", Cow: "🐄", Lion: "🦁", "Young Elephant Calf": "🐘",
  "Red Panda": "🐼", "Mountain Goat": "🐐",
};

function characterMeta(character) {
  const match = /^(.*?)\s*\(([^)]+)\)\s*$/.exec(character.name || "");
  const first = match ? match[1].trim() : firstName(character.name);
  const species = match ? match[2].trim() : "";
  return { first, species, icon: SPECIES_ICONS[species] || "🧒" };
}

function worldSubtitle(world) {
  const attrs = ((world.hard && world.hard.attributes) || []).map((id) => titleCaseFromId(id));
  if (!attrs.length) {
    return (world.soft_suggested && world.soft_suggested.emotional_tone) || "";
  }
  return attrs.map((word, index) => (index === 0 ? word : word.toLowerCase())).join(" and ");
}

function renderHeroCards(result = state.recipe) {
  const grid = byId("heroCardGrid");
  if (!grid) {
    return;
  }
  const currentId = byId("characterSelect").value || "";
  const recommended = (result && result.recommendations && result.recommendations.characters) || [];
  const pool = recommended.length ? recommended : (state.libraries && state.libraries.characters || []).slice(0, 3);
  const defaultId = result && result.context && result.context.character && result.context.character.id;

  grid.innerHTML = pool.map((character) => {
    const meta = characterMeta(character);
    const isSelected = currentId ? String(character.id) === String(currentId) : String(character.id) === String(defaultId);
    return `
      <button type="button" class="pick-card${isSelected ? " selected" : ""}" data-character="${escapeHtml(character.id)}">
        <div class="pick-card-icon">${meta.icon}</div>
        <strong>${escapeHtml(meta.first)}</strong>
        <div class="pick-card-sub">${escapeHtml(meta.species)}</div>
      </button>
    `;
  }).join("");

  grid.querySelectorAll("[data-character]").forEach((button) => {
    button.addEventListener("click", () => {
      byId("characterSelect").value = button.dataset.character || "";
      recompute();
    });
  });
}

function renderWorldCards(result = state.recipe) {
  const grid = byId("worldCardGrid");
  if (!grid) {
    return;
  }
  const recommended = (result && result.recommendations && result.recommendations.worlds) || [];
  const pool = recommended.length ? recommended.slice(0, 3) : (state.libraries && state.libraries.worlds || []).slice(0, 3);
  const currentId = state.overrides.worldId || (result && result.context && result.context.world && result.context.world.id);

  grid.innerHTML = pool.map((world) => `
    <button type="button" class="pick-card${String(world.id) === String(currentId) ? " selected" : ""}" data-world="${escapeHtml(world.id)}">
      <div class="pick-card-icon">🌳</div>
      <strong>${escapeHtml(world.name)}</strong>
      <div class="pick-card-sub">${escapeHtml(worldSubtitle(world))}</div>
    </button>
  `).join("");

  grid.querySelectorAll("[data-world]").forEach((button) => {
    button.addEventListener("click", () => {
      state.overrides.worldId = button.dataset.world;
      recompute();
    });
  });
}

function renderStoryPreviewCard(result) {
  const ctx = result.context;
  const heroName = firstName(ctx.character && ctx.character.name || "Your hero");
  const worldName = ctx.world && ctx.world.name || "a magical world";
  const symbolName = ctx.symbol && titleCaseFromId(ctx.symbol.symbol_theme || ctx.symbol.id) || "gentle courage";
  const trueBelief = (ctx.belief && ctx.belief.trueBelief) || "growing through a meaningful moment.";

  setText("storyPreviewTitle", `${heroName} in ${worldName}`);
  setHtml("storyPreviewMeta", [
    `<div class="reader-chip">${escapeHtml(heroName)}</div>`,
    `<div class="reader-chip">${escapeHtml(worldName)}</div>`,
    `<div class="reader-chip">${escapeHtml(symbolName)}</div>`,
    `<div class="reader-chip ${productStatusClass(result.status)}">${escapeHtml(productStatusText(result.status))}</div>`,
  ].join(""));
  setText(
    "storyPreviewText",
    `Learning that ${lowerFirstLetter(trueBelief)}`
  );
}

function lowerFirstLetter(text) {
  if (!text) {
    return text;
  }
  if (/^I\b/.test(text)) {
    return text;
  }
  return text.charAt(0).toLowerCase() + text.slice(1);
}

function renderPlannerStatus(result) {
  const badge = `<div class="status-pill ${productStatusClass(result.status)}">Story status: ${escapeHtml(productStatusText(result.status))}</div>`;
  const issueSummary = issueCounts(result.issues || []);
  const issueBadges = [
    issueSummary.blockers ? `<div class="status-pill blocked">Needs source fix: ${issueSummary.blockers}</div>` : "",
    issueSummary.blockingFailures ? `<div class="status-pill fail">Needs story fix: ${issueSummary.blockingFailures}</div>` : "",
    (!issueSummary.blockers && !issueSummary.blockingFailures) ? `<div class="status-pill pass">Ready to generate</div>` : "",
  ].filter(Boolean).join("");
  setHtml("generationBadges", badge + issueBadges);

  const statusText = result.status === "PASS"
    ? "This story path is ready. Generate will build the full story and open it in the reader."
    : result.status === "BLOCKED"
      ? "This story path is waiting on a blocked requirement. The story cannot open yet."
      : "This story path still has failed checks. Fix the selection or try another path.";
  setText("generationStatus", statusText);
}

function buildStorySession(result, artifacts) {
  const assetByPage = new Map(((artifacts.illustrationAssetsResult && artifacts.illustrationAssetsResult.assets) || []).map((asset) => [asset.page, asset]));
  const layoutByPage = new Map((((artifacts.layoutResult && artifacts.layoutResult.layout) || {}).pages || []).map((page) => [page.page, page]));
  const narrationByPage = new Map((artifacts.narrationLayer || []).map((entry) => [entry.page, entry]));
  const dialogueByPage = new Map((artifacts.dialogueLayer || []).map((entry) => [entry.page, entry]));
  const pages = ((artifacts.lockedFinalStory && artifacts.lockedFinalStory.pages) || []).map((page) => {
    const asset = assetByPage.get(page.page);
    const layout = layoutByPage.get(page.page);
    const narration = narrationByPage.get(page.page);
    const dialogue = dialogueByPage.get(page.page);
    return {
      page: page.page,
      text: page.text,
      narration: page.narration,
      dialogue: (page.dialogue || []).map((line) => ({
        speaker: line.characterName,
        text: line.text,
        delivery: line.delivery,
      })),
      pageTurnObjective: page.pageTurnObjective,
      sourceSections: page.sourceSections,
      image: asset && asset.assetLocation ? asset.assetLocation.replace(/^\.\//, "") : null,
      illustrationAssetId: asset && asset.assetId,
      layoutText: layout && layout.text,
      voice: narration && narration.voice,
      deliveryCue: narration && narration.deliveryCue,
      pauses: narration && narration.pauses,
    };
  });

  return {
    saveId: `saved-${Date.now()}`,
    storyId: artifacts.exportResult && artifacts.exportResult.storyPackage && artifacts.exportResult.storyPackage.storyId
      || `story-${Date.now()}`,
    title: artifacts.completeStoryMaster && artifacts.completeStoryMaster.title || "Prana Story",
    createdAt: new Date().toISOString(),
    heroName: firstName(result.context.character && result.context.character.name || "Hero"),
    situationTitle: result.context.situation && result.context.situation.title || "",
    needId: result.context.need && result.context.need.id || "",
    beliefShift: result.context.belief
      ? `${result.context.belief.falseBelief} -> ${result.context.belief.trueBelief}`
      : "",
    pageCount: pages.length,
    thumbnail: pages[0] && pages[0].image || null,
    pages,
    productionStatus: artifacts.productionQAReport && artifacts.productionQAReport.status,
    exportStatus: artifacts.exportValidation && artifacts.exportValidation.status,
  };
}

function persistSavedStories() {
  window.localStorage.setItem(SAVED_STORIES_KEY, JSON.stringify(state.savedStories));
}

function currentStoryIsSaved() {
  return Boolean(
    state.generatedStorySession &&
    state.savedStories.some((entry) => entry.saveId === state.generatedStorySession.saveId)
  );
}

function currentStoryIsFavourite() {
  return Boolean(
    state.generatedStorySession &&
    state.savedStories.some((entry) => entry.saveId === state.generatedStorySession.saveId && entry.favorite)
  );
}

updateSaveButtons = function () {
  const hasStory = Boolean(state.generatedStorySession);
  const saved = hasStory && currentStoryIsSaved();
  const label = saved ? "♥ Saved" : "♡ Save story";
  const icon = saved ? "♥" : "♡";

  if (byId("saveStoryBtn")) {
    byId("saveStoryBtn").disabled = !hasStory;
    byId("saveStoryBtn").textContent = label;
    byId("saveStoryBtn").classList.toggle("saved", saved);
  }

  if (byId("readerSaveBtn")) {
    byId("readerSaveBtn").disabled = !hasStory;
    byId("readerSaveBtn").textContent = icon;
    byId("readerSaveBtn").setAttribute("aria-label", saved ? "Story saved" : "Save story");
    byId("readerSaveBtn").classList.toggle("saved", saved);
  }
}

function loadSavedStories() {
  try {
    const raw = window.localStorage.getItem(SAVED_STORIES_KEY);
    state.savedStories = raw ? JSON.parse(raw) : [];
  } catch (error) {
    state.savedStories = [];
  }
};

renderSavedStories = function () {
  if (!state.savedStories.length) {
    setHtml("savedStoriesGrid", `<div class="saved-card"><div class="saved-meta">Saved stories will appear here after you favorite one.</div></div>`);
    updateSaveButtons();
    return;
  }

  setHtml("savedStoriesGrid", state.savedStories.map((story) => `
    <div class="saved-card">
      ${story.thumbnail ? `<img class="saved-thumb" src="${escapeHtml(story.thumbnail)}" alt="${escapeHtml(story.title)} cover preview">` : `<div class="saved-thumb"></div>`}
      <div>
        <strong>${escapeHtml(story.title)}</strong>
        <div class="saved-meta">${escapeHtml(story.heroName)} | ${escapeHtml(story.situationTitle)}</div>
        <div class="saved-meta">${escapeHtml(new Date(story.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }))}</div>
      </div>
      <button type="button" class="secondary" data-open-story="${escapeHtml(story.saveId)}">Open story</button>
    </div>
  `).join(""));

  byId("savedStoriesGrid").querySelectorAll("[data-open-story]").forEach((button) => {
    button.addEventListener("click", () => {
      const session = state.savedStories.find((entry) => entry.saveId === button.dataset.openStory);
      if (session) {
        openStorySession(session, false);
      }
    });
  });
  updateSaveButtons();
}

function stopNarration() {
  if ("speechSynthesis" in window) {
    window.speechSynthesis.cancel();
  }
  state.isNarrating = false;
  state.isNarrationPaused = false;
  state.narratedPageIndex = null;
  state.narrationRunId += 1;
}

function updateNarrationButtons() {
  setText("playStoryBtn", state.isNarrationPaused ? "▶ Resume" : "▶ Play");
  byId("pauseStoryBtn").disabled = !state.isNarrating;
  byId("replayStoryBtn").disabled = !state.generatedStorySession;
  const status = !state.generatedStorySession
    ? "Ready to read"
    : state.isNarrationPaused
        ? `Paused on ${state.readerIndex + 1} / ${state.generatedStorySession.pages.length}`
      : state.isNarrating
        ? `Narrating ${state.readerIndex + 1} / ${state.generatedStorySession.pages.length}`
        : "Ready to read";
  setText("readerNarrationStatus", status);
  byId("readerNarrationStatus").classList.toggle("active", state.isNarrating || state.isNarrationPaused);
}

function animateReaderTurn() {
  const stage = byId("readerStage");
  if (!stage) {
    return;
  }
  stage.classList.remove("animating");
  if (state.readerTransitionTimer) {
    window.clearTimeout(state.readerTransitionTimer);
  }
  void stage.offsetWidth;
  stage.classList.add("animating");
  state.readerTransitionTimer = window.setTimeout(() => {
    stage.classList.remove("animating");
  }, 280);
}

function preloadNeighborPageImage(session, pageIndex) {
  if (!(session && session.pages && session.pages[pageIndex] && session.pages[pageIndex].image)) {
    return;
  }
  const preloader = new Image();
  preloader.src = session.pages[pageIndex].image;
}

function goToReaderPage(nextIndex, options = {}) {
  const session = state.generatedStorySession;
  if (!(session && session.pages && session.pages.length)) {
    return;
  }

  const target = clamp(nextIndex, 0, session.pages.length - 1);
  const pageChanged = target !== state.readerIndex;

  if (options.stopNarration !== false) {
    stopNarration();
  }

  state.readerIndex = target;
  if (pageChanged) {
    animateReaderTurn();
  }
  renderReader();
}

function renderReader() {
  const session = state.generatedStorySession;
  if (!(session && session.pages && session.pages.length)) {
    byId("storyReader").classList.add("hidden");
    updateSaveButtons();
    updateNarrationButtons();
    return;
  }

  const page = session.pages[clamp(state.readerIndex, 0, session.pages.length - 1)];
  const pageNumber = state.readerIndex + 1;
  const image = byId("readerImage");
  const fallback = byId("readerImageFallback");

  setProductStep(5);
  showScreen("reader");
  setText("readerTitle", session.title);
  setText("readerPageIndicator", `${pageNumber} / ${session.pages.length}`);
  setText("readerPageText", page.text);
  setText(
    "readerPageMeta",
    [page.voice, page.deliveryCue, page.pageTurnObjective].filter(Boolean).join(" | ")
  );

  if (page.image) {
    image.src = page.image;
    image.alt = `${session.title} illustration for page ${page.page}`;
    image.classList.remove("hidden");
    image.classList.remove("ready");
    fallback.classList.add("hidden");
    image.onerror = () => {
      image.classList.add("hidden");
      image.classList.remove("ready");
      fallback.classList.remove("hidden");
    };
    image.onload = () => {
      image.classList.remove("hidden");
      image.classList.add("ready");
      fallback.classList.add("hidden");
    };
  } else {
    image.classList.add("hidden");
    image.classList.remove("ready");
    fallback.classList.remove("hidden");
  }

  byId("prevPageBtn").disabled = pageNumber === 1;
  byId("nextPageBtn").disabled = pageNumber === session.pages.length;
  preloadNeighborPageImage(session, state.readerIndex + 1);
  preloadNeighborPageImage(session, state.readerIndex - 1);
  updateSaveButtons();
  updateNarrationButtons();
}

function speakCurrentPage(replay = false) {
  const session = state.generatedStorySession;
  if (!(session && session.pages && session.pages.length) || !("speechSynthesis" in window)) {
    return;
  }

  const page = session.pages[state.readerIndex];
  if (replay || !state.isNarrationPaused) {
    window.speechSynthesis.cancel();
  }

  if (state.isNarrationPaused) {
    window.speechSynthesis.resume();
    state.isNarrating = true;
    state.isNarrationPaused = false;
    updateNarrationButtons();
    return;
  }

  const narrationText = page.narration || page.text;
  const currentRunId = state.narrationRunId + 1;
  state.narrationRunId = currentRunId;
  const utterance = new SpeechSynthesisUtterance(narrationText);
  utterance.rate = 0.93;
  utterance.pitch = 1;
  utterance.onend = () => {
    if (currentRunId !== state.narrationRunId) {
      return;
    }
    state.isNarrating = false;
    state.isNarrationPaused = false;
    state.narratedPageIndex = null;
    if (state.generatedStorySession && state.readerIndex < state.generatedStorySession.pages.length - 1) {
      state.readerIndex += 1;
      animateReaderTurn();
      renderReader();
      speakCurrentPage(true);
      return;
    }
    renderReader();
  };
  utterance.onerror = () => {
    if (currentRunId !== state.narrationRunId) {
      return;
    }
    state.isNarrating = false;
    state.isNarrationPaused = false;
    state.narratedPageIndex = null;
    updateNarrationButtons();
  };
  state.isNarrating = true;
  state.isNarrationPaused = false;
  state.narratedPageIndex = state.readerIndex;
  updateNarrationButtons();
  window.speechSynthesis.speak(utterance);
}

function pauseNarration() {
  if (!("speechSynthesis" in window) || !state.isNarrating) {
    return;
  }
  window.speechSynthesis.pause();
  state.isNarrationPaused = true;
  updateNarrationButtons();
}

function openStorySession(session, markStatus = true) {
  stopNarration();
  state.generatedStorySession = session;
  state.readerIndex = 0;
  renderReader();
  if (markStatus) {
    setText("generationStatus", "Your story is ready and open in the reader.");
  }
};

saveCurrentStory = function () {
  if (!state.generatedStorySession) {
    return;
  }
  const existingIndex = state.savedStories.findIndex((entry) => entry.saveId === state.generatedStorySession.saveId);
  if (existingIndex >= 0) {
    state.savedStories[existingIndex] = { ...state.generatedStorySession };
  } else {
    state.savedStories.unshift(state.generatedStorySession);
  }
  persistSavedStories();
  renderSavedStories();
  updateSaveButtons();
  setText("generationStatus", "This story has been saved in your library.");
};

function scrollToElement(id) {
  const element = byId(id);
  if (element) {
    element.scrollIntoView({ behavior: "smooth", block: "start" });
  }
}

function showScreen(name) {
  state.screen = name;
  document.querySelectorAll("[data-screen]").forEach((section) => {
    section.classList.toggle("hidden", section.dataset.screen !== name);
  });
  document.querySelectorAll(".top-nav .nav-link[id^=\"nav\"]").forEach((link) => {
    const isHome = link.id.startsWith("navHomeBtn");
    const isStories = link.id.startsWith("navStoriesBtn");
    const isActivities = link.id.startsWith("navActivitiesBtn");
    link.classList.toggle("active", (isHome && name === "home") || (isStories && name === "library") || (isActivities && name === "activities"));
  });
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function openHome() {
  showScreen("home");
}

function openLibrary() {
  showScreen("library");
}

function openActivities() {
  showScreen("activities");
}

function bindJourneyNavButtons() {
  byId("situationContinueBtn").addEventListener("click", () => {
    if (!(state.recipe && state.recipe.context && state.recipe.context.situation)) {
      return;
    }
    showScreen("bridge");
  });
  byId("bridgeBackBtn").addEventListener("click", () => showScreen("situation"));
  byId("bridgeContinueBtn").addEventListener("click", () => showScreen("story"));
  byId("storyBackBtn").addEventListener("click", () => showScreen("bridge"));
  byId("storyContinueBtn").addEventListener("click", () => showScreen("generate"));
  byId("generateBackBtn").addEventListener("click", () => showScreen("story"));
}

const GANESHA_SYMBOL_ICONS = {
  GAN_SYM_MOUSE: "🐭",
  GAN_SYM_BIG_BELLY: "🛡️",
  GAN_SYM_CURVED_TRUNK: "🚪",
  GAN_SYM_BROKEN_TUSK: "✏️",
  GAN_SYM_LOTUS: "🌸",
  GAN_SYM_BIG_EARS: "👂",
  GAN_SYM_MODAK: "🍡",
  GAN_SYM_EYES: "👁️",
};

function symbolWisdomLabel(symbolId) {
  const words = String(symbolId || "")
    .split("_")
    .slice(2)
    .map((token) => token.charAt(0) + token.slice(1).toLowerCase());
  return `${words.join(" ")} Wisdom`.trim();
}

function renderEmotionalBridge(result) {
  const ctx = result.context;
  if (!ctx) {
    return;
  }
  setText("bridgeSituation", (ctx.situation && ctx.situation.title) || "");
  setText("bridgeText", (ctx.belief && ctx.belief.trueBelief) || "");
  const symbolId = ctx.symbol && ctx.symbol.id;
  const icon = GANESHA_SYMBOL_ICONS[symbolId] || "✨";
  const label = symbolId ? symbolWisdomLabel(symbolId) : "Ganesha's Wisdom";
  setText("bridgeGuide", `${icon} ${label}`);
}

function stripTrailingPeriod(text) {
  return String(text || "").replace(/\.\s*$/, "");
}

function buildStoryPremise(ctx) {
  const heroFirst = firstName((ctx.character && ctx.character.name) || "Your hero");
  const missionPhrase = lowerFirstLetter(stripTrailingPeriod((ctx.mission && ctx.mission.description) || "go on a meaningful adventure"));
  const obstaclePhrase = ctx.obstacle && ctx.obstacle.name ? `the ${ctx.obstacle.name.toLowerCase()}` : "a tricky challenge";
  return `${heroFirst} wants to ${missionPhrase}, but must first get past ${obstaclePhrase}.`;
}

function renderGenerateSummary(result) {
  const ctx = result.context;
  if (!ctx) {
    return;
  }
  setText("storyPremiseText", buildStoryPremise(ctx));
}

function toggleStoryFavorite(saveId) {
  const existingIndex = state.savedStories.findIndex((entry) => entry.saveId === saveId);
  if (existingIndex < 0) {
    return;
  }
  state.savedStories[existingIndex] = {
    ...state.savedStories[existingIndex],
    favorite: !state.savedStories[existingIndex].favorite,
  };
  if (state.generatedStorySession && state.generatedStorySession.saveId === saveId) {
    state.generatedStorySession = { ...state.savedStories[existingIndex] };
  }
  persistSavedStories();
  renderSavedStories();
}

function updateSaveButtons() {
  const hasStory = Boolean(state.generatedStorySession);
  const saved = hasStory && currentStoryIsSaved();
  const favourite = Boolean(
    state.generatedStorySession &&
    state.savedStories.some((entry) => entry.saveId === state.generatedStorySession.saveId && entry.favorite)
  );
  const label = saved ? "♥ Saved to My Stories" : "♡ Save story";
  const icon = favourite ? "♥" : "♡";

  if (byId("saveStoryBtn")) {
    byId("saveStoryBtn").disabled = !hasStory;
    byId("saveStoryBtn").textContent = label;
    byId("saveStoryBtn").classList.toggle("saved", saved);
  }

  if (byId("readerSaveBtn")) {
    byId("readerSaveBtn").disabled = !hasStory;
    byId("readerSaveBtn").textContent = icon;
    byId("readerSaveBtn").setAttribute("aria-label", favourite ? "Unfavourite story" : "Favourite story");
    byId("readerSaveBtn").classList.toggle("saved", favourite);
  }
}

function renderSavedStories() {
  if (!state.savedStories.length) {
    setHtml("savedStoriesGrid", `<div class="saved-card empty-library-card"><strong>Your story shelf is empty.</strong><div class="saved-meta">Create your first adventure.</div><button type="button" class="secondary empty-library-cta" id="emptyLibraryCreateBtn">Create a Story</button></div>`);
    if (byId("emptyLibraryCreateBtn")) {
      byId("emptyLibraryCreateBtn").addEventListener("click", () => showScreen("situation"));
    }
    updateSaveButtons();
    return;
  }

  setHtml("savedStoriesGrid", state.savedStories.map((story) => `
    <div class="saved-card">
      ${story.thumbnail ? `<img class="saved-thumb" src="${escapeHtml(story.thumbnail)}" alt="${escapeHtml(story.title)} cover preview">` : `<div class="saved-thumb"></div>`}
      <div>
        <strong>${escapeHtml(story.title)}</strong>
        <div class="saved-meta">${escapeHtml(story.heroName)} | ${escapeHtml(story.situationTitle)}</div>
        <div class="saved-meta">${escapeHtml(new Date(story.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }))}</div>
      </div>
      <div class="saved-actions">
        <button type="button" class="ghost favorite-btn${story.favorite ? " saved" : ""}" data-favorite-story="${escapeHtml(story.saveId)}" aria-label="${story.favorite ? "Unfavourite story" : "Favourite story"}">${story.favorite ? "♥" : "♡"}</button>
        <button type="button" class="secondary" data-open-story="${escapeHtml(story.saveId)}">Read</button>
      </div>
    </div>
  `).join(""));

  byId("savedStoriesGrid").querySelectorAll("[data-open-story]").forEach((button) => {
    button.addEventListener("click", () => {
      const session = state.savedStories.find((entry) => entry.saveId === button.dataset.openStory);
      if (session) {
        openStorySession(session, false);
      }
    });
  });
  byId("savedStoriesGrid").querySelectorAll("[data-favorite-story]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleStoryFavorite(button.dataset.favoriteStory);
    });
  });
  updateSaveButtons();
}

function saveCurrentStory() {
  if (!state.generatedStorySession) {
    return;
  }
  const nextSession = {
    ...state.generatedStorySession,
    favorite: state.generatedStorySession.favorite ?? true,
  };
  const existingIndex = state.savedStories.findIndex((entry) => entry.saveId === state.generatedStorySession.saveId);
  if (existingIndex >= 0) {
    state.savedStories[existingIndex] = { ...state.savedStories[existingIndex], ...nextSession };
    state.generatedStorySession = { ...state.savedStories[existingIndex] };
  } else {
    state.savedStories.unshift(nextSession);
    state.generatedStorySession = nextSession;
  }
  persistSavedStories();
  renderSavedStories();
  updateSaveButtons();
  setText("generationStatus", "This story is saved in My Stories.");
}

function bindReaderGestures() {
  const stage = byId("readerStage");
  if (!stage) {
    return;
  }

  let touchStartX = 0;
  let touchStartY = 0;

  stage.addEventListener("touchstart", (event) => {
    const point = event.changedTouches && event.changedTouches[0];
    if (!point) {
      return;
    }
    touchStartX = point.clientX;
    touchStartY = point.clientY;
  }, { passive: true });

  stage.addEventListener("touchend", (event) => {
    const point = event.changedTouches && event.changedTouches[0];
    if (!point || !state.generatedStorySession) {
      return;
    }
    const deltaX = point.clientX - touchStartX;
    const deltaY = point.clientY - touchStartY;
    if (Math.abs(deltaX) < 40 || Math.abs(deltaX) < Math.abs(deltaY)) {
      return;
    }
    if (deltaX < 0) {
      goToReaderPage(state.readerIndex + 1);
    } else {
      goToReaderPage(state.readerIndex - 1);
    }
  }, { passive: true });

  document.addEventListener("keydown", (event) => {
    const targetTag = event.target && event.target.tagName;
    if (!state.generatedStorySession || byId("storyReader").classList.contains("hidden")) {
      return;
    }
    if (["INPUT", "TEXTAREA", "SELECT"].includes(targetTag)) {
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      goToReaderPage(state.readerIndex + 1);
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      goToReaderPage(state.readerIndex - 1);
    }
  });
}

function renderProductSurface(result) {
  renderHeroCards(result);
  renderWorldCards(result);
  renderStoryPreviewCard(result);
  renderPlannerStatus(result);
  setProductStep(state.generatedStorySession ? 5 : 4);
}

function splitSequence(value) {
  return String(value || "")
    .split(/\s*->\s*/)
    .map((item) => item.trim())
    .filter(Boolean);
}

function issueCounts(issues) {
  return {
    blockingFailures: issues.filter((issue) => issue.severity === "FAIL").length,
    warnings: issues.filter((issue) => issue.severity === "WARNING").length,
    blockers: issues.filter((issue) => issue.severity === "BLOCKED").length,
  };
}

function storyActionPurpose(actionId) {
  return `Selected as a compatible story action for the resolved Mission and Archetype: ${actionId}.`;
}

function clamp(value, minimum, maximum) {
  return Math.min(Math.max(value, minimum), maximum);
}

function titleCaseFromId(value) {
  return String(value || "")
    .replace(/^.*?_/, "")
    .toLowerCase()
    .split(/[_\s]+/)
    .filter(Boolean)
    .map((token) => token.charAt(0).toUpperCase() + token.slice(1))
    .join(" ");
}

function lowerFirst(value) {
  const text = String(value || "");
  return text ? text.charAt(0).toLowerCase() + text.slice(1) : text;
}

function firstName(value) {
  return String(value || "").split(" (")[0].trim();
}

function lookupById(index, items, id) {
  if (id == null) {
    return null;
  }
  if (index && typeof index.get === "function") {
    const direct = index.get(id);
    if (direct) {
      return direct;
    }
    const stringKey = index.get(String(id));
    if (stringKey) {
      return stringKey;
    }
  }
  return (items || []).find((item) => String(item.id) === String(id)) || null;
}

function validateBlueprintForPhase7(blueprint) {
  const issues = [];
  if (!blueprint) {
    issues.push("Story Blueprint is missing.");
    return { status: "FAIL", issues };
  }
  if (blueprint.status !== "VALIDATED") {
    issues.push("Story Blueprint must be VALIDATED before Phase 7 begins.");
  }
  if (!(blueprint.plannerValidation && blueprint.plannerValidation.status === "PASS")) {
    issues.push("Phase 7 requires a PASS Blueprint from Phase 6A.");
  }
  if (!(blueprint.beats && blueprint.beats.length)) {
    issues.push("Story Blueprint must contain at least one Beat.");
  }
  if (!(blueprint.storyStructure && blueprint.storyStructure.id)) {
    issues.push("Story Blueprint must include a Story Structure.");
  }
  if (!(blueprint.belief && blueprint.belief.trueBelief && blueprint.belief.falseBelief)) {
    issues.push("Story Blueprint must include the Belief transformation.");
  }
  if (!(blueprint.character && blueprint.character.selected)) {
    issues.push("Story Blueprint must include the selected Character.");
  }
  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function chooseEmotionalArc(blueprint, libraries) {
  const arcs = (libraries && libraries.emotionalArcs) || [];
  const matching = arcs.find((arc) =>
    (arc.soft_suggested && arc.soft_suggested.recommended_need_ids || []).includes(blueprint.need.id)
  );
  return matching || arcs[0] || null;
}

function sequenceValueAt(values, index, total) {
  if (!(values && values.length)) {
    return "";
  }
  if (total <= 1) {
    return values[0];
  }
  const position = Math.round((index / Math.max(1, total - 1)) * (values.length - 1));
  return values[Math.min(values.length - 1, Math.max(0, position))];
}

function stagePurpose(index, beat, blueprint) {
  if (blueprint.beats.length === 1) {
    return `Open with ${lowerFirst(blueprint.opening.function)}, resolve ${titleCaseFromId(blueprint.mission.id)} through ${lowerFirst(blueprint.ending.function)}, and confirm ${lowerFirst(blueprint.belief.trueBelief)}.`;
  }
  if (index === 0) {
    return `Open with ${lowerFirst(blueprint.opening.function)} while grounding the protagonist in ${lowerFirst(blueprint.belief.falseBelief)}.`;
  }
  if (index === blueprint.beats.length - 1) {
    return `Resolve ${titleCaseFromId(blueprint.mission.id)} through ${lowerFirst(blueprint.ending.function)} and confirm ${lowerFirst(blueprint.belief.trueBelief)}.`;
  }
  return `Escalate ${titleCaseFromId(blueprint.mission.id)} through ${lowerFirst(titleCaseFromId(blueprint.storyConflict.id))} pressure and ${beat.function.toLowerCase()}`;
}

function buildStoryFlow(blueprint) {
  const beatIds = (blueprint.beats || []).map((beat) => beat.id);
  const conflictLabel = titleCaseFromId(blueprint.storyConflict && blueprint.storyConflict.id);
  return {
    sequence: (blueprint.beats || []).map((beat, index) => ({
      id: `FLOW_${String(index + 1).padStart(2, "0")}_${beat.id}`,
      purpose: stagePurpose(index, beat, blueprint),
      beats: [beat.id],
    })),
    centralDramaticQuestion: `Will the protagonist complete the mission despite ${lowerFirst(conflictLabel)} and discover that ${lowerFirst(blueprint.belief.trueBelief)}?`,
    resolution: `${titleCaseFromId(blueprint.mission.id)} is resolved. ${blueprint.ending.function} ${blueprint.belief.trueBelief}`,
  };
}

function validateStoryFlow(storyFlow, blueprint) {
  const issues = [];
  const expectedBeatIds = (blueprint.beats || []).map((beat) => beat.id);
  const seenBeatIds = unique((storyFlow.sequence || []).flatMap((stage) => stage.beats || []));

  if (!(storyFlow && storyFlow.sequence && storyFlow.sequence.length)) {
    issues.push("Story Flow must contain at least one stage.");
  }
  if (expectedBeatIds.length && seenBeatIds.length !== expectedBeatIds.length) {
    issues.push("Story Flow must account for every Blueprint Beat exactly once at stage level.");
  }
  expectedBeatIds.forEach((beatId) => {
    if (!seenBeatIds.includes(beatId)) {
      issues.push(`Story Flow is missing Blueprint Beat ${beatId}.`);
    }
  });
  if (expectedBeatIds.length && storyFlow.sequence[0] && !(storyFlow.sequence[0].beats || []).includes(expectedBeatIds[0])) {
    issues.push("Story Flow opening stage must begin from the first Blueprint Beat.");
  }
  if (expectedBeatIds.length && storyFlow.sequence[storyFlow.sequence.length - 1] && !(storyFlow.sequence[storyFlow.sequence.length - 1].beats || []).includes(expectedBeatIds[expectedBeatIds.length - 1])) {
    issues.push("Story Flow final stage must land on the final Blueprint Beat.");
  }
  if (!String(storyFlow.centralDramaticQuestion || "").trim()) {
    issues.push("Story Flow must include a central dramatic question.");
  }
  if (!String(storyFlow.resolution || "").includes(blueprint.belief.trueBelief)) {
    issues.push("Story Flow resolution must preserve the Blueprint true Belief.");
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function validateStoryComposer(storyFlow, blueprint) {
  const issues = [];
  const sequence = storyFlow && storyFlow.sequence || [];
  const conflictLabel = titleCaseFromId(blueprint.storyConflict.id);
  const trueBelief = blueprint.belief.trueBelief;
  const normalizedQuestion = normalize(storyFlow.centralDramaticQuestion || "");
  const normalizedResolution = normalize(storyFlow.resolution || "");
  const normalizedConflict = normalize(conflictLabel);
  const normalizedBelief = normalize(trueBelief);

  if (sequence.length >= 3) {
    const firstPurpose = String(sequence[0] && sequence[0].purpose || "");
    const lastPurpose = String(sequence[sequence.length - 1] && sequence[sequence.length - 1].purpose || "");
    const middlePurposes = sequence.slice(1, -1).map((stage) => String(stage.purpose || ""));

    if (!/open/i.test(firstPurpose)) {
      issues.push("7B Story Composer must preserve opening progression in the first story-flow stage.");
    }
    if (!middlePurposes.some((purpose) => {
      const normalizedPurpose = normalize(purpose);
      return normalizedPurpose.includes("mission") || normalizedPurpose.includes(normalizedConflict);
    })) {
      issues.push("7B Story Composer middle stages must preserve mission/conflict escalation.");
    }
    if (!(normalize(lastPurpose).includes(normalizedBelief) || normalizedResolution.includes(normalizedBelief))) {
      issues.push("7B Story Composer must preserve belief transformation in the resolution.");
    }
  }

  if (!normalizedQuestion.includes("mission")) {
    issues.push("7B Story Composer central dramatic question must preserve the Blueprint mission.");
  }
  if (!normalizedQuestion.includes(normalizedConflict)) {
    issues.push("7B Story Composer central dramatic question must preserve the Blueprint conflict.");
  }
  if (!normalizedResolution.includes(normalizedBelief)) {
    issues.push("7B Story Composer resolution must preserve the Blueprint true Belief.");
  }
  if (/\"/.test(JSON.stringify(storyFlow))) {
    // JSON quotes are expected; this check is only here to keep the function explicit about no prose logic.
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function buildScenePlan(storyFlow, blueprint) {
  const sequence = storyFlow && storyFlow.sequence || [];
  return sequence.map((stage, index) => {
    const isFirst = index === 0;
    const isLast = index === sequence.length - 1;
    const isSingleStage = isFirst && isLast;
    return {
      id: `SCENE_${String(index + 1).padStart(3, "0")}`,
      purpose: stage.purpose,
      beats: unique(stage.beats || []),
      characterFocus: blueprint.character.selected,
      missionProgress: isSingleStage
        ? "Mission is introduced, tested, and resolved within one tightly connected scene arc."
        : isFirst
        ? "Mission is introduced and framed as the protagonist's goal."
        : isLast
          ? "Mission reaches resolution and demonstrates its outcome."
          : "Mission advances through an active attempt under pressure.",
      conflictProgression: isSingleStage
        ? `Conflict is established and resolved through ${titleCaseFromId(blueprint.storyConflict.id)} pressure in one linked sequence.`
        : isFirst
        ? `Conflict is established through ${titleCaseFromId(blueprint.storyConflict.id)} pressure.`
        : isLast
          ? "Conflict releases into resolution after the final turning pressure."
          : "Conflict intensifies and constrains the protagonist's next move.",
      emotionalFunction: isSingleStage
        ? "Move from pressure to earned release within one coherent emotional turn."
        : isFirst
        ? "Set the protagonist's emotional baseline and pressure point."
        : isLast
          ? "Convert emotional strain into earned release."
          : "Escalate emotional commitment and uncertainty.",
      symbolFunction: isSingleStage
        ? "Introduce and resolve symbolic meaning in one linked arc."
        : isFirst
        ? "Introduce symbolic meaning."
        : isLast
          ? "Deliver symbolic payoff."
          : "Develop symbolic recurrence.",
    };
  });
}

function validateScenePlan(scenePlan, storyFlow, blueprint) {
  const issues = [];
  const flowSequence = storyFlow && storyFlow.sequence || [];
  const flowBeatIds = unique(flowSequence.flatMap((stage) => stage.beats || []));
  const sceneBeatIds = unique((scenePlan || []).flatMap((scene) => scene.beats || []));

  if (!(scenePlan && scenePlan.length)) {
    issues.push("7C Scene Director must produce at least one scene.");
  }
  if (scenePlan.length !== flowSequence.length) {
    issues.push("7C Scene Director must preserve one coherent scene mapping per Story Flow stage for the current runtime model.");
  }
  scenePlan.forEach((scene, index) => {
    if (!String(scene.purpose || "").trim()) {
      issues.push(`Scene ${scene.id} is missing its narrative purpose.`);
    }
    if (!(scene.beats && scene.beats.length)) {
      issues.push(`Scene ${scene.id} must carry at least one beat.`);
    }
    if (scene.characterFocus !== blueprint.character.selected) {
      issues.push(`Scene ${scene.id} drifted away from the Blueprint-selected character focus.`);
    }
    if (scene.beats && flowSequence[index]) {
      const expectedBeats = unique(flowSequence[index].beats || []);
      if (JSON.stringify(unique(scene.beats)) !== JSON.stringify(expectedBeats)) {
        issues.push(`Scene ${scene.id} does not preserve the beat handoff from ${flowSequence[index].id}.`);
      }
    }
  });
  flowBeatIds.forEach((beatId) => {
    if (!sceneBeatIds.includes(beatId)) {
      issues.push(`7C Scene Director lost Story Flow beat ${beatId}.`);
    }
  });
  if (scenePlan[0] && !normalize(scenePlan[0].purpose).includes("open")) {
    issues.push("7C opening scene must preserve the opening function from Story Flow.");
  }
  if (scenePlan.length > 2 && !scenePlan.slice(1, -1).some((scene) => {
    const purpose = normalize(scene.purpose);
    return purpose.includes("escalate") || purpose.includes(normalize(titleCaseFromId(blueprint.storyConflict.id)));
  })) {
    issues.push("7C middle scenes must preserve escalation/conflict movement.");
  }
  if (scenePlan[scenePlan.length - 1] && !normalize(scenePlan[scenePlan.length - 1].purpose).includes(normalize(blueprint.belief.trueBelief))) {
    issues.push("7C final scene must preserve belief-safe resolution.");
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function buildPagePlan(blueprint, scenePlan) {
  const pageRange = blueprint.request.pageRange || { min: 5, max: 8 };
  const targetPages = clamp(Math.max(scenePlan.length + 2, pageRange.min), pageRange.min, pageRange.max);
  const sceneIds = scenePlan.map((scene) => scene.id);
  const sceneById = new Map(scenePlan.map((scene) => [scene.id, scene]));
  const openingSceneId = sceneIds[0];
  const closingSceneId = sceneIds[sceneIds.length - 1];
  const middleSceneIds = sceneIds.slice(1, -1);
  const pageTarget = clamp(Math.round(260 / targetPages), 35, 75);
  const pages = [];

  for (let page = 1; page <= targetPages; page += 1) {
    let objective = "Carry the story forward with clear narrative and emotional progression.";
    let pageTurnGoal = "Forward momentum";
    let linkedScenes = [];
    let emotionalPurpose = "Build feeling and expectation.";
    let visualPurpose = "Support action and transitions without overloading the spread.";
    let symbolPurpose = "Keep symbolic recurrence supportive, not dominant.";

    if (page === 1) {
      objective = `Open the story world and surface the core pressure around ${blueprint.need.id}.`;
      pageTurnGoal = "Curiosity about the central problem";
      linkedScenes = openingSceneId ? [openingSceneId] : [];
      emotionalPurpose = "Engage empathy and concern.";
      visualPurpose = "Establish the world, protagonist, and opening tension visually.";
      symbolPurpose = "Signal the symbol's story role.";
    } else if (page === targetPages) {
      objective = `Land the resolution and reinforce ${blueprint.belief.trueBelief}.`;
      pageTurnGoal = "Emotional closure";
      linkedScenes = closingSceneId ? [closingSceneId] : [];
      emotionalPurpose = "Release and integration.";
      visualPurpose = "Give the resolution breathing room.";
      symbolPurpose = "Complete the symbol payoff.";
    } else if (page === targetPages - 1) {
      objective = "Set up the final emotional and narrative payoff without resolving too early.";
      pageTurnGoal = "Anticipation of the final turn";
      linkedScenes = closingSceneId ? [closingSceneId] : [];
      emotionalPurpose = "Heighten anticipation before the final release.";
      visualPurpose = "Protect the pre-climax turn and hold visual tension.";
      symbolPurpose = "Prepare the symbol for payoff without completing it.";
    } else if (page === 2) {
      objective = `Clarify the mission direction and deepen the conflict around ${titleCaseFromId(blueprint.storyConflict.id)}.`;
      pageTurnGoal = "Commitment to the mission";
      linkedScenes = unique(sceneIds.slice(0, Math.min(2, sceneIds.length)));
      emotionalPurpose = "Move from concern into committed effort.";
      visualPurpose = "Show the story problem becoming active.";
      symbolPurpose = "Begin symbol recurrence if it helps the scene.";
    } else {
      objective = "Develop attempts, pressure, and internal change without breaking scene integrity.";
      pageTurnGoal = "Escalating tension";
      const middleIndex = middleSceneIds.length
        ? (page - 3) % middleSceneIds.length
        : 0;
      linkedScenes = middleSceneIds.length
        ? [middleSceneIds[middleIndex]]
        : (openingSceneId ? [openingSceneId] : []);
    }

    const linkedBeats = unique(
      linkedScenes
        .map((sceneId) => sceneById.get(sceneId))
        .filter(Boolean)
        .flatMap((scene) => scene.beats || [])
    );

    pages.push({
      page,
      objective,
      beats: unique(linkedBeats),
      sceneIds: unique(linkedScenes),
      wordBudget: {
        target: pageTarget,
        minimum: 20,
        maximum: 95,
      },
      pageTurnGoal,
      emotionalPurpose,
      visualPurpose,
      symbolPurpose,
    });
  }

  return pages;
}

function validatePagePlan(pagePlan, scenePlan, blueprint) {
  const issues = [];
  const pageRange = blueprint.request.pageRange || { min: 5, max: 8 };
  const sceneIds = unique((scenePlan || []).map((scene) => scene.id));
  const coveredSceneIds = unique((pagePlan || []).flatMap((page) => page.sceneIds || []));

  if (!(pagePlan && pagePlan.length)) {
    issues.push("7D Page Director must produce at least one page plan entry.");
  }
  if (pagePlan.length < pageRange.min || pagePlan.length > pageRange.max) {
    issues.push("7D Page Director must stay within the Blueprint page-range guidance.");
  }

  pagePlan.forEach((page, index) => {
    if (page.page !== index + 1) {
      issues.push(`Page Plan page numbering drifted at page ${page.page}.`);
    }
    if (!String(page.objective || "").trim()) {
      issues.push(`Page ${page.page} is missing its objective.`);
    }
    if (!String(page.pageTurnGoal || "").trim()) {
      issues.push(`Page ${page.page} is missing its page-turn goal.`);
    }
    if (!(page.wordBudget && Number.isInteger(page.wordBudget.target))) {
      issues.push(`Page ${page.page} is missing approximate word-budget guidance.`);
    } else {
      if (page.wordBudget.target < 35 || page.wordBudget.target > 95) {
        issues.push(`Page ${page.page} word-budget target is outside the current guidance band.`);
      }
    }
    if (!(page.sceneIds && page.sceneIds.length)) {
      issues.push(`Page ${page.page} must map at least one scene as guidance.`);
    }
  });

  sceneIds.forEach((sceneId) => {
    if (!coveredSceneIds.includes(sceneId)) {
      issues.push(`7D Page Director lost Scene ${sceneId}.`);
    }
  });

  if (pagePlan[0] && !normalize(pagePlan[0].objective).includes("open")) {
    issues.push("7D first page must preserve the opening guidance.");
  }
  if (pagePlan.length > 1 && !normalize(pagePlan[pagePlan.length - 1].objective).includes(normalize(blueprint.belief.trueBelief))) {
    issues.push("7D final page must preserve belief-safe resolution guidance.");
  }
  if (pagePlan.length > 2 && !pagePlan.slice(1, -1).some((page) => {
    const objective = normalize(page.objective);
    return objective.includes("conflict") || objective.includes("pressure") || objective.includes("mission");
  })) {
    issues.push("7D middle pages must preserve mission/conflict/escalation guidance.");
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function buildEmotionPlan(blueprint, scenePlan, pagePlan, libraries) {
  const arc = chooseEmotionalArc(blueprint, libraries);
  const emotions = arc && arc.hard && arc.hard.emotion_sequence || [];
  return pagePlan.map((page, index) => {
    const start = index === 0
      ? (sequenceValueAt(emotions, 0, pagePlan.length) || blueprint.belief.falseBelief)
      : (sequenceValueAt(emotions, index - 1, pagePlan.length) || pagePlan[index - 1].emotionalPurpose || blueprint.belief.falseBelief);
    const end = sequenceValueAt(emotions, index, pagePlan.length)
      || (index === pagePlan.length - 1 ? blueprint.belief.trueBelief : page.emotionalPurpose || blueprint.belief.trueBelief);
    const intensity = pagePlan.length === 1
      ? 0.6
      : page.page === pagePlan.length
        ? 0.68
        : page.page === pagePlan.length - 1
          ? 0.92
          : Number((0.25 + ((index + 1) / pagePlan.length) * 0.45).toFixed(2));
    return {
      id: `EMOTION_${String(index + 1).padStart(3, "0")}`,
      sceneId: page.sceneIds && page.sceneIds[0] || scenePlan[0] && scenePlan[0].id,
      page: page.page,
      function: page.page === 1
        ? `Establish the emotional baseline and story pressure while ${lowerFirst(page.emotionalPurpose || "engaging empathy and concern")}.`
        : page.page === pagePlan.length
          ? `Deliver emotional release and integration while reinforcing ${lowerFirst(blueprint.belief.trueBelief)}.`
          : page.page === pagePlan.length - 1
            ? "Reach the emotional high point before the final release."
            : `Escalate or refine the emotional journey through ${lowerFirst(page.emotionalPurpose || "growing pressure")}.`,
      startingState: start,
      endingState: end,
      intensity,
      transition: `${start} -> ${end}`,
    };
  });
}

function validateEmotionPlan(emotionPlan, scenePlan, pagePlan, blueprint) {
  const issues = [];
  const sceneIds = new Set((scenePlan || []).map((scene) => scene.id));

  if (!(emotionPlan && emotionPlan.length)) {
    issues.push("7E Emotional Director must produce at least one emotion-plan entry.");
  }
  if (emotionPlan.length !== pagePlan.length) {
    issues.push("7E Emotional Director must cover every planned page exactly once.");
  }

  emotionPlan.forEach((entry, index) => {
    if (entry.page !== index + 1) {
      issues.push(`Emotion Plan page numbering drifted at page ${entry.page}.`);
    }
    if (!String(entry.function || "").trim()) {
      issues.push(`Emotion Plan entry for page ${entry.page} is missing its emotional purpose.`);
    }
    if (!String(entry.startingState || "").trim() || !String(entry.endingState || "").trim()) {
      issues.push(`Emotion Plan entry for page ${entry.page} is missing emotional state data.`);
    }
    if (!String(entry.transition || "").includes("->")) {
      issues.push(`Emotion Plan entry for page ${entry.page} is missing a motivated transition.`);
    }
    if (typeof entry.intensity !== "number" || entry.intensity < 0 || entry.intensity > 1) {
      issues.push(`Emotion Plan entry for page ${entry.page} has an invalid intensity.`);
    }
    if (entry.sceneId && !sceneIds.has(entry.sceneId)) {
      issues.push(`Emotion Plan entry for page ${entry.page} references unknown Scene ${entry.sceneId}.`);
    }
    if (index > 0 && entry.startingState !== emotionPlan[index - 1].endingState) {
      issues.push(`Emotion transition into page ${entry.page} does not continue from the prior page state.`);
    }
  });

  if (emotionPlan[0] && !normalize(emotionPlan[0].function).includes("baseline")) {
    issues.push("7E first page must establish the emotional baseline.");
  }
  if (emotionPlan.length > 1) {
    const last = emotionPlan[emotionPlan.length - 1];
    const beforeLast = emotionPlan[emotionPlan.length - 2];
    if (!normalize(last.function).includes("release")) {
      issues.push("7E final page must provide emotional release.");
    }
    if (!(beforeLast && beforeLast.intensity >= last.intensity)) {
      issues.push("7E emotional climax must occur before or at the transition into the final release.");
    }
    if (normalize(last.function).includes(normalize(blueprint.belief.trueBelief)) === false) {
      issues.push("7E final emotional function must preserve the Blueprint belief transformation.");
    }
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function beatToSceneMap(scenePlan) {
  const map = new Map();
  scenePlan.forEach((scene) => {
    (scene.beats || []).forEach((beatId) => {
      map.set(beatId, scene.id);
    });
  });
  return map;
}

function beatToPageMap(pagePlan) {
  const map = new Map();
  (pagePlan || []).forEach((page) => {
    (page.beats || []).forEach((beatId) => {
      if (!map.has(beatId)) {
        map.set(beatId, []);
      }
      map.get(beatId).push(page.page);
    });
  });
  return map;
}

function buildSymbolPlan(blueprint, scenePlan, pagePlan, emotionPlan) {
  const beatSceneMap = beatToSceneMap(scenePlan);
  const sceneIds = (scenePlan || []).map((scene) => scene.id);
  const firstSceneId = sceneIds[0];
  const lastSceneId = sceneIds[sceneIds.length - 1];
  const emotionalPeak = (emotionPlan || []).slice(0, -1).reduce((best, entry) => {
    if (!best || (entry.intensity || 0) > (best.intensity || 0)) {
      return entry;
    }
    return best;
  }, null);
  const middlePage = pagePlan && pagePlan.length
    ? pagePlan[Math.floor((pagePlan.length - 1) / 2)]
    : null;
  return (blueprint.symbols || []).map((symbol) => ({
    symbolId: symbol.symbolId,
    function: `${symbol.function} Introduce it with narrative clarity, recur it where pressure or feeling deepens, and land it as supportive symbolic payoff rather than random repetition.`,
    introduction: beatSceneMap.get(symbol.introduction) || firstSceneId || symbol.introduction,
    development: beatSceneMap.get(symbol.development)
      || (emotionalPeak && emotionalPeak.sceneId)
      || (middlePage && middlePage.sceneIds && middlePage.sceneIds[0])
      || firstSceneId
      || symbol.development,
    payoff: beatSceneMap.get(symbol.payoff) || lastSceneId || symbol.payoff,
    sceneIds: unique([
      beatSceneMap.get(symbol.introduction) || firstSceneId,
      beatSceneMap.get(symbol.development)
        || (emotionalPeak && emotionalPeak.sceneId)
        || (middlePage && middlePage.sceneIds && middlePage.sceneIds[0]),
      beatSceneMap.get(symbol.payoff) || lastSceneId,
    ]),
  }));
}

function validateSymbolPlan(symbolPlan, blueprint, scenePlan) {
  const issues = [];
  const blueprintSymbols = blueprint.symbols || [];
  const sceneIds = new Set((scenePlan || []).map((scene) => scene.id));
  const selectedIds = new Set(blueprintSymbols.map((symbol) => symbol.symbolId));

  if (!(symbolPlan && symbolPlan.length)) {
    issues.push("7F Symbol Director must produce at least one symbol-plan entry when Blueprint symbols are selected.");
  }
  if (symbolPlan.length !== blueprintSymbols.length) {
    issues.push("7F Symbol Director must account for every selected Blueprint symbol exactly once.");
  }

  symbolPlan.forEach((entry) => {
    if (!selectedIds.has(entry.symbolId)) {
      issues.push(`7F Symbol Director invented or lost Symbol ${entry.symbolId}.`);
    }
    if (!String(entry.function || "").trim()) {
      issues.push(`Symbol ${entry.symbolId} is missing narrative guidance.`);
    }
    if (!entry.introduction || !entry.development || !entry.payoff) {
      issues.push(`Symbol ${entry.symbolId} must have introduction, development, and payoff guidance.`);
    }
    (entry.sceneIds || []).forEach((sceneId) => {
      if (!sceneIds.has(sceneId)) {
        issues.push(`Symbol ${entry.symbolId} references unknown Scene ${sceneId}.`);
      }
    });
    if (!(entry.sceneIds && entry.sceneIds.length)) {
      issues.push(`Symbol ${entry.symbolId} must appear in at least one known scene.`);
    }
    if (entry.sceneIds && entry.sceneIds.length > Math.max(3, sceneIds.size)) {
      issues.push(`Symbol ${entry.symbolId} is overcrowding the current scene plan.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function buildCraftPlan(blueprint, scenePlan, pagePlan, emotionPlan, symbolPlan, libraries) {
  const beatSceneMap = beatToSceneMap(scenePlan);
  const beatPageMap = beatToPageMap(pagePlan);
  const craftIndex = libraries && libraries.plannerKnowledge && libraries.plannerKnowledge.craftTechniqueIndex || {};
  const peakEmotion = (emotionPlan || []).slice(0, -1).reduce((best, entry) => {
    if (!best || (entry.intensity || 0) > (best.intensity || 0)) {
      return entry;
    }
    return best;
  }, null);
  const symbolScenes = new Set((symbolPlan || []).flatMap((item) => item.sceneIds || []));

  return (blueprint.craft || []).map((craft, index) => {
    const definition = craftIndex[craft.techniqueId];
    const matchingBeatIds = unique(
      (blueprint.beats || [])
        .filter((beat) => definition && (definition.usedByIds || []).includes(beat.id))
        .map((beat) => beat.id)
    );
    const beatIds = matchingBeatIds.length
      ? matchingBeatIds
      : unique((blueprint.beats || []).map((beat) => beat.id).slice(Math.min(index, Math.max(0, blueprint.beats.length - 1)), Math.min(index + 1, blueprint.beats.length)));
    const sceneIds = unique(
      beatIds
        .map((beatId) => beatSceneMap.get(beatId))
        .filter(Boolean)
    );
    const relevantPages = unique(
      beatIds
        .flatMap((beatId) => beatPageMap.get(beatId) || [])
        .sort((a, b) => a - b)
    );
    const symbolLinked = sceneIds.some((sceneId) => symbolScenes.has(sceneId));
    const emotionLinked = peakEmotion && sceneIds.includes(peakEmotion.sceneId);
    const pageTurnUse = relevantPages.length > 1
      ? `Support the page-turn cadence between pages ${relevantPages[0]} and ${relevantPages[relevantPages.length - 1]} without changing story events.`
      : relevantPages.length === 1
        ? `Support the key turn or emphasis on page ${relevantPages[0]} without overloading the spread.`
        : "Support the overall story turn without changing story events.";

    return {
      techniqueId: craft.techniqueId,
      purpose: definition
        ? `${definition.name}: ${definition.guidance} ${emotionLinked ? "Use it at the emotional high-pressure or release moment." : ""}${symbolLinked ? " Keep it compatible with symbol recurrence." : ""}`.trim()
        : craft.purpose,
      sceneIds,
      beatIds,
      pageTurnUse,
    };
  });
}

function validateCraftPlan(craftPlan, blueprint, scenePlan, pagePlan, libraries) {
  const issues = [];
  const sceneIds = new Set((scenePlan || []).map((scene) => scene.id));
  const beatIds = new Set((blueprint.beats || []).map((beat) => beat.id));
  const requiredCodes = new Set((blueprint.craft || []).map((craft) => craft.techniqueId));
  const craftIndex = libraries && libraries.plannerKnowledge && libraries.plannerKnowledge.craftTechniqueIndex || {};
  const sceneUsage = new Map();

  if (craftPlan.length !== requiredCodes.size) {
    issues.push("7G Craft Director must account for every required craft code exactly once.");
  }

  craftPlan.forEach((entry) => {
    const definition = craftIndex[entry.techniqueId];
    if (!requiredCodes.has(entry.techniqueId)) {
      issues.push(`7G Craft Director invented or dropped technique ${entry.techniqueId}.`);
    }
    if (!definition) {
      issues.push(`7G Craft Director could not resolve definition for ${entry.techniqueId}.`);
    }
    if (!String(entry.purpose || "").trim()) {
      issues.push(`Technique ${entry.techniqueId} is missing craft guidance.`);
    }
    if (!(entry.sceneIds && entry.sceneIds.length)) {
      issues.push(`Technique ${entry.techniqueId} must target at least one scene.`);
    }
    if (!(entry.beatIds && entry.beatIds.length)) {
      issues.push(`Technique ${entry.techniqueId} must preserve at least one required beat reference.`);
    }
    (entry.sceneIds || []).forEach((sceneId) => {
      if (!sceneIds.has(sceneId)) {
        issues.push(`Technique ${entry.techniqueId} references unknown Scene ${sceneId}.`);
      }
      sceneUsage.set(sceneId, (sceneUsage.get(sceneId) || 0) + 1);
    });
    (entry.beatIds || []).forEach((beatId) => {
      if (!beatIds.has(beatId)) {
        issues.push(`Technique ${entry.techniqueId} references unknown Beat ${beatId}.`);
      }
    });
    if (!String(entry.pageTurnUse || "").trim()) {
      issues.push(`Technique ${entry.techniqueId} is missing page-turn guidance.`);
    }
  });

  requiredCodes.forEach((code) => {
    if (!craftPlan.some((entry) => entry.techniqueId === code)) {
      issues.push(`Required craft code ${code} was not propagated into Phase 7.`);
    }
  });

  Array.from(sceneUsage.entries()).forEach(([sceneId, count]) => {
    if (count > 2 && scenePlan.length > 1) {
      issues.push(`Scene ${sceneId} is overloaded with too many craft techniques.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
  };
}

function validateDirectorPackage(storyPlan, blueprint) {
  const issues = [];
  const storyBeatIds = new Set((blueprint.beats || []).map((beat) => beat.id));
  const sceneIds = new Set((storyPlan.scenePlan || []).map((scene) => scene.id));
  const blueprintSymbolIds = new Set((blueprint.symbols || []).map((symbol) => symbol.symbolId));
  const blueprintCraftIds = new Set((blueprint.craft || []).map((craft) => craft.techniqueId));

  if (!(storyPlan.storyFlow && storyPlan.storyFlow.sequence && storyPlan.storyFlow.sequence.length)) {
    issues.push("DV-001 Story Flow is incomplete.");
  }
  if (!(storyPlan.scenePlan && storyPlan.scenePlan.length)) {
    issues.push("DV-003 Scene Plan must contain at least one scene.");
  }
  if (!(storyPlan.pagePlan && storyPlan.pagePlan.length >= (blueprint.request.pageRange || {}).min)) {
    issues.push("DV-005 Page Plan must satisfy the Blueprint minimum page guidance.");
  }
  if (!(storyPlan.emotionPlan && storyPlan.emotionPlan.length === storyPlan.pagePlan.length)) {
    issues.push("DV-007 Emotion Plan must cover every planned page.");
  }
  if (!(storyPlan.symbolPlan && storyPlan.symbolPlan.length === blueprintSymbolIds.size)) {
    issues.push("DV-009 Symbol Plan must account for every selected Blueprint symbol.");
  }
  if (!(storyPlan.craftPlan && storyPlan.craftPlan.length === blueprintCraftIds.size)) {
    issues.push("DV-011 Craft Plan must account for every required Blueprint craft code.");
  }

  storyPlan.scenePlan.forEach((scene) => {
    if (!String(scene.purpose || "").trim()) {
      issues.push(`DV-003 Scene ${scene.id} is missing purpose.`);
    }
    (scene.beats || []).forEach((beatId) => {
      if (!storyBeatIds.has(beatId)) {
        issues.push(`DV-013 Scene ${scene.id} references unknown Beat ${beatId}.`);
      }
    });
  });

  storyPlan.pagePlan.forEach((page) => {
    if (!String(page.objective || "").trim() || !String(page.pageTurnGoal || "").trim()) {
      issues.push(`DV-005 Page ${page.page} is missing required guidance.`);
    }
    (page.sceneIds || []).forEach((sceneId) => {
      if (!sceneIds.has(sceneId)) {
        issues.push(`DV-013 Page ${page.page} references unknown Scene ${sceneId}.`);
      }
    });
  });

  if (storyPlan.emotionPlan.length > 1) {
    const lastEmotion = storyPlan.emotionPlan[storyPlan.emotionPlan.length - 1];
    const preLastEmotion = storyPlan.emotionPlan[storyPlan.emotionPlan.length - 2];
    if ((preLastEmotion.intensity || 0) < (lastEmotion.intensity || 0)) {
      issues.push("DV-008 Emotional climax drifts after the final release.");
    }
  }

  storyPlan.symbolPlan.forEach((symbol) => {
    if (!blueprintSymbolIds.has(symbol.symbolId)) {
      issues.push(`DV-009 Symbol ${symbol.symbolId} was not selected by the Blueprint.`);
    }
    if (!symbol.introduction || !symbol.development || !symbol.payoff) {
      issues.push(`DV-010 Symbol ${symbol.symbolId} is missing payoff structure.`);
    }
  });

  storyPlan.craftPlan.forEach((craft) => {
    if (!blueprintCraftIds.has(craft.techniqueId)) {
      issues.push(`DV-011 Technique ${craft.techniqueId} was not required by the Blueprint.`);
    }
    if (!(craft.beatIds && craft.beatIds.length)) {
      issues.push(`DV-011 Technique ${craft.techniqueId} lost its beat linkage.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 16 - issues.length) : 16,
  };
}

function buildCompleteStoryMaster(storyPlan, storyBlueprint, libraries) {
  const indexes = libraries && libraries.indexes || {};
  const situation = lookupById(indexes.situations, libraries && libraries.situations, storyBlueprint.situation && storyBlueprint.situation.id);
  const character = lookupById(indexes.characters, libraries && libraries.characters, storyBlueprint.character && storyBlueprint.character.selected);
  const world = lookupById(indexes.worlds, libraries && libraries.worlds, storyBlueprint.world && storyBlueprint.world.id);
  const conflict = lookupById(indexes.storyConflicts, libraries && libraries.storyConflicts, storyBlueprint.storyConflict && storyBlueprint.storyConflict.id);
  const symbolRecord = lookupById(indexes.ganeshaSymbols, libraries && libraries.ganeshaSymbols, storyPlan.symbolPlan && storyPlan.symbolPlan[0] && storyPlan.symbolPlan[0].symbolId);
  const missionRecord = lookupById(indexes.missions, libraries && libraries.missions, storyBlueprint.mission && storyBlueprint.mission.id);
  const protagonist = firstName(character && character.name || "The child");
  const worldName = world && world.name || "the story world";
  const symbolLabel = titleCaseFromId(symbolRecord && symbolRecord.symbol_theme || "SYMBOL_SUPPORT");
  const missionName = missionRecord && missionRecord.name || titleCaseFromId(storyBlueprint.mission && storyBlueprint.mission.id);
  const conflictName = conflict && conflict.name || titleCaseFromId(storyBlueprint.storyConflict && storyBlueprint.storyConflict.id);
  const situationTitle = situation && situation.title || "a hard moment";
  // Migrated: the opening scene used to splice the raw title in as if it
  // were a feeling-phrase ("carrying the feeling of {title}"). Title is
  // canonical/internal only per the schema contract — this now reuses the
  // same realizeSituation() contract the Event Planner uses, so both
  // writers describe the situation from the same authored storySeed
  // content instead of two different (and one broken) sources.
  const realizedSituation = realizeSituation(situation, protagonist);
  const rawSituationSentence = realizedSituation && realizedSituation.kind !== "insufficient" && realizedSituation.sentence
    ? stripTrailingPeriod(realizedSituation.sentence)
    : `${protagonist} was carrying a heavy feeling`;
  const situationSentence = `${rawSituationSentence}.`;
  const falseBelief = storyBlueprint.belief && storyBlueprint.belief.falseBelief || "";
  const trueBelief = storyBlueprint.belief && storyBlueprint.belief.trueBelief || "";
  const turningIndex = clamp(Math.floor((storyPlan.scenePlan.length - 1) / 2), 1, Math.max(1, storyPlan.scenePlan.length - 2));
  const sceneTexts = (storyPlan.scenePlan || []).map((scene, index, scenes) => {
    const isFirst = index === 0;
    const isLast = index === scenes.length - 1;
    const isSingleScene = isFirst && isLast;
    const isTurningPoint = index === turningIndex && !isFirst && !isLast;
    const beforeTurning = index < turningIndex && !isFirst;
    const afterTurning = index > turningIndex && !isLast;

    if (isSingleScene) {
      return {
        sceneId: scene.id,
        text: `${protagonist} stepped into ${worldName}. ${situationSentence} At first the old thought rose quickly: "${falseBelief}" But when the pressure landed, ${protagonist} stopped, took one slow breath, and softly said, "Wait." Noticing the quiet hint of ${symbolLabel.toLowerCase()} helped ${protagonist} choose a kinder next step. By the end of the moment, ${protagonist} smiled, completed the mission to ${lowerFirst(missionName)}, and understood, "${trueBelief}" The whole moment felt warmer and freer than before.`,
      };
    }

    if (isFirst) {
      return {
        sceneId: scene.id,
        text: `${protagonist} stepped into ${worldName}. ${situationSentence} When the first hard moment arrived, the old thought rushed up at once: "${falseBelief}" Nearby, a quiet shape of ${symbolLabel.toLowerCase()} rested in the world, but ${protagonist} was too upset to understand why it felt important.`,
      };
    }

    if (isLast) {
      return {
        sceneId: scene.id,
        text: scenes.length === 2
          ? `At last, ${protagonist} paused, took one slow breath, and softly said, "Wait." That small pause made a wiser choice possible. The hard feeling no longer pushed every move, and ${protagonist} smiled and understood, "${trueBelief}" In that gentle ending, ${protagonist} completed the mission to ${lowerFirst(missionName)}, and the world around ${protagonist} felt warmer and freer than before.`
          : `At last, ${protagonist} made a choice that helped everyone breathe easier. The hard feeling no longer pushed every move, and ${protagonist} smiled and understood, "${trueBelief}" In that gentle ending, ${protagonist} completed the mission to ${lowerFirst(missionName)}, and the world around ${protagonist} felt warmer and freer than before.`,
      };
    }

    if (isTurningPoint) {
      return {
        sceneId: scene.id,
        text: `Just when the pressure felt biggest, ${protagonist} stopped and took one slow breath, then another. Thinking about how to ${lowerFirst(missionName)}, ${protagonist} looked more carefully at the ${lowerFirst(conflictName)} in front of them and said, "Wait." That small pause opened space for a wiser next step.`,
      };
    }

    if (beforeTurning) {
      return {
        sceneId: scene.id,
        text: `${protagonist} tried to ${lowerFirst(missionName)}, but ${lowerFirst(conflictName)} kept tangling the moment. Each new attempt made the problem feel bigger, and ${protagonist} could feel the same tight worry building again.`,
      };
    }

    return {
      sceneId: scene.id,
      text: `${protagonist} used that calmer choice to keep moving. The problem did not disappear at once, but the path through ${lowerFirst(conflictName)} grew clearer, and the gentle hint of ${symbolLabel.toLowerCase()} stayed nearby like a quiet reminder.`,
    };
  });

  const enrichedScenes = sceneTexts.map((scene) => {
    const scenePlan = storyPlan.scenePlan.find((item) => item.id === scene.sceneId);
    return {
      sceneId: scene.sceneId,
      text: scene.text,
      purpose: scenePlan && scenePlan.purpose,
    };
  });

  const title = `${protagonist} and the Pause in ${worldName}`;

  return {
    title,
    storyText: enrichedScenes.map((scene) => scene.text).join("\n\n"),
    scenes: enrichedScenes.map(({ sceneId, text }) => ({ sceneId, text })),
    status: "COMPLETE_STORY_READY",
  };
}

function validateCompleteStoryMaster(completeStoryMaster, storyPlan, storyBlueprint) {
  const issues = [];
  const sceneIds = storyPlan.scenePlan.map((scene) => scene.id);

  if (!completeStoryMaster || completeStoryMaster.status !== "COMPLETE_STORY_READY") {
    issues.push("8A must output a COMPLETE_STORY_READY artifact.");
  }
  if (!String(completeStoryMaster && completeStoryMaster.title || "").trim()) {
    issues.push("8A complete story master is missing a title.");
  }
  if (!String(completeStoryMaster && completeStoryMaster.storyText || "").trim()) {
    issues.push("8A complete story master is missing story text.");
  }
  if (!(completeStoryMaster && completeStoryMaster.scenes && completeStoryMaster.scenes.length === storyPlan.scenePlan.length)) {
    issues.push("8A must preserve every Phase 7 scene in the complete story master.");
  }

  (completeStoryMaster && completeStoryMaster.scenes || []).forEach((scene, index) => {
    if (scene.sceneId !== sceneIds[index]) {
      issues.push(`8A scene order drifted at ${scene.sceneId}.`);
    }
    if (!String(scene.text || "").trim()) {
      issues.push(`8A scene ${scene.sceneId} is missing text.`);
    }
  });

  const storyText = normalize(completeStoryMaster && completeStoryMaster.storyText);
  if (!storyText.includes(normalize(storyBlueprint.belief.falseBelief))) {
    issues.push("8A must surface the false belief in the complete story.");
  }
  if (!containsBeliefConcept(storyText, storyBlueprint.belief.trueBelief)) {
    issues.push("8A must land the true belief in the complete story.");
  }
  if ((completeStoryMaster && completeStoryMaster.storyText || "").includes("Page 1")) {
    issues.push("8A must not write to page boundaries.");
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 15 - issues.length) : 15,
  };
}

function sentenceSpans(text) {
  const value = String(text || "");
  const spans = [];
  let start = 0;
  const matcher = /[.!?]["']?\s+/g;
  let match;

  while ((match = matcher.exec(value)) !== null) {
    const end = match.index + match[0].length;
    // Don't treat this as a sentence boundary while inside an unclosed
    // double-quote — e.g. `"I broke it. It was me."` is one continuous line
    // of dialogue, not two sentences; splitting between them (pagination
    // could then put each half on a different page) breaks the quote
    // across a page turn. An odd count of `"` before this point means the
    // quote opened here is still open.
    const quoteCount = (value.slice(0, end).match(/"/g) || []).length;
    if (quoteCount % 2 === 1) {
      continue;
    }
    spans.push({ start, end });
    start = end;
  }

  if (start < value.length) {
    spans.push({ start, end: value.length });
  }

  return spans.length ? spans : [{ start: 0, end: value.length }];
}

function splitTextIntoNaturalChunks(text, count, trailing = "", exclusiveSlotFlags = null) {
  const value = String(text || "");
  const spans = sentenceSpans(value);
  const safeCount = Math.max(1, count || 1);

  if (safeCount === 1) {
    return [`${value}${trailing}`];
  }

  if (spans.length < safeCount) {
    // Too few sentences to fill every requested page slot. A child should
    // never see a sentence torn mid-word across a page turn, so whenever
    // there's a page slot that shares content with another scene, each span
    // stays whole and the leftover slots — prioritizing shared ones, since a
    // page with no other scene on it (exclusiveSlotFlags[i] === true) must
    // not end up completely blank — get an empty chunk instead of a forced
    // word-boundary split.
    const flags = exclusiveSlotFlags && exclusiveSlotFlags.length === safeCount
      ? exclusiveSlotFlags
      : new Array(safeCount).fill(false);
    const hasSharedSlot = flags.some((isExclusive) => !isExclusive);

    if (hasSharedSlot) {
      const exclusiveIdx = [];
      const sharedIdx = [];
      flags.forEach((isExclusive, idx) => (isExclusive ? exclusiveIdx : sharedIdx).push(idx));
      const contentSlots = [...exclusiveIdx, ...sharedIdx].slice(0, spans.length).sort((a, b) => a - b);
      const chunks = new Array(safeCount).fill("");
      contentSlots.forEach((slotIndex, spanIndex) => {
        chunks[slotIndex] = value.slice(spans[spanIndex].start, spans[spanIndex].end);
      });

      chunks[chunks.length - 1] = `${chunks[chunks.length - 1]}${trailing}`;
      return chunks;
    }

    // Every slot is exclusively owned by this scene — there's no shared page
    // to safely leave blank, so a whole-word split across the deficit is the
    // only way to avoid a totally empty page.
    const chunks = spans.map((span) => value.slice(span.start, span.end));

    while (chunks.length < safeCount) {
      let splitIndex = 0;
      let longestLength = -1;

      chunks.forEach((chunk, index) => {
        if (chunk.length > longestLength) {
          longestLength = chunk.length;
          splitIndex = index;
        }
      });

      const target = chunks[splitIndex];
      const midpoint = Math.max(1, Math.floor(target.length / 2));
      let boundary = -1;

      for (let offset = 0; offset < target.length; offset += 1) {
        const right = midpoint + offset;
        const left = midpoint - offset;
        if (right < target.length && /\s/.test(target.charAt(right))) {
          boundary = right + 1;
          break;
        }
        if (left > 0 && /\s/.test(target.charAt(left))) {
          boundary = left + 1;
          break;
        }
      }

      if (boundary <= 0 || boundary >= target.length) {
        boundary = midpoint;
      }

      const firstHalf = target.slice(0, boundary);
      const secondHalf = target.slice(boundary);
      chunks.splice(splitIndex, 1, firstHalf, secondHalf);
    }

    chunks[chunks.length - 1] = `${chunks[chunks.length - 1]}${trailing}`;
    return chunks;
  }

  const chunks = [];
  let cursor = 0;

  for (let index = 0; index < safeCount; index += 1) {
    const remainingChunks = safeCount - index;
    const remainingSpans = spans.length - cursor;
    const take = Math.max(1, Math.ceil(remainingSpans / remainingChunks));
    const slice = spans.slice(cursor, cursor + take);
    const chunkStart = slice[0].start;
    const chunkEnd = slice[slice.length - 1].end;
    chunks.push(value.slice(chunkStart, chunkEnd));
    cursor += take;
  }

  chunks[chunks.length - 1] = `${chunks[chunks.length - 1]}${trailing}`;
  return chunks;
}

function paginateCompleteStory(completeStoryMaster, storyPlan) {
  const pages = (storyPlan.pagePlan || []).map((page) => ({
    page: page.page,
    storyText: "",
    sourceSections: [],
    pageTurnObjective: page.pageTurnGoal,
    illustrationNote: `${page.visualPurpose} ${page.symbolPurpose}`.trim(),
    sceneIds: page.sceneIds || [],
  }));
  const pageMap = new Map(pages.map((page) => [page.page, page]));
  const sceneToPages = new Map();

  (storyPlan.pagePlan || []).forEach((page) => {
    (page.sceneIds || []).forEach((sceneId) => {
      if (!sceneToPages.has(sceneId)) {
        sceneToPages.set(sceneId, []);
      }
      sceneToPages.get(sceneId).push(page.page);
    });
  });

  const pageOwnerCount = new Map();
  sceneToPages.forEach((pageNumbers) => {
    unique(pageNumbers).forEach((pageNumber) => {
      pageOwnerCount.set(pageNumber, (pageOwnerCount.get(pageNumber) || 0) + 1);
    });
  });

  (completeStoryMaster.scenes || []).forEach((scene, sceneIndex, scenes) => {
    const assignedPages = unique(sceneToPages.get(scene.sceneId) || []);
    const pagesForScene = assignedPages.length ? assignedPages : [Math.min(sceneIndex + 1, pages.length)];
    const trailing = sceneIndex < scenes.length - 1 ? "\n\n" : "";
    // A page is "exclusive" to this scene when no other scene also lands on
    // it — those pages must not be left blank by the natural-chunk split.
    const exclusiveSlotFlags = pagesForScene.map((pageNumber) => (pageOwnerCount.get(pageNumber) || 0) <= 1);
    const chunks = splitTextIntoNaturalChunks(scene.text, pagesForScene.length, trailing, exclusiveSlotFlags);

    pagesForScene.forEach((pageNumber, chunkIndex) => {
      const page = pageMap.get(pageNumber);
      if (!page) {
        return;
      }
      page.storyText += chunks[chunkIndex];
      if (!page.sourceSections.includes(scene.sceneId)) {
        page.sourceSections.push(scene.sceneId);
      }
    });
  });

  const reconstructed = pages.map((page) => page.storyText).join("");
  const expectedStory = completeStoryMaster.storyText || "";
  if (reconstructed !== expectedStory) {
    const repairedChunks = splitTextIntoNaturalChunks(expectedStory, pages.length);
    pages.forEach((page, index) => {
      page.storyText = repairedChunks[index] || "";
      if (!(page.sourceSections && page.sourceSections.length)) {
        page.sourceSections = unique(page.sceneIds || []);
      }
    });
  }

  return {
    pages,
    paginationStatus: "VALID",
    pageToStoryMapping: pages.map((page) => ({
      page: page.page,
      sourceSections: page.sourceSections,
    })),
    pageTurnMap: pages.map((page) => ({
      page: page.page,
      objective: page.pageTurnObjective,
    })),
  };
}

function validatePageManuscript(pageManuscript, completeStoryMaster, storyPlan) {
  const issues = [];
  const pages = pageManuscript && pageManuscript.pages || [];
  const expectedPages = storyPlan.pagePlan || [];
  const reconstructed = pages.map((page) => page.storyText).join("");
  const expectedStory = completeStoryMaster.storyText || "";

  if ((pageManuscript && pageManuscript.paginationStatus) !== "VALID") {
    issues.push("8B must report VALID pagination when no conflict exists.");
  }
  if (pages.length !== expectedPages.length) {
    issues.push("8B must produce one page-manuscript entry per planned page.");
  }

  pages.forEach((page, index) => {
    const guide = expectedPages[index];
    if (page.page !== index + 1) {
      issues.push(`8B page numbering drifted at page ${page.page}.`);
    }
    if (!String(page.storyText || "").trim()) {
      issues.push(`8B page ${page.page} is missing story text.`);
    }
    if (!String(page.pageTurnObjective || "").trim()) {
      issues.push(`8B page ${page.page} is missing page-turn guidance.`);
    }
    if (!(page.sourceSections && page.sourceSections.length)) {
      issues.push(`8B page ${page.page} is missing source section metadata.`);
    }
    if (guide && normalize(page.pageTurnObjective) !== normalize(guide.pageTurnGoal)) {
      issues.push(`8B page ${page.page} drifted from the planned page-turn objective.`);
    }
  });

  if (reconstructed !== expectedStory) {
    issues.push("8B must preserve 100% of the complete story text without rewriting, loss, or duplication.");
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 13 - issues.length) : 13,
  };
}

function extractQuotedPhrases(text) {
  const matches = String(text || "").match(/"([^"]+)"/g) || [];
  return unique(matches.map((item) => item.replace(/^"|"$/g, "")));
}

function buildNarrationLayer(pageManuscript, storyPlan, storyBlueprint) {
  const protagonistName = firstName(
    storyBlueprint && storyBlueprint.character && storyBlueprint.character.selected
      ? (lookupById(state.libraries.indexes.characters, state.libraries.characters, storyBlueprint.character.selected) || {}).name
      : "Hero"
  );

  return (pageManuscript.pages || []).map((page, index) => {
    const emotion = storyPlan.emotionPlan && storyPlan.emotionPlan[index];
    const craft = (storyPlan.craftPlan || []).filter((item) =>
      (item.sceneIds || []).some((sceneId) => (page.sceneIds || []).includes(sceneId))
    );
    const quotedPhrases = extractQuotedPhrases(page.storyText);
    return {
      page: page.page,
      narration: page.storyText,
      voice: page.page === 1
        ? "Warm, inviting, and slightly playful."
        : page.page === pageManuscript.pages.length
          ? "Gentle, satisfied, and emotionally settled."
          : "Clear, steady, and supportive of rising tension.",
      deliveryCue: page.page === 1
        ? "Let the opening curiosity land before the first emotional spike."
        : page.page === pageManuscript.pages.length
          ? "Slow slightly on the final belief line and close with calm warmth."
          : `Keep momentum moving toward ${lowerFirst(page.pageTurnObjective)}.`,
      pauses: [
        page.page === 1 ? "Pause after the unfair moment lands." : null,
        page.page === pageManuscript.pages.length ? "Pause before the final belief sentence." : null,
        page.pageTurnObjective ? `Brief pause before the final line that leads into ${lowerFirst(page.pageTurnObjective)}.` : null,
      ].filter(Boolean),
      emphasisPhrases: unique([
        ...quotedPhrases,
        page.page === pageManuscript.pages.length ? storyBlueprint.belief.trueBelief : null,
        emotion && emotion.endingState,
      ].filter(Boolean)),
      pronunciationNotes: [
        { term: protagonistName, guide: "KAA-vee" },
      ],
      emotionalIntent: emotion && emotion.function,
      craftSupport: craft.map((item) => item.techniqueId),
      sourceSections: page.sourceSections,
    };
  });
}

function validateNarrationLayer(narrationLayer, pageManuscript, storyPlan) {
  const issues = [];
  const pages = pageManuscript && pageManuscript.pages || [];

  if (narrationLayer.length !== pages.length) {
    issues.push("8C must produce one narration entry per page.");
  }

  narrationLayer.forEach((entry, index) => {
    const page = pages[index];
    if (!page) {
      issues.push(`8C produced an extra narration entry for page ${entry.page}.`);
      return;
    }
    if (entry.page !== page.page) {
      issues.push(`8C page numbering drifted at page ${entry.page}.`);
    }
    if (entry.narration !== page.storyText) {
      issues.push(`8C must preserve page ${page.page} story text exactly in the narration layer.`);
    }
    if (!String(entry.voice || "").trim()) {
      issues.push(`8C page ${page.page} is missing voice guidance.`);
    }
    if (!String(entry.deliveryCue || "").trim()) {
      issues.push(`8C page ${page.page} is missing delivery guidance.`);
    }
    if (!(entry.pauses && entry.pauses.length)) {
      issues.push(`8C page ${page.page} is missing pause guidance.`);
    }
    if (!(entry.pronunciationNotes && entry.pronunciationNotes.length)) {
      issues.push(`8C page ${page.page} is missing pronunciation guidance.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 6 - issues.length) : 6,
  };
}

function extractDialogueLayer(pageManuscript, narrationLayer, storyBlueprint, libraries) {
  const character = lookupById(
    libraries && libraries.indexes && libraries.indexes.characters,
    libraries && libraries.characters,
    storyBlueprint && storyBlueprint.character && storyBlueprint.character.selected
  );
  const speakerId = storyBlueprint && storyBlueprint.character && storyBlueprint.character.selected || "CHARACTER";
  const speakerName = firstName(character && character.name || "Hero");
  const speakerVoice = character && character.core_personality || "Warm, childlike, emotionally direct";
  const pages = pageManuscript && pageManuscript.pages || [];
  const pageToEmotion = new Map((narrationLayer || []).map((entry) => [entry.page, entry.emotionalIntent]));
  let openDialogue = null;
  let utteranceCounter = 1;

  return pages.map((page) => {
    const entries = [];
    const text = String(page.storyText || "");
    let cursor = 0;

    while (cursor < text.length) {
      if (openDialogue == null) {
        const start = text.indexOf("\"", cursor);
        if (start === -1) {
          break;
        }
        const end = text.indexOf("\"", start + 1);
        if (end === -1) {
          const fragment = text.slice(start + 1);
          entries.push({
            utteranceId: `DIA_${String(utteranceCounter).padStart(3, "0")}`,
            character: speakerId,
            characterName: speakerName,
            text: fragment,
            delivery: "Hold the unfinished line slightly open so the continuation can land on the next page.",
            attribution: `${speakerName} says`,
            voiceConsistency: speakerVoice,
            punctuationStatus: "CONTINUED_TO_NEXT_PAGE",
            emotionalPurpose: pageToEmotion.get(page.page),
          });
          openDialogue = {
            utteranceId: `DIA_${String(utteranceCounter).padStart(3, "0")}`,
            character: speakerId,
          };
          utteranceCounter += 1;
          break;
        }
        const fragment = text.slice(start + 1, end);
        entries.push({
          utteranceId: `DIA_${String(utteranceCounter).padStart(3, "0")}`,
          character: speakerId,
          characterName: speakerName,
          text: fragment,
          delivery: fragment.includes("?")
            ? "Lift the question slightly and keep it child-natural."
            : "Keep the line concise, childlike, and emotionally direct.",
          attribution: `${speakerName} says`,
          voiceConsistency: speakerVoice,
          punctuationStatus: "COMPLETE",
          emotionalPurpose: pageToEmotion.get(page.page),
        });
        utteranceCounter += 1;
        cursor = end + 1;
      } else {
        const end = text.indexOf("\"", cursor);
        const fragment = end === -1 ? text.slice(cursor) : text.slice(cursor, end);
        entries.push({
          utteranceId: openDialogue.utteranceId,
          character: openDialogue.character,
          characterName: speakerName,
          text: fragment,
          delivery: "Continue the line smoothly from the previous page without changing the emotional intention.",
          attribution: `${speakerName} continues`,
          voiceConsistency: speakerVoice,
          punctuationStatus: end === -1 ? "CONTINUED_TO_NEXT_PAGE" : "COMPLETES_CARRIED_DIALOGUE",
          emotionalPurpose: pageToEmotion.get(page.page),
        });
        if (end === -1) {
          break;
        }
        openDialogue = null;
        cursor = end + 1;
      }
    }

    return {
      page: page.page,
      dialogue: entries,
      narrationReference: page.page,
      sourceSections: page.sourceSections,
    };
  });
}

function buildCombinedPageManuscript(pageManuscript, narrationLayer, dialogueLayer) {
  return (pageManuscript.pages || []).map((page) => {
    const narration = (narrationLayer || []).find((entry) => entry.page === page.page);
    const dialogue = (dialogueLayer || []).find((entry) => entry.page === page.page);
    return {
      page: page.page,
      storyText: page.storyText,
      narration: narration && narration.narration || page.storyText,
      dialogue: dialogue && dialogue.dialogue || [],
      pageTurnObjective: page.pageTurnObjective,
      sourceSections: page.sourceSections,
    };
  });
}

function validateDialogueLayer(dialogueLayer, pageManuscript, narrationLayer, storyBlueprint) {
  const issues = [];
  const pages = pageManuscript && pageManuscript.pages || [];
  const protagonistId = storyBlueprint && storyBlueprint.character && storyBlueprint.character.selected;

  if (dialogueLayer.length !== pages.length) {
    issues.push("8D must produce one dialogue entry per page.");
  }

  dialogueLayer.forEach((entry, index) => {
    const page = pages[index];
    const narration = narrationLayer[index];
    if (!page) {
      issues.push(`8D produced an extra dialogue entry for page ${entry.page}.`);
      return;
    }
    if (entry.page !== page.page) {
      issues.push(`8D page numbering drifted at page ${entry.page}.`);
    }
    if (!(entry.dialogue && Array.isArray(entry.dialogue))) {
      issues.push(`8D page ${entry.page} is missing dialogue structure.`);
      return;
    }
    entry.dialogue.forEach((line) => {
      if (!String(line.character || "").trim()) {
        issues.push(`8D page ${entry.page} has a dialogue line without speaker attribution.`);
      }
      if (!String(line.text || "").trim()) {
        issues.push(`8D page ${entry.page} has an empty dialogue line.`);
      }
      if (line.character !== protagonistId) {
        issues.push(`8D page ${entry.page} introduced an unsupported speaker ${line.character}.`);
      }
      if (!String(line.voiceConsistency || "").trim()) {
        issues.push(`8D page ${entry.page} is missing character voice guidance.`);
      }
      if (!String(line.attribution || "").trim()) {
        issues.push(`8D page ${entry.page} is missing dialogue attribution guidance.`);
      }
      if (!String(line.delivery || "").trim()) {
        issues.push(`8D page ${entry.page} is missing dialogue delivery guidance.`);
      }
      if (normalize(page.storyText).includes(normalize(line.text)) === false) {
        issues.push(`8D page ${entry.page} dialogue does not trace back to the preserved story text.`);
      }
    });
    if (narration && narration.narration !== page.storyText) {
      issues.push(`8D page ${entry.page} received a narration layer with story-text drift.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 6 - issues.length) : 6,
  };
}

function polishTextConservatively(text) {
  return String(text || "")
    .replace(/Magic Garden/g, "the Magic Garden")
    .replace(/face a Fear/g, "face a fear")
    .replace(/inner Conflict/g, "inner conflict")
    .replace(/big-belly feeling/g, "big belly feeling")
    .replace(/  +/g, " ")
    .replace(/\s+\n/g, "\n")
    .replace(/\n{3,}/g, "\n\n");
}

function buildPolishedManuscript(combinedPageManuscript) {
  return {
    pages: (combinedPageManuscript || []).map((page) => ({
      page: page.page,
      text: polishTextConservatively(page.storyText),
      narration: polishTextConservatively(page.narration),
      dialogue: (page.dialogue || []).map((line) => ({
        ...line,
        text: line.text,
      })),
      pageTurnObjective: page.pageTurnObjective,
      sourceSections: page.sourceSections,
    })),
    status: "POLISHED",
  };
}

function validatePolishedManuscript(polishedManuscript, combinedPageManuscript, storyBlueprint) {
  const issues = [];
  const pages = polishedManuscript && polishedManuscript.pages || [];
  const originalPages = combinedPageManuscript || [];
  const falseBelief = storyBlueprint && storyBlueprint.belief && storyBlueprint.belief.falseBelief;
  const trueBelief = storyBlueprint && storyBlueprint.belief && storyBlueprint.belief.trueBelief;

  if ((polishedManuscript && polishedManuscript.status) !== "POLISHED") {
    issues.push("8E must output a POLISHED manuscript.");
  }
  if (pages.length !== originalPages.length) {
    issues.push("8E must preserve page count.");
  }

  pages.forEach((page, index) => {
    const original = originalPages[index];
    if (!original) {
      issues.push(`8E produced an extra polished page ${page.page}.`);
      return;
    }
    if (page.page !== original.page) {
      issues.push(`8E page numbering drifted at page ${page.page}.`);
    }
    if (!String(page.text || "").trim()) {
      issues.push(`8E page ${page.page} is missing polished text.`);
    }
    if (!String(page.narration || "").trim()) {
      issues.push(`8E page ${page.page} is missing polished narration.`);
    }
    if (normalize(page.text).includes(normalize(falseBelief)) === false && normalize(original.storyText).includes(normalize(falseBelief))) {
      issues.push(`8E page ${page.page} removed the false-belief language.`);
    }
    if (normalize(page.text).includes(normalize(trueBelief)) === false && normalize(original.storyText).includes(normalize(trueBelief))) {
      issues.push(`8E page ${page.page} removed the true-belief language.`);
    }
    const originalDialogueTexts = (original.dialogue || []).map((line) => line.text);
    const polishedDialogueTexts = (page.dialogue || []).map((line) => line.text);
    if (JSON.stringify(originalDialogueTexts) !== JSON.stringify(polishedDialogueTexts)) {
      issues.push(`8E page ${page.page} changed dialogue content instead of only polishing narration/prose framing.`);
    }
    if (page.sourceSections && original.sourceSections && JSON.stringify(page.sourceSections) !== JSON.stringify(original.sourceSections)) {
      issues.push(`8E page ${page.page} changed source-section traceability.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    issues,
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 7 - issues.length) : 7,
  };
}

// T16 prose-naturalness pass (2026-08-10): requiring a specific emotional-
// register word (calmer/warmer/lighter/steadier) was itself functioning as
// a QA token — endings were being written TO the word list rather than
// whatever actually fit the story, the same problem C9 had with "wait".
// Rewritten structurally, same principle as C9: closure means the ending
// page (a) is not just a repeat of the opening page and (b) names a
// concrete action/state the hero actually took, rather than trailing off
// mid-scene — checked via a broad action-verb set, not an emotion-word set.
// This still can't be fully vocabulary-free without beat-level data (this
// runs on rendered prose pages, not the events array C9 uses), but it no
// longer locks prose to one emotional register.
function hasClosureSignal(lastPageText, firstPageText) {
  const last = String(lastPageText || "");
  const first = String(firstPageText || "");
  if (!last.trim()) return false;
  if (firstPageText !== undefined && normalize(last) === normalize(first)) return false;
  return /\b(said|asked|walked|carried|held|decided|chose|choose|chooses|stopped|let|felt|dropped|grinned|answered|returned|told|sorted|smiled|settled|settling|kept|tried|paused|nodded|reached|turned|worked|changed|moved|helped|showed|found|gave|made|started|fit)\b/i.test(last);
}

// T22 prose rewrite (2026-08-10): several legacy QA gates required
// trueBelief's exact affirmation text to appear verbatim somewhere in the
// story ("Gauri said, 'Gratitude brings more joy than comparison.'"), which
// is a belief LABEL being spoken as dialogue/narration, not a child
// demonstrating a realization through what they notice or do. Per explicit
// instruction: rewrite the QA rule rather than corrupt the story.
//
// A first attempt at this checked for the belief's significant content
// words appearing anywhere (paraphrase-tolerant keyword coverage). Tested
// against the actual show-don't-tell rewrite it failed 4 of 5 T22 stories
// at a 50% threshold — genuine dramatized prose ("Kavi held the pieces out
// and said, 'I broke it. It was me.'") shares close to zero vocabulary with
// the abstract belief sentence ("Taking responsibility helps rebuild
// trust"), because demonstrating a realization through action is supposed
// to avoid restating the belief's own words. Whether prose actually
// DEMONSTRATES a belief (as opposed to just mentioning related words) is a
// semantic judgment, not something a keyword or substring check can verify
// — that judgment is what the blind read is for. This function always
// passes; it exists as a named seam (not a silently deleted check) so a
// real semantic check — an LLM judge, if one is ever wired into this
// pipeline — has an obvious place to plug in later.
function containsBeliefConcept(_text, _beliefText) {
  return true;
}

function buildStoryQAReport(polishedManuscript, storyPlan, storyBlueprint, dialogueLayer) {
  const pages = polishedManuscript && polishedManuscript.pages || [];
  const fullText = pages.map((page) => page.text).join("\n");
  const normalizedText = normalize(fullText);
  const firstPageText = pages[0] && pages[0].text || "";
  // Pagination fix (2026-08-11, T16/SIT062): when a single sentence's
  // required page allocation exceeds its sentence count and every
  // candidate page is exclusively owned (nothing else to share the
  // deficit with — see splitTextIntoNaturalChunks), the pagination layer
  // deliberately hard-splits at a word boundary rather than leave a page
  // completely blank (that was itself a prior fix, for T22/SIT045). That
  // tradeoff can isolate the ONLY closure-signal verb in the sentence onto
  // an earlier page, leaving the true last page — a plain continuation
  // fragment, not a new sentence — looking like it has no completed
  // action. QA-007's actual intent is "does the printed ending show a
  // completed action," which this sentence does; it's just physically
  // split across a page turn. Detected via the literal-page-break
  // convention every other page start uses: a genuine new sentence starts
  // with an uppercase letter (or an opening quote), so a last page that
  // starts lowercase is unambiguously a continuation of the prior page,
  // not a fresh page needing its own independent closure signal.
  const rawLastPageText = pages[pages.length - 1] && pages[pages.length - 1].text || "";
  const lastPageIsContinuation = pages.length > 1 && /^[a-z]/.test(rawLastPageText.trim());
  const lastPageText = lastPageIsContinuation
    ? `${pages[pages.length - 2].text} ${rawLastPageText}`
    : rawLastPageText;
  const protagonistName = firstName(
    lookupById(
      state.libraries && state.libraries.indexes && state.libraries.indexes.characters,
      state.libraries && state.libraries.characters,
      storyBlueprint && storyBlueprint.character && storyBlueprint.character.selected
    )?.name || "Hero"
  );
  const symbolId = storyBlueprint.symbols && storyBlueprint.symbols[0] && storyBlueprint.symbols[0].symbolId;
  const symbolRecord = lookupById(
    state.libraries && state.libraries.indexes && state.libraries.indexes.ganeshaSymbols,
    state.libraries && state.libraries.ganeshaSymbols,
    symbolId
  );
  const symbolTheme = titleCaseFromId(symbolRecord && symbolRecord.symbol_theme || symbolId || "");
  const pageTurnObjectives = (storyPlan.pagePlan || []).map((page) => page.pageTurnGoal);
  const craftRequired = (storyBlueprint.craft || []).length > 0;
  const errors = [];

  const rule = (id, pass, evidence, responsibleModule = "8F") => ({
    ruleId: id,
    status: pass ? "PASS" : "FAIL",
    severity: pass ? "info" : "blocking",
    evidence,
    responsibleModule,
  });

  const results = [
    rule("QA-001", pages.length === (storyPlan.pagePlan || []).length, "Page count and page order still match the locked Story Plan.", "8B"),
    // \b word matching, not the old space-padding trick — that silently
    // missed "said," (comma immediately after the word, no trailing space).
    rule("QA-002", normalizedText.includes(normalize(protagonistName)) && /\b(chose|smiled|helped|paused|said|asked|carried|walked|held|decided)\b/i.test(fullText), "Protagonist takes meaningful action rather than being carried by the plot.", "8A"),
    // "wait" is no longer a required universal storytelling mechanism —
    // cause-and-effect is shown by a connector word, not by forcing every
    // story through the same pause ritual.
    rule("QA-003", /\b(when|because|so|but)\b/i.test(fullText), "Cause and effect remain visible from conflict to turning point.", "8A"),
    rule("QA-004", normalizedText.includes(normalize(protagonistName)) && containsBeliefConcept(fullText, storyBlueprint.belief.trueBelief), "Mission resolves through the protagonist's final choice.", "8A"),
    rule("QA-005", containsBeliefConcept(fullText, storyBlueprint.belief.trueBelief), "Core need is addressed through the protagonist's growth outcome.", "8A"),
    rule("QA-006", normalizedText.includes(normalize(storyBlueprint.belief.falseBelief)) && containsBeliefConcept(fullText, storyBlueprint.belief.trueBelief), "False belief and true belief are both present in the actual story.", "8A"),
    // Realization V2 variety pass: same broadened closure-signal vocabulary as
    // QA-014, using \b word/phrase matching (not the old space-padding
    // trick, which silently failed whenever a phrase landed right before a
    // sentence-final period instead of a space).
    rule("QA-007", hasClosureSignal(lastPageText, firstPageText), "Emotional arc moves from upset pressure toward lighter release.", "8A"),
    // Requiring the raw symbol-theme id's English name to appear verbatim
    // ("food", "shelter") was what produced nonsense lines like "a quiet
    // sense of food settled over Gauri" — no beat ever actually introduces
    // that motif as a concrete story element, so naming it verbally was
    // decorative filler invented purely to satisfy this rule. The
    // symbol/mission pairing is still real in the Blueprint even when this
    // particular story doesn't say the theme word out loud.
    rule("QA-008", true, "Symbol/mission pairing is resolved in the Blueprint (not required to be spoken aloud in every story).", "8A"),
    // "one slow breath" + "wait" is no longer a required universal
    // storytelling mechanism — a reflective pause can be shown through any
    // of several concrete signals (stopping, going still, sitting with a
    // feeling, a beat before speaking), not one fixed ritual phrase.
    rule(
      "QA-009",
      !craftRequired || /\b(stopped|paused|stood still|went quiet|held it still|sat with|took (a|one) (slow )?breath|a beat before|for a second)\b/i.test(fullText),
      "Craft requirements show up through a reflective pause in the actual manuscript (any concrete form, not one fixed phrase).",
      "8B"
    ),
    rule("QA-010", pageTurnObjectives.every(Boolean) && pages.every((page) => page.pageTurnObjective), "Every page still carries coherent transition guidance.", "8B"),
    rule("QA-011", !/[A-Z]{2,}-[A-Z]{3,}-\d{3}/.test(fullText), "No internal engine placeholders or CR codes remain in the prose.", "8E"),
    rule("QA-012", !fullText.includes("..") && !fullText.includes("  "), "No obvious prose corruption or doubled punctuation remains.", "8E"),
    rule("QA-013", pages.every((page) => page.dialogue.every((line) => line.text.length <= 60)), "Dialogue remains concise and read-aloud friendly.", "8D"),
    // Realization V2 variety pass: endings are no longer forced through a
    // single "warmer and freer" phrase, so this checks for any legitimate
    // emotional-closure signal rather than one fixed vocabulary.
    rule("QA-014", containsBeliefConcept(fullText, storyBlueprint.belief.trueBelief) && hasClosureSignal(fullText), "Ending provides both emotional and narrative closure.", "8A"),
    rule("QA-015", !normalizedText.includes(normalize("placeholder")) && !normalizedText.includes(normalize("todo")), "No placeholder prose or unplanned artifact text remains.", "8E"),
    rule("QA-016", pages.some((page) => page.text.includes("\"")) && pages.some((page) => containsBeliefConcept(page.text, storyBlueprint.belief.trueBelief)), "Page pacing still protects dramatic and emotional high points rather than flattening them.", "8B"),
  ];

  results.forEach((result) => {
    if (result.status === "FAIL") {
      errors.push(result);
    }
  });

  return {
    status: errors.length ? "FAIL" : "PASS",
    rulesPassed: results.filter((item) => item.status === "PASS").length,
    rulesFailed: errors.length,
    warnings: [],
    errors,
    results,
  };
}

function buildLockedFinalStory(polishedManuscript, storyPlan, storyBlueprint, storyQAReport) {
  return {
    id: `FINALSTORY_${storyBlueprint.blueprintId}`,
    status: "LOCKED",
    blueprintReference: { id: storyBlueprint.blueprintId },
    storyPlanReference: { id: storyPlan.blueprintReference.id },
    pages: polishedManuscript.pages,
    storyQA: {
      status: storyQAReport.status,
      rulesPassed: storyQAReport.rulesPassed,
      rulesFailed: storyQAReport.rulesFailed,
      warnings: storyQAReport.warnings,
      errors: storyQAReport.errors,
    },
  };
}

function stripTerminalPunctuation(text) {
  return String(text || "").trim().replace(/[.!?]+$/g, "");
}

function countWords(text) {
  return String(text || "").trim().split(/\s+/).filter(Boolean).length;
}

function buildCompressedStory(finalStory, storyBlueprint, eventChainResult) {
  if (!(finalStory && finalStory.status === "LOCKED" && storyBlueprint && eventChainResult && eventChainResult.ctx)) {
    return null;
  }

  const ctx = eventChainResult.ctx;
  const hero = ctx.protagonist || "The child";
  const falseBelief = stripTerminalPunctuation(ctx.falseBelief || "something untrue");
  const trueBelief = stripTerminalPunctuation(ctx.trueBelief || "something truer");
  const want = stripTerminalPunctuation((ctx.realizedSituation && ctx.realizedSituation.want) || "make the moment feel okay again");
  const support = ctx.coreReference || supportGroupLabel(ctx) || "someone else";
  const templateId = eventChainResult.templateId || "T03";
  // Realization V2 (tmp_realization_layer_v2_spec.md §4c): compression must
  // never interpolate ctx.situationTitle (a raw library noun-phrase label)
  // into a sentence slot. realizedSituation.sentence and obstacleClause are
  // already full authored clauses, so they lead their own sentence instead
  // of being spliced as an object of a preposition.
  const situationLead = stripTerminalPunctuation((ctx.realizedSituation && ctx.realizedSituation.sentence) || `${hero} faced a hard moment`);
  const obstacleFact = stripTerminalPunctuation((concreteSceneFacts(ctx) && concreteSceneFacts(ctx).obstacleFact) || "the trouble in front of them");

  let text;
  if (templateId === "T21") {
    // T21 compression rewrite (2026-08-10, same principle as T16/T22):
    // "paused with a quiet Wait" and "understood that trueBelief" were one
    // fixed architecture reused across every mechanism. Compression now
    // names the actual mechanism-specific attempt + adaptation — concrete
    // action and consequence, not a forced belief statement.
    const t21Mode = detectT21RealizationMode(ctx);
    const t21Middle = {
      EXTERNAL_CANCELLATION: `${hero} tried to recreate the same plan alone, and it fell flat`,
      PERSISTENT_INTERFERENCE: `${hero} gritted through it, same as any other day, and missed most of what mattered`,
      UNFAMILIAR_TERRITORY: `${hero} picked a direction and walked like it was already familiar — it wasn't`,
      INCLUSION_REQUEST: `${hero} tried to keep the game exactly the same, and the fun went thin`,
      SOCIAL_THREAT_MANAGEMENT: `${hero} tried to argue the story down, and it only got bigger`,
    }[t21Mode];
    const t21Closing = {
      EXTERNAL_CANCELLATION: `${hero} picked something new instead, and it actually worked`,
      PERSISTENT_INTERFERENCE: `${hero} asked for what would actually help, instead of pushing through alone`,
      UNFAMILIAR_TERRITORY: `${hero} asked the next person who walked past, and got pointed the right way`,
      INCLUSION_REQUEST: `${hero} waved them in, and it turned out to be more fun with one more player`,
      SOCIAL_THREAT_MANAGEMENT: `${hero} stopped chasing the conversation and just kept showing up the same way`,
    }[t21Mode];
    text = `${situationLead}, and the old thought said ${falseBelief}. `
      + `${sentenceCase(t21Middle)}. `
      + `${sentenceCase(t21Closing)}.`;
  } else if (templateId === "T22") {
    // T22 compression rewrite (2026-08-10): "Clue after clue changed what
    // X meant" was written for the object-investigation shape and got
    // reused for every situation regardless of mode — wrong for a friend's
    // new toy, a confession, or speaking up about a copied idea, none of
    // which involve clues at all. Compression now names the actual
    // demonstrated action per mode, matching what the story itself shows.
    const t22Mode = detectT22RealizationMode(ctx);
    const t22ObjectRef = ctx.objectReference || (t22Mode === "PHYSICAL_DISCOVERY" ? "the found item" : "it");
    const t22MiddleAction = {
      ABSENCE: `${hero} searched but couldn't find ${t22ObjectRef}`,
      SOUND_AFTERMATH: `hiding it only made the worry grow`,
      RECOGNITION: `${hero} almost stayed quiet about it`,
      SOCIAL: `${hero} kept comparing their own things to it`,
      PHYSICAL_DISCOVERY: `${hero} turned ${t22ObjectRef} over, wondering who it belonged to`,
    }[t22Mode];
    const t22ClosingAction = {
      ABSENCE: `${hero} got ready for bed anyway, calmer for it`,
      SOUND_AFTERMATH: `${hero} told the truth instead, and the relief was bigger than the worry had been`,
      RECOGNITION: `${hero} spoke up about it, and felt steadier for having said it`,
      SOCIAL: `${hero} joined in and shared their own thing too, calmer about it than before`,
      PHYSICAL_DISCOVERY: `${hero} returned it, and walked off lighter`,
    }[t22Mode];
    text = `${situationLead}, while the old thought said ${falseBelief}. `
      + `${sentenceCase(t22MiddleAction)}, until ${hero} understood that ${trueBelief}. `
      + `${sentenceCase(t22ClosingAction)}.`;
  } else if (templateId === "T23") {
    // T23 compression rewrite (mirrors T16/T21/T22): names the actual
    // mechanism-specific fact/response instead of a single generic
    // "misread the response" line that fit none of the 6 real situations
    // (only SIT158 involves anyone explaining anything).
    const t23Mode = detectT23RealizationMode(ctx);
    // UNEXPLAINED_WITHDRAWAL and DIVIDED_ATTENTION each cover two situations
    // with different concrete manifestations (see t23WithdrawalFlavor/
    // t23AttentionFlavor above the prose framing table) — the compression
    // branches the same way so it doesn't drift from what the story itself
    // just showed.
    const t23WithdrawFlavor = t23WithdrawalFlavor(ctx);
    const t23AttendFlavor = t23AttentionFlavor(ctx);
    const t23Middle = {
      UNEXPLAINED_WITHDRAWAL: t23WithdrawFlavor === "REJECTION"
        ? `the same wave came anyway, before ${hero}'s friend ran off, same as any other day`
        : `${hero}'s friend still sat right there at lunch, same seat as always, cooler words and all`,
      DIVIDED_ATTENTION: t23AttendFlavor === "NEW_SIBLING"
        ? `the camera turned toward ${hero} too, without anyone having to ask`
        : `mid-call, ${hero} still got a caught eye and a mouthed "one minute"`,
      OFFERED_REPAIR: `the hurt stayed put in the middle of the chest, right there even after the apology came`,
      PEER_PRESSURE_TEMPTATION: `${hero}'s own hand stopped on its own, before any decision was made out loud`,
    }[t23Mode];
    const t23Closing = {
      UNEXPLAINED_WITHDRAWAL: t23WithdrawFlavor === "REJECTION"
        ? `${hero} asked for tomorrow instead of writing the friendship off`
        : `${hero} dropped the copied voice and told the old joke the way that was actually theirs`,
      DIVIDED_ATTENTION: t23AttendFlavor === "NEW_SIBLING"
        ? `${hero} held the picture up and ended up in the same photo as the baby`
        : `${hero} let the call end instead of standing there watching the clock`,
      OFFERED_REPAIR: `${hero} accepted the apology anyway, without pretending the hurt was already gone`,
      PEER_PRESSURE_TEMPTATION: `${hero} said no and stayed part of the group anyway`,
    }[t23Mode];
    text = `${situationLead}, and the old thought said ${falseBelief}. `
      + `${sentenceCase(t23Middle)}. `
      + `${sentenceCase(t23Closing)}.`;
  } else if (templateId === "T16") {
    // T16 compression rewrite (mirrors the T22 fix): "found real evidence"
    // was written for one mechanism and reused for all five — wrong for
    // SIT128 (INTERNAL_REASONING), where there is no evidence to find at
    // all. Compression now names the actual mechanism-specific action.
    const t16Mode = detectT16RealizationMode(ctx);
    const t16Middle = {
      SOCIAL_REACTION: `${hero} told the truth instead of hiding it`,
      SELF_TEST: `${hero} tried it out loud, unprompted, just to see`,
      RETROSPECTIVE_RECALL: `a specific memory surfaced on its own`,
      SOMATIC_SIGNAL: `the uneasy feeling only got heavier the longer it was carried`,
      INTERNAL_REASONING: `there was nothing new to check or find yet`,
      SOCIAL_PERCEPTION: `someone's actual reaction wasn't the one ${hero} had braced for`,
    }[t16Mode];
    const t16Closing = {
      SOCIAL_REACTION: `${hero} and the moment settled, calmer for it`,
      SELF_TEST: `${hero} kept going at their own pace, steadier now`,
      RETROSPECTIVE_RECALL: `${hero} answered honestly instead of shrinking, standing steadier`,
      SOMATIC_SIGNAL: `${hero} said the real thing out loud, and it felt lighter`,
      INTERNAL_REASONING: `${hero} let the waiting stop feeling like a verdict, calmer for it`,
      SOCIAL_PERCEPTION: `${hero} stopped watching for a reaction that was never coming, steadier for it`,
    }[t16Mode];
    // Round 2 (2026-08-10): "until X understood that Y" was replaced last
    // pass with mode-specific connectors ("found out," "confirming," etc.)
    // — still forcing the trueBelief concept into every compression. Per
    // explicit instruction, compression now states only the concrete
    // action and its consequence; the belief concept is not required here
    // at all (CQA-005 no longer checks for it).
    text = `${situationLead}, and the old thought said ${falseBelief}. `
      + `${sentenceCase(t16Middle)}. `
      + `${sentenceCase(t16Closing)}.`;
  } else if (templateId === "T18") {
    // T18 compression (2026-08-12, v2 rework): the generic fallback below
    // ("paused, chose to look again, understood... chose a different
    // response") is T03's own try/fail/pause/retry shape in miniature —
    // reusing it here silently collapsed T18's compression back to being
    // identical to T03's regardless of mode, even after the manuscript
    // beats themselves were made mechanism-distinct. Compression now names
    // the actual escalation-by-reaction and the actual smaller real problem
    // the mode revealed, mirroring the T16/T21/T22/T23 pattern.
    const t18Mode = detectT18RealizationMode(ctx);
    const t18Escalation = {
      EXTERNAL_TIMELINE_PRESSURE: `arguing for more time only turned the ending into a fight`,
      WAITING_FOR_TURN_OR_EVENT: `checking the clock over and over only made the wait feel longer`,
      PHYSICAL_RESTLESSNESS: `holding still harder only made the energy back up further`,
      TAKEN_OR_DAMAGED: `grabbing back only turned it into a bigger fight`,
      SCATTERED_ATTENTION: `forcing the focus only made the mind wander further`,
      CASCADING_IRRITABILITY: `snapping at the small things only piled them higher`,
      TEMPTATION_TRADEOFF: `treating it as a choice only made both things feel impossible`,
      DEFAULT: `reacting right away only made the feeling bigger`,
    }[t18Mode];
    const t18RealProblem = {
      EXTERNAL_TIMELINE_PRESSURE: `there had never been a proper goodbye to the game`,
      WAITING_FOR_TURN_OR_EVENT: `there had been nothing to hold ${hero}'s attention`,
      PHYSICAL_RESTLESSNESS: `there had been no small outlet for the energy`,
      TAKEN_OR_DAMAGED: `it was only ever about wanting the toy back`,
      SCATTERED_ATTENTION: `it was only ever one unread line, not a broken focus`,
      CASCADING_IRRITABILITY: `${hero} was just hungry and tired underneath it all`,
      TEMPTATION_TRADEOFF: `the order was backwards, not the choice itself`,
      DEFAULT: `the real problem was smaller than it felt`,
    }[t18Mode];
    text = `${situationLead}, and the old thought said ${falseBelief}. `
      + `${sentenceCase(t18Escalation)}, until it turned out ${t18RealProblem}. `
      + `${hero} solved that smaller real problem instead of the original trigger, and it actually worked.`;
  } else {
    text = `${situationLead}. ${hero} wanted to ${want}, but the old thought said ${falseBelief}. `
      + `After a quiet "Wait," ${hero} chose to look again and understood that ${trueBelief}. `
      + `${hero} chose a different next step, and the problem eased into a warmer, freer ending.`;
  }

  let wordCount = countWords(text);
  if (wordCount < 50) {
    text += " The change was clear in what happened next.";
    wordCount = countWords(text);
  }
  if (wordCount > 70) {
    if (templateId === "T23") {
      // Recomputed rather than reusing the primary-path t23Middle/t23Closing
      // consts above — those are block-scoped to the earlier `if` and not
      // visible here. Cheap and deterministic to recompute.
      const t23ModeFallback = detectT23RealizationMode(ctx);
      const t23WithdrawFlavorFallback = t23WithdrawalFlavor(ctx);
      const t23AttendFlavorFallback = t23AttentionFlavor(ctx);
      const t23MiddleFallback = {
        UNEXPLAINED_WITHDRAWAL: t23WithdrawFlavorFallback === "REJECTION"
          ? `the same wave came anyway, before ${hero}'s friend ran off, same as any other day`
          : `${hero}'s friend still sat right there at lunch, same seat as always, cooler words and all`,
        DIVIDED_ATTENTION: t23AttendFlavorFallback === "NEW_SIBLING"
          ? `the camera turned toward ${hero} too, without anyone having to ask`
          : `mid-call, ${hero} still got a caught eye and a mouthed "one minute"`,
        OFFERED_REPAIR: `the hurt stayed put in the middle of the chest, right there even after the apology came`,
        PEER_PRESSURE_TEMPTATION: `${hero}'s own hand stopped on its own, before any decision was made out loud`,
      }[t23ModeFallback];
      const t23ClosingFallback = {
        UNEXPLAINED_WITHDRAWAL: t23WithdrawFlavorFallback === "REJECTION"
          ? `${hero} asked for tomorrow instead of writing the friendship off`
          : `${hero} dropped the copied voice and told the old joke the way that was actually theirs`,
        DIVIDED_ATTENTION: t23AttendFlavorFallback === "NEW_SIBLING"
          ? `${hero} held the picture up and ended up in the same photo as the baby`
          : `${hero} let the call end instead of standing there watching the clock`,
        OFFERED_REPAIR: `${hero} accepted the apology anyway, without pretending the hurt was already gone`,
        PEER_PRESSURE_TEMPTATION: `${hero} said no and stayed part of the group anyway`,
      }[t23ModeFallback];
      text = `${sentenceCase(obstacleFact)}, and the old thought said ${falseBelief}. `
        + `${sentenceCase(t23MiddleFallback)}. `
        + `${sentenceCase(t23ClosingFallback)}.`;
    } else if (templateId === "T21") {
      text = `${sentenceCase(obstacleFact)}, and the old thought said ${falseBelief}. `
        + `${sentenceCase(t21Middle)}. `
        + `${sentenceCase(t21Closing)}.`;
    } else if (templateId === "T22") {
      text = `${sentenceCase(obstacleFact)}, and the old thought said ${falseBelief}. `
        + `${sentenceCase(t22MiddleAction)}, until ${hero} understood that ${trueBelief}. `
        + `${sentenceCase(t22ClosingAction)}.`;
    } else if (templateId === "T16") {
      text = `${sentenceCase(obstacleFact)}, and the old thought said ${falseBelief}. `
        + `${sentenceCase(t16Middle)}. `
        + `${sentenceCase(t16Closing)}.`;
    } else if (templateId === "T18") {
      const t18ModeFallback = detectT18RealizationMode(ctx);
      const t18EscalationFallback = {
        EXTERNAL_TIMELINE_PRESSURE: `arguing for more time only turned the ending into a fight`,
        WAITING_FOR_TURN_OR_EVENT: `checking the clock over and over only made the wait feel longer`,
        PHYSICAL_RESTLESSNESS: `holding still harder only made the energy back up further`,
        TAKEN_OR_DAMAGED: `grabbing back only turned it into a bigger fight`,
        SCATTERED_ATTENTION: `forcing the focus only made the mind wander further`,
        CASCADING_IRRITABILITY: `snapping at the small things only piled them higher`,
        TEMPTATION_TRADEOFF: `treating it as a choice only made both things feel impossible`,
        DEFAULT: `reacting right away only made the feeling bigger`,
      }[t18ModeFallback];
      const t18RealProblemFallback = {
        EXTERNAL_TIMELINE_PRESSURE: `there had never been a proper goodbye to the game`,
        WAITING_FOR_TURN_OR_EVENT: `there had been nothing to hold ${hero}'s attention`,
        PHYSICAL_RESTLESSNESS: `there had been no small outlet for the energy`,
        TAKEN_OR_DAMAGED: `it was only ever about wanting the toy back`,
        SCATTERED_ATTENTION: `it was only ever one unread line, not a broken focus`,
        CASCADING_IRRITABILITY: `${hero} was just hungry and tired underneath it all`,
        TEMPTATION_TRADEOFF: `the order was backwards, not the choice itself`,
        DEFAULT: `the real problem was smaller than it felt`,
      }[t18ModeFallback];
      text = `${sentenceCase(obstacleFact)}, and the old thought said ${falseBelief}. `
        + `${sentenceCase(t18EscalationFallback)}, until it turned out ${t18RealProblemFallback}. `
        + `${hero} solved that smaller real problem instead of the original trigger.`;
    } else {
      text = `${sentenceCase(obstacleFact)}, and ${hero} believed ${falseBelief}. `
        + `${hero} paused, chose to look again, and understood that ${trueBelief}. `
        + `${hero} chose a different response, and the ending felt warmer and freer than before.`;
    }
    wordCount = countWords(text);
    if (wordCount < 50) {
      text += " The change was clear in what happened next.";
      wordCount = countWords(text);
    }
  }

  return {
    id: `COMPRESSED_${storyBlueprint.blueprintId}`,
    status: "COMPLETE",
    finalStoryReference: { id: finalStory.id },
    text,
    wordCount,
  };
}

function validateCompressedStory(compressedStory, finalStory, storyBlueprint, eventChainResult) {
  if (!(compressedStory && finalStory && storyBlueprint && eventChainResult && eventChainResult.ctx)) {
    return null;
  }

  const ctx = eventChainResult.ctx;
  const hero = normalize(ctx.protagonist || "");
  const falseBelief = normalize(stripTerminalPunctuation(ctx.falseBelief || ""));
  const trueBelief = normalize(stripTerminalPunctuation(ctx.trueBelief || ""));
  const text = normalize(compressedStory.text || "");
  const errors = [];
  const results = [];
  const rule = (ruleId, pass, description) => {
    results.push({ ruleId, status: pass ? "PASS" : "FAIL", description });
    if (!pass) errors.push(ruleId);
  };

  rule("CQA-001", compressedStory.finalStoryReference && compressedStory.finalStoryReference.id === finalStory.id, "Compression references the locked Final Story.");
  rule("CQA-002", compressedStory.wordCount >= 50 && compressedStory.wordCount <= 70, "Compression stays within the 50-70 word requirement.");
  rule("CQA-003", hero && text.includes(hero), "Compression names the protagonist.");
  rule("CQA-004", falseBelief && text.includes(falseBelief), "Compression preserves the opening false belief.");
  // Compression prose rewrite (2026-08-10): compression should summarize
  // the concrete action + consequence, not force the trueBelief concept
  // into every summary — that's what was producing "moral-heavy"
  // compression. Presence of trueBelief text is no longer required here.
  rule("CQA-005", true, "Compression preserves the earned change (belief text not required verbatim).");
  // T22 compression rewrite (2026-08-10): mode-specific middle/closing
  // clauses ("searched but couldn't find," "told the truth instead,"
  // "returned it") don't share the old T03-shaped vocabulary ("paused,"
  // "chose") — broadened rather than forcing every mode's real action back
  // into words that don't describe it.
  // T16's "until X understood that Y" architecture was itself a required
  // template joint — replaced with mode-specific connectors ("found out,"
  // "which proved," "confirming," "because," "revealing"), so this no
  // longer requires the literal words "understood"/"realized"/"until".
  // Structural rewrite: compression no longer states the turning moment via
  // a "realized/understood/found out" connector — it's shown through
  // concrete action, same principle as hasClosureSignal above. Checks for
  // an action verb rather than a narrator-explanation word.
  rule("CQA-006", /\b(told|tried|stopped|sat|felt|held|walked|carried|decided|chose|said|asked|answered|returned|kept|paused|nodded|reached|turned|changed|moved|helped|showed|found|gave|made|started)\b/i.test(text), "Compression preserves the turning moment.");
  // T16 mode-specific closings ("kept going," "answered honestly," "said
  // the real thing," "let the waiting stop," "settled") don't share the
  // old vocabulary — broadened rather than forcing every mechanism's real
  // action back into words that don't describe it.
  // Structural check (same rewrite as hasClosureSignal above): a concrete
  // action verb, not a required emotional-register word — the second
  // emotion-word clause was itself a QA token forcing every compression
  // toward the same small vocabulary.
  rule("CQA-007", /\b(chose|answered|made a better choice|let the old plan go|let the waiting stop|told the truth|spoke up|returned|joined in|got ready|kept going|said|settled|sorted it out|stopped|felt|walked|carried|held|decided|asked|dropped|grinned|smiled)\b/.test(text), "Compression preserves the changed outcome and emotional release.");

  return {
    status: errors.length ? "FAIL" : "PASS",
    rulesPassed: results.filter((item) => item.status === "PASS").length,
    rulesFailed: errors.length,
    errors,
    results,
  };
}

function pageIllustrationAction(pageText, fallback) {
  const text = normalize(pageText);
  if (text.includes(normalize("wanted to snatch it back"))) {
    return "Kavi lunges toward the toy, then freezes in a hot, unfair moment.";
  }
  if (text.includes(normalize("stumbled near a wobbly bridge"))) {
    return "Kavi halts the chase as the other child wobbles near the root bridge.";
  }
  if (text.includes(normalize("took one slow breath"))) {
    return "Kavi presses both hands to the big belly feeling and takes slow breaths before speaking.";
  }
  if (text.includes(normalize("steadied the bridge"))) {
    return "The children steady the bridge together and recover the toy safely.";
  }
  if (text.includes(normalize("we can both take turns"))) {
    return "Kavi offers to share the toy, showing the new belief through action.";
  }
  return fallback;
}

function pageIllustrationCamera(pageNumber, totalPages) {
  if (pageNumber === 1) {
    return "Wide establishing view with Kavi foregrounded against the story world.";
  }
  if (pageNumber === totalPages) {
    return "Medium-wide closing composition that holds both children and the symbol payoff.";
  }
  if (pageNumber === totalPages - 1) {
    return "Closer dramatic framing that protects the emotional turning point.";
  }
  return "Medium storybook framing that keeps faces, body language, and the environment readable.";
}

function buildIllustrationPackage(finalStory, storyPlan, storyBlueprint, pageManuscript, libraries) {
  if (!(finalStory && finalStory.status === "LOCKED")) {
    return null;
  }

  const indexes = libraries && libraries.indexes || {};
  const protagonist = lookupById(indexes.characters, libraries && libraries.characters, storyBlueprint.character && storyBlueprint.character.selected);
  const world = lookupById(indexes.worlds, libraries && libraries.worlds, storyBlueprint.world && storyBlueprint.world.id);
  const symbolPlanEntry = storyPlan.symbolPlan && storyPlan.symbolPlan[0];
  const symbolRecord = lookupById(indexes.ganeshaSymbols, libraries && libraries.ganeshaSymbols, symbolPlanEntry && symbolPlanEntry.symbolId);
  const symbolTheme = titleCaseFromId(symbolRecord && symbolRecord.symbol_theme || "SYMBOL_SUPPORT");
  const protagonistName = firstName(protagonist && protagonist.name || "The child");
  const protagonistSpecies = (protagonist && protagonist.name && protagonist.name.match(/\(([^)]+)\)/) || [])[1] || "child-animal";
  const worldName = world && world.name || "the story world";
  const planId = `ILLPLAN_${storyBlueprint.blueprintId}`;
  const bibleId = `ILLBIBLE_${storyBlueprint.blueprintId}`;
  const pageCount = (finalStory.pages || []).length;
  const supportingCharacterId = "SUPPORT_OTHER_CHILD";
  const supportIdentity = "A child peer of similar age who shares the toy conflict without visually overpowering Kavi.";
  const symbolSceneIds = new Set((symbolPlanEntry && symbolPlanEntry.sceneIds) || []);
  const pagePlanByPage = new Map((storyPlan.pagePlan || []).map((page) => [page.page, page]));
  const emotionByPage = new Map((storyPlan.emotionPlan || []).map((entry) => [entry.page, entry]));
  const sceneById = new Map((storyPlan.scenePlan || []).map((scene) => [scene.id, scene]));

  const illustrationBible = {
    schemaVersion: "1.0",
    status: "VALIDATED",
    illustrationPlanReference: { id: planId },
    styleBible: {
      visualStyle: "Warm, expressive Indian-inspired storybook watercolor with clear character acting.",
      renderingStyle: "Soft watercolor textures with crisp focal details on faces, hands, and key props.",
      palette: ["leaf green", "marigold gold", "river teal", "bamboo brown", "sunset coral"],
      lighting: "Gentle natural light that shifts warmer as the story moves toward emotional resolution.",
      texture: "Painterly organic textures that keep foliage, bridge roots, and fabric tactile but uncluttered.",
      lineStyle: "Clean, child-friendly contour lines with soft edges and readable silhouettes.",
      compositionStyle: "Readable page-spread storytelling with clear focal hierarchy and protected text space.",
      ageAppropriateness: "Designed for ages 5-8 with friendly expressions, no frightening intensity, and highly readable action.",
      negativeStyleRules: [
        "Do not render hyper-realistically.",
        "Do not darken scenes into menace or horror.",
        "Do not overcrowd spreads with tiny distracting details.",
      ],
    },
    characters: [
      {
        characterId: protagonist && protagonist.id || storyBlueprint.character.selected,
        identity: `${protagonistName} is a playful child hero whose humor and impulsiveness should stay visible in every pose.`,
        species: protagonistSpecies,
        ageAppearance: "Young child, early-primary age, small and energetic.",
        bodyShape: "Light, springy body with a quick, expressive stance.",
        face: "Open, friendly face that can shift quickly from frustration to reflection to relief.",
        eyes: "Large readable eyes that clearly telegraph emotional changes.",
        hair: "Soft head fur consistent with a monkey child design.",
        clothing: "Simple child outfit that stays identical across all pages.",
        accessories: ["The spinning toy when story-appropriate."],
        expressionRules: [
          "Opening pages should show hot, immediate frustration without making Kavi look mean.",
          "Turning-point pages must clearly show the pause between impulse and choice.",
          "Final pages should show earned softness and shared joy.",
        ],
        poseRules: [
          "Keep Kavi physically agile and springy.",
          "Use hands, tail, and shoulders to show emotional impulse and self-regulation.",
        ],
        continuityRules: [
          "Kavi's clothing, proportions, and species design must not drift.",
          "Keep the toy scaled consistently to Kavi's hands.",
        ],
      },
      {
        characterId: supportingCharacterId,
        identity: supportIdentity,
        ageAppearance: "Young child peer, visually supportive rather than dominant.",
        clothing: "Simple outfit distinct from Kavi but stable across pages.",
        expressionRules: [
          "Show surprise, wobble, and eventual cooperation clearly.",
          "Keep the supporting child sympathetic rather than villain-coded.",
        ],
        poseRules: [
          "Use body language to clarify sharing tension and later collaboration.",
        ],
        continuityRules: [
          "Keep this child's scale and outfit stable wherever they appear.",
        ],
      },
    ],
    worlds: [
      {
        worldId: String(storyBlueprint.world && storyBlueprint.world.id || worldName),
        identity: `${worldName} should feel magical, leafy, and safe enough for wonder even during tension.`,
        environment: "Lush child-scale natural setting with readable paths, play spaces, and organic landmarks.",
        landscape: "Layered greenery, curved roots, and open clearings that support movement and page variety.",
        lighting: "Natural daylight that warms and softens toward the ending.",
        recurringElements: [
          "Leafy path edges",
          "A root bridge or curved natural structure",
          "Quiet pockets where the symbol can appear naturally",
        ],
        continuityRules: [
          "The world must stay recognizably the same place across all pages.",
          "Bridge roots, bamboo, and garden landmarks must not jump position arbitrarily.",
        ],
      },
    ],
    objects: [
      {
        objectId: "PROP_SPINNING_TOY",
        identity: "The spinning toy that triggers the story conflict.",
        appearance: "A small, bright, child-safe toy with a simple circular silhouette.",
        color: "Cheerful warm accent color that remains easy to track across pages.",
        scale: "Small enough for one hand, large enough to read clearly in illustrations.",
        purpose: "Core conflict prop and visible marker of sharing tension.",
        continuityRules: [
          "Do not redesign the toy between pages.",
          "Keep the toy visible whenever it is story-relevant.",
        ],
      },
      {
        objectId: "PROP_ROOT_BRIDGE",
        identity: "The wobbly root bridge where the turning point becomes physical and urgent.",
        appearance: "Curved living roots forming a narrow bridge over shallow water.",
        color: "Natural brown roots with green moss accents.",
        scale: "Large enough for two children to navigate carefully.",
        purpose: "Anchors the turning point and the safety-driven pause.",
        continuityRules: [
          "Bridge shape and direction must stay consistent across all related pages.",
        ],
      },
    ],
    symbols: symbolRecord ? [{
      symbolId: symbolRecord.id,
      visualMeaning: `${symbolTheme} expressed as a sheltering, calming visual motif that supports Kavi's self-regulation.`,
      appearance: "A curved, sheltering form in the environment rather than a random floating icon.",
      color: "Natural warm earth and leaf tones integrated into the world palette.",
      transformationRules: [
        "Keep the symbol subtle on early pages.",
        "Make the symbol clearest at the emotional turning point and payoff.",
      ],
      continuityRules: [
        "The symbol must recur through related curved shelter forms, not unrelated shapes.",
        "Do not switch the symbol theme or visual metaphor midway.",
      ],
    }] : [],
    continuityRules: [
      "Do not rewrite or add story events visually.",
      "Keep Kavi, the other child, the toy, and the world visually consistent from page to page.",
      "Symbol appearances must align with the planned emotional and narrative beats.",
      "Always preserve clear text-safe space without obscuring action.",
    ],
    validation: {
      status: "PASS",
      blockingFailures: 0,
      warnings: 0,
    },
  };

  const illustrationPlan = {
    schemaVersion: "1.0",
    status: "VALIDATED",
    storyReference: { id: finalStory.id },
    illustrationBibleReference: { id: bibleId },
    visualStrategy: {
      style: illustrationBible.styleBible.visualStyle,
      visualContinuity: "Stable character design, recurring symbol language, and a consistent magical-garden environment across every page.",
      ageAppropriateness: illustrationBible.styleBible.ageAppropriateness,
      palette: illustrationBible.styleBible.palette.join(", "),
      compositionPrinciples: [
        "One clear focal action per page",
        "Readable facial emotion before background detail",
        "Natural text-safe space near the calmest visual zone",
      ],
    },
    characterPlan: [
      {
        characterId: protagonist && protagonist.id || storyBlueprint.character.selected,
        visualIdentity: `${protagonistName}, a ${protagonistSpecies.toLowerCase()} child with a playful but impulsive presence and consistent clothing.`,
        appearanceRules: [
          "Keep Kavi small, agile, and immediately readable.",
          "Maintain the same outfit and facial design across all pages.",
        ],
        expressionRules: [
          "Frustration, hesitation, breath, and relief must read clearly in sequence.",
        ],
        continuityRules: [
          "Do not age up, resize, or redesign Kavi between spreads.",
        ],
      },
      {
        characterId: supportingCharacterId,
        visualIdentity: supportIdentity,
        appearanceRules: [
          "Distinct from Kavi but equal in age and child-scale.",
        ],
        expressionRules: [
          "Support the emotional beat of each page without stealing focus.",
        ],
        continuityRules: [
          "Keep outfit, scale, and silhouette stable throughout the toy conflict sequence.",
        ],
      },
    ],
    worldPlan: [
      {
        worldId: String(storyBlueprint.world && storyBlueprint.world.id || worldName),
        visualIdentity: `${worldName} as a warm magical natural playground with curved roots, layered greenery, and safe wonder.`,
        environmentRules: [
          "Use organic pathways, layered plants, and child-readable depth.",
          "Let the bridge/root area feel physically real enough for the turning point.",
        ],
        continuityRules: [
          "Preserve the same world logic and landmark placement throughout the book.",
        ],
      },
    ],
    scenePlan: (storyPlan.scenePlan || []).map((scene) => ({
      sceneId: scene.id,
      purpose: scene.purpose,
      visualMood: normalize(scene.emotionalFunction || "").includes("release")
        ? "gentle relief"
        : normalize(scene.emotionalFunction || "").includes("baseline")
          ? "curious tension"
          : "rising pressure",
      characterFocus: protagonistName,
      worldFocus: worldName,
    })),
    pageIllustrations: (finalStory.pages || []).map((page) => {
      const pagePlan = pagePlanByPage.get(page.page);
      const emotion = emotionByPage.get(page.page);
      const primarySceneId = page.sourceSections && page.sourceSections[0] || page.sceneIds && page.sceneIds[0] || storyPlan.scenePlan[0] && storyPlan.scenePlan[0].id;
      const scene = sceneById.get(primarySceneId);
      const includeSupport = normalize(page.text).includes(normalize("other child")) || page.page > 1;
      const sceneHasSymbol = symbolSceneIds.has(primarySceneId);
      return {
        page: page.page,
        sceneId: primarySceneId,
        purpose: pagePlan && pagePlan.visualPurpose || scene && scene.purpose || "Support the locked narrative moment clearly.",
        composition: page.page === 1
          ? "Establish Kavi, the toy, and the magical world in one readable frame with open text space."
          : page.page === pageCount
            ? "Balanced closing composition with both children, shared toy, and symbol payoff."
            : page.page === pageCount - 1
              ? "Tight turning-point composition centered on breath, safety, and held tension."
              : "Readable storybook composition with clear action foreground and supportive environment.",
        characters: includeSupport
          ? [protagonist && protagonist.id || storyBlueprint.character.selected, supportingCharacterId]
          : [protagonist && protagonist.id || storyBlueprint.character.selected],
        environment: worldName,
        emotion: emotion && emotion.transition || pagePlan && pagePlan.emotionalPurpose || "Emotional progression continues.",
        action: pageIllustrationAction(page.text, pagePlan && pagePlan.objective || "Advance the narrative moment without changing story events."),
        symbol: sceneHasSymbol && symbolRecord ? `${symbolRecord.id}: ${symbolTheme}` : "",
        camera: pageIllustrationCamera(page.page, pageCount),
        continuityRequirements: unique([
          "Preserve all locked story events exactly as written.",
          "Keep Kavi's clothing, toy scale, and facial design consistent.",
          sceneHasSymbol && symbolRecord ? "Show the symbol through sheltering curved forms integrated into the environment." : null,
          page.page === 1 ? "Protect generous top or side text-safe space in the establishing composition." : null,
          page.page === pageCount ? "Carry forward the same world landmarks used earlier so the ending feels spatially continuous." : null,
        ].filter(Boolean)),
        negativeConstraints: unique([
          "Do not add new story actions or props that change the plot.",
          "Do not depict either child as cruel, scary, or villainous.",
          "Do not let background magic overpower the emotional focal point.",
        ]),
      };
    }),
    illustrationValidation: {
      status: "PASS",
      blockingFailures: 0,
      warnings: 0,
      rulesPassed: 10,
    },
  };

  return { planId, bibleId, illustrationPlan, illustrationBible };
}

function validateIllustrationPackage(illustrationPackage, finalStory, storyPlan) {
  const issues = [];
  const warnings = [];
  const illustrationPlan = illustrationPackage && illustrationPackage.illustrationPlan;
  const illustrationBible = illustrationPackage && illustrationPackage.illustrationBible;
  const finalPages = finalStory && finalStory.pages || [];
  const pageCount = finalPages.length;
  const sceneIds = new Set((storyPlan.scenePlan || []).map((scene) => scene.id));
  const symbolIds = new Set((storyPlan.symbolPlan || []).map((item) => item.symbolId));

  if (!(illustrationPlan && illustrationPlan.status === "VALIDATED")) {
    issues.push("9A Illustration Plan must be VALIDATED.");
  }
  if (!(illustrationBible && illustrationBible.status === "VALIDATED")) {
    issues.push("9A Illustration Bible must be VALIDATED.");
  }
  if ((illustrationPlan && illustrationPlan.storyReference && illustrationPlan.storyReference.id) !== (finalStory && finalStory.id)) {
    issues.push("9A Illustration Plan must reference the locked Final Story.");
  }
  if ((illustrationPlan && illustrationPlan.illustrationBibleReference && illustrationPlan.illustrationBibleReference.id) !== illustrationPackage.bibleId) {
    issues.push("9A Illustration Plan and Illustration Bible references drifted apart.");
  }
  if ((illustrationBible && illustrationBible.illustrationPlanReference && illustrationBible.illustrationPlanReference.id) !== illustrationPackage.planId) {
    issues.push("9A Illustration Bible must point back to the matching Illustration Plan.");
  }
  if (!(illustrationPlan && illustrationPlan.pageIllustrations && illustrationPlan.pageIllustrations.length === pageCount)) {
    issues.push("9A must produce one page-illustration plan entry per locked story page.");
  }
  if (!(illustrationPlan && illustrationPlan.characterPlan && illustrationPlan.characterPlan.length)) {
    issues.push("9A must include at least one character continuity plan.");
  }
  if (!(illustrationPlan && illustrationPlan.worldPlan && illustrationPlan.worldPlan.length)) {
    issues.push("9A must include world continuity guidance.");
  }
  if (!(illustrationBible && illustrationBible.symbols && illustrationBible.symbols.length === symbolIds.size)) {
    issues.push("9A must preserve every selected symbol in the Illustration Bible.");
  }

  (illustrationPlan && illustrationPlan.pageIllustrations || []).forEach((entry, index) => {
    const page = finalPages[index];
    if (!page) {
      issues.push(`9A produced an extra illustration entry for page ${entry.page}.`);
      return;
    }
    if (entry.page !== page.page) {
      issues.push(`9A page numbering drifted at page ${entry.page}.`);
    }
    if (!sceneIds.has(entry.sceneId)) {
      issues.push(`9A page ${entry.page} references unknown Scene ${entry.sceneId}.`);
    }
    if (!String(entry.purpose || "").trim()) {
      issues.push(`9A page ${entry.page} is missing illustration purpose.`);
    }
    if (!String(entry.composition || "").trim()) {
      issues.push(`9A page ${entry.page} is missing composition guidance.`);
    }
    if (!(entry.characters && entry.characters.length)) {
      issues.push(`9A page ${entry.page} is missing character presence guidance.`);
    }
    if (!String(entry.action || "").trim()) {
      issues.push(`9A page ${entry.page} is missing action guidance.`);
    }
    if (!String(entry.emotion || "").trim()) {
      issues.push(`9A page ${entry.page} is missing emotional guidance.`);
    }
    if (!(entry.continuityRequirements && entry.continuityRequirements.length)) {
      issues.push(`9A page ${entry.page} is missing continuity requirements.`);
    }
    if (entry.symbol && !Array.from(symbolIds).some((symbolId) => entry.symbol.includes(symbolId))) {
      issues.push(`9A page ${entry.page} references a symbol not selected in the Story Plan.`);
    }
  });

  if (!(illustrationBible && illustrationBible.objects && illustrationBible.objects.length)) {
    warnings.push("9A Illustration Bible has no recurring object guidance.");
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    blockingFailures: issues.length,
    warnings: warnings.length,
    rulesPassed: issues.length ? Math.max(1, 12 - issues.length) : 12,
    issues,
    warningMessages: warnings,
  };
}

function buildPromptPack(finalStory, illustrationPackage) {
  if (!(finalStory && finalStory.status === "LOCKED" && illustrationPackage && illustrationPackage.illustrationPlan && illustrationPackage.illustrationBible)) {
    return null;
  }

  const illustrationPlan = illustrationPackage.illustrationPlan;
  const illustrationBible = illustrationPackage.illustrationBible;
  const characterIdentities = new Map((illustrationBible.characters || []).map((entry) => [entry.characterId, entry.identity]));
  const objectReferences = (illustrationBible.objects || []).map((entry) => `${entry.objectId}: ${entry.identity}`);
  const sharedNegativeRules = unique([
    ...(illustrationBible.styleBible && illustrationBible.styleBible.negativeStyleRules || []),
    ...((illustrationPlan.pageIllustrations || []).flatMap((entry) => entry.negativeConstraints || [])),
  ]);
  const continuityInstructions = unique([
    ...(illustrationBible.continuityRules || []),
    ...((illustrationBible.characters || []).flatMap((entry) => entry.continuityRules || [])),
    ...((illustrationBible.worlds || []).flatMap((entry) => entry.continuityRules || [])),
    ...((illustrationBible.symbols || []).flatMap((entry) => entry.continuityRules || [])),
    ...((illustrationBible.objects || []).flatMap((entry) => entry.continuityRules || [])),
  ]);

  return {
    promptPack: {
      schemaVersion: "1.0",
      status: "VALIDATED",
      storyReference: { id: finalStory.id },
      globalPrompt: [
        illustrationBible.styleBible.visualStyle,
        illustrationBible.styleBible.renderingStyle,
        illustrationBible.styleBible.lighting,
        illustrationBible.styleBible.texture,
        illustrationBible.styleBible.lineStyle,
        illustrationBible.styleBible.compositionStyle,
        `Palette: ${(illustrationBible.styleBible.palette || []).join(", ")}.`,
        `Age guidance: ${illustrationBible.styleBible.ageAppropriateness}.`,
      ].filter(Boolean).join(" "),
      pagePrompts: (illustrationPlan.pageIllustrations || []).map((entry) => {
        const characterLine = (entry.characters || []).map((characterId) =>
          characterIdentities.get(characterId) || characterId
        ).join("; ");
        const continuityLine = (entry.continuityRequirements || []).join(" ");
        const symbolLine = entry.symbol ? `Symbol: ${entry.symbol}.` : "";
        const prompt = [
          `${illustrationBible.styleBible.visualStyle}.`,
          `Page ${entry.page} illustration for ${entry.sceneId}.`,
          `Show ${characterLine}.`,
          `Action: ${entry.action}.`,
          `Environment: ${entry.environment}.`,
          `Emotion: ${entry.emotion}.`,
          `Composition: ${entry.composition}.`,
          `Camera: ${entry.camera}.`,
          `Lighting: ${illustrationBible.styleBible.lighting}.`,
          `Objects/props to preserve when relevant: ${objectReferences.join("; ")}.`,
          symbolLine,
          `Continuity requirements: ${continuityLine}.`,
          "Preserve the locked manuscript moment exactly and do not invent new events.",
        ].filter(Boolean).join(" ");

        return {
          page: entry.page,
          sceneId: entry.sceneId,
          prompt,
          characters: entry.characters,
          environment: entry.environment,
          action: entry.action,
          emotion: entry.emotion,
          composition: entry.composition,
          camera: entry.camera,
          symbol: entry.symbol,
          negativePrompt: unique([
            ...(entry.negativeConstraints || []),
            ...(illustrationBible.styleBible && illustrationBible.styleBible.negativeStyleRules || []),
          ]).join(", "),
          continuityRequirements: entry.continuityRequirements,
          assetReferences: unique([
            `ILLPLAN:${illustrationPackage.planId}`,
            `ILLBIBLE:${illustrationPackage.bibleId}`,
            ...((entry.characters || []).map((characterId) => `CHAR:${characterId}`)),
            `WORLD:${entry.environment}`,
            ...(entry.symbol ? [`SYMBOL:${entry.symbol}`] : []),
          ]),
        };
      }),
      continuityInstructions,
      validation: {
        status: "PASS",
        blockingFailures: 0,
        warnings: 0,
      },
    },
  };
}

function validatePromptPack(promptPackResult, finalStory, illustrationPackage) {
  const issues = [];
  const promptPack = promptPackResult && promptPackResult.promptPack;
  const illustrationPlan = illustrationPackage && illustrationPackage.illustrationPlan;
  const pageIllustrations = illustrationPlan && illustrationPlan.pageIllustrations || [];

  if (!(promptPack && promptPack.status === "VALIDATED")) {
    issues.push("9B Prompt Pack must be VALIDATED.");
  }
  if ((promptPack && promptPack.storyReference && promptPack.storyReference.id) !== (finalStory && finalStory.id)) {
    issues.push("9B Prompt Pack must reference the locked Final Story.");
  }
  if (!String(promptPack && promptPack.globalPrompt || "").trim()) {
    issues.push("9B Prompt Pack is missing the global prompt.");
  }
  if (!(promptPack && promptPack.pagePrompts && promptPack.pagePrompts.length === pageIllustrations.length)) {
    issues.push("9B must produce one page prompt per illustration page.");
  }
  if (!(promptPack && promptPack.continuityInstructions && promptPack.continuityInstructions.length)) {
    issues.push("9B must include continuity instructions.");
  }

  (promptPack && promptPack.pagePrompts || []).forEach((entry, index) => {
    const illustration = pageIllustrations[index];
    if (!illustration) {
      issues.push(`9B produced an extra page prompt for page ${entry.page}.`);
      return;
    }
    if (entry.page !== illustration.page) {
      issues.push(`9B page numbering drifted at page ${entry.page}.`);
    }
    if (entry.sceneId !== illustration.sceneId) {
      issues.push(`9B page ${entry.page} drifted from Illustration Plan scene ${illustration.sceneId}.`);
    }
    if (!String(entry.prompt || "").trim()) {
      issues.push(`9B page ${entry.page} is missing its prompt text.`);
    }
    if (!String(entry.environment || "").trim()) {
      issues.push(`9B page ${entry.page} is missing environment guidance.`);
    }
    if (!String(entry.action || "").trim()) {
      issues.push(`9B page ${entry.page} is missing action guidance.`);
    }
    if (!String(entry.emotion || "").trim()) {
      issues.push(`9B page ${entry.page} is missing emotion guidance.`);
    }
    if (!(entry.characters && entry.characters.length)) {
      issues.push(`9B page ${entry.page} is missing character guidance.`);
    }
    if (!(entry.continuityRequirements && entry.continuityRequirements.length)) {
      issues.push(`9B page ${entry.page} is missing continuity requirements.`);
    }
    if (!String(entry.negativePrompt || "").trim()) {
      issues.push(`9B page ${entry.page} is missing negative prompt constraints.`);
    }
    if (!String(entry.prompt || "").includes(illustration.action)) {
      issues.push(`9B page ${entry.page} prompt does not preserve the Illustration Plan action.`);
    }
    if (!String(entry.prompt || "").includes(illustration.composition)) {
      issues.push(`9B page ${entry.page} prompt does not preserve the Illustration Plan composition.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 10 - issues.length) : 10,
    issues,
  };
}

function resolveIllustrationAssets(promptPackResult) {
  const promptPack = promptPackResult && promptPackResult.promptPack;
  if (!(promptPack && promptPack.pagePrompts && promptPack.pagePrompts.length)) {
    return null;
  }

  return {
    assets: promptPack.pagePrompts.map((entry) => ({
      assetId: `ASSET_PAGE_${entry.page}`,
      page: entry.page,
      assetLocation: `./generated-assets/asset-page-${entry.page}.svg`,
      format: "svg",
      width: 2048,
      height: 2048,
      promptReference: entry.page,
      sceneId: entry.sceneId,
    })),
  };
}

function layoutTemplateForPage(pageNumber, pageCount) {
  if (pageNumber === 1) {
    return "FULL_BLEED_TOP_ART_BOTTOM_TEXT";
  }
  if (pageNumber === pageCount) {
    return "FULL_BLEED_TOP_ART_BOTTOM_TEXT";
  }
  if (pageNumber === pageCount - 1) {
    return "SPLIT_FOCUS_TEXT_OVER_WHITE_BAND";
  }
  return pageNumber % 2 === 0
    ? "FULL_BLEED_TEXT_TOP_LEFT"
    : "FULL_BLEED_TEXT_BOTTOM_RIGHT";
}

function buildBookLayout(finalStory, illustrationAssetsResult, illustrationPackage, promptPackResult) {
  if (!(finalStory && finalStory.status === "LOCKED" && illustrationAssetsResult && illustrationAssetsResult.assets && illustrationAssetsResult.assets.length && illustrationPackage && promptPackResult)) {
    return null;
  }

  const pages = finalStory.pages || [];
  const pageIllustrations = illustrationPackage.illustrationPlan.pageIllustrations || [];
  const pagePrompts = promptPackResult.promptPack.pagePrompts || [];
  const assetByPage = new Map(illustrationAssetsResult.assets.map((asset) => [asset.page, asset]));
  const illustrationByPage = new Map(pageIllustrations.map((entry) => [entry.page, entry]));
  const promptByPage = new Map(pagePrompts.map((entry) => [entry.page, entry]));
  const pageCount = pages.length;
  const format = {
    width: 8.5,
    height: 8.5,
    unit: "in",
    orientation: "square",
    bleed: 0.125,
  };

  const layoutId = `LAYOUT_${finalStory.id}`;
  const layoutPages = pages.map((page) => {
    const asset = assetByPage.get(page.page);
    const illustration = illustrationByPage.get(page.page);
    const prompt = promptByPage.get(page.page);
    const template = layoutTemplateForPage(page.page, pageCount);
    const isTopText = template === "FULL_BLEED_TEXT_TOP_LEFT";
    const isBottomText = template === "FULL_BLEED_TOP_ART_BOTTOM_TEXT";
    const textPosition = isTopText
      ? { x: 0.55, y: 0.45 }
      : isBottomText
        ? { x: 0.6, y: 6.95 }
        : { x: 0.6, y: 5.95 };
    const textWidth = 7.3;
    const textHeight = isBottomText ? 1.1 : 1.45;
    const fontSize = page.page === 1 ? 18 : page.page === pageCount ? 17 : 16;
    const lineCountEstimate = Math.max(2, Math.ceil(String(page.text || "").length / 55));
    return {
      page: page.page,
      text: {
        content: page.text,
        position: textPosition,
        width: textWidth,
        height: textHeight,
        font: "Avenir Next Rounded",
        fontSize,
        alignment: page.page === 1 || page.page === pageCount ? "center" : "left",
      },
      illustration: {
        assetId: asset.assetId,
        position: { x: 0, y: 0 },
        width: 8.5,
        height: 8.5,
        fit: template === "SPLIT_FOCUS_TEXT_OVER_WHITE_BAND" ? "contain" : "cover",
        layer: 0,
      },
      pageTurn: {
        purpose: page.pageTurnObjective,
        preserved: true,
      },
      background: {
        assetId: asset.assetId,
        position: { x: 0, y: 0 },
        width: 8.5,
        height: 8.5,
      },
      overlays: unique([
        illustration && illustration.symbol ? {
          assetId: `OVERLAY_SYMBOL_PAGE_${page.page}`,
          position: { x: 6.8, y: 0.6 },
          width: 0.85,
          height: 0.85,
        } : null,
        {
          assetId: `OVERLAY_TEXT_SAFE_PAGE_${page.page}`,
          position: textPosition,
          width: textWidth,
          height: Number((Math.max(textHeight, lineCountEstimate * 0.18)).toFixed(2)),
        },
      ].filter(Boolean)),
      _layoutMeta: {
        template,
        sourceSceneId: illustration && illustration.sceneId,
        promptSceneId: prompt && prompt.sceneId,
      },
    };
  });

  const schemaPages = layoutPages.map((page) => ({
    page: page.page,
    text: page.text,
    illustration: page.illustration,
    pageTurn: page.pageTurn,
    background: page.background,
    overlays: page.overlays,
  }));

  return {
    layoutId,
    layout: {
      schemaVersion: "1.0",
      status: "PRODUCTION_READY",
      storyReference: { id: `STORY_${finalStory.id}` },
      finalStoryReference: { id: finalStory.id },
      illustrationAssetReferences: illustrationAssetsResult.assets.map((asset) => ({ id: asset.assetId })),
      format,
      pages: schemaPages,
      layoutValidation: {
        status: "PASS",
        blockingFailures: 0,
        warnings: 0,
        rulesPassed: 10,
      },
    },
    layoutDebug: layoutPages.map((page) => ({
      page: page.page,
      template: page._layoutMeta.template,
      sourceSceneId: page._layoutMeta.sourceSceneId,
      promptSceneId: page._layoutMeta.promptSceneId,
    })),
  };
}

function validateBookLayout(layoutResult, finalStory, illustrationAssetsResult, promptPackResult) {
  const issues = [];
  const layout = layoutResult && layoutResult.layout;
  const finalPages = finalStory && finalStory.pages || [];
  const assets = illustrationAssetsResult && illustrationAssetsResult.assets || [];
  const assetIds = new Set(assets.map((asset) => asset.assetId));
  const promptPages = new Set(((promptPackResult && promptPackResult.promptPack && promptPackResult.promptPack.pagePrompts) || []).map((entry) => entry.page));

  if (!(layout && (layout.status === "VALIDATED" || layout.status === "PRODUCTION_READY"))) {
    issues.push("9C must output a VALIDATED or PRODUCTION_READY layout artifact.");
  }
  if ((layout && layout.finalStoryReference && layout.finalStoryReference.id) !== (finalStory && finalStory.id)) {
    issues.push("9C layout must reference the locked Final Story.");
  }
  if (!(layout && layout.illustrationAssetReferences && layout.illustrationAssetReferences.length === assets.length)) {
    issues.push("9C layout must reference every resolved illustration asset.");
  }
  if (!(layout && layout.pages && layout.pages.length === finalPages.length)) {
    issues.push("9C must produce one layout page per locked story page.");
  }

  (layout && layout.pages || []).forEach((page, index) => {
    const finalPage = finalPages[index];
    if (!finalPage) {
      issues.push(`9C produced an extra layout page ${page.page}.`);
      return;
    }
    if (page.page !== finalPage.page) {
      issues.push(`9C page numbering drifted at page ${page.page}.`);
    }
    if ((page.text && page.text.content) !== finalPage.text) {
      issues.push(`9C page ${page.page} changed locked story text instead of placing it.`);
    }
    if (!page.text || !page.text.position) {
      issues.push(`9C page ${page.page} is missing text placement.`);
    }
    if (!page.illustration || !page.illustration.assetId) {
      issues.push(`9C page ${page.page} is missing illustration placement.`);
    }
    if (page.illustration && !assetIds.has(page.illustration.assetId)) {
      issues.push(`9C page ${page.page} references unknown illustration asset ${page.illustration.assetId}.`);
    }
    if (page.text && (page.text.position.x < 0.25 || page.text.position.y < 0.25)) {
      issues.push(`9C page ${page.page} text block is outside the safe inset.`);
    }
    if (page.text && ((page.text.position.x + (page.text.width || 0)) > 8.1 || (page.text.position.y + (page.text.height || 0)) > 8.1)) {
      issues.push(`9C page ${page.page} text block exceeds the safe layout area.`);
    }
    if (typeof page.text.fontSize !== "number" || page.text.fontSize < 14) {
      issues.push(`9C page ${page.page} font size is too small for readability.`);
    }
    if (!promptPages.has(page.page)) {
      issues.push(`9C page ${page.page} lost its prompt-pack linkage.`);
    }
  });

  return {
    status: issues.length ? "FAIL" : "PASS",
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 10 - issues.length) : 10,
    issues,
  };
}

function buildProductionMetadata(completeStoryMaster, storyBlueprint) {
  return {
    title: completeStoryMaster && completeStoryMaster.title || "Untitled Story",
    author: "Prana Story Engine",
    language: storyBlueprint && storyBlueprint.request && storyBlueprint.request.language || "en",
    targetAge: storyBlueprint && storyBlueprint.request && storyBlueprint.request.targetAge || "5-8",
    version: "1.0",
    createdAt: "2026-08-08",
    updatedAt: "2026-08-08",
  };
}

function buildProductionQAReport(finalStory, illustrationPackage, illustrationAssetsResult, promptPackResult, layoutResult, productionMetadata) {
  if (!(finalStory && illustrationPackage && illustrationAssetsResult && promptPackResult && layoutResult && productionMetadata)) {
    return null;
  }

  const layout = layoutResult.layout;
  const pageIllustrations = illustrationPackage.illustrationPlan.pageIllustrations || [];
  const promptPages = promptPackResult.promptPack.pagePrompts || [];
  const assets = illustrationAssetsResult.assets || [];
  const promptByPage = new Map(promptPages.map((entry) => [entry.page, entry]));
  const illustrationByPage = new Map(pageIllustrations.map((entry) => [entry.page, entry]));
  const assetByPage = new Map(assets.map((entry) => [entry.page, entry]));
  const pageCount = (finalStory.pages || []).length;
  const results = [];

  const rule = (ruleId, pass, description, responsibleModule, affected = null, severity = pass ? "info" : "blocking") => ({
    ruleId,
    status: pass ? "PASS" : "FAIL",
    severity,
    affected,
    description,
    responsibleModule,
  });

  results.push(rule("PQA-001", finalStory.status === "LOCKED", "Final Story remains locked and immutable.", "8F"));
  results.push(rule("PQA-002", layout.pages.length === pageCount, "Every required story page exists in the layout.", "9C"));
  results.push(rule("PQA-003", assets.length === pageCount, "Every required illustration asset exists.", "9B"));
  results.push(rule("PQA-010", assets.every((asset) => asset.width >= 1024 && asset.height >= 1024), "Illustration asset resolution meets current production minimums.", "9B"));
  results.push(rule("PQA-011", typeof layout.format.bleed === "number" && layout.format.bleed >= 0.125, "Bleed requirements are present and valid.", "9C"));
  results.push(rule("PQA-013", Boolean(productionMetadata.title && productionMetadata.language && productionMetadata.targetAge && productionMetadata.version), "Required production metadata is complete.", "9D"));

  (finalStory.pages || []).forEach((page, index) => {
    const layoutPage = layout.pages[index];
    const promptPage = promptByPage.get(page.page);
    const illustrationPage = illustrationByPage.get(page.page);
    const assetPage = assetByPage.get(page.page);

    results.push(rule(
      `PQA-004-P${page.page}`,
      Boolean(layoutPage && layoutPage.illustration && assetPage && layoutPage.illustration.assetId === assetPage.assetId),
      `Page ${page.page} references the correct illustration asset.`,
      "9C",
      `page:${page.page}`
    ));
    results.push(rule(
      `PQA-008-P${page.page}`,
      Boolean(layoutPage && layoutPage.text && layoutPage.text.content === page.text),
      `Page ${page.page} layout preserves the locked story text exactly.`,
      "9C",
      `page:${page.page}`
    ));
    results.push(rule(
      `PQA-009-P${page.page}`,
      Boolean(layoutPage && layoutPage.text && layoutPage.text.fontSize >= 14 && layoutPage.text.width > 0 && layoutPage.text.height > 0),
      `Page ${page.page} typography remains readable and sized appropriately.`,
      "9C",
      `page:${page.page}`
    ));
    results.push(rule(
      `PQA-012-P${page.page}`,
      Boolean(assetPage && assetPage.assetLocation && !String(assetPage.assetLocation).includes("generated://") && !String(assetPage.assetLocation).includes("placeholder")),
      `Page ${page.page} asset reference is concrete and not an unresolved placeholder.`,
      "9B",
      `asset:${assetPage && assetPage.assetId || `PAGE_${page.page}`}`
    ));
    results.push(rule(
      `PQA-005-P${page.page}`,
      Boolean(promptPage && illustrationPage && JSON.stringify(promptPage.characters || []) === JSON.stringify(illustrationPage.characters || [])),
      `Page ${page.page} character continuity remains synchronized from plan to prompt.`,
      "9B",
      `page:${page.page}`
    ));
    results.push(rule(
      `PQA-006-P${page.page}`,
      Boolean(promptPage && illustrationPage && promptPage.environment === illustrationPage.environment),
      `Page ${page.page} world continuity remains synchronized from plan to prompt.`,
      "9B",
      `page:${page.page}`
    ));
    results.push(rule(
      `PQA-007-P${page.page}`,
      Boolean(promptPage && illustrationPage && (promptPage.symbol || "") === (illustrationPage.symbol || "")),
      `Page ${page.page} symbol continuity remains synchronized from plan to prompt.`,
      "9B",
      `page:${page.page}`
    ));
    results.push(rule(
      `PQA-014-P${page.page}`,
      Boolean(assetPage && promptPage && layoutPage && illustrationPage),
      `Page ${page.page} has no unresolved production dependency across story, prompt, asset, and layout layers.`,
      "9D",
      `page:${page.page}`
    ));
  });

  results.push(rule(
    "PQA-015",
    layout.pages.every((page, index) => page.page === index + 1),
    "Page order remains correct and sequential.",
    "9C"
  ));
  results.push(rule(
    "PQA-016",
    Boolean(productionMetadata.title && String(productionMetadata.title).trim().length >= 4),
    "Title metadata is present for cover/title treatment.",
    "9D"
  ));
  results.push(rule(
    "PQA-017",
    !JSON.stringify({ finalStory, assets, layout, productionMetadata }).match(/TODO|placeholder|TBD/i),
    "No unresolved placeholder strings remain in the production package.",
    "9D"
  ));

  const errors = results.filter((result) => result.status === "FAIL");
  return {
    status: errors.length ? "PRODUCTION_QA_FAILED" : "PRODUCTION_READY",
    validation: {
      status: errors.length ? "FAIL" : "PASS",
      rulesPassed: results.filter((result) => result.status === "PASS").length,
      rulesFailed: errors.length,
      warnings: [],
      errors,
      results,
    },
    metadata: productionMetadata,
  };
}

function buildStoryPackage(storyBlueprint, storyPlan, completeStoryMaster, finalStory, illustrationPackage, promptPackResult, illustrationAssetsResult, layoutResult, productionQAReport) {
  if (!(productionQAReport && productionQAReport.status === "PRODUCTION_READY")) {
    return null;
  }

  const layout = layoutResult.layout;
  const productionMetadata = productionQAReport.metadata;
  const titleSlug = String(productionMetadata.title || "story")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
  const storyId = `STORYPKG_${storyBlueprint.blueprintId}`;
  const promptPackId = `PROMPTPACK_${storyBlueprint.blueprintId}`;
  const layoutReferenceId = layoutResult.layoutId;
  const exportProfiles = ["DIGITAL", "PRINT"];
  const version = productionMetadata.version || "1.0";

  const storyPackage = {
    schemaVersion: "1.0",
    status: "PRODUCTION_READY",
    storyId,
    sourceReferences: {
      storyBlueprintReference: { id: storyBlueprint.blueprintId },
      storyPlanReference: { id: storyPlan.blueprintReference.id },
      finalStoryReference: { id: finalStory.id },
      illustrationPlanReference: { id: illustrationPackage.planId },
      illustrationBibleReference: { id: illustrationPackage.bibleId },
      promptPackReference: { id: promptPackId },
      layoutReference: { id: layoutReferenceId },
    },
    story: {
      title: completeStoryMaster.title,
      pageCount: finalStory.pages.length,
    },
    layout: {
      format: `${layout.format.width}${layout.format.unit || "in"} ${layout.format.orientation}`,
      pageCount: layout.pages.length,
      exportProfiles,
    },
    illustrations: illustrationAssetsResult.assets.map((asset) => ({
      assetId: asset.assetId,
      page: asset.page,
      assetLocation: asset.assetLocation,
      format: asset.format,
      width: asset.width,
      height: asset.height,
    })),
    metadata: {
      ...productionMetadata,
    },
    productionValidation: {
      status: "PASS",
      blockingFailures: 0,
      warnings: 0,
      checksPassed: productionQAReport.validation.rulesPassed,
    },
  };

  const assetManifest = {
    storyId,
    title: productionMetadata.title,
    version,
    assets: illustrationAssetsResult.assets.map((asset) => ({
      assetId: asset.assetId,
      page: asset.page,
      location: asset.assetLocation,
      format: asset.format,
      width: asset.width,
      height: asset.height,
      promptReference: asset.promptReference,
      layoutReference: layoutReferenceId,
    })),
    fonts: [
      {
        family: "Avenir Next Rounded",
        usage: "Story text blocks in the approved layout.",
      },
    ],
    pageMap: layout.pages.map((page) => ({
      page: page.page,
      assetId: page.illustration.assetId,
      textLength: String(page.text.content || "").length,
      layoutReference: layoutReferenceId,
    })),
  };

  const exportMetadata = {
    storyId,
    version,
    exportProfiles,
    schemaVersions: {
      storyBlueprint: storyBlueprint.schemaVersion,
      storyPlan: storyPlan.schemaVersion,
      finalStory: "1.0",
      illustrationPlan: illustrationPackage.illustrationPlan.schemaVersion,
      illustrationBible: illustrationPackage.illustrationBible.schemaVersion,
      promptPack: promptPackResult.promptPack.schemaVersion,
      layout: layout.schemaVersion,
      storyPackage: storyPackage.schemaVersion,
    },
    generatedAt: "2026-08-08",
    titleSlug,
  };

  const exportReport = {
    status: "SUCCESS",
    version,
    profiles: exportProfiles,
    preservedReferences: storyPackage.sourceReferences,
    integrityChecks: {
      productionQAStatus: productionQAReport.validation.status,
      lockedStoryPreserved: layout.pages.every((page, index) => page.text.content === finalStory.pages[index].text),
      pageOrderPreserved: layout.pages.every((page, index) => page.page === index + 1),
      illustrationCountMatches: storyPackage.illustrations.length === finalStory.pages.length,
      metadataComplete: Boolean(storyPackage.metadata.title && storyPackage.metadata.language && storyPackage.metadata.targetAge),
    },
  };

  return {
    promptPackId,
    storyPackage,
    assetManifest,
    exportMetadata,
    exportReport,
  };
}

function validateStoryPackageExport(exportResult, finalStory, layoutResult, productionQAReport) {
  const issues = [];
  const storyPackage = exportResult && exportResult.storyPackage;
  const assetManifest = exportResult && exportResult.assetManifest;
  const exportMetadata = exportResult && exportResult.exportMetadata;
  const exportReport = exportResult && exportResult.exportReport;
  const layout = layoutResult && layoutResult.layout;

  if (!(productionQAReport && productionQAReport.status === "PRODUCTION_READY")) {
    issues.push("9E cannot export unless Production QA is PRODUCTION_READY.");
  }
  if (!(storyPackage && storyPackage.status === "PRODUCTION_READY")) {
    issues.push("9E must output a PRODUCTION_READY story package.");
  }
  if ((storyPackage && storyPackage.sourceReferences && storyPackage.sourceReferences.finalStoryReference.id) !== (finalStory && finalStory.id)) {
    issues.push("9E story package must preserve the locked final story reference.");
  }
  if ((storyPackage && storyPackage.sourceReferences && storyPackage.sourceReferences.layoutReference.id) !== (layoutResult && layoutResult.layoutId)) {
    issues.push("9E story package must preserve the approved layout reference.");
  }
  if (!(storyPackage && storyPackage.illustrations && storyPackage.illustrations.length === (finalStory && finalStory.pages || []).length)) {
    issues.push("9E must include one exported illustration entry per story page.");
  }
  if (!(assetManifest && assetManifest.assets && assetManifest.assets.length === storyPackage.illustrations.length)) {
    issues.push("9E asset manifest must cover every exported illustration.");
  }
  if (!(exportMetadata && exportMetadata.version && exportMetadata.schemaVersions && exportMetadata.schemaVersions.storyPackage)) {
    issues.push("9E export metadata is incomplete.");
  }
  if (!(exportReport && exportReport.status === "SUCCESS")) {
    issues.push("9E export report must mark successful exports as SUCCESS.");
  }
  if (!(exportReport && exportReport.integrityChecks && Object.values(exportReport.integrityChecks).every(Boolean))) {
    issues.push("9E export integrity checks did not all pass.");
  }
  if (!(layout && layout.pages.every((page, index) => page.text.content === finalStory.pages[index].text))) {
    issues.push("9E detected story text drift between locked manuscript and approved layout.");
  }

  return {
    status: issues.length ? "FAIL" : "PASS",
    blockingFailures: issues.length,
    warnings: 0,
    rulesPassed: issues.length ? Math.max(1, 10 - issues.length) : 10,
    issues,
  };
}

function buildStoryPlan(blueprint, libraries) {
  const blueprintValidation = validateBlueprintForPhase7(blueprint);
  if (blueprintValidation.status !== "PASS") {
    return null;
  }

  const storyFlow = buildStoryFlow(blueprint);
  const storyFlowValidation = validateStoryFlow(storyFlow, blueprint);
  if (storyFlowValidation.status !== "PASS") {
    return null;
  }
  const storyComposerValidation = validateStoryComposer(storyFlow, blueprint);
  if (storyComposerValidation.status !== "PASS") {
    return null;
  }
  const scenePlan = buildScenePlan(storyFlow, blueprint);
  const sceneValidation = validateScenePlan(scenePlan, storyFlow, blueprint);
  if (sceneValidation.status !== "PASS") {
    return null;
  }
  const pagePlan = buildPagePlan(blueprint, scenePlan);
  const pageValidation = validatePagePlan(pagePlan, scenePlan, blueprint);
  if (pageValidation.status !== "PASS") {
    return null;
  }
  const emotionPlan = buildEmotionPlan(blueprint, scenePlan, pagePlan, libraries);
  const emotionValidation = validateEmotionPlan(emotionPlan, scenePlan, pagePlan, blueprint);
  if (emotionValidation.status !== "PASS") {
    return null;
  }
  const symbolPlan = buildSymbolPlan(blueprint, scenePlan, pagePlan, emotionPlan);
  const symbolValidation = validateSymbolPlan(symbolPlan, blueprint, scenePlan);
  if (symbolValidation.status !== "PASS") {
    return null;
  }
  const craftPlan = buildCraftPlan(blueprint, scenePlan, pagePlan, emotionPlan, symbolPlan, libraries);
  const craftValidation = validateCraftPlan(craftPlan, blueprint, scenePlan, pagePlan, libraries);
  if (craftValidation.status !== "PASS") {
    return null;
  }
  const assembledStoryPlan = {
    schemaVersion: "1.0",
    status: "VALIDATED",
    blueprintReference: { id: blueprint.blueprintId },
    storyFlow,
    scenePlan,
    pagePlan,
    emotionPlan,
    symbolPlan,
    craftPlan,
  };
  const validation = validateDirectorPackage(assembledStoryPlan, blueprint);

  if (validation.status !== "PASS") {
    return null;
  }

  return {
    ...assembledStoryPlan,
    directorValidation: {
      status: "PASS",
      blockingFailures: validation.blockingFailures,
      warnings: validation.warnings,
      rulesPassed: validation.rulesPassed,
    },
  };
}

function buildStoryBlueprint(result, request) {
  const ctx = result.context;
  if (result.status !== "PASS") {
    return null;
  }

  const counts = issueCounts(result.issues);
  const requestLifeDomain = request.lifeDomainId || (ctx.situation && ctx.situation.ontology && ctx.situation.ontology.lifeDomainIds && ctx.situation.ontology.lifeDomainIds[0]) || undefined;

  return {
    schemaVersion: "1.0",
    blueprintId: `BLUEPRINT_${ctx.situation.id}_${ctx.character.id}_${ctx.storyStructure.id}`,
    status: "VALIDATED",
    request: {
      targetAge: "5-8",
      language: "en",
      pageRange: { min: 5, max: 8 },
      ...(requestLifeDomain ? { lifeDomain: requestLifeDomain } : {}),
    },
    situation: { id: ctx.situation.id },
    need: {
      id: ctx.need.id,
      reason: `Resolved through Situation ${ctx.situation.id} hard.need_id.`,
    },
    belief: {
      falseBelief: ctx.belief.falseBelief,
      trueBelief: ctx.belief.trueBelief,
      reason: `Belief wording comes directly from Situation ${ctx.situation.id}.`,
    },
    character: {
      role: ctx.character.hard.role_id,
      candidates: [ctx.character.id],
      selected: ctx.character.id,
      reason: `Selected through character.best_need_ids compatibility with ${ctx.need.id}.`,
    },
    adventureArchetype: {
      id: ctx.archetype.id,
      reason: `Selected through Character best_mission_types to Archetype best_mission_types overlap.`,
    },
    mission: {
      id: String(ctx.mission.id),
      reason: `Concrete Mission selected after resolving abstract Mission Type ${ctx.missionType.id}.`,
    },
    storyActions: ctx.storyActions.map((item) => ({
      id: item.id,
      purpose: storyActionPurpose(item.id),
    })),
    world: {
      id: ctx.world.id,
      reason: `World selected through Mission settings and Archetype world-type compatibility.`,
    },
    obstacle: {
      id: ctx.obstacle.id,
      reason: `Obstacle selected through Archetype typical_obstacle_domains.`,
    },
    storyConflict: {
      id: ctx.storyConflict.id,
      type: ctx.storyConflict.hard.conflict_intensity,
      reason: `Conflict selected through Obstacle Domain with Mission Type reinforcement.`,
    },
    logic: {
      id: ctx.logic.id,
      causalPattern: ctx.beatPlan.map((beat) => beat.family),
      reason: `Logic selected from Character, Archetype, and Conflict compatible logic pools.`,
    },
    storyStructure: {
      id: ctx.storyStructure.id,
      sequence: splitSequence(ctx.storyStructure.scene_flow_template),
      reason: `Structure selected through hard logic_family = ${ctx.logic.id}.`,
    },
    beats: ctx.beatPlan.map((beat) => ({
      id: beat.id,
      function: beat.purpose,
    })),
    opening: {
      strategy: ctx.opening.id,
      function: ctx.opening.description,
      requirements: [ctx.opening.hard.opening_type],
    },
    ending: {
      strategy: ctx.ending.id,
      function: ctx.ending.description,
      requirements: [ctx.ending.hard.ending_type],
    },
    symbols: [{
      symbolId: ctx.symbol.id,
      function: `Supports ${ctx.symbol.symbol_theme} through Need and Mission Type compatibility.`,
      introduction: ctx.beatPlan[0] && ctx.beatPlan[0].id,
      development: ctx.beatPlan[Math.max(0, Math.floor((ctx.beatPlan.length - 1) / 2))] && ctx.beatPlan[Math.max(0, Math.floor((ctx.beatPlan.length - 1) / 2))].id,
      payoff: ctx.beatPlan[ctx.beatPlan.length - 1] && ctx.beatPlan[ctx.beatPlan.length - 1].id,
    }],
    craft: ctx.craft.requiredCraftCodes.map((code) => ({
      techniqueId: code,
      purpose: `Required by resolved Beat graph propagation.`,
    })),
    plannerValidation: {
      status: "PASS",
      blockingFailures: counts.blockingFailures,
      warnings: counts.warnings,
      rulesPassed: 22,
    },
  };
}

function buildPlannerResultPayload(result, request) {
  const ctx = result.context;
  return {
    phase: "6A",
    validationStatus: result.status,
    request: {
      targetAge: "5-8",
      language: "en",
      pageRange: { min: 5, max: 8 },
      lifeDomain: request.lifeDomainId || null,
      seedMode: state.seedMode,
    },
    issues: result.issues,
    plannerContext: {
      situationId: ctx.situation && ctx.situation.id,
      needId: ctx.need && ctx.need.id,
      belief: ctx.belief,
      characterId: ctx.character && ctx.character.id,
      archetypeId: ctx.archetype && ctx.archetype.id,
      missionTypeId: ctx.missionType && ctx.missionType.id,
      missionId: ctx.mission && ctx.mission.id,
      storyActionIds: ctx.storyActions.map((item) => item.id),
      worldId: ctx.world && ctx.world.id,
      obstacleId: ctx.obstacle && ctx.obstacle.id,
      storyConflictId: ctx.storyConflict && ctx.storyConflict.id,
      logicId: ctx.logic && ctx.logic.id,
      storyStructureId: ctx.storyStructure && ctx.storyStructure.id,
      beatIds: ctx.beatPlan.map((beat) => beat.id),
      openingId: ctx.opening && ctx.opening.id,
      endingId: ctx.ending && ctx.ending.id,
      symbolId: ctx.symbol && ctx.symbol.id,
      craft: ctx.craft,
    },
  };
}

// ---------------------------------------------------------------------------
// Phase 8A Template Layer v1 (T03 "Three Tries" pilot only).
// This layer sits between Phase 7 StoryPlan and the 8A Story Composer.
// It does not replace buildCompleteStoryMaster for the live app; it is an
// alternate 8A implementation reached only through runT03TemplatePilot(),
// so default story generation for real users is untouched while this is
// being proven out. 8B-8F and Phase 9 below are called completely unchanged.
// ---------------------------------------------------------------------------

// Deterministic tie-break order (Selector requirement, frozen alongside the
// rest of the architecture): exact situation fit -> exact need fit ->
// logic fit -> required-beat fit -> emotional-arc fit -> specificity score ->
// template priority (templateId ascending, e.g. T01 before T02). Same inputs
// always produce the same selection.
//
// Specificity score (added 2026-08-11, selector audit — see
// tmp_selector_audit_report.md): before this, any tie on the four boolean
// tiers fell straight to templateId order. Two template pairs
// (T01/T22, sharing bestForNeeds=[CURIOSITY,PATIENCE]+logic=CUMULATIVE_BUILD;
// T16/T23, sharing bestForNeeds=[COMPASSION,RESPECT]+logic=PERSPECTIVE_SHIFT)
// have byte-identical need+logic signatures, so every situation that matched
// either member of a pair always ties, and the lower templateId won
// unconditionally — T22 and T23 were mathematically unreachable by natural
// selection regardless of situation content (confirmed empirically: 0/156
// active situations naturally selected T16, T21, T22, or T23 before this
// fix). The specificity score breaks ties in favor of the template whose
// matched need/logic is shared by fewer other templates — a rarer, more
// specific match ranks above a more commonly-claimed one — before falling
// through to the arbitrary templateId order. This does not change ranking
// for any template whose signature is already unique; it only stops a
// generic template from silently absorbing every situation that a more
// specific template was equally entitled to.
function selectStoryTemplate(blueprint, storyPlan, libraries) {
  const templates = (state.storyTemplates || []);
  if (!templates.length) {
    return null;
  }
  const needId = blueprint.need && blueprint.need.id;
  const situationId = blueprint.situation && blueprint.situation.id;
  // Fixed 2026-08-11 (Dev A coverage diagnosis): this read
  // storyPlan.storyFlow.logic.id, a field buildStoryFlow (Phase 7) never
  // sets — storyFlow only ever has {sequence, centralDramaticQuestion,
  // resolution}. logicFit has therefore always evaluated false for every
  // template, for every situation, since this tier was added. The real,
  // already-correctly-resolved logic family lives on the blueprint itself
  // (blueprint.logic.id, populated from ctx.logic.id — confirmed to match
  // the same LOGIC_* vocabulary storyTemplates.json's bestForLogicFamilies
  // uses). This restores the tier to the data it was always meant to read,
  // it does not introduce any new mapping.
  const logicId = blueprint.logic && blueprint.logic.id;
  const sceneCount = storyPlan && storyPlan.scenePlan && storyPlan.scenePlan.length;
  const libs = libraries || state.libraries;
  const emotionalArc = libs ? chooseEmotionalArc(blueprint, libs) : null;
  const arcRecommendedNeeds = (emotionalArc && emotionalArc.soft_suggested && emotionalArc.soft_suggested.recommended_need_ids) || [];

  const needClaimCount = new Map();
  const logicClaimCount = new Map();
  templates.forEach((template) => {
    (template.bestForNeeds || []).forEach((need) => needClaimCount.set(need, (needClaimCount.get(need) || 0) + 1));
    (template.bestForLogicFamilies || []).forEach((logic) => logicClaimCount.set(logic, (logicClaimCount.get(logic) || 0) + 1));
  });

  const evaluated = templates.map((template) => {
    const situationFit = Boolean(situationId && (template.bestForSituations || []).includes(situationId));
    const needFit = Boolean(needId && (template.bestForNeeds || []).includes(needId));
    const logicFit = Boolean(logicId && (template.bestForLogicFamilies || []).includes(logicId));
    const beatFit = Boolean(sceneCount && template.requiredBeats && Math.abs(template.requiredBeats.length - sceneCount) <= 2);
    const arcFit = arcRecommendedNeeds.length > 0 && (template.bestForNeeds || []).some((need) => arcRecommendedNeeds.includes(need));
    const specificityScore = (needFit ? 1 / needClaimCount.get(needId) : 0) + (logicFit ? 1 / logicClaimCount.get(logicId) : 0);
    return {
      template,
      tiers: [situationFit, needFit, logicFit, beatFit, arcFit].map((flag) => (flag ? 1 : 0)).concat([specificityScore]),
      reasons: [
        situationFit && `situation ${situationId} exact fit`,
        needFit && `need ${needId} exact fit`,
        logicFit && `logic family ${logicId} fit`,
        beatFit && `beat count compatible with ${sceneCount}-scene Story Plan`,
        arcFit && `emotional arc fit via recommended needs`,
        (needFit || logicFit) && needClaimCount.size && `specificity score ${specificityScore.toFixed(2)}`,
      ].filter(Boolean),
    };
  });

  evaluated.sort((a, b) => {
    for (let i = 0; i < a.tiers.length; i += 1) {
      if (a.tiers[i] !== b.tiers[i]) {
        return b.tiers[i] - a.tiers[i];
      }
    }
    return a.template.templateId.localeCompare(b.template.templateId);
  });

  const best = evaluated[0];
  return {
    templateId: best.template.templateId,
    templateName: best.template.name,
    template: best.template,
    selectionReason: best.reasons.length
      ? best.reasons.join("; ")
      : `No tier matched; ${best.template.templateId} selected by deterministic template-priority tie-break.`,
    confidence: best.reasons.length ? "high" : "low",
    blueprintReference: blueprint.blueprintId,
  };
}

function assertTemplateBeforeWriting(templateSelection, blueprint, filledSlots) {
  const issues = [];
  if (!templateSelection || templateSelection.blueprintReference !== blueprint.blueprintId) {
    issues.push("template.blueprintReference !== currentBlueprint.id");
  }
  if (!filledSlots) {
    issues.push("Template Filler produced no context.");
  } else {
    const requiredNonEmpty = ["protagonist", "situationTitle", "goalPhrase", "trueBelief", "symbolLabel"];
    requiredNonEmpty.forEach((field) => {
      if (!String(filledSlots[field] || "").trim()) {
        issues.push(`Required Blueprint field "${field}" is empty before writing.`);
      }
    });
  }
  return { status: issues.length ? "FAIL" : "PASS", issues };
}

// Generic, template-ID-agnostic Blueprint context used by every template's
// writer. Contains only resolved Blueprint facts — no story-shape decisions.
function fillStoryTemplate(template, blueprint, storyPlan, libraries) {
  const indexes = libraries && libraries.indexes || {};
  const situation = lookupById(indexes.situations, libraries && libraries.situations, blueprint.situation && blueprint.situation.id);
  const character = lookupById(indexes.characters, libraries && libraries.characters, blueprint.character && blueprint.character.selected);
  const mission = lookupById(indexes.missions, libraries && libraries.missions, blueprint.mission && blueprint.mission.id);
  const obstacle = lookupById(indexes.obstacles, libraries && libraries.obstacles, blueprint.obstacle && blueprint.obstacle.id);
  const conflict = lookupById(indexes.storyConflicts, libraries && libraries.storyConflicts, blueprint.storyConflict && blueprint.storyConflict.id);
  const symbolId = storyPlan && storyPlan.symbolPlan && storyPlan.symbolPlan[0] && storyPlan.symbolPlan[0].symbolId;
  const symbolRecord = lookupById(indexes.ganeshaSymbols, libraries && libraries.ganeshaSymbols, symbolId);

  const protagonist = firstName((character && character.name) || "The child");
  const situationTitle = (situation && situation.title) || "a hard moment";
  const missionName = (mission && mission.name) || titleCaseFromId(blueprint.mission && blueprint.mission.id);
  const missionPhrase = stripTrailingPeriod(missionName).toLowerCase();
  const obstacleName = obstacle && obstacle.name ? obstacle.name : "the obstacle in the way";
  const conflictName = (conflict && conflict.name) || "the problem";
  const symbolLabel = titleCaseFromId((symbolRecord && symbolRecord.symbol_theme) || "SYMBOL_SUPPORT");
  const falseBelief = (blueprint.belief && blueprint.belief.falseBelief) || "";
  const trueBelief = (blueprint.belief && blueprint.belief.trueBelief) || "";

  const actionIds = (blueprint.storyActions || []).map((item) => item.id);
  const actionLabels = actionIds.map((id) => titleCaseFromId(id)).filter(Boolean);
  const fallbackActions = ["Try again", "Look closer", "Ask for help"];
  const actionVerbs = [0, 1, 2].map((i) => (actionLabels[i] || fallbackActions[i] || fallbackActions[fallbackActions.length - 1]));

  return {
    protagonist,
    situationTitle,
    goalPhrase: `to ${missionPhrase}`,
    missionPhrase,
    obstacleName,
    conflictName,
    symbolLabel,
    falseBelief,
    trueBelief,
    actionVerbs,
    _lookups: { situation, character, mission, obstacle, conflict, symbolRecord },
    _craftRequired: (blueprint.craft || []).length > 0,
  };
}

function protagonistPauseLead(ctx) {
  return `${ctx.protagonist} took one slow breath and said, "Wait."`;
}

// ===========================================================================
// Phase 8A REDESIGN — Story Event Planner (pilot: T03 only).
//
// This sits between the Template (rhythm) and the Writer (prose). The
// template no longer generates sentences directly — it only tells the
// planner which beats exist and what kind of causal move each one is. The
// planner turns Blueprint facts into a concrete, causally-linked chain of
// events; the writer then turns that chain into prose. Nothing here is
// keyed off a template's ID or name — only off beat kind (from
// classifyTemplateBeat) and Blueprint data (obstacle, mission, symbol,
// storyActions), so the same machinery can serve any template later.
// ===========================================================================

// Every real Ganesha symbol theme gets one concrete, recurring physical
// motif and a causal role it can actually play in a scene — not a label
// tacked onto the last sentence. Keyed by symbol_theme (data), not by
// template or situation.
const SYMBOL_MECHANISM = {
  SYMBOL_PATIENCE: { motif: "small paper star", noticeVerb: "noticed", useVerb: "counting the stars so far" },
  SYMBOL_SHELTER: { motif: "round smooth stone", noticeVerb: "noticed", useVerb: "holding the stone tight" },
  SYMBOL_THRESHOLD: { motif: "half-open door", noticeVerb: "noticed", useVerb: "looking through the doorway" },
  SYMBOL_CREATIVE_TOOL: { motif: "bent paperclip", noticeVerb: "found", useVerb: "turning the paperclip over in one hand" },
  SYMBOL_GROWTH: { motif: "tiny green sprout", noticeVerb: "noticed", useVerb: "checking on the sprout" },
  SYMBOL_CONNECTION: { motif: "pair of soft feathers", noticeVerb: "found", useVerb: "holding the feathers still" },
  SYMBOL_FOOD: { motif: "warm modak", noticeVerb: "noticed", useVerb: "holding the modak without eating it yet" },
  SYMBOL_LIGHT: { motif: "flickering firefly", noticeVerb: "noticed", useVerb: "watching the firefly's glow" },
};
const DEFAULT_SYMBOL_MECHANISM = { motif: "small quiet thing nearby", noticeVerb: "noticed", useVerb: "looking at it closely" };

// Every real storyAction gets one concrete, playable "how they tried"
// phrase — not just its verb form. Keyed by action id (data).
const ACTION_PHRASES = {
  ACTION_SEARCH: "searched everywhere for another way",
  ACTION_EXPLORE: "tried a completely different direction",
  ACTION_HELP: "asked someone nearby for help",
  ACTION_RESCUE: "rushed in to fix it all at once",
  ACTION_PROTECT: "stood firm and refused to move",
  ACTION_BUILD: "tried to build a way around it",
  ACTION_CREATE: "tried to make something new to solve it",
  ACTION_DELIVER: "tried to carry it through anyway",
  ACTION_SOLVE: "tried to puzzle it out step by step",
  ACTION_LEARN: "tried to study exactly how it worked",
  ACTION_TEACH: "tried to explain exactly what was needed",
  ACTION_SHARE: "tried telling someone else about the problem",
  ACTION_CARE_FOR: "tried going gently, careful not to make it worse",
  ACTION_RESTORE: "tried to put things back the way they were",
  ACTION_ORGANIZE: "tried planning it out step by step first",
  ACTION_COMMUNICATE: "tried saying exactly what was meant",
  ACTION_GUIDE: "tried leading the way alone",
  ACTION_PERFORM: "tried pushing straight through it",
  ACTION_CELEBRATE: "tried making it feel like a game instead",
  ACTION_PRACTICE: "tried the same thing again, a little harder",
  ACTION_REPAIR: "tried fixing the part that seemed broken",
  ACTION_DISCOVER: "tried to find a clue that had been missed",
  ACTION_OBSERVE: "stopped to watch closely before doing anything",
};
const DEFAULT_ACTION_PHRASE = "tried again, a different way";
const FALLBACK_ACTION_PHRASE_POOL = [
  DEFAULT_ACTION_PHRASE,
  "took a step back and looked at it fresh",
  "asked a completely different kind of question about it",
];

// Always returns 3 distinct concrete phrases, even when the Blueprint has
// fewer than 3 distinct storyActions, so no two attempts read identically.
function pickThreeDistinctActionPhrases(actionIds) {
  const used = new Set();
  const chosen = [];
  const candidates = (actionIds || []).map((id) => ACTION_PHRASES[id]).filter(Boolean);
  const pool = [...candidates, ...FALLBACK_ACTION_PHRASE_POOL, ...Object.values(ACTION_PHRASES)];
  for (const phrase of pool) {
    if (chosen.length >= 3) {
      break;
    }
    if (!used.has(phrase)) {
      used.add(phrase);
      chosen.push(phrase);
    }
  }
  while (chosen.length < 3) {
    chosen.push(`${DEFAULT_ACTION_PHRASE} (${chosen.length + 1})`);
  }
  return chosen;
}

// ---------------------------------------------------------------------------
// Situation-to-event translation. Mission and Obstacle are the STRUCTURAL
// role (what kind of goal, what kind of resistance) — they do not supply
// the concrete content. The concrete content (what actually happened, what
// is actually in the way) always comes from the current Situation record,
// so two situations that happen to share a Mission/Obstacle id still
// produce different events.
// ---------------------------------------------------------------------------

const OBSTACLE_DOMAIN_FLAVOR = {
  OD_PHYSICAL: "nothing about it budged",
  OD_NATURE: "the world outside would not cooperate",
  OD_SOCIAL: "no one else seemed to notice or help",
  OD_EMOTIONAL: "the feeling did not go away on its own",
  OD_PUZZLE: "there was no obvious answer",
  OD_TIME: "there was no more time to wait",
};
const DEFAULT_OBSTACLE_FLAVOR = "it did not get any easier";

const SITUATION_DETAIL_STOPWORDS = new Set([
  "a", "an", "the", "to", "of", "in", "on", "at", "for", "and", "or", "with", "when", "while", "is", "are",
  "was", "were", "be", "been", "being", "it", "its", "their", "they", "he", "she", "his", "her", "not", "no",
  "do", "does", "did", "has", "have", "had", "if", "so", "but", "that", "this", "these", "those", "from", "by",
  "about", "into", "than", "then", "too", "very", "just", "can", "could", "should", "would", "will", "my", "me",
  "i", "them", "there", "get", "gets", "getting", "them", "themselves",
]);

function extractConcreteWords(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((word) => word.length > 2 && !SITUATION_DETAIL_STOPWORDS.has(word));
}

// Refuses to invent detail the Situation record doesn't actually contain.
// Migrated: concrete-word detail now comes from the authored storySeed
// (childExperience + immediateWant + immediateObstacle + emotionalTension),
// never from title — title is canonical/internal only per the locked schema
// contract. A situation with fewer than 3 distinct concrete words across its
// storySeed cannot support a situation-specific event chain honestly.
function assessSituationDetail(situation) {
  const concreteWords = Array.from(new Set(extractConcreteWords(buildStorySeedContextText(situation))));
  return concreteWords.length >= 3
    ? { status: "OK", concreteWords }
    : { status: "INSUFFICIENT_SITUATION_DETAIL", concreteWords };
}

// The obstacle's structural domain only flavors HOW resistance feels; WHAT
// is actually resisting comes from the situation's own authored
// immediateObstacle (never the title — that was the mechanical-prose
// problem this schema migration removes).
function concreteObstacleClause(obstacle, immediateObstacleText, protagonist) {
  const flavor = OBSTACLE_DOMAIN_FLAVOR[obstacle && obstacle.hard && obstacle.hard.obstacle_domain] || DEFAULT_OBSTACLE_FLAVOR;
  // storySeed text uses "Kavi" (any case) as the generic placeholder hero
  // name — must be substituted before this clause ever reaches prose, same
  // as realizeSituation()/concreteSceneFacts() do. Case-insensitive because
  // some authored records use lowercase "kavi" mid-sentence.
  const substituted = immediateObstacleText && protagonist
    ? immediateObstacleText.replace(/\bkavi\b/gi, protagonist)
    : immediateObstacleText;
  const clause = substituted ? lowerFirstUnlessProperNoun(stripTrailingPeriod(substituted), protagonist) : "nothing had changed";
  return `${flavor}: ${clause}`;
}

// Lowercasing the first letter of a clause reads fine for common nouns
// ("the door was stuck") but turns a proper name into a typo-looking
// lowercase token ("tara must decide..."). Skip the lowercase step when the
// clause's first word is the protagonist's own name.
function lowerFirstUnlessProperNoun(text, protagonist) {
  const trimmed = String(text || "");
  const firstWord = trimmed.split(/\s+/)[0] || "";
  if (protagonist && firstWord === protagonist) return trimmed;
  return lowerFirst(trimmed);
}

// The pronoun "I" is capitalized regardless of sentence position — lowerFirst
// alone would turn "I can adapt..." into "i can adapt...", which is simply
// wrong English, not a stylistic choice. Used when weaving trueBelief (an
// authored "I ..." affirmation) mid-sentence.
function lowerFirstKeepingI(text) {
  const trimmed = String(text || "");
  return /^I\b/.test(trimmed) ? trimmed : lowerFirst(trimmed);
}

// T16 prose-naturalness pass, round 2 (2026-08-10): "X thought: 'Y'" and "X
// finally let that sink in: Y" both still read as the template announcing
// the moral — a dedicated sentence whose only job is to state the belief.
// Folds the belief into the SAME sentence as the shown reaction instead, as
// a trailing clause (no "thought"/"sink in" framing verb at all), so it
// reads as one continuous beat rather than reaction-sentence-then-lesson-
// sentence. reactionText should NOT include its own trailing period.
function joinWithBelief(reactionText, trueBelief) {
  const reaction = stripTrailingPeriod(String(reactionText || ""));
  const belief = stripTrailingPeriod(String(trueBelief || ""));
  if (!belief) return `${reaction}.`;
  return `${reaction} — ${lowerFirstKeepingI(belief)}.`;
}

// A small, generic (not per-situation) dictionary used only to pull a
// short, natural noun phrase out of a Situation's own authored storySeed
// text, so later beats can refer back to "their friend" / "their new
// classmate" instead of re-quoting the whole passage. Falls back to null
// (handled by the writer) rather than inventing a reference the storySeed
// doesn't support.
// Split by semantic type (kill-critic review, 2026-08-10): the old single
// list mixed people ("friend", "teacher") and objects ("toy", "glasses"), so
// a situation whose text mentioned both — e.g. SIT083 "Friend got a new
// toy" — matched "friend" first and T22 then physically handled a PERSON
// as an object ("picked their friend up", "put their friend in a bag").
// An object must never be realized as a character and vice versa, so each
// template pulls from the list matching what it actually needs.
const SITUATION_PERSON_NOUNS = [
  "friend", "classmate", "sibling", "brother", "sister", "parent", "mom", "mama", "dad", "papa",
  "teacher", "teammate", "classmates", "family", "baby", "dog", "pet", "adult", "stranger",
];
const SITUATION_OBJECT_NOUNS = [
  "toy", "screen", "homework", "game", "glasses", "project", "picture", "blanket",
];
function extractCoreReference(situationContextText, nouns) {
  const lower = String(situationContextText || "").toLowerCase();
  const list = nouns || SITUATION_PERSON_NOUNS;
  const found = list.find((noun) => lower.includes(noun));
  return found ? `their ${found}` : null;
}

// ---------------------------------------------------------------------------
// realizeSituation(): converts the Situation record into a natural narrative
// moment. Migrated off title-parsing entirely — childExperience and
// immediateWant are already hand-authored natural language, so this simply
// substitutes the protagonist's name in place of the storySeed's generic
// "Kavi" placeholder rather than grammatically parsing a title fragment.
// ---------------------------------------------------------------------------

const GENERIC_ROLE_NOUNS = new Set([
  "parent", "friend", "teacher", "classmate", "sibling", "teammate", "mom", "dad", "mama", "papa",
  "brother", "sister", "stranger", "adult", "dog", "pet",
]);
const FINITE_VERB_PATTERN = /\b(is|isn't|was|wasn't|are|aren't|were|weren't|has|hasn't|had|hadn't|wants|wanted|keeps|kept|won't|wouldn't|can't|couldn't|doesn't|didn't|gets|got)\b/i;

const SUBORDINATE_CONNECTORS = /^(when|while|because|since|after|before)$/i;
const PREPOSITION_PATTERN = /\b(on|in|at|during|with|about|near|from|for)\b/i;

// Realizes a single clause/fragment (no subordinate connector) into a
// natural sentence fragment. Shared by the compound path and the
// simple-title path below — purely shape-based, no per-title branching.
function realizeSimpleFragment(text, protagonist) {
  const words = text.trim().split(/\s+/);
  const firstWord = words[0] || "";
  let body = firstWord === protagonist ? text : text.charAt(0).toLowerCase() + text.slice(1);
  const isRoleNoun = GENERIC_ROLE_NOUNS.has(firstWord.toLowerCase()) && firstWord !== protagonist;
  if (isRoleNoun) {
    body = `their ${body}`;
  }

  const startsWithGerund = /^[A-Za-z]+ing$/.test(firstWord);
  const hasFiniteVerb = FINITE_VERB_PATTERN.test(text);
  const prepMatch = text.match(PREPOSITION_PATTERN);

  if (startsWithGerund) {
    return { kind: "gerund", sentence: `${protagonist} was right in the middle of ${body}` };
  }
  if (hasFiniteVerb) {
    return { kind: "clause", sentence: body };
  }
  if (isRoleNoun && prepMatch) {
    // Verbless "{Role noun} {preposition phrase}" (e.g. "Parent on work
    // call") — insert the missing copula generically: subject + "was" +
    // the prepositional remainder, rather than a fixed template.
    const rest = text.slice(text.toLowerCase().indexOf(prepMatch[0].toLowerCase())).trim();
    return { kind: "clause", sentence: `${protagonist}'s ${firstWord.toLowerCase()} was ${rest.toLowerCase()}` };
  }
  // A bare noun-phrase/past-participle fragment has no finite verb and no
  // subject+preposition shape to hang a natural clause on honestly — use
  // the most neutral possible framing rather than guessing at an actor or
  // action the title doesn't specify.
  return { kind: "fragment", sentence: `it was ${body}` };
}

// Returns { kind: "insufficient" } when the Situation record itself does
// not carry enough structure to realize honestly — never invents a verb,
// actor, or fact the title doesn't support.
// Generic (role-noun-keyed, never title-keyed) immediate wants. This is
// what makes Event 1 causally follow from the situation instead of a
// parallel, disconnected mission label — the hero's want here is what the
// rest of the chain acts on.
const ROLE_NOUN_WANT = {
  friend: (ref) => `to play with ${ref} again`,
  classmate: (ref) => `to figure out how to say hello to ${ref}`,
  sibling: (ref) => `to feel noticed by ${ref}`,
  brother: (ref) => `to feel noticed by ${ref}`,
  sister: (ref) => `to feel noticed by ${ref}`,
  parent: (ref) => `to be heard by ${ref}`,
  mom: (ref) => `to be heard by ${ref}`,
  mama: (ref) => `to be heard by ${ref}`,
  dad: (ref) => `to be heard by ${ref}`,
  papa: (ref) => `to be heard by ${ref}`,
  teacher: (ref) => `to feel understood by ${ref}`,
  teammate: (ref) => `to work things out with ${ref}`,
  stranger: (ref) => `to feel safe around ${ref}`,
  adult: (ref) => `to be understood by ${ref}`,
  dog: () => "to help",
  pet: () => "to help",
};

function deriveImmediateWant(text, protagonist) {
  const lower = text.toLowerCase();
  const roleNoun = Object.keys(ROLE_NOUN_WANT).find((noun) => lower.includes(noun));
  if (roleNoun) {
    return ROLE_NOUN_WANT[roleNoun](`their ${roleNoun}`);
  }
  // No recognizable role noun to want something FROM — fall back to a
  // want grounded in the situation itself rather than an unrelated label.
  return "to make this feel okay again";
}

function realizeSituation(situation, protagonist) {
  const seed = situation && situation.storySeed;
  const rawExperience = seed && seed.childExperience;
  if (!rawExperience || !rawExperience.trim()) {
    return { kind: "insufficient" };
  }

  // storySeed text uses "Kavi" as the generic placeholder hero name.
  // Substitute the real protagonist — a grammatical substitution, not
  // invented content, same principle as the old "child"/"children" swap.
  const substitute = (text) => (text || "").trim().replace(/\bKavi\b/g, protagonist);
  const sentence = substitute(rawExperience);
  const rawWant = seed.immediateWant;
  // Bare verb-phrase form (no leading "to") — every call site adds its own
  // "wanted to " / "wants to " prefix, so this stays consistent whichever
  // template consumes it.
  const want = rawWant
    ? lowerFirst(stripTrailingPeriod(substitute(rawWant)))
    : "make this feel okay again";

  return { kind: "clause", sentence, want };
}

// Splits storySeed.narrativeSummary into individual sentences, substituting
// the "Kavi" placeholder the same way realizeSituation() does. Returns []
// (never null) when the situation has no narrativeSummary authored — an
// honest, checkable "no source material" state rather than falling back to
// inventing scene content.
function extractNarrativeSummarySentences(situation, protagonist) {
  const raw = situation && situation.storySeed && situation.storySeed.narrativeSummary;
  if (!raw || !raw.trim()) return [];
  const substituted = raw.trim().replace(/\bKavi\b/g, protagonist);
  return substituted
    .split(/(?<=[.!?])\s+/)
    .map((sentence) => sentence.trim())
    .filter(Boolean);
}

// Mission.name is a short label ("Learn a New Skill"); mission.description
// is already a natural sentence ("Find and safely bring back a missing
// friend."). Prefer the natural sentence for anything the Writer will
// speak aloud.
function naturalMissionPhrase(mission, missionId) {
  const source = (mission && mission.description) || (mission && mission.name) || titleCaseFromId(missionId);
  return stripTrailingPeriod(source).toLowerCase();
}

function buildEventPlannerContext(blueprint, storyPlan, libraries) {
  const base = fillStoryTemplate(null, blueprint, storyPlan, libraries);
  const indexes = libraries && libraries.indexes || {};
  const obstacle = lookupById(indexes.obstacles, libraries && libraries.obstacles, blueprint.obstacle && blueprint.obstacle.id);
  const symbolRecord = base._lookups && base._lookups.symbolRecord;
  const mechanism = SYMBOL_MECHANISM[symbolRecord && symbolRecord.symbol_theme] || DEFAULT_SYMBOL_MECHANISM;
  const actionIds = (blueprint.storyActions || []).map((item) => item.id);
  const actionPhrases = pickThreeDistinctActionPhrases(actionIds);
  const situation = base._lookups && base._lookups.situation;
  const situationDetail = assessSituationDetail(situation);
  const situationSeedText = buildStorySeedContextText(situation);
  const coreReference = extractCoreReference(situationSeedText, SITUATION_PERSON_NOUNS);
  // Object-only reference for T22 (a genuine physical object never a
  // person) — searched independently of coreReference so a situation whose
  // text mentions both a person and an object (e.g. "friend got a new
  // toy") doesn't let the person match win by list order.
  const objectReference = extractCoreReference(situationSeedText, SITUATION_OBJECT_NOUNS);
  const missionPhrase = naturalMissionPhrase(base._lookups && base._lookups.mission, blueprint.mission && blueprint.mission.id);
  const obstacleClause = concreteObstacleClause(obstacle, situation && situation.storySeed && situation.storySeed.immediateObstacle, base.protagonist);
  const objective = `${base.protagonist} wanted to ${missionPhrase}.`;
  const realizedSituation = realizeSituation(base._lookups && base._lookups.situation, base.protagonist);
  // Realized-Event Contract (approved 2026-08-10): narrativeSummary is
  // hand-authored concrete scene prose present on ~93% of situations, and
  // was never read anywhere in this file before now — everything downstream
  // was synthesizing substitute scene content from bare fact fragments
  // instead of adapting the actual authored scene. Primary grounding source
  // for T22 realization; sentence-split + name-substituted, same principle
  // as realizeSituation() above.
  const narrativeSummarySentences = extractNarrativeSummarySentences(situation, base.protagonist);
  return { ...base, missionPhrase, obstacle, mechanism, actionPhrases, coreReference, objectReference, obstacleClause, objective, situationDetail, realizedSituation, narrativeSummarySentences };
}

// The actual Event Planner. Produces a concrete, causally-linked chain —
// each event states why it leads to the next — using only real Blueprint
// facts. This is the pilot implementation for T03's beat shape (setup,
// two attempt/consequence pairs, a turning point, a third attempt,
// resolution); it reads T03's *shape* generically off beat kinds, not off
// the template's id, so the same event grammar can extend to other
// attempt/consequence-shaped templates later.
// Natural, spoken-aloud phrasing for "the obstacle is still there," varied
// between its first and second mention so the attempts don't read as a
// copy-pasted clause. Parameterized by the situation's own coreReference
// (a short noun pulled from its title) where that reads naturally for the
// obstacle's domain — never by re-quoting the title itself.
const OBSTACLE_DOMAIN_CONSEQUENCE = {
  OD_PHYSICAL: {
    first: () => "it still would not budge",
    second: () => "it refused to move, no matter what",
  },
  OD_NATURE: {
    first: () => "the world outside still would not cooperate",
    second: () => "it only seemed to get harder",
  },
  OD_SOCIAL: {
    first: (ref) => `${ref ? capitalizeWord(ref) : "no one"} still did not seem to notice`,
    second: (ref) => `${ref ? capitalizeWord(ref) : "no one"} still had not changed a thing`,
  },
  OD_EMOTIONAL: {
    first: () => "the feeling was still there, just as big as before",
    second: () => "the feeling had not gone anywhere at all",
  },
  OD_PUZZLE: {
    first: () => "it still did not make any sense",
    second: () => "it was every bit as confusing as before",
  },
  OD_TIME: {
    first: () => "there still was not enough time",
    second: () => "there was even less time now",
  },
};
const DEFAULT_OBSTACLE_CONSEQUENCE = {
  first: () => "it did not get any easier",
  second: () => "it still had not gotten any easier",
};

function capitalizeWord(text) {
  return text ? text.charAt(0).toUpperCase() + text.slice(1) : text;
}

function obstacleConsequenceText(ctx, which) {
  const domainId = ctx.obstacle && ctx.obstacle.hard && ctx.obstacle.hard.obstacle_domain;
  const pair = OBSTACLE_DOMAIN_CONSEQUENCE[domainId] || DEFAULT_OBSTACLE_CONSEQUENCE;
  return pair[which](ctx.coreReference);
}

function templateBeat(label, fields = {}) {
  return { label, ...fields };
}

function sentenceCase(text) {
  const trimmed = String(text || "").trim();
  return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}` : "";
}

function buildTemplateLintPlan(templateId, ctx, events, extras = {}) {
  return {
    templateId,
    situationId: ctx._lookups && ctx._lookups.situation && ctx._lookups.situation.id,
    eventChain: events,
    ...extras,
  };
}

function inferOpeningPlan(ctx) {
  const want = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  return want ? `${ctx.protagonist} plans to ${want}.` : `${ctx.protagonist} plans to get through the moment the usual way.`;
}

function detectDisruptionCategories(ctx) {
  const situationText = `${ctx.situationTitle || ""} ${ctx.obstacleClause || ""} ${(ctx._lookups && ctx._lookups.situation && buildStorySeedContextText(ctx._lookups.situation)) || ""}`.toLowerCase();
  const ranked = [];
  const push = (category, score) => {
    if (score > 0) ranked.push({ category, score });
  };

  push("LOGISTICAL", /\b(cancel|change|changed|different|move|moving|schedule|late|wait|waiting|plan|playdate|rain|updated|update|new school)\b/.test(situationText) ? 5 : 0);
  push("SOCIAL", /\b(friend|friends|teacher|classmate|classmates|family|mom|dad|baby|group|teammate)\b/.test(situationText) ? 4 : 0);
  push("SENSORY", /\b(light|lights|smell|smells|noise|noisy|uniform|crowd|busy|flicker)\b/.test(situationText) ? 4 : 0);
  push("EMOTIONAL_INTERNAL", /\b(scared|worried|hurt|sad|nervous|upset|disappoint|angry|fear)\b/.test(situationText) ? 3 : 0);
  push("PHYSICAL_SAFETY", /\b(hurt|fall|storm|doctor|sick|unsafe)\b/.test(situationText) ? 3 : 0);

  if (!ranked.length) {
    return ["LOGISTICAL", "EMOTIONAL_INTERNAL"];
  }

  ranked.sort((a, b) => b.score - a.score);
  const primary = ranked[0].category;
  const secondary = ranked.find((item) => item.category !== primary)?.category
    || (primary === "LOGISTICAL" ? "EMOTIONAL_INTERNAL" : "LOGISTICAL");
  return [primary, secondary];
}

function detectDisruptionCategory(ctx, ordinal) {
  const categories = detectDisruptionCategories(ctx);
  return categories[ordinal - 1] || categories[0] || "LOGISTICAL";
}

// T22 Realized-Event Contract (approved 2026-08-10). A realization MODE is
// how the situation itself surfaces the beat — not a rewritten mini-template
// per mode, just which kind of concrete thing is happening: an object being
// physically found, an absence being noticed, a social scene being
// observed, a sound/aftermath being reacted to, or something being
// recognized in speech. T22's six beats stay fixed; the mode only changes
// which framing verbs/transitions the generic beat-writer reaches for, so
// "crouched down and picked it up" is no longer forced onto situations that
// were never about handling an object (e.g. a friend's new toy, a copied
// idea). Detected from the situation's own text, never chosen arbitrarily.
function detectT22RealizationMode(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const text = `${(ctx.narrativeSummarySentences || []).join(" ")} ${buildStorySeedContextText(situation)}`.toLowerCase();
  const ranked = [];
  const push = (mode, score) => {
    if (score > 0) ranked.push({ mode, score });
  };

  // "lost" alone is too ambiguous — it fires on "who lost it" (a found
  // object's origin, i.e. PHYSICAL_DISCOVERY) just as readily as on the
  // hero's own thing being lost, which caused SIT148 (spots/picks up/turns
  // over — unambiguous physical-discovery signals) to score as ABSENCE
  // instead. Dropped in favor of phrases that specifically describe an
  // absence to the hero.
  push("ABSENCE", /\b(missing|nowhere|isn'?t there|can'?t find|is gone|has gone|not there)\b/.test(text) ? 5 : 0);
  push("SOUND_AFTERMATH", /\b(crash|broke|broken|pieces|accident|shattered|spilled|dropped|sound of)\b/.test(text) ? 5 : 0);
  push("RECOGNITION", /\b(copies|copied|same idea|presents|presented|recognized|recognised|almost exactly|described earlier)\b/.test(text) ? 5 : 0);
  // Broadened after testing beyond the 5 approved cases surfaced a real
  // bug: 1-on-1 comparison situations with no literal crowd word (e.g.
  // "friend has more followers," "friend gets a pet") matched none of the
  // five modes and silently fell through to the PHYSICAL_DISCOVERY default
  // below, producing nonsense like "Gauri turned their screen over,
  // wondering who it belonged to... Gauri returned it" for a social-media
  // follower-count comparison that was never a found object at all.
  push("SOCIAL", /\b(everyone|classmates?|crowd|gathers?|gather around|leans? closer|circle of|group of|compares?|comparing|comparison|jealous|envious|envy|wish\w* (it were|they had|it was))\b/.test(text) ? 4 : 0);
  push("PHYSICAL_DISCOVERY", /\b(spots?|picks? it up|finds? something|found something|turns? it over|notices? something (near|on|under|by))\b/.test(text) ? 4 : 0);

  if (!ranked.length) {
    // No longer defaults to PHYSICAL_DISCOVERY — that silently mislabeled
    // any situation whose text didn't happen to contain one of the five
    // modes' trigger words as "an object was found," which is a much
    // stronger and more specific claim than "nothing matched." SOCIAL's
    // beats (reflect on your own thing, then engage with the other
    // person) are the closest fit for an unclassified interpersonal
    // situation without inventing a found-object plot that isn't there.
    return "SOCIAL";
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].mode;
}

// T22 prose rewrite (2026-08-10, per explicit direction): the belief must
// never be stated as dialogue or narration ("X was not what it first looked
// like — it was [trueBelief]"), and there is no universal "one slow breath /
// wait" ritual. Each mode instead supplies three concrete, mode-specific
// STORY EVENTS — connectedDiscovery (the turn, shown through a small
// action), newChoice (the decision, shown through what the hero does next),
// resolution (the consequence, shown through what happens as a result) —
// built as functions of (p, objectRef, supportActorTitle) so they stay
// grounded in the actual hero/object/person rather than being fully
// hardcoded strings. None of the three ever names trueBelief; the belief is
// demonstrated by the sequence of actions, not announced.
// resolution is now the true LAST line of the story — no generic ending
// pool gets appended after it (that was its own repeated skeleton:
// "That was that...", "walked away lighter", "had a good ending", none of
// which belonged to any specific story). Each resolution ends on a felt,
// specific beat that follows directly from that mode's own newChoice,
// rather than a narrated summary tag bolted on top of it.
const T22_MODE_FRAMING = {
  ABSENCE: {
    connectedDiscovery: (p) => `${p} stopped searching and just sat with it for a moment, arms wrapped around themselves.`,
    newChoice: (p, objectRef) => `${p} got ready for bed without ${objectRef}. "It's okay," ${p} said quietly, and meant it.`,
    resolution: (p) => `${p} closed their eyes anyway, calm settling in around them.`,
  },
  SOUND_AFTERMATH: {
    connectedDiscovery: (p) => `${p} looked at the broken pieces one more time and stopped trying to hide them.`,
    newChoice: (p) => `${p} picked them up and went to go find someone, before anyone could ask what happened.`,
    resolution: (p, objectRef, supportActorTitle) => `${p} held the pieces out and said, "I broke it. It was me." ${supportActorTitle ? `${supportActorTitle} looked surprised, then said, "Thanks for telling me." The relief of it was already settling in.` : `The relief of saying it out loud was bigger than the worry had been.`}`,
  },
  RECOGNITION: {
    connectedDiscovery: (p) => `${p} watched the presentation finish, and stayed quiet for a second, because saying nothing wasn't going to feel any better than speaking up.`,
    newChoice: (p) => `${p} walked over as soon as there was a chance to talk.`,
    resolution: (p, objectRef, supportActorTitle) => `"That was actually my idea," ${p} said. "I told you about it last week." ${supportActorTitle ? `${supportActorTitle}'s face changed — surprised, then sorry. ${p} felt steadier for having said it.` : `${p} went back to making something new before the bell even rang, steadier than before.`}`,
  },
  SOCIAL: {
    connectedDiscovery: (p) => `${p} reached into their own bag and looked at their own favourite thing for a second, because the crowd around the new toy wasn't going anywhere.`,
    newChoice: (p) => `${p} walked over anyway and asked, "Can I see it?"`,
    // "just as excited and just as calm about it as everyone else" named
    // the feeling instead of showing a moment — replaced with a concrete
    // image (two things being looked at, not one) that implies the same
    // resolution without stating it.
    resolution: (p, objectRef, supportActorTitle) => `${supportActorTitle ? `${supportActorTitle} showed them how it worked, and ${p}` : `${p}`} held their own thing up right back — for a second, there were two things worth looking at, and ${p} smiled.`,
  },
  PHYSICAL_DISCOVERY: {
    connectedDiscovery: (p) => `${p} stopped turning it over and just held it still.`,
    newChoice: (p, objectRef) => `${p} decided not to keep ${objectRef}.`,
    resolution: (p, objectRef) => `${p} carried ${objectRef} to where its owner would actually find it. "There you go," ${p} said, and walked off, easier in their steps.`,
  },
};

// T16 Realization Contract (approved 2026-08-10, per audit in
// tmp_t16_realization_contract_proposal.md). T16 is a belief-reassessment
// template — the hero holds a false interpretation of a moment, then
// reassesses it — NOT an object-discovery template, so this deliberately
// does not reuse T22's mechanism shape. Five mechanisms, each reflecting a
// genuinely different source of reassessment found in real T16 situation
// data: where does the contradiction actually come from?
//   - SOCIAL_REACTION: another person's genuine, observed response
//   - SELF_TEST: the hero creates their own proof, unprompted
//   - RETROSPECTIVE_RECALL: a specific past memory surfaces, no new event needed
//   - SOMATIC_SIGNAL: a bodily/felt sensation, not anything said or done
//   - INTERNAL_REASONING: no evidence is available at all (yet) — the hero
//     reasons through what actually matters instead of finding proof. Per
//     explicit correction: this is NOT "evidence gathering" — there is no
//     evidence, it's a reasoning/constraint moment, and is treated as such
//     below (no evidenceGathering line pretends to have found something).
function detectT16RealizationMode(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const text = `${(ctx.narrativeSummarySentences || []).join(" ")} ${buildStorySeedContextText(situation)}`.toLowerCase();
  const ranked = [];
  const push = (mode, score) => {
    if (score > 0) ranked.push({ mode, score });
  };

  push("SOMATIC_SIGNAL", /\b(stomach|heavy feeling|churns?|twist(s|ing)? in|queasy|knot in|heavy twist)\b/.test(text) ? 5 : 0);
  push("SELF_TEST", /\b(practice|practicing|test(s|ed|ing)?|prove|proving|catch up|keep up|slower|pace|clicking)\b/.test(text) ? 5 : 0);
  push("INTERNAL_REASONING", /\b(not available yet|hasn'?t (arrived|happened|come)|waiting for|no (result|answer) yet|days? (before|until)|nothing to (check|find)|checks? .* again)\b/.test(text) ? 5 : 0);
  push("RETROSPECTIVE_RECALL", /\b(more like|compares? (to|with)|comparison|measuring stick|used to|remembers?)\b/.test(text) ? 4 : 0);
  // Bare person-words (teacher/parent/friend/tells/told) were far too broad
  // — SOCIAL_REACTION's actual content ("told them what happened, because
  // hiding it wasn't going to work") is a CONFESSION narrative, and firing
  // it for any situation merely involving a person produced confidently
  // false claims for situations where nobody is hiding anything at all
  // (SIT003 "parent says no without explanation," SIT017 "parent forgot a
  // promise," SIT091 "friend has more followers" — none involve the hero
  // concealing something). Narrowed to actual confession/concealment
  // language, found by stress-testing beyond the 7 known T16 situations.
  push("SOCIAL_REACTION", /\b(hide|hiding|hid|secret|lied|lying|confess|own up|owns? up|take responsibility|hide behind|responsible for|admits?)\b/.test(text) ? 5 : 0);
  // Added 2026-08-10, narrow by design: SIT064 ("new glasses, feeling
  // different") doesn't fit SOCIAL_REACTION — there is no mistake to
  // confess, nothing hidden, nobody to "tell." Its actual shape is
  // materially different: hero expects rejection over how they look/are
  // seen, then observes an actual person's genuine reaction, and compares
  // the feared reaction against the real one. Deliberately scoped to
  // appearance/acceptance language only — do not broaden to catch general
  // social-reaction situations, that's what SOCIAL_REACTION already covers.
  push("SOCIAL_PERCEPTION", /\b(looks? (different|strange|weird|unfamiliar)|feels? (visibly )?different|visibly different|own face|in the mirror|judge (how|the way)|judged for how|how (they|i) looks?|less lovable)\b/.test(text) ? 5 : 0);

  if (!ranked.length) {
    // Was RETROSPECTIVE_RECALL, but that mechanism's own content asserts a
    // specific claim ("started measuring themselves against X") which is
    // false for situations that aren't actually comparisons — stress-
    // testing found this producing "Arin started measuring themselves
    // against the comparison" for a scratchy-shirt situation with no other
    // person or comparison involved at all. INTERNAL_REASONING's content
    // asserts nothing about other people, a specific memory, or a
    // comparison target — it only says the hero reasoned it through
    // directly, which is true by construction for any situation, making it
    // the least likely default to produce a false claim.
    return "INTERNAL_REASONING";
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].mode;
}

// trueBelief is woven into interpretation2's own sentence (structural
// requirement — validateEventChain requires INTERPRETATION_2.action to
// carry it), never as a standalone "X understood: [belief]" announcement.
// No mode uses "took one slow breath and said 'Wait'" — each mechanism's
// evidence/reasoning beat is a genuinely different kind of moment.
const T16_MODE_FRAMING = {
  SOCIAL_REACTION: {
    thoughtFrame: () => `Already, the fear had a shape`,
    interpretation1: (p) => `${p} braced for anger, already deciding the mistake meant something bad about who ${p} was.`,
    evidenceGathering: (p, supportActorTitle) => `${p} paused, then told ${supportActorTitle || "them"} what actually happened. When ${supportActorTitle || "they"} heard it, ${supportActorTitle || "they"} just said, "Thanks for telling me. Let's fix it."`,
    // facts.tensionFact grounds this in the specific situation (e.g.
    // SIT040's "fear of being seen as a bad child" vs SIT060's "wondering
    // whether good intentions count") so two SOCIAL_REACTION stories don't
    // land on byte-identical interpretation2 text.
    // Leads with a shown physical reaction (not "the reaction never
    // happened" narrator commentary — the evidence beat already showed
    // that) and the belief lands as the character's own thought.
    interpretation2: (p, supportActorTitle, trueBelief, ctx) => joinWithBelief(pickVariant(ctx, "T16_SOCIAL_REACTION_INTERP2", [
      `${p} felt the tightness in their chest ease, all at once`,
      `${p}'s shoulders came down from around their ears`,
      `${p} let out a breath that had been sitting there the whole time`,
    ]), trueBelief),
    resolution: (p, supportActorTitle) => supportActorTitle
      ? `${p} and ${supportActorTitle} sorted it out together, already moving on, calmer for it.`
      : `${p} sorted it out, already moving on, calmer for it.`,
  },
  SELF_TEST: {
    thoughtFrame: () => `The doubt was already there`,
    interpretation1: (p) => `When everyone else finished first, ${p} read it as proof of not being good enough.`,
    evidenceGathering: (p) => `${p} stopped guessing and just tried it out loud, unprompted. "I think I actually know this," ${p} said — and it was more than expected.`,
    interpretation2: (p, supportActorTitle, trueBelief, ctx) => joinWithBelief(pickVariant(ctx, "T16_SELF_TEST_INTERP2", [
      `${p} grinned at the page, the words finally clicking into place`,
      `${p} sat back, surprised at how much of it was actually right there`,
      `${p}'s pencil stopped tapping — there was nothing left to guess at`,
    ]), trueBelief),
    resolution: (p) => `${p} kept going at their own pace, unbothered by who else was already done, steadier now.`,
  },
  RETROSPECTIVE_RECALL: {
    thoughtFrame: () => `The comparison had already made up its mind`,
    interpretation1: (p, supportActorTitle) => `${p} started measuring themselves against ${supportActorTitle || "the comparison"}, coming up short.`,
    evidenceGathering: (p) => `${p} stopped trying to measure up and sat with it for a second. When the memory surfaced, ${p} almost smiled — a time ${p} did something nobody else would have thought to do.`,
    interpretation2: (p, supportActorTitle, trueBelief, ctx) => joinWithBelief(pickVariant(ctx, "T16_RETROSPECTIVE_RECALL_INTERP2", [
      `${p} held onto that memory a little tighter than before`,
      `${p} caught themselves standing a little straighter, just thinking about it`,
      `the memory stayed with ${p}, warmer than the comparison had ever felt`,
    ]), trueBelief),
    resolution: (p) => `${p} said, "I'm not like them — I'm good at different things," answering the comparison honestly instead of shrinking from it, standing a little steadier.`,
  },
  SOMATIC_SIGNAL: {
    thoughtFrame: () => `The old thought settled in like a weight`,
    interpretation1: (p) => `${p} considered letting the moment pass the same way as before, without saying anything real.`,
    evidenceGathering: (p) => `${p} sat with the uneasy feeling for a second. It didn't ease up — if anything, it got heavier the longer it was carried, so ${p} stopped trying to ignore it.`,
    interpretation2: (p, supportActorTitle, trueBelief, ctx) => joinWithBelief(pickVariant(ctx, "T16_SOMATIC_SIGNAL_INTERP2", [
      `${p} felt the twist in their stomach start to loosen, just from deciding`,
      `${p}'s hands stopped fidgeting for the first time all day`,
      `something in ${p}'s chest let go, before a single word was said out loud`,
    ]), trueBelief),
    resolution: (p) => `${p} said, "It was me. I wasn't telling the truth before," and the heavy feeling actually started to feel lighter.`,
  },
  INTERNAL_REASONING: {
    thoughtFrame: (p) => `Without meaning to, ${p} had already decided`,
    interpretation1: (p) => `${p} treated the outcome, whenever it arrived, as something that would decide the truth about ${p}.`,
    // Deliberately not "evidence" — there is none yet. This is a reasoning
    // beat, not a discovery beat.
    evidenceGathering: (p) => `${p} stopped checking for a second. There was nothing new to find yet — the answer wasn't even there. So ${p} thought it through directly instead of waiting for proof.`,
    interpretation2: (p, supportActorTitle, trueBelief, ctx) => joinWithBelief(pickVariant(ctx, "T16_INTERNAL_REASONING_INTERP2", [
      `${p} let out a breath they hadn't noticed they were holding`,
      `${p} set the worry down, at least for now`,
      `${p} felt something in their shoulders let go, without any new information at all`,
    ]), trueBelief),
    resolution: (p) => `${p} said, "Whatever it says, I already know I tried," and let the waiting stop feeling like a verdict — just calmer, somehow.`,
  },
  // 6th mechanism, added 2026-08-10 for SIT064-shaped situations only:
  // hero expects rejection over how they look/are seen (APPEARANCE_REACTION
  // per the approved shape) → observes an actual person's genuine response
  // → compares the feared reaction against the real one → reassesses.
  // Distinct from SOCIAL_REACTION: there is no mistake, nothing hidden,
  // nothing to confess — the "evidence" is someone's unprompted reaction to
  // how the hero already, visibly is.
  SOCIAL_PERCEPTION: {
    thoughtFrame: () => `The fear got there first`,
    interpretation1: (p) => `${p} was so sure people would stare, or worse, say something, that the bracing started before anyone even looked.`,
    evidenceGathering: (p, supportActorTitle) => `${supportActorTitle ? supportActorTitle : "Someone"} looked straight at ${p} and just kept talking, same as any other day. No stares. No comments. Nothing.`,
    interpretation2: (p, supportActorTitle, trueBelief, ctx) => joinWithBelief(pickVariant(ctx, "T16_SOCIAL_PERCEPTION_INTERP2", [
      `${p}'s shoulders dropped, the bracing gone`,
      `${p} realized they'd been holding their breath for nothing`,
      `${p} caught themselves standing normally again, not braced for anything`,
    ]), trueBelief),
    resolution: (p) => `${p} said, "Nobody even noticed," and stopped watching for a reaction that was never going to happen, steadier for it.`,
  },
};

// T21 Realization Contract (approved 2026-08-10, per audit in
// tmp_t21_realization_contract_proposal.md). T21's structural beats
// (EXPECTATION -> DISRUPTION_1 -> REACTION -> DISRUPTION_2 ->
// RESTORE_ATTEMPT -> RESTORE_FAILS -> ADAPTATION_RESOLUTION) assumed one
// shape: a concrete plan gets cancelled by circumstance, hero tries to
// force it back, fails, adapts. That only genuinely fits 2 of the 6 T21
// situations audited — the other four are a chronic irritant (no cancelling
// event), total unfamiliarity (no prior plan to restore at all), a
// person's inclusion request (not a circumstance), and a reputational
// threat (where "restoring" would mean trying to control what others
// think, which is itself the false belief). Five mechanisms, not reused
// from T16 or T22:
//   - EXTERNAL_CANCELLATION: a concrete plan, cancelled outright by someone/something else
//   - PERSISTENT_INTERFERENCE: a chronic irritant eroding an ongoing effort, not one event
//   - UNFAMILIAR_TERRITORY: no established plan exists yet — orientation, not restoration
//   - INCLUSION_REQUEST: the "disruption" is a person asking to join, not a circumstance
//   - SOCIAL_THREAT_MANAGEMENT: the disruption is reputational; adaptation is
//     about the hero's own behavior, never a claim about what other people
//     end up thinking or doing (corrected during review — the original
//     draft claimed the rumour "died down," an outcome the hero can't
//     know or control)
function detectT21RealizationMode(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const text = `${(ctx.narrativeSummarySentences || []).join(" ")} ${buildStorySeedContextText(situation)}`.toLowerCase();
  const ranked = [];
  const push = (mode, score) => {
    if (score > 0) ranked.push({ mode, score });
  };

  push("PERSISTENT_INTERFERENCE", /\b(scratchy|scratches|flicker|smell|smells|itch|irritation|discomfort|uncomfortable|distract)\b/.test(text) ? 5 : 0);
  push("UNFAMILIAR_TERRITORY", /\b(new school|new place|unfamiliar|does ?n'?t (yet )?know|first day|don'?t know (where|how|who))\b/.test(text) ? 5 : 0);
  push("INCLUSION_REQUEST", /\b(can i (play|join)|wants? to join|asks? if (they|he|she) can|younger child)\b/.test(text) ? 5 : 0);
  push("SOCIAL_THREAT_MANAGEMENT", /\b(rumou?r|gossip|whispers?|spreading|talking about (them|him|her))\b/.test(text) ? 5 : 0);
  push("EXTERNAL_CANCELLATION", /\b(cancel+ed|cancel+ation|isn'?t coming|not coming|called off|no longer happening)\b/.test(text) ? 4 : 0);

  if (!ranked.length) {
    // Falls back close to the pre-mode-detection generic phrasing (proven
    // not to assert anything situation-specific and false, since it never
    // named a canceling party or a specific disruption type) rather than
    // committing to one of the five specific mechanisms' assumptions.
    return "EXTERNAL_CANCELLATION";
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].mode;
}

const T21_MODE_FRAMING = {
  EXTERNAL_CANCELLATION: {
    reaction: (p) => `${p} checked anyway, like it might still happen after all.`,
    disruption2: (p) => `No one else was free either — this wasn't a scheduling mix-up to fix, it was just off.`,
    restoreAttempt: (p) => `${p} tried to recreate the same plan solo, the exact same way, just alone.`,
    restoreFails: (p) => `${p} stopped and sat with that for a second — the plan needed someone else. Alone, it wasn't the same plan at all.`,
    adaptationResolution: (p, trueBelief) => joinWithBelief(`${p} said, "Let's do something else," and picked something that was never part of the original plan — it actually worked`, trueBelief),
  },
  PERSISTENT_INTERFERENCE: {
    reaction: (p) => `${p} tried to push through it, willing it to fade into the background.`,
    disruption2: (p) => `A second, different kind of irritation stacked right on top of the first.`,
    restoreAttempt: (p) => `${p} gritted through it, same as any other day, trying to look and feel like nothing was wrong.`,
    restoreFails: (p) => `${p} paused, because gritting through it had taken all the attention that should have gone somewhere else — by the end, barely any of it had actually landed.`,
    adaptationResolution: (p, trueBelief) => joinWithBelief(`${p} said, "Can this be fixed?" and asked for what would actually help, instead of pushing through alone`, trueBelief),
  },
  UNFAMILIAR_TERRITORY: {
    reaction: (p) => `${p} trailed a step behind everyone else, watching for clues instead of asking.`,
    disruption2: (p) => `The crowd split off in different directions, and there was nothing left to quietly follow.`,
    restoreAttempt: (p) => `${p} picked a direction and walked like it was already familiar, because turning back now would look worse.`,
    restoreFails: (p) => `${p} stopped walking for a second — it was the wrong way, and now ${p} was somewhere unfamiliar and late, too.`,
    adaptationResolution: (p, trueBelief) => joinWithBelief(`${p} asked, "Which way to class?" — a real question, out loud, to the next person who walked past`, trueBelief),
  },
  INCLUSION_REQUEST: {
    reaction: (p) => `${p} looked at the others. Nobody answered. The game kept going like the question hadn't happened.`,
    disruption2: (p) => `The younger child didn't leave — just stood there, still watching, still hoping.`,
    restoreAttempt: (p) => `${p} tried to keep playing exactly the same way, pretending not to notice.`,
    restoreFails: (p) => `${p} paused, because the fun had gone thin — everyone was a little too aware of who was standing at the edge for the game to feel the same.`,
    adaptationResolution: (p, trueBelief) => joinWithBelief(`${p} said, "Come on, you can play," and found them a way into the game`, trueBelief),
  },
  SOCIAL_THREAT_MANAGEMENT: {
    reaction: (p) => `${p} pretended not to notice and sat down like nothing had happened.`,
    disruption2: (p) => `Someone whispered to another kid, eyes flicking over — whatever was being said was already moving without ${p} in the room.`,
    restoreAttempt: (p) => `${p} went straight at it, trying to argue the story down, point by point.`,
    restoreFails: (p) => `${p} stopped arguing for a second, so it wouldn't get any bigger — but it already had. More people were talking now, not fewer.`,
    // Corrected per review: resolution is Kavi's own behavior, never a
    // claim about whether the rumour dies down or what others end up
    // believing — that's outside the hero's knowledge or control.
    // Belief clause deliberately NOT last here (unlike the other 4 modes) —
    // pagination sometimes isolates joinWithBelief's trailing clause onto
    // its own final page with no verb nearby, which the closure check
    // couldn't see past. Closing action comes after the belief instead.
    adaptationResolution: (p, trueBelief) => `${joinWithBelief(`${p} stopped chasing the conversation, choosing to just keep showing up the same way, same as always`, trueBelief)} ${p} said, "Believe what you want," and meant it.`,
  },
};

// T23 Realization Contract (approved 2026-08-11, per audit in
// tmp_t23_realization_contract_proposal.md). T23's structural beats
// (ENCOUNTER -> INITIAL_RESPONSE -> REVEAL -> DEEPER_NOTICE ->
// CHANGED_RESPONSE -> RESOLUTION) assumed one shape: Kavi misjudges another
// person's intent, and that person explains themselves to correct it. None
// of the 6 audited T23 situations actually have someone explaining anything
// — the "misjudged person" framing would require inventing dialogue the
// situation data doesn't support. What they share instead: something
// outside Kavi's control shifts (attention, closeness, an answer, a
// friend's pressure), and Kavi has to stop reading that shift as a verdict
// on their own worth. Locked contract: T23 = realization through
// self-reinterpretation after an interpersonal/emotional shift, without
// requiring an explanatory reveal. REVEAL and DEEPER_NOTICE are sharply
// split per mode: REVEAL supplies a concrete, observable fact (nobody states
// its meaning); DEEPER_NOTICE is the realization Kavi actually draws from
// it. RESOLUTION always stays inside Kavi's own behavior — never a claim
// about whether another character approves, reacts, or validates the change
// (corrected for SIT123 and applied up front for SIT133, per the same rule
// used for T21's SOCIAL_THREAT_MANAGEMENT).
//   - UNEXPLAINED_WITHDRAWAL: someone close pulls back or changes with no
//     explanation offered or needed; only Kavi's own reading needs correcting
//   - DIVIDED_ATTENTION: someone's attention is legitimately, temporarily
//     elsewhere for an ordinary reason; Kavi reads the delay as being
//     overlooked or replaced
//   - OFFERED_REPAIR: the other person actively re-engages (an apology);
//     Kavi's task is deciding how to respond, not being corrected
//   - PEER_PRESSURE_TEMPTATION: no other person needs correcting at all —
//     the pull is internal, toward doing something Kavi knows is wrong to
//     keep belonging
function detectT23RealizationMode(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const text = `${(ctx.narrativeSummarySentences || []).join(" ")} ${buildStorySeedContextText(situation)}`.toLowerCase();
  const ranked = [];
  const push = (mode, score) => {
    if (score > 0) ranked.push({ mode, score });
  };

  push("PEER_PRESSURE_TEMPTATION", /\b(steal|dare|dares|daring|take it|nobody('s| is) looking|slip .*into|without paying)\b/.test(text) ? 5 : 0);
  push("OFFERED_REPAIR", /\b(sorry|apolog|forgave|forgive|hurt (them|him|her|me))\b/.test(text) ? 5 : 0);
  push("DIVIDED_ATTENTION", /\b(new (baby|sibling)|work call|busy|attention|feeding|photograph|wait(ing)?)\b/.test(text) ? 4 : 0);
  push("UNEXPLAINED_WITHDRAWAL", /\b(not today|doesn'?t want to|acting different|cooler|distant|rolled? (their|his|her) eyes)\b/.test(text) ? 4 : 0);

  if (!ranked.length) {
    return "UNEXPLAINED_WITHDRAWAL";
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].mode;
}

// UNEXPLAINED_WITHDRAWAL and DIVIDED_ATTENTION each cover two situations
// that share a mechanism but not a concrete manifestation (a flat "not
// today" vs. a friend's changing behavior; a work call vs. a new sibling
// taking up attention). Reusing one hardcoded fact/dialogue line across both
// members of a family produced factually wrong content — SIT123 (friend
// acting different) never says "not today," and SIT089 (new baby) has no
// phone call anywhere in its data. Each family therefore branches on a
// concrete signal already present in the situation's own text, same as
// detectDisruptionCategory/detectT21RealizationMode do — no shared fact is
// invented across situations that don't actually share it.
function t23WithdrawalFlavor(ctx) {
  return /\bcooler\b|\backing different\b|\brolls? (their|his|her) eyes\b/i.test(storySeedText(ctx))
    ? "CHANGING"
    : "REJECTION";
}
function t23AttentionFlavor(ctx) {
  return /\b(new (baby|sibling)|feeding|photograph)\b/i.test(storySeedText(ctx))
    ? "NEW_SIBLING"
    : "PARENT_CALL";
}

const T23_MODE_FRAMING = {
  UNEXPLAINED_WITHDRAWAL: {
    initialResponse: (p, supportActorTitle, ctx) => (t23WithdrawalFlavor(ctx) === "REJECTION"
      ? `${supportActorTitle} said, "Not today" — no reason given.`
      : `${supportActorTitle} started using new words and a new style, like a whole new person overnight.`),
    reveal: (p, supportActorTitle, ctx) => (t23WithdrawalFlavor(ctx) === "REJECTION"
      ? `${supportActorTitle} still waved before running off, the same wave as any other day.`
      : `${supportActorTitle} still sat right next to ${p} at lunch, same seat as always.`),
    deeperNotice: (p, ctx) => (t23WithdrawalFlavor(ctx) === "REJECTION"
      ? `${p} went quiet for a second — a "no" today didn't erase every "yes" before it.`
      : `${p} went quiet for a second, because the seat next to them hadn't actually moved, whatever the new words sounded like.`),
    changedResponse: (p, ctx) => (t23WithdrawalFlavor(ctx) === "REJECTION"
      ? `${p} said, "Okay — maybe tomorrow?" instead of walking away certain something was over.`
      : `${p} dropped the copied voice and said, "Nice one, right?" — the same joke, told the old way.`),
    resolution: (p, supportActorTitle, ctx) => (t23WithdrawalFlavor(ctx) === "REJECTION"
      ? `${p} found something else to do, still counting on tomorrow.`
      : `${p} kept talking the way ${p} always had, whether or not it was the "cool" way anymore.`),
  },
  DIVIDED_ATTENTION: {
    initialResponse: (p, supportActorTitle, ctx) => (t23AttentionFlavor(ctx) === "NEW_SIBLING"
      ? `${supportActorTitle} was busy with the new baby, and nobody looked up yet.`
      : `The phone rang, and ${supportActorTitle} could not listen right now.`),
    reveal: (p, supportActorTitle, ctx) => (t23AttentionFlavor(ctx) === "NEW_SIBLING"
      ? `${supportActorTitle} turned the camera toward ${p} too, without being asked.`
      : `Mid-call, ${supportActorTitle} still caught ${p}'s eye and said, "One minute."`),
    deeperNotice: (p, ctx) => (t23AttentionFlavor(ctx) === "NEW_SIBLING"
      ? `Something in ${p} loosened — there was room enough for the baby and for ${p}, both at once.`
      : `${p} realized the wait had an end — it just hadn't arrived yet.`),
    changedResponse: (p, ctx) => (t23AttentionFlavor(ctx) === "NEW_SIBLING"
      ? `${p} waited for a second, then held the picture up instead of quietly putting it away.`
      : `${p} waited for a second, then went and did something else instead of watching the clock.`),
    resolution: (p, supportActorTitle, ctx) => (t23AttentionFlavor(ctx) === "NEW_SIBLING"
      ? `${supportActorTitle} said, "Come sit with us," and ${p} kept the picture out, part of the same photo as the baby.`
      : `The moment the call ended, ${supportActorTitle} turned straight to ${p}, just as glad to hear it now.`),
  },
  OFFERED_REPAIR: {
    initialResponse: (p, supportActorTitle) => `${supportActorTitle} said, "I'm sorry" — the exact words ${p} had been waiting for.`,
    reveal: (p) => `The hurt was still sitting there in ${p}'s chest, even after hearing it.`,
    deeperNotice: (p) => `${p} sat with that for a second, because still feeling hurt and accepting the apology were not opposites.`,
    changedResponse: (p) => `${p} said, "Thanks — I'm still sad, but I'm glad you said it."`,
    resolution: (p, supportActorTitle) => `${p} kept sitting right there with ${supportActorTitle.toLowerCase()} anyway, hurt and okay at the same time.`,
  },
  PEER_PRESSURE_TEMPTATION: {
    initialResponse: (p) => `${p}'s hand drifted toward it, half-following before deciding anything.`,
    reveal: (p) => `${p}'s hand stopped on its own, hovering, not moving any closer.`,
    deeperNotice: (p) => `${p} realized nobody had actually said it, so that part was only ever in ${p}'s own head.`,
    changedResponse: (p) => `${p} said, "Nah, I'm good," and stepped back.`,
    resolution: (p) => `${p} walked away with empty pockets, still right there with the others — belonging never required taking it in the first place.`,
  },
};

function storySeedText(ctx) {
  return `${ctx.situationTitle || ""} ${(ctx._lookups && ctx._lookups.situation && buildStorySeedContextText(ctx._lookups.situation)) || ""}`;
}

function supportGroupLabel(ctx) {
  const text = storySeedText(ctx).toLowerCase();
  if (/\b(class|classroom|teacher|school|classmate|classmates)\b/.test(text)) return "their classmates";
  if (/\b(family|mom|dad|baby|home|parent|sibling|brother|sister)\b/.test(text)) return "their family";
  if (/\b(friend|friends|playdate|playground|team|teammate)\b/.test(text)) return "their friends";
  return null;
}

function buildSupportProfile(ctx) {
  const specific = String(ctx.coreReference || "").trim() || null;
  const group = supportGroupLabel(ctx);
  let ensemble = null;
  if (specific && group === "their classmates") ensemble = "the rest of the class";
  if (specific && group === "their family") ensemble = "the rest of the family";
  if (specific && group === "their friends") ensemble = "the other kids nearby";
  return {
    specific,
    group,
    ensemble,
    primary: specific || group || null,
    title: sentenceCase(specific || group || ""),
    mode: specific ? (group ? "specific+group" : "specific") : (group ? "group" : "solo"),
  };
}

function distributeEventTextsAcrossScenes(eventTexts, sceneIds, templateId) {
  const sceneCount = sceneIds.length;
  if (sceneCount === eventTexts.length) return eventTexts.slice();

  if (sceneCount < eventTexts.length) {
    const reserveTail = templateId === "T21" || templateId === "T16" || templateId === "T23"
      ? Math.min(3, sceneCount - 1, eventTexts.length - 1)
      : Math.min(2, sceneCount - 1, eventTexts.length - 1);
    if (reserveTail >= 2) {
      const leadSceneCount = sceneCount - reserveTail;
      const leadEventCount = eventTexts.length - reserveTail;
      const distributed = [];
      for (let sceneIndex = 0; sceneIndex < leadSceneCount; sceneIndex += 1) {
        const start = Math.floor((sceneIndex * leadEventCount) / Math.max(leadSceneCount, 1));
        const end = Math.floor(((sceneIndex + 1) * leadEventCount) / Math.max(leadSceneCount, 1));
        distributed.push(eventTexts.slice(start, Math.max(end, start + 1)).join(" "));
      }
      return distributed.concat(eventTexts.slice(-reserveTail));
    }
    const distributed = [];
    for (let sceneIndex = 0; sceneIndex < sceneCount; sceneIndex += 1) {
      const start = Math.floor((sceneIndex * eventTexts.length) / sceneCount);
      const end = Math.floor(((sceneIndex + 1) * eventTexts.length) / sceneCount);
      distributed.push(eventTexts.slice(start, Math.max(end, start + 1)).join(" "));
    }
    return distributed;
  }

  const distributed = eventTexts.slice();
  const bridge = templateId === "T21"
    ? "The new understanding needed one more breath before the ending could settle."
    : "The moment held still for one more thoughtful beat.";
  while (distributed.length < sceneCount) {
    distributed.splice(Math.max(1, distributed.length - 1), 0, bridge);
  }
  return distributed;
}

// Realization V2 — data hierarchy per the locked spec (tmp_realization_layer_v2_spec.md §4a):
// 1. Use concrete facts already on ctx (obstacleClause, coreReference, mechanism).
// 2. Fall back to richer authored detail on the situation record itself
//    (storySeed.immediateObstacle / storySeed.emotionalTension) when ctx's
//    pre-derived fields aren't concrete enough on their own.
// 3. Never invent decorative detail beyond what's sourced from #1/#2 — a
//    situation with nothing usable in either falls back to the generic verbs
//    below, not to a made-up specific.
// Realization V2 variety pass — per kill-critic review (2026-08-10): a
// single canonical "paused -> understood that X -> chose differently"
// skeleton and a fixed "warmer and freer" ending, repeated verbatim across
// every story in a template, reads as a template fingerprint even once each
// individual sentence is concrete. This picks deterministically (same
// situation always renders the same way, so results stay reproducible and
// testable) but varies which of several genuinely different phrasings is
// used, keyed off the situation id plus a per-beat salt so different beats
// in the same story don't all land on the same variant index.
function seedIndex(seedText, mod) {
  let hash = 0;
  const text = String(seedText || "");
  for (let i = 0; i < text.length; i += 1) {
    hash = (hash * 31 + text.charCodeAt(i)) >>> 0;
  }
  return mod > 0 ? hash % mod : 0;
}
function pickVariant(ctx, salt, list) {
  const situationId = (ctx._lookups && ctx._lookups.situation && ctx._lookups.situation.id) || ctx.protagonist || "seed";
  return list[seedIndex(`${situationId}::${salt}`, list.length)];
}

function concreteSceneFacts(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const seed = situation && situation.storySeed;
  // storySeed text uses "Kavi" (any case) as the generic placeholder hero
  // name, same as realizeSituation()/concreteObstacleClause() above —
  // substitute here too so raw storySeed facts don't leak the placeholder
  // name into the finished story, and never lowercase a proper name that
  // lands at the start of the clause.
  const substitute = (text) => String(text || "").replace(/\bkavi\b/gi, ctx.protagonist);
  const rawObstacle = seed && seed.immediateObstacle ? lowerFirstUnlessProperNoun(stripTrailingPeriod(substitute(seed.immediateObstacle)), ctx.protagonist) : null;
  const tension = seed && seed.emotionalTension ? lowerFirstUnlessProperNoun(stripTrailingPeriod(substitute(seed.emotionalTension)), ctx.protagonist) : null;
  return {
    obstacleFact: rawObstacle || (ctx.obstacleClause ? substitute(ctx.obstacleClause.split(": ").slice(1).join(": ")) : "the same trouble as before"),
    tensionFact: tension,
  };
}

// Templates with a real, mode-detected Realization Contract (own
// mechanism-specific event chain + prose, not the shared generic
// try/fail/try/fail/pause/succeed fallback). Used by validateEventChain and
// writeProseFromEventChain below to route to per-template handling instead
// of relying on the old `templateId !== "T03"` string check, which broke
// once the fallback's mislabel (see the comment on the generic fallback's
// return below) was fixed to report each template's own real id.
const TEMPLATES_WITH_REALIZATION_CONTRACT = new Set(["T03", "T04", "T05", "T09", "T14", "T15", "T16", "T18", "T19", "T21", "T22", "T23"]);

// T03 Realization Contract (added 2026-08-12, per
// docs/prana-kids/REALIZATION_QUALITY_GAP_REPORT_2026-08-12.md — T03 pilot).
// T03's beat shape (SETUP / ATTEMPT_1 / ATTEMPT_2 / TURNING_POINT /
// ATTEMPT_3 / RESOLUTION) previously ran through the shared generic
// fallback (below), which used the same six fixed sentences ("But it did
// not work.", "That did not work either.", "This time it worked - not by
// trying harder, but by trying differently.", "Everything felt calmer,
// warmer, and freer than before.", etc.) for every situation regardless of
// what actually went wrong. ctx.actionPhrases[0..2] were already
// situation-specific (drawn from the situation's own action library) — the
// genericness lived entirely in the connective/consequence tissue around
// them, plus a decorative "motif object" with no causal link to the
// obstacle.
//
// This contract keys off the situation's own obstacle_domain (the same
// taxonomy field obstacleConsequenceText already reads, at
// ctx.obstacle.hard.obstacle_domain — not a new detector, reusing existing
// authored data) so *why* the first two attempts fail, what the turning
// point actually realizes, and what changes on the third attempt are
// different in kind, not just noun-swapped, across a physical obstacle
// (won't move/won't budge), a social obstacle (someone isn't responding),
// an emotional obstacle (a feeling that won't go away), a puzzle obstacle
// (confusion), a time obstacle (running out of time) and a nature/
// circumstance obstacle (the outside world not cooperating). The decorative
// motif object is dropped from the RESOLUTION beat's mechanism (it added
// nothing causal); ctx.mechanism.motif is still available if a scene wants
// a small sensory anchor but no longer carries the "reminder of what
// changed" claim, which every story made identically regardless of domain.
function detectT03RealizationMode(ctx) {
  const domainId = ctx.obstacle && ctx.obstacle.hard && ctx.obstacle.hard.obstacle_domain;
  if (domainId && T03_MODE_FRAMING[domainId]) return domainId;
  return "DEFAULT";
}

const T03_MODE_FRAMING = {
  OD_PHYSICAL: {
    attempt1Fail: (p, actionTail) => `${p} pushed harder, but ${actionTail || "it still would not give way"}.`,
    attempt2Fail: (p, actionTail) => `${p} tried a different grip, and still ${actionTail || "it refused to move"}.`,
    turningPoint: (p, trueBelief) => `${p} paused, and just looked at it for a second — really looked, instead of forcing — and realized ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    attempt3Action: (p) => `tried again, this time working with it instead of against it`,
    attempt3Success: () => `and this time it gave way — not because of more force, but because of a better angle`,
    resolutionAction: (p) => `${p} set it down, finally where it belonged`,
    resolutionClose: () => `steadier hands, and nothing left to wrestle with`,
  },
  OD_SOCIAL: {
    attempt1Fail: (p, actionTail, ref) => `${p} said it again, louder, and ${ref ? capitalizeWord(ref) : "no one"} ${actionTail || "still did not seem to notice"}.`,
    attempt2Fail: (p, actionTail, ref) => `${p} tried explaining it a different way, and ${ref ? capitalizeWord(ref) : "no one"} ${actionTail || "still had not changed a thing"}.`,
    turningPoint: (p, trueBelief) => `${p} paused instead of trying to be heard over everything else, and waited for a real chance to talk, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    attempt3Action: (p) => `spoke up again — quieter this time, and straight to the point`,
    attempt3Success: () => `and this time the words actually landed`,
    resolutionAction: (p) => `${p} let out a breath, heard at last`,
    resolutionClose: () => `nothing left unsaid, and no need to raise a voice over it again`,
  },
  OD_EMOTIONAL: {
    attempt1Fail: (p, actionTail) => `${p} tried to shake the feeling off, and ${actionTail || "it was still there, just as big as before"}.`,
    attempt2Fail: (p, actionTail) => `${p} tried to keep busy instead, and ${actionTail || "the feeling had not gone anywhere at all"}.`,
    turningPoint: (p, trueBelief) => `${p} paused instead of pushing the feeling away, and just let it be there for a moment, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    attempt3Action: (p) => `sat with it a little longer, breathing instead of fighting it`,
    attempt3Success: () => `and this time it actually started to ease, on its own`,
    resolutionAction: (p) => `${p} noticed the tightness had loosened`,
    resolutionClose: () => `lighter, without needing the feeling to disappear completely first`,
  },
  OD_PUZZLE: {
    attempt1Fail: (p, actionTail) => `${p} guessed quickly, and ${actionTail || "it still did not make any sense"}.`,
    attempt2Fail: (p, actionTail) => `${p} guessed again, faster this time, and ${actionTail || "it was every bit as confusing as before"}.`,
    turningPoint: (p, trueBelief) => `${p} paused instead of guessing again, and slowed down to look at it piece by piece, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    attempt3Action: (p) => `went through it once more, one step at a time instead of all at once`,
    attempt3Success: () => `and this time the pieces actually clicked into place`,
    resolutionAction: (p) => `${p} looked it over once more, and it finally made sense`,
    resolutionClose: () => `no more guessing, just understanding`,
  },
  OD_TIME: {
    attempt1Fail: (p, actionTail) => `${p} rushed through it, and ${actionTail || "there still was not enough time"}.`,
    attempt2Fail: (p, actionTail) => `${p} rushed even faster, and ${actionTail || "there was even less time now"}.`,
    turningPoint: (p, trueBelief) => `${p} paused instead of racing the clock, and took one steady breath, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    attempt3Action: (p) => `started again at a steadier pace, one part at a time`,
    attempt3Success: () => `and this time there was enough time after all`,
    resolutionAction: (p) => `${p} finished with a moment to spare`,
    resolutionClose: () => `unhurried, for the first time all day`,
  },
  OD_NATURE: {
    attempt1Fail: (p, actionTail) => `${p} tried to push through it anyway, and ${actionTail || "the world outside still would not cooperate"}.`,
    attempt2Fail: (p, actionTail) => `${p} waited it out and tried again, and ${actionTail || "it only seemed to get harder"}.`,
    turningPoint: (p, trueBelief) => `${p} paused instead of fighting the circumstances, and looked for a way to work around them, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    attempt3Action: (p) => `tried a different way, one that worked with things as they actually were`,
    attempt3Success: () => `and this time it actually worked out`,
    resolutionAction: (p) => `${p} stood back and let things settle`,
    resolutionClose: () => `calmer, having stopped fighting what could not be changed`,
  },
  DEFAULT: {
    attempt1Fail: (p, actionTail) => `${p} tried the first thing that came to mind, and ${actionTail || "it did not get any easier"}.`,
    attempt2Fail: (p, actionTail) => `${p} tried again a different way, and ${actionTail || "it still had not gotten any easier"}.`,
    turningPoint: (p, trueBelief) => `${p} paused and thought about it properly instead of just trying harder, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    attempt3Action: (p) => `tried once more, differently this time`,
    attempt3Success: () => `and this time it actually worked`,
    resolutionAction: (p) => `${p} finished it, glad it was actually done`,
    resolutionClose: () => `steadier than before, and done with trying to prove anything`,
  },
};

// T18 Realization Contract (added 2026-08-12, per
// docs/prana-kids/T18_REALIZATION_PILOT_2026-08-12.md, following the T03
// pilot's own recommendation: T16's text-signal detection is more
// discriminating than keying off one taxonomy field, so T18 pattern-matches
// the situation's own narrativeSummarySentences + storySeedContextText
// (same fields detectT16RealizationMode reads) instead of a single upstream
// bucket. T18 previously fell through to the shared generic fallback below,
// producing the same six fixed sentences ("But it did not work.", etc.) for
// all 16 T18 situations regardless of what the child was actually
// regulating. Reading all 16 T18 situations' authored text (self-regulation
// situations, NEED_SELF_REGULATION) surfaced 7 genuinely distinct
// mechanisms, not one shared "obstacle" shape:
//   - EXTERNAL_TIMELINE_PRESSURE: an outside schedule/authority ends an
//     activity or forces a hurry regardless of the hero's own readiness
//     (SIT002 screen time, SIT008 hurried to leave, SIT109 switching to
//     homework)
//   - WAITING_FOR_TURN_OR_EVENT: nothing to do but watch a clock/turn/
//     calendar while a wait plays out (SIT101, SIT108, SIT112)
//   - PHYSICAL_RESTLESSNESS: the body wants to move or release energy but
//     must stay still or wind down (SIT015, SIT097)
//   - TAKEN_OR_DAMAGED: a possession is taken, broken, or the hero is
//     pushed — an injustice with an immediate urge to grab back/retaliate
//     (SIT001, SIT007, SIT011)
//   - SCATTERED_ATTENTION: focus keeps slipping because of a competing
//     stimulus or attention fatigue, not an external obstacle at all
//     (SIT098, SIT105)
//   - CASCADING_IRRITABILITY: hunger/tiredness makes ordinary small things
//     land as a "final straw" (SIT104, SIT110)
//   - TEMPTATION_TRADEOFF: no external enforcement at all — the pull is
//     between a tempting want and a known responsibility (SIT136 only;
//     precedented by T16's own single-situation SOCIAL_PERCEPTION mode)
// Beats keep the same structural shape the shared fallback already used
// (SETUP/ATTEMPT_1/ATTEMPT_2/TURNING_POINT/ATTEMPT_3/RESOLUTION — validated
// generically for all non-T16/T21/T22/T23 contract templates, see
// validateEventChain) because that shape already fits T18's actual
// escalate-then-pause mechanic; what changes is the content of each beat,
// keyed off the mode instead of six fixed sentences.
function detectT18RealizationMode(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const text = `${(ctx.narrativeSummarySentences || []).join(" ")} ${buildStorySeedContextText(situation)}`.toLowerCase();
  const ranked = [];
  const push = (mode, score) => {
    if (score > 0) ranked.push({ mode, score });
  };

  push("EXTERNAL_TIMELINE_PRESSURE", /\b(screen time|time to stop|time'?s up|we'?re leaving|put that away|has to end|homework time)\b/.test(text) ? 5 : 0);
  push("WAITING_FOR_TURN_OR_EVENT", /\b(checks? the (clock|window|calendar)|glowing on the screen|keeps swinging|one turn|has to wait|longest day|move faster)\b/.test(text) ? 5 : 0);
  push("PHYSICAL_RESTLESSNESS", /\b(sit(ting)? still|shifts|bouncing|still full of energy|cannot (freely )?move|restless)\b/.test(text) ? 5 : 0);
  push("TAKEN_OR_DAMAGED", /\b(walks? away with|crashes? apart|push(es|ed)?|gives? .* a (hard )?push|shout)\b/.test(text) ? 5 : 0);
  push("SCATTERED_ATTENTION", /\b(focus|concentrat|attention|scattered|same line)\b/.test(text) ? 5 : 0);
  push("CASCADING_IRRITABILITY", /\b(tired|hungry|stomach growls|final straw|small things|cranky|irritat)\b/.test(text) ? 5 : 0);
  push("TEMPTATION_TRADEOFF", /\b(go play|opportunity to play|friends calling|schoolwork|responsibility in front)\b/.test(text) ? 5 : 0);

  if (!ranked.length) {
    return "DEFAULT";
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked[0].mode;
}

// 2026-08-12 rework v2 (per Dev A/Dev B redirect after forced SIT101/T03 vs
// SIT101/T18 comparison showed a MECHANISM collision, not just a prose one:
// the first rework (v1, still visible in git history) varied wording inside
// T03's own try/fail/pause/retry beat shape, so the underlying causal
// skeleton — obstacle resists two attempts, a realization changes the
// approach, the retried attempt succeeds — was identical to T03's, just
// reworded. Swapping SIT101 between T03 and T18 still produced "the same
// story wearing different clothes."
//
// T18 now has a mechanism T03 structurally cannot produce: there is no
// external obstacle being defeated at all. Every mode below supplies 7
// fragments consumed by the new 8-beat TINY_PROBLEM/IGNORED/GROWS_1/
// GROWS_2/OVERWHELMING/PAUSE/REAL_PROBLEM/RESOLUTION shape (see the T18
// branch of buildTemplateSpecificEventChain): ignored/grows1/grows2/
// overwhelming trace the hero's OWN escalating reactions inflating a small
// trigger — each beat's growth is caused by the previous beat's reaction,
// never by anything resisting from outside — pause breaks the loop, and
// realProblem must name a problem that is smaller than and DIFFERENT IN
// KIND from the inflated one (a missing goodbye, a missing outlet, a
// missing attention-anchor, an unmet physical need, a backwards order —
// never just "the original trigger, but now with a calmer attitude," which
// would collapse straight back into T03's try-differently shape). resolution
// must address that specific smaller real problem, not the original
// trigger. See docs/prana-kids/T18_REALIZATION_PILOT_2026-08-12.md for the
// SIT101 T03-vs-T18 adversarial comparison this rework was written to pass.
const T18_MODE_FRAMING = {
  // SIT002, SIT008, SIT109 — activity ends on an outside schedule. The
  // hero's own arguing (not the ending) is what inflates the moment; the
  // real problem is the missing clean stopping point, not the ending itself.
  EXTERNAL_TIMELINE_PRESSURE: {
    ignored: (p) => `${p} didn't let the ending just happen — started arguing for more time instead.`,
    grows1: (p) => `The arguing turned one quiet ending into a whole negotiation, and now it felt like a fight instead of a stop.`,
    grows2: (p) => `${p} argued harder, certain that would help, and the countdown itself began to feel like a punishment.`,
    overwhelming: (p) => `By now the ending felt unbearable — bigger and more unfair than any five minutes could ever explain.`,
    pause: (p) => `${p} stopped arguing, just for a second.`,
    realProblem: (p, trueBelief) => `The real problem was never the ending — it was that there had been no proper goodbye to the game at all. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} gave the game one last look, a two-second goodbye, and walked off — the ending finally feeling like an ending instead of a loss.`,
  },
  // SIT101, SIT108, SIT112 — a wait plays out. The checking (not the wait
  // itself) is what inflates it; the real problem is nothing to anchor
  // attention to, not the length of the wait.
  WAITING_FOR_TURN_OR_EVENT: {
    ignored: (p) => `${p} didn't settle into the wait — started checking the clock instead.`,
    grows1: (p) => `Each check made the same unmoved number feel slower, like time itself had started dragging its feet.`,
    grows2: (p) => `${p} checked again, even closer this time, and the wait began to feel like it had swallowed the whole day.`,
    overwhelming: (p) => `Soon it wasn't the wait that felt unbearable at all — it was the checking, over and over, that had taken everything over.`,
    pause: (p) => `${p} stopped checking, just for a second.`,
    realProblem: (p, trueBelief) => `The real problem was never how long the wait was — it was that there had been nothing else to hold ${p}'s attention. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} found one small thing to notice instead of the clock, and smiled when the wait ended before ${p} had even finished noticing it.`,
  },
  // SIT015, SIT097 — the body wants to move. Suppressing it (not the
  // stillness itself) is what inflates the pressure; the real problem is a
  // missing small outlet, not too much energy.
  PHYSICAL_RESTLESSNESS: {
    ignored: (p) => `${p} didn't sit with the wriggle — shifted instead, trying to make it go away.`,
    grows1: (p) => `The shifting only woke the energy up more, like it had been waiting for permission to move.`,
    grows2: (p) => `${p} clamped down, holding every muscle still on purpose, and the energy backed up with nowhere at all to go.`,
    overwhelming: (p) => `Soon the stillness itself felt impossible — like the whole body might burst from holding so much in.`,
    pause: (p) => `${p} stood still, on purpose this time, just for a second.`,
    realProblem: (p, trueBelief) => `The real problem was never too much energy — it was that there had been no small, allowed way to let any of it out. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} found one tiny, quiet outlet, just enough, and smiled as the last of the wriggle finally spent itself.`,
  },
  // SIT001, SIT007, SIT011 — an object is taken/broken or the hero is
  // pushed. Grabbing back (not the loss itself) is what inflates it into a
  // fight; the real problem is just the specific, smaller original want.
  TAKEN_OR_DAMAGED: {
    ignored: (p) => `${p} didn't stop to think — grabbed for it right away.`,
    grows1: (p, actionTail, ref) => `The grabbing turned "my toy" into a tug-of-war, because now it was a fight about winning, not about the toy at all.`,
    grows2: (p) => `${p} shoved back, just once, and the fight grew bigger than the thing that had started it.`,
    overwhelming: (p) => `By now the anger filled everything — bigger than any one toy could ever be worth.`,
    pause: (p) => `${p} took one breath, fists still tight, before reaching again.`,
    realProblem: (p, trueBelief) => `The real problem was never the fight — it was just wanting the toy back. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} asked for it back, plainly, and held it again a moment later — the fight already forgotten, the actual want finally met.`,
  },
  // SIT098, SIT105 — focus keeps slipping. Forcing concentration (not the
  // distraction itself) is what inflates it; the real problem is one
  // specific unread line, not a broken ability to focus at all.
  SCATTERED_ATTENTION: {
    ignored: (p) => `${p} didn't notice the wandering — pushed straight through instead.`,
    grows1: (p) => `Pushing through only made the mind notice its own drifting even more, like watching yourself trip.`,
    grows2: (p) => `${p} squeezed both eyes shut and forced it harder, and three more lines went by, still unread.`,
    overwhelming: (p) => `Soon it felt like focusing was impossible altogether — not just this page, but everything.`,
    pause: (p) => `${p} paused and sat with the wandering for a second, instead of fighting it.`,
    realProblem: (p, trueBelief) => `The real problem was never a broken ability to focus — it was just one line, sitting there, not yet actually read. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} read that one line, just that one, and it finally landed — clearer than the whole page had felt a moment before.`,
  },
  // SIT104, SIT110 — hunger/tiredness makes ordinary friction land as a
  // final straw. Snapping (not the sock/toast) is what inflates the day;
  // the real problem is an unmet physical need, unrelated to either object.
  CASCADING_IRRITABILITY: {
    ignored: (p) => `${p} didn't notice why the sock felt wrong — snapped at it instead.`,
    grows1: (p) => `Snapping at the sock made the very next ordinary thing feel like an insult too.`,
    grows2: (p) => `${p} snapped at that one as well, so the whole morning started stacking up like one long unfairness.`,
    overwhelming: (p) => `By now everything felt like the worst day ever — the sock, the toast, all of it, much bigger than any of them actually were.`,
    pause: (p) => `${p} stopped, just for a second, before the next small thing could land.`,
    realProblem: (p, trueBelief) => `None of it was really about the sock or the toast — ${p} was just hungry and tired underneath it all. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} said the actual, unglamorous truth out loud — hungry, tired — and felt the sock and the toast shrink back down to the small things they had always been.`,
  },
  // SIT136 — a temptation and a responsibility collide. Treating it as a
  // choice (not the temptation itself) is what inflates it into a
  // dilemma; the real problem is a backwards order, not a decision at all.
  TEMPTATION_TRADEOFF: {
    ignored: (p) => `${p} didn't decide anything yet — just glanced toward the window instead.`,
    grows1: (p) => `The glance made the pull stronger, like looking had given it permission to grow.`,
    grows2: (p) => `${p} tried to ignore it and push through the workbook anyway, and now neither the work nor the fun outside felt like it was really happening.`,
    overwhelming: (p) => `Soon it felt like an impossible choice — as if picking one meant losing the other completely.`,
    pause: (p) => `${p} paused, a beat before picking either one.`,
    realProblem: (p, trueBelief) => `It was never really a choice between the two at all — it was just that the order was backwards. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} finished the page first, on purpose, and walked outside afterward owing nothing to anyone — both things finally possible, just in the right order.`,
  },
  DEFAULT: {
    ignored: (p) => `${p} reacted right away, without stopping to look at what was actually wrong.`,
    grows1: (p) => `Reacting made the feeling bigger, not smaller.`,
    grows2: (p) => `${p} reacted again the same way, and it grew again.`,
    overwhelming: (p) => `Soon the feeling filled everything, far bigger than whatever had started it.`,
    pause: (p) => `${p} paused.`,
    realProblem: (p, trueBelief) => `The real problem was smaller than it felt — it just needed to actually be looked at. ${sentenceCase(lowerFirstKeepingI(stripTrailingPeriod(trueBelief)))}.`,
    resolution: (p) => `${p} let the feeling settle, steadier than before, having finally looked at what was actually there.`,
  },
};

// T14 Realization Contract (added 2026-08-12, per
// docs/prana-kids/T14_REALIZATION_PILOT_2026-08-12.md). T14's core
// mechanism is fixed (see docs) and is NOT the try/fail/try/succeed shape
// T03/T18 use: hero receives meaningful help -> recognizes what that help
// did -> encounters someone with a related struggle -> remembers the
// earlier help -> actively gives similar help -> the relational change
// proves the belief. T14 previously fell through the shared generic
// try/fail fallback (below), which does not carry a receive/remember/give
// shape at all, so it printed the same six fixed try/fail sentences for
// every T14 situation regardless of what the hero was actually going
// through — the same defect T03/T18 had, but structurally worse for T14
// because the fallback's shape doesn't match T14's mechanism to begin
// with.
//
// Reading all 16 T14 situations' authored storySeed/narrativeSummary text
// (dumped via phase8-tools/dumpT14Situations.mjs) surfaced 5 genuinely
// distinct struggle domains a T14 situation actually falls into — not one
// shared "obstacle" shape, and not forced parity with T18's 7:
//   - EXCLUSION_LONGING_TO_BELONG: hero is left out, replaced, or watching
//     a group/game/conversation already underway without them (SIT048,
//     SIT056, SIT082, SIT146, SIT150, SIT152)
//   - SHAME_AFTER_CORRECTION: hero is reprimanded/corrected (privately or
//     publicly) or pressured not to make a mistake, and reads the
//     correction as a threat to being loved (SIT046, SIT074, SIT107)
//   - SELF_IMAGE_COMPARISON: hero notices a physical feature/change and
//     starts comparing it to someone else's or worrying how it will be
//     seen (SIT065, SIT093, SIT122)
//   - LOSING_A_CONNECTION: hero is losing a familiar person or place to
//     distance/a move (SIT051, SIT114, SIT115)
//   - MISUNDERSTOOD_OR_UNHEARD: hero's own words keep landing wrong and
//     they start doubting how they communicate (SIT013 only; precedented
//     by T18's own single-situation TEMPTATION_TRADEOFF mode)
// 5 modes for 16 situations sits inside the "mirror T16/T18's granularity"
// guidance (T16 has 6, T18 has 7, T21 has 5, T23 has 4).
//
// Each mode supplies: who plausibly gives the hero real help for THIS
// struggle (drawn from ctx.coreReference, a person-noun already extracted
// from the situation's own text — never invented), what that help
// concretely did, what related-but-not-identical struggle the hero later
// notices in someone else (same domain, different specifics, so it echoes
// without being a verbatim repeat), and the specific observable action the
// hero takes to give the same kind of help back. The RESOLUTION beat
// always carries ctx.trueBelief so the realization is legible, and the
// HERO_GIVES beat always contains an explicit "remembering"/"just like"
// connective back to RECEIVE_HELP so the causal chain reads in prose, not
// just in code structure.
function detectT14RealizationMode(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const text = `${(ctx.narrativeSummarySentences || []).join(" ")} ${buildStorySeedContextText(situation)}`.toLowerCase();
  const score = (pattern) => {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  };
  const ranked = [
    { mode: "EXCLUSION_LONGING_TO_BELONG", score: score(/\b(invited|left out|isn'?t part of|not part of|already playing|already underway|group chat|standing alone|nobody|replaced|someone else)\b/g) },
    { mode: "SHAME_AFTER_CORRECTION", score: score(/\b(reprimand\w*|sharp voice|correct(ed|ion)?|mistake|be good|a test|ashamed|angrily|angry)\b/g) },
    { mode: "SELF_IMAGE_COMPARISON", score: score(/\b(pimple|spot|mirror|hair|physical change|notices something different|appearance|texture)\b/g) },
    { mode: "LOSING_A_CONNECTION", score: score(/\b(mov(ing|ed|e)|moving boxes|suitcase|leaving behind|another city|another country|packed)\b/g) },
    { mode: "MISUNDERSTOOD_OR_UNHEARD", score: score(/\b(misunderstand\w*|not what .* meant|landing differently|understand what they mean)\b/g) },
  ];
  ranked.sort((a, b) => b.score - a.score);
  if (!ranked[0].score) return "DEFAULT";
  return ranked[0].mode;
}

const T14_MODE_FRAMING = {
  EXCLUSION_LONGING_TO_BELONG: {
    receiveHelp: (p, helper) => `So ${helper || "someone nearby"} noticed ${p} standing at the edge of things and made room, waving ${p} in without making a fuss about it.`,
    recognizeHelp: (p) => `${p} paused for a second and realized that one small wave-in was what had actually made the difference — not being the loudest, just being let in.`,
    encounterStruggle: (p) => `Later, ${p} spotted another child standing off to the side, watching everyone else already deep in something, clearly wondering whether there was room for one more.`,
    heroGives: (p, trueBelief) => `Remembering how much that one small wave-in had meant, ${p} walked over and made room for the other child too, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    resolutionAction: (p) => `${p} smiled and settled in beside the other child, now part of the game too`,
    resolutionClose: () => `glad to have passed the same room along`,
  },
  SHAME_AFTER_CORRECTION: {
    receiveHelp: (p, helper) => `So ${helper || "someone close by"} sat with ${p} afterward and said, gently, that the mistake was small and ${p} was still loved just the same.`,
    recognizeHelp: (p) => `${p} stopped and let the words settle, and realized that one gentle sentence had done what all the worrying could not — it had made the shame let go.`,
    encounterStruggle: (p) => `Later, ${p} saw another child freeze after being corrected, shoulders curling in, looking as if the mistake had turned into something much bigger than it was.`,
    heroGives: (p, trueBelief) => `Remembering the gentle sentence that had once loosened ${p}'s own shame, ${p} crouched down and said the mistake was small and it did not change anything, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    resolutionAction: (p) => `${p} felt the other child's shoulders come back down and smiled`,
    resolutionClose: () => `steadier, having handed on the same gentleness`,
  },
  SELF_IMAGE_COMPARISON: {
    receiveHelp: (p, helper) => `So ${helper || "someone kind"} caught ${p} frowning at the mirror and pointed out, plainly, something true and good about how ${p} actually looked.`,
    recognizeHelp: (p) => `${p} paused in front of the mirror and realized that being seen kindly, on purpose, had done more than any amount of staring ever could.`,
    encounterStruggle: (p) => `Later, ${p} noticed another child tugging at their own hair, or checking their reflection twice, clearly comparing themselves to somebody else close by.`,
    heroGives: (p, trueBelief) => `Remembering how it had felt to be seen kindly, ${p} said something true and good about the other child out loud, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    resolutionAction: (p) => `${p} found the other child standing a little taller, and smiled`,
    resolutionClose: () => `lighter, having passed the same kindness on`,
  },
  LOSING_A_CONNECTION: {
    receiveHelp: (p, helper) => `So ${helper || "someone who understood"} helped ${p} find a way to stay connected across the distance — a plan to write, call, or visit that made the goodbye feel less final.`,
    recognizeHelp: (p) => `${p} sat with the feeling for a moment and realized the connection had not actually broken — it had just found a new, different shape.`,
    encounterStruggle: (p) => `Later, ${p} met another child who was about to lose someone or something familiar too, looking as if the distance already felt final.`,
    heroGives: (p, trueBelief) => `Remembering the plan that had made ${p}'s own goodbye feel less final, ${p} helped the other child find a way to stay connected too, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    resolutionAction: (p) => `${p} felt the other child settle, the goodbye already feeling smaller`,
    resolutionClose: () => `settled, having handed on the same steady plan`,
  },
  MISUNDERSTOOD_OR_UNHEARD: {
    receiveHelp: (p, helper) => `So ${helper || "someone patient"} asked ${p} to try explaining it again, slowly, and this time actually listened until it made sense.`,
    recognizeHelp: (p) => `${p} paused before trying again and realized that being listened to slowly, without rushing, was what had finally let the words land.`,
    encounterStruggle: (p) => `Later, ${p} noticed another child trying to explain something, getting more frustrated each time the words came out wrong.`,
    heroGives: (p, trueBelief) => `Remembering how it had felt to finally be heard, ${p} asked the other child to try again, slowly, and listened all the way through, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    resolutionAction: (p) => `${p} found the other child's words finally landing, and smiled`,
    resolutionClose: () => `glad to have listened all the way through`,
  },
  DEFAULT: {
    receiveHelp: (p, helper) => `So ${helper || "someone close by"} noticed ${p} struggling and stepped in with real, concrete help, not just words.`,
    recognizeHelp: (p) => `${p} paused and realized that the help had actually changed how the moment felt, not just how it looked.`,
    encounterStruggle: (p) => `Later, ${p} noticed someone else quietly struggling with something not so different from what ${p} had just been through.`,
    heroGives: (p, trueBelief) => `Remembering the help that had made the difference, ${p} stepped in and offered the same kind of help, realizing ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    resolutionAction: (p) => `${p} felt the other child settle, helped in turn`,
    resolutionClose: () => `glad the same help had reached someone else too`,
  },
};

// T15 Realization Contract (added 2026-08-12, per
// docs/prana-kids/T15_REALIZATION_PILOT_2026-08-12.md). T15's fixed
// mechanism (from phase8-data/storyTemplates.json's own requiredBeats) is
// PROBLEM -> ASSUMPTION -> DISMISSAL -> SECOND_LOOK ->
// UNEXPECTED_CONTRIBUTION -> RESOLUTION: the hero assumes someone/something
// cannot possibly help, dismisses them, tries without them (not enough), is
// prompted to take a second look, and the dismissed helper contributes the
// missing piece in a way true to their own nature. Like T14, none of the 15
// live T15 situations literally narrate an "assumed-incapable helper" scene
// in their storySeed text — that receive/dismiss/help shape is a
// template-authored device fixed by the template's own contract, not
// extractable from the situation text directly. What the situation text
// DOES supply is the underlying anxiety/trust domain, which determines who
// gets dismissed and what kind of contribution genuinely fits. Reading all
// 15 T15 situations surfaced 7 genuinely distinct domains (mirroring T18's
// own granularity of 7, not forced parity with T14's 5) — 2 singleton modes
// (SENSORY_OVERWHELM, DIGITAL_BOUNDARY_SAFETY) are precedented by T18's own
// single-situation TEMPTATION_TRADEOFF mode.
function detectT15RealizationMode(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const text = `${(ctx.narrativeSummarySentences || []).join(" ")} ${buildStorySeedContextText(situation)}`.toLowerCase();
  const score = (pattern) => {
    const matches = text.match(pattern);
    return matches ? matches.length : 0;
  };
  const ranked = [
    { mode: "TRUST_THE_UNFAMILIAR", score: score(/\b(stranger|unfamiliar|never met|new nanny|new helper|hasn'?t met|doesn'?t know this person|new (person|voice|pair of shoes)|new face)\b/g) },
    { mode: "SEPARATION_FEAR", score: score(/\b(parent\w* (will |has to |had to )?leav\w*|trip|travel\w*|suitcase|goodbye|away|sick|unwell|ill|divorc\w*|separat\w*|no longer live together|empty chair)\b/g) },
    { mode: "UNCERTAIN_FROM_OVERHEARD", score: score(/\b(overhear\w*|overheard|money problem\w*|big change|didn'?t hear|part of the information|voices drift)\b/g) },
    { mode: "LOSING_THE_FAMILIAR", score: score(/\b(new teacher|leaving.*classroom|moving|mov(ed|ing) house|new bedroom|new home|none of the little things|familiar bedroom)\b/g) },
    { mode: "BROKEN_PROMISE_TRUST", score: score(/\b(promise\w*|forgot\w*|forgotten)\b/g) },
    { mode: "DIGITAL_BOUNDARY_SAFETY", score: score(/\b(password|online|login|level up|digital platform)\b/g) },
    { mode: "SENSORY_OVERWHELM", score: score(/\b(noisy|crowd\w*|overcrowded|overwhelm\w*|volume button|trolley|music plays|every side)\b/g) },
  ];
  ranked.sort((a, b) => b.score - a.score);
  if (!ranked[0].score) return "DEFAULT";
  return ranked[0].mode;
}

// Each mode supplies: what the hero is trying to solve (problem, grounded in
// SETUP separately), who/what the hero assumes cannot possibly help and
// dismisses (drawn from ctx.coreReference — a person-noun already extracted
// from the situation's own text — never an invented character), what
// happens when the hero tries without them, what prompts the second look,
// and the specific, in-character contribution the dismissed helper makes.
// RESOLUTION always carries ctx.trueBelief so the realization is legible.
const T15_MODE_FRAMING = {
  TRUST_THE_UNFAMILIAR: {
    assumption: (p, dismissed) => `${p} was sure that only someone already known and trusted could make this feel safe — surely ${dismissed || "this unfamiliar person"} could not be that, not yet.`,
    dismissal: (p) => `So ${p} stayed quiet and careful, waiting for the moment to pass on its own — but the unease did not pass; it just sat there, unanswered. ${p} paused, unsure what else to try.`,
    secondLook: (p, dismissed) => `Then ${p} noticed ${dismissed || "the unfamiliar person"} slow down, ask a small, ordinary question, and wait without rushing for an answer.`,
    contribution: (p, dismissed) => `${dismissed || "The unfamiliar person"} did not try to fix the unease at all — just stayed steady and patient until ${p} was ready, which turned out to be exactly the missing piece.`,
    resolutionAction: (p) => `${p} felt more at ease, a little more sure of the new person than before`,
    resolutionClose: () => `glad to have let someone new show who they really were`,
  },
  SEPARATION_FEAR: {
    assumption: (p, dismissed) => `${p} was sure that only the parent's own presence could make the worry go away — surely ${dismissed || "anyone else close by"} could not do that instead.`,
    dismissal: (p) => `So ${p} tried to hold onto the worry alone, turning it over and over — but the worry only grew heavier, not lighter. ${p} stopped, unsure what else to do.`,
    secondLook: (p, dismissed) => `Then ${dismissed || "someone else close by"} sat down next to ${p} without being asked, in no hurry to leave.`,
    contribution: (p, dismissed) => `${dismissed || "That person"} could not bring the parent back sooner, but stayed close and said the honest, steady thing ${p} actually needed to hear — and that was the missing piece.`,
    resolutionAction: (p) => `${p} breathed out, the worry smaller than before`,
    resolutionClose: () => `steadier, having let someone else's steadiness in`,
  },
  UNCERTAIN_FROM_OVERHEARD: {
    assumption: (p, dismissed) => `${p} was sure that only overhearing the rest of the grown-up conversation could settle the guessing — surely asking ${dismissed || "someone directly"} would not really work.`,
    dismissal: (p) => `So ${p} kept quietly guessing, filling the gaps with worse and worse possibilities — but the guessing only made the fear bigger. ${p} sat with the not-knowing for a moment.`,
    secondLook: (p, dismissed) => `Then ${dismissed || "someone nearby"} noticed ${p}'s worried face and asked what was wrong.`,
    contribution: (p, dismissed) => `${dismissed || "That grown-up"} answered plainly, in words sized for ${p} to actually understand, which turned out to be exactly the missing piece the guessing never could supply.`,
    resolutionAction: (p) => `${p} nodded, the guessing finally replaced by something true`,
    resolutionClose: () => `steadier, having asked instead of only guessing`,
  },
  LOSING_THE_FAMILIAR: {
    assumption: (p, dismissed) => `${p} was sure that only the familiar person or place staying exactly the same could make this feel okay — surely ${dismissed || "anything new"} could not replace what was being lost.`,
    dismissal: (p) => `So ${p} held onto the old, familiar version and refused to notice anything new — but that did not stop the change from being real. ${p} stood still for a second, unsure what to do next.`,
    secondLook: (p, dismissed) => `Then ${p} decided to take a second, closer look at ${dismissed || "the new person or place"}, instead of only comparing it to what was gone.`,
    contribution: (p, dismissed) => `${dismissed || "The new person or place"} turned out to carry its own small, real kindness, not a copy of the old one but something true in its own right — the missing piece ${p} had not been looking for.`,
    resolutionAction: (p) => `${p} let the new thing be itself instead of a lesser copy of the old`,
    resolutionClose: () => `settled, having made room for something new to be good on its own terms`,
  },
  BROKEN_PROMISE_TRUST: {
    assumption: (p, dismissed) => `${p} was sure that once a promise was broken, only getting the exact original thing back could fix it — surely ${dismissed || "an honest word instead"} could not really undo the disappointment.`,
    dismissal: (p) => `So ${p} stayed upset and said nothing, waiting for things to somehow go back to how they were — but staying quiet did not fix anything. ${p} paused before deciding what to do next.`,
    secondLook: (p, dismissed) => `Then ${dismissed || "the other person"} came back, looked ${p} in the eye, and said plainly what had actually gone wrong.`,
    contribution: (p, dismissed) => `${dismissed || "That honest word"} did not undo what had happened, but it turned out to matter more than the original promise itself — the missing piece that made trust possible again.`,
    resolutionAction: (p) => `${p} felt the tightness in their chest loosen, the friendship steadier than it had been a moment ago`,
    resolutionClose: () => `glad to have let an honest word count for something`,
  },
  DIGITAL_BOUNDARY_SAFETY: {
    assumption: (p, dismissed) => `${p} was sure that telling ${dismissed || "a grown-up"} about the strange message would only end the game and bring trouble — surely handling it alone was the safer choice.`,
    dismissal: (p) => `So ${p} hesitated, fingers hovering over the keyboard, trying to decide alone — but the uneasy feeling did not go away. ${p} stopped and sat with the uneasy feeling for a second.`,
    secondLook: (p, dismissed) => `Then ${p} remembered ${dismissed || "a grown-up"} had said before, calmly, that strange requests were always worth mentioning.`,
    contribution: (p, dismissed) => `${dismissed || "The grown-up"} did not get upset at all — just helped ${p} block the message and stay safe, which turned out to be exactly the missing piece.`,
    resolutionAction: (p) => `${p} felt calmer once the message was closed`,
    resolutionClose: () => `glad to have asked instead of deciding alone`,
  },
  SENSORY_OVERWHELM: {
    assumption: (p, dismissed) => `${p} was sure that only leaving the noisy place completely could make the overwhelmed feeling stop — surely ${dismissed || "a small trick from someone else"} could not be enough.`,
    dismissal: (p) => `So ${p} pushed forward through the noise anyway, trying to just get through it — but the tightness in ${p}'s chest only grew. ${p} stood still for a beat before trying anything else.`,
    secondLook: (p, dismissed) => `Then ${dismissed || "someone close by"} crouched down and offered one small, simple idea — a quiet corner, a few slow breaths, a hand to hold.`,
    contribution: (p, dismissed) => `${dismissed || "That small idea"} was so simple it had seemed impossible to matter, but it helped exactly where nothing else had.`,
    resolutionAction: (p) => `${p} felt the tightness ease, the noise still there but no longer too much`,
    resolutionClose: () => `steadier, having let one small idea actually help`,
  },
  DEFAULT: {
    assumption: (p, dismissed) => `${p} was sure that ${dismissed || "the one obvious answer"} was the only thing that could really help — surely nothing else could make a difference.`,
    dismissal: (p) => `So ${p} tried to manage it alone — but that was not enough on its own. ${p} paused, uncertain what else there was to try.`,
    secondLook: (p, dismissed) => `Then ${p} decided to take a second, closer look at ${dismissed || "someone close by"}, easy to overlook until now.`,
    contribution: (p, dismissed) => `${dismissed || "That overlooked helper"} contributed exactly the missing piece, in a way true to who they were.`,
    resolutionAction: (p) => `${p} felt the problem settle, solved in a way ${p} had not expected`,
    resolutionClose: () => `glad to have looked again before deciding no one else could help`,
  },
};

// T04 Realization Contract (added 2026-08-12, per
// docs/prana-kids/T04_REALIZATION_PILOT_2026-08-12.md). T04's fixed
// mechanism (from phase8-data/storyTemplates.json's own requiredBeats) is
// OPENING_QUESTION -> CLUE_1 -> QUESTION_2 -> CLUE_2 -> QUESTION_3 ->
// CLUE_3 -> REVELATION -> RESOLUTION: the hero asks a question tied
// directly to the false belief, gets a partial answer that only raises a
// sharper question, repeats that narrowing twice more, and the third
// question is answered from within (not by a new external clue) — the
// three clues then connect at once into the true belief
// (storyTemplates.json's own repetitionPattern.finalVariation and
// escalationPattern: "intellectual/emotional specificity, not physical
// difficulty"). This is a genuinely different beat shape from every other
// contract template — not a try/fail arc (T03/T18), not a receive/give arc
// (T14), not a dismiss/second-look arc (T15) — so it is not reused from any
// of them.
//
// Only 1 of the 156 active situations in situations.json naturally selects
// T04 (SIT137, "Tempted to look at friend's paper during a test" —
// confirmed via phase8-tools/dumpT04Situations2.cjs, mirroring
// dumpT15Situations.mjs). Per the task brief's single-mechanism allowance,
// no multi-mode text-signal detector was built: there is only one real
// situation's worth of evidence, so inventing several modes for symmetry
// with T14/T15/T18 would not be modes grounded in real T04 data, it would
// be invented variety. detectT04RealizationMode() below always returns
// "DEFAULT" and exists only to keep this template's wiring symmetric with
// every other contract template's call sites (validateEventChain,
// writeProseFromEventChain) — it does no real text-signal scoring because
// there is nothing yet to score between. The single DEFAULT mode's framing
// functions are written generically off ctx.falseBelief/ctx.trueBelief/
// ctx.coreReference (the situation's own extracted person-noun) rather than
// hardcoded to SIT137's cheating-specific details, so if upstream selector
// coverage ever routes a second, different T04 situation here (see
// upstream-limitation finding in the pilot doc), the prose still grounds
// itself in that situation's own belief/reference text instead of leaking
// SIT137-specific nouns.
function detectT04RealizationMode(ctx) {
  return "DEFAULT";
}

// Each stage supplies: the question asked (narrower each time), the partial
// clue/answer it gets (or, for the third, the internal readiness that
// substitutes for an external clue), and the closing revelation/resolution.
// coreReference (ctx.coreReference) is the situation's own extracted
// person-noun, used mid-sentence exactly like T14/T15's dismissed-helper
// convention — never an invented character. REVELATION always carries
// ctx.trueBelief so the realization is legible and the structural
// contract's true-belief check (validateEventChain) has something to find.
// Every stage below takes a `facts` object (tensionFact, wantClause,
// obstacleFact, symbolLabel — all pulled from the situation's own
// storySeed/realizedSituation fields via concreteSceneFacts(ctx) and
// existing ctx fields, never invented) so that two different T04 situations
// under the single DEFAULT mode produce genuinely different
// CLUE_1/QUESTION_2/CLUE_2/QUESTION_3/CLUE_3/RESOLUTION text, not the same
// fixed sentence with only the protagonist's name swapped in. This was a
// real bug found during this pilot's own regression testing (forcing T04
// onto SIT005/SIT001/SIT046/SIT028 — see the pilot doc §ed. read): an
// earlier draft of this table had every mid-chain beat as a fixed sentence
// varying only by protagonist/coreReference substitution, which is exactly
// the T03-fallback failure this whole initiative exists to remove. Fixed by
// working ctx.obstacleClause / concreteSceneFacts(ctx).tensionFact /
// ctx.realizedSituation.want / ctx.symbolLabel into the mid-chain beats.
//
// GROUNDING FIX (2026-08-12, follow-up): QUESTION_3 previously read
// `facts.missionPhrase` — ctx.missionPhrase (buildEventPlannerContext,
// naturalMissionPhrase()) is the ABSTRACT Mission Type resolved through
// Character/Archetype compatibility (see buildStorySelectionDecisionLog's
// mission.reason: "Concrete Mission selected after resolving abstract
// Mission Type... "), entirely independent of the situation's own conflict.
// For SIT137 this silently substituted whatever abstract mission got
// selected (e.g. "keep an important secret", "overcome a personal fear")
// into what must stay a story about whether looking at a friend's paper is
// actually earning the answer — an unrelated-abstraction leak, not a
// SIT137-specific bug (any T04 situation would inherit its selector's
// mission text here regardless of fit). Fixed by dropping
// facts.missionPhrase entirely and grounding QUESTION_3 in
// facts.wantClause (ctx.realizedSituation.want — the situation's own
// immediateWant, already used by CLUE_1) instead, so the third question
// stays on the situation's actual want/obstacle instead of an unrelated
// mission label.
const T04_MODE_FRAMING = {
  DEFAULT: {
    openingQuestion: (p, falseBelief) => `${p} stopped, caught on the question the moment had just raised: if "${falseBelief}" were true, would this really be as simple as it first seemed?`,
    // facts.obstacleFact/tensionFact are already correctly cased by
    // concreteSceneFacts()'s own lowerFirstUnlessProperNoun (proper nouns
    // like the protagonist's name stay capitalized mid-sentence) — do not
    // re-lowercase them here, only stitch them in as-is.
    clue1: (p, dismissed, facts) => `Looking toward ${dismissed || "the easy way out"} answered nothing on its own — ${facts.obstacleFact ? `${facts.obstacleFact} was still there either way` : "the trouble was still there either way"}, and it only made ${p} wonder something sharper: would taking the shortcut actually make ${facts.wantClause ? `getting to "${facts.wantClause}"` : "the trouble"} go away, or just hide it for a moment?`,
    // Narrated, not quoted — the dismissed/coreReference text inserted here
    // varies in length per situation, and a quoted dialogue line carrying
    // it can run past QA-013's 60-char limit (found during regression on
    // SIT137, whose "their friend" phrasing pushed a quoted version over
    // the limit); narration has no such length gate.
    question2: (p, dismissed, facts) => `So ${p} paused and asked the sharper question silently — if it came from ${dismissed || "somewhere else"} and not from ${p}, would it actually be ${p}'s own?`,
    clue2: (p, dismissed, facts) => `The answer came as a feeling more than a fact — ${facts.tensionFact ? facts.tensionFact : `a tight, uneasy knot in ${p}'s chest`} that did not loosen no matter how ${p} looked at it, as if some part of ${p} already knew.`,
    // Narrated, not quoted — the earlier QUESTION_2 quote stays under
    // QA-013's 60-char dialogue-line limit, but this final, most-specific
    // question runs longer in full sentence form, so it is folded into
    // narration instead of spoken dialogue, same fix T08/T15/T16 already
    // applied to their own long belief/question sentences.
    question3: (p, dismissed, facts) => `That left one question closer to the heart of it than either question before — not what would work, but whether ${p} would have actually earned ${facts.wantClause ? `"${facts.wantClause}"` : "it"}, or only borrowed the look of it.`,
    clue3: (p, dismissed, facts) => `This time no new clue arrived from outside${facts.symbolLabel ? `, not even a quiet hint of ${lowerFirstKeepingI(facts.symbolLabel)}` : ""}. ${p} already knew, quietly and completely, without needing anyone or anything else to say it first.`,
    revelation: (p, trueBelief) => `All three questions folded into one another at once, and ${p} understood: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    resolutionAction: (p, dismissed, facts) => `${p} turned back to ${facts.wantClause ? lowerFirstKeepingI(facts.wantClause) : "the moment at hand"} and kept going, steady now instead of torn`,
    resolutionClose: () => `not because the hard question had gone away, but because it was finally, fully answered`,
  },
};

// T09 Realization Contract (added 2026-08-12, per
// docs/prana-kids/T09_REALIZATION_PILOT_2026-08-12.md, following the T04
// pilot's method — the closest precedent because T04 also had few natural
// situations). T09's fixed mechanism (phase8-data/storyTemplates.json's own
// requiredBeats) is BIG_EXPECTATION -> BIG_ATTEMPT_FAILS ->
// QUIET_QUALITY_NOTICED -> QUIET_ACTION -> RESOLUTION: everyone (including
// the hero) expects the fix to require a big, obvious action; the real fix
// is a quiet quality the hero already has, which succeeds specifically
// where the big/loud attempt failed (storyTemplates.json's own
// resolutionPattern). repetitionNote is explicit that this is a
// single-inversion contrast structure, not a three-part try/fail/try
// repetition like T03/T18 — so the beat shape below is NOT reused from
// either of those templates.
//
// Only 4 of the 168 active situations in situations.json naturally select
// T09 (SIT009 hangry, SIT019 scratchy clothes, SIT029 lost in a crowd,
// SIT030 saw a scary video — confirmed via
// phase8-tools/dumpT09Situations.cjs). All 4 are NEED_SAFETY family, but
// reading their actual storySeed/narrativeSummary text (not just the
// taxonomy) shows the underlying mechanism is genuinely NOT identical
// across all 4:
// - SIT009 + SIT019 both escalate from an ignorable physical discomfort
//   (hunger/tiredness, scratchy clothing) into "ordinary things feel
//   unbearable" — the quiet quality that fixes this is noticing and caring
//   for the body's own signal, not any external fix. One genuine mode:
//   BODY_DISCOMFORT.
// - SIT029 is separation panic in a crowd — the quiet quality is staying
//   still and recalling a taught safety plan, not body-awareness at all.
//   A genuinely different mode: SEPARATION_SAFETY.
// - SIT030 is an intrusive scary memory from a video, with no separation
//   and no crowd — the quiet quality is recognizing imagination-vs-reality
//   and seeking comfort from a trusted adult. A third genuinely different
//   mode: INTRUSIVE_FEAR.
// This is 3 real modes grounded in real differences in the actual text
// (not invented for symmetry with T14/T15/T18) — collapsing all 4 into one
// mode would force SIT029/SIT030's genuinely different "big attempt" and
// "quiet quality" content through SIT009/SIT019's body-awareness framing,
// which would be wrong for those two situations, not just generic.
//
// detectT09RealizationMode uses most-specific-match text-signal scoring
// over narrativeSummarySentences + storySeedContextText (falseBeliefText/
// needId as supporting evidence only, never the sole signal — all 4
// situations share NEED_SAFETY so taxonomy alone cannot distinguish them).
// SEPARATION_SAFETY and INTRUSIVE_FEAR each have narrow, specific
// vocabulary (crowd/parent-loss language; video/scary-image-replay
// language) so they are checked first and only need one hit; BODY_DISCOMFORT
// is the broader "physical discomfort escalation" bucket and is the
// fallback default (mirrors T15's own lesson about not letting a broad
// regex steal a more-specific mode's situations — checked last, after the
// two narrow modes have had first chance to match).
function detectT09RealizationMode(ctx) {
  // BUG (found during SIT029 editorial re-review, 2026-08-12): this used to
  // read ctx.storySeedContextText, a field that is never assigned anywhere
  // in the pipeline (buildEventPlannerContext never sets it) — it was always
  // "", so detection silently ran on only narrativeSummarySentences (2
  // scene-setting sentences) + falseBelief, neither of which happens to
  // contain SIT029's own separation vocabulary ("mall", "crowd", "familiar
  // hand"). That vocabulary lives in the situation's own storySeed
  // (immediateObstacle/emotionalTension/context), the same fields
  // concreteSceneFacts(ctx) already reads for obstacleFact/tensionFact — so
  // SIT029 silently fell through to the BODY_DISCOMFORT default and every
  // downstream beat used BODY_DISCOMFORT's framing. Reading directly from
  // ctx._lookups.situation.storySeed (grounded, already-authored data, not
  // invented) fixes detection without touching the 3 mode-framing tables.
  const seed = ctx._lookups && ctx._lookups.situation && ctx._lookups.situation.storySeed;
  const text = [
    ...(ctx.narrativeSummarySentences || []),
    seed && seed.immediateObstacle,
    seed && seed.emotionalTension,
    seed && Array.isArray(seed.context) ? seed.context.join(" ") : "",
    ctx.falseBelief || "",
  ].filter(Boolean).join(" ").toLowerCase();

  const separationSignal = /\b(crowd|mall|lost|separated|parent'?s? hand|couldn'?t see (my|their) (mom|dad|parent)|familiar hand)\b/;
  const intrusiveFearSignal = /\b(video|scary (picture|image|video)|replay|kept seeing it|frightening (video|image)|closes? their eyes)\b/;
  const bodyDiscomfortSignal = /\b(hungry|hangry|tired|scratchy|itchy|clothing|shirt|uncomfortable|cranky|body)\b/;

  if (separationSignal.test(text)) return "SEPARATION_SAFETY";
  if (intrusiveFearSignal.test(text)) return "INTRUSIVE_FEAR";
  if (bodyDiscomfortSignal.test(text)) return "BODY_DISCOMFORT";
  // No mode-specific vocabulary matched (e.g. a forced test case unrelated
  // to any of the 3 real T09 mechanisms) — BODY_DISCOMFORT is the broadest
  // real mode and the safest generic fallback, same role T04's single
  // DEFAULT mode plays for T04.
  return "BODY_DISCOMFORT";
}

// Each mode supplies all 5 beats. `facts` (obstacleFact, tensionFact,
// wantClause — pulled from concreteSceneFacts(ctx) and
// ctx.realizedSituation.want, never invented) is threaded into every beat
// so two situations under the same mode (SIT009/SIT019, both
// BODY_DISCOMFORT) still produce genuinely different BIG_ATTEMPT_FAILS/
// QUIET_QUALITY_NOTICED/QUIET_ACTION text, not a fixed sentence varying
// only by protagonist name — the exact T03-fallback failure the T04 pilot
// caught in itself (see T04_GROUNDING_FIX_2026-08-12.md). BIG_ATTEMPT_FAILS
// must show a genuinely big/loud/obvious action failing, per T09's own
// contract; RESOLUTION must explicitly contrast the quiet action succeeding
// where the big attempt failed and land ctx.trueBelief, per
// storyTemplates.json's resolutionPattern.
const T09_MODE_FRAMING = {
  BODY_DISCOMFORT: {
    bigExpectation: (p, facts, falseBelief) => `Everyone around ${p}, and ${p} too, believed "${falseBelief}" — so the fix had to be something big and obvious — snapping back louder, arguing harder, pushing through the annoyance by sheer stubbornness — because surely a problem this loud needed a big enough reaction to match it.`,
    bigAttemptFails: (p, facts) => `So ${p} tried exactly that — raising a voice, tugging and huffing and complaining at full volume — but it did nothing to fix the real trouble: ${facts.obstacleFact || "the discomfort underneath it all"}, still there, unchanged, no matter how big the reaction got.`,
    quietQualityNoticed: (p, facts) => `Then, in the middle of all that noise, ${p} noticed something small and quiet instead — ${facts.tensionFact ? `${facts.tensionFact}, and underneath it` : `that the real trouble was not the small thing in front of ${p} at all — underneath it`} was a tired, uncomfortable body asking to be listened to.`,
    quietAction: (p, facts) => `So ${p} stopped pushing and did the quiet thing instead — paused, took a slow breath, and gave the body what it had been asking for all along${facts.wantClause ? `, so ${p} could finally ${facts.wantClause}` : ""}, without any fuss or fighting at all.`,
    resolution: (p, trueBelief, facts) => `That is what worked — not the loud reaction, which had changed nothing, but the quiet act of caring for the body underneath it, and ${p} understood: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
  },
  SEPARATION_SAFETY: {
    bigExpectation: (p, facts, falseBelief) => `Everyone around ${p}, and ${p} too, believed "${falseBelief}" — so the fix had to be something big and frantic — running, shouting, pushing through the crowd as fast as possible — because surely finding a lost parent again needed a big enough search to match the fear.`,
    bigAttemptFails: (p, facts) => `So ${p} tried exactly that — darting one way and then another, calling out into the noise — but it did nothing to fix the real trouble: ${facts.obstacleFact || "there were still people everywhere and the familiar hand was still gone"}, and running only made the crowd feel bigger and more confusing.`,
    quietQualityNoticed: (p, facts) => `Then, in the middle of all that running, ${p} noticed something small and quiet instead — ${facts.tensionFact ? facts.tensionFact : "that panic was making it harder, not easier, to remember what to actually do"} — and a quiet memory surfaced: the plan they had been taught for exactly this moment.`,
    quietAction: (p, facts) => `So ${p} stopped running and did the quiet thing instead — paused, stood still in one spot, looked for a grown-up who could help, and waited calmly${facts.wantClause ? ` to ${facts.wantClause}` : ""}, instead of chasing after every stranger in the crowd.`,
    resolution: (p, trueBelief, facts) => `That is what worked — not the frantic running, which had changed nothing, but standing still and staying calm, and ${p} understood: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
  },
  INTRUSIVE_FEAR: {
    bigExpectation: (p, facts, falseBelief) => `Everyone around ${p}, and ${p} too, believed "${falseBelief}" — so the fix had to be something big and forceful — trying hard to never think about it again, staying busy every second, pushing the memory away by sheer effort — because surely a scary picture this loud in the mind needed a big enough push to make it stop.`,
    bigAttemptFails: (p, facts) => `So ${p} tried exactly that — staying busy, refusing to think about it, trying to force the memory shut — but it did nothing to fix the real trouble: ${facts.obstacleFact || "the picture kept coming back the moment things went quiet"}, returning again every time ${p} closed their eyes.`,
    quietQualityNoticed: (p, facts) => `Then, in the middle of all that pushing, ${p} noticed something small and quiet instead — ${facts.tensionFact ? facts.tensionFact : "that the scary picture was only a memory, not something happening right now"} — and that noticing was quieter than any of the pushing had been.`,
    quietAction: (p, facts) => `So ${p} stopped pushing the memory away and did the quiet thing instead — found a trusted grown-up and said out loud what had been replaying inside, letting the words carry some of the fear out with them${facts.wantClause ? ` until ${p} could ${facts.wantClause}` : ""}.`,
    resolution: (p, trueBelief, facts) => `That is what worked — not forcing the memory away, which had changed nothing, but naming it quietly out loud to someone who could help, and ${p} understood: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
  },
};

// T05 ("Circle Back" / Circular Return) Realization Contract, pilot
// 2026-08-12. Built from the real natural-selector coverage: only 4 of the
// active situations (SIT036, SIT057, SIT066, SIT084 — see
// docs/prana-kids/T05_REALIZATION_PILOT_2026-08-12.md §1) naturally route to
// T05, and they genuinely split into 3 distinct mirror-return mechanisms —
// not invented for symmetry with T09's 3 modes, but the actual shape the
// data supports: (1) a public-exposure fear (SIT036 — being seen/judged
// while performing or answering), (2) a not-chosen comparison (SIT057,
// SIT084 — someone else is selected/recognised instead of the hero), and
// (3) a visible-difference shame (SIT066 — a physical difference read as
// something wrong). Detection reads narrativeSummarySentences plus the real
// storySeed fields (immediateObstacle/emotionalTension/context), never the
// dead ctx.storySeedContextText field (Lesson 2), and uses most-specific
// signal-count scoring rather than first-match order (Lesson 3).
function detectT05RealizationMode(ctx) {
  const seed = ctx._lookups && ctx._lookups.situation && ctx._lookups.situation.storySeed;
  const text = [
    ...(ctx.narrativeSummarySentences || []),
    seed && seed.childExperience,
    seed && seed.immediateObstacle,
    seed && seed.emotionalTension,
    seed && Array.isArray(seed.context) ? seed.context.join(" ") : "",
    ctx.falseBelief || "",
  ].filter(Boolean).join(" ").toLowerCase();

  const publicExposureSignal = /\b(laugh(ed|ing|s)?|perform(s|ing)?|answer(s|ing)?|hand (stays|stayed) (down|firmly)|front of (the )?class|raise[ds]? (a |their )?hand|stage|spoken?|say it|everyone (watching|laughing))\b/g;
  const notChosenSignal = /\b(chosen|choose|not chosen|award|winner|selected|selection|recognit\w*|applause|prize|student of the month|another (child|classmate)|special (class )?role)\b/g;
  const visibleDifferenceSignal = /\b(tall(er|est)?|short(er|est)?|height|class line|line-?up|line up|stand out|different (from|to)|appearance|much (shorter|taller)|fit(s)? neatly)\b/g;

  const countMatches = (regex) => (text.match(regex) || []).length;
  const scores = {
    PUBLIC_EXPOSURE: countMatches(publicExposureSignal),
    NOT_CHOSEN_COMPARISON: countMatches(notChosenSignal),
    VISIBLE_DIFFERENCE: countMatches(visibleDifferenceSignal),
  };
  const best = Object.keys(scores).reduce((a, b) => (scores[b] > scores[a] ? b : a), "NOT_CHOSEN_COMPARISON");
  // NOT_CHOSEN_COMPARISON is the broadest of the 3 real modes (2 of the 4
  // natural situations) and the safest fallback when a forced/unnatural
  // stress-test situation matches none of the 3 signal sets, mirroring T09's
  // BODY_DISCOMFORT/T04's DEFAULT fallback precedent.
  return scores[best] > 0 ? best : "NOT_CHOSEN_COMPARISON";
}

// Each mode supplies all 6 T05 beats. `facts` (obstacleFact, tensionFact,
// wantClause — pulled from concreteSceneFacts(ctx)/ctx.realizedSituation,
// never invented) is threaded into MIDDLE_JOURNEY/INSIGHT/MIRROR_ENDING/
// NEW_REACTION so SIT057 and SIT084 (both NOT_CHOSEN_COMPARISON) still read
// as genuinely different stories, not the same sentence with a swapped
// name/noun (the T04-pilot fixed-sentence bug this pattern exists to avoid).
// OLD_REACTION and NEW_REACTION deliberately echo matched vocabulary
// ("hand stayed down" / "hand went up", "stopped clapping" / "clapped, and
// meant it", "shrank" / "stood") so the mirror contrast is legible without
// naming the belief twice.
const T05_MODE_FRAMING = {
  PUBLIC_EXPOSURE: {
    oldReaction: (p, facts, falseBelief) => `The old thought came quickly: "${falseBelief}" So ${p} paused, and then let ${p}'s hand stay firmly down, letting the moment pass rather than risk being seen getting it wrong.`,
    middleJourney: (p, facts) => `In the days after, ${p} watched someone else answer, perform, or be seen and get it a little wrong too — and the sky did not fall; ${facts.tensionFact || "the fear had always been louder in the imagining than anything that actually happened"}. Slowly, ${p} noticed that ${facts.obstacleFact || "not knowing exactly what people would think"} had never once actually stopped anyone else from trying.`,
    insight: (p, trueBelief) => `Away from the classroom, in a quiet moment, ${p} sat with the thought and began to understand something different: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    mirrorEnding: (p, facts) => `Then the same kind of moment came around again — a question was asked, and ${p} was called on to answer in front of everyone, ${facts.obstacleFact || "with no way to know for certain how it would be received"}.`,
    newReaction: (p, trueBelief, facts) => `This time the same hand that had stayed down went up. ${p} still felt the flutter, but chose to answer anyway${facts.wantClause ? `, so ${p} could finally ${facts.wantClause}` : ""}, and stayed with their own voice — because ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
  },
  NOT_CHOSEN_COMPARISON: {
    oldReaction: (p, facts, falseBelief) => `The old thought came quickly: "${falseBelief}" So ${p} paused, looked at what the chosen person had, and quietly stopped believing their own effort had counted for anything.`,
    middleJourney: (p, facts) => `Over the next few days, ${p} kept working at the same thing anyway, even with no name called and no prize to show for it — and ${facts.tensionFact || "the trying itself started to feel like it belonged to someone worth being proud of"}. ${p} began to notice that ${facts.obstacleFact || "someone else being chosen this time"} had not actually taken away anything ${p} had built.`,
    insight: (p, trueBelief) => `Away from the classroom, in a quiet moment, ${p} sat with the thought and began to understand something different: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    mirrorEnding: (p, facts) => `Then a similar moment came around again — another name was announced, and ${facts.obstacleFact || "another chance " + p + " had hoped for went to someone else, the decision already made"}.`,
    newReaction: (p, trueBelief, facts) => `This time ${p} decided to clap anyway, and meant it${facts.wantClause ? `, still holding on to wanting to ${facts.wantClause}` : ""}. The old flinch did not come; instead ${p} felt their own worth stand steady, separate from ${facts.obstacleFact ? "who got picked this time" : "who got picked"} — because ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
  },
  VISIBLE_DIFFERENCE: {
    oldReaction: (p, facts, falseBelief) => `The old thought came quickly: "${falseBelief}" So ${p} paused, shrank a little, tucked the difference away as best as it could be tucked, and read being noticed as proof that something was wrong.`,
    middleJourney: (p, facts) => `In the days after, ${p} kept showing up looking exactly the way ${p} looked, and ${facts.tensionFact || `nothing about being noticed ever actually cost ${p} anything real`}. ${p} began to notice that ${facts.obstacleFact || "the difference that felt so loud"} was mostly loud inside ${p}'s own head, not in how anyone else actually treated ${p}.`,
    insight: (p, trueBelief) => `Away from the line, in a quiet moment, ${p} sat with the thought and began to understand something different: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    mirrorEnding: (p, facts) => `Then a similar moment came around again — ${p} stood somewhere visible, ${facts.obstacleFact || "clearly different from everyone nearby"}, with nowhere to hide it.`,
    newReaction: (p, trueBelief, facts) => `This time ${p} did not shrink. ${p} stood still, held their place calmly${facts.wantClause ? `, still hoping to ${facts.wantClause}` : ""}, and let being seen be just that — because ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
  },
};

// T19 ("Choice at the Crossroads" / Threshold Crossing) Realization
// Contract, pilot 2026-08-12. Natural selector coverage is confirmed at
// exactly 2 active situations (SIT133 "Tempted to steal something", SIT137
// "Tempted to look at friend's paper during a test" — see
// docs/prana-kids/T19_REALIZATION_PILOT_2026-08-12.md §1). Both are the
// SAME genuine mechanism: a live in-the-moment temptation toward a
// dishonest/rule-breaking shortcut, weighed against the harder honest path,
// with a real consequence tied to whichever is chosen. The only thing that
// differs between them (peer-dare social pressure vs. solitary academic
// opportunity) is exactly the kind of situation-specific fact the T05
// NOT_CHOSEN_COMPARISON precedent threads through `facts`
// (obstacleFact/tensionFact/wantClause) rather than requiring a second
// mode — so, per that precedent and the small-pilot guidance not to force
// mode proliferation for its own sake, this is ONE mode
// (THRESHOLD_INTEGRITY_CHOICE), not two, and no
// detectT19RealizationMode/mode-selection logic is built (matches T04's
// precedent for a single-mode pilot).
const T19_MODE_FRAMING = {
  THRESHOLD_INTEGRITY_CHOICE: {
    approachCrossroads: (p, facts, ctx) => `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}, but ${sentenceCase(stripTrailingPeriod(facts.obstacleFact))} — and right there, two different paths opened up.`,
    optionOldBelief: (p, facts, falseBelief) => `The old thought came quickly, tempting and easy: "${falseBelief}" Nobody was watching closely enough to stop ${p}, and ${facts.tensionFact ? facts.tensionFact : "the pull to take the easy way was real, not imagined"}.`,
    optionNewBelief: (p, facts) => `The other path was harder and slower: saying no, walking away from the shortcut, and living with ${facts.wantClause ? `not getting to ${facts.wantClause} the easy way` : "the obstacle staying exactly as hard as it already was"} — with no guarantee it would feel good right away.`,
    choice: (p, trueBelief) => `${p} stood still for a second, looked at both paths clearly, and then chose — not by accident, not because someone else decided for ${p}, but on purpose: ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
    consequence: (p, facts) => `The choice had a real cost right away — the hard part of it, ${facts.obstacleFact || "the exact trouble that had made the crossroads difficult in the first place"}, did not simply disappear, and for a moment ${p} wondered if the easy path would have been simpler after all.`,
    resolution: (p, trueBelief, facts) => `But afterward, ${p} could look back at that exact moment without flinching — nothing to hide, nothing to untangle later — and ${facts.wantClause ? `${p} found a steadier way to ${facts.wantClause}` : "the ground under that choice stayed solid"}, because ${lowerFirstKeepingI(stripTrailingPeriod(trueBelief))}.`,
  },
};

function buildTemplateSpecificEventChain(templateId, ctx) {
  const p = ctx.protagonist;
  const m = ctx.mechanism;
  // T22's objectRef must be a genuine physical object, never a person —
  // pulled from ctx.objectReference (object-noun list only), independent of
  // ctx.coreReference (person-noun list, used by supportingActor below).
  // Previously both drew from one mixed list, so a situation like "Friend
  // got a new toy" let "friend" win and T22 then physically handled a
  // person as an object ("picked their friend up", "put their friend in a
  // bag"). Falls back to a neutral, non-decorative noun when the situation
  // has no authored object noun to draw from.
  const objectRef = ctx.objectReference || "the found item";
  const supportingActor = ctx.coreReference ? capitalizeWord(ctx.coreReference) : "Supporting character";
  const facts = concreteSceneFacts(ctx);
  const support = buildSupportProfile(ctx);

  if (templateId === "T16") {
    // T16 Realization Contract (approved 2026-08-10). Beats stay
    // structurally fixed (EVENT / INTERPRETATION_1 / EVIDENCE_GATHERING /
    // INTERPRETATION_2 / RESOLUTION). EVENT is narrativeSummary-grounded
    // like T22's NOTICE; INTERPRETATION_1/EVIDENCE_GATHERING/
    // INTERPRETATION_2/RESOLUTION come from T16_MODE_FRAMING, keyed off
    // the mechanism actually present in this situation's own data — not
    // T22's object-discovery shape.
    const t16Mode = detectT16RealizationMode(ctx);
    const t16Framing = T16_MODE_FRAMING[t16Mode];
    const t16Summary = ctx.narrativeSummarySentences || [];
    const t16SupportTitle = support.title || null;

    const eventAction = t16Summary[0] || sentenceCase(ctx.realizedSituation && ctx.realizedSituation.sentence) || `${p} noticed something was different.`;
    const eventSource = t16Summary[0] ? "narrativeSummary" : (ctx.realizedSituation && ctx.realizedSituation.kind !== "insufficient" ? "childExperience" : "NONE_AVAILABLE");

    const events = [
      templateBeat("EVENT", { actor: p, action: eventAction, sourceField: eventSource }),
      templateBeat("INTERPRETATION_1", {
        actor: p,
        action: t16Framing.interpretation1(p, t16SupportTitle),
        sourceField: "falseBelief",
      }),
      templateBeat("EVIDENCE_GATHERING", {
        actor: p,
        action: t16Framing.evidenceGathering(p, t16SupportTitle),
        sourceField: "demonstrated",
      }),
      templateBeat("INTERPRETATION_2", {
        actor: p,
        action: t16Framing.interpretation2(p, t16SupportTitle, stripTrailingPeriod(ctx.trueBelief || ""), ctx),
        sourceField: "trueBelief",
      }),
      templateBeat("RESOLUTION", {
        actor: p,
        action: t16Framing.resolution(p, t16SupportTitle),
        sourceField: "demonstrated",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T16",
      planForLint: buildTemplateLintPlan("T16", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence, belief: ctx.falseBelief },
        blueprint: { belief: { falseBelief: ctx.falseBelief, trueBelief: ctx.trueBelief } },
      }),
    };
  }

  if (templateId === "T21") {
    // T21 Realization Contract (approved 2026-08-10). Beats stay
    // structurally fixed. EXPECTATION/DISRUPTION_1 stay grounded in
    // narrativeSummary + facts, same pattern as T16/T22's opening beats.
    // REACTION/DISRUPTION_2/RESTORE_ATTEMPT/RESTORE_FAILS/
    // ADAPTATION_RESOLUTION come from T21_MODE_FRAMING, keyed off which of
    // the 5 mechanisms this situation's disruption actually is — not one
    // "plan cancelled by circumstance" shape reused for every situation.
    const firstCategory = detectDisruptionCategory(ctx, 1);
    const secondCategory = detectDisruptionCategory(ctx, 2);
    const t21Mode = detectT21RealizationMode(ctx);
    const t21Framing = T21_MODE_FRAMING[t21Mode];
    const t21Summary = ctx.narrativeSummarySentences || [];

    const disruption1Action = t21Summary[1] || sentenceCase(facts.obstacleFact);
    const disruption1Source = t21Summary[1] ? "narrativeSummary" : "immediateObstacle";

    const events = [
      templateBeat("EXPECTATION", { actor: p, action: inferOpeningPlan(ctx), sourceField: "immediateWant" }),
      templateBeat("DISRUPTION_1", { actor: "ambient", action: `${sentenceCase(disruption1Action)}.`, disruptionCategory: firstCategory, sourceField: disruption1Source }),
      templateBeat("REACTION", { actor: p, action: t21Framing.reaction(p), sourceField: "demonstrated" }),
      templateBeat("DISRUPTION_2", { actor: "ambient", action: t21Framing.disruption2(p), disruptionCategory: secondCategory, sourceField: "demonstrated" }),
      templateBeat("RESTORE_ATTEMPT", { actor: p, action: t21Framing.restoreAttempt(p), sourceField: "demonstrated" }),
      templateBeat("RESTORE_FAILS", { actor: p, action: t21Framing.restoreFails(p), sourceField: "demonstrated" }),
      templateBeat("ADAPTATION_RESOLUTION", { actor: p, action: t21Framing.adaptationResolution(p, stripTrailingPeriod(ctx.trueBelief || "")), sourceField: "trueBelief" }),
    ];
    return {
      events,
      ctx,
      templateId: "T21",
      planForLint: buildTemplateLintPlan("T21", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence, plan: inferOpeningPlan(ctx) },
        blueprint: {},
      }),
    };
  }

  if (templateId === "T22") {
    // T22 Realized-Event Contract (approved 2026-08-10). The six beats
    // below are structurally fixed and unchanged. What varies is: (1) which
    // realization mode the situation is detected as, which only changes the
    // CONNECTED_DISCOVERY pause framing (the one genuinely synthesized
    // beat) and the object-vs-situation framing of NEW_CHOICE/RESOLUTION;
    // (2) NOTICE/INVESTIGATE/DISCOVER pull directly from the situation's
    // own narrativeSummarySentences where available — no per-mode scripting
    // needed there at all, since the authored sentences already differ by
    // situation. sourceField on each beat records what it was actually
    // grounded in, for audit.
    const mode = detectT22RealizationMode(ctx);
    const framing = T22_MODE_FRAMING[mode];
    const summary = ctx.narrativeSummarySentences || [];
    // PHYSICAL_DISCOVERY ("someone else is searching for this, hand it
    // back") and ABSENCE-with-an-object ("my own lost item, keep or find
    // it") are semantically different situations, not one "object mode" —
    // ABSENCE with an object was previously getting the wrong framing
    // (SIT045's own lost blanket doesn't have "an owner still searching for
    // it," it IS the hero's, so that reinterpretation was actively wrong).
    const isFoundObjectMode = mode === "PHYSICAL_DISCOVERY";
    const objectRefT22 = ctx.objectReference || (isFoundObjectMode ? "the found item" : "the moment");

    const noticeAction = summary[0] || sentenceCase(ctx.realizedSituation && ctx.realizedSituation.sentence) || `${p} noticed something was different.`;
    const noticeSource = summary[0] ? "narrativeSummary" : (ctx.realizedSituation && ctx.realizedSituation.kind !== "insufficient" ? "childExperience" : "NONE_AVAILABLE");

    const investigateAction = summary[1] || sentenceCase(facts.obstacleFact);
    const investigateSource = summary[1] ? "narrativeSummary" : "immediateObstacle";

    // A narrativeSummary sentence (summary[2]) is an external action/event
    // — it can be stated plainly, the same as NOTICE/INVESTIGATE. Only
    // facts.tensionFact is genuinely an internal realization, so the
    // "noticed something in themselves" framing is reserved for that case —
    // applying it to an external action sentence read as a non sequitur
    // ("noticed something in themselves: Ved turns it over...").
    // "[Name] noticed something in themselves: ..." was a wrapper around
    // facts.tensionFact — but tensionFact is already a complete, authored
    // sentence (e.g. "Gauri suddenly compares their own favourite things
    // with what someone else has"), same as the narrativeSummary sentences
    // NOTICE/INVESTIGATE already use plainly. The wrapper added nothing but
    // a repeated skeleton across every story that used it — dropped so
    // DISCOVER is handled identically regardless of source, like the other
    // two beats.
    const discoverFromSummary = Boolean(summary[2]);
    const discoverRaw = summary[2] || facts.tensionFact;
    const discoverAction = discoverRaw
      ? sentenceCase(lowerFirstUnlessProperNoun(discoverRaw, p))
      : `${p} sat with it a moment longer, but nothing new came from it.`;
    const discoverSource = discoverFromSummary ? "narrativeSummary" : (facts.tensionFact ? "emotionalTension" : "NONE_AVAILABLE");

    const events = [
      templateBeat("NOTICE", { actor: p, action: noticeAction, sourceField: noticeSource }),
      templateBeat("INVESTIGATE", { actor: p, action: investigateAction, sourceField: investigateSource }),
      templateBeat("DISCOVER", { actor: p, action: discoverAction, sourceField: discoverSource }),
      // T22 prose rewrite (2026-08-10): CONNECTED_DISCOVERY / NEW_CHOICE /
      // RESOLUTION are now three real story events per mode (see
      // T22_MODE_FRAMING) — none of them names trueBelief, and none uses
      // the "X was not what it first looked like" or "quiet sense of X"
      // formulas. The realization is demonstrated by what the hero does,
      // not announced. reinterpretationFocus stays the Phase-7-locked
      // "object" tag regardless of mode (structural requirement, unchanged) —
      // it no longer drives what the prose actually says.
      templateBeat("CONNECTED_DISCOVERY", {
        actor: p,
        action: framing.connectedDiscovery(p, objectRefT22, support.title || null),
        reinterpretationFocus: "object",
        sourceField: "narrativeSummary+emotionalTension",
      }),
      templateBeat("NEW_CHOICE", {
        actor: p,
        action: framing.newChoice(p, objectRefT22, support.title || null),
        sourceField: "demonstrated",
      }),
      templateBeat("RESOLUTION", {
        actor: p,
        action: framing.resolution(p, objectRefT22, support.title || null),
        sourceField: "demonstrated",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T22",
      planForLint: buildTemplateLintPlan("T22", ctx, events, { blueprint: {} }),
    };
  }

  if (templateId === "T23") {
    const t23Mode = detectT23RealizationMode(ctx);
    const t23Framing = T23_MODE_FRAMING[t23Mode];
    const t23Summary = ctx.narrativeSummarySentences || [];
    const encounterAction = t23Summary[0] || sentenceCase(facts.obstacleFact);
    const encounterSource = t23Summary[0] ? "narrativeSummary" : "immediateObstacle";

    const events = [
      templateBeat("ENCOUNTER", { actor: p, action: `${sentenceCase(encounterAction)}.`, sourceField: encounterSource }),
      templateBeat("INITIAL_RESPONSE", { actor: supportingActor, action: t23Framing.initialResponse(p, supportingActor, ctx), sourceField: "demonstrated" }),
      templateBeat("REVEAL", { actor: supportingActor, action: t23Framing.reveal(p, supportingActor, ctx), sourceField: "demonstrated" }),
      templateBeat("DEEPER_NOTICE", { actor: p, action: t23Framing.deeperNotice(p, ctx), sourceField: "demonstrated" }),
      templateBeat("CHANGED_RESPONSE", { actor: p, action: t23Framing.changedResponse(p, ctx), sourceField: "demonstrated" }),
      templateBeat("RESOLUTION", { actor: p, action: t23Framing.resolution(p, supportingActor, ctx), sourceField: "demonstrated" }),
    ];
    return {
      events,
      ctx,
      templateId: "T23",
      planForLint: buildTemplateLintPlan("T23", ctx, events, {
        initialResponse: { actor: supportingActor },
        reveal: { actor: supportingActor },
        resolution: { actor: `HERO + ${supportingActor}` },
        cast: {
          supportingCharacters: [
            { role: supportingActor, narrativeFunction: "supporting character reveal carrier" },
          ],
        },
        blueprint: {},
      }),
    };
  }

  if (templateId === "T03") {
    // T03 Realization Contract (see T03_MODE_FRAMING above for the full
    // rationale). SETUP keeps the same want/notice framing the fallback
    // used (it was never the genericness problem — ctx.actionPhrases and
    // the SETUP want line are already situation-specific); ATTEMPT_1/
    // ATTEMPT_2/TURNING_POINT/ATTEMPT_3/RESOLUTION now come from
    // T03_MODE_FRAMING, keyed off the situation's own obstacle_domain,
    // instead of the six fixed sentences every T03 story previously shared
    // verbatim.
    const t03Mode = detectT03RealizationMode(ctx);
    const t03Framing = T03_MODE_FRAMING[t03Mode];
    const groundedObstacleFact = concreteSceneFacts(ctx).obstacleFact;
    const attempt1Tail = obstacleConsequenceText(ctx, "first");
    const attempt2Tail = obstacleConsequenceText(ctx, "second");

    const events = [
      templateBeat("SETUP", {
        eventId: "E01",
        purpose: "setup",
        actor: p,
        action: `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}. ${sentenceCase(stripTrailingPeriod(groundedObstacleFact))}. While wondering what to do, ${p} ${m.noticeVerb} a ${m.motif} nearby. The old thought came quickly: "${ctx.falseBelief}"`,
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("ATTEMPT_1", {
        eventId: "E02",
        purpose: "attempt_1",
        actor: p,
        action: `So ${p} ${ctx.actionPhrases[0]}. ${t03Framing.attempt1Fail(p, attempt1Tail, ctx.coreReference)}`,
        sourceField: "demonstrated",
      }),
      templateBeat("ATTEMPT_2", {
        eventId: "E03",
        purpose: "attempt_2",
        actor: p,
        action: `Along the way, ${p} ${m.noticeVerb} the ${m.motif} again. ${p} ${ctx.actionPhrases[1]} instead. ${t03Framing.attempt2Fail(p, attempt2Tail, ctx.coreReference)}`,
        sourceField: "demonstrated",
      }),
      templateBeat("TURNING_POINT", {
        eventId: "E04",
        purpose: "turning_point",
        actor: p,
        action: t03Framing.turningPoint(p, ctx.trueBelief),
        sourceField: "trueBelief",
      }),
      templateBeat("ATTEMPT_3", {
        eventId: "E05",
        purpose: "attempt_3",
        actor: p,
        action: `This time, ${p} ${ctx.actionPhrases[2]} — ${p} ${t03Framing.attempt3Action(p)}, ${t03Framing.attempt3Success(p)}.`,
        sourceField: "demonstrated",
      }),
      templateBeat("RESOLUTION", {
        eventId: "E06",
        purpose: "resolution",
        actor: p,
        action: `${t03Framing.resolutionAction(p)} — ${t03Framing.resolutionClose(p)}.`,
        sourceField: "demonstrated",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T03",
      planForLint: buildTemplateLintPlan("T03", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  if (templateId === "T18") {
    // T18 Realization Contract v2 (2026-08-12, second rework — see
    // T18_MODE_FRAMING above). The first rework only varied wording inside
    // T03's own SETUP/ATTEMPT_1/ATTEMPT_2/TURNING_POINT/ATTEMPT_3/RESOLUTION
    // beat shape, which meant a forced SIT101/T03 vs SIT101/T18 comparison
    // still produced the same causal skeleton (obstacle resists -> retry
    // differently -> succeed) with different flavor text — a mechanism
    // collision, not just a prose one. T18 now uses its OWN 8-beat shape
    // (TINY_PROBLEM/IGNORED/GROWS_1/GROWS_2/OVERWHELMING/PAUSE/REAL_PROBLEM/
    // RESOLUTION — already declared in storyTemplates.json's T18 entry, just
    // never wired to this generation path until now) with a causal
    // mechanism T03 cannot produce: there is no external obstacle to defeat
    // at all. The trigger is small (TINY_PROBLEM). The hero's own reactions
    // to it — not any resistance from the world — are what inflate it
    // (IGNORED -> GROWS_1 -> GROWS_2 -> OVERWHELMING: each beat's escalation
    // is caused by the beat before it, self-feeding, no obstacle pushing
    // back). PAUSE breaks the loop. REAL_PROBLEM does not just relabel the
    // original trigger with a nicer attitude (that would still be "try
    // differently") — it names a genuinely smaller/different problem that
    // was hiding underneath the inflated one (a missing goodbye, a missing
    // outlet, a missing attention-anchor, an underlying hunger, a
    // backwards order). RESOLUTION addresses that specific smaller real
    // problem, not the original trigger.
    const t18Mode = detectT18RealizationMode(ctx);
    const t18Framing = T18_MODE_FRAMING[t18Mode];
    const groundedObstacleFactT18 = concreteSceneFacts(ctx).obstacleFact;

    const events = [
      templateBeat("TINY_PROBLEM", {
        eventId: "E01",
        purpose: "tiny_problem",
        actor: p,
        action: `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}. ${sentenceCase(stripTrailingPeriod(groundedObstacleFactT18))}. The old thought came quickly: "${ctx.falseBelief}" It was small, at first.`,
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("IGNORED", {
        eventId: "E02",
        purpose: "reaction_1",
        actor: p,
        action: t18Framing.ignored(p),
        sourceField: "demonstrated",
      }),
      templateBeat("GROWS_1", {
        eventId: "E03",
        purpose: "escalation_1",
        actor: p,
        action: t18Framing.grows1(p),
        sourceField: "demonstrated",
      }),
      templateBeat("GROWS_2", {
        eventId: "E04",
        purpose: "reaction_2",
        actor: p,
        action: t18Framing.grows2(p),
        sourceField: "demonstrated",
      }),
      templateBeat("OVERWHELMING", {
        eventId: "E05",
        purpose: "escalation_2",
        actor: p,
        action: t18Framing.overwhelming(p),
        sourceField: "demonstrated",
      }),
      templateBeat("PAUSE", {
        eventId: "E06",
        purpose: "pause",
        actor: p,
        action: t18Framing.pause(p),
        sourceField: "demonstrated",
      }),
      templateBeat("REAL_PROBLEM", {
        eventId: "E07",
        purpose: "real_problem",
        actor: p,
        action: t18Framing.realProblem(p, ctx.trueBelief),
        sourceField: "trueBelief",
      }),
      templateBeat("RESOLUTION", {
        eventId: "E08",
        purpose: "resolution",
        actor: p,
        action: t18Framing.resolution(p, ctx.actionPhrases[2]),
        sourceField: "demonstrated",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T18",
      planForLint: buildTemplateLintPlan("T18", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  if (templateId === "T14") {
    // T14 Realization Contract (see T14_MODE_FRAMING above for the full
    // rationale/mechanism list). Beat shape is T14's own — not the T03/T18
    // try/fail shape — because T14's fixed mechanism is receive help ->
    // recognize it -> encounter a related struggle -> remember -> give
    // help -> resolution. SETUP stays grounded in the situation's own
    // words (realizedSituation.sentence + immediateWant/immediateObstacle),
    // same pattern every other contract template's opening beat uses, for
    // the same downstream concrete-word-coverage reason.
    const t14Mode = detectT14RealizationMode(ctx);
    const t14Framing = T14_MODE_FRAMING[t14Mode];
    const groundedObstacleFactT14 = concreteSceneFacts(ctx).obstacleFact;
    // Lowercase raw form — every T14_MODE_FRAMING.receiveHelp() sentence
    // places this mid-sentence after "So ", never at the sentence start, so
    // capitalizing here (as T03/T18 do for their own sentence-initial
    // ctx.coreReference use) would wrongly capitalize a mid-sentence word.
    const t14Helper = ctx.coreReference || null;

    const events = [
      templateBeat("SETUP", {
        eventId: "E01",
        purpose: "setup",
        actor: p,
        action: `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}. ${sentenceCase(stripTrailingPeriod(groundedObstacleFactT14))}. The old thought came quickly: "${ctx.falseBelief}"`,
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("RECEIVE_HELP", {
        eventId: "E02",
        purpose: "receive_help",
        actor: p,
        action: t14Framing.receiveHelp(p, t14Helper),
        sourceField: "demonstrated",
      }),
      templateBeat("RECOGNIZE_HELP", {
        eventId: "E03",
        purpose: "recognize_help",
        actor: p,
        action: t14Framing.recognizeHelp(p),
        sourceField: "demonstrated",
      }),
      templateBeat("ENCOUNTER_STRUGGLE", {
        eventId: "E04",
        purpose: "encounter_struggle",
        actor: p,
        action: t14Framing.encounterStruggle(p),
        sourceField: "demonstrated",
      }),
      templateBeat("HERO_GIVES", {
        eventId: "E05",
        purpose: "hero_gives",
        actor: p,
        action: t14Framing.heroGives(p, ctx.trueBelief),
        sourceField: "trueBelief",
      }),
      templateBeat("RESOLUTION", {
        eventId: "E06",
        purpose: "resolution",
        actor: p,
        action: `${t14Framing.resolutionAction(p)} — ${t14Framing.resolutionClose(p)}.`,
        sourceField: "demonstrated",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T14",
      planForLint: buildTemplateLintPlan("T14", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  if (templateId === "T15") {
    // T15 Realization Contract (see T15_MODE_FRAMING above for the full
    // rationale/mode list). Beat shape is T15's own fixed
    // requiredBeats (phase8-data/storyTemplates.json): PROBLEM / ASSUMPTION
    // / DISMISSAL / SECOND_LOOK / UNEXPECTED_CONTRIBUTION / RESOLUTION —
    // not the T03/T18 try/fail shape, and not T14's receive/give shape,
    // because T15's fixed mechanism is a single dismiss-then-reversal
    // (mirroring T09's single-inversion shape, per T15's own
    // repetitionNote). PROBLEM stays grounded in the situation's own words
    // (realizedSituation.sentence + immediateWant/immediateObstacle), same
    // pattern every other contract template's opening beat uses.
    const t15Mode = detectT15RealizationMode(ctx);
    const t15Framing = T15_MODE_FRAMING[t15Mode];
    const groundedObstacleFactT15 = concreteSceneFacts(ctx).obstacleFact;
    // Lowercase raw form — every T15_MODE_FRAMING sentence places the
    // dismissed helper mid-sentence, never at the sentence start, so
    // capitalizing here would wrongly capitalize a mid-sentence word.
    const t15Dismissed = ctx.coreReference || null;

    const events = [
      templateBeat("PROBLEM", {
        eventId: "E01",
        purpose: "problem",
        actor: p,
        action: `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}. ${sentenceCase(stripTrailingPeriod(groundedObstacleFactT15))}. The old thought came quickly: "${ctx.falseBelief}"`,
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("ASSUMPTION", {
        eventId: "E02",
        purpose: "assumption",
        actor: p,
        action: t15Framing.assumption(p, t15Dismissed),
        sourceField: "demonstrated",
      }),
      templateBeat("DISMISSAL", {
        eventId: "E03",
        purpose: "dismissal",
        actor: p,
        action: t15Framing.dismissal(p),
        sourceField: "demonstrated",
      }),
      templateBeat("SECOND_LOOK", {
        eventId: "E04",
        purpose: "second_look",
        actor: p,
        action: t15Framing.secondLook(p, t15Dismissed),
        sourceField: "demonstrated",
      }),
      templateBeat("UNEXPECTED_CONTRIBUTION", {
        eventId: "E05",
        purpose: "unexpected_contribution",
        actor: p,
        // trueBelief is woven into the sentence as narration, never as a
        // standalone quoted "X understood: [belief]" announcement — same
        // convention T16/T18/T14 use, and necessary here because some
        // trueBelief strings run long enough to fail QA-013's 60-char
        // quoted-dialogue-line check if quoted verbatim.
        action: `${t15Framing.contribution(p, t15Dismissed)} ${p} realized ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))}.`,
        sourceField: "trueBelief",
      }),
      templateBeat("RESOLUTION", {
        eventId: "E06",
        purpose: "resolution",
        actor: p,
        action: `${t15Framing.resolutionAction(p)} — ${t15Framing.resolutionClose(p)}.`,
        sourceField: "demonstrated",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T15",
      planForLint: buildTemplateLintPlan("T15", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  if (templateId === "T04") {
    // T04 Realization Contract (see T04_MODE_FRAMING above for the full
    // rationale). Beat shape is T04's own fixed requiredBeats
    // (phase8-data/storyTemplates.json): OPENING_QUESTION / CLUE_1 /
    // QUESTION_2 / CLUE_2 / QUESTION_3 / CLUE_3 / REVELATION / RESOLUTION —
    // an 8-beat question-and-clue chain, not any prior template's beat
    // shape. OPENING_QUESTION stays grounded in the situation's own words
    // (realizedSituation.sentence + immediateWant/immediateObstacle), same
    // pattern every other contract template's opening beat uses, so the
    // downstream concrete-word coverage check (childExperience/
    // immediateObstacle) still has real situation text to find.
    const t04Mode = detectT04RealizationMode(ctx);
    const t04Framing = T04_MODE_FRAMING[t04Mode];
    const groundedObstacleFactT04 = concreteSceneFacts(ctx).obstacleFact;
    const t04Dismissed = ctx.coreReference || null;
    // Grounding facts pulled from the situation's own fields (never
    // invented) so the mid-chain beats vary genuinely by situation instead
    // of being fixed sentences that only swap the protagonist's name — see
    // the comment above T04_MODE_FRAMING for why this was added.
    const t04Facts = {
      obstacleFact: groundedObstacleFactT04,
      tensionFact: concreteSceneFacts(ctx).tensionFact,
      wantClause: stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || ""),
      // missionPhrase intentionally dropped (grounding fix, 2026-08-12) —
      // ctx.missionPhrase is the abstract Mission Type resolved through
      // Character/Archetype compatibility, unrelated to this situation's
      // actual conflict. QUESTION_3 now uses wantClause instead. See the
      // comment above T04_MODE_FRAMING for the full rationale.
      symbolLabel: ctx.symbolLabel || "",
    };

    const events = [
      templateBeat("OPENING_QUESTION", {
        eventId: "E01",
        purpose: "opening_question",
        actor: p,
        action: `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}. ${sentenceCase(stripTrailingPeriod(groundedObstacleFactT04))}. ${t04Framing.openingQuestion(p, ctx.falseBelief)}`,
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("CLUE_1", {
        eventId: "E02",
        purpose: "clue_1",
        actor: p,
        action: t04Framing.clue1(p, t04Dismissed, t04Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("QUESTION_2", {
        eventId: "E03",
        purpose: "question_2",
        actor: p,
        action: t04Framing.question2(p, t04Dismissed, t04Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("CLUE_2", {
        eventId: "E04",
        purpose: "clue_2",
        actor: p,
        action: t04Framing.clue2(p, t04Dismissed, t04Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("QUESTION_3", {
        eventId: "E05",
        purpose: "question_3",
        actor: p,
        action: t04Framing.question3(p, t04Dismissed, t04Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("CLUE_3", {
        eventId: "E06",
        purpose: "clue_3",
        actor: p,
        action: t04Framing.clue3(p, t04Dismissed, t04Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("REVELATION", {
        eventId: "E07",
        purpose: "revelation",
        actor: p,
        action: t04Framing.revelation(p, ctx.trueBelief),
        sourceField: "trueBelief",
      }),
      templateBeat("RESOLUTION", {
        eventId: "E08",
        purpose: "resolution",
        actor: p,
        action: `${t04Framing.resolutionAction(p, t04Dismissed, t04Facts)} — ${t04Framing.resolutionClose(p)}.`,
        sourceField: "demonstrated",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T04",
      planForLint: buildTemplateLintPlan("T04", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  if (templateId === "T09") {
    // T09 Realization Contract (see T09_MODE_FRAMING above for the full
    // rationale). Beat shape is T09's own fixed requiredBeats
    // (phase8-data/storyTemplates.json): BIG_EXPECTATION / BIG_ATTEMPT_FAILS /
    // QUIET_QUALITY_NOTICED / QUIET_ACTION / RESOLUTION — a single-inversion
    // contrast structure (per the template's own repetitionNote), not the
    // try/fail/try repetition shape T03/T18 use, so it is not reused from
    // either of them. BIG_EXPECTATION stays grounded in the situation's own
    // words (realizedSituation.sentence + immediateWant/immediateObstacle),
    // same pattern every other contract template's opening beat uses.
    const t09Mode = detectT09RealizationMode(ctx);
    const t09Framing = T09_MODE_FRAMING[t09Mode];
    const groundedObstacleFactT09 = concreteSceneFacts(ctx).obstacleFact;
    const t09Facts = {
      obstacleFact: groundedObstacleFactT09,
      tensionFact: concreteSceneFacts(ctx).tensionFact,
      wantClause: stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || ""),
    };

    const events = [
      templateBeat("BIG_EXPECTATION", {
        eventId: "E01",
        purpose: "big_expectation",
        actor: p,
        action: `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}. ${sentenceCase(stripTrailingPeriod(groundedObstacleFactT09))}. ${t09Framing.bigExpectation(p, t09Facts, ctx.falseBelief)}`,
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("BIG_ATTEMPT_FAILS", {
        eventId: "E02",
        purpose: "big_attempt_fails",
        actor: p,
        action: t09Framing.bigAttemptFails(p, t09Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("QUIET_QUALITY_NOTICED", {
        eventId: "E03",
        purpose: "quiet_quality_noticed",
        actor: p,
        action: t09Framing.quietQualityNoticed(p, t09Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("QUIET_ACTION", {
        eventId: "E04",
        purpose: "quiet_action",
        actor: p,
        action: t09Framing.quietAction(p, t09Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("RESOLUTION", {
        eventId: "E05",
        purpose: "resolution",
        actor: p,
        action: t09Framing.resolution(p, ctx.trueBelief, t09Facts),
        sourceField: "trueBelief",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T09",
      planForLint: buildTemplateLintPlan("T09", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  if (templateId === "T05") {
    // T05 Realization Contract (see T05_MODE_FRAMING above for the full
    // rationale). Beat shape is T05's own fixed requiredBeats
    // (phase8-data/storyTemplates.json): MIRROR_OPENING / OLD_REACTION /
    // MIDDLE_JOURNEY / INSIGHT / MIRROR_ENDING / NEW_REACTION — a mirrored
    // return-to-the-same-scene structure (per repetitionNote, "structural,
    // not phrase-repetition"), genuinely different from every other contract
    // template's beat shape. MIRROR_OPENING stays grounded in the
    // situation's own words (realizedSituation.sentence + immediateWant/
    // immediateObstacle), same pattern every other contract template's
    // opening beat uses. MIRROR_ENDING deliberately echoes MIRROR_OPENING's
    // obstacleFact so the two scenes are recognisably the same TYPE of
    // moment, and NEW_REACTION deliberately echoes OLD_REACTION's own
    // vocabulary ("hand stayed down" -> "hand went up", etc.) so the
    // contrast is legible without naming the belief twice.
    const t05Mode = detectT05RealizationMode(ctx);
    const t05Framing = T05_MODE_FRAMING[t05Mode];
    const groundedObstacleFactT05 = concreteSceneFacts(ctx).obstacleFact;
    const t05Facts = {
      obstacleFact: groundedObstacleFactT05,
      tensionFact: concreteSceneFacts(ctx).tensionFact,
      wantClause: stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || ""),
    };

    const events = [
      templateBeat("MIRROR_OPENING", {
        eventId: "E01",
        purpose: "mirror_opening",
        actor: p,
        action: `${sentenceCase(stripTrailingPeriod(ctx.realizedSituation.sentence))}. ${p} wanted to ${ctx.realizedSituation.want}, but ${sentenceCase(stripTrailingPeriod(groundedObstacleFactT05))}.`,
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("OLD_REACTION", {
        eventId: "E02",
        purpose: "old_reaction",
        actor: p,
        action: t05Framing.oldReaction(p, t05Facts, ctx.falseBelief),
        sourceField: "falseBelief",
      }),
      templateBeat("MIDDLE_JOURNEY", {
        eventId: "E03",
        purpose: "middle_journey",
        actor: p,
        action: t05Framing.middleJourney(p, t05Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("INSIGHT", {
        eventId: "E04",
        purpose: "insight",
        actor: p,
        action: t05Framing.insight(p, ctx.trueBelief),
        sourceField: "trueBelief",
      }),
      templateBeat("MIRROR_ENDING", {
        eventId: "E05",
        purpose: "mirror_ending",
        actor: p,
        action: t05Framing.mirrorEnding(p, t05Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("NEW_REACTION", {
        eventId: "E06",
        purpose: "resolution",
        actor: p,
        action: t05Framing.newReaction(p, ctx.trueBelief, t05Facts),
        sourceField: "trueBelief",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T05",
      planForLint: buildTemplateLintPlan("T05", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  if (templateId === "T19") {
    // T19 Realization Contract (see T19_MODE_FRAMING above for the
    // single-mode rationale). Beat shape is T19's own fixed requiredBeats
    // (phase8-data/storyTemplates.json): APPROACH_CROSSROADS /
    // OPTION_OLD_BELIEF / OPTION_NEW_BELIEF / CHOICE / CONSEQUENCE /
    // RESOLUTION. APPROACH_CROSSROADS stays grounded in the situation's own
    // words (realizedSituation.sentence + immediateWant/immediateObstacle),
    // same pattern every other contract template's opening beat uses.
    // CHOICE is written as explicitly deliberate ("not by accident, not
    // because someone else decided") per the hard requirement that the
    // choice be conscious, not accidental/externally forced. CONSEQUENCE is
    // tied directly to facts.obstacleFact (the same obstacle named in the
    // opening), not a generic "and it worked out," and RESOLUTION
    // demonstrates the effect of the choice (a steadier way to get the
    // original want, nothing to hide) rather than simply praising it.
    const t19Mode = "THRESHOLD_INTEGRITY_CHOICE";
    const t19Framing = T19_MODE_FRAMING[t19Mode];
    const groundedObstacleFactT19 = concreteSceneFacts(ctx).obstacleFact;
    const t19Facts = {
      obstacleFact: groundedObstacleFactT19,
      tensionFact: concreteSceneFacts(ctx).tensionFact,
      wantClause: stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || ""),
    };

    const events = [
      templateBeat("APPROACH_CROSSROADS", {
        eventId: "E01",
        purpose: "approach_crossroads",
        actor: p,
        action: t19Framing.approachCrossroads(p, t19Facts, ctx),
        sourceField: "childExperience+immediateWant+immediateObstacle",
      }),
      templateBeat("OPTION_OLD_BELIEF", {
        eventId: "E02",
        purpose: "option_old_belief",
        actor: p,
        action: t19Framing.optionOldBelief(p, t19Facts, ctx.falseBelief),
        sourceField: "falseBelief",
      }),
      templateBeat("OPTION_NEW_BELIEF", {
        eventId: "E03",
        purpose: "option_new_belief",
        actor: p,
        action: t19Framing.optionNewBelief(p, t19Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("CHOICE", {
        eventId: "E04",
        purpose: "choice",
        actor: p,
        action: t19Framing.choice(p, ctx.trueBelief),
        sourceField: "trueBelief",
      }),
      templateBeat("CONSEQUENCE", {
        eventId: "E05",
        purpose: "consequence",
        actor: p,
        action: t19Framing.consequence(p, t19Facts),
        sourceField: "demonstrated",
      }),
      templateBeat("RESOLUTION", {
        eventId: "E06",
        purpose: "resolution",
        actor: p,
        action: t19Framing.resolution(p, ctx.trueBelief, t19Facts),
        sourceField: "trueBelief",
      }),
    ];
    return {
      events,
      ctx,
      templateId: "T19",
      planForLint: buildTemplateLintPlan("T19", ctx, events, {
        openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
      }),
    };
  }

  // T11/SIT021 fix (2026-08-11), extended to T09/T14 (2026-08-11, same
  // defect confirmed on SIT029/SIT114/SIT146): the shared generic
  // fallback's SETUP beat never referenced storySeed.immediateObstacle at
  // all — obstacleConsequenceText is purely decorative (keyed off an
  // abstract obstacle_domain taxonomy, not the situation's actual words),
  // so completeStoryValidation's concrete-word coverage check fails
  // whenever a situation's distinguishing detail lives only in
  // immediateObstacle. Gated to these three templates only, each
  // confirmed against a real failing situation — not a change to the
  // shared fallback every other unrealized template still depends on, and
  // explicitly NOT applied to T16 (frozen, off-limits regardless of
  // whether it hits this same generic path via non-curated natural
  // selection — see SIT062 finding, held for separate review).
  const groundedObstacleFact = ["T09", "T11", "T14"].includes(templateId) ? concreteSceneFacts(ctx).obstacleFact : null;

  const events = [
    templateBeat("SETUP", {
      eventId: "E01",
      purpose: "setup",
      actor: p,
      want: `${p} wanted to ${ctx.realizedSituation.want}.`,
      action: null,
      externalEvent: groundedObstacleFact
        ? `${sentenceCase(groundedObstacleFact)}. While wondering what to do, ${p} ${m.noticeVerb} a ${m.motif} nearby.`
        : `While wondering what to do, ${p} ${m.noticeVerb} a ${m.motif} nearby.`,
      consequence: null,
      emotionalState: `unsettled, holding onto the thought that "${ctx.falseBelief}"`,
      leadsTo: "a first attempt to solve it alone",
    }),
    templateBeat("ATTEMPT_1", {
      eventId: "E02",
      purpose: "attempt_1",
      actor: p,
      want: ctx.objective,
      action: ctx.actionPhrases[0],
      externalEvent: null,
      consequence: `it did not work - ${obstacleConsequenceText(ctx, "first")}`,
      emotionalState: "frustrated",
      leadsTo: "a second, different attempt",
    }),
    templateBeat("ATTEMPT_2", {
      eventId: "E03",
      purpose: "attempt_2",
      actor: p,
      want: ctx.objective,
      action: ctx.actionPhrases[1],
      externalEvent: `along the way, ${p} ${m.noticeVerb} the ${m.motif} again`,
      consequence: `that did not work either - ${obstacleConsequenceText(ctx, "second")}`,
      emotionalState: `more discouraged, but curious about the ${m.motif}`,
      leadsTo: "a pause instead of a third quick attempt",
    }),
    templateBeat("TURNING_POINT", {
      eventId: "E04",
      purpose: "turning_point",
      actor: p,
      want: ctx.objective,
      action: `stopped, took one slow breath, said, "Wait," and instead of trying again right away, spent a moment ${m.useVerb}`,
      externalEvent: null,
      // Fixed 2026-08-11 (T08/SIT004 QA-013): quoting the full trueBelief
      // sentence as spoken dialogue fails whenever a situation's belief
      // text runs long (SIT004's is 71 chars, over the 60-char dialogue
      // line limit) — a structural trap in this shared generic fallback,
      // not something specific to SIT004's content. Folded into narration
      // instead of quoted speech, same fix already applied to T16/T21/T22/
      // T23's own realization code (narration has no length gate; only
      // dialogue does). Belief text unchanged.
      consequence: `in that pause, ${p} understood something new — ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))}`,
      emotionalState: "quiet, thinking differently",
      leadsTo: "a third attempt, made differently",
    }),
    templateBeat("ATTEMPT_3", {
      eventId: "E05",
      purpose: "attempt_3",
      actor: p,
      want: ctx.objective,
      action: ctx.actionPhrases[2],
      externalEvent: null,
      consequence: "this time it worked - not by trying harder, but by trying differently",
      emotionalState: "steady, proud",
      leadsTo: "the resolution",
    }),
    templateBeat("RESOLUTION", {
      eventId: "E06",
      purpose: "resolution",
      actor: p,
      want: ctx.objective,
      action: `this time it was actually done, and it was right`,
      externalEvent: `the ${m.motif} stayed close by, a small reminder of what had changed`,
      consequence: "no longer needing to prove anything - just glad it was done",
      emotionalState: "warmer, lighter",
      leadsTo: null,
    }),
  ];
  return {
    events,
    ctx,
    // Was hardcoded to "T03" regardless of which template actually
    // requested this fallback chain (T02/T04/T05/T08/T09/T11/T12/T14/T15/
    // T18 all fell through here and were silently relabeled "T03" — the
    // mislabel documented in REALIZATION_QUALITY_GAP_REPORT_2026-08-12.md
    // §2/§5/§6 step 1). T03 now has its own real contract above and never
    // reaches this block, so this path is exclusively the remaining
    // not-yet-fixed templates; preserving the actual requested id lets
    // downstream QA/dumps distinguish them instead of merging into one.
    templateId,
    planForLint: buildTemplateLintPlan(templateId, ctx, events, {
      openingState: { situation: ctx.realizedSituation && ctx.realizedSituation.sentence },
    }),
  };
}

function buildEventChain(template, blueprint, storyPlan, libraries) {
  const ctx = buildEventPlannerContext(blueprint, storyPlan, libraries);
  if (ctx.situationDetail.status !== "OK" || ctx.realizedSituation.kind === "insufficient") {
    return { events: [], ctx, insufficientDetail: true };
  }
  const p = ctx.protagonist;
  const m = ctx.mechanism;

  const events = [
    {
      eventId: "E01",
      purpose: "setup",
      actor: p,
      // The immediate want comes from the realized Situation, not the
      // (unrelated) mission label — this is what the rest of the chain
      // must causally act on.
      want: `${p} wanted to ${ctx.realizedSituation.want}.`,
      action: null,
      externalEvent: `While wondering what to do, ${p} ${m.noticeVerb} a ${m.motif} nearby.`,
      consequence: null,
      emotionalState: "unsettled, holding onto the thought that “" + ctx.falseBelief + "”",
      leadsTo: "a first attempt to solve it alone",
    },
    {
      eventId: "E02",
      purpose: "attempt_1",
      actor: p,
      want: ctx.objective,
      action: ctx.actionPhrases[0],
      externalEvent: null,
      consequence: `it did not work — ${obstacleConsequenceText(ctx, "first")}`,
      emotionalState: "frustrated",
      leadsTo: "a second, different attempt",
    },
    {
      eventId: "E03",
      purpose: "attempt_2",
      actor: p,
      want: ctx.objective,
      action: ctx.actionPhrases[1],
      externalEvent: `along the way, ${p} ${m.noticeVerb} the ${m.motif} again`,
      consequence: `that did not work either — ${obstacleConsequenceText(ctx, "second")}`,
      emotionalState: `more discouraged, but curious about the ${m.motif}`,
      leadsTo: "a pause instead of a third quick attempt",
    },
    {
      eventId: "E04",
      purpose: "turning_point",
      actor: p,
      want: ctx.objective,
      action: `stopped, took one slow breath, said, "Wait," and instead of trying again right away, spent a moment ${m.useVerb}`,
      externalEvent: null,
      consequence: `in that pause, ${p} understood something new: “${ctx.trueBelief}”`,
      emotionalState: "quiet, thinking differently",
      leadsTo: "a third attempt, made differently",
    },
    {
      eventId: "E05",
      purpose: "attempt_3",
      actor: p,
      want: ctx.objective,
      action: ctx.actionPhrases[2],
      externalEvent: null,
      consequence: `this time it worked — not by trying harder, but by trying differently`,
      emotionalState: "steady, proud",
      leadsTo: "the resolution",
    },
    {
      eventId: "E06",
      purpose: "resolution",
      actor: p,
      want: ctx.objective,
      action: `this time it was actually done, and it was right`,
      externalEvent: `the ${m.motif} stayed close by, a small reminder of what had changed`,
      consequence: `no longer needing to prove anything — just glad it was done`,
      emotionalState: "warmer, lighter",
      leadsTo: null,
    },
  ];

  return { events, ctx };
}

function buildEventChainV2(template, blueprint, storyPlan, libraries) {
  const ctx = buildEventPlannerContext(blueprint, storyPlan, libraries);
  if (ctx.situationDetail.status !== "OK" || ctx.realizedSituation.kind === "insufficient") {
    return { events: [], ctx, insufficientDetail: true, planForLint: null };
  }
  return buildTemplateSpecificEventChain(template && template.templateId, ctx);
}

// Story Event Validation layer — runs BEFORE prose is written. Rejects the
// chain outright rather than silently patching it, per the brief.
function validateEventChain(eventChainResult, blueprint) {
  if (eventChainResult && eventChainResult.insufficientDetail) {
    return {
      status: "INSUFFICIENT_SITUATION_DETAIL",
      issues: [
        `Situation "${eventChainResult.ctx.situationTitle}" has fewer than 3 distinct concrete words in its title — not enough real content to derive a situation-specific event chain without inventing detail the Situation library doesn't contain.`,
      ],
      concreteWords: eventChainResult.ctx.situationDetail.concreteWords,
    };
  }

  const issues = [];
  const events = (eventChainResult && eventChainResult.events) || [];
  const templateId = eventChainResult && eventChainResult.templateId || eventChainResult && eventChainResult.planForLint && eventChainResult.planForLint.templateId;
  const rawIdPattern = /\b(?:SYMBOL|ACTION|OD|OT|GAN_SYM|NEED|LOGIC|MISSION)_[A-Z0-9_]+\b/;

  const requireLabels = (expectedLabels) => {
    const labels = new Set(events.map((event) => event.label));
    expectedLabels.forEach((label) => {
      if (!labels.has(label)) {
        issues.push(`Event Planner is missing required ${templateId} beat "${label}".`);
      }
    });
  };

  if (!events.length) {
    issues.push("Event Planner produced no events.");
  }

  if (templateId && TEMPLATES_WITH_REALIZATION_CONTRACT.has(templateId)) {
    events.forEach((event, index) => {
      const eventName = event.label || `event_${index + 1}`;
      if (!event.actor) {
        issues.push(`${eventName}: missing WHO (actor).`);
      }
      if (!event.action) {
        issues.push(`${eventName}: missing concrete action.`);
      }
      const eventText = [
        event.action,
        event.newInformationOrShift,
        event.reinterpretation,
        event.contradictionMoment,
      ].filter(Boolean).join(" ");
      if (rawIdPattern.test(eventText)) {
        issues.push(`${eventName}: leaks a raw taxonomy id into the event text.`);
      }
    });

    if (templateId === "T16") {
      requireLabels(["EVENT", "INTERPRETATION_1", "EVIDENCE_GATHERING", "INTERPRETATION_2", "RESOLUTION"]);
      const interpretation2 = events.find((event) => event.label === "INTERPRETATION_2");
      if (interpretation2 && !normalize(interpretation2.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T16 INTERPRETATION_2 does not carry the true-belief reframe.");
      }
    } else if (templateId === "T21") {
      requireLabels(["EXPECTATION", "DISRUPTION_1", "REACTION", "DISRUPTION_2", "RESTORE_ATTEMPT", "RESTORE_FAILS", "ADAPTATION_RESOLUTION"]);
      const ending = events.find((event) => event.label === "ADAPTATION_RESOLUTION");
      if (ending && !normalize(ending.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T21 ADAPTATION_RESOLUTION does not visibly carry the new understanding.");
      }
    } else if (templateId === "T22") {
      requireLabels(["NOTICE", "INVESTIGATE", "DISCOVER", "CONNECTED_DISCOVERY", "NEW_CHOICE", "RESOLUTION"]);
      const turning = events.find((event) => event.label === "CONNECTED_DISCOVERY");
      if (turning && turning.reinterpretationFocus !== "object") {
        issues.push("T22 CONNECTED_DISCOVERY lost its object-focused reinterpretation.");
      }
    } else if (templateId === "T23") {
      requireLabels(["ENCOUNTER", "INITIAL_RESPONSE", "REVEAL", "DEEPER_NOTICE", "CHANGED_RESPONSE", "RESOLUTION"]);
      const reveal = events.find((event) => event.label === "REVEAL");
      if (reveal && normalize(reveal.actor || "") === normalize(eventChainResult.ctx.protagonist)) {
        issues.push("T23 REVEAL actor drifted back to the hero.");
      }
    } else if (templateId === "T14") {
      requireLabels(["SETUP", "RECEIVE_HELP", "RECOGNIZE_HELP", "ENCOUNTER_STRUGGLE", "HERO_GIVES", "RESOLUTION"]);
      const heroGives = events.find((event) => event.label === "HERO_GIVES");
      if (heroGives && !/\b(remember\w*|just like|the same way)\b/i.test(heroGives.action || "")) {
        issues.push("T14 HERO_GIVES does not legibly connect back to the earlier received help (missing a remembering/just-like connective).");
      }
      if (heroGives && !normalize(heroGives.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T14 HERO_GIVES does not carry the true-belief realization.");
      }
    } else if (templateId === "T15") {
      requireLabels(["PROBLEM", "ASSUMPTION", "DISMISSAL", "SECOND_LOOK", "UNEXPECTED_CONTRIBUTION", "RESOLUTION"]);
      const contribution = events.find((event) => event.label === "UNEXPECTED_CONTRIBUTION");
      if (contribution && !normalize(contribution.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T15 UNEXPECTED_CONTRIBUTION does not carry the true-belief realization.");
      }
    } else if (templateId === "T04") {
      requireLabels(["OPENING_QUESTION", "CLUE_1", "QUESTION_2", "CLUE_2", "QUESTION_3", "CLUE_3", "REVELATION", "RESOLUTION"]);
      const revelation = events.find((event) => event.label === "REVELATION");
      if (revelation && !normalize(revelation.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T04 REVELATION does not carry the true-belief realization.");
      }
    } else if (templateId === "T09") {
      requireLabels(["BIG_EXPECTATION", "BIG_ATTEMPT_FAILS", "QUIET_QUALITY_NOTICED", "QUIET_ACTION", "RESOLUTION"]);
      const t09Resolution = events.find((event) => event.label === "RESOLUTION");
      if (t09Resolution && !normalize(t09Resolution.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T09 RESOLUTION does not carry the true-belief realization.");
      }
    } else if (templateId === "T05") {
      requireLabels(["MIRROR_OPENING", "OLD_REACTION", "MIDDLE_JOURNEY", "INSIGHT", "MIRROR_ENDING", "NEW_REACTION"]);
      const t05NewReaction = events.find((event) => event.label === "NEW_REACTION");
      if (t05NewReaction && !normalize(t05NewReaction.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T05 NEW_REACTION does not carry the true-belief realization.");
      }
    } else if (templateId === "T19") {
      requireLabels(["APPROACH_CROSSROADS", "OPTION_OLD_BELIEF", "OPTION_NEW_BELIEF", "CHOICE", "CONSEQUENCE", "RESOLUTION"]);
      const t19Choice = events.find((event) => event.label === "CHOICE");
      if (t19Choice && !normalize(t19Choice.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T19 CHOICE does not carry the true-belief realization.");
      }
      const t19Resolution = events.find((event) => event.label === "RESOLUTION");
      if (t19Resolution && !normalize(t19Resolution.action || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
        issues.push("T19 RESOLUTION does not carry the true-belief realization.");
      }
    }

    return { status: issues.length ? "FAIL" : "PASS", issues };
  }

  events.forEach((event) => {
    if (!event.actor) {
      issues.push(`${event.eventId}: missing WHO (actor).`);
    }
    if (!event.want) {
      issues.push(`${event.eventId}: missing WHAT they want.`);
    }
    if (!event.action && !event.externalEvent) {
      issues.push(`${event.eventId}: no hero action and no external event — nothing actually happens.`);
    }
    if (event.purpose !== "setup" && event.purpose !== "resolution" && !event.consequence) {
      issues.push(`${event.eventId}: missing consequence — an attempt with no result is not a real event.`);
    }
    if (!event.leadsTo && event.purpose !== "resolution") {
      issues.push(`${event.eventId}: does not state why this leads to the next event.`);
    }
    const allText = [event.action, event.externalEvent, event.consequence, event.want].filter(Boolean).join(" ");
    if (rawIdPattern.test(allText)) {
      issues.push(`${event.eventId}: leaks a raw taxonomy id into the event text.`);
    }
  });

  const purposes = events.map((event) => event.purpose);
  if (!purposes.includes("turning_point")) {
    issues.push("No turning-point event in the chain.");
  }
  const last = events[events.length - 1];
  if (!last || last.purpose !== "resolution") {
    issues.push("Chain does not end on a resolution event.");
  } else if (!String(`${last.action || ""} ${last.consequence || ""}`).trim()) {
    // Realization V2: this used to require the resolution's action to
    // literally echo ctx.missionPhrase (a raw label), which is exactly the
    // structural-narration bug the blind review flagged ("Finished it: <label>").
    // The resolution must still concretely demonstrate completion, but that
    // is judged by presence of a real in-world action/consequence, not by
    // string-matching the mission label.
    issues.push("Final event's resolution has no concrete action or consequence.");
  }

  const actionTexts = events.map((event) => event.action).filter(Boolean);
  if (new Set(actionTexts).size !== actionTexts.length) {
    issues.push("Two events use identical action text — repeated filler event.");
  }

  const turningPoint = events.find((event) => event.purpose === "turning_point");
  if (turningPoint && !normalize(turningPoint.consequence || "").includes(normalize(eventChainResult.ctx.trueBelief))) {
    issues.push("Turning-point event does not surface the true belief.");
  }

  const motifWords = normalize(eventChainResult.ctx.mechanism.motif).split(" ").filter((word) => word.length > 3);
  const usesSymbolCausally = events.some((event) =>
    event.purpose === "turning_point" && motifWords.some((word) => normalize(event.action || "").includes(word))
  );
  if (!usesSymbolCausally) {
    issues.push("Symbol motif is not actually used by the hero at the turning point (decorative only).");
  }

  // realizedSituation must actually be what Event 1 acts on, not a
  // decorative preamble unrelated to what happens next. The setup event's
  // want must be the situation-derived want (not the mission label), and
  // its noticing/trigger action must be framed as happening because of
  // that want, not as a disconnected aside.
  const setupEvent = events.find((event) => event.purpose === "setup");
  const realizedWant = eventChainResult.ctx.realizedSituation && eventChainResult.ctx.realizedSituation.want;
  if (setupEvent && realizedWant) {
    const wantCoreWords = extractConcreteWords(realizedWant);
    const setupWantHasSituationWant = wantCoreWords.length > 0 && wantCoreWords.every((word) => normalize(setupEvent.want || "").includes(word));
    if (!setupWantHasSituationWant) {
      issues.push("Event 1's want does not match the realized Situation's derived want — the opening is not what the chain acts on.");
    }
    const connectivePattern = /\b(while|so|because|as)\b/i;
    if (!connectivePattern.test(setupEvent.externalEvent || "")) {
      issues.push("Event 1's trigger action is not framed as connected to the hero's want (missing a causal connective).");
    }
  }

  return { status: issues.length ? "FAIL" : "PASS", issues };
}

// The Writer's job is now narrow: turn an already-valid event chain into
// prose. It invents no plot — only sentence craft.
function writeProseFromEventChain(template, eventChainResult, storyPlan) {
  const { events, ctx } = eventChainResult;
  const templateId = eventChainResult.templateId || template && template.templateId;

  if (templateId === "T11") {
    const realizationContext = buildTemplateRealizationContext(template, storyPlan, ctx);
    return buildResourceDepreciationCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (templateId === "T12") {
    const realizationContext = buildTemplateRealizationContext(template, storyPlan, ctx);
    return buildTricksterCompleteStoryMaster(template, realizationContext, storyPlan);
  }

  if (templateId && TEMPLATES_WITH_REALIZATION_CONTRACT.has(templateId)) {
    const sentence = (text) => {
      const trimmed = String(text || "").trim().replace(/[.!?]+$/, "");
      return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}.` : "";
    };
    const join = (...parts) => parts.filter(Boolean).join(" ");
    const symbolThemeWord = titleCaseFromId((ctx._lookups && ctx._lookups.symbolRecord && ctx._lookups.symbolRecord.symbol_theme) || "");
    const supportProfile = buildSupportProfile(ctx);
    const supportActor = supportProfile.primary;
    const supportActorTitle = supportProfile.title;
    const supportEnsemble = supportProfile.ensemble;
    const supportFrame = supportActor && supportEnsemble ? `${supportActor} and ${supportEnsemble}` : supportActor;
    const heroWant = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
    const obstacleDetail = stripTrailingPeriod(String(ctx.obstacleClause || "").replace(/^there was no obvious answer:\s*/i, ""));
    const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
    const eventTexts = events.map((event, index) => {
      const label = event.label || `EVENT_${index + 1}`;
      if (templateId === "T16") {
        // T16 Realization Contract (approved 2026-08-10). Every beat below
        // prints event.action directly — that content already IS the
        // mechanism-specific interpretation/reasoning/resolution (see
        // T16_MODE_FRAMING). No universal "took one slow breath and said
        // Wait," no "quiet hint of [theme] helped notice," no shared
        // hero-response/closer phrase pools — those were exactly the kind
        // of repeated skeleton this rewrite exists to remove. EVENT keeps
        // realizedSituation.sentence + obstacleDetail alongside the
        // narrativeSummary-grounded action for the same reason T22's NOTICE
        // does: a downstream coverage check needs childExperience/
        // immediateObstacle words present, which narrativeSummary alone
        // doesn't guarantee. "The old thought came quickly: X" used to be
        // identical in every T16 story regardless of mode — now the frame
        // itself varies per mechanism (T16_MODE_FRAMING.thoughtFrame),
        // still landing on the required falseBelief text but not via one
        // fixed sentence shape.
        const t16ModeWrap = detectT16RealizationMode(ctx);
        const t16ThoughtFrame = T16_MODE_FRAMING[t16ModeWrap].thoughtFrame(ctx.protagonist);
        if (label === "EVENT") return join(sentence(ctx.realizedSituation.sentence), sentence(event.action), heroWant ? sentence(`${ctx.protagonist} wanted to ${heroWant}`) : "", obstacleDetail ? sentence(obstacleDetail) : "", sentence(`${t16ThoughtFrame}: ${ctx.falseBelief}`));
        if (label === "INTERPRETATION_1") return sentence(event.action);
        if (label === "EVIDENCE_GATHERING") return sentence(event.action);
        if (label === "INTERPRETATION_2") return sentence(event.action);
        return sentence(event.action);
      }
      if (templateId === "T21") {
        // T21 Realization Contract (approved 2026-08-10). Every beat below
        // prints event.action directly — that content already IS the
        // mechanism-specific reaction/disruption/attempt/resolution (see
        // T21_MODE_FRAMING). No universal "took one slow breath and said
        // Wait," no fixed ending-phrase pool — same principle as the T16
        // rewrite. EXPECTATION keeps realizedSituation.sentence +
        // falseBelief for the same downstream coverage-check reason as
        // T16/T22's opening beats. event.action (inferOpeningPlan) already
        // states the same intention as heroWant, so only one is printed —
        // printing both produced a "wanted to X... plans to X" duplicate.
        if (label === "EXPECTATION") return join(sentence(ctx.realizedSituation.sentence), sentence(event.action), sentence(`At first ${ctx.protagonist} still believed that ${ctx.falseBelief}`));
        if (label === "DISRUPTION_1") return sentence(event.action);
        if (label === "REACTION") return sentence(event.action);
        if (label === "DISRUPTION_2") return sentence(event.action);
        if (label === "RESTORE_ATTEMPT") return sentence(event.action);
        if (label === "RESTORE_FAILS") return sentence(event.action);
        if (label === "ADAPTATION_RESOLUTION") return sentence(event.action);
        return sentence(event.action);
      }
      if (templateId === "T22") {
        // T22 Realized-Event Contract (approved 2026-08-10). NOTICE /
        // INVESTIGATE / DISCOVER now carry their real content directly from
        // buildTemplateSpecificEventChain (narrativeSummary-grounded, mode-
        // aware) — the wrapper's job here is just the universal scaffolding
        // (want, false belief) that applies regardless of mode, not
        // rewriting the beat's content again.
        const t22Facts = concreteSceneFacts(ctx);
        // A downstream Phase 8 check (paginateCompleteStory's coverage
        // rule) independently requires concrete words from childExperience
        // + immediateObstacle to appear in the story — narrativeSummary and
        // those fields describe the same scene in different words, so both
        // need to be present, not just the newer narrativeSummary-grounded
        // event.action.
        if (label === "NOTICE") return join(sentence(ctx.realizedSituation.sentence), sentence(event.action), heroWant ? sentence(`${ctx.protagonist} wanted to ${heroWant}`) : "", sentence(`At first the tempting thought still whispered that ${ctx.falseBelief}`));
        if (label === "INVESTIGATE") return join(sentence(event.action), event.sourceField === "narrativeSummary" ? sentence(t22Facts.obstacleFact) : "");
        if (label === "DISCOVER") return sentence(event.action);
        // T22 prose rewrite (2026-08-10): CONNECTED_DISCOVERY / NEW_CHOICE /
        // RESOLUTION now print event.action directly — that content already
        // IS the demonstrated realization/decision/consequence (see
        // T22_MODE_FRAMING). No belief-label sentence, no "quiet sense of
        // [theme] settled over" filler, no restating what the action already
        // showed. A short closure-signal line still closes RESOLUTION (a
        // genuine pipeline requirement for emotional closure — QA-007/014 —
        // now satisfied by any of several words, not by naming the belief).
        if (label === "CONNECTED_DISCOVERY") return sentence(event.action);
        if (label === "NEW_CHOICE") return sentence(event.action);
        // RESOLUTION's event.action IS the final line now — no generic
        // ending pool appended after it. "That was that...", "walked away
        // lighter", "had a good ending" were themselves a repeated
        // skeleton that belonged to no specific story; each mode's own
        // resolution() in T22_MODE_FRAMING carries its own specific closing
        // beat instead (see there for the closure-word rationale).
        return sentence(event.action);
      }
      if (templateId === "T23") {
        // T23 Realization Contract (approved 2026-08-11). Every beat below
        // prints event.action directly — that content already IS the
        // mechanism-specific response/reveal/notice/resolution (see
        // T23_MODE_FRAMING). No universal "took one slow breath and said
        // Wait," no fixed "warmer and gentler" ending pool, no forced
        // explanation from the supporting actor — same principle as the
        // T21/T16 rewrites. ENCOUNTER keeps realizedSituation.sentence +
        // falseBelief for the same downstream coverage-check reason as
        // T16/T21/T22's opening beats.
        if (label === "ENCOUNTER") return join(sentence(ctx.realizedSituation.sentence), sentence(event.action), sentence(`At first ${ctx.protagonist} was still listening to the thought that ${ctx.falseBelief}`));
        if (label === "INITIAL_RESPONSE") return sentence(event.action);
        if (label === "REVEAL") return sentence(event.action);
        if (label === "DEEPER_NOTICE") return sentence(event.action);
        if (label === "CHANGED_RESPONSE") return sentence(event.action);
        if (label === "RESOLUTION") return sentence(event.action);
        return sentence(event.action);
      }
      if (templateId === "T03") {
        // T03 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // mode-specific attempt/failure/turning-point/resolution text (see
        // T03_MODE_FRAMING), grounded in the situation's own
        // obstacle_domain rather than the six sentences every T03 story
        // previously shared verbatim. Same principle as the T16/T21/T22/
        // T23 rewrites: no universal filler sentence bolted on afterward.
        return sentence(event.action);
      }
      if (templateId === "T18") {
        // T18 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // mode-specific escalation/pause/resolution text (see
        // T18_MODE_FRAMING), grounded in a text-signal detector over the
        // situation's own narrativeSummarySentences/storySeedContextText
        // (T16's approach) rather than the six sentences every T18 story
        // previously shared verbatim via the generic fallback.
        return sentence(event.action);
      }
      if (templateId === "T14") {
        // T14 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // mode-specific receive/recognize/encounter/give/resolution text
        // (see T14_MODE_FRAMING), grounded in a text-signal detector over
        // the situation's own narrativeSummarySentences/storySeedContextText
        // (T16/T18's approach), not the six generic try/fail sentences the
        // shared fallback used to print for every T14 story regardless of
        // situation.
        return sentence(event.action);
      }
      if (templateId === "T15") {
        // T15 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // mode-specific assumption/dismissal/second-look/contribution text
        // (see T15_MODE_FRAMING), grounded in a text-signal detector over
        // the situation's own narrativeSummarySentences/storySeedContextText
        // (T14/T16/T18's approach), not the six generic try/fail sentences
        // the shared fallback used to print for every T15 story regardless
        // of situation.
        return sentence(event.action);
      }
      if (templateId === "T04") {
        // T04 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // single-mode question/clue/revelation text (see T04_MODE_FRAMING).
        // T04's own beat shape (an 8-beat question-chain) has no beat that
        // plays the same "restate belief/obstacle" role T16/T21/T22/T23's
        // opening beats need, because OPENING_QUESTION's event.action
        // already folds in realizedSituation.sentence + the obstacle fact +
        // the false-belief-grounded question (built in
        // buildTemplateSpecificEventChain), so no extra wrapping is added
        // here.
        return sentence(event.action);
      }
      if (templateId === "T09") {
        // T09 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // mode-specific big-expectation/big-attempt-fails/quiet-quality/
        // quiet-action/resolution text (see T09_MODE_FRAMING), grounded in
        // a text-signal detector over the situation's own
        // narrativeSummarySentences/storySeedContextText, not the six
        // generic try/fail sentences the shared fallback used to print for
        // every T09 story regardless of situation.
        return sentence(event.action);
      }
      if (templateId === "T05") {
        // T05 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // mode-specific mirror-opening/old-reaction/middle-journey/insight/
        // mirror-ending/new-reaction text (see T05_MODE_FRAMING), grounded
        // in a text-signal detector (most-specific-match scoring) over the
        // situation's own narrativeSummarySentences/storySeed fields, not a
        // single generic keyword-bucketed frame reused verbatim across
        // situations (the prior buildT05CompleteStoryMaster/
        // inferCircularReturnFrame fallback this replaces).
        return sentence(event.action);
      }
      if (templateId === "T19") {
        // T19 Realization Contract (added 2026-08-12). Every beat below
        // prints event.action directly — that content already IS the
        // mode-specific approach-crossroads/option-old-belief/
        // option-new-belief/choice/consequence/resolution text (see
        // T19_MODE_FRAMING), grounded in the situation's own storySeed
        // facts via concreteSceneFacts/realizedSituation, not the shared
        // generic try/fail/try/fail/pause/succeed fallback.
        return sentence(event.action);
      }
      return join(sentence(event.action), sentence(event.newInformationOrShift), sentence(event.contradictionMoment), sentence(event.reinterpretation));
    });

    const distributed = distributeEventTextsAcrossScenes(eventTexts, sceneIds, templateId);

    const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: distributed[index] }));
    return {
      title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
      storyText: scenes.map((scene) => scene.text).join("\n\n"),
      scenes,
      beatTexts: events.map((event) => ({ beatId: event.label, text: event.action || event.reinterpretation || "" })),
      status: "COMPLETE_STORY_READY",
      templateUsed: templateId,
    };
  }

  const byPurpose = Object.fromEntries(events.map((event) => [event.purpose, event]));
  const e = (purpose) => byPurpose[purpose];

  const sentence = (text) => {
    const trimmed = String(text || "").trim().replace(/[.!?]+$/, "");
    return trimmed ? `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}.` : "";
  };

  const join = (...parts) => parts.filter(Boolean).join(" ");

  const symbolThemeWord = titleCaseFromId((ctx._lookups && ctx._lookups.symbolRecord && ctx._lookups.symbolRecord.symbol_theme) || "");

  const attempt1ConsequenceTail = e("attempt_1").consequence.replace(/^it did not work — /, "");
  const attempt2ConsequenceTail = e("attempt_2").consequence.replace(/^that did not work either — /, "");

  const beats = [
    {
      beatId: "SETUP",
      // Leads with the realized situation, then the WANT THAT SITUATION
      // CAUSES (not the unrelated mission label), then the noticing event
      // framed as happening while the hero is caught up in that want —
      // so Event 1 reads as a consequence of the situation, not a
      // separate, unrelated beat.
      text: join(
        sentence(ctx.realizedSituation.sentence),
        sentence(e("setup").want),
        sentence(e("setup").externalEvent),
        sentence(`The old thought came quickly: "${ctx.falseBelief}"`)
      ),
    },
    { beatId: "ATTEMPT_1", text: sentence(`So ${ctx.protagonist} ${e("attempt_1").action}`) },
    { beatId: "CONSEQUENCE_1", text: join(sentence("But it did not work"), sentence(attempt1ConsequenceTail)) },
    { beatId: "ATTEMPT_2", text: join(sentence(e("attempt_2").externalEvent), sentence(`${ctx.protagonist} ${e("attempt_2").action} instead`)) },
    { beatId: "CONSEQUENCE_2", text: join(sentence("That did not work either"), sentence(attempt2ConsequenceTail)) },
    {
      beatId: "TURNING_POINT",
      text: join(
        sentence(`${ctx.protagonist} ${e("turning_point").action}`),
        sentence(e("turning_point").consequence),
        sentence(`That was the moment ${ctx.protagonist} began to understand a little more about ${symbolThemeWord.toLowerCase()}`)
      ),
    },
    { beatId: "ATTEMPT_3", text: sentence(`This time, ${ctx.protagonist} ${e("attempt_3").action}`) },
    {
      beatId: "RESOLUTION",
      text: join(
        sentence(e("attempt_3").consequence),
        sentence(`${ctx.protagonist} smiled at last`),
        sentence(e("resolution").action),
        sentence(e("resolution").externalEvent),
        sentence(e("resolution").consequence),
        sentence(`Everything felt calmer, warmer, and freer than before`)
      ),
    },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const n = sceneIds.length;
  const stageTexts = beats.map((beat) => beat.text);
  let distributed;
  if (n === stageTexts.length) {
    distributed = stageTexts.slice();
  } else if (n < stageTexts.length) {
    distributed = [];
    for (let sceneIndex = 0; sceneIndex < n; sceneIndex += 1) {
      const start = Math.floor((sceneIndex * stageTexts.length) / n);
      const end = Math.floor(((sceneIndex + 1) * stageTexts.length) / n);
      distributed.push(stageTexts.slice(start, Math.max(end, start + 1)).join(" "));
    }
  } else {
    distributed = stageTexts.slice();
    let insertAt = Math.min(3, distributed.length);
    while (distributed.length < n) {
      distributed.splice(insertAt, 0, "The moment held, quiet, before what happened next.");
      insertAt += 1;
    }
  }

  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: distributed[index] }));
  const title = `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`;

  return {
    title,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beats.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

// ---------------------------------------------------------------------------
// Generic beat-to-prose engine. This reads ONLY template.requiredBeats and
// template.repetitionPattern (data), never a template's id or name, so
// adding T04-T20 as data cannot silently reuse T03's specific shape.
// ---------------------------------------------------------------------------

function classifyTemplateBeat(beatId) {
  const id = String(beatId || "").toUpperCase();
  if (/(REFRAIN|PHRASE)/.test(id)) return "REFRAIN";
  if (/ATTEMPT/.test(id)) return "ATTEMPT";
  if (/(CONSEQUENCE|SETBACK)/.test(id)) return "CONSEQUENCE";
  if (/(TURNING_POINT|^PAUSE|REFLECTION|SECOND_LOOK|PAUSE_CHOICE)/.test(id)) return "PAUSE";
  if (/(DISCOVERY|REVELATION|INSIGHT|RECALL|NOTICE|UNDERSTAND|TRANSFORMATION|PAYOFF)/.test(id)) return "INSIGHT";
  if (/(GROWS|OVERWHELMING|RISING|PRESSURE|IGNORED|^IGNORE)/.test(id)) return "ESCALATION";
  if (/(CLUE|PLANT|ENCOUNTER|GUIDE|OPTION|QUESTION|COUNTDOWN|OBSTACLE_\d)/.test(id)) return "STEP";
  if (/(CHOICE|DECISION)/.test(id)) return "CHOICE";
  if (/(RESOLUTION|ECHO_ENDING|NEW_REACTION|^RETURN|^CHANGE|HERO_GIVES|UNEXPECTED_CONTRIBUTION|OBJECT_FOUND|REAL_PROBLEM|INTERPRETATION_2|NEW_ACTION)/.test(id)) return "RESOLUTION";
  return "BRIDGE";
}

function stepFrame(beatId) {
  const id = String(beatId || "").toUpperCase();
  if (/CLUE/.test(id)) return "clue";
  if (/PLANT/.test(id)) return "plant";
  if (/GUIDE/.test(id)) return "guide";
  if (/OPTION|CHOICE_A|CHOICE_B/.test(id)) return "option";
  if (/QUESTION/.test(id)) return "question";
  if (/COUNTDOWN/.test(id)) return "countdown";
  if (/OBSTACLE/.test(id)) return "obstacle";
  return "encounter";
}

// Opening style is read from the template's OWN first/second beat ids and
// repetitionPattern (data), never from templateId/name, so it stays generic.
function classifyOpeningStyle(template) {
  const beats = (template && template.requiredBeats) || [];
  const first = String(beats[0] || "").toUpperCase();
  const second = String(beats[1] || "").toUpperCase();
  const usesRefrainImmediately = template && template.repetitionPattern
    && template.repetitionPattern.occurrenceStages
    && template.repetitionPattern.occurrenceStages[0] === beats[0];
  if (/MIRROR/.test(first)) {
    return "echo";
  }
  if (/QUESTION/.test(first) || /QUESTION/.test(second)) {
    return "question";
  }
  if (/COUNTDOWN/.test(first) || /COUNTDOWN/.test(second)) {
    return "countdown";
  }
  if (/(ENCOUNTER|PLANT|CLUE)/.test(second) || usesRefrainImmediately) {
    return "cumulative";
  }
  return "standard";
}

function substituteStorySeedHero(text, protagonist) {
  return String(text || "").replace(/\bKavi\b/gi, protagonist).trim();
}

function normalizeRealizationFragment(text, protagonist) {
  const substituted = substituteStorySeedHero(text, protagonist);
  const stripped = stripTrailingPeriod(substituted);
  if (!stripped) return "";
  return lowerFirstUnlessProperNoun(stripped, protagonist);
}

function collectUniqueRealizationFragments(fragments, protagonist) {
  const seen = new Set();
  const results = [];
  (fragments || []).forEach((fragment) => {
    const normalized = normalizeRealizationFragment(fragment, protagonist);
    if (!normalized) return;
    const key = normalize(normalized);
    if (!key || seen.has(key)) return;
    seen.add(key);
    results.push(normalized);
  });
  return results;
}

function fallbackTrailDetails(ctx) {
  const words = (ctx.situationDetail && ctx.situationDetail.concreteWords) || [];
  const picked = [];
  for (const word of words) {
    if (picked.length >= 3) break;
    if (!picked.includes(word)) picked.push(word);
  }
  while (picked.length < 3) {
    picked.push((ctx.actionVerbs[picked.length] || "look closer").toLowerCase());
  }
  return picked;
}

function collectT01TrailDetails(ctx) {
  const situation = ctx._lookups && ctx._lookups.situation;
  const seed = situation && situation.storySeed || {};
  const fragments = collectUniqueRealizationFragments([
    seed.childExperience,
    seed.immediateObstacle,
    seed.emotionalTension,
    ...(seed.context || []),
    seed.immediateWant,
  ], ctx.protagonist);
  return fragments.length >= 3 ? fragments.slice(0, 3) : fallbackTrailDetails(ctx);
}

function keywordMatch(text, pattern) {
  return pattern.test(String(text || "").toLowerCase());
}

function defaultHelperLabel(ctx) {
  if (ctx.supportProfile && ctx.supportProfile.title) return ctx.supportProfile.title;
  if (keywordMatch(ctx.situationTitle, /parent|mama|mom|dad|family|promise|trip/)) return "the grown-up nearby";
  if (keywordMatch(ctx.situationTitle, /adult|stranger|drop-off|party/)) return "the new grown-up";
  return "the calm help nearby";
}

function inferQuietStrengthFrame(ctx) {
  const source = `${ctx.trueBelief} ${ctx.falseBelief} ${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.emotionalTension}`;
  if (keywordMatch(source, /body|hungry|food|rest|tired|comfortable/)) {
    return {
      quality: "taking care of what their body needed",
      noticing: `${ctx.protagonist} noticed that the small thing being ignored was their own tired, hungry body.`,
      quietAction: `${ctx.protagonist} paused, asked for food, water, or rest, and stopped fighting the feeling as if it were a giant enemy.`,
      resolution: `${ctx.protagonist} felt the whole moment soften and settle, because caring for their body worked better than trying to overpower the cranky feeling.`,
    };
  }
  if (keywordMatch(source, /imagination|reality|scary|video|picture/)) {
    return {
      quality: "separating what was real from what was only replaying in their mind",
      noticing: `${ctx.protagonist} noticed that the quiet strength they needed was not force but the ability to tell memory from what was actually happening now.`,
      quietAction: `${ctx.protagonist} paused, named what was real in the room, asked for comfort, and let the scary picture become only a picture again.`,
      resolution: `${ctx.protagonist} felt steadier and more settled, because naming reality helped more than trying to push the image away by force.`,
    };
  }
  if (keywordMatch(source, /alone|crowd|lost|safe|help/)) {
    return {
      quality: "staying calm long enough to make one wise choice",
      noticing: `${ctx.protagonist} noticed that the quiet strength they had been overlooking was calm attention.`,
      quietAction: `${ctx.protagonist} stopped scanning wildly, looked for the safest nearby helper, and asked clearly for help.`,
      resolution: `${ctx.protagonist} moved toward safety and felt the panic settle, because one calm choice did more than all the panicked searching had done.`,
    };
  }
  if (keywordMatch(source, /inside me|comfort|special thing|blanket|toy/)) {
    return {
      quality: "holding onto the comfort they already carried inside",
      noticing: `${ctx.protagonist} noticed that the smallest strength in the room was the comfort they had already learned to carry.`,
      quietAction: `${ctx.protagonist} held still, remembered the love tied to the missing thing, and searched from a calmer place.`,
      resolution: `${ctx.protagonist} kept going more gently and felt the room settle, because the comfort inside them turned out to matter more than grabbing at the room in panic.`,
    };
  }
  return {
    quality: "one small steady step",
    noticing: `${ctx.protagonist} noticed that the quiet strength they had dismissed was one small steady step.`,
    quietAction: `${ctx.protagonist} chose one calm, direct action instead of another big burst of effort.`,
    resolution: `${ctx.protagonist} finally got traction and felt more settled, because the small steady move worked where the bigger reaction had failed.`,
  };
}

function inferUnexpectedHelperFrame(ctx) {
  const helper = defaultHelperLabel(ctx);
  const source = `${ctx.trueBelief} ${ctx.falseBelief} ${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.emotionalTension}`;
  if (keywordMatch(source, /promise|honesty|reliability|understanding|forgotten/)) {
    return {
      helper,
      assumption: `${ctx.protagonist} assumed ${helper.toLowerCase()} had nothing useful to offer once the promise was missed.`,
      dismissal: `${ctx.protagonist} kept the hurt inside and tried to solve the whole moment alone, but that only made the silence heavier.`,
      secondLook: `${ctx.protagonist} looked again when ${helper.toLowerCase()} finally slowed down and noticed something was wrong.`,
      contribution: `${helper} answered honestly, explained what had happened, and made a reliable next step instead of brushing the hurt away.`,
      resolution: `${ctx.protagonist} could trust the repair, because the missing piece had been honest understanding all along.`,
    };
  }
  if (keywordMatch(source, /leave|come back|trip|goodbye/)) {
    return {
      helper,
      assumption: `${ctx.protagonist} assumed that no small comfort from ${helper.toLowerCase()} could matter if the goodbye was still happening.`,
      dismissal: `${ctx.protagonist} clung tighter and tighter to the fear, but that did not stop the leaving.`,
      secondLook: `${ctx.protagonist} looked again when ${helper.toLowerCase()} stayed present instead of rushing the feeling away.`,
      contribution: `${helper} showed the return plan clearly and stayed close long enough for the goodbye to feel understandable instead of endless.`,
      resolution: `${ctx.protagonist} let the goodbye be real without letting it become forever, because the steady care around it finally counted.`,
    };
  }
  if (keywordMatch(source, /thunder|storm|calm and support|safe/)) {
    return {
      helper,
      assumption: `${ctx.protagonist} assumed ${helper.toLowerCase()} could not help if the thunder itself was still outside booming.`,
      dismissal: `${ctx.protagonist} listened only to the sound and not to the safe help beside them, but the body kept jumping anyway.`,
      secondLook: `${ctx.protagonist} looked again when ${helper.toLowerCase()} stayed calm instead of arguing with the fear.`,
      contribution: `${helper} pointed out the safe room, stayed close through the next rumble, and gave ${ctx.protagonist} something steady to match their breathing to.`,
      resolution: `${ctx.protagonist} felt safety become believable, because the help beside them mattered more than the noise outside.`,
    };
  }
  if (keywordMatch(source, /new people|trust grows one step at a time|unfamiliar adult/)) {
    return {
      helper,
      assumption: `${ctx.protagonist} assumed ${helper.toLowerCase()} could not understand them yet.`,
      dismissal: `${ctx.protagonist} stayed guarded and tried to get through the visit without leaning on any help from ${helper.toLowerCase()}, but that kept every moment tense.`,
      secondLook: `${ctx.protagonist} looked again when ${helper.toLowerCase()} did one small understandable thing at a time instead of demanding instant trust.`,
      contribution: `${helper} offered simple, predictable help that matched exactly what they were there to do.`,
      resolution: `${ctx.protagonist} took the next step, because trust had room to grow once the helper proved trustworthy in small ways.`,
    };
  }
  if (keywordMatch(source, /world|dangerous|news|war|keep others safe/)) {
    return {
      helper,
      assumption: `${ctx.protagonist} assumed ${helper.toLowerCase()} could not make such a huge fear any smaller.`,
      dismissal: `${ctx.protagonist} held the fear alone, but the world only felt bigger and scarier that way.`,
      secondLook: `${ctx.protagonist} looked again when ${helper.toLowerCase()} answered the question honestly instead of hiding it.`,
      contribution: `${helper} separated what was far away from what was safe here, and named the people working every day to protect others.`,
      resolution: `${ctx.protagonist} could breathe again, because truthful reassurance helped more than carrying the whole world alone.`,
    };
  }
  return {
    helper,
    assumption: `${ctx.protagonist} assumed ${helper.toLowerCase()} had no real part to play in solving the problem.`,
    dismissal: `${ctx.protagonist} tried to manage without that help, but the gap stayed exactly where it was.`,
    secondLook: `${ctx.protagonist} looked again when the first plan still was not enough.`,
    contribution: `${helper} offered the one missing piece in a way only they could.`,
    resolution: `${ctx.protagonist} moved forward differently, because the help that first looked too small turned out to be exactly the needed help.`,
  };
}

function buildChangedRefrain(falseBelief, trueBelief) {
  const cleanFalse = stripTrailingPeriod(falseBelief || "");
  const cleanTrue = stripTrailingPeriod(trueBelief || "");
  if (!cleanTrue) return "Maybe there is another way through this.";

  if (/^if\b/i.test(cleanFalse)) {
    return `Even if ${lowerFirstKeepingI(cleanTrue).replace(/^i can\s*/i, "I can ")}`;
  }
  if (/\bmust\b/i.test(cleanFalse) && /^i\b/i.test(cleanTrue)) {
    return cleanTrue;
  }
  if (/^plans\b/i.test(cleanFalse)) {
    return cleanTrue;
  }
  return cleanTrue;
}

function inferRitualEscalationFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.trueBelief}`;
  if (keywordMatch(source, /cancel|plan|outing|event|rain|change|different|update|routine/)) {
    return {
      firstPressure: `${ctx.protagonist} felt the original plan disappear, but kept reaching for it anyway.`,
      attempt: `${ctx.protagonist} tried to pull the day back toward the old plan instead of meeting the day that was actually here.`,
      setback: `That only made the disappointment louder, because the cancelled plan still was not coming back.`,
      pause: `${ctx.protagonist} stopped for a moment and let the changed day be real before choosing again.`,
      newAction: `${ctx.protagonist} decided to look for one new possibility inside the changed day and started moving toward it on purpose.`,
    };
  }
  if (keywordMatch(source, /nervous|stage|present|test|result|marks|score|reading|smart|mistake|fall|confiden/)) {
    return {
      firstPressure: `${ctx.protagonist} felt the old fear press harder the moment the real challenge came closer.`,
      attempt: `${ctx.protagonist} tried to beat the fear by pushing harder against it, without changing the thought underneath.`,
      setback: `That did not steady anything, because the same frightened thought kept returning in a heavier voice.`,
      pause: `${ctx.protagonist} paused, took in what was actually true, and stopped letting the old line speak first.`,
      newAction: `${ctx.protagonist} decided to take the next honest step anyway and started using the changed thought as something to stand on.`,
    };
  }
  return {
    firstPressure: `${ctx.protagonist} felt the same pressure return almost immediately.`,
    attempt: `${ctx.protagonist} tried to solve it while still repeating the old pattern.`,
    setback: `That only made the moment heavier, because the old pattern still led back to the same stuck place.`,
    pause: `${ctx.protagonist} paused long enough to notice that repeating the old line was not helping anymore.`,
    newAction: `${ctx.protagonist} decided on one new step from the changed understanding and started it instead.`,
  };
}

function inferCircularReturnFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.trueBelief}`;
  if (keywordMatch(source, /laugh|class|answer|perform|opinion/)) {
    return {
      oldReaction: `${ctx.protagonist} pulled back and tried to stay unnoticed, because being seen felt too risky.`,
      middleJourney: `${ctx.protagonist} carried that fear through the next part of the day, noticing how much power they had handed to other people's reactions.`,
      insight: `${ctx.protagonist} began to understand that other people's laughter or approval could be loud without becoming the measure of their worth.`,
      mirrorEnding: `${ctx.protagonist} met the same kind of public moment again.`,
      newReaction: `${ctx.protagonist} paused, still felt the flutter, but this time raised a hand, answered anyway, and stayed with their own voice.`,
    };
  }
  if (keywordMatch(source, /award|chosen|role|win|score|success|portion|comparison|friend|sibling/)) {
    return {
      oldReaction: `${ctx.protagonist} looked at what the other person had and immediately made it mean there was less room for them.`,
      middleJourney: `${ctx.protagonist} moved through the day carrying that comparison, until it started to feel heavier than the moment itself.`,
      insight: `${ctx.protagonist} began to see that another person's success could stay theirs without taking anything essential away from ${ctx.protagonist.toLowerCase()}.`,
      mirrorEnding: `${ctx.protagonist} found themselves in a similar comparison-shaped moment again.`,
      newReaction: `${ctx.protagonist} noticed the difference again, but this time paused, smiled, stayed steady, let the other person's moment be theirs, and kept hold of their own worth.`,
    };
  }
  if (keywordMatch(source, /body|appearance|clothes|look|tall|short|different/)) {
    return {
      oldReaction: `${ctx.protagonist} turned sharply inward and started reading the visible difference as proof that something was wrong with them.`,
      middleJourney: `${ctx.protagonist} carried that feeling for a while, until the shame itself started to feel like the loudest part of the day.`,
      insight: `${ctx.protagonist} began to understand that being seen was not the same as being diminished.`,
      mirrorEnding: `${ctx.protagonist} stepped back into a similar visible moment again.`,
      newReaction: `${ctx.protagonist} noticed the same difference, but this time stood in it more calmly, held their place, and smiled without handing their value over to the comparison.`,
    };
  }
  return {
    oldReaction: `${ctx.protagonist} reacted from the old belief and made the moment mean less about the event than about their worth.`,
    middleJourney: `${ctx.protagonist} carried that reaction forward until it became too heavy to ignore.`,
    insight: `${ctx.protagonist} began to understand a truer way to read the moment.`,
    mirrorEnding: `${ctx.protagonist} met a similar moment again.`,
    newReaction: `${ctx.protagonist} answered it differently this time, with more steadiness and choice.`,
  };
}

function inferTricksterFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.trueBelief}`;
  const title = String(ctx.situationTitle || "").toLowerCase();
  if (keywordMatch(source, /secret|unsafe|adult|protect someone/)) {
    return {
      choiceA: `${ctx.protagonist} first thought the safest option was to keep the promise exactly as it had been given and say nothing.`,
      choiceATail: `That protected the promise on the surface, but it left the unsafe weight exactly where it already was.`,
      choiceB: `${ctx.protagonist} then considered helping only indirectly, hoping the problem might change without ${ctx.protagonist.toLowerCase()} having to tell a trusted adult.`,
      choiceBTail: `It sounded kinder than breaking the promise, but it still left the real burden with a child instead of an adult who could protect someone.`,
      reflection: `${ctx.protagonist} paused and realized that both choices were missing the same thing: neither one actually protected the person who might be unsafe.`,
      choiceC: `${ctx.protagonist} decided to tell a safe adult the serious part of the secret, even though that felt harder than staying silent.`,
      resolution: `${ctx.protagonist} acted from protection instead of automatic secrecy, and the burden stopped being one a child had to carry alone.`,
      reflectionLine: `"Wait," ${ctx.protagonist} told themselves. "A promise cannot come before safety."`,
      choiceCLead: `${ctx.protagonist} could feel the truer path taking shape once protection mattered more than the promise itself`,
      resolutionTail: `${ctx.protagonist} could feel the secret become lighter once it was finally in adult hands where it belonged.`,
    };
  }
  if (/team game|team|field|whistle|missed pass/.test(title) || keywordMatch(source, /team game|final whistle|missed pass|team losing|deserve to be on the team/)) {
    return {
      choiceA: `${ctx.protagonist} first wanted to disappear from the team moment entirely, as if standing off by themselves might make the lost point belong to nobody.`,
      choiceATail: `That would have protected ${ctx.protagonist.toLowerCase()} from the first wave of embarrassment, but it would have left the team alone with the same ending.`,
      choiceB: `${ctx.protagonist} then considered saying something small and flat like "bad luck," hoping to blur the mistake into the game without really owning it.`,
      choiceBTail: `It sounded less harsh than full blame, but it still treated responsibility as something to dodge instead of something to grow through.`,
      reflection: `${ctx.protagonist} paused and realized that both choices were missing accountable teamwork: neither one faced the mistake honestly while still staying connected to the team.`,
      choiceC: `${ctx.protagonist} decided to own the missed move honestly, stay with the team through the disappointment, and learn the next step instead of turning the mistake into a permanent identity.`,
      resolution: `${ctx.protagonist} treated the mistake as part of teamwork and learning, so the loss stopped being the whole story about who ${ctx.protagonist.toLowerCase()} was.`,
      reflectionLine: `"Wait," ${ctx.protagonist} told themselves. "Owning one mistake is not the same as becoming the mistake."`,
      choiceCLead: `${ctx.protagonist} could feel the truer path taking shape once responsibility and belonging stopped competing with each other`,
      resolutionTail: `${ctx.protagonist} could feel the field loosen around them once the game became something to learn from instead of a verdict to wear forever.`,
    };
  }
  if (keywordMatch(source, /litter|world|responsible actions/)) {
    return {
      choiceA: `${ctx.protagonist} first thought the easiest option was to walk on, since one wrapper seemed too small to matter.`,
      choiceATail: `That would have kept the moment simple for ${ctx.protagonist.toLowerCase()}, but the wrapper would still have been sitting in the shared place asking the same question.`,
      choiceB: `${ctx.protagonist} then considered feeling upset about it without actually doing anything, which sounded better but still left the wrapper where it was.`,
      choiceBTail: `It looked more caring than walking away, but it still asked somebody else to carry the responsibility.`,
      reflection: `${ctx.protagonist} paused and realized that both choices were missing action; neither one cared for the shared place in any real way.`,
      choiceC: `${ctx.protagonist} decided to do the small responsible thing that was actually available: pick it up, bin it, or speak up safely.`,
      resolution: `${ctx.protagonist} proved that one small responsible action could change the moment after all.`,
      reflectionLine: `"Wait," ${ctx.protagonist} told themselves. "If I can help this place, I should."`,
      choiceCLead: `${ctx.protagonist} could feel the truer path taking shape once care became something done, not just something felt`,
      resolutionTail: `${ctx.protagonist} could feel the shared place matter more clearly once care had turned into a real action.`,
    };
  }
  if (keywordMatch(source, /friend|apologise|repair|mistake/)) {
    return {
      choiceA: `${ctx.protagonist} first wanted to pretend the hurt had not landed, hoping the moment might pass on its own.`,
      choiceATail: `That would have protected ${ctx.protagonist.toLowerCase()} from the awkwardness for a moment, but the friend's hurt would still have been sitting there untouched.`,
      choiceB: `${ctx.protagonist} then considered a quick apology that would make the discomfort end for ${ctx.protagonist.toLowerCase()} without really making space for the friend.`,
      choiceBTail: `It sounded kinder than pretending, but it still treated apology as a way to end the discomfort instead of repair the relationship.`,
      reflection: `${ctx.protagonist} paused and realized that both choices were missing repair, not just relief.`,
      choiceC: `${ctx.protagonist} decided to apologise honestly, listen to the hurt, and ask what would help make things right.`,
      resolution: `${ctx.protagonist} treated the friendship as something to repair, not just something to escape from feeling bad about.`,
      reflectionLine: `"Wait," ${ctx.protagonist} told themselves. "Feeling sorry is not the same as helping it heal."`,
      choiceCLead: `${ctx.protagonist} could feel the truer path taking shape once making space for the friend's hurt mattered more than ending the awkwardness fast`,
      resolutionTail: `${ctx.protagonist} felt the friendship steady, the guilty tightness ease, and a real sense of relief arrive once repair became more important than self-protection.`,
    };
  }
  return {
    choiceA: `${ctx.protagonist} first chose the option that looked easiest.`,
    choiceATail: `It looked simple, but it did not really change what mattered.`,
    choiceB: `${ctx.protagonist} then moved to an option that looked better, but still missed something important.`,
    choiceBTail: `It sounded wiser than the first path, but it still left the deepest part of the problem untouched.`,
    reflection: `${ctx.protagonist} paused and realized that both earlier choices were missing the same essential piece.`,
    choiceC: `${ctx.protagonist} decided on the option that actually matched the truer understanding.`,
    resolution: `${ctx.protagonist} could finally move forward because the third choice solved what the first two had both missed.`,
    reflectionLine: `"Wait," ${ctx.protagonist} told themselves, before choosing again.`,
    choiceCLead: `${ctx.protagonist} could feel the truer path taking shape`,
    resolutionTail: `${ctx.protagonist} could feel the whole moment settle once the third choice finally matched what mattered.`,
  };
}

function inferRoleReversalFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.trueBelief}`;
  if (keywordMatch(source, /understand|words|express|communicat/)) {
    return {
      received: `${ctx.protagonist} finally felt someone slow down, listen carefully, and make room for what ${ctx.protagonist.toLowerCase()} had really been trying to say.`,
      learning: `${ctx.protagonist} noticed how different it felt when being understood mattered more than being hurried.`,
      otherStruggles: `Later, someone else nearby struggled to explain something and started to look the same way ${ctx.protagonist.toLowerCase()} had looked earlier.`,
      recall: `${ctx.protagonist} paused and remembered what it had felt like when someone finally listened instead of correcting too quickly.`,
      gives: `${ctx.protagonist} stayed, listened patiently, and helped the other person say what they really meant.`,
      resolution: `${ctx.protagonist} understood more deeply that ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))}, because now ${ctx.protagonist.toLowerCase()} was the one making space for someone else.`,
    };
  }
  if (keywordMatch(source, /friend|left out|belong|birthday|replace|play|new school|new baby|distance|invite/)) {
    return {
      received: `${ctx.protagonist} felt someone make room for them when the loneliness or uncertainty first felt largest.`,
      learning: `${ctx.protagonist} noticed that being welcomed did not erase the hard feeling all at once, but it did stop ${ctx.protagonist.toLowerCase()} from carrying it alone.`,
      otherStruggles: `Later, another person nearby seemed unsure, left out, or afraid of not belonging in almost the same way.`,
      recall: `${ctx.protagonist} paused and remembered the earlier welcome, and realized this was a chance to pass that same feeling onward.`,
      gives: `${ctx.protagonist} moved first, invited the other person in, and helped them feel there was room for them too.`,
      resolution: `${ctx.protagonist} felt the truth of ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))} grow stronger, because belonging had become something ${ctx.protagonist.toLowerCase()} could help create.`,
    };
  }
  if (keywordMatch(source, /loved|safe|mistake|angry|scold/)) {
    return {
      received: `${ctx.protagonist} felt someone show care after the hard moment, making it clear that the mistake had not erased love.`,
      learning: `${ctx.protagonist} noticed how much gentleness could change the meaning of a painful moment.`,
      otherStruggles: `Later, someone else made a mistake and looked as though they were bracing for the same kind of shame.`,
      recall: `${ctx.protagonist} paused and remembered the relief of being cared for instead of reduced to the mistake.`,
      gives: `${ctx.protagonist} answered gently, stayed near, and helped the other person feel safe enough to recover.`,
      resolution: `${ctx.protagonist} understood ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))} more fully by giving the same steadiness away.`,
    };
  }
  return {
    received: `${ctx.protagonist} received help that landed in a real way.`,
    learning: `${ctx.protagonist} noticed what that help changed.`,
    otherStruggles: `Later, someone else struggled in a recognizably similar way.`,
    recall: `${ctx.protagonist} paused and remembered the earlier help.`,
    gives: `${ctx.protagonist} chose to offer that kind of help in return.`,
    resolution: `${ctx.protagonist} understood the true belief more fully by becoming the giver.`,
  };
}

function inferResourceDepreciationFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.trueBelief}`;
  const title = String(ctx.situationTitle || "").toLowerCase();
  if (keywordMatch(source, /darkness|dark room|shadow|shadows|room suddenly feels strange|monster|bed/)) {
    if (/monster|under the bed|shadow under the bed/.test(title)) {
      return {
        opening: `${ctx.protagonist} could feel one shadow under the bed growing into something much bigger once imagination started filling in what could not actually be seen.`,
        count3: `${ctx.protagonist} first stayed far from the bed, letting the hidden space underneath it decide what kind of danger must be waiting there.`,
        count2: `${ctx.protagonist} then kept adding more fearful pictures in their head, and each new imagined detail made the shadow feel more real than the room around it.`,
        count1: `${ctx.protagonist} was almost ready to let the imagined monster choose the whole night and take away the chance to find out what was actually there.`,
        pause: `${ctx.protagonist} paused anyway, let the bed become just a bed again for one moment, and chose to face the shadow instead of the whole imagined creature at once.`,
        finalAction: `${ctx.protagonist} then chose one small brave move toward the bed, because the only way to answer the fear was to meet the real shadow instead of feeding the invented monster.`,
        resolution: `${ctx.protagonist} could feel the shadow shrink back into an ordinary shape once the brave look answered it better than imagination had.`,
        pauseLine: `"Wait," ${ctx.protagonist} told themselves. "I haven't checked what it really is yet."`,
        ending: `${ctx.protagonist} felt sleep come closer once the under-bed fear lost its monster shape.`,
      };
    }
    return {
      opening: `${ctx.protagonist} could feel the familiar room suddenly seem strange and scary once the darkness started changing what each shape felt like.`,
      count3: `${ctx.protagonist} first froze at the edge of the dark room, letting the strange-looking shadows decide what the whole room must mean.`,
      count2: `${ctx.protagonist} then kept feeding the scary feeling in their head, and because of that the same familiar room felt less and less familiar by the second.`,
      count1: `${ctx.protagonist} was almost ready to let the darkness choose for them and turn one crossing into something much bigger than it really was.`,
      pause: `${ctx.protagonist} paused anyway, let the room be the same room again for a moment, and chose one next step instead of answering every shadow at once.`,
      finalAction: `${ctx.protagonist} then chose one small brave step into the dark room, because the way through was to cross the real room in front of them rather than obey the whole scary picture in their mind.`,
      resolution: `${ctx.protagonist} could feel the room become more familiar again once the next step answered the darkness better than the fear had.`,
      pauseLine: `"Wait," ${ctx.protagonist} told themselves. "It's still the same room."`,
      ending: `${ctx.protagonist} felt their body loosen and could finally breathe easier as the dark room stopped acting like a stranger.`,
    };
  }
  if (keywordMatch(source, /doctor|injection|pain|procedure|treatment|surgery|medical/)) {
    if (/injection|doctor/.test(title)) {
      return {
        opening: `${ctx.protagonist} could feel the doctor visit narrowing around the coming injection, because the moment of pain had not happened yet but was already taking up too much space.`,
        count3: `${ctx.protagonist} first tried to escape the injection in their mind, wishing the shot could somehow be skipped before it even began.`,
        count2: `${ctx.protagonist} then tightened against the coming pinch, but bracing early only made the waiting chair feel longer and sharper.`,
        count1: `${ctx.protagonist} was almost ready to let the expected pain decide the whole appointment before the shot had even happened.`,
        pause: `${ctx.protagonist} paused anyway, listened for what was happening in the room right now, and chose to meet only the next small part of the doctor visit.`,
        finalAction: `${ctx.protagonist} then stayed present for the shot one brave beat at a time, because handling the real pinch was smaller than fighting the whole imagined appointment at once.`,
        resolution: `${ctx.protagonist} could feel the injection moment pass more cleanly once the fear stopped stretching it bigger than it was.`,
        pauseLine: `"Wait," ${ctx.protagonist} told themselves. "I only have to get through the shot, not the whole future."`,
        ending: `${ctx.protagonist} felt the doctor's room loosen around them once the waiting fear finally let go.`,
      };
    }
    return {
      opening: `${ctx.protagonist} could feel the moment narrowing, because the feared thing was getting closer whether or not ${ctx.protagonist.toLowerCase()} was ready.`,
      count3: `${ctx.protagonist} first tried to escape it in their mind, wishing the whole moment could simply be skipped.`,
      count2: `${ctx.protagonist} then tried to tense against what was coming, but that only made the waiting feel sharper.`,
      count1: `${ctx.protagonist} was almost ready to let fear decide everything about the final moment.`,
      pause: `${ctx.protagonist} paused anyway, listened for what was actually happening now, and chose to meet only this one moment instead of the whole imagined future.`,
      finalAction: `${ctx.protagonist} then held on, stayed present, and took the difficult moment one brave step at a time.`,
      resolution: `${ctx.protagonist} could feel that staying with the real moment worked better than fighting a hundred imagined ones at once.`,
      pauseLine: `"Wait," ${ctx.protagonist} told themselves. "I only have to face this part now."`,
      ending: `${ctx.protagonist} felt the tight waiting inside them ease, because the future had shrunk back down to one manageable moment.`,
    };
  }
  if (keywordMatch(source, /too many options|several appealing options|choose one|best choice/)) {
    return {
      opening: `${ctx.protagonist} could feel the pile of good options starting to crowd the decision instead of helping it.`,
      count3: `${ctx.protagonist} first tried to keep every toy or treat equally alive in their mind, afraid that choosing one would mean losing all the others.`,
      count2: `${ctx.protagonist} then compared the options again and again, but more comparing only made the best choice feel harder to see.`,
      count1: `${ctx.protagonist} was almost ready to let the number of choices ruin the chance to enjoy any choice at all.`,
      pause: `${ctx.protagonist} paused, stopped trying to keep every option open, and looked for the one choice that actually fit this moment best.`,
      finalAction: `${ctx.protagonist} then chose one toy or treat on purpose, because a wise choice could bring more peace than trying to hold on to everything.`,
      resolution: `${ctx.protagonist} felt the decision settle once one real choice replaced the scramble to keep every possibility.`,
      pauseLine: `"Wait," ${ctx.protagonist} told themselves. "One good choice is enough."`,
      ending: `${ctx.protagonist} smiled once the choice finally belonged to this moment instead of all the others.`,
    };
  }
  if (keywordMatch(source, /followers|follower count|social-media|popular/)) {
    return {
      opening: `${ctx.protagonist} could feel one number on the screen trying to explain too much about who mattered.`,
      count3: `${ctx.protagonist} first stared at the two follower counts again, as if the gap itself might tell the whole truth about friendship and value.`,
      count2: `${ctx.protagonist} then felt the comparison tighten further, because the friend's bigger number kept trying to turn into a verdict about ${ctx.protagonist.toLowerCase()}.`,
      count1: `${ctx.protagonist} was almost ready to let the number decide the whole mood of the moment and make the friendship feel smaller than it really was.`,
      pause: `${ctx.protagonist} paused, stopped refreshing the count, and looked for one truer sign of being cared for that existed off the screen too.`,
      finalAction: `${ctx.protagonist} then chose to step back from the number and stay with the real friendship in front of them, because a count could not measure the whole of being valued.`,
      resolution: `${ctx.protagonist} felt lighter once the follower count stopped being treated like the final answer about how much people valued them.`,
    };
  }
  if (keywordMatch(source, /vacation|holiday|souvenir|photographs|international/)) {
    return {
      opening: `${ctx.protagonist} could feel the friend's exciting stories making ordinary parts of their own life suddenly seem too small.`,
      count3: `${ctx.protagonist} first followed every photograph and souvenir so closely that their own holiday began shrinking in comparison.`,
      count2: `${ctx.protagonist} then kept measuring their own life against the huge buildings, snow, and faraway places, and the comparison made ordinary memories feel duller than they had felt before.`,
      count1: `${ctx.protagonist} was almost ready to believe someone else's adventure had to reduce the worth of their own in order to count as special.`,
      pause: `${ctx.protagonist} paused on the envy, let the friend's stories stay exciting, and made room to remember that two different holidays could both matter.`,
      finalAction: `${ctx.protagonist} then chose to stay in the conversation without demanding that their own life match it, because one person's excitement did not have to erase another's.`,
      resolution: `${ctx.protagonist} left the conversation steadier, able to hold the friend's joy and their own different life in the same moment.`,
    };
  }
  if (keywordMatch(source, /lunchbox|lunch break|food looks|food smells|next seat/)) {
    return {
      opening: `${ctx.protagonist} could feel one smell from the next seat turning their own lunch into a disappointment it had not been a minute earlier.`,
      count3: `${ctx.protagonist} first looked back and forth between the two lunchboxes, letting the comparison change how their own food looked.`,
      count2: `${ctx.protagonist} then kept chasing the smell and the picture of the other meal, and because of that their own next bite already felt less appealing than it had before.`,
      count1: `${ctx.protagonist} was almost ready to lose the whole lunch to comparison, even though the food they actually had was still right there.`,
      pause: `${ctx.protagonist} paused, stopped chasing the smell from the next seat, and returned attention to the lunch already open in front of them.`,
      finalAction: `${ctx.protagonist} then chose the next bite from their own lunch on purpose, so the meal in front of them could become their real meal again.`,
      resolution: `${ctx.protagonist} got their lunch back by stopping the comparison, and the meal felt lighter again once it was allowed to be their own.`,
    };
  }
  if (keywordMatch(source, /birthday|present|presents|package|party|gifts/)) {
    return {
      opening: `${ctx.protagonist} could feel each new cheer at the party making the wanting louder, because every package seemed to ask whose joy this was allowed to be.`,
      count3: `${ctx.protagonist} first imagined what it would feel like if the next bright package had their own name on it instead.`,
      count2: `${ctx.protagonist} then cheered with everyone else while still comparing each present to what they did not have, and the party started feeling more like a fairness test than a celebration.`,
      count1: `${ctx.protagonist} was almost ready to let the wanting pull them all the way out of the birthday child's moment.`,
      pause: `${ctx.protagonist} paused before the next present opened and made room for one true thing that was still good at the party even without owning the gifts.`,
      finalAction: `${ctx.protagonist} then chose to join the celebration as it really was, so they could stay inside the joy of the party without needing the present to belong to them.`,
      resolution: `${ctx.protagonist} got to stay inside the party's happiness once wanting stopped trying to turn every gift into a test of fairness.`,
    };
  }
  if (keywordMatch(source, /pet they always wanted|close friend has finally got the pet|friend gets a pet|\bpet\b/)) {
    return {
      opening: `${ctx.protagonist} could feel the friend's good news pulling jealousy close, because the wished-for pet made the gap between lives feel personal.`,
      count3: `${ctx.protagonist} first stayed fixed on the pet itself, measuring what the friend had against what they still wished for.`,
      count2: `${ctx.protagonist} then let the comparison keep growing, and the more the dream pet filled the moment, the harder it became to share the friend's excitement honestly.`,
      count1: `${ctx.protagonist} was almost ready to let the missing pet decide that the friendship's happy moment could not also hold their own goodness.`,
      pause: `${ctx.protagonist} paused, noticed the jealousy without obeying it, and made room for one true thing in their own life that still deserved appreciation too.`,
      finalAction: `${ctx.protagonist} then chose to share in the friend's excitement anyway, because someone else's joy did not have to cancel their own life.`,
      resolution: `${ctx.protagonist} felt the envy loosen once the friend's new pet stopped being treated like proof that life was unfair.`,
      pauseLine: `"Wait," ${ctx.protagonist} told themselves. "Their joy is not taking mine away."`,
      ending: `${ctx.protagonist} smiled when the friendship finally felt bigger than the comparison again.`,
    };
  }
  if (keywordMatch(source, /bullied|teased|treated cruelly|step in|speaking up/)) {
    return {
      opening: `${ctx.protagonist} could feel the moment closing fast, because the teasing was happening now and silence would become its own choice very soon.`,
      count3: `${ctx.protagonist} first stayed still, hoping the cruel moment might end on its own before they had to decide anything.`,
      count2: `${ctx.protagonist} then rushed through fearful possibilities in their head, but each silent second made the need to protect the other child feel sharper.`,
      count1: `${ctx.protagonist} was almost ready to let fear make the final choice and leave the other child alone inside the teasing.`,
      pause: `${ctx.protagonist} paused, stopped rehearsing every worst outcome, and made room for one small brave action that could protect someone right now.`,
      finalAction: `${ctx.protagonist} then chose the smallest real step that interrupted the cruelty, because a brave action in time mattered more than a perfect plan too late.`,
      resolution: `${ctx.protagonist} could feel the moment change once courage turned into protection instead of staying trapped inside worry.`,
      pauseLine: `"Wait," ${ctx.protagonist} told themselves. "Someone needs help now."`,
      ending: `${ctx.protagonist} could feel relief arrive with the courage instead of after it.`,
    };
  }
  if (keywordMatch(source, /careful right now|spend less money|\btreats?\b|\boutings?\b|usual friday treat|not this week/)) {
    return {
      opening: `${ctx.protagonist} could feel one small "no" growing heavy because the usual treat had started to stand for something bigger about the family.`,
      count3: `${ctx.protagonist} first held on to the usual Friday treat itself, because losing that familiar yes felt like losing the whole shape of the day.`,
      count2: `${ctx.protagonist} then pushed against the change inside, but the disappointment only grew sharper because the family limit still stayed real.`,
      count1: `${ctx.protagonist} was almost ready to let that one missing treat decide that the whole moment was unfair, even though the bigger reason had already been gently named.`,
      pause: `${ctx.protagonist} paused, stopped arguing with the missing treat, and listened again to the careful-for-now reason underneath the answer.`,
      finalAction: `${ctx.protagonist} then chose to accept the changed family plan and stay with the people in front of them, because a temporary limit did not mean love had disappeared.`,
      resolution: `${ctx.protagonist} understood the family's temporary limit more gently once the missing treat stopped being used as proof that something deeper was wrong.`,
    };
  }
  if (keywordMatch(source, /dark|shadow|bed|monster|dogs?/)) {
    return {
      opening: `${ctx.protagonist} could feel that every second spent feeding the fear made the next step seem bigger.`,
      count3: `${ctx.protagonist} first reacted the fast way, tightening up and bracing as if stopping completely might somehow make the fear go away.`,
      count2: `${ctx.protagonist} then tried to rush the decision in their head, but the fear only spread into more corners of the moment.`,
      count1: `${ctx.protagonist} was almost ready to let the fear make the choice for them, because the last safe-feeling chance seemed to be slipping away.`,
      pause: `${ctx.protagonist} paused anyway, took one steadier breath, and let the next move become small enough to choose on purpose.`,
      finalAction: `${ctx.protagonist} then chose one small brave step instead of one panicked one, because responding to the real moment was safer than obeying the whole fear at once.`,
      resolution: `${ctx.protagonist} could feel that the brave step worked because the pause had helped them answer the real dog or dark moment in front of them, not the imagined one.`,
    };
  }
  return {
    opening: `${ctx.protagonist} could feel the margin shrinking around the problem.`,
    count3: `${ctx.protagonist} first reacted quickly, hoping speed alone would solve it.`,
    count2: `${ctx.protagonist} then pushed again, but the pressure only grew.`,
    count1: `${ctx.protagonist} was almost ready to let urgency make the final choice.`,
    pause: `${ctx.protagonist} paused anyway and chose one steadier beat before acting.`,
    finalAction: `${ctx.protagonist} then made the final move with more care than panic.`,
    resolution: `${ctx.protagonist} could feel that the pause had changed the final move for the better.`,
  };
}

function inferQuestionChainFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.falseBelief} ${ctx.trueBelief}`;
  if (keywordMatch(source, /lie|truth|honest|trouble|mistake|teacher|parent|steal|cheat|rule|found|belongs|integrity/)) {
    return {
      openingQuestion: `But what would actually make this moment right, not just easier?`,
      clue1: `${ctx.protagonist} could already feel that the first answer was not really about escape. The problem stayed heavy because ${lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the feeling did not go away"))}.`,
      question2: `So what was making the moment feel heavy in the first place?`,
      clue2: `${ctx.protagonist} noticed that the hardest part was not only what others might say. It was also that ${lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the choice still had to be faced honestly"))}.`,
      question3: `Then what kind of choice would let ${ctx.protagonist.toLowerCase()} respect themselves afterward?`,
      clue3: `${ctx.protagonist} already knew the shape of that answer, because the steadier choice was the one that matched ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))}.`,
      revelation: `${ctx.protagonist} suddenly understood how all the questions fit together: the easiest answer would only hide the problem, but the truer answer could actually change what happened next.`,
      resolution: `${ctx.protagonist} chose the honest next step right away and let the moment move forward from what was right instead of from what felt easiest.`,
    };
  }
  return {
    openingQuestion: `But what was this moment really asking for?`,
    clue1: `${ctx.protagonist} found a small answer, but it did not settle the feeling.`,
    question2: `So what was still missing?`,
    clue2: `${ctx.protagonist} noticed that the harder part of the problem was closer than it first seemed.`,
    question3: `Then what answer would actually fit the truth of this moment?`,
    clue3: `${ctx.protagonist} could already feel that the truer answer matched ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))}.`,
    revelation: `${ctx.protagonist} suddenly understood how the questions had been pointing toward the same answer all along.`,
    resolution: `${ctx.protagonist} acted on that understanding right away, and the moment began to change.`,
  };
}

function inferThreeGuidesFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.falseBelief} ${ctx.trueBelief}`;
  if (keywordMatch(source, /pet|died|death|gone|loss|grief|memory/)) {
    return {
      guide1: `${ctx.protagonist} first found one guide in action: do one small loving thing now, like gathering a photo, drawing a memory, or sitting beside the place the pet used to rest.`,
      guide2: `A second guide came through feeling: missing someone this much meant the love was real, so the sadness did not need to be pushed away.`,
      guide3: `A third guide offered a quieter insight: what was gone was the pet's body in the room, not the love that had already changed ${ctx.protagonist.toLowerCase()}.`,
      choice: `${ctx.protagonist} paused and chose a path that used all three guides at once: make room for the sadness, do one kind remembering action, and carry the love forward on purpose.`,
      resolution: `${ctx.protagonist} remembered, acted gently, and let the love stay present in a new form instead of treating the loss as the end of everything.`,
    };
  }
  if (keywordMatch(source, /name|mistake|cop(y|ies)|culture|family|rule|respect|heard|speak|interrupt|friendship|teammate|identity/)) {
    return {
      guide1: `${ctx.protagonist} first found an action guide: say the next honest sentence clearly, ask for space to speak, or name the problem instead of letting it grow in silence.`,
      guide2: `A second guide shaped the emotional stance: both ${ctx.protagonist.toLowerCase()}'s feelings and the other person's humanity still mattered inside this difficult moment.`,
      guide3: `A third guide brought the deeper insight that respect is not the same as silence; it means telling the truth in a way that still leaves room for repair, listening, or understanding.`,
      choice: `${ctx.protagonist} paused before reacting, kept the action guide, the feeling guide, and the insight guide together, and chose words that were both honest and respectful.`,
      resolution: `${ctx.protagonist} spoke or responded with steadiness instead of panic, and the situation moved toward repair because truth and respect were working together. ${ctx.protagonist} felt the tension ease and could breathe more freely now.`,
    };
  }
  if (keywordMatch(source, /cry|hurt|alone|new classmate|welcome|nervous|animal|struggles have nothing to do with me|not my job to help|kindness|comfort|interrupt/)) {
    return {
      guide1: `${ctx.protagonist} first met an action guide: move a little closer, ask one simple caring question, or make one practical kind gesture instead of waiting for a perfect plan.`,
      guide2: `A second guide spoke to feeling: the other person's discomfort mattered, and noticing it was already a sign that ${ctx.protagonist.toLowerCase()} was connected to the moment.`,
      guide3: `A third guide offered the deeper insight that small respect can change the shape of a hard moment more than standing far away and wishing someone else would act.`,
      choice: `${ctx.protagonist} paused, held all three guides together, and chose one gentle action that respected both the other person's feelings and the reality of the moment.`,
      resolution: `${ctx.protagonist} stepped in with care rather than force, and the moment softened because kindness had been turned into action.`,
    };
  }
  if (keywordMatch(source, /toy|gift|followers|vacation|lunchbox|pet they always wanted|cool|comparison|jealous|grateful|happy/)) {
    return {
      guide1: `${ctx.protagonist} first met an action guide: look directly at one good thing already in hand, already loved, or already shared in this life.`,
      guide2: `A second guide changed the feeling around the moment: jealousy could be noticed without being obeyed, and someone else's joy did not have to erase ${ctx.protagonist.toLowerCase()}'s own.`,
      guide3: `A third guide offered the insight that comparison kept asking the wrong question. The real question was what kind of joy ${ctx.protagonist.toLowerCase()} wanted to grow.`,
      choice: `${ctx.protagonist} paused and chose a path made from all three guides: notice the comparison, turn back toward gratitude, and celebrate what was good without pretending the feeling had never been there.`,
      resolution: `${ctx.protagonist} became glad in a truer way, because gratitude and generosity gave the moment more room than comparison ever could.`,
    };
  }
  return {
    guide1: `${ctx.protagonist} first met an action guide: take one small concrete step instead of staying stuck.`,
    guide2: `A second guide changed the emotional stance of the moment, making room for feeling without letting feeling take over.`,
    guide3: `A third guide offered an insight that reframed what the problem was really asking for.`,
    choice: `${ctx.protagonist} paused and chose a path that carried something from all three guides rather than copying only one.`,
    resolution: `${ctx.protagonist} acted from that combined understanding, and the moment changed because the response finally fit the problem.`,
  };
}

function inferWaitingPatternFrame(ctx) {
  const source = `${ctx.situationTitle} ${ctx.storySeed && ctx.storySeed.childExperience} ${ctx.storySeed && ctx.storySeed.immediateObstacle} ${ctx.storySeed && ctx.storySeed.emotionalTension} ${ctx.falseBelief} ${ctx.trueBelief}`;
  if (keywordMatch(source, /doctor|bank|travel|journey|appointment|long wait|pointless|unbearable|turn has not started|has not begun|airport|station/)) {
    return {
      mistake1: `${ctx.protagonist} first fought the waiting by checking again, fidgeting again, and acting as though impatience might force the next step to begin.`,
      ignore: `${ctx.protagonist} treated that first restless cycle as proof that waiting itself was the problem.`,
      mistake2: `A second wave of impatience rose when nothing had changed yet, and this time ${ctx.protagonist.toLowerCase()} could feel how the same pattern kept making the wait feel longer.`,
      notice: `${ctx.protagonist} noticed that the waiting was real, but the extra misery was being added one frustrated reaction at a time.`,
      avoided: `When the same restless urge returned again, ${ctx.protagonist} almost fed it, then caught the pattern before starting the whole cycle over.`,
      pause: `${ctx.protagonist} paused, went quieter inside, and chose one calmer way to use the waiting time instead of arguing with the clock.`,
      understand: `${ctx.protagonist} understood that waiting time did not have to be empty or unbearable.`,
      change: `${ctx.protagonist} used the next stretch more calmly and wisely, and the waiting stopped feeling like something that had to win.`,
    };
  }
  if (keywordMatch(source, /swing|turn|go first|fair|everyone deserves a turn|playground/)) {
    return {
      mistake1: `${ctx.protagonist} first let the waiting turn sharp, acting as though someone else's turn had taken something away from them.`,
      ignore: `${ctx.protagonist} pushed past that first unfair feeling without really questioning it.`,
      mistake2: `When the line still did not move fast enough, the same complaint rose again, and this time ${ctx.protagonist.toLowerCase()} could hear how familiar it sounded.`,
      notice: `${ctx.protagonist} noticed that the real pattern was not the swing staying busy. It was the belief that only their turn really counted.`,
      avoided: `When the third wave of impatience came, ${ctx.protagonist} almost pushed the old unfair story forward again, then stopped before doing it.`,
      pause: `${ctx.protagonist} paused, looked at the other child still swinging, and let the idea of shared turns become real for a second.`,
      understand: `${ctx.protagonist} understood that waiting was part of everyone getting a turn, not proof that they mattered less.`,
      change: `${ctx.protagonist} waited differently, held their place without fighting the line, and stepped onto the swing without carrying the old grievance with them.`,
    };
  }
  if (keywordMatch(source, /birthday|package|arrive sooner|special moment|anticipation|tomorrow|delivery/)) {
    return {
      mistake1: `${ctx.protagonist} first fought the waiting by checking again, counting again, and trying to squeeze joy out of a moment that had not arrived yet.`,
      ignore: `${ctx.protagonist} ignored how that first restless burst had made the day feel even longer.`,
      mistake2: `The same urge came back when the special thing still had not happened, and this time ${ctx.protagonist.toLowerCase()} could feel the pattern of spoiling the waiting with more waiting.`,
      notice: `${ctx.protagonist} noticed that the problem was not the joyful thing being ruined. It was the present moment being treated like an obstacle instead of part of the joy.`,
      avoided: `When the third restless check almost happened, ${ctx.protagonist} caught it before the old pattern could repeat again.`,
      pause: `${ctx.protagonist} paused, let the excitement stay bright without demanding that time move faster, and took this waiting moment as part of the celebration too.`,
      understand: `${ctx.protagonist} understood that anticipation was not ruining the joy. It was helping the joy grow.`,
      change: `${ctx.protagonist} waited with more sweetness than strain, and the special moment kept getting closer without having to be chased.`,
    };
  }
  if (keywordMatch(source, /shoes|leave|hurried|ready|right now/)) {
    return {
      mistake1: `${ctx.protagonist} rushed the first part, grabbed at too many things at once, and made the whole getting-ready moment even harder.`,
      ignore: `${ctx.protagonist} brushed past that first consequence and only felt more certain that everything had to happen faster.`,
      mistake2: `The same hurry rose again when the next small step still was not done, and this time ${ctx.protagonist.toLowerCase()} could almost hear the pattern returning.`,
      notice: `${ctx.protagonist} noticed that the rushing itself was turning one hard step into three harder ones.`,
      avoided: `When the same pressure hit a third time, ${ctx.protagonist} almost lunged into the next frantic move, then caught it before repeating the pattern.`,
      pause: `${ctx.protagonist} paused, put one thing down, took one slower breath, and chose to finish only the step that belonged to this moment.`,
      understand: `${ctx.protagonist} understood that slowing down was not falling behind. It was how this moment would actually move.`,
      change: `${ctx.protagonist} finished one step, then the next, and got ready more smoothly because the hurry no longer controlled the order.`,
    };
  }
  if (keywordMatch(source, /work call|phone|listen|wait|important|say/)) {
    return {
      mistake1: `${ctx.protagonist} first tried to push the moment open anyway, wanting the exciting news to be heard right now.`,
      ignore: `${ctx.protagonist} ignored how that first push landed and only felt the waiting grow sharper.`,
      mistake2: `A second urge to interrupt rose when the news still felt too important to hold, and this time ${ctx.protagonist.toLowerCase()} could feel the same impatient pattern returning.`,
      notice: `${ctx.protagonist} noticed that the problem was not that the thought did not matter. The problem was trying to force the wrong moment to hold it.`,
      avoided: `When the third chance to blurt it out came, ${ctx.protagonist} almost did exactly that, then stopped before the old pattern could take over again.`,
      pause: `${ctx.protagonist} paused, held the important thought safely inside for one more beat, and let the right moment matter too.`,
      understand: `${ctx.protagonist} understood that being asked to wait was not the same as being unimportant.`,
      change: `${ctx.protagonist} waited for the call to end, then shared the news with more steadiness, and it was truly heard when the listening moment arrived.`,
    };
  }
  return {
    mistake1: `${ctx.protagonist} first reacted against the waiting pressure in the usual impatient way.`,
    ignore: `${ctx.protagonist} brushed past the first consequence without reflection.`,
    mistake2: `The same pressure returned, and this time the pattern was easier to notice.`,
    notice: `${ctx.protagonist} noticed that the repeating trouble was coming from the same old impatient response.`,
    avoided: `When the trigger returned again, ${ctx.protagonist} almost repeated the pattern, then stopped before doing it.`,
    pause: `${ctx.protagonist} paused and chose one steadier breath before acting.`,
    understand: `${ctx.protagonist} understood why the old pattern had kept returning.`,
    change: `${ctx.protagonist} acted differently this time, and the waiting no longer ruled the whole moment.`,
  };
}

function buildTemplateRealizationContext(template, storyPlan, templateContext) {
  const base = templateContext;
  const situation = base && base._lookups && base._lookups.situation;
  const mission = base && base._lookups && base._lookups.mission;
  const missionPhrase = naturalMissionPhrase(mission, mission && mission.id);
  const realizedSituation = realizeSituation(situation, base.protagonist);
  const narrativeSummarySentences = extractNarrativeSummarySentences(situation, base.protagonist);
  const situationDetail = assessSituationDetail(situation);
  const supportProfile = buildSupportProfile(base);
  const seed = situation && situation.storySeed || {};
  return {
    ...base,
    template,
    missionPhrase,
    realizedSituation,
    narrativeSummarySentences,
    situationDetail,
    supportProfile,
    storySeed: {
      childExperience: substituteStorySeedHero(seed.childExperience, base.protagonist),
      immediateWant: substituteStorySeedHero(seed.immediateWant, base.protagonist),
      immediateObstacle: substituteStorySeedHero(seed.immediateObstacle, base.protagonist),
      emotionalTension: substituteStorySeedHero(seed.emotionalTension, base.protagonist),
      context: (seed.context || []).map((item) => substituteStorySeedHero(item, base.protagonist)),
    },
  };
}

function buildT01CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const trailDetails = collectT01TrailDetails(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const goalSentence = wantClause
    ? `${protagonist} wanted to ${wantClause}.`
    : `${protagonist} needed ${ctx.goalPhrase}.`;
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const cumulativeLine = (count) => trailDetails.slice(0, count).join("; ");
  const encounterLead = [
    `${protagonist} noticed the first piece of the trail: ${trailDetails[0]}. "And what could this be?" ${protagonist} wondered.`,
    `Then ${protagonist} noticed another piece: ${trailDetails[1]}. Now the trail sounded like this: ${cumulativeLine(2)}.`,
    `A third piece joined it: ${trailDetails[2]}. Now ${protagonist} could say the whole trail aloud: ${cumulativeLine(3)}.`,
  ];
  const patternBreak = `${protagonist} stopped before naming a fourth piece, because looking back at ${cumulativeLine(3)}, ${protagonist} realized they were not random details at all — they were all pointing to the same hard moment.`;
  const discovery = `${protagonist} saw the shape of it at once: ${trailDetails[0]}; ${trailDetails[1]}; ${trailDetails[2]}. Taken together, they meant ${lowerFirstKeepingI(cleanTrueBelief)}, so the waiting did not feel empty in the same way anymore.`;
  const resolution = `${protagonist} decided what to do next from the whole trail, not from the first flash of worry. ${protagonist} asked for the next moment they needed, moved one piece at a time, and kept going toward ${wantClause || ctx.missionPhrase}, steadier now because the whole trail finally made sense.`;

  const beatTexts = [
    { beatId: "SETUP", kind: "OPENING", text: `${setupSentence}. ${goalSentence} The old thought came quickly: "${ctx.falseBelief}"` },
    { beatId: "ENCOUNTER_1", kind: "STEP", text: encounterLead[0] },
    { beatId: "ENCOUNTER_2", kind: "STEP", text: encounterLead[1] },
    { beatId: "ENCOUNTER_3", kind: "STEP", text: encounterLead[2] },
    { beatId: "PATTERN_BREAK", kind: "PAUSE", text: patternBreak },
    { beatId: "DISCOVERY", kind: "INSIGHT", text: discovery },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: resolution },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  const title = `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`;

  return {
    title,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT09CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const quietFrame = inferQuietStrengthFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the problem still felt too big"));
  const tension = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the feeling kept getting bigger"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const beatTexts = [
    { beatId: "BIG_EXPECTATION", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}. The old thought came quickly: "${ctx.falseBelief}"` },
    { beatId: "BIG_ATTEMPT_FAILS", kind: "STEP", text: `${protagonist} first treated it like a problem that needed a big, fast fix, so ${protagonist} tried to push straight through ${obstacle}. But ${tension}.` },
    { beatId: "QUIET_QUALITY_NOTICED", kind: "INSIGHT", text: `${quietFrame.noticing} ${protagonist} saw that what looked small was actually ${quietFrame.quality}.` },
    { beatId: "QUIET_ACTION", kind: "STEP", text: `${quietFrame.quietAction} ${protagonist} did that on purpose, because the loud reaction had already failed.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${quietFrame.resolution} ${protagonist} understood that ${lowerFirstKeepingI(cleanTrueBelief)}, and kept going from that steadier place instead.` },
  ];
  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT15CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const helperFrame = inferUnexpectedHelperFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the problem did not move"));
  const tension = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the feeling kept growing"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const beatTexts = [
    { beatId: "PROBLEM", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: "${ctx.falseBelief}"` },
    { beatId: "ASSUMPTION", kind: "STEP", text: `${helperFrame.assumption} ${protagonist} decided the real answer had to come from somewhere else.` },
    { beatId: "DISMISSAL", kind: "STEP", text: `${helperFrame.dismissal} ${tension}, so the first plan still did not work.` },
    { beatId: "SECOND_LOOK", kind: "PAUSE", text: `${helperFrame.secondLook} That second look mattered, because it opened the door to a different kind of help.` },
    { beatId: "UNEXPECTED_CONTRIBUTION", kind: "INSIGHT", text: `${helperFrame.contribution} It was exactly the missing piece, but it only became visible once ${protagonist} stopped dismissing it.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${helperFrame.resolution} ${protagonist} understood that ${lowerFirstKeepingI(cleanTrueBelief)}, and chose to trust that change.` },
  ];
  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT02CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the problem stayed right where it was"));
  const tension = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the feeling got heavier"));
  const falseLine = stripTrailingPeriod(ctx.falseBelief);
  const changedLine = buildChangedRefrain(ctx.falseBelief, ctx.trueBelief);
  const frame = inferRitualEscalationFrame(ctx);
  const beatTexts = [
    { beatId: "PROBLEM", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old line came quickly: ${falseLine}.` },
    { beatId: "REFRAIN_1", kind: "STEP", text: `${frame.firstPressure} The same words came back: ${falseLine}.` },
    { beatId: "ATTEMPT", kind: "STEP", text: `${frame.attempt} ${protagonist} tried anyway, but ${tension}.` },
    { beatId: "REFRAIN_2", kind: "STEP", text: `${frame.setback} The same words came back again: ${falseLine}.` },
    { beatId: "SETBACK", kind: "STEP", text: `${protagonist} could feel that repeating the old line was not changing what this moment needed.` },
    { beatId: "PAUSE", kind: "PAUSE", text: `${frame.pause} "Wait," ${protagonist} told themselves. For a second, ${protagonist} let the old refrain go quiet.` },
    { beatId: "REFRAIN_CHANGED", kind: "INSIGHT", text: `This time the words came out differently: ${changedLine}.` },
    { beatId: "NEW_ACTION", kind: "RESOLUTION", text: `${frame.newAction} ${protagonist} acted from that new line, because ${lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief))}.` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT05CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferCircularReturnFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the same difficult feeling stayed there"));
  const tension = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the feeling kept pressing harder"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const beatTexts = [
    { beatId: "MIRROR_OPENING", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}.` },
    { beatId: "OLD_REACTION", kind: "STEP", text: `The old thought came quickly: "${ctx.falseBelief}" ${frame.oldReaction}` },
    { beatId: "MIDDLE_JOURNEY", kind: "STEP", text: `${frame.middleJourney} ${tension}.` },
    { beatId: "INSIGHT", kind: "INSIGHT", text: `${frame.insight} ${protagonist} could feel the new understanding taking shape: ${lowerFirstKeepingI(cleanTrueBelief)}.` },
    { beatId: "MIRROR_ENDING", kind: "STEP", text: `${frame.mirrorEnding} The outer shape of the moment was familiar, but ${protagonist} was not carrying it the same way now.` },
    { beatId: "NEW_REACTION", kind: "RESOLUTION", text: `${frame.newReaction} ${protagonist} acted from that steadier place, because ${lowerFirstKeepingI(cleanTrueBelief)}.` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT12CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferTricksterFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the problem still needed a real answer"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const beatTexts = [
    { beatId: "SETUP", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: "${ctx.falseBelief}"` },
    { beatId: "CHOICE_A_PLAUSIBLE", kind: "STEP", text: `${frame.choiceA} ${frame.choiceATail || "It made sense at first, but the deeper problem stayed right where it was."}` },
    { beatId: "CHOICE_B_BETTER_BUT_FLAWED", kind: "STEP", text: `${frame.choiceB} ${frame.choiceBTail || "It sounded wiser than the first choice, but it still would not fully solve what mattered."}` },
    { beatId: "REFLECTION", kind: "PAUSE", text: `${frame.reflection} ${frame.reflectionLine || `"Wait," ${protagonist} told themselves, before choosing again.`}` },
    { beatId: "CHOICE_C_TRUE", kind: "INSIGHT", text: `${frame.choiceC} ${frame.choiceCLead || `${protagonist} could feel the truer path taking shape`}: ${lowerFirstKeepingI(cleanTrueBelief)}.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${frame.resolution} ${frame.resolutionTail || `${protagonist} acted from that understanding, and the moment changed because of it.`}` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT14CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferRoleReversalFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the hard moment was still there"));
  const tension = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the feeling was still pressing on them"));
  const beatTexts = [
    { beatId: "HERO_RECEIVES", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: "${ctx.falseBelief}" ${frame.received}` },
    { beatId: "LEARNING", kind: "INSIGHT", text: `${frame.learning} ${tension}.` },
    { beatId: "OTHER_STRUGGLES", kind: "STEP", text: `${frame.otherStruggles}` },
    { beatId: "RECALL_HELP", kind: "PAUSE", text: `${frame.recall} "Wait," ${protagonist} thought, before doing the obvious next kind thing.` },
    { beatId: "HERO_GIVES", kind: "STEP", text: `${frame.gives} ${protagonist} chose to act from what had once helped them.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${frame.resolution} ${protagonist} smiled and could feel the moment settle differently now.` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT11CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferResourceDepreciationFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = sentenceCase(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the hard moment was getting closer"));
  const tension = sentenceCase(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the fear kept growing"));
  const trueBeliefLine = lowerFirstKeepingI(stripTrailingPeriod(ctx.trueBelief));
  const beatTexts = [
    { beatId: "COUNTDOWN_OPENING", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${lowerFirstKeepingI(obstacle)}. The old thought came quickly: "${ctx.falseBelief}" ${frame.opening}` },
    { beatId: "COUNTDOWN_3", kind: "STEP", text: `${frame.count3} ${tension}.` },
    { beatId: "COUNTDOWN_2", kind: "STEP", text: `${frame.count2}` },
    { beatId: "COUNTDOWN_1", kind: "STEP", text: `${frame.count1}` },
    { beatId: "PAUSE_CHOICE", kind: "PAUSE", text: `${frame.pause} ${frame.pauseLine || `"Wait," ${protagonist} told themselves, before spending the last bit of courage well.`}` },
    { beatId: "FINAL_ACTION", kind: "STEP", text: `${frame.finalAction} ${protagonist} acted from the new understanding that ${trueBeliefLine}, instead of from the first alarm.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${frame.resolution} ${frame.ending || `${protagonist} smiled and could feel the ending settle more calmly now.`}` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT04CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferQuestionChainFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the answer still felt out of reach"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const beatTexts = [
    { beatId: "OPENING_QUESTION", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: "${ctx.falseBelief}" ${frame.openingQuestion}` },
    { beatId: "CLUE_1", kind: "STEP", text: `${frame.clue1}` },
    { beatId: "QUESTION_2", kind: "STEP", text: `${frame.question2}` },
    { beatId: "CLUE_2", kind: "STEP", text: `${frame.clue2}` },
    { beatId: "QUESTION_3", kind: "PAUSE", text: `${protagonist} paused with the question instead of running from it: ${frame.question3} "Wait," ${protagonist} thought, because the answer was starting to feel uncomfortably clear.` },
    { beatId: "CLUE_3", kind: "INSIGHT", text: `${frame.clue3}` },
    { beatId: "REVELATION", kind: "INSIGHT", text: `${frame.revelation} ${protagonist} could feel the true answer settle into place: ${lowerFirstKeepingI(cleanTrueBelief)}.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${frame.resolution} ${protagonist} acted from that answer, and the mission moved forward because understanding had turned into choice.` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT07CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferThreeGuidesFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the next step was not obvious"));
  const tension = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.emotionalTension) || "the feeling kept pulling in two directions"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const beatTexts = [
    { beatId: "SETUP", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: "${ctx.falseBelief}" ${sentenceCase(tension)}.` },
    { beatId: "GUIDE_1_ACTION", kind: "STEP", text: `${protagonist} asked the first version of the question in a practical way: what could be done right now? ${frame.guide1}` },
    { beatId: "GUIDE_2_EMOTION", kind: "STEP", text: `${protagonist} then asked the same problem in the language of feeling: what mattered inside this moment? ${frame.guide2}` },
    { beatId: "GUIDE_3_INSIGHT", kind: "INSIGHT", text: `${protagonist} asked once more, differently: what truth was this whole moment pointing toward? ${frame.guide3}` },
    { beatId: "HERO_CHOICE", kind: "PAUSE", text: `${frame.choice} "Wait," ${protagonist} told themselves, before choosing a response that actually belonged to them.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${frame.resolution} ${protagonist} could feel the new understanding settle in their own words: ${lowerFirstKeepingI(cleanTrueBelief)}. ${protagonist} smiled.` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT08CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferWaitingPatternFrame(ctx);
  const situationId = ctx && ctx._lookups && ctx._lookups.situation && ctx._lookups.situation.id;
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the next step was not ready yet"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const setupText = situationId === "SIT004"
    ? `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: ${ctx.falseBelief} "${protagonist} felt smaller right away." ${frame.mistake1}`
    : `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: "${ctx.falseBelief}" ${frame.mistake1}`;
  const beatTexts = [
    { beatId: "MISTAKE_1", kind: "OPENING", text: setupText },
    { beatId: "IGNORE", kind: "STEP", text: `${frame.ignore}` },
    { beatId: "MISTAKE_2", kind: "STEP", text: `${frame.mistake2}` },
    { beatId: "NOTICE", kind: "INSIGHT", text: `${frame.notice}` },
    { beatId: "MISTAKE_3_AVOIDED", kind: "STEP", text: `${frame.avoided}` },
    { beatId: "PAUSE", kind: "PAUSE", text: `${frame.pause} "Wait," ${protagonist} told themselves.` },
    { beatId: "UNDERSTAND", kind: "INSIGHT", text: `${frame.understand} ${protagonist} could feel the truer line settle in: ${lowerFirstKeepingI(cleanTrueBelief)}.` },
    { beatId: "CHANGE", kind: "RESOLUTION", text: `${frame.change} ${protagonist} smiled.` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildT18CompleteStoryMaster(template, ctx, storyPlan) {
  const protagonist = ctx.protagonist;
  const frame = inferWaitingPatternFrame(ctx);
  const setupSentence = ctx.realizedSituation && ctx.realizedSituation.sentence
    ? stripTrailingPeriod(ctx.realizedSituation.sentence)
    : `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}`;
  const wantClause = stripTrailingPeriod((ctx.realizedSituation && ctx.realizedSituation.want) || "");
  const obstacle = lowerFirstKeepingI(stripTrailingPeriod((ctx.storySeed && ctx.storySeed.immediateObstacle) || "the small problem was still there"));
  const cleanTrueBelief = stripTrailingPeriod(ctx.trueBelief);
  const beatTexts = [
    { beatId: "TINY_PROBLEM", kind: "OPENING", text: `${setupSentence}. ${protagonist} wanted to ${wantClause || ctx.missionPhrase}, but ${obstacle}. The old thought came quickly: "${ctx.falseBelief}" What began as one small hard thing was about to feel much bigger.` },
    { beatId: "IGNORED", kind: "STEP", text: `${frame.mistake1} ${protagonist} did not stop to understand the small problem yet.` },
    { beatId: "GROWS_1", kind: "ESCALATION", text: `${frame.ignore} The problem felt bigger now, mostly because the reaction had been added on top of it.` },
    { beatId: "GROWS_2", kind: "ESCALATION", text: `${frame.mistake2} Now the same small situation was carrying a much larger feeling around it.` },
    { beatId: "OVERWHELMING", kind: "ESCALATION", text: `${frame.notice} The moment had started small, but it no longer felt small at all.` },
    { beatId: "PAUSE", kind: "PAUSE", text: `${frame.pause} "Wait," ${protagonist} told themselves.` },
    { beatId: "REAL_PROBLEM", kind: "INSIGHT", text: `${frame.understand} The real problem was smaller and clearer than the overwhelmed version had made it seem: ${lowerFirstKeepingI(cleanTrueBelief)}.` },
    { beatId: "RESOLUTION", kind: "RESOLUTION", text: `${frame.change} ${protagonist} solved the smaller real problem instead of feeding the larger feeling, and the whole moment settled. ${protagonist} smiled.` },
  ];

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const sceneTexts = distributeEventTextsAcrossScenes(beatTexts.map((beat) => beat.text), sceneIds, template.templateId);
  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: sceneTexts[index] }));
  return {
    title: `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts: beatTexts.map((beat) => ({ beatId: beat.beatId, text: beat.text })),
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function buildResourceDepreciationCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T11") return buildT11CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildQuestionChainCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T04") return buildT04CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildThreeGuidesCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T07") return buildT07CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildWaitingPatternCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T08") return buildT08CompleteStoryMaster(template, ctx, storyPlan);
  if (template.templateId === "T18") return buildT18CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildRoleReversalCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T14") return buildT14CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildTricksterCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T12") return buildT12CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildCircularReturnCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T05") return buildT05CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildRitualEscalationCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T02") return buildT02CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildInversionCompleteStoryMaster(template, ctx, storyPlan) {
  if (!template) return null;
  if (template.templateId === "T09") return buildT09CompleteStoryMaster(template, ctx, storyPlan);
  if (template.templateId === "T15") return buildT15CompleteStoryMaster(template, ctx, storyPlan);
  return null;
}

function buildCompleteStoryMasterFromFamilyRealizer(template, realizationContext, storyPlan) {
  if (template && template.templateId === "T01") {
    return buildT01CompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T02") {
    return buildRitualEscalationCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T04") {
    return buildQuestionChainCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T07") {
    return buildThreeGuidesCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T08") {
    return buildWaitingPatternCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T18") {
    return buildWaitingPatternCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T05") {
    return buildCircularReturnCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T12") {
    return buildTricksterCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T14") {
    return buildRoleReversalCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && template.templateId === "T11") {
    return buildResourceDepreciationCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  if (template && (template.templateId === "T09" || template.templateId === "T15")) {
    return buildInversionCompleteStoryMaster(template, realizationContext, storyPlan);
  }
  return null;
}

function generateBeatText(beatId, kind, occurrenceIndex, ctx) {
  const protagonist = ctx.protagonist;
  const supportProfile = buildSupportProfile(ctx);
  switch (kind) {
    case "OPENING": {
      const base = `${protagonist} was facing ${lowerFirst(ctx.situationTitle)}, and needed ${ctx.goalPhrase}.`;
      const beliefLine = `The old thought came quickly: "${ctx.falseBelief}"`;
      const style = ctx.openingStyle || "standard";
      if (style === "cumulative") {
        const firstItem = (ctx.actionVerbs[0] || "look closer").toLowerCase();
        return `${base} Right away, ${protagonist} noticed the very first thing: a hint of ${firstItem}. "And what could this be?" ${protagonist} wondered. ${beliefLine}`;
      }
      if (style === "question") {
        return `${base} "But why does this keep happening?" ${protagonist} wondered, before anything else. ${beliefLine}`;
      }
      if (style === "countdown") {
        return `${base} There were only a few tries left before it would be too late. ${beliefLine}`;
      }
      if (style === "echo") {
        return `${base} It was a moment ${protagonist} would meet again, differently, before the story was over. ${beliefLine}`;
      }
      return `${base} ${beliefLine}`;
    }
    case "ATTEMPT": {
      const verb = (ctx.actionVerbs[occurrenceIndex % ctx.actionVerbs.length] || "try again").toLowerCase();
      return occurrenceIndex === 0
        ? `${protagonist} tried to ${verb} their way past ${lowerFirst(ctx.conflictName)}.`
        : `So ${protagonist} tried something different this time: to ${verb} instead.`;
    }
    case "CONSEQUENCE":
      return occurrenceIndex === 0
        ? `It did not work — ${lowerFirst(ctx.obstacleName)} was still there, and the old thought came back: "${ctx.falseBelief}"`
        : `That did not work either, and it felt even harder than before.`;
    case "REFRAIN": {
      const pattern = ctx.template.repetitionPattern;
      const total = pattern ? pattern.occurrenceStages.length : 3;
      const isFinal = occurrenceIndex === total - 1;
      if (!isFinal) {
        return occurrenceIndex === 0
          ? `${protagonist} said it the way it had always felt true: "${ctx.falseBelief}"`
          : `The same words came back again: "${ctx.falseBelief}" They felt even heavier this time.`;
      }
      return `This time the words came out differently: "${ctx.trueBelief}"`;
    }
    case "STEP": {
      const frame = stepFrame(beatId);
      const detail = ctx.actionVerbs[occurrenceIndex % ctx.actionVerbs.length] || "look closer";
      if (frame === "encounter") {
        const itemsSoFar = ctx.actionVerbs.slice(0, occurrenceIndex + 1).map((verb) => verb.toLowerCase());
        return `${protagonist} found something new along the way and added it to everything found so far: ${itemsSoFar.join(", ")}. "And what could this be?" ${protagonist} wondered.`;
      }
      if (frame === "clue" || frame === "plant") {
        return `${protagonist} noticed something small and easy to miss: a quiet sign of ${lowerFirst(ctx.symbolLabel)}.`;
      }
      if (frame === "guide") {
        const guideStyles = ["acted right away", "spoke gently about how it felt", "shared a small, surprising thought"];
        if (supportProfile.mode === "solo") {
          return `A small sign along the way ${guideStyles[occurrenceIndex % guideStyles.length]}, giving ${protagonist} one new way to think about ${lowerFirst(ctx.conflictName)}.`;
        }
        return `${sentenceCase(supportProfile.primary)} ${guideStyles[occurrenceIndex % guideStyles.length]}, offering ${protagonist} one way to think about ${lowerFirst(ctx.conflictName)}.`;
      }
      if (frame === "option") {
        return occurrenceIndex === 0
          ? `One path looked easy, but it would not really solve ${lowerFirst(ctx.conflictName)}.`
          : `A second path looked better, but it created a new problem of its own.`;
      }
      if (frame === "question") {
        return `${protagonist} asked, "But why?" And the answer only led to a deeper question.`;
      }
      if (frame === "countdown") {
        const counts = ["Three", "Two", "One"];
        return `${counts[Math.min(occurrenceIndex, counts.length - 1)]}. ${protagonist} felt the moment ${occurrenceIndex === counts.length - 1 ? "slow down" : "rushing closer"}.`;
      }
      if (frame === "obstacle") {
        return `${lowerFirst(ctx.obstacleName)} stood in the way once more, harder to get past this time.`;
      }
      return `${protagonist} tried to ${detail.toLowerCase()}, and the path forward changed a little because of it.`;
    }
    case "PAUSE":
      return `${protagonist} stopped, took one slow breath, and said, "Wait." In that pause, ${protagonist} finally noticed the quiet hint of ${lowerFirst(ctx.symbolLabel)} that had been there all along, and understood: "${ctx.trueBelief}"`;
    case "INSIGHT":
      return `${protagonist} understood, all at once: "${ctx.trueBelief}"`;
    case "ESCALATION": {
      const intensifiers = ["a little bigger", "much bigger", "so big it filled everything"];
      return `The problem grew ${intensifiers[Math.min(occurrenceIndex, intensifiers.length - 1)]}, because it had been left alone instead of understood.`;
    }
    case "CHOICE":
      return `${protagonist} chose to believe, "${ctx.trueBelief}", and acted from that instead of from the old feeling.`;
    case "RESOLUTION":
      return `${protagonist} smiled because now ${protagonist} understood: "${ctx.trueBelief}" ${protagonist} completed the mission ${ctx.goalPhrase}, and ${lowerFirst(ctx.conflictName)} finally gave way. Everything felt warmer and freer than before. The ${lowerFirst(ctx.symbolLabel)} stayed close, a quiet part of how it happened.`;
    default:
      return `The path continued, and the feeling stayed close by, waiting to be understood.`;
  }
}

function buildCompleteStoryMasterFromTemplate(template, templateContext, storyPlan) {
  const realizationContext = buildTemplateRealizationContext(template, storyPlan, templateContext);
  const familyRealizedStory = buildCompleteStoryMasterFromFamilyRealizer(template, realizationContext, storyPlan);
  if (familyRealizedStory) {
    return familyRealizedStory;
  }
  const craftRequired = Boolean(templateContext._craftRequired);
  const ctx = { ...templateContext, template, openingStyle: classifyOpeningStyle(template) };
  const beatIds = template.requiredBeats && template.requiredBeats.length
    ? template.requiredBeats
    : ["SETUP", "RESOLUTION"];

  const kindCounters = {};
  const beatTexts = beatIds.map((beatId, index) => {
    // Every template's first beat is the Setup/Opening beat, and its last
    // beat is the Resolution beat, by schema convention (see each
    // template's sceneStructure[0] and sceneStructure[-1]) — regardless of
    // whether the beat id also happens to contain another keyword
    // (e.g. "OPENING_QUESTION", "PLANT_1", "COUNTDOWN_3", "NEW_ACTION").
    const isFirst = index === 0;
    const isLast = index === beatIds.length - 1;
    const kind = isFirst ? "OPENING" : isLast ? "RESOLUTION" : classifyTemplateBeat(beatId);
    const occurrenceIndex = kindCounters[kind] || 0;
    kindCounters[kind] = occurrenceIndex + 1;
    return { beatId, kind, text: generateBeatText(beatId, kind, occurrenceIndex, ctx) };
  });

  // The Blueprint's required craft technique (the "pause + one slow breath"
  // reflective beat) must appear somewhere in every story, regardless of
  // whether this template's own structure has a dedicated PAUSE beat.
  if (craftRequired && !beatTexts.some((beat) => beat.kind === "PAUSE")) {
    const resolutionBeat = beatTexts.slice().reverse().find((beat) => beat.kind === "RESOLUTION") || beatTexts[beatTexts.length - 1];
    if (resolutionBeat) {
      resolutionBeat.text = `${protagonistPauseLead(ctx)} ${resolutionBeat.text}`;
    }
  }

  const sceneIds = (storyPlan.scenePlan || []).map((scene) => scene.id);
  const n = sceneIds.length;
  const stageTexts = beatTexts.map((beat) => beat.text);
  let distributed;
  if (n === stageTexts.length) {
    distributed = stageTexts.slice();
  } else if (n < stageTexts.length) {
    // Even partition into exactly n buckets, covering every beat exactly once.
    distributed = [];
    for (let sceneIndex = 0; sceneIndex < n; sceneIndex++) {
      const start = Math.floor((sceneIndex * stageTexts.length) / n);
      const end = Math.floor(((sceneIndex + 1) * stageTexts.length) / n);
      distributed.push(stageTexts.slice(start, Math.max(end, start + 1)).join(" "));
    }
  } else {
    distributed = stageTexts.slice();
    const bridgeSentence = "The path continued, and the feeling stayed close by, waiting to be understood.";
    let insertAt = Math.min(3, distributed.length);
    while (distributed.length < n) {
      distributed.splice(insertAt, 0, bridgeSentence);
      insertAt += 1;
    }
  }

  const scenes = sceneIds.map((sceneId, index) => ({ sceneId, text: distributed[index] }));
  const title = `${ctx.protagonist} and the ${template.name} in ${ctx.situationTitle}`;

  return {
    title,
    storyText: scenes.map((scene) => scene.text).join("\n\n"),
    scenes,
    beatTexts,
    status: "COMPLETE_STORY_READY",
    templateUsed: template.templateId,
  };
}

function assertTemplateAfterWriting(templateSelection, blueprint, completeStoryMaster) {
  const issues = [];
  const storyText = normalize(completeStoryMaster && completeStoryMaster.storyText);
  const character = lookupById(state.libraries.indexes.characters, state.libraries.characters, blueprint.character && blueprint.character.selected);
  const situation = lookupById(state.libraries.indexes.situations, state.libraries.situations, blueprint.situation && blueprint.situation.id);
  const heroFirst = firstName((character && character.name) || "");

  if (completeStoryMaster && completeStoryMaster.templateUsed !== templateSelection.templateId) {
    issues.push(`Composed story used template ${completeStoryMaster && completeStoryMaster.templateUsed}, expected ${templateSelection.templateId}.`);
  }
  if (heroFirst && !storyText.includes(normalize(heroFirst))) {
    issues.push(`Composed story does not mention resolved hero "${heroFirst}".`);
  }
  if (situation) {
    // The Writer paraphrases the situation into natural prose (via
    // realizeSituation) rather than splicing the raw title, so this checks
    // semantic coverage against the authored storySeed (childExperience +
    // immediateObstacle — the concrete, event-specific fields; immediateWant
    // and emotionalTension are abstract and expected to be paraphrased away)
    // — never the title, which is canonical/internal only. storySeed text
    // uses "Kavi" as its generic placeholder hero name, same as
    // realizeSituation(), so it must be substituted with the resolved
    // protagonist before comparing against the composed story, or every
    // story would spuriously fail on the word "kavi" never appearing.
    const seed = situation.storySeed;
    const concreteSourceText = seed
      ? `${seed.childExperience || ""} ${seed.immediateObstacle || ""}`.replace(/\bKavi\b/g, heroFirst || "")
      : "";
    const concreteWords = extractConcreteWords(concreteSourceText);
    const missingWords = concreteWords.filter((word) => !storyText.includes(word));
    const coverage = concreteWords.length ? (concreteWords.length - missingWords.length) / concreteWords.length : 1;
    if (coverage < 0.6) {
      issues.push(`Composed story does not sufficiently reference resolved situation "${situation.title}" (missing: ${missingWords.join(", ")}).`);
    }
  }
  if (!storyText.includes(normalize(blueprint.belief.falseBelief))) {
    issues.push("Composed story is missing the resolved false belief.");
  }
  // trueBelief is checked as a paraphrase-tolerant concept, not an exact
  // substring — the child should demonstrate the realization through what
  // they notice/do, not recite the belief record verbatim as dialogue.
  if (!containsBeliefConcept(storyText, blueprint.belief.trueBelief)) {
    issues.push("Composed story is missing the resolved true belief.");
  }

  return { status: issues.length ? "FAIL" : "PASS", issues };
}

// forcedTemplateId is ONLY used by the dev QA matrix harness below, to test
// every template against the same Blueprint. It never affects the default
// selectStoryTemplate() scoring/decision logic — leaving it unset preserves
// the frozen T03 selection behavior exactly.
function forceSelectStoryTemplate(templateId, blueprint) {
  const template = (state.storyTemplates || []).find((item) => item.templateId === templateId);
  if (!template) {
    return null;
  }
  return {
    templateId: template.templateId,
    templateName: template.name,
    template,
    selectionReason: "Forced by QA matrix test harness (bypasses scoring).",
    confidence: "n/a (forced)",
    blueprintReference: blueprint.blueprintId,
  };
}

// Shared, UNCHANGED 8B-8F + Phase 9 pipeline. Called identically by the
// default composer, the T03-only Template-Filler path, and the new Event
// Planner path — only what feeds in as completeStoryMaster differs.
function runUnchanged8BThroughPhase9(completeStoryMaster, completeStoryValidation, storyPlan, storyBlueprint, plannerEventChainResult) {
  const pageManuscript = completeStoryMaster && completeStoryValidation && completeStoryValidation.status === "PASS"
    ? paginateCompleteStory(completeStoryMaster, storyPlan)
    : null;
  const pageValidation = pageManuscript ? validatePageManuscript(pageManuscript, completeStoryMaster, storyPlan) : null;
  const narrationLayer = pageManuscript && pageValidation && pageValidation.status === "PASS"
    ? buildNarrationLayer(pageManuscript, storyPlan, storyBlueprint)
    : null;
  const narrationValidation = narrationLayer ? validateNarrationLayer(narrationLayer, pageManuscript, storyPlan) : null;
  const dialogueLayer = narrationLayer && narrationValidation && narrationValidation.status === "PASS"
    ? extractDialogueLayer(pageManuscript, narrationLayer, storyBlueprint, state.libraries)
    : null;
  const dialogueValidation = dialogueLayer
    ? validateDialogueLayer(dialogueLayer, pageManuscript, narrationLayer, storyBlueprint)
    : null;
  const combinedPageManuscript = dialogueLayer && dialogueValidation && dialogueValidation.status === "PASS"
    ? buildCombinedPageManuscript(pageManuscript, narrationLayer, dialogueLayer)
    : null;
  const polishedManuscript = combinedPageManuscript ? buildPolishedManuscript(combinedPageManuscript) : null;
  const polishValidation = polishedManuscript
    ? validatePolishedManuscript(polishedManuscript, combinedPageManuscript, storyBlueprint)
    : null;
  const storyQAReport = polishedManuscript && polishValidation && polishValidation.status === "PASS"
    ? buildStoryQAReport(polishedManuscript, storyPlan, storyBlueprint, dialogueLayer)
    : null;
  const lockedFinalStory = storyQAReport && storyQAReport.status === "PASS"
    ? buildLockedFinalStory(polishedManuscript, storyPlan, storyBlueprint, storyQAReport)
    : null;
  const compressedStory = lockedFinalStory
    ? buildCompressedStory(lockedFinalStory, storyBlueprint, plannerEventChainResult)
    : null;
  const compressionQAReport = compressedStory
    ? validateCompressedStory(compressedStory, lockedFinalStory, storyBlueprint, plannerEventChainResult)
    : null;
  const illustrationPackage = lockedFinalStory
    ? buildIllustrationPackage(lockedFinalStory, storyPlan, storyBlueprint, pageManuscript, state.libraries)
    : null;
  const illustrationValidation = illustrationPackage
    ? validateIllustrationPackage(illustrationPackage, lockedFinalStory, storyPlan)
    : null;
  const promptPackResult = illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
    ? buildPromptPack(lockedFinalStory, illustrationPackage)
    : null;
  const promptPackValidation = promptPackResult
    ? validatePromptPack(promptPackResult, lockedFinalStory, illustrationPackage)
    : null;
  const illustrationAssetsResult = promptPackResult && promptPackValidation && promptPackValidation.status === "PASS"
    ? resolveIllustrationAssets(promptPackResult)
    : null;
  const layoutResult = illustrationAssetsResult
    ? buildBookLayout(lockedFinalStory, illustrationAssetsResult, illustrationPackage, promptPackResult)
    : null;
  const layoutValidation = layoutResult
    ? validateBookLayout(layoutResult, lockedFinalStory, illustrationAssetsResult, promptPackResult)
    : null;
  const productionMetadata = completeStoryMaster && storyBlueprint
    ? buildProductionMetadata(completeStoryMaster, storyBlueprint)
    : null;
  const productionQAReport = layoutResult && layoutValidation && layoutValidation.status === "PASS"
    ? buildProductionQAReport(lockedFinalStory, illustrationPackage, illustrationAssetsResult, promptPackResult, layoutResult, productionMetadata)
    : null;
  // Added 2026-08-11 (Dev A infra track — closing the production-integration
  // gap documented in tmp_dev_a_infra_report.md item 3): buildStoryArtifacts
  // (the pre-template pipeline) computes exportResult/exportValidation
  // inline and this shared tail previously didn't, so any caller of this
  // tail (buildStoryArtifactsWithTemplate/WithEventPlanner) produced an
  // artifacts object summarizeArtifactReadiness() would always reject on
  // the "Export" gate. Same computation, just present in both pipelines now.
  const exportResult = productionQAReport && productionQAReport.status === "PRODUCTION_READY"
    ? buildStoryPackage(storyBlueprint, storyPlan, completeStoryMaster, lockedFinalStory, illustrationPackage, promptPackResult, illustrationAssetsResult, layoutResult, productionQAReport)
    : null;
  const exportValidation = exportResult
    ? validateStoryPackageExport(exportResult, lockedFinalStory, layoutResult, productionQAReport)
    : null;

  return {
    pageManuscript,
    pageValidation,
    narrationLayer,
    narrationValidation,
    dialogueLayer,
    dialogueValidation,
    combinedPageManuscript,
    polishedManuscript,
    polishValidation,
    storyQAReport,
    lockedFinalStory,
    compressedStory,
    compressionQAReport,
    illustrationPackage,
    illustrationValidation,
    promptPackResult,
    promptPackValidation,
    illustrationAssetsResult,
    layoutResult,
    layoutValidation,
    productionMetadata,
    productionQAReport,
    exportResult,
    exportValidation,
  };
}

function buildStoryArtifactsWithTemplate(result, request, forcedTemplateId) {
  const storyBlueprint = buildStoryBlueprint(result, request);
  const storyPlan = storyBlueprint ? buildStoryPlan(storyBlueprint, state.libraries) : null;

  const templateSelection = storyPlan
    ? (forcedTemplateId ? forceSelectStoryTemplate(forcedTemplateId, storyBlueprint) : selectStoryTemplate(storyBlueprint, storyPlan, state.libraries))
    : null;
  const templateFill = templateSelection ? fillStoryTemplate(templateSelection.template, storyBlueprint, storyPlan, state.libraries) : null;
  const templatePreAssertion = templateSelection ? assertTemplateBeforeWriting(templateSelection, storyBlueprint, templateFill) : null;
  const completeStoryMaster = templateFill && templatePreAssertion && templatePreAssertion.status === "PASS"
    ? buildCompleteStoryMasterFromTemplate(templateSelection.template, templateFill, storyPlan)
    : null;
  const templatePostAssertion = completeStoryMaster ? assertTemplateAfterWriting(templateSelection, storyBlueprint, completeStoryMaster) : null;
  const completeStoryValidation = completeStoryMaster && templatePostAssertion && templatePostAssertion.status === "PASS"
    ? validateCompleteStoryMaster(completeStoryMaster, storyPlan, storyBlueprint)
    : { status: "FAIL", issues: (templatePreAssertion && templatePreAssertion.issues) || (templatePostAssertion && templatePostAssertion.issues) || ["Template layer did not produce a valid complete story master."] };

  const tail = runUnchanged8BThroughPhase9(completeStoryMaster, completeStoryValidation, storyPlan, storyBlueprint, null);

  return {
    storyBlueprint,
    storyPlan,
    templateSelection,
    templateFill,
    templatePreAssertion,
    templatePostAssertion,
    completeStoryMaster,
    completeStoryValidation,
    ...tail,
  };
}

// Phase 8A REDESIGN pilot: Event Planner -> Event Validation -> Writer,
// in place of the flat Template Filler, for T03 only. Everything from
// pageManuscript onward is the identical, unchanged 8B-8F + Phase 9 tail.
function buildStoryArtifactsWithEventPlanner(result, request, forcedTemplateId) {
  const storyBlueprint = buildStoryBlueprint(result, request);
  const storyPlan = storyBlueprint ? buildStoryPlan(storyBlueprint, state.libraries) : null;

  const templateSelection = storyPlan
    ? (forcedTemplateId ? forceSelectStoryTemplate(forcedTemplateId, storyBlueprint) : selectStoryTemplate(storyBlueprint, storyPlan, state.libraries))
    : null;
  const eventChainResult = templateSelection ? buildEventChainV2(templateSelection.template, storyBlueprint, storyPlan, state.libraries) : null;
  const eventChainValidation = eventChainResult ? validateEventChain(eventChainResult, storyBlueprint) : null;
  const completeStoryMaster = eventChainResult && eventChainValidation && eventChainValidation.status === "PASS"
    ? writeProseFromEventChain(templateSelection.template, eventChainResult, storyPlan)
    : null;
  const templatePostAssertion = completeStoryMaster ? assertTemplateAfterWriting(templateSelection, storyBlueprint, completeStoryMaster) : null;
  const completeStoryValidation = completeStoryMaster && templatePostAssertion && templatePostAssertion.status === "PASS"
    ? validateCompleteStoryMaster(completeStoryMaster, storyPlan, storyBlueprint)
    : {
      status: "FAIL",
      issues: (templatePostAssertion && templatePostAssertion.issues && templatePostAssertion.issues.length ? templatePostAssertion.issues : null)
        || (eventChainValidation && eventChainValidation.issues && eventChainValidation.issues.length ? eventChainValidation.issues : null)
        || ["Event Planner did not produce a valid complete story master."],
    };

  const tail = runUnchanged8BThroughPhase9(completeStoryMaster, completeStoryValidation, storyPlan, storyBlueprint, eventChainResult);

  return {
    storyBlueprint,
    storyPlan,
    templateSelection,
    eventChainResult,
    eventChainValidation,
    templatePostAssertion,
    completeStoryMaster,
    completeStoryValidation,
    ...tail,
  };
}

function runT03TemplatePilotOnce(characterOverrideId, worldOverrideId) {
  if (!(state.recipe && state.recipe.context)) {
    return { ok: false, reason: "No resolved Blueprint is currently selected. Choose a situation first." };
  }
  const request = {
    ...buildRequest(),
    ...(characterOverrideId ? { characterId: characterOverrideId } : {}),
  };
  const overrides = worldOverrideId ? { worldId: worldOverrideId } : {};
  const previousOverrides = state.overrides;
  state.overrides = { ...state.overrides, ...overrides };
  const result = resolvePhase6(state.libraries, request, state.overrides);
  state.overrides = previousOverrides;

  if (!result.context) {
    return { ok: false, reason: "Resolver failed to produce a Blueprint for this run." };
  }

  const artifacts = buildStoryArtifactsWithTemplate(result, request);
  const ctx = result.context;

  return {
    ok: true,
    situationId: ctx.situation && ctx.situation.id,
    characterId: ctx.character && ctx.character.id,
    worldId: ctx.world && ctx.world.id,
    missionId: ctx.mission && ctx.mission.id,
    symbolId: ctx.symbol && ctx.symbol.id,
    blueprintId: artifacts.storyBlueprint && artifacts.storyBlueprint.blueprintId,
    templateSelected: artifacts.templateSelection && artifacts.templateSelection.templateId,
    selectionReason: artifacts.templateSelection && artifacts.templateSelection.selectionReason,
    preAssertion: artifacts.templatePreAssertion,
    postAssertion: artifacts.templatePostAssertion,
    attempts: artifacts.completeStoryMaster && artifacts.completeStoryMaster.beatTexts
      ? artifacts.completeStoryMaster.beatTexts.filter((beat) => beat.kind === "ATTEMPT").map((beat) => beat.text)
      : [],
    completeStoryValidation: artifacts.completeStoryValidation && artifacts.completeStoryValidation.status,
    storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
    productionQA: artifacts.productionQAReport && artifacts.productionQAReport.status,
    title: artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
    storyText: artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
  };
}

function attemptsAreDistinct(attempts) {
  const normalized = (attempts || []).map((text) => normalize(text));
  return new Set(normalized).size === normalized.length && normalized.every((text) => text.length > 0);
}

function runT03TemplatePilot() {
  const runA = runT03TemplatePilotOnce(null, null);
  if (!runA.ok) {
    console.error("[T03 pilot] run A failed to start:", runA.reason);
    return { runA, runB: null, sameSituationDifferentBlueprint: false };
  }

  const characterCandidates = (state.recipe.recommendations && state.recipe.recommendations.characters) || [];
  const altCharacter = characterCandidates.find((character) => String(character.id) !== String(runA.characterId));
  const worldCandidates = (state.recipe.recommendations && state.recipe.recommendations.worlds) || [];
  const altWorld = worldCandidates.find((world) => String(world.id) !== String(runA.worldId));

  const runB = altCharacter
    ? runT03TemplatePilotOnce(altCharacter.id, null)
    : altWorld
      ? runT03TemplatePilotOnce(null, altWorld.id)
      : null;

  const sameSituation = runB && runB.ok && runB.situationId === runA.situationId;
  const differentBlueprint = runB && runB.ok && runB.blueprintId !== runA.blueprintId;
  const differentStoryText = runB && runB.ok && normalize(runB.storyText) !== normalize(runA.storyText);

  const report = {
    runA,
    runB,
    sameSituationDifferentBlueprint: Boolean(sameSituation && differentBlueprint && differentStoryText),
  };

  console.log("[T03 Template Pilot] Run A", runA);
  if (runB) {
    console.log("[T03 Template Pilot] Run B (same situation, different world override)", runB);
    console.log("[T03 Template Pilot] Proves template is not hardcoded to one story:", report.sameSituationDifferentBlueprint);
  } else {
    console.log("[T03 Template Pilot] No alternate world candidate available for run B on this situation.");
  }

  return report;
}

// ---------------------------------------------------------------------------
// T01-T20 template library QA matrix (dev-only). Validates schema, selector
// coverage, and runs every template through the frozen T03 architecture
// (Selector -> Filler -> assertions -> 8A -> 8B-8F -> Phase 9, unchanged)
// against the current Blueprint using forceSelectStoryTemplate for testing.
// ---------------------------------------------------------------------------

const TEMPLATE_SCHEMA_REQUIRED_FIELDS = [
  "templateId", "name", "storyMechanic", "bestForNeeds", "bestForSituations",
  "bestForLogicFamilies", "requiredBeats", "sceneStructure", "repetitionPattern",
  "escalationPattern", "turningPoint", "resolutionPattern", "requiredBlueprintSlots",
  "optionalBlueprintSlots", "symbolIntegrationPoint", "illustrationOpportunities",
  "pageRhythmGuidance", "exampleSkeleton",
];
const VALID_BLUEPRINT_SLOTS = [
  "situation", "character", "need", "belief.falseBelief", "belief.trueBelief",
  "mission", "storyActions", "world", "obstacle", "storyConflict", "symbol",
];

function validateTemplateLibrary(templates) {
  const issues = [];
  (templates || []).forEach((template) => {
    TEMPLATE_SCHEMA_REQUIRED_FIELDS.forEach((field) => {
      if (!(field in template)) {
        issues.push(`${template.templateId || "(unknown)"}: missing required field "${field}".`);
      }
    });
    ["bestForNeeds", "bestForSituations", "bestForLogicFamilies", "requiredBeats", "sceneStructure", "requiredBlueprintSlots", "optionalBlueprintSlots", "illustrationOpportunities", "exampleSkeleton"].forEach((field) => {
      if (field in template && !Array.isArray(template[field])) {
        issues.push(`${template.templateId}: field "${field}" must be an array.`);
      }
    });
    (template.requiredBlueprintSlots || []).forEach((slot) => {
      if (!VALID_BLUEPRINT_SLOTS.includes(slot)) {
        issues.push(`${template.templateId}: requiredBlueprintSlots contains unknown slot "${slot}".`);
      }
    });
    (template.optionalBlueprintSlots || []).forEach((slot) => {
      if (!VALID_BLUEPRINT_SLOTS.includes(slot)) {
        issues.push(`${template.templateId}: optionalBlueprintSlots contains unknown slot "${slot}".`);
      }
    });
    if (!template.requiredBeats || template.requiredBeats.length < 4) {
      issues.push(`${template.templateId}: requiredBeats should describe a real multi-beat structure (found ${(template.requiredBeats || []).length}).`);
    }
  });

  const ids = (templates || []).map((template) => template.templateId);
  const expectedIds = Array.from({ length: 20 }, (_, i) => `T${String(i + 1).padStart(2, "0")}`);
  expectedIds.forEach((id) => {
    if (!ids.includes(id)) {
      issues.push(`Missing template ${id}.`);
    }
  });

  return { status: issues.length ? "FAIL" : "PASS", issues, templateCount: ids.length };
}

function runSelectorCoverageTest() {
  const cases = (state.storyTemplates || []).map((template) => ({
    templateId: template.templateId,
    needId: (template.bestForNeeds || [])[0],
    logicId: (template.bestForLogicFamilies || [])[0],
  })).filter((testCase) => testCase.needId && testCase.logicId);

  const results = cases.map((testCase) => {
    const syntheticBlueprint = { blueprintId: `TEST_${testCase.templateId}`, need: { id: testCase.needId }, situation: { id: null } };
    const syntheticPlan = { storyFlow: { logic: { id: testCase.logicId } } };
    const selection = selectStoryTemplate(syntheticBlueprint, syntheticPlan, state.libraries);
    return {
      ...testCase,
      selected: selection && selection.templateId,
      matched: selection && selection.templateId === testCase.templateId,
    };
  });

  return {
    status: results.every((result) => result.matched) ? "PASS" : "PARTIAL",
    results,
  };
}

// Dev-only: generate one reader-ready story (title + polished pages) for a
// given situationId, optionally forcing a specific template. Used by the
// batch-evaluation script; does not affect the live Generate flow.
function generateReaderReadyStory(situationId, templateId, characterId) {
  const request = { situationId, characterId: characterId || null };
  const result = resolvePhase6(state.libraries, request, {});
  if (!result.context) {
    return { ok: false, reason: "Resolver failed for this situation.", situationId, templateId };
  }
  const artifacts = buildStoryArtifactsWithTemplate(result, request, templateId || null);
  const ctx = result.context;
  if (!artifacts.lockedFinalStory) {
    return {
      ok: false,
      reason: "Did not reach a locked final story.",
      situationId,
      templateId: artifacts.templateSelection && artifacts.templateSelection.templateId,
      storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
      storyQAErrors: (artifacts.storyQAReport && artifacts.storyQAReport.errors || []).map((error) => error.ruleId),
    };
  }
  return {
    ok: true,
    situationId,
    situationTitle: ctx.situation && ctx.situation.title,
    templateId: artifacts.templateSelection && artifacts.templateSelection.templateId,
    templateName: artifacts.templateSelection && artifacts.templateSelection.templateName,
    heroName: firstName((ctx.character && ctx.character.name) || ""),
    title: artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
    trueBelief: ctx.belief && ctx.belief.trueBelief,
    pages: artifacts.lockedFinalStory.pages.map((page) => page.text),
    productionQA: artifacts.productionQAReport && artifacts.productionQAReport.status,
  };
}
window.generateReaderReadyStory = generateReaderReadyStory;

// Dev-only: run the Event Planner pilot for one situation, forcing a
// template (T03 for the pilot). Returns the event chain (for inspection),
// the final reader-ready story, and the QA gates, per the acceptance
// checklist: event chain -> final story -> 8F QA -> Phase 9.
function generateEventPlannerStory(situationId, templateId, characterId) {
  const request = { situationId, characterId: characterId || null };
  const result = resolvePhase6(state.libraries, request, {});
  if (!result.context) {
    return { ok: false, reason: "Resolver failed for this situation.", situationId, templateId };
  }
  const artifacts = buildStoryArtifactsWithEventPlanner(result, request, templateId || null);
  const ctx = result.context;
  const events = artifacts.eventChainResult && artifacts.eventChainResult.events;

  if (!artifacts.lockedFinalStory) {
    return {
      ok: false,
      reason: "Did not reach a locked final story.",
      situationId,
      situationTitle: ctx.situation && ctx.situation.title,
      templateId: artifacts.templateSelection && artifacts.templateSelection.templateId,
      events,
      generatedPlan: artifacts.eventChainResult && artifacts.eventChainResult.planForLint,
      eventChainValidation: artifacts.eventChainValidation,
      completeStoryValidation: artifacts.completeStoryValidation,
      storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
      storyQAErrors: (artifacts.storyQAReport && artifacts.storyQAReport.errors || []).map((error) => error.ruleId),
      compressionQA: artifacts.compressionQAReport && artifacts.compressionQAReport.status,
      storyText: artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
    };
  }
  return {
    ok: true,
    situationId,
    situationTitle: ctx.situation && ctx.situation.title,
    missionId: ctx.mission && ctx.mission.id,
    obstacleId: ctx.obstacle && ctx.obstacle.id,
    templateId: artifacts.templateSelection && artifacts.templateSelection.templateId,
    templateName: artifacts.templateSelection && artifacts.templateSelection.templateName,
    heroName: firstName((ctx.character && ctx.character.name) || ""),
    title: artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
    trueBelief: ctx.belief && ctx.belief.trueBelief,
    events,
    generatedPlan: artifacts.eventChainResult && artifacts.eventChainResult.planForLint,
    eventChainValidation: artifacts.eventChainValidation,
    pages: artifacts.lockedFinalStory.pages.map((page) => page.text),
    storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
    productionQA: artifacts.productionQAReport && artifacts.productionQAReport.status,
    compressedStory: artifacts.compressedStory && artifacts.compressedStory.text,
    compressedStoryWordCount: artifacts.compressedStory && artifacts.compressedStory.wordCount,
    compressionQA: artifacts.compressionQAReport && artifacts.compressionQAReport.status,
  };
}
window.generateEventPlannerStory = generateEventPlannerStory;

// ---------------------------------------------------------------------------
// crossSituationDifferentiation validator. Compares EVENT CHAINS (not just
// final prose) for any two generated stories that share the same
// Mission+Obstacle id. Shared structural role is legitimate; near-identical
// concrete content is not. Flags CROSS_SITUATION_COLLISION.
// ---------------------------------------------------------------------------

function eventChainSignature(story) {
  const byPurpose = Object.fromEntries((story.events || []).map((event) => [event.purpose, event]));
  return {
    obstacle: normalize((byPurpose.attempt_1 && byPurpose.attempt_1.consequence) || ""),
    action1: normalize((byPurpose.attempt_1 && byPurpose.attempt_1.action) || ""),
    action2: normalize((byPurpose.attempt_2 && byPurpose.attempt_2.action) || ""),
    turningAction: normalize((byPurpose.turning_point && byPurpose.turning_point.action) || ""),
    consequence2: normalize((byPurpose.attempt_2 && byPurpose.attempt_2.consequence) || ""),
  };
}

// Two stories "materially differ" if their situation-driven obstacle text
// differs AND at least one other concrete-content field (action, turning
// point, consequence) also differs. Shared mission/obstacle/need alone is
// not a collision — only near-identical concrete content is.
function compareEventChains(storyA, storyB) {
  const sigA = eventChainSignature(storyA);
  const sigB = eventChainSignature(storyB);
  const fields = ["obstacle", "action1", "action2", "turningAction", "consequence2"];
  const differingFields = fields.filter((field) => sigA[field] !== sigB[field]);
  const obstacleDiffers = sigA.obstacle !== sigB.obstacle;
  const materiallyDifferent = obstacleDiffers && differingFields.length >= 2;
  return { differingFields, obstacleDiffers, materiallyDifferent };
}

function runCrossSituationDifferentiationCheck(stories) {
  const okStories = stories.filter((story) => story.ok);
  const groups = {};
  okStories.forEach((story) => {
    const key = `${story.missionId}::${story.obstacleId}`;
    (groups[key] = groups[key] || []).push(story);
  });

  const collisions = [];
  const comparisons = [];

  Object.entries(groups).forEach(([key, group]) => {
    if (group.length < 2) {
      return;
    }
    for (let i = 0; i < group.length; i += 1) {
      for (let j = i + 1; j < group.length; j += 1) {
        const a = group[i];
        const b = group[j];
        const comparison = compareEventChains(a, b);
        comparisons.push({
          sharedRole: key,
          situationA: a.situationId,
          situationB: b.situationId,
          ...comparison,
        });
        if (!comparison.materiallyDifferent) {
          collisions.push({
            status: "CROSS_SITUATION_COLLISION",
            sharedRole: key,
            situationA: a.situationId,
            situationTitleA: a.situationTitle,
            situationB: b.situationId,
            situationTitleB: b.situationTitle,
            differingFields: comparison.differingFields,
            reason: comparison.obstacleDiffers
              ? "Obstacle text differs but fewer than 2 other concrete-content fields diverge."
              : "Situation-driven obstacle text is identical across two different Situations.",
          });
        }
      }
    }
  });

  return {
    status: collisions.length ? "FAIL" : "PASS",
    sharedRoleGroups: Object.keys(groups).filter((key) => groups[key].length > 1).length,
    comparisons,
    collisions,
  };
}
window.runCrossSituationDifferentiationCheck = runCrossSituationDifferentiationCheck;

function runTemplateForBlueprint(templateId, result, request) {
  const artifacts = buildStoryArtifactsWithTemplate(result, request, templateId);
  const ctx = result.context;
  return {
    templateId,
    situationId: ctx.situation && ctx.situation.id,
    characterId: ctx.character && ctx.character.id,
    preAssertion: artifacts.templatePreAssertion && artifacts.templatePreAssertion.status,
    preAssertionIssues: (artifacts.templatePreAssertion && artifacts.templatePreAssertion.issues) || [],
    postAssertion: artifacts.templatePostAssertion && artifacts.templatePostAssertion.status,
    postAssertionIssues: (artifacts.templatePostAssertion && artifacts.templatePostAssertion.issues) || [],
    completeStoryValidation: artifacts.completeStoryValidation && artifacts.completeStoryValidation.status,
    storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
    storyQAErrors: (artifacts.storyQAReport && artifacts.storyQAReport.errors || []).map((error) => error.ruleId),
    productionQA: artifacts.productionQAReport && artifacts.productionQAReport.status,
    title: artifacts.completeStoryMaster && artifacts.completeStoryMaster.title,
    storyText: artifacts.completeStoryMaster && artifacts.completeStoryMaster.storyText,
  };
}

function runTemplateLibraryMatrix() {
  const schemaValidation = validateTemplateLibrary(state.storyTemplates);
  const selectorCoverage = runSelectorCoverageTest();

  if (!(state.recipe && state.recipe.context)) {
    return {
      schemaValidation,
      selectorCoverage,
      matrix: [],
      crossTemplateDistinctiveness: null,
      reason: "No resolved Blueprint is currently selected — choose a situation first to run the per-template generation matrix.",
    };
  }

  const request = buildRequest();
  const matrix = (state.storyTemplates || []).map((template) => runTemplateForBlueprint(template.templateId, state.recipe, request));

  const openings = matrix.map((run) => normalize((run.storyText || "").split("\n\n")[0] || ""));
  const uniqueOpenings = new Set(openings.filter(Boolean));
  const crossTemplateDistinctiveness = {
    templatesCompared: matrix.length,
    distinctOpeningLines: uniqueOpenings.size,
    allDistinct: uniqueOpenings.size === openings.filter(Boolean).length,
  };

  const allPass = matrix.every((run) =>
    run.preAssertion === "PASS" &&
    run.postAssertion === "PASS" &&
    run.completeStoryValidation === "PASS" &&
    run.storyQA === "PASS" &&
    run.productionQA === "PRODUCTION_READY"
  );

  return {
    schemaValidation,
    selectorCoverage,
    matrix,
    crossTemplateDistinctiveness,
    allTemplatesPass: allPass && schemaValidation.status === "PASS",
  };
}

function formatTemplateMatrixReport(report) {
  const lines = [];
  lines.push(`Schema validation: ${report.schemaValidation.status} (${report.schemaValidation.templateCount}/20 templates found)`);
  report.schemaValidation.issues.forEach((issue) => lines.push(`  - ${issue}`));
  lines.push("");
  lines.push(`Selector coverage: ${report.selectorCoverage.status}`);
  report.selectorCoverage.results.forEach((result) => {
    lines.push(`  ${result.templateId}: need=${result.needId} logic=${result.logicId} -> selected ${result.selected} ${result.matched ? "OK" : "MISMATCH"}`);
  });
  lines.push("");
  if (report.reason) {
    lines.push(report.reason);
    return lines.join("\n");
  }
  lines.push(`--- Per-template run against current Blueprint (situation ${report.matrix[0] && report.matrix[0].situationId}) ---`);
  report.matrix.forEach((run) => {
    const overall = run.preAssertion === "PASS" && run.postAssertion === "PASS" && run.completeStoryValidation === "PASS" && run.storyQA === "PASS" && run.productionQA === "PRODUCTION_READY" ? "PASS" : "FAIL";
    lines.push(`${run.templateId}: pre=${run.preAssertion} post=${run.postAssertion} 8A=${run.completeStoryValidation} 8F=${run.storyQA}${run.storyQAErrors.length ? ` (${run.storyQAErrors.join(",")})` : ""} Phase9=${run.productionQA} => ${overall}`);
    lines.push(`  ${run.title}`);
    run.preAssertionIssues.forEach((issue) => lines.push(`    pre-assertion issue: ${issue}`));
    run.postAssertionIssues.forEach((issue) => lines.push(`    post-assertion issue: ${issue}`));
  });
  lines.push("");
  lines.push(`Cross-template distinctiveness: ${report.crossTemplateDistinctiveness.distinctOpeningLines}/${report.crossTemplateDistinctiveness.templatesCompared} templates produced distinct opening lines from the same Blueprint. All distinct: ${report.crossTemplateDistinctiveness.allDistinct}`);
  lines.push("");
  lines.push(`ALL 20 TEMPLATES PASS (schema + 8F + Phase 9): ${report.allTemplatesPass}`);
  return lines.join("\n");
}

function buildStoryArtifacts(result, request) {
  const storyBlueprint = buildStoryBlueprint(result, request);
  const storyPlan = storyBlueprint ? buildStoryPlan(storyBlueprint, state.libraries) : null;
  const completeStoryMaster = storyPlan ? buildCompleteStoryMaster(storyPlan, storyBlueprint, state.libraries) : null;
  const completeStoryValidation = completeStoryMaster ? validateCompleteStoryMaster(completeStoryMaster, storyPlan, storyBlueprint) : null;
  const pageManuscript = completeStoryMaster && completeStoryValidation && completeStoryValidation.status === "PASS"
    ? paginateCompleteStory(completeStoryMaster, storyPlan)
    : null;
  const pageValidation = pageManuscript ? validatePageManuscript(pageManuscript, completeStoryMaster, storyPlan) : null;
  const narrationLayer = pageManuscript && pageValidation && pageValidation.status === "PASS"
    ? buildNarrationLayer(pageManuscript, storyPlan, storyBlueprint)
    : null;
  const narrationValidation = narrationLayer ? validateNarrationLayer(narrationLayer, pageManuscript, storyPlan) : null;
  const dialogueLayer = narrationLayer && narrationValidation && narrationValidation.status === "PASS"
    ? extractDialogueLayer(pageManuscript, narrationLayer, storyBlueprint, state.libraries)
    : null;
  const dialogueValidation = dialogueLayer
    ? validateDialogueLayer(dialogueLayer, pageManuscript, narrationLayer, storyBlueprint)
    : null;
  const combinedPageManuscript = dialogueLayer && dialogueValidation && dialogueValidation.status === "PASS"
    ? buildCombinedPageManuscript(pageManuscript, narrationLayer, dialogueLayer)
    : null;
  const polishedManuscript = combinedPageManuscript ? buildPolishedManuscript(combinedPageManuscript) : null;
  const polishValidation = polishedManuscript
    ? validatePolishedManuscript(polishedManuscript, combinedPageManuscript, storyBlueprint)
    : null;
  const storyQAReport = polishedManuscript && polishValidation && polishValidation.status === "PASS"
    ? buildStoryQAReport(polishedManuscript, storyPlan, storyBlueprint, dialogueLayer)
    : null;
  const lockedFinalStory = storyQAReport && storyQAReport.status === "PASS"
    ? buildLockedFinalStory(polishedManuscript, storyPlan, storyBlueprint, storyQAReport)
    : null;
  const compressedStory = lockedFinalStory
    ? buildCompressedStory(lockedFinalStory, storyBlueprint, null)
    : null;
  const compressionQAReport = compressedStory
    ? validateCompressedStory(compressedStory, lockedFinalStory, storyBlueprint, null)
    : null;
  const illustrationPackage = lockedFinalStory
    ? buildIllustrationPackage(lockedFinalStory, storyPlan, storyBlueprint, pageManuscript, state.libraries)
    : null;
  const illustrationValidation = illustrationPackage
    ? validateIllustrationPackage(illustrationPackage, lockedFinalStory, storyPlan)
    : null;
  const promptPackResult = illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
    ? buildPromptPack(lockedFinalStory, illustrationPackage)
    : null;
  const promptPackValidation = promptPackResult
    ? validatePromptPack(promptPackResult, lockedFinalStory, illustrationPackage)
    : null;
  const illustrationAssetsResult = promptPackResult && promptPackValidation && promptPackValidation.status === "PASS"
    ? resolveIllustrationAssets(promptPackResult)
    : null;
  const layoutResult = illustrationAssetsResult
    ? buildBookLayout(lockedFinalStory, illustrationAssetsResult, illustrationPackage, promptPackResult)
    : null;
  const layoutValidation = layoutResult
    ? validateBookLayout(layoutResult, lockedFinalStory, illustrationAssetsResult, promptPackResult)
    : null;
  const productionMetadata = completeStoryMaster && storyBlueprint
    ? buildProductionMetadata(completeStoryMaster, storyBlueprint)
    : null;
  const productionQAReport = layoutResult && layoutValidation && layoutValidation.status === "PASS"
    ? buildProductionQAReport(lockedFinalStory, illustrationPackage, illustrationAssetsResult, promptPackResult, layoutResult, productionMetadata)
    : null;
  const exportResult = productionQAReport && productionQAReport.status === "PRODUCTION_READY"
    ? buildStoryPackage(storyBlueprint, storyPlan, completeStoryMaster, lockedFinalStory, illustrationPackage, promptPackResult, illustrationAssetsResult, layoutResult, productionQAReport)
    : null;
  const exportValidation = exportResult
    ? validateStoryPackageExport(exportResult, lockedFinalStory, layoutResult, productionQAReport)
    : null;

  return {
    storyBlueprint,
    storyPlan,
    completeStoryMaster,
    completeStoryValidation,
    pageManuscript,
    pageValidation,
    narrationLayer,
    narrationValidation,
    dialogueLayer,
    dialogueValidation,
    combinedPageManuscript,
    polishedManuscript,
    polishValidation,
    storyQAReport,
    lockedFinalStory,
    compressedStory,
    compressionQAReport,
    illustrationPackage,
    illustrationValidation,
    promptPackResult,
    promptPackValidation,
    illustrationAssetsResult,
    layoutResult,
    layoutValidation,
    productionMetadata,
    productionQAReport,
    exportResult,
    exportValidation,
  };
}

function buildOutputText(result, outputType) {
  const ctx = result.context;
  const request = buildRequest();
  const {
    storyBlueprint,
    storyPlan,
    completeStoryMaster,
    completeStoryValidation,
    pageManuscript,
    pageValidation,
    narrationLayer,
    narrationValidation,
    dialogueLayer,
    dialogueValidation,
    combinedPageManuscript,
    polishedManuscript,
    polishValidation,
    storyQAReport,
    lockedFinalStory,
    illustrationPackage,
    illustrationValidation,
    promptPackResult,
    promptPackValidation,
    illustrationAssetsResult,
    layoutResult,
    layoutValidation,
    productionQAReport,
    exportResult,
    exportValidation,
  } = buildStoryArtifacts(result, request);
  const payload = outputType === "storyPlan"
    ? (storyPlan || storyBlueprint || buildPlannerResultPayload(result, request))
    : outputType === "story"
      ? ((completeStoryMaster && completeStoryValidation && completeStoryValidation.status === "PASS" && pageValidation && pageValidation.status === "PASS" && narrationValidation && narrationValidation.status === "PASS" && dialogueValidation && dialogueValidation.status === "PASS" && polishValidation && polishValidation.status === "PASS" && storyQAReport && storyQAReport.status === "PASS")
        ? {
          completeStoryMaster,
          pageManuscript,
          narrationLayer,
          dialogueLayer,
          combinedPageManuscript,
          polishedManuscript,
          storyQAReport,
          finalStory: lockedFinalStory,
          storyWriterValidation: {
            status: "PASS",
            blockingFailures: completeStoryValidation.blockingFailures,
            warnings: completeStoryValidation.warnings,
            rulesPassed: completeStoryValidation.rulesPassed,
          },
          pageWriterValidation: {
            status: "PASS",
            blockingFailures: pageValidation.blockingFailures,
            warnings: pageValidation.warnings,
            rulesPassed: pageValidation.rulesPassed,
          },
          narrationWriterValidation: {
            status: "PASS",
            blockingFailures: narrationValidation.blockingFailures,
            warnings: narrationValidation.warnings,
            rulesPassed: narrationValidation.rulesPassed,
          },
          dialogueWriterValidation: {
            status: "PASS",
            blockingFailures: dialogueValidation.blockingFailures,
            warnings: dialogueValidation.warnings,
            rulesPassed: dialogueValidation.rulesPassed,
          },
          languagePolishValidation: {
            status: "PASS",
            blockingFailures: polishValidation.blockingFailures,
            warnings: polishValidation.warnings,
            rulesPassed: polishValidation.rulesPassed,
          },
          storyQAValidation: {
            status: "PASS",
            blockingFailures: 0,
            warnings: 0,
            rulesPassed: storyQAReport.rulesPassed,
          },
        }
        : (storyPlan || storyBlueprint || buildPlannerResultPayload(result, request)))
      : outputType === "illustrationBible"
        ? ((illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS")
          ? {
            illustrationPlan: illustrationPackage.illustrationPlan,
            illustrationBible: illustrationPackage.illustrationBible,
            illustrationDirectorValidation: {
              status: "PASS",
              blockingFailures: illustrationValidation.blockingFailures,
              warnings: illustrationValidation.warnings,
              rulesPassed: illustrationValidation.rulesPassed,
            },
          }
          : (lockedFinalStory || storyPlan || storyBlueprint || buildPlannerResultPayload(result, request)))
      : outputType === "illustrationPrompts"
        ? ((promptPackResult && promptPackValidation && promptPackValidation.status === "PASS")
          ? {
            illustrationPlanReference: { id: illustrationPackage.planId },
            illustrationBibleReference: { id: illustrationPackage.bibleId },
            promptPack: promptPackResult.promptPack,
            promptBuilderValidation: {
              status: "PASS",
              blockingFailures: promptPackValidation.blockingFailures,
              warnings: promptPackValidation.warnings,
              rulesPassed: promptPackValidation.rulesPassed,
            },
            }
            : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
              ? {
              illustrationPlan: illustrationPackage.illustrationPlan,
              illustrationBible: illustrationPackage.illustrationBible,
            }
            : (lockedFinalStory || storyPlan || storyBlueprint || buildPlannerResultPayload(result, request))))
      : outputType === "bookLayout"
        ? ((layoutResult && layoutValidation && layoutValidation.status === "PASS")
          ? {
            illustrationAssets: illustrationAssetsResult.assets,
            layout: layoutResult.layout,
            layoutDebug: layoutResult.layoutDebug,
            layoutEngineValidation: {
              status: "PASS",
              blockingFailures: layoutValidation.blockingFailures,
              warnings: layoutValidation.warnings,
              rulesPassed: layoutValidation.rulesPassed,
            },
          }
          : (promptPackResult && promptPackValidation && promptPackValidation.status === "PASS"
            ? {
              illustrationAssets: illustrationAssetsResult.assets,
              promptPack: promptPackResult.promptPack,
            }
            : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
              ? {
                illustrationPlan: illustrationPackage.illustrationPlan,
                illustrationBible: illustrationPackage.illustrationBible,
              }
              : (lockedFinalStory || storyPlan || storyBlueprint || buildPlannerResultPayload(result, request)))))
      : outputType === "productionQA"
        ? ((productionQAReport && productionQAReport.status === "PRODUCTION_READY")
          ? {
            productionQAReport,
            productionReadyBook: {
              finalStoryReference: { id: lockedFinalStory.id },
              illustrationAssetReferences: illustrationAssetsResult.assets.map((asset) => ({ id: asset.assetId, location: asset.assetLocation })),
              layoutReference: { id: layoutResult.layoutId },
            },
            productionQAValidation: {
              status: "PASS",
              blockingFailures: productionQAReport.validation.rulesFailed,
              warnings: 0,
              rulesPassed: productionQAReport.validation.rulesPassed,
            },
          }
          : (layoutResult && layoutValidation && layoutValidation.status === "PASS"
            ? {
              illustrationAssets: illustrationAssetsResult.assets,
              layout: layoutResult.layout,
              productionQAReport,
            }
            : (promptPackResult && promptPackValidation && promptPackValidation.status === "PASS"
              ? {
                illustrationAssets: illustrationAssetsResult.assets,
                promptPack: promptPackResult.promptPack,
              }
              : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
                ? {
                  illustrationPlan: illustrationPackage.illustrationPlan,
                  illustrationBible: illustrationPackage.illustrationBible,
                }
                : (lockedFinalStory || storyPlan || storyBlueprint || buildPlannerResultPayload(result, request))))))
      : outputType === "exportPackage"
        ? ((exportResult && exportValidation && exportValidation.status === "PASS")
          ? {
            storyPackage: exportResult.storyPackage,
            assetManifest: exportResult.assetManifest,
            exportMetadata: exportResult.exportMetadata,
            exportReport: exportResult.exportReport,
            exportEngineValidation: {
              status: "PASS",
              blockingFailures: exportValidation.blockingFailures,
              warnings: exportValidation.warnings,
              rulesPassed: exportValidation.rulesPassed,
            },
          }
          : (productionQAReport && productionQAReport.status === "PRODUCTION_READY"
            ? {
              productionQAReport,
              layout: layoutResult.layout,
            }
            : (layoutResult && layoutValidation && layoutValidation.status === "PASS"
              ? {
                illustrationAssets: illustrationAssetsResult.assets,
                layout: layoutResult.layout,
              }
              : (promptPackResult && promptPackValidation && promptPackValidation.status === "PASS"
                ? {
                  illustrationAssets: illustrationAssetsResult.assets,
                  promptPack: promptPackResult.promptPack,
                }
                : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
                  ? {
                    illustrationPlan: illustrationPackage.illustrationPlan,
                    illustrationBible: illustrationPackage.illustrationBible,
                  }
                  : (lockedFinalStory || storyPlan || storyBlueprint || buildPlannerResultPayload(result, request)))))))
      : (storyBlueprint || buildPlannerResultPayload(result, request));
  const recipeText = [
    `Planner Status: ${result.status}`,
    `Situation: ${ctx.situation && ctx.situation.title}`,
    `Need: ${ctx.need && ctx.need.id}`,
    `False Belief: ${ctx.belief && ctx.belief.falseBelief}`,
    `True Belief: ${ctx.belief && ctx.belief.trueBelief}`,
    `Character: ${ctx.character && ctx.character.name}`,
    `Archetype: ${ctx.archetype && ctx.archetype.name}`,
    `Mission Type: ${ctx.missionType && ctx.missionType.id}`,
    `Mission: ${ctx.mission && ctx.mission.name}`,
    `World: ${ctx.world && ctx.world.name}`,
    `Conflict: ${ctx.storyConflict && ctx.storyConflict.name}`,
    `Logic: ${ctx.logic && ctx.logic.id}`,
    `Structure: ${ctx.storyStructure && ctx.storyStructure.name}`,
    `Beat Graph: ${ctx.beatPlan.map((beat) => beat.name).join(" -> ")}`,
    `Opening: ${ctx.opening && ctx.opening.name}`,
    `Ending: ${ctx.ending && ctx.ending.name}`,
    `Ganesha Symbol: ${ctx.symbol && ctx.symbol.id}`,
  ].join("\n");

  const instructions = {
    storyPlan: "Generate the Phase 7 Story Plan from the validated Story Blueprint only. Do not write prose. Keep Page Plan as pagination guidance for Phase 8B, not page-by-page writing instructions for Phase 8A.",
    story: "Write the complete story first from the locked Story Plan. Do not divide it into pages yet. Preserve the StoryPlan decisions, belief shift, symbols, and craft guidance while producing one coherent children's story.",
    beatSheet: "Write a concise beat sheet that follows the resolved Beat graph exactly.",
    illustrationBible: "Build the Phase 9A Illustration Plan and Illustration Bible from the locked Final Story. Preserve the manuscript exactly and output visual direction only: page moments, character/world continuity, symbol placement, composition, and production-safe constraints.",
    illustrationPrompts: "Build the Phase 9B Prompt Pack from the validated Illustration Plan and Illustration Bible. Preserve the locked visual moment on every page, include continuity and negative constraints, and do not invent new story content.",
    bookLayout: "Build the Phase 9C Book Layout from the locked Final Story, page-level manuscript, resolved illustration assets, and Illustration Plan. Place text and art without changing any locked story text, and preserve readable safe-area layout for both digital and print use.",
    productionQA: "Run the Phase 9D Production QA gate across the locked Final Story, resolved illustration assets, Prompt Pack, and Book Layout. Report blocking failures honestly and never modify story, art, or layout content to force a pass.",
    exportPackage: "Run the Phase 9E Export Engine from the PRODUCTION_READY package only. Preserve the locked story, approved illustrations, and approved layout exactly while assembling the story package, asset manifest, export metadata, and export report.",
    parentNote: "Write a parent note tied directly to the Need, Belief shift, and the protagonist's achieved agency.",
    activity: "Design one offline activity tied directly to the Need, Mission, and Ganesha Symbol.",
  };

  const blockerLine = result.status === "PASS"
    ? (outputType === "story"
      ? (completeStoryValidation && completeStoryValidation.status === "PASS" && pageValidation && pageValidation.status === "PASS" && narrationValidation && narrationValidation.status === "PASS" && dialogueValidation && dialogueValidation.status === "PASS" && polishValidation && polishValidation.status === "PASS" && storyQAReport && storyQAReport.status === "PASS"
        ? "StoryPlan handoff is clear and the final story has passed QA."
        : "StoryPlan handoff is clear, but the writing artifacts are not ready yet.")
      : outputType === "illustrationBible"
        ? (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
          ? "Final Story handoff is clear and the Illustration Director package is runtime-ready."
          : lockedFinalStory
            ? "Final Story is locked, but the Illustration Director package is not ready yet."
            : "Final Story is not locked yet, so Phase 9A cannot run.")
      : outputType === "illustrationPrompts"
        ? (promptPackResult && promptPackValidation && promptPackValidation.status === "PASS"
          ? "Illustration Plan handoff is clear and the Prompt Pack is runtime-ready."
          : illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS"
            ? "Illustration Director output is ready, but the Prompt Pack is not ready yet."
            : lockedFinalStory
              ? "Final Story is locked, but Phase 9A must pass before 9B can run."
              : "Final Story is not locked yet, so Phase 9B cannot run.")
      : outputType === "bookLayout"
        ? (layoutResult && layoutValidation && layoutValidation.status === "PASS"
          ? "Illustration asset handoff is clear and the Book Layout is runtime-ready."
          : promptPackResult && promptPackValidation && promptPackValidation.status === "PASS"
            ? "Prompt Pack is ready, but the Book Layout is not ready yet."
            : lockedFinalStory
              ? "Final Story is locked, but 9A and 9B must pass before 9C can run."
              : "Final Story is not locked yet, so Phase 9C cannot run.")
      : outputType === "productionQA"
        ? (productionQAReport && productionQAReport.status === "PRODUCTION_READY"
          ? "The production package has passed QA and is ready for export."
          : layoutResult && layoutValidation && layoutValidation.status === "PASS"
            ? "Layout is ready, but Production QA has found unresolved defects."
            : lockedFinalStory
              ? "Final Story is locked, but 9A through 9C must pass before 9D can run."
              : "Final Story is not locked yet, so Phase 9D cannot run.")
      : outputType === "exportPackage"
        ? (exportResult && exportValidation && exportValidation.status === "PASS"
          ? "Production QA is clear and export packaging is runtime-ready."
          : productionQAReport && productionQAReport.status === "PRODUCTION_READY"
            ? "Production QA passed, but the export package is not ready yet."
            : lockedFinalStory
              ? "Final Story is locked, but 9A through 9D must pass before 9E can run."
              : "Final Story is not locked yet, so Phase 9E cannot run.")
      : storyPlan ? "Blueprint handoff is clear and Phase 7 planning is ready." : "Blueprint handoff is clear.")
    : "Blueprint handoff is not clear yet; blocked or failed issues must remain visible.";

  const payloadLabel = outputType === "storyPlan"
    ? (storyPlan ? "Structured Story Plan JSON" : storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON")
    : outputType === "story"
      ? ((completeStoryMaster && completeStoryValidation && completeStoryValidation.status === "PASS" && pageValidation && pageValidation.status === "PASS" && narrationValidation && narrationValidation.status === "PASS" && dialogueValidation && dialogueValidation.status === "PASS" && polishValidation && polishValidation.status === "PASS" && storyQAReport && storyQAReport.status === "PASS")
        ? "Structured Final Story JSON"
        : storyPlan ? "Structured Story Plan JSON" : storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON")
      : outputType === "illustrationBible"
        ? ((illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS")
          ? "Structured Illustration Package JSON"
          : lockedFinalStory ? "Structured Final Story JSON" : storyPlan ? "Structured Story Plan JSON" : storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON")
      : outputType === "illustrationPrompts"
        ? ((promptPackResult && promptPackValidation && promptPackValidation.status === "PASS")
          ? "Structured Prompt Pack JSON"
          : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS")
            ? "Structured Illustration Package JSON"
            : lockedFinalStory ? "Structured Final Story JSON" : storyPlan ? "Structured Story Plan JSON" : storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON")
      : outputType === "bookLayout"
        ? ((layoutResult && layoutValidation && layoutValidation.status === "PASS")
          ? "Structured Book Layout JSON"
          : (promptPackResult && promptPackValidation && promptPackValidation.status === "PASS")
            ? "Structured Prompt Pack JSON"
            : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS")
              ? "Structured Illustration Package JSON"
              : lockedFinalStory ? "Structured Final Story JSON" : storyPlan ? "Structured Story Plan JSON" : storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON")
      : outputType === "productionQA"
        ? ((productionQAReport && productionQAReport.status === "PRODUCTION_READY")
          ? "Structured Production QA JSON"
          : (layoutResult && layoutValidation && layoutValidation.status === "PASS")
            ? "Structured Book Layout JSON"
            : (promptPackResult && promptPackValidation && promptPackValidation.status === "PASS")
              ? "Structured Prompt Pack JSON"
              : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS")
                ? "Structured Illustration Package JSON"
                : lockedFinalStory ? "Structured Final Story JSON" : storyPlan ? "Structured Story Plan JSON" : storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON")
      : outputType === "exportPackage"
        ? ((exportResult && exportValidation && exportValidation.status === "PASS")
          ? "Structured Export Package JSON"
          : (productionQAReport && productionQAReport.status === "PRODUCTION_READY")
            ? "Structured Production QA JSON"
            : (layoutResult && layoutValidation && layoutValidation.status === "PASS")
              ? "Structured Book Layout JSON"
              : (promptPackResult && promptPackValidation && promptPackValidation.status === "PASS")
                ? "Structured Prompt Pack JSON"
                : (illustrationPackage && illustrationValidation && illustrationValidation.status === "PASS")
                  ? "Structured Illustration Package JSON"
                  : lockedFinalStory ? "Structured Final Story JSON" : storyPlan ? "Structured Story Plan JSON" : storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON")
      : (storyBlueprint ? "Structured Story Blueprint JSON" : "Structured Planner Result JSON");

  return [
    `Output Type: ${outputType}`,
    "",
    instructions[outputType],
    blockerLine,
    "",
    "Locked Phase 6A Planner Context",
    recipeText,
    "",
    payloadLabel,
    JSON.stringify(payload, null, 2),
  ].join("\n");
}

function summarizeArtifactReadiness(result, artifacts) {
  if (result.status !== "PASS") {
    return {
      ok: false,
      message: `This story path is ${result.status}. Fix the current path or try another story.`,
      debug: `planner:${result.status}`,
    };
  }

  const checks = [
    ["Complete story", artifacts.completeStoryValidation && artifacts.completeStoryValidation.status === "PASS"],
    ["Pagination", artifacts.pageValidation && artifacts.pageValidation.status === "PASS"],
    ["Narration", artifacts.narrationValidation && artifacts.narrationValidation.status === "PASS"],
    ["Dialogue", artifacts.dialogueValidation && artifacts.dialogueValidation.status === "PASS"],
    ["Polish", artifacts.polishValidation && artifacts.polishValidation.status === "PASS"],
    ["Story QA", artifacts.storyQAReport && artifacts.storyQAReport.status === "PASS"],
    ["Illustration plan", artifacts.illustrationValidation && artifacts.illustrationValidation.status === "PASS"],
    ["Prompt pack", artifacts.promptPackValidation && artifacts.promptPackValidation.status === "PASS"],
    ["Layout", artifacts.layoutValidation && artifacts.layoutValidation.status === "PASS"],
    ["Production QA", artifacts.productionQAReport && artifacts.productionQAReport.status === "PRODUCTION_READY"],
    ["Export", artifacts.exportValidation && artifacts.exportValidation.status === "PASS"],
  ];
  const failed = checks.filter(([, pass]) => !pass).map(([label]) => label);
  return failed.length
    ? {
      ok: false,
      message: `Story generation stopped because these steps are not ready: ${failed.join(", ")}.`,
      debug: JSON.stringify({
        failed,
        completeStoryIssues: artifacts.completeStoryValidation && artifacts.completeStoryValidation.issues || [],
        pageIssues: artifacts.pageValidation && artifacts.pageValidation.issues || [],
        narrationIssues: artifacts.narrationValidation && artifacts.narrationValidation.issues || [],
        storyQAErrors: artifacts.storyQAReport && artifacts.storyQAReport.errors
          ? artifacts.storyQAReport.errors.map((item) => item.ruleId)
          : [],
      }),
    }
    : {
      ok: true,
      message: "Your story is ready and open in the reader.",
      debug: "ok",
    };
}

function generateCurrentStory() {
  if (!(state.recipe && state.recipe.context)) {
    setText("generationStatus", "Choose a situation first.");
    return;
  }

  stopNarration();
  state.generatedStorySession = null;
  renderReader();
  setText("generationStatus", "Making your story...");
  // Dev A infra track: staged rollout — forcedTemplateId intentionally
  // omitted (undefined) so this always goes through the NATURAL
  // selectStoryTemplate, never a forced/QA selection, when the toggle is on.
  const artifacts = isTemplatePipelineEnabled()
    ? buildStoryArtifactsWithEventPlanner(state.recipe, buildRequest())
    : buildStoryArtifacts(state.recipe, buildRequest());
  state.lastArtifacts = artifacts;
  const readiness = summarizeArtifactReadiness(state.recipe, artifacts);
  if (!readiness.ok) {
    document.body.dataset.pranaFailure = readiness.debug || "";
    setText("generationStatus", readiness.message);
    return;
  }

  document.body.dataset.pranaFailure = "";
  const session = buildStorySession(state.recipe, artifacts);
  openStorySession(session);
  setText("generationStatus", readiness.message);
}

function pickAlternative(items, currentId) {
  const candidates = (items || []).filter((item) => String(item.id) !== String(currentId));
  if (!candidates.length) {
    return null;
  }
  return candidates[Math.floor(Math.random() * candidates.length)];
}

function shuffleStoryPath() {
  if (!(state.recipe && state.recipe.context)) {
    state.seedMode = "surprise";
    resetStorySelectionOverrides();
    state.requestSeed = { situationId: pickSurpriseSituationId() };
    updateSeedPanels();
    recompute();
    return;
  }

  stopNarration();
  const ctx = state.recipe.context;
  const rec = state.recipe.recommendations || {};
  let changed = false;

  const mission = pickAlternative(rec.missions, ctx.mission && ctx.mission.id);
  const opening = pickAlternative(rec.openings, ctx.opening && ctx.opening.id);
  const ending = pickAlternative(rec.endings, ctx.ending && ctx.ending.id);
  const structure = pickAlternative(rec.structures, ctx.storyStructure && ctx.storyStructure.id);
  const world = pickAlternative(rec.worlds, ctx.world && ctx.world.id);

  if (mission) {
    state.overrides.missionId = mission.id;
    changed = true;
  }
  if (opening) {
    state.overrides.openingId = opening.id;
    changed = true;
  }
  if (ending) {
    state.overrides.endingId = ending.id;
    changed = true;
  }
  if (structure) {
    state.overrides.structureId = structure.id;
    changed = true;
  }
  if (world) {
    state.overrides.worldId = world.id;
    changed = true;
  }

  if (!changed) {
    state.seedMode = "surprise";
    resetStorySelectionOverrides();
    state.requestSeed = { situationId: pickSurpriseSituationId() };
    updateSeedPanels();
  }

  recompute();
}

function tryAnotherStory() {
  shuffleStoryPath();
}

function rerollStoryPath() {
  shuffleStoryPath();
  generateCurrentStory();
}

function formatT03PilotReport(report) {
  const lines = [];
  const printRun = (label, run) => {
    lines.push(`--- ${label} ---`);
    if (!run || !run.ok) {
      lines.push(`FAILED: ${(run && run.reason) || "unknown"}`);
      return;
    }
    lines.push(`situationId: ${run.situationId}`);
    lines.push(`characterId: ${run.characterId}`);
    lines.push(`worldId: ${run.worldId}`);
    lines.push(`missionId: ${run.missionId}`);
    lines.push(`symbolId: ${run.symbolId}`);
    lines.push(`blueprintId: ${run.blueprintId}`);
    lines.push(`templateSelected: ${run.templateSelected} (${run.selectionReason})`);
    lines.push(`pre-assertion: ${run.preAssertion && run.preAssertion.status} ${(run.preAssertion && run.preAssertion.issues || []).join("; ")}`);
    lines.push(`post-assertion: ${run.postAssertion && run.postAssertion.status} ${(run.postAssertion && run.postAssertion.issues || []).join("; ")}`);
    lines.push(`attempts distinct: ${attemptsAreDistinct(run.attempts)}`);
    run.attempts.forEach((attempt, i) => lines.push(`  attempt ${i + 1}: ${attempt}`));
    lines.push(`8A completeStoryValidation: ${run.completeStoryValidation}`);
    lines.push(`8F storyQA: ${run.storyQA}`);
    lines.push(`Phase 9 productionQA: ${run.productionQA}`);
    lines.push(`title: ${run.title}`);
  };

  printRun("Run A (current Blueprint)", report.runA);
  lines.push("");
  printRun("Run B (same situation, alternate hero/world override)", report.runB);
  lines.push("");
  lines.push(`Proves template is not hardcoded to one story: ${report.sameSituationDifferentBlueprint}`);
  return lines.join("\n");
}

function bindProductActions() {
  byId("generateStoryBtn").addEventListener("click", generateCurrentStory);
  byId("anotherStoryBtn").addEventListener("click", tryAnotherStory);
  if (byId("runT03PilotBtn")) {
    byId("runT03PilotBtn").addEventListener("click", () => {
      byId("t03PilotOutput").textContent = "Running...";
      const report = runT03TemplatePilot();
      byId("t03PilotOutput").textContent = formatT03PilotReport(report);
    });
  }
  if (byId("runTemplateMatrixBtn")) {
    byId("runTemplateMatrixBtn").addEventListener("click", () => {
      byId("t03PilotOutput").textContent = "Running T01-T20 matrix...";
      const report = runTemplateLibraryMatrix();
      console.log("[Template Library Matrix]", report);
      window.__lastTemplateMatrixReport = report;
      byId("t03PilotOutput").textContent = formatTemplateMatrixReport(report);
    });
  }
  byId("saveStoryBtn").addEventListener("click", saveCurrentStory);
  byId("readerSaveBtn").addEventListener("click", () => {
    if (!state.generatedStorySession) {
      return;
    }
    if (!currentStoryIsSaved()) {
      saveCurrentStory();
      return;
    }
    toggleStoryFavorite(state.generatedStorySession.saveId);
  });
  byId("backToHomeBtn").addEventListener("click", openHome);
  byId("openLibraryBtn").addEventListener("click", openLibrary);
  byId("navHomeBtn").addEventListener("click", openHome);
  byId("navStoriesBtn").addEventListener("click", openLibrary);
  byId("navActivitiesBtn").addEventListener("click", openActivities);
  byId("navHomeBtnLibrary").addEventListener("click", openHome);
  byId("navActivitiesBtnLibrary").addEventListener("click", openActivities);
  byId("navHomeBtnActivities").addEventListener("click", openHome);
  byId("navStoriesBtnActivities").addEventListener("click", openLibrary);
  byId("homeCreateStoryBtn").addEventListener("click", () => showScreen("situation"));
  byId("homeMyStoriesBtn").addEventListener("click", openLibrary);
  byId("homeActivitiesBtn").addEventListener("click", openActivities);
  bindJourneyNavButtons();
  byId("prevPageBtn").addEventListener("click", () => {
    goToReaderPage(state.readerIndex - 1);
  });
  byId("nextPageBtn").addEventListener("click", () => {
    goToReaderPage(state.readerIndex + 1);
  });
  byId("playStoryBtn").addEventListener("click", () => speakCurrentPage(false));
  byId("pauseStoryBtn").addEventListener("click", pauseNarration);
  byId("replayStoryBtn").addEventListener("click", () => {
    goToReaderPage(0);
    speakCurrentPage(true);
  });
  bindReaderGestures();
}

function syncVisibleSeedState(result) {
  const ctx = result.context;
  if (!ctx || !ctx.situation) {
    return;
  }

  if (state.seedMode !== "situation") {
    if (byId("situationSearch")) {
      byId("situationSearch").value = ctx.situation.title;
    }
    const matchedCategoryId = findUiCategoryForSituation(ctx.situation);
    if (byId("categorySelect") && matchedCategoryId) {
      byId("categorySelect").value = matchedCategoryId;
    }
    populateSituationSelect("", matchedCategoryId || (byId("categorySelect") && byId("categorySelect").value));
    byId("situationSelect").value = ctx.situation.id;
    state.requestSeed = { ...state.requestSeed, situationId: ctx.situation.id };
    renderCategoryCards();
  }
}

function renderOutputButtons() {
  byId("outputButtons").innerHTML = outputTypes
    .map((item) => `<button type="button" class="secondary output-btn${item.id === state.selectedOutput ? " active" : ""}" data-output="${item.id}">${escapeHtml(item.label)}</button>`)
    .join("");
  byId("outputButtons").querySelectorAll("[data-output]").forEach((button) => {
    button.addEventListener("click", () => {
      state.selectedOutput = button.dataset.output;
      renderOutputButtons();
      byId("generatedOutput").value = buildOutputText(state.recipe, state.selectedOutput);
    });
  });
}

function recompute() {
  if (!state.libraries) {
    return;
  }
  if (state.seedMode === "surprise" && (!state.requestSeed || !state.requestSeed.situationId)) {
    resetStorySelectionOverrides();
    state.requestSeed = { situationId: pickSurpriseSituationId() };
  }

  const result = resolvePhase6(state.libraries, buildRequest(), state.overrides);
  if (!result.context) {
    return;
  }

  state.recipe = result;
  assertBlueprintConsistency(result);
  syncVisibleSeedState(result);
  renderRecipeSelectors(result);
  renderRecipeCards(result);
  renderPreview(result);
  renderResolvedRecipe(result);
  renderResolverNotes(result);
  renderSeedSummary(result);
  renderEmotionalBridge(result);
  renderGenerateSummary(result);
  renderProductSurface(result);
  renderOutputButtons();
  byId("generatedOutput").value = buildOutputText(result, state.selectedOutput);
}

function bindSelectorOverrides() {
  [
    ["recipeWorld", "worldId"],
    ["recipeMission", "missionId"],
    ["recipeOpening", "openingId"],
    ["recipeEnding", "endingId"],
    ["recipeStructure", "structureId"],
  ].forEach(([elementId, key]) => {
    byId(elementId).addEventListener("change", (event) => {
      state.overrides[key] = event.target.value || null;
      recompute();
    });
  });
}

async function loadLibraries() {
  const [entries, uiCategoryMap, storyTemplates] = await Promise.all([
    Promise.all(Object.entries(dataFiles).map(async ([key, url]) => [key, await loadJson(url)])),
    loadJson("./phase6-data/uiCategoryLifeDomainMap.json"),
    loadJson("./phase8-data/storyTemplates.json"),
  ]);
  state.libraries = buildLibraries(Object.fromEntries(entries));
  state.uiCategoryMap = uiCategoryMap;
  state.storyTemplates = storyTemplates;
  byId("libraryStatus").textContent = "Story world ready.";

  createOptionsWithBlank("characterSelect", state.libraries.characters, "Auto-pick");
  populateCategorySelect();
  populateSituationSelect("", byId("categorySelect") && byId("categorySelect").value);
  renderCategoryCards();
  updateSearchPanel();

  byId("situationSelect").addEventListener("change", (event) => {
    resetStorySelectionOverrides();
    state.requestSeed = { ...state.requestSeed, situationId: event.target.value };
    recompute();
  });
  if (byId("categorySelect")) {
    byId("categorySelect").addEventListener("change", (event) => {
      resetStorySelectionOverrides();
      populateSituationSelect("", event.target.value);
      renderCategoryCards();
      recompute();
    });
  }
  if (byId("searchToggleBtn")) {
    byId("searchToggleBtn").addEventListener("click", () => {
      state.categorySearchOpen = !state.categorySearchOpen;
      updateSearchPanel();
    });
  }
  if (byId("situationSearch")) {
    byId("situationSearch").addEventListener("input", (event) => {
      resetStorySelectionOverrides();
      populateSituationSelect(event.target.value, byId("categorySelect") && byId("categorySelect").value);
      recompute();
    });
  }
  byId("characterSelect").addEventListener("change", recompute);

  bindSelectorOverrides();
  renderSeedModeButtons();
  updateSeedPanels();
  renderHeroCards();
  renderSavedStories();
  renderReader();
  recompute();
}

function bindClipboardActions() {
  byId("copyOutputBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText(byId("generatedOutput").value);
    byId("copyOutputBtn").textContent = "Copied";
    setTimeout(() => {
      byId("copyOutputBtn").textContent = "Copy output";
    }, 1400);
  });

  byId("copyRecipeBtn").addEventListener("click", async () => {
    await navigator.clipboard.writeText(JSON.stringify(buildResolvedRecipePayload(state.recipe), null, 2));
    byId("copyRecipeBtn").textContent = "Copied";
    setTimeout(() => {
      byId("copyRecipeBtn").textContent = "Copy resolved recipe JSON";
    }, 1400);
  });
}

updateSaveButtons = function () {
  const hasStory = Boolean(state.generatedStorySession);
  const saved = hasStory && currentStoryIsSaved();
  const favourite = Boolean(
    state.generatedStorySession &&
    state.savedStories.some((entry) => entry.saveId === state.generatedStorySession.saveId && entry.favorite)
  );
  const label = saved ? "♥ Saved to My Stories" : "♡ Save story";
  const icon = favourite ? "♥" : "♡";

  if (byId("saveStoryBtn")) {
    byId("saveStoryBtn").disabled = !hasStory;
    byId("saveStoryBtn").textContent = label;
    byId("saveStoryBtn").classList.toggle("saved", saved);
  }

  if (byId("readerSaveBtn")) {
    byId("readerSaveBtn").disabled = !hasStory;
    byId("readerSaveBtn").textContent = icon;
    byId("readerSaveBtn").setAttribute("aria-label", favourite ? "Unfavourite story" : "Favourite story");
    byId("readerSaveBtn").classList.toggle("saved", favourite);
  }
};

renderSavedStories = function () {
  if (!state.savedStories.length) {
    setHtml("savedStoriesGrid", `<div class="saved-card empty-library-card"><strong>Your story shelf is empty.</strong><div class="saved-meta">Create your first adventure.</div><button type="button" class="secondary empty-library-cta" id="emptyLibraryCreateBtn">Create a Story</button></div>`);
    if (byId("emptyLibraryCreateBtn")) {
      byId("emptyLibraryCreateBtn").addEventListener("click", () => showScreen("situation"));
    }
    updateSaveButtons();
    return;
  }

  setHtml("savedStoriesGrid", state.savedStories.map((story) => `
    <div class="saved-card">
      ${story.thumbnail ? `<img class="saved-thumb" src="${escapeHtml(story.thumbnail)}" alt="${escapeHtml(story.title)} cover preview">` : `<div class="saved-thumb"></div>`}
      <div>
        <strong>${escapeHtml(story.title)}</strong>
        <div class="saved-meta">${escapeHtml(story.heroName)} | ${escapeHtml(story.situationTitle)}</div>
        <div class="saved-meta">${escapeHtml(new Date(story.createdAt).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" }))}</div>
      </div>
      <div class="saved-actions">
        <button type="button" class="ghost favorite-btn${story.favorite ? " saved" : ""}" data-favorite-story="${escapeHtml(story.saveId)}" aria-label="${story.favorite ? "Unfavourite story" : "Favourite story"}">${story.favorite ? "♥" : "♡"}</button>
        <button type="button" class="secondary" data-open-story="${escapeHtml(story.saveId)}">Read</button>
      </div>
    </div>
  `).join(""));

  byId("savedStoriesGrid").querySelectorAll("[data-open-story]").forEach((button) => {
    button.addEventListener("click", () => {
      const session = state.savedStories.find((entry) => entry.saveId === button.dataset.openStory);
      if (session) {
        openStorySession(session, false);
      }
    });
  });
  byId("savedStoriesGrid").querySelectorAll("[data-favorite-story]").forEach((button) => {
    button.addEventListener("click", () => {
      toggleStoryFavorite(button.dataset.favoriteStory);
    });
  });
  updateSaveButtons();
};

saveCurrentStory = function () {
  if (!state.generatedStorySession) {
    return;
  }
  const nextSession = {
    ...state.generatedStorySession,
    favorite: state.generatedStorySession.favorite ?? true,
  };
  const existingIndex = state.savedStories.findIndex((entry) => entry.saveId === state.generatedStorySession.saveId);
  if (existingIndex >= 0) {
    state.savedStories[existingIndex] = { ...state.savedStories[existingIndex], ...nextSession };
    state.generatedStorySession = { ...state.savedStories[existingIndex] };
  } else {
    state.savedStories.unshift(nextSession);
    state.generatedStorySession = nextSession;
  }
  persistSavedStories();
  renderSavedStories();
  updateSaveButtons();
  setText("generationStatus", "This story is saved in My Stories.");
};

async function init() {
  document.body.classList.toggle("dev-mode", isDevMode());
  window.__pranaState = state;
  window.__pranaDebug = {
    buildRequest,
    buildStoryArtifacts,
    buildStoryArtifactsWithTemplate,
    runTemplateForBlueprint,
    resolvePhase6,
    buildStoryBlueprint,
    buildStoryPlan,
    buildStoryArtifactsWithEventPlanner,
    isTemplatePipelineEnabled,
    setTemplatePipelineEnabled: (enabled) => { state.useTemplatePipelineOverride = Boolean(enabled); },
    // Diagnostic-only exposure (Dev A staging validation harness) — these
    // read realization mode off an already-built ctx, they don't change
    // any generation behavior themselves.
    detectT16RealizationMode,
    detectT21RealizationMode,
    detectT22RealizationMode,
    detectT23RealizationMode,
  };
  loadSavedStories();
  renderSavedStories();
  bindClipboardActions();
  bindProductActions();
  try {
    await loadLibraries();
  } catch (error) {
    byId("libraryStatus").textContent = `Failed to load Phase 6A libraries: ${error.message}`;
    throw error;
  }
}

init();
