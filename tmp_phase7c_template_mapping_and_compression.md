# Phase 7C — Template Mapping (T01–T20) & Compression/Page Architecture Layer

Status: **design/planning artifact only**. Nothing in T01–T20, Event Planner, Phase 8/9 code, or the F01–F05/7B locked definitions was touched. This document is a proposal for human review.

Inputs read in full before writing this:
- `tmp_phase7b_expanded_story_plan_test.md` — LOCKED 7B schema (11-part Story Plan) + 9 tested plans, used as the authoritative input spec.
- `public/prana-story-generator/phase8-data/storyTemplates.json` — the actual, already-existing T01–T20 template library (all 20 found and read in full; not invented).

**All 20 templates (T01–T20) exist and are fully specified** — each has `storyMechanic`, `requiredBeats`, `sceneStructure`, `repetitionPattern`, `turningPoint`, `resolutionPattern`, `requiredBlueprintSlots`, `symbolIntegrationPoint`, `illustrationOpportunities`, `pageRhythmGuidance`, `exampleSkeleton`. This is good news for Part 1 — there is a real, documented library to map against, not a gap to fill.

**One structural fact about the existing templates that matters for everything below:** every template's `requiredBlueprintSlots` includes `belief.falseBelief` / `belief.trueBelief`, and every `sceneStructure`/`turningPoint`/`resolutionPattern` is written assuming a single false-belief → true-belief arc, sourced from the OLD Phase 6 Blueprint format (pre-7A/7B). This predates the 7B-locked belief/assumption split (F03=`belief`, F04=`assumption`, F01/F02/F05=no belief field at all). That mismatch is not fixable by this document — it's flagged in Part 3.

---

## PART 1: T01–T20 Template Mapping

### Method

For each Form, I compared the Form's locked event vocabulary (from 7B/7A) against each template's `requiredBeats` + `storyMechanic`, looking for genuine structural correspondence — not theme/mood similarity. A template only counts as an eligible match if its beat sequence and turning-point mechanism actually correspond to the Form's event chain shape, not just its emotional flavor.

### F01 — Trying (`ATTEMPT` / `CONSEQUENCE`)

**Best match: T03 "Three Tries"** — near-exact structural match.
- `ATTEMPT_1/CONSEQUENCE_1/ATTEMPT_2/CONSEQUENCE_2/TURNING_POINT/ATTEMPT_3/RESOLUTION` maps almost 1:1 onto F01's repeating `ATTEMPT/CONSEQUENCE` pairs plus a turning point before the final (winning) attempt.
- T03's rule "each occurrence must use a genuinely different action verb/approach" is the *same* rule 7B's F01 stress-test data independently derived ("strategy must differ, not just wording") — this is strong independent confirmation, not coincidence.

**Secondary/situational match: T11 "The Countdown"** — usable when an F01 situation has an explicit time/resource limit (not all F01 situations do). Its `PAUSE_CHOICE` beat is a stricter, higher-stakes version of T03's `TURNING_POINT`. Recommend restricting T11 to F01 plans whose OPENING STATE names an actual ticking constraint (e.g. "bedtime is minutes away" in SIT045) rather than using it as a default F01 template.

**Also plausible but weaker: T18 "The Growing Problem"** — only fits F01 situations where each `CONSEQUENCE` is specifically the *previous attempt making things worse*, not merely "attempt failed." Most F01 plans in the 7B test set (SIT045, SIT168) don't have compounding consequences, so this is a narrow-fit template, not a default.

**F01 verdict:** one strong default (T03), one conditional alternate (T11), one narrow-fit outlier (T18). No zero-match problem for this Form.

---

### F02 — Discovery (`NOTICE` / `INVESTIGATE` / `DISCOVER` / `CONNECTED_DISCOVERY`)

This Form has the weakest single match of the five — flagged explicitly per the task's instruction not to force a fit.

**Partial match A: T01 "Cumulative Trail"** — fits when the discovery is literally additive/accumulating (a growing list of found things), which is exactly SIT143's shape (wrapper → second wrapper → third wrapper → bird). T01's `PATTERN_BREAK → DISCOVERY` beats correspond well to F02's `DISCOVER → CONNECTED_DISCOVERY`. Weak point: T01 is built around a *spoken refrain* restating the growing list ("occurrenceCount: 3... variationRule: each occurrence must literally re-list every prior item"). Nothing in F02's locked event chain requires or implies a spoken refrain — this would have to be an added authorial choice, not something the Story Plan supplies.

