# Phase 7B — Expanded Story Plan (11-Part Structure) — Schema + Test Set

---

## LOCKED SCHEMA — FINAL

Status: Madhurima has reviewed the belief/assumption ambiguity raised in Part C §3 of this
document and made a final decision. The schema below is now LOCKED for Phase 7B. This is still
a documentation-only artifact — no implementation code has been written; T01–T20, Event Planner,
Phase 8, and Phase 9 remain untouched.

**1. Full 7B Story Plan sequence (LOCKED — refined, this revision, from the prior 11-part
ordering; NOT a new competing structure):**
FORM → STORY ESSENCE → HERO → SUPPORTING CHARACTERS → CHARACTER WANTS/RELATIONSHIPS →
WORLD/SETTING → KEY OBJECT(S) → OPENING STATE → HERO WANT → EVENTS → TURNING POINT →
NEW CHOICE/ACTION → EMOTIONAL CHANGE → RESOLUTION/NEW STATE → MINIMUM STORY SPINE.

This is a **refinement** of the same schema documented in Part A, not a replacement of it. Two
changes only:
- The old single "3. CAST" step is split into two explicit steps — **HERO** and **SUPPORTING
  CHARACTERS** — matching how §3/§3a/§3b already treat them as independently-resolved ingredients
  (hero is fixed as Kavi; supporting characters are resolved per §3/§3b, 0 to 3, each needing a
  narrative function).
- Two steps that were previously covered only abstractly, by §4's "ingredients are
  Form-independent too" principle, now get their own explicit place in the sequence, before
  OPENING STATE: **WORLD/SETTING** (where the story concretely takes place — already implicit in
  every OPENING STATE.situation line in Part A/B/D, now named as its own planning step) and
  **KEY OBJECT(S)** (optional; see new §4a below for the narrative-function rule governing when
  one is included).
- Everything else — CHARACTER WANTS (now "Character Wants/Relationships," unchanged in content),
  OPENING STATE (including the belief/assumption split, §2 below), HERO WANT, the event chain
  (renamed "EVENTS" here, still the Form-specific locked vocabulary from Part A §7), TURNING
  POINT, NEW CHOICE/ACTION, EMOTIONAL CHANGE, RESOLUTION/NEW STATE, and MINIMUM STORY SPINE —
  keeps the same relative order and the same rules as Part A. Part A's numbered diagram (§1–§12)
  and its carried-forward rules (event vocabulary, per-Form hard structural rules, the
  belief/assumption split, the corrected character-count rule) remain the field-level source of
  truth; this sequence is the planning-order view of the identical schema, expanded to give World/
  Setting and Key Object(s) their own explicit step instead of leaving them implicit inside CAST/
  ingredients-independence language.

**2. Belief / assumption split (LOCKED, supersedes Part A §"Belief/emotional-change rule" and
Part C §3's open question):**
- **F03 → field `belief`.** A world-level/internal belief that genuinely drives the story's
  shift. Always populated in OPENING STATE. Example: *"If you can't see someone every day, the
  friendship is over."* Carries full narrative weight — this is what the Form is about.
- **F04 → field `assumption`** (renamed from `belief`). A specific prediction/misreading about
  ONE other person, not a worldview. Example: *"Kavi assumes the new child wants to be rescued."*
  Populated in OPENING STATE as `assumption`, not `belief`. Must NOT be written or treated with
  F03's narrative weight — it is narrower, more situational, and resolves through a single
  character's REVEAL, not a worldview-level reframe.
- **F01, F02, F05 → no belief field at all.** OPENING STATE for these Forms carries no
  `belief`/`assumption` field, populated or empty-and-labeled. Phase 6 belief data may inform
  planning as background/input material only and must never automatically become Story Plan
  content.

**3. CAST IS FORM-INDEPENDENT (LOCKED CORRECTION — supersedes any prior wording in this document
that implied Forms constrain cast size):**
None of F01–F05 determine or restrict how many characters a Story Plan may have. FORM determines
the story's **mechanism** (its locked event vocabulary — ATTEMPT/CONSEQUENCE, NOTICE/INVESTIGATE/
DISCOVER/CONNECTED_DISCOVERY, EVIDENCE/CONTRADICTION/OTHER_PERSPECTIVE/BELIEF_UNCERTAIN,
ENCOUNTER/INITIAL_RESPONSE/REVEAL/DEEPER_NOTICE/CHANGED_RESPONSE, EXPECTATION/DISRUPTION/
REACTION/RESTORE_ATTEMPT/RESTORE_FAILS) — never the cast size. Any Form may legitimately be
realized with 1 hero only, hero + 1 supporting character, hero + 2–3 supporting characters, or
additional characters entering later when the story requires them (e.g. a hero who searches
alone, gets stuck, and only then has a parent/sibling/friend enter to help, reveal something, or
change the situation — valid in any Form if the event sequence genuinely follows that Form's
mechanism).

**Correction to the original 9-test-plan set:** the original set happened to pair F01/F02 with
the two 1-character plans in this document (SIT045, SIT143) and F04 with cast sizes of 2–3
(SIT166, SIT089). That pattern was **coincidental to which situations were selected for the test
set, not evidence that F01/F02 "run solo" and F04/F03 "run with company."** Part D below adds
new validation examples (SIT020 for F03, SIT050 for F04, SIT014 for F05) specifically to correct
any impression left by the original set that particular Forms gravitate toward particular cast
sizes. F01 and F02 already independently prove this within the original 9 (F01: SIT045 at 1
character through SIT168 at 4; F02: SIT143 at 1 character through SIT148 at 2).

CAST is resolved independently, from the Blueprint/situation's own storySeed and what the story
genuinely needs — never from Form, and never padded merely for variety, and never trimmed merely
to satisfy a Form. Supporting characters may enter at any point in the event chain, including
partway through (they need not be present from OPENING STATE).

**3a. Solo-story QA rule (reframed — applies whenever `supportingCharacters.length === 0`,
REGARDLESS of Form, not tied to any specific Form):**
When cast size is 1 (hero only), at least one event in the EVENT CHAIN must show the hero
changing **STRATEGY** — not merely trying harder at the same approach, not simply relocating,
and not waiting for circumstances to change externally. This is grounded in the stress-test
finding (Part C §2 below) from the 1-character plans in this set (SIT045, SIT143, and now SIT020
and SIT014 in Part D), where solo stories risk blurring "what the hero does" from "what happens
to the hero." This is a QA check on any 0-supporting-character plan, in any Form — it was
originally observed on an F01 and an F02 plan, but nothing about its logic is F01/F02-specific;
Part D §2 and §4 apply it, unchanged, to a new F03 and F05 solo plan to confirm this.

**3b. Multi-character QA rule (NEW, companion to 3a — applies whenever
`supportingCharacters.length >= 1`):**
Every supporting character named in CAST must have a genuine narrative function: they must
**cause, reveal, challenge, help, change, or be changed by** something meaningful in the plan.
A character present only "for variety" or only to make the cast feel populated fails this check
and should either be cut or given a real function. Passive presence can still satisfy this rule
when the character's mere existence in the scene is the causal force the hero is responding to
(see the SIT089 baby re-check in Part D §5 for the boundary case this raises). Part D §5 applies
this rule to three existing plans with supporting characters (SIT148, SIT168, SIT089).

**3c. Complete-cast-before-events rule (NEW, direct architectural consequence of §3/§3a/§3b —
LOCKED verbatim per Madhurima):**
> Phase 7B must resolve the complete story cast before event planning: Hero + Supporting
> Characters + World + Key Object(s). These are independent story ingredients supplied by Phase
> 6/Blueprint. The Form does not choose or restrict them; it determines how the chosen
> ingredients are used across the story.

This does not introduce a new principle — it is §3's "CAST IS FORM-INDEPENDENT" and §4's
"ingredients are Form-independent too" (below), stated as a sequencing consequence: all four
ingredients (Hero, Supporting Characters, World, Key Object(s)) must be settled — sourced from
Phase 6/Blueprint, never invented or restricted by Form — before the EVENT CHAIN is planned,
because the event chain's actors, setting, and any object business are drawn from this resolved
cast, not decided ad hoc mid-chain. This is why the LOCKED SCHEMA §1 sequence above places HERO,
SUPPORTING CHARACTERS, WORLD/SETTING, and KEY OBJECT(S) before OPENING STATE and EVENTS.

**4. Ingredients are Form-independent too (NEW):** the same principle extends beyond cast. FORM
does not decide *whether* a particular object, world, symbol, relationship, or situation
ingredient can appear in a plan — those are resolved from Phase 6 / story planning, the same way
CAST is. FORM decides *how* those ingredients are used (through its own event vocabulary and
turning-point shape), not whether they show up at all. This is consistent with, and does not
duplicate, `tmp_phase7e_locked_decisions.md` Decision 4's `productionInputs` handoff: `symbol` is
already specified there as resolved from Phase 6 in parallel to the Story Plan, carrying zero
emotional-architecture content and never gated by Form — this note simply generalizes that same
already-locked principle (Form-independent sourcing, Form-dependent usage) to object/world/
relationship/situation ingredients that live inside the Story Plan itself (e.g. CHARACTER WANTS,
OPENING STATE.situation, EVENT CHAIN content), rather than introducing a new or conflicting rule.

**4a. Key Object narrative-function rule (NEW, QA rule analogous to §3a/§3b — LOCKED per
Madhurima):**
Objects are not mandatory decoration. A Key Object should be selected only when it has a genuine
story function — something the hero **searches for, uses, protects, discovers, loses, gives,
changes, or attaches meaning to.** A Key Object is included in a Story Plan only if the plan can
name, in one of those verbs, what the hero does with/to it. If a situation doesn't need an object,
the plan should have **none** — do not force one in for texture, and do not pad KEY OBJECT(S)
merely to fill the sequence slot in §1 above. This mirrors §3b's rule for supporting characters:
just as a character present only "for variety" fails 3b, an object present only for atmosphere
fails 4a and should be cut or given a real function. Part D §5 below applies this rule to all 12
test plans (the original 9 plus SIT020/SIT050/SIT014), backfilling a World/Setting and
Key Object(s)-or-none entry for each without inventing new content.

**5. F02/F04 boundary — FUTURE template-layer (T-layer) QA rule, NOT part of 7B:**
When an F02 story ends with a newly appearing owner/person for a discovered object, the payoff
must remain about the discovery/object, not about the relationship with that person. This seam
has now appeared **three times** across stress tests (SIT123, SIT148, and this test round) and
should be flagged prominently for whoever builds template QA later. This is explicitly **not**
a 7B schema rule — 7B's CAST field already makes the risk visible (per Part C §1); enforcing it
is deferred to a future T-layer check, not built here.

---

Status: **design/planning artifact only**. Nothing in T01–T20, Event Planner, Phase 8, Phase 9, or the F01–F05 locked Form definitions was touched. This document adds the missing authorial planning layer on top of the already-locked 7B event-container schema (see `tmp_phase7b_spec_and_test.md`), and tests it on 9 real situations pulled from `public/prana-story-generator/phase6-data/situations.json`.

