# Phase 8D — Dialogue Writer

Version: 1.0
Status: LOCKED

## 1. Purpose

The Dialogue Writer creates and refines character dialogue while preserving the planned story, characterisation and emotional arc.

## 2. Position in Engine

Narration Layer
        ↓
Dialogue Writer
        ↓
Combined Page Manuscript
        ↓
Language Polish

## 3. Inputs

- Page-level Manuscript
- Character definitions
- Emotion Plan
- Scene Plan
- Craft Plan
- Story Blueprint

## 4. Outputs

- Dialogue
- Combined narration/dialogue manuscript

## 5. Resources Used

- Character data
- Emotion data
- Dialogue rules
- Craft Plan
- Reading-level rules

## 6. Responsibilities

- Write natural child-appropriate dialogue.
- Preserve character voice.
- Express emotion through dialogue where appropriate.
- Avoid unnecessary dialogue.
- Maintain scene objectives.
- Support page turns.
- Preserve planned story information.

## 7. Workflow

```text
Read Page Manuscript
        ↓
Identify Dialogue Opportunities
        ↓
Read Character + Emotion Data
        ↓
Write / Refine Dialogue
        ↓
Check Character Voice
        ↓
Check Reading Level
        ↓
Integrate with Narration
        ↓
Validate
```

## 8. Rules

DW-001 Dialogue must serve a narrative or emotional purpose.

DW-002 Dialogue must match character identity.

DW-003 Do not use dialogue to explain information already obvious from the illustration or action.

DW-004 Avoid adult-sounding dialogue.

DW-005 Do not change story decisions.

DW-006 Preserve emotional intent.

DW-007 Keep dialogue concise and read-aloud friendly.

## 9. Validation

- Character voice consistent.
- Dialogue advances or deepens story.
- Reading level appropriate.
- Emotional purpose preserved.
- No unnecessary exposition.
- No contradiction with narration.

## 10. Failure Handling

Attempt local dialogue revision.

If the issue requires changing a story decision, return it to the appropriate upstream component.

## 11. Deliverables

- Dialogue layer
- Combined page manuscript

## 12. Dependencies

- Page-level Manuscript
- Character data
- Emotion Plan
- Scene Plan
- Craft Plan

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Narration Writer
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "page": 2,
  "characters": [
    {
      "id": "CHAR_001"
    }
  ]
}
```

## 15. Example Output

```json
{
  "page": 2,
  "dialogue": [
    {
      "character": "CHAR_001",
      "text": "..."
    }
  ]
}
```
