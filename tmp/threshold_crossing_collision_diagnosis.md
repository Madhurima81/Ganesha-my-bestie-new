# Threshold-Crossing Collision Diagnosis

Date: August 11, 2026  
Scope: `T13` vs `T19` under `LOGIC_THRESHOLD_CROSSING`

## Decision

`T13` and `T19` should **not** be treated as one realization family with two light branches.

They share a broad ontology bucket, but they are **different narrative engines** and should be implemented as **two distinct families** once coverage exists.

## Why They Are Not One Family

### 1. Different turning-point type

`T13` turns on **attention shifting away from the original object/problem**.

- Core beat: `NOTICE_SOMETHING_ELSE`
- The protagonist is interrupted out of anxious search.
- The story crosses a threshold from fixation to deeper noticing.

`T19` turns on **deliberate moral/behavioral choice between two options**.

- Core beat: `CHOICE`
- The protagonist does not wander into the answer.
- The threshold is crossed through commitment, not discovery.

This is the biggest difference. One is a **notice/reorientation** engine; the other is a **decision/consequence** engine.

### 2. Different causal shape

`T13` causal chain:

`loss -> search -> notice -> deeper discovery -> object found -> object demoted`

The original goal becomes secondary by the end.

`T19` causal chain:

`approach choice -> old option -> new option -> chosen path -> consequence -> resolution`

The original dilemma stays central all the way through, and the consequence is what proves the choice mattered.

These are not the same mechanism with cosmetic relabeling.

### 3. Different emotional contour

`T13` de-escalates after the turn.

- Anxiety rises during search.
- Relief begins once attention shifts.
- Resolution depends on discovering that the deeper thing mattered more than the lost thing.

`T19` sharpens pressure up to the turn.

- Temptation must remain real.
- Pressure peaks at the exact choice.
- Resolution depends on living with the consequence of the chosen path.

So even the rhythm is opposite:

- `T13`: anxious narrowing -> widening -> soft release
- `T19`: mounting temptation -> decisive threshold -> consequence

### 4. Different proof burden in the ending

`T13` ending must prove:

- the deeper discovery outranks the recovered object
- the object is satisfying but secondary

`T19` ending must prove:

- the chosen option had a real consequence
- the true-belief path was not merely praised but causally vindicated

Those are different realization contracts, different QA risks, and different failure modes.

## Why They Were Grouped Together Anyway

They likely share `LOGIC_THRESHOLD_CROSSING` because both involve a **single decisive interior crossing**, rather than cumulative build or repeated escalation.

That ontology is still useful, but it is too coarse for realization-family purposes.

At realization level, threshold crossing splits into at least:

1. **Attention threshold**
   - prototype: `T13`
   - hero stops chasing one thing and notices the more meaningful thing

2. **Choice threshold**
   - prototype: `T19`
   - hero faces two live options and must choose one with consequence

So the right architecture is:

`LOGIC_THRESHOLD_CROSSING -> multiple realization families`

not

`LOGIC_THRESHOLD_CROSSING -> one shared family realizer`

## Coverage Status

Current selector/audit state:

- `T13.selectedCount = 0`
- `T19.selectedCount = 0`

So neither template should be implemented next.

This confirms the user instruction was correct: the immediate work here is **collision diagnosis**, not writer construction.

## Implementation Guidance For Later

When selector coverage exists, implement them separately:

### Future family: `T13` Lost/Notice/Found

Contract center:

- anxious search starts narrow
- one interrupting notice redirects attention
- deeper discovery becomes primary
- object return lands as secondary confirmation

Primary QA risk:

- generic “lost object then life lesson” prose that never truly shifts attention

### Future family: `T19` Choice at the Crossroads

Contract center:

- both options must be genuinely available
- old-belief option must feel tempting
- hero must choose actively
- consequence must follow specifically from that exact choice

Primary QA risk:

- fake choice where one option is obviously wrong and carries no real temptation

## Locked Conclusion

For Dev B architecture:

- `T13` and `T19` are **distinct realization families**
- they are **not** one shared family with modes
- keep both untouched until selector coverage establishes real situation support

Recommended label split for future work:

- `Threshold Crossing / Attention Shift` -> `T13`
- `Threshold Crossing / Moral Choice` -> `T19`
