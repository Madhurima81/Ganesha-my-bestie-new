# Shared Realization-Quality Debt Audit

**Date:** 2026-08-12  
**Scope:** Read-only audit only. No code, selector, taxonomy, QA-threshold, template, or realization changes made.

## 1. What was audited

This audit targets the known shared-sentence debt called out separately from template-specific realization work:

- `ctx.actionPhrases` reuse affecting T03/T18
- shared belief-framing reuse affecting T16/T21

The requested target was the full unfiltered C13 audit. I attempted a fresh direct run of `public/prana-story-generator/phase8-tools/runCorpusQualityAudit.js` on 2026-08-12, but the local Node entrypoint in this shell fails before the script starts with `EPERM: operation not permitted, lstat 'C:\Users\Madhurima Agarwal'`. To avoid inventing results, the findings below are grounded in the current on-disk full audit artifact `tmp_story_quality_report.md`, which is the unfiltered report produced by that script and matches the independently documented full-run summary in [C13_FROZEN_TEMPLATE_DISCREPANCY_2026-08-12.md](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/docs/prana-kids/C13_FROZEN_TEMPLATE_DISCREPANCY_2026-08-12.md).

## 2. Full unfiltered C13 result

Current full-report outcome:

- `PASS=23`
- `WARNING=19`
- `FAIL=10`

C13-only affected story/template rows: **10**

Affected templates: **4**

- `T03`
- `T18`
- `T16`
- `T21`

Affected unique situation IDs: **9**

- `SIT005`
- `SIT020`
- `SIT049`
- `SIT101`
- `SIT040`
- `SIT060`
- `SIT132`
- `SIT006`
- `SIT120`

Note on counting: `SIT101` appears twice because the corpus includes both `SIT101 -> T03` and `SIT101 -> T18`. The C13 helper keys reuse by `situationId`, so that cross-template same-situation collision is visible at the story-row level even though it is not counted as a fifth distinct situation in the sentence-owner set.

## 3. Every affected template/situation pair

| Template | Situation | Exact reused sentence | Audit status |
|---|---|---|---|
| T03 | SIT005 | `Tara tried again, a different way instead.` | FAIL |
| T03 | SIT020 | `Tara tried again, a different way instead.` | FAIL |
| T03 | SIT049 | `Tara tried again, a different way instead.` | FAIL |
| T03 | SIT101 | `Tara tried again, a different way instead.` | FAIL |
| T18 | SIT101 | `Tara tried again, a different way instead.` | FAIL |
| T16 | SIT040 | `Tara wanted to avoid getting into trouble.` | FAIL |
| T16 | SIT060 | `Tara braced for anger, already deciding the mistake meant something bad about who Tara was.` | FAIL |
| T16 | SIT132 | `Tara wanted to avoid getting into trouble.` | FAIL |
| T21 | SIT006 | `Chinu checked anyway, like it might still happen after all.` | FAIL |
| T21 | SIT120 | `Chinu checked anyway, like it might still happen after all.` | FAIL |

## 4. Source trace and classification

### Finding A

- Reused sentence: `Tara tried again, a different way instead.`
- Affected rows: `T03/SIT005`, `T03/SIT020`, `T03/SIT049`, `T03/SIT101`, `T18/SIT101`
- Source trace:
  - `buildEventPlannerContext()` creates `ctx.actionPhrases` via `pickThreeDistinctActionPhrases(...)` in [phase6-app.js](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/public/prana-story-generator/phase6-app.js:5919).
  - T03 ATTEMPT_2 inserts the sentence directly as `${p} ${ctx.actionPhrases[1]} instead.` in [phase6-app.js](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/public/prana-story-generator/phase6-app.js:7748).
  - T18 does not use that exact line in its current event-chain branch, so the `T18/SIT101` hit is best explained as shared scaffold/prose carried by the existing full audit artifact rather than a T18-specific belief/mechanism sentence.
- Type: shared pool / other shared scaffold
- Content role: connective scaffolding, not mechanism payload
- Severity: **LOW**

Why this is LOW:

- The sentence is generic transition tissue.
- It does not name the obstacle, belief, relationship, or story-specific causal insight.
- On its own, it does not make the underlying mechanism unreadable.
- The repetition is noticeable in audit output, but it is closer to boilerplate connective prose than to story-identity collapse.

Smallest safe fix:

- Diversify `ctx.actionPhrases` for the second-attempt slot, or make the pool template-aware so T03/T18 do not converge on the same retry wording.

