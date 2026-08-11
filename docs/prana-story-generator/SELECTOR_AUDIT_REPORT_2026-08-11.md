# T01–T23 Template-Selection Matrix Audit (Dev A)

**Scope:** `selectStoryTemplate` in `phase6-app.js` and `phase8-data/storyTemplates.json`. No realization code touched for T01, T09, T15, T16, T21, T22, or T23 — confirmed by rerunning the 30-case forced-template corpus regression before and after (0 FAIL both times, story text for the 4 frozen templates is byte-identical since forced selection never calls the natural selector at all).

---

## 0. How the selector actually works (for reference)

`selectStoryTemplate(blueprint, storyPlan, libraries)` scores every template against 5 boolean tiers, in strict priority order, then falls back to `templateId.localeCompare` (i.e. **T01 before T02 before … before T23**) on a full tie:

1. `situationFit` — is this situationId in `template.bestForSituations`?
2. `needFit` — is the blueprint's single `needId` in `template.bestForNeeds`?
3. `logicFit` — is the story plan's `logicId` in `template.bestForLogicFamilies`?
4. `beatFit` — is scene count within 2 of `template.requiredBeats.length`? (weak — most templates have 6-7 required beats, so this is nearly always true for everyone)
5. `arcFit` — does the emotional arc's recommended-needs list overlap `template.bestForNeeds`?

This design is sound in principle. The problem is what the actual data feeds into it.

---

## 1. Template → mechanism family → active situations map

| Template | Name | Mechanism family | bestForNeeds | bestForLogicFamilies | Active situations (curated) |
|---|---|---|---|---|---|
| T01 | Cumulative Trail | growing repeated sequence, pattern breaks | CURIOSITY, PATIENCE | CUMULATIVE_BUILD | none curated |
| T02 | Refrain & Change | ritual repeats, then escalates | CONFIDENCE, ADAPTABILITY | RITUAL_ESCALATION | none curated |
| T03 | Three Tries | fail twice, succeed differently third time | COMPETENCE, CONFIDENCE, PATIENCE, SELF_REGULATION | TRIAL_AND_ERROR | none curated |
| T04 | Question Chain | one question triggers a chain of questions | CURIOSITY, INTEGRITY | RUNAWAY_CHAIN | none curated |
| T05 | Circle Back | returns to start, sees it differently | IDENTITY, HOPE | CIRCULAR_RETURN | none curated |
| T06 | Hidden Clue | a clue noticed only in hindsight | PATIENCE | CATALYST_VISIT | none curated |
| T07 | Three Guides | three figures each offer partial help | COMPASSION, RESPECT | PARALLEL_JOURNEY | none curated |
| T08 | The Repeating Mistake | same mistake recurs until named | SELF_REGULATION, IDENTITY | RITUAL_ESCALATION | none curated |
| T09 | Smallest Strength | the "weakest" trait is the actual asset | CONFIDENCE | INVERSION | none curated |
| T10 | Before/After Words | a phrase reframes meaning before/after | SELF_REGULATION, CONFIDENCE | PERSPECTIVE_SHIFT | none curated |
| T11 | The Countdown | a depleting resource forces a choice | COURAGE, SELF_REGULATION | RESOURCE_DEPRECIATION | none curated |
| T12 | The Almost-Right Path | a nearly-right shortcut turns out wrong | INTEGRITY, RESPONSIBILITY | TRICKSTER | none curated |
| T13 | Lost → Notice → Found | losing something teaches noticing | STABILITY, PATIENCE | THRESHOLD_CROSSING | none curated |
| T14 | Pass It On | help received is passed to someone else | COMPASSION, CONNECTION, BELONGING | ROLE_REVERSAL | none curated |
| T15 | The Unexpected Helper | help comes from an unlikely source | COMPASSION, TRUST | INVERSION | none curated |
| **T16** | **Two Ways to See It** | **belief reassessed via internal evidence** | **RESPECT, COMPASSION** | **PERSPECTIVE_SHIFT** | **7 (frozen, see below)** |
| T17 | The Secret Mission | a hidden task given by a guide | COURAGE, CURIOSITY | CATALYST_VISIT | none curated |
| T18 | The Growing Problem | a small issue escalates until addressed | SELF_REGULATION | RUNAWAY_CHAIN | none curated |
| T19 | Choice at the Crossroads | an explicit fork, hero commits | RESPONSIBILITY, INTEGRITY | THRESHOLD_CROSSING | none curated |
| T20 | Return With Something New | comes back changed, brings proof | COMPETENCE, CONFIDENCE | CIRCULAR_RETURN | none curated |
| **T21** | **The Disrupted Plan** | **a plan is disrupted, restore fails, hero adapts** | **ADAPTABILITY, RESILIENCE** | **THRESHOLD_CROSSING** | **6 (frozen)** |
| **T22** | **The Reframe Trail** | **object/situation reinterpreted through discovery** | **CURIOSITY, PATIENCE** | **CUMULATIVE_BUILD** | **6 (frozen)** |
| **T23** | **The Assumption Bridge** | **self-reinterpretation after interpersonal shift** | **COMPASSION, RESPECT** | **PERSPECTIVE_SHIFT** | **6 (frozen)** |

