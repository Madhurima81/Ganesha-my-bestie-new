# Phase 8C — Narration Writer

Version: 1.0
Status: LOCKED

## 1. Purpose

The Narration Writer shapes the narrative voice of the page-level manuscript.

It ensures that narration is natural, vivid, concise and appropriate for read-aloud picture-book storytelling.

## 2. Position in Engine

Page-level Manuscript
        ↓
Narration Writer
        ↓
Narration Layer
        ↓
Dialogue Writer

## 3. Inputs

- Page-level Manuscript
- Page Plan
- Target Age
- Reading Level
- Craft Plan
- Emotion Plan

## 4. Outputs

- Narration text
- Narration rhythm
- Read-aloud structure

## 5. Resources Used

- Reading-level guidance
- Language guidance
- Read-aloud devices
- Craft Plan
- Emotion Plan

## 6. Responsibilities

- Create clear narration.
- Maintain child-friendly vocabulary.
- Control sentence length.
- Create rhythm.
- Support emotional moments.
- Support page turns.
- Preserve meaning.
- Preserve planned story events.

## 7. Workflow

```text
Read Page Text
        ↓
Identify Narration
        ↓
Apply Narrative Voice
        ↓
Adjust Rhythm
        ↓
Check Reading Level
        ↓
Check Craft Requirements
        ↓
Validate
```

## 8. Rules

NW-001 Do not change story events.

NW-002 Do not change character decisions.

NW-003 Preserve emotional meaning.

NW-004 Use age-appropriate language.

NW-005 Avoid unnecessary exposition.

NW-006 Prefer concrete, vivid language.

NW-007 Preserve planned read-aloud devices.

NW-008 Do not make narration more sophisticated than the target audience requires.

## 9. Validation

- Meaning preserved.
- Reading level appropriate.
- Narration clear.
- Rhythm supports read-aloud.
- Emotional intent preserved.
- Craft requirements preserved.

## 10. Failure Handling

Attempt local language revision.

If the problem requires a story decision change, return it rather than changing the decision.

## 11. Deliverables

- Final narration layer

## 12. Dependencies

- Page-level Manuscript
- Reading-level rules
- Craft Plan
- Emotion Plan

## 13. Runtime Notes

- Stateful: No
- Expected execution order: Before Dialogue Writer
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "page": 1,
  "text": "..."
}
```

## 15. Example Output

```json
{
  "page": 1,
  "narration": "..."
}
```
