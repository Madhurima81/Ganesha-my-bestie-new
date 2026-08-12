# V2-07 Countdown / Resource Pressure — Validation Handoff
## Date: 2026-08-12 · Dev C

Branch: `codex/v2-07-countdown-pressure` (based on `bea3dad`, prod).

Scope executed: ONLY V2-07. `git diff bea3dad --stat` shows exactly one
production file touched (`public/prana-story-generator/phase6-app.js`) plus
this doc. No legacy template was modified. No selector/ontology/taxonomy
file was modified. V2-02 was not touched (inspected read-only via
`git show codex/v2-02-ritual-escalation:...`; that branch is currently
identical to `bea3dad` — it carries no established pattern yet, so this
implementation follows the codebase's own existing curated-mode-framing
convention instead, see "Implementation" below).

---

## 1. The 21 situations and their genuine V2-07 modes

Source: `V2_MECHANISM_TO_SITUATION_ADJUDICATION_2026-08-12.md`, section 1
("Strongest V2 mechanism" = V2-07), 21 rows. Modes below were derived from
reading each situation's actual `storySeed` (not invented for symmetry) —
see `V2_07_MODE_BY_SITUATION` in `phase6-app.js`.

**Mode 1 — FEARED_THRESHOLD** (a specific dreaded/awaited event is
approaching on a real clock; false belief: rushing/bracing is the only way
through):
- SIT023 Monsters under the bed
- SIT025 Fear of going on stage or presenting
- SIT026 Anxiety before a big test or result
- SIT027 Injections at the doctor
- SIT075 Forgot lines in a play
- SIT112 Waiting very excitedly for birthday/special package
- SIT128 Waiting anxiously for exam results

**Mode 2 — CLOSING_WINDOW** (a season of together-time/normalcy is ending on
a fixed calendar and cannot be gotten back):
- SIT024 Parent leaving for a long trip
- SIT117 A parent starts a new job with different hours
- SIT121 Summer ending and school starting again

**Mode 3 — SCARCE_TURN** (someone else currently holds the turn/
attention/service window; the protagonist's own turn is not guaranteed to
come around the same way):
- SIT086 Parent on work call when child wants to share something
- SIT090 A classmate got the teacher's excited praise
- SIT101 Long wait at doctor, bank, or during travel
- SIT108 Waiting for a turn on the swings

**Mode 4 — MOUNTING_PRESSURE** (the shrinking resource is the child's own
energy/margin across one over-scheduled day, not an external event):
- SIT100 Too many classes — tuition, sport, music all in one day
- SIT110 The 'before dinner' energy crash

**Mode 5 — NARROWING_DECISION** (a live, closing window to act/decide well
before the chance to do it right passes):
- SIT035 Overthinking imaginary future dangers
- SIT061 Made a mistake in front of the class
- SIT092 Friend went on a fancy international vacation
- SIT148 Found something and doesn't know whether to keep it
- SIT158 Friend apologises after hurting them

### Flagged as questionable against the V2-07 collision rule

Per the task's collision rule ("V2-07 applies only when urgency/scarcity is
doing the causal work, not just 'story has a deadline or waiting'"), the
following 4 of the 21 look mis-fit on inspection of their actual
`storySeed`. They were **implemented as V2-07 anyway** (not silently
reassigned, per instructions), but Dev A should independently re-adjudicate:

