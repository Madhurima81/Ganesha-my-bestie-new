# V2 Realization Contract Methodology v2

Date: 2026-08-12
Status: Architecture redesign only
Scope: Realization-contract methodology
Locked inputs:
- 11 V2 mechanisms remain unchanged
- No new mechanisms
- No selector changes
- No production realization edits in this document

## Purpose

The V2-02 blind-read pack and cross-mechanism audit showed an implementation-pattern problem:

- the mechanism definitions are often sound
- the manuscript contracts are not yet stable
- some contracts still prescribe sentence behavior instead of causal scene behavior

This document redesigns the realization-contract method so future V2 implementation is driven by causal events first, situation realization second, and prose last.

## Final Verdict

NEEDS ONE MORE REDESIGN

Meaning:

- the V2 mechanism architecture is still viable
- implementation should pause
- Dev B/C should not implement more V2 mechanisms until this methodology replaces the current contract-writing pattern

## Core Diagnosis

The failure is not primarily in the 11-mechanism architecture.

The failure is in the current contract layer when it does one or more of these:

- treats a beat as a sentence slot instead of a causal obligation
- requires abstract belief language as manuscript proof
- repeats the same turn sequence in nearly identical words across unrelated situations
- lets situation facts decorate a prewritten skeleton instead of determining what happens

The audit showed three implementation states:

1. `V2-02 Ritual Escalation`

- The mechanism definition is correct.
- The current `T02` realization still converges on repeated line-return scaffolding.
- Different situations are forced through very similar pause/change phrasing.

2. `V2-07 Countdown / Resource Pressure`

- The mechanism definition is correct.
- The current `T11` live output is older and even more scaffolded than `T02`.
- It proves the convergence problem is not unique to `V2-02`.

3. `V2-11 Attention Shift`

- The mechanism definition is correct.
- It is not yet one independently proven realization contract.
- Current situations are split across older templates, so methodology must be fixed before this mechanism is implemented as a coherent V2 engine.

## Method Principle

Every V2 contract must be built in 3 layers.

The rule is strict:

- Layer 1 defines mechanism causality.
- Layer 2 defines situation realization.
- Layer 3 renders prose from realized events.

No layer may smuggle the next layer upward.

That means:

- Layer 1 may not contain manuscript phrasing.
- Layer 2 may not contain reusable explanatory wrappers.
- Layer 3 may not invent causal turns not already realized in Layer 2.

## Layer 1 — Mechanism Contract

Layer 1 defines what must happen for a mechanism to be true, regardless of situation.

Each mechanism contract must include:

### 1. Causal Purpose

What problem-shape this mechanism solves.

Example form:

- `V2-02`: A recurring old pattern must be interrupted before the story can move.
- `V2-07`: A shrinking resource or window pressures action quality; a pause changes the last move.
- `V2-11`: Trapped attention narrows meaning; widened attention changes what the original fixation means.

### 2. Required Transformation

The minimal before/after causal change.

Example form:

- before: the old engine is still governing action
- after: a different causal principle governs action

### 3. Beat / Event Function

Each beat must be defined as a function, not a line.

Each beat entry must contain:

- `Beat name`
- `MUST HAPPEN CAUSALLY`
- `MAY BE EXPRESSED AS`
- `MUST NOT BECOME`

### 4. Causal Dependency Between Beats

Each beat must explain why it exists and what it enables.

Required form:

- `Beat B depends on A because...`
- `Beat C cannot occur unless B has changed...`

### 5. Acceptable Evidence Of The Mechanism

What a reader could point to in the story as proof the mechanism occurred.

Examples:

- repeated return of the same behavior under pressure
- visible deterioration caused by urgency
- a widened focus that changes how the first object/event is valued

### 6. Anti-Patterns

Concrete forms of false implementation.

Examples:

- same sentence repeated as proof of recurrence
- generic pause line with no causal cost
- abstract “understood that...” replacing a real turning action

## Layer 2 — Situation Realization

Layer 2 instantiates Layer 1 using the actual situation data.

It must never fill beats with reusable manuscript wrappers.

Each realized situation contract must specify:

### 1. Situation-Specific Obstacle

Not the mechanism obstacle.
The actual authored obstacle in the situation.

Examples:

