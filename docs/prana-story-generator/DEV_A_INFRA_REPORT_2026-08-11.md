# Dev A — Infrastructure Track Report

Scope: selector reliability, fallback signal investigation, production integration, regression harness. No template realization/prose code touched (T01, T09, T15, T16, T21, T22, T23 all untouched — confirmed via unchanged 0-FAIL corpus regression, run before and after every change below).

---

## Current staging baseline: 46/47 (2026-08-11)

Dashboard: https://claude.ai/code/artifact/2e7b1923-2a01-4160-a6d7-301a36280c86 (labeled "T11/SIT021 fixed — 46/47")

**Curated templates** (`bestForSituations` populated, verified reachable + locking via the natural selector):
- T16 — 7 situations (frozen)
- T21 — 6 situations (frozen)
- T22 — 6 situations (frozen)
- T23 — 6 situations (frozen)
- T08 — 5 situations
- T18 — 4 situations (`SIT086` deliberately excluded — already owned by T23; kept exclusive to avoid a `situationFit` collision)

**Selector fix applied:** `selectStoryTemplate` was reading `storyPlan.storyFlow.logic.id`, a field Phase 7's `buildStoryFlow` never sets — the `logicFit` tier had been dead for every template, always. Fixed to read the already-correct `blueprint.logic.id`. This alone made T08/T18 (and others) naturally reachable for the first time; it also correctly demoted T07 to zero (it was winning purely on alphabetical luck against T16/T23, not on any real signal — losing that luck was a correction, not a regression).

**Realization-seam fixes applied (Dev B, gated per-template, not architecture changes):**
- T08/SIT004 — QA-013 (dialogue too long): the shared generic fallback's TURNING_POINT beat quoted the full `trueBeliefText` as spoken dialogue; folded into narration instead (fixed for the shared fallback, benefits any template using it).
- T11/SIT021 — completeStoryValidation concrete-word coverage: the shared generic fallback never referenced `storySeed.immediateObstacle` at all; added it to T11's SETUP beat only, gated to `templateId === "T11"` so no other template's output changed.

**Remaining failure: 1 of 47 — `SIT010` / `NEED_JUSTICE`, untouched by design.**

`NEED_JUSTICE` does not appear in any template's `bestForNeeds`. This is the last item in the confirmed taxonomy-gap list from the original selector audit (`NEED_SAFETY` ×14, `NEED_CONTENTMENT` ×8, `NEED_AUTONOMY` ×1, `NEED_JUSTICE` ×1 — the first three are now covered incidentally by T08/T18's `LOGIC_RITUAL_ESCALATION`/`LOGIC_RUNAWAY_CHAIN` curation, `NEED_JUSTICE` is not). Also still open, not remapped: `LOGIC_SAFETY_LOOP` (24 real situations, zero template coverage) and the T10/T13/T17/T19/T20 combinatorial/logic-family gaps documented earlier. None of these have been mapped to a template — per standing instruction, that's a content/ontology decision, not something to invent to move the number.

---

## Ontology audit — LOCKED (2026-08-11), zero changes applied

Traced the exact resolver mechanism for `need` and `logic` resolution (`resolvePhase6`, `phase6-app.js` ~L604–756) to distinguish four genuinely different failure shapes hiding behind "this template has zero coverage." They are not the same problem and must not be treated as one:

**1. Real resolver output, no template owner** — `NEED_JUSTICE`, `LOGIC_SAFETY_LOOP`.
`needId` comes straight from `situation.ontology.needId`, unfiltered — `NEED_JUSTICE` resolves cleanly for 8 real situations. `LOGIC_SAFETY_LOOP` is the resolver's second-most-common output (24 situations; present in 2 characters, 5 archetypes, 2 conflicts). Both are fully alive at the resolver. The only gap is that no template's `bestForNeeds`/`bestForLogicFamilies` claims them — a template-mechanism-design decision, not a wiring defect. No resolver fix is possible or needed here; the only "fix" would be deciding which template's mechanism these belong to, which is exactly the kind of invented mapping I've been told not to make.

