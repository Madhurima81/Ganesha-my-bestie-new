# data-extensibility.md — Controlled Library Extensibility Contract

## Purpose

This contract defines how the story-engine data layer can grow **without requiring engine-code changes** for every new valid content record.

The goal is controlled extensibility:

- strict required core fields
- controlled optional extension fields
- generated indexes
- resolver discovery through `plannerKnowledge`
- no manual index maintenance
- no silent schema drift

This contract is intentionally narrow. It does **not** loosen the existing Phase 6A contracts, and it does **not** make arbitrary JSON additions valid by default.

---

## Locked Model

```text
Library JSON
   ↓
Index Builder
   ↓
plannerKnowledge
   ↓
Resolver
```

Resolvers consume generated indexes, not raw library files directly.

Therefore:

- adding a valid new record to a source library must flow through the index builder
- `plannerKnowledge` must be regenerated after source-library changes
- resolvers must discover new valid records through the regenerated index
- manual edits to `plannerKnowledge` are forbidden

---

## Core Rules

### 1. Required core stays strict

Every library must define:

- required fields
- optional fields
- ID convention
- compatibility fields
- validation rules
- index generation rules

A record missing required core fields is invalid and must fail validation.

### 2. Optional extension fields are controlled

New fields may be added only as:

- documented optional fields for that library, or
- documented extension fields under an agreed extension namespace

Undocumented free-form fields are not automatically valid.

### 3. Do not use fake flexibility

Do **not** solve extensibility by making everything `additionalProperties: true`.

That approach is explicitly rejected because it:

- weakens validation
- hides schema drift
- makes indexes unpredictable
- forces resolver logic to guess field meaning

The correct model is:

- strict required core
- controlled optional extension fields

### 4. Indexes are generated, never hand-maintained

`plannerKnowledge` is a derived build artifact.

Rules:

- never hand-edit `plannerKnowledge.json`
- never patch individual index records manually
- every index entry must be reproducible from source libraries plus documented audited mapping artifacts
- rebuild must be deterministic

### 5. New valid records should flow without engine-code changes

If a developer adds a new valid record using the existing contract, the expected path is:

```text
new valid record
    ↓
index builder
    ↓
plannerKnowledge updated
    ↓
resolver discovers record
    ↓
schema-valid output still produced
```

If engine code must change just to accept one more ordinary record of an already-supported type, that is a contract failure.

---

## Shared Record Conventions

These conventions apply to every ontology or library file unless that file's own contract explicitly narrows them further.

### ID convention

Every record must use a stable primary key with a documented family format.

Examples:

- `SIT001`
- `CHAR010`
- `STRUCT007`
- `B_ESC_01`
- `OPEN005`
- `END002`
- `GAN_SYM_BIG_BELLY`
- `MISSION_DISCOVER`

Rules:

- IDs are authoritative
- IDs must be unique within their library family
- IDs must never be inferred from display names at runtime
- changing an ID is a breaking change

### `hard` vs `soft_suggested`

`hard` fields are identity/contract fields.

Rules:

- `hard` fields may drive resolver eligibility or integrity validation
- missing required `hard` fields invalidate the record
- `hard` fields must not be replaced by soft affinity logic

`soft_suggested` fields are compatibility or ranking hints.

Rules:

- they may influence candidate ranking
- they must not silently override hard identity rules
- absence of a soft field is not itself a structural failure unless that library contract requires it

### `_meta.confidence`

If a record carries `_meta.confidence`, the allowed values are:

- `audited`
- `heuristic`
- `inherited`
- `unmapped`

Rules:

- preserve source confidence through index generation
- do not upgrade confidence silently in resolver code
- if confidence is transformed during generation, that transformation must be documented and reproducible

### Compatibility fields

Compatibility fields must be explicitly documented per library.

Rules:

- resolvers may only use real documented compatibility fields
- context-only relationships must not be upgraded into hidden compatibility contracts
- if the engine needs a new compatibility bridge, it must be added as a documented contract or audited mapping artifact

---

## Per-Library Contract Requirements

Every source library contract must define the following sections.

### Required fields

Must specify:

- field names
- field types
- whether the field is top-level, under `hard`, or under `soft_suggested`
- whether the field is required for every record

### Optional fields

Must specify:

- allowed optional fields
- type expectations
- whether the field affects indexing
- whether the field is ignored by current resolvers

