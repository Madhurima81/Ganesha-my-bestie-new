# Story Form Ontology Mini Sandbox

Date: 2026-08-13
Scope: A tiny read-only prototype to show how a Story Form Ontology would constrain story generation without repeating the old template mistake.

## Purpose

This document is not implementation code.

It is a paper prototype for testing one question:

Can a small Story Form Ontology give the engine a cleaner, more understandable way to shape stories before prose, without turning into another overloaded template system?

The goal is to make the architecture concrete enough to inspect with real examples before coding anything.

## Why This Is Not The Old Template System

The old template layer was trying to do too many jobs at once:

- classify the story
- own the mechanism
- define structure
- drive realization
- influence prose

This mini Story Form Ontology does something much narrower:

- identify the causal kind of story
- constrain downstream candidate pools

It does not try to write the story.
It does not try to be a prose template.
It does not try to be the entire realization engine.

## Mini Ontology: 3 Story Forms

This sandbox uses only 3 forms:

1. `FORM_DISCOVERY`
2. `FORM_TRANSFORMATION`
3. `FORM_THRESHOLD_CHOICE`

These are deliberately simple and broad enough to test on real situations.

## Mini Form Definitions

## 1. FORM_DISCOVERY

Core question:

`What the child believes or assumes is incomplete, and new information can change understanding and action.`

Required story condition:

- there is an information gap
- a clue, missing context, or overlooked detail can change the next question
- recognition changes what the child does

Compatible families:

- obstacle domains: `OD_SOCIAL`, `OD_EMOTIONAL`, `OD_PUZZLE`
- world types: `WT_LEARNING`, `WT_COMMUNITY`, `WT_NATURE`
- symbol themes: `SYMBOL_LIGHT`, `SYMBOL_BRIDGE`, `SYMBOL_CONNECTION`, `SYMBOL_CREATIVE_TOOL`
- emotional movement: confusion -> understanding, uncertainty -> clarity, hurt -> recognition
- opening family: unexplained event, puzzling behavior, missing explanation
- ending family: reveal, recognition, changed understanding, changed response

Story flow family:

`surface interpretation -> clue -> changed question -> deeper recognition -> changed action`

## 2. FORM_TRANSFORMATION

Core question:

`The child's main problem is not missing information alone, but a mistaken way of seeing themselves, another person, or their own value.`

Required story condition:

- the child starts from a limiting interpretation
- some evidence or experience contradicts that interpretation
- a new perspective changes how the child acts

Compatible families:

- obstacle domains: `OD_EMOTIONAL`, `OD_SOCIAL`
- world types: `WT_COMMUNITY`, `WT_NATURE`, `WT_DREAM`
- symbol themes: `SYMBOL_IDENTITY_MARKER`, `SYMBOL_GROWTH`, `SYMBOL_LIGHT`, `SYMBOL_CREATIVE_TOOL`
- emotional movement: shame -> recognition, comparison -> self-worth, fear -> reassurance
- opening family: painful comparison, self-doubt, misreading meaning
- ending family: self-recognition, freer action, acceptance, inner shift

Story flow family:

`old interpretation -> contradiction/evidence -> reframe -> new self-understanding -> different action`

## 3. FORM_THRESHOLD_CHOICE

Core question:

`The child faces a live fork: two paths are available, and the story is driven by choosing what kind of person to be.`

Required story condition:

- there is an active choice, not just confusion
- both options feel possible in the moment
- the story turns on what the child chooses

Compatible families:

- obstacle domains: `OD_SOCIAL`, `OD_EMOTIONAL`, `OD_TIME`
- world types: `WT_LEARNING`, `WT_COMMUNITY`
- symbol themes: `SYMBOL_THRESHOLD`, `SYMBOL_BRIDGE`, `SYMBOL_WEIGHT_BURDEN`, `SYMBOL_IDENTITY_MARKER`
- emotional movement: temptation -> pause -> decision -> consequence -> integrity/courage
- opening family: pressure moment, temptation, urgent fork
- ending family: chosen path, consequence, earned self-respect

Story flow family:

`pressure -> choice point -> pause/evaluation -> chosen action -> consequence`

## Mini Source Pool

To keep this understandable, the sandbox uses:

- 10 real situations
- 4 real characters
- 3 story forms

This is enough to inspect how the gating would work without drowning in the full library set.

## Mini Character Pool

Selected from `characters.json`:

- `CHAR001` Chinu (Squirrel)
  Explorer; good for curiosity / discovering / experimenting
- `CHAR004` Tara (Turtle)
  Patient thinker; good for slower recognition and careful response
- `CHAR006` Mira (Deer)
  Empathy builder; good for social understanding and perspective shift
