# V2-01 Cumulative Discovery Report

Date: 2026-08-13
Status: implementation attempt completed, not production-clean
Scope: V2-01 only
Method lock: `V2_REALIZATION_CONTRACT_METHODOLOGY_V2_2026-08-12.md`

**Implementation changes reverted after the architecture review determined that the attempt was not production-clean. This report is retained as a historical implementation-attempt record, not as a production implementation.**

## 1. Coverage audit

Canonical V2-01 assignment count from `V2_MECHANISM_TO_SITUATION_ADJUDICATION_2026-08-12.md`: **18 situations**

Assigned set:

- `SIT004` Sibling gets a bigger portion
- `SIT006` Playdate or plan suddenly cancelled
- `SIT031` Heard about war or violence on news
- `SIT032` Saw news about floods
- `SIT033` Fear that a parent might get sick
- `SIT034` Overheard adults talking about money problems
- `SIT069` Their clothes aren't as "cool" as others
- `SIT091` Friend has more followers
- `SIT094` Wanting what's in a friend's lunchbox
- `SIT096` Wearing an older sibling's old clothes
- `SIT119` Favourite teacher changes mid-year
- `SIT123` Friend suddenly acting different or "cooler"
- `SIT126` News of an upcoming surgery or treatment
- `SIT131` Overheard adults talk about "a big change coming"
- `SIT138` Told a "bad" secret they feel should be shared
- `SIT140` Realised some kids don't have food or shoes
- `SIT149` Overheard talk about politics, protests, or injustice
- `SIT157` Rumours or gossip spread about them

### Natural / selector-diverted / forced-only split

Natural enough to support a live cumulative-discovery branch after audit:

- `SIT031`
- `SIT033`
- `SIT034`
- `SIT069`
- `SIT091`
- `SIT094`
- `SIT096`
- `SIT119`
- `SIT126`
- `SIT131`
- `SIT140`

Selector-diverted in the current live system before this pass:

- `SIT031` -> `T03`
- `SIT033` -> `T15`
- `SIT034` -> `T15`
- `SIT069` -> `T11`
- `SIT091` -> `T11`
- `SIT094` -> `T11`
- `SIT119` -> `T15`
- `SIT126` -> `T11`
- `SIT131` -> `T15`
- `SIT140` -> `T16`

Questionable / collision-heavy / not kept in final curated natural set:

- `SIT123` collided with `T23` and naturally selected `T23`
- `SIT157` collided with `T21` and produced a failed lock when forced through `T08`

Upstream resolution failure / unavailable as honest live evidence:

- `SIT032` resolveStatus `FAIL`
- `SIT149` resolveStatus `FAIL`

Forced-only / not implemented into final natural curation:

- `SIT004`
- `SIT006`
- `SIT123`
- `SIT138`
- `SIT157`

### Mechanism-fit concerns

- `SIT004` still reads closer to comparison / self-worth than accumulated-pattern discovery in the live engine.
- `SIT006` is already strongly served by disrupted-plan mechanics (`T21`) in the live selector.
- `SIT138` still reads closer to threshold / judgment structure than pattern accumulation in the current live story surface.
- `SIT123` naturally pulls toward assumption/perspective-shift (`T23`) rather than cumulative discovery.
- `SIT157` did not hold shape under live locking when routed through the new branch.

## 2. Layer 1 mechanism contract used in code

Implemented live beat shape for the attempted V2-01 branch:

- `OLD_PATTERN_ESTABLISHED`
- `FIRST_FRAGMENT`
- `PATTERN_COST`
- `PATTERN_BREAK`
- `DIFFERENT_CHOICE`
- `CONSEQUENCE`

Core causal rule used:

- concrete fragments accumulate
- the fragments become legible as one pattern
- the pattern changes the protagonist's next action

Anti-patterns explicitly avoided:

- repeated-mistake prose loop
- single-clue "aha"
- explanation without changed action
- selector forcing to inflate coverage

## 3. Realization families used

Only families supported by the audited situation data were implemented:

1. `PARTIAL_INFORMATION_ACCUMULATION`
- used for overheard/news/uncertain-health/change-coming cases
- evidence accumulates as incomplete but concrete pieces
- risk: imagination outruns facts

2. `SOCIAL_SIGNAL_ACCUMULATION`
- used for comparison/status/social-distance cases
- evidence accumulates as repeated social cues
- risk: comparison turns fragments into a verdict about worth/belonging

