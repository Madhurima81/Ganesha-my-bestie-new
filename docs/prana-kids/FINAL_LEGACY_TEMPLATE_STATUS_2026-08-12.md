# Final Legacy Template Status — 2026-08-12 (LOCKED)

## Scope

Read-only status pass over the legacy 23 templates (T01–T23). No realization code, selector, taxonomy, QA threshold, or template files were modified to produce this matrix.

Evidence sources (all fresh, generated same day, this session):

- `tmp_full_corpus_production_readiness.md` / `.json` — fresh natural-selector counts across all 156 active situations, full 139/139 production tail.
- `tmp_selector_reachability_report.md` — fresh reachability + Story QA regression for curated templates.
- `tmp_story_quality_report.md` — fresh per-story C1–C13 criteria run across curated cases spanning T03, T04, T05, T09, T14, T15, T16, T18, T19, T21, T22, T23.
- Prior same-day deep-dive audits in this session: root-cause tracing of `resolvePhase6()` for T06/T10/T17/T19/T20 zero-coverage cases (character → archetype → obstacle → conflict → logic-family chain).
- `docs/prana-kids/FINAL_TEMPLATE_STATUS_MATRIX_2026-08-12.md` — prior same-day T11 stability audit (retained as evidence, not re-run).

## Governing rule for this pass

**Known shared C13 verbatim-reuse debt does not, by itself, reopen a template.** Where the sole blocker for a template is the documented cross-story shared-pool sentence reuse (C13), that debt is recorded separately as **post-V2 hardening** — it is not treated as a reason to keep legacy realization work open. A template is only kept open (`ACTIVE/VALIDATION`) or flagged for real repair when it has an independent, non-C13 blocker.

**Final rule (binding after this pass): no legacy template receives new realization work following this status pass.** Any future content improvement belongs in V2 unless it is a critical production bug (a technical failure, not a content-quality gradient).

---

## Status categories

- `FROZEN / PASS` — technically stable + content gate passed.
- `LEGACY / ACCEPTED` — mechanism works; known low/medium content debt (C13 shared-pool reuse) is documented and intentionally not being repaired now.
- `ACTIVE / VALIDATION` — built but not yet independently signed off (no FAIL evidence, but no clean full-coverage sign-off either).
- `PARKED / NO NATURAL COVERAGE` — zero natural selector coverage, root cause not separately diagnosed this session.
- `UPSTREAM GAP` — zero (or effectively zero) natural coverage, and the root cause has been traced this session to a genuine ontology/mission-domain/situation-authoring gap, not a wiring bug.

---

## Final Status Matrix

