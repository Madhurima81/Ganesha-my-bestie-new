# Phase 6B — Planner Rules

Version: 2.0
Status: LOCKED

## 1. Purpose

Planner Rules define the governance constraints that every resolver in the 6A.01–6A.18 chain must obey.

6B is a governance layer, not a resolver. It does not itself make planning decisions and does not itself evaluate the complete Planner Context — it defines the rule categories that 6A.01–6A.17 must follow while deciding, and that 6A.18 evaluates once all decisions are made.

```text
6B Planner Rules
│
├── Resolver Rules
│   └── Govern individual decisions made by 6A.01–6A.17
│
├── Consistency Rules
│   └── Govern cross-resolver relationships across the Planner Context
│
└── Integrity Rules
    └── Enforced by 6A.18 Planner Validator against the complete Planner Context
```

## 2. Position in Engine

6B is not a pipeline step — it is consulted throughout the chain, not run once at a fixed point.

```text
6A.01–6A.17
    (each resolver consults Resolver Rules + Consistency Rules while deciding)
        ↓
6A.18 Planner Validator
    (evaluates Integrity Rules across the full Planner Context)
        ↓
6C Story Blueprint
```

## 3. Inputs

- Story Request
- Planner decisions produced by individual 6A.0X resolvers
- plannerKnowledge.json
- Ontology relationships
- Library constraints

## 4. Outputs

- Rule Set (Resolver / Consistency / Integrity categories)
- Rule evaluation results, consumed by the resolver or validator invoking them
- Rule violations

## 5. Resources Used

- plannerKnowledge.json
- ontology/*.json
- library metadata

Planner Rules must not become a second content library, and must not duplicate resolver logic.

## 6. Responsibilities

6B defines three governance categories:

### Resolver Rules — govern 6A.01–6A.17

Applied by each individual resolver while making its own decision. Cover:

- Required fields for that resolver's decision
- Allowed ID sources (approved index only, never invented)
- That resolver's specific dependency on upstream decisions
- Locking conditions once a resolver's decision is stored

### Consistency Rules — govern cross-resolver relationships

Applied wherever one resolver's output must remain compatible with another's, independent of any single resolver's own logic. Cover:

- Need ↔ Belief Shift compatibility
- Character ↔ Need/Belief compatibility
- Mission ↔ Character/Archetype compatibility
- World ↔ Mission/Actions compatibility
- Obstacle ↔ Mission/World compatibility
- Conflict ↔ Obstacle/Mission compatibility
- Logic ↔ Conflict/Actions compatibility
- Structure ↔ Logic/Conflict compatibility
- Beat Plan ↔ Structure compatibility
- Opening/Ending ↔ Beat Plan compatibility
- Symbol/Craft ↔ story components they support

### Integrity Rules — enforced by 6A.18 Planner Validator

Applied once, after all 17 resolvers have run, against the complete Planner Context. Cover:

- Completeness (every required decision exists)
- Referential integrity (every ID resolves)
- No orphan references
- No unresolved blocking dependency remains
- Protagonist agency preserved
- Blueprint readiness

6B defines what these rules check. 6A.18 is the module that actually runs them against the full context — see `6A/6A.18_PlannerValidator.md` for the execution spec.

## 7. Workflow

```text
Resolver Rules + Consistency Rules
        ↓
consulted continuously by 6A.01–6A.17
as each resolver makes its decision
        ↓
Integrity Rules
        ↓
evaluated once by 6A.18
against the complete Planner Context
        ↓
PASS / FAIL per rule
```

## 8. Rules

### Resolver Rules

PR-001 Only valid ontology/library IDs may be selected by any resolver.

PR-002 Required planning fields for a resolver's decision cannot be silently omitted.

PR-003 Unresolved mappings cannot be converted into guessed IDs.

PR-004 A dependency must exist before a dependent decision is resolved.

PR-005 A decision cannot reference an orphan ID.

PR-006 No resolver may create new knowledge records.

PR-007 No resolver may write prose.

### Consistency Rules

PR-101 A decision must remain compatible with every upstream decision it depends on, as defined in the corresponding resolver's own compatibility rules.

PR-102 No resolver may silently modify a decision made by an earlier resolver to force compatibility.

PR-103 Where two decisions are cross-referenced (e.g. Mission ↔ Character, Structure ↔ Logic), both directions of the relationship must hold.

PR-104 Cross-resolver conflicts must be surfaced to 6A.18 rather than resolved silently mid-chain.

### Integrity Rules

PR-201 Every required planner decision must exist in the complete Planner Context.

PR-202 Every failed rule must identify the affected decision and the responsible resolver.

PR-203 Locked Blueprint values cannot be modified without explicit regeneration.

PR-204 No unresolved blocking dependency may remain in the complete Planner Context.

## 9. Validation

Resolver Rules and Consistency Rules are validated continuously, by the resolver invoking them, as each of 6A.01–6A.17 runs.

Integrity Rules are validated once, by 6A.18, against the assembled Planner Context.

6B itself validates only that the rule categories are internally well-formed (no contradictory rules, no rule assigned to the wrong category) — not that any specific story request satisfies them.

## 10. Failure Handling

When a rule fails, regardless of category:

- Return rule ID.
- Return category (Resolver / Consistency / Integrity).
- Return severity.
- Identify affected field.
- Identify responsible resolver.
- Do not silently repair the value.

Resolver Rule and Consistency Rule failures are handled by the resolver that detected them. Integrity Rule failures are handled by 6A.18 per its own failure-handling process.

## 11. Deliverables

- Planner Rule Set, organized into Resolver / Consistency / Integrity categories
- Rule Evaluation Results (attributed to the resolver or validator that ran them)
- Rule Violation Report

## 12. Dependencies

Knowledge

- ontology/*.json
- libraries/*.json
- plannerKnowledge.json

Engine

- 6A.01–6A.17 (consult Resolver Rules + Consistency Rules)
- 6A.18 Planner Validator (enforces Integrity Rules)
- 6C Story Blueprint (consumes the validated result; performs no rule evaluation itself)

## 13. Runtime Notes

- Stateful: No
- Expected execution order: Continuously during 6A.01–6A.17; finally by 6A.18
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "category": "Consistency",
  "field": "mission",
  "value": "MISSION_RESCUE",
  "context": {
    "coreNeed": "NEED_COURAGE",
    "character": "CHAR_ANU"
  }
}
```

## 15. Example Output

```json
{
  "status": "PASS",
  "ruleResults": [
    {
      "ruleId": "PR-101",
      "category": "Consistency",
      "status": "PASS"
    }
  ]
}
```
