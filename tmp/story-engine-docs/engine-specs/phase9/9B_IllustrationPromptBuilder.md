# Phase 9B — Illustration Prompt Builder

Version: 1.0
Status: LOCKED

## 1. Purpose

The Illustration Prompt Builder converts the Illustration Plan and Illustration Bible into production-ready illustration prompts.

It does not invent story content.

## 2. Position in Engine

Illustration Plan
        ↓
Illustration Prompt Builder
        ↓
Prompt Pack
        ↓
Illustration Generation / Asset Pipeline

## 3. Inputs

- Illustration Plan
- Illustration Bible
- Final Story
- Character continuity
- World continuity
- Visual style specifications

## 4. Outputs

- Prompt Pack
- Page-specific illustration prompts
- Negative constraints
- Continuity instructions

## 5. Resources Used

- Illustration style specification
- Character specifications
- World specifications
- Symbol specifications
- Illustration Bible
- Illustration Plan

## 6. Responsibilities

Generate prompts containing the required visual information:

- Subject
- Characters
- Action
- Environment
- Composition
- Camera
- Lighting
- Mood
- Emotion
- Props
- Symbols
- Visual style
- Continuity constraints
- Negative constraints
- Text-safe area requirements where applicable

## 7. Workflow

```text
Load Illustration Plan
        ↓
Load Illustration Bible
        ↓
Load Visual Specifications
        ↓
Build Page Prompt
        ↓
Add Continuity Constraints
        ↓
Add Negative Constraints
        ↓
Validate Prompt
        ↓
Build Prompt Pack
```

## 8. Rules

IPB-001 Never invent story events.

IPB-002 Never contradict the Illustration Plan.

IPB-003 Preserve character continuity.

IPB-004 Preserve world continuity.

IPB-005 Preserve required symbols.

IPB-006 Prompts must clearly describe the intended visual moment.

IPB-007 Negative constraints must prevent known visual failure modes.

IPB-008 Prompt style must follow the locked visual specification.

## 9. Validation

Validate:

- Every illustration page has a prompt.
- Required characters are present.
- Required actions are represented.
- Emotion is represented.
- Environment is represented.
- Continuity requirements are included.
- Style requirements are included.
- No story contradictions exist.

## 10. Failure Handling

If a prompt cannot accurately represent the Illustration Plan:

- Flag the prompt.
- Identify the missing or conflicting requirement.
- Do not invent a replacement story element.
- Return to 9A if the Illustration Plan itself is insufficient.

## 11. Deliverables

- Prompt Pack
- Prompt validation report

## 12. Dependencies

Inputs

- Illustration Plan
- Illustration Bible
- Final Story
- Visual specifications

Next

- Illustration generation / asset pipeline
- 9C Book Layout Engine

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Illustration Director
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "illustrationPlan": {
    "page": 1,
    "visualMoment": "...",
    "characters": [],
    "environment": "..."
  }
}
```

## 15. Example Output

```json
{
  "promptPack": {
    "page": 1,
    "finalPrompt": "...",
    "negativeConstraints": []
  }
}
```