| Template | Natural coverage (fresh, 156-corpus sweep) | Content evidence | Sole blocker (if any) | Status | Notes |
|---|---:|---|---|---|---|
| T01 | 0 | No natural stories to audit | — | `PARKED / NO NATURAL COVERAGE` | Not root-caused this session. |
| T02 | 4 | No dedicated content audit run | — | `ACTIVE / VALIDATION` | Generic fallback path; technically live in 139/139. |
| T03 | 20 | 5 curated cases: 4 FAIL, 1 WARNING — every FAIL is C13-only (all other C1–C12 PASS/WARNING) | C13 shared-pool reuse ("Tara tried again, a different way instead." across SIT005/020/049/101) | `LEGACY / ACCEPTED` | Mechanism (three-tries) confirmed visible and technically stable; only blocker is documented shared-pool debt. |
| T04 | 1 | 1 curated case: WARNING, no C13 | — | `ACTIVE / VALIDATION` | Sample size of 1; too thin to sign off either way. |
| T05 | 4 | 4/4 curated cases PASS, including C13 | none | `FROZEN / PASS` | Clean across full natural coverage. |
| T06 | 0 | No natural stories | Character tied to NEED_PATIENCE has no MISSION_DISCOVER; only DISCOVER/CELEBRATE archetypes carry LOGIC_CATALYST_VISIT | `UPSTREAM GAP` | Root-caused this session: mission-type domain gap, not a wiring bug. No single-entry ontology fix is defensible. |
| T07 | 0 | No natural stories | — | `PARKED / NO NATURAL COVERAGE` | Not root-caused this session. |
| T08 | 5 | No dedicated content audit run | — | `ACTIVE / VALIDATION` | Generic fallback path; passes curated reachability/regression. |
| T09 | 4 | 4/4 curated cases WARNING, no FAIL, no C13 hits | — | `ACTIVE / VALIDATION` | Content polish still open; no blocking evidence. |
| T10 | 0 | No natural stories | Zero mission-type overlap between NEED_SELF_REGULATION/NEED_CONFIDENCE characters and any LOGIC_PERSPECTIVE_SHIFT archetype | `UPSTREAM GAP` | Root-caused this session: hard-filtered before scoring, genuine domain gap. |
| T11 | 14 | Full 14/14 natural-case stability audit (same day, prior pass): all lock (resolve/complete/storyQA PASS, productionQA PRODUCTION_READY); fails only on C13 (2 sentences shared across SIT069/087/091/092/094/127) | C13 shared-pool reuse only | `LEGACY / ACCEPTED` | Previously graded FAIL under the old rule; reclassified under this session's governing rule since the only blocker is documented C13 debt and the mechanism is technically stable end-to-end. |
| T12 | 4 | No dedicated content audit run | — | `ACTIVE / VALIDATION` | Generic fallback path; passes today's 139/139. |
| T13 | 0 | No natural stories | — | `PARKED / NO NATURAL COVERAGE` | Not root-caused this session. |
| T14 | 16 | 5 curated cases: 3 PASS, 2 WARNING, no FAIL | — | `ACTIVE / VALIDATION` | No blocking evidence; not yet a clean full-coverage sign-off. |
| T15 | 15 | 7 curated cases: 6 PASS, 1 WARNING, no FAIL | — | `ACTIVE / VALIDATION` | Closest of the validation-pool templates to freeze, but not independently signed off across full natural coverage. |
| T16 | 18 | 7 curated cases: 4 FAIL (all C13-only), 2 WARNING, 1 PASS. Separately: a narrower plan-lint regression on SIT067 (missing `evidenceCited`/`contradictionMoment`/`reassessmentIsHeroOwned`) was reported same day by `runCompletePipelineRegressions.js`/`runGeneratedEventPlannerRegressions.js`, but SIT067 shows PASS in today's fresh story-quality run and is not in today's full-corpus failure list | C13 (primary); SIT067 plan-lint regression not independently reproduced this pass | `LEGACY / ACCEPTED` | C13-only FAILs reclassified per governing rule. The SIT067 plan-lint report is flagged as an **open item requiring a fresh targeted re-check**, not as grounds to reopen general T16 realization work — see Open Items below. |
| T17 | 0 | No natural stories | Reachable in principle (courage/curiosity character does reach MISSION_DISCOVER), but LOGIC_CATALYST_VISIT archetypes are structurally outscored 8-vs-5 by LOGIC_TRIAL_AND_ERROR archetypes every time | `UPSTREAM GAP` | Root-caused this session: scoring/weighting structural loss, not a hard filter — still no defensible single-entry fix without misdescribing an existing archetype. |
| T18 | 16 | 5 curated cases: 1 FAIL (C13-only, all other criteria PASS/WARNING), 4 WARNING | C13 shared-pool reuse only | `LEGACY / ACCEPTED` | Mechanism (escalate-then-pause) confirmed technically stable; only blocker is C13. |
| T19 | 0 (natural) / 2 (forced, needFit+logicFit match: SIT133, SIT137) | 2 forced-case run: both WARNING, no FAIL | — | `UPSTREAM GAP` | Root-caused this session: dedicated realization contract exists in code and 2 situations satisfy need+logic fit, but the natural selector never picks T19 over competing templates on the remaining scoring tiers. Zero *natural* coverage despite a live contract branch. |
| T20 | 0 | No natural stories | Zero mission-type overlap between NEED_COMPETENCE/NEED_CONFIDENCE characters and the sole LOGIC_CIRCULAR_RETURN archetype (`NATURE_S_BALANCE`, RESTORE/NURTURE) | `UPSTREAM GAP` | Root-caused this session: hard-filtered before scoring, genuine domain gap. |
| T21 | 6 | 5 curated cases: 2 FAIL (both C13-only, all other criteria PASS), 3 PASS | C13 shared-pool reuse only | `LEGACY / ACCEPTED` | Mechanism (disrupted-plan) confirmed technically stable; only blocker is C13. |
| T22 | 6 | 6/6 curated cases PASS | none | `FROZEN / PASS` | Clean across full natural coverage. |
| T23 | 6 | 6 curated cases: 4 WARNING, 2 PASS, no FAIL | — | `ACTIVE / VALIDATION` | No blocking evidence; not yet independently signed off. |