Curated situation lists (now written into `bestForSituations`, see §5):
- T16: SIT040, SIT064, SIT067, SIT077, SIT128, SIT060, SIT132
- T21: SIT006, SIT111, SIT118, SIT120, SIT164, SIT157
- T22: SIT045, SIT083, SIT139, SIT148, SIT154, SIT141
- T23: SIT042, SIT086, SIT089, SIT123, SIT158, SIT133

T01–T15 (minus T16), T17–T20 have **no curated situations at all** — that curation work belongs to whichever template family Dev B builds next, and is out of scope here. This audit's job was to make sure the *mechanism* exists to route to them correctly once curated, and to fix the two templates that were mathematically unreachable regardless.

---

## 2. Shadowed/orphaned templates — empirical measurement

I ran the natural selector (`selectStoryTemplate`, the same path real users hit — forced selection is QA-only) against all 156 active situations, before any fix:

```
T01: 5   T02: 19   T03: 18   T04: 7    T05: 10   T06: 0    T07: 21   T08: 0
T09: 5   T10: 0    T11: 6    T12: 6    T13: 0    T14: 22   T15: 20   T16: 0
T17: 0   T18: 0    T19: 0    T20: 0    T21: 0    T22: 0    T23: 0
```

**12 of 23 templates (52%) were never naturally selected for a single situation.** That includes all 4 of the templates this project just spent the session hand-crafting genuine per-mechanism realization for (T16, T21, T22, T23) — the entire "T16/T21/T22/T23 frozen" milestone was, until this fix, unreachable by any real user. It only ever ran through `forceSelectStoryTemplate`, the QA-harness bypass.

### Root causes, in order of impact

**(a) Two templates have byte-identical `bestForNeeds` + `bestForLogicFamilies` signatures with another lower-numbered template:**

```
T01 / T22 — both: needs=[CURIOSITY, PATIENCE], logic=CUMULATIVE_BUILD
T16 / T23 — both: needs=[COMPASSION, RESPECT], logic=PERSPECTIVE_SHIFT
```

Since `bestForSituations` was empty for every template (tier 1 never fired for anyone), any situation that matched one of these pairs matched *both* members identically on tiers 1–3, tied on beat/arc tiers too (they share the same needs so `arcFit` ties as well), and fell straight to `templateId.localeCompare` — T01 and T16 win **unconditionally**, every time, forever. T22 and T23 were not "usually shadowed," they were *structurally impossible* to reach.

