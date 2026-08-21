# Story Engine MVP Architecture Note

Date: 2026-08-13
Scope: Practical guidance on what is working, what should change by phase, and where a Story Form Ontology belongs if the near-term goal is a decent basic story with real variation.

## Goal

The current priority is not maximum mechanism coverage or highly elaborate template behavior.

The current priority is:

- generate a simple, readable, emotionally coherent story
- make 10 generated stories feel genuinely different
- avoid obvious shared fallback patterns
- keep the pipeline understandable enough to debug and improve

## Core Diagnosis

The engine's strongest material already exists:

- situations
- needs
- beliefs
- characters
- worlds
- obstacles

The main problem is not lack of story data.

The main problem is that the runtime loses specificity between planning and realization. The current template layer is overloaded: it tries to help select the story, define the mechanism, constrain structure, and drive prose. That is why the system feels over-engineered while still producing generic output too often.

## What Is Working

These parts should be kept:

- Phase 6's emotional core: situation -> need -> belief
- the richness of the story libraries
- the idea of a locked Blueprint before prose
- the separation between planning and writing

These are valuable and should remain part of the architecture.

## What Is Not Working

These parts need change:

- distributed compatibility logic without one clear form-first gate
- world and obstacle selection that can remain too broad for the intended story form
- Phase 7 carrying too much interpretive/planning fragmentation for MVP
- Phase 8 template realization collapsing different stories into shared fallback structure and prose

## Key Architecture Gap

The current ontology is organized mostly by attribute type:

- needs
- character roles
- world types
- obstacle types
- symbol themes

What is missing is a primary form-centered compatibility layer.

The engine currently derives story shape indirectly through resolver sequencing and logic/template relationships. That is weaker than a direct Story Form Ontology that says:

- which world families fit a form
- which obstacle families fit a form
- which symbol families fit a form
- which emotional arc families fit a form
- which story flow shape fits a form

If form does not narrow the candidate pool, then form is only a label, not a real causal gate.

## Recommended Change By Phase

## Phase 6

Phase 6 is the main architecture change point.

What should stay:

- situation resolution
- need resolution
- belief resolution
- character resolution
- core story-meaning work

What should change:

- add a Story Form Ontology layer in Phase 6
- select story form after the emotional/problem core is clear
- use story form to constrain downstream candidate pools

Story Form should gate:

- compatible world families
- compatible obstacle families
- compatible symbol families
- compatible emotional arc families
- compatible story flow families

This means Phase 6 should not just resolve "a valid world" or "a valid obstacle." It should resolve a valid world or obstacle inside the chosen form's causal territory.

Recommended Phase 6 role:

`Situation -> Need/Belief -> Story Form -> constrained candidate space -> Blueprint`

## Phase 7

Phase 7 should become lighter for MVP.

What should stay:

- unfolding the Blueprint into a story flow
- simple beginning / middle / ending logic
- emotional turn
- final changed action

What should change:

- Phase 7 should stop acting like it is discovering the story form
- Phase 7 should not compensate for weak upstream constraints
- Phase 7 should not require unnecessary planning fragmentation for the MVP path

Recommended Phase 7 role:

`Take locked, form-constrained Blueprint -> build a simple Story Plan`

For MVP, the most important outputs are:

- story flow
- turning point
- emotional movement
- changed action / consequence

The deeper planning sublayers can remain part of long-term architecture, but they should not block simple strong story generation now.

## Phase 8

Phase 8 is the main editorial/output change point.

What should stay:

- prose generation from a plan instead of from raw input
- QA awareness

What should change:

- reduce dependence on heavy template logic as the core story engine
- stop relying on generic fallback realization for many different stories
- make prose depend more directly on situation-specific causal inputs

The template layer should become much smaller.

Instead of:

- selector
- mechanism owner
- structure driver
- realization contract
- prose engine

the MVP template/prose layer should mainly be:

- a light writing frame
- a page-level or paragraph-level expression shell

Recommended Phase 8 role:

`Take form-constrained Story Plan -> write simple, specific prose`

## What To Keep

- rich ontology and library data
- the Blueprint concept
- planning before prose
- emotional causality as the story core

## What To Pause

- using the current template layer as the main diversity engine
- over-detailed planning branches before simple stories are stable
- mechanism-count / coverage-count thinking as proof of quality
- adding more categories before the simple runtime works cleanly

## What To Simplify First

1. Add a Story Form Ontology in Phase 6.
2. Make form actually constrain world/obstacle/symbol/arc candidate pools.
3. Simplify Phase 7 to a smaller MVP Story Plan.
4. Reduce Phase 8 to light prose framing instead of heavy mechanism-bearing templates.
5. Eliminate generic fallback prose as the dominant live path.

## Recommended MVP Runtime

The simplest clean MVP path is:

`Request -> Phase 6 Blueprint -> Light Phase 7 Story Plan -> Phase 8 Story Draft -> Phase 9 QA/Book`

The MVP should optimize for:

- causal clarity
- emotional coherence
- readable prose
- real distinctiveness across stories

It should not optimize first for:

- maximum mechanism sophistication
- maximum template coverage
- highly granular intermediate planning artifacts

## Template Verdict

Templates are not useless, but they should not remain overloaded.

The current template layer became complicated because it tried to do too many jobs:

- route the story
- carry the mechanism
- define structure
- drive realization
- support QA

The cleaner split is:

- Story Form Ontology = causal gate
- Story Plan = narrative movement
- Light Prose Template = surface expression

That is much closer to the original "fill in the blanks" idea while still keeping real story intelligence upstream.

## Final Recommendation

If the goal is a decent basic story now, then:

- change Phase 6 the most
- simplify Phase 7
- strip down Phase 8's template burden

The highest-value missing piece is a real Story Form Ontology that constrains downstream selection before prose begins.

Without that, the engine keeps acting as if form matters while still allowing too much broad or random downstream choice.
