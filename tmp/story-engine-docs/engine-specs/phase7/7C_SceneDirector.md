# Phase 7C — Scene Director

Version: 1.0
Status: LOCKED

## 1. Purpose

The Scene Director transforms Story Flow into an ordered Scene Plan.

Every scene must have a clear narrative function.

## 2. Position in Engine

Story Flow
        ↓
Scene Director
        ↓
Scene Plan
        ↓
Page Director

## 3. Inputs

- Story Flow
- Story Blueprint
- Story Structure
- Beats
- Logic
- Mission
- Obstacle
- Character
- World

## 4. Outputs

- Scene Plan
- Scene purposes
- Scene objectives
- Scene transitions

## 5. Resources Used

- storyStructures.json
- beats.json
- missions.json
- obstacles.json
- worlds.json
- logic data
- storyActions.json

## 6. Responsibilities

For each scene define:

- Scene ID
- Narrative purpose
- Story objective
- Location
- Characters
- Story action
- Conflict
- Emotional purpose
- Symbol opportunities
- Entry condition
- Exit condition

## 7. Workflow

```text
Read Story Flow
    ↓
Identify narrative units
    ↓
Group into scenes
    ↓
Assign purpose
    ↓
Assign objective
    ↓
Assign conflict
    ↓
Check transitions
    ↓
Output Scene Plan
```

## 8. Rules

SCN-001 Every scene must have a purpose.

SCN-002 Every scene must advance the story.

SCN-003 No filler scenes.

SCN-004 Scene order must preserve causality.

SCN-005 Scene transitions must be motivated.

SCN-006 Do not write prose.

SCN-007 Do not invent unsupported IDs.

## 9. Validation

- Every Story Flow event is represented.
- Every scene has a purpose.
- Every scene has an objective.
- Every scene has valid references.
- No disconnected scenes.
- No duplicate scenes.

## 10. Failure Handling

Return affected scene IDs and failed rules.

Regenerate only affected scene mappings.

## 11. Deliverables

- Scene Plan
- Scene Transition Map

## 12. Dependencies

- Story Flow
- Story Blueprint
- Story Structure
- Beats
- Logic
- Mission
- Obstacle
- World

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After Story Composer
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "storyFlow": {
    "events": []
  }
}
```

## 15. Example Output

```json
{
  "scenePlan": [
    {
      "sceneId": "SCENE_001",
      "purpose": "Introduce the problem",
      "objective": "Hero discovers the challenge"
    }
  ]
}
```
