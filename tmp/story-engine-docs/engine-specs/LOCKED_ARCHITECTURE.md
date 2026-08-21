# Final Implementation Architecture (Locked)

## 1. Knowledge Layer (JSON)

Source of truth. Editable data.

```
knowledge/
  ontology/
    *.json
  libraries/
    *.json
  plannerKnowledge.json
```

Examples: coreNeeds.json, beliefs.json, missions.json, symbols.json, beats.json, storyStructures.json, worlds.json, ...

---

## 2. Engine Specification (Markdown)

For developers. Not runtime files — implementation documentation, like an API specification.

```
docs/
  engine-specs/
    phase6/
      README.md
      6A_PlannerEngine.md
      6B_PlannerRules.md
      6C_StoryBlueprint.md
      6D_PlannerValidation.md
    phase7/
      ...
    phase8/
      ...
    phase9/
      ...
```

---

## 3. JSON Schemas

Define every object exchanged between modules. Contracts — validate the JSON.

```
schemas/
  storyBlueprint.schema.json
  storyPlan.schema.json
  scenePlan.schema.json
  pagePlan.schema.json
  emotionPlan.schema.json
  symbolPlan.schema.json
  craftPlan.schema.json
  illustrationPlan.schema.json
  illustrationBible.schema.json
  promptPack.schema.json
  layout.schema.json
  storyPackage.schema.json
```

---

## 4. Engine Code

```
engine/
  planner/
    plannerEngine.ts
    needResolver.ts
    beliefResolver.ts
    characterResolver.ts
    missionResolver.ts
    plannerValidator.ts

  storyDirector/
    storyComposer.ts
    sceneDirector.ts
    pageDirector.ts
    emotionDirector.ts
    symbolDirector.ts
    craftDirector.ts
    directorValidator.ts

  storyWriter/
    storyWriter.ts
    pageWriter.ts
    narrationWriter.ts
    dialogueWriter.ts
    languagePolish.ts
    storyQA.ts

  production/
    illustrationDirector.ts
    promptBuilder.ts
    layoutEngine.ts
    productionQA.ts
    exportEngine.ts
```

---

## 5. Runtime Outputs

Generated every time the engine runs. Never edited manually.

```
outputs/
  storyBlueprint.json
  storyPlan.json
  illustrationPlan.json
  illustrationBible.json
  promptPack.json
  layout.json
  storyPackage.json
```

---

## Final Repository

```
knowledge/
  ontology/
  libraries/
  plannerKnowledge.json

docs/
  engine-specs/
    phase6/
    phase7/
    phase8/
    phase9/

schemas/
  *.schema.json

engine/
  planner/
  storyDirector/
  storyWriter/
  production/

outputs/
  storyBlueprint.json
  storyPlan.json
  illustrationPlan.json
  illustrationBible.json
  promptPack.json
  layout.json
  storyPackage.json

tests/

ui/
```

---

## Build Order

1. Create all Knowledge JSONs. — Done
2. Create plannerKnowledge.json. — Done
3. Write the Engine Specifications (docs/engine-specs). — Next
4. Generate all JSON Schemas from the specifications.
5. Implement the engine modules.
6. Implement validation.
7. Build the UI.

---

## Why Both .md and .schema.json?

| File | Purpose | Read by |
|---|---|---|
| 6A_PlannerEngine.md | Explains what the module does (purpose, workflow, rules, examples, failure handling) | Humans (developers, architects) |
| storyBlueprint.schema.json | Defines what the output JSON must look like | Code, validators, IDEs |

Not duplicates. One is documentation, the other is an executable contract.

This architecture cleanly separates: Knowledge (JSON libraries), Documentation (Markdown specs), Contracts (JSON Schemas), Implementation (TypeScript), Runtime artifacts (generated JSON outputs).