- `SIT054`: the cancellation cannot be undone
- `SIT025`: the performance is about to begin and the audience is present
- `SIT083`: the toy belongs to the friend and the social attention is clustered there

### 2. Situation-Specific Attempted Action

What the protagonist actually does under the false engine.

Not:

- “tries again”
- “reacts badly”

But:

- keeps asking whether the event can still happen
- stares at the marks portal again
- grips the swing fence and complains about the line
- keeps looking back at the other child’s toy

### 3. Concrete Consequence

What gets worse because of that attempted action.

Not:

- “the feeling got worse”

But:

- the cancellation remains unchanged and the protagonist gets sharper
- the wait feels longer because attention is spent on checking
- the friend’s toy becomes the whole scene because the protagonist keeps feeding the comparison

### 4. Concrete Turning Action

The event that interrupts the old engine.

Not:

- “hero paused”
- “hero reflected”

But:

- sits down and stops refreshing the results page
- asks what the stage cue order is instead of scanning the audience
- looks away from the toy and notices their own friend is still inviting them into the moment

### 5. Situation-Specific Resolution

The final action must be specific to the situation and traceable to the turning action.

Not:

- “acted differently”

But:

- asks what else the family can do today
- steps onto the stage on the cue instead of waiting to feel fearless
- joins the toy conversation while bringing their own object back into play

### 6. Allowed Variation Within Each Beat

Every beat must explicitly name the range of acceptable realizations.

Example:

- interruption may be physical, verbal, relational, logistical, or attentional
- resolution may be a re-entry, a request, a confession, a delayed choice, a shared action, or a reframe proven in action

## Layer 3 — Prose

Layer 3 renders the realized events.

It has one job only:

- turn the Layer 2 event sequence into readable child-facing prose

It may not:

- supply mechanism proof by itself
- insert generic insight wrappers
- repair weak event realization with moral explanation

### Prose Rules

1. No fixed explanatory sentences.

Forbidden examples:

- “That was the moment X understood...”
- “Everything felt calmer, warmer, and freer than before.”
- “The real problem stayed the same.”

2. No reusable belief wrappers.

Forbidden examples:

- “The same line came back...”
- “The old thought said...”
- “This time the line changed...”

Belief may appear when naturally grounded, but it is not the main proof of the beat.

3. No generic emotional-release sentences.

Release must be shown by what changes in action, posture, timing, or dialogue.

4. Prose must be generated from the realized events.

If the realized event is specific, the prose should differ automatically.

5. Dialogue must emerge from situation action.

Dialogue must not be a mechanism stamp.

Bad:

- every contract has a `"Wait"` beat

Good:

- one child says “It’s different now.”
- another says “Try differently.”
- another says nothing and just stops checking

## Universal Beat Rule

Every beat in every future V2 contract must use this format:

### Beat Template

`Beat Name`

`MUST HAPPEN CAUSALLY`

- the irreducible function of the beat

`MAY BE EXPRESSED AS`

- 3 or more materially different concrete possibilities

`MUST NOT BECOME`

- the repeated sentence pattern or fake generic move to avoid

## Revised Contract Schema

Use this schema for every future mechanism.

```md
## Mechanism: [name]

### Layer 1 — Mechanism Contract

- Causal purpose:
- Required transformation:
- Acceptable evidence:
- Anti-patterns:

#### Beat 1 — [name]
- MUST HAPPEN CAUSALLY:
- MAY BE EXPRESSED AS:
- MUST NOT BECOME:
- Depends on:
- Enables:

#### Beat 2 — [name]
- MUST HAPPEN CAUSALLY:
- MAY BE EXPRESSED AS:
- MUST NOT BECOME:
- Depends on:
- Enables:

...

### Layer 2 — Situation Realization

- Situation-specific obstacle:
- Situation-specific attempted action:
- Concrete consequence:
- Concrete turning action:
- Situation-specific resolution:

#### Beat Realization Map
- Beat 1:
  - MUST HAPPEN CAUSALLY:
  - This situation realizes it as:
  - Allowed variation:

...

### Layer 3 — Prose Constraints

- Forbidden reusable wrappers:
- Dialogue constraints:
- Closure constraints:
- Detail requirements:
- How prose must differ across situations:
```

## Stress Test Standard

