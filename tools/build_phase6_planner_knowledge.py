import hashlib
import json
from pathlib import Path


BASE_DIR = Path(__file__).resolve().parent.parent / "public" / "prana-story-generator" / "phase6-data"
ONTOLOGY_DIR = BASE_DIR / "ontology"


def read_json(relative_path):
    return json.loads((BASE_DIR / relative_path).read_text(encoding="utf-8"))


def read_ontology(name):
    return json.loads((ONTOLOGY_DIR / name).read_text(encoding="utf-8"))


def sha256_file(relative_path):
    return hashlib.sha256((BASE_DIR / relative_path).read_bytes()).hexdigest()


def index_by_id(items, mapper=None):
    mapper = mapper or (lambda item: item)
    return {str(item["id"]): mapper(item) for item in (items or [])}


def unique(values):
    seen = []
    for value in values or []:
      if value and value not in seen:
        seen.append(value)
    return seen


def mission_assignments():
    assignments = {}

    def assign(ids, mission_type_id, rationale):
        for mission_id in ids:
            assignments[mission_id] = {
                "missionTypeId": mission_type_id,
                "rationale": rationale,
            }

    assign([1, 2, 3, 4, 5, 9, 10], "MISSION_RESCUE", "Direct rescue objective.")
    assign([6], "MISSION_SUPPORT", "Mission goal is to bring help to support the rescue effort.")
    assign([7], "MISSION_SEARCH", "Mission goal is to locate a safe route.")
    assign([8], "MISSION_ESCAPE", "Mission goal is to lead others out of danger to safety.")

    assign([11, 12, 14, 15, 18], "MISSION_SEARCH", "Mission goal is to find a missing place, path, or clue.")
    assign([13], "MISSION_GATHER", "Mission goal centers on locating and collecting a rare flower.")
    assign([16, 17, 19, 20], "MISSION_DISCOVER", "Mission goal is discovery or revealed understanding.")

    assign([21, 22, 23, 25, 26, 27, 28, 30], "MISSION_DELIVER", "Mission goal is to carry something or fulfill a delivery commitment.")
    assign([24, 29], "MISSION_RETURN", "Mission goal is to return something to its rightful place or owner.")

    assign([31, 34, 37, 38, 39], "MISSION_BUILD", "Mission goal is to build, rebuild, or create.")
    assign([32, 33, 36, 40], "MISSION_REPAIR", "Mission goal is to fix something already existing.")
    assign([35], "MISSION_RESTORE", "Mission goal is to restore a damaged or diminished place.")

    assign([41, 42, 43, 44, 45, 46, 47, 48, 49, 50], "MISSION_PROTECT", "Mission goal is protection or guarding against harm.")

    assign([51, 54, 56, 60], "MISSION_MASTERY", "Mission goal is learning, training, or practicing toward mastery.")
    assign([52, 53], "MISSION_SOLVE", "Mission goal is to solve or understand a puzzle-like problem.")
    assign([55], "MISSION_SUPPORT", "Mission goal is to help someone else learn or grow.")
    assign([57], "MISSION_TRANSFORM", "Mission goal is an internal change through confronting fear.")
    assign([58], "MISSION_RECONCILE", "Mission goal is to repair trust in a relationship.")
    assign([59], "MISSION_DISCOVER", "Mission goal is discovery of a hidden talent.")

    assign([61, 62, 63, 64, 66, 69], "MISSION_SUPPORT", "Mission goal is direct help or support.")
    assign([65, 68], "MISSION_RESTORE", "Mission goal is to recover or restore a place or system.")
    assign([67], "MISSION_RECONCILE", "Mission goal is to settle disagreement and repair relationship harmony.")
    assign([70], "MISSION_NURTURE", "Mission goal is ongoing care for a living being.")

    assign([71, 72, 73, 74, 75, 76, 77, 78, 79, 80], "MISSION_CELEBRATE", "Mission goal is to prepare, host, or honor a celebration.")

    assign([81, 82, 83, 84, 85, 86, 87, 88, 89, 90], "MISSION_EXPLORE", "Mission goal is exploration of a place.")

    assign([91, 92, 96, 99], "MISSION_NURTURE", "Mission goal is care that helps a living being recover or grow.")
    assign([93, 94, 97, 98, 100], "MISSION_RESTORE", "Mission goal is to restore a damaged place, habitat, or system.")
    assign([95], "MISSION_RECONCILE", "Mission goal is to repair a relationship.")

    return assignments


