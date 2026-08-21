# Phase 7D — Page Director

Version: 1.0
Status: LOCKED

## 1. Purpose

The Page Director transforms the Scene Plan into a Page Plan.

Its primary responsibility is to preserve the integrity and pacing of the story while determining how the story is presented across pages.

Story quality takes priority over rigid page count.

The Page Plan is pagination guidance for 8B, not a page-by-page writing target for 8A. Word budgets and page objectives are evaluated during pagination after the Complete Story Master exists.

## 2. Position in Engine

Scene Plan
        ↓
Page Director
        ↓
Page Plan
        ↓
Emotional Director

## 3. Inputs

- Story Flow
- Scene Plan
- Story Blueprint
- Target page range
- Target age
- Reading level
- Book format constraints

## 4. Outputs

- Page Plan
- Pagination Strategy
- Page Objectives
- Word Budgets
- Page-Turn Objectives

## 5. Resources Used

- storyStructures.json
- beats.json
- reading-level rules
- page/layout constraints

## 6. Responsibilities

For each page determine:

- Page objective
- Scene mapping
- Narrative content allocation
- Word-budget target
- Illustration priority
- Page-turn objective
- Transition into the following page

## 7. Workflow

```text
Read Story Flow
    ↓
Read Scene Plan
    ↓
Determine pagination strategy
    ↓
Map narrative units to pages
    ↓
Assign word-budget targets
    ↓
Assign page-turn objectives
    ↓
Protect major emotional/narrative beats
    ↓
Validate
    ↓
Output Page Plan
```

## 8. Rules

PD-001 Story quality takes priority over rigid page symmetry.

PD-002 Never change story events merely to satisfy page count.

PD-003 Never remove essential story information to hit a page target.

PD-004 Do not split a critical emotional or narrative beat merely for pagination.

PD-005 Every page must have a clear purpose.

PD-006 Every page should contribute to forward movement.

PD-007 Page turns should create an intentional reader experience.

PD-008 Word budgets are targets, not permission to damage the story.

PD-009 Illustration space must be protected.

PD-010 Page count may adapt within the allowed product constraints when required to preserve story integrity.

## 9. Validation

- Every scene is represented.
- No essential narrative unit is lost.
- Page objectives are clear.
- Word budgets are reasonable.
- Major beats remain intact.
- Emotional progression is preserved.
- Page turns are meaningful.
- Illustration space is considered.
- Requested page constraints are respected where they do not damage the story.

## 10. Failure Handling

If page constraints conflict with story integrity:

1. Flag a pagination conflict.
2. Do not rewrite the story.
3. Attempt an alternative pagination strategy.
4. If no valid strategy exists, return the conflict to the caller.

## 11. Deliverables

- Page Plan
- Pagination Strategy
- Page-turn Map

## 12. Dependencies

- Story Flow
- Scene Plan
- Story Blueprint
- Story Structure
- Beats
- Reading-level constraints

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Scene Director
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "targetPageRange": {
    "min": 5,
    "max": 8
  },
  "scenePlan": []
}
```

## 15. Example Output

```json
{
  "pagePlan": [
    {
      "page": 1,
      "sceneIds": ["SCENE_001"],
      "objective": "Introduce hero and problem",
      "wordBudget": {
        "target": 55
      },
      "pageTurnObjective": "CURIOSITY"
    }
  ]
}
```
