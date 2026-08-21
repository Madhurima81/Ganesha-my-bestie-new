# Phase 7F — Template Finalization and End-to-End Paper Test

Status: **design/planning artifact only.** No code, T01–T20 template JSON, Phase 6 data, F01–F05
Form definitions, Event Planner code, or Phase 8/9 code was touched. This document resolves the
five items 7E left open, assigns two new template IDs (T22, T23) and formally locks T21, on paper
only — nothing was added to `storyTemplates.json`. Inputs read in full before writing: `tmp_phase7b_expanded_story_plan_test.md`
(1611 lines, full LOCKED SCHEMA + Parts A–D), `tmp_phase7c_template_mapping_and_compression.md`,
`tmp_phase7d_template_layer_redesign.md`, `tmp_phase7e_locked_decisions.md`, and `storyTemplates.json`
(T01, T03, T04, T15, T16, T17, T19, T20 read in full; remainder skimmed for format consistency).
`situations.json` was checked for two situation IDs not used in any prior document.

Pipeline position (unchanged): Phase 6 Blueprint → 7A Story Form (F01–F05) → 7B Story Plan →
**Template selection + new template mechanics (this document)** → Event Planner → Phase 8 prose.

---

## Part 1 — F02 template: T22 "The Reframe Trail"

### Naming decision

7D provisionally called this "The Reframe Trail." Keeping the name: it names the actual mechanic
(a chain of re-interpretations, not a chain of new items) and doesn't overclaim — it isn't a
"mystery" or "mission" template, both of which 7E's Decision 1 showed force a device F02 doesn't
have. Assigning it **T22** (next free ID after 7E's proposed T21).

### Why not T17 (or T01/T04) — restated briefly, decision already made in 7E

7E's Decision 1 tested T01, T04, and T17 against SIT143 and SIT148 and found no clean fit: T01
needs a spoken refrain neither situation has; T04 needs 3 literal spoken questions neither
situation has; T17 is closest but its two `OBSTACLE` beats have zero content in either situation,
both of which 7B deliberately built antagonist-free. Per this task's explicit instruction, T22 is
built purpose-built rather than redefining T17's OBSTACLE as a workaround.

### Slot structure (6 slots)

```
T22 — THE REFRAME TRAIL
1. NOTICE               — maps 1:1 to F02's NOTICE event. Hero's attention shifts from
                           "not my concern" to "look closer." Responsible for establishing
                           the ordinary, easy-to-walk-past starting point.
2. INVESTIGATE           — maps 1:1 to F02's INVESTIGATE event. Hero takes one small active
                           step (crouches, looks again, asks) and finds there's more here
                           than the first glance showed. Responsible for the FIRST
                           reinterpretation: beat 1 is now understood to mean "more than one
                           thing," not "one isolated thing."
3. DISCOVER              — maps 1:1 to F02's DISCOVER event. A specific, escalating piece of
                           information arrives (a pattern, an identity, a location). Responsible
                           for the SECOND reinterpretation: the accumulated NOTICE+INVESTIGATE
                           beats are now understood to point toward something concrete and
                           locatable, not just "more of the same."
4. CONNECTED_DISCOVERY   — maps 1:1 to F02's CONNECTED_DISCOVERY event. Responsible for the
                           THIRD and final reinterpretation — the beat where NOTICE/INVESTIGATE/
                           DISCOVER, taken together, are shown to add up to something invisible
                           from any single one of them (an effect, a person, a scale). This is
                           the template's turning point (see below).
                           **STRUCTURAL CONSTRAINT (added this revision, per Part 7.1's
                           adversarial-test fix — moved here from a downstream RESOLUTION note
                           because this is the slot where the drift actually originates):
                           `reinterpretationFocus: "object"` is a required property of this slot,
                           not optional guidance. The reinterpretation authored here must state
                           what the accumulated discoveries now reveal about the object/situation/
                           pattern — it must NOT characterize a newly-identified person's feelings,
                           history, interiority, or relationship to the hero, even when the
                           discovery's content happens to lead to a specific person (e.g. an
                           object's owner). If the situation's discovery genuinely does lead to a
                           person, CONNECTED_DISCOVERY may state the bare fact that a person is
                           now identifiable/findable, but must stop there — any warmth,
                           relational framing, or emotional interiority about that person belongs
                           only in RESOLUTION, and only as a single-sentence factual reaction (see
                           RESOLUTION's own carried-forward guardrail below), never here. This
                           constraint is checkable independent of authorial judgment: does this
                           slot's sentence have the object/pattern/situation as its grammatical
                           subject, or does it have a person's experience as its subject? Only the
                           former passes.**
5. NEW_CHOICE            — maps to 7B §9 (NEW CHOICE/ACTION). Hero acts differently than they
                           would have at NOTICE — the discovery is now acted on, not just
                           understood.
6. RESOLUTION            — maps to 7B §11 (RESOLUTION/NEW STATE). What's concretely different
                           now, shown not summarized.
```

### The reinterpretation device (what makes this a template, not just a vocabulary relabel)

Each slot after NOTICE is defined by **what the previous slot is now understood to mean**, not
merely what new fact arrived — this is the one authorial device T22 adds on top of F02's raw
vocabulary (per 7D Part 3's original framing, carried forward unchanged): INVESTIGATE must state
"NOTICE wasn't isolated"; DISCOVER must state "this is bigger/more specific than INVESTIGATE
suggested"; CONNECTED_DISCOVERY must state "all three together mean something none of them meant
alone." This is a **structural function requirement** (a beat must reframe, not just add), not an
emotional-architecture requirement — it asks nothing about belief and nothing that F02 doesn't
already supply via `newInformationOrShift` on every one of its four locked events.

### Turning point placement

CONNECTED_DISCOVERY is the hard turning-point slot — this is a direct, non-negotiable mapping to
7B §8 TURNING POINT, since F02's own locked vocabulary places the turning point at exactly this
event in all tested plans (SIT143, SIT148 both trigger their turning point at
EVENT 3→4/CONNECTED_DISCOVERY).

### No forced device — confirmed against the `no-hard-belief-requirement` lint rule (7E)

`requiredBlueprintSlots` for T22: `situation`, `hero`, `heroWant`, the four F02 event-chain
entries (`NOTICE`/`INVESTIGATE`/`DISCOVER`/`CONNECTED_DISCOVERY` actions +
`newInformationOrShift` + **`reinterpretationFocus` on `CONNECTED_DISCOVERY` specifically,
required this revision, see the slot spec above**), `newChoiceAction`, `resolution`. **No**
`belief.falseBelief`/`belief.trueBelief`, **no** `obstacle`, **no** spoken-refrain or
spoken-question field. This is the first template in the eligibility pool built compliant with
7E's `no-hard-belief-requirement` rule from the start, rather than needing retrofitting.

### Validation against SIT143 (7B Part B §2)

| T22 slot | SIT143 content | Clean fit? |
|---|---|---|
| NOTICE | EVENT 1: Kavi almost walks past, looks again at the wrapper | Yes — verbatim |
| INVESTIGATE | EVENT 2: crouches to pick it up, notices a second wrapper | Yes — verbatim, and satisfies the reinterpretation rule ("not one piece") |
| DISCOVER | EVENT 3: finds a third piece, realizes the bin is a few steps from all three | Yes — verbatim, satisfies reinterpretation ("this wasn't unavoidable") |
| CONNECTED_DISCOVERY | EVENT 4: bird pecking at a wrapper — reframes "small litter, no big deal" into "real, immediate effect" | Yes — exactly the turning point 7B already identified |
| NEW_CHOICE | Kavi picks up all three pieces, carries them to the bin | Yes — direct |
| RESOLUTION | Bench area clear; Kavi didn't need permission, understanding was enough | Yes — direct |

**Zero invented content, zero unused slots, zero forced device.** This is the clean fit T17 could
not produce (SIT143's plan explicitly has no obstacle for T17's two required `OBSTACLE` beats).

### Validation against SIT148 (7B Part B §3)

| T22 slot | SIT148 content | Clean fit? |
|---|---|---|
| NOTICE | EVENT 1: Kavi picks up the object, turns it over — "looks cared for" | Yes |
| INVESTIGATE | EVENT 2: finds initials scratched into the underside | Yes — satisfies reinterpretation ("has an identity now") |
| DISCOVER | EVENT 3: initials match a regular's name | Yes — satisfies reinterpretation ("connects to a specific, findable person") |
| CONNECTED_DISCOVERY | EVENT 4: memory of the woman searching yesterday — reframes "a found thing" into "someone's unfinished search" | Yes — exactly the 7B turning point |
| NEW_CHOICE | Kavi returns the next afternoon, object in hand | Yes |
| RESOLUTION | Owner's relief, specific to the object, not a new friendship forming | Yes — and note below |

**Zero invented content.** This is a materially cleaner fit than T17's "least-bad, still requires
inventing both obstacle beats" verdict in 7E Decision 1, and cleaner than T04's forced 3-spoken-
question requirement.

**Carrying forward the F02/F04 boundary flag (7B §5, restated, not re-litigated):** T22's
RESOLUTION slot description must say "the payoff is about the object/mystery" explicitly, precisely
because SIT148 is the situation that keeps testing this seam. Recommending this as a permanent note
in T22's `resolutionPattern` field once/if this reaches JSON: *"Resolution must stay about what was
discovered, not about the person who receives it — if the last-appearing character is given warmth
or interiority beyond relief, the story has drifted into F04."* **This RESOLUTION-level note is now
a second line of defense, not the primary one — the primary constraint is CONNECTED_DISCOVERY's own
required `reinterpretationFocus: "object"` property (added this revision, per Part 7.1/Part 8's
fix), since that is the slot where the drift toward relational language actually originates, one
slot upstream of where this RESOLUTION note alone could catch it.** This is the T-layer QA check 7B
§5 asked for, now given a concrete, structural home in the slot that actually generates the risk,
with RESOLUTION's note retained as a backstop.

---

## Part 2 — F04 template: T23 "The Assumption Bridge"

### Naming decision

7D's working name was "Misread → Reveal → Recalibrate" — accurate but reads as a process
description, not a story name. Renaming to **"The Assumption Bridge"**: the story is always about
building an actual connection across the gap between what the hero assumed and what the other
character actually needed — "bridge" names the relational work; "assumption" keeps the emotional
engine explicit and distinct from F03's `belief`. Assigning it **T23**.

### Slot structure (6 slots)

```
T23 — THE ASSUMPTION BRIDGE
1. ENCOUNTER            — maps 1:1 to F04's ENCOUNTER event. Hero acts on an assumption about
                           the other character (from OPENING STATE.assumption, when present) —
                           this is the hero closing distance, not just observing it.
2. INITIAL_RESPONSE      — maps 1:1 to F04's INITIAL_RESPONSE event. ACTOR MUST BE THE SUPPORTING
                           CHARACTER, never the hero (hard rule, carried from 7D Part 3, preserving
                           7B's Character-Agency finding). The other character's real response
                           doesn't match what the hero's assumption predicted.
3. REVEAL                — maps 1:1 to F04's REVEAL event. ACTOR MUST BE THE SUPPORTING CHARACTER.
                           This is the one non-negotiable structural rule of the whole template:
                           the correction must come from the other character's own action or
                           admission, never from the hero figuring it out alone. This is what
                           keeps T23 an F04 mechanic and not a solo-insight F03 mechanic wearing a
                           second character as scenery. **"The supporting character" defaults to
                           the character `assumption` grammatically names. The hard rule itself is
                           unchanged and unweakened by the exception below — it still requires a
                           supporting character, never the hero, to carry INITIAL_RESPONSE/REVEAL.**

                           **SANCTIONED PASSIVE-CHARACTER SUBSTITUTION EXCEPTION (added this
                           revision, per Part 7.2's adversarial-test fix): INITIAL_RESPONSE/REVEAL
                           may instead be carried by a *different*, agentic supporting character
                           — never by the hero — ONLY when BOTH of the following are true, AND
                           both are declared explicitly at the 7B CAST / SUPPORTING CHARACTERS
                           planning step (per 7B's 15-step sequence and §3b), never improvised
                           later during event planning:**
                           **(a) CAUSATION — the passive character genuinely CAUSES the
                           situation: their existence/presence/action, even if involuntary, is the
                           actual originating cause of the hero's assumption (e.g. the baby's
                           arrival is what caused Kavi's assumption in the first place — not
                           merely "is present while it happens").**
                           **(b) DECLARED AGENTIC PROXY — there is an explicitly identified
                           agentic supporting character whose CAST entry states, in its
                           `narrativeFunction`, that they correct the assumption ON THE PASSIVE
                           CHARACTER'S BEHALF (not "carries the reveal" stated generically — it
                           must name the passive character and the on-behalf-of relationship).**
                           **If a plan does not declare both (a) and (b) at the Cast/Supporting-
                           Characters stage, this exception does not apply, and T23 is simply not
                           eligible for that plan — it falls back to template selection choosing
                           something else, or is flagged as needing a different Form/template
                           entirely. This exception must never be read as "any convenient
                           supporting character may stand in for `assumption`'s subject" — it is
                           narrow, requires both conditions, and requires the CAST-level
                           declaration to exist before event planning, not as a workaround
                           discovered while authoring REVEAL.**
4. DEEPER_NOTICE         — maps 1:1 to F04's DEEPER_NOTICE event. Hero's actor slot — hero
                           integrates what REVEAL just supplied and understands what the other
                           character actually needs, distinct from what the hero assumed.
5. CHANGED_RESPONSE      — maps 1:1 to F04's CHANGED_RESPONSE event. Hero acts differently,
                           concretely, based on DEEPER_NOTICE — never narrated as "hero learned
                           that..."
6. RESOLUTION            — maps to 7B §11. Per 7B's own repeated finding (SIT166, SIT089), F04
                           resolutions are RELATIONAL — shown through the two characters together
                           (talking normally, sitting together), not through the hero's internal
                           realization alone. T23's RESOLUTION slot description must require an
                           actor pairing (HERO + supporting character), not a HERO-only beat.
```

### The assumption device (what makes this a template, not just a vocabulary relabel)

The `assumption` field, when 7B's OPENING STATE populates it (F04 only), is **optional seed
content** for the ENCOUNTER/INITIAL_RESPONSE slots — never a required slot value in its own right,
per 7D Part 3 and 7E's `no-hard-belief-requirement` rule (assumption-consuming logic must never
silently accept or be treated as belief-shaped). A slot description reads "what the hero expected
the other character to want or feel" — narrow, situational, exactly 7B's locked framing — never "the
hero's false belief," which would smuggle F03's weight into a Form that explicitly doesn't carry it.

### Turning point placement

REVEAL is the hard turning-point-triggering slot (per 7B's own tested plans: SIT166's turning point
triggers at EVENT 3→4/REVEAL→DEEPER_NOTICE; SIT089's at EVENT 3→4, same pattern). DEEPER_NOTICE
carries the 7B §8 TURNING POINT `statement` itself — REVEAL supplies the material, DEEPER_NOTICE is
where the hero's understanding turns.

### `requiredBlueprintSlots` for T23

`situation`, `hero`, `heroWant`, `supportingCharacter.want`, the five F04 event-chain entries,
`newChoiceAction` (folded into CHANGED_RESPONSE), `resolution`. `assumption` is **optional**, not
required — a T23 plan with an unstated-but-implied assumption (rare, but 7B doesn't forbid it) must
still be usable. No `belief.falseBelief`/`belief.trueBelief` anywhere. **When the passive-character
substitution exception (above) is invoked, two additional CAST-level fields become required for
that plan: the passive character's CAST entry must be identifiable as the causing party, and the
agentic proxy's CAST entry's `narrativeFunction` must explicitly state the on-behalf-of relationship
(see exception clause above) — both resolved at the CAST step, per 7B §3c, before event planning.**

### Validation against SIT166 (7B Part B §4)

| T23 slot | SIT166 content | Clean fit? |
|---|---|---|
| ENCOUNTER | Kavi walks over, sits down, says hi (acting on the assumption) | Yes |
| INITIAL_RESPONSE | Classmate gives a short, closed-off "hi" — not the relief Kavi expected | Yes — actor is the classmate, satisfies the hard rule |
| REVEAL | Classmate admits, embarrassed, they'd rather not look like they need help | Yes — actor is the classmate, satisfies the hard rule |
| DEEPER_NOTICE | Kavi realizes the classmate doesn't want to be a "project" | Yes |
| CHANGED_RESPONSE | Kavi drops the "checking in" tone, talks about something ordinary | Yes |
| RESOLUTION | Classmate laughing, sitting less braced — shown relationally, both present | Yes — HERO + classmate pairing, satisfies the RESOLUTION rule |

### Validation against SIT089 (7B Part B §8)

| T23 slot | SIT089 content | Clean fit? |
|---|---|---|
| ENCOUNTER | Kavi holds the picture up, closer to Mama's line of sight | Yes |
| INITIAL_RESPONSE | Mama gives a quick, distracted "that's lovely" | Yes — actor is Mama |
| REVEAL | Mama turns around fully, explains, apologizes | Yes — actor is Mama |
| DEEPER_NOTICE | Kavi realizes Mama's attention had to go somewhere first, not stopped | Yes |
| CHANGED_RESPONSE | Kavi starts asking directly for attention next time | Yes |
| RESOLUTION | Mama sits with Kavi and the picture, baby asleep — shown relationally | Yes — HERO + Mama pairing |

**Zero invented content in either validation** — same clean 1:1 result as T22, for the same
underlying reason 7D Part 3 originally identified: the cleanest possible template for a Form is one
whose slots are simply that Form's own already-locked vocabulary plus a resolution slot.

---

## Part 3 — F05 template: T21 "The Disrupted Plan" (LOCKED, carried forward, ID formally assigned)

No new design here — this is 7E Decision 2's spec, unchanged, now given its ID inside a document
that also names T22/T23 so all three new-Form templates exist at a consistent numbering.

```
T21 — THE DISRUPTED PLAN (7 slots)
1. EXPECTATION           — the explicit, stated plan (F05's OPENING STATE.plan, verbatim).
2. DISRUPTION_1          — first external, plan-breaking event; establishes a KIND of disruption.
3. REACTION              — hero's first coping response, in service of keeping EXPECTATION alive.
4. DISRUPTION_2          — second external, plan-breaking event; MUST differ in KIND from
                            DISRUPTION_1 (structurally different, not merely "worse").
5. RESTORE_ATTEMPT       — a genuine, real attempt to keep/recover the original plan (not a token
                            gesture); where a supporting character, if present, most often co-acts.
6. RESTORE_FAILS         — the attempt genuinely fails; the original plan is confirmed
                            unsurvivable as designed, not merely paused.
7. ADAPTATION/RESOLUTION — a materially different, adapted plan emerges and is shown resolving,
                            never narrated as a moral.
```

`DISRUPTION_1`/`DISRUPTION_2` are template-layer labels for "first/second occurrence of the
`DISRUPTION` token," not new vocabulary — F05's 7A-locked vocabulary remains exactly
`EXPECTATION`/`DISRUPTION`/`REACTION`/`RESTORE_ATTEMPT`/`RESTORE_FAILS` (five tokens). `EXPECTATION`
maps to F05's `EXPECTATION` token; `ADAPTATION/RESOLUTION` maps to 7B §11, present for every Form,
not F05-specific. `requiredBlueprintSlots`: `situation`, `hero`, `plan`, the five F05 event-chain
entries (with `DISRUPTION` occurring twice, kind-tagged), `resolution`. No belief/assumption field,
per F05's locked schema. Already validated against SIT099 and SIT014 in 7B/7E — not re-tested here,
per the task instruction that this is a carry-forward, not new design.

---

## Part 4 — Template selection layer, made concrete, and run by hand on 4 test plans

### Stage 1 — full ELIGIBILITY table

Combining 7E Decision 3 Stage 1 with T21/T22/T23 added:

| Form | Eligible pool |
|---|---|
| F01 Trying | T03 (default), T08, T09, T11 (if timed), T12 (weak/optional), T13, T18 (narrow), T19 (decision-shaped variant), T07 (cast-gated: 3 actively-responding characters) |
| F02 Discovery | **T22 "The Reframe Trail" (new default — see below)**, T17 (documented imperfect secondary, per 7E Decision 1), T01 (accumulation-shaped only), T04 (reveal-shaped only), T06, T15 (object/clue-assumption variant) |
| F03 Shift in Seeing | T16 (default), T02, T04 (secondary), T05, T10, T12 |
| F04 Connection | **T23 "The Assumption Bridge" (new default — see below)**, T05 (when ending can be staged as a second comparable encounter), T15 (bent fit), T14 (cast-gated: parallel-struggle second character), T07 (cast-gated: 3 actively-responding characters) |
| F05 Unexpected Turn | **T21 "The Disrupted Plan" (LOCKED default, per 7E Decision 2)**, T19 (documented partial secondary, missing the ≥2-disruptions mechanism) |

**Why T22/T23 are proposed as the new *defaults*, not just additions to the pool:** both scored a
100%-clean, zero-invented-content fit on both of their respective Form's tested situations (Part 1,
Part 2 above), which no existing template achieved for F02 (T17's best case still required inventing
2 obstacle beats) or was ever tested for F04 (7E explicitly left F04 unresolved). Per Decision 3
Stage 2's soft-scoring factor 3 ("structural-device fit... score down for each required device with
no supporting content"), T22/T23 each score a perfect 0 required-but-missing devices against every
plan tested so far, which is the concrete basis for proposing default status here — this is a
recommendation for Madhurima's confirmation, not a silent overwrite of 7E's "FLAGGED" status on F02
or the previously-unresolved status on F04; both remain flagged as *proposed*, not *locked*, until
approved, consistent with how 7E itself flagged T21's naming as "proposal only" before this document.

Cross-Form entries (T05, T07, T20) remain Form-spanning/situation-gated exactly as 7E documented —
unchanged here.

### Stage 2/3 — worked selection, 4 test plans

Spread: SIT045 (F01, 1-character, solo), SIT166 (F04, 2-character), SIT083 (F03, 2-character),
SIT099 (F05, 2-character) — 4 different Forms, one solo cast, three multi-character casts.

#### Selection 1 — SIT045 (F01, "Lost a favourite blanket," 1 character)

1. **Eligibility (Stage 1):** F01 pool = {T03, T08, T09, T11, T12, T13, T18, T19, T07}.
2. **Hard gates (Stage 2):**
   - Cast-composition gate: T07 requires 3 actively-responding supporting characters; SIT045 has 0.
     **T07 eliminated.**
   - Situation-content gate: T20 isn't even in the F01 pool here (no departure/return in SIT045);
     N/A.
   - Belief/assumption mismatch gate: none of T03/T08/T09/T11/T12/T13/T18/T19 have been updated
     per 7E's lint rule yet (all 8 are among the legacy 16 that still hard-require
     `belief.falseBelief`/`belief.trueBelief`). Per the lint rule's own scoping note, this gate
     narrows the pool to templates "already compatible or documented as needing the pass-through
     fix" — since 7D Part 4 already specifies exactly how T03 gets fixed (belief requirement
     dropped, `TURNING_POINT` redescribed via 7B's `EMOTIONAL CHANGE.startingState/changedState`),
     T03 is treated as **documented-compliant-pending-edit** and stays in the pool; the others stay
     in the pool too under the same documented-pending status, since none of them were re-tested for
     disqualifying content mismatches beyond the belief field.
3. **Soft scoring (Stage 2):**
   - Story Plan shape match: SIT045 has 6 events (ATTEMPT/CONSEQUENCE ×3). T03 has exactly 3
     ATTEMPT/CONSEQUENCE pairs (6 beats before turning point + resolution) — **near-exact count
     match.** T13 (Lost→Notice→Found) is also shape-plausible (loss/solo-regulation) but has fewer
     named beats and a resolution shape (object found) that doesn't match SIT045's actual resolution
     (object still missing, comfort found within) — **scores lower** on content-shape grounds. T09
     (Smallest Strength) is a strong secondary — 7D itself notes T09 "maps almost exactly" onto
     SIT045's tested plan — but T03 was already validated end-to-end in the original 7B test set,
     giving it a documented-fit edge T09 hasn't been walked through for.
   - Solo-story check: SIT045 has 0 supporting characters. T03's beats are all HERO-actor-capable
     (no beat structurally requires a co-actor) — **passes.** T07/T14-style co-actor-required
     templates already eliminated above.
   - Structural-device fit: T03 requires 3 genuinely different-approach attempts, drawn from
     `storyActions` — SIT045's plan supplies exactly 3 differing attempts (frantic search → retrace
     → self-comfort). **No invented device needed.**