Pipeline position (unchanged): Phase 6 Blueprint → 7A Story Form (F01–F05) → **7B Story Plan (this document's expansion)** → Template T01–T20 → Event Planner → Phase 8 prose.

---

## Part A — Finalized Expanded 7B Schema

```
STORY PLAN
│
├── 1. FORM                      — one of F01–F05, inherited from 7A, unchanged rules
│
├── 2. STORY ESSENCE
│     ├─ emotionalTruth          — what is emotionally true for the child (not a moral, a truth)
│     ├─ storyQuestion           — the question that makes us want to know what happens next
│     ├─ coreChange              — what is different by the end (state, understanding, or relationship)
│     └─ minimumStorySpine       — pointer to §11; stated here as a one-line forward reference
│
├── 3. CAST
│     ├─ hero                    — always Kavi
│     └─ supportingCharacters[]  — 0 to 3 entries, each:
│           ├─ role                    — e.g. "friend", "younger sibling", "classmate", "parent"
│           ├─ relationshipToHero       — e.g. "best friend", "baby sister", "new classmate"
│           ├─ want                    — this character's own want, stated even if minor
│           └─ narrativeFunction       — why this character exists in THIS plan
│     (no character is invented merely for variety; count matches what the situation actually needs)
│
├── 4. CHARACTER WANTS
│     ├─ heroWant                — see §6, restated here as the anchor want for the whole plan
│     └─ supportingWants[]       — one line per supporting character, cross-referenced to CAST
│
├── 5. OPENING STATE
│     ├─ situation               — concrete, sensory, present-tense setup
│     └─ belief / assumption     — LOCKED: F03 → field `belief` (world-level, always populated,
│                                    full narrative weight). F04 → field `assumption` (narrow,
│                                    about one other person, does not carry F03's weight).
│                                    F01/F02/F05 → no belief/assumption field at all.
│
├── 6. HERO WANT
│     └─ concrete immediate want — never a Phase 6 NEED_* id; must be actionable/specific
│                                    (bad: "NEED_COMPASSION"; good: "help the new kid without making it weird")
│
├── 7. FORM-SPECIFIC EVENT CHAIN
│     └─ event[]                 — each event has:
│           ├─ label                   — the Form's locked vocabulary token (ATTEMPT, NOTICE, EVIDENCE, etc.)
│           ├─ actor                   — HERO | supporting-character role | HERO + role (co-action)
│           ├─ action                  — what the actor DOES (verb-first, not "X happens to them")
│           └─ newInformationOrShift   — what this event adds that the previous event didn't have
│     (vocabulary and hard structural rules per Form are UNCHANGED from tmp_phase7b_spec_and_test.md
│      — reproduced in Part A §7-rules below for convenience, not re-authored)
│
├── 8. TURNING POINT
│     ├─ trigger                 — which preceding event(s) it arises from (never a fresh, unearned insertion)
│     └─ statement                — Form-specific in kind (reframe / felt realization / relational noticing /
│                                    adaptation decision — never a moral delivered by another character)
│
├── 9. NEW CHOICE / ACTION
│     └─ what the hero concretely does differently — an action, not "the hero learned that..."
│
├── 10. EMOTIONAL CHANGE
│     ├─ startingState            — the hero's internal state at OPENING STATE
│     └─ changedState             — the hero's internal state after the TURNING POINT
│     (planning data — need not appear as narrated text in the final prose)
│
├── 11. RESOLUTION / NEW STATE
│     └─ what is concretely different after the NEW CHOICE/ACTION — shown, not summarized
│
└── 12. MINIMUM STORY SPINE
      └─ the smallest ordered event list that still preserves:
         character + want + meaningful progression + turning point + emotional change + ending consequence
         (this is what Phase 8 compression must never fall below)
```

### Part A — carried-forward rules (unchanged, reproduced for reference only)

**Per-Form event vocabulary (locked, no generic fallback):**
- F01: `ATTEMPT` / `CONSEQUENCE`
- F02: `NOTICE` / `INVESTIGATE` / `DISCOVER` / `CONNECTED_DISCOVERY`
- F03: `EVIDENCE` / `CONTRADICTION` / `OTHER_PERSPECTIVE` / `BELIEF_UNCERTAIN`
- F04: `ENCOUNTER` / `INITIAL_RESPONSE` / `REVEAL` / `DEEPER_NOTICE` / `CHANGED_RESPONSE`
- F05: `EXPECTATION` / `DISRUPTION` / `REACTION` / `RESTORE_ATTEMPT` / `RESTORE_FAILS`

**Per-Form hard structural rules:** unchanged from `tmp_phase7b_spec_and_test.md` §"Phase 7B Specification". Not reproduced in full here to avoid drift between two copies; each test plan below is checked against the original rule set.

**Belief/assumption rule (LOCKED — see "LOCKED SCHEMA — FINAL" at the top of this document):**
- F03 — field `belief`. Belief transformation is mandatory and central; OPENING STATE.belief is always populated, world-level, and carries full narrative weight.
- F04 — field `assumption` (not `belief`). A narrow, specific prediction/misreading about the OTHER character, never about the world in general. Does not carry F03's narrative weight.
- F01, F02, F05 — no belief/assumption field at all. Phase 6 belief data is available as background/input material only and must never automatically become Story Plan content. F05 states an explicit `plan`/expectation instead, where relevant.

**Character-count rule (CORRECTED — see LOCKED SCHEMA §3, "CAST IS FORM-INDEPENDENT"):** CAST
size is set by what the situation's own storySeed and the story's genuine needs imply — never by
Form. A situation whose seed has no other named party (e.g. a solo regulation situation) gets 0
supportingCharacters and stays 0; a situation whose seed implies several people gets several —
padding cast size to "make it feel like a story," and trimming it merely to fit a Form's usual
pattern, are both explicitly disallowed. Supporting characters may enter partway through the
event chain rather than being present from OPENING STATE (see SIT148's owner, appearing only at
EVENT 4, already in this document's original test set as an example of this).

---

## Part B — 9 Test Story Plans

Selected from `situations.json` (168 active/retired total, 156 active) to deliberately cover: 1-character, 2-character, and 3+-character casts; all five Forms; multiple emotion groups; and one situation designed to run with no invented obstacle beyond the situation itself.

| # | Situation | Form | Cast size | Emotion group |
|---|---|---|---|---|
| 1 | SIT045 — Lost a favourite blanket | F01 | 1 (hero only) | Sad |
| 2 | SIT143 — Seeing someone litter | F02 | 1 (hero only; litterer already gone) | Angry / Confused-right-wrong |
| 3 | SIT148 — Found something, unsure to keep | F02 | 2 (hero + owner, owner appears late) | Torn |
| 4 | SIT166 — New classmate sitting alone | F04 | 2 (hero + classmate) | Left Out / Unsure |
| 5 | SIT083 — Friend got a new toy | F03 | 2 (hero + friend) | Jealous / Comparing |
| 6 | SIT051 — Close friend moved away | F03 | 2 (hero + friend, offstage) | Sad / Grieving |
| 7 | SIT168 — Group project, everyone disagrees | F01 | 4 (hero + 3 classmates) | Frustrated / Torn |
| 8 | SIT089 — New sibling gets the attention | F04 | 3 (hero + baby + parent) | Jealous / Left Out |
| 9 | SIT099 — Noisy overcrowded mall | F05 | 2 (hero + parent) | Overwhelmed |

---

### 1. SIT045 — Lost a favourite blanket — F01 (Trying) — 1 character

```
FORM: F01 — The Journey of Trying

STORY ESSENCE
  emotionalTruth: The comfort I got from my blanket was never actually IN the blanket.
  storyQuestion: Will Kavi find the blanket — or find out they don't need to?
  coreChange: Kavi stops needing the object to feel safe.
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters: [] — this is a solo internal-regulation situation; no other character
    is implied by the storySeed, so none is added.

CHARACTER WANTS
  heroWant: Find the blanket before bedtime.
  supportingWants: n/a

OPENING STATE
  situation: Bedtime is minutes away. Kavi has checked the usual spot twice — the blanket
    isn't there. The room already feels different without it.
  (no belief field — LOCKED SCHEMA: F01 carries no belief/assumption field. The "I can't be okay
    without this blanket" internal state lives in EMOTIONAL CHANGE.startingState below instead,
    which is where F01 arcs are meant to carry this kind of content.)

HERO WANT: Find the blanket, fast, before the "not okay" feeling gets worse.

EVENT CHAIN
  EVENT 1 [ATTEMPT]     actor: HERO — Kavi tears through the toy box, moving fast, sure
                          it's just misplaced.
                          newInfo: it's not in the obvious place.
  EVENT 2 [CONSEQUENCE] actor: HERO — Nothing. The panic ticks up a notch; bedtime is closer.
                          newInfo: obvious places are exhausted — this needs a different approach.
  EVENT 3 [ATTEMPT]     actor: HERO — Kavi retraces the whole day step by step out loud —
                          car, garden, kitchen — instead of just searching rooms at random.
                          newInfo: narrows it to "somewhere between the car and the door."
  EVENT 4 [CONSEQUENCE] actor: HERO — Checks the car. Not there either. Now truly out of places
                          to look tonight.
                          newInfo: the search itself has run out — this is a genuinely new problem,
                          not just "look harder."
  EVENT 5 [ATTEMPT]     actor: HERO — Kavi stops searching and instead tries just lying down
                          without it, arms wrapped around themselves the way the blanket used to
                          be wrapped.
                          newInfo: this is the first attempt aimed at the FEELING, not the OBJECT.
  EVENT 6 [CONSEQUENCE] actor: HERO — It's not the same, but it's not nothing — the tight,
                          panicky feeling loosens a little, on its own, without the blanket.

TURNING POINT
  trigger: EVENT 5→6 — the feeling eased without the object being found.
  statement: "Maybe the safe feeling was never in the blanket — it was something I already know
    how to do."

NEW CHOICE/ACTION: Kavi asks for the search to continue tomorrow, and settles into bed tonight
  without it, using the same self-wrap instead of waiting to feel okay again.

EMOTIONAL CHANGE
  startingState: I can't be okay without this blanket.
  changedState: The comfort lives in me too — I can find it even when the blanket's missing.

RESOLUTION/NEW STATE: Kavi falls asleep without the blanket for the first time — not because
  the loss stopped mattering, but because Kavi found a version of "safe" that doesn't depend on it.

MINIMUM STORY SPINE
  1) Kavi can't find the blanket, bedtime is close (want + stakes)
  2) two search attempts both fail (meaningful progression, not padding — each rules out a
     different place and escalates urgency)
  3) Kavi tries self-comfort instead of searching (turning point action)
  4) the panic eases on its own (emotional change)
  5) Kavi sleeps without it (ending consequence)
  Removing any of 1, 3, 4, 5 collapses the arc; event 2 could be compressed to one beat without
  losing the essence — flagged for Phase 8 compression as the safe cut point.
```

**Acceptance test**
1. Real children's story? Yes — concrete, sensory, bedtime stakes a 5-year-old feels immediately.
2. Reason to keep reading? Yes — "will they find it" is genuine until event 5 redirects the question.
3. Every event causes/reveals/complicates/changes something? Yes, each of the 6 events does.
4. Characters doing things, not hero doing everything? N/A by design — 1-character cast, hero
   necessarily carries all actor slots; see fragility note in Part C.
5. Form genuinely visible? Yes — real attempt/consequence escalation with strategy changing
   each time (frantic search → systematic retrace → dead end → internal attempt).
6. Emotional change earned? Yes — arises directly from event 5, not asserted.
7. Compressible to 50–70 words without losing essence? Yes, per spine above.
8. Removing any event leaves a hole? Events 1–2 together could compress to one, noted above;
   3–6 are all load-bearing.

---

### 2. SIT143 — Seeing someone litter — F02 (Discovery) — 1 character, no invented obstacle

```
FORM: F02 — The Discovery Journey

STORY ESSENCE
  emotionalTruth: One small noticed thing can turn out to be bigger than it looked.
  storyQuestion: What is this wrapper actually part of?
  coreChange: "One piece of litter" becomes "a pattern I almost walked past."
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters: [] — the person who littered has already left the scene before the story
    starts (per storySeed: "walks away"). No character is invented to replace them; this situation
    is deliberately run with NO obstacle beyond Kavi's own uncertainty about whether it's "their
    place" to act — there is no antagonist to overcome, only a discovery to make.

CHARACTER WANTS
  heroWant: Figure out what to do about the wrapper.
  supportingWants: n/a

OPENING STATE
  situation: The wrapper lands near the bench. The person who dropped it is already gone. Kavi
    looks at the wrapper, then at the bin only a few steps away.
  (no belief field — LOCKED SCHEMA: F02 carries no belief/assumption field. The Phase 6 false
    belief "one action can't matter" is available as background input only and is never staged
    as Story Plan content; F02's payoff is discovery-shaped, not belief-shaped.)

HERO WANT: Decide what to do about the wrapper — pick it up, or let it be someone else's problem.

EVENT CHAIN
  EVENT 1 [NOTICE]              actor: HERO — Kavi almost walks past, then looks again at the
                                  wrapper instead of just stepping around it.
                                  newInfo: Kavi's attention shifts from "not my problem" to "look closer."
  EVENT 2 [INVESTIGATE]         actor: HERO — Kavi crouches to pick it up and, doing so, notices
                                  a second wrapper half-hidden under the bench.
                                  newInfo: it's not one piece — there's more here than the first glance showed.
  EVENT 3 [DISCOVER]            actor: HERO — Following the small trail, Kavi finds a third piece
                                  near the bush, and realizes the bin is only a few steps from
                                  all three.
                                  newInfo: this wasn't unavoidable — every piece was avoidable, and no
                                  one else has stopped to notice it today.
  EVENT 4 [CONNECTED_DISCOVERY] actor: HERO — Kavi notices a bird pecking at one of the wrappers,
                                  clearly interested in something inside it.
                                  newInfo: this reframes the opening — "small litter, no big deal"
                                  becomes "small litter, real and immediate effect."

TURNING POINT
  trigger: EVENT 3→4 — the pattern (multiple pieces, close bin, a bird already affected) reframes
    the opening NOTICE.
  statement: The single wrapper Kavi almost walked past turns out to be one visible piece of
    something bigger that everyone else has also walked past today.

NEW CHOICE/ACTION: Kavi picks up all three pieces and carries them to the bin.

EMOTIONAL CHANGE
  startingState: bothered but unsure it's "my place" to do anything.
  changedState: certain — not because of a rule, but because Kavi now understands the actual scale.

RESOLUTION/NEW STATE: The bench area is clear. Kavi didn't need permission or an audience —
  understanding what was really there was enough to act.

MINIMUM STORY SPINE
  1) wrapper lands, litterer already gone (opening, no obstacle needed)
  2) Kavi looks closer instead of walking past (turning toward discovery)
  3) more pieces + close bin + bird are found (the discovery escalates — this is the one part
     that must not compress to fewer than 2 beats, or the "pattern" reveal has no weight)
  4) Kavi acts, cleans it up (ending consequence)
  Removing event 4's bird detail specifically would weaken the "real effect" reframe but not
  collapse the arc — flagged as the safe compression point, not events 1–3 or the ending.
```

**Acceptance test**
1. Real children's story? Yes — a small, concrete, moral-without-lecturing moment.
2. Reason to keep reading? Yes — "how many pieces are there" and "why does it matter" are both
   open questions the plan answers incrementally.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? N/A — deliberately 1-character by design
   (see Part C, fragility note).
5. Form genuinely visible? Yes — pure discovery chain, no antagonist, DISCOVER beats each add
   new information, final discovery reframes the opening NOTICE per the F02 hard rule.
6. Emotional change earned? Yes — from "unsure it's my place" to "certain," driven entirely by
   what was found, not by an external instruction.
7. Compressible to 50–70 words? Yes.
8. Removing any event leaves a hole? Events 1, 3, 4 are load-bearing; event 2 could merge into 3.

---

### 3. SIT148 — Found something and doesn't know whether to keep it — F02 (Discovery) — 2 characters, owner arrives late

```
FORM: F02 — The Discovery Journey

STORY ESSENCE
  emotionalTruth: What I found isn't "a found thing" — it's someone else's search, unfinished.
  storyQuestion: Whose is this, and what happens when Kavi finds out?
  coreChange: An anonymous object becomes a specific person's answered search.
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters:
    - role: "owner" (a regular at the park, not previously known to Kavi)
      relationshipToHero: stranger who becomes recognizable through the discovery
      want: to get their lost object back
      narrativeFunction: the discovery's endpoint — appears only once the mystery is solved;
        never drives the plot's questions, only receives its answer (per the F02/F04 hard rule
        that the payoff must stay about the object, not the relationship)

CHARACTER WANTS
  heroWant: Figure out what this is and what to do with it.
  supportingWants: owner wants their object back (present in the world the whole time, but
    off-page until EVENT 4)

OPENING STATE
  situation: Kavi spots something small and valuable half-hidden under a park bench. Nobody else
    is around.
  (no belief field — LOCKED SCHEMA: F02 carries no belief/assumption field.)

HERO WANT: Figure out what this thing is and who it belongs to.

EVENT CHAIN
  EVENT 1 [NOTICE]              actor: HERO — Kavi picks it up, turning it over.
                                  newInfo: it's not random junk — it looks cared for.
  EVENT 2 [INVESTIGATE]         actor: HERO — Kavi looks closer and finds initials scratched
                                  into the underside.
                                  newInfo: it has an identity attached to it now, not just a shape.
  EVENT 3 [DISCOVER]            actor: HERO — Kavi realizes the initials match a name Kavi's
                                  heard called out by the woman who's at this same bench most
                                  afternoons.
                                  newInfo: the object connects to a specific, findable person.
  EVENT 4 [CONNECTED_DISCOVERY] actor: HERO — Kavi remembers seeing that same woman crouched down
                                  searching the grass here yesterday, looking annoyed and worried.
                                  newInfo: this reframes the whole object — it was never "a found
                                  thing," it was always the missing half of a search Kavi had
                                  already, unknowingly, witnessed.

TURNING POINT
  trigger: EVENT 3→4 — the memory of yesterday's search recontextualizes the object.
  statement: This isn't a found thing anymore — it's very specifically someone's search, still
    unfinished.

NEW CHOICE/ACTION: Kavi comes back to the same bench the next afternoon at the same time,
  object in hand, instead of just leaving it at a lost-and-found or deciding to keep it.

EMOTIONAL CHANGE
  startingState: torn — tempted to keep it, aware it isn't really Kavi's.
  changedState: clear — once the object has a specific person attached, keeping it stops being
  a live question.

RESOLUTION/NEW STATE
  actor: HERO + owner — Kavi hands it back. The owner's relief is immediate and specific to
    THIS object, not a new friendship being formed.
  (Note: the return is a consequence of solving the mystery, not the plot engine — the owner
  does not appear until the mystery is already solved, keeping the payoff on the discovery
  itself rather than on a relationship being built.)

MINIMUM STORY SPINE
  1) Kavi finds the object, temptation present (opening + want)
  2) initials found — object gets an identity (progression)
  3) initials matched to a known regular (progression, escalating specificity)
  4) memory of yesterday's search reframes everything (turning point)
  5) Kavi returns it, owner's relief (ending consequence)
  Every event here is load-bearing — this is the tightest spine of the set; no safe compression
  point without losing the "reframe" mechanic that defines F02.
```

**Acceptance test**
1. Real children's story? Yes.
2. Reason to keep reading? Yes — "whose is it" then "will Kavi find them" are both real.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? The owner's only action (searching
   yesterday) is reported through Kavi's memory, not shown live — see Part C fragility note on
   this exact pattern.
5. Form genuinely visible? Yes, and it is the situation explicitly flagged in the earlier stress
   test as the closest call to F04 — see Part C.
6. Emotional change earned? Yes — torn to clear, driven by the object gaining a specific person's
   identity, not by an appeal to "the right thing to do."
7. Compressible to 50–70 words? Yes, but with less slack than the other plans (see spine note).
8. Removing any event leaves a hole? Yes, all 4 events plus the resolution are load-bearing.

---

### 4. SIT166 — New classmate sitting alone — F04 (Connection) — 2 characters

```
FORM: F04 — The Connection Journey

STORY ESSENCE
  emotionalTruth: Waiting to feel brave enough is itself a way of leaving someone alone.
  storyQuestion: Will Kavi actually go over, and what happens when they do?
  coreChange: A stranger sitting alone becomes a specific person Kavi knows something about.
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters:
    - role: "new classmate"
      relationshipToHero: not yet known to Kavi at the story's open
      want: (initially assumed by Kavi to be "wants someone else to make the first move";
        actually revealed to be "trying to look like they don't need anyone to")
      narrativeFunction: the other half of the connection arc — has their own interior state
        that Kavi is wrong about at first

CHARACTER WANTS
  heroWant: Help the new classmate feel less alone.
  supportingWants: classmate wants to seem okay, not obviously in need of rescuing.

OPENING STATE
  situation: Break time. Everyone else already has somewhere to be. The new classmate sits alone
    with their lunch, looking around like they're waiting for someone.
  assumption: (F04 field, renamed from belief per LOCKED SCHEMA — a narrow assumption about the
    OTHER character, not a world-level belief) Kavi assumes the classmate is waiting for someone
    to invite them over.

HERO WANT: Help the new classmate feel less alone, without making it awkward for either of them.

EVENT CHAIN
  EVENT 1 [ENCOUNTER]         actor: HERO — Kavi walks over and sits down nearby, says hi.
                                newInfo: Kavi has acted on the assumption instead of just observing it.
  EVENT 2 [INITIAL_RESPONSE]  actor: classmate — The classmate gives a short, closed-off "hi" back
                                and looks back down at their lunch — not the relieved welcome Kavi
                                expected.
                                newInfo: the assumption doesn't hold; something else is going on.
  EVENT 3 [REVEAL]            actor: classmate — Kavi asks a plain question ("is this seat okay?")
                                and the classmate admits, a little embarrassed, that they'd rather
                                not look like they need help finding people.
                                newInfo: this is a reveal about the classmate specifically — not
                                loneliness the way Kavi assumed, but pride/self-consciousness about
                                looking like they need rescuing.
  EVENT 4 [DEEPER_NOTICE]     actor: HERO — Kavi realizes the classmate doesn't want to be a
                                project — they want to just be included like it's normal, not like
                                a kindness.
                                newInfo: this changes what Kavi does next, not just what Kavi feels.
  EVENT 5 [CHANGED_RESPONSE]  actor: HERO — Instead of continuing the "checking in on you" tone,
                                Kavi just starts talking about something ordinary — a show, a game
                                — the way Kavi would with anyone else at the table.

TURNING POINT
  trigger: EVENT 3→4 — the reveal about the classmate's actual discomfort (being treated as
    someone in need of rescuing) recontextualizes Kavi's whole approach.
  statement: Kavi understood what the classmate actually needed — to not be singled out — not
    what Kavi had assumed they needed.

NEW CHOICE/ACTION: Kavi drops the "checking on you" tone entirely and just talks normally,
  treating the classmate as already-included rather than newly-rescued.

EMOTIONAL CHANGE
  startingState (Kavi): shy but determined, assuming kindness means visible rescue.
  changedState (Kavi): understanding that kindness here means normalcy, not attention.

RESOLUTION/NEW STATE
  actor: HERO + classmate — By the end of break, the classmate is laughing at something Kavi
  said, sitting a little less braced than before — demonstrated relationally, through the two of
  them talking normally, not through Kavi's internal realization alone.

MINIMUM STORY SPINE
  1) Kavi notices the classmate alone, goes over (want + first action)
  2) classmate's response doesn't match Kavi's assumption (complication)
  3) the reveal — classmate doesn't want to look rescued (turning point material)
  4) Kavi changes approach to ordinary conversation (new choice)
  5) classmate visibly relaxes, talking normally (ending consequence, relational)
  All 5 are load-bearing; this is a tight F04 spine with no safe cut.
```

**Acceptance test**
1. Real children's story? Yes.
2. Reason to keep reading? Yes — "will Kavi's kindness actually land" is a real, non-obvious question.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? Yes — the classmate's short answer and
   later admission are their own actions, not just things that happen to them.
5. Form genuinely visible? Yes — two distinct stated wants at the open, INITIAL_RESPONSE based
   on a misreading, REVEAL is specifically about the other character, CHANGED_RESPONSE is
   concrete, RESOLUTION is relational.
6. Emotional change earned? Yes, directly from the reveal.
7. Compressible to 50–70 words? Yes.
8. Removing any event leaves a hole? Yes, throughout.

---

### 5. SIT083 — Friend got a new toy — F03 (Shift in Seeing) — 2 characters

```
FORM: F03 — The Shift in Seeing

STORY ESSENCE
  emotionalTruth: The newest thing isn't automatically the best thing — it's just the least tested one.
  storyQuestion: Will the new toy actually turn out to be as good as it looks?
  coreChange: "Newest = best" stops being an automatic belief.
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters:
    - role: "friend"
      relationshipToHero: classmate/friend who owns the new toy
      want: to enjoy the new toy (though it turns out to be complicated by anxiety about it — see EVENT 3)
      narrativeFunction: the toy's owner; provides the OTHER_PERSPECTIVE beat, but the story stays
        about Kavi's belief, not about repairing anything between them (no rupture exists to repair —
        this is deliberately a case where no obstacle/antagonist is needed for the arc to work)

CHARACTER WANTS
  heroWant: Feel as excited as everyone else seems to feel about the new toy.
  supportingWants: friend wants to enjoy the new toy without it getting damaged.

OPENING STATE
  situation: The new toy comes out of its box at school. Everyone crowds around it. Kavi looks at
    their own toy in their bag and it suddenly looks less special.
  belief: The newest, shiniest thing is automatically the best thing. (explicit, F03-mandatory)

HERO WANT: Feel as excited as everyone else does about the new toy — or get one of their own.

EVENT CHAIN
  EVENT 1 [EVIDENCE]          actor: HERO — Kavi watches everyone crowd around the new toy;
                                Kavi's own toy, by comparison, suddenly looks boring.
                                newInfo: this appears to confirm the belief immediately.
  EVENT 2 [CONTRADICTION]     actor: (ambient/group) — Ten minutes later, half the group has
                                already wandered off, bored of the new toy already.
                                newInfo: "newest" didn't hold everyone's interest the way it should
                                have if the belief were fully true.
  EVENT 3 [OTHER_PERSPECTIVE] actor: friend — Kavi notices the friend anxiously guarding the toy,
                                worried about it getting broken or lost, not actually playing freely
                                with it.
                                newInfo: this is new information about the FRIEND's experience of
                                owning the "best" thing — it's not simply enjoyable, it's a source
                                of worry.
  EVENT 4 [BELIEF_UNCERTAIN]  actor: HERO — Kavi isn't sure anymore whether "newest" was ever the
                                same thing as "most enjoyed" — and sits with not knowing for a beat.
                                newInfo: the uncertainty itself is new — Kavi hasn't resolved it yet.
  EVENT 5 [REVEALING MOMENT]  actor: HERO — Kavi goes back to their own worn, familiar toy and
                                realizes they've never once worried about it getting damaged —
                                they just play.
                                newInfo: this is the internally felt realization, arising from
                                Kavi's own direct comparison, not delivered by the friend.

TURNING POINT
  trigger: EVENT 3→5 — the friend's anxiety (event 3) sits unresolved through event 4, then
    resolves internally in event 5 via Kavi's own toy.
  statement: "The new thing isn't more fun — it's just more fragile."

NEW CHOICE/ACTION: Kavi starts a game with their own familiar toy instead of waiting for a turn
  with the new one.

EMOTIONAL CHANGE
  startingState: Kavi's own things suddenly feel lesser by comparison.
  changedState: Kavi's own things feel, specifically, freer — genuinely reassessed, not just
  defensively reasserted.

RESOLUTION/NEW STATE: Others drift over and join Kavi's game — shown through action (kids moving
  toward Kavi, not toward the new toy), not narrated as "Kavi learned that things don't matter."

MINIMUM STORY SPINE
  1) new toy arrives, Kavi's belief seems confirmed (opening + belief)
  2) group interest fades fast (contradiction)
  3) friend's anxiety about the toy (other perspective — the load-bearing beat; must not be cut)
  4) uncertainty holds for a beat (belief uncertain)
  5) Kavi's own toy reassessed, turning point (revealing moment)
  6) Kavi plays, others join (ending consequence)
  Event 4 (BELIEF_UNCERTAIN) is the safest compression point if Phase 8 needs to shorten —
  it can be folded into event 5 without losing the arc, since the "sitting with uncertainty"
  can be implied rather than stated as a separate beat.
```

**Acceptance test**
1. Real children's story? Yes.
2. Reason to keep reading? Yes — the friend's private anxiety (event 3) is a genuine surprise.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? The friend's anxious guarding is their
   own visible behavior, giving them real presence despite a small role.
5. Form genuinely visible? Yes — belief stated, evidence-confirms precedes contradiction,
   uncertainty holds for a beat, turning point is internal, resolution is shown via action.
6. Emotional change earned? Yes.
7. Compressible to 50–70 words? Yes (event 4 is the safe cut, noted above).
8. Removing any event leaves a hole? Only event 4 is a soft cut; 1, 2, 3, 5, 6 are load-bearing.

---

### 6. SIT051 — Close friend moved to another city — F03 (Shift in Seeing) — 2 characters, friend offstage

```
FORM: F03 — The Shift in Seeing

STORY ESSENCE
  emotionalTruth: Distance changes a friendship's rhythm, not its realness.
  storyQuestion: Is the friendship actually over, or does it just look that way right now?
  coreChange: "No daily contact" stops meaning "friendship over."
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters:
    - role: "friend"
      relationshipToHero: best friend, now living elsewhere
      want: to stay connected too, though this isn't confirmed to Kavi until EVENT 2
      narrativeFunction: present only through a single concrete action (a message) — kept
        deliberately minimal and offstage so this stays Kavi's belief-shift story, not a plot
        that depends on the friend performing reassurance

CHARACTER WANTS
  heroWant: Keep the friendship exactly as it was.
  supportingWants: friend wants the friendship to continue too (inferred, confirmed lightly by
    the message, never stated outright — kept minimal on purpose)

OPENING STATE
  situation: One week since the move. No messages have come. The walk to school now has one
    missing person in it.
  belief: If you can't see someone every day, the friendship is basically over. (explicit, F03-mandatory)

HERO WANT: Keep the friendship exactly the way it was before the move.

EVENT CHAIN
  EVENT 1 [EVIDENCE]          actor: HERO — A full week of silence. The belief seems confirmed.
                                newInfo: the silence itself is new data, supporting the belief.
  EVENT 2 [CONTRADICTION]     actor: friend — A message finally arrives — not an apology for the
                                silence, but an unprompted photo of something that made the friend
                                think of Kavi.
                                newInfo: contact resumed, and not in the shape Kavi expected (no
                                apology, just spontaneous thought-of-you).
  EVENT 3 [OTHER_PERSPECTIVE] actor: HERO — Kavi realizes the friend has been building a new daily
                                routine too — school, new streets, new faces — and that this
                                doesn't erase the old routine, it just runs alongside it, slower.
                                newInfo: a fact about the friend's life Kavi hadn't considered —
                                their silence wasn't about Kavi at all.
  EVENT 4 [BELIEF_UNCERTAIN]  actor: HERO — Kavi sits with not being sure anymore whether "less
                                often" really means "less real."
                                newInfo: genuine unresolved uncertainty, held for a beat.
  EVENT 5 [REVEALING MOMENT]  actor: HERO — Kavi finds an old photo of the two of them and
                                realizes the friendship never lived in the daily-ness — it lives
                                in moments like this one, which still exist and still count.

TURNING POINT
  trigger: EVENT 2 (unprompted, thought-of-you contact) through EVENT 5 (the old photo) —
    together they dismantle the "daily contact = real" equation.
  statement: "Maybe a friendship doesn't need to happen every day to still be real."

NEW CHOICE/ACTION: Kavi sends something back — not an urgent catch-up message, just something
  small and ordinary, the way they used to talk.

EMOTIONAL CHANGE
  startingState: certain the silence means the friendship is ending.
  changedState: able to hold "quieter" and "still real" as true at the same time.

RESOLUTION/NEW STATE: A slower, occasional rhythm of messages starts — different from before,
  and still recognizably them.

MINIMUM STORY SPINE
  1) a week of silence, belief seems confirmed (opening + belief)
  2) unexpected message arrives (contradiction)
  3) Kavi realizes the friend has a whole new routine too (other perspective)
  4) uncertainty held (belief uncertain)
  5) old photo — realization (turning point)
  6) Kavi sends something back, new rhythm begins (ending consequence)
  Event 3 and 4 are adjacent and could compress to one beat if Phase 8 needs the room; 1, 2, 5, 6
  are load-bearing.
```

**Acceptance test**
1. Real children's story? Yes.
2. Reason to keep reading? Yes — the silence in event 1 creates real tension; whether the photo
   means anything is a genuine open question.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? The friend's one concrete action
   (sending the photo) is load-bearing and is theirs, not narrated through Kavi's assumption.
5. Form genuinely visible? Yes — belief stated, evidence-confirms first, uncertainty held,
   internal turning point, resolution shown via action (sending something back).
6. Emotional change earned? Yes.
7. Compressible to 50–70 words? Yes.
8. Removing any event leaves a hole? Mostly yes; 3/4 are the soft compression pair.
```
(Note: this plan closely tracks the earlier-tested version of SIT051 in `tmp_phase7b_spec_and_test.md`
— reused deliberately to confirm the 11-part expansion doesn't distort a plan that already passed
the simpler schema; no contradiction was found.)
```

---

### 7. SIT168 — Group project, everyone has different ideas — F01 (Trying) — 4 characters

```
FORM: F01 — The Journey of Trying

STORY ESSENCE
  emotionalTruth: A shared idea can be better than my idea, but I have to want that too, not just accept it.
  storyQuestion: Can the group actually make something together, or is this just going to be a fight?
  coreChange: "My idea has to win" becomes "the idea that grows from all of ours is the one worth having."
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters:
    - role: "classmate A"
      relationshipToHero: project groupmate
      want: wants their own specific idea chosen
      narrativeFunction: represents the first competing idea Kavi has to actually engage with
    - role: "classmate B"
      relationshipToHero: project groupmate
      want: wants a third, different idea chosen
      narrativeFunction: represents the second competing idea — establishes this is a real
        three-way disagreement, not a two-person standoff
    - role: "classmate C"
      relationshipToHero: project groupmate
      want: mostly wants the arguing to stop, doesn't strongly favor any one idea
      narrativeFunction: the group's frustration barometer — their reaction is what tells Kavi
        the current approach (competing ideas) isn't working, before Kavi figures out why

CHARACTER WANTS
  heroWant: Get an idea the whole group can be proud of, starting with Kavi's own idea.
  supportingWants: classmate A wants their idea picked; classmate B wants a different idea
    picked; classmate C just wants it to stop feeling like a fight.

OPENING STATE
  situation: Kavi puts an idea on the table. Classmate A shakes their head immediately.
    Classmate B has a completely different idea. The table is covered in competing plans and
    nobody is listening to anybody.
  (no belief field — LOCKED SCHEMA: F01 carries no belief/assumption field; belief present in
    Phase 6 data as background input only.)

HERO WANT: Get Kavi's own idea chosen so the group can finally move forward.

EVENT CHAIN
  EVENT 1 [ATTEMPT]     actor: HERO — Kavi explains their idea again, louder and more
                          convincingly this time, sure that clearer explaining is the fix.
                          newInfo: none — same strategy, different volume; ruled out.
  EVENT 2 [CONSEQUENCE] actor: classmate A + B — Both push back harder, each repeating their
                          own idea instead of engaging with Kavi's. Classmate C sighs and starts
                          doodling, checked out.
                          newInfo: convincing louder isn't working — and it's actively costing
                          the group's attention (classmate C disengaging).
  EVENT 3 [ATTEMPT]     actor: HERO — Kavi tries a vote instead — quick, simple, majority wins.
                          newInfo: a genuinely different strategy (structural, not persuasive).
  EVENT 4 [CONSEQUENCE] actor: classmate A + B — The vote ties, one for each idea, with
                          classmate C abstaining entirely. Nothing is resolved, and now it feels
                          more like a contest with a loser coming.
                          newInfo: voting solved the wrong problem — the group doesn't need a
                          winner, they need to stop needing one.
  EVENT 5 [ATTEMPT]     actor: HERO — Kavi asks a different question out loud: "what does each
                          idea actually have that's good?" — instead of asking whose idea wins.
                          newInfo: this is the first attempt aimed at combining rather than choosing.
  EVENT 6 [CONSEQUENCE] actor: classmate A + classmate B — Both name the part of their own idea
                          they like best, without needing the whole thing accepted. Classmate C
                          perks back up and adds a small idea of their own for the first time.
                          newInfo: the group is participating instead of competing — visible shift.

TURNING POINT
  trigger: EVENT 5→6 — asking "what's good in each" instead of "which one wins" changes the
    group's whole behavior, including classmate C re-engaging.
  statement: "I don't have to make my idea win — I have to help us build the idea none of us had alone."

NEW CHOICE/ACTION: Kavi starts sketching a combined version live, pulling one piece from each
  person's idea and asking the group to add to it as it goes.

EMOTIONAL CHANGE
  startingState: certain that the group project only works if Kavi's idea gets chosen.
  changedState: genuinely invested in the combined idea, not as a consolation but as something better.

RESOLUTION/NEW STATE
  actor: HERO + classmate A + classmate B + classmate C — All four contribute to the final
  sketch, actively, at the same time — shown through the group physically leaning over the same
  page, not narrated as "they learned to work together."

MINIMUM STORY SPINE
  1) three competing ideas, nobody listening (opening + stakes)
  2) louder-explaining attempt fails, group checks out further (attempt 1 + escalating consequence)
  3) voting attempt fails differently (attempt 2 + different consequence — must be kept distinct
     from attempt 1, this is the strategy-must-differ rule)
  4) "what's good in each" attempt works (turning point attempt)
  5) group builds combined idea together (ending consequence, all 4 characters visibly acting)
  Removing event 3 (the vote) would still leave a working 2-attempt F01 arc per the situation's
  own severity being moderate, not high — flagged as the safe compression point if Phase 8 needs
  a shorter 3-classmate story without cutting a character.
```

**Acceptance test**
1. Real children's story? Yes.
2. Reason to keep reading? Yes — will the group actually resolve this, or will it stay a fight.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? Yes — this is the strongest 3+ character
   test: classmates A, B, and C each act independently (push back, vote, disengage, re-engage,
   contribute), not merely reacting to Kavi.
5. Form genuinely visible? Yes — 3 distinct attempts differing in strategy (persuade louder →
   vote → ask what's good in each), distinct consequence reasons, reframe-not-moral turning point.
6. Emotional change earned? Yes.
7. Compressible to 50–70 words? Yes, with event 3 as the safe cut (see spine note).
8. Removing any event leaves a hole? Events 1, 2, 5, 6 load-bearing; event 3/4 pair is the
   soft compression point.

---

### 8. SIT089 — New sibling gets all the attention — F04 (Connection) — 3 characters

```
FORM: F04 — The Connection Journey

STORY ESSENCE
  emotionalTruth: Love isn't a fixed amount that gets divided when someone new arrives.
  storyQuestion: Will anyone actually notice Kavi today, and does that even mean what Kavi fears it means?
  coreChange: "Less attention" stops meaning "replaced."
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters:
    - role: "parent (Mama)"
      relationshipToHero: mother, currently occupied with the new baby
      want: to care for the new baby right now, and — though Kavi doesn't yet realize it — to
        make sure Kavi still feels included
      narrativeFunction: carries the REVEAL — the parent's own divided attention (baby + Kavi)
        is the misread Kavi has to update
    - role: "new sibling (baby)"
      relationshipToHero: newborn sister/brother
      want: (no want of its own at this age — included in cast only because the storySeed
        centers the baby's presence; explicitly NOT given agency it can't plausibly have)
      narrativeFunction: the physical center of attention that Kavi is comparing themselves
        against; deliberately given no independent action, since a newborn cannot act with
        intent — keeping this honest rather than forcing artificial "baby agency"

CHARACTER WANTS
  heroWant: Have someone notice Kavi and what they made.
  supportingWants: Mama wants to finish feeding the baby and also doesn't want Kavi to feel
    forgotten — she just hasn't had a free hand yet.

OPENING STATE
  situation: Kavi stands beside the sofa holding a picture they made. Mama is feeding the baby.
    Papa is taking photographs of the baby. Kavi waits for someone to look up.
  assumption: The new baby has replaced me. (F04 field, renamed from belief per LOCKED SCHEMA —
    an assumption about the parent's attention specifically, not a world-level belief)

HERO WANT: Get someone — anyone — to notice the picture Kavi made.

EVENT CHAIN
  EVENT 1 [ENCOUNTER]         actor: HERO — Kavi holds the picture up a little higher, closer to
                                Mama's line of sight, waiting.
                                newInfo: Kavi has acted on the assumption (that visibility = being
                                noticed) instead of just standing back.
  EVENT 2 [INITIAL_RESPONSE]  actor: Mama — Mama gives a quick, distracted "that's lovely, sweetie"
                                without really looking, eyes still on the baby.
                                newInfo: confirms Kavi's fear on the surface — but see event 3.
  EVENT 3 [REVEAL]            actor: Mama — A few minutes later, once the baby settles, Mama
                                actually turns fully around, sits Kavi down, and asks to hear the
                                whole story behind the picture — apologizing for the distracted
                                answer earlier, explaining she just needed both hands free first.
                                newInfo: this reveals something about MAMA specifically — the
                                distracted response was about the baby's momentary needs, not
                                about Kavi mattering less.
  EVENT 4 [DEEPER_NOTICE]     actor: HERO — Kavi realizes Mama's attention was full, not divided
                                by choice — it just had to go somewhere first, and then it came back.
                                newInfo: reframes "less attention right now" as temporary, not
                                permanent or comparative.
  EVENT 5 [CHANGED_RESPONSE]  actor: HERO — Instead of holding the picture up and waiting
                                silently next time, Kavi asks directly: "can I show you something
                                when the baby's settled?" — naming the wait instead of just
                                standing through it.

TURNING POINT
  trigger: EVENT 3→4 — Mama's turn-around and explanation recontextualizes the earlier distracted
    response.
  statement: Kavi understood that Mama's attention had to go somewhere first, not that it had
    stopped coming to Kavi at all.

NEW CHOICE/ACTION: Kavi starts asking for attention directly and specifically, instead of
  silently waiting and privately concluding they've been replaced.

EMOTIONAL CHANGE
  startingState: certain the baby has replaced Kavi in the family's attention.
  changedState: understanding that attention comes in turns, not in a fixed, shrinking amount.

RESOLUTION/NEW STATE
  actor: HERO + Mama — Mama sits with Kavi and the picture, fully present, baby now asleep in
  the next room — demonstrated relationally through the two of them sitting together, not through
  Kavi deciding internally to feel better.

MINIMUM STORY SPINE
  1) Kavi waits, unnoticed, belief present (opening + belief)
  2) distracted response seems to confirm it (initial response)
  3) Mama turns around fully, explains (reveal — load-bearing, cannot compress)
  4) Kavi reframes what "distracted" meant (deeper notice)
  5) Kavi asks directly next time; Mama sits with Kavi (changed response + resolution)
  All 5 are load-bearing; the baby's presence (established in OPENING STATE) doesn't need its
  own event since it correctly has no independent agency — flagged in Part C.
```

**Acceptance test**
1. Real children's story? Yes — a very common, very real family moment.
2. Reason to keep reading? Yes — will Mama notice, and what does the distracted answer actually mean.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? Mama's actions (distracted response, then
   turning around and explaining) are hers and load-bearing; the baby correctly has none.
5. Form genuinely visible? Yes — two characters (Kavi + Mama) with distinct, stated wants,
   INITIAL_RESPONSE is a misreading, REVEAL is about Mama specifically, CHANGED_RESPONSE concrete,
   RESOLUTION relational.
6. Emotional change earned? Yes.
7. Compressible to 50–70 words? Yes.
8. Removing any event leaves a hole? Yes throughout — this is a tight 5-event spine.

---

### 9. SIT099 — Noisy, overcrowded mall — F05 (Unexpected Turn) — 2 characters

```
FORM: F05 — The Unexpected Turn

STORY ESSENCE
  emotionalTruth: Needing to leave a fun place isn't failing at having fun.
  storyQuestion: Can Kavi make it through the outing as planned, or does the plan need to change?
  coreChange: "The plan has to survive" becomes "a different plan can still be a good outing."
  minimumStorySpine: see §12

CAST
  hero: Kavi
  supportingCharacters:
    - role: "parent"
      relationshipToHero: accompanying adult on the outing
      want: wants Kavi to enjoy the trip, and is watching for signs Kavi's struggling
      narrativeFunction: provides the RESTORE_ATTEMPT partner and ultimately the one who offers
        the adapted plan — without the parent, Kavi (a young child) finding a quiet café alone
        would strain plausibility; this cast size is set by what the situation realistically needs

CHARACTER WANTS
  heroWant: Enjoy the outing the way it was supposed to go.
  supportingWants: parent wants the same outcome and is prepared to adapt once it's clear the
    plan isn't working.

OPENING STATE
  situation: Kavi walks into the mall eager for the planned outing — new sights, maybe a treat.
  (no belief field — LOCKED SCHEMA: F05 carries no belief/assumption field; an explicit PLAN
    replaces it.)
  plan: Visit the toy shop first, like always, then get a treat.

HERO WANT: Enjoy the outing the way it was supposed to go.

EVENT CHAIN
  EVENT 1 [EXPECTATION] actor: HERO — Kavi walks in ready for the familiar, planned fun.
                          newInfo: establishes the plan concretely (toy shop first).
  EVENT 2 [DISRUPTION]  actor: (ambient/mall) — The noise and crowd are far more than expected —
                          overlapping music, voices, a trolley clattering.
                          newInfo: first disruption, ambient/sensory in kind.
  EVENT 3 [REACTION]    actor: HERO — Kavi tries to push through it, sticking to the plan, heading
                          for the toy shop anyway.
                          newInfo: shows Kavi's first coping strategy — endure and continue.
  EVENT 4 [DISRUPTION]  actor: (ambient/mall) — A sudden, loud announcement blares overhead —
                          a second, different KIND of disruption (sudden/acute vs. the first's
                          ongoing/ambient).
                          newInfo: this is not a repeat of event 2 — different kind, ruled required
                          by the F05 hard rule.
  EVENT 5 [RESTORE_ATTEMPT] actor: HERO + parent — Kavi covers their ears and, with the parent's
                          encouragement, tries pushing on toward the toy shop anyway, determined
                          to keep the original plan alive.
                          newInfo: a genuine, real attempt to restore the original plan, not a
                          token gesture.
  EVENT 6 [RESTORE_FAILS] actor: HERO — It doesn't work. The plan-as-designed isn't survivable in
                          this much noise; Kavi's overwhelm keeps climbing, not settling.
                          newInfo: confirms the restore attempt genuinely failed, not just paused.

TURNING POINT
  trigger: EVENT 5→6 — the failed restore attempt, not a fresh idea from nowhere.
  statement: Kavi stops trying to push through and asks the parent to find somewhere quieter
    instead — reframed as a different plan, not a failure of the original one.

NEW CHOICE/ACTION
  actor: HERO + parent — Together they head for a quiet corner café instead of the toy shop.

EMOTIONAL CHANGE
  startingState: eager, then increasingly overwhelmed and gripping too hard to the original plan.
  changedState: able to ask for a change and feel it as adaptation, not defeat.

RESOLUTION/NEW STATE: The outing doesn't end the way it was supposed to — it ends with a calm
  ten minutes at the café that turns out to be the actual best part of the day, materially
  different from the original toy-shop plan.

MINIMUM STORY SPINE
  1) plan stated: toy shop first (opening + plan)
  2) ambient disruption (crowd/noise) — first disruption
  3) Kavi pushes through — reaction (must be present; without it, restore-attempt in event 5 has
     no contrast)
  4) second, different-kind disruption (announcement) — required by the F05 "≥2 disruptions
     differing in kind" rule; cannot be cut
  5) genuine restore attempt that fails — required by the F05 "restore-attempt that actually
     fails" rule; cannot be cut
  6) adaptation — quiet café instead — ending consequence, materially different from the plan
  This is the least compressible plan in the set: every event is required by an explicit F05
  hard structural rule, not just good storytelling. Flagged in Part C as a structural note —
  F05 spines resist compression more than other Forms because so much of the Form's identity
  IS the event count and kind-differentiation.
```

**Acceptance test**
1. Real children's story? Yes — sensory overwhelm is one of the most universal experiences in
   the target age range.
2. Reason to keep reading? Yes — whether Kavi can push through stays genuinely uncertain.
3. Every event causes/reveals/complicates/changes something? Yes.
4. Characters doing things, not hero doing everything? The parent's actions (encouraging the
   restore attempt, then agreeing to the café) are real and load-bearing, though secondary to Kavi.
