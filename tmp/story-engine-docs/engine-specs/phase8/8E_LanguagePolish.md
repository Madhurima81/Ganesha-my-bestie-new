# Phase 8E — Language Polish

Version: 1.0
Status: LOCKED

## 1. Purpose

Language Polish performs the final linguistic refinement of the manuscript.

It improves clarity, rhythm, warmth, grammar and read-aloud quality without changing the story.

## 2. Position in Engine

Combined Page Manuscript
        ↓
Language Polish
        ↓
Polished Manuscript
        ↓
Story QA

## 3. Inputs

- Combined Page Manuscript
- Story Plan
- Target Age
- Reading Level
- Language Rules
- Craft Plan

## 4. Outputs

- Polished Manuscript

## 5. Resources Used

- Reading-level guidance
- Grammar rules
- Vocabulary guidance
- Language rules
- Craft Plan

## 6. Responsibilities

- Correct grammar.
- Improve sentence rhythm.
- Remove awkward phrasing.
- Improve clarity.
- Improve read-aloud flow.
- Preserve child-friendly warmth.
- Remove unnecessary repetition.
- Preserve story meaning.

## 7. Workflow

```text
Read Combined Manuscript
        ↓
Check Grammar
        ↓
Check Clarity
        ↓
Check Rhythm
        ↓
Check Reading Level
        ↓
Check Repetition
        ↓
Check Craft
        ↓
Validate
```

## 8. Rules

LP-001 Never change story events.

LP-002 Never change character decisions.

LP-003 Never change the intended ending.

LP-004 Preserve emotional meaning.

LP-005 Preserve symbols.

LP-006 Preserve planned craft devices unless correcting an actual language error.

LP-007 Do not make the prose unnecessarily sophisticated.

LP-008 Prefer natural spoken language for read-aloud stories.

## 9. Validation

- Grammar correct.
- Meaning preserved.
- Reading level appropriate.
- Read-aloud rhythm works.
- No accidental story changes.
- No missing dialogue.
- No missing page content.

## 10. Failure Handling

If polishing would require a story-level change:

- Do not make the change.
- Flag it for Story QA.
- Return the affected page.

## 11. Deliverables

- Polished Manuscript

## 12. Dependencies

- Combined Page Manuscript
- Story Plan
- Reading-level rules
- Language rules
- Craft Plan

## 13. Runtime Notes

- Stateful: No
- Expected execution order: Final writing pass
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "pages": [
    {
      "page": 1,
      "text": "..."
    }
  ]
}
```

## 15. Example Output

```json
{
  "pages": [
    {
      "page": 1,
      "text": "..."
    }
  ],
  "status": "POLISHED"
}
```