**Partial match B: T04 "Question Chain"** — fits the *epistemic* shape of F02 well (each clue deepens the question, culminating in a revelation that connects everything), but T04 is framed around the hero *asking* questions aloud three times, which none of the three tested F02 plans (SIT143, SIT148) actually do — their NOTICE/INVESTIGATE/DISCOVER beats are actions and observations, not spoken questions.

**Partial match C: T13 "Lost → Notice → Found"** — structurally inverted from F02. T13 is "hero loses object, searches, notices something *else*, deeper discovery, object recovered." F02 is "hero notices *something*, investigates, discovers, connects." These are mirror-image shapes (loss-driven vs. notice-driven), not the same mechanic. Only usable for a hybrid situation, not straight F02.

**Verdict — flagged gap:** none of T01/T04/T13 is a true structural match for F02's four-beat `NOTICE→INVESTIGATE→DISCOVER→CONNECTED_DISCOVERY` chain with no obligatory refrain and no obligatory "lost object" frame. The closest is T01 for accumulation-shaped F02 situations (SIT143-type) and T04 for connection/reveal-shaped F02 situations (SIT148-type) — meaning F02 likely needs *two* different template choices depending on sub-shape, or (more honestly) needs a **new T21 "Notice → Connect"** template built to F02's actual locked vocabulary rather than reusing an old one. I am flagging this rather than forcing SIT148 into T13 or T04 to make Part 1 look complete.

---

### F03 — Shift in Seeing (`EVIDENCE` / `CONTRADICTION` / `OTHER_PERSPECTIVE` / `BELIEF_UNCERTAIN`)

**Best match: T16 "Two Ways to See It"** — strong match, arguably the cleanest mapping in this whole document.
- T16: `EVENT → INTERPRETATION_1 (false belief) → EVIDENCE_GATHERING → INTERPRETATION_2 (true belief) → RESOLUTION`.
- F03: `EVIDENCE → CONTRADICTION → OTHER_PERSPECTIVE → BELIEF_UNCERTAIN → (turning point) → resolution`.
- The correspondence: F03's `EVIDENCE` beat = T16's `INTERPRETATION_1` (belief seems confirmed); F03's `CONTRADICTION` + `OTHER_PERSPECTIVE` beats together = T16's `EVIDENCE_GATHERING`; F03's `BELIEF_UNCERTAIN` sits exactly where T16 expects the hero to hold uncertainty before `INTERPRETATION_2` crystallizes. This is the only Form/template pair in this document where all four locked event labels map cleanly onto four (or clusters of) template beats with no leftover.

**Secondary match: T12 "The Almost-Right Path"** — fits F03 situations that are more about *judgment among options* than *reinterpreting one ambiguous event* (neither SIT083 nor SIT051 needed this, but a hypothetical F03 situation built around "which explanation is right" rather than "what really happened" could use it). Recommend as an alternate, not a default.

**F03 verdict:** the cleanest 1:1 Form→Template match in the set (T16), with a legitimate secondary option (T12) for situations shaped more like a judgment call than a re-seen event.

---

### F04 — Connection (`ENCOUNTER` / `INITIAL_RESPONSE` / `REVEAL` / `DEEPER_NOTICE` / `CHANGED_RESPONSE`)

**Best match: T15 "The Unexpected Helper"** — approximate, not exact; genuine gap noted.
- T15: `PROBLEM → ASSUMPTION → DISMISSAL → SECOND_LOOK → UNEXPECTED_CONTRIBUTION → RESOLUTION`.
- Loose correspondence: F04's `ENCOUNTER` ≈ T15's `PROBLEM`+`ASSUMPTION` (Kavi's assumption about the classmate is the concrete form of T15's "dismissal-worthy" assumption); F04's `INITIAL_RESPONSE` ≈ T15's `DISMISSAL` (the assumption appears confirmed, or the dismissed party seems unhelpful); F04's `REVEAL` ≈ T15's `SECOND_LOOK`; F04's `DEEPER_NOTICE`+`CHANGED_RESPONSE` ≈ T15's `UNEXPECTED_CONTRIBUTION`+`RESOLUTION`.
- Where it strains: T15 is built for the hero *underestimating a helper's competence to solve a problem* (the "unlikely helper" trope). F04 is about the hero *misreading another person's emotional need* (the assumption/reveal is about what the other character wants, not what they can contribute). These are adjacent but not identical mechanics — T15's `symbolIntegrationPoint` ("Symbol belongs to the unexpected helper... until the resolution") and its whole "someone dismissed as unable to help" framing doesn't fit SIT166 or SIT089 cleanly, where the other character isn't dismissed as unhelpful, they're misread as needing something they don't need.

