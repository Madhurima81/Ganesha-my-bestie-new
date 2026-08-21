# Phase 7B — Story Composer

Version: 1.0
Status: LOCKED

## 1. Purpose

The Story Composer converts the Story Blueprint into the story's causal narrative spine.

It determines what happens, why it happens, and how events progress toward the climax and resolution.

## 2. Position in Engine

Story Blueprint
        ↓
Story Composer
        ↓
Story Flow
        ↓
Scene Director

## 3. Inputs

- LOCKED Story Blueprint
- Story Structure
- Mission
- Obstacle
- Logic
- Character
- Need
- Belief
- Escalation
- Opening
- Ending
- Beats

## 4. Outputs

- Story Flow
- Narrative Spine
- Causal Chain
- Major Turning Points

## 5. Resources Used

- storyStructures.json
- beats.json
- missions.json
- obstacles.json
- escalations.json
- logic data
- beliefs.json
- coreNeeds.json

## 6. Responsibilities

- Establish starting state.
- Establish the problem.
- Establish the mission.
- Build attempts.
- Escalate difficulty.
- Establish turning point.
- Establish climax.
- Establish resolution.
- Connect external action to internal transformation.

## 7. Workflow

```text
Read Blueprint
    ↓
Establish Starting State
    ↓
Introduce Problem
    ↓
Establish Mission
    ↓
Build Attempts
    ↓
Escalate
    ↓
Turning Point
    ↓
Climax
    ↓
Resolution
    ↓
Output Story Flow
```

## 8. Rules

SC-001 Protagonist drives the story.

SC-002 Events must have causal relationships.

SC-003 Mission must progress.

SC-004 Obstacles must create meaningful difficulty.

SC-005 Escalation must increase meaningful stakes or difficulty.

SC-006 Internal transformation must emerge from events.

SC-007 Resolution must connect to the Core Need and Belief.

SC-008 Do not write final prose.

## 9. Validation

- Beginning exists.
- Problem exists.
- Mission exists.
- Attempts exist.
- Escalation exists.
- Turning point exists.
- Climax exists.
- Resolution exists.
- Causal chain is continuous.
- Internal transformation is represented.

## 10. Failure Handling

Return the failed rule and affected story-flow element.

Do not invent a replacement.

Regenerate only the affected flow component.

## 11. Deliverables

- Story Flow
- Narrative Spine
- Causal Chain
- Turning Point Map

## 12. Dependencies

- Story Blueprint
- storyStructures.json
- beats.json
- missions.json
- obstacles.json
- escalations.json
- logic data

## 13. Runtime Notes

- Stateful: No
- Expected execution order: First narrative director
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "mission": "MISSION_RESCUE",
  "obstacle": "OBSTACLE_PHYSICAL",
  "coreNeed": "NEED_PATIENCE"
}
```

## 15. Example Output

```json
{
  "storyFlow": {
    "opening": {},
    "problem": {},
    "attempts": [],
    "escalation": [],
    "turningPoint": {},
    "climax": {},
    "resolution": {}
  }
}
```