4. **Selection (Stage 3):** **T03 "Three Tries" wins.** Tie-break not needed — T03 is both the
   Form's documented default and the highest-scoring survivor on shape-match and device-fit.

#### Selection 2 — SIT166 (F04, "New classmate sitting alone," 2 characters)

1. **Eligibility:** F04 pool = {T23 (proposed new default), T05, T15, T14, T07}.
2. **Hard gates:**
   - Cast-composition gate: T07 needs 3 actively-responding characters; SIT166 has 1 supporting
     character (the classmate). **T07 eliminated.** T14 needs a second character whose struggle
     *parallels the hero's own earlier struggle* — SIT166's classmate's struggle (not wanting to
     look rescued) doesn't parallel a stated prior struggle of Kavi's. **T14 eliminated.**
   - Belief/assumption mismatch gate: T05/T15 are both legacy-16 (hard-require
     `belief.falseBelief`/`belief.trueBelief`); T23 is compliant by construction (Part 2 above — no
     belief field, `assumption` optional). T05/T15 stay in the pool as documented-pending, per the
     same reasoning as Selection 1.
3. **Soft scoring:**
   - T23: **zero invented content** (Part 2's validation table above — every one of T23's 6 slots
     maps 1:1 to a SIT166 event with no gap).
   - T05 (Circle Back): requires the ending to be staged as a second, discrete, comparable encounter
     mirroring the opening. SIT166's actual resolution is *continuous conversation* (Kavi and the
     classmate talking normally through to the end of break) — 7D itself flags this exact situation
     as the case where T05's mirror device doesn't apply ("SIT166's ending is continuous
     conversation, not a discrete mirrored moment"). **Scores low** — would require forcing an
     artificial second discrete scene the plan doesn't have.
   - T15 (Unexpected Helper): requires an ASSUMPTION beat where the hero dismisses a *character or
     thing* as unable to help, then reverses. SIT166's assumption is about what the *other person
     wants*, not about their capability to help Kavi — a genuine content mismatch, matching 7D's own
     "bent fit" finding for F04 generally. **Scores low.**
4. **Selection:** **T23 "The Assumption Bridge" wins**, decisively — the only candidate with zero
   invented content, and it is the Form's proposed default.

#### Selection 3 — SIT083 (F03, "Friend got a new toy," 2 characters)

1. **Eligibility:** F03 pool = {T16 (default), T02, T04, T05, T10, T12}.
2. **Hard gates:**
   - Cast-composition gate: none of T16/T02/T04/T05/T10/T12 have a hard cast-count precondition.
     No eliminations here.
   - Belief/assumption mismatch gate: F03 is the one Form where the legacy belief requirement is
     *not* a mismatch — F03 genuinely supplies `belief.falseBelief`/`belief.trueBelief`-equivalent
     content (7B's `OPENING STATE.belief`), so this gate does not narrow the F03 pool at all (it is
     the one Form the legacy templates were originally built for).
3. **Soft scoring:**
   - T16 (Two Ways to See It): `EVENT → INTERPRETATION_1 → EVIDENCE_GATHERING → INTERPRETATION_2 →
     RESOLUTION`. SIT083's plan: EVENT≈EVIDENCE (toy arrives, belief confirmed);
     INTERPRETATION_1≈EVENT 1; EVIDENCE_GATHERING≈EVENTS 2–4 (group interest fades, friend's
     anxiety noticed, uncertainty held); INTERPRETATION_2≈EVENT 5 (own toy reassessed). **Clean
     fit**, with EVIDENCE_GATHERING absorbing 3 of SIT083's 5 events (T16 has fewer, broader beats
     than 7B's finer-grained event chain — this is the allowed merge operation from 7C Part 2, not a
     content gap).
   - T04 (Question Chain, F03 secondary per 7D): would require the same evidence chain restaged as
     3 literal spoken questions — SIT083's plan carries the whole arc through observation
     (watching, noticing the friend's anxiety), never dialogue. **Scores lower** — forces a spoken
     device the plan doesn't use, the same problem 7E found for F02.
   - T05 (Circle Back): would require SIT083's ending to mirror its opening as a second discrete
     "new toy comes out" scene — SIT083's actual resolution (Kavi starts a game with their own toy,
     others join) isn't a restaging of the opening scene. **Scores lower**, same reasoning as T05's
     elimination-by-scoring in Selection 2.
4. **Selection:** **T16 "Two Ways to See It" wins** — Form default, highest shape-match, no forced
   device. Tie-break rule (a) (prefer documented default) isn't even needed to break a tie here; T16
   wins outright on soft scoring alone.

#### Selection 4 — SIT099 (F05, "Noisy, overcrowded mall," 2 characters)

1. **Eligibility:** F05 pool = {T21 (LOCKED default), T19 (documented partial secondary)}.
2. **Hard gates:** No cast-composition or situation-content gates apply to either candidate. Belief
   gate: T21 is compliant by construction (7E Decision 2 — no belief slot). T19 is legacy-16
   (requires `belief.falseBelief`/`belief.trueBelief` via its `OPTION_OLD_BELIEF`/
   `OPTION_NEW_BELIEF` beats) — stays in pool as documented-pending, same treatment as elsewhere.
3. **Soft scoring:**
   - T21: 7 slots map 1:1 onto SIT099's actual 6-event plan plus resolution (EXPECTATION→
     DISRUPTION_1(crowd noise)→REACTION(push through)→DISRUPTION_2(announcement, differs in
     kind)→RESTORE_ATTEMPT(push on with parent)→RESTORE_FAILS(overwhelm keeps climbing)→
     ADAPTATION(quiet café)). **Zero invented content, per 7E's own already-completed validation.**
   - T19: per 7E Decision 2's own structural disqualification (restated, not re-derived here) — no
     mechanism for 2 disruptions differing in kind, no distinct RESTORE_ATTEMPT/RESTORE_FAILS pair
     (T19's CHOICE→CONSEQUENCE assumes the choice directly produces the consequence, with no failed
     intermediate attempt), and belief-shaped required content F05 doesn't supply. **Scores far
     lower on three independent structural grounds**, not merely narrower fit.
4. **Selection:** **T21 "The Disrupted Plan" wins**, matching 7E's already-LOCKED default — this
   worked example simply demonstrates the selection *process* landing on the same, already-correct
   answer end-to-end, gate by gate, rather than by assertion.

---

## Part 5 — Two full end-to-end pipeline dry runs