**Secondary/partial match: T07 "Three Guides"** — only fits F04 situations with more than one supporting character offering different responses (SIT089 has 2: Mama + baby, but the baby correctly has no agency per the 7B plan, so effectively 1 active character — T07 doesn't apply there). Would fit a hypothetical F04 situation with 2+ *actively responding* supporting characters. Neither tested F04 plan (SIT166, SIT089) qualifies.

**Verdict — flagged near-gap:** T15 is usable but is a bent fit, not a real match. Recommend flagging F04 for the same kind of scrutiny as F02 — a purpose-built template (e.g. "T22: Misread → Reveal → Recalibrate") would fit the locked F04 vocabulary far more precisely than adapting T15's helper-competence framing to an emotional-misread story.

---

### F05 — Unexpected Turn (`EXPECTATION` / `DISRUPTION` / `REACTION` / `RESTORE_ATTEMPT` / `RESTORE_FAILS`)

**No good match found. Flagged explicitly, per the task's instruction not to force a fit.**

I checked all 20 templates against F05's specific hard rule set (an explicit plan, ≥2 disruptions differing in *kind*, a genuine restore attempt that *fails*, and only then an adapted/different outcome):
- **T11 "The Countdown"** is the closest by mood (urgency, resource depletion, a pause-choice) but its resource *depletes on a fixed schedule the hero controls the pacing of* (3-2-1 attempts/time) — it has no concept of an external, plan-disrupting event, let alone two disruptions of different kinds. It also has no `RESTORE_FAILS` equivalent; T11's whole arc succeeds on the final attempt, whereas F05's defining structural feature is that the restore attempt must genuinely **fail** before adaptation.
- **T18 "The Growing Problem"** shares the shape "something goes wrong, gets worse, hero must pause and change tack" but its mechanic is a single escalating problem the hero *ignored*, not an external plan being disrupted twice by different, ambient causes the hero didn't create or ignore.
- **T09 "Smallest Strength"** and **T15 "Unexpected Helper"** both have a "big attempt fails, then something else works" shape close to `RESTORE_ATTEMPT → RESTORE_FAILS → adaptation`, but neither has F05's required *explicit stated plan* and *two disruptions differing in kind* — both are single-inversion templates (per their own `repetitionNote` fields), while F05 is structurally a two-disruption template.

**Verdict — real gap.** F05 (Unexpected Turn) currently has **zero good template matches** in T01–T20. This should not be forced into T11, T18, T09, or T15 — each breaks a specific F05 hard rule (fails to fail; only one disruption; no explicit plan). This is the single clearest "flag it, don't force it" case that the task anticipated, and SIT099's own acceptance-test note in the 7B document ("this is the least compressible plan in the set... every event is required by an explicit F05 hard structural rule") independently supports why no existing template — none of which were designed around a *plan-disruption* mechanic — would hold F05's shape without distortion.

---

### Summary table

| Form | Best match | Fit quality | Secondary option | Notes |
|---|---|---|---|---|
| F01 Trying | T03 Three Tries | Strong / near-exact | T11 Countdown (if timed) | independently confirms 7B's "strategy must differ" rule |
| F02 Discovery | T01 Cumulative Trail *or* T04 Question Chain | Partial, sub-shape dependent | T13 (inverted, weak) | recommend a new template; flagged gap |
| F03 Shift in Seeing | T16 Two Ways to See It | Strong / near-exact | T12 Almost-Right Path | cleanest 1:1 mapping found |
| F04 Connection | T15 Unexpected Helper | Weak / bent fit | T07 Three Guides (2+ active supporting chars only) | recommend a new template; flagged near-gap |
| F05 Unexpected Turn | **none** | **No good match** | — | requires a new template built to F05's plan-disruption vocabulary |

Three of five Forms (F01, F03, and partially F02) have a workable existing template. Two (F04, F05) do not have a genuine structural match in the current T01–T20 set and should not be forced.

---

### How does a 7B event chain map onto a template's slots? (general rule)

A 7B FORM-SPECIFIC EVENT CHAIN event has four fields: `label` (the Form's vocabulary token), `actor`, `action`, `newInformationOrShift`. A template beat (from `requiredBeats`/`sceneStructure`) is a *slot*, not prose. The mapping rule proposed:

1. Each 7B event's `label` is matched to the template beat whose `sceneStructure` description most closely paraphrases that label's function (not name-matched literally — 7B's vocabulary and a template's `requiredBeats` names rarely match verbatim, as shown above).
2. The event's `action` (verb-first, what the actor does) becomes the seed for that beat's actual page content in Phase 8 — the template slot is the *container*, the 7B event is the *content poured into it*.
3. The event's `newInformationOrShift` field is what Phase 8 must make legible on the page — this is effectively the per-beat compression-floor content (see Part 2).
4. 7B's `TURNING POINT` (§8) always maps onto whichever single template beat that template's own `turningPoint` field designates — this is a hard alignment point, not a loose one, because both 7B and every template independently insist the turning point must arise from *preceding* events, never be inserted fresh.
5. 7B's OPENING STATE.`belief`/`assumption` (F03/F04 only) has no clean home in the current templates, because every template's blueprint slots assume `belief.falseBelief`/`belief.trueBelief` exist for *every* Form (see Part 3 — this is a real schema mismatch, not just a mapping nuance).

---

### Worked example 1 — SIT045 (F01, 1 character) → T03 "Three Tries"

| 7B Story Plan (§7, §8) | T03 slot | Content poured in |
|---|---|---|
| EVENT 1 `ATTEMPT` — Kavi tears through the toy box | `ATTEMPT_1` | frantic, obvious-first search |
| EVENT 2 `CONSEQUENCE` — nothing found, panic ticks up | `CONSEQUENCE_1` | escalation without resolution |
| EVENT 3 `ATTEMPT` — Kavi retraces the day systematically | `ATTEMPT_2` | genuinely different strategy (systematic vs. frantic) — matches T03's rule that Attempt 2 must not repeat Attempt 1's approach |
| EVENT 4 `CONSEQUENCE` — car checked, out of places | `CONSEQUENCE_2` | old belief ("I need the object") feels confirmed |
| EVENT 5→6 (self-comfort attempt, panic eases) — 7B's TURNING POINT | `TURNING_POINT` | 7B's own turning-point trigger (EVENT 5→6) lands exactly on T03's turning-point slot — hero pauses, true belief surfaces ("the comfort was never in the blanket") |
| NEW CHOICE/ACTION — Kavi settles into bed using self-wrap | `ATTEMPT_3` | acting from the true belief, not trying harder |
| RESOLUTION/NEW STATE — Kavi sleeps without it | `RESOLUTION` | goal reached because Kavi changed, not because the object was found |

Notably, 7B's own MINIMUM STORY SPINE note ("events 1–2 together could compress to one beat without losing the essence") aligns with T03's `pageRhythmGuidance` ("give Attempt 1 and Attempt 2 roughly equal page weight" — implying they're each substantial enough to be a full beat, but the note in 7B suggests they could be *merged* under a tight word budget, which is a Phase 8 compression decision, not a template-structure violation, since T03's `requiredBeats` still technically has both ATTEMPT_1 and CONSEQUENCE_1 present even if compressed onto fewer pages/sentences).

### Worked example 2 — SIT083 (F03, 2 characters) → T16 "Two Ways to See It"

| 7B Story Plan (§5, §7, §8) | T16 slot | Content poured in |
|---|---|---|
| OPENING STATE.belief — "the newest, shiniest thing is automatically the best" | (informs) `INTERPRETATION_1` framing | the lens through which EVENT is read |
| EVENT 1 `EVIDENCE` — everyone crowds the new toy, Kavi's own looks boring | `EVENT` + `INTERPRETATION_1` | the ambiguous event, read through the false belief |
| EVENT 2 `CONTRADICTION` — half the group wanders off bored | (feeds) `EVIDENCE_GATHERING` | first crack in interpretation 1 |
| EVENT 3 `OTHER_PERSPECTIVE` — friend is anxious, guarding the toy, not enjoying it | `EVIDENCE_GATHERING` (core content) | this is literally new evidence about the same event, gathered by observing the friend |
| EVENT 4 `BELIEF_UNCERTAIN` — Kavi isn't sure anymore | (bridges into) `INTERPRETATION_2` | held uncertainty before the reframe — T16 doesn't have an explicit slot for this, it's absorbed into the EVIDENCE_GATHERING→INTERPRETATION_2 transition |
| EVENT 5 (revealing moment) — Kavi's own toy reassessed | `INTERPRETATION_2` | "the new thing isn't more fun, it's just more fragile" — the same original event (a toy being new vs. familiar) now read differently |
| TURNING POINT (trigger: EVENT 3→5) | (embedded across `EVIDENCE_GATHERING`→`INTERPRETATION_2`) | T16 has no single discrete turning-point beat separate from the interpretation-shift itself — the shift *is* the turning point, matching 7B's own trigger description spanning 3→5 |
| RESOLUTION/NEW STATE — others join Kavi's game | `RESOLUTION` | shown via action (kids moving toward Kavi), matching T16's explicit rule: "should show, not state" |

One friction point worth naming: 7B's EVENT 4 (`BELIEF_UNCERTAIN`) doesn't have a clean home as its own T16 beat — T16 only has `EVENT / INTERPRETATION_1 / EVIDENCE_GATHERING / INTERPRETATION_2 / RESOLUTION`, five slots for 7B's six events. This is consistent with 7B's *own* compression note on this exact plan ("Event 4 is the safest compression point... can be folded into event 5") — the template's slot count and 7B's own flagged safe-compression event line up, which is a good sign the mapping is sound rather than lossy.

---

## PART 2: Compression / Page Architecture Layer

### What compresses vs. what must never be cut

Per the user's locked correction: **word/page count is exclusively a Phase 8 constraint.** Neither 7B nor T01–T20 encode a word budget anywhere in their schema (confirmed by inspection — no template has a `wordCount`/`pageCount` field; `requiredBeats` and `sceneStructure` are structural, not length-bearing). Phase 8's job is compression *within* the fixed structure that 7B + the chosen template already established.

**Never cut (the floor):**
- Every event in the Story Plan's **MINIMUM STORY SPINE** (7B §12) — by definition, this is already the pre-compressed floor; 7B has done the first compression pass at the planning layer, and Phase 8 must not compress below it.
- The **TURNING POINT** (§8) — always, no exceptions across all 9 tested plans.
- The **EMOTIONAL CHANGE** (§10) — need not appear as narrated text (7B says so explicitly), but must be *evidenced* by surrounding action/dialogue that survives compression.
- **Actor attribution** on every spine event — 7B's Part C fragility notes repeatedly stress that an event's `actor` field (HERO vs. supporting character vs. co-action) is load-bearing; compressing "Mama turns around and explains" down to a passive "then Kavi felt reassured" would silently erase Mama's action and violate the CHARACTER AGENCY rule referenced throughout Part C.
- Any event a Form's **hard structural rule** requires and that a plan's own spine note flags as non-cuttable — e.g. SIT099/F05's two disruptions "differing in kind" (both required by the F05 hard rule, both spine-marked as load-bearing, zero safe-compression point identified anywhere in that plan).

**Allowed to compress/shrink:**
- Description, sensory detail, transitions between beats.
- Secondary beats a Story Plan's own MINIMUM STORY SPINE note explicitly flags as a safe cut — every one of the 9 tested plans in the 7B document already names its own safe-compression point (e.g. SIT045 events 1–2 mergeable, SIT083 event 4 foldable into event 5, SIT168 event 3/4 pair compressible). This is a major finding: **7B plans already self-annotate their safe compression points** — Phase 8 doesn't need to independently discover them, it needs to read and respect them.
- Illustration-only beats a template marks as visual/atmospheric rather than plot-bearing (e.g. T03's "symbol glimpsed but not understood" in Attempts 1/2 is decorative, not spine).

### How does compression know it has violated the spine? (concrete checkable rule)

**Proposed rule:** *For every event listed in the Story Plan's MINIMUM STORY SPINE (§12), there must exist at least one sentence or clearly identifiable narrative beat in the final Phase 8 prose whose actor, action, and new-information match that spine event.* If a spine event has zero corresponding beat in the prose — not paraphrased, not implied, genuinely absent — compression has failed for that story.

This is checkable because 7B's own spine entries are already written as short, atomic, single-action statements (see every plan's §12 in the test document) — each is inherently testable against prose as a yes/no presence check, not a fuzzy quality judgment.

A secondary, stricter version of the same rule for the two load-bearing sub-elements that are easy to silently lose in compression:
- **Actor-attribution check**: for every spine event with a non-HERO or co-action actor (e.g. SIT166 EVENT 3 `actor: classmate`), the prose must show that actor performing the action, not merely reference the outcome. (This directly operationalizes the "characters doing things, not hero doing everything" acceptance-test question that's already in every 7B plan.)
- **Turning-point presence check**: the TURNING POINT's `trigger` events and `statement` must both be traceable in the prose — trigger present as action, statement present as the hero's realization (stated or clearly enacted).

### Where word/page count actually gets enforced, and how it interacts with fixed template slots

Confirmed by re-reading all 20 templates: **none of them specify a page count.** `pageRhythmGuidance` gives qualitative guidance ("give X roughly equal weight," "let Y breathe over 1–2 pages," "keep pages visually busy... then shift to calm") — never a fixed number of pages or a word count per beat. This confirms the user's framing is already consistent with how the templates are actually built, not something this document needs to invent: **templates fix the *beat sequence and shape*, not the *page or word budget*.**

This means the interaction between a template's fixed slots and a variable-length Story Plan is **density adaptation, not slot-count negotiation**:
- A template's `requiredBeats` count is fixed (T03 always has 8 named beats; T16 always has 5). A 7B event chain's event count varies by Form and plan (SIT045 has 6 events; SIT166 has 5; SIT168 has 6 across 4 characters).
- When a 7B plan has *more* granular events than a template has beats (as in SIT083→T16, 6 events into 5 slots), Phase 8 merges events into a shared beat — this is exactly what 7B's own compression note already anticipated (event 4 folding into event 5).
- When a 7B plan has *fewer* events than a template's beat count expects (unusual but possible), Phase 8 would need to expand a single 7B event across multiple template beats using description/transition material — the "allowed to compress" material working in reverse (expansion instead of compression), still without inventing new spine content.
- A fixed target word/page count (e.g. "24-page picture book, ~50 words/spread") then governs *how much prose density* each already-assigned beat gets — trimming description and transitions per beat — never governs which beats exist. This matches the acceptance-test question already present in all 9 tested 7B plans ("Compressible to 50–70 words without losing essence?") — that question is *already being asked and answered at the 7B planning stage*, meaning 7B plans are pre-validated to survive a real word-budget squeeze before Phase 8 even starts.

### Proposed lightweight QA check (for later programmatic implementation)

Given a Story Plan (JSON, per the locked 7B schema) and its Phase 8 prose output:

1. **Spine coverage check**: for each item in `minimumStorySpine[]`, search the prose for a matching beat (initially: human/LLM-judged presence check per spine item; later, could be a simple structured-tag system where Phase 8 output tags each paragraph/beat with the spine-item ID it satisfies, making this a mechanical lookup rather than a judgment call).
2. **Turning point check**: confirm the TURNING POINT's `trigger` event(s) and `statement` both have a corresponding prose beat.
3. **Actor-attribution check**: for every spine event with actor ≠ HERO, confirm the named actor (not a passive/omitted construction) performs the action in prose.
4. **Belief/assumption weight check** (Form-specific): for F03 plans, confirm `belief` is stated or clearly dramatized in the opening; for F04 plans, confirm `assumption` is present but is *not* over-narrated with F03-level ceremony (per the 7B locked distinction) — this is a good candidate for an automated tone-weight check later, not fully specifiable as pass/fail today.
5. **Output**: PASS / FAIL + list of missing spine items, in the same spirit as the 8-question acceptance test 7B already runs per plan — this QA check is essentially "acceptance test questions 3, 4, 6, 8 run again, this time against actual prose instead of the plan."

This check explicitly does **not** measure word count, page count, or prose quality — those remain Phase 8/9 concerns, kept separate per the user's locked principle.

---

## PART 3: Open Questions / Gaps (surfaced, not resolved)

1. **F05 has zero good template match.** None of T01–T20 models a "stated plan → 2 disruptions differing in kind → genuine failed restore attempt → adaptation" mechanic. A new template (tentatively "T21: The Disrupted Plan") is likely needed before F05 stories can be templated at all. This needs a human decision: build a new template, or relax/reinterpret an existing one (not recommended — every candidate breaks a stated F05 hard rule).

2. **F04's best match (T15) is a bent fit, not a real one.** T15 is built around underestimating a helper's *competence*; F04 is about misreading another person's *emotional need*. Using T15 as-is risks the story's REVEAL beat reading like "surprise, they were secretly useful" instead of "surprise, I misunderstood what they wanted" — a real tonal drift. Needs a decision: accept the bent fit, or invest in a purpose-built F04 template.

3. **F02 needs either two template choices or a new template.** T01 fits accumulation-shaped F02 situations (SIT143); T04 fits reveal/connection-shaped F02 situations (closer to SIT148, though imperfectly); neither fits both sub-shapes cleanly. Whoever builds the Event Planner / template-selection logic needs a rule for choosing between them per-situation, or a single new template that covers F02's actual four-beat vocabulary without requiring a refrain (T01) or spoken questions (T04) that F02's locked structure doesn't call for.

4. **Every existing template's `requiredBlueprintSlots` assumes `belief.falseBelief`/`belief.trueBelief` always exist.** This directly conflicts with the 7B-locked rule that F01, F02, and F05 have **no belief/assumption field at all**, and that F04's is named `assumption` (not `belief`) and must not carry F03's narrative weight. As written, none of T01–T20 could be wired to an F01/F02/F05/F04 Story Plan without either (a) updating every template's required-slots list, or (b) building an adapter layer that maps 7B's `EMOTIONAL CHANGE.startingState/changedState` or `TURNING POINT.statement` into a `belief`-shaped value for templates that hard-require one. This is a real pre-coding decision point, not a cosmetic one — it affects whether T01–T20 can be reused as-is or need a schema pass first.

5. **Templates assume a Blueprint-shaped input (`storyActions`, `obstacle`, `symbol`, `world`, `mission`), not a 7B Story Plan.** Several required/optional blueprint slots (`symbol`, `mission`, `world`) have no explicit corresponding field anywhere in the locked 7B 11-part schema. It's unclear whether these are meant to be pulled from Phase 6 data directly (bypassing 7B), authored fresh at the Template/Event-Chain stage, or added to 7B as a future field. This needs a decision about where `symbol` (used by every single template's `symbolIntegrationPoint`) actually lives in the pipeline going forward.

6. **T05/T20 (mirror/circular-return templates) were not matched to any Form above, and no tested 7B plan needed them.** It's unclear whether this is because no situation in the current 9-plan test set happened to be mirror-shaped, or because 7B's Form vocabulary structurally cannot produce a mirror-opening/mirror-ending shape at all (worth checking against a larger situation sample before assuming these two templates are simply orphaned).

7. **The F02/F04 "owner appears late, payoff must stay about the object" rule** (documented in 7B's LOCKED SCHEMA §4 as a deferred T-layer QA rule) has no home in any template's structure today — none of T01, T04, T13, T15 have a slot or rule that would catch a late-arriving supporting character accidentally carrying emotional weight. Whoever builds the T-layer QA check flagged in 7B will need to design it against whichever template F02 ultimately uses, which is itself unresolved per gap #3 above.

---

## Summary

- **All 20 T01–T20 templates exist and were read in full** — none needed to be invented or assumed.
- **F01 and F03 have strong, near-exact template matches** (T03, T16 respectively) — including independent cross-confirmation of 7B's own structural rules.
- **F02 and F04 have partial/bent matches** requiring either a per-situation template choice (F02) or acceptance of a tonal mismatch (F04).
- **F05 has no good match at all** and likely needs a new template built specifically to its plan-disruption vocabulary.
- **Word/page count is confirmed, by inspection of the actual template fields, to be absent from T01–T20** — templates fix beat structure/shape only, never length — which is fully consistent with the user's locked principle that compression is a Phase 8-only concern.
- **7B plans already self-annotate their own safe compression points** in every tested plan's MINIMUM STORY SPINE section — this is a genuine asset Phase 8 can consume directly rather than having to (re)discover independently.
- The single largest unresolved architectural conflict is **the belief/assumption field mismatch between the 7B-locked schema and every existing template's `requiredBlueprintSlots`** — this needs a decision before any real T01–T20 wiring work starts.
