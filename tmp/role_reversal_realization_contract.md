# Role Reversal Realization Contract

Status: active Dev B family contract for `LOGIC_ROLE_REVERSAL`.

Purpose:
Realize stories where the protagonist's growth is completed by moving from receiving help to consciously giving a similar kind of help to someone else.

Covered now:
- `T14` natural pilot branch

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> role-reversal family realizer -> complete story`

Mechanism:
- The protagonist struggles under the false belief.
- Someone helps the protagonist in a way that lands emotionally.
- Later, another person faces a recognizably similar struggle.
- The protagonist recalls the earlier help and recognizes the parallel.
- The protagonist actively gives help, not just sympathy.
- The true belief lands because the protagonist has become the giver.

Inputs:
- `storySeed.childExperience`
- `storySeed.immediateObstacle`
- `storySeed.emotionalTension`
- `storySeed.narrativeSummary`
- `realizedSituation.sentence`
- `realizedSituation.want`
- `belief.falseBelief`
- `belief.trueBelief`

Beat responsibilities for `T14`:
- `HERO_RECEIVES`: protagonist in pain/confusion receives some concrete help.
- `LEARNING`: protagonist notices what that help felt like or changed.
- `OTHER_STRUGGLES`: a different person later faces a similar kind of struggle.
- `RECALL_HELP`: protagonist explicitly connects the new struggle to the earlier help.
- `HERO_GIVES`: protagonist offers meaningful help in action.
- `RESOLUTION`: show that giving help completes the understanding.

Grounding rules:
- The later struggle must be recognizably related to the first one, even if not identical.
- The help offered later should rhyme with the earlier help, not be random.
- The protagonist must remain the active giver in `HERO_GIVES`.
- Resolution should show relational change, not just inner narration.

Prohibited fallbacks:
- No generic “then someone else needed help” without a concrete bridge.
- No purely internal empathy ending.
- No unrelated rescue action that breaks the receive/give symmetry.
- No flattening the mechanism into “hero learned a lesson and was nice.”

QA expectations:
- `postAssertion`: situation detail remains visible.
- `QA-002`: protagonist performs a meaningful helping action.
- `QA-003`: causal link from received help to remembered help to given help remains visible.
- `QA-007`, `QA-014`: ending carries visible emotional closure.

Representative pilot set:
- `SIT013`
- `SIT042`
- `SIT089`
- `SIT118`
- `SIT164`