### ID convention

Must specify:

- exact ID family or key format
- uniqueness boundary
- whether the source key is numeric, string, or compound

### Compatibility fields

Must specify:

- which fields are valid compatibility bridges
- which fields are context-only
- whether each compatibility field is hard-filtering or score-only

### Validation rules

Must specify:

- required-field validation
- ID/reference validation
- enum or ontology validation
- duplicate handling
- null handling
- stale-reference behavior

### Index generation and rebuild rules

Must specify:

- source files used
- generated fields added during indexing
- reverse lookups created
- rebuild triggers
- stale-index detection behavior

### New-field behavior

Must specify what happens when a new field appears.

Allowed outcomes:

- `ignored until documented`
- `accepted as optional extension field`
- `rejected as invalid`

The default is **not** automatic acceptance.

---

## Major Library Families

The following families must be governed by this contract.

### Ontology families

- core needs
- beliefs
- character roles
- character traits
- life domains
- mission types
- story actions
- logic families
- world types
- world attributes
- world functions
- obstacle domains
- obstacle types
- obstacle functions
- symbol themes
- story taxonomy families

### Concrete library families

- situations
- characters
- adventure archetypes
- adventure triggers
- missions
- settings
- worlds
- obstacles
- story conflicts
- story structures
- beats
- openings
- endings
- Ganesha symbols
- escalations

### Derived audited artifacts

These are source-governed inputs to indexing even if they are not raw content libraries:

- `missionId -> missionTypeId` mapping
- craft definition artifacts for `CR-*`

They must follow the same extensibility discipline:

- documented shape
- auditable provenance
- deterministic rebuild participation

---

## Index Builder Contract

The index builder is the only approved path from source libraries to `plannerKnowledge`.

### Required behavior

The builder must:

- validate source records against required core fields
- validate documented references
- preserve real source IDs
- preserve `hard` vs `soft_suggested`
- preserve `_meta.confidence` where present
- generate only documented derived fields
- fail loudly on invalid source shape

### Forbidden behavior

The builder must not:

- invent undocumented compatibility links
- guess semantics from display text when a documented mapping is required
- silently coerce broken records into valid records
- manually special-case one content record without documenting the rule

### Rebuild triggers

Rebuild `plannerKnowledge` whenever:

- a source library changes
- an ontology file changes
- an audited mapping artifact changes
- a documented generated-field rule changes

---

## Resolver Expectations

Resolvers must assume:

- source evolution happens through regenerated indexes
- new valid records may appear without code changes
- only documented fields are safe to consume

Resolvers must not assume:

- a fixed record count
- a hardcoded shortlist of valid IDs
- a manually curated index entry list

If a resolver depends on a fixed closed set, that dependency must be explicit in the contract.

---

## Extensibility Test

Add one implementation-level extensibility test covering the chain:

```text
new valid data -> index -> resolver -> schema
```

### Test requirement

For each major library family, the developer adds one new valid test record and verifies:

1. source record validates
2. index builder accepts it
3. corresponding `plannerKnowledge` index updates
4. resolver can discover or consume the new record where applicable
5. final emitted schema remains valid
6. no engine-code changes are required

### What this test proves

It proves that the engine is data-extensible within the locked contract.

It does **not** prove that arbitrary undocumented fields are allowed.

### Failure meaning

If a valid new record requires resolver code edits just to be seen, classify that as:

- index-generation defect, or
- resolver hardcoding defect, or
- missing contract coverage

not as a reason to weaken validation globally.

---

## When a New Field Is Added

When a developer wants to add a new field to a library:

1. decide whether it is `hard`, `soft_suggested`, `_meta`, or optional extension metadata
2. document it in the library contract
3. decide whether the index builder preserves it, transforms it, or ignores it
4. define whether any resolver may consume it
5. add or update validation rules
6. rebuild indexes
7. rerun extensibility tests

If those steps are skipped, the field is not part of the engine contract yet.

---

## Frozen Decision

This extensibility model is now locked as:

- strict required core
- controlled optional extension fields
- generated indexes only
- resolvers consume indexes
- no manual `plannerKnowledge` maintenance
- no fake flexibility via permissive schemas

This contract exists to let the engine grow safely before Phase 7 implementation, without turning the data layer into an ungoverned JSON dump.
