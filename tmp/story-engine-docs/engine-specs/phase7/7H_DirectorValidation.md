# Phase 7H — Director Validation

Version: 1.0
Status: LOCKED

## 1. Purpose

Director Validation is the final quality gate for Phase 7.

It determines whether the complete Story Plan is coherent, complete, traceable and ready for Phase 8 writing.

It never silently repairs the Story Plan.

## 2. Position in Engine

Story Plan
        ↓
Director Validation
        ↓
PASS → LOCKED Story Plan
FAIL → Responsible Module
        ↓
Regenerate
        ↓
Validate Again

## 3. Inputs

- Story Blueprint
- Story Flow
- Scene Plan
- Page Plan
- Emotion Plan
- Emotion Curve
- Symbol Plan
- Symbol Timeline
- Craft Plan
- Craft Strategy

## 4. Outputs

### Success

- Director Validation Report
- LOCKED Story Plan

### Failure

- Validation Report
- Failed rules
- Responsible module
- Affected artifact
- Regeneration target

## 5. Resources Used

- plannerKnowledge.json
- Relevant ontology libraries
- Relevant Phase 6–7 libraries
- Story Structure
- Beats
- Emotional Arc
- Symbols
- Craft Techniques
- Technique Combination Matrix

## 6. Responsibilities

Validate:

- Story continuity
- Causal progression
- Scene integrity
- Page integrity
- Emotional progression
- Symbol journey
- Craft compatibility
- Blueprint preservation
- Reference integrity
- Phase 8 readiness

## 7. Workflow

```text
Load all Phase 7 artifacts
        ↓
Validate structure
        ↓
Validate references
        ↓
Validate narrative continuity
        ↓
Validate scenes
        ↓
Validate pages
        ↓
Validate emotional progression
        ↓
Validate symbols
        ↓
Validate craft
        ↓
Validate Blueprint preservation
        ↓
Generate Validation Report
        ↓
PASS → LOCK
FAIL → Responsible Module
```

## 8. Rules

DV-001 Story Flow is complete.

DV-002 Causal chain is continuous.

DV-003 Every scene has a purpose.

DV-004 Every scene is assigned appropriately.

DV-005 Every page has a clear objective.

DV-006 Page planning preserves story integrity.

DV-007 Emotional progression is coherent.

DV-008 Emotional climax is compatible with narrative climax.

DV-009 Selected symbols are accounted for.

DV-010 Symbol payoff is valid.

DV-011 Craft references are valid.

DV-012 Craft combinations are compatible.

DV-013 No orphan references exist.

DV-014 Phase 6 Blueprint decisions remain preserved.

DV-015 Story Plan is complete.

DV-016 Story Plan is ready for Phase 8.

## 9. Validation

Validation must produce:

- Rule ID
- Status
- Severity
- Affected artifact
- Affected ID
- Responsible module

Blocking failures prevent locking.

Warnings may be recorded without blocking only where explicitly defined by the rule severity.

## 10. Failure Handling

The validator must not rewrite the Story Plan.

For every blocking failure:

1. Identify the responsible module.
2. Identify the affected artifact.
3. Return regeneration target.
4. Regenerate only the affected component.
5. Reassemble the Story Plan.
6. Run validation again.

## 11. Deliverables

- Director Validation Report
- LOCKED Story Plan when all blocking rules pass

## 12. Dependencies

Inputs

- All Phase 7 artifacts
- Story Blueprint
- Knowledge Layer

Next

Phase 8 Story Writer

## 13. Runtime Notes

- Stateful: No
- Expected execution order: Final Phase 7 gate
- Idempotent: Yes
- Cacheable: Yes
- Lock operation: Immutable after successful validation

## 14. Example Input

```json
{
  "storyFlow": {},
  "scenePlan": [],
  "pagePlan": [],
  "emotionPlan": [],
  "symbolPlan": [],
  "craftPlan": []
}
```

## 15. Example Output

```json
{
  "status": "LOCKED",
  "validation": {
    "status": "PASS",
    "rulesPassed": 16,
    "rulesFailed": 0,
    "warnings": [],
    "errors": []
  }
}
```
