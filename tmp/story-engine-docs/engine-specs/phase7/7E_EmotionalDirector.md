# Phase 7E — Emotional Director

Version: 1.0
Status: LOCKED

## 1. Purpose

The Emotional Director creates the emotional journey across the Story Plan.

It distinguishes between the protagonist's emotional state and the intended reader experience.

It does not write prose.

## 2. Position in Engine

Page Plan
        ↓
Emotional Director
        ↓
Emotion Plan
        ↓
Symbol Director

## 3. Inputs

- Story Blueprint
- Story Flow
- Scene Plan
- Page Plan
- Emotional Arc
- Emotion Library
- Emotional Expression data
- Belief

## 4. Outputs

- Emotion Plan
- Emotion Curve

## 5. Resources Used

- emotionalArcs.json
- emotions.json
- emotionalExpressions.json
- beliefs.json
- coreNeeds.json

## 6. Responsibilities

For each page determine:

- Character emotional state
- Emotional transition
- Reader emotional objective
- Emotional intensity
- Expression requirements
- Emotional purpose

## 7. Workflow

```text
Read Story Flow
    ↓
Read Page Plan
    ↓
Read Emotional Arc
    ↓
Map emotional progression
    ↓
Assign page emotions
    ↓
Build Emotion Curve
    ↓
Validate
```

## 8. Rules

ED-001 Every page must have an emotional purpose.

ED-002 Emotional transitions must be motivated.

ED-003 Narrative climax and emotional climax must be compatible.

ED-004 Belief transformation must have emotional evidence.

ED-005 Resolution must provide appropriate emotional release.

ED-006 Character emotion and reader emotion must remain separate fields.

ED-007 Expressions must use valid library data.

## 9. Validation

- Emotional progression is coherent.
- No unsupported emotional jumps.
- Emotional climax exists.
- Resolution provides emotional release.
- Belief transformation is represented.
- Expression references are valid.

## 10. Failure Handling

Return affected page IDs and failed rules.

Regenerate only affected emotional assignments.

## 11. Deliverables

- Emotion Plan
- Emotion Curve

## 12. Dependencies

- Story Blueprint
- Story Flow
- Page Plan
- Emotional Arc
- emotions.json
- emotionalExpressions.json
- beliefs.json

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Page Director
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "pagePlan": [
    {
      "page": 1,
      "objective": "Introduce challenge"
    }
  ]
}
```

## 15. Example Output

```json
{
  "emotionPlan": [
    {
      "page": 1,
      "characterEmotion": "EMOTION_CURIOSITY",
      "readerEmotion": "CURIOSITY",
      "intensity": 2
    }
  ]
}
```
