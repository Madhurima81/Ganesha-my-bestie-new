# Phase 7D — Template Layer Redesign (Story-Plan-Driven Templates)

Status: **design/planning artifact only**. No code, T01–T20 JSON, Phase 6 data, F01–F05 definitions,
Event Planner, or Phase 8/9 files were touched. This document builds directly on the LOCKED 7B
schema (`tmp_phase7b_expanded_story_plan_test.md`) and the prior mapping attempt
(`tmp_phase7c_template_mapping_and_compression.md`), and re-reads all 20 templates in
`public/prana-story-generator/phase8-data/storyTemplates.json` in full before drawing any
conclusion. F01→T03 and F03→T16 remain the only confirmed matches. No new template IDs are
assigned. No adapter/shim is proposed anywhere in this document.

---

## PART 1: What Is a Template, Conceptually (Redefinition)

### The old model (what's breaking)

Every existing template treats a **Blueprint** as its input: `situation`, `character`, `need`,
`belief.falseBelief`, `belief.trueBelief`, `mission`, `storyActions`/`obstacle`/`symbol`/`world`.
Crucially, the false-belief→true-belief pair is *hard-required* by all 20 templates
(`requiredBlueprintSlots`) and is *load-bearing in the structure itself* — e.g. T03's
`TURNING_POINT` is explicitly "the true belief surfaces," T16's `INTERPRETATION_2` is explicitly
"reframes the same event through the true belief." The template doesn't just consume a belief
field; it **assumes the story's entire emotional mechanism is a belief transformation**. That
assumption is now false for 3 of 5 Forms (F01, F02, F05 have no belief field at all) and half-true
for one more (F04's `assumption` is deliberately narrower and lower-weight than `belief`).

### The redefinition

A template's job, in a Story-Plan-driven world, is narrower and more honest: **a template is a
slot architecture for pacing and page structure that a 7B Story Plan's already-decided content
pours into — nothing more.**

**What a template CONSUMES (mapped explicitly to 7B's 11 parts):**

| 7B Story Plan part | What the template reads from it |
|---|---|
| 1. FORM | Selects which template(s) are even eligible — not a slot value, a filter. |
| 2. STORY ESSENCE | `coreChange`/`storyQuestion` inform pacing tone (quiet vs. urgent) but are never required text a beat must contain. |
| 3. CAST | Determines how many *actor slots* the template needs to accommodate (not cast size itself — 7B already fixed that; see below). |
| 4. CHARACTER WANTS | Optional texture for beats where a supporting character acts; never mandatory template content. |
| 5. OPENING STATE | `situation` seeds the SETUP-equivalent beat. `belief`/`assumption`, when present, seeds a beat's framing IF the template has a beat suited to carrying it — never forced into a beat that doesn't exist for a given Form (see Part 4). |
| 6. HERO WANT | Seeds the SETUP-equivalent beat alongside situation. |
| 7. FORM-SPECIFIC EVENT CHAIN | This is the template's real content feed: each 7B event (`label`, `actor`, `action`, `newInformationOrShift`) is poured into the template beat whose structural function matches, per the mapping rule below. |
| 8. TURNING POINT | Must always land on whichever beat the template itself designates as its turning point — a hard alignment, never optional. |
| 9. NEW CHOICE/ACTION | Poured into the template's pre-resolution action beat. |
| 10. EMOTIONAL CHANGE | Not required to appear as a beat's prose at all (7B says so explicitly) — informs tone only. |
| 11. RESOLUTION/NEW STATE | Poured into the template's terminal beat(s). |
| 12. MINIMUM STORY SPINE | The hard floor — see "what it must NOT own" below. |

**What a template OWNS:**
- The **beat sequence and count** (how many named slots exist, in what order).
- The **pacing shape**: which beats are fast/urgent vs. slow/quiet (`escalationPattern`,
  `pageRhythmGuidance`).
- The **structural device**, if any (a refrain, a mirror, an inversion, a judgment-among-options) —
  this is a mechanical container shape, not a claim about what emotion produced the events inside it.
- Where the **TURNING POINT** must physically sit in the sequence (a hard alignment point with 7B
  §8, per the existing mapping rule already established in 7C and carried forward here unchanged).
- **Symbol placement** (`symbolIntegrationPoint`) — this is presentation, not emotional architecture.

**What a template must NOT own:**
- **Emotional architecture.** It does not get to require a `belief.falseBelief`/`belief.trueBelief`
  pair. If a Form has no belief field (F01, F02, F05), the template's beats must be describable and
  fillable using only `action`/`newInformationOrShift` language — verbs and revealed information,
  never "the false belief" as a required noun the plan must supply. A template's `turningPoint`
  description should read as "the moment the preceding beats converge" (mechanism-agnostic), not
  "the true belief surfaces" (mechanism-specific to F03).
- **Cast size or composition.** 7B's CAST field (§3) already decided how many supporting characters
  exist and why. A template may say "this beat, if a co-actor exists, is theirs" but must never
  require a specific number or role of supporting character beyond what 7B already supplied. (T07's
  three-distinct-guide requirement, for instance, is only usable when 7B's CAST independently
  produced 3 actively-responding characters — the template doesn't get to demand a third guide be
  invented.)
- **Word count / page count.** Already locked as Phase-8-only per the compression architecture
  (7C Part 2) — carried forward unchanged here, not revisited.
- **The Minimum Story Spine's own event list.** 7B §12 already decided the smallest set of events
  that must survive. A template's beat count may be looser or tighter than the spine's event
  count (see the merge/split mechanism below) — the template supplies containers, but which
  containers are non-negotiable is 7B's decision, not the template's.

### The mechanism: how a slot receives spine events without prescribing the mechanism behind them

Each template beat is defined by **two things only**: (a) its position in the sequence relative to
the turning point, and (b) a *structural function description* stated in verb/action terms — "the
attempt that fails," "the event reread through new evidence," "the beat where an assumption meets
its reveal." None of these descriptions require a beat to *contain* a belief statement; they
require it to contain *an event*. A 7B event's `label` (e.g. `NOTICE`, `REVEAL`, `DISRUPTION`) is
matched to whichever beat's structural-function description it satisfies (see Part 1's mapping
table). The event's `action` becomes that beat's actual page content; `newInformationOrShift`
becomes the thing the beat must make legible to a young reader. A beat never asks "what did the
hero believe before and after" — it asks "what changed and who caused it," which every one of the
5 Forms can answer even though only 2 of them (F03, and F04 partially) frame that change as belief.

This is the precise mechanism by which a template stays silent on emotional mechanism while still
receiving the spine's events: **the template's beat is defined by its narrative FUNCTION
(setup / escalation / turn / resolution), not by the PSYCHOLOGICAL SHAPE of what fills it.**
Function is Form-agnostic; shape is Form-specific and belongs to 7B alone.

---

## PART 2: Full Re-Audit of T01–T20 Against the 5 Forms

Method: for each template, its `requiredBeats`, `storyMechanic`, `repetitionPattern`/
`repetitionNote`, `turningPoint`, and `resolutionPattern` were re-read directly from
`storyTemplates.json` and compared against all five Forms' locked event vocabularies (7B Part A),
independent of the 9-story test sample and independent of 7C's prior conclusions. Verdicts that
diverge from 7C are marked **[CHANGED]**.

| ID | Name | Old (Form-locked?) assumption | Re-audited verdict | Reasoning |
|---|---|---|---|---|
| T01 | Cumulative Trail | (7C: F02 partial, accumulation-shaped) | **F02-leaning cross-Form mechanic, confirmed** | Additive encounter-refrain-pattern-break shape genuinely matches F02's escalating discovery, but the *mandatory spoken refrain restating the full list* is a specific authorial device not implied by F02's four-beat vocabulary — it constrains which F02 situations it fits (accumulation-shaped only, e.g. SIT143), not a universal F02 template. |
| T02 | Refrain & Change | (7C: not matched to any Form) | **F03-specific (belief-language device)** [CHANGED — now explicitly placed, not left unassigned] | The entire mechanic IS a false-belief phrase evolving into a true-belief phrase, repeated verbatim three times. This only makes sense where a `belief` field carries real narrative weight — i.e. F03 only. It is weaker than T16 for F03 (T16 shows the shift through a re-read event; T02 only through repeated language) but it is not orphaned — it is a genuine F03 secondary, previously mis-filed as "no Form." |
| T03 | Three Tries | F01 strong match | **F01, confirmed strong** | Unchanged from 7C — near-exact structural correspondence, independently confirmed by 7B's own "strategy must differ" rule. |
| T04 | Question Chain | (7C: F02 partial, reveal-shaped) | **Cross-Form mechanic: F02 secondary, F03 secondary** [CHANGED — broadened] | The clue→deeper-question→revelation shape fits F02's DISCOVER/CONNECTED_DISCOVERY escalation, as 7C found, but requires spoken questions F02 plans didn't use. Re-examined independently: the same "each answer raises a sharper question, resolving all at once" shape also fits F03's EVIDENCE→CONTRADICTION→OTHER_PERSPECTIVE→BELIEF_UNCERTAIN chain (each piece of evidence is functionally a "clue" narrowing toward the reframe). Neither fit is exact; both are usable secondaries, not defaults. |
| T05 | Circle Back | (7C: not matched to any Form) | **Cross-Form mechanic — genuinely fits F03 and F04** [CHANGED — this is the flagged re-audit] | Re-derived from T05's own structure, independent of the 9-story sample (none of which used it): `MIRROR_OPENING → OLD_REACTION → MIDDLE_JOURNEY(2-3 beats) → INSIGHT → MIRROR_ENDING → NEW_REACTION` is fundamentally "show the same situation twice, once before the shift and once after." That is *exactly* F03's mechanic (a belief demonstrated, then the same kind of event re-encountered and read differently) with the added device of literally restaging the situation rather than just reinterpreting one instance of it — a legitimate F03 alternate to T16 for situations with a plausible second encounter. It also fits F04 well: `MIRROR_OPENING`=`ENCOUNTER`+`INITIAL_RESPONSE` (old, assumption-driven), `MIDDLE_JOURNEY`=`REVEAL`+`DEEPER_NOTICE`, `MIRROR_ENDING`+`NEW_REACTION`=`CHANGED_RESPONSE` restaged as a second, comparable encounter. This only works for F04 situations whose ending can be shaped as a second, comparable encounter (not all can — SIT166's ending is continuous conversation, not a discrete mirrored moment) but the mechanic itself is real and cross-Form, not orphaned. T05 was previously unmatched not because it's Form-incompatible, but because none of the 9 test situations happened to have mirror-shaped endings. |
| T06 | Hidden Clue | (7C: not matched to any Form) | **F02 secondary (investigation-shaped, not accumulation-shaped)** [CHANGED — now placed] | `PLANT_1/PLANT_2 → RISING_PROBLEM → RECALL → PAYOFF` fits F02 situations where the INVESTIGATE beat plants a detail that pays off at CONNECTED_DISCOVERY (e.g. a mirrored version of SIT148, where the initials scratched into the object function as a "plant" recalled later). Weaker than T01/T17 because it requires an unrelated "rising problem" to interrupt the discovery, which F02's own vocabulary doesn't call for — usable, not a default. |
| T07 | Three Guides | (7C: F04 secondary, 2+ active supporting characters only) | **Cross-Form mechanic gated by cast size: F01 or F04, requires 3 actively-responding characters** [CHANGED — broadened beyond F04] | Re-examined independently of F04: the "three characters respond differently in kind (action/emotion/insight), hero synthesizes their own path" shape is equally usable for an F01 situation with 3 classmates each proposing a different approach (structurally close to SIT168, though SIT168 was mapped to T03 in the 7B test). This is a cast-gated cross-Form mechanic, not F04-specific — it needs 7B's CAST to independently produce 3 distinct actors, which is rare, not a Form property. |
| T08 | The Repeating Mistake | (7C: not matched to any Form) | **F01 secondary (self-regulation subtype)** [CHANGED — now placed] | `MISTAKE_1→IGNORE→MISTAKE_2→NOTICE→MISTAKE_3_AVOIDED→PAUSE→CHANGE` is structurally an ATTEMPT/CONSEQUENCE loop relabeled as "mistake," ending in a strategy change at the third occurrence — matches F01's locked shape closely, particularly self-regulation-flavored F01 situations. Note explicitly: T08's rule that the *trigger* stay recognizably the *same kind* each time makes it structurally incompatible with F05 (which requires disruptions to differ in kind) — ruling it out there, confirming it belongs only to F01. |
| T09 | Smallest Strength | (7C: not matched to any Form) | **F01 secondary, especially solo/regulation situations** [CHANGED — now placed] | `BIG_EXPECTATION → BIG_ATTEMPT_FAILS → QUIET_QUALITY_NOTICED → QUIET_ACTION → RESOLUTION` is a single-inversion shape that maps almost exactly onto SIT045's actual tested plan (frantic search fails → self-comfort, a quiet quality, succeeds instead) — this independently confirms 7B's own solo-story "hero must change STRATEGY" rule in template form. Genuinely a good secondary for F01, previously unassigned. |
| T10 | Before/After Words | (7C: not matched to any Form) | **F03 secondary (belief-language device, same family as T02)** [CHANGED — now placed] | Like T02, this template's entire mechanic is a three-stage evolving belief-sentence — only coherent where `belief` carries real weight, i.e. F03. Weaker than T16 (no re-read event, purely linguistic), but a legitimate F03 secondary, not orphaned. |
| T11 | The Countdown | F01 secondary (if timed) | **F01, confirmed secondary** | Unchanged from 7C. |
| T12 | The Almost-Right Path | F03 secondary | **F03, confirmed secondary; weak F01 possibility noted** | Mostly unchanged — this is fundamentally a judgment-among-options template, closest to F03's "which reading is right" shape. A weak secondary use for F01 situations that are about choosing among approaches rather than repeated failure is plausible but not demonstrated by any tested plan. |
| T13 | Lost → Notice → Found | (7C: F02, inverted/weak) | **F01 secondary (loss/solo-regulation situations), not F02** [CHANGED — reclassified] | Re-examined independent of the "inverted F02" framing: T13's real shape — hero loses something, searches, the *search itself* leads to a deeper realization that outranks recovering the object — is structurally much closer to F01 solo-loss situations (SIT045-shaped) than to F02's notice-driven discovery chain. F02 starts from *noticing something new*; T13 starts from *losing something old*. The "search" in T13 is an ATTEMPT/CONSEQUENCE loop in disguise, and its resolution (comfort found within, object secondary) matches F01's solo-strategy-change rule closely. 7C's "inverted F02" label was a surface-level pairing (both involve a search) rather than a structural one; the deeper mechanic belongs to F01. |
| T14 | Pass It On | (7C: not matched to any Form) | **F04 secondary (relational mirror device)** [CHANGED — now placed] | `HERO_RECEIVES → LEARNING → OTHER_STRUGGLES → RECALL_HELP → HERO_GIVES` is fundamentally about a relationship arc (receiver becomes giver), which is F04's home territory. Maps loosely onto DEEPER_NOTICE (recall) → CHANGED_RESPONSE (giving) if 7B's plan includes a second character whose struggle recognizably parallels the hero's own earlier one — a narrower fit than T15, but real. |
| T15 | The Unexpected Helper | F04 best (bent fit) | **Cross-Form: F04 (bent, per 7C) and F02 (assumption-about-a-thing, not a person)** [CHANGED — broadened] | 7C's critique stands for F04 (competence-assumption vs. emotional-misread is a real tonal gap). Re-examined independently: the same PROBLEM→ASSUMPTION→DISMISSAL→SECOND_LOOK→CONTRIBUTION shape fits F02 situations where the hero dismisses an *object or clue* as unimportant before a second look reveals its value — arguably a cleaner fit than for F04, since F02 has no person-vs-person misread to distort. Recommend evaluating this as an F02 candidate before further investing in it as F04's default. |
| T16 | Two Ways to See It | F03 best, near-exact | **F03, confirmed strong** | Unchanged — the cleanest 1:1 mapping in the set, as 7C found. |
| T17 | The Secret Mission | (7C: not matched to any Form) | **F02, strong candidate — better fit than T01 or T04** [CHANGED — new best-fit proposal for F02] | `MISSION_GIVEN → CLUE_1 → OBSTACLE_1 → CLUE_2 → OBSTACLE_2 → REVELATION → RESOLUTION` requires no spoken refrain (unlike T01) and no spoken questions (unlike T04) — its device is simple clue/obstacle alternation ending in a revelation that reframes the mission's meaning, which maps cleanly onto F02's NOTICE→INVESTIGATE→DISCOVER→CONNECTED_DISCOVERY without needing an artificial verbal tic. Worked against SIT148 mentally: MISSION_GIVEN≈NOTICE, CLUE_1≈INVESTIGATE (initials), OBSTACLE_1≈the gap before recognizing the regular, CLUE_2≈the memory of yesterday's search, REVELATION≈CONNECTED_DISCOVERY (reframe), RESOLUTION≈return. This is a materially better candidate than either of 7C's two proposed F02 options and should be reconsidered as F02's primary before inventing a new template. |
| T18 | The Growing Problem | F01 narrow (compounding consequences only) | **F01, confirmed narrow; explicitly does NOT fit F05** | Re-checked specifically against F05 per the task's instruction to revisit this template: T18's escalation is *self-caused* (the hero's own ignoring feeds the growth) and its repeated trigger must stay the *same kind* each time. F05 requires disruptions to be externally caused and to differ in kind. These are opposite requirements — T18 genuinely cannot serve F05 without breaking F05's own hard rule, confirming 7C's exclusion rather than overturning it. |
| T19 | Choice at the Crossroads | (7C: not matched to any Form) | **F05 secondary (adaptation-as-choice) and F01 secondary (decision-shaped)** [CHANGED — new proposal, not previously considered] | Re-derived independently: a single genuine choice between "push the old plan" and "take the new option," with a real consequence, maps directly onto F05's RESTORE_ATTEMPT (choosing to keep pushing the original plan) vs. the adaptation that follows RESTORE_FAILS (SIT099: push through the crowd vs. seek the quiet café is literally a two-option crossroads with real consequences). Not a full F05 match — it has no explicit "≥2 disruptions differing in kind" mechanism — but a genuine secondary worth testing, previously unconsidered by 7C. Also a plausible F01 secondary for decision-shaped (not repeated-attempt-shaped) situations. |
| T20 | Return With Something New | (7C: not matched to any Form) | **Cross-Form mechanic, gated by situation content (needs a literal departure+return), not by Form** [CHANGED — this is the other flagged re-audit] | Re-derived independent of the 9-story sample: `DEPARTURE → CHALLENGE → DISCOVERY → TRANSFORMATION → RETURN → ECHO_ENDING` is T05's mirror device stretched across a full physical journey away from and back to a starting place. None of the 9 tested situations (all single-location, single-day domestic/school scenes) have this shape — which is why it went unused, not because it structurally conflicts with any Form. Any Form (F01 "trying" across a real trip, F03 "shift in seeing" bookended by leaving/returning somewhere, F04 meeting someone away from home and returning changed) could in principle use it, *if* the underlying situation actually involves departure and return. This is a **situation-content gate, not a Form gate** — a materially different and more precise finding than "orphaned." |

**Verdicts changed vs. 7C: 12 of 20** (T02, T04, T05, T06, T07, T08, T09, T10, T13, T14, T15, T17,
T19, T20 — either newly placed, reclassified, or broadened; T18 was re-checked and confirmed
unchanged). Templates unchanged from 7C: T01, T03, T11, T12, T16 (T13 and T15 changed; the rest
above are new placements).

**T05 and T20 specifically:** both turn out to be genuine **cross-Form mechanics**, not orphans.
T05 (mirror-scene comparison) is gated by whether a Form's shape supports a comparable "before"
and "after" instance of the same kind of situation (true for F03 always, true for F04 when the
plan's ending can be staged as a second discrete encounter). T20 (departure-challenge-return) is
gated not by Form at all but by whether the underlying **situation** involves the hero physically
leaving and returning to a place — a property of the input situation, not of the Form's event
vocabulary. Both were unused in the 9-story test set for reasons unrelated to Form-incompatibility.

---

## PART 3: New Template Mechanics for F02, F04, F05 (unnamed/unnumbered)

Per the user's decision, these are proposed on paper only — no template IDs assigned, and this
does not preclude using T17 (F02) or T05 (F04) as adequate near-term matches per Part 2. These are
offered as the purpose-built alternative for whoever eventually decides whether a bent/partial fit
is good enough or a new template is worth building.

### F02 candidate mechanic: "The Reframe Trail"

- **Core structural device:** a chain of discoveries where each one *reinterprets*, not just adds
  to, the one before it — analogous to T03's "three tries, each smarter" but for noticing instead
  of attempting. The device is: each discovery beat must state what the *previous* discovery is
  now understood to mean, not merely what new fact was added.
- **Scene/page slot count:** 5 slots — `NOTICE`, `INVESTIGATE`, `DISCOVER`, `CONNECTED_DISCOVERY`,
  `RESOLUTION` — a direct 1:1 mapping onto F02's own locked vocabulary plus a terminal resolution
  slot, with no relabeling needed (unlike every other template in T01–T20, which all use their own
  invented beat names).
- **How it receives F02's chain:** each of the four locked event labels IS a slot, verbatim — the
  cleanest possible mapping, since this mechanic is derived from F02's vocabulary rather than
  adapted from an unrelated one.
- **Staying silent on emotional mechanism:** no slot description references belief. `CONNECTED_
  DISCOVERY`'s slot function is defined purely as "the beat where the accumulated NOTICE/
  INVESTIGATE/DISCOVER beats are shown to add up to something not visible from any single one" —
  an informational, not emotional, claim. This also gives Phase 8 what it needs: each slot's
  content is exactly the corresponding 7B event's `action` + `newInformationOrShift`, with no
  additional belief-shaped content demanded.

### F04 candidate mechanic: "Misread → Reveal → Recalibrate"

- **Core structural device:** two characters each hold a want the other doesn't yet see clearly;
  the hero acts on an assumption, the assumption visibly fails to land, and the *other character's*
  own reveal (not the hero's realization alone) is what corrects course. The device's rule: the
  REVEAL beat's actor must be the supporting character, never the hero — this preserves 7B's
  CHARACTER AGENCY finding (Part C, tested plans) that F04's other character must act, not merely
  be acted upon.
- **Scene/page slot count:** 5 slots, mapping directly onto F04's own vocabulary: `ENCOUNTER`,
  `INITIAL_RESPONSE`, `REVEAL`, `DEEPER_NOTICE`, `CHANGED_RESPONSE` — again a direct 1:1, no
  relabeling.
- **How it receives F04's chain:** identical reasoning to the F02 mechanic above — the vocabulary
  is used as the slot names directly, since it was already built by 7B to be structurally complete.
- **Staying silent on emotional mechanism:** the `assumption` field, when present (F04 only, per
  the locked schema), is optional seed content for the `ENCOUNTER`/`INITIAL_RESPONSE` slots — never
  a required slot in its own right, and never described using F03's "belief" weight or ceremony
  (per 7B's own flagged distinction). A slot description reads "what the hero expected the other
  character to want" — narrow and situational, matching 7B's locked framing exactly, not "the
  hero's false belief."

### F05 candidate mechanic: "The Disrupted Plan"

- **Core structural device:** an explicitly stated plan is disrupted twice, by causes differing in
  *kind* (not just intensity), a real attempt is made to restore the original plan and *must
  genuinely fail*, and only then does an adapted, materially different plan emerge — directly
  reproducing the F05 hard rule set that 7C already correctly identified no existing template can
  satisfy without breaking one of its own requirements.
- **Scene/page slot count:** 6 slots: `EXPECTATION` (the stated plan), `DISRUPTION_1`, `REACTION`,
  `DISRUPTION_2` (explicitly required to differ in kind from `DISRUPTION_1`), `RESTORE_ATTEMPT`,
  `RESTORE_FAILS`, plus a terminal `ADAPTATION`/`RESOLUTION` slot — 7 total including resolution,
  the largest of the three proposed mechanics, matching 7B's own finding (SIT099's spine note) that
  F05 is "the least compressible" Form because so much of its identity IS the event count and
  kind-differentiation.
- **How it receives F05's chain:** again, F05's own locked vocabulary (`EXPECTATION`/
  `DISRUPTION`/`REACTION`/`RESTORE_ATTEMPT`/`RESTORE_FAILS`) maps directly onto slot names, with
  the one addition of a required "kind" tag on each `DISRUPTION` slot so the template mechanically
  enforces the "≥2 disruptions differing in kind" rule (a structural checkbox, not free text).
- **Staying silent on emotional mechanism:** no belief slot anywhere, matching 7B's locked "F05 has
  no belief/assumption field" rule exactly. The template's only Form-specific content requirement
  is the explicit `plan` (7B's OPENING STATE.`plan` field for F05) — which is itself not a belief,
  just a stated intention, so the template asking for it is asking for structural content 7B
  already promises to supply, not inventing a new requirement.

### Common pattern across all three

In each case, the "new template" isn't really new invention — it's simply **naming a template's
slots after the Form's own already-locked event vocabulary**, rather than adapting an unrelated
template's invented beat names (T03's `ATTEMPT_1`, T16's `INTERPRETATION_1`, etc.) that were
designed for a different Form's shape. This is worth surfacing as a general observation: the
cleanest possible template for any Form is one whose slots are simply that Form's own vocabulary
plus a `RESOLUTION` slot — every adaptation attempt in Part 2 that required renaming or squeezing
was, by construction, a worse fit than a template built to already match.

---

## PART 4: The Belief-Slot Conflict — Conceptual Resolution (Not an Adapter)

The old templates hard-require `belief.falseBelief`/`belief.trueBelief` because they were designed
against the pre-7A/7B Blueprint format, where every story was assumed to be a belief-transformation
story. That assumption is what has to change — not the data flowing into the templates.

**The resolution, stated as a schema-level change to what a template is allowed to require:**

1. **No template's `requiredBeats`/`sceneStructure`/`turningPoint` description may reference
   `belief` or `assumption` as content a beat must contain.** Per Part 1, beats are defined by
   narrative *function* (setup / escalating complication / turn / resolution), never by
   psychological *shape*. A beat that today reads "hero pauses and the true belief surfaces"
   should read "hero pauses; the turning point's `statement` (7B §8) is delivered here" — the
   template names *where* the turn goes, not *what kind of realization* it must be.
2. **`belief`/`assumption` becomes optional pass-through content, not a required slot, surfaced
   only when 7B's OPENING STATE actually populates it.** For F03 plans, the template's SETUP-
   equivalent beat and its turn-equivalent beat can display `belief` prominently, because F03's own
   Story Plan supplies it with full narrative weight — the template isn't adding ceremony, it's
   relaying what 7B already decided to make load-bearing. For F04 plans, the same beats can display
   `assumption`, but the template's own description must not imply it carries F03's weight (no
   "the belief surfaces" language) — it should read closer to "the assumption named in OPENING
   STATE is testable here, if present." For F01/F02/F05 plans, those beats simply have no
   belief/assumption content to display, and the template must function correctly with that field
   absent — not degrade, not require a placeholder, not silently expect one anyway.
3. **This is a difference in what the FORMAT assumes, not a translation layer between two
   formats.** An adapter would take belief-shaped input from somewhere and manufacture a
   belief-shaped value to satisfy a template that still demands one. What's proposed here is the
   opposite: the template stops demanding one. There is nothing to adapt, because after this
   change there is no required field on the other side that non-belief Forms would otherwise fail
   to supply. The mismatch identified in 7C (gap #4) is closed by *deletion of a requirement*, not
   by *insertion of a compatibility mechanism*.
4. **Concretely, for the two confirmed matches (T03→F01, T16→F03):** T03 today requires
   `belief.falseBelief`/`belief.trueBelief` in `requiredBlueprintSlots`, yet 7B locks F01 as having
   *no belief field at all* — meaning T03, unmodified, cannot actually be wired to an F01 Story Plan
   without either violating its own stated requirement or having something invent a belief value
   F01 was never supposed to have. This is the concrete instance of the redesign: T03's belief
   requirement must be dropped (its `TURNING_POINT` beat should be redescribed using 7B's own
   `EMOTIONAL CHANGE.startingState/changedState` — F01's actual carrier of this kind of content
   per 7B's own note in the SIT045 plan — not a belief pair that doesn't exist for this Form).
   T16, by contrast, needs no change of substance — it is already describing exactly the mechanism
   F03 actually has; only its `requiredBlueprintSlots` field's *label* (`belief.falseBelief`/
   `belief.trueBelief`) needs to be re-pointed at 7B's `OPENING STATE.belief` and `TURNING POINT.
   statement` rather than an old Blueprint path.

---

## PART 5: Open Questions

1. **Where does `symbol` live going forward?** Every template's `symbolIntegrationPoint` assumes a
   `symbol` value exists (from the old Blueprint). 7B's 11-part schema has no explicit `symbol`
   field. Is `symbol` meant to be pulled from Phase 6 directly at the template/Event-Planner stage
   (bypassing 7B), added to 7B as a 12th part, or authored fresh per-template? This was flagged in
   7C (gap #5) and remains fully open — Part 1's redefinition doesn't resolve it because it's a
   pipeline-wiring question, not a template-definition question.

2. **Should T17 formally replace T01/T04 as F02's default, or run a real comparison first?** Part 2
   argues T17 is a materially better fit than either of 7C's two proposed F02 options, but this is
   a re-derivation from the template's own text, not a test against real F02 situations the way
   T03/F01 and T16/F03 were validated in 7B's 9-plan test set. Worth running SIT143 and SIT148
   through T17 explicitly before treating this as settled.

3. **Is a purpose-built F05 template worth building, or is T19 (Choice at Crossroads) + a documented
   "requires ≥2 disruptions differing in kind" note enough?** Part 3's proposed "Disrupted Plan"
   mechanic is the more faithful match, but Part 2 also surfaced T19 as a real, if partial,
   secondary that requires zero new template design. Needs a decision on whether "good enough with
   documentation" beats "purpose-built" for F05 specifically, given F05 was the clearest total gap.

4. **Does T05's cross-Form status (F03 and F04) mean a Story Plan could, in principle, be eligible
   for more than one template?** Nothing in 7B or this document currently decides how the pipeline
   picks among multiple eligible templates for a single Form (e.g., an F03 plan eligible for both
   T16 and T05, or an F01 plan eligible for T03, T08, T09, T11, T12, or T13 depending on the
   situation's shape). This needs an explicit selection rule (likely keyed to situation sub-shape,
   the way 7C originally proposed for F02's T01-vs-T04 split) before Event Planner wiring can begin.

5. **T07 and T14's cast-gating.** Both were reclassified in Part 2 as usable but gated by cast
   composition 7B independently produces (3 actively-responding characters for T07; a second
   character with a genuinely parallel struggle for T14). Should template eligibility formally
   depend on reading 7B's CAST field at selection time, or should these two stay documented as
   rare/opportunistic options rather than routed to automatically? This is really a sub-case of
   Open Question 4 but worth surfacing separately since it involves reading CAST, not just FORM.

6. **How rigorously should "no belief/assumption in the beat description" (Part 4) be enforced
   going forward — a lint rule against future templates, a required review step, or just a written
   convention?** Nothing currently prevents a future template author from re-adding a hard
   `belief`-shaped requirement out of habit, especially since 16 of the 20 existing templates
   already do this. This document proposes deleting the requirement conceptually but doesn't
   specify how that intent gets enforced once real editing of T01–T20 begins (which, per this
   task's scope, hasn't started).
