const fs = require("fs");
const path = require("path");
const crypto = require("crypto");

const baseDir = path.resolve(__dirname, "..", "public", "prana-story-generator", "phase6-data");
const ontologyDir = path.join(baseDir, "ontology");

function readJson(relativePath) {
  return JSON.parse(fs.readFileSync(path.join(baseDir, relativePath), "utf8"));
}

function readOntology(name) {
  return JSON.parse(fs.readFileSync(path.join(ontologyDir, name), "utf8"));
}

function sha256File(relativePath) {
  const filePath = path.join(baseDir, relativePath);
  const buffer = fs.readFileSync(filePath);
  return crypto.createHash("sha256").update(buffer).digest("hex");
}

function indexById(items, mapper = (item) => item) {
  return Object.fromEntries((items || []).map((item) => [String(item.id), mapper(item)]));
}

function unique(values) {
  return [...new Set((values || []).filter(Boolean))];
}

function missionAssignments() {
  const assignments = new Map();

  function assign(ids, missionTypeId, rationale) {
    ids.forEach((id) => assignments.set(id, { missionTypeId, rationale }));
  }

  assign([1, 2, 3, 4, 5, 9, 10], "MISSION_RESCUE", "Direct rescue objective.");
  assign([6], "MISSION_SUPPORT", "Mission goal is to bring help to support the rescue effort.");
  assign([7], "MISSION_SEARCH", "Mission goal is to locate a safe route.");
  assign([8], "MISSION_ESCAPE", "Mission goal is to lead others out of danger to safety.");

  assign([11, 12, 14, 15, 18], "MISSION_SEARCH", "Mission goal is to find a missing place, path, or clue.");
  assign([13], "MISSION_GATHER", "Mission goal centers on locating and collecting a rare flower.");
  assign([16, 17, 19, 20], "MISSION_DISCOVER", "Mission goal is discovery or revealed understanding.");

  assign([21, 22, 23, 25, 26, 27, 28, 30], "MISSION_DELIVER", "Mission goal is to carry something or fulfill a delivery commitment.");
  assign([24, 29], "MISSION_RETURN", "Mission goal is to return something to its rightful place or owner.");

  assign([31, 34, 37, 38, 39], "MISSION_BUILD", "Mission goal is to build, rebuild, or create.");
  assign([32, 33, 36, 40], "MISSION_REPAIR", "Mission goal is to fix something already existing.");
  assign([35], "MISSION_RESTORE", "Mission goal is to restore a damaged or diminished place.");

  assign([41, 42, 43, 44, 45, 46, 47, 48, 49, 50], "MISSION_PROTECT", "Mission goal is protection or guarding against harm.");

  assign([51, 54, 56, 60], "MISSION_MASTERY", "Mission goal is learning, training, or practicing toward mastery.");
  assign([52, 53], "MISSION_SOLVE", "Mission goal is to solve or understand a puzzle-like problem.");
  assign([55], "MISSION_SUPPORT", "Mission goal is to help someone else learn or grow.");
  assign([57], "MISSION_TRANSFORM", "Mission goal is an internal change through confronting fear.");
  assign([58], "MISSION_RECONCILE", "Mission goal is to repair trust in a relationship.");
  assign([59], "MISSION_DISCOVER", "Mission goal is discovery of a hidden talent.");

  assign([61, 62, 63, 64, 66, 69], "MISSION_SUPPORT", "Mission goal is direct help or support.");
  assign([65, 68], "MISSION_RESTORE", "Mission goal is to recover or restore a place or system.");
  assign([67], "MISSION_RECONCILE", "Mission goal is to settle disagreement and repair relationship harmony.");
  assign([70], "MISSION_NURTURE", "Mission goal is ongoing care for a living being.");

  assign([71, 72, 73, 74, 75, 76, 77, 78, 79, 80], "MISSION_CELEBRATE", "Mission goal is to prepare, host, or honor a celebration.");

  assign([81, 82, 83, 84, 85, 86, 87, 88, 89, 90], "MISSION_EXPLORE", "Mission goal is exploration of a place.");

  assign([91, 92, 96, 99], "MISSION_NURTURE", "Mission goal is care that helps a living being recover or grow.");
  assign([93, 94, 97, 98, 100], "MISSION_RESTORE", "Mission goal is to restore a damaged place, habitat, or system.");
  assign([95], "MISSION_RECONCILE", "Mission goal is to repair a relationship.");

  return assignments;
}