- `CHAR007` Nayan (Fox)
  Puzzle solver; good for clue-based and interpretation-based stories

## Mini Situation Pool

Selected from `situations.json`:

- `SIT003` Told "no" without explanation
- `SIT010` Blamed for something they didn't do
- `SIT018` Sibling tells on them unfairly
- `SIT031` Heard about war or violence on news
- `SIT033` Fear that a parent might get sick
- `SIT067` Being slower at reading than others
- `SIT077` Compared to a cousin or friend
- `SIT123` Friend suddenly acting different or "cooler"
- `SIT137` Tempted to look at friend's paper during a test
- `SIT154` Friend copies their work or idea

## Architecture Sketch

The architecture move is:

1. resolve the situation core
2. test which form conditions are truly satisfied
3. choose the strongest form
4. create constrained candidate pools
5. build a simple story plan only from those pools

That means:

`Situation -> Need/Belief -> Story Form -> constrained openings/worlds/obstacles/arcs/symbols -> Story Plan -> Prose`

## What "Constrained Candidate Pools" Means

This is the key difference from random or overly broad selection.

Do not do:

- any world from the full world library
- any obstacle from the full obstacle library
- any opening from the full opening library

Instead do:

- candidate worlds that match the selected form
- candidate obstacle families that match the selected form
- candidate symbol themes that match the selected form
- candidate opening/ending families that match the selected form

Then choose inside those constrained pools.

## 10 Situation Adjudications

This table does not try to fully solve each situation.
It only shows how a form gate would classify them and what it would constrain.

| Situation | Likely form | Why | Not this form because |
|---|---|---|---|
| `SIT003` Told "no" without explanation | `FORM_DISCOVERY` | missing explanation; understanding may change after clue/context | not threshold choice because no live fork is central |
| `SIT010` Blamed for something they didn't do | `FORM_DISCOVERY` | truth is incomplete; hearing the real story matters | not transformation-first because the main driver is missing context |
| `SIT018` Sibling tells on them unfairly | `FORM_DISCOVERY` | partial story / missing context can change response | not threshold-first unless the central engine becomes revenge vs honesty |
| `SIT031` Heard about war on news | `FORM_TRANSFORMATION` or `FORM_DISCOVERY` | starts from fear and incomplete understanding; likely reassurance/reframe | not threshold choice |
| `SIT033` Fear a parent might get sick | `FORM_TRANSFORMATION` | fear-based interpretation shifts toward trust/reassurance | not discovery-led unless concrete clues actually change the next question |
| `SIT067` Slower at reading than others | `FORM_TRANSFORMATION` | comparison and self-worth are central | not discovery because the main issue is self-interpretation, not clue chain |
| `SIT077` Compared to a cousin or friend | `FORM_TRANSFORMATION` | identity and comparison are central | not discovery because no real clue chain is required |
| `SIT123` Friend acting different/"cooler" | `FORM_DISCOVERY` or `FORM_TRANSFORMATION` | can be either: hidden reason to discover, or belonging fear to reframe | not threshold choice |
| `SIT137` Tempted to look at friend's paper | `FORM_THRESHOLD_CHOICE` | real-time moral fork is central | not discovery because the core engine is choose/don't choose |
| `SIT154` Friend copies their work or idea | `FORM_TRANSFORMATION` or `FORM_DISCOVERY` | could hinge on understanding intent or on protecting self-worth | not threshold-first unless confrontation choice becomes the live engine |

## Worked Example A: Discovery

Situation:

`SIT003` Told "no" without explanation

Situation core:

- need: `NEED_RESPECT`
- false belief: `If people say no, they don't care about me.`
- immediate gap: child has no explanation

Why Discovery fits:

- there is a missing explanation
- the child's interpretation is based on partial information
- the story can turn when a clue or context appears

### Step 1: Form gate

Select `FORM_DISCOVERY`

### Step 2: Constrained pools

Allowed obstacle families:

- unexplained adult behavior
- partial communication
- hidden context
- social misunderstanding

Allowed world families:

- `WT_COMMUNITY`
- `WT_LEARNING`
- `WT_NATURE` if used as a calm noticing space

Allowed symbol themes:

- `SYMBOL_LIGHT`
- `SYMBOL_BRIDGE`
- `SYMBOL_CONNECTION`

Allowed emotional movement:

- hurt -> wondering -> understanding -> calmer response

Allowed opening family:

- abrupt "no"
- puzzling silence
- confusing adult action

Allowed ending family:

- explanation arrives
- child sees that "no" was not rejection
- child responds differently

### Step 3: Candidate character fits

Strong fits from mini pool:

- `Mira (Deer)` for gentle social understanding
- `Tara (Turtle)` for patient question-led story

