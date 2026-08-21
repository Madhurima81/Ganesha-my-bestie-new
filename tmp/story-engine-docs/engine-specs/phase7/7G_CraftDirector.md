# Phase 7G — Craft Director

Version: 1.0
Status: LOCKED

## 1. Purpose

The Craft Director assigns storytelling techniques to the Story Plan.

Craft determines HOW the planned story is presented.

It does not change WHAT happens.

## 2. Position in Engine

Symbol Plan
        ↓
Craft Director
        ↓
Craft Plan
        ↓
Director Validation

## 3. Inputs

- Story Blueprint
- Story Flow
- Scene Plan
- Page Plan
- Emotion Plan
- Symbol Plan
- Storytelling Techniques
- Technique Combination Matrix

## 4. Outputs

- Craft Plan
- Craft Strategy

## 5. Resources Used

- storytellingTechniques.json
- techniqueCombinationMatrix.json
- Phase 4D Craft taxonomy
- Page Plan
- Emotion Plan
- Symbol Plan

## 6. Responsibilities

Determine:

- Story-level craft strategy
- Primary technique
- Supporting techniques
- Page-level craft assignments
- Read-aloud devices
- Page-turn techniques
- Visual storytelling techniques

## 7. Workflow

```text
Read Story Plan
    ↓
Read Emotion Plan
    ↓
Read Symbol Plan
    ↓
Select primary techniques
    ↓
Check combination matrix
    ↓
Assign supporting techniques
    ↓
Build Craft Strategy
    ↓
Validate
```

## 8. Rules

CR-001 Only valid technique IDs may be used.

CR-002 Technique combinations must respect the compatibility matrix.

CR-003 Craft must support the page objective.

CR-004 Craft must support emotional intent.

CR-005 Craft must support appropriate page turns.

CR-006 Do not add techniques merely for complexity.

CR-007 Craft must not change story events.

CR-008 Craft must not contradict Story Structure.

## 9. Validation

- Technique IDs resolve.
- Combination rules pass.
- Craft supports page objectives.
- Technique density is appropriate.
- Read-aloud techniques are appropriately distributed.
- Story-level Craft Strategy is coherent.

## 10. Failure Handling

Return affected page IDs and invalid technique combinations.

Regenerate only affected craft assignments.

## 11. Deliverables

- Craft Plan
- Craft Strategy

## 12. Dependencies

- storytellingTechniques.json
- techniqueCombinationMatrix.json
- Story Blueprint
- Story Flow
- Page Plan
- Emotion Plan
- Symbol Plan

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Symbol Director
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "pagePlan": [],
  "emotionPlan": [],
  "symbolPlan": []
}
```

## 15. Example Output

```json
{
  "craftPlan": [
    {
      "page": 1,
      "primaryTechnique": "CR-VIS-001",
      "supportingTechniques": []
    }
  ],
  "craftStrategy": {}
}
```