**2. Valid families, structurally outscored** — `LOGIC_CATALYST_VISIT`, `LOGIC_CIRCULAR_RETURN`.
`logic` is picked by `sortByScore(character-match×4 + archetype-match×3 + conflict-match×3)`. Both families genuinely exist in the ontology and their supporting archetypes/characters genuinely do get resolved for real situations (traced concretely: `ARCHETYPE_MAGICAL_DISCOVERY` → `SIT076`/`SIT124`; `CHAR003`/`CHAR013` → 41 situations combined) — but every one of those characters/conflicts is single-family, always paired with a character+conflict that share some broader family (e.g. `LOGIC_TRIAL_AND_ERROR`, scoring 4+3=7 vs. `CATALYST_VISIT`'s archetype-only 3). This is a property of the scoring model itself, not a missing entry — there's no single semantically-justified addition that fixes it without asserting a new claim about some character/conflict's thematic identity.

**3. Ontology/domain mismatch** — `LOGIC_THRESHOLD_CROSSING`.
9 archetypes list it, but none of the 9 (`GREAT_JOURNEY`, `EXPEDITION`, `TIME_ADVENTURE`, etc.) are ever selected for any of the 156 situations — archetype selection filters on `characterMissionTypes ∩ archetypeMissionTypes`, and this whole cluster is journey/quest-themed while the situation library is everyday domestic/school content. The mismatch is at the content-domain level (an entire archetype cluster whose narrative shape doesn't match what's in the situation library), not a fixable ontology entry. Blocks T13 and T19.

**4. Genuine need+logic co-occurrence gap** — `T10`.
Both `NEED_SELF_REGULATION`/`NEED_CONFIDENCE` (23 situations) and `LOGIC_PERSPECTIVE_SHIFT` (34 situations) are common individually, but the exact pairing never co-occurs on any of the 156 real blueprints. Nothing to wire — the data simply doesn't contain a situation shaped that way yet.

**Verdict: no resolver scoring, ontology compatibility, or template mapping changes applied.** Every path traced back to either a content/mechanism-design decision or a scoring-model/domain characteristic, not a narrow wiring bug — none clear the "semantically justified by existing data, not invented" bar. `storyTemplates.json` and `phase6-app.js`'s resolver/selector code are unchanged since the 46/47 baseline above.

---

## 1. Selector reliability — done, process defined for ongoing curation

`runSelectorReachabilityRegression.js` (new, `phase8-tools/`) replaces the ad hoc `tmp_selector_audit*.mjs` scratch scripts as the permanent tool. It's driven entirely by `storyTemplates.json`'s `bestForSituations` — no hardcoded case list — so it automatically covers whatever Dev B curates next with zero changes to this file. Current run: **PASS** on both checks (156 active situations scanned, T16/T21/T22/T23 all reachable, all lock via the natural path).

**Process going forward, for every template Dev B locks:** once a template's situation list is final, add it to `bestForSituations` in `storyTemplates.json` (data-only change), then run `node public/prana-story-generator/phase8-tools/runSelectorReachabilityRegression.js`. It fails (non-zero exit) if the new template doesn't cleanly claim its own situations, or if adding it knocked an *already*-curated template off its situations (e.g. a new collision like the T13/T19/T21 `THRESHOLD_CROSSING` risk flagged in the original audit).

## 2. The 28% fallback — diagnosed, not a selector-signal problem

Investigated the 44 situations that don't hit an exact-fit tier. They split into two unrelated groups:

- **17 are Phase 6/7 resolution failures** (the situation never produces a blueprint at all) — not a selector issue, a data/resolver issue, out of scope for this track.
- **23 are genuine selector fallbacks**, and every single one of them has the same cause: their `needId` (`NEED_SAFETY` ×14, `NEED_CONTENTMENT` ×8, `NEED_AUTONOMY` ×1) **does not appear in any template's `bestForNeeds` at all** — not "outscored," entirely absent from the taxonomy. Checked all 23: 0 had a need that exists anywhere in `storyTemplates.json`.

This means **no selector algorithm change can fix this** — there's no stronger signal to add in code, because the underlying need dimension these situations rely on has zero template coverage. Two real fixes exist, both content decisions I'm not making unilaterally since they change what a template "means":
- (a) Map `NEED_SAFETY`/`NEED_CONTENTMENT`/`NEED_AUTONOMY` onto whichever existing template's mechanism genuinely fits (e.g. does `NEED_SAFETY` belong on T11 "Countdown" or T15 "Unexpected Helper"? Debatable, not something to guess into `bestForNeeds` silently), or
- (b) these needs simply don't have a template yet, and belong in Dev B's queue.

I added one safe, non-editorial infra change: `selectStoryTemplate`'s `selectionReason` already documents which tier matched, so this gap is now fully diagnosable per-situation from `runSelectorReachabilityRegression`'s natural-selector output rather than being invisible. No `storyTemplates.json` `bestForNeeds` values were changed.

**Question for you:** do you want me to propose a specific need→template mapping for NEED_SAFETY/CONTENTMENT/AUTONOMY, or hold this for whoever's deciding new template mechanisms?

## 3. Production integration — found a bigger issue than expected, need your call before I touch it

Traced the real "Generate My Story" button (`generateCurrentStory` → `buildStoryArtifacts`, [phase6-app.js:9275](public/prana-story-generator/phase6-app.js#L9275)) end to end.

**Finding: it doesn't call the template system at all.** `buildStoryArtifacts` uses the pre-template pipeline (`buildCompleteStoryMaster` straight off the Story Plan) — no `selectStoryTemplate`, no T01–T23, nothing. Every call site of `buildStoryArtifactsWithTemplate`/`buildStoryArtifactsWithEventPlanner` (the template-aware pipeline) is explicitly dev/pilot/QA-only — one of them is even commented `// does not affect the live Generate flow`. So this isn't "natural selection works but only forced paths reach it" — **the entire T01–T23 template system, including this whole session's T16/T21/T22/T23 realization work, has never been reachable by a real user, forced or natural.** It only exists inside QA scripts.

**Good news on feasibility:** I checked field-by-field whether `buildStorySession`/`summarizeArtifactReadiness` (what actually renders the reader and gates "is this story ready") care which pipeline produced the artifacts — they don't; they read generic field names (`lockedFinalStory`, `narrationLayer`, `illustrationAssetsResult`, etc.) that exist identically in both pipelines' output shape. A swap is structurally plausible.

**Gap that would break it if swapped naively:** `buildStoryArtifactsWithEventPlanner`'s tail (`runUnchanged8BThroughPhase9`) never computes `exportResult`/`exportValidation` — those two fields are only computed inline in the old `buildStoryArtifacts`, not in the shared tail function the template pipeline reuses. `summarizeArtifactReadiness` checks `artifacts.exportValidation.status === "PASS"` as one of its required gates. Swap the button's call today and **every single story would report "not ready: Export"** and never open, regardless of story quality.

This is a real production-behavior change (every user's generation path) with a concrete blocking gap, so I stopped here rather than pushing it through. Two ways to close the gap, roughly equal effort:
- Add the same `exportResult`/`exportValidation` computation to `runUnchanged8BThroughPhase9` (or right after it in `buildStoryArtifactsWithEventPlanner`) so both pipelines produce identical shape.
- Or make `summarizeArtifactReadiness`'s Export check conditional on whether the pipeline populates it at all (looser, but doesn't touch the shared tail).

**How do you want to sequence this?** Options: (1) I close the export gap and do the actual button swap now, behind nothing — since natural selection now works correctly per §1, this is the last blocker to going fully live; (2) same fix, but gate behind a state flag/dev toggle first for a staged rollout rather than flipping every user over immediately; (3) hold the swap entirely this session and just leave this diagnosis for a dedicated follow-up given the blast radius. I'd lean toward (2) given this is the first time the template pipeline has ever seen real traffic, but it's your call.

## 4. Regression harness — done

`phase8-tools/runSelectorReachabilityRegression.js` (new) — the two checks described in §1, generic over whatever's curated. Exit code 0/1 for CI.

Combined with the existing `runCorpusQualityAudit.js` (forced-template story-QA, still 0 FAIL, unaffected by anything in this session), the full regression posture for future template curation is now:
1. Curate `bestForSituations` for the new template.
2. `runSelectorReachabilityRegression.js` — confirms it's naturally reachable and locks.
3. `runCorpusQualityAudit.js` — confirms forced-path story quality (Dev B's existing gate, unchanged).

No single existing check previously covered "is this template even selectable by a real user" — that was the actual gap behind T16/T21/T22/T23 never firing naturally, and it's now closed for any template Dev B adds going forward.