**(b) `LOGIC_PERSPECTIVE_SHIFT` and `LOGIC_THRESHOLD_CROSSING` are each claimed by 3 templates**, and 5 more logic families are claimed by 2 templates each (`T02/T08`, `T04/T18`, `T05/T20`, `T06/T17`, `T09/T15`). Where the shared need doesn't fully collide (unlike (a)), these pairs are only *conditionally* shadowed — whichever one has the lower templateId wins every tie, which in practice was most of the time, since needFit/logicFit are booleans with no notion of "how many other templates also claim this."

**(c) Some need IDs in the taxonomy (`NEED_STABILITY`, `NEED_HOPE`, `NEED_RESILIENCE`, and to a lesser extent `NEED_CURIOSITY`) rarely or never appear as a situation's primary need** in the actual 156-situation library, based on which "exact fit" reasons ever won. Templates that depend on one of these as their *only* differentiator from a same-logic sibling (T13's STABILITY vs. T19/T21 sharing THRESHOLD_CROSSING; T21's RESILIENCE) lose that differentiator and fall to the beat/arc/alphabetical tiers, where they're generic again.

**(d) 44 of 156 situations (28%) match zero tiers at all** and hit the pure `templateId` fallback — which always resolves toward the lowest-numbered template with no tier requirement satisfied, structurally biasing volume toward T01–T05/T07 regardless of fit quality.

---

## 3. Selector specificity rules (proposed and implemented)

**Rule A — Situation curation is the primary specificity signal, and must be populated as templates are built.** `bestForSituations` sitting empty for 19/23 templates means tier 1 (the most specific, most intentional signal) never does anything. As each template's realization is authored (Dev B's track), its audited situation list belongs in `bestForSituations` immediately — this is what actually fixed T16 vs. T23 and T01 vs. T22 (§5).

**Rule B — Break ties by rarity, not template ID.** Implemented: a **specificity score** — `1/(# templates sharing the matched need)` + `1/(# templates sharing the matched logic family)` — is now tier 6, evaluated after `arcFit` and before the `templateId` fallback. A template whose matched need/logic is claimed by only itself scores 1.0–2.0; one that shares both with two other templates scores as low as 0.33–0.67. This generically protects any *future* template that shares a need/logic family with a broader one, without requiring every pair to be hand-diagnosed the way (a) was.

**Rule C — Treat a fully-identical need+logic signature between two templates as a standing audit flag.** (a) above should never silently happen again undetected. §6 includes a small standalone check script (`tmp_selector_lint_collisions.mjs`) that lists any such collisions; it's advisory, not wired into CI, since deciding "is this collision real or intentional" is an authoring judgment call, not something to hard-fail a build on.

**Rule D — Don't let the 28% no-tier-match fallback masquerade as a real decision.** Not changed in this pass (would require new signal data, e.g. lifeDomain/emotion matching, which is out of scope for "selector logic only"), but flagged in §7 as the next highest-leverage gap once more templates have curated situations — right now low-confidence fallbacks are indistinguishable from confident matches in the data Dev B would see.

---

## 4. Forced-vs-natural selection matrix

Full per-situation detail is in `tmp_selector_audit_raw.json` (156 rows: situationId, naturalTemplateId, selectionReason). Summary, natural selection counts before vs. after the fix:

| Template | Before | After | Note |
|---|---|---|---|
| T01 | 5 | 4 | lost 1 to specificity redistribution (situations that also matched a rarer sibling template) |
| T02 | 19 | 14 | |
| T03 | 18 | 18 | unaffected — no collisions |
| T04 | 7 | 1 | lost most to specificity redistribution against `T18` (shares RUNAWAY_CHAIN, T18 currently 0 either way — see caveat below) |
| T05 | 10 | 9 | |
| T06 | 0 | 0 | still uncurated — NEED_PATIENCE + CATALYST_VISIT combo apparently never wins any tier for real situations |
| T07 | 21 | 19 | |
| T08 | 0 | 0 | still uncurated |
| T09 | 5 | 4 | |
| T10 | 0 | 0 | still uncurated |
| T11 | 6 | 6 | unaffected |
| T12 | 6 | 4 | |
| T13 | 0 | 0 | still uncurated |
| T14 | 22 | 16 | |
| T15 | 20 | 19 | |
| **T16** | **0** | **7** | **fixed — now claims exactly its curated situations** |
| T17 | 0 | 0 | still uncurated |
| T18 | 0 | 0 | still uncurated |
| T19 | 0 | 0 | still uncurated |
| T20 | 0 | 0 | still uncurated |
| **T21** | **0** | **6** | **fixed** |
| **T22** | **0** | **6** | **fixed** |
| **T23** | **0** | **6** | **fixed** |