5. Form genuinely visible? Yes — explicit plan stated, 2 disruptions differing in kind, genuine
   failed restore attempt, disruptions plausibly connected to the mall/crowd domain (not arbitrary),
   materially different outcome.
6. Emotional change earned? Yes.
7. Compressible to 50–70 words? Yes, but with the least slack of any plan in this set (see spine note).
8. Removing any event leaves a hole? Yes — every event is required by an explicit hard rule.

---

## Part D — Cast-Independence Revalidation (NEW)

Added per Madhurima's locked correction (see LOCKED SCHEMA §3). Purpose: prove, with real
`situations.json` data, that cast size is not restricted by Form. F01 and F02 already prove this
within the original 9 plans (F01: SIT045 at 1 character through SIT168 at 4; F02: SIT143 at 1
character through SIT148 at 2). This Part adds the missing 1-character (or minimal-cast) case for
F03, F04, and F05, each paired against an existing 2+/3-character plan of the same Form already in
Part B.

### D.1 — F03, 1 character: SIT020 — Repeatedly failing a game level

```
FORM: F03 — The Shift in Seeing

STORY ESSENCE
  emotionalTruth: Losing isn't proof I should stop — it's proof I'm still at the hard part.
  storyQuestion: Will Kavi quit, or find out what "stuck" actually means?
  coreChange: "Failing means quit" stops being automatic.

CAST
  hero: Kavi
  supportingCharacters: [] — storySeed names no other party (home, alone with the game); this
    is a genuinely solo belief-shift, not an F03 plan artificially stripped of characters.

OPENING STATE
  situation: Kavi hits the same tricky section for the fourth time. The level restarts, again.
  belief: If I keep failing, I should quit. (F03-mandatory, per Phase 6 falseBeliefText)

HERO WANT: Beat the level before giving up on it for good.

EVENT CHAIN
  EVENT 1 [EVIDENCE]          actor: HERO — Kavi fails the same jump a fourth time.
                                newInfo: appears to confirm "I keep failing = time to quit."
  EVENT 2 [CONTRADICTION]     actor: (ambient) — The failure counter on-screen shows Kavi has
                                gotten one screen further each time, not the same distance.
                                newInfo: the pattern Kavi assumed (no progress) isn't actually true.
  EVENT 3 [OTHER_PERSPECTIVE] actor: (ambient/self) — Kavi replays the run in their head and
                                notices each attempt failed at a slightly later point than the
                                one before — an angle on the run Kavi hadn't been tracking live.
                                newInfo: reframes "failing" as "advancing slowly," without any
                                other character needed to supply the observation.
  EVENT 4 [BELIEF_UNCERTAIN]  actor: HERO — Kavi isn't sure anymore whether "failed again" and
                                "made no progress" are the same thing, and sits with that for a beat.

TURNING POINT
  trigger: EVENT 2→3 — the on-screen progress marker plus Kavi's own replay dismantle the belief.
  statement: "I haven't been failing in the same place — I've been failing further along each time."

NEW CHOICE/ACTION: Kavi tries the level once more, this time timing the jump differently at the
  exact point identified in EVENT 3, instead of repeating the same timing as before.

EMOTIONAL CHANGE
  startingState: convinced repeated failure means it's time to stop.
  changedState: reads "failed again" as "closer than before," not as a verdict.

RESOLUTION/NEW STATE: Kavi clears the section that had been stopping them — shown by the level
  continuing past that point, not narrated as "Kavi learned perseverance."

Solo-story QA (rule 3a): satisfied — the turning point is a STRATEGY change (different jump
  timing at the identified point), not "tried harder" or "waited." Confirms 3a applies cleanly
  to an F03 plan, not only the F01/F02 plans it was first observed on.
```

