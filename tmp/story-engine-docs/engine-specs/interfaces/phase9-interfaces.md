# Engine Interfaces — Phase 9 (Book Production)

Version: 1.0
Status: Implementation Contract

## Purpose

Signature contract for Phase 9 modules. Derived from `docs/engine-specs/phase9/`. Note the illustration-generation step itself (turning Prompt Pack into actual image assets) sits *between* 9B and 9C and is a replaceable external tool/service — not part of the Story Engine's own module chain.

```
engine/production/
  illustrationDirector.ts   — 9A
  promptBuilder.ts            — 9B
  [illustration generation — external, not an engine module]
  layoutEngine.ts               — 9C
  productionQA.ts                 — 9D
  exportEngine.ts                   — 9E
```

## Shared Types

```typescript
interface FinalStoryRef { id: string } // Phase 8 LOCKED Final Story
interface Reference { id: string }

interface ValidationResult {
  status: "PASS" | "FAIL";
  blockingFailures: number;
  warnings: number;
}
```

## 9A Illustration Director — `illustrationDirector.ts`

```typescript
function directIllustrations(finalStory: FinalStoryRef): IllustrationDirectorResult;

interface IllustrationDirectorResult {
  illustrationPlan: IllustrationPlan;   // schemas/illustrationPlan.schema.json
  illustrationBible: IllustrationBible; // schemas/illustrationBible.schema.json
}
```

**Contract**: produces both artifacts together. `illustrationPlan.illustrationBibleReference` and `illustrationBible.illustrationPlanReference` must be set to each other's IDs at assembly time — this is the cross-reference the developer must populate explicitly (JSON Schema cannot enforce it; see traceability matrix "Referential Integrity Rules").

## 9B Illustration Prompt Builder — `promptBuilder.ts`

```typescript
function buildPromptPack(
  illustrationPlan: IllustrationPlan,
  illustrationBible: IllustrationBible
): PromptPackResult;

interface PromptPackResult {
  promptPack: PromptPack; // schemas/promptPack.schema.json
}
```

**Contract**: never invents story content (IPB-001). Output feeds an external illustration-generation pipeline — not specified here, since the architecture deliberately keeps that pipeline swappable.

## [External] Illustration Generation

Not an engine module. Takes `promptPack` as input, produces generated image assets with resolved `assetId`s. The developer's implementation must define this integration point, but it is out of scope for the Story Engine's own contracts — see `LOCKED_ARCHITECTURE.md`.

## 9C Book Layout Engine — `layoutEngine.ts`

```typescript
function buildLayout(
  finalStory: FinalStoryRef,
  illustrationAssets: { assetId: string; location: string }[],
  illustrationPlan: IllustrationPlan
): LayoutResult;

interface LayoutResult {
  layout: Layout; // schemas/layout.schema.json — includes finalStoryReference + illustrationAssetReferences
  status: "VALID" | "LAYOUT_CONFLICT";
}
```

**Contract**: never changes story text (BL-001). `layout.finalStoryReference.id` must equal `finalStory.id`; `layout.illustrationAssetReferences[].id` must each resolve to a real generated asset.

## 9D Production QA — `productionQA.ts`

```typescript
function runProductionQA(
  finalStory: FinalStoryRef,
  illustrationAssets: { assetId: string }[],
  layout: Layout
): ProductionQAResult;

interface ProductionQAResult {
  validation: ValidationResult;
  status: "PRODUCTION_READY" | "PRODUCTION_QA_FAILED";
}
```

## 9E Export Engine — `exportEngine.ts`

```typescript
function exportStoryPackage(
  productionReadyBook: {
    finalStory: FinalStoryRef;
    layout: Layout;
    illustrationAssets: { assetId: string; location: string }[];
  },
  sourceReferences: {
    storyBlueprintReference: Reference;
    storyPlanReference: Reference;
    finalStoryReference: Reference;
    illustrationPlanReference: Reference;
    illustrationBibleReference: Reference;
    promptPackReference: Reference;
    layoutReference: Reference;
  },
  exportProfile: "PRINT" | "DIGITAL" | "FLIPBOOK" | "APP"
): ExportResult;

interface ExportResult {
  storyPackage: StoryPackage; // schemas/storyPackage.schema.json
  status: "SUCCESS" | "FAILED";
}
```

**Contract**: `sourceReferences` must be fully populated — all 7 fields required by `storyPackage.schema.json`. Never re-derives content already present upstream (no manuscript duplication — see fixtures `storyPackage.invalid-duplicated-manuscript-content.json` for the violation this guards against). Never modifies locked story, illustration, or layout content (EE-002–EE-004).