function craftDefinitions() {
  return [
    {
      id: "CR-EMO-001",
      name: "Emotional Reflection and Reframing",
      purpose: "Supports beats built around emotional safety, inner realization, reframing, sacrifice, recovery, and closure.",
      guidance: "Use when the beat must help the child feel, name, and metabolize an internal shift before the story moves on.",
      provenance: {
        status: "authored_authoritative",
        authoredOn: "2026-08-08",
        basis: [
          "Beat and escalation CR-code usage in beats.json and escalations.json",
          "Legacy Phase4D technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
        ],
      },
    },
    {
      id: "CR-SUS-001",
      name: "Suspense and Reveal Control",
      purpose: "Supports threshold, threat, catalyst, discovery, and peak-chaos beats that depend on anticipation and controlled revelation.",
      guidance: "Use when the scene should heighten uncertainty, withhold part of the picture, or pace revelation for tension.",
      provenance: {
        status: "authored_authoritative",
        authoredOn: "2026-08-08",
        basis: [
          "Beat and escalation CR-code usage in beats.json and escalations.json",
          "Legacy suspense-oriented technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
        ],
      },
    },
    {
      id: "CR-RHY-001",
      name: "Rhythmic Escalation Patterning",
      purpose: "Supports patterned routine, repetition, and rising cadence in looping or escalating sequences.",
      guidance: "Use when the beat gains force through rhythmic recurrence, patterned buildup, or accumulating cause-and-effect.",
      provenance: {
        status: "authored_authoritative",
        authoredOn: "2026-08-08",
        basis: [
          "Beat and escalation CR-code usage in beats.json and escalations.json",
          "Legacy pacing and domino-chain technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
        ],
      },
    },
    {
      id: "CR-VIS-001",
      name: "Visual Action Legibility",
      purpose: "Supports invention, testing, and physically staged beats where the child must clearly track what is being tried and why.",
      guidance: "Use when the scene's clarity depends on visual staging, readable action, and concrete cause-and-effect on the page.",
      provenance: {
        status: "authored_authoritative",
        authoredOn: "2026-08-08",
        basis: [
          "Beat and escalation CR-code usage in beats.json and escalations.json",
          "Legacy visual and quiet-beat technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
        ],
      },
    },
  ];
}