**Pairing note:** SIT020 (F03, 1 character) alongside SIT083/SIT051 (F03, 2 characters each,
Part B §5–6) shows F03's EVIDENCE→CONTRADICTION→OTHER_PERSPECTIVE→BELIEF_UNCERTAIN mechanism
holding with zero supporting characters (OTHER_PERSPECTIVE realized through an ambient game
signal and Kavi's own replay) and with a supporting character supplying it (SIT083's friend).
Same Form, same locked vocabulary, cast size genuinely different and situation-driven in both.

### D.2 — F04, minimal cast (hero + 1, mostly offstage): SIT050 — Missing a parent who travels often

```
FORM: F04 — The Connection Journey

STORY ESSENCE
  emotionalTruth: Love doesn't shrink just because the person carrying it is far away.
  storyQuestion: Is Mama's love actually smaller right now, or does it just feel that way?
  coreChange: "Away" stops meaning "less loved."

CAST
  hero: Kavi
  supportingCharacters:
    - role: "parent (Mama)"
      relationshipToHero: mother, currently traveling
      want: to stay connected to Kavi despite the distance
      narrativeFunction: carries the REVEAL, entirely through a single concrete action (a video
        call/voice note) rather than an on-page presence — kept minimal on purpose, the same
        pattern already used for the friend in SIT051 (Part B §6)

OPENING STATE
  situation: Dinner again with one empty chair. Kavi has counted the empty-chair dinners this week.
  assumption: (F04 field) Being away this much means Mama's attention/love has gotten smaller.

EVENT CHAIN
  EVENT 1 [ENCOUNTER]         actor: HERO — Kavi looks at the empty chair again, same as every
                                night this week.
  EVENT 2 [INITIAL_RESPONSE]  actor: (ambient) — No call comes at the usual time; the silence
                                seems to confirm the assumption.
  EVENT 3 [REVEAL]            actor: Mama (offstage, via voice note) — A message arrives late,
                                explaining the delay was a work meeting, plus a made-just-for-Kavi
                                detail (a photo of something that reminded her of Kavi).
                                newInfo: a fact about Mama's actual state (busy, not distant) that
                                Kavi's assumption didn't have.
  EVENT 4 [DEEPER_NOTICE]     actor: HERO — Kavi realizes the delay was about the day's schedule,
                                not about caring less.
  EVENT 5 [CHANGED_RESPONSE]  actor: HERO — Kavi records a voice note back immediately instead of
                                waiting to feel reassured first.

RESOLUTION/NEW STATE: A small, ordinary exchange of messages becomes the new evening rhythm,
  materially different from the empty-chair silence at the open.
```

