# plannerKnowledge.md — Data Contract for plannerKnowledge.json

Version: 1.1
Status: LOCKED AND RUNTIME VERIFIED (Phase 6A complete)

## Purpose

`plannerKnowledge.json` is the generated, indexed data layer that every 6A.0X resolver reads from. It is not a content library — the libraries (`libraries/*.json`) remain the single source of truth for content. plannerKnowledge exists so resolvers can do fast, validated lookups (by Need, by Character, by Mission, etc.) without each resolver re-scanning raw library files and re-implementing its own compatibility logic.

This document is the API contract for that data layer. The developer must build `plannerKnowledge.json` to this contract, not infer its shape ad hoc from whatever the current library JSON happens to contain — that path creates drift between what the resolver specs assume and what actually gets queried at runtime.

**No new content library is being introduced here.** Every index below is *derived from* an existing library (or ontology file); plannerKnowledge only adds structure, lookup keys, and resolved cross-references on top of that source.

Two authoritative generated data artifacts are now part of the locked Phase 6A input contract:

- `missionTypeMapping.json` — the audited `missionId -> missionTypeId` classification layer for the 100 concrete Missions
- `craftDefinitions.json` — the authoritative definition set for the real `CR-*` codes currently used by Phase 6A Beat/Craft resolution

These are generated and maintained as data-layer artifacts, not as resolver logic.

## File Shape

```
knowledge/plannerKnowledge.json
{
  "version": "<semver or build hash>",
  "generatedAt": "<ISO 8601 timestamp>",
  "sourceLibraryVersions": { "<libraryFile>": "<version/hash>", ... },
  "lifeDomainIndex": { ... },
  "situationIndex": { ... },
  "needIndex": { ... },
  "characterIndex": { ... },
  "adventureArchetypeIndex": { ... },
  "missionTypeIndex": { ... },
  "missionIndex": { ... },
  "storyActionIndex": { ... },
  "settingIndex": { ... },
  "worldIndex": { ... },
  "obstacleIndex": { ... },
  "storyConflictIndex": { ... },
  "logicIndex": { ... },
  "storyStructureIndex": { ... },
  "beatIndex": { ... },
  "openingIndex": { ... },
  "endingIndex": { ... },
  "symbolIndex": { ... },
  "craftTechniqueIndex": { ... }
}
```

One file, one top-level key per index, matching exactly the `plannerKnowledge.<indexName>` references used throughout the `phase6/6A/` resolver specs.

Related generated artifacts:

```text
libraries / ontology / audited data artifacts
    ↓
build_phase6_planner_knowledge.py
    ↓
plannerKnowledge.json
missionTypeMapping.json
craftDefinitions.json
```

## Shared Conventions (apply to every index below)

**Generated, not authored.** Every index is produced by a build step (a "Planner Index Generator," consistent with the earlier-locked Phase 5B decision) that reads the relevant `libraries/*.json` / `ontology/*.json` source plus any locked audited mapping artifacts and emits the index. No index is hand-edited. If a resolver needs a relationship the current index doesn't support, that's a source-library or generator gap — fix it upstream and regenerate, never patch the index file directly.

**Key format.** Every index is a JSON object keyed by the canonical ID string exactly as it appears in the source library. Formats vary by library and must not be assumed uniform: some are descriptive (e.g. `"NEED_CONFIDENCE"`, `"MISSION_RESCUE"`), others are numbered (e.g. `"CHAR010"`, `"WORLD015"`, `"OBST048"`). No index re-keys or renames IDs to a different convention than the source uses.

**Confidence tagging.** Real library records do not tag confidence per relationship field — they tag it once per record, via `_meta.confidence: "audited" | "heuristic" | "inherited"`, alongside a `hard` block (resolved, trustworthy fields) and a `soft_suggested` block (compatibility hints, which may themselves be resolved IDs or, in several libraries, unresolved raw text — see per-index notes below for which). plannerKnowledge must preserve this structure rather than flattening it: each index record should carry the source record's `_meta.confidence` value verbatim, and resolvers must treat `"heuristic"` records as usable but lower-trust, same as `"audited"` records are treated as verified. `"inherited"` (seen in `adventureTriggers.json`) means the record's soft tags were copied from a parent record rather than independently derived — treat as heuristic-or-lower unless the parent was itself audited.

**Active/inactive handling.** Every record in every index carries an `active: boolean` field, sourced from the corresponding library record's own active/deprecated flag. Resolvers must filter out `active: false` records before ranking candidates (see e.g. CR-005, WR-... "must be active" rules across the 6A.0X specs). An inactive record remains present in the index (for traceability / audit) but is never a valid resolver selection.

**Missing-ID behavior.** If a resolver queries an index for an ID that does not exist in that index, this is not a "no compatible candidate" result — it is a data-integrity error. The lookup function must throw / return a distinct `INDEX_LOOKUP_FAILURE`, separate from a resolver's own `*_UNRESOLVED` status (e.g. `NEED_UNRESOLVED`). `*_UNRESOLVED` means "no valid candidate given the constraints"; `INDEX_LOOKUP_FAILURE` means "the index itself is missing data it should have." These must not be conflated in logs or error handling, since the fix for each is different (regenerate the index vs. loosen/reconsider the story request).

