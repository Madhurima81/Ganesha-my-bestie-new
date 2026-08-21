# Developer Task – Create Engine Specifications (Reference Brief)

## Objective

Create the complete technical specification documentation for the Story Engine.

These documents are the implementation contracts for every engine module.

They are documentation only and must not contain executable code.

Do not redesign the architecture. Use the locked Phase 6–9 architecture exactly as provided.

---

## Output Folder

```
/docs/engine-specs/
  phase6/
  phase7/
  phase8/
  phase9/
```

---

## Files to Create

### Phase 6
- README.md
- 6A_PlannerEngine.md
- 6B_PlannerRules.md
- 6C_StoryBlueprint.md
- 6D_PlannerValidation.md

### Phase 7
- README.md
- 7A_StoryDirector.md
- 7B_StoryComposer.md
- 7C_SceneDirector.md
- 7D_PageDirector.md
- 7E_EmotionalDirector.md
- 7F_SymbolDirector.md
- 7G_CraftDirector.md
- 7H_DirectorValidation.md

### Phase 8
- README.md
- 8A_StoryWriter.md
- 8B_PageWriter.md
- 8C_NarrationWriter.md
- 8D_DialogueWriter.md
- 8E_LanguagePolish.md
- 8F_StoryQA.md

### Phase 9
- README.md
- 9A_IllustrationDirector.md
- 9B_IllustrationPromptBuilder.md
- 9C_BookLayoutEngine.md
- 9D_ProductionQA.md
- 9E_ExportEngine.md

---

## Every Module MUST Follow This Template

Every specification document must contain exactly these sections in this order. No additional sections unless justified.

1. Purpose
2. Position in Engine
3. Inputs
4. Outputs
5. Resources Used
6. Responsibilities
7. Workflow
8. Rules
9. Validation
10. Failure Handling
11. Deliverables
12. Dependencies
13. Runtime Notes
14. Example Input
15. Example Output

---

## Documentation Rules

Every document should answer:

- What does this module do?
- What information does it receive?
- What information does it produce?
- Which libraries can it read?
- Which modules may call it?
- Which module receives its output?
- What rules must it follow?
- What validation does it perform?
- What happens if validation fails?

The documentation must be implementation-oriented.

---

## Do NOT Include

- TypeScript
- Python
- JavaScript
- API code
- Database code
- SQL
- JSON Schema
- UI code

This phase is documentation only.

---

## Workflow Diagrams

Every module should include a simple execution diagram.

Example:

```
Read Input
   ↓
Resolve Data
   ↓
Validate
   ↓
Generate Output
   ↓
Return
```

---

## Inputs and Outputs

Every input and output must clearly reference the engine artifact.

Example:

**Input:** StoryBlueprint
**Output:** StoryPlan

Not: `JSON`

---

## Validation

Every module must document:

- Required fields
- Validation rules
- Failure conditions
- Recovery strategy

---

## Dependencies

Each document must explicitly list:

**Libraries** — e.g. missions.json, symbols.json, worlds.json

**Engine Outputs** — e.g. Story Blueprint, Story Plan, Emotion Plan

---

## Runtime Notes

Every module should specify:

- Stateless or Stateful
- Expected execution order
- Idempotent (Yes/No)
- Cacheable (Yes/No)

---

## Example Sections

Provide concise example inputs and outputs using simplified JSON. The examples are illustrative only.

---

## README.md for Each Phase

Each phase folder should contain a README with:

- Phase purpose
- Module sequence
- Inputs
- Outputs
- Overall workflow diagram
- Deliverables

---

## Success Criteria

The documentation is complete when:

- Every module from Phase 6–9 has a specification.
- All specifications follow the same template.
- Inputs and outputs align with the locked architecture.
- Dependencies are explicit.
- Validation and failure handling are documented.
- The documents are sufficient for a developer to implement the engine without referring back to the architecture discussions.

---

## One Additional Instruction

At the end of the documentation pass, generate an **Engine Traceability Matrix** (`/docs/engine-specs/traceability-matrix.md`).

This should list every module (6A–9E) with:

| Module | Input Artifact | Output Artifact | Depends On | Next Module |
|---|---|---|---|---|

This single document lets developers understand the entire engine flow at a glance and ensures there are no missing or circular dependencies before implementation begins.
