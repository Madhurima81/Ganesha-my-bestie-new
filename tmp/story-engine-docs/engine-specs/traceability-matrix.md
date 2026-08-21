# Engine Traceability Matrix

Version: 2.0
Status: LOCKED

## Purpose

This matrix provides the complete implementation flow for the Story Engine.

It shows:

- Module
- Input Artifact
- Output Artifact
- Depends On
- Next Module

The matrix is a navigation and consistency document. It does not replace the individual engine specifications.

---

## Phase 6 — Planner

| Module | Input Artifact | Output Artifact | Depends On | Next Module |
|---|---|---|---|---|
| 6A Planner Engine (orchestrator) | Story Request | Sequencing / handoff to 6A.01 | Planner Knowledge, Ontology, Libraries, 6B | 6A.01 |
| 6A.01 Planner Entry | Story Request | Initialized Planner Context | 6A, Planner Rules | 6A.02 |
| 6A.02 Need Resolver | Planner Context | Resolved Core Need | 6A.01, plannerKnowledge.needIndex | 6A.03 |
| 6A.03 Belief Resolver | Core Need, Situation | Belief Shift (False/True Belief) | 6A.02, Situation data | 6A.04 |
| 6A.04 Character Resolver | Core Need, Belief Shift, Situation | Character Role, Protagonist | 6A.03, plannerKnowledge.characterIndex | 6A.05 |
| 6A.05 Adventure Archetype Resolver | Need, Belief Shift, Character | Adventure Archetype | 6A.04, plannerKnowledge.adventureArchetypeIndex | 6A.06 |
| 6A.06 Mission Resolver | Need, Belief Shift, Character, Archetype | Mission | 6A.05, plannerKnowledge.missionIndex | 6A.07 |
| 6A.07 Story Action Resolver | Mission, Character, Need | Story Actions | 6A.06, plannerKnowledge.storyActionIndex | 6A.08 |
| 6A.08 World Resolver | Mission, Story Actions, Character, Archetype | World | 6A.07, plannerKnowledge.worldIndex | 6A.09 |
| 6A.09 Obstacle Resolver | Mission, Character, Belief Shift, World | Obstacle | 6A.08, plannerKnowledge.obstacleIndex | 6A.10 |
| 6A.10 Story Conflict Resolver | Character, Mission, Obstacle, Belief Shift | Story Conflict | 6A.09, plannerKnowledge.storyConflictIndex | 6A.11 |
| 6A.11 Logic Resolver | Mission, Actions, World, Obstacle, Conflict | Story Logic | 6A.10, plannerKnowledge.logicIndex | 6A.12 |
| 6A.12 Story Structure Resolver | Logic, Mission, Conflict, Archetype, Character | Story Structure | 6A.11, plannerKnowledge.storyStructureIndex | 6A.13 |
| 6A.13 Beat Resolver | Story Structure, Logic, Mission, Conflict, Belief Shift | Beat Plan | 6A.12, plannerKnowledge.beatIndex | 6A.14 |
| 6A.14 Opening Resolver | Beat Plan, Character, Situation, Mission | Opening Plan | 6A.13, plannerKnowledge.openingIndex | 6A.15 |
| 6A.15 Ending Resolver | Beat Plan, Mission, Conflict, True Belief, Structure | Ending Plan | 6A.14, plannerKnowledge.endingIndex | 6A.16 |
| 6A.16 Symbol Resolver | Character, Need, Belief Shift, Mission, Beat Plan, Opening/Ending | Symbol Plan | 6A.15, plannerKnowledge.symbolIndex | 6A.17 |
| 6A.17 Craft Resolver | Structure, Beat Plan, Symbol Plan, Opening/Ending | Craft Plan | 6A.16, plannerKnowledge.craftTechniqueIndex | 6A.18 |
| 6A.18 Planner Validator | Complete Planner Context (all 6A.01–6A.17 outputs) | Planner Validation Report / Blueprint-ready status | 6A.01–6A.17, Planner Rules | 6C / Responsible Resolver on failure |
| 6B Planner Rules | Consumed throughout 6A.01–6A.18 | Rule evaluation results | Planner Knowledge, Ontology, Libraries | — (governance layer, not a pipeline step) |
| 6C Story Blueprint | Validated Planner Context (6A.18 PASS) | LOCKED Story Blueprint | 6A.18, 6B | Phase 7 |

### Important: No Separate 6D

Validation was previously specified as a separate 6D module. This is now retired. Validation is internal to the Planner Engine as **6A.18 Planner Validator**, the final of the 18 sequenced resolvers. 6C no longer performs validation — it only assembles the already-validated Planner Context into the canonical Blueprint artifact.

---

## Phase 7 — Story Director