**Pairing note and flagged extrapolation:** F04's own STORY ESSENCE (a connection with another
person) makes a genuinely 0-supporting-character F04 plan implausible on content grounds — there
has to be *someone* to connect with, even if entirely offstage. That is a constraint coming from
what F04 is about, not from Form restricting cast size; it does not contradict LOCKED SCHEMA §3.
So instead of a fabricated 0-character F04 example, D.2 uses the minimal real case
`situations.json` supports: hero + 1 mostly-offstage character (SIT050), contrasted against
SIT089 (Part B §8, F04, 3 characters: Mama + baby). Both run the identical ENCOUNTER→
INITIAL_RESPONSE→REVEAL→DEEPER_NOTICE→CHANGED_RESPONSE vocabulary; only cast size and how the
REVEAL is staged (offstage message vs. on-page turn-around) differ, and both differences trace to
the situation, not the Form. Flagging this as the one combination where real data doesn't cleanly
support the strict "1 character" reading of the task, and noting the extrapolation: whether SIT050
"needs" only 1 supporting character (Mama) rather than 0 or 2 was a judgment call, made per the
corrected rule that this is resolved independently of Form and from what the situation realistically
supports, not fabricated beyond it.

### D.3 — F05, 1 character: SIT014 — Game crashes or internet lags during a win

