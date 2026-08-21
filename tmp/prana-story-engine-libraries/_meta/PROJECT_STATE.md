# Prana Kids Story Engine — Project State (as of 2026-08-07)

## Architecture (locked)
Ontology (abstract concepts) -> Content Libraries (concrete instances) -> Relationship/Index tables
-> Planner Knowledge Graph (generated, never hand-edited) -> Story Planner -> Story Director -> Writer

Planner flow: Life Domain -> Situation -> Need -> Adventure Archetype -> Adventure Trigger -> Character
-> Mission -> Story Action -> Story Conflict -> Obstacle -> Escalation -> Logic -> Structure -> Symbol -> Beat -> Craft -> Writer

## Rules
- Never invent free text. Reuse existing IDs before adding new ones.
- 3-part test for new IDs: (1) recurs across libraries (2) changes planner behavior (3) can't be
  cleanly represented by an existing ID.
- Hard (identity, committed to planner state) vs Soft (affinity, Suggested_/Best_/Typical_ prefixed,
  never bypasses resolver).
- Firewall: early planner stages (S01 Situation Resolver) must not see downstream Mission/Logic data directly.
- Matching rule for resolving free-text mission/library values to IDs: exact match, case-insensitive,
  singular/plural normalization, deterministic 1:1 substring match ONLY. No fuzzy/semantic guessing,
  no new IDs invented during resolution, no manual mapping unless no deterministic match exists.
- Settings are a LIBRARY (settings.json), not a new ontology family — generic location tags
  (Forest, Village, Cave...) that specific named Worlds (worlds.json) instantiate.
- Confidence/provenance tagging: every soft-tag record includes "_meta": {"confidence":
  "audited"|"heuristic"|"inherited"|"unmapped"}.

## /ontology/ (abstract concepts)
- coreNeeds.json — 24 Needs
- emotionalStates.json — 30 Emotions
- characterTraits.json — 24 Traits
- characterRoles.json — 12 Role Types
- agencyTypes.json — 14
- missionTypes.json — 21 Mission Types
- logicFamilies.json — 14
- worldTypes.json — 11 (incl. experimental WT_TRAVEL, n=1)
- worldAttributes.json — 16
- worldFunctions.json — 9
- obstacleDomains.json — 6
- obstacleTypes.json — 3
- obstacleFunctions.json — 18
- symbolThemes.json — 16 (Layer 1, abstract)
- beliefs.json — 66 (built from clustering 168 real situations, 100% coverage)
- storyTaxonomy.json — storyFamilies(14) + openingTypes(10) + endingTypes(14) combined
- lifeDomains.json — 13
- storyActions.json — 23 (20 original + Repair/Discover/Observe added 2026-08-07 from real
  mission data, passed 3-part recurs test at n>=3)

## /libraries/ (concrete instances)
- situations.json — 168, hard(need_id, belief_ids, severity, life_domain_ids) + soft(story_family,
  ganesha_symbol x2). Age field flagged as genuinely missing from source.
- adventureArchetypes.json — 55, hard(complexity) + soft(best_mission_types/logic_families/
  ending_types/world_types/obstacle_domains/story_actions)
- adventureTriggers.json — 440, trigger_category hard-classified, soft tags INHERITED from parent archetype
- storyConflicts.json — 10, fully tagged
- escalations.json — 12, fully tagged
- characters.json — 18, role_id + trait_id (hard) + soft affinities
- missions.json — 100 — REBUILT CLEAN 2026-08-07 from user-verified source table (10 groups x 10),
  replacing the earlier field-shift-corrupted version. Now has both raw text fields AND resolved ID
  fields (bestLifeDomainIds, bestStoryActionIds, bestSettingIds, bestAdventureArchetypeIds,
  bestCoreNeedIds). bestCoreNeedIds left null everywhere — Needs NOT audited yet (deliberately
  deferred, see Open Items). unresolvedArchetype field preserves original text for the 15 values
  that don't deterministically map to real Archetype names (see Open Items).
- obstacles.json — 63, all mapped
- worlds.json — 40, hard(world_types/attributes/functions) + soft(emotional_tone)
- settings.json — NEW 2026-08-07, 15 generic location tags (Forest, Village, Cave, etc.) derived
  from real mission bestStoryWorlds values. Distinct from worlds.json (specific named worlds).
  Each has soft_suggested.linked_world_type.
