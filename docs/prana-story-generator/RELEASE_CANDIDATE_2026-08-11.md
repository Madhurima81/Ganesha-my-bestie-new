# Prana Story Generator — Template Pipeline Release Candidate

**Date:** 2026-08-11
**Status:** Production-readiness validated, frozen. Staging default: **ON**. Real production default: still requires the rollback step below before this is a live user-facing switch — see Rollback.

---

## What this release is

The T01–T23 template-driven story-generation pipeline (`buildStoryArtifactsWithEventPlanner`, natural `selectStoryTemplate`, no forced template) is now reachable end-to-end from the real "Generate My Story" UI flow, with a fixed selector bug, six curated realization families, and a full 156-situation regression suite backing it.

## Baseline: 139/139

Every situation that resolves a blueprint at all (139 of 156 active situations; the other 17 fail earlier at Phase 6/7 resolution, unrelated to this work) passes the complete 11-gate production tail: Complete story → Pagination → Narration → Dialogue → Polish → Story QA → Illustration plan → Prompt pack → Layout → Production QA → Export.

## Curated (`bestForSituations` populated) template families

| Template | Situations | Status |
|---|---|---|
| T16 | 7 | Frozen (realization) |
| T21 | 6 | Frozen (realization) |
| T22 | 6 | Frozen (realization) |
| T23 | 6 | Frozen (realization) |
| T08 | 5 | Locked |
| T18 | 4 | Locked (`SIT086` deliberately excluded — owned by T23) |

All other templates (T01–T07, T09–T15, T17, T19, T20) run the shared generic Phase-7 fallback — functional and passing gates, but not yet given dedicated per-mechanism realization. See `tmp_dev_a_infra_report.md` for the full coverage-gap diagnosis (dead logic families, combinatorial gaps, taxonomy gaps — none fixed by invented mappings, per standing instruction).

## What changed to get here (all in `phase6-app.js`)

1. **Selector bug fix**: `selectStoryTemplate` read `storyPlan.storyFlow.logic.id` (a field Phase 7 never sets — `logicFit` had been dead for every template, always); fixed to read the already-correct `blueprint.logic.id`.
2. **Specificity-score tie-break**: added as tier 6 (after situation/need/logic/beat/arc fit), so a rarer need+logic match outranks a more commonly-shared one before falling to alphabetical templateId order.
3. **Realization-seam grounding fixes** (gated per-template, not architecture changes): T08/T09/T11/T14 SETUP beats now reference `storySeed.immediateObstacle` via `concreteSceneFacts` — the shared generic fallback never surfaced this text at all, causing concrete-word-coverage QA failures. **T16 was explicitly excluded from this gate** (frozen, untouched).
4. **Pagination fix**: `splitTextIntoNaturalChunks` no longer hard-splits a sentence mid-word across exclusive pages when a shared page exists to absorb the deficit (fixes T21/SIT157, T22/SIT045 classes of bug); QA-007's closure check now treats a lowercase-starting last page as a continuation of the prior page rather than an independent page lacking its own closure verb (fixes T16/SIT062).
5. **Production integration**: `runUnchanged8BThroughPhase9` now computes `exportResult`/`exportValidation` (previously only the pre-template pipeline did — this was the blocker keeping the template pipeline from ever completing `summarizeArtifactReadiness`'s Export gate).
6. **Staging default flip**: `STAGING_DEFAULT_ON = true` — `isTemplatePipelineEnabled()` now defaults to the template pipeline unless overridden. See Rollback.

## Known, deliberately untouched gaps

- `NEED_JUSTICE`, `LOGIC_SAFETY_LOOP`, `NEED_SAFETY`/`CONTENTMENT`/`AUTONOMY` (partially absorbed by T08/T18) — real resolver outputs with no template owner. Content/mechanism-design decision, not a wiring bug.
- `LOGIC_CATALYST_VISIT`, `LOGIC_CIRCULAR_RETURN` — valid ontology entries, structurally always outscored by broader shared families in the character/archetype/conflict scoring model.
- `LOGIC_THRESHOLD_CROSSING` — ontology/domain mismatch (journey-themed archetypes vs. a domestic/school-themed situation library). Blocks T13, T19.
- T10 — genuine need+logic co-occurrence gap; no situation in the library currently pairs `NEED_SELF_REGULATION`/`CONFIDENCE` with `LOGIC_PERSPECTIVE_SHIFT`.
- SIT062/T16 spillover finding: curated templates can naturally receive non-curated situations via generic need/logic match (confirmed intentional, matches the selector's own priority-tier design; 22/23 observed spillover cases already succeeded before the pagination fix, 23/23 after).

Full diagnosis for all of the above: [`DEV_A_INFRA_REPORT_2026-08-11.md`](./DEV_A_INFRA_REPORT_2026-08-11.md), [`SELECTOR_AUDIT_REPORT_2026-08-11.md`](./SELECTOR_AUDIT_REPORT_2026-08-11.md).

## Regression suite (rerun after any future change)

```
node public/prana-story-generator/phase8-tools/runSelectorReachabilityRegression.js
node public/prana-story-generator/phase8-tools/runCorpusQualityAudit.js
node public/prana-story-generator/phase8-tools/runFullCorpusProductionReadiness.js
```

All three must be clean (reachability PASS, 0 FAIL, 139/139) before any further change to `phase6-app.js`, `phase8-data/storyTemplates.json`, or the situation library is considered safe to ship.

## Rollback

The pre-template pipeline (`buildStoryArtifacts`) is fully intact and unmodified — this release adds a new path, it does not remove the old one.

- **To disable the template pipeline for a single session**: append `?templatePipeline=0` to the URL.
- **To disable it as the default** (e.g. before a real production deploy, if this is meant to stay staging-only): in `phase6-app.js`, flip `const STAGING_DEFAULT_ON = true;` to `false`. One-line change, no other code path affected.
- **To fully revert this release**: `git revert` this commit (or the commit range) restores the pre-template selector/pagination/production-integration behavior; the old pipeline was never touched, so no data migration or cleanup is needed either direction.