```
FORM: F05 — The Unexpected Turn

STORY ESSENCE
  emotionalTruth: A setback that erases progress isn't the same as a setback that erases me.
  storyQuestion: Is the progress really gone, or is there another way through?
  coreChange: "One setback ruins everything" stops being automatic.

CAST
  hero: Kavi
  supportingCharacters: [] — storySeed names no other party (Kavi alone with the game); no
    parent/helper is implied by this situation the way SIT099's mall trip implies one.

OPENING STATE
  situation: Kavi is one move from winning when the screen freezes.
  plan: Finish the game, keep the progress, win.

EVENT CHAIN
  EVENT 1 [EXPECTATION]     actor: HERO — Kavi lines up the final, winning move.
  EVENT 2 [DISRUPTION_1]    actor: (ambient/device) — The screen freezes completely — an acute,
                              sudden kind of disruption.
  EVENT 3 [REACTION]        actor: HERO — Kavi taps and waits, hoping the freeze passes on its own,
                              still trying to keep the original plan (finish this exact run) alive.
  EVENT 4 [DISRUPTION_2]    actor: (ambient/device) — The game restarts to the title screen —
                              a different kind of disruption from the freeze (loss of state, not
                              just a pause).
  EVENT 5 [RESTORE_ATTEMPT] actor: HERO — Kavi reopens the save file, genuinely hoping the
                              near-win was auto-saved.
  EVENT 6 [RESTORE_FAILS]   actor: HERO — It wasn't saved. That specific run, that specific
                              near-win, is confirmed gone.

TURNING POINT
  trigger: EVENT 5→6 — the failed restore attempt confirms the original run can't be recovered.
  statement: Kavi stops trying to get back that exact run and decides to start a fresh one instead.

NEW CHOICE/ACTION: Kavi starts the level over, applying what worked in the near-win instead of
  waiting or refreshing the same frozen screen again.

RESOLUTION/NEW STATE: Kavi reaches the same point faster the second time, using what was learned
  from the run that got lost — a materially different outcome from simply refreshing and waiting.

Solo-story QA (rule 3a): satisfied — the STRATEGY change is "start over applying what was
  learned" rather than "keep tapping the frozen screen" or "wait for it to fix itself."
```