### Finding B

- Reused sentence: `Tara wanted to avoid getting into trouble.`
- Affected rows: `T16/SIT040`, `T16/SIT132`
- Source trace:
  - This is not coming from `ctx.actionPhrases`.
  - It is content-bearing setup text tied to T16's shared belief framing for guilt/trouble-avoidance cases.
  - The T16 branch is the authored realization-contract path, with mode framing rooted in `T16_MODE_FRAMING` in [phase6-app.js](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/public/prana-story-generator/phase6-app.js:6221).
  - The duplicate functions like a narrowed shared belief-library/setup sentence rather than a template-wide generic fallback.
- Type: belief library / shared belief framing
- Content role: meaningful story content
- Severity: **MEDIUM**

Why this is MEDIUM:

- It names the protagonist's actual motive and frames the opening emotional logic.
- It is more than connective glue; it shapes what the story is "about" before the reinterpretation beat.
- Even so, the rest of T16's mechanism remains distinct across the affected stories, so this is not a full interchangeability failure.

Smallest safe fix:

- Narrow the shared belief-library reuse for trouble/guilt openings so the setup sentence threads a situation-specific fact from the concrete scene instead of reusing one abstract trouble-avoidance line.

### Finding C

- Reused sentence: `Tara braced for anger, already deciding the mistake meant something bad about who Tara was.`
- Affected rows: `T16/SIT040`, `T16/SIT060`
- Source trace:
  - This sentence is authored directly inside `T16_MODE_FRAMING.SOCIAL_REACTION.interpretation1` in [phase6-app.js](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/public/prana-story-generator/phase6-app.js:6224).
  - It is therefore template-specific framing, but still shared across multiple situations routed to the same T16 mode.
- Type: template-specific framing
- Content role: meaningful story content
- Severity: **MEDIUM**

Why this is MEDIUM:

- It is a psychologically specific interpretive sentence, not filler.
- It strongly shapes the false-belief reading of the scene.
- It does not erase the distinct evidence and resolution beats, but it does make same-mode openings feel more alike than they should.

Smallest safe fix:

- Make the T16 `SOCIAL_REACTION` framing situation-aware by threading a concrete scene fact into `interpretation1`, instead of using one fixed sentence for every routed case.

### Finding D

- Reused sentence: `Chinu checked anyway, like it might still happen after all.`
- Affected rows: `T21/SIT006`, `T21/SIT120`
- Source trace:
  - This sentence is authored directly inside `T21_MODE_FRAMING.EXTERNAL_CANCELLATION.reaction` in [phase6-app.js](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/public/prana-story-generator/phase6-app.js:6357).
  - It is a mode-level shared sentence, not a generic fallback line and not an `actionPhrases` line.
- Type: template-specific framing / shared mode scaffold
- Content role: meaningful story content
- Severity: **MEDIUM**

Why this is MEDIUM:

- It captures the emotional logic of cancellation stories, not just a scene transition.
- Both affected T21 stories still diverge in surrounding situation content and end differently enough to remain readable as separate stories.
- But the sentence is distinctive enough that repeating it makes the two openings feel authored from the same mold.

Smallest safe fix:

- Diversify the `EXTERNAL_CANCELLATION.reaction` line or make that single line situation-aware, while leaving the rest of the T21 contract untouched.

## 5. Quantification

### By story/template row

| Reused sentence | Affected story rows |
|---|---:|
| `Tara tried again, a different way instead.` | 5 |
| `Tara wanted to avoid getting into trouble.` | 2 |
| `Tara braced for anger, already deciding the mistake meant something bad about who Tara was.` | 2 |
| `Chinu checked anyway, like it might still happen after all.` | 2 |

### By distinct situation count

| Reused sentence | Distinct situations |
|---|---:|
| `Tara tried again, a different way instead.` | 4 |
| `Tara wanted to avoid getting into trouble.` | 2 |
| `Tara braced for anger, already deciding the mistake meant something bad about who Tara was.` | 2 |
| `Chinu checked anyway, like it might still happen after all.` | 2 |

### By template coverage

| Reused sentence | Templates affected |
|---|---|
| `Tara tried again, a different way instead.` | T03, T18 |
| `Tara wanted to avoid getting into trouble.` | T16 |
| `Tara braced for anger, already deciding the mistake meant something bad about who Tara was.` | T16 |
| `Chinu checked anyway, like it might still happen after all.` | T21 |

### Connective vs content-bearing