**Rebuild / update rules.** The index must be regenerated whenever its source library, dependent ontology, or locked audited mapping artifact changes. `sourceLibraryVersions` (top-level, see File Shape) records the version/hash of every source file the index was built from, so a stale index can be detected automatically (compare recorded versions against current library file hashes at load time). A resolver must refuse to run against a plannerKnowledge.json whose recorded source versions don't match the live libraries — this is a build-time/CI check, not a runtime resolver responsibility.

**Current generator implementation.** The current Phase 6A generator is:

- `tools/build_phase6_planner_knowledge.py`

It emits:

- `public/prana-story-generator/phase6-data/plannerKnowledge.json`
- `public/prana-story-generator/phase6-data/missionTypeMapping.json`
- `public/prana-story-generator/phase6-data/craftDefinitions.json`

The generator is the authoritative rebuild path for these artifacts.

---

## Index Definitions

### lifeDomainIndex
### lifeDomainIndex

```
lifeDomainIndex
  ?
LIFE_DOMAIN_SCHOOL
  ?
source: ontology/lifeDomains.json
  ?
record: Life Domain
```

- **Source library**: `ontology/lifeDomains.json`
- **Key/ID format**: `LIFE_DOMAIN_<NAME>`
- **Indexed fields**: `id`, `name`, `active`
- **Lookup behavior**: direct ID lookup only; consumed by 6A.02 to validate the Story Request's `lifeDomain` field, and indirectly by Situation filtering through `situationIndex.hard.lifeDomainIds[]`
- **Compatibility fields**: none on the Life Domain record itself. Do not invent a direct `compatibleNeedIds` table when the source ontology does not contain one.
- **Active/inactive handling**: standard (see Shared Conventions)
- **Missing-ID behavior**: standard (`INDEX_LOOKUP_FAILURE`)
- **Generated or manual**: generated from `ontology/lifeDomains.json`
- **Rebuild rule**: regenerate on any change to `ontology/lifeDomains.json`

### situationIndex

```
situationIndex
  ?
SIT025
  ?
source: libraries/situations.json
  ?
record: Situation
```

- **Source library**: `libraries/situations.json`
- **Key/ID format**: `SIT<NNN>` (numbered, e.g. `SIT025`) - **not** `SITUATION_<NNN>`
- **Indexed fields**: `id`, `title`, `hard.needId`, `hard.beliefIds[]`, `hard.severity`, `hard.lifeDomainIds[]`, `falseBelief`, `trueBelief`, `_meta.confidence`, `active`
- **Lookup behavior**: direct ID lookup. This is the real hard bridge for 6A.02 and 6A.03: Need comes from `hard.need_id`, and Belief wording comes from the Situation's false/true belief text.
- **Compatibility fields**: none beyond the Situation's own authored fields. Situation already carries its Need / Belief / Life Domain linkage as source data, not as derived compatibility scores.
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/situations.json`, preserving `false_belief_text` / `true_belief_text` as contract-level belief wording fields and mapping `hard.life_domain_ids` / `hard.need_id` directly
- **Rebuild rule**: regenerate on any change to `libraries/situations.json`

### needIndex

```
needIndex
  ?
NEED_CONFIDENCE
  ?
source: ontology/coreNeeds.json
  ?
record: Core Need
```

- **Source library**: `ontology/coreNeeds.json`
- **Key/ID format**: `NEED_<NAME>`
- **Indexed fields**: `id`, `definition`, `active`
- **Lookup behavior**: direct ID lookup by 6A.02. Reverse Need selection comes from explicit request values or from `situationIndex.hard.needId`, not from an invented Need compatibility matrix.
- **Compatibility fields**: none on the Need record itself. Do not invent `compatibleLifeDomainIds`, `ageRange`, or similar fields when the source ontology does not contain them.
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `ontology/coreNeeds.json`
- **Rebuild rule**: regenerate on any change to `ontology/coreNeeds.json`

### characterIndex

```
characterIndex
  ↓
CHAR001
  ↓
source: libraries/characters.json
  ↓