3. `INEQUITY_PATTERN_ACCUMULATION`
- used for visible lack / deprivation recognition
- evidence accumulates as repeated material signs of unfairness or need
- risk: scene stays at shock rather than becoming response

## 4. Implementation summary

Files changed:

- `public/prana-story-generator/phase6-app.js`
- `public/prana-story-generator/phase8-data/storyTemplates.json`
- `public/prana-story-generator/phase8-tools/runCorpusQualityAudit.js`

What was implemented:

- `T08` was repurposed into a live cumulative-discovery branch for the audited V2-01 surface.
- Added a dedicated `T08` event-chain path with V2-01-style beats instead of the prior repeating-mistake framing.
- Added T08 mode detection for the 3 audited accumulation styles above.
- Added T08-specific validation and content-audit hooks.
- Curated `T08.bestForSituations` to the audited live subset rather than the old legacy list.

What was deliberately not changed:

- no selector algorithm rewrite
- no ontology/taxonomy edits
- no legacy template rewrites outside the attempted `T08` live surface
- no forced curation for `SIT032`, `SIT149`, `SIT123`, or `SIT157`

## 5. Representative demonstrations used during the pass

Representative situations exercised across different accumulation styles:

- `SIT031` war/violence news
- `SIT069` clothes/status comparison
- `SIT094` lunchbox comparison
- `SIT140` noticing kids without food or shoes
- `SIT123` friend acting different or "cooler" (stress-test only; not kept in final natural curation)

## 6. Validation results

### Selector reachability

`runSelectorReachabilityRegression.js`

- Reachability: **PASS**
- Every curated T08 situation naturally selected T08 after the final curation trim

### Natural-path story lock

`runSelectorReachabilityRegression.js`

- Story QA lock: **FAIL**

Remaining failing natural T08 situations:

- `SIT033`
- `SIT034`
- `SIT094`
- `SIT096`
- `SIT126`
- `SIT131`

Failure classes:

- `QA-007` emotional arc does not resolve strongly enough:
  - `SIT033`
  - `SIT034`
  - `SIT126`
  - `SIT131`

- `QA-012` prose corruption / punctuation cleanup:
  - `SIT094`
  - `SIT096`
  - `SIT131`

### Corpus content audit

`runCorpusQualityAudit.js`

- Report written successfully
- Aggregate result at end of pass: `PASS=26 WARNING=28 FAIL=17`

Important note:

- T08 mechanism visibility scored as visible on the audited cases that locked far enough to score
- the remaining blockers are quality/cleanup blockers, not selector reachability blockers

## 7. Convergence verdict

Partial convergence only.

What succeeded:

- the live branch now reads as accumulated-pattern discovery rather than repeating-mistake logic
- selector reachability was stabilized on the curated audited subset
- obvious collision cases were identified and removed instead of being forced through the branch

What failed:

- the partial-information subfamily still does not consistently land enough emotional release for live QA
- punctuation/prose cleanup is still not stable across some T08 stories
- therefore the branch is not yet production-clean

## 8. Questionable-fit situations

- `SIT004`
- `SIT006`
- `SIT123`
- `SIT138`
- `SIT157`
- `SIT032`
- `SIT149`

Reason:

- either stronger live fit with another mechanism
- or unresolved upstream failure
- or failed/unstable lock when pushed through the new branch

## 9. Known limitations

- This pass used the existing live `T08` slot rather than introducing a brand-new V2 runtime surface.
- The report does not claim that all 18 adjudicated V2-01 situations are honest natural coverage in the current live engine.
- The remaining partial-information cluster still needs another quality pass before this can be called production-ready.
- Full 156-situation regression was not completed in this pass after the final rework state; only selector regression and corpus content audit were rerun on the updated branch.
- No blind editorial review pack was produced for this pass.
- No explicit C13 clean pass exists for the whole attempted T08/V2-01 natural subset.

## 10. Final verdict

**REWORK**

Why:

- mechanism shape is now materially closer to V2-01
- selector reachability is clean on the curated audited subset
- but live QA still fails on 6 natural T08 stories
- so this is not yet a truthful `PASS` or `CONDITIONAL PASS`

## Handoff note

This pass should be treated as an implementation attempt plus coverage diagnosis, not independent validation signoff.
