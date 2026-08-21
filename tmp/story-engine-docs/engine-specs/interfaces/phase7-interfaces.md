# Engine Interfaces — Phase 7 (Story Director)

Version: 1.0
Status: Implementation Contract

## Purpose

Signature contract for Phase 7 modules. Derived from `docs/engine-specs/phase7/`. Consult those specs for full rules and failure handling.

```
engine/storyDirector/
  storyComposer.ts      — 7B
  sceneDirector.ts       — 7C
  pageDirector.ts         — 7D
  emotionDirector.ts       — 7E
  symbolDirector.ts         — 7F
  craftDirector.ts           — 7G
  directorValidator.ts        — 7H
```

7A Story Director is the orchestrator (analogous to 6A) — sequences 7B→7H, resolves nothing itself.

## Shared Types

```typescript
interface StoryBlueprintRef { id: string } // schemas/storyBlueprint.schema.json

interface StoryFlow {
  sequence: { id: string; purpose: string; beats?: string[] }[];
  centralDramaticQuestion: string;
  resolution: string;
}

interface Scene {
  id: string;
  purpose: string;
  beats: string[];
  characterFocus?: string;
  missionProgress?: string;
  conflictProgression?: string;
  emotionalFunction?: string;
  symbolFunction?: string;
}

interface Page {
  page: number;
  objective: string;
  beats?: string[];
  sceneIds?: string[];
  wordBudget?: { target: number; minimum?: number; maximum?: number };
  pageTurnGoal: string;
  emotionalPurpose?: string;
  visualPurpose?: string;
  symbolPurpose?: string;
}

interface EmotionEntry {
  id: string;
  sceneId?: string;
  page?: number;
  function: string;
  startingState?: string;
  endingState?: string;
  intensity?: number; // 0–1
  transition?: string;
}

interface SymbolEntry {
  symbolId: string;
  function: string;
  introduction?: string;
  development?: string;
  payoff?: string;
  sceneIds?: string[];
}

interface CraftEntry {
  techniqueId: string;
  purpose: string;
  sceneIds?: string[];
  beatIds?: string[];
  pageTurnUse?: string;
}

interface ValidationResult {
  status: "PASS" | "FAIL";
  blockingFailures: number;
  warnings: number;
  rulesPassed?: number;
}
```

## 7A Story Director (orchestrator) — `storyDirector.ts`

```typescript
function runStoryDirector(blueprint: StoryBlueprintRef): StoryDirectorResult;

interface StoryDirectorResult {
  storyPlan: StoryPlanDraft; // assembled from 7B–7G outputs
  validation: ValidationResult; // from 7H
  status: "STORY_PLAN_READY" | "FAILED";
}
```

## 7B Story Composer — `storyComposer.ts`

```typescript
function composeStoryFlow(blueprint: StoryBlueprintRef): StoryComposerResult;

interface StoryComposerResult {
  storyFlow: StoryFlow;
  status: "COMPOSED" | "COMPOSITION_FAILED";
}
```

## 7C Scene Director — `sceneDirector.ts`

```typescript
function directScenes(storyFlow: StoryFlow, blueprint: StoryBlueprintRef): SceneDirectorResult;

interface SceneDirectorResult {
  scenePlan: Scene[];
  status: "RESOLVED" | "SCENE_UNRESOLVED";
}
```

## 7D Page Director — `pageDirector.ts`

```typescript
function directPages(
  storyFlow: StoryFlow,
  scenePlan: Scene[],
  blueprint: StoryBlueprintRef,
  pageConstraints: { min: number; max: number }
): PageDirectorResult;

interface PageDirectorResult {
  pagePlan: Page[];
  status: "RESOLVED" | "PAGINATION_CONFLICT";
}
```

**Critical**: `pagePlan` here is pagination *guidance*, consumed later by 8B — it does not instruct 8A to write page-by-page (see traceability matrix, "Important Pagination Boundary").

## 7E Emotional Director — `emotionDirector.ts`

```typescript
function directEmotion(
  storyFlow: StoryFlow,
  scenePlan: Scene[],
  pagePlan: Page[],
  blueprint: StoryBlueprintRef
): EmotionDirectorResult;

interface EmotionDirectorResult {
  emotionPlan: EmotionEntry[];
  status: "RESOLVED" | "EMOTION_UNRESOLVED";
}
```

## 7F Symbol Director — `symbolDirector.ts`

```typescript
function directSymbols(
  scenePlan: Scene[],
  pagePlan: Page[],
  emotionPlan: EmotionEntry[],
  blueprint: StoryBlueprintRef
): SymbolDirectorResult;

interface SymbolDirectorResult {
  symbolPlan: SymbolEntry[];
  status: "RESOLVED" | "SYMBOL_UNRESOLVED"; // symbols optional — empty plan is valid
}
```

## 7G Craft Director — `craftDirector.ts`

```typescript
function directCraft(
  scenePlan: Scene[],
  pagePlan: Page[],
  emotionPlan: EmotionEntry[],
  symbolPlan: SymbolEntry[],
  blueprint: StoryBlueprintRef
): CraftDirectorResult;

interface CraftDirectorResult {
  craftPlan: CraftEntry[];
  status: "RESOLVED" | "CRAFT_UNRESOLVED";
}
```

## 7H Director Validation — `directorValidator.ts`

```typescript
function validateStoryPlan(draft: StoryPlanDraft): ValidationResult;

interface StoryPlanDraft {
  storyFlow: StoryFlow;
  scenePlan: Scene[];
  pagePlan: Page[];
  emotionPlan: EmotionEntry[];
  symbolPlan: SymbolEntry[];
  craftPlan: CraftEntry[];
}
```

On PASS, the draft is assembled into `schemas/storyPlan.schema.json` shape with `status: "VALIDATED"` and handed to Phase 8.
