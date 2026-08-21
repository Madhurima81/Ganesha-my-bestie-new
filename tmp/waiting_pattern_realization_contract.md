# Waiting Pattern Realization Contract

Status: active Dev B family contract for live `T08` coverage.

Decision:
`T08` does not belong to the existing `T02` ritual-escalation family.

Why:
- The real situations are not about a spoken refrain returning under pressure.
- They are about the same waiting/hurry trigger recurring until the protagonist recognizes the pattern and interrupts it.
- The third recurrence must become a stopped pattern, not merely a changed sentence.

Covered now:
- `T08` natural live branch

Audited situations:
- `SIT008` Being hurried to put shoes on or leave
- `SIT086` Parent on work call when child wants to share something
- `SIT101` Long wait at doctor, bank, or during travel
- `SIT108` Waiting for a turn on the swings
- `SIT112` Waiting very excitedly for birthday or special package

Shared mechanism from real data:
- Trigger = hurry, delay, or waiting pressure.
- First reaction = immediate push against waiting.
- Second reaction = same impatience pattern returns with partial recognition.
- Third trigger = protagonist catches the pattern before repeating it.
- Pause = visible self-interruption.
- Change = protagonist uses patience, timing, or turn-taking differently on-page.

Pipeline:
`fillStoryTemplate -> buildTemplateRealizationContext -> waiting-pattern family realizer -> complete story`

Beat responsibilities for `T08`:
- `MISTAKE_1`: first impatience reaction to the trigger
- `IGNORE`: protagonist brushes past the first consequence
- `MISTAKE_2`: impatience returns in recognizably the same trigger shape
- `NOTICE`: pattern becomes visible
- `MISTAKE_3_AVOIDED`: trigger returns, but the old reaction is interrupted
- `PAUSE`: protagonist visibly stops
- `UNDERSTAND`: true belief surfaces as the explanation for the pattern
- `CHANGE`: protagonist acts differently and breaks the loop

Grounding rules:
- All three trigger beats must feel like the same kind of waiting/hurry pressure.
- The second beat must show some flicker of recognition.
- The third beat must not repeat the mistake.
- The change must be concrete: waiting, asking, pacing, sharing turns, or holding the good news for the right moment.

Prohibited fallbacks:
- No generic “be patient” moral summary without a recurring trigger.
- No copied T02 refrain structure.
- No ending where the protagonist only thinks differently but does not behave differently.
- No invented third mistake after the template explicitly requires avoidance.

QA expectations:
- `postAssertion`: actual situation details remain visible.
- `QA-002`: protagonist takes a meaningful changed action.
- `QA-003`: causal chain from trigger -> pattern notice -> interrupted third repetition stays visible.
- `QA-009`: reflective pause is visible in manuscript text.
- `QA-014`: ending carries closure, not only lesson language.

Representative pilot set:
- `SIT008`
- `SIT086`
- `SIT101`
- `SIT108`
- `SIT112`
