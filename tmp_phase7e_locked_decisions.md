# Phase 7E — Locked Decisions on the Template-Layer Architecture

Status: **design/planning artifact only**. No code, T01–T20 JSON, Phase 6 data, F01–F05 definitions,
7B Story Plan schema, Event Planner, or Phase 8/9 files were touched. This document executes four
decisions Madhurima made after reviewing `tmp_phase7d_template_layer_redesign.md`, plus one
cross-cutting rule. Inputs read in full before writing this: `tmp_phase7b_expanded_story_plan_test.md`,
`tmp_phase7c_template_mapping_and_compression.md`, `tmp_phase7d_template_layer_redesign.md`, and
`public/prana-story-generator/phase8-data/storyTemplates.json` (T01, T04, T17, T19 read in full;
others skimmed as needed, per 7C/7D's earlier full reads).

---

## Decision 1 — F02 template selection test: T17 vs T01 vs T04 on SIT143 and SIT148

**Status: FLAGGED — T17 does not win both tests clearly.**

### Method

Both situations' actual F02 Story Plans were pulled from `tmp_phase7b_expanded_story_plan_test.md`
(§2 SIT143, §3 SIT148) and walked slot-by-slot into T01, T04, and T17's real `requiredBeats` /
`repetitionPattern` / `requiredBlueprintSlots` from `storyTemplates.json`.

### SIT143 (NOTICE→INVESTIGATE→DISCOVER→CONNECTED_DISCOVERY; explicitly zero obstacle by design)

| Template | Fit |
|---|---|
| **T01** Cumulative Trail | Fails cleanly. T01's mechanic is a literal, mandatory 3x-repeated refrain that re-lists every prior item verbatim (`repetitionPattern.variationRule`). SIT143's plan has no spoken refrain anywhere — it would have to be authored fresh, exactly the "artificial device forced in" 7D warned about. It also receives the DISCOVER/CONNECTED_DISCOVERY beats (bin proximity, bird) awkwardly: these are new *interpretive* information, not new *items in the list*, so ENCOUNTER_3→PATTERN_BREAK→DISCOVERY doesn't cleanly receive them either. |
| **T04** Question Chain | Fails cleanly. Requires 3 literal spoken questions (`OPENING_QUESTION/QUESTION_2/QUESTION_3`) plus 3 clues — 8 slots total. SIT143's plan has 4 events and zero dialogue/spoken-question content; filling 8 slots from 4 events means both inventing a spoken-question device the plan never uses AND padding content that isn't there. |
| **T17** Secret Mission | Strains, does not cleanly fit. `MISSION_GIVEN`≈NOTICE (loose — "mission" implies an assigned task; SIT143's opening is an unbidden ambient event, not an assignment), `CLUE_1`≈INVESTIGATE (second wrapper found — plausible). But `OBSTACLE_1` and `OBSTACLE_2` are **required beats** with no corresponding content anywhere in SIT143's plan — this situation was deliberately built by 7B to run with **zero obstacle beyond Kavi's own uncertainty** ("no antagonist to overcome, only a discovery to make," 7B §2). T17 requires two obstacle beats "tied to the false belief" that F02 doesn't have and that this specific situation explicitly doesn't contain. Filling both would mean inventing conflict the Story Plan never asked for — a different kind of forcing than T01/T04's refrain/question, but forcing nonetheless. |

**SIT143 verdict: no clean receiver among the three.** T17 avoids the refrain/spoken-question
problem but introduces its own — synthetic obstacles in a situation 7B purpose-built to have none.

### SIT148 (NOTICE→INVESTIGATE→DISCOVER→CONNECTED_DISCOVERY; owner arrives only at the end)

| Template | Fit |
|---|---|
| **T01** Cumulative Trail | Fails cleanly, differently than for SIT143. T01's mechanic assumes accumulation of **separate discrete items** (a growing list). SIT148 is the opposite shape: **one object**, gaining deeper attributes/context each beat (initials → matched name → memory of the search). There is nothing to "re-list" — the refrain device has no content to operate on at all. |
| **T04** Question Chain | Best of the three on content-shape grounds — each of SIT148's beats genuinely *does* narrow a mystery toward a single revelation, which is T04's actual mechanic (each clue raises a sharper implicit question). But it still requires literal spoken questions 3 times; SIT148's plan carries the whole chain through observation and memory, never dialogue. The 3-clue/3-question slot count (6 slots before revelation) also outnumbers SIT148's real event count (4), so at least one question/clue pair per situation would need inventing even after the spoken-question device is forced in. |
| **T17** Secret Mission | Closest structural resemblance of the three, per 7D's own read — but re-scrutinized against the *real* obstacle requirement, not just the clue/revelation shape. `MISSION_GIVEN`≈NOTICE, `CLUE_1`≈INVESTIGATE (initials). `OBSTACLE_1` is where 7D's own SIT148 walkthrough got vague ("the gap before recognizing the regular") — that's not an obstacle in T17's sense (`sceneStructure`: "something gets in the way, tied to the false belief"); it's just time passing, not a blocking complication. `CLUE_2`≈DISCOVER/CONNECTED_DISCOVERY (the memory). `OBSTACLE_2` has **no candidate content in the plan at all** — there is no second obstacle in SIT148, soft or otherwise. `REVELATION`≈CONNECTED_DISCOVERY, `RESOLUTION`≈return. Two of T17's seven required beats (`OBSTACLE_1`, `OBSTACLE_2`) have to be authored from nothing. |

**SIT148 verdict: T17 is the least-bad fit but still requires inventing both obstacle beats** —
the SIT148 story plan, like SIT143, was built (correctly, per F02's own locked vocabulary) with no
antagonist. T17's `requiredBlueprintSlots` list includes `obstacle` as required, which is a direct
structural mismatch with F02's actual event vocabulary (`NOTICE/INVESTIGATE/DISCOVER/
CONNECTED_DISCOVERY` — no obstacle token anywhere in it).

### Cross-cutting finding

All three templates were originally built around the pre-7B Blueprint assumption that every story
has `belief.falseBelief`/`belief.trueBelief` — confirmed again here (all three list it as
`required`), which is the same schema mismatch 7C/7D already flagged generally. That mismatch
alone would need resolving regardless of which template wins F02 (see Decision 4's cross-cutting
rule below).

### Verdict

**T17 does not win both tests clearly and is not LOCKED as F02's default.** It is measurably better
than T01 (wrong mechanic — accumulation of *discrete items* vs. F02's deepening of *one thread*) and
better than T04 (no forced spoken-question device, closer clue/revelation shape) — but it fails the
task's own bar ("does it cleanly receive all 4 event beats?") because its two required `OBSTACLE`
beats have no content to draw from in either tested F02 situation, both of which were deliberately
authored antagonist-free. **This is surfaced for Madhurima's judgment**, with a specific
recommendation attached: T17 is the best of the three existing templates and could be adopted as a
*documented, imperfect* default with its `OBSTACLE_1`/`OBSTACLE_2` beats redefined as "the delay or
uncertainty before the next clue lands" (soft, internal, not an antagonist) rather than dropped or
force-filled with invented conflict — but that redefinition is itself a template-editing decision
outside this paper task's scope, not something to silently assume here. The purpose-built
alternative already on paper (7D Part 3, "The Reframe Trail" — see also Decision 2 below for the
analogous F05 case) remains the structurally cleaner option and should be weighed against "T17 +
redefinition" rather than treated as settled either way.

---

## Decision 2 — F05 gets a purpose-built template (not T19), 7-slot spec locked

**Status: LOCKED.**

### Corrected spec

7D's Part 3 "Disrupted Plan" mechanic said "6 slots" in its slot-count line but then listed 7
items including a terminal resolution slot — an internal inconsistency. **The corrected, locked
spec is 7 slots, exactly this sequence:**

```
1. EXPECTATION        — the explicit, stated plan (F05's OPENING STATE.plan, verbatim)
2. DISRUPTION_1        — first external, plan-breaking event; establishes a KIND of disruption
3. REACTION             — hero's first coping response, tried in service of keeping EXPECTATION alive
4. DISRUPTION_2        — second external, plan-breaking event; MUST differ in KIND from DISRUPTION_1
                          (not merely "worse," but structurally different — e.g. ambient/ongoing vs.
                          sudden/acute, per SIT099's noise-crowd vs. announcement pairing)
5. RESTORE_ATTEMPT      — a genuine, real attempt to keep or recover the original plan (not a token
                          gesture) — this is where a supporting character, if present, most often
                          co-acts (e.g. SIT099's parent encouraging Kavi to push on)
6. RESTORE_FAILS        — the attempt genuinely fails; the original plan is confirmed unsurvivable
                          as designed, not merely paused
7. ADAPTATION/RESOLUTION — a materially different, adapted plan emerges and is shown resolving,
                          not narrated as a moral ("Kavi learned that plans can change")
```

**Explicit clarification per the task's requirement:** F05's 7A-locked event vocabulary is
`EXPECTATION / DISRUPTION / REACTION / RESTORE_ATTEMPT / RESTORE_FAILS` — five tokens, not seven.
This 7-slot template does **not** introduce new event types. It is a specific, mandatory
**repetition/sequencing pattern** of the existing five tokens: `DISRUPTION` occurs twice
(as `DISRUPTION_1` and `DISRUPTION_2`, required to differ in kind) with exactly one `REACTION`
positioned between them, and `RESTORE_ATTEMPT`/`RESTORE_FAILS` each occur once, following the
second disruption. The slot names `DISRUPTION_1`/`DISRUPTION_2` are template-layer labels for
"first/second occurrence of the `DISRUPTION` event type in this specific order," not new tokens
added to F05's locked vocabulary. `EXPECTATION` and the closing `ADAPTATION/RESOLUTION` slot map
onto F05's `EXPECTATION` token and 7B's own `RESOLUTION/NEW STATE` (§11) respectively — the latter
is a 7B structural part already present for every Form, not an F05-specific addition either.

### What each slot is structurally responsible for (analogous to T03/T16's definitions in 7D)

- **EXPECTATION** — states the plan concretely enough that its later disruption is legible as a
  disruption (per 7B's own note: SIT099's plan was "visit the toy shop first, then get a treat" —
  specific, not vague). Responsible for giving the reader something to hold in mind that will later
  visibly break.
- **DISRUPTION_1** — introduces the first external, plan-breaking cause. Responsible for
  establishing a *kind* (ambient/ongoing, sudden/acute, social, sensory, etc.) that DISRUPTION_2
  must NOT repeat.
- **REACTION** — shows the hero's first coping attempt, distinct from RESTORE_ATTEMPT in that it
  is a smaller-scale, immediate response (e.g. "push through," "cover ears") rather than the larger,
  more deliberate restoration effort that comes later. Responsible for establishing the hero is
  actively coping, not passive, before the second disruption lands.
- **DISRUPTION_2** — a second, kind-differing plan-breaker. Responsible for the moment the plan's
  survivability is seriously in question, and for proving DISRUPTION_1 wasn't a one-off.
- **RESTORE_ATTEMPT** — a genuine, effortful attempt (often with a supporting character's help,
  per SIT099) to keep the original EXPECTATION alive. Responsible for making the eventual failure
  feel earned, not a foregone conclusion — the attempt must be real.
- **RESTORE_FAILS** — confirms the attempt did not work; the plan-as-designed is not survivable.
  Responsible for the hard pivot point: nothing about this slot is optional or softenable, since
  F05's whole identity (per 7B/7C/7D's repeated finding) is that the restore attempt must genuinely
  fail before adaptation is legitimate.
- **ADAPTATION/RESOLUTION** — a materially different plan is shown resolving. Responsible for
  demonstrating (not asserting) that "the plan changed" is itself the successful outcome, not a
  consolation.

### Why T19 cannot satisfy this (verified against T19's real structure)

`T19` ("Choice at the Crossroads") requires: `APPROACH_CROSSROADS / OPTION_OLD_BELIEF /
OPTION_NEW_BELIEF / CHOICE / CONSEQUENCE / RESOLUTION` — 6 beats, and its own `repetitionNote`
states explicitly: **"T19 is a single-decision template — its power depends on there being ONE real
crossroads, not several diluted mini-choices."** This directly and structurally rules it out for
F05 for three independent reasons, verified against the real JSON:

1. **T19 has no mechanism for two disruptions differing in kind.** Its whole shape is a single
   `APPROACH_CROSSROADS` moment with two *simultaneously available* options shown side-by-side
   (`pageRhythmGuidance`: "a true side-by-side spread... simultaneous and real rather than
   sequential"). F05 requires two *sequential, externally-caused* disruptions of different kinds —
   there is no slot in T19 that could hold a second, distinct disruption without violating T19's
   own single-crossroads rule.
2. **T19 has no distinct RESTORE_ATTEMPT / RESTORE_FAILS pair.** T19's `CHOICE` beat is a single
   decisive moment ("hero chooses, deliberately and visibly, rather than drifting into a
   decision") — it does not model an attempt that is made, tried in earnest, and then **fails**.
   F05's defining structural feature (independently confirmed by 7C, 7D, and this test) is that
   the restore attempt must genuinely fail before adaptation is earned; T19's `CHOICE`→`CONSEQUENCE`
   pattern instead assumes the choice itself directly produces the consequence, with no failed
   intermediate attempt modeled at all.
3. **T19's `OPTION_OLD_BELIEF`/`OPTION_NEW_BELIEF` beats are belief-shaped**, requiring
   `belief.falseBelief`/`belief.trueBelief` in `requiredBlueprintSlots` — a field F05 explicitly
   does not have (7B LOCKED SCHEMA, F05 = "no belief/assumption field at all," carries an explicit
   `plan` instead). Even setting aside structure (1) and (2), T19's content requirements are
   incompatible with what F05 Story Plans actually supply.

7D's Part 2 already flagged T19 as "not a full F05 match... has no explicit '≥2 disruptions
differing in kind' mechanism" — this re-check against T19's actual JSON sharpens that into three
concrete, independently disqualifying structural mismatches, not one soft gap.

### Naming

Per the task's instruction to use judgment: **this is ready to be assigned an ID.** The decision to
build purpose-built rather than reuse T19 is locked, the 7-slot structure is fully specified and
directly derived from F05's own already-locked vocabulary (no invented content categories), and the
"why not T19" argument is now concrete rather than provisional. Proposing **T21 — "The Disrupted
Plan"** as the ID/name. **Flagged explicitly: this ID/name assignment is a naming proposal only,
not yet approved** — no template JSON was created or edited; `T21` does not exist anywhere in
`storyTemplates.json` and this document does not add it there.

---

## Decision 3 — Formal template selection layer (paper spec only)

**Status: LOCKED** (as an architecture/process spec — no code written, per the task's scope).

### Stage 1 — ELIGIBILITY (Form → eligible template pool)

A lookup table, `FORM → [template IDs]`, populated from 7D's full re-audit (Part 2) plus this
document's Decision 1/2 findings:

| Form | Eligible pool |
|---|---|
| F01 Trying | T03 (default), T08, T09, T11 (if timed), T12 (weak/optional), T13, T18 (narrow), T19 (decision-shaped variant), T07 (cast-gated, 3 actively-responding characters) |
| F02 Discovery | T17 (documented imperfect default, per Decision 1), T01 (accumulation-shaped only), T04 (reveal-shaped only), T06, T15 (object/clue-assumption variant) — plus the proposed purpose-built F02 mechanic once/if assigned an ID |
| F03 Shift in Seeing | T16 (default), T02, T04 (secondary), T05, T10, T12 |
| F04 Connection | T05 (when ending can be staged as a second comparable encounter), T15 (bent fit), T14 (cast-gated: parallel-struggle second character), T07 (cast-gated, 3 actively-responding characters) |
| F05 Unexpected Turn | **T21 "The Disrupted Plan"** (LOCKED default per Decision 2), T19 (documented partial secondary, missing the ≥2-disruptions mechanism) |

Cross-Form entries (T05, T07, T20) appear in more than one Form's pool by design — per 7D, their
eligibility is genuinely Form-spanning (T05, T07) or situation-gated rather than Form-gated (T20,
gated on literal departure/return — see Stage 2).

### Stage 2 — FIT SCORING (within the eligible pool)

Three scoring inputs, applied in this order — **hard gates first (eliminate), then soft factors
(rank the survivors)**:

**Hard gates (eliminate a candidate entirely if failed — binary, not scored):**
1. **Cast-composition gate.** If a template's own structural precondition names an exact cast
   requirement (e.g. T07 requires 3 actively-responding supporting characters; T14 requires a
   second character with a parallel struggle), and 7B's CAST field (§3) does not supply it, the
   candidate is eliminated — not down-ranked. This directly encodes 7D's Part 1 rule that "a
   template may say 'this beat, if a co-actor exists, is theirs' but must never require a specific
   number or role of supporting character beyond what 7B already supplied."
2. **Situation-content gate (T20-specific, generalizable).** T20 ("Return With Something New")
   requires a literal physical departure from, and return to, a starting place
   (`DEPARTURE → CHALLENGE → DISCOVERY → TRANSFORMATION → RETURN → ECHO_ENDING`). For T20 to be
   eligible in practice, the **situation-level signal that would need to exist** is a boolean-ish
   flag on the situation/Story Plan — proposed name: `involvesPhysicalDepartureAndReturn` — set
   true only when 7B's OPENING STATE and RESOLUTION/NEW STATE describe the hero at two different
   named locations with a clear "away and back" structure (not merely a change of room within one
   scene). Absent that signal, T20 is gated out regardless of Form. This is the concrete answer to
   7D's Open Question 1 for T20 specifically — the same pattern (a named situation-level signal a
   template declares as a precondition) generalizes to any other situation-gated template found
   later.
3. **Belief/assumption field mismatch gate.** Per the cross-cutting lint rule below: a template
   whose `requiredBeats`/`turningPoint` description hard-requires belief-shaped content the Form
   doesn't supply (e.g. any of the 16 legacy templates, for F01/F02/F05 Story Plans) is gated out
   *unless* the template has been updated per Decision 4's lint rule to make that content optional
   pass-through. Until such updates happen, this gate effectively narrows every Form's pool to
   templates already compatible or explicitly documented as needing the pass-through fix first —
   this is a real, current limitation, not a future hypothetical (see "7D+7E combined status" below).

**Soft scoring factors (rank remaining candidates, do not eliminate):**
1. **Story Plan shape match** — event count vs. template beat count (closer counts score higher;
   large mismatches require more merge/split, per 7C Part 2's density-adaptation mechanism, and
   should rank lower, not be gated, since merge/split is an allowed Phase 8 operation).
2. **Solo-story check** — if `supportingCharacters.length === 0` (7B's solo-story rule), templates
   whose `requiredBeats` assume a co-actor in a specific slot (T07, T14, and Decision 1's T17 in
   its OBSTACLE beats when those are written as an antagonist rather than an internal delay) score
   lower, since forcing a co-actor into a solo plan violates 7B's cast-size rule ("padding cast
   size... is explicitly disallowed").
3. **Structural-device fit** — does the candidate require an authorial device (refrain, spoken
   question, mirror restaging) that the Story Plan's actual events don't naturally supply? Score
   down for each required device with no supporting content (this is the concrete, mechanical
   version of Decision 1's test — "does it need an artificial refrain/spoken-question device
   forced in").
4. **Template-declared structural preconditions** — any explicit precondition a template states
   (e.g. "requires exactly 2 characters," "requires a comparable before/after scene" for T05) is
   checked; full satisfaction scores highest, partial/strained satisfaction scores lower but is not
   automatically gated (distinguishing "harder to write" from "structurally impossible," which is
   what Stage-1-style hard gates are for).

### Stage 3 — SELECTION

- **Winner:** the highest-scoring candidate remaining after all hard gates. 
- **Tie-break rule:** prefer (a) the Form's documented *default* over a *secondary* (per the
  eligibility table above — e.g. T16 over T05 for F03 when both score equally, since T16 is
  confirmed as the near-exact structural match and T05 is a legitimate but device-heavier
  alternate); then (b) the candidate requiring fewer invented/authorial devices (fewest
  hard-to-satisfy soft factors above); then (c) if still tied, flag for human selection rather than
  auto-breaking further — a coin-flip tie-break is explicitly rejected as inappropriate for a
  content-shaping decision.
- **Empty pool after gating — fallback/escalation behavior:** this must not silently crash or
  force a plan into an ill-fitting template. Defined behavior: **flag the Story Plan for human
  template authoring/selection**, with the specific gate(s) that emptied the pool attached to the
  flag (e.g. "F05 plan, cast-composition gate eliminated T07/T14, situation-content gate eliminated
  T20, no other eligible F05 templates besides T21/T19 exist and both were already in the pool but
  scored below a viability floor" — a concrete, debuggable reason, not a generic error). This
  replaces "engine randomly/arbitrarily picks among eligible templates" with a deterministic,
  auditable process end-to-end: every selection (or non-selection) traces to a specific gate or
  score, and every failure to select produces an actionable flag rather than a silent fallback to
  a wrong template.

---

## Decision 4 — Symbol as a production input, not a Story Form field

**Status: LOCKED.**

### Name chosen: `productionInputs`

Two candidate names were considered — `storyAssets` and `productionInputs`. **`productionInputs`
is chosen.** Justification: "assets" (as in `storyAssets`) risks being read as narrative content
(the kind of thing a writer invents), which is exactly the confusion this decision exists to
prevent — symbol *does* carry meaning in the finished story, so a name implying it's inert asset
data could still tempt a future implementer to let it drift into Story Plan territory. `productionInputs`
signals more precisely what this sibling structure actually is: material the *production* stage
(Template + Event Planner + Phase 8/9) consumes as **input from a locked upstream source (Phase 6)**,
parallel to but explicitly separate from the Story Plan's own authored content. This also reads
correctly for the extensibility requirement below — "future presentation inputs" are naturally
`productionInputs`, not naturally "assets."

### What it resolves from Phase 6, and extensibility

For the current pipeline, `productionInputs` resolves exactly one field:

```
productionInputs: {
  symbol: <resolved from Phase 6's symbol data for this situation/blueprint>
}
```

**Extensible by design, not by promise:** `productionInputs` is defined as an open object, not a
single-field struct, specifically so that future Phase 6 presentation assets (illustration style
hints, a recurring visual motif beyond the symbol, color/mood tags, or anything else Phase 6
resolves that governs *how the story is presented* rather than *what the story is about*) can be
added as new keys without redesigning this structure or touching the Story Plan schema again. The
only membership rule for anything added here in the future: **it must never be information a
future generator could use to alter FORM, belief/assumption, turning point, cast, or any other 7B
emotional-architecture field.** If a future asset type doesn't clear that bar, it doesn't belong in
`productionInputs` either — it needs its own decision, not a default slot.

### Confirmation this is NOT a Blueprint-architecture reopening

The old pre-7B Blueprint format (referenced throughout 7C/7D as `situation`, `character`, `need`,
`belief.falseBelief/trueBelief`, `mission`, `storyActions`/`obstacle`/`symbol`/`world`) was a single
undifferentiated bag that conflated emotional architecture (belief) with production detail (symbol,
world) with plot mechanics (obstacle, mission) — the actual root cause of the mismatch 7C/7D spent
most of their length diagnosing. `productionInputs` is explicitly **not** a re-creation of that bag:

- It carries **zero** emotional-architecture content — no belief, no assumption, no turning point,
  no cast, no event chain. Every one of those fields stays exactly where 7B already locked them:
  inside the Story Plan, populated (or explicitly not populated) per Form, per the LOCKED SCHEMA.
- It is explicitly scoped to **presentation/production** material only — the kind of thing a
  template's `symbolIntegrationPoint` or `illustrationOpportunities` field consumes, never the kind
  of thing a template's `turningPoint` or `sceneStructure` beat consumes.
- It does not replace or shadow any 7B field. A future implementer cannot use `productionInputs` to
  "smuggle" belief-shaped content past the 7B schema's Form-gating (F01/F02/F05 = no belief field)
  by putting it here instead — the membership rule above exists specifically to block that failure
  mode.

### Where it attaches in the pipeline

```
Phase 6 Blueprint
    │
    ├──► 7A Story Form (F01–F05)
    │        │
    │        ▼
    │   7B Story Plan  ◄── belief/assumption, cast, event chain — Story-Plan-only, per LOCKED SCHEMA
    │        │
    │        │   (Story Plan generation does NOT read symbol/production data —
    │        │    keeps 7B's emotional architecture insulated, per the LOCKED SCHEMA's
    │        │    existing principle that Phase 6 belief data is "background input only")
    │        ▼
    └──► productionInputs  ── resolved from Phase 6 directly, IN PARALLEL to 7B, carried
             │                alongside (not merged into) the Story Plan
             ▼
    Template + Event Planner  ◄── receives BOTH the 7B Story Plan AND productionInputs
             │                    as two separate, clearly-labeled inputs — never flattened
             │                    into one object
             ▼
        Phase 8 prose
```

`productionInputs` is resolved from Phase 6 **at the same pipeline stage 7B's own belief/assumption
background data is already resolved** (per 7B's LOCKED SCHEMA: "Phase 6 belief data may inform
planning as background/input material only") — i.e., it is available from Phase 6 onward and is
carried through, unchanged in kind, until it reaches the Template + Event Planner stage where a
template's `symbolIntegrationPoint` actually needs it. It is **not** generated by 7B and **not**
generated by the Template layer — it is a straight Phase-6-to-production carry-through, which is
what makes it structurally different from both the Story Plan (authored/derived at 7B) and a
template's own fixed content (defined once in `storyTemplates.json`).

---

## Cross-cutting requirement — belief/assumption schema lint rule

**Status: LOCKED** (as a named, checkable rule — enforcement mechanism/tooling not built, per scope).

### Rule name: `no-hard-belief-requirement`

**Definition:** A future template-authoring lint/validation step must reject any new or edited
template definition where:

1. `requiredBeats`, `sceneStructure`, `turningPoint`, or `resolutionPattern` text treats
   `belief.falseBelief`/`belief.trueBelief` (or any equivalent belief-shaped field) as content a
   beat **must** contain, for a Form where 7B doesn't supply it — i.e. F01, F02, or F05. (Per 7D
   Part 4's redefinition: a compliant beat description reads as "the turning point's `statement`
   (7B §8) is delivered here," not "the true belief surfaces here.")
2. Any assumption-consuming logic (a template or downstream Event Planner code path built for F04's
   `assumption` field) silently accepts a `belief`-shaped input in its place, or vice versa — F03's
   `belief` and F04's `assumption` are locked as distinct in narrative weight (7B LOCKED SCHEMA §2)
   and a template must not treat them as interchangeable just because they might occupy an
   analogous schema position.
3. `requiredBlueprintSlots` (or its future equivalent) lists `belief.falseBelief`/`belief.trueBelief`
   as **required** rather than **optional pass-through** for a template whose eligible-pool Forms
   (per Decision 3's Stage 1 table) include any Form without a belief field.

### Legacy status — explicit, not glossed over

7D's Part 2 re-audit found **16 of the 20 existing templates** currently declare
`belief.falseBelief`/`belief.trueBelief` as a hard `requiredBlueprintSlots` entry (every template
except the ones this document and 7D specifically re-described: even T16, the cleanest F03 match,
needs its slot *label* re-pointed per 7D Part 4 point 4, though not its substance). **These 16 are
LEGACY and are not compliant with `no-hard-belief-requirement` today.** This rule governs:

- Any **new** template (e.g. the F02/F04 mechanics proposed on paper in 7D Part 3, or the T21
  "Disrupted Plan" proposed in Decision 2 above — both already written belief-free by design).
- Any **future edit** to an existing T01–T20 template.

**Bringing the legacy 16 into compliance is explicitly out of scope for this task and is a separate,
not-yet-started future migration.** This document does not attempt it, does not schedule it, and
does not silently assume it has happened — the eligibility/gating logic in Decision 3 Stage 2's
hard gate #3 accounts for this by gating out non-compliant templates rather than assuming
compliance.

---

## 7D + 7E combined status

**The template-layer ARCHITECTURE (ownership model, selection process, asset handoff, lint rule) —
not the content of the 20 templates themselves — is ready to be considered LOCKED, with one
explicit open item carried forward.**

What is locked, end to end:
- **Ownership model** (7D Part 1): what a template owns (beat sequence, pacing, structural device,
  turning-point placement, symbol placement) vs. does not own (emotional architecture, cast
  size/composition, word/page count, the Minimum Story Spine's event list) — fully specified, not
  revisited here because nothing in this task's four decisions contradicted it.
- **F01, F03 defaults** (T03, T16) — confirmed strong matches, unchanged since 7C/7D.
- **F05 default** — LOCKED this document, as T21 "The Disrupted Plan," 7-slot spec, purpose-built,
  verified against T19's real structure as the reason a purpose-built template is needed.
- **Selection process** (Decision 3) — three-stage ELIGIBILITY → FIT SCORING → SELECTION spec is
  fully defined, including tie-breaking and the empty-pool fallback (flag for human authoring,
  never silent-crash or force-fit).
- **Production-asset handoff** (Decision 4) — `productionInputs` fully specified, scoped, and
  placed in the pipeline; confirmed not a Blueprint-architecture reopening.
- **Lint rule** (`no-hard-belief-requirement`) — named, defined, scoped to new/edited templates,
  with the 16-template legacy gap explicitly acknowledged as a separate future task.

**What remains explicitly open (not blocking the architecture, but blocking full T01–T20 wiring):**

1. **F02's default template is FLAGGED, not LOCKED** (Decision 1). T17 is the best of the three
   tested candidates but requires inventing obstacle content in both antagonist-free test
   situations. This needs Madhurima's judgment call: adopt T17 with a documented `OBSTACLE`
   redefinition (soft internal delay, not antagonist), or invest in the purpose-built F02 mechanic
   already drafted on paper in 7D Part 3 ("The Reframe Trail"). Nothing else in this document
   depends on this being resolved first — Decision 3's eligibility table lists T17 as F02's
   *documented* (not locked) default precisely to reflect this.
2. **F04 has no LOCKED default either** — out of this task's four decisions by scope (only F02 and
   F05 were named), but worth flagging alongside item 1 since it's the other Form 7D identified as
   lacking a clean match (T15, bent fit) or requiring cast-gating (T05, T14, T07). This document
   did not re-test F04 candidates the way Decision 1 re-tested F02's — that remains open per 7D's
   own Open Question 2/3 framing, now narrowed to "F04 specifically" since F05 is resolved here.
3. **The legacy-16-templates belief-requirement migration** is a known, scoped, deliberately
   deferred task (per the lint rule section above) — not open in the sense of "undecided," but open
   in the sense of "not started, and blocking those 16 templates from passing the lint rule until
   it happens."

None of these three open items are architectural gaps — the architecture that would resolve them
(the selection process, the lint rule, the ownership model) is itself fully specified. They are
content-authoring and content-migration tasks that the now-locked architecture is designed to
receive, once each is done.
