# Engine Interfaces — Phase 6 (Planner)

Version: 1.0
Status: Implementation Contract

## Purpose

This document is the developer-facing signature contract for every Phase 6 module: what each function receives, what it returns, and which schema (if any) governs its output shape. It is derived from the locked engine specs in `docs/engine-specs/phase6/` — consult those for full rules, validation, and failure-handling logic. This document exists so the developer can implement against typed signatures without re-deriving them from prose.

Signatures use TypeScript-style notation matching the locked file structure:

```
engine/planner/
  plannerEngine.ts       — 6A orchestrator
  needResolver.ts         — 6A.02
  beliefResolver.ts        — 6A.03
  characterResolver.ts     — 6A.04
  ...
  plannerValidator.ts      — 6A.18
```

## Shared Types

```typescript
type ID = string; // an ontology/library ID, e.g. "NEED_CONFIDENCE"

interface ReferenceWithReason {
  id: ID;
  reason: string;
}

interface PlannerContext {
  request: StoryRequest;
  situation: { id: ID };
  need?: { id: ID; reason: string };
  belief?: { falseBelief: string; trueBelief: string; reason: string };
  character?: { role: ID; candidates: ID[]; selected: ID; reason: string };
  adventureArchetype?: ReferenceWithReason;
  mission?: ReferenceWithReason;
  storyActions?: { id: ID; purpose: string }[];
  world?: ReferenceWithReason;
  obstacle?: ReferenceWithReason;
  storyConflict?: { id: ID; type: string; reason: string };
  logic?: { id: ID; causalPattern: string[]; reason: string };
  storyStructure?: { id: ID; sequence: string[]; reason: string };
  beatPlan?: { id: ID; function: string }[];
  opening?: { strategy: string; function?: string; requirements?: string[] };
  ending?: { strategy: string; requirements?: string[] };
  symbolPlan?: { symbolId: ID; function: string; introduction?: string; development?: string; payoff?: string }[];
  craftPlan?: { techniqueId: ID; purpose: string }[];
}

interface StoryRequest {
  targetAge: string;
  lifeDomain?: string;
  language?: string;
  pageRange?: { min: number; max: number };
}

interface ValidationResult {
  status: "PASS" | "FAIL";
  blockingFailures: number;
  warnings: number;
  rulesPassed?: number;
  failedRules?: RuleFailure[];
}

interface RuleFailure {
  ruleId: string;
  category?: "Resolver" | "Consistency" | "Integrity";
  severity: "blocking" | "warning";
  affectedField: string;
  responsibleResolver: string;
  evidence?: string;
}
```

## 6A Planner Engine (orchestrator) — `plannerEngine.ts`

```typescript
function runPlannerEngine(request: StoryRequest): PlannerEngineResult;

interface PlannerEngineResult {
  plannerContext: PlannerContext;
  validation: ValidationResult;
  plannerStatus: "BLUEPRINT_READY" | "FAILED";
}
```

Orchestrates 6A.01→6A.18 in sequence. Does not itself resolve any decision. On failure from any sub-resolver, re-runs only that resolver (see spec §10) rather than restarting the chain.

## 6A.01 Planner Entry — `plannerEntry.ts`

```typescript
function resolvePlannerEntry(request: StoryRequest): PlannerEntryResult;

interface PlannerEntryResult {
  plannerContext: Pick<PlannerContext, "request" | "situation">;
  status: "INITIALIZED" | "REJECTED";
  rejectionReason?: string;
}
```

## 6A.02 Need Resolver — `needResolver.ts`

```typescript
function resolveNeed(context: PlannerContext): NeedResolverResult;

interface NeedResolverResult {
  need: { id: ID; reason: string } | null;
  status: "RESOLVED" | "NEED_UNRESOLVED";
}
```

## 6A.03 Belief Resolver — `beliefResolver.ts`

```typescript
function resolveBelief(context: PlannerContext): BeliefResolverResult;

interface BeliefResolverResult {
  belief: { falseBelief: string; trueBelief: string; reason: string } | null;
  status: "RESOLVED" | "BELIEF_UNRESOLVED";
}
```

No `beliefs.json` dependency — reads directly off the Situation, per the locked Phase 6 decision.

## 6A.04 Character Resolver — `characterResolver.ts`

```typescript
function resolveCharacter(context: PlannerContext): CharacterResolverResult;

interface CharacterResolverResult {
  character: { role: ID; candidates: ID[]; selected: ID; reason: string } | null;
  status: "RESOLVED" | "CHARACTER_UNRESOLVED";
}
```

Two-stage internally: Role → Candidates → Selected. Ganesha is never a valid `selected` value (CR-011).

## 6A.05 Adventure Archetype Resolver — `adventureArchetypeResolver.ts`

```typescript
function resolveAdventureArchetype(context: PlannerContext): ArchetypeResolverResult;

interface ArchetypeResolverResult {
  adventureArchetype: ReferenceWithReason | null;
  status: "RESOLVED" | "ARCHETYPE_UNRESOLVED";
}
```

## 6A.06 Mission Resolver — `missionResolver.ts`

