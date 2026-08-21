# Phase 6A - Planner Engine

Version: 2.1
Status: LOCKED

## 1. Purpose

The Planner Engine is the orchestration layer for Phase 6.

It sequences the 18 internal resolvers (6A.01-6A.18, specified individually in `phase6/6A/`) that together transform a Story Request into a validated Planner Context.

The Planner Engine itself does not resolve any individual decision (Need, Character, Mission, etc.) - each decision belongs to its own dedicated resolver. The Planner Engine's job is sequencing, context passing, and failure/blocker routing between them.

It does not write story prose.

## 2. Position in Engine

Story Request
    ↓
6A Planner Engine (orchestrator)
    ↓
6A.01 Planner Entry
    ↓
6A.02 Need Resolver
    ↓
6A.03 Belief Resolver
    ↓
6A.04 Character Resolver
    ↓
6A.05 Adventure Archetype Resolver
    ↓
6A.06 Mission Resolver
    ↓
6A.07 Story Action Resolver
    ↓
6A.08 World Resolver
    ↓
6A.09 Obstacle Resolver
    ↓
6A.10 Story Conflict Resolver
    ↓
6A.11 Logic Resolver
    ↓
6A.12 Story Structure Resolver
    ↓
6A.13 Beat Resolver
    ↓
6A.14 Opening Resolver
    ↓
6A.15 Ending Resolver
    ↓
6A.16 Symbol Resolver
    ↓
6A.17 Craft Resolver
    ↓
6A.18 Planner Validator
    ↓
PASS → 6C Story Blueprint
FAIL → Responsible Resolver
BLOCKED → Upstream data-coverage blocker / required source work

## 3. Inputs

- Story Request
- Planner Rules (6B)
- plannerKnowledge.json
- Relevant ontology/library indexes consumed by individual resolvers

## 4. Outputs

- Validated Planner Context (all 6A.01-6A.18 state combined)
- Planner Validation Report (produced by 6A.18)
- Planner status: `BLUEPRINT_READY` / not ready

## 5. Resources Used

The Planner Engine itself reads only Planner Rules and orchestration metadata.

Individual resolvers each read their own scoped plannerKnowledge index - see the corresponding 6A.0X spec for exact resources.

## 6. Responsibilities

- Initialize the Planner Context (delegates to 6A.01).
- Invoke each resolver (6A.02-6A.17) in sequence.
- Pass the Planner Context unchanged in structure between resolvers - each resolver only writes to its own state section.
- Invoke the Planner Validator (6A.18) once all resolvers complete.
- Route integrity failures to the correct resolver rather than restarting the whole chain.
- Surface known data-coverage blockers distinctly from ordinary resolver failures.
- Hand off the validated Planner Context to 6C Story Blueprint only on true PASS.

## 7. Workflow

```text
Read Story Request
    ↓
Run 6A.01 Planner Entry
    ↓
Run 6A.02 - 6A.17 in sequence
(each resolver reads Planner Context, writes only its own state)
    ↓
Run 6A.18 Planner Validator
    ↓
PASS -> hand off to 6C
FAIL -> route to responsible resolver, re-run only that resolver, re-validate
BLOCKED -> stop handoff, report upstream data-coverage blocker
```

## 8. Rules

PE-001 Never write story prose.

PE-002 Never invent ontology or library IDs - that responsibility belongs to individual resolvers, who must themselves never invent IDs.

PE-003 Use only currently valid knowledge-layer data.

PE-004 Do not skip a resolver in the 6A.01-6A.18 sequence.

PE-005 Do not let the orchestrator itself make a story decision - every decision belongs to its dedicated resolver.

PE-006 Preserve explicit user constraints from the Story Request throughout the chain.

PE-007 Every selected decision must remain traceable to its resolver.

PE-008 Do not silently replace a locked upstream resolver's decision.

PE-009 On integrity failure, re-run only the affected resolver - do not restart the full chain.

PE-010 The Planner Engine must not hand off to 6C before 6A.18 returns PASS.

PE-011 The Planner Engine must distinguish `FAIL` from `BLOCKED`. A known upstream data-coverage blocker is not a successful run and must not be coerced into PASS or ordinary resolver FAIL.

## 9. Validation

The orchestrator itself validates only sequencing integrity:

- All 18 resolvers were invoked in the correct order.
- No resolver was skipped.
- Planner Context sections were written by the correct resolver only.
- 6A.18 was run last.
- Handoff to 6C occurs only when 6A.18 returns PASS.
- BLOCKED status prevents handoff just as FAIL does, but is recorded separately.

Substantive validation (compatibility, referential integrity, causal coherence, blocker detection) is 6A.18's responsibility - see `6A.18_PlannerValidator.md`.

## 10. Failure Handling

If any resolver in the chain fails:

1. Identify the failed resolver.
2. Record the failure.
3. Do not invent a replacement value.
4. Do not proceed to subsequent resolvers until resolved, unless the resolver's own spec explicitly allows optional/deferred resolution.
5. Re-run only the affected resolver after correction.
6. Re-run 6A.18 validation after any resolver is regenerated.

If 6A.18 returns BLOCKED:

1. Identify the blocked contract.
2. Record the missing source coverage.
3. Stop handoff to 6C.
4. Report the blocker as upstream data work rather than pretending planner resolution can continue cleanly.

## 11. Deliverables

- Validated Planner Context
- Resolver execution log
- Handoff package for 6C when PASS

## 12. Dependencies

Knowledge

- ontology
- libraries
- plannerKnowledge.json

Internal Modules

- 6A.01-6A.18 (see `phase6/6A/`)

Downstream

- 6B Planner Rules (consumed throughout the chain)
- 6C Story Blueprint

## 13. Runtime Notes

- Stateful: No (Planner Context is passed explicitly, not held as engine state)
- Expected execution order: Sequential, 6A.01 -> 6A.18
- Idempotent: Yes, when inputs and knowledge versions are unchanged
- Cacheable: Yes
- Knowledge version must be recorded with the output

## 14. Example Input

```json
{
  "storyRequest": {
    "targetAge": "5-8",
    "lifeDomain": "LIFE_DOMAIN_SCHOOL",
    "coreNeed": "NEED_PATIENCE",
    "pageRange": {
      "min": 5,
      "max": 8
    }
  }
}
```

## 15. Example Output

```json
{
  "plannerContext": {
    "need": {},
    "belief": {},
    "character": {},
    "adventureArchetype": {},
    "mission": {},
    "storyActions": [],
    "world": {},
    "obstacle": {},
    "storyConflict": {},
    "logic": {},
    "storyStructure": {},
    "beatPlan": [],
    "opening": {},
    "ending": {},
    "symbolPlan": [],
    "craftPlan": []
  },
  "validation": {
    "status": "BLOCKED"
  },
  "plannerStatus": "NOT_BLUEPRINT_READY"
}
```
