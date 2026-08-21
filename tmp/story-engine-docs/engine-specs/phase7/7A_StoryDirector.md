# Phase 7A — Story Director

Version: 1.0
Status: LOCKED

## 1. Purpose

The Story Director orchestrates the Phase 7 pipeline.

It takes the LOCKED Story Blueprint and coordinates the creation of the Story Plan.

It does not write prose.

## 2. Position in Engine

LOCKED Story Blueprint
        ↓
7A Story Director
        ↓
7B–7G Directors
        ↓
7H Director Validation
        ↓
LOCKED Story Plan

## 3. Inputs

- LOCKED Story Blueprint
- plannerKnowledge.json
- Relevant libraries
- Director rules

## 4. Outputs

- Story Flow
- Scene Plan
- Page Plan
- Emotion Plan
- Symbol Plan
- Craft Plan
- Story Plan

## 5. Resources Used

- Story Blueprint
- Story Structure
- Beats
- Emotional Arc
- Symbols
- Craft Techniques
- Technique Combination Matrix
- Relevant ontology libraries

## 6. Responsibilities

- Initialize the director pipeline.
- Preserve locked Blueprint decisions.
- Coordinate downstream directors.
- Maintain traceability.
- Assemble all director outputs.
- Pass the completed Story Plan to validation.

## 7. Workflow

```text
Load Blueprint
    ↓
Validate Blueprint availability
    ↓
Run Story Composer
    ↓
Run Scene Director
    ↓
Run Page Director
    ↓
Run Emotional Director
    ↓
Run Symbol Director
    ↓
Run Craft Director
    ↓
Assemble Story Plan
    ↓
Run Director Validation
```

## 8. Rules

SD-001 Never write story prose.

SD-002 Never invent IDs.

SD-003 Never silently replace Blueprint decisions.

SD-004 Preserve traceability.

SD-005 Do not bypass a failed director.

SD-006 Do not lock an unvalidated Story Plan.

## 9. Validation

- Blueprint exists.
- Required director outputs exist.
- No orphan references.
- Story Plan is complete.
- Traceability is preserved.

## 10. Failure Handling

Identify the failed director and affected artifact.

Regenerate only the affected component.

Reassemble and revalidate the Story Plan.

## 11. Deliverables

- Story Plan candidate
- Director execution record
- Validation handoff

## 12. Dependencies

Inputs

- Phase 6 Story Blueprint
- Knowledge Layer

Next

- 7B–7H

## 13. Runtime Notes

- Stateful: No
- Expected execution order: Sequential
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "storyBlueprint": {
    "mission": "MISSION_RESCUE",
    "coreNeed": "NEED_PATIENCE",
    "storyStructure": "STRUCTURE_001"
  }
}
```

## 15. Example Output

```json
{
  "storyPlan": {
    "storyFlow": {},
    "scenePlan": [],
    "pagePlan": [],
    "emotionPlan": [],
    "symbolPlan": [],
    "craftPlan": []
  }
}
```