---

## Summary counts

- `FROZEN / PASS`: 2 — T05, T22
- `LEGACY / ACCEPTED`: 5 — T03, T11, T16, T18, T21
- `ACTIVE / VALIDATION`: 8 — T02, T04, T08, T09, T12, T14, T15, T23
- `PARKED / NO NATURAL COVERAGE`: 3 — T01, T07, T13
- `UPSTREAM GAP`: 5 — T06, T10, T17, T19, T20

Total: 23.

---

## C13 Shared-Pool Debt Register (post-V2 hardening — not a release blocker for this pass)

Recorded separately per the governing rule. All instances below are the sole blocker on their respective templates and are explicitly **not** grounds to reopen legacy realization work:

- T03: `"Tara tried again, a different way instead."` — shared across SIT005, SIT020, SIT049, SIT101.
- T11: two sentences shared across SIT069, SIT087, SIT091, SIT092, SIT094, SIT127 (`"Wait," Gauri told themselves, before spending the last bit of courage well.` / `Gauri smiled and could feel the ending settle more calmly now.`).
- T16: `"Tara wanted to avoid getting into trouble."` (SIT040, SIT132); `"Tara braced for anger, already deciding the mistake meant something bad about who Tara was."` (SIT040, SIT060).
- T18: `"Tara tried again, a different way instead."` — shared with T03's instance across SIT005/020/049/101, also present in the T18/SIT101 story.
- T21: `"Chinu checked anyway, like it might still happen after all."` — shared across SIT006, SIT120.

This register is a V2 hardening backlog item, tracked here for visibility only.

---

## Open Items (not reopened, flagged for a targeted check only)

- **T16 / SIT067**: A narrower regression tool (`runCompletePipelineRegressions.js`, `runGeneratedEventPlannerRegressions.js`) reported a plan-lint FAIL for SIT067 (missing `evidenceCited`, missing `contradictionMoment`, `reassessmentIsHeroOwned` not satisfied) in a same-day prior pass. Today's fresh full-corpus run (139/139) and fresh story-quality run (SIT067 → T16 PASS) do not reproduce this failure. This discrepancy was not independently re-run in this pass. Recommendation: one fresh, isolated run of the two named regression scripts against SIT067 before treating T16 as fully closed — if it reproduces, it is a technical/critical-bug question (in scope per the final rule's exception), not a content-quality question.

---

## Final Rule (binding)

No legacy template (T01–T23) receives new realization work as a result of this status pass. `LEGACY / ACCEPTED` templates' C13 debt is deferred to V2 hardening. `ACTIVE / VALIDATION` templates remain open only for independent sign-off (running existing checks to completion), not new content work. `PARKED` and `UPSTREAM GAP` templates require new situation authoring or ontology expansion — out of scope for legacy realization work entirely. Any exception requires a critical production bug, not a content-quality finding.

---

## Addendum 2026-08-12 (same day) — ACTIVE/VALIDATION sign-off pass + T16/SIT067 re-check

### Method

Used only the existing `runCorpusQualityAudit.js` check (no new criteria, no scoring logic changes). Its `CASES` list previously had zero rows for T02, T08, T12; all four of their natural situations each (per `tmp_full_corpus_production_readiness.json`) were added as data rows using the same fields/format already used for every other template in that file, then the full tool was re-run fresh. T04, T09, T14, T15, T23 used their existing rows, also re-run fresh. No file other than this data list was touched; no realization/selector/taxonomy/QA-threshold code changed.

### Results (fresh run, PASS=27 / WARNING=33 / FAIL=11 overall; zero FAIL among the 8 templates below)

