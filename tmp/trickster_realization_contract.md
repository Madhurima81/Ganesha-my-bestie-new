# Trickster Realization Contract

Status: active Dev B family contract for `LOGIC_TRICKSTER`.

Purpose:
Realize stories where the challenge is not spotting a pattern or returning changed, but judging between multiple options that all look initially reasonable until the protagonist notices what the earlier options were missing.

Covered now:
- `T12` natural pilot branch

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> trickster family realizer -> complete story`

Mechanism:
- Setup presents a real decision.
- Choice A is plausible but incomplete.
- Choice B is more sophisticated and tempting, but still flawed.
- Reflection names what both earlier choices were missing.
- Choice C acts from the true belief and resolves the situation fully.

Inputs:
- `storySeed.childExperience`
- `storySeed.immediateObstacle`
- `storySeed.emotionalTension`
- `storySeed.narrativeSummary`
- `realizedSituation.sentence`
- `realizedSituation.want`
- `belief.falseBelief`
- `belief.trueBelief`

Beat responsibilities for `T12`:
- `SETUP`: establish the decision and the tension behind it.
- `CHOICE_A_PLAUSIBLE`: first option seems understandable but falls short.
- `CHOICE_B_BETTER_BUT_FLAWED`: second option improves on A but still misses something essential.
- `REFLECTION`: protagonist pauses and articulates what A and B were both missing.
- `CHOICE_C_TRUE`: protagonist takes the option that requires the true belief.
- `RESOLUTION`: show why C works where A and B could not.

Grounding rules:
- A and B must feel genuinely tempting for the given situation.
- B must be more sophisticated than A, not just the same wrong move repeated.
- Reflection must explicitly compare what was missing from A and B.
- C must be a concrete action, not just a corrected statement.

Prohibited fallbacks:
- No generic “try harder / ask for help / choose differently” sequence reused regardless of situation.
- No false triplet where one option is obviously absurd.
- No resolution that says C was right without showing what it repaired.
- No moralizing over the specific decision.

QA expectations:
- `postAssertion`: concrete situation details stay visible.
- `QA-002`: protagonist takes meaningful action in Choice C / resolution.
- `QA-003`: causal link from A/B failure to reflection to C remains visible.
- `QA-007` and `QA-014`: ending carries visible closure.

Representative pilot set:
- `SIT138`
- `SIT139`
- `SIT143`
- `SIT157`
- `SIT159`