record: Character
```

- **Source library**: `libraries/characters.json` (18 entries)
- **Key/ID format**: `CHAR<NNN>` (numbered, e.g. `CHAR001`, `CHAR010`) — **not** `CHAR_<NAME>`; the earlier version of this document had the wrong format
- **Indexed fields**: `id`, `name`, `hard.roleId` (singular, e.g. `ROLE_EXPLORER`), `hard.traitId` (singular, e.g. `TRAIT_EXPLORER`), `_meta.confidence`, `active`. There is **no** `ageAppropriateRange` or `growthPattern` field in source — the earlier version of this document invented both; neither exists
- **Lookup behavior**: 6A.04 queries by `hard.roleId` first (Character Role → candidate list), then ranks candidates within that role — see the two-stage resolution locked in `6A.04_CharacterResolver.md`
- **Compatibility fields** (verified against all 18 records, confirmed real, `soft_suggested`-sourced, snake_case in the raw file):
  - `bestNeedIds: string[]` (source: `best_need_ids`) — one or more `NEED_<NAME>` values
  - `bestGaneshaSymbols: string[]` (source: `best_ganesha_symbols`) — references into `ontology/ganeshaSymbols.json`, consumed later by 6A.16 Symbol Resolver
  - `bestMissionTypes: string[]` (source: `best_mission_types`) — the field 6A.05 Archetype Resolver reads to derive Candidate Mission Types
  - `bestLogicFamilies: string[]` (source: `best_logic_families`) — confirmed present on all 18 records (100% coverage, one value each) — the field 6A.11 Logic Resolver reads as its first-priority compatibility pool
  
  The earlier version of this document listed `bestNeedIds` and an invented `bestBeliefShiftPatterns` field that does not exist in source — corrected here to the four fields actually present.
- **Active/inactive handling**: standard, though source has no deprecation concept today
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/characters.json`
- **Rebuild rule**: regenerate on any change to `libraries/characters.json`

**Protagonist exclusion**: no Ganesha character record exists in `libraries/characters.json` at all (it is a Character library of 18 animal protagonists; Ganesha appears only in `ontology/ganeshaSymbols.json` as a symbol source, not as a selectable character). CR-011 ("Ganesha is never selected as protagonist") is therefore satisfied by the source data's own scope, not by a generator-side exclusion rule — there is nothing to exclude.

### adventureArchetypeIndex

```
adventureArchetypeIndex
  ↓
ARCHETYPE_TREASURE_HUNT
  ↓
source: libraries/adventureArchetypes.json
  ↓
record: Adventure Archetype
```

