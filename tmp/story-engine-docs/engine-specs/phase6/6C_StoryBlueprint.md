# Phase 6C — Story Blueprint

Version: 2.0
Status: LOCKED

## 1. Purpose

The Story Blueprint is the canonical structured output of Phase 6.

It records the foundational decisions from which Phase 7 will construct the Story Plan.

It contains planning data only.

It does not contain final story prose.

It does not perform validation itself — validation was already completed by 6A.18 Planner Validator before the Planner Context reaches this stage. 6C's job is assembly and storage, not gatekeeping.

## 2. Position in Engine

Planner Engine (6A.01–6A.18)
    ↓
6C Story Blueprint
    ↓
Phase 7 Story Director

## 3. Inputs

- Validated Planner Context (output of 6A.18 Planner Validator, status PASS)
- Planner Validation Report
- Knowledge-layer versions

## 4. Outputs

- storyBlueprint.json

Because 6C only receives Planner Context that has already passed 6A.18, the output is assembled directly in `LOCKED` state. There is no separate pending/validation state at this stage.

## 5. Resources Used

The Blueprint records references to:

- ontology IDs
- library IDs
- plannerKnowledge version

It does not duplicate entire library records.

## 6. Responsibilities

The Story Blueprint stores:

### Metadata

- Story ID
- Version
- Target age
- Language
- Requested page range
- Knowledge versions

### Core Decisions

- Situation
- Core Need
- Belief Shift (False Belief / True Belief)
- Character
- Adventure Archetype
- Mission
- Story Actions
- World
- Obstacle
- Story Conflict
- Logic
- Story Structure
- Beat Plan
- Opening
- Ending
- Symbols
- Craft

### Trace

For each major decision:

- Selected ID
- Resolver (the specific 6A.0X module that produced it)
- Source
- Reason
- Confidence where applicable

### Validation

- Status (carried from 6A.18's Planner Validation Report)
- Rule results
- Warnings
- Errors

## 7. Workflow

```text
Receive Validated Planner Context from 6A.18
        ↓
Collect Resolver Decisions
        ↓
Normalize Blueprint Structure
        ↓
Attach Trace
        ↓
Attach Knowledge Versions
        ↓
Attach Validation Report from 6A.18
        ↓
Assemble as LOCKED
        ↓
Hand off to Phase 7
```

## 8. Rules

SB-001 Blueprint contains IDs and structured planning data, not prose.

SB-002 Every required decision must be explicitly represented.

SB-003 Every decision must be traceable to its originating 6A.0X resolver.

SB-004 References must point to valid knowledge records.

SB-005 6C must not accept a Planner Context that has not passed 6A.18. If it receives one, it must reject rather than assemble.

SB-006 Locked Blueprint values are immutable.

SB-007 Knowledge versions must be recorded.

SB-008 No duplicated library content unless explicitly required by schema.

SB-009 6C performs no independent validation logic — it assembles and stores only.

## 9. Validation

6C performs only structural assembly checks:

- Required sections are present in the incoming Planner Context.
- Required fields are present.
- Valid IDs (already validated by 6A.18, checked here only for assembly integrity).
- Traceability data is present for every decision.
- Knowledge versions are recorded.
- The incoming Planner Context's validation status is PASS.

Substantive validation (compatibility, causal coherence, referential integrity) was already performed by 6A.18. 6C does not repeat it.

## 10. Failure Handling

If the incoming Planner Context did not pass 6A.18, or a required field is missing during assembly:

- Reject assembly.
- Identify the affected field.
- Identify the responsible 6A.0X resolver.
- Return to Phase 6A rather than attempting to assemble a partial Blueprint.
- Do not fabricate a value.

## 11. Deliverables

- storyBlueprint.json (LOCKED)
- Blueprint version metadata
- Trace data

## 12. Dependencies

Inputs

- 6A Planner Engine (specifically the validated output of 6A.18)
- 6B Planner Rules
- Knowledge Layer

Downstream

- Phase 7 Story Director

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After 6A.18 passes
- Idempotent: Yes
- Cacheable: Yes
- Immutable after assembly: Yes

## 14. Example Input

```json
{
  "plannerContext": {
    "need": { "id": "NEED_PATIENCE" },
    "belief": { "falseBelief": "...", "trueBelief": "..." },
    "mission": { "id": "MISSION_RESCUE" }
  },
  "validation": {
    "status": "PASS"
  }
}
```

## 15. Example Output

```json
{
  "status": "LOCKED",
  "metadata": {
    "storyId": "STORY_001",
    "version": "1.0"
  },
  "decisions": {
    "coreNeed": "NEED_PATIENCE",
    "belief": {
      "falseBelief": "...",
      "trueBelief": "..."
    },
    "mission": "MISSION_RESCUE"
  },
  "trace": {},
  "validation": {
    "status": "PASS"
  }
}
```
