# T18 Validation Handoff

Date: 2026-08-12
Owner: Dev A
Status: prepared, not run

## Scope

Prepare the validation loop for the upcoming `T18` realization handoff without running the verdict yet.

This handoff is blocked until Dev B explicitly reports:

- T18 implementation complete
- 5-case pilot complete

## Do Now

- Ensure the `139/139` production-readiness regression command is ready.
- Ensure the selector/reachability + frozen-template regression command is ready.
- Ensure the cross-story verbatim-reuse measurement is ready.
- Ensure before/after metrics are named for:
  - generic fallback usage
  - sentence reuse
  - situation grounding
  - mechanism visibility
- Ensure the 5-case blind-read checklist is ready.

## Do Not Yet

- Do not run the T18 quality verdict.
- Do not declare T18 PASS/FAIL.
- Do not modify T18 prose/code.
- Do not modify selector, taxonomy, QA thresholds, or frozen templates.

## Prepared Commands

Run these only after Dev B reports completion:

```bash
node public/prana-story-generator/phase8-tools/runT18ValidationHandoff.js --execute
```

Underlying commands:

```bash
node public/prana-story-generator/phase8-tools/runSelectorReachabilityRegression.js
node public/prana-story-generator/phase8-tools/runFullCorpusProductionReadiness.js
node public/prana-story-generator/phase8-tools/runCorpusQualityAudit.js
node public/prana-story-generator/phase8-tools/buildBlindEditorialReviewPack.js
```

## T18 Coverage Ready

- Curated T18 situations from `storyTemplates.json`: `SIT008`, `SIT101`, `SIT108`, `SIT112`
- 5-case pilot set from the current T18 branch contract: `SIT008`, `SIT086`, `SIT101`, `SIT108`, `SIT112`

Note:
`SIT086` is in the pilot contract and is useful for blind-read coverage, but the earlier selector curation notes document it as intentionally owned by `T23` for natural-selector exclusivity. That means pilot-read coverage and natural-selector ownership should be treated as separate checks during final validation.

## Before/After Metrics

Use these baselines and measurement paths in the final pass:

- Generic fallback usage
  - Baseline source: [REALIZATION_QUALITY_GAP_REPORT_2026-08-12.md](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/docs/prana-kids/REALIZATION_QUALITY_GAP_REPORT_2026-08-12.md)
  - Baseline: `103/139` stories (`74%`) still shared the generic fallback sentence set at the time of that report.
- Sentence reuse
  - Baseline source: same report
  - Baseline: six identical sentences repeated across `103/139` stories.
- Situation grounding
  - Automated measure: `runCorpusQualityAudit.js` criterion `C1`
  - Human measure: blind-read rubric field `Situation recognizability`
- Mechanism visibility
  - Automated measure: `runCorpusQualityAudit.js` criterion `C6`
  - Human measure: blind-read rubric field `Template mechanic invisibility`

## Blind-Read Checklist

For the 5 pilot stories, review each case blind and score:

- Child appeal
- Natural/story-like writing
- Situation recognizability
- Emotional authenticity
- Character agency
- Supporting-character usefulness
- Template mechanic invisibility
- Belief/insight earned rather than preached
- Ending satisfaction
- Overall enjoyment for ages 5-12

Flag any of:

- database-generated feel
- preachy / lesson-first
- repetitive phrasing
- adult-written rather than child-facing
- emotionally flat
- structure feels obvious / template-visible
- supporting cast collapses or feels token
- weak noun/object specificity

## Expected Outputs Once Run Later

- `tmp_selector_reachability_report.md`
- `tmp_full_corpus_production_readiness.md`
- `tmp_full_corpus_production_readiness.json`
- `tmp_story_quality_report.md`
- `tmp_editorial_review_pack.md`
- `tmp_editorial_review_answer_key.md`
- `tmp_editorial_review_summary.md`
- `tmp/t18-validation/prep-manifest.json`

## Final Dev A Decision Rule

After Dev B reports completion, run the prepared loop, inspect the automated outputs plus the 5-case blind-read results, and only then report the T18 validation result.