- **Source library**: `libraries/adventureArchetypes.json` (55 entries)
- **Key/ID format**: `ARCHETYPE_<NAME>`, e.g. `ARCHETYPE_TREASURE_HUNT`, `ARCHETYPE_RESCUE_MISSION`
- **Indexed fields**: `id`, `name`, `description`, `hard.complexity`, `_meta.confidence`, `active`
- **Lookup behavior**: reverse lookup by Candidate Mission Types (derived from Character's `best_mission_types`) — this is 6A.05's primary and only direct compatibility check. There is **no** direct Need or Character lookup path into this index; those relationships do not exist in source data and must not be fabricated (locked decision — see `6A.05_AdventureArchetypeResolver.md` §1, §3)
- **Compatibility fields** (all from `soft_suggested`, all type-level, none are instance-level Need/Character/Mission/World/Obstacle IDs):
  - `bestMissionTypes: string[]` — the sole bridge from Archetype to Character/Mission (via `best_mission_types`)
  - `bestLogicFamilies: string[]` — consumed later by 6A.11 Logic Resolver
  - `typicalWorldTypes: string[]` — consumed later by 6A.08 World Resolver, matched against `world.hard.world_types` (not a direct World ID list)
  - `typicalObstacleDomains: string[]` — consumed later by 6A.09 Obstacle Resolver, matched against `obstacle.hard.obstacle_domain`
  - `typicalStoryActions: string[]` — consumed later by 6A.07 Story Action Resolver
  - `typicalEndingTypes: string[]` — consumed later by 6A.15 Ending Resolver, matched against `ending.hard.ending_type`
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/adventureArchetypes.json`; several records share identical compatibility bundles in the source data (observed, not a generation defect) — downstream tie-breaking is the resolver's responsibility, not the index's
- **Rebuild rule**: regenerate on any change to `libraries/adventureArchetypes.json`

### missionTypeIndex

```
missionTypeIndex
  ↓
MISSION_RESCUE
  ↓
source: ontology/missionTypes.json
  ↓
record: Mission Type
```

- **Source library**: `ontology/missionTypes.json` (21 entries, id-only in source — no other fields)
- **Key/ID format**: `MISSION_<NAME>`, e.g. `MISSION_RESCUE`, `MISSION_SEARCH`
- **Indexed fields**: `id` only, from source. plannerKnowledge adds `active: true` for all entries (source has no deprecation concept yet) and reverse-computed `linkedMissionIds: string[]` — the list of concrete Mission IDs mapped to this type (derived from the authoritative `missionTypeMapping.json` artifact via `missionIndex.missionTypeId`, see below; not authored ontology data)
- **Lookup behavior**: reverse lookup by Character (`character.soft_suggested.best_mission_types`) and Adventure Archetype (`archetype.soft_suggested.best_mission_types`) — this is Step A of 6A.06's two-level resolution
- **Compatibility fields**: none beyond `linkedMissionIds`; Mission Type carries no direct Need or Character field in the source ontology — compatibility with those is only expressed transitively, from the Character/Archetype record's own `best_mission_types` array pointing at this index
- **Active/inactive handling**: standard, though the source has no active flag today — treat all 21 as active until the ontology adds one
- **Missing-ID behavior**: standard (`INDEX_LOOKUP_FAILURE`)
- **Generated or manual**: `id` list is a direct copy of `ontology/missionTypes.json`; `linkedMissionIds` is computed during generation from the authoritative mission mapping described below
- **Rebuild rule**: regenerate on any change to `ontology/missionTypes.json` or to `missionTypeMapping.json`

### missionIndex

```
missionIndex
  ↓
37
  ↓
source: libraries/missions.json  (+ authoritative generated missionTypeMapping artifact)
  ↓
record: Mission (concrete)
```

- **Source library**: `libraries/missions.json` (100 entries)
- **Key/ID format**: the source `id` field is **numeric** (e.g. `37`), not a `MISSION_<NAME>` string — that naming pattern belongs to `missionTypeIndex`, a separate ontology concept, not to concrete Missions. The index key is the numeric ID stringified (`"37"`), per the shared convention of never re-keying source IDs. `slug` (e.g. `"rescue-a-lost-friend"`) is retained as a field, not used as the key.
- **Indexed fields**: `id`, `slug`, `name`, `missionGroup` (one of the 10 group labels: Rescue, Explore, Find & Discover, Help, Protect, Build & Repair, Care & Restore, Deliver, Celebrate, Learn & Grow), `difficulty`, `active`
- **Required generated field — `missionTypeId`**: **this field does not exist in the source library.** `libraries/missions.json` has no link to `ontology/missionTypes.json` at all — no field, no naming convention, nothing to infer from. This mapping is now supplied through the authoritative generated artifact `missionTypeMapping.json`: for each of the 100 Missions, exactly one `missionTypeId` from the 21 valid Mission Types is assigned and carried into index generation. **Do not derive this from `slug` or `name` text matching** — per the locked decision, guessing (e.g. matching "rescue" in the slug to `MISSION_RESCUE`) is explicitly disallowed, since `missionGroup` labels and Mission Type IDs are visually similar but not guaranteed to be the same taxonomy and have not been audited as equivalent.
- **Audit provenance field**: plannerKnowledge also carries `missionTypeAudit` metadata for each Mission entry so this classification remains a visible data-layer fact rather than hidden engine behavior.
- **Lookup behavior**: reverse lookup by `missionTypeId` (Step B of 6A.06), direct ID lookup by numeric id, and reverse lookup via the Mission's own `bestCoreNeedIds` / `bestAdventureArchetypeIds` / `bestStoryActionIds` / `bestSettingIds` / `bestLifeDomainIds` — all of which **are** present and resolved in the real source data (see `_meta.resolution` note in `missions.json`: these were deterministically normalized from a corrupted export and are trustworthy)
- **Compatibility fields**: `bestLifeDomainIds`, `bestStoryActionIds`, `bestSettingIds`, `bestAdventureArchetypeIds`, `bestCoreNeedIds` — copied directly from source, which already stores them as resolved ID arrays (not raw text, unlike several other libraries — see obstacleIndex/worldIndex below). Note `bestAdventureArchetypeIds` may contain `null` entries where the source's `unresolvedArchetype` field flagged an unmapped value — these must be filtered, not treated as a valid archetype match
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard for numeric-ID lookups. Under the current locked Phase 6A artifact set, missing `missionTypeId` coverage is a data defect, not an expected steady-state condition.
- **Generated or manual**: `libraries/missions.json` fields generated as usual; `missionTypeId` is layered on from the authoritative audited artifact `missionTypeMapping.json`
- **Rebuild rule**: regenerate on any change to `libraries/missions.json`; regenerate immediately whenever `missionTypeMapping.json` is extended or corrected, independent of any library file change

**Audited data decision recorded here:** Mission `57` (`Face a Fear`) is classified as `MISSION_TRANSFORM`. This is an audited data-layer classification in `missionTypeMapping.json`, not resolver-side engine logic.

### storyActionIndex

```
storyActionIndex
  ↓
ACTION_SEARCH
  ↓
source: ontology/storyActions.json
  ↓
record: Story Action
```

- **Source library**: `ontology/storyActions.json` (23 entries, id-only in source — no other fields at all)
- **Key/ID format**: `ACTION_<NAME>`
- **Indexed fields**: `id`, `active` (source has no active flag; plannerKnowledge treats all 23 as active until the ontology adds one)
- **Lookup behavior**: **existence/validity check only.** This index has no compatibility data of its own to reverse-lookup by. The real compatibility bridge for 6A.07 is the already-resolved Mission's `bestStoryActionIds` (from `missionIndex`) and the Adventure Archetype's `typicalStoryActions` (from `adventureArchetypeIndex`) — this index exists solely so 6A.07 can validate that IDs appearing in those other fields are real, current ontology entries
- **Compatibility fields**: none. Do not add invented `compatibleMissionIds`/`compatibleCharacterRoles` fields here — that data structurally does not exist on the Story Action record and any compatibility signal must come from Mission or Archetype instead
- **Active/inactive handling**: standard, though source has no deprecation concept today
- **Missing-ID behavior**: standard (`INDEX_LOOKUP_FAILURE`) — this is how 6A.07 detects a stale/invalid ID inside `missions.json`'s `bestStoryActionIds` array
- **Generated or manual**: generated (trivially) from `ontology/storyActions.json`
- **Rebuild rule**: regenerate on any change to `ontology/storyActions.json`

### settingIndex

```
settingIndex
  ↓
SETTING_FOREST
  ↓
source: libraries/settings.json
  ↓
record: Setting
```

**Not previously documented in this contract — added because 6A.08 World Resolver genuinely requires it.** Settings are generic location categories (Forest, Cave, River, etc.), a separate concept from named Worlds, per the earlier-locked library separation.

- **Source library**: `libraries/settings.json` (15 entries)
- **Key/ID format**: `SETTING_<NAME>`
- **Indexed fields**: `id`, `name`, `active`
- **Lookup behavior**: direct ID lookup, used by 6A.08 to resolve each of a Mission's `bestSettingIds` into a world-type signal
- **Compatibility fields**: `linkedWorldType: string` — a single `WT_<NAME>` value (not an array; each Setting maps to exactly one World Type in the source data)
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/settings.json`
- **Rebuild rule**: regenerate on any change to `libraries/settings.json`

### worldIndex

```
worldIndex
  ↓
WORLD015
  ↓
source: libraries/worlds.json
  ↓
record: World
```

- **Source library**: `libraries/worlds.json` (40 entries)
- **Key/ID format**: `WORLD<NNN>` (numbered, not descriptive-name-based — e.g. `WORLD015`, not `WORLD_WATERFALL_CAVES`)
- **Indexed fields**: `id`, `name`, `hard.worldTypes[]`, `hard.attributes[]`, `hard.functions[]`, `active`
- **Lookup behavior**: reverse lookup by Adventure Archetype's `typicalWorldTypes` (6A.08's primary and only hard filter) — **not** by Mission or Story Action directly, since no such field exists on the World record
- **Compatibility fields**:
  - `hard.worldTypes: string[]` (`WT_<NAME>`) — the authoritative type classification, matched directly against Archetype's `typicalWorldTypes`
  - `hard.attributes: string[]` (`WA_<NAME>`) — not currently consumed by any locked 6A.0X resolver; available for future use
  - `hard.functions: string[]` (`WF_<NAME>`) — not currently consumed by any locked 6A.0X resolver; available for future use
  - `soft_suggested.emotionalTone: string` — free text, not an ID; not used by 6A.08, potentially relevant to Phase 7 Emotional Director
  - `soft_suggested.bestAdventureArchetypesRaw: string[]` — **raw archetype name text, unresolved to IDs.** Used only as an optional soft tie-break signal in 6A.08, never as a hard filter. Do not resolve this to IDs by name-matching without an explicit audited mapping step (same "no guessing" principle locked for Mission Type)
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/worlds.json`
- **Rebuild rule**: regenerate on any change to `libraries/worlds.json`

**Explicitly does not exist and must not be added:** `compatibleMissionIds`, `compatibleActionIds`. Mission's only path to World is the two-hop `bestSettingIds` → `settingIndex.linkedWorldType` → `world.hard.worldTypes` bridge; Story Actions have no path to World at all in current source data.

### obstacleIndex

```
obstacleIndex
  ↓
