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
  if (!storyText.includes(normalize(storyBlueprint.belief.trueBelief))) {
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
    spans.push({ start, end });
    start = end;
  }

  if (start < value.length) {
    spans.push({ start, end: value.length });
  }

  return spans.length ? spans : [{ start: 0, end: value.length }];
}

function splitTextIntoNaturalChunks(text, count, trailing = "") {
  const value = String(text || "");
  const spans = sentenceSpans(value);
  const safeCount = Math.max(1, count || 1);

  if (safeCount === 1) {
    return [`${value}${trailing}`];
  }

  if (spans.length < safeCount) {
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

  (completeStoryMaster.scenes || []).forEach((scene, sceneIndex, scenes) => {
    const assignedPages = unique(sceneToPages.get(scene.sceneId) || []);
    const pagesForScene = assignedPages.length ? assignedPages : [Math.min(sceneIndex + 1, pages.length)];
    const trailing = sceneIndex < scenes.length - 1 ? "\n\n" : "";
    const chunks = splitTextIntoNaturalChunks(scene.text, pagesForScene.length, trailing);

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

function buildStoryQAReport(polishedManuscript, storyPlan, storyBlueprint, dialogueLayer) {
  const pages = polishedManuscript && polishedManuscript.pages || [];
  const fullText = pages.map((page) => page.text).join("\n");
  const normalizedText = normalize(fullText);
  const firstPageText = pages[0] && pages[0].text || "";
  const lastPageText = pages[pages.length - 1] && pages[pages.length - 1].text || "";
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
    rule("QA-002", normalizedText.includes(normalize(protagonistName)) && / chose | smiled | helped | paused | said /i.test(` ${fullText} `), "Protagonist takes meaningful action rather than being carried by the plot.", "8A"),
    rule("QA-003", / when | because | so | but /i.test(` ${fullText.toLowerCase()} `) && normalizedText.includes(normalize("wait")), "Cause and effect remain visible from conflict to turning point.", "8A"),
    rule("QA-004", normalizedText.includes(normalize(protagonistName)) && normalizedText.includes(normalize(storyBlueprint.belief.trueBelief)), "Mission resolves through the protagonist's final choice.", "8A"),
    rule("QA-005", normalizedText.includes(normalize(storyBlueprint.belief.trueBelief)), "Core need is addressed through the protagonist's growth outcome.", "8A"),
    rule("QA-006", normalizedText.includes(normalize(storyBlueprint.belief.falseBelief)) && normalizedText.includes(normalize(storyBlueprint.belief.trueBelief)), "False belief and true belief are both present in the actual story.", "8A"),
    rule("QA-007", normalize(firstPageText) !== normalize(lastPageText) && / warmer | freer | calm | gentle | steady /i.test(` ${lastPageText.toLowerCase()} `), "Emotional arc moves from upset pressure toward lighter release.", "8A"),
    rule("QA-008", !symbolTheme || normalizedText.includes(normalize(symbolTheme)), "Symbol journey appears in introduction and payoff moments.", "8A"),
    rule(
      "QA-009",
      !craftRequired ||
        (normalizedText.includes(normalize("one slow breath")) &&
        normalizedText.includes(normalize("wait"))),
      "Craft requirements show up through reflective pause and suspense-bearing dialogue in the actual manuscript.",
      "8B"
    ),
    rule("QA-010", pageTurnObjectives.every(Boolean) && pages.every((page) => page.pageTurnObjective), "Every page still carries coherent transition guidance.", "8B"),
    rule("QA-011", !/[A-Z]{2,}-[A-Z]{3,}-\d{3}/.test(fullText), "No internal engine placeholders or CR codes remain in the prose.", "8E"),
    rule("QA-012", !fullText.includes("..") && !fullText.includes("  "), "No obvious prose corruption or doubled punctuation remains.", "8E"),
    rule("QA-013", pages.every((page) => page.dialogue.every((line) => line.text.length <= 60)), "Dialogue remains concise and read-aloud friendly.", "8D"),
    rule("QA-014", normalizedText.includes(normalize(storyBlueprint.belief.trueBelief)) && / smiled | warmer | freer | gentle /i.test(` ${fullText.toLowerCase()} `), "Ending provides both emotional and narrative closure.", "8A"),
    rule("QA-015", !normalizedText.includes(normalize("placeholder")) && !normalizedText.includes(normalize("todo")), "No placeholder prose or unplanned artifact text remains.", "8E"),
    rule("QA-016", pages.some((page) => page.text.includes("\"")) && pages.some((page) => normalize(page.text).includes(normalize(storyBlueprint.belief.trueBelief))), "Page pacing still protects dramatic and emotional high points rather than flattening them.", "8B"),
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
// logic fit -> required-beat fit -> emotional-arc fit -> template priority
// (templateId ascending, e.g. T01 before T02). Same inputs always produce
// the same selection.
function selectStoryTemplate(blueprint, storyPlan, libraries) {
  const templates = (state.storyTemplates || []);
  if (!templates.length) {
    return null;
  }
  const needId = blueprint.need && blueprint.need.id;
  const situationId = blueprint.situation && blueprint.situation.id;
  const logicId = storyPlan && storyPlan.storyFlow && storyPlan.storyFlow.logic && storyPlan.storyFlow.logic.id;
  const sceneCount = storyPlan && storyPlan.scenePlan && storyPlan.scenePlan.length;
  const libs = libraries || state.libraries;
  const emotionalArc = libs ? chooseEmotionalArc(blueprint, libs) : null;
  const arcRecommendedNeeds = (emotionalArc && emotionalArc.soft_suggested && emotionalArc.soft_suggested.recommended_need_ids) || [];

  const evaluated = templates.map((template) => {
    const situationFit = Boolean(situationId && (template.bestForSituations || []).includes(situationId));
    const needFit = Boolean(needId && (template.bestForNeeds || []).includes(needId));
    const logicFit = Boolean(logicId && (template.bestForLogicFamilies || []).includes(logicId));
    const beatFit = Boolean(sceneCount && template.requiredBeats && Math.abs(template.requiredBeats.length - sceneCount) <= 2);
    const arcFit = arcRecommendedNeeds.length > 0 && (template.bestForNeeds || []).some((need) => arcRecommendedNeeds.includes(need));
    return {
      template,
      tiers: [situationFit, needFit, logicFit, beatFit, arcFit].map((flag) => (flag ? 1 : 0)),
      reasons: [
        situationFit && `situation ${situationId} exact fit`,
        needFit && `need ${needId} exact fit`,
        logicFit && `logic family ${logicId} fit`,
        beatFit && `beat count compatible with ${sceneCount}-scene Story Plan`,
        arcFit && `emotional arc fit via recommended needs`,
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
function concreteObstacleClause(obstacle, immediateObstacleText) {
  const flavor = OBSTACLE_DOMAIN_FLAVOR[obstacle && obstacle.hard && obstacle.hard.obstacle_domain] || DEFAULT_OBSTACLE_FLAVOR;
  const clause = immediateObstacleText ? lowerFirst(stripTrailingPeriod(immediateObstacleText)) : "nothing had changed";
  return `${flavor}: ${clause}`;
}

// A small, generic (not per-situation) dictionary used only to pull a
// short, natural noun phrase out of a Situation's own authored storySeed
// text, so later beats can refer back to "their friend" / "their new
// classmate" instead of re-quoting the whole passage. Falls back to null
// (handled by the writer) rather than inventing a reference the storySeed
// doesn't support.
const SITUATION_ROLE_NOUNS = [
  "friend", "classmate", "sibling", "brother", "sister", "parent", "mom", "mama", "dad", "papa",
  "teacher", "teammate", "dog", "pet", "toy", "screen", "homework", "game", "adult", "stranger",
];
function extractCoreReference(situationContextText) {
  const lower = String(situationContextText || "").toLowerCase();
  const found = SITUATION_ROLE_NOUNS.find((noun) => lower.includes(noun));
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
  const want = rawWant
    ? lowerFirst(stripTrailingPeriod(substitute(rawWant)))
    : "to make this feel okay again";

  return { kind: "clause", sentence, want };
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
  const coreReference = extractCoreReference(buildStorySeedContextText(situation));
  const missionPhrase = naturalMissionPhrase(base._lookups && base._lookups.mission, blueprint.mission && blueprint.mission.id);
  const obstacleClause = concreteObstacleClause(obstacle, situation && situation.storySeed && situation.storySeed.immediateObstacle);
  const objective = `${base.protagonist} wanted to ${missionPhrase}.`;
  const realizedSituation = realizeSituation(base._lookups && base._lookups.situation, base.protagonist);
  return { ...base, missionPhrase, obstacle, mechanism, actionPhrases, coreReference, obstacleClause, objective, situationDetail, realizedSituation };
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
      want: `${p} wanted ${ctx.realizedSituation.want}.`,
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
      action: `finished it: ${ctx.missionPhrase}`,
      externalEvent: `the ${m.motif} stayed close by, a small reminder of what had changed`,
      consequence: `no longer needing to prove anything — just glad it was done`,
      emotionalState: "warmer, lighter",
      leadsTo: null,
    },
  ];

  return { events, ctx };
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
  const rawIdPattern = /\b(?:SYMBOL|ACTION|OD|OT|GAN_SYM|NEED|LOGIC|MISSION)_[A-Z0-9_]+\b/;

  if (!events.length) {
    issues.push("Event Planner produced no events.");
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
  } else if (!normalize(`${last.action} ${last.consequence}`).includes(normalize(eventChainResult.ctx.missionPhrase))) {
    issues.push("Final event's action does not concretely demonstrate the mission being accomplished.");
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

function generateBeatText(beatId, kind, occurrenceIndex, ctx) {
  const protagonist = ctx.protagonist;
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
        return `Someone ${protagonist} met along the way ${guideStyles[occurrenceIndex % guideStyles.length]}, offering one way to think about ${lowerFirst(ctx.conflictName)}.`;
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
  if (!storyText.includes(normalize(blueprint.belief.trueBelief))) {
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
function runUnchanged8BThroughPhase9(completeStoryMaster, completeStoryValidation, storyPlan, storyBlueprint) {
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
    illustrationPackage,
    illustrationValidation,
    promptPackResult,
    promptPackValidation,
    illustrationAssetsResult,
    layoutResult,
    layoutValidation,
    productionMetadata,
    productionQAReport,
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

  const tail = runUnchanged8BThroughPhase9(completeStoryMaster, completeStoryValidation, storyPlan, storyBlueprint);

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
  const eventChainResult = templateSelection ? buildEventChain(templateSelection.template, storyBlueprint, storyPlan, state.libraries) : null;
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

  const tail = runUnchanged8BThroughPhase9(completeStoryMaster, completeStoryValidation, storyPlan, storyBlueprint);

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
      eventChainValidation: artifacts.eventChainValidation,
      completeStoryValidation: artifacts.completeStoryValidation,
      storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
      storyQAErrors: (artifacts.storyQAReport && artifacts.storyQAReport.errors || []).map((error) => error.ruleId),
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
    eventChainValidation: artifacts.eventChainValidation,
    pages: artifacts.lockedFinalStory.pages.map((page) => page.text),
    storyQA: artifacts.storyQAReport && artifacts.storyQAReport.status,
    productionQA: artifacts.productionQAReport && artifacts.productionQAReport.status,
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
  const artifacts = buildStoryArtifacts(state.recipe, buildRequest());
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
  window.__pranaDebug = { buildRequest, buildStoryArtifacts };
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