| Reused sentence | Classification |
|---|---|
| `Tara tried again, a different way instead.` | Connective/scaffolding |
| `Tara wanted to avoid getting into trouble.` | Meaningful story content |
| `Tara braced for anger, already deciding the mistake meant something bad about who Tara was.` | Meaningful story content |
| `Chinu checked anyway, like it might still happen after all.` | Meaningful story content |

## 6. Do these repetitions actually make stories feel interchangeable?

### T03/T18 shared retry sentence

This repetition is real, but it reads as common connective tissue, not as mechanism collapse by itself.

- In T03, the sentence is a second-attempt bridge.
- It does not carry the belief realization or the actual obstacle logic.
- If fixed later, the stories will read cleaner, but leaving it in place does not by itself erase story identity.

Verdict: **harmless-to-noticeable connective repetition**

### T16 repeated setup/belief framing

This is more serious than T03/T18 because the repeated text carries the opening interpretation of the event.

- `wanted to avoid getting into trouble` collapses two guilt/truth-telling openings toward the same motive sentence.
- `braced for anger... meant something bad about who Tara was` is a psychologically strong line that can make two SOCIAL_REACTION entries sound too pre-authored from one template sentence.
- The mechanism prose still remains distinct after that opening because the evidence and resolution beats differ.

Verdict: **noticeable repetition, but not full story interchangeability**

### T21 repeated cancellation reaction

This line is content-bearing but narrower in scope.

- It is specific enough to be memorable.
- Both affected stories are genuinely the same T21 mode, so some shared architecture is appropriate.
- The repetition weakens freshness more than it weakens mechanism clarity.

Verdict: **noticeable repetition, but mechanism remains distinct**

## 7. Severity summary

- **HIGH:** none
- **MEDIUM:** 3 findings
- **LOW:** 1 finding

Because there are **no HIGH findings**, this is not evidence that the shared prose is materially collapsing story identity across the affected templates. It is real quality debt, but mostly in the "same authored sentence reused too literally" category rather than "different stories have become the same story."

## 8. Final table

| Source | Reused text | Templates affected | Stories affected | Severity | Why it repeats | Content impact | Safest fix | Regression risk |
|---|---|---|---:|---|---|---|---|---|
| `ctx.actionPhrases[1]` / shared scaffold | `Tara tried again, a different way instead.` | T03, T18 | 5 | LOW | Shared second-attempt phrasing is reused across multiple stories; one row is also a same-situation cross-template collision (`SIT101`) | Noticeable boilerplate connective prose, but not identity-defining content | Diversify the shared pool or make second-attempt phrasing template-aware | Low |
| Shared belief framing / opening setup | `Tara wanted to avoid getting into trouble.` | T16 | 2 | MEDIUM | A narrow trouble/guilt opening sentence is reused across multiple T16 situations | Content-bearing setup line; makes two openings feel more alike than needed | Narrow belief-library reuse and thread concrete scene facts into the setup line | Low |
| Template-specific framing (`T16_MODE_FRAMING.SOCIAL_REACTION.interpretation1`) | `Tara braced for anger, already deciding the mistake meant something bad about who Tara was.` | T16 | 2 | MEDIUM | One authored same-mode interpretation sentence is reused verbatim | Strong false-belief reading; noticeable sameness, but downstream mechanism still differs | Make the interpretation line situation-aware instead of fully fixed | Low |
| Template-specific framing (`T21_MODE_FRAMING.EXTERNAL_CANCELLATION.reaction`) | `Chinu checked anyway, like it might still happen after all.` | T21 | 2 | MEDIUM | One authored same-mode cancellation reaction sentence is reused verbatim | Distinctive opening reaction line; freshness suffers, but story mechanism still holds | Diversify or lightly parameterize the reaction line for cancellation stories | Low |

## 9. Recommendation

**FIX AFTER TEMPLATE ROLLOUT**

Reasoning:

- No finding rises to **HIGH** severity.
- The T03/T18 issue is mostly acceptable connective prose debt.
- The T16/T21 issues are worth fixing, but they are contained, low-risk authored-sentence reuse issues rather than evidence that the realization contracts themselves are broken.
- The smallest safe fixes are local to shared pools or single mode-framing lines; they do not require reopening selector logic, QA thresholds, or the overall contract architecture.

If a follow-up is opened, the best order is:

1. T16 shared belief-opening lines
2. T21 `EXTERNAL_CANCELLATION.reaction`
3. T03/T18 `ctx.actionPhrases[1]` diversification