| Module | Input Artifact | Output Artifact | Depends On | Next Module |
|---|---|---|---|---|
| 7A Story Director | LOCKED Story Blueprint | Director Pipeline / Story Plan Candidate | Phase 6, Knowledge Layer | 7B |
| 7B Story Composer | LOCKED Story Blueprint | Story Flow | 7A, Story Structure, Beats, Mission, Obstacle, Logic | 7C |
| 7C Scene Director | Story Flow, Story Blueprint | Scene Plan | 7B, Story Structure, Beats, Logic | 7D |
| 7D Page Director | Story Flow, Scene Plan, Story Blueprint | Page Plan | 7B, 7C, Page Constraints, Reading-Level Rules | 7E |
| 7E Emotional Director | Story Flow, Scene Plan, Page Plan, Story Blueprint | Emotion Plan, Emotion Curve | 7B, 7C, 7D, Emotional Libraries | 7F |
| 7F Symbol Director | Story Flow, Scene Plan, Page Plan, Emotion Plan, Story Blueprint | Symbol Plan, Symbol Timeline | 7B, 7C, 7D, 7E, Symbols Library | 7G |
| 7G Craft Director | Story Flow, Page Plan, Emotion Plan, Symbol Plan, Story Blueprint | Craft Plan, Craft Strategy | 7B, 7D, 7E, 7F, Craft Libraries | 7H |
| 7H Director Validation | Story Flow, Scene Plan, Page Plan, Emotion Plan, Symbol Plan, Craft Plan | LOCKED Story Plan / Validation Report | 7A–7G, Knowledge Layer | Phase 8 / Responsible Module on failure |

### Important Pagination Boundary

The Page Plan produced by **7D** is pagination guidance for **8B**, not a page-by-page writing target for **8A**.

8A first creates the COMPLETE STORY MASTER.

8B then uses the Page Plan to determine the best page boundaries for that completed story.

Therefore:

```text
7D Page Plan
      ↓
guidance for later pagination
      ↓
8A Complete Story Master
      ↓
8B Intelligent Pagination
```

---

## Phase 8 — Story Writer

| Module | Input Artifact | Output Artifact | Depends On | Next Module |
|---|---|---|---|---|
| 8A Story Writer | LOCKED Story Plan | Complete Story Master | Phase 7, Writing Rules, Reading-Level Rules | 8B |
| 8B Page Writer | Complete Story Master, Page Plan, Emotion Plan, Symbol Plan, Craft Plan | Page Manuscript | 8A, Phase 7 outputs | 8C |
| 8C Narration Writer | Page Manuscript, Emotion Plan, Craft Plan | Narration Layer | 8B, Language/Reading Rules | 8D |
| 8D Dialogue Writer | Page Manuscript, Narration Layer, Character Data, Emotion Plan | Combined Page Manuscript | 8C, Character Data, Dialogue Rules | 8E |
| 8E Language Polish | Combined Page Manuscript, Story Plan | Polished Manuscript | 8C, 8D, Language Rules | 8F |
| 8F Story QA | Polished Manuscript, LOCKED Story Plan, Story Blueprint | LOCKED Final Story / QA Report | 8A–8E, Phase 7 | Phase 9 / Responsible Module on failure |

### Critical Phase 8 Flow

```text
LOCKED STORY PLAN
        ↓
8A
        ↓
COMPLETE STORY MASTER
        ↓
8B
        ↓
PAGE MANUSCRIPT
        ↓
8C
        ↓
NARRATION
        ↓
8D
        ↓
DIALOGUE
        ↓
8E
        ↓
POLISHED MANUSCRIPT
        ↓
8F
        ↓
LOCKED FINAL STORY
```

The Complete Story Master is the narrative source of truth during pagination.

---

## Phase 9 — Book Production

| Module | Input Artifact | Output Artifact | Depends On | Next Module |
|---|---|---|---|---|
| 9A Illustration Director | LOCKED Final Story, Story Plan, Emotion Plan, Symbol Plan | Illustration Plan, Illustration Bible | Phase 8, Character/World/Symbol Data | 9B |
| 9B Illustration Prompt Builder | Illustration Plan, Illustration Bible | Prompt Pack | 9A, Visual Specifications | Illustration Generation / Asset Pipeline |
| 9C Book Layout Engine | LOCKED Final Story, Page Manuscript, Illustration Assets, Illustration Plan | Book Layout | 9A, 9B, Layout Specifications | 9D |
| 9D Production QA | Final Story, Illustration Assets, Book Layout, Prompt Pack | Production QA Report / Production Ready | 9A–9C, Production Specifications | 9E |
| 9E Export Engine | Production-Ready Book, QA Report, Metadata, Export Profile | Story Package / Export Packages | 9D, Export Specifications | END |

---

## Complete Engine Flow