- **SIT148** "Found something and doesn't know whether to keep it" — reading
  `storySeed.emotionalTension` ("Kavi imagines what it would be like to keep
  the object while also wondering how the owner must feel"), this is a moral
  fork (keep vs. return), not a shrinking-time story. It reads far more like
  **V2-10 Threshold Choice** than a countdown.
- **SIT158** "Friend apologises after hurting them" — accepting/weighing an
  apology is not naturally time-pressured in the source data; it reads
  closer to a **V2-04 Inversion** (the assumption that the friendship can't
  be repaired gets overturned) or **V2-12** (quiet capacity to forgive) than
  a resource-depreciation story.
- **SIT090** "A classmate got the teacher's excited praise" — the actual
  emotional engine is comparison/fixation on someone else's spotlight, which
  is **V2-11 Attention Shift**'s signature, not scarcity of time.
- **SIT092** "Friend went on a fancy international vacation" — same
  comparison/envy shape as SIT083/SIT089/SIT127 (the "Enoughness Under Lack"
  cluster the residual adjudication identified), not a countdown.

All four were still built with mode-appropriate, situation-grounded V2-07
prose (NARROWING_DECISION for SIT148/SIT158/SIT092, SCARCE_TURN for SIT090)
so nothing is left unhandled, but their placement should be revisited before
this is treated as final selector policy.

---

## 2. Realization contract / beat structure

Per the locked architecture (`V2_TEMPLATE_ARCHITECTURE_MAP_2026-08-12.md`):

- **False belief shape**: acting faster is safer; slowing down wastes the
  remaining chance.
- **True belief shape**: a deliberate pause can improve the quality of the
  final action.
- **Required beats** (implemented exactly): `COUNTDOWN_OPENING` (scaffold
  beat, same convention T16/T21/T22/T23 use for their opening beat) ->
  `COUNTDOWN_3` -> `COUNTDOWN_2` -> `PRESSURE_PEAK` -> `PAUSE_CHOICE` ->
  `COUNTDOWN_1` -> `RESOLUTION`.
- **Causal test enforced in code**: `PAUSE_CHOICE` must literally show the
  pause ("Wait," ... paused ...) and `COUNTDOWN_1` must carry the
  `trueBelief` text — both are asserted in `validateEventChain`'s new
  `V2-07` branch (see below), not just narrated as an afterthought.

Every beat is grounded in that situation's own `storySeed.immediateObstacle`
/ `storySeed.emotionalTension` (with the "Kavi" placeholder hero substituted
for the resolved protagonist), not a shared generic sentence — this is what
makes same-mode situations (e.g. all 7 FEARED_THRESHOLD situations) read as
different stories rather than noun-swapped copies. See sample text in
section 4.

---

## 3. Implementation — what changed, where

All changes are in `public/prana-story-generator/phase6-app.js`.

**Key finding before implementing**: the file has THREE distinct
"complete story" code paths. The one actually used by natural generation
(`generateCurrentStory()` -> `buildStoryArtifactsWithEventPlanner()`, and
the one every phase8-tools QA script drives) is
`buildEventChainV2()` -> `buildTemplateSpecificEventChain()` ->
`writeProseFromEventChain()`. The OLDER "legacy 23 family realizer" path
(`buildStoryArtifactsWithTemplate()` -> `buildCompleteStoryMasterFromFamilyRealizer()`,
where the pre-existing legacy `T11` / `LOGIC_RESOURCE_DEPRECIATION` lives)
is **not called by natural generation at all** — confirmed by an early
implementation attempt that hooked the wrong seam and never fired (verified
against real corpus-dump output before finding the correct seam). This
matters for Dev A: any future V2 mechanism must hook
`buildTemplateSpecificEventChain` / `writeProseFromEventChain`, not the
family-realizer functions, or it will silently be dead code.

Changes made, in file order:

1. **`V2_07_MODE_BY_SITUATION`** (new, ~line 8267) — the 21 situation-id ->
   mode map from section 1 above, plus `getV207SituationId(ctx)` and
   `isV207Situation(ctx)` helpers.
2. **`inferCountdownPressureFrame(ctx)`** (new) — reads
   `ctx._lookups.situation.storySeed` directly (the event-planner `ctx`
   shape has no top-level `ctx.storySeed`, unlike the legacy family-realizer
   `ctx` shape — this was a real bug caught and fixed during QA, see
   section 5), substitutes the resolved protagonist for the seed's "Kavi"
   placeholder, and returns the 7-part frame (`opening`, `count3`, `count2`,
   `pressurePeak`, `pause`, `count1`, `resolution`) for whichever of the 5
   modes the situation belongs to.
3. **`buildV207CountdownEventChain(ctx)`** (new) — builds the 7
   `templateBeat()` events (`COUNTDOWN_OPENING` through `RESOLUTION`) in the
   same shape `buildTemplateSpecificEventChain`'s T16/T21/T22/T23 branches
   already use, returning `{ events, ctx, templateId: "V2-07", planForLint }`.
4. **`buildEventChainV2(template, blueprint, storyPlan, libraries)`**
   (existing function, minimally edited) — after building `ctx`, added:
   `if (isV207Situation(ctx)) return buildV207CountdownEventChain(ctx);`
   before the existing `buildTemplateSpecificEventChain(...)` call. This is
   the actual live seam: it overrides whichever legacy template the
   (untouched) selector naturally picked, for exactly the 21 V2-07
   situations, and changes nothing for any other situation.
5. **`validateEventChain(...)`** (existing function, minimally edited) —
   added a `V2-07` branch requiring the 7 labels above, plus the two causal
   assertions described in section 2.
6. **`writeProseFromEventChain(...)`** (existing function, minimally
   edited) — added a `V2-07` branch that prints `event.action` directly for
   every beat except `COUNTDOWN_OPENING`, which also prepends
   `realizedSituation.sentence` + `heroWant` + the false-belief line (same
   convention as T16/T21/T22/T23's opening beats, needed for the downstream
   concrete-word-coverage QA check).
7. **`assertTemplateAfterWriting(...)`** (existing function, minimally
   edited) — the pre-existing consistency check
   (`completeStoryMaster.templateUsed !== templateSelection.templateId`)
   did not know about the intentional V2-07 override and flagged every
   V2-07 story as a false "template drift" failure. Added a one-line
   exception for `templateUsed === "V2-07"`. This is a narrow fix to a
   check tightly coupled to my own seam's behavior, not a QA threshold or
   shared QA library change.

The pre-existing legacy `T11` function (`buildT11CompleteStoryMaster`,
`inferResourceDepreciationFrame`) and the whole family-realizer dispatch
chain were **left completely untouched** — they are simply unreachable dead
code for these 21 situations now (as they already were unreachable for
everything, per the finding above).

---

## 4. Sample output (real, from natural generation)

SIT023 (FEARED_THRESHOLD), naturally selected legacy template T11,
overridden to V2-07:

> Arin sees a shadow under the bed and imagines a monster hiding there. Arin
> wanted to find out whether the monster is real and feel safe enough to
> sleep. The old thought came quickly: "My imagination can control me."
> There was no way to make the moment arrive later, and Arin could feel it
> getting closer with every minute. Arin first tried to outrun the feeling
> by rushing — hurrying through the last minutes as if speed alone could
> make the dread smaller — but Arin's imagination keeps turning ordinary
> shadows into frightening shapes. [...] Arin stopped pushing and took one
> real breath instead [...] Arin paused and said, "Wait," before spending
> what was left of the window well. [...] Arin walked into the moment
> steadier than any of the rushed minutes before it, because the pause —
> not the hurrying — had made the readiness real.

SIT110 (MOUNTING_PRESSURE), naturally selected T18, overridden to V2-07:

> Near dinner time, Kavi is hungry and tired after a long day and becomes
> increasingly irritable while waiting for food. [...] There was barely a
> gap between one thing ending and the next one starting, and dinner is not
> ready yet. Kavi first tried to push straight through [...] Kavi pushed
> again the same way through the next stretch of the day, and hunger and
> tiredness make ordinary frustrations feel much bigger. [...] Kavi finished
> the day from that steadier place and felt the difference, because the one
> real pause had changed more than another burst of forced energy ever
> could.

These two share a template-selection accident (both naturally land on
different legacy templateIds, T11 vs T18) but read as clearly different
stories — different mode, different obstacle language, different resolution
— because both are grounded directly in their own `storySeed`, not a shared
sentence pool.

---

## 5. QA results (real tool output, V2-07 scope only)

Tooling used: `public/prana-story-generator/phase8-tools/runFullCorpusProductionReadiness.js`
(the full 156-situation natural-pipeline gate: Complete story -> Pagination
-> Narration -> Dialogue -> Polish -> **Story QA** -> Illustration plan ->
Prompt pack -> Layout -> **Production QA** -> Export) and
`dumpFullCorpusForVisualAudit.js` (human-readable text dump), both run
against real `node` execution driving a headless Chromium instance via
Playwright — no forced/templated ("T07"/QA-matrix) output was used as
evidence anywhere in this handoff.

Of the 21 V2-07 situations, **5 fail Phase 6/7 resolution before reaching
any template** (SIT035, SIT090, SIT100, SIT117, SIT121) — this is
pre-existing, unrelated to this change (confirmed: these same 5 are in the
"Resolution failures (Phase 6/7, not selector)" list both before and after
this branch's changes; selector/taxonomy files were never touched). The
remaining **16 situations naturally resolve to a legacy templateId**
(T11/T15/T03/T23/T18/T16/T22, per the untouched selector) **and are then
routed through the V2-07 seam.**

**Iteration history (real, not cherry-picked)**:
1. First implementation attempt hooked the wrong (dead) code path — 0 of
   the 16 actually ran V2-07 prose despite `templateUsed` claims; caught by
   diffing real corpus-dump text against the intended frame text.
2. Second attempt (correct seam) initially dropped 16/139 -> 123/139 on the
   full gate, all failing at "Complete story", because
   `assertTemplateAfterWriting` didn't recognize the intentional
   `templateUsed: "V2-07"` override as valid — fixed per section 3 item 7.
3. Third pass surfaced one real Story QA failure: SIT110 failed QA-002
   ("protagonist takes meaningful action" — required a specific verb from a
   fixed list) and QA-007 ("emotional arc closure" — same verb-list check
   on the last page). Root cause: my MOUNTING_PRESSURE and
   NARROWING_DECISION resolution sentences didn't happen to contain any of
   the QA's recognized action verbs. Fixed by rewording those two
   resolution lines (no QA threshold or rule was touched — the story text
   was fixed to earn a real pass).
4. Also caught and fixed mid-QA: `inferCountdownPressureFrame` initially
   read `ctx.storySeed`, which does not exist on the event-planner `ctx`
   shape (only `ctx._lookups.situation.storySeed` does) — every beat was
   silently falling back to generic placeholder text
   ("Arin felt the moment closing in") instead of real situation facts.
   Fixed before any QA numbers below were captured.

**Final state (after all fixes, real tool output)**:

- **Full 156-situation production gate**
  (`runFullCorpusProductionReadiness.js`): **139/139 pass every gate
  end-to-end** — identical to the `bea3dad` baseline count recorded in the
  prod commit message ("Template pipeline release candidate — 139/139
  production-readiness validated"). 17 situations still fail Phase 6/7
  resolution (pre-existing, unrelated to V2-07 — same 17 as baseline). 0
  regressions outside V2-07's 21 situations.
- **Story QA** (part of the same gate, `storyQAReport.status`): **PASS for
  all 16 resolving V2-07 situations**, including the SIT110 case that
  initially failed QA-002/QA-007 and was fixed (see above).
- **Production QA** (part of the same gate,
  `productionQAReport.status === "PRODUCTION_READY"`): **PASS for all 16**.
- **C13**: no dedicated "C13" script exists under `phase8-tools/`; nothing
  in that directory matches that name. If "C13" refers to a specific
  document/checklist Dev A tracks outside this repo, it was not run here —
  flagged as an open item below. **This handoff makes no C13 claim, global
  or scoped.**
- **Blind read**: `buildBlindEditorialReviewPack.js` exists but builds a
  fixed, hand-picked situation list unrelated to the V2-07 set (confirmed by
  reading its `CASES` array — none of the 21 V2-07 situations are in it).
  No blind-read tool in this repo accepts an arbitrary situation list, so no
  blind-read score can be honestly reported for V2-07 specifically without
  either editing that tool's fixed case list (out of scope for "only touch
  V2-07-related code") or a human reviewer manually reading the section-4
  samples and the full 16-story dump. **Flagged as an open item.**
- **Natural vs. forced**: every number above came from `selectStoryTemplate`
  natural selection (`buildStoryArtifactsWithEventPlanner` with no
  `forcedTemplateId`), the same call shape `generateCurrentStory()` uses for
  real users. No `forceSelectStoryTemplate` / QA-matrix forced path was used
  as evidence anywhere in this handoff.

---

## 6. Open questions / risks for Dev A

1. **Re-adjudicate the 4 flagged situations** (SIT148, SIT158, SIT090,
   SIT092 — section 1) against V2-10 / V2-04 / V2-11 before this is treated
   as locked selector policy. They currently produce coherent V2-07 prose
   but may not be the mechanism's best home.
2. **The dead legacy family-realizer path** (`buildStoryArtifactsWithTemplate`
   / `buildCompleteStoryMasterFromFamilyRealizer`, holding `T01/T02/T04/T05/
   T07/T08/T09/T11/T12/T14/T15/T18`) appears entirely unused by natural
   generation today. Worth confirming intentionally, since it's a
   significant amount of code (and the pre-existing `T11`
   countdown/resource-depreciation logic specifically) that no longer runs.
   Not touched or removed here — out of scope for a V2-07-only change.
3. **C13 and blind-read tooling gap**: neither exists in a form that can be
   pointed at an arbitrary situation set (including V2-07's 21). If C13/
   blind-read are hard requirements before "promotion" per the V2
   Acceptance Gate, Dev A needs to either build/extend that tooling or do a
   manual read of the 16-story sample in `docs/prana-story-generator/` (not
   generated as a file here to avoid manufacturing a false "passed C13"
   signal — the sample text is in section 4 and reproducible any time via
   `node public/prana-story-generator/phase8-tools/dumpFullCorpusForVisualAudit.js`).
4. **5 pre-existing Phase 6/7 resolution failures** among the 21 (SIT035,
   SIT090, SIT100, SIT117, SIT121) mean V2-07's real-world natural coverage
   is currently 16/21, not 21/21 — same root cause blocking their sibling
   legacy templates today (confirmed unrelated to this change; selector/
   taxonomy untouched).