def craft_definitions():
    return [
        {
            "id": "CR-EMO-001",
            "name": "Emotional Reflection and Reframing",
            "purpose": "Supports beats built around emotional safety, inner realization, reframing, sacrifice, recovery, and closure.",
            "guidance": "Use when the beat must help the child feel, name, and metabolize an internal shift before the story moves on.",
            "provenance": {
                "status": "authored_authoritative",
                "authoredOn": "2026-08-08",
                "basis": [
                    "Beat and escalation CR-code usage in beats.json and escalations.json",
                    "Legacy Phase4D technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
                ],
            },
        },
        {
            "id": "CR-SUS-001",
            "name": "Suspense and Reveal Control",
            "purpose": "Supports threshold, threat, catalyst, discovery, and peak-chaos beats that depend on anticipation and controlled revelation.",
            "guidance": "Use when the scene should heighten uncertainty, withhold part of the picture, or pace revelation for tension.",
            "provenance": {
                "status": "authored_authoritative",
                "authoredOn": "2026-08-08",
                "basis": [
                    "Beat and escalation CR-code usage in beats.json and escalations.json",
                    "Legacy suspense-oriented technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
                ],
            },
        },
        {
            "id": "CR-RHY-001",
            "name": "Rhythmic Escalation Patterning",
            "purpose": "Supports patterned routine, repetition, and rising cadence in looping or escalating sequences.",
            "guidance": "Use when the beat gains force through rhythmic recurrence, patterned buildup, or accumulating cause-and-effect.",
            "provenance": {
                "status": "authored_authoritative",
                "authoredOn": "2026-08-08",
                "basis": [
                    "Beat and escalation CR-code usage in beats.json and escalations.json",
                    "Legacy pacing and domino-chain technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
                ],
            },
        },
        {
            "id": "CR-VIS-001",
            "name": "Visual Action Legibility",
            "purpose": "Supports invention, testing, and physically staged beats where the child must clearly track what is being tried and why.",
            "guidance": "Use when the scene's clarity depends on visual staging, readable action, and concrete cause-and-effect on the page.",
            "provenance": {
                "status": "authored_authoritative",
                "authoredOn": "2026-08-08",
                "basis": [
                    "Beat and escalation CR-code usage in beats.json and escalations.json",
                    "Legacy visual and quiet-beat technique cues recovered from Prana_Kids_Story_Builder_v5_emotion_library.html",
                ],
            },
        },
    ]


def write_json(relative_path, payload):
    (BASE_DIR / relative_path).write_text(f"{json.dumps(payload, indent=2)}\n", encoding="utf-8")


