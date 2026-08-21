# Phase 7F — Symbol Director

Version: 1.0
Status: LOCKED

## 1. Purpose

The Symbol Director plans how selected symbols function across the story.

It determines introduction, recurrence, transformation and payoff.

It does not create new symbols.

## 2. Position in Engine

Emotion Plan
        ↓
Symbol Director
        ↓
Symbol Plan
        ↓
Craft Director

## 3. Inputs

- Story Blueprint
- Story Flow
- Scene Plan
- Page Plan
- Emotion Plan
- Selected Symbols

## 4. Outputs

- Symbol Plan
- Symbol Timeline

## 5. Resources Used

- symbols.json
- Page Plan
- Emotion Plan
- Story Blueprint

## 6. Responsibilities

For each selected symbol determine:

- Narrative purpose
- First appearance
- Recurrence
- Transformation
- Emotional function
- Payoff
- Page placement
- Visual importance

## 7. Workflow

```text
Read selected symbols
    ↓
Read Story Flow
    ↓
Read Emotion Plan
    ↓
Assign symbol journey
    ↓
Assign page appearances
    ↓
Assign payoff
    ↓
Build Symbol Timeline
    ↓
Validate
```

## 8. Rules

SY-001 Every selected symbol must have a purpose.

SY-002 Never invent a symbol ID.

SY-003 Symbols must support the story rather than replace it.

SY-004 Symbol payoff must be earned.

SY-005 Avoid unnecessary repetition.

SY-006 Avoid symbol overcrowding.

SY-007 Symbol placement must support narrative or emotional purpose.

## 9. Validation

- Every selected symbol is accounted for.
- Symbol references are valid.
- Required appearances exist.
- Payoff is represented where required.
- Symbol density is reasonable.
- No orphan symbol references exist.

## 10. Failure Handling

Return affected symbol IDs and pages.

Regenerate only affected symbol assignments.

## 11. Deliverables

- Symbol Plan
- Symbol Timeline

## 12. Dependencies

- symbols.json
- Story Blueprint
- Story Flow
- Page Plan
- Emotion Plan

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Emotional Director
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "symbols": ["SYMBOL_MOUSE"],
  "pagePlan": []
}
```

## 15. Example Output

```json
{
  "symbolPlan": [
    {
      "symbol": "SYMBOL_MOUSE",
      "appearances": [
        {
          "page": 1,
          "function": "INTRODUCE"
        },
        {
          "page": 6,
          "function": "PAYOFF"
        }
      ]
    }
  ]
}
```
