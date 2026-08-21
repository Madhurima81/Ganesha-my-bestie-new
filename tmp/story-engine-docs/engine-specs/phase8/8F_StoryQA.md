# Phase 8F — Story QA

Version: 1.0
Status: LOCKED

## 1. Purpose

Story QA is the final quality gate for Phase 8.

It verifies that the written story faithfully realizes the LOCKED Story Plan while also functioning as a warm, coherent, memorable children's story.

It does not rewrite the story.

## 2. Position in Engine

Polished Manuscript
        ↓
Story QA
        ↓
PASS → LOCKED Final Story
FAIL → Responsible Writing Module
        ↓
Regenerate
        ↓
QA Again

## 3. Inputs

- LOCKED Story Plan
- Story Blueprint
- Polished Manuscript
- Page-level Manuscript
- Emotion Plan
- Symbol Plan
- Craft Plan
- Target Age
- Reading Level

## 4. Outputs

### Success

- Story QA Report
- LOCKED Final Story

### Failure

- Story QA Report
- Failed rules
- Affected page/scene
- Responsible module
- Regeneration target

## 5. Resources Used

- Story Plan
- Story Blueprint
- Reading-level rules
- Language rules
- Craft Plan
- Emotion Plan
- Symbol Plan
- Character data

## 6. Responsibilities

Validate:

- Story integrity
- Character agency
- Causal continuity
- Mission progression
- Emotional arc
- Core Need realization
- Belief transformation
- Symbol payoff
- Craft execution
- Page continuity
- Page-turn effectiveness
- Reading level
- Grammar
- Read-aloud quality
- Ending quality

## 7. Workflow

```text
Load Final Manuscript
        ↓
Validate Story Integrity
        ↓
Validate Character Agency
        ↓
Validate Causal Flow
        ↓
Validate Emotional Arc
        ↓
Validate Core Need / Belief
        ↓
Validate Symbols
        ↓
Validate Craft
        ↓
Validate Page Continuity
        ↓
Validate Language
        ↓
Validate Read-Aloud Quality
        ↓
Generate QA Report
        ↓
PASS → LOCK Final Story
FAIL → Responsible Module
```

## 8. Rules

QA-001 Story must preserve the LOCKED Story Plan.

QA-002 Protagonist must have meaningful agency.

QA-003 Story must have clear causal progression.

QA-004 Mission must be resolved appropriately.

QA-005 Core Need must be meaningfully addressed.

QA-006 Belief transformation must be earned.

QA-007 Emotional arc must be coherent.

QA-008 Symbol payoff must be present where required.

QA-009 Craft requirements must be realized.

QA-010 Page transitions must remain coherent.

QA-011 Language must be appropriate for the target age.

QA-012 Story must be grammatically sound.

QA-013 Story must work when read aloud.

QA-014 Ending must provide emotional and narrative closure.

QA-015 No major unplanned story elements may be introduced.

QA-016 Page word budgets must not override story quality.

## 9. Validation

Every rule produces:

- Rule ID
- PASS / FAIL / WARNING
- Severity
- Affected page or scene
- Evidence
- Responsible module

Blocking failures prevent the Final Story from being locked.

## 10. Failure Handling

Story QA must not silently rewrite the manuscript.

For every blocking failure:

1. Identify the responsible writing module.
2. Identify the affected page or scene.
3. Return a regeneration target.
4. Regenerate only the affected content where possible.
5. Run Story QA again.

If the problem originates in the Story Plan rather than the writing, return it to Phase 7 rather than forcing the writer to solve a planning defect.

## 11. Deliverables

- Story QA Report
- LOCKED Final Story

## 12. Dependencies

Inputs

- Story Plan
- Story Blueprint
- Written Manuscript
- Reading-level rules
- Language rules

Next Phase

Phase 9 Book Production

## 13. Runtime Notes

- Stateful: No
- Expected execution order: Final Phase 8 gate
- Idempotent: Yes
- Cacheable: Yes
- Lock operation: Immutable after successful QA

## 14. Example Input

```json
{
  "storyPlan": {
    "scenePlan": [],
    "pagePlan": [],
    "emotionPlan": [],
    "symbolPlan": [],
    "craftPlan": []
  },
  "finalStory": {
    "pages": []
  }
}
```

## 15. Example Output

```json
{
  "status": "LOCKED",
  "qa": {
    "status": "PASS",
    "rulesPassed": 16,
    "rulesFailed": 0,
    "warnings": [],
    "errors": []
  }
}
```
