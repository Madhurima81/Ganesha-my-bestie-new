# Phase 6 — Planner

Version: 2.0
Status: LOCKED

## Purpose

Phase 6 converts a Story Request into a complete, validated Story Blueprint.

The Planner decides WHAT story is being designed.

It does not write story prose and does not determine page-level execution.

## Module Sequence

```text
Story Request
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
6C Story Blueprint (LOCKED)
```

6B Planner Rules is the governance/rules layer consumed throughout the 6A.01–6A.18 chain, not a discrete pipeline step.

There is no separate 6D. Validation is performed by 6A.18, internal to the Planner Engine. 6C only assembles and stores the already-validated Blueprint.

## File Structure

```text
docs/engine-specs/phase6/
├── README.md
├── 6A_PlannerEngine.md        (orchestrator spec)
├── 6A/
│   ├── 6A.01_PlannerEntry.md
│   ├── 6A.02_NeedResolver.md
│   ├── 6A.03_BeliefResolver.md
│   ├── 6A.04_CharacterResolver.md
│   ├── 6A.05_AdventureArchetypeResolver.md
│   ├── 6A.06_MissionResolver.md
│   ├── 6A.07_StoryActionResolver.md
│   ├── 6A.08_WorldResolver.md
│   ├── 6A.09_ObstacleResolver.md
│   ├── 6A.10_StoryConflictResolver.md
│   ├── 6A.11_LogicResolver.md
│   ├── 6A.12_StoryStructureResolver.md
│   ├── 6A.13_BeatResolver.md
│   ├── 6A.14_OpeningResolver.md
│   ├── 6A.15_EndingResolver.md
│   ├── 6A.16_SymbolResolver.md
│   ├── 6A.17_CraftResolver.md
│   └── 6A.18_PlannerValidator.md
├── 6B_PlannerRules.md
└── 6C_StoryBlueprint.md
```

## Inputs

- Story Request
- ontology/*.json
- libraries/*.json
- plannerKnowledge.json
- Planner rules

## Outputs

- Validated Planner Context
- Planner Validation Report (produced by 6A.18)
- LOCKED Story Blueprint (assembled by 6C)

## Phase Boundary

Phase 6 decides the story's foundational ingredients and relationships.

Phase 7 decides how those decisions unfold into a Story Plan.

Phase 8 writes the story.

Phase 9 produces the book.

## Deliverables

- Planner Engine (orchestrator + 18 resolvers)
- Planner Rules
- Planner Validation Report
- LOCKED Story Blueprint
