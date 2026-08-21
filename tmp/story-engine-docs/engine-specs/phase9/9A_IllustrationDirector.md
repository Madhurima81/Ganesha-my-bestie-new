# Phase 9A — Illustration Director

Version: 1.0
Status: LOCKED

## 1. Purpose

The Illustration Director converts the LOCKED Final Story and Story Plan into a visual production plan.

It determines what each illustration needs to communicate.

It does not generate the actual artwork.

## 2. Position in Engine

LOCKED Final Story
        ↓
9A Illustration Director
        ↓
Illustration Plan
        ↓
9B Illustration Prompt Builder

## 3. Inputs

- LOCKED Final Story
- Story Plan
- Story Blueprint
- Page Manuscript
- Emotion Plan
- Symbol Plan
- Character information
- World information
- Illustration requirements

## 4. Outputs

- Illustration Plan
- Illustration Bible
- Character continuity requirements
- World continuity requirements
- Visual continuity requirements

## 5. Resources Used

- Character libraries
- World libraries
- Symbol libraries
- Illustration style specifications
- Emotion Plan
- Symbol Plan
- Final Story

The exact library filenames must use the project's current canonical names.

## 6. Responsibilities

Determine for every page:

- Primary visual moment
- Characters present
- Character actions
- Character expressions
- Environment
- Important props
- Symbols
- Composition
- Camera/viewpoint
- Visual emphasis
- Continuity requirements
- Text-safe areas where relevant

Maintain continuity across:

- Character appearance
- Clothing
- Props
- Environment
- Scale
- Symbol appearance
- Visual world

## 7. Workflow

```text
Load LOCKED Final Story
        ↓
Read Page Manuscript
        ↓
Read Emotion Plan
        ↓
Read Symbol Plan
        ↓
Identify Visual Moments
        ↓
Assign Characters / Environment / Props
        ↓
Define Composition
        ↓
Apply Continuity Requirements
        ↓
Build Illustration Bible
        ↓
Build Illustration Plan
        ↓
Validate
```

## 8. Rules

ID-001 Never change the story.

ID-002 Never invent major story events for an illustration.

ID-003 Illustration must represent the intended narrative moment.

ID-004 Character continuity must be preserved.

ID-005 World continuity must be preserved.

ID-006 Required symbols must be represented where planned.

ID-007 Illustration must support, not compete with, the story.

ID-008 Important emotional expressions must match the Emotion Plan.

ID-009 Do not introduce visual elements that contradict the story.

## 9. Validation

Validate:

- Every required page has an illustration plan.
- Characters are identified correctly.
- Actions match the story.
- Emotions match the Emotion Plan.
- Symbols match the Symbol Plan.
- Environment matches the story world.
- Continuity requirements exist.
- No major visual contradiction exists.

## 10. Failure Handling

If an illustration requirement conflicts with the story:

1. Flag the affected page.
2. Do not alter the story.
3. Correct the illustration plan where possible.
4. If the conflict originates upstream, return it to the appropriate phase.

## 11. Deliverables

- Illustration Plan
- Illustration Bible
- Visual continuity requirements

## 12. Dependencies

Inputs

- Final Story
- Story Plan
- Story Blueprint
- Character data
- World data
- Symbol data

Next Module

- 9B Illustration Prompt Builder

## 13. Runtime Notes

- Stateful: No
- Expected execution order: First production module
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "finalStory": {
    "pages": []
  },
  "emotionPlan": [],
  "symbolPlan": []
}
```

## 15. Example Output

```json
{
  "illustrationPlan": [
    {
      "page": 1,
      "visualMoment": "...",
      "characters": [],
      "environment": "...",
      "emotion": "...",
      "symbols": []
    }
  ],
  "illustrationBible": {}
}
```
