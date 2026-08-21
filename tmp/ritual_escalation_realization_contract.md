# Ritual Escalation Realization Contract

Status: active Dev B family contract for `LOGIC_RITUAL_ESCALATION`.

Purpose:
Realize stories whose engine is not event variety but the repeated return of one old line or pattern, followed by a deliberate pause and a changed return.

Covered now:
- `T02` natural pilot branch

Reserved branch:
- `T08` when selector/orphaning and natural coverage are ready

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> ritual-escalation family realizer -> complete story`

Mechanism:
- The protagonist meets one emotionally loaded pattern.
- The same old wording or same old response returns more than once.
- The surrounding situation escalates while the wording or behavior initially stays stuck.
- The protagonist pauses instead of repeating the old pattern one more time.
- The final return changes because the belief has changed.

Inputs:
- `storySeed.childExperience`
- `storySeed.immediateObstacle`
- `storySeed.emotionalTension`
- `storySeed.narrativeSummary`
- `realizedSituation.sentence`
- `realizedSituation.want`
- `belief.falseBelief`
- `belief.trueBelief`

Beat responsibilities for `T02`:
- `PROBLEM`: anchor the situation, immediate want, and old line.
- `REFRAIN_1`: repeat the old line unchanged after the first pressure point.
- `ATTEMPT`: show a real try that does not yet break the pattern.
- `REFRAIN_2`: repeat the old line again, still recognizably the same, under heavier emotional weight.
- `SETBACK`: show why the old pattern is failing now.
- `PAUSE`: explicit reflective interruption of the pattern.
- `REFRAIN_CHANGED`: return to the line in changed wording that carries the true belief.
- `NEW_ACTION`: protagonist acts from the changed line rather than merely stating it.

Grounding rules:
- The repeated line must come from the actual false belief, not a generic stock sentence.
- Escalation must come from situation-authored pressure, not decorative filler.
- The changed line must still sound like an audible transformation of the earlier line, not a disconnected moral.
- `NEW_ACTION` must be concretely tied to the situation's actual next step.

Prohibited fallbacks:
- No generic "the path continued" bridge prose.
- No repeated line that stays abstract while the surrounding scene is generic.
- No changed refrain that appears without a visible pause or interruption.
- No ending that claims change without showing a next action.

QA expectations:
- `postAssertion`: concrete situation detail remains visible.
- `QA-002`: protagonist acts meaningfully in the new action.
- `QA-003`: causal link from escalation to pause to changed action remains visible.
- `QA-007` and `QA-014`: last page carries closure signal, not just a belief label.
- `QA-009`: manuscript shows a reflective pause in actual prose.

Representative pilot set:
- `SIT006`
- `SIT025`
- `SIT054`
- `SIT067`
- `SIT124`