```text
STORY REQUEST
     ↓
6A Planner Engine (orchestrator)
     ↓
6A.01 Planner Entry
     ↓
6A.02 Need Resolver
     ↓
6A.03 Belief Resolver
     ↓
6A.04 Character Resolver
     ↓
6A.05 Adventure Archetype Resolver
     ↓
6A.06 Mission Resolver
     ↓
6A.07 Story Action Resolver
     ↓
6A.08 World Resolver
     ↓
6A.09 Obstacle Resolver
     ↓
6A.10 Story Conflict Resolver
     ↓
6A.11 Logic Resolver
     ↓
6A.12 Story Structure Resolver
     ↓
6A.13 Beat Resolver
     ↓
6A.14 Opening Resolver
     ↓
6A.15 Ending Resolver
     ↓
6A.16 Symbol Resolver
     ↓
6A.17 Craft Resolver
     ↓
6A.18 Planner Validator
     ↓
6C Story Blueprint
     ↓
LOCKED STORY BLUEPRINT
     ↓
7A Story Director
     ↓
7B Story Composer
     ↓
7C Scene Director
     ↓
7D Page Director
     ↓
7E Emotional Director
     ↓
7F Symbol Director
     ↓
7G Craft Director
     ↓
7H Director Validation
     ↓
LOCKED STORY PLAN
     ↓
8A Story Writer
     ↓
COMPLETE STORY MASTER
     ↓
8B Page Writer
     ↓
PAGE MANUSCRIPT
     ↓
8C Narration Writer
     ↓
8D Dialogue Writer
     ↓
8E Language Polish
     ↓
8F Story QA
     ↓
LOCKED FINAL STORY
     ↓
9A Illustration Director
     ↓
9B Illustration Prompt Builder
     ↓
ILLUSTRATION GENERATION / ASSET PIPELINE
     ↓
9C Book Layout Engine
     ↓
9D Production QA
     ↓
9E Export Engine
     ↓
STORY PACKAGE
```

### Locked Artifact Chain

```text
Story Request
    ↓
Story Blueprint
    ↓
Story Flow
    ↓
Scene Plan
    ↓
Page Plan
    ↓
Story Plan
    ↓
Complete Story Master
    ↓
Page Manuscript
    ↓
Polished Manuscript
    ↓
Final Story
    ↓
Illustration Plan
    ↓
Prompt Pack
    ↓
Book Layout
    ↓
Production Ready
    ↓
Story Package
```

### Architecture Boundaries

**Phase 6** — WHAT story is being designed?

**Phase 7** — HOW does that story unfold?

**Phase 8** — HOW is that story written?

**Phase 9** — HOW is that finished story produced?

No downstream phase may silently redesign a locked upstream decision.

---

## Referential Integrity Rules (Implementation-Time, Not Schema-Enforced)

JSON Schema cannot enforce cross-document foreign keys — a `{id: string}` reference field can only be checked for shape, not for whether that ID actually resolves to a real upstream artifact. The developer must validate the following relationships explicitly at load/consume time:

| Upstream Field | Downstream Reference | Consumed By |
|---|---|---|
| `storyBlueprint.blueprintId` | `storyPlan.blueprintReference.id` | Phase 7 loading a Story Blueprint |
| `storyPlan` (implicit, via blueprintReference chain) | `storyPackage.sourceReferences.storyPlanReference.id` | 9E Export Engine assembling the package |
| Final Story artifact ID | `storyPackage.sourceReferences.finalStoryReference.id` | 9E Export Engine |
| `illustrationPlan` artifact ID | `illustrationBible.illustrationPlanReference.id` | 9B Prompt Pack Builder |
| `illustrationBible` artifact ID | `illustrationPlan.illustrationBibleReference.id` | 9B Prompt Pack Builder |
| `illustrationPlan` / `illustrationBible` artifact IDs | `storyPackage.sourceReferences.illustrationPlanReference.id` / `illustrationBibleReference.id` | 9E Export Engine |
| `promptPack` artifact ID | `storyPackage.sourceReferences.promptPackReference.id` | 9E Export Engine |
| `layout` artifact ID | `storyPackage.sourceReferences.layoutReference.id` | 9E Export Engine |
| Final Story / illustration asset IDs | `layout.finalStoryReference.id` / `layout.illustrationAssetReferences[].id` | 9C Book Layout Engine |

**Rule**: before consuming any artifact that contains a reference field (`*Reference.id`), the consuming module must confirm the referenced ID matches a real, existing upstream artifact of the expected type. A reference field that resolves to nothing, or to an artifact of the wrong type, must be treated as a blocking validation failure — never silently ignored or auto-corrected.

This is a discipline enforced in code (or in a lightweight artifact-registry lookup), not something any of the 7 locked schemas can guarantee on their own.
