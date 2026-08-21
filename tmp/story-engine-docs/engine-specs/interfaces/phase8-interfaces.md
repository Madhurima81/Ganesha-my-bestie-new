# Engine Interfaces — Phase 8 (Story Writer)

Version: 1.0
Status: Implementation Contract

## Purpose

Signature contract for Phase 8 modules. Derived from `docs/engine-specs/phase8/`. Architecture locked as **complete story first, then paginate** (Doc 4) — 8A never writes to a page boundary; 8B performs intelligent pagination against an already-complete narrative.

```
engine/storyWriter/
  storyWriter.ts       — 8A
  pageWriter.ts          — 8B
  narrationWriter.ts       — 8C
  dialogueWriter.ts          — 8D
  languagePolish.ts            — 8E
  storyQA.ts                     — 8F
```

## Shared Types

```typescript
interface StoryPlanRef { id: string } // schemas/storyPlan.schema.json

interface CompleteStoryMaster {
  title: string;
  storyText: string; // the full, undivided narrative
  scenes: { sceneId: string; text: string }[];
  status: "COMPLETE_STORY_READY" | "GENERATION_FAILED";
}

interface PageManuscriptEntry {
  page: number;
  storyText: string;
  sourceSections: string[]; // scene IDs this page's text was drawn from
  pageTurnObjective: string;
}

interface ValidationResult {
  status: "PASS" | "FAIL";
  blockingFailures: number;
  warnings: number;
  rulesPassed?: number;
}
```

## 8A Story Writer — `storyWriter.ts`

```typescript
function writeCompleteStory(storyPlan: StoryPlanRef): StoryWriterResult;

interface StoryWriterResult {
  completeStoryMaster: CompleteStoryMaster;
}
```

**Contract**: does not divide into pages. Does not consult `pagePlan.wordBudget` as a per-page instruction — writes the whole coherent narrative first. See `8A_StoryWriter.md` §1 boundary note.

## 8B Page Writer — `pageWriter.ts`

```typescript
function paginateStory(
  completeStoryMaster: CompleteStoryMaster,
  pagePlan: Page[] // from storyPlan, used as pagination guidance only
): PageWriterResult;

interface PageWriterResult {
  pages: PageManuscriptEntry[];
  paginationStatus: "VALID" | "PAGINATION_CONFLICT";
}
```

**Contract**: source of truth is `completeStoryMaster.storyText`, not `pagePlan`. Never rewrites the underlying story to fit pagination (PW-002). On conflict, returns `PAGINATION_CONFLICT` rather than silently damaging story content.

## 8C Narration Writer — `narrationWriter.ts`

```typescript
function writeNarration(page: PageManuscriptEntry, readingLevel: string, targetAge: string): NarrationWriterResult;

interface NarrationWriterResult {
  page: number;
  narration: string;
}
```

## 8D Dialogue Writer — `dialogueWriter.ts`

```typescript
function writeDialogue(
  page: PageManuscriptEntry,
  characters: { id: string }[]
): DialogueWriterResult;

interface DialogueWriterResult {
  page: number;
  dialogue: { character: string; text: string }[];
}
```

## 8E Language Polish — `languagePolish.ts`

```typescript
function polishManuscript(pages: { page: number; text: string }[]): LanguagePolishResult;

interface LanguagePolishResult {
  pages: { page: number; text: string }[];
  status: "POLISHED";
}
```

**Contract**: never changes story events, character decisions, or the ending (LP-001–LP-003). If polishing would require a story-level change, flags for 8F rather than making the change.

## 8F Story QA — `storyQA.ts`

```typescript
function runStoryQA(
  storyPlan: StoryPlanRef,
  polishedManuscript: { pages: { page: number; text: string }[] }
): StoryQAResult;

interface StoryQAResult {
  storyQAReport: ValidationResult;
  status: "LOCKED_FINAL_STORY" | "QA_FAILED";
}
```

On PASS, output is assembled as the LOCKED Final Story — the artifact `layout.finalStoryReference` (Phase 9) points to. This is the last module in Phase 8; there is no separate "assembler" analogous to 6C.