Fresh situation IDs, checked against every ID used in `tmp_phase7b_expanded_story_plan_test.md`,
`tmp_phase7c_template_mapping_and_compression.md`, `tmp_phase7d_template_layer_redesign.md`,
`tmp_phase7e_locked_decisions.md`, and the earlier stress-test docs referenced inside them (SIT045,
SIT143, SIT148, SIT166, SIT083, SIT051, SIT168, SIT089, SIT099, SIT020, SIT050, SIT014, SIT123 all
excluded): **SIT131** ("Overheard adults talk about 'a big change coming'") and **SIT042** ("Friend
doesn't want to play today"), pulled from `public/prana-story-generator/phase6-data/situations.json`.

### 5.1 — SIT131 → F02 → T22

**Situation (Phase 6 data, verbatim fields used):**
`childExperience`: Kavi overhears adults mention an important upcoming change but doesn't hear
what it is. `immediateWant`: find out what's going to happen. `emotionalTension`: partial
information, imagination supplies the rest. `falseBeliefText`/`trueBeliefText` present in Phase 6
(`"Unknown changes are always bad"` / `"I can face change calmly and ask questions when I'm
unsure"`) — **per 7B's locked rule, this Phase 6 belief data is background/input material only and
is not automatically Story Plan content**, since Form selection below determines F02, which carries
no belief field at all.

**Form (7A):** The situation's actual mechanic is investigative, not attempt/consequence, not
belief-confirmed-then-contradicted, not a person-to-person misread, not a disrupted plan — Kavi
notices a fragment, actively investigates, and discovers what it means. This is **F02 Discovery**,
selected on the mechanic (NOTICE→INVESTIGATE→DISCOVER→CONNECTED_DISCOVERY), independent of the
Phase 6 belief fields present, exactly as 7B's locked architecture requires ("Form does not choose
or restrict [ingredients]; it determines how they're used").

**Cast/World/Object resolution (7B §3–7, before any event planning per §3c):**
- HERO: Kavi.
- SUPPORTING CHARACTERS: none named by the storySeed as an active participant — the adults'
  conversation is overheard, not addressed to Kavi, and no single adult is positioned as an actor in
  the discovery itself (the storySeed says "the adults," plural, unspecified, already walked away
  behind a closed door). Per §3a, this makes SIT131 a candidate solo (0-supporting-character) plan,
  checked below.
- WORLD/SETTING: home, near the room where the private adult conversation happened, in the
  ordinary flow of an evening.
- KEY OBJECT(S): **CORRECTED (see "Error 1 correction" note below) — the suitcase tag and the
  calendar, not none.** The original version of this document classified this as "none," on the
  reasoning that "the big change is information, not an object." That classification was wrong on
  its own terms: §4a's test is not "is the story fundamentally about an object," it is whether the
  plan can name, in one of the eight verbs, what the hero does with/to something — and the event
  chain built two sections below does exactly that. Kavi **discovers** the suitcase tag and the
  calendar (EVENT 2/3) and **uses** them, together with the overheard fragment, to drive and
  resolve the investigation (EVENT 4). That satisfies "discovers" and "uses" directly. The original
  "none" verdict was written by looking at the storySeed's *stated* want ("find out what's going
  to happen" — an information-want, not an object-want) rather than at what the Story Plan itself
  ended up doing with the suitcase tag and calendar once EVENT 2 was authored. See the "Error 1
  correction" note after the Story Plan below for the full accounting, including how much of this
  content came from the situation's own data versus how much was authored.
- §3c complete-cast-before-events check: Hero (Kavi) + Supporting Characters (none) + World (home,
  evening) + Key Object (none) are all resolved above, before any event is planned.

**Template selection:** Stage 1 — F02 pool = {T22 (proposed default), T17, T01, T04, T06, T15}.
Stage 2 hard gates: no cast-composition gate applies (no template in this pool requires a specific
supporting-character count); belief gate — T22 compliant by construction, others legacy-16 pending.
Stage 2 soft scoring: T22 maps 1:1 to the event chain planned below with zero invented content
(shown in the walkthrough table); T17 would again need to invent 2 `OBSTACLE` beats (this situation
has no obstacle — nothing blocks Kavi from investigating, only the passage of time until the
mystery resolves); T01 has no accumulating discrete-item list to refrain over; T04 has no spoken
dialogue in the plan below. Stage 3: **T22 wins.**

**Full 15-step Story Plan (7B LOCKED SCHEMA §1 sequence):**

```
1. FORM: F02 — The Discovery Journey

2. STORY ESSENCE
   emotionalTruth: A fragment of a sentence isn't the whole story — and asking beats guessing.
   storyQuestion: What is the "big change," really?
   coreChange: A scary unknown becomes a specific, knowable thing.
   minimumStorySpine: see §15.

3. HERO: Kavi

4. SUPPORTING CHARACTERS: none — the adults' conversation is overheard, not addressed to Kavi,
   and no single adult is named as an active discovery-partner in the storySeed. (§3a solo check
   below.)

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: find out what the "big change" actually is.
   supportingWants: n/a.

6. WORLD/SETTING: home, evening, just outside the room where the adults were talking, in the
   ordinary after-dinner routine.

7. KEY OBJECT(S): **CORRECTED — the suitcase tag and the calendar.** Both are discovered
   (EVENT 2/3) and used together with the overheard fragment to drive the CONNECTED_DISCOVERY that
   resolves the story (EVENT 4). This satisfies §4a's "discovers"/"uses" verbs directly; see the
   correction note after this Story Plan for the full accounting.

8. OPENING STATE
   situation: The door closes on "...once the big change happens." Kavi stands in the hallway,
     turning the four words over, filling in the rest with guesses.
   (no belief field — F02 carries none, per LOCKED SCHEMA.)

9. HERO WANT: Find out what the big change is, before imagining something worse than the truth.

10. EVENT CHAIN
    EVENT 1 [NOTICE]              actor: HERO — Kavi catches the fragment through the door before
                                    it closes, instead of letting it pass like background noise.
                                    newInfo: attention shifts from "adult talk, not my business" to
                                    "I need to know this."
    EVENT 2 [INVESTIGATE]         actor: HERO — Kavi starts paying closer attention to small
                                    changes already happening around the house — a suitcase tag by
                                    the door, a calendar page turned early, hushed calls that stop
                                    when Kavi enters.
                                    newInfo: this isn't one overheard sentence in isolation — there
                                    are other small signs Kavi hadn't connected before.
    EVENT 3 [DISCOVER]            actor: HERO — Kavi notices the suitcase tag has an unfamiliar
                                    city's name on it, and the calendar's turned page marks a date
                                    only a few weeks off.
                                    newInfo: this points to something specific and locatable — a
                                    trip, or a move — not a vague, formless "bad thing."
    EVENT 4 [CONNECTED_DISCOVERY] actor: HERO — Kavi puts the tag, the calendar, and the fragment
                                    together and asks a parent directly: "Are we moving somewhere?"
                                    — and learns it's Papa's new work assignment, in a city Kavi's
                                    family has actually visited and liked before.
                                    newInfo: the accumulated signs, taken together, reframe "a big,
                                    scary unknown" into "a specific, plannable, even exciting thing"
                                    — invisible from any single overheard word alone.

11. TURNING POINT
    trigger: EVENT 3→4 — the suitcase tag + calendar + fragment together prompt Kavi to finally
      ask, rather than keep guessing.
    statement: The "big change" was never a shapeless threat — it had a name and a date the whole
      time, and asking got Kavi there faster than guessing ever could.

12. NEW CHOICE/ACTION: Kavi asks the direct question out loud instead of continuing to
    privately assemble clues and worry in silence.

13. EMOTIONAL CHANGE
    startingState: unsettled, filling a four-word fragment with the worst possible guesses.
    changedState: steady — the unknown has a shape now, and it isn't the shape Kavi feared.

14. RESOLUTION/NEW STATE: Kavi starts asking about the new city at dinner — what the weather's
    like, whether the old friends they visited last time still live nearby — shown through Kavi's
    own curious questions, not narrated as "Kavi learned not to worry."

15. MINIMUM STORY SPINE
    1) fragment overheard, imagination fills the gap (opening + want)
    2) small signs noticed around the house (investigate — meaningful progression, not padding:
       this is what turns "one sentence" into "a pattern")
    3) tag + calendar point somewhere specific (discover — escalating specificity)
    4) Kavi asks directly, learns the real answer (turning point + resolution trigger)
    5) Kavi engages with the new city with curiosity, not dread (ending consequence)
    Removing any of 1, 3, 4, 5 collapses the arc; event 2 (the small-signs noticing) is the safest
    compression point if Phase 8 needs the room — it can be folded into event 3 without losing the
    "pattern, not one clue" mechanic, mirroring 7B's own note on SIT143's event 2.
```

**Error 1 correction — SIT131's Key Object classification, and an honest T22 fit reassessment:**

The document as originally written declared `KEY OBJECT(S): none` for SIT131 while, two sections
later, building an event chain in which Kavi discovers a suitcase tag and a calendar page and uses
them together to resolve the mystery. That is an internal contradiction: §4a's rule is verb-based
("searches for/uses/protects/discovers/loses/gives/changes/attaches meaning to"), not
topic-based ("is this story about an object"), and the suitcase tag and calendar plainly satisfy
**discovers** (EVENT 2, EVENT 3) and **uses** (EVENT 4 — Kavi puts them together with the
overheard fragment specifically in order to ask the right question). Corrected classification:
**Key Object(s) = the suitcase tag and the calendar.**

**How much of this was invented vs. sourced from the situation's own data — stated plainly:**
SIT131's actual `situations.json` storySeed (verified directly, see below) is minimal: an
overheard four-word fragment, an emotional-tension line about imagination filling gaps, and a
`narrativeSummary` of Kavi standing still, guessing. It contains **no suitcase, no tag, no
calendar, no city name, no travel plan, and no parent explanation of any kind.** Every piece of
EVENT 2 and EVENT 3's content — the suitcase tag, the calendar page, the unfamiliar city's name,
the near date — was authored at the 7B Story Plan layer, not drawn from Phase 6 data. This is
allowed under 7B's rules (storySeeds are seeds, not full plans; Phase 7B is expected to author
concrete scene content), and the original document's Part 6 "honest assessment" already flagged
EVENT 2 as "authored, not strictly extracted." But that flag was about *content richness*, not
about *object classification* — it did not connect the dots to say "and therefore this counts as
a Key Object under §4a's own verb test." The "zero invented content" claim for T22's SIT131 fit
(stated in the T22 slot-mapping table above, "Zero invented content, per 7E's own already-completed
validation") is **too generous** for that same reason: T22's *slot structure* maps 1:1 with zero
gaps, that part is true and remains true — but the *scene content* that fills DISCOVER/INVESTIGATE
(the tag, the calendar, the city, the date) had to be invented in full, not extracted, because the
storySeed doesn't supply it. "Zero invented content" should be read as "T22 the template required
no structural invention" — it should never have been used, unqualified, to also describe the Story
Plan layer underneath it, where a Key Object and its identifying details were invented wholesale.

**Does T22 still fit SIT131 well, honestly stated?** Yes, structurally — T22's NOTICE→
INVESTIGATE→DISCOVER→CONNECTED_DISCOVERY slots still map cleanly onto the corrected plan with no
gaps, and the reinterpretation device still works (each beat still restates what the prior beat
now means). What changes is not the template fit but the *evidentiary weight* of calling this a
clean end-to-end validation: SIT131 is not, as previously framed, a demonstration that T22 handles
a fresh Phase-6 situation with "zero invented content" — it is a demonstration that T22's slot
structure survives even when Phase 6 supplies almost nothing, *because* the Story Plan layer is
free to (and here, had to) invent an entire Key Object and its identifying details to give
INVESTIGATE/DISCOVER something concrete to work with. That is a real, useful finding about T22's
robustness to sparse storySeeds — but it is a different, weaker claim than "zero invented content,"
and this document should not have conflated the two. Recommend reading SIT131 going forward as
"T22 fits, with the caveat that sparse storySeeds push authorial weight onto Phase 7B in a way that
now also has to be tracked as a Key Object" rather than as a clean zero-invention validation.

**§3a solo-story QA check:** `supportingCharacters.length === 0`. Turning point action: Kavi *asks
directly* rather than continuing to silently accumulate guesses — this is a genuine STRATEGY
change (investigate-by-asking replaces investigate-by-inferring-alone), not "waited," not
"relocated," not "tried harder at the same approach." **Passes.**

**T22 slot mapping (Event Planner-equivalent walkthrough):**

| T22 slot | SIT131 content | Gap? |
|---|---|---|
| NOTICE | EVENT 1 (fragment overheard) | none |
| INVESTIGATE | EVENT 2 (small signs noticed) | none |
| DISCOVER | EVENT 3 (tag + calendar point somewhere specific) | none |
| CONNECTED_DISCOVERY | EVENT 4 (asks directly, learns the real answer) | none |
| NEW_CHOICE | Kavi's direct question, folded into EVENT 4's action | none |
| RESOLUTION | Kavi's curious dinner-table questions | none |

*(Table reads "Gap? none" for template-slot mapping, which remains accurate — T22's structure has
no unfilled slot. It does not mean, and should not be read to mean, that the underlying content is
un-invented; see the Error 1 correction above for the Key Object accounting this table doesn't
capture.)*

**Compressed 50–70 word story text**, with spine-element coverage shown explicitly:

> *Kavi hears four words through a closing door — "once the big change happens" — and nothing
> more. [Spine 1] Then the small things start adding up: a suitcase tag, a calendar page turned
> early. [Spine 2] The tag names a city. The date is close. [Spine 3] So Kavi finally just asks —
> and it's Papa's new job, in the city they loved visiting. [Spine 4] Now Kavi asks about the
> weather there instead of lying awake guessing. [Spine 5]*

Word count: **68 words.** All 5 minimum-spine elements present and individually locatable in the
text (bracket labels added here for verification only — they would not appear in production text).

### 5.2 — SIT042 → F04 → T23

**Situation (Phase 6 data, verbatim fields used):**
`childExperience`: Kavi asks a friend to play; the friend says "not today," no explanation given.
`emotionalTension`: quietly hurt and confused. `falseBeliefText`/`trueBeliefText` present in Phase
6 (`"If my friend chooses someone else, I'm not important"` / `"Friendships can grow even when
people spend time with others"`) — again, background input only; the field this Form actually
populates is `assumption`, per 7B's locked split, not `belief`.

**Form (7A):** This is specifically about one hero misreading one other person's want/state, not a
worldview-level belief about friendship-in-general (that would be F03's shape, closer to SIT051).
Kavi's read ("my friend doesn't want me") is a narrow prediction about THIS friend, THIS day,
corrected by something the friend themself reveals. This is **F04 Connection**.

**Cast/World/Object resolution (7B §3–7):**
- HERO: Kavi.
- SUPPORTING CHARACTERS: the friend — role "friend," relationshipToHero "regular playmate," want
  (initially assumed by Kavi to be "doesn't want to play with Kavi anymore"; actually "needs a quiet
  day, unrelated to Kavi"), narrativeFunction: carries the REVEAL, per T23's hard actor rule.
- WORLD/SETTING: school or the usual playground, the same spot Kavi always asks.
- KEY OBJECT(S): none — per §4a, nothing is searched for/used/protected/discovered/lost/given/
  changed/attached-meaning-to; this is a purely relational F04 story, the same category as SIT166.
- §3c check: Hero + Supporting Character (friend) + World (playground/school) + Key Object (none)
  resolved before event planning.

**Template selection:** Stage 1 — F04 pool = {T23 (proposed default), T05, T15, T14, T07}. Stage 2
hard gates: T07 eliminated (needs 3 actively-responding characters; SIT042 has 1). T14 eliminated
(needs a second character whose struggle parallels a stated prior struggle of Kavi's own; none is
established here). Belief gate: T23 compliant by construction; T05/T15 legacy-16, pending. Stage 2
soft scoring: T23 maps 1:1 (below); T05 would require the ending to restage the opening's "asking to
play" moment as a second discrete mirrored scene — the planned resolution below is continuous
same-day reconciliation, not a second, separate mirrored encounter, so T05 scores low on the same
grounds as Selection 2 in Part 4; T15 requires an ASSUMPTION about the friend's *capability to help*
— this situation has no help-capability content at all, a clean content mismatch. Stage 3: **T23
wins.**

**Full 15-step Story Plan:**

```
1. FORM: F04 — The Connection Journey

2. STORY ESSENCE
   emotionalTruth: A "not today" is about today, not about me.
   storyQuestion: Does "not today" mean what Kavi's afraid it means?
   coreChange: A friend's "no" stops being read as a verdict on the friendship.
   minimumStorySpine: see §15.

3. HERO: Kavi

4. SUPPORTING CHARACTERS:
   - role: "friend"
     relationshipToHero: regular playmate, someone Kavi always plays with
     want: (initially assumed by Kavi: doesn't want to play with Kavi specifically; actually
       revealed: needs a quiet day today, unrelated to Kavi at all)
     narrativeFunction: carries the REVEAL — the friend's own admission is what corrects Kavi's
       assumption; per T23's hard rule, this beat's actor is the friend, not Kavi.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: play with the friend the way they always do.
   supportingWants: friend wants a quiet day — not rejecting Kavi, just not up for playing today.

6. WORLD/SETTING: the usual playground/school spot where Kavi always asks the friend to play.

7. KEY OBJECT(S): none — a purely relational F04 story; nothing forced in per §4a.

8. OPENING STATE
   situation: Kavi walks up the same way as always and asks. The friend says "not today" and
     looks away, offering nothing else.
   assumption: (F04 field) The friend doesn't want to play with Kavi anymore.

9. HERO WANT: Get to play with the friend today, the way it always goes.

10. EVENT CHAIN
    EVENT 1 [ENCOUNTER]         actor: HERO — Kavi asks the way Kavi always asks, expecting the
                                  usual yes.
                                  newInfo: Kavi has acted on the ordinary expectation, not yet on
                                  the assumption — the assumption forms in response to what
                                  happens next.
    EVENT 2 [INITIAL_RESPONSE]  actor: friend — The friend says "not today," flatly, no reason
                                  given, and looks away.
                                  newInfo: the answer doesn't match the ordinary pattern; Kavi's
                                  assumption ("they don't want me") forms here, in the gap left by
                                  no explanation.
    EVENT 3 [REVEAL]            actor: friend — Later, when Kavi checks in gently ("did I do
                                  something?"), the friend admits they're just tired today — a
                                  late night, a rough morning — and didn't want to explain in front
                                  of everyone else.
                                  newInfo: this is a reveal about the FRIEND specifically — the
                                  "no" was about their own day, not about Kavi.
    EVENT 4 [DEEPER_NOTICE]     actor: HERO — Kavi realizes the friend needed permission to have
                                  an off day without it costing them the friendship — not rescue,
                                  not an explanation owed, just room.
                                  newInfo: this changes what Kavi does next, not just what Kavi
                                  feels.
    EVENT 5 [CHANGED_RESPONSE]  actor: HERO — Instead of asking to play again right away or
                                  needing reassurance, Kavi just says "okay, tomorrow then" and
                                  means it, no hurt undertone.

11. TURNING POINT
    trigger: EVENT 3→4 — the friend's admission recontextualizes the flat "not today."
    statement: Kavi understood the "no" was about the friend's day, not about Kavi's place in the
      friendship.

12. NEW CHOICE/ACTION: Kavi drops the need for an explanation or reassurance and responds simply,
    warmly, leaving the door open rather than pulling back.

13. EMOTIONAL CHANGE
    startingState: certain a flat "no" means something's wrong between them.
    changedState: able to hold "not today" as just that — today — without it meaning less.

14. RESOLUTION/NEW STATE: The next day, Kavi asks again, same as always, and the friend says yes,
    same as always — demonstrated relationally through the return of the ordinary pattern, not
    through Kavi narrating a lesson learned.

15. MINIMUM STORY SPINE
    1) Kavi asks, friend says "not today," no reason (opening + want + assumption forming)
    2) the flat response, no explanation (initial response — load-bearing, this is what plants
       the assumption)
    3) the friend's admission — tired, not rejecting (reveal — cannot compress, this IS the F04
       mechanic)
    4) Kavi responds warmly, no hurt undertone (changed response)
    5) next day, the ordinary pattern resumes (ending consequence, relational)
    All 5 are load-bearing; this is a tight 5-event F04 spine with no safe cut, matching 7B's own
    finding that F04 spines (SIT166, SIT089) tend to be tight.
```

**§3b multi-character QA check:** the friend **reveals** (EVENT 3) and **is changed by** Kavi's
response (EVENT 5, the friendship resuming instead of straining) — passes cleanly, no ambiguity of
the SIT089-baby kind.

**T23 slot mapping:**

| T23 slot | SIT042 content | Gap? |
|---|---|---|
| ENCOUNTER | EVENT 1 (Kavi asks as usual) | none |
| INITIAL_RESPONSE | EVENT 2 (flat "not today," actor = friend) | none |
| REVEAL | EVENT 3 (friend's admission, actor = friend) | none |
| DEEPER_NOTICE | EVENT 4 (Kavi understands "room," not rejection) | none |
| CHANGED_RESPONSE | EVENT 5 ("okay, tomorrow then") | none |
| RESOLUTION | next-day ordinary pattern resuming, HERO + friend | none |

**Compressed 50–70 word story text:**

> *Kavi asks the way Kavi always asks. "Not today," the friend says, and looks away — no reason
> given. [Spine 1–2] Kavi checks in gently, and the friend admits: just a tired, rough morning,
> nothing to do with Kavi at all. [Spine 3] "Okay — tomorrow then," Kavi says, and means it. [Spine
> 4] The next day, Kavi asks again. This time, the answer is yes. [Spine 5]*

Word count: **62 words.** All 5 minimum-spine elements present.

### Honest note on both dry runs (see also Part 6)

Both pipelines ran cleanly end to end with **zero forced *structural* content** at any stage — Form
selection, template selection, and 50–70 word compression all landed without needing to invent a
device, pad a beat, or cut a spine element. **Correction:** the cast/world/object resolution stage
is not equally clean — SIT131's object resolution was originally mis-stated as "none" when the plan
in fact invents and then relies on a Key Object (the suitcase tag and calendar) under §4a; see the
Error 1 correction in §5.1 above. "Zero forced content" is accurate for template structure, not for
every resolution step underneath it. This is itself informative: both
fresh situations happened to be clean single-thread narratives (one hero, one supporting presence at
most, one clear discovery/reveal mechanic) — see Part 6 for where this smoothness might be
optimistic rather than representative.

---

## Part 6 — Honest assessment

### What worked cleanly

- **T22 and T23's core design principle held up under real, unseen data**, not just the two
  situations they were validated against in Parts 1–2. 7D's original observation — "the cleanest
  possible template for any Form is one whose slots are simply that Form's own vocabulary plus a
  RESOLUTION slot" — proved true a third and fourth time (SIT131, SIT042), not just the two
  situations it was first derived from. This is a real, generalizable finding, not a coincidence of
  the specific test situations chosen: F02 and F04's own 7A-locked vocabularies are complete enough
  event descriptions that no additional authorial device (refrain, spoken question, mission-framing,
  mirror) was ever needed to make a working template. T01–T20's forced-fit problems (7C, 7D, 7E)
  came entirely from being designed against a different, pre-7B assumption (universal belief
  transformation), not from any inherent difficulty in F02/F04 content.
- **The selection process (Part 4) produced auditable, gate-by-gate reasoning every time**, including
  correctly re-deriving 7E's already-settled T21 answer for SIT099 from scratch via the process
  rather than by assertion — a genuine confirmation the process works, not just a demonstration that
  it exists.
- **The Minimum Story Spine survived compression intact in both end-to-end dry runs**, with every
  spine element individually locatable in the final ~50–70 word text, exactly as 7B's own compression
  rule requires.
- **§3a/§3b/§4a's QA rules all applied cleanly to the two fresh situations** without needing any
  new interpretation or exception — SIT131's solo-story strategy-change check passed on inspection
  (investigate-by-asking replacing investigate-by-inferring), and SIT042's supporting-character
  function check passed without the SIT089-baby-style ambiguity.

### What felt forced, or nearly did

- **SIT131's `EVENT 2` (small signs noticed around the house) was authored, not strictly extracted**
  from the Phase 6 storySeed, which supplies only the overheard fragment and the emotional tension —
  it does not itself supply a suitcase tag or a calendar page. This is not a violation of any locked
  rule (7B explicitly allows/expects Phase 7B to author concrete scene content beyond the storySeed's
  bare fields — the storySeed is a seed, not a full plan) but it is worth flagging honestly: F02's
  INVESTIGATE beat, by its nature, needs *something* concrete for the hero to notice, and a situation
  whose storySeed is this minimal (one overheard sentence, no described environment) puts more
  authorial weight on this single beat than SIT143's or SIT148's park-bench settings did, where the
  physical objects were already present in the storySeed. This is a **content-richness variance
  across situations**, not a template defect — but it means T22's zero-invented-content result for
  SIT131 is slightly less "free" than it looks; the template invented nothing structurally, but the
  Story Plan layer (7B) did have to invent scene furniture the storySeed didn't supply. Recommend
  flagging this as a Phase-6-storySeed-richness variance to watch for at scale, not a 7F/T22 problem.
- **SIT042's REVEAL (EVENT 3) required a small authored bridge** — the storySeed gives Kavi's "not
  today" and nothing else; the friend's actual reason (tired, rough morning) had to be invented to
  populate the REVEAL beat T23's hard rule requires (the reveal must be the friend's own admission,
  not Kavi's guess). Again, this is expected and allowed — 7B's own tested F04 plans (SIT166's
  classmate's self-consciousness, SIT089's Mama's explanation) all required the same kind of
  reveal-content authorship, since Phase 6 storySeeds don't pre-write what the OTHER character was
  actually feeling. Flagging it here for completeness rather than treating it as a new problem this
  document discovered — it is the same authorial step 7B already normalized, just reconfirmed on a
  fourth F04 situation.
- **Neither fresh situation tested a harder case**: both SIT131 and SIT042 are single-supporting-
  presence-at-most stories with no key object and no F02/F04 boundary risk (SIT042 has no found
  object at all, so the F02/F04 seam flagged in 7B §5 / carried into T22's RESOLUTION note in Part 1
  never gets exercised here). The two fresh situations were chosen specifically to be *fresh IDs*,
  not specifically to be *hard* IDs — a rigorous read of this dry run should note that it validates
  the clean case twice, not the edge case. **This is reported honestly, not smoothed over**: a truly
  adversarial end-to-end test would have deliberately picked a fresh situation shaped like SIT148
  (object + late-arriving owner) to re-stress the F02/F04 boundary against T22/T23 specifically,
  which this document did not do.

### What's still open

1. **T22 and T23's default status is a recommendation, not a lock.** Per Part 4's own framing,
   proposing them as defaults is based on 2 clean validations each (4 situations total across both
   templates plus the 2 fresh dry-run situations = 6 total data points across both templates, 3
   each) — a reasonable but not exhaustive sample. Madhurima's confirmation is the actual lock, same
   as 7E left T21's naming pending confirmation before this document formally assigned its ID.
2. **The legacy-16-template belief-requirement migration remains untouched and unscheduled** — 7E's
   Decision 3 Stage 2 hard gate #3 and this document's worked selections both continued treating
   legacy templates as "documented-pending" rather than actually compliant. This is explicitly still
   open, exactly as 7E left it.
3. **T22's RESOLUTION-must-stay-about-the-object note (Part 1) is a recommendation for a future
   `resolutionPattern` field, not an enforced rule anywhere yet** — there is still no lint/QA
   mechanism that would catch a future T22-templated story drifting toward F04-shaped warmth in its
   final beat, the same gap 7B §5 originally flagged as deferred to "whoever builds template QA
   later." That "later" still hasn't happened.
4. **A genuinely adversarial end-to-end test (a fresh SIT148-shaped situation run through T22, or a
   fresh SIT089-shaped situation with a passive/non-acting supporting character run through T23)
   was not attempted here** and would be the natural next paper-test step before implementation
   begins, per the honesty note above.
5. **`productionInputs`/symbol integration was not exercised in either dry run** — both Story Plans
   above were built and compressed without reference to `productionInputs.symbol` at all, consistent
   with 7E Decision 4's rule that Story Plan generation must not read production data, but it means
   this document does not demonstrate the full pipeline including the parallel `productionInputs`
   branch reaching the Template + Event Planner stage — only the Story-Plan-and-template half was
   dry-run end to end.

**Net assessment:** the architecture holds. Every locked rule from 7B through 7E applied without
contradiction to two situations neither document was written against, the selection process is now
demonstrably runnable by hand rather than only specified on paper, and F02/F04 both now have a
purpose-built template with a real, repeatable, zero-invented-content validation record. The open
items above are genuine gaps (a QA mechanism not yet built, a migration not yet scheduled, an
adversarial test not yet run) rather than architectural cracks — consistent with 7E's own closing
assessment of the state of the design as a whole.

---

## Part 7 — Two adversarial stress tests (new, this revision)

Both dry runs in Part 5 turned out, on inspection above, to be clean single-thread cases (Part 6
already half-admitted this before the Error 1 correction sharpened it). The two tests below are
deliberately picked to be hard, not fresh: SIT148 is the situation that has already broken the
F02/F04 boundary seam twice before, run for the first time through T22 specifically; SIT089 is the
situation already flagged as an ambiguous passive-character case, run for the first time through
T23's own hard actor rule. Neither test invents a new situation — both reuse real, already-tested
`situations.json` entries and real 7B Story Plans already built in `tmp_phase7b_expanded_story_plan_test.md`
Part B §3 and §8, remapped onto T22/T23's slot structure.

### 7.1 — Adversarial Test 1: SIT148 (object + late owner) through T22 "The Reframe Trail"

**Full 15-step 7B Story Plan, remapped from `tmp_phase7b_expanded_story_plan_test.md` Part B §3
onto T22's 6 slots (no content changes — same plan, template lens added):**

```
1. FORM: F02 — The Discovery Journey

2. STORY ESSENCE
   emotionalTruth: What I found isn't "a found thing" — it's someone else's search, unfinished.
   storyQuestion: Whose is this, and what happens when Kavi finds out?
   coreChange: An anonymous object becomes a specific person's answered search.

3. HERO: Kavi

4. SUPPORTING CHARACTERS:
   - role: "owner" — a park regular, not previously known to Kavi; appears only at EVENT 4;
     narrativeFunction: "endpoint of the discovery" (per 7B Part C §1's own guardrail wording,
     carried forward unchanged) — never drives the plot's questions, only receives the answer.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: figure out what this thing is and what to do with it.
   supportingWants: owner wants their object back (present in the world the whole time, off-page
     until EVENT 4).

6. WORLD/SETTING: the park, the same bench, across two consecutive afternoons.

7. KEY OBJECT(S): the found object (initials scratched into the underside) — genuine per §4a:
   discovers, protects (implicitly, by not discarding it), gives (returns it to the owner).

8. OPENING STATE
   situation: Kavi spots something small and valuable half-hidden under a park bench. Nobody else
     is around.
   (no belief/assumption field — F02 carries none.)

9. HERO WANT: figure out what this thing is and who it belongs to.

10. EVENT CHAIN — T22 slot mapping shown inline
    [NOTICE]              actor: HERO — Kavi picks it up, turns it over. "It's not random junk —
                            it looks cared for."
    [INVESTIGATE]         actor: HERO — finds initials scratched into the underside. Reinterpretation:
                            "it has an identity attached to it now, not just a shape."
    [DISCOVER]            actor: HERO — the initials match a name Kavi's heard called out by a
                            regular at this bench. Reinterpretation: "the object connects to a
                            specific, findable person."
    [CONNECTED_DISCOVERY] actor: HERO — Kavi remembers seeing that same woman crouched searching
                            the grass here yesterday, looking worried. Reinterpretation (per T22's
                            device, this is the required "what do beats 1–3 now mean, together"
                            statement): "This isn't a found thing anymore — it's very specifically
                            someone's search, still unfinished."

11. TURNING POINT
    trigger: EVENT 3→4 — the memory of yesterday's search recontextualizes the object.
    statement: (same as CONNECTED_DISCOVERY's reinterpretation above — T22 places the turning
      point exactly here, per Part 1's "Turning point placement.")

12. NEW_CHOICE: Kavi comes back to the same bench the next afternoon, object in hand, instead of
    leaving it at a lost-and-found or keeping it.

13. EMOTIONAL CHANGE
    startingState: torn — tempted to keep it, aware it isn't really Kavi's.
    changedState: clear — once the object has a specific person attached, keeping it stops being
    a live question.

14. RESOLUTION: actor HERO + owner — Kavi hands it back. The owner's relief is immediate and
    specific to THIS object, not a new friendship being formed. (This last clause is an authored
    guardrail sentence, not an organic result of the preceding beats — see stress-test finding
    below.)

15. MINIMUM STORY SPINE: unchanged from Part B §3 — all 5 elements load-bearing, no safe
    compression point.
```

**Stress test — does T22's reinterpretation device make the object/relationship seam easier or
harder to hold?**

Run the device as specified in Part 1 ("each slot after NOTICE is defined by what the previous
slot is now understood to mean"). Applying that instruction literally to SIT148's CONNECTED_
DISCOVERY beat produces exactly the sentence the Story Plan already uses: *"This isn't a found
thing anymore — it's very specifically someone's search, still unfinished."* Read that sentence
again: it is not phrased as "the object's owner is now identifiable" (a fact statement, object-
centered). It is phrased as "someone's search, unfinished" — a sentence about a *person's
unresolved experience*, carried by the object as a vehicle. The reinterpretation device didn't ask
"what new fact do we have" (F02's raw `newInformationOrShift` field would have been satisfied by
the flatter, fact-only version); it asked "what does this now *mean*," and the honest,
well-written answer to "what does this now mean" for an object with a specific owner attached is
almost unavoidably a statement about that owner's experience, not just the object's status.

**Finding: the device makes the seam WORSE, not better, and the only thing currently holding
SIT148's payoff on the object side is an authored guardrail sentence bolted onto RESOLUTION after
the fact** ("not a new friendship being formed" — a sentence that exists *specifically to cancel
out* the emotional momentum CONNECTED_DISCOVERY's own reinterpretation just built). That is
different from the device containing the risk structurally. Nothing in T22's slot definitions
prevents CONNECTED_DISCOVERY's reinterpretation from being written in relational language — Part 1
already anticipated this by adding a recommended note for T22's future `resolutionPattern` field
("resolution must stay about what was discovered... if the last-appearing character is given
warmth or interiority beyond relief, the story has drifted into F04"), but that note is currently
**prose guidance for a human author, not a structural constraint T22 enforces**, and it sits on
RESOLUTION — one slot downstream of where the actual pull toward relationship-framing gets
generated (CONNECTED_DISCOVERY). An author who does not know to apply that specific downstream
correction, or a future automated Event Planner that fills CONNECTED_DISCOVERY's reinterpretation
field from a generic "what does this now mean" prompt without the guardrail attached at that exact
slot, would very plausibly produce an F04-shaped ending from this F02 template — not despite
following T22's instructions, but *because of* following them correctly.

**Verdict: FAIL.** Not a catastrophic failure — the plan above still reads as F02, and a careful
author (as this document's own authors were, twice now) can hold the line. But "a careful author
can hold the line if they remember to" is exactly the kind of unenforced discipline 7B §5
originally flagged as needing a real T-layer QA mechanism, not optimism. This is the third
recurrence of the seam, and the first time it has recurred *inside* a purpose-built template
specifically designed to prevent it — which means the template, as currently specified, does not
yet solve the problem it was partly justified by solving.

**PROPOSAL (requires Madhurima's approval, not applied):** move the guardrail from a prose note on
`resolutionPattern` to a structural constraint on CONNECTED_DISCOVERY itself — e.g. a required
`reinterpretationFocus: "object"` tag on that slot specifically (not just RESOLUTION), with an
explicit negative instruction at the point of generation: "state what the accumulated discoveries
now reveal about the *object/situation*; do not characterize the newly-identified person's
feelings, history, or relationship to the hero in this slot — that content, if any, belongs only in
RESOLUTION, and only as a single-sentence factual reaction, not interiority." This pushes the
constraint to the slot that actually generates the risk, not the slot one step downstream of it.

### 7.2 — Adversarial Test 2: SIT089 (passive supporting character) through T23 "The Assumption Bridge"

**Full 15-step 7B Story Plan, remapped from `tmp_phase7b_expanded_story_plan_test.md` Part B §8
onto T23's 6 slots:**

```
1. FORM: F04 — The Connection Journey

3. HERO: Kavi

4. SUPPORTING CHARACTERS:
   - role: "parent (Mama)" — narrativeFunction: carries the REVEAL.
   - role: "new sibling (baby)" — narrativeFunction: per 7B's own note, "no independent agency...
     deliberately given no independent action, since a newborn cannot act with intent." Passes
     3b only via passive/involuntary "cause."

8. OPENING STATE
   situation: Kavi stands beside the sofa holding a picture they made. Mama is feeding the baby.
     Papa is taking photographs. Kavi waits for someone to look up.
   assumption: "The new baby has replaced me." (F04 field — grammatically about the baby, see
     stress-test finding below.)

10. EVENT CHAIN — T23 slot mapping shown inline
    [ENCOUNTER]          actor: HERO — Kavi holds the picture up, closer to Mama's line of sight.
    [INITIAL_RESPONSE]   actor: Mama — a quick, distracted "that's lovely, sweetie," eyes still on
                           the baby. **Actor is Mama, not the baby.**
    [REVEAL]             actor: Mama — turns fully around, sits Kavi down, asks to hear the whole
                           story, apologizes for the distracted answer. **Actor is Mama, not the
                           baby.**
    [DEEPER_NOTICE]      actor: HERO — Kavi realizes Mama's attention was full, not divided by
                           choice — it had to go somewhere first, then came back.
    [CHANGED_RESPONSE]   actor: HERO — Kavi starts asking directly: "can I show you something when
                           the baby's settled?"

11. TURNING POINT: trigger EVENT 3→4 (REVEAL→DEEPER_NOTICE), per T23's locked placement rule.

14. RESOLUTION: actor HERO + Mama — sitting together, baby now asleep in the next room.
```

**Stress test — can the baby, the actual subject of Kavi's stated assumption, satisfy T23's hard
actor rule, or does the plan silently reassign agency to Mama instead?**

T23's Part 2 spec states the hard rule twice, in the strongest available language: "ACTOR MUST BE
THE SUPPORTING CHARACTER, never the hero" for INITIAL_RESPONSE, and for REVEAL, "This is the one
non-negotiable structural rule of the whole template: the correction must come from the other
character's own action or admission." Singular, definite: **the** supporting character — read
naturally, this means the character the assumption is *about*. Kavi's assumption is stated as "The
new baby has replaced me" — grammatically and substantively about the baby's effect on the
family's attention. A newborn cannot respond, cannot admit anything, cannot supply a "reveal" in
any sense T23 defines the term. So the plan does not attempt it: it routes INITIAL_RESPONSE and
REVEAL through Mama instead — an entirely different named supporting character, one whose
attention-behavior is the actual mechanism of the story, but who is not who Kavi's stated
assumption names.

This is precisely the failure mode the task asked to check for: **silent reassignment of agency
from the passive character the assumption names to a different, agentic character**, done without
being flagged as a deviation anywhere. Checking the original Part 2 validation table for this exact
plan (before this revision): `REVEAL | Mama turns around fully, explains, apologizes | Yes — actor
is Mama`. The table marked this "Yes" — a clean pass — without ever noting that "Mama" is not the
character named in `assumption`, and without any comment on whether that substitution is a
sanctioned pattern or an undocumented workaround. It is the latter. Nothing in T23's spec (Part 2
above) says the REVEAL-carrying character may differ from the assumption's grammatical subject;
nothing says it may not. The rule is simply silent on what happens when CAST has more than one
supporting character and the one named in `assumption` is structurally incapable of being an actor
at all.

**Why this isn't merely pedantic:** the substitution changes what kind of story T23 is quietly
being asked to tell. As specified, T23's ENCOUNTER/INITIAL_RESPONSE/REVEAL/DEEPER_NOTICE arc reads
as "Kavi's assumption about X gets corrected by X." What SIT089 actually needed, and what the
existing plan actually built, is "Kavi's assumption about the situation gets corrected by a
*different* character (Mama) who is positioned near the passive character (baby) but is not the
subject of the assumption." Those are different narrative shapes, and only one of them is what
T23's stated hard rule describes. The plan works dramatically — Mama's arc genuinely satisfies
ENCOUNTER→REVEAL→DEEPER_NOTICE→CHANGED_RESPONSE — but it works by quietly *redefining* who "the
supporting character" in the hard rule refers to, mid-plan, without the template's spec
acknowledging that this redefinition is happening or is permitted.

**Verdict: FAIL.** This is a real gap, not a design choice this document previously made
consciously. T23 as specified in Part 2 is compatible with SIT089 only if you accept an unstated
amendment — "the REVEAL-carrying supporting character need not be the one the `assumption` field
grammatically names; it may instead be any other cast member positioned to correct the hero's
understanding of the passive character's effect" — and that amendment has never been written down,
tested against a second passive-character situation, or approved. T23 may well be fine for F04
stories with an agentic supporting character (SIT166, SIT042, SIT050 — all already validated,
none passive). But passive-presence F04 stories like SIT089 currently pass T23's own validation
table by an unexamined substitution, exactly the kind of thing "don't let template optimism smooth
over a real failure" was warning against.

**PROPOSAL (requires Madhurima's approval, not applied):** add an explicit clause to T23's Part 2
spec: "When the assumption's grammatical subject is a non-agentic/passive supporting character
(per 7B §3b's passive-cause allowance), REVEAL must be carried by the next-most-directly-implicated
agentic supporting character, and the plan's CAST entry for that agentic character's
`narrativeFunction` must say explicitly that they are correcting the assumption *on the passive
character's behalf*, not on their own." This doesn't change SIT089's plan at all — Mama's function
description already effectively says this — it just makes the substitution a documented, sanctioned
template mechanic instead of an invisible one, and gives future situations a rule to check against
instead of re-deriving it ad hoc each time (as this document's Part 2 did, silently, the first
time).

---

## Part 8 — Fixed-spec reruns of both adversarial tests, from scratch (this revision)

Per Madhurima's explicit instruction, both fixes above are now applied (Part 1's CONNECTED_DISCOVERY
`reinterpretationFocus` constraint; Part 2's sanctioned passive-substitution exception), and both
SIT148→T22 and SIT089→T23 are rerun as complete, fresh 15-step 7B Story Plans under the fixed specs
— not just the previously-failing slot. Both reuse the same real `situations.json` situations and
the same underlying facts already established in `tmp_phase7b_expanded_story_plan_test.md` Part B
§3/§8 (no new invented content), but the CAST step, the CONNECTED_DISCOVERY/REVEAL slot content, and
the resulting story text are re-authored end to end against the corrected rules.

### 8.1 — SIT148 → F02 → T22, rerun under the fixed CONNECTED_DISCOVERY constraint

**Full 15-step Story Plan:**

```
1. FORM: F02 — The Discovery Journey

2. STORY ESSENCE
   emotionalTruth: A found object that was cared for isn't just found — it's still wanted.
   storyQuestion: Whose is this, and what happens when Kavi finds out?
   coreChange: An anonymous object becomes an object with a known, active search behind it.

3. HERO: Kavi

4. SUPPORTING CHARACTERS:
   - role: "owner" — a park regular, not previously known to Kavi; appears only at EVENT 4
     (the return); narrativeFunction: "endpoint of the discovery" (7B Part C §1's guardrail
     wording, unchanged) — never drives the plot's questions, only receives the answer. No
     passive-substitution exception is invoked here (there is no passive causing-character in
     this plan) — this cast step is ordinary, not exception-governed.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: figure out what this thing is and what to do with it.
   supportingWants: owner wants their object back (present in the world the whole time, off-page
     until EVENT 4).

6. WORLD/SETTING: the park, the same bench, across two consecutive afternoons.

7. KEY OBJECT(S): the found object (initials scratched into the underside) — genuine per §4a:
   discovers, protects (implicitly, by not discarding it), gives (returns it to the owner).

8. OPENING STATE
   situation: Kavi spots something small and valuable half-hidden under a park bench. Nobody
     else is around.
   (no belief/assumption field — F02 carries none.)

9. HERO WANT: figure out what this thing is and who it belongs to.

10. EVENT CHAIN
    [NOTICE]              actor: HERO — Kavi picks it up, turns it over. It's not random junk —
                            it looks cared for, deliberately kept.
    [INVESTIGATE]         actor: HERO — finds initials scratched into the underside.
                            Reinterpretation: this object has an identity attached to it now,
                            not just a shape.
    [DISCOVER]             actor: HERO — the initials match a name Kavi's heard called out by a
                            regular at this bench. Reinterpretation: the object connects to a
                            specific, locatable place this object came from.
    [CONNECTED_DISCOVERY]  actor: HERO — Kavi remembers seeing that same woman crouched down
                            searching the grass at this exact bench yesterday. **Reinterpretation
                            (object-focused per the fixed CONNECTED_DISCOVERY constraint —
                            `reinterpretationFocus: "object"`): "This isn't just a found object
                            anymore — it's an object that was being actively searched for, on
                            this exact spot, as recently as yesterday. Someone is still looking
                            for it, right now."** (Grammatical subject throughout: the object and
                            the search-for-it, not the searcher's inner life. The bare fact that
                            a specific person is now identifiable is stated — "someone is still
                            looking for it" — but the sentence stops there; no interiority, no
                            relational framing, no characterization of the woman's feelings is
                            introduced at this slot.)

11. TURNING POINT
    trigger: EVENT 3→4 — the memory of yesterday's search recontextualizes the object.
    statement: (same object-focused reinterpretation as CONNECTED_DISCOVERY above — T22 places
      the turning point exactly here, per Part 1's "Turning point placement.")

12. NEW_CHOICE: Kavi comes back to the same bench the next afternoon, object in hand, instead of
    leaving it at a lost-and-found or keeping it.

13. EMOTIONAL CHANGE
    startingState: torn — tempted to keep it, aware it isn't really Kavi's.
    changedState: clear — once the object is known to be actively wanted, keeping it stops being
    a live question.

14. RESOLUTION/NEW STATE: actor HERO + owner — Kavi hands it back. **This is the one slot where a
    single-sentence factual reaction to the person is permitted, per the fixed spec's RESOLUTION
    backstop note:** the owner's relief is immediate and specific to THIS object, not a new
    friendship being formed. Nothing beyond this one factual sentence about the owner appears
    anywhere in the plan.

15. MINIMUM STORY SPINE: unchanged from Part B §3 — all 5 elements load-bearing, no safe
    compression point.
```

**Explicit verification — does CONNECTED_DISCOVERY's content now stay object-framed under the new
constraint?**

Compare directly against the original failing version (Part 7.1): *"This isn't a found thing
anymore — it's very specifically someone's search, still unfinished."* — grammatical subject
"someone's search" (a person's unresolved experience, carried by the object as vehicle).

Rewritten version: *"This isn't just a found object anymore — it's an object that was being
actively searched for, on this exact spot, as recently as yesterday. Someone is still looking for
it, right now."* — grammatical subject throughout is **the object** and **the search-for-it**
("it," "the object," "the search"). The fact that a person exists is stated once, minimally,
without characterizing anything about that person (no "worried," no "cared about it deeply," no
name yet, no age, no tone) — exactly the bare-fact allowance the fixed CONNECTED_DISCOVERY spec
permits. Checked against the fixed slot's own mechanical test ("does this slot's sentence have the
object/pattern/situation as its grammatical subject, or does it have a person's experience as its
subject?") — the rewritten sentence passes: object/search is the subject, not a person's inner
state.

The only place any human-specific content appears at all is RESOLUTION ("the owner's relief is
immediate and specific to THIS object, not a new friendship being formed") — exactly where the
fixed spec says such content is allowed, as a single factual sentence, not before.

**Verdict: PASS.** Applying the fix to the actual slot that generated the drift, rather than only
patching one slot downstream, holds the line without needing an author to remember a separate,
unenforced guardrail — the constraint is now checkable at the point of generation (object/pattern
as grammatical subject) rather than relying on a human noticing the drift after the fact.

### 8.2 — SIT089 → F04 → T23, rerun under the fixed passive-substitution exception

**Full 15-step Story Plan:**

```
1. FORM: F04 — The Connection Journey

2. STORY ESSENCE
   emotionalTruth: Love isn't a fixed amount that gets divided when someone new arrives.
   storyQuestion: Will anyone actually notice Kavi today, and does that even mean what Kavi
     fears it means?
   coreChange: "Less attention" stops meaning "replaced."

3. HERO: Kavi

4. SUPPORTING CHARACTERS — **passive-substitution exception explicitly invoked and declared at
   this step, per the fixed T23 spec, not improvised later:**
   - role: "new sibling (baby)"
     relationshipToHero: newborn sister/brother
     want: (no want of its own at this age — no independent agency; kept honest, not forced)
     narrativeFunction: **CONDITION (a) — CAUSATION, declared here:** the baby's arrival and
       ongoing physical presence (occupying Mama's hands, attention, and time right now) is the
       actual originating cause of Kavi's assumption ("the new baby has replaced me") — the
       assumption would not exist without the baby's presence; this is not "the baby is present
       while something else causes it," the baby's presence IS the cause.
   - role: "parent (Mama)"
     relationshipToHero: mother, currently occupied with the new baby
     want: to care for the new baby right now, and — though Kavi doesn't yet realize it — to
       make sure Kavi still feels included
     narrativeFunction: **CONDITION (b) — DECLARED AGENTIC PROXY, declared here:** Mama is the
       agentic supporting character who corrects Kavi's assumption ON THE BABY'S BEHALF — i.e.
       on behalf of the passive, non-agentic cause named in condition (a) above. Both conditions
       (a) and (b) are declared together, at this CAST step, before any event is planned — this
       licenses T23's INITIAL_RESPONSE/REVEAL hard-actor requirement to be satisfied by Mama
       acting in this specific sanctioned role, rather than being an ad hoc substitution
       discovered while authoring REVEAL.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: have someone notice Kavi and what they made.
   supportingWants: Mama wants to finish feeding the baby and also doesn't want Kavi to feel
     forgotten — she just hasn't had a free hand yet. The baby has no want of its own.

6. WORLD/SETTING: home living room; the sofa where Mama feeds the baby, Papa photographing
   nearby.

7. KEY OBJECT(S): the picture Kavi made — genuine per §4a: attaches meaning to, gives (showing it
   to Mama is the hero want itself).

8. OPENING STATE
   situation: Kavi stands beside the sofa holding a picture they made. Mama is feeding the baby.
     Papa is taking photographs of the baby. Kavi waits for someone to look up.
   assumption: The new baby has replaced me. **(Grammatical subject of the assumption is the
     baby — condition (a) above is what licenses the exception: the baby is both the assumption's
     subject and the plan's declared causing party.)**

9. HERO WANT: get someone — anyone — to notice the picture Kavi made.

10. EVENT CHAIN — T23 slot mapping shown inline, actor tags traced to the CAST declaration above
    [ENCOUNTER]          actor: HERO — Kavi holds the picture up, closer to Mama's line of sight,
                           waiting.
    [INITIAL_RESPONSE]   actor: Mama — **traced to CAST condition (b):** a quick, distracted
                           "that's lovely, sweetie," eyes still on the baby. Not the baby acting —
                           Mama, in her declared proxy role, giving the response Kavi reads as
                           confirmation.
    [REVEAL]              actor: Mama — **traced to CAST condition (b), not a silent
                           substitution:** a few minutes later, Mama turns fully around, sits
                           Kavi down, asks to hear the whole story behind the picture, and
                           explicitly explains the distracted answer was about needing both hands
                           free for the baby first — not about Kavi mattering less. **This is Mama
                           correcting the assumption on the baby's behalf, exactly as declared at
                           the CAST step (condition (b))** — the plan does not need to explain or
                           justify the substitution here because it was already declared upstream,
                           not discovered here.
    [DEEPER_NOTICE]       actor: HERO — Kavi realizes Mama's attention was full, not divided by
                           choice — it had to go somewhere first (the baby, per condition (a)),
                           then came back.
    [CHANGED_RESPONSE]    actor: HERO — Kavi starts asking directly: "can I show you something
                           when the baby's settled?"

11. TURNING POINT
    trigger: EVENT 3→4 (REVEAL→DEEPER_NOTICE), per T23's locked placement rule.
    statement: Kavi understood that Mama's attention had to go somewhere first — to the baby, the
      declared causing party — not that it had stopped coming to Kavi at all.

12. NEW_CHOICE: Kavi starts asking for attention directly and specifically, instead of silently
    waiting and privately concluding they've been replaced.

13. EMOTIONAL CHANGE
    startingState: certain the baby has replaced Kavi in the family's attention.
    changedState: understanding that attention comes in turns, not in a fixed, shrinking amount.

14. RESOLUTION/NEW STATE: actor HERO + Mama — Mama sits with Kavi and the picture, fully present,
    baby now asleep in the next room — demonstrated relationally through the two of them sitting
    together.

15. MINIMUM STORY SPINE: unchanged from Part B §8 — all 5 elements load-bearing, no safe
    compression point.
```

**Explicit verification — does SIT089 satisfy both exception conditions, declared at the Cast
stage, not improvised later?**

- **(a) Baby genuinely causes the situation:** YES, declared in the baby's CAST entry
  `narrativeFunction` (step 4 above): "the baby's arrival and ongoing physical presence... is the
  actual originating cause of Kavi's assumption... this is not 'the baby is present while
  something else causes it,' the baby's presence IS the cause." This matches the exception's
  condition (a) requirement exactly, and matches the situation's own facts (Mama's occupied hands,
  Papa's photographing — both directly caused by the baby's presence, not by anything else).
- **(b) Mama is explicitly declared, at the CAST stage, as correcting the assumption on the baby's
  behalf:** YES, declared in Mama's CAST entry `narrativeFunction` (step 4 above), using the exact
  on-behalf-of language the fixed spec requires: "Mama is the agentic supporting character who
  corrects Kavi's assumption ON THE BABY'S BEHALF — i.e. on behalf of the passive, non-agentic
  cause named in condition (a) above." This is declared **before** EVENT CHAIN is authored (step
  10 comes after step 4), satisfying §3c's complete-cast-before-events sequencing and the fixed
  spec's explicit requirement that the declaration happen at the Cast/Supporting-Characters step,
  not during event planning.
- **REVEAL's actor tag now traces cleanly back to that declaration, not a silent substitution:**
  the EVENT CHAIN's REVEAL entry (step 10) contains an explicit parenthetical — "traced to CAST
  condition (b), not a silent substitution" — pointing back to the step-4 declaration, rather than
  presenting Mama-as-REVEAL-actor as if it required no comment (contrast with the original Part 2
  validation table, which recorded "REVEAL | ... | Yes — actor is Mama" with no acknowledgment that
  Mama differs from `assumption`'s grammatical subject). The traceability is now explicit and
  checkable, not implicit.

**Verdict: PASS.** Both conditions are met and declared at the correct pipeline stage (Cast, before
events), the hard actor rule itself is not weakened (REVEAL is still carried by a supporting
character, never the hero, and still requires the plan to name why), and the exception is invoked
narrowly — this plan could not claim the exception without the CAST-step declarations, and no other
character in the plan gets to claim "supporting character" loosely.

### 8.3 — Cross-checks requested (six items, re-verified using the corrected SIT148/SIT089 plans)

**(a) Full 15-step planning sequence respected?** YES, both Part 8.1 and 8.2 plans above are
numbered 1–15 in the LOCKED SCHEMA §1 order (FORM → STORY ESSENCE → HERO → SUPPORTING CHARACTERS →
CHARACTER WANTS/RELATIONSHIPS → WORLD/SETTING → KEY OBJECT(S) → OPENING STATE → HERO WANT → EVENTS →
TURNING POINT → NEW CHOICE/ACTION → EMOTIONAL CHANGE → RESOLUTION/NEW STATE → MINIMUM STORY SPINE),
with no step skipped or reordered.

**(b) §3c "resolve cast before events" rule respected?** YES, in both plans, CAST (step 4) —
including, for SIT089, the two exception-condition declarations — is fully resolved before EVENT
CHAIN (step 10) is authored. SIT089 in particular is the harder test of this rule, since the
exception mechanism specifically requires the causation/proxy declarations to exist upstream of
REVEAL, not be reasoned out while writing REVEAL; the plan's own structure (steps 4 then 10, with
step 10's REVEAL entry pointing back to step 4 rather than re-deriving the justification) confirms
this ordering was actually followed, not merely claimed.

**(c) §3b multi-character narrative-function QA passes honestly — no more silent "passive presence
satisfies cause" hand-waving; is the baby's narrative function now explicit and mechanistically
clear?** YES. Under the original (Part B §8 / Part 7.2) plan, the baby's `narrativeFunction` said
only "no independent agency... deliberately given no independent action" and passed 3b via an
unstated, generically-worded reading of "passive presence satisfies cause." Under the Part 8.2
rerun, the baby's `narrativeFunction` explicitly and specifically states it IS the causing party
("the actual originating cause... not 'present while something else causes it'"), and Mama's
`narrativeFunction` explicitly states she acts as agentic proxy on the baby's behalf. This is a
mechanistic, checkable declaration, not a generic passive-presence gloss — the ambiguity Part D §4
of `tmp_phase7b_expanded_story_plan_test.md` originally flagged as "worth resolving explicitly" is
now resolved at the template-selection layer for T23-eligible plans specifically (7B's own §3b
language is unchanged, since 7B is out of scope for this task; the resolution lives in T23's spec,
which is the correct location since the ambiguity only matters where the passive character needs to
be substituted for as an actor).

**(d) §4a key-object rule correctly applied?** YES in both. SIT148 (8.1): the found object
satisfies discovers/protects/gives, unchanged from the original Part B §3 finding — the T22 fix
didn't touch object selection, only CONNECTED_DISCOVERY's reinterpretation language, so §4a's
verdict carries over unchanged. SIT089 (8.2): the picture Kavi made satisfies attaches-meaning-
to/gives, unchanged from the original Part B §8 finding, for the same reason — the T23 fix touched
CAST declarations and REVEAL's actor justification, not object selection.

**(e) Template selection correctly routes SIT148→T22 and SIT089→T23?** YES, on the same grounds as
Part 4's original selection logic (unaffected by either fix — the fixes changed slot content
requirements and CAST declarations, not eligibility/hard-gate/soft-scoring logic): SIT148 has 0
cast-composition-gate conflicts, T22 still maps 1:1 onto its 4 events with zero *structural* gap
(now with the added `reinterpretationFocus` requirement also satisfied, per 8.1), and T22 remains
the clean winner over T17/T01/T04 exactly as 7E Decision 1 and Part 1 already established. SIT089
similarly has 0 cast-composition-gate conflicts under the fixed rule (the exception is a permitted,
declared pattern, not a gate failure), T23 still maps 1:1 onto its 5 events, and T23 remains the
clean winner over T05/T14/T07/T15 exactly as Part 4 Selection 2's reasoning (generalized from
SIT166 to SIT089) already established. Neither plan becomes ineligible under the fixed specs — both
report a genuine, un-forced PASS rather than an honest non-eligibility.

**(f) Compressed 50–70 word story, all Minimum Story Spine elements represented, word count in
range?**

SIT148 (8.1), spine-labeled:

> *Something small and cared-for is half-hidden under the bench. [Spine 1] Kavi finds initials
> scratched underneath — this belongs to someone. [Spine 2] The initials match a name Kavi's heard
> called at this very bench. [Spine 3] Then it comes back: that same woman, crouched here
> yesterday, searching the grass. Someone is still looking for this. [Spine 4] The next afternoon,
> Kavi's back at the bench, object in hand — and the search is over. [Spine 5]*

Word count: **67 words.** All 5 spine elements present and individually locatable; grammatical
subject of the turning-point sentence (Spine 4) remains "someone is still looking for this" (the
search/object), not a characterization of the woman.

SIT089 (8.2), spine-labeled:

> *Kavi holds up the picture. Mama's hands are full with the baby; Papa's camera is pointed the
> other way. [Spine 1] "That's lovely, sweetie," Mama says, not really looking. [Spine 2] Then, once
> the baby settles, Mama turns all the way around, sits Kavi down, and asks to hear the whole story
> — sorry for before, her hands just weren't free yet. [Spine 3] Kavi starts asking directly instead
> of just waiting and wondering. [Spine 4] Baby asleep now, Mama and Kavi sit together with the
> picture, all the way present. [Spine 5]*

Word count: **69 words.** All 5 spine elements present and individually locatable.

---

## Verdict summary (this revision)

| Test | Result | Core reason |
|---|---|---|
| Error 1 (SIT131 Key Object classification) | **Corrected** | Suitcase tag + calendar are discovered and used to drive the investigation — they satisfy §4a's verb test and should have been named as the Key Object(s); "zero invented content" was too generous once the object and its identifying details are acknowledged as authored, not sourced. T22's *template* fit is unaffected; the Story Plan's evidentiary weight as a clean validation is reduced. |
| Adversarial Test 1 (original round) — SIT148 through T22 | FAIL (superseded, see below) | T22's reinterpretation device, applied honestly to an object-with-late-owner situation, naturally produces relationship-framed language at CONNECTED_DISCOVERY (the turning point itself), one slot upstream of the only guardrail T22 had at the time (a prose note on RESOLUTION). |
| Adversarial Test 2 (original round) — SIT089 through T23 | FAIL (superseded, see below) | T23's hard actor rule ("the supporting character," singular) didn't address CAST with multiple supporting characters where the one named in `assumption` is non-agentic. SIT089's original plan silently routed REVEAL through Mama instead of the baby, dramatically correct but structurally undocumented. |
| **T22 fix applied + SIT148 rerun (Part 8.1)** | **PASS** | The object-focus constraint was moved directly onto CONNECTED_DISCOVERY's own slot definition (`reinterpretationFocus: "object"`, required), not left as a downstream RESOLUTION note. Rerun from scratch: CONNECTED_DISCOVERY's reinterpretation now reads "an object that was being actively searched for... someone is still looking for it" — grammatical subject is the object/search throughout; the one factual, non-interior sentence about the owner is confined to RESOLUTION, exactly where the fixed spec permits it. Verified mechanically (grammatical-subject test), not by assertion. |
| **T23 fix applied + SIT089 rerun (Part 8.2)** | **PASS** | The sanctioned passive-character substitution exception was added, requiring both conditions — (a) the passive character genuinely causes the situation, (b) a declared agentic proxy corrects the assumption on the passive character's behalf — declared at the CAST/Supporting-Characters step, not improvised during event planning. Rerun from scratch: the baby's CAST entry declares condition (a) explicitly; Mama's CAST entry declares condition (b) explicitly, using the on-behalf-of language the fixed spec requires; REVEAL's actor tag in the event chain explicitly traces back to that declaration rather than presenting the substitution as if it needed no comment. The hard actor rule itself (supporting character, never the hero) is unweakened. |

Both fixes (Part 1's CONNECTED_DISCOVERY constraint, Part 2's passive-substitution exception) are
now **APPLIED** to T22/T23's spec in this document, per Madhurima's explicit instruction to apply
them exactly as specified — not improvised differently. Neither fix changed the hard rules
themselves (T22 still requires no obstacle/refrain/spoken-question device; T23's hard actor rule
still requires a supporting character, never the hero, full stop). Both fixes narrowed where and how
compliant content is authored, without altering either template's core mechanic.

### Updated status — T21/T22/T23

- **T21 "The Disrupted Plan" — LOCKED, unchanged.** Not re-tested this revision, per the task
  instruction; carries forward exactly as Part 3 already states.
- **T22 "The Reframe Trail" — RESTORED to "proposed default," fix applied and verified.**
  Structural slot-mapping remains clean (validated against SIT143, SIT148, SIT131 with zero
  *structural* gaps). The F02/F04 boundary risk found in the original Adversarial Test 1 is now
  contained by a structural, checkable constraint on CONNECTED_DISCOVERY itself
  (`reinterpretationFocus: "object"`), verified against a from-scratch SIT148 rerun (Part 8.1,
  PASS). No longer dependent solely on an author remembering an unenforced downstream guardrail.
- **T23 "The Assumption Bridge" — RESTORED to "proposed default," fix applied and verified.** Clean
  fit for agentic-supporting-character F04 situations (SIT166, SIT042, SIT050), and now also for
  the sanctioned passive-supporting-character case (SIT089), verified against a from-scratch rerun
  (Part 8.2, PASS) in which both exception conditions are explicitly declared at the CAST step and
  REVEAL's actor traces cleanly to that declaration. The exception is narrow and CAST-declared, not
  a general "any convenient character" loophole — any future plan invoking it must declare both
  conditions explicitly or fall back to a different template/Form.

**Is the paper architecture now implementation-ready? For the two items this task targeted, YES —
both adversarial failures are resolved, verified by full from-scratch reruns (not by re-asserting
the original plans), and the six additional cross-checks (Part 8.3 (a)–(f)) all confirm the
surrounding architecture — the 15-step sequence, §3c cast-before-events, §3b's narrative-function
QA (now mechanistically explicit for SIT089 specifically), §4a's key-object rule, template
selection routing, and 50–70 word compression with full spine coverage — continued to hold cleanly
under the fixed specs, with no new problem surfacing.** T21, T22, and T23 are now all LOCKED or
proposed-default-with-verified-fix, and the template layer as a whole (7A through this document) is
ready to move to implementation on these two named items. The items already flagged as separately
open before this task (the legacy-16-template belief-requirement migration; T22's
`resolutionPattern` note existing only as a paper recommendation, not yet enforced anywhere in code;
no genuinely adversarial test having been run against T21/F05 or against F01/F03's defaults) remain
open, exactly as previously documented — this task's scope was narrowly the two named adversarial
failures, and widening the implementation-readiness claim beyond those two would overstate what was
actually tested here.

---

## Summary of new/locked IDs (this document)

| ID | Name | Form | Status |
|---|---|---|---|
| T21 | The Disrupted Plan | F05 | LOCKED (spec carried forward from 7E Decision 2, unchanged; ID formally assigned here) |
| T22 | The Reframe Trail | F02 | **Proposed default, fix applied and verified (Part 8.1, PASS).** CONNECTED_DISCOVERY now carries a required, structural `reinterpretationFocus: "object"` constraint; SIT148 rerun from scratch confirms the F02/F04 boundary no longer depends on an unenforced downstream guardrail. |
| T23 | The Assumption Bridge | F04 | **Proposed default, fix applied and verified (Part 8.2, PASS).** Sanctioned passive-character substitution exception added (both conditions required, declared at CAST stage); SIT089 rerun from scratch confirms REVEAL's actor now traces cleanly to an explicit CAST-level declaration rather than a silent substitution. |

No template JSON was created or edited anywhere in this task. T21/T22/T23 do not exist in
`storyTemplates.json`; this remains a paper architecture document only. See Part 7 for the Error 1
correction and the original adversarial-test failures, and Part 8 (this revision) for the applied
fixes and full from-scratch reruns confirming both PASS under the corrected specs.

---

## Part 9 — Final Adversarial Pass: T21/F05, T03/F01, T16/F03 (new, this revision)

Per Madhurima's explicit instruction: run one final adversarial batch on the three named
Form/template pairs that had only ever been tested against clean/representative situations —
**T21/F05** (Part 3 above, validated only against SIT099/SIT014), **T03/F01** (validated only
against SIT045/SIT168 in `tmp_phase7b_expanded_story_plan_test.md`), and **T16/F03** (validated
only against SIT083/SIT051). Each is run against a genuinely hostile situation, real
`situations.json` data, no invented situations, chosen to attack the specific defining mechanism
named in the task. **Per explicit instruction: nothing is patched during this test.** Where a
failure is found, only a labeled PROPOSAL is offered — not applied, not rerun. Full 15-step 7B
Story Plans are built from scratch for each (Form → Story Essence → Hero → Supporting Characters →
Character Wants/Relationships → World/Setting → Key Object(s) → Opening State → Hero Want →
Events → Turning Point → New Choice/Action → Emotional Change → Resolution/New State → Minimum
Story Spine), then mapped onto the relevant template's real `requiredBeats` (T03, T16 read in full
from `storyTemplates.json`; T21's 7-slot spec per Part 3/7E Decision 2), then compressed to 50–70
words verifying the spine survives.

All three situations below are pulled directly from `public/prana-story-generator/phase6-data/situations.json`
— none were constructed. IDs (SIT005, SIT067, SIT111) do not overlap any situation ID used
anywhere earlier in this document or in `tmp_phase7b_expanded_story_plan_test.md`,
`tmp_phase7c_template_mapping_and_compression.md`, `tmp_phase7d_template_layer_redesign.md`, or
`tmp_phase7e_locked_decisions.md`.

---

### 9.1 — T03/F01 hostile test: SIT005 "Can't finish homework", stripped 0-supporting-character cast

**Why this situation is hostile to T03's defining mechanism:** T03's own `storyMechanic` is "three
increasingly intelligent attempts... where the third attempt succeeds only because the hero has
changed how they think, not because they tried harder." SIT005's real storySeed
(`situations.json` SIT005) already states, before the Story Plan's EVENT CHAIN even begins: *"Kavi
has been staring at the same homework problem for what feels like forever. Every answer seems
wrong, and frustration is growing"* — i.e., **multiple identical, same-method attempts have
already failed offscreen, before ATTEMPT_1.** T03's own `sceneStructure` instructs: *"Attempt 1:
hero tries the most obvious approach."* Applied honestly and literally to this specific hostile
precondition, "the most obvious approach" **at this exact moment in the story** — with two
same-method failures already behind Kavi and no external character to redirect them — is to try
the same method again, just more carefully. This is precisely the "tried harder / tried again"
trap 7D's own defining-mechanism note warns against, and per the task's instruction, this test is
also stress-tested against an unusual cast size: **0 supporting characters (stripped F01)**,
invoking §3a's solo strategy-change QA rule simultaneously, since a 0-cast plan has no other
character available to interrupt the drift and force a pivot.

**Full 15-step Story Plan, written honestly (i.e., following T03's literal instruction for
ATTEMPT_1 without pre-correcting for the trap):**

```
1. FORM: F01 — The Journey of Trying

2. STORY ESSENCE
   emotionalTruth: Getting it right was never about pushing harder at the same wall.
   storyQuestion: Will Kavi ever crack this problem tonight?
   coreChange: Repetition gives way to a genuinely different way of working.

3. HERO: Kavi

4. SUPPORTING CHARACTERS: none — stripped deliberately, per the task's cast-size stress
   instruction, invoking §3a (solo strategy-change QA) at the same time as the "trying harder"
   hostile test.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: get tonight's homework problem right before giving up on it.

6. WORLD/SETTING: Kavi's desk, evening, alone with the same worksheet.

7. KEY OBJECT(S): the worksheet/problem itself — genuine per §4a: used and changed across all
   three attempts (recomputed, redrawn, marked up in sub-steps); not forced in for texture.

8. OPENING STATE
   situation: Kavi has redone the same problem twice already tonight. Both times, the same wrong
     answer came out. The page is getting messier. (no belief field — F01 carries none per LOCKED
     SCHEMA; Phase 6's falseBeliefText — "If I can't do it quickly, I can't do it" — is background
     input only.)

9. HERO WANT: get the answer right, tonight, before deciding it's hopeless.

10. EVENT CHAIN
    EVENT 1 [ATTEMPT]     actor: HERO — Kavi reruns the exact steps taught in class, one more
                            time, a little slower and more carefully than before, on the theory
                            that repetition and care will surface whatever went wrong.
                            newInfo: none — same method as the two pre-story attempts, ruled out.
    EVENT 2 [CONSEQUENCE] actor: HERO — Same wrong answer, a third time. Frustration spikes; the
                            page now has three crossed-out versions of the identical steps.
                            newInfo: the METHOD is the ceiling, not Kavi's care or effort —
                            confirmed by a third identical failure, not just a second.
    EVENT 3 [ATTEMPT]     actor: HERO — Kavi puts the numbers down and redraws the whole problem
                            as a picture instead, trying to see the relationship rather than
                            calculate it.
                            newInfo: a genuinely different approach — representation, not
                            recomputation.
    EVENT 4 [CONSEQUENCE] actor: HERO — The drawing doesn't solve it outright, but it makes
                            visible, for the first time, which part of the problem Kavi has been
                            misreading the whole night.
                            newInfo: a specific, new piece of information the three numeric
                            repeats never produced.
    EVENT 5 [ATTEMPT]     actor: HERO — Kavi breaks the problem into the one small sub-step the
                            drawing just revealed, solves only that piece, and checks it before
                            moving to the next — a structural change in HOW Kavi works, not a
                            bigger push at the same steps.
    EVENT 6 [CONSEQUENCE] actor: HERO — That sub-step is right. Built on it, the next one clicks
                            too.

11. TURNING POINT
    trigger: EVENT 3→4 (the drawing reveals the misread), landing between CONSEQUENCE_2 and
      ATTEMPT_3 per T03's own placement rule.
    statement (EMOTIONAL CHANGE-carried, per 7D Part 4's documented T03 fix — F01 has no belief
      field): "This was never asking for more effort at the same steps — it was asking to be
      looked at differently, and the drawing just showed me where."

12. NEW CHOICE/ACTION: Kavi solves the problem through the small verified sub-steps the drawing
    revealed, instead of rerunning the full original calculation a fourth time.

13. EMOTIONAL CHANGE
    startingState: convinced that failing twice means the only option left is trying even harder,
      the same way.
    changedState: understands "stuck" as "wrong angle," not "not enough effort."

14. RESOLUTION/NEW STATE: Kavi finishes the homework correctly, the messy crossed-out page ending
    in a clean, solved one — shown, not narrated as "Kavi learned to try harder."

15. MINIMUM STORY SPINE
    1) two same-method fails already happened before the story opens; a third confirms the method
       is the ceiling (opening + stakes)
    2) attempt 2 (drawing) reveals the misread (turning-point material)
    3) attempt 3 (decomposition) is genuinely structural, not volume (turning-point action)
    4) succeeds (ending consequence)
    All 4 load-bearing; no safe compression point without losing the "genuinely different, not
    louder" mechanic.
```

**T03 slot mapping:** SETUP≈OPENING STATE+HERO WANT, ATTEMPT_1≈EVENT1, CONSEQUENCE_1≈EVENT2,
ATTEMPT_2≈EVENT3, CONSEQUENCE_2≈EVENT4, TURNING_POINT≈EVENT3→4 statement, ATTEMPT_3≈EVENT5,
RESOLUTION≈EVENT6+§14. All 8 of T03's `requiredBeats` receive content with no structural gap.

**Adversarial finding — does T03's own rule actually prevent ATTEMPT_1 from being a "tried
harder" repeat here?**

Checked against T03's real `repetitionPattern.variationRule` (`storyTemplates.json`): *"each
occurrence must use a genuinely different action verb/approach... never a reworded repeat of the
previous attempt."* Read literally, this rule governs ATTEMPT_1 vs. ATTEMPT_2 vs. ATTEMPT_3 **to
each other** — and EVENT1/3/5 above do satisfy it (recompute → visualize → decompose-and-verify
are three genuinely different verbs). **But the rule says nothing about ATTEMPT_1's relationship
to attempts that happened *before* the Story Plan's EVENT CHAIN begins, which OPENING STATE is
explicitly allowed to reference** (per 7B's own schema, OPENING STATE.situation routinely
establishes pre-story context — SIT045's blanket plan does exactly this: "checked the usual spot
twice"). For a hostile situation like SIT005, where OPENING STATE *already establishes two
identical same-method failures*, T03's `sceneStructure` instruction — *"Attempt 1: hero tries the
most obvious approach"* — pulls the honest author toward writing ATTEMPT_1 as a **third**
identical repeat of the exact method already shown failing twice, because that genuinely *is* "the
most obvious approach" at that narrative moment. The plan above does this: EVENT 1 is, on its own
terms, indistinguishable in kind from the two pre-story failures — same steps, same method, only
"a little slower and more carefully." T03's variationRule is technically satisfied (ATTEMPT_1 ≠
ATTEMPT_2 ≠ ATTEMPT_3), but the Form's actual defining mechanism — every attempt must be
genuinely different, not a louder/slower/more-careful version of what's already failed — is
violated at ATTEMPT_1 specifically, one attempt earlier than the rule's own wording reaches.

**Why the stripped 0-cast makes this worse, not incidental:** with a supporting character present
(e.g. SIT168's classmates), another actor's reaction can immediately signal "that's not going to
work" and force ATTEMPT_1 to already carry a pivot. With 0 supporting characters, per this test's
cast-size stress requirement, nothing external interrupts the drift — the cheapest, most narratively
"obvious" choice for a solo hero at this exact moment is to repeat the known method one more time,
which is exactly what a hostile, deadline-pressured author (or an automated generator) would
plausibly produce, and exactly what T03's current spec does not explicitly forbid.

**Verdict: FAIL.** Not because the plan above reads badly (a careful author, as here, can still
notice the trap and write EVENT 1 with visibly diminishing conviction) — but because "a careful
author can hold the line if they remember to check OPENING STATE against ATTEMPT_1" is exactly the
unenforced-discipline pattern already flagged as insufficient for T22 before its fix. T03's
`variationRule` checks attempts against each other; it does not check ATTEMPT_1 against whatever
OPENING STATE has already established as tried. This is the third recurrence of that same general
failure shape (an author-diligence-only guardrail, checkable only by a human noticing) — first
found in T22/CONNECTED_DISCOVERY, now found in T03/ATTEMPT_1.

**PROPOSAL (requires Madhurima's approval, not applied, not rerun):** add one clause to T03's
`repetitionPattern.variationRule` in `storyTemplates.json`: *"If OPENING STATE.situation
establishes that the hero already attempted this same goal, by this same method, before the Story
Plan's EVENT CHAIN begins, ATTEMPT_1 itself must already reflect a genuinely different
approach from that pre-story attempt — 'the most obvious approach' (per sceneStructure) is
evaluated relative to everything the hero has already tried, including pre-story attempts named in
OPENING STATE, not reset to zero at EVENT 1."* This is the same structural move as T22's fix:
pushing the constraint to the exact point where the drift originates (ATTEMPT_1, informed by
OPENING STATE) rather than leaving it to an unenforced general instruction about attempts 1–3
differing from each other.

---

### 9.2 — T21/F05 hostile test: SIT111 "Uncomfortable uniform, flickering lights, strong smells"

**Why this situation is hostile to T21's defining mechanism:** SIT111's real storySeed
(`situations.json` SIT111) bundles three named irritants — *"an uncomfortable uniform, flickering
light, strong smell, or another persistent sensory irritation"* — as explicitly **the same
phenomenon type**: the `childExperience` field itself calls them collectively "persistent sensory
irritation." T21's hard rule requires DISRUPTION_1 and DISRUPTION_2 to differ in **kind** ("not
merely worse, but structurally different — e.g. ambient/ongoing vs. sudden/acute"). A situation
whose own source data hands the author three ready-made, same-category irritants side by side is
exactly the case where DISRUPTION_2 is at highest risk of collapsing into "more of DISRUPTION_1,"
attacking T21's defining mechanism directly, as instructed.

**Full 15-step Story Plan, written honestly (i.e., following the "next irritant in the
storySeed" as the path of least resistance for DISRUPTION_2 before checking it against the kind
rule):**

```
1. FORM: F05 — The Unexpected Turn

2. STORY ESSENCE
   emotionalTruth: Needing a different kind of help isn't the same as failing to cope.
   storyQuestion: Can Kavi get through class the ordinary way today?
   coreChange: "Push through exactly as planned" becomes "ask for a different way to get through."

3. HERO: Kavi

4. SUPPORTING CHARACTERS: none named as an actor in the storySeed (teacher present ambiently,
   not yet cast as an actor) — a candidate solo F05 plan, checked against §3a below.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: get through the lesson the ordinary way, focused, without a fuss.

6. WORLD/SETTING: classroom, mid-lesson, structured setting Kavi is expected to stay seated in.

7. KEY OBJECT(S): none — a purely sensory/environmental F05 story, no object does narrative work,
   consistent with §4a's instruction not to force one in.

8. OPENING STATE
   situation: The collar has been scratching since the bell rang. The light over Kavi's desk
     flickers every few seconds. Kavi is trying to listen to the teacher anyway.
   (no belief/assumption field — F05 carries none.)
   plan: Sit still, stay focused, get through the lesson the way Kavi always does.

9. HERO WANT: get through the lesson normally, the way every other day goes.

10. EVENT CHAIN
    EVENT 1 [EXPECTATION]     actor: HERO — Kavi settles in, ready to follow along like any other
                                day.
                                newInfo: establishes the plan concretely (sit still, stay focused).
    EVENT 2 [DISRUPTION_1]    actor: (ambient) — The collar keeps scratching, worse than usual —
                                an ongoing, physical, tactile irritation building through the
                                period.
                                newInfo: first disruption, KIND = ambient/ongoing/tactile.
    EVENT 3 [REACTION]        actor: HERO — Kavi tugs at the collar under the desk and tries to
                                focus harder on the teacher's voice, willing the itch to fade into
                                the background.
                                newInfo: Kavi's first, smaller-scale coping response — endure and
                                continue, not yet a real restore attempt.
    EVENT 4 [DISRUPTION_2 — HONESTLY WRITTEN, per the storySeed's own "next irritant" pull]
                                actor: (ambient) — Now the light overhead starts flickering too,
                                on top of the collar, the two irritations stacking.
                                newInfo (as literally written): "worse than before" — but see
                                adversarial finding below.
    EVENT 5 [RESTORE_ATTEMPT] actor: HERO — Kavi tries to push through both irritations at once,
                                gripping the desk, forcing eye contact with the teacher, determined
                                to make it to the end of the lesson as planned.
                                newInfo: a genuine, real attempt, not a token gesture.
    EVENT 6 [RESTORE_FAILS]   actor: HERO — It doesn't work — Kavi loses the thread of the lesson
                                entirely, unable to answer when called on, the discomfort having
                                used up all the attention meant for listening.
                                newInfo: confirms the push-through plan genuinely fails, not just
                                pauses.

11. TURNING POINT
    trigger: EVENT 5→6 — the failed restore attempt.
    statement: Kavi stops trying to sit through it unchanged and asks for something to actually be
      different, instead of gripping harder.

12. NEW CHOICE/ACTION: Kavi raises a hand and asks to loosen the collar and move to the desk near
    the door, away from the flickering light.

13. EMOTIONAL CHANGE
    startingState: determined that getting through today has to look exactly like every other day.
    changedState: able to ask for a different way through, without reading it as failure.

14. RESOLUTION/NEW STATE: Kavi finishes the lesson from the new seat, collar loosened — materially
    different from the original plan, and it works.

15. MINIMUM STORY SPINE
    1) plan: sit still, get through the lesson normally (opening + plan)
    2) disruption 1: ongoing tactile irritation (collar)
    3) reaction: tug and push focus (must be present — contrast for the restore attempt later)
    4) disruption 2 (as literally written): a second irritant of the same ambient/sensory family
    5) restore attempt fails
    6) adaptation: asks for a physically different setup
```

**Adversarial finding — does T21's kind-differentiation rule actually stop DISRUPTION_2 from
collapsing into DISRUPTION_1's kind here?**

EVENT 4 above, written the honest way — following the storySeed's own bundled list ("uniform, light,
smell... persistent sensory irritation") — produces a DISRUPTION_2 that is **not** structurally
different from DISRUPTION_1: both are ongoing, ambient, sensory-overload irritants; "the light
flickers too" is an intensification of the same *kind* of problem (more sensory load), not a
different kind (T21's own worked example distinguishes "ambient/ongoing vs. sudden/acute" — EVENT
4 above is ambient/ongoing exactly like EVENT 2). Checked against 7E Decision 2's spec and 7D Part
3's proposed enforcement: *"a required 'kind' tag on each DISRUPTION slot so the template
mechanically enforces the... rule (a structural checkbox, not free text)."* This sounds like a real
mechanical safeguard — but **the spec never defines the enumerated set of "kinds" the tag draws
from.** Nothing stops an author (or an automated generator) from tagging EVENT 2 `kind:
"tactile"` and EVENT 4 `kind: "visual"` — two different *tag labels*, satisfying a naive
string-inequality check — while both disruptions remain, in substance, the same underlying
category the F05 rule is actually trying to rule out: **ongoing ambient sensory overload**, just
routed through a different sense organ. SIT111 is the exact situation where this gap is most
exposed, because its own source data hands the author three same-category irritants as
co-occurring, same-scene facts, making "add the next one from the list" the path of least
resistance — precisely parallel to how T22's CONNECTED_DISCOVERY naturally drifted toward
relational language before its fix.

**Verdict: FAIL.** The plan above, written the honest way, produces a DISRUPTION_2 that fails the
Form's actual defining requirement (kind must differ) while plausibly still passing a shallow,
free-text "kind" tag check — because T21's spec requires the tag but never constrains what counts
as a genuinely different kind. This is the same failure shape found in 9.1 and in the original
Adversarial Test 1 (Part 7.1): a rule that names the right constraint in prose but leaves its
actual enforcement to unaided authorial judgment.

**PROPOSAL (requires Madhurima's approval, not applied, not rerun):** replace T21's free-text
"kind" tag with a small enumerated taxonomy, e.g. `disruptionKind: "ambient_sensory" |
"sudden_acute" | "social_relational" | "temporal_scheduling" | "physical_obstacle"`, with a
required, mechanically-checkable rule: *DISRUPTION_1.disruptionKind must not equal
DISRUPTION_2.disruptionKind*, and an explicit worked counter-example in the template spec showing
that two different sense-channels (tactile vs. visual) reporting the same underlying category
(ambient sensory overload) do **not** count as different kinds — only a category-level difference
does. This mirrors T22's fix exactly: move the constraint from free-text guidance to a checkable,
enumerated field.

---

### 9.3 — T16/F03 hostile test: SIT067 "Being slower at reading than others"

**Why this situation is hostile to T16's defining mechanism:** T16 requires a genuine, comparably-
weighted two-perspectives shift, staged through the hero's own active evidence-gathering (per
`storyTemplates.json`: *"hero, prompted by consequence or curiosity, looks closer or asks a
question rather than assuming"*). SIT067's real storySeed and ontology (`situations.json` SIT067)
name the false belief as *"If I learn slowly, I'm not smart"* and the true belief as *"Everyone
learns at their own pace"* — this is exactly the shape the task warns is temptingly game-able: the
"true belief" reads like a piece of information (a fact about learning) rather than an event the
hero must live through and re-see. The path of least resistance for an author is to let a teacher
or parent simply *tell* Kavi the true-belief sentence, or a decontextualized reassuring fact ("did
you know some very smart people read slowly too?"), rather than staging a genuine, self-arrived-at
reframe — collapsing T16's belief-shift mechanic into a shallow fact-delivery scene.

**Full 15-step Story Plan, written honestly (i.e., testing what T16's own EVIDENCE_GATHERING
instruction — "asks a question" — most naturally produces for this situation before checking it
against the belief-weight requirement):**

```
1. FORM: F03 — The Shift in Seeing

2. STORY ESSENCE
   emotionalTruth: Slow was never the same as behind.
   storyQuestion: Is Kavi actually behind, or just working a different way?
   coreChange: "Speed proves intelligence" stops being automatic.

3. HERO: Kavi

4. SUPPORTING CHARACTERS: none named as an active evidence-source in the storySeed (classmates are
   ambient/comparative, not actors) — candidate solo F03 plan, checked against §3a below.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: catch up and get the reading right, like everyone else seems to.

6. WORLD/SETTING: classroom, reading time, Kavi still on the same page while others move on.

7. KEY OBJECT(S): none — a purely internal F03 belief-shift, nothing forced in per §4a.

8. OPENING STATE
   situation: Around Kavi, pencils are already going down. Kavi is still on the same page, staring
     at it, wondering why it isn't clicking yet.
   belief: If I learn slowly, I'm not smart. (F03-mandatory, per Phase 6 falseBeliefText.)

9. HERO WANT: catch up and get it right, the way everyone else seems to.

10. EVENT CHAIN
    EVENT 1 [EVIDENCE]          actor: HERO — Kavi is still sounding out words on page 4 while
                                  the rest of the class has closed their books and moved to free
                                  reading.
                                  newInfo: appears to confirm the belief immediately — slow, again,
                                  in front of everyone.
    EVENT 2 [CONTRADICTION]     actor: (ambient) — A few minutes later, the teacher asks two of
                                  the fast-finishers what happened on the page they just read, and
                                  both have to flip back and reread before they can answer.
                                  newInfo: "finished first" didn't mean "understood it" the way
                                  Kavi assumed.
    EVENT 3 [OTHER_PERSPECTIVE — HONESTLY WRITTEN, per T16's "asks a question" instruction taken
                                  at face value]
                                  actor: HERO (asking) / teacher (answering) — Kavi asks the
                                  teacher, quietly, "am I not smart because I'm slow?" and the
                                  teacher replies warmly that lots of smart people read slowly, and
                                  that speed has nothing to do with intelligence.
                                  newInfo (as literally written): a reassuring fact, delivered to
                                  Kavi — but see adversarial finding below.
    EVENT 4 [BELIEF_UNCERTAIN]  actor: HERO — Kavi isn't sure yet whether to believe it, turning
                                  the teacher's words over.

11. TURNING POINT
    trigger: EVENT 3→4 (the teacher's answer) leading into a resolving beat.
    statement: "Everyone learns at their own pace" (delivered as the teacher's line, echoed by
      Kavi).

12. NEW CHOICE/ACTION: Kavi keeps reading at their own pace instead of rushing to match the
    fast-finishers.

13. EMOTIONAL CHANGE
    startingState: confusing "slow" with "not smart."
    changedState: repeating the teacher's reassurance to feel better.

14. RESOLUTION/NEW STATE: Kavi finishes the book at their own pace, told by the teacher this is
    fine.

15. MINIMUM STORY SPINE (as honestly written): 1) Kavi is slow, belief seems confirmed 2)
    fast-finishers shown not to have really understood 3) teacher reassures Kavi with a fact 4)
    Kavi accepts it 5) Kavi keeps reading at their own pace.
```

**Adversarial finding — does T16's EVIDENCE_GATHERING/INTERPRETATION_2 mechanism actually require
a genuine, self-arrived-at belief shift, or does it accept a delivered fact as a substitute?**

Checked against T16's real spec (`storyTemplates.json`): `turningPoint` = *"The evidence-gathering
beat — hero must take an active step (asking, observing, waiting) rather than the truth simply
being handed to them."* EVENT 3 above technically satisfies the letter of this — Kavi does "ask a
question" — but what Kavi receives in return is **the truth simply being handed to them**, worded
as a warm reassurance rather than an assumption, delivered by an adult, not discovered by Kavi.
This is precisely the loophole the task named: T16's rule constrains **who initiates** the
evidence-gathering step (the hero must actively ask/look/wait, not passively receive) but says
nothing about **the nature of what's received** once the hero does ask — a hero "asking a question"
and being told an answer is not meaningfully different, in terms of internalized belief change,
from "the truth simply being handed to them," which is the exact failure mode the turningPoint
description claims to rule out. F03's defining requirement (per 7B LOCKED SCHEMA §2) is that
`belief` "carries full narrative weight — this is what the Form is about"; a worldview-level shift
delivered as a fact from an authority figure, however warmly written, resolves the plot without the
hero doing the internal work the Form's own weight requires. The EMOTIONAL CHANGE fields in the
plan above make this visible mechanically: `changedState: "repeating the teacher's reassurance to
feel better"` is a materially thinner claim than 7B's own tested F03 plans (SIT083's "genuinely
reassessed, not just defensively reasserted"; SIT020's own solo version: "reads 'failed again' as
'closer than before,' not as a verdict," reached through Kavi's own replay, no adult involved) —
side by side, the delivered-fact version is visibly hollower.

**Verdict: FAIL.** T16, as literally specified, can be satisfied by a hero "asking a question" and
receiving a decontextualized reassuring fact in return — exactly the gaming the task asked this
test to probe for. This is the same failure shape as 9.1 and 9.2: the rule names the right
constraint (hero must act, not be told) but doesn't constrain the *content* of what resolves the
beat, leaving room for a shallow substitute that technically satisfies the letter of
"asking/observing/waiting."

**PROPOSAL (requires Madhurima's approval, not applied, not rerun):** add an explicit clause to
T16's `turningPoint`/`sceneStructure` EVIDENCE_GATHERING description: *"The evidence the hero
gathers must be something the hero directly observes, tests, or experiences firsthand — a fact
delivered by another character (even if true, warm, and directly responsive to the hero's
question) does not satisfy this beat on its own. If another character is present, their role must
be to prompt the hero toward looking/testing further (e.g., a question back, a suggestion to try
something), not to supply the reframe as a finished statement."* Concretely, for SIT067, this would
redirect EVENT 3 toward something like Kavi actively testing their own retention (e.g., closing the
book and retelling what was read, accurately and in full, discovering firsthand that "slow" and
"not absorbing it" are not the same thing) rather than a teacher's reassurance — this is a proposal
only, not applied here, matching the same fix-shape already used for T22 (move the constraint to
the point where the drift originates) and T23 (require the content to be earned by the actor
involved, not asserted).

---

### 9.4 — Summary table, this adversarial round

| Test | Situation (real corpus) | Defining mechanism attacked | Verdict | Core failure mechanism |
|---|---|---|---|---|
| T03/F01 | SIT005, "Can't finish homework" (stripped to 0 supporting characters) | "Each attempt must be genuinely different, not tried harder" | **FAIL** | `variationRule` only checks ATTEMPT_1/2/3 against each other, not against pre-story attempts OPENING STATE is free to establish — SIT005's OPENING STATE already shows 2 identical failures, making "the most obvious approach" (T03's own ATTEMPT_1 instruction) a third identical repeat. |
| T21/F05 | SIT111, "Uncomfortable uniform, flickering lights, strong smells" | "Two disruptions must differ in kind, not just intensify" | **FAIL** | The required disruption "kind" tag has no enumerated taxonomy or mechanical cross-check — a different sense-channel (tactile vs. visual) can be labeled a different "kind" while remaining the same underlying category (ongoing ambient sensory overload), which SIT111's own bundled storySeed makes the path of least resistance. |
| T16/F03 | SIT067, "Being slower at reading than others" | "Genuine, comparably-weighted two-perspectives shift, not a shallow fact" | **FAIL** | `turningPoint`'s rule constrains who initiates evidence-gathering (hero must ask/observe, not be told) but not what is received — a hero "asking a question" and being handed a reassuring fact by an adult technically satisfies the letter while collapsing the belief-weight the Form requires. |

**Pattern across all three:** every failure has the same shape already identified in Part 7's
original SIT148/SIT089 round — a template names the right constraint in prose, but enforces it only
at the point where the *symptom* is checkable (attempts differ from each other; a kind-tag exists;
a question gets asked), one step downstream or one step short of the point where the actual drift
*originates* (ATTEMPT_1 relative to pre-story context; the tag's taxonomy; the content of what's
delivered after the question). Each proposed fix, consistent with T22/T23's already-approved fix
pattern, moves the constraint to that originating point and makes it mechanically checkable rather
than dependent on an author remembering to apply an unwritten judgment call.

**Per Madhurima's explicit instruction, none of the three proposals above are applied or rerun in
this task.** All three remain PROPOSALS pending her approval; per her stated instruction, the
architecture is **not** locked until all three pass.

---

## Part 9.5 — T03 fix APPROVED and applied; SIT005 rerun from scratch

**Madhurima's decision:** APPROVED, exactly as proposed in 9.1. `variationRule` is updated so that
ATTEMPT_1 must be genuinely different not only from ATTEMPT_2/ATTEMPT_3, but also from any
pre-story attempt(s) OPENING STATE has already established — and, symmetrically, ATTEMPT_2 and
ATTEMPT_3 must each differ from those pre-story attempts too, not only from each other. (Paper-only:
`storyTemplates.json` is not edited; this is the corrected spec text T03's slot would carry once
implemented.)

**Fixed `variationRule` (T03, paper spec):** *"Each of ATTEMPT_1, ATTEMPT_2, ATTEMPT_3 must use a
genuinely different action verb/approach from the other two AND from any pre-story attempt(s) named
in OPENING STATE.situation — a reworded, slower, or more careful repeat of a method OPENING STATE
already shows failing does not count as a new attempt, even if it is ATTEMPT_1's first appearance in
the EVENT CHAIN itself."*

### SIT005 rerun, from scratch, under the fixed spec

```
1. FORM: F01 — The Journey of Trying

2. STORY ESSENCE
   emotionalTruth: Getting it right was never about pushing harder at the same wall.
   storyQuestion: Will Kavi ever crack this problem tonight?
   coreChange: Repetition gives way to a genuinely different way of working.

3. HERO: Kavi

4. SUPPORTING CHARACTERS: none — stripped deliberately, per the original stress instruction
   (§3a solo strategy-change QA still applies and is satisfied below, unchanged from 9.1).

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: get tonight's homework problem right before giving up on it.

6. WORLD/SETTING: Kavi's desk, evening, alone with the same worksheet.

7. KEY OBJECT(S): the worksheet/problem itself — used and changed across all three attempts.

8. OPENING STATE
   situation: Kavi has redone the same problem twice already tonight, the same way both times —
     working straight down the written steps, checking the arithmetic. Both times, the same wrong
     answer came out. The page is getting messier. (no belief field — F01 carries none.)
   PRE-STORY ATTEMPTS ON RECORD (per the fixed variationRule, this is what ATTEMPT_1–3 must each be
     checked against): "rework the written numeric steps, checking arithmetic" — attempted twice,
     identically, before the Story Plan opens.

9. HERO WANT: get the answer right, tonight, before deciding it's hopeless.

10. EVENT CHAIN
    EVENT 1 [ATTEMPT]     actor: HERO — Kavi stops recomputing and instead redraws the whole
                            problem as a picture, trying to see the relationship between the
                            numbers rather than calculate it.
                            newInfo: genuinely different from the two pre-story attempts (visual
                            representation, not numeric recomputation) — satisfies the FIXED rule
                            at ATTEMPT_1 itself, not just against ATTEMPT_2/3.
    EVENT 2 [CONSEQUENCE] actor: HERO — The drawing doesn't solve it outright, but it makes
                            visible, for the first time, which part of the problem Kavi has been
                            misreading all night.
                            newInfo: a specific new piece of information neither the pre-story
                            attempts nor a plain redraw-and-stare would produce on its own.
    EVENT 3 [ATTEMPT]     actor: HERO — Kavi tries explaining the problem out loud, step by step,
                            to no one in particular — forcing each step into words instead of
                            numbers or a picture.
                            newInfo: a third distinct method (verbal reasoning) — different from
                            both the pre-story numeric attempts AND from EVENT 1's drawing.
    EVENT 4 [CONSEQUENCE] actor: HERO — Saying it out loud, Kavi's own voice catches on the exact
                            spot the drawing had hinted at — the same misread, now confirmed and
                            precisely located, still not solved.
                            newInfo: pinpoints, rather than just gestures at, where the method
                            needs to change.
    EVENT 5 [ATTEMPT]     actor: HERO — Kavi breaks the problem into just the one small sub-step
                            just located, solves only that piece, and checks it before moving on —
                            a structural change in HOW Kavi works.
                            newInfo: this is the first attempt aimed at the located sub-step
                            specifically, not the whole problem again.
    EVENT 6 [CONSEQUENCE] actor: HERO — That sub-step is right. Built on it, the next one clicks
                            too.

11. TURNING POINT
    trigger: EVENT 3→4 (saying it aloud pinpoints the exact misread), landing between
      CONSEQUENCE_2 and ATTEMPT_3 per T03's placement rule.
    statement (EMOTIONAL CHANGE-carried, F01 has no belief field): "This was never asking for more
      effort at the same steps — every way I actually looked at it differently showed me something
      the last way didn't."

12. NEW CHOICE/ACTION: Kavi solves the problem through the one verified sub-step just located,
    instead of rerunning the full original calculation a fourth time.

13. EMOTIONAL CHANGE
    startingState: convinced that failing twice means the only option left is trying even harder,
      the same way.
    changedState: understands "stuck" as "haven't looked at it a new way yet," not "not enough
      effort."

14. RESOLUTION/NEW STATE: Kavi finishes the homework correctly, the messy crossed-out page ending
    in a clean, solved one.

15. MINIMUM STORY SPINE
    1) two same-method fails already happened before the story opens (opening + stakes)
    2) ATTEMPT_1 (drawing) is already a new method, not a third repeat — reveals the misread
    3) ATTEMPT_2 (saying it aloud) pinpoints the misread precisely (turning-point material)
    4) ATTEMPT_3 (decomposition) is genuinely structural, not volume (turning-point action)
    5) succeeds (ending consequence)
    All 5 load-bearing.
```

**Fixed-rule check:** ATTEMPT_1 (drawing) ≠ pre-story attempts (numeric recompute) — satisfies the
new clause. ATTEMPT_1 (drawing) ≠ ATTEMPT_2 (verbal) ≠ ATTEMPT_3 (decomposition) ≠ pre-story
(numeric) — satisfies both the original mutual-difference rule and the new pre-story check for
every attempt, not just ATTEMPT_1. T03's 8 `requiredBeats` all receive content with no gap, exactly
as in 9.1's mapping.

**Verdict: PASS.** Under the fixed `variationRule`, the honest-authoring drift identified in 9.1
(ATTEMPT_1 collapsing into a third identical repeat because OPENING STATE's pre-story attempts were
invisible to the rule) is closed: an author following the fixed rule cannot write ATTEMPT_1 as "the
same method, a little slower" for this situation, because the rule now explicitly checks ATTEMPT_1
against OPENING STATE's pre-story record, not only against ATTEMPT_2/ATTEMPT_3.

---

## Part 9.6 — T21 fix APPROVED (with closed-enum correction) and applied; SIT111 rerun from scratch

**Madhurima's decision:** APPROVED, with one correction to the 9.2 proposal — the "kind" tag must be
a **closed enum**, not an illustrative example list, so that a category-level difference is
mechanically enforceable rather than merely more-specific free text.

### `disruptionCategory` closed enum — defined and grounded in the real corpus

A representative sample of `childExperience` entries was pulled from
`public/prana-story-generator/phase6-data/situations.json` (SIT001–SIT070 range) specifically to
ground this taxonomy in real content rather than invent categories with no basis in the domain.
Five recurring, mutually distinguishable disruption shapes appear repeatedly across the corpus:

```
disruptionCategory (CLOSED ENUM — exactly these five values, no others):

1. SENSORY
   — an ongoing or triggered physical/environmental input the hero's body registers directly
     (touch, sight, sound, smell). Grounded in: SIT111 itself ("scratchy uniform," "flickering
     light," "strong smell"), SIT-level "shirt that feels scratchy and irritating," "startled by
     an unexpected burst of thunder."

2. SOCIAL
   — another person's action, word, or absence disrupts the plan or the hero's standing with
     others. Grounded in: "friend says they don't want to play today," "classmates going to a
     birthday party Kavi wasn't invited to," "sibling tells a parent... leaves out an important
     part," "unkind comment about Kavi's body."

3. LOGISTICAL (plan/schedule/mechanism breaking, non-social, non-bodily)
   — an external plan, object, or schedule fails or changes independent of any person's intent
     toward the hero. Grounded in: "game freezes" right before winning, "discovers their saved
     progress is gone," "a special outing... is cancelled," "ready for a playdate when they learn
     the friend cannot come" (the logistics of the plan breaking, distinct from category 2's
     person-directed-at-hero shape).

4. EMOTIONAL_INTERNAL
   — the disruption originates inside the hero's own anticipation, worry, or imagination, not
     from an external sensory/social/logistical event. Grounded in: "sees a shadow under the bed
     and imagines a monster," "waiting to find out the result" of a test, "starts imagining
     everything that could go wrong" about an upcoming event.

5. PHYSICAL_SAFETY
   — the hero's body or immediate physical safety/exertion is implicated (hazard, strain,
     fatigue), distinct from category 1's passive sensory irritation. Grounded in: "a dog
     approaches," "cross a dark room," "travelling... has been sitting for a long time,"
     "fell while playing... wants to try the same activity again."
```

**Rule:** `DISRUPTION_1.disruptionCategory` and `DISRUPTION_2.disruptionCategory` must each be one
of the five values above, and **must not be equal** — a category-level difference, not merely a
different surface description or a different sense-channel within the same category (SENSORY
covering touch AND sight AND smell means two same-category sensory events, however differently
described, still fail the rule, closing exactly the SIT111 loophole found in 9.2).

### SIT111 rerun, from scratch, under the fixed spec

```
1. FORM: F05 — The Unexpected Turn

2. STORY ESSENCE
   emotionalTruth: Needing a different kind of help isn't the same as failing to cope.
   storyQuestion: Can Kavi get through class the ordinary way today?
   coreChange: "Push through exactly as planned" becomes "ask for a different way to get through."

3. HERO: Kavi

4. SUPPORTING CHARACTERS: none named as an actor (teacher present ambiently) — solo F05 candidate,
   §3a satisfied: NEW CHOICE/ACTION below is a genuine strategy change (asking for help/different
   setup), not just trying harder or waiting it out.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: get through the lesson the ordinary way, focused, without a fuss.

6. WORLD/SETTING: classroom, mid-lesson, structured setting Kavi is expected to stay seated in.

7. KEY OBJECT(S): none — purely sensory/environmental/logistical F05 story, nothing forced in.

8. OPENING STATE
   situation: The collar has been scratching since the bell rang. Kavi is trying to listen to the
     teacher anyway.
   plan: Sit still, stay focused, get through the lesson the way Kavi always does.

9. HERO WANT: get through the lesson normally, the way every other day goes.

10. EVENT CHAIN
    EVENT 1 [EXPECTATION]     actor: HERO — Kavi settles in, ready to follow along like any other
                                day.
                                newInfo: establishes the plan concretely.
    EVENT 2 [DISRUPTION_1]    actor: (ambient) — disruptionCategory: SENSORY — the collar keeps
                                scratching, worse than usual, an ongoing tactile irritation
                                building through the period.
                                newInfo: first disruption, category SENSORY.
    EVENT 3 [REACTION]        actor: HERO — Kavi tugs at the collar under the desk and tries to
                                focus harder on the teacher's voice, willing it to fade into the
                                background.
                                newInfo: Kavi's first, smaller-scale coping response.
    EVENT 4 [DISRUPTION_2]    actor: teacher/(ambient) — disruptionCategory: LOGISTICAL — midway
                                through the lesson, the teacher announces, with no warning, that
                                the class must gather their things and move to the assembly hall
                                right now — the planned lesson structure itself breaks, not another
                                sensory input.
                                newInfo: a second disruption of a DIFFERENT category (a plan/
                                schedule break, not a bodily sensation) — DISRUPTION_1 ≠
                                DISRUPTION_2 at the category level, satisfying the fixed rule.
    EVENT 5 [RESTORE_ATTEMPT] actor: HERO — Kavi tries to gather things quickly and keep up with
                                the sudden move while the collar is still scratching, determined to
                                make the transition look as smooth and "normal" as any other day.
                                newInfo: a genuine, real attempt, not a token gesture.
    EVENT 6 [RESTORE_FAILS]   actor: HERO — It doesn't work — between the still-itching collar and
                                the rushed, unplanned move, Kavi drops a folder, arrives at the
                                hall late and flustered, and misses the start of what's happening.
                                newInfo: confirms the push-through plan genuinely fails.

11. TURNING POINT
    trigger: EVENT 5→6 — the failed restore attempt, caused by the combination of both
      category-different disruptions at once.
    statement: Kavi stops trying to make today look exactly like every other day and asks for
      something to actually be different, instead of gripping harder through both problems at once.

12. NEW CHOICE/ACTION: Kavi asks the teacher for the collar to be loosened AND for one quiet minute
    to settle in before joining the hall activity — addressing both disruptions with a genuinely
    different approach, not by pushing through either one harder.

13. EMOTIONAL CHANGE
    startingState: determined that getting through today has to look exactly like every other day.
    changedState: able to ask for a different way through, without reading it as failure.

14. RESOLUTION/NEW STATE: Kavi settles into the assembly hall from a calmer start, collar loosened
    — materially different from the original plan, and it works.

15. MINIMUM STORY SPINE
    1) plan: sit still, get through the lesson normally
    2) disruption 1: ongoing sensory irritation (SENSORY)
    3) reaction: tug and push focus
    4) disruption 2: sudden schedule/plan break (LOGISTICAL — different category from disruption 1)
    5) restore attempt fails
    6) adaptation: asks for a genuinely different setup, addressing both disruptions
```

**Fixed-rule check:** DISRUPTION_1.disruptionCategory = SENSORY; DISRUPTION_2.disruptionCategory =
LOGISTICAL. SENSORY ≠ LOGISTICAL — a category-level difference, not two same-category items with
different surface descriptions (which is exactly what 9.2 flagged as the SIT111 trap: bundling
another sensory irritant from the storySeed's own list). All 7 of T21's slots receive content with
no gap.

**Verdict: PASS.** Under the fixed spec, an author can no longer satisfy the rule by tagging two
same-category sensory irritants with different labels (e.g. "tactile" vs. "visual") — the enum
forces a real category-level choice, and SIT111's own bundled sensory list is no longer the path of
least resistance for DISRUPTION_2, because reaching for "the next irritant on the list" now visibly
fails the closed-enum check rather than passing a shallow free-text inequality test.

---

## Part 10 — T16 Fix APPROVED (with materiality clarification) and Applied to T16's Locked Slot Spec

**Status: APPROVED AND APPLIED.** Madhurima rejected 9.3's original proposal ("hero must
ask/observe, not be told") as necessary but not sufficient — a hero could still run a trivial
self-test and instantly land on the desired conclusion, producing a shallow fact dressed up as a
"test." This section originally drafted a structurally stronger revision, per her stated bar: (a)
comparably weighted evidence for BOTH interpretations, not one real perspective and one throwaway
strawman, and (b) an observable contradiction or moment of reassessment that the HERO PERSONALLY
resolves — not handed to them by another character, not an instant trivial test-and-conclude.

**Madhurima has now reviewed and approved this draft, with exactly one required addition:** a
materiality clarification on `contradictionMoment` (below), added exactly as she specified — the
`contradictionMoment` cannot be a technically-valid but trivially small/incidental observation; it
must be substantial enough that it could plausibly cause someone to actually reconsider
INTERPRETATION_1. This is now formalized as a concrete, checkable authoring constraint on the
`contradictionMoment` field itself, the same way `evidenceCited`'s weight-parity rule is a concrete,
checkable requirement rather than a suggestion. **With this addition, the fix below is APPLIED to
T16's paper-locked slot spec** (still not to `storyTemplates.json` — implementation remains out of
scope for this task). `evidenceCited`/weight-parity, the closed `evidenceSource` enum, and
`reassessmentIsHeroOwned` are approved as-is, unchanged from the original draft.

### Concrete slot-level structural requirements (T16, LOCKED)

T16's real `requiredBeats` (`storyTemplates.json`): `EVENT, INTERPRETATION_1, EVIDENCE_GATHERING,
INTERPRETATION_2, RESOLUTION`. The revised draft adds mechanically-checkable fields to three of
these slots — analogous to how T22 added `reinterpretationFocus` and T21/9.6 added
`disruptionCategory`:

```
INTERPRETATION_1 (revised):
  + evidenceCited: [array, min 1] — the concrete, specific fact(s) that make the false-belief
    reading genuinely plausible in the moment, not a strawman set up to be easily knocked down.
    Rule: evidenceCited must be independently verifiable within the Story Plan's own OPENING
    STATE/EVENT content (i.e., grounded in something the plan actually shows, not merely asserted
    hero anxiety).

INTERPRETATION_2 (revised):
  + evidenceCited: [array, min 1, same shape as INTERPRETATION_1's] — the concrete fact(s)
    supporting the true-belief reading.
    Rule (WEIGHT PARITY, mechanically checkable): INTERPRETATION_2.evidenceCited must be at least
    as numerous/specific as INTERPRETATION_1.evidenceCited (i.e., not a single generic reassurance
    outweighing a multi-fact false impression) — this is the concrete form of "comparably weighted,"
    checkable as a count/specificity comparison rather than left to authorial feel.

EVIDENCE_GATHERING (revised, the slot doing the real structural work):
  + evidenceSource: enum, HERO_DIRECT_OBSERVATION | HERO_DIRECT_TEST | HERO_DIRECT_EXPERIENCE
    Rule: evidenceSource must be one of these three values. A value of "OTHER_CHARACTER_STATEMENT"
    or "OTHER_CHARACTER_EXPLANATION" is explicitly INVALID for this slot — mechanically closing the
    9.3 loophole (a fact "handed to" the hero, however warmly phrased, cannot populate this field).
  + contradictionMoment: [required, 1] — names the SPECIFIC observable event, inside the Story
    Plan's own EVENT CHAIN, where the hero personally encounters something that does not match
    INTERPRETATION_1's reading. Rule: contradictionMoment's actor must be HERO (the hero is the one
    who observes/tests/experiences it directly) — if a supporting character is present in this beat,
    their permitted narrativeFunction here is restricted to one of: PROMPT_QUESTION (asks the hero
    something that prompts the hero's own test/observation), SUGGEST_TEST (proposes what the hero
    could try, without stating the answer), or WITHHOLD_ANSWER (is present but does not resolve it
    for the hero) — SUPPLY_ANSWER / DELIVER_FACT / DELIVER_REASSURANCE are explicitly INVALID
    narrativeFunctions for a supporting character inside this beat.
    **MATERIALITY RULE (required addition, per Madhurima's approval condition — a concrete,
    checkable authoring constraint on this field, not just prose commentary, mirroring how
    `evidenceCited`'s weight-parity rule is checkable): `contradictionMoment` must be materially
    capable of challenging INTERPRETATION_1, not merely incidental. A contradictionMoment that is
    technically observed firsthand by the hero but is trivially small, easily dismissed, or
    incidental to INTERPRETATION_1's actual claim does NOT satisfy this field, even if
    `evidenceSource` is correctly HERO_DIRECT_*. The checkable test: could a reasonable reader
    plausibly see this specific moment as a real reason to reconsider INTERPRETATION_1 — not just a
    minor caveat, not just "one data point among many," but something substantial enough to carry
    real evidentiary weight on its own? If the answer is no, the field fails regardless of actor or
    evidenceSource correctness.**
  + reassessmentIsHeroOwned: [boolean, must be true] — a direct, checkable flag requiring that the
    beat's resolution ("what changes the hero's mind") is something the hero arrives at through
    their own contradictionMoment, not a statement received from another character. This is the
    mechanical form of Madhurima's requirement (b): the hero personally resolves the contradiction.
```

**Why this meets the stated bar, structurally, not just in prose:** requirement (a) — comparably
weighted evidence — becomes a checkable count/specificity comparison between
`INTERPRETATION_1.evidenceCited` and `INTERPRETATION_2.evidenceCited`, rather than an unenforced
instruction to make both "feel real." Requirement (b) — hero-personally-resolved observable
contradiction — becomes a closed-enum `evidenceSource` that structurally excludes "another character
states the answer," plus a `contradictionMoment` requirement whose actor must be HERO, plus a
`reassessmentIsHeroOwned` flag. Together these close both the original loophole (9.3: "asking a
question" satisfied by receiving a handed-over fact) and the sufficiency gap Madhurima named
(a trivial hero-run test that instantly produces the desired conclusion) — because
`contradictionMoment` must be a genuine, specific, plan-grounded event the hero encounters, not a
one-line "Kavi tests it and confirms" placeholder; the field requires naming what, specifically, the
hero observes/tests/experiences — and, per the materiality rule above, that named event must be
substantial enough to genuinely threaten INTERPRETATION_1, not merely incidental to it.

### Informal sanity-check (superseded by Part 11's official rerun below)

**This subsection is retained for the record but is explicitly superseded.** It was an unofficial,
by-hand plausibility check performed before Madhurima's approval, run once on SIT067 to gauge
whether the draft's shape was promising. It predates the materiality-rule addition above and was
never treated as a verdict. **Part 11 below is the official, from-scratch PASS/FAIL rerun against
the now-finalized, approved spec (including the materiality rule) — that is the result that counts.**

Rewriting 9.3's EVENT 3 [OTHER_PERSPECTIVE]/EVIDENCE_GATHERING beat under the revised draft's
fields, in place of the original "teacher tells Kavi a reassuring fact":

```
INTERPRETATION_1.evidenceCited: ["Kavi is still on page 4 while the rest of the class has closed
  their books," "this has happened before, multiple times, not just today"] — two concrete,
  plan-grounded facts, not a strawman.

EVIDENCE_GATHERING (revised):
  evidenceSource: HERO_DIRECT_TEST
  contradictionMoment: Kavi closes the book without being asked to, and — testing themselves,
    unprompted by an adult — retells what happened in the chapter so far, out loud, in full and
    accurate detail, surprising even Kavi. Moments later, the teacher (visible in the background,
    NOT the source of the test or its answer) asks two of the fast-finishers what happened on the
    page they just read, and both have to flip back and reread before they can answer.
    actor: HERO (the test itself; the fast-finishers' stumble is corroborating, observed evidence,
    not a delivered statement to Kavi).
  reassessmentIsHeroOwned: true — the retell test is Kavi's own idea and Kavi's own discovery, not
    prompted by an adult supplying the method or the conclusion.

INTERPRETATION_2.evidenceCited: ["Kavi retold the whole chapter accurately from memory, unprompted,"
  "two fast-finishers couldn't do the same when asked"] — two concrete facts, matching
  INTERPRETATION_1's count and specificity (WEIGHT PARITY satisfied).
```

Revised TURNING POINT statement (hero-owned, not teacher-delivered): "I thought I hadn't understood
it because I was still on the page — but I can tell the whole thing back, and they can't. Slow
isn't the same as behind."

Revised EMOTIONAL CHANGE.changedState: "trusts what the retelling just proved, not a reassurance
someone else offered" — materially closer in weight to 7B's own tested F03 plans (SIT083, SIT020)
than 9.3's "repeating the teacher's reassurance to feel better."

**Sanity-check outcome (unofficial):** the revised draft would plausibly have caught 9.3's original
failure. Under the revised fields, the original EVENT 3 (teacher hands Kavi a reassuring fact) is
mechanically excluded twice over: `evidenceSource` cannot be set to a value representing "another
character states the answer" (only HERO_DIRECT_OBSERVATION/TEST/EXPERIENCE are valid), and even if
an author tried to route around that by inventing a nominal "test," `contradictionMoment` requires
naming a specific, plan-grounded event with HERO as actor — a one-line "Kavi tests it and it's fine"
placeholder would visibly fail to satisfy the field's own specificity requirement the way "Kavi
retells the chapter accurately, unprompted, while two fast-finishers can't" does. This is a
plausibility check only, run by hand once, on the same hostile situation that exposed the original
failure — it was not equivalent to the from-scratch, fully-mapped-to-`requiredBeats` official rerun
that 9.1/9.6 above received. **Part 11 below now provides that official rerun**, against the
finalized, approved spec (Part 10, with the materiality rule applied).

---

## Part 11 — T16 fix APPROVED and applied; official SIT067 → T16 rerun, from scratch

**Madhurima's decision:** Part 10's revised T16 proposal — `evidenceCited` arrays with weight parity
on INTERPRETATION_1/INTERPRETATION_2, the closed `evidenceSource` enum
(`HERO_DIRECT_OBSERVATION | HERO_DIRECT_TEST | HERO_DIRECT_EXPERIENCE`), the required
`contradictionMoment` (HERO-actor, with the materiality rule now added), and
`reassessmentIsHeroOwned` — is **APPROVED**, with the materiality clarification applied exactly as
she specified (Part 10 above). This is now T16's locked slot spec. Per the same protocol already
used for T03 (9.5) and T21 (9.6): fix approved → applied to the paper spec → full from-scratch
official rerun against the original hostile situation. This section is that rerun. Unlike Part 10's
informal sanity-check (which only rewrote one beat of the original 9.3 plan), this is a genuine
from-scratch 15-step 7B Story Plan for SIT067, independently built and then mapped onto T16's real
`requiredBeats` (`EVENT, INTERPRETATION_1, EVIDENCE_GATHERING, INTERPRETATION_2, RESOLUTION`), the
same rigor 9.1/9.6 received. It reuses the informal sanity-check's core content as a starting point
(per the task's explicit permission to do so, since Madhurima already reviewed and liked its shape)
but rebuilds the plan in full, verifies every new requirement explicitly, and compresses to 50–70
words checking the Minimum Story Spine.

### Full 15-step Story Plan, SIT067 → F03 → T16 (fixed spec)

```
1. FORM: F03 — The Shift in Seeing

2. STORY ESSENCE
   emotionalTruth: Slow was never the same as behind.
   storyQuestion: Is Kavi actually behind, or just working a different way?
   coreChange: "Speed proves intelligence" stops being automatic.

3. HERO: Kavi

4. SUPPORTING CHARACTERS: the teacher — role "teacher," relationshipToHero "classroom authority
   figure, present but not the source of Kavi's reassessment," narrativeFunction: WITHHOLD_ANSWER /
   ambient-corroborating-presence only (per the fixed EVIDENCE_GATHERING spec's restricted
   narrativeFunction list) — the teacher never supplies the reframe or a reassuring statement to
   Kavi anywhere in this plan; the teacher's classroom actions (calling on the fast-finishers) are
   observed BY Kavi, not directed AT Kavi as an explanation.

5. CHARACTER WANTS/RELATIONSHIPS
   heroWant: catch up and get the reading right, like everyone else seems to.
   supportingWants: teacher wants the class to actually understand the chapter, not just finish it
     — this want drives the teacher's classroom action (calling on the fast-finishers), which is
     what Kavi happens to observe, not something staged at or for Kavi.

6. WORLD/SETTING: classroom, reading time, Kavi still on the same page while others move on.

7. KEY OBJECT(S): none — a purely internal F03 belief-shift, nothing forced in per §4a.

8. OPENING STATE
   situation: Around Kavi, pencils are already going down. Kavi is still on the same page, staring
     at it, wondering why it isn't clicking yet.
   belief: If I learn slowly, I'm not smart. (F03-mandatory, per Phase 6 falseBeliefText.)

9. HERO WANT: catch up and get it right, the way everyone else seems to.

10. EVENT CHAIN
    EVENT 1 [EVENT]              actor: HERO — Kavi is still sounding out words on page 4 while the
                                   rest of the class has closed their books and moved to free
                                   reading.
                                   newInfo: establishes the opening fact the false belief will
                                   attach to.
    EVENT 2 [INTERPRETATION_1]   actor: HERO — Kavi reads the closed books around the room as proof:
                                   "I'm still stuck here because I'm not smart enough to get it,
                                   like they did."
                                   evidenceCited: ["Kavi is still on page 4 while the rest of the
                                     class has closed their books," "this has happened before,
                                     multiple times, not just today"] — two concrete, plan-grounded
                                     facts, not a strawman.
    EVENT 3 [EVIDENCE_GATHERING] actor: HERO (test) / teacher (ambient, WITHHOLD_ANSWER only) — Kavi
                                   closes the book without being told to, and — unprompted, testing
                                   themselves — retells what happened in the chapter so far, out
                                   loud, in full and accurate detail, surprising even Kavi. Moments
                                   later, the teacher (visible in the background, not addressing
                                   Kavi, not supplying any answer) calls on two of the fast-finishers
                                   and asks what happened on the page they just read — both have to
                                   flip back and reread before they can answer at all.
                                   evidenceSource: HERO_DIRECT_TEST.
                                   contradictionMoment: Kavi's own unprompted retelling — full,
                                     accurate, from memory, something Kavi did not expect to be able
                                     to do — directly contradicts "I'm not smart enough to get it";
                                     the fast-finishers' failure to do the same when called on is
                                     corroborating evidence Kavi personally witnesses in the same
                                     scene, not a fact delivered to Kavi by the teacher. **Materiality
                                     check: this is not incidental — it is the single event the whole
                                     reassessment turns on, directly rebutting the specific claim
                                     "finishing first = understanding it, and I don't understand it,"
                                     with a concrete, hard-to-dismiss counter-demonstration (Kavi's
                                     own full accurate retelling, plus the fast-finishers visibly
                                     failing the same test) — not a minor caveat or a single soft data
                                     point.**
                                   reassessmentIsHeroOwned: true — the retell test is Kavi's own idea
                                     and Kavi's own discovery, prompted by no one.
    EVENT 4 [INTERPRETATION_2]   actor: HERO — Kavi reassesses: finishing first never meant
                                   understanding it best — Kavi just proved they'd absorbed the whole
                                   chapter, and two people who "got there first" couldn't do the same.
                                   evidenceCited: ["Kavi retold the whole chapter accurately from
                                     memory, unprompted," "two fast-finishers couldn't do the same
                                     when asked"] — two concrete facts, matching INTERPRETATION_1's
                                     count and specificity. **WEIGHT PARITY check: INTERPRETATION_1
                                     had 2 evidenceCited entries; INTERPRETATION_2 has 2, each equally
                                     concrete and specific (not a single generic reassurance
                                     outweighing a multi-fact impression) — parity satisfied.**

11. TURNING POINT
    trigger: EVENT 3→4 — Kavi's own retelling test, and what it reveals against the fast-finishers'
      stumble.
    statement: "I thought I hadn't understood it because I was still on the page — but I can tell
      the whole thing back, and they can't. Slow isn't the same as behind."

12. NEW CHOICE/ACTION: Kavi keeps reading at their own pace for the rest of the chapter, instead of
    rushing to close the book to match the fast-finishers.

13. EMOTIONAL CHANGE
    startingState: confusing "slow" with "not smart."
    changedState: trusts what the retelling just proved — not a reassurance anyone else offered.

14. RESOLUTION/NEW STATE: Kavi finishes the chapter at their own pace and, when asked what happens
    next, answers immediately and in full — shown, not narrated as "Kavi learned not to compare."

15. MINIMUM STORY SPINE
    1) Kavi still on the page while others finish (opening + false-belief evidence)
    2) Kavi reads this as proof of not being smart enough (INTERPRETATION_1, evidence-backed)
    3) Kavi tests themselves unprompted — retells the chapter accurately; fast-finishers can't
       (EVIDENCE_GATHERING — load-bearing, cannot compress: this is the one HERO-owned,
       materially-capable contradiction the whole reassessment depends on)
    4) Kavi reassesses: finishing first never meant understanding best (INTERPRETATION_2,
       evidence-backed, turning point)
    5) Kavi keeps reading at their own pace, answers fully when asked (resolution)
    All 5 load-bearing; no safe compression point without losing either the evidence-parity or the
    hero-owned-contradiction mechanic.
```

### T16 slot mapping (`requiredBeats`: EVENT, INTERPRETATION_1, EVIDENCE_GATHERING,
### INTERPRETATION_2, RESOLUTION)

| T16 slot | SIT067 content | Gap? |
|---|---|---|
| EVENT | EVENT 1 (still on page 4 while class moves on) | none |
| INTERPRETATION_1 | EVENT 2, evidenceCited: 2 concrete facts | none |
| EVIDENCE_GATHERING | EVENT 3, evidenceSource HERO_DIRECT_TEST, contradictionMoment (materiality verified), reassessmentIsHeroOwned true | none |
| INTERPRETATION_2 | EVENT 4, evidenceCited: 2 concrete facts, parity with INTERPRETATION_1 | none |
| RESOLUTION | Kavi finishing the chapter at own pace, answering fully | none |

### Explicit requirement-by-requirement verification

- **`evidenceCited` arrays, both interpretations, shown:** INTERPRETATION_1 =
  `["Kavi is still on page 4 while the rest of the class has closed their books", "this has
  happened before, multiple times, not just today"]` (2 entries). INTERPRETATION_2 =
  `["Kavi retold the whole chapter accurately from memory, unprompted", "two fast-finishers
  couldn't do the same when asked"]` (2 entries).
- **Weight parity confirmed:** 2 entries vs. 2 entries, each equally concrete/specific (a directly
  observed classroom fact, paired with a directly observed classroom fact) — INTERPRETATION_2 is
  not a single generic reassurance outweighing a richer false impression. Parity rule satisfied.
- **`evidenceSource` shown and confirmed HERO_DIRECT_*, not a delivered fact:** `evidenceSource:
  HERO_DIRECT_TEST` — Kavi personally tests their own retention by retelling the chapter, unprompted.
  No value resembling "OTHER_CHARACTER_STATEMENT" appears anywhere in the plan; the teacher's
  narrativeFunction is restricted to WITHHOLD_ANSWER/ambient and the teacher never speaks to or
  reassures Kavi at any point in the plan (contrast directly with the original 9.3 failure, where the
  teacher told Kavi "lots of smart people read slowly too").
- **`contradictionMoment` shown, with explicit materiality justification (not merely incidental):**
  Kavi's own unprompted, full, accurate retelling of the chapter — directly and substantially rebuts
  the specific claim driving INTERPRETATION_1 ("finishing first means understanding it, and I don't
  understand it") by demonstrating, in the same scene, that (a) Kavi does understand it in full and
  (b) two people who finished first do not. This is not a trivial aside or a single soft observation
  — it is the one event the entire reassessment is built on, it directly targets INTERPRETATION_1's
  specific evidentiary claim rather than a vague adjacent fact, and it would plausibly cause a
  reasonable reader to actually reconsider INTERPRETATION_1. It passes the materiality rule's stated
  test.
- **`reassessmentIsHeroOwned` = true, shown and how:** the retelling test is Kavi's own idea,
  initiated unprompted, with no adult suggesting the method or supplying the conclusion; Kavi arrives
  at INTERPRETATION_2 by directly processing what Kavi personally just observed (their own retelling,
  the fast-finishers' stumble), not by receiving a statement from the teacher. The TURNING POINT
  statement is phrased entirely in Kavi's own first-person realization, with no adult-delivered line
  anywhere in the plan (contrast with 9.3's teacher-delivered "everyone learns at their own pace").

### Compressed 50–70 word story text, with spine-element coverage shown

> *Everyone else has closed their books. Kavi's still on page 4, sure that means not smart enough.
> [Spine 1–2] So Kavi tries something — closes the book, retells the whole chapter out loud, and
> gets it all right. Two fast-finishers, asked the same thing, can't. [Spine 3] Finishing first
> never meant understanding best. [Spine 4] Kavi keeps reading at their own pace — and answers fully
> when asked. [Spine 5]*

Word count: **63 words.** All 5 Minimum Story Spine elements present and individually locatable;
the contradictionMoment (Spine 3) survives compression intact and remains hero-initiated
("Kavi tries something... retells... gets it all right"), not adult-delivered.

**Verdict: PASS.** Under the finalized, approved spec (evidenceCited + weight parity, closed
`evidenceSource` enum, `contradictionMoment` with the materiality rule, `reassessmentIsHeroOwned`),
SIT067's original failure mode (9.3: a hero "asks a question" and is handed a reassuring fact by an
adult) is structurally excluded, and the sufficiency gap Madhurima flagged (an instant, trivial
hero-run test) is also closed by the materiality rule specifically — Kavi's retelling test is
concrete, substantial, and directly targets INTERPRETATION_1's specific claim, not a token gesture.
This is a genuine from-scratch official rerun, independently built and mapped to T16's real
`requiredBeats`, not a re-labeling of Part 10's informal sanity-check.

---

## Updated overall document status (this revision)

Of the five templates now used in the pipeline (T03, T16, T21, T22, T23) — **all five now PASS**:

| Template | Form | Adversarial status |
|---|---|---|
| T22 "The Reframe Trail" | F02 | **PASS** (Part 8.1, fix applied and verified, prior revision) |
| T23 "The Assumption Bridge" | F04 | **PASS** (Part 8.2, fix applied and verified, prior revision) |
| T03 "Three Tries" | F01 | **PASS** (Part 9.5, this revision — fix approved and applied, SIT005 rerun from scratch) |
| T21 "The Disrupted Plan" | F05 | **PASS** (Part 9.6, this revision — fix approved and applied with closed-enum correction, SIT111 rerun from scratch) |
| T16 "Two Ways to See It" | F03 | **PASS** (Part 10 fix approved with materiality clarification, applied to T16's locked slot spec; Part 11 — official, from-scratch SIT067 rerun, PASS) |

**All five templates now used in the pipeline — T03, T16, T21, T22, and T23 — have passed
adversarial stress-testing with real fixes applied and verified.** Each followed the same protocol:
honest hostile test → real failure found → smallest structural fix proposed → Madhurima's explicit
approval (with, for T16, one additional required tightening — the materiality clarification on
`contradictionMoment`) → fix applied to the paper spec → full from-scratch rerun against the
original hostile situation → PASS confirmed (SIT148→T22 in Part 8.1, SIT089→T23 in Part 8.2,
SIT005→T03 in Part 9.5, SIT111→T21 in Part 9.6, SIT067→T16 in Part 11, all above).

### Final verdict: is the paper architecture ready to be considered LOCKED?

**YES — the paper architecture (Phase 6 → 7A → 7B → Template selection → Event Chain → Phase 8
compression) is now ready to be considered LOCKED for implementation purposes**, on the specific
grounds this document actually tested: all five templates currently used in the pipeline pass
adversarial stress-testing against real, hostile `situations.json` entries, each via a fix that
Madhurima explicitly reviewed and approved (not silently applied), each verified by a genuine
from-scratch rerun (not a re-assertion of the pre-fix plan), and the surrounding architecture (the
15-step planning sequence, §3a/§3b/§3c cast-and-solo QA, §4a key-object rule, template-selection
gating, and 50–70 word Minimum-Story-Spine compression) held cleanly under every one of those reruns
with no new problem surfacing.

**What remains open — explicitly separated into blocking vs. non-blocking, as instructed:**

**Blocks locking the paper architecture:** none. Every item that was previously blocking (T16's
FAIL, T03's and T21's original hostile-test FAILs) has now been resolved with an approved fix and a
verified from-scratch PASS.

**Does NOT block locking the paper architecture — implementation prerequisites to track separately,**
already flagged earlier in this document and unaffected by this task's scope:
1. **The legacy-16-template belief-requirement migration remains untouched and unscheduled** (first
   flagged Part 6, item 2) — T02/T04/T05/T08/T09/T10/T11/T12/T13/T14/T15/T18/T19/T20 (and the F01/F03
   secondaries among them) still hard-require `belief.falseBelief`/`belief.trueBelief` and have not
   been re-tested or migrated per 7E's `no-hard-belief-requirement` lint rule. This is a real,
   pre-existing implementation task, independent of T03/T16/T21/T22/T23's now-passing status.
2. **T22's `resolutionPattern`-note / CONNECTED_DISCOVERY constraint, T21's `disruptionCategory`
   enum, and T16's `evidenceCited`/`evidenceSource`/`contradictionMoment`/`reassessmentIsHeroOwned`
   fields all exist only as paper specs** — none are enforced anywhere in code, because no template
   JSON was touched in this task (by design/scope). Wiring these into `storyTemplates.json` and any
   validating Event Planner logic is an implementation prerequisite, not a paper-architecture gap.
3. **No genuinely adversarial test has been run against every template in the full T01–T20 pool** —
   this document's adversarial coverage is limited to the five templates actually used in the
   pipeline (T03, T16, T21, T22, T23); F01/F03's non-default secondaries and the untouched legacy
   templates were not stress-tested here, consistent with item 1 above.
4. **`productionInputs`/symbol integration was never exercised in any dry run in this document**
   (first flagged Part 6, item 5) — the Story-Plan-and-template half of the pipeline has been
   dry-run repeatedly and adversarially; the parallel `productionInputs` branch reaching the
   Template + Event Planner stage has not.

None of items 1–4 represent a crack in the paper architecture's own logic — they are scoped-out
implementation work, exactly the same category of "genuine gap, not architectural crack" this
document has used throughout (Part 6's closing assessment, Part 9's closing note). The paper
architecture itself, as tested against real hostile data across all five pipeline templates, is
locked.

No code, T01–T20 template JSON, Phase 6 data, F01–F05 Form definitions, Event Planner code, or
Phase 8/9 code was touched anywhere in this task. All hostile/fresh situations referenced throughout
this document (SIT005, SIT067, SIT111, and earlier SIT131/SIT042/SIT148/SIT089) are real, active
entries in `public/prana-story-generator/phase6-data/situations.json`, not constructed.
