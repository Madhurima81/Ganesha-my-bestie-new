# Three Guides Realization Contract

Status: active Dev B family contract for `LOGIC_PARALLEL_JOURNEY`.

Purpose:
Realize stories where the protagonist encounters three distinct kinds of guidance about the same problem, then forms a personal response that synthesizes rather than copies.

Covered now:
- `T07` natural pilot branch

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> three-guides family realizer -> complete story`

Mechanism:
- Setup establishes one problem and the false belief attached to it.
- Guide 1 offers a practical/action response.
- Guide 2 offers a feeling, empathy, or perspective response.
- Guide 3 offers a reframing insight that changes what the problem means.
- The protagonist must pause and choose their own path using all three.
- Resolution must show synthesis, not obedience to one guide alone.

Inputs:
- `storySeed.childExperience`
- `storySeed.immediateObstacle`
- `storySeed.emotionalTension`
- `realizedSituation.sentence`
- `realizedSituation.want`
- `belief.falseBelief`
- `belief.trueBelief`

Beat responsibilities for `T07`:
- `SETUP`: establish the problem, want, and false belief.
- `GUIDE_1_ACTION`: concrete action-oriented guidance.
- `GUIDE_2_EMOTION`: guidance about feelings, empathy, or inner posture.
- `GUIDE_3_INSIGHT`: insight that reframes the meaning of the moment.
- `HERO_CHOICE`: protagonist visibly pauses and makes a synthesized choice.
- `RESOLUTION`: the chosen path works because it integrates the three modes.

Grounding rules:
- All three guides must address the same core situation.
- Their responses must differ in kind, not only in wording.
- Guide 3 should not simply preach the true belief outright.
- Hero choice must mention combining or carrying forward more than one guide.

Prohibited fallbacks:
- No three near-identical pieces of advice.
- No “then the hero copied Guide 3” ending.
- No generic mentor dialogue detached from the situation.
- No resolution that states growth without an actual chosen action.

QA expectations:
- `postAssertion`: concrete situation details remain visible.
- `QA-002`: protagonist takes a meaningful action of their own.
- `QA-003`: each guide clearly contributes to the final choice.
- `QA-009`: reflective pause before the hero choice is visible in text.
- `QA-014`: ending lands with clear closure.

Representative pilot set:
- `SIT043`
- `SIT055`
- `SIT083`
- `SIT147`
- `SIT167`