**Pairing note:** SIT014 (F05, 1 character) alongside SIT099 (F05, 2 characters, Part B §9) shows
the same locked EXPECTATION→DISRUPTION→REACTION→RESTORE_ATTEMPT→RESTORE_FAILS→ADAPTATION
sequence, including the required "2 disruptions differing in kind" rule, holding with zero
supporting characters (both disruptions are device/ambient) and with a supporting character
co-acting in RESTORE_ATTEMPT (SIT099's parent). This is the clearest of the three D examples,
since F05's mechanism (a plan meeting the world) has no inherent need for another person the way
F04's does.

### D.4 — Multi-character QA re-check (rule 3b) on existing Part B plans

Applying the new "every supporting character must cause, reveal, challenge, help, change, or be
changed by something meaningful" rule to the three existing multi-character plans named in the
task:

- **SIT148 (Part B §3, F02, owner):** the owner causes nothing and is not challenged, but is
  **helped** (gets the object back) and **is changed** (relief, specifically because the object
  now has a resolved history) by Kavi's action. **Passes.** This is also the plan Part C §1 already
  flags for a different reason (the F02/F04 boundary risk) — that flag is about narrative *weight*
  given to the owner's reaction, not about whether the owner has a function at all; the two checks
  are independent and both currently pass.
- **SIT168 (Part B §7, F01, classmates A/B/C):** classmate A **causes** (introduces the first
  competing idea Kavi must engage with); classmate B **causes** a second, distinct competing idea;
  classmate C **reveals** (their disengagement is what shows Kavi the current approach isn't
  working) and later **is changed** (re-engages, contributes an idea). All three **pass**, and this
  remains the strongest multi-character plan in the set — none of the three is present "for
  variety."
- **SIT089 (Part B §8, F04, Mama + baby):** Mama **reveals** (the REVEAL event) and **helps**
  (turns around, explains, sits with Kavi) — **passes** cleanly. The baby is the harder case: the
  baby's own `narrativeFunction` is explicitly written as having "no independent agency" and takes
  no action in any event. Under rule 3b's literal text (cause/reveal/challenge/help/change/be
  changed), the baby still **passes** through **cause** — the baby's mere physical presence
  (occupying Mama's hands and attention) is the causal force that creates Kavi's entire OPENING
  STATE and want; nothing else in the plan generates the tension. **Flagged as an ambiguity worth
  resolving explicitly**, not left implicit: rule 3b as stated could be read to require the
  character DO something causing/revealing/etc., which the baby never does. The reading applied
  here — that a supporting character can satisfy "cause" through passive, involuntary presence,
  provided that presence is genuinely what the plan's tension turns on — is the one consistent
  with 7B's own existing note on the baby ("deliberately given no independent action, since a
  newborn cannot act with intent — keeping this honest rather than forcing artificial 'baby
  agency'"). Recommend this passive-cause reading be stated explicitly inside rule 3b's text
  itself (see LOCKED SCHEMA §3b above, which already includes this clarification) so a future
  implementer doesn't misread the baby as failing the rule.

### D.5 — World/Setting and Key Object(s) backfill (NEW, §4a validation across all 12 test plans)

Per LOCKED SCHEMA §1 (expanded sequence) and §4a (Key Object narrative-function rule), this
subsection makes explicit, for each of the 12 test plans already in this document (Part B's 9 +
Part D's 3), the World/Setting each story already takes place in, and whether any object already
functioning in that plan qualifies as a Key Object under §4a. Nothing new is invented — every
entry below restates content already present in the plan's OPENING STATE/EVENT CHAIN/CAST above.

| # | Plan | World/Setting (already implicit above) | Key Object(s) under §4a | Verb(s) satisfied |
|---|---|---|---|---|
| B1 | SIT045 — blanket | Kavi's home: bedroom, toy box, garden, car, kitchen, at bedtime | The blanket | searches for, attaches meaning to (comfort object; hero's relationship to it is the whole arc) |
| B2 | SIT143 — litter | Outdoor park bench area, bin nearby | The wrapper(s) | discovers, uses (picks up, disposes of) |
| B3 | SIT148 — found object | The park, same bench, across two consecutive afternoons | The found object (initials scratched into it) | discovers, protects (implicitly, by not discarding it), gives (returns it to the owner) |
| B4 | SIT166 — new classmate | School, break/lunchtime, the lunch table | **None.** This is a purely relational F04 story — no object does narrative work; nothing should be forced in per §4a. |
| B5 | SIT083 — friend's new toy | School, the moment the new toy comes out of its box | Kavi's own (old, familiar) toy | attaches meaning to (Kavi reassesses and re-values it at the turning point); the friend's *new* toy is present as a comparison point but the hero never uses/protects/searches for it, so it does not itself qualify — the functioning Key Object is Kavi's own toy |
| B6 | SIT051 — friend moved away | Kavi's home; the walk to school (now missing a person); asynchronous messages | The old photo of the two of them | discovers (finds it), attaches meaning to (it is the turning-point object) |
| B7 | SIT168 — group project | Classroom, the shared table covered in competing plans | The combined sketch Kavi starts drawing | uses, changes (built live, added to by the group — it's the concrete artifact the resolution turns on) |
| B8 | SIT089 — new sibling | Home living room; the sofa where Mama feeds the baby, Papa photographing nearby | The picture Kavi made | attaches meaning to, gives (shows it to Mama; wanting it seen is the hero want itself) |
| B9 | SIT099 — mall | A noisy, crowded shopping mall; toy shop vs. quiet café | **None.** The story turns on place/plan/sensory environment, not an object — nothing forced in. |
| D1 | SIT020 — game level | Home, alone, in front of the video game | **None.** The game/level is World/Setting, not a discrete object the hero searches for/uses/protects/etc. in the §4a sense; no key object forced in. |
| D2 | SIT050 — parent travels | Home, the dinner table with one empty chair | The voice note / photo message Mama sends (and the one Kavi sends back) | gives, attaches meaning to. **Flagged as a borderline case**, not silently resolved: a digital message is not a physical object in the traditional sense, but it functionally satisfies §4a's verb test (Kavi receives it, attaches meaning to it, then gives one back) and is the plan's literal turning-point artifact — the same category question would apply to SIT089's picture or SIT051's photo if those were sent rather than physically found/shown. Recommend treating "object" in §4a as function-based (does it do one of the eight verbs) rather than strictly physical, but flagging for Madhurima to confirm before this becomes an implementation rule. |
| D3 | SIT014 — game crash | Home, alone, in front of the video game/device | **None.** Same reasoning as D1 — the game/device is World/Setting; the lost "near-win" is a state, not an object; no key object forced in. |

**Result:** 8 of 12 plans have a genuine Key Object under §4a (SIT045, SIT143, SIT148, SIT083,
SIT051, SIT168, SIT089, and the borderline SIT050); 4 of 12 have explicitly none (SIT166, SIT099,
SIT020, SIT014) — consistent with §4a's instruction that absence is the correct, expected outcome
for situations that don't need one, not a gap to fill.

---

## Part C — Boundary Fragility Report

### 1. F02 / F04 boundary — documented as FUTURE T-layer QA rule, NOT part of 7B (see LOCKED SCHEMA)

**Status: Madhurima has decided this is explicitly out of scope for 7B.** Per the LOCKED SCHEMA
section at the top of this document, this pattern is documented as a future template-layer
(T-layer) QA rule for whoever builds template QA later — it is NOT implemented or enforced by
the 7B schema itself. Original stress-test notes preserved below for record.

**Pattern confirmed again, third independent test round.** Across the earlier stress test
(`tmp_phase7_f02_f04_stresstest.md`, 3 situations), the SIT164 five-form comparison
(`tmp_phase7_story_plan_test_SIT164.md`), the simpler-schema 8-situation test
(`tmp_phase7b_spec_and_test.md`, SIT148 flagged), and now this 11-part expansion (SIT148 again,
plus SIT143 and SIT166 as adjacent cases) — the same seam shows up every time a discovered
*object* has a specific, findable *person* attached to it.

- **Where it breaks:** SIT148 (§3 above). The 11-part schema's CAST field makes this sharper,
  not softer — CAST forces you to name the owner as a supportingCharacter with a
  `narrativeFunction`, and the honest function to write is "receives the resolution," which is
  uncomfortably close to "the point of the ending is this relationship." The schema doesn't
  prevent the drift; it just makes the drift more visible when it's about to happen, which is a
  real improvement but not a fix.
- **What holds it in F02, mechanically:** the owner's `narrativeFunction` must read as "endpoint
  of the discovery," not "reason for the discovery." In this plan that meant delaying the
  owner's appearance to the very last event and giving them zero dialogue or interiority beyond
  relief — the moment any warmth or specificity is added to the owner's reaction, the ending
  reads as F04 again.
- **Recommendation carried forward from the earlier test, now doubly confirmed:** this needs an
  explicit template-layer check (T-layer, later), not just a design-layer caution — something
  like "if the last event's actor is a supportingCharacter who didn't appear before the final
  beat, verify the payoff sentence is about the object/mystery, not about the character."

### 2. One-character / multi-character boundary — RESOLVED, see LOCKED SCHEMA at top of document

**Status: closed by Madhurima's decision.** The recommendation below is now the LOCKED
solo-story global rule (see top of document): when `supportingCharacters = 0`, at least one
event must show the hero changing STRATEGY, not just trying harder or relocating or waiting.
Both SIT045 and SIT143 already satisfy this rule as originally written — no event content
required changing. Original stress-test notes preserved below for record.

**New finding, not previously tested at this granularity** (earlier tests didn't examine solo
stories specifically). Two plans here (SIT045, SIT143) are legitimately 1-character stories —
the CHARACTER AGENCY rule ("every major event must identify its actor... describe what that
character does, not merely what happens to them") is trivially satisfiable when there's only
one character, but it's worth naming exactly where it gets thin:

- **Where it's fragile:** in SIT045, events 2, 4, and 6 are all `actor: HERO` reacting to an
  absence (the blanket not being where Kavi looked). "What Kavi does" and "what happens to Kavi"
  blur together in a solo search story, because the environment can't act back. The rule holds
  formally (every event has a HERO actor doing a stated action) but the *spirit* of "acting on
  the world, not just being acted upon" is weaker here than in any multi-character plan in the set.
- **What kept both solo plans honest:** in both SIT045 and SIT143, the turning point comes from
  Kavi changing *strategy* (self-comfort instead of searching; noticing instead of walking past),
  not from an external event resolving things for them. That's the actual test for whether a
  1-character F01/F02 plan is doing real narrative work versus just being a passive description
  of an unlucky search.
- **Recommendation:** when CAST has 0 supportingCharacters, add one explicit check at the
  EVENT CHAIN level: at least one event must show the hero changing STRATEGY, not just changing
  LOCATION or trying again harder in the same way. This is really the F01 "strategy not wording"
  rule generalized to F02's solo case — it should probably be stated once, generally, rather than
  re-derived per Form.

### 3. Belief / no-belief boundary — RESOLVED, see LOCKED SCHEMA at top of document

**Status: closed by Madhurima's decision.** The soft spot identified below is now resolved:
F03 keeps field `belief`; F04's field is renamed to `assumption` and explicitly does not carry
F03's narrative weight; F01/F02/F05 carry no belief/assumption field at all. All plans in Part B
have been updated to match. Original stress-test notes preserved below for record.

**Mostly clean, one soft spot (original finding, now resolved above).** F03 plans (SIT083, SIT051) populate OPENING STATE.belief
cleanly and it's clearly load-bearing. F01 and F02 plans correctly leave it empty without the
plan feeling incomplete. The soft spot is F04:

- **Where it's fragile:** in both F04 plans here (SIT166, SIT089), OPENING STATE.belief is
  populated as "an assumption about the other character," per the rule in Part A. But in
  practice, writing that assumption as a clean, single-sentence belief (the way F03 does) felt
  forced compared to how naturally F03's beliefs sit — F04's "belief" is really more like a
  *prediction* ("Kavi assumes the classmate is waiting for someone to invite them over") than a
  worldview-level belief ("if you can't see someone every day, the friendship is over"). Both
  plans work, but the schema currently reuses the word `belief` for two different granularities
  of thing across F03 and F04, which risks a future generator treating F04's assumption with the
  same weight/ceremony as F03's, over-signaling it in prose.
- **Recommendation:** consider renaming the F04-populated version of this field internally
  (e.g., `assumption` vs. `belief`) at the schema level before this goes to coding, even though
  both currently sit in the same `OPENING STATE.belief` slot. Not urgent enough to block locking
  the design, but worth deciding before T01-T20 rewiring starts, since template code will
  otherwise treat both identically.

---

## Summary (also reported in chat)

9/9 test plans pass their Form's hard structural rules and all 8 acceptance-test questions,
across F01×2, F02×2, F03×2, F04×2, F05×1, with cast sizes from 1 to 4 characters and 9 distinct
emotion groups. No situation required an invented antagonist; SIT143 was run explicitly with
zero obstacle beyond the situation itself, per the task's requirement.

**Schema is now LOCKED (see "LOCKED SCHEMA — FINAL" at top of document).** All 9 plans were
re-checked against the locked belief/assumption split and the new solo-story global rule:
- F04 plans (SIT166, SIT089) — `belief` field renamed to `assumption` in both.
- F01/F02/F05 plans (SIT045, SIT143, SIT148 is F02 with no field either, SIT168, SIT099) — the
  belief field/placeholder removed entirely; no content changes needed beyond the label.
- F03 plans (SIT083, SIT051) — unchanged; `belief` field already correct.
- Solo-story rule (SIT045, SIT143) — both already satisfy "hero changes strategy," confirmed,
  no event changes needed.
- F02/F04 boundary note — documented as a future T-layer QA rule, explicitly not a 7B rule.

All 9/9 plans still pass under the corrected/locked schema. This unblocks 7B implementation,
which is a separate, not-yet-started task.

---

## Summary update — CAST IS FORM-INDEPENDENT correction (this revision)

**Status: applied and revalidated.** Per Madhurima's locked clarification, the schema is corrected
so that no wording implies Forms constrain cast size. Changes made in this revision:

1. LOCKED SCHEMA §3 rewritten from "Solo-story global rule" to "CAST IS FORM-INDEPENDENT," with
   the solo-story rule demoted to a QA sub-rule (§3a, Form-agnostic) and a new multi-character QA
   sub-rule added (§3b: every supporting character needs a narrative function — cause, reveal,
   challenge, help, change, or be changed).
2. LOCKED SCHEMA §4 (new): ingredients (object/world/symbol/relationship/situation) are
   Form-independent the same way CAST is — resolved from Phase 6/story planning, not gated by
   Form. Cross-referenced against, and confirmed consistent with, `tmp_phase7e_locked_decisions.md`
   Decision 4's `productionInputs` handoff — no duplication or contradiction found.
3. Part A's character-count rule reworded to remove any residual implication tied to specific
   situations "being" solo situations rather than the general principle.
4. Part D (new) adds three real-data validation examples — SIT020 (F03, 1 character), SIT050
   (F04, minimal cast), SIT014 (F05, 1 character) — each explicitly paired against an existing
   Part B plan of the same Form at a larger cast size, completing the proof that **all five Forms
   now have a documented 1-character (or, for F04, minimal-cast) and a 2+/3-character realization**:
   - F01: SIT045 (1) / SIT168 (4) — from original set, already valid.
   - F02: SIT143 (1) / SIT148 (2) — from original set, already valid.
   - F03: SIT020 (1, new) / SIT083, SIT051 (2 each) — now valid.
   - F04: SIT050 (1 supporting, minimal, new) / SIT166 (2), SIT089 (3) — now valid, with the one
     flagged extrapolation noted below.
   - F05: SIT014 (1, new) / SIT099 (2) — now valid.
5. Part D §4 re-checks rule 3b against SIT148, SIT168, and SIT089 — all pass; SIT089's baby is
   flagged as an ambiguous edge case (passive presence satisfying "cause") and resolved by reading
   3b to permit involuntary/passive causation, now stated explicitly in §3b itself.

**Ambiguity flagged, not silently resolved:** F04's own content (a story about connecting with
someone) makes a true 0-supporting-character F04 plan implausible — there must be someone to
connect with, even offstage. This is a content constraint from what F04 is *about*, not a
Form-imposed cast restriction, and does not reopen LOCKED SCHEMA §3; Part D §2 documents this
explicitly with the closest real `situations.json` match (SIT050, hero + 1 mostly-offstage
character) rather than fabricating an artificial 0-character F04 example that no real situation
supports.

All five Forms are now validated, via existing-plus-new examples, as supporting cast sizes from
1 (or the closest content-plausible minimum) through 4, with the mechanism (locked event
vocabulary) unchanged across every cast size tested. No T01–T20, Phase 6 data, F01–F05
definitions, Event Planner, or Phase 8/9 files were touched — this remains a documentation-only
correction to `tmp_phase7b_expanded_story_plan_test.md`.

---

## Summary update (this revision) — 7B is now formally LOCKED: full schema, sequence, and rules

**Status: 7B is now formally LOCKED.** Full schema (Part A), the refined planning sequence
(LOCKED SCHEMA §1), and all governing rules (§2 belief/assumption split, §3/§3a/§3b cast
independence and QA, §3c complete-cast-before-events, §4/§4a ingredient independence and Key
Object narrative-function) are locked together as one coherent, non-contradictory package. This
is the final 7B lock; no further revision to this document is expected as work moves to the
template layer (T01–T20).

Changes made in this revision, on top of the already-locked cast-independence correction above:

1. LOCKED SCHEMA §1 rewritten from the old 11-part list to the refined 15-step sequence: FORM →
   STORY ESSENCE → HERO → SUPPORTING CHARACTERS → CHARACTER WANTS/RELATIONSHIPS → WORLD/SETTING →
   KEY OBJECT(S) → OPENING STATE → HERO WANT → EVENTS → TURNING POINT → NEW CHOICE/ACTION →
   EMOTIONAL CHANGE → RESOLUTION/NEW STATE → MINIMUM STORY SPINE — explicitly framed as a
   refinement of Part A's schema (CAST split into HERO + SUPPORTING CHARACTERS; WORLD/SETTING and
   KEY OBJECT(S) promoted from implicit content inside §4 to their own named steps), not a
   competing structure. Part A's field-level rules (event vocabulary, belief/assumption split,
   character-count rule) remain the source of truth and were not altered.