Before implementation, every mechanism must be tested against 3 to 5 situations.

The stress test fails if any of these are true:

- sentence/scaffold reuse dominates the draft set
- the same action sequence is reused across unrelated situations
- emotional language is nearly identical story to story
- situation facts can be swapped without breaking the manuscript
- the mechanism becomes invisible unless belief is named directly
- generic fallback language leaks into more than one beat

The stress test passes only if:

- the same mechanism is still recognizable
- but the concrete actions, dialogue, progression, and resolution are materially different

## V2-02 Rewritten Under Methodology v2

Mechanism: Ritual Escalation

### Layer 1 — Mechanism Contract

- Causal purpose:
  Show a recurring old reaction pattern returning under pressure until the protagonist interrupts that pattern.

- Required transformation:
  `automatic recurrence -> deliberate interruption -> different action path`

- Acceptable evidence:
  - the same kind of response reappears at least twice
  - the third pressure point does not replay the same response unchanged
  - the interruption changes the next action, not just the language

- Anti-patterns:
  - three generic tries
  - recurrence proven only by repeated belief text
  - pause with no changed behavior
  - same sentence scaffold regardless of situation

#### Beat 1 — Pressure Return

- MUST HAPPEN CAUSALLY:
  The old pattern becomes active again in response to a familiar pressure.

- MAY BE EXPRESSED AS:
  - asking again whether the canceled plan can be restored
  - attacking the same problem page immediately after another failure
  - continuing to hide the broken object while monitoring adults
  - continuing to compare one’s own things to a friend’s

- MUST NOT BECOME:
  “The same line came back.”

- Depends on:
  Situation contains a genuine repeatable pattern.

- Enables:
  A second recurrence can prove this is a loop, not an isolated mistake.

#### Beat 2 — Pattern-Fed Attempt

- MUST HAPPEN CAUSALLY:
  The protagonist acts from the old pattern instead of interrupting it.

- MAY BE EXPRESSED AS:
  - trying to restore the canceled event
  - pushing harder at the same learning task
  - staying silent and hiding evidence
  - staring harder at the comparison object

- MUST NOT BECOME:
  “Tried anyway.”

- Depends on:
  Pressure Return.

- Enables:
  A concrete consequence.

#### Beat 3 — Consequence Of Recurrence

- MUST HAPPEN CAUSALLY:
  The old-pattern attempt fails or worsens the moment in a way specific to the situation.

- MAY BE EXPRESSED AS:
  - the event is still canceled
  - the problem page is still wrong
  - the lie becomes harder to carry
  - the comparison shrinks the protagonist’s own enjoyment further

- MUST NOT BECOME:
  “The real problem stayed the same.”

- Depends on:
  Pattern-Fed Attempt.

- Enables:
  The need for interruption.

#### Beat 4 — Interruption

- MUST HAPPEN CAUSALLY:
  The protagonist interrupts the old pattern before running it again.

- MAY BE EXPRESSED AS:
  - stops asking to restore the outing and sits down
  - puts the pencil down instead of pressing harder
  - walks toward the adult with the truth
  - looks away from the comparison object and back into the shared scene

- MUST NOT BECOME:
  universal pause dialogue

- Depends on:
  Consequence Of Recurrence.

- Enables:
  A different kind of final action.

#### Beat 5 — Reoriented Action

- MUST HAPPEN CAUSALLY:
  The next action is governed by the interrupted pattern, not by repetition.

- MAY BE EXPRESSED AS:
  - asking what else the family can do
  - trying a smaller learning step
  - confessing the breakage
  - joining the interaction without needing to own the coveted object

- MUST NOT BECOME:
  “Acted differently.”

- Depends on:
  Interruption.

- Enables:
  Resolution.

#### Beat 6 — Resolution

- MUST HAPPEN CAUSALLY:
  The situation shifts because of the reoriented action.

- MAY BE EXPRESSED AS:
  - the day continues in a newly chosen way
  - the hard concept begins to move
  - the honesty loop opens repair
  - the comparison loses control of the whole scene

- MUST NOT BECOME:
  generic emotional-release narration

- Depends on:
  Reoriented Action.

- Enables:
  Clear proof of changed engine.

### Layer 2 — Situation Realization Examples