Less ideal:

- `Nayan (Fox)` could work if the story becomes more clue-solving than emotional

### Step 4: Story plan shape

- opening: child hears "no" and assumes distance
- middle: notices a clue that the adult is worried, busy, or protecting something
- turn: asks or hears enough to change the question
- ending: child understands and responds with more calm

### Why this is cleaner than template logic

The form does not decide the prose.
It only prevents the engine from drifting into unrelated worlds or obstacle types.

## Worked Example B: Transformation

Situation:

`SIT077` Compared to a cousin or friend

Situation core:

- need: `NEED_IDENTITY`
- false belief: `I have to be like someone else to be valued.`
- emotional pressure: shame + comparison

Why Transformation fits:

- the main problem is self-interpretation
- the story must change what the child believes about value
- this is not mainly about discovering a hidden fact

### Step 1: Form gate

Select `FORM_TRANSFORMATION`

### Step 2: Constrained pools

Allowed obstacle families:

- comparison pressure
- self-doubt
- value confusion

Allowed world families:

- `WT_COMMUNITY`
- `WT_NATURE`
- `WT_DREAM`

Allowed symbol themes:

- `SYMBOL_IDENTITY_MARKER`
- `SYMBOL_GROWTH`
- `SYMBOL_LIGHT`

Allowed emotional movement:

- shame -> reflection -> reframe -> self-worth

Allowed opening family:

- painful comparison moment
- being measured against another child

Allowed ending family:

- uniqueness recognized
- action becomes freer and less imitative

### Step 3: Candidate character fits

Strong fits from mini pool:

- `Mira (Deer)` for empathy and identity reframe
- `Tara (Turtle)` for slower reflective change

### Step 4: Story plan shape

- opening: comparison lands heavily
- middle: child tries to become "more like" the other
- turn: evidence appears that the child's own strengths matter
- ending: child acts from their own identity

### Why this is cleaner than template logic

The form says what kind of change the story must deliver.
It does not also force a beat list, prose style, and selector package all in one object.

## Worked Example C: Threshold Choice

Situation:

`SIT137` Tempted to look at a friend's test answers

Situation core:

- need: `NEED_INTEGRITY`
- false belief: `Cheating is okay if it helps me succeed.`
- pressure: immediate tempting shortcut

Why Threshold Choice fits:

- this is a live fork
- the story turns on the decision itself
- the moral engine is active from the start

### Step 1: Form gate

Select `FORM_THRESHOLD_CHOICE`

### Step 2: Constrained pools

Allowed obstacle families:

- temptation
- pressure
- fear of failure

Allowed world families:

- `WT_LEARNING`
- `WT_COMMUNITY`

Allowed symbol themes:

- `SYMBOL_THRESHOLD`
- `SYMBOL_WEIGHT_BURDEN`
- `SYMBOL_BRIDGE`

Allowed emotional movement:

- pressure -> pause -> decision -> earned confidence

Allowed opening family:

- immediate test pressure
- visible shortcut

Allowed ending family:

- honest choice
- consequence accepted
- stronger self-respect

### Step 3: Candidate character fits

Strong fits from mini pool:

- `Tara (Turtle)` for patience / integrity
- `Nayan (Fox)` only if written carefully so cleverness does not glamorize the cheat

### Step 4: Story plan shape

- opening: child sees the easy answer nearby
- middle: temptation intensifies
- turn: pause before choice
- ending: child chooses honesty and lives with the result

### Why this is cleaner than template logic

The form cleanly distinguishes this from a discovery story.
The engine does not have to pretend the main driver is a clue chain or a perspective puzzle.

## What This Sandbox Shows

This mini prototype shows 3 important things:

1. The form can constrain candidate pools without becoming a prose template.
2. The same libraries can still be used, but inside a much narrower lane.
3. The engine can stay simpler if form selection happens before world/obstacle/opening drift begins.

## What This Sandbox Does Not Yet Solve

This sandbox is intentionally small.

It does not yet define:

- the full list of production story forms
- exact field-level mappings into every library file
- the scoring/ranking formula for collisions between two plausible forms
- the final prose layer

Those would come later.

## Suggested Next Validation Step

Before any implementation:

1. Take 6-10 more real situations.
2. Try assigning only these 3 forms.
3. For each, write the constrained pools in plain English.
4. Check whether the resulting candidate stories feel genuinely different.

If that works, then the Story Form Ontology is earning its keep.

If it does not, we revise it before writing any code.

## Practical Verdict

This approach is promising because it is much narrower than the old template system.

It gives the engine a causal gate without forcing one object to become:

- selector
- mechanism
- structure
- prose template
- realization contract

That is exactly why it is worth prototyping this way first.
