# Phase 8A — Story Writer

Version: 1.0
Status: LOCKED

## 1. Purpose

The Story Writer generates the COMPLETE STORY from the LOCKED Story Plan.

This is the primary creative writing stage.

The complete story must be coherent as a whole before any page division occurs.

The Story Writer does not divide the story into pages.

The Page Plan does not constrain the generation of the Complete Story Master. It is consumed by 8B during intelligent pagination.

## 2. Position in Engine

LOCKED Story Plan
        ↓
8A Story Writer
        ↓
COMPLETE STORY MASTER
        ↓
8B Page Writer
        ↓
Page Manuscript

## 3. Inputs

- LOCKED Story Plan
- Story Blueprint
- Story Flow
- Scene Plan
- Emotion Plan
- Symbol Plan
- Craft Plan
- Target age
- Reading level
- Writing constraints

## 4. Outputs

- Complete Story Master
- Complete narrative from beginning to ending
- Scene-level narrative
- Character arcs
- Emotional progression
- Story continuity record

The Complete Story Master is not page-divided.

## 5. Resources Used

- Story Plan
- Story Blueprint
- Reading-level guidance
- Language guidance
- Approved storytelling guidance
- Craft Plan
- Emotion Plan
- Symbol Plan

The Writer must not use the knowledge libraries to invent new story decisions.

## 6. Responsibilities

The Story Writer must:

- Generate the complete story as one coherent narrative.
- Follow the Story Flow.
- Preserve the Mission.
- Preserve the Obstacle.
- Preserve the Core Need.
- Express the Belief transformation.
- Preserve character agency.
- Execute the emotional arc.
- Integrate planned symbols naturally.
- Apply the planned craft strategy.
- Create a satisfying climax.
- Create a satisfying resolution.
- Maintain age-appropriate language.
- Make the story work independently as a complete narrative.

## 7. Workflow

```text
Load LOCKED Story Plan
        ↓
Read Story Flow
        ↓
Read Scene Plan
        ↓
Read Emotion Plan
        ↓
Read Symbol Plan
        ↓
Read Craft Plan
        ↓
Generate Complete Story
        ↓
Check Beginning → Middle → Climax → Resolution
        ↓
Check Character Transformation
        ↓
Check Emotional Continuity
        ↓
Check Story Coherence
        ↓
Output COMPLETE STORY MASTER
```

## 8. Rules

SW-001 Generate the complete story before page division.

SW-002 The complete story must function independently as a whole.

SW-003 Do not write to an arbitrary page boundary.

SW-004 Do not artificially shorten or expand the story to hit a page count.

SW-005 Preserve all locked Story Plan decisions.

SW-006 Protagonist must retain meaningful agency.

SW-007 The story must have causal progression.

SW-008 Emotional transformation must emerge from events.

SW-009 Symbol use must follow the Symbol Plan.

SW-010 Craft must follow the Craft Plan.

SW-011 The climax must be earned.

SW-012 The ending must resolve the central story and emotional movement.

SW-013 Do not introduce major unplanned story decisions.

SW-014 Story quality takes priority over target word count.

## 9. Validation

Before passing the Complete Story Master to 8B, validate:

- Beginning is complete.
- Problem is established.
- Mission is clear.
- Escalation occurs.
- Turning point exists.
- Climax is present.
- Resolution is present.
- Character transformation is coherent.
- Core Need is meaningfully addressed.
- Belief transformation is earned.
- Emotional arc is coherent.
- Symbol journey is represented.
- Craft strategy is realized.
- Story is complete and readable as a whole.
- Target-age language is appropriate.

## 10. Failure Handling

If the complete story fails:

1. Identify the affected Story Plan element.
2. Identify the affected narrative section.
3. Regenerate the relevant portion of the Complete Story Master.
4. Revalidate the complete story.

If the problem is caused by the Story Plan itself, return the issue to Phase 7.

Do not solve a planning defect by silently changing the story architecture.

## 11. Deliverables

- completeStoryMaster
- Story continuity record
- Story-level validation result

## 12. Dependencies

Inputs

- LOCKED Story Plan
- LOCKED Story Blueprint

Next Module

- 8B Page Writer

## 13. Runtime Notes

- Stateful: No
- Expected execution order: First writing stage
- Idempotent: Yes
- Cacheable: Yes
- Page division: No

## 14. Example Input

```json
{
  "storyPlan": {
    "storyFlow": {},
    "scenePlan": [],
    "emotionPlan": [],
    "symbolPlan": [],
    "craftPlan": []
  }
}
```

## 15. Example Output

```json
{
  "completeStoryMaster": {
    "title": "...",
    "storyText": "...",
    "scenes": [
      {
        "sceneId": "SCENE_001",
        "text": "..."
      }
    ]
  },
  "status": "COMPLETE_STORY_READY"
}
```