function buildPlannerKnowledge() {
  const situations = readJson("situations.json");
  const characters = readJson("characters.json");
  const adventureArchetypes = readJson("adventureArchetypes.json");
  const missions = readJson("missions.json");
  const storyStructures = readJson("storyStructures.json");
  const beats = readJson("beats.json");
  const openings = readJson("openings.json");
  const endings = readJson("endings.json");
  const obstacles = readJson("obstacles.json");
  const storyConflicts = readJson("storyConflicts.json");
  const worlds = readJson("worlds.json");
  const settings = readJson("settings.json");
  const lifeDomains = readOntology("lifeDomains.json");
  const coreNeeds = readOntology("coreNeeds.json");
  const missionTypes = readOntology("missionTypes.json");
  const storyActions = readOntology("storyActions.json");
  const logicFamilies = readOntology("logicFamilies.json");
  const ganeshaSymbols = readOntology("ganeshaSymbols.json");
  const symbolThemes = readOntology("symbolThemes.json");
  const storyTaxonomy = readOntology("storyTaxonomy.json");
  const assignments = missionAssignments();
  const craft = craftDefinitions();

  if (assignments.size !== missions.length) {
    throw new Error(`Mission assignment coverage mismatch: ${assignments.size} assignments for ${missions.length} missions.`);
  }

  const craftUsage = new Map();
  [...beats, ...readJson("escalations.json")].forEach((item) => {
    (item.required_craft || []).forEach((code) => {
      if (!craftUsage.has(code)) {
        craftUsage.set(code, []);
      }
      craftUsage.get(code).push(item.id);
    });
  });

  const missionIndex = Object.fromEntries(
    missions.map((mission) => {
      const audit = assignments.get(mission.id);
      return [
        String(mission.id),
        {
          ...mission,
          missionTypeId: audit.missionTypeId,
          missionTypeAudit: {
            rationale: audit.rationale,
            auditedOn: "2026-08-08",
            auditedBy: "Codex",
            status: "authoritative_audit",
          },
        },
      ];
    })
  );

  const missionTypeIndex = Object.fromEntries(
    missionTypes.map((type) => [
      type.id,
      {
        ...type,
        active: true,
        linkedMissionIds: missions
          .filter((mission) => assignments.get(mission.id).missionTypeId === type.id)
          .map((mission) => String(mission.id)),
      },
    ])
  );

  const plannerKnowledge = {
    schemaVersion: "1.0",
    builtAt: "2026-08-08",
    sourceLibraryVersions: {
      "situations.json": sha256File("situations.json"),
      "characters.json": sha256File("characters.json"),
      "adventureArchetypes.json": sha256File("adventureArchetypes.json"),
      "missions.json": sha256File("missions.json"),
      "storyStructures.json": sha256File("storyStructures.json"),
      "beats.json": sha256File("beats.json"),
      "openings.json": sha256File("openings.json"),
      "endings.json": sha256File("endings.json"),
      "obstacles.json": sha256File("obstacles.json"),
      "storyConflicts.json": sha256File("storyConflicts.json"),
      "worlds.json": sha256File("worlds.json"),
      "settings.json": sha256File("settings.json"),
      "ontology/coreNeeds.json": sha256File("ontology/coreNeeds.json"),
      "ontology/lifeDomains.json": sha256File("ontology/lifeDomains.json"),
      "ontology/missionTypes.json": sha256File("ontology/missionTypes.json"),
      "ontology/storyActions.json": sha256File("ontology/storyActions.json"),
      "ontology/logicFamilies.json": sha256File("ontology/logicFamilies.json"),
      "ontology/ganeshaSymbols.json": sha256File("ontology/ganeshaSymbols.json"),
      "ontology/symbolThemes.json": sha256File("ontology/symbolThemes.json"),
      "ontology/storyTaxonomy.json": sha256File("ontology/storyTaxonomy.json"),
    },
    lifeDomainIndex: indexById(lifeDomains),
    needIndex: indexById(coreNeeds),
    situationIndex: indexById(situations),
    characterIndex: indexById(characters),
    adventureArchetypeIndex: indexById(adventureArchetypes),
    missionTypeIndex,
    missionIndex,
    storyActionIndex: indexById(storyActions, (item) => ({ ...item, active: true })),
    worldIndex: indexById(worlds),
    settingIndex: indexById(settings),
    obstacleIndex: indexById(obstacles),
    storyConflictIndex: indexById(storyConflicts),
    logicIndex: indexById(logicFamilies, (item) => ({ ...item, active: true })),
    storyStructureIndex: indexById(storyStructures),
    beatIndex: indexById(beats),
    openingIndex: indexById(openings, (item) => ({
      ...item,
      openingTypeValid: (storyTaxonomy.openingTypes || []).some((type) => type.id === item.hard.opening_type),
    })),
    endingIndex: indexById(endings, (item) => ({
      ...item,
      endingTypeValid: (storyTaxonomy.endingTypes || []).some((type) => type.id === item.hard.ending_type),
    })),
    symbolIndex: indexById(ganeshaSymbols, (item) => ({
      ...item,
      symbolThemeValid: symbolThemes.some((theme) => theme.id === item.symbol_theme),
    })),
    craftTechniqueIndex: Object.fromEntries(
      craft.map((item) => [
        item.id,
        {
          ...item,
          usedByIds: unique(craftUsage.get(item.id) || []),
        },
      ])
    ),
  };

  return {
    plannerKnowledge,
    missionTypeMapping: Object.fromEntries(
      [...assignments.entries()].map(([missionId, value]) => [String(missionId), value])
    ),
    craftDefinitions: craft.map((item) => ({
      ...item,
      usedByIds: unique(craftUsage.get(item.id) || []),
    })),
  };
}

function writeJson(relativePath, payload) {
  const targetPath = path.join(baseDir, relativePath);
  fs.writeFileSync(targetPath, `${JSON.stringify(payload, null, 2)}\n`, "utf8");
}

function main() {
  const { plannerKnowledge, missionTypeMapping, craftDefinitions } = buildPlannerKnowledge();
  writeJson("plannerKnowledge.json", plannerKnowledge);
  writeJson("missionTypeMapping.json", missionTypeMapping);
  writeJson("craftDefinitions.json", craftDefinitions);
  console.log("Wrote plannerKnowledge.json, missionTypeMapping.json, and craftDefinitions.json");
}

main();