2. New §3c, "Complete-cast-before-events rule," added between §3b and §4, stating Madhurima's
   locked instruction verbatim: Phase 7B must resolve the complete story cast (Hero + Supporting
   Characters + World + Key Object(s)) before event planning, as Form-independent ingredients
   supplied by Phase 6/Blueprint, with Form determining only how they're used. Framed explicitly
   as a direct consequence of, not a duplicate of, §3 and §4 — cross-referenced rather than
   re-argued.
3. New §4a, "Key Object narrative-function rule," added after §4, in the same style as §3a/§3b: a
   Key Object is included only when the plan can name what the hero does with/to it (search for /
   use / protect / discover / lose / give / change / attach meaning to); situations that don't
   need one should have none, not a forced-in object for texture.
4. New Part D §5 backfills World/Setting and Key Object(s)-or-none for all 12 existing test plans
   (Part B's 9 + Part D's 3 cast-independence additions) without inventing new content — 8 of 12
   have a genuine Key Object, 4 of 12 correctly have none, and one case (SIT050's voice-note
   message) is flagged as a borderline "is a digital message an object" judgment call rather than
   silently resolved either way.

**Architecture-so-far, restated for context (canonical framing, per Madhurima):** Phase 6 chooses
ingredients → 7A chooses the storytelling mechanism (Form) → 7B assembles/sequences the
ingredients into a Story Plan → Template determines rhythm → Event Planner turns it into concrete
events. Nothing in this revision touches T01–T20 template JSON, Phase 6 data, F01–F05 Form
definitions, Event Planner code, or Phase 8/9 code — this remains a documentation-only
architecture/spec update to `tmp_phase7b_expanded_story_plan_test.md`, backed by the pre-existing
full backup at `public/prana-story-generator_backup_20260810_113746`.