#### `SIT054` Cancelled outing

- Situation-specific obstacle:
  The cancellation cannot be undone.

- Situation-specific attempted action:
  Keeps asking inwardly or outwardly for the old plan back.

- Concrete consequence:
  The plan is still gone and disappointment intensifies.

- Concrete turning action:
  Stops trying to restore the old day and asks what the day can still become.

- Situation-specific resolution:
  Chooses a different activity or meaningfully reuses the day.

#### `SIT113` Hard concept

- Situation-specific obstacle:
  The concept still does not make sense.

- Situation-specific attempted action:
  Repeats the same forceful approach faster or harder.

- Concrete consequence:
  Confusion becomes self-judgment.

- Concrete turning action:
  Stops pressing and changes the unit of effort.

- Situation-specific resolution:
  Tries one smaller new step and gains traction.

#### `SIT139` Hid broken object

- Situation-specific obstacle:
  The breakage will eventually be discovered.

- Situation-specific attempted action:
  Hides evidence and maintains concealment.

- Concrete consequence:
  The pressure grows because concealment must be sustained.

- Concrete turning action:
  Chooses to say what happened before being found out.

- Situation-specific resolution:
  The honesty action opens repair or relief.

### Layer 3 — Prose Constraints

- Do not use “same line came back” as recurrence proof.
- Do not use “this time the line changed” as turning proof.
- Do not use generic pause dialogue across situations.
- Recurrence must be visible in the repeated action pattern itself.
- Resolution must end on the changed scene action, not a release summary.

## Hypothetical V2-07 Contract Under Methodology v2

Mechanism: Countdown / Resource Pressure

This is an example only, not implementation.

### Layer 1 — Mechanism Contract

- Causal purpose:
  Show that shrinking time/chance/margin pressures the protagonist toward rushed action, but a deliberate pause improves the final move.

- Required transformation:
  `rush under scarcity -> spend part of scarcity on pause -> higher-quality final action`

#### Beat 1 — Resource Visible
- MUST HAPPEN CAUSALLY:
  A limited window or resource is established as truly finite.
- MAY BE EXPRESSED AS:
  - stage cue is approaching
  - swing line is moving but slowly
  - results will not arrive any sooner no matter how often checked
- MUST NOT BECOME:
  arbitrary numeric countdown with no real scarcity

#### Beat 2 — Pressure Tightens
- MUST HAPPEN CAUSALLY:
  The shrinking margin changes behavior.
- MAY BE EXPRESSED AS:
  - scanning the audience
  - hovering at the swing edge
  - compulsive checking
- MUST NOT BECOME:
  generic “panic rose”

#### Beat 3 — Peak Misuse Risk
- MUST HAPPEN CAUSALLY:
  The protagonist is on the edge of wasting the remaining margin badly.
- MAY BE EXPRESSED AS:
  - almost fleeing stage
  - snapping at others in line
  - refreshing again instead of leaving the device alone
- MUST NOT BECOME:
  filler escalation beat

#### Beat 4 — Pause Choice
- MUST HAPPEN CAUSALLY:
  The protagonist deliberately spends some of the scarce margin on stopping or resetting.
- MAY BE EXPRESSED AS:
  - listens for the first line cue
  - steps back from the swing gate
  - closes the results page for the next hour
- MUST NOT BECOME:
  “Wait” ritual

#### Beat 5 — Final Timed Action
- MUST HAPPEN CAUSALLY:
  A last action occurs within the still-limited window, but with changed quality because of the pause.

#### Beat 6 — Resolution
- MUST HAPPEN CAUSALLY:
  Success or relief is clearly attributable to action quality, not luck.

### Stress-Test Situation Range

`SIT025`

- final action could be stepping onto stage on cue

`SIT101`

- final action could be building a calm waiting routine rather than forcing the wait to end

`SIT108`

- final action could be asking how many turns remain and choosing a waiting alternative

`SIT128`

- final action could be ceasing compulsive checking and returning to a grounded task

These are materially different action paths while preserving the same mechanism.

## Hypothetical V2-11 Contract Under Methodology v2

Mechanism: Attention Shift

This is an example only, not implementation.

### Layer 1 — Mechanism Contract