OBST048
  ↓
source: libraries/obstacles.json
  ↓
record: Obstacle
```

- **Source library**: `libraries/obstacles.json` (63 entries)
- **Key/ID format**: `OBST<NNN>` (numbered, not descriptive-name-based)
- **Indexed fields**: `id`, `name`, `hard.obstacleDomain` (`OD_<NAME>`, 6 values), `hard.obstacleType` (`OT_<NAME>`, 3 values), `hard.obstacleFunction` (`OBSTACLE_<NAME>`, 19 values), `escalationType`, `difficulty`, `active`
- **Lookup behavior**: reverse lookup by Adventure Archetype's `typicalObstacleDomains` (6A.09's sole hard filter) — **not** by Mission, Character, World, or Belief, since none of those source records contains any field referencing Obstacle at all
- **Compatibility fields**:
  - `hard.obstacleDomain` — the authoritative field this index is primarily queried by
  - `soft_suggested.bestLifeDomainsRaw: string[]` — raw Life Domain name text, unresolved. Matchable only against a Mission's own raw (also-unresolved) `bestLifeDomains` text — a raw-to-raw comparison, doubly soft
  - `soft_suggested.bestStoryActionsRaw: string[]` — raw Story Action name text, unresolved. Matchable only by name against a resolved Story Action ID's implied name — not a direct ID match
  - `soft_suggested.bestStoryWorldsRaw: string[]` — raw World name text, unresolved. Matchable only against a resolved World's `name` field, not its ID
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/obstacles.json`
- **Rebuild rule**: regenerate on any change to `libraries/obstacles.json`

