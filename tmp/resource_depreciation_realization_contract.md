# Resource Depreciation Realization Contract

Status: active Dev B family contract for `LOGIC_RESOURCE_DEPRECIATION`.

Purpose:
Realize stories where urgency grows through limited chances, shrinking time, or mounting pressure, and the key turn is that the protagonist spends scarce momentum on a pause that makes the final move work.

Covered now:
- `T11` natural pilot branch

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> resource-depreciation family realizer -> complete story`

Mechanism:
- Opening establishes a finite-feeling challenge.
- Early attempts or time markers make the remaining margin feel smaller.
- Pressure rises because acting fast seems safer than slowing down.
- The protagonist pauses anyway.
- The pause changes the quality of the final move.
- Resolution must show that the pause, not luck, made success possible.

Inputs:
- `storySeed.childExperience`
- `storySeed.immediateObstacle`
- `storySeed.emotionalTension`
- `storySeed.narrativeSummary`
- `realizedSituation.sentence`
- `realizedSituation.want`
- `belief.falseBelief`
- `belief.trueBelief`

Beat responsibilities for `T11`:
- `COUNTDOWN_OPENING`: establish the urgent situation and false belief.
- `COUNTDOWN_3`: first pressured move with plenty of urgency still left.
- `COUNTDOWN_2`: second move with higher pressure and reduced margin.
- `COUNTDOWN_1`: final stretch where rushing feels most tempting.
- `PAUSE_CHOICE`: protagonist deliberately pauses despite scarce margin.
- `FINAL_ACTION`: protagonist makes the final brave move shaped by the pause.
- `RESOLUTION`: show why the final move worked and tie it to the true belief.

Grounding rules:
- Scarcity can be time, chances, emotional room, or narrowing safe options, but it must feel finite.
- The pressure has to escalate across the countdown beats.
- The pause must be concrete and visible.
- Final action must clearly differ from the earlier rushed or fear-driven moves.

Prohibited fallbacks:
- No generic “three tries” imitation.
- No countdown language without real rising stakes.
- No pause that changes nothing.
- No ending that implies random success.

QA expectations:
- `postAssertion`: concrete situation details stay visible.
- `QA-002`: protagonist takes a meaningful final action.
- `QA-003`: causal link from urgency to pause to success remains visible.
- `QA-007`, `QA-014`: ending carries real closure.
- `QA-009`: reflective pause is visible in manuscript text.

Representative pilot set:
- `SIT021`
- `SIT023`
- `SIT027`
- `SIT038`
- `SIT126`