| Template | Natural coverage run | Result | C13 | Disposition |
|---|---|---|---|---|
| T02 | 4/4 (full) | 4 WARNING, 0 FAIL | Non-blocking shared generic-fallback sentence ("This time it worked — not by trying harder, but by trying differently.") across 9 situations spanning T02+T08 | **Promoted to `LEGACY / ACCEPTED`** — full coverage, zero FAIL, sole issue is documented shared-fallback-pool debt (same category as the C13 register above, generic-fallback path). |
| T08 | 5/5 (full) | 5 WARNING, 0 FAIL | Non-blocking shared generic-fallback sentence ("Tara tried again, a different way instead." — same sentence T03/T18 share) across 9 situations spanning T03+T08 | **Promoted to `LEGACY / ACCEPTED`** — full coverage, zero FAIL, same shared-fallback-pool debt. |
| T12 | 4/4 (full) | 4 WARNING, 0 FAIL | Clean (PASS) | **Promoted to `LEGACY / ACCEPTED`** — full coverage, zero FAIL, WARNINGs are tooling-coverage gaps only ("template mechanic visibility is not explicitly scored," "no turning-point beat mapped yet") — not content defects. |
| T04 | 1/1 (full — only natural situation) | 1 WARNING, 0 FAIL | Clean (PASS) | **Promoted to `LEGACY / ACCEPTED`** — full available coverage (n=1 is the entire natural set), zero FAIL. |
| T09 | 4/4 (full) | 4 WARNING, 0 FAIL | Clean (PASS) | **Promoted to `LEGACY / ACCEPTED`** — full coverage, zero FAIL, content-polish warnings only. |
| T23 | 6/6 (full) | 4 WARNING, 2 PASS, 0 FAIL | Clean (PASS) | **Promoted to `LEGACY / ACCEPTED`** — full coverage, zero FAIL. |
| T14 | 5/16 (sampled, not exhaustive) | 3 PASS, 2 WARNING, 0 FAIL | Clean (PASS) | **Remains `ACTIVE / VALIDATION`** — no blocking evidence in the sampled cases, but coverage is not exhaustive; not signed off. |
| T15 | 7/15 (sampled, not exhaustive) | 6 PASS, 1 WARNING, 0 FAIL | Clean (PASS) | **Remains `ACTIVE / VALIDATION`** — no blocking evidence in the sampled cases, but coverage is not exhaustive; not signed off. |

**Updated summary counts:** `FROZEN/PASS`: 2 (T05, T22). `LEGACY/ACCEPTED`: 11 (T02, T03, T04, T08, T09, T11, T12, T16, T18, T21, T23). `ACTIVE/VALIDATION`: 2 (T14, T15). `PARKED/NO NATURAL COVERAGE`: 3 (T01, T07, T13). `UPSTREAM GAP`: 5 (T06, T10, T17, T19, T20). Total: 23.

### T16 / SIT067 isolated technical re-check — CONFIRMED, reproduces fresh

Ran both named regression scripts in isolation, fresh, this pass:

- `REGRESSION_CASE=SIT067 node public/prana-story-generator/phase8-tools/runCompletePipelineRegressions.js` → **FAIL** (0/1).
- `REGRESSION_CASE=SIT067 node public/prana-story-generator/phase8-tools/runGeneratedEventPlannerRegressions.js` → **FAIL** (0/1), full generated plan snapshot captured.

Both report the same lint failure independently: the generated T16 plan for SIT067 is missing the structural-constraint fields required by `T16_structuralConstraints` in `phase8-data/storyTemplates.json` —

- `INTERPRETATION_1` missing required `evidenceCited`
- `INTERPRETATION_2` missing required `evidenceCited`
- `EVIDENCE_GATHERING` missing required `contradictionMoment`
- `EVIDENCE_GATHERING.reassessmentIsHeroOwned` not satisfied

Despite this, `eventChainValidation`, `storyQA`, `productionQA`, and `compressionQA` all report PASS/PRODUCTION_READY for the same generated payload — the template-lint check that catches this is not part of those gates, which is why it doesn't surface in the full-corpus production-readiness run or the general story-quality run.

**This is a genuine, isolated, reproducing technical defect — not C13 debt, not covered by "no realization work" deferral.** Per the final rule's stated exception (critical production bug), this is in scope for a fix. No fix was applied in this pass (read-only re-check only, as requested). T16's overall classification remains `LEGACY / ACCEPTED` for its C13 debt, but this SIT067 plan-lint failure is now a **confirmed open defect**, not a discrepancy to re-check — it should be routed as a bug, separate from the C13 hardening backlog.