- Causal purpose:
  Show a fixation becoming the apparent source of safety/worth/relief until attention widens toward something deeper that reorders the fixation.

- Required transformation:
  `narrow fixation -> interrupting notice -> widened attention -> reassessed original focus`

#### Beat 1 — Fixation Established
- MUST HAPPEN CAUSALLY:
  One object, absence, image, or deprivation dominates meaning.
- MAY BE EXPRESSED AS:
  - replayed frightening image
  - friend’s toy
  - baby-centered attention
  - denied treat or outing
- MUST NOT BECOME:
  generic sadness without a dominant focus

#### Beat 2 — Search Or Hold
- MUST HAPPEN CAUSALLY:
  The protagonist continues feeding the fixation.
- MAY BE EXPRESSED AS:
  - mentally replaying the video
  - watching the toy crowd
  - hovering beside the baby scene without entering it
  - arguing for the treat again

#### Beat 3 — Interrupting Notice
- MUST HAPPEN CAUSALLY:
  Something redirects attention away from the fixation.
- MAY BE EXPRESSED AS:
  - a present-grounding object
  - their own object still available
  - a family gesture that includes them
  - evidence of togetherness despite scarcity

#### Beat 4 — Deeper Discovery
- MUST HAPPEN CAUSALLY:
  The protagonist notices a deeper value or reality that the fixation had hidden.

#### Beat 5 — Return Or Reframe
- MUST HAPPEN CAUSALLY:
  Attention returns to the original focus, but under changed meaning.

#### Beat 6 — Resolution
- MUST HAPPEN CAUSALLY:
  The changed attention produces a different relational or practical action.

### Stress-Test Situation Range

`SIT030`

- fixation: replayed violent image
- deeper value: present safety and available comfort
- resolution: grounds in the present and seeks comfort

`SIT083`

- fixation: friend’s toy
- deeper value: shared delight and value in what is already theirs
- resolution: re-enters the social moment without needing possession

`SIT089`

- fixation: baby-centered attention as replacement
- deeper value: belonging is not erased by divided attention
- resolution: re-enters family attention instead of withdrawing

`SIT127`

- fixation: denied outing/treat as the whole meaning of happiness
- deeper value: family togetherness under temporary limits
- resolution: accepts a different family moment without treating the “no” as total deprivation

These are materially different actions and scene progressions while preserving the same mechanism.

## Before / After Comparison

### Old Method

- beat names imply manuscript slots
- mode tables contain reusable explanatory lines
- belief wrappers carry mechanism visibility
- prose proves the mechanism
- situation details are inserted into a pre-existing skeleton

Result:

- scaffold reuse
- same action sequence
- same emotional cadence
- fake differentiation

### New Method

- beats are causal obligations
- situation realization determines what physically/socially/attentively happens
- prose is downstream of realized events
- mechanism visibility comes from event structure
- dialogue emerges from the situation, not from the template

Result:

- same mechanism, different manuscripts
- different action progression per situation
- belief no longer has to do all the proof work
- convergence becomes much harder

## Implementation Rules For Dev B/C

1. Do not write mode tables as prose tables.

2. Write Layer 1 first and ban sentence-shaped entries.

3. For each beat, explicitly write:
- MUST HAPPEN CAUSALLY
- MAY BE EXPRESSED AS
- MUST NOT BECOME

4. Stress-test each mechanism on 3 to 5 assigned situations before any code.

5. If 2 different situations can swap manuscripts with only noun changes, the contract fails.

6. If the mechanism is only legible because the belief is directly named, the contract fails.

7. If pause/insight/resolution are reusable lines across situations, the contract fails.

8. Situation-specific resolution must always be traceable to the turning action.

9. No generic fallback prose is allowed inside a mechanism contract.

10. A mechanism is implementation-ready only when:
- its Layer 1 contract is causal
- its Layer 2 realizations differ materially across sample situations
- its Layer 3 constraints forbid scaffold leakage

## Readiness Gate

This methodology is strong enough to replace the current pattern.

But implementation should resume only after Dev B/C explicitly adopt this schema as the required pre-code contract format.

Final verdict:

NEEDS ONE MORE REDESIGN

Meaning:

- redesign is now specified
- production code should remain untouched for this pass
- V2 implementation may resume only after this methodology is accepted as the new contract standard