```typescript
function resolveMission(context: PlannerContext): MissionResolverResult;

interface MissionResolverResult {
  mission: ReferenceWithReason | null;
  status: "RESOLVED" | "MISSION_UNRESOLVED";
}
```

## 6A.07 Story Action Resolver — `storyActionResolver.ts`

```typescript
function resolveStoryActions(context: PlannerContext): StoryActionResolverResult;

interface StoryActionResolverResult {
  storyActions: { id: ID; purpose: string }[];
  status: "RESOLVED" | "STORY_ACTION_UNRESOLVED";
}
```

## 6A.08 World Resolver — `worldResolver.ts`

```typescript
function resolveWorld(context: PlannerContext): WorldResolverResult;

interface WorldResolverResult {
  world: ReferenceWithReason | null;
  status: "RESOLVED" | "WORLD_UNRESOLVED";
}
```

## 6A.09 Obstacle Resolver — `obstacleResolver.ts`

```typescript
function resolveObstacle(context: PlannerContext): ObstacleResolverResult;

interface ObstacleResolverResult {
  obstacle: ReferenceWithReason | null;
  status: "RESOLVED" | "OBSTACLE_UNRESOLVED";
}
```

## 6A.10 Story Conflict Resolver — `storyConflictResolver.ts`

```typescript
function resolveStoryConflict(context: PlannerContext): StoryConflictResolverResult;

interface StoryConflictResolverResult {
  storyConflict: { id: ID; type: string; reason: string } | null;
  status: "RESOLVED" | "CONFLICT_UNRESOLVED";
}
```

## 6A.11 Logic Resolver — `logicResolver.ts`

```typescript
function resolveLogic(context: PlannerContext): LogicResolverResult;

interface LogicResolverResult {
  logic: { id: ID; causalPattern: string[]; reason: string } | null;
  status: "RESOLVED" | "LOGIC_UNRESOLVED";
}
```

## 6A.12 Story Structure Resolver — `storyStructureResolver.ts`

```typescript
function resolveStoryStructure(context: PlannerContext): StoryStructureResolverResult;

interface StoryStructureResolverResult {
  storyStructure: { id: ID; sequence: string[]; reason: string } | null;
  status: "RESOLVED" | "STRUCTURE_UNRESOLVED";
}
```

## 6A.13 Beat Resolver — `beatResolver.ts`

```typescript
function resolveBeats(context: PlannerContext): BeatResolverResult;

interface BeatResolverResult {
  beatPlan: { id: ID; function: string }[];
  status: "RESOLVED" | "BEAT_UNRESOLVED";
}
```

## 6A.14 Opening Resolver — `openingResolver.ts`

```typescript
function resolveOpening(context: PlannerContext): OpeningResolverResult;

interface OpeningResolverResult {
  opening: { strategy: string; function: string; reason: string } | null;
  status: "RESOLVED" | "OPENING_UNRESOLVED";
}
```

## 6A.15 Ending Resolver — `endingResolver.ts`

```typescript
function resolveEnding(context: PlannerContext): EndingResolverResult;

interface EndingResolverResult {
  ending: { strategy: string; requirements: string[] } | null;
  status: "RESOLVED" | "ENDING_UNRESOLVED";
}
```

## 6A.16 Symbol Resolver — `symbolResolver.ts`

```typescript
function resolveSymbols(context: PlannerContext): SymbolResolverResult;

interface SymbolResolverResult {
  symbolPlan: { symbolId: ID; function: string; introduction?: string; development?: string; payoff?: string }[];
  status: "RESOLVED" | "SYMBOL_UNRESOLVED"; // note: story may proceed with an empty symbolPlan — symbols are optional
}
```

## 6A.17 Craft Resolver — `craftResolver.ts`

```typescript
function resolveCraft(context: PlannerContext): CraftResolverResult;

interface CraftResolverResult {
  craftPlan: { techniqueId: ID; purpose: string }[];
  status: "RESOLVED" | "CRAFT_UNRESOLVED";
}
```

## 6A.18 Planner Validator — `plannerValidator.ts`

```typescript
function validatePlannerContext(context: PlannerContext): ValidationResult;
```

Runs Integrity Rules (PV-001–PV-020, see `6B_PlannerRules.md`) against the complete context. Blocking failures prevent handoff to 6C. This is the sole validation gate for Phase 6 — there is no separate 6D.

## 6C Story Blueprint — `storyBlueprint.ts`

```typescript
function assembleStoryBlueprint(
  context: PlannerContext,
  validation: ValidationResult
): StoryBlueprint; // shape defined by schemas/storyBlueprint.schema.json

// Throws / rejects if validation.status !== "PASS" — 6C performs no
// independent validation logic, only assembly (see 6C spec §9).
```

Output conforms to `schemas/storyBlueprint.schema.json`. Assembled directly as `status: "LOCKED"` since input already passed 6A.18.

## 6B Planner Rules — not a runtime module

6B has no corresponding `.ts` file with an invocable function. It is a rule-set consulted by 6A.01–6A.17 (Resolver Rules, Consistency Rules) and 6A.18 (Integrity Rules). Implement as a shared rules/constants module imported by the resolvers, not as a pipeline step.