**Explicitly does not exist and must not be added:** `compatibleMissionIds`, `compatibleCharacterIds`, `compatibleWorldIds`, `compatibleBeliefIds`. No such relationships exist anywhere in the source libraries — Obstacle's only hard bridge to the rest of the planner is via Archetype's `typicalObstacleDomains`.

### storyConflictIndex

```
storyConflictIndex
  ↓
CONFLICT_PUZZLE_CONFLICT
  ↓
source: libraries/storyConflicts.json
  ↓
record: Story Conflict
```

- **Source library**: `libraries/storyConflicts.json` (10 entries)
- **Key/ID format**: `CONFLICT_<NAME>`
- **Indexed fields**: `id`, `name`, `description`, `hard.conflictIntensity` (`"High"` / `"Moderate"` — a difficulty/tone attribute, not a category classification), `_meta.confidence`, `active`
- **Lookup behavior**: reverse lookup by Obstacle's `obstacle_domain` (6A.10's primary filter), with Mission Type as a reinforcement-only secondary signal — **not** by `obstacle_type` or `obstacle_function`, neither of which any Conflict record references
- **Compatibility fields** (all `soft_suggested`, all type-level — there is no `hard` category field on this record at all):
  - `bestMissionTypes: string[]` — type-level, reinforcement only. Coverage gap: `MISSION_DISCOVER` and `MISSION_SEARCH` do not appear in any of the 10 records
  - `bestObstacleDomains: string[]` — the primary filter field, matched against `obstacleIndex.hard.obstacleDomain`
  - `bestLogicFamilies: string[]` — consumed by 6A.11 Logic Resolver
  - `typicalEndingTypes: string[]` — consumed by 6A.15 Ending Resolver
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/storyConflicts.json`
- **Rebuild rule**: regenerate on any change to `libraries/storyConflicts.json`

**Explicitly does not exist and must not be added:** `incorporatesObstacleIds` (instance-level), any field referencing `obstacle_type` or `obstacle_function`, `compatibleCharacterRoles`. The real relationship to Obstacle is domain-level only, via `bestObstacleDomains`.

### logicIndex

```
logicIndex
  ↓
LOGIC_TRIAL_AND_ERROR
  ↓
source: ontology/logicFamilies.json
  ↓
record: Logic Family
```

- **Source library**: `ontology/logicFamilies.json` (14 entries, **id-only in source — confirmed no other fields, including no `causalPattern`**)
- **Key/ID format**: `LOGIC_<NAME>`
- **Indexed fields**: `id`, `active` (source has no active flag; treat all 14 as active until the ontology adds one)
- **Lookup behavior**: **existence/identity check only**, same pattern as `storyActionIndex`. This index has no compatibility data of its own. The real compatibility bridge for 6A.11 is three separate `best_logic_families` fields, confirmed present on three different records:
  - `characterIndex.bestLogicFamilies` — confirmed present on all 18 Character records (100% coverage), one value each
  - `adventureArchetypeIndex.bestLogicFamilies` — present on Archetype records
  - `storyConflictIndex.bestLogicFamilies` — present on Story Conflict records
  
  6A.11 computes the intersection/ranking across these three pools; `logicIndex` itself is queried only to validate that the resulting selected ID is a real, current ontology entry.
- **Compatibility fields**: none on this index itself — see the three source-side pools listed above. **Mission has no logic-related field of any kind** — confirmed absent from `libraries/missions.json` — and must not be treated as a fourth pool or as any kind of Logic filter.
- **Active/inactive handling**: standard, though source has no deprecation concept today
- **Missing-ID behavior**: standard (`INDEX_LOOKUP_FAILURE`) — used by 6A.11 to catch a stale/invalid ID inside any of the three `best_logic_families` arrays
- **Generated or manual**: generated (trivially) from `ontology/logicFamilies.json`. **Causal pattern data is never generated here** — 6A.11 authors it at resolution time, per story context, and it is explicitly not part of this index
- **Rebuild rule**: regenerate on any change to `ontology/logicFamilies.json`

### storyStructureIndex

```
storyStructureIndex
  ?
STRUCT001
  ?
source: libraries/storyStructures.json
  ?