Caveat on the T01/T04/T02/T07/T14 count shifts: these are **all templates with no curated `bestForSituations` yet**, so the redistribution among them is the specificity-score rule reshuffling *ties among equally-uncurated, equally-generic templates* — it is not wrong, but it's also not yet meaningful, because none of T02–T15/T17–T20 have had the "what does this template's mechanism actually require" audit that T16/T21/T22/T23 got this session. Read this table as "the mechanism now works," not "T02's drop from 19→14 was individually verified" — that verification is exactly the situation-curation work Dev B's track will produce, template by template.

---

## 5. What was changed

- **`phase8-data/storyTemplates.json`**: populated `bestForSituations` for T16, T21, T22, T23 with their locked situation lists (data only — no `sceneStructure`, `storyMechanic`, or any other realization-adjacent field touched).
- **`phase6-app.js` → `selectStoryTemplate`**: added the specificity-score tier (Rule B) between `arcFit` and the `templateId` fallback. No other function touched. `forceSelectStoryTemplate` (used by every forced/QA path, including all 4 frozen templates' regression suite) is untouched and was not exercised differently — confirmed via a full corpus rerun (0 FAIL, unchanged from before this change).

## 6. Regression / test suite

- `tmp_selector_audit2.mjs` — runs the *natural* selector (no forcing) against all 156 active situations, dumps per-template counts + full reasoning to `tmp_selector_audit_raw.json`. This is the regression test: rerun after any `storyTemplates.json` or `selectStoryTemplate` change and confirm (a) T16/T21/T22/T23 counts equal their curated list lengths exactly, (b) no previously-nonzero template drops to 0 unexpectedly.
- Existing `runCorpusQualityAudit.js` (forced-template, 30 cases) — confirms realization output for the 4 frozen templates is untouched. Ran before and after: 0 FAIL both times.
- A standalone collision-lint (list any two templates with identical `bestForNeeds`+`bestForLogicFamilies`) — ad hoc script, not checked into `phase8-tools/`, output already folded into §2(a)/(b) above; rerun on demand if `storyTemplates.json` changes.

## 7. Handoff to Dev B

The selector mechanism is now correct and will honor situation curation the moment it's added. For each new template family Dev B builds (starting with whichever of T02, T03, T04, T05, T07, T09, T11, T12, T14, T15 — or the fully-orphaned T06/T08/T10/T13/T17/T18/T19/T20 — comes next), the same closing step used for T16/T21/T22/T23 applies: once that template's situations are audited and locked, add them to `bestForSituations` in `storyTemplates.json`, then rerun `tmp_selector_audit2.mjs` to confirm the template starts claiming exactly its own situations naturally. No further selector code changes should be needed — Rule B's specificity score already covers the shared-logic-family collisions (§2b) generically.

The 8 fully-orphaned templates with zero natural selections even after this fix (T06, T08, T10, T13, T17, T18, T19, T20) aren't newly broken — they were always 0, and stay 0 until they have either curated situations or a real need-id presence in the situation library. Worth flagging to whoever prioritizes Dev B's queue: T13/T19/T21 all share `LOGIC_THRESHOLD_CROSSING`, so T13 and T19 are the next most likely to fight each other once curated, same shape as T16/T23.
