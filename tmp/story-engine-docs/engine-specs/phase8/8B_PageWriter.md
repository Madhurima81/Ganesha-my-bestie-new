# Phase 8B — Page Writer

Version: 1.0
Status: LOCKED

## 1. Purpose

The Page Writer divides the COMPLETE STORY MASTER into the final page-level manuscript.

This is an intelligent narrative pagination process, not mechanical text splitting.

The complete story already exists before pagination begins.

Page division must preserve the story while optimizing:

- pacing
- page turns
- emotional rhythm
- illustration space
- readability
- narrative continuity

## 2. Position in Engine

COMPLETE STORY MASTER
        ↓
8B Page Writer
        ↓
PAGE MANUSCRIPT
        ↓
8C Narration Writer
        ↓
8D Dialogue Writer

## 3. Inputs

- COMPLETE STORY MASTER
- LOCKED Story Plan
- Page Plan
- Scene Plan
- Emotion Plan
- Symbol Plan
- Craft Plan
- Target page range
- Illustration requirements
- Reading level

## 4. Outputs

- Page Manuscript
- Page-to-story mapping
- Page-turn structure
- Page-level word counts

## 5. Resources Used

- Page Plan
- Scene Plan
- Emotion Plan
- Symbol Plan
- Craft Plan
- Illustration requirements
- Reading-level guidance

## 6. Responsibilities

The Page Writer determines where the complete story should naturally divide into pages.

For each page it must consider:

- Narrative beat
- Scene boundary
- Emotional beat
- Page-turn opportunity
- Illustration opportunity
- Visual breathing room
- Text density
- Reading rhythm
- Continuity with adjacent pages

It may adjust page boundaries and distribute text intelligently.

It must never alter the underlying story simply to satisfy pagination.

## 7. Workflow

```text
Load COMPLETE STORY MASTER
        ↓
Load Page Plan
        ↓
Identify narrative beats
        ↓
Identify natural scene / beat boundaries
        ↓
Identify emotional peaks
        ↓
Identify page-turn opportunities
        ↓
Identify illustration requirements
        ↓
Map story sections to pages
        ↓
Balance text across pages
        ↓
Check continuity
        ↓
Check word-density targets
        ↓
Validate
        ↓
Output PAGE MANUSCRIPT
```

## 8. Rules

PW-001 The COMPLETE STORY MASTER is the source narrative.

PW-002 Do not rewrite the story merely to make pagination easier.

PW-003 Do not mechanically split by equal word counts.

PW-004 Do not split at arbitrary sentence or paragraph boundaries when a stronger narrative boundary exists.

PW-005 Preserve important emotional beats.

PW-006 Preserve important reveals.

PW-007 Protect climax and resolution from poor page breaks.

PW-008 Use page turns intentionally.

PW-009 Consider illustration space when selecting page boundaries.

PW-010 Word budgets are targets, not absolute limits.

PW-011 Page count is a presentation constraint, not a reason to damage the story.

PW-012 If the requested page range conflicts with story quality, report the conflict.

PW-013 Do not add or remove major story events.

PW-014 Do not change the story's ending.

PW-015 Every page must contribute meaningfully to the reading experience.

## 9. Validation

Validate:

- Complete story is fully represented.
- No story content is accidentally lost.
- No story content is duplicated unintentionally.
- Story order is preserved.
- Scene order is preserved.
- Emotional progression is preserved.
- Climax receives appropriate page treatment.
- Resolution receives appropriate page treatment.
- Page turns are intentional.
- Text density is appropriate.
- Illustration space is protected.
- Page count falls within requested constraints where possible.
- Any unavoidable deviation is explicitly reported.

## 10. Failure Handling

If pagination cannot satisfy all constraints:

1. Attempt alternative page boundaries.
2. Attempt redistribution across neighbouring pages.
3. Preserve narrative integrity.
4. Preserve emotional pacing.
5. Preserve illustration requirements.
6. If still impossible, return a PAGINATION_CONFLICT.

The Page Writer must never silently rewrite the Complete Story Master.

## 11. Deliverables

- Page Manuscript
- Page-to-Story Mapping
- Page-turn Map
- Pagination Report

## 12. Dependencies

Inputs

- Complete Story Master
- LOCKED Story Plan
- Page Plan
- Emotion Plan
- Symbol Plan
- Craft Plan

Next Module

- 8C Narration Writer

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Complete Story generation
- Idempotent: Yes
- Cacheable: Yes
- Source of truth: Complete Story Master

## 14. Example Input

```json
{
  "completeStoryMaster": {
    "storyText": "..."
  },
  "pagePlan": [
    {
      "page": 1,
      "objective": "Introduce the problem",
      "wordBudget": {
        "target": 55
      }
    },
    {
      "page": 2,
      "objective": "Escalate the problem",
      "wordBudget": {
        "target": 60
      }
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
      "storyText": "...",
      "sourceSections": [
        "SCENE_001"
      ],
      "pageTurnObjective": "CURIOSITY"
    },
    {
      "page": 2,
      "storyText": "...",
      "sourceSections": [
        "SCENE_002"
      ],
      "pageTurnObjective": "ANTICIPATION"
    }
  ],
  "paginationStatus": "VALID"
}
```