- storyStructures.json — 100, logic_family hard-mapped
- emotionalArcs.json — 24 real (not 60; rest were category-index labels, excluded)
- openings.json — 10 real (not 21; stub rows excluded)
- endings.json — 10 real (not 21); possible duplicate END_PASSING_FORWARD mapping flagged, unresolved
- beats.json — 30 Beat Types, built 2026-08-07 MANUALLY from real Phase 4C state machines
  (Safety Loop / Trickster / Runaway Chain / Perspective Shift), NOT derived from Story Structure
  per explicit architecture correction. Zero broken references (validated). required_craft only
  uses the 4 fully-specified Craft IDs (CR-SUS-001, CR-RHY-001, CR-VIS-001, CR-EMO-001) — most
  allowed_logic entries beyond the 4 documented state machines are HEURISTIC, not audited.

## Known data quality issues (confirmed real source bugs, not export artifacts)
- Opening/Ending: only 10 real entries each, stub rows 11-21 are broken (e.g. one row name:"#")
- Emotional Arc: only 24 real entries, rest are category-index labels
- Ganesha Symbol: only 8 real, 4 are empty placeholders
- missions.json ORIGINAL export had all fields shifted one column — FIXED by replacing with
  user-provided clean source table (see above). This corruption existed in BOTH the PDF export
  and the zip, confirmed as a source-workbook bug.

## OPEN ITEMS / NOT YET DONE
1. Core Needs audit — mission bestCoreNeeds values (Perseverance, Empathy, Gratitude, Cooperation,
   Kindness, Generosity, Teamwork, Leadership, Problem Solving, Honesty, Creativity, Self-Worth,
   Appreciation, Stewardship, Nurturing, Pride, Wisdom, Humility, Growth, Discipline, Understanding,
   Wonder — 22 distinct, 73 refs) intentionally left UNMAPPED. Explicit decision: do NOT map until a
   dedicated ontology audit, planned for AFTER Planner Knowledge Graph / end-to-end tests.
2. Adventure Archetype — 15 distinct unresolved mission values PARKED (not added as new IDs, not
   force-mapped): Journey/Quest/Discovery/Adventure (too generic — planner should resolve to
   specific archetype downstream), Builder/Helper/Caregiver (role/verb words, belong closer to
   Story Actions or Character Roles), Growth/Trust/Gratitude/Hospitality/Relationship/Collaboration/
   Inner Journey/Time Challenge (themes/outcomes, not adventure patterns — sign the original Mission
   library mixed abstraction levels). Explicit decision: revisit ONLY if real planner failures surface
   a need, not proactively. Preserved verbatim per mission in missions.json under "unresolvedArchetype".
3. Craft library CR-ID mapping incomplete. storytellingTechniques.json (50 real entries, confirmed
   genuine Phase4D Craft data) mapped only for the 4 already-specified CR-IDs used in beats.json.
   techniqueCombinationMatrix.json (56) not yet processed at all.
4. buildPlannerIndexes() (Phase 5B) NOT YET WRITTEN. Locked design: single plannerKnowledge.json
   output (not 13 separate files) containing lifeDomainIndex, needIndex, archetypeIndex, triggerIndex,
   characterIndex, missionIndex, storyActionIndex, conflictIndex, obstacleIndex, escalationIndex,
   logicIndex, structureIndex, symbolIndex. Reads ONLY from ontology/ + libraries/, must validate all
   cross-references bidirectionally.
5. Remaining unaudited real libraries — DELIBERATELY out of scope for Phase 5A/5B (classified as
   Writer-layer/QA-layer, not planner ontology): emotionalExpressions.json(45), storyWorldPacks.json(40),
   titleFormulas.json(30), storyQualityScorecard.json(13), storytellingChecklist.json(10).
6. Emotional Arc "Need<->Arc" relationship table only partially built (4 example rows, not full 24).

## NEXT STEPS (in order, per last locked decision 2026-08-07)
1. Finish JSON conversion of any remaining real libraries needed for the planner.
2. Build plannerKnowledge.json (buildPlannerIndexes(), Phase 5B).
3. Run end-to-end planner tests.
4. ONLY THEN revisit CoreNeeds audit and the 15 parked Archetype values, driven by real observed
   planner failures — not proactively.
