# Question Chain Realization Contract

Status: active Dev B family contract for `LOGIC_RUNAWAY_CHAIN`.

Purpose:
Realize stories where each answer produces a narrower, more meaningful question, until the protagonist recognizes that the final answer points toward the true belief.

Covered now:
- `T04` natural pilot branch

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> question-chain family realizer -> complete story`

Mechanism:
- Opening establishes the immediate problem and first question.
- Each clue answers part of the previous question but creates a sharper next one.
- Questions must move inward from surface outcome to motive, responsibility, or value.
- The final clue should make the answer feel already present.
- Revelation must connect the whole chain at once.
- Resolution should follow quickly from the new understanding.

Inputs:
- `storySeed.childExperience`
- `storySeed.immediateObstacle`
- `storySeed.emotionalTension`
- `storySeed.narrativeSummary`
- `realizedSituation.sentence`
- `realizedSituation.want`
- `belief.falseBelief`
- `belief.trueBelief`

Beat responsibilities for `T04`:
- `OPENING_QUESTION`: establish the problem and first spoken question.
- `CLUE_1`: partial answer that exposes a deeper issue.
- `QUESTION_2`: narrower question, closer to the real moral/emotional center.
- `CLUE_2`: second clue that sharpens the choice or value conflict.
- `QUESTION_3`: final inward question that almost answers itself.
- `CLUE_3`: concrete clue that unlocks the revelation.
- `REVELATION`: connect all three questions to the true belief.
- `RESOLUTION`: protagonist acts quickly from the revealed understanding.

Grounding rules:
- Each question must clearly arise from the previous clue.
- Questions cannot be three unrelated prompts.
- Clues must use actual situation material, not abstract moral narration.
- Revelation must solve the chain, not introduce a separate lesson.

Prohibited fallbacks:
- No generic detective prose.
- No repeated “why” lines that do not genuinely narrow.
- No clue that is only filler description.
- No ending where the hero learns something but does not act on it.

QA expectations:
- `postAssertion`: concrete situation details stay visible.
- `QA-002`: protagonist takes a meaningful action in the resolution.
- `QA-003`: clue-to-question-to-revelation causality remains visible.
- `QA-009`: manuscript must show a real reflective turn, not only summary.
- `QA-014`: ending lands with closure, not a lecture.

Representative pilot set:
- `SIT040`
- `SIT060`
- `SIT132`
- `SIT141`
- `SIT148`