record: Story Structure
```

- **Source library**: `libraries/storyStructures.json`
- **Key/ID format**: `STRUCT<NNN>` (numbered, e.g. `STRUCT001`) - **not** `STRUCTURE_<NAME>`
- **Indexed fields**: `id`, `name`, `corePattern`, `sceneFlowTemplate`, `hard.logicFamily`, `_meta.confidence`, `active`
- **Lookup behavior**: reverse lookup by `hard.logicFamily` only. This is the sole real compatibility bridge for 6A.12. Mission, Conflict, Adventure Archetype, Character, Belief Shift, and age do **not** have direct Structure-side compatibility fields in source.
- **Compatibility fields**:
  - `hard.logicFamily: string` (source `hard.logic_family`, singular, one value)
  
  There is **no** real `compatibleLogicIds` array, `compatibleArchetypeIds` array, `sequence` field, or any direct Structure-side Mission / Conflict / Character / Belief / age compatibility field in `storyStructures.json`.
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/storyStructures.json`, preserving source-authored `core_pattern` and `scene_flow_template` as contract-level fields
- **Rebuild rule**: regenerate on any change to `libraries/storyStructures.json`


### beatIndex

```
beatIndex
  ?
B_SAN_01
  ?
source: libraries/beats.json (30 Beat Types, built from Phase 4C state-machine specs)
  ?
record: Beat Type
```

- **Source library**: `libraries/beats.json`
- **Key/ID format**: real Beat IDs are `B_SAN_01`-style, not `BEAT_<NAME>`
- **Indexed fields**: `id`, `name`, `family`, `purpose`, `stateChange.from`, `stateChange.to`, `allowedLogic[]`, `requiredCraft[]`, `repeatable`, `maxRepeats`, `nextBeats[]`, `active`
- **Lookup behavior**: reverse lookup by `allowedLogic[]` first. This is the hard candidate filter for 6A.13. Beats are then traversed as a graph via `nextBeats[]`, with `stateChange` used to track coherent progression. Story Structure does **not** directly select Beats.
- **Compatibility fields**:
  - `allowedLogic[]` - real hard compatibility bridge from 6A.11 Logic Family into the Beat set
  - `nextBeats[]` - legal graph transitions between Beats
  - `stateChange` - progression semantics, not just display metadata
  - `repeatable` / `maxRepeats` - reuse constraints
  - `requiredCraft[]` - dependency metadata only; carry CR codes forward but do not validate their meaning yet because the Craft source remains unresolved
  
  There is **no** real `requiredForStructureIds` field and no direct Structure-side Beat mapping in `beats.json`.
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/beats.json`, preserving the state-machine fields as first-class contract data rather than collapsing them into invented structural slots
- **Rebuild rule**: regenerate on any change to `libraries/beats.json`

### openingIndex

```
openingIndex
  ?
OPEN001
  ?
source: libraries/openings.json (Opening Library)
  ?
record: Opening Strategy
```

- **Source library**: `libraries/openings.json`
- **Key/ID format**: `OPEN<NNN>` (numbered, e.g. `OPEN001`) - **not** `OPENING_<NAME>`
- **Indexed fields**: `id`, `name`, `description`, `hard.openingType`, `softSuggested.purpose`, `_meta.confidence`, `active`
- **Lookup behavior**: validate each record's `hard.openingType` against `storyTaxonomy.openingTypes[]`, then select among valid Opening records using Beat Plan, Character, Situation, Mission, Story Structure, and Story Conflict as contextual guidance only. There is no direct Beat-to-Opening compatibility field in source.
- **Compatibility fields**:
  - `hard.openingType: string` (source `hard.opening_type`)
  - `softSuggested.purpose: string` (source `soft_suggested.purpose`) - source-authored guidance text, not a compatibility matrix
  
  There is **no** real `compatibleFirstBeatIds` field and no direct Beat Plan -> Opening mapping in `openings.json`.
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/openings.json`, preserving `description` and `soft_suggested.purpose` as contract-level fields
- **Rebuild rule**: regenerate on any change to `libraries/openings.json` or to `ontology/storyTaxonomy.json` opening type IDs

### endingIndex
### endingIndex

```
endingIndex
  ?
END001
  ?
source: libraries/endings.json (Ending Library)
  ?
record: Ending Strategy
```

- **Source library**: `libraries/endings.json`
- **Key/ID format**: `END<NNN>` (numbered, e.g. `END001`) - **not** `ENDING_<NAME>`
- **Indexed fields**: `id`, `name`, `description`, `hard.endingType`, `softSuggested.typicalEmotionalResolution[]`, `_meta.confidence`, `_meta.flag`, `active`
- **Lookup behavior**: validate each record's `hard.endingType` against `storyTaxonomy.endingTypes[]`, then select among valid Ending records using Mission, Story Conflict, True Belief, Logic, Story Structure, Beat Plan, Opening Plan, and Character as contextual guidance only. There is no direct Structure/Mission/Conflict/Belief compatibility field in source.
- **Compatibility fields**:
  - `hard.endingType: string` (source `hard.ending_type`)
  - `softSuggested.typicalEmotionalResolution[]` (source `soft_suggested.typical_emotional_resolution`) - source-authored guidance, not a compatibility matrix
  - `_meta.flag` - preserve the real duplicate-type observation that `END_PASSING_FORWARD` is used by more than one Ending record; do not resolve or silently deduplicate it in the index
  
  There is **no** real `requirements` field, `compatibleStructureIds`, `compatibleConflictIds`, or other direct Ending compatibility field in `endings.json`.
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `libraries/endings.json`, preserving `description`, `soft_suggested.typical_emotional_resolution`, and the duplicate-type flag metadata as contract-level fields
- **Rebuild rule**: regenerate on any change to `libraries/endings.json` or to `ontology/storyTaxonomy.json` ending type IDs