def main():
    situations = read_json("situations.json")
    characters = read_json("characters.json")
    adventure_archetypes = read_json("adventureArchetypes.json")
    missions = read_json("missions.json")
    story_structures = read_json("storyStructures.json")
    beats = read_json("beats.json")
    openings = read_json("openings.json")
    endings = read_json("endings.json")
    obstacles = read_json("obstacles.json")
    story_conflicts = read_json("storyConflicts.json")
    worlds = read_json("worlds.json")
    settings = read_json("settings.json")
    escalations = read_json("escalations.json")
    life_domains = read_ontology("lifeDomains.json")
    core_needs = read_ontology("coreNeeds.json")
    mission_types = read_ontology("missionTypes.json")
    story_actions = read_ontology("storyActions.json")
    logic_families = read_ontology("logicFamilies.json")
    ganesha_symbols = read_ontology("ganeshaSymbols.json")
    symbol_themes = read_ontology("symbolThemes.json")
    story_taxonomy = read_ontology("storyTaxonomy.json")

    assignments = mission_assignments()
    if len(assignments) != len(missions):
        raise RuntimeError(f"Mission assignment coverage mismatch: {len(assignments)} assignments for {len(missions)} missions.")

    craft = craft_definitions()
    craft_usage = {}
    for item in [*beats, *escalations]:
        for code in item.get("required_craft", []):
            craft_usage.setdefault(code, []).append(item["id"])

    mission_index = {}
    for mission in missions:
        audit = assignments[mission["id"]]
        mission_index[str(mission["id"])] = {
            **mission,
            "missionTypeId": audit["missionTypeId"],
            "missionTypeAudit": {
                "rationale": audit["rationale"],
                "auditedOn": "2026-08-08",
                "auditedBy": "Codex",
                "status": "authoritative_audit",
            },
        }

    mission_type_index = {}
    for mission_type in mission_types:
        mission_type_index[mission_type["id"]] = {
            **mission_type,
            "active": True,
            "linkedMissionIds": [
                str(mission["id"])
                for mission in missions
                if assignments[mission["id"]]["missionTypeId"] == mission_type["id"]
            ],
        }

    planner_knowledge = {
        "schemaVersion": "1.0",
        "builtAt": "2026-08-08",
        "sourceLibraryVersions": {
            "situations.json": sha256_file("situations.json"),
            "characters.json": sha256_file("characters.json"),
            "adventureArchetypes.json": sha256_file("adventureArchetypes.json"),
            "missions.json": sha256_file("missions.json"),
            "storyStructures.json": sha256_file("storyStructures.json"),
            "beats.json": sha256_file("beats.json"),
            "openings.json": sha256_file("openings.json"),
            "endings.json": sha256_file("endings.json"),
            "obstacles.json": sha256_file("obstacles.json"),
            "storyConflicts.json": sha256_file("storyConflicts.json"),
            "worlds.json": sha256_file("worlds.json"),
            "settings.json": sha256_file("settings.json"),
            "ontology/coreNeeds.json": sha256_file("ontology/coreNeeds.json"),
            "ontology/lifeDomains.json": sha256_file("ontology/lifeDomains.json"),
            "ontology/missionTypes.json": sha256_file("ontology/missionTypes.json"),
            "ontology/storyActions.json": sha256_file("ontology/storyActions.json"),
            "ontology/logicFamilies.json": sha256_file("ontology/logicFamilies.json"),
            "ontology/ganeshaSymbols.json": sha256_file("ontology/ganeshaSymbols.json"),
            "ontology/symbolThemes.json": sha256_file("ontology/symbolThemes.json"),
            "ontology/storyTaxonomy.json": sha256_file("ontology/storyTaxonomy.json"),
        },
        "lifeDomainIndex": index_by_id(life_domains),
        "needIndex": index_by_id(core_needs),
        "situationIndex": index_by_id(situations),
        "characterIndex": index_by_id(characters),
        "adventureArchetypeIndex": index_by_id(adventure_archetypes),
        "missionTypeIndex": mission_type_index,
        "missionIndex": mission_index,
        "storyActionIndex": index_by_id(story_actions, lambda item: {**item, "active": True}),
        "worldIndex": index_by_id(worlds),
        "settingIndex": index_by_id(settings),
        "obstacleIndex": index_by_id(obstacles),
        "storyConflictIndex": index_by_id(story_conflicts),
        "logicIndex": index_by_id(logic_families, lambda item: {**item, "active": True}),
        "storyStructureIndex": index_by_id(story_structures),
        "beatIndex": index_by_id(beats),
        "openingIndex": index_by_id(openings, lambda item: {
            **item,
            "openingTypeValid": any(entry["id"] == item["hard"]["opening_type"] for entry in story_taxonomy.get("openingTypes", [])),
        }),
        "endingIndex": index_by_id(endings, lambda item: {
            **item,
            "endingTypeValid": any(entry["id"] == item["hard"]["ending_type"] for entry in story_taxonomy.get("endingTypes", [])),
        }),
        "symbolIndex": index_by_id(ganesha_symbols, lambda item: {
            **item,
            "symbolThemeValid": any(theme["id"] == item["symbol_theme"] for theme in symbol_themes),
        }),
        "craftTechniqueIndex": {
            item["id"]: {
                **item,
                "usedByIds": unique(craft_usage.get(item["id"], [])),
            }
            for item in craft
        },
    }

    mission_type_mapping = {
        str(mission_id): value for mission_id, value in assignments.items()
    }
    craft_output = [
        {
            **item,
            "usedByIds": unique(craft_usage.get(item["id"], [])),
        }
        for item in craft
    ]

    write_json("plannerKnowledge.json", planner_knowledge)
    write_json("missionTypeMapping.json", mission_type_mapping)
    write_json("craftDefinitions.json", craft_output)
    print("Wrote plannerKnowledge.json, missionTypeMapping.json, and craftDefinitions.json")


if __name__ == "__main__":
    main()
