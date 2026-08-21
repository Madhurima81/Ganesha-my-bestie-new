# T01 Realization Contract

Status: locked after the August 11, 2026 five-situation pilot.

Purpose:
Turn `LOGIC_CUMULATIVE_BUILD` from abstract "notice a pattern" filler into a concrete trail-of-facts story where multiple authored situation details accumulate into one causal realization.

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> T01 family realizer -> complete story`

Inputs:
- `template.templateId === "T01"`
- `storySeed.childExperience`
- `storySeed.immediateObstacle`
- `storySeed.emotionalTension`
- `storySeed.context[]` when needed as backup grounding
- `realizedSituation.sentence`
- `realizedSituation.want`
- `belief.falseBelief`
- `belief.trueBelief`

Beat responsibilities:
- `SETUP` must anchor the protagonist in the authored situation and name the immediate want plus the false belief.
- `ENCOUNTER_1` must introduce the first concrete trail fragment from situation material.
- `ENCOUNTER_2` must add a second distinct fragment and restate the cumulative line.
- `ENCOUNTER_3` must add a third distinct fragment and complete the cumulative line.
- `PATTERN_BREAK` must explicitly look back across the accumulated fragments and mark that they point to one underlying problem.
- `DISCOVERY` must state what the fragments mean together and carry the true-belief turn.
- `RESOLUTION` must show the protagonist acting from the whole pattern, not reacting to a single fragment.

Grounding rules:
- Prefer `storySeed` facts over generic mechanism words.
- Substitute the placeholder hero name with the active protagonist, but do not invent new facts.
- Use three distinct trail fragments whenever the situation provides them.
- Preserve causal language so the story reads as one chain rather than a list.

Prohibited fallbacks:
- No generic "the path continued" bridge prose.
- No abstract action-verb filler standing in for concrete situation facts when `storySeed` provides real material.
- No final resolution that announces growth without a protagonist choice or action.
- No beat text that ignores the cumulative trail and jumps straight to lesson language.

QA expectations:
- `postAssertion`: the story must visibly reference the resolved situation details.
- `QA-002`: the protagonist must take meaningful action.
- `QA-003`: cause and effect must remain explicit through connector language.
- `QA-004` to `QA-006`: both false-belief and true-belief movement must remain visible in the actual story text.

Validation set:
- `SIT008`
- `SIT086`
- `SIT101`
- `SIT108`
- `SIT112`

Locked outcome:
All five pilot situations passed `postAssertion`, `completeStoryValidation`, and `storyQA`.