### symbolIndex
### symbolIndex

```
symbolIndex
  ?
GAN_SYM_MOUSE
  ?
source: ontology/ganeshaSymbols.json + ontology/symbolThemes.json
  ?
record: Ganesha Symbol
```

- **Source library**: `ontology/ganeshaSymbols.json` joined with `ontology/symbolThemes.json` for theme validation - there is **no** `libraries/symbols.json`
- **Key/ID format**: Ganesha Symbol IDs such as `GAN_SYM_MOUSE`, not invented generic `SYMBOL_<NAME>` IDs
- **Indexed fields**: `id`, `symbolTheme`, `bestNeedIds[]`, `bestMissionTypes[]`, `active`
- **Lookup behavior**: reverse lookup by Need and Mission Type only. These are the sole real compatibility bridges for 6A.16. Belief, World, Beat Plan, Structure, Opening, and Ending are contextual guidance only.
- **Compatibility fields**:
  - `bestNeedIds[]` (source `best_need_ids`) - preserved exactly
  - `bestMissionTypes[]` (source `best_mission_types`) - preserved exactly
  - `symbolTheme: string` (source `symbol_theme`) - must validate against `ontology/symbolThemes.json`
  
  There is **no** real generic symbol library, no `compatibleWorldIds`, no beat linkage, and no symbol timeline field in source.
- **Active/inactive handling**: standard
- **Missing-ID behavior**: standard
- **Generated or manual**: generated from `ontology/ganeshaSymbols.json`, with `symbol_theme` validated against `ontology/symbolThemes.json` and source fields preserved exactly
- **Rebuild rule**: regenerate on any change to `ontology/ganeshaSymbols.json` or `ontology/symbolThemes.json`

### craftTechniqueIndex

```
craftTechniqueIndex
  ?
CR-SUS-001
  ?
source: authoritative craftDefinitions artifact + Beat required_craft[] usage
  ?
record: Craft dependency code
```

- **Source library**: `craftDefinitions.json` is now the authoritative Phase 6A craft-definition artifact for the real `CR-*` codes currently referenced from `libraries/beats.json` and `libraries/escalations.json`.
- **Key/ID format**: raw `CR-*` dependency codes such as `CR-SUS-001`, preserved exactly as observed in Beats
- **Indexed fields**: `id`, `name`, `purpose`, `guidance`, `usedByIds[]`, `provenance`
- **Lookup behavior**: collect CR codes referenced by the resolved Beat Plan, resolve them through `craftTechniqueIndex`, and carry them forward as known dependencies.
- **Compatibility fields**:
  - `usedByIds[]` - the Beat or Escalation records that reference the code
  - `provenance` - data-layer audit provenance for the authoritative definition

  The current authoritative artifact is intentionally limited to the real CR-code set used by Phase 6A runtime:

  - `CR-EMO-001`
  - `CR-SUS-001`
  - `CR-RHY-001`
  - `CR-VIS-001`

  `storytellingTechniques.json` and `techniqueCombinationMatrix.json` are still not part of the uploaded library bundle, but the current Phase 6A runtime no longer depends on them to resolve the live CR-code set.
- **Active/inactive handling**: all current craft definitions are treated as active
- **Missing-ID behavior**: if a Beat references a CR code not present in `craftDefinitions.json`, treat that as a real coverage defect and block validation
- **Generated or manual**: built from the authoritative `craftDefinitions.json` artifact plus usage derived from Beat/Escalation `required_craft[]` references
- **Rebuild rule**: regenerate on any change to `craftDefinitions.json`, `libraries/beats.json`, or `libraries/escalations.json`


---

## What Is Deliberately NOT in plannerKnowledge

- **Full library records.** Every index above stores only the fields a resolver needs to filter/rank/select — not the complete record. Full content (e.g. a Mission's full narrative description) stays in `libraries/*.json` and is fetched by ID only when actually needed downstream (Phase 7+).
- **beliefs.json.** As locked for Phase 6, there is no `beliefIndex` and no separate belief library. `situationIndex` carries `falseBelief`/`trueBelief` directly.
- **Craft Technique full prose guidance.** `craftTechniqueIndex` stores `purpose` and compatibility only — the full technique description/example lives in the source library.

## Confirmation Before Implementation

Field names above (e.g. `bestNeedIds`, `compatibleMissionIds`) are the **contract-level names the resolvers must be able to query** — they are not yet verified against the literal column/key names in every existing source library file. Before generating `plannerKnowledge.json` for real, reconcile this contract against the actual current library JSON structures and correct any field-name mismatches here, in this document, rather than silently diverging in the generator code.
