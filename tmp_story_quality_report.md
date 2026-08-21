# Story Quality Corpus Report

Generated on 2026-08-10 for 71 real active situations using the actual Event Planner -> Final Story -> Compression pipeline.

## Summary

- PASS: 26
- WARNING: 28
- FAIL: 17
- Forms covered: F01, F02, F03, F04, F05
- Templates exercised: T03, T16, T21, T22, T23
- Architecture coverage: no-belief, belief, assumption

## Root Causes

- Supporting cast under-realized: 23 stories
  - SIT005 -> T03: Solo case introduces extra actor language, though it stays mostly hero-led.
  - SIT020 -> T03: Solo case introduces extra actor language, though it stays mostly hero-led.
  - SIT049 -> T03: Solo case introduces extra actor language, though it stays mostly hero-led.
  - SIT101 -> T03: Story keeps one support figure but flattens the larger cast context.
  - SIT113 -> T03: Solo case introduces extra actor language, though it stays mostly hero-led.
- Template mechanic visible only at skeleton level: 23 stories
  - SIT005 -> T03: Three-tries structure passes validation but reads flatter than the intended mechanic.
  - SIT020 -> T03: Three-tries structure passes validation but reads flatter than the intended mechanic.
  - SIT049 -> T03: Three-tries structure passes validation but reads flatter than the intended mechanic.
  - SIT101 -> T03: Three-tries structure passes validation but reads flatter than the intended mechanic.
  - SIT113 -> T03: Three-tries structure passes validation but reads flatter than the intended mechanic.
- Sentence-level prose feels formulaic: 5 stories
  - SIT031 -> T08: Protagonist naming or sentence construction feels repetitive/mechanical.
  - SIT069 -> T08: Protagonist naming or sentence construction feels repetitive/mechanical.
  - SIT123 -> T08: Protagonist naming or sentence construction feels repetitive/mechanical.
  - SIT140 -> T08: Protagonist naming or sentence construction feels repetitive/mechanical.
  - SIT157 -> T08: Did not reach a locked final story.
- Situation grounding or hero-want signal is weak: 2 stories
  - SIT089 -> T23: Situation remains recognizable through paraphrased concrete detail. The Situation has a clear want in metadata, but the manuscript underplays it.
  - SIT157 -> T08: Did not reach a locked final story. Did not reach a locked final story.
- Situation/template mismatch produces forced obstacle language: 1 stories
  - SIT157 -> T08: Did not reach a locked final story.

## Story Results

### SIT005 -> T03 - FAIL

- Situation: SIT005 - Can't finish homework
- Form / Template: F01 / T03
- Natural selector template: T03
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_FRUSTRATED
- Compression words: 68

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T03.
- C6: WARNING - Three-tries structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 4 situations (SIT005, SIT020, SIT049, SIT101): "Tara tried again, a different way instead."

Compression: Tara is working on a difficult homework task and cannot get the answer right. Tara wanted to finish the problem successfully, but the old thought said If I can't do it quickly, I can't do it. After a quiet "Wait," Tara chose to look again and understood that Every attempt helps me improve. Tara chose a different next step, and the problem eased into a warmer, freer ending.

### SIT020 -> T03 - FAIL

- Situation: SIT020 - Repeatedly failing a game level
- Form / Template: F01 / T03
- Natural selector template: T03
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_FRUSTRATED
- Compression words: 67

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T03.
- C6: WARNING - Three-tries structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 4 situations (SIT005, SIT020, SIT049, SIT101): "Tara tried again, a different way instead."

Compression: Tara has tried the same game level several times and keeps failing at the same point. Tara wanted to beat the level, but the old thought said If I keep failing, I should quit. After a quiet "Wait," Tara chose to look again and understood that Every challenge helps me become stronger. Tara chose a different next step, and the problem eased into a warmer, freer ending.

### SIT049 -> T03 - FAIL

- Situation: SIT049 - Falling and deciding whether to try again
- Form / Template: F01 / T03
- Natural selector template: T03
- Hero: Tara (Turtle)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_SCARED, EMO_UNSURE
- Compression words: 55

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T03.
- C6: WARNING - Three-tries structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 4 situations (SIT005, SIT020, SIT049, SIT101): "Tara tried again, a different way instead."

Compression: The body needs time and care to recover, and fear of falling again is real, and Tara believed Getting hurt means I should stop trying. Tara paused, chose to look again, and understood that I can heal, recover and keep growing. Tara chose a different response, and the ending felt warmer and freer than before.

### SIT101 -> T03 - FAIL

- Situation: SIT101 - Long wait at doctor, bank, or during travel
- Form / Template: F01 / T03
- Natural selector template: T18
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_BORED, EMO_FRUSTRATED
- Compression words: 55

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Story keeps one support figure but flattens the larger cast context.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T03.
- C6: WARNING - Three-tries structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 4 situations (SIT005, SIT020, SIT049, SIT101): "Tara tried again, a different way instead."

Compression: Tara's turn, appointment, or journey has not begun, and Tara believed Waiting is pointless and unbearable. Tara paused, chose to look again, and understood that I can use waiting time calmly and wisely. Tara chose a different response, and the ending felt warmer and freer than before. The change was clear in what happened next.

### SIT113 -> T03 - FAIL

- Situation: SIT113 - Trying to learn a very hard new concept
- Form / Template: F01 / T03
- Natural selector template: T03
- Hero: Chinu (Squirrel)
- World: Ancient Banyan Grove
- Obstacle: Hidden Clue
- Emotions: EMO_FRUSTRATED, EMO_WORRIED
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T03.
- C6: WARNING - Three-tries structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 5 situations (SIT113, SIT054, SIT102, SIT124, SIT168): "While wondering what to do, Chinu noticed a half-open door nearby."

Compression: The concept still does not make sense to Chinu, and Chinu believed If I don't understand quickly, I'm not smart. Chinu paused, chose to look again, and understood that Understanding grows with patience and practice. Chinu chose a different response, and the ending felt warmer and freer than before. The change was clear in what happened next.

### SIT001 -> T18 - WARNING

- Situation: SIT001 - Toy not shared or taken away
- Form / Template: F01 / T18
- Natural selector template: T18
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_ANGRY, EMO_FRUSTRATED
- Compression words: 68

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T18.
- C6: WARNING - Escalate-then-pause structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - Turning-point beat was not found in the event chain.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Kavi is playing with a favourite toy when another child picks it up and walks away with it, and the old thought said I have to react when things feel unfair. Grabbing back only turned it into a bigger fight, until it turned out it was only ever about wanting the toy back. Kavi solved that smaller real problem instead of the original trigger, and it actually worked.

### SIT101 -> T18 - FAIL

- Situation: SIT101 - Long wait at doctor, bank, or during travel
- Form / Template: F01 / T18
- Natural selector template: T18
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_BORED, EMO_FRUSTRATED
- Compression words: 53

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Story keeps one support figure but flattens the larger cast context.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T18.
- C6: WARNING - Escalate-then-pause structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - Turning-point beat was not found in the event chain.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 4 situations (SIT005, SIT020, SIT049, SIT101): "Tara tried again, a different way instead."

Compression: Tara's turn, appointment, or journey has not begun, and the old thought said Waiting is pointless and unbearable. Checking the clock over and over only made the wait feel longer, until it turned out there had been nothing to hold Tara's attention. Tara solved that smaller real problem instead of the original trigger.

### SIT015 -> T18 - WARNING

- Situation: SIT015 - Forced to sit still too long (car, flight)
- Form / Template: F01 / T18
- Natural selector template: T18
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_FRUSTRATED, EMO_BORED
- Compression words: 67

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T18.
- C6: WARNING - Escalate-then-pause structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - Turning-point beat was not found in the event chain.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Kavi is travelling in a car or plane and has been sitting for a long time, and the old thought said I can't stay calm when I feel trapped. Holding still harder only made the energy back up further, until it turned out there had been no small outlet for the energy. Kavi solved that smaller real problem instead of the original trigger, and it actually worked.

### SIT105 -> T18 - WARNING

- Situation: SIT105 - Trying to do homework while TV is on
- Form / Template: F01 / T18
- Natural selector template: T18
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_FRUSTRATED
- Compression words: 62

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T18.
- C6: WARNING - Escalate-then-pause structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - Turning-point beat was not found in the event chain.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Kavi is doing homework while an exciting programme is playing nearby, and the old thought said I can't focus when there are distractions. Forcing the focus only made the mind wander further, until it turned out it was only ever one unread line, not a broken focus. Kavi solved that smaller real problem instead of the original trigger, and it actually worked.

### SIT136 -> T18 - WARNING

- Situation: SIT136 - Wants to play but knows they should study
- Form / Template: F01 / T18
- Natural selector template: T18
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_TORN
- Compression words: 64

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T18.
- C6: WARNING - Escalate-then-pause structure passes validation but reads flatter than the intended mechanic.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - Turning-point beat was not found in the event chain.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Kavi has homework still to finish when an exciting opportunity to play appears, and the old thought said I should always do what feels fun now. Treating it as a choice only made both things feel impossible, until it turned out the order was backwards, not the choice itself. Kavi solved that smaller real problem instead of the original trigger, and it actually worked.

### SIT048 -> T14 - WARNING

- Situation: SIT048 - Not invited to a birthday party
- Form / Template: F01 / T14
- Natural selector template: T14
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_LEFT_OUT, EMO_SAD
- Compression words: 50

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T14.
- C6: PASS - Receive-remember-give mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The party invitation has already been decided, and Bodhi believed Being left out means nobody likes me. Bodhi paused, chose to look again, and understood that One invitation does not decide my worth or my friendships. Bodhi chose a different response, and the ending felt warmer and freer than before.

### SIT046 -> T14 - PASS

- Situation: SIT046 - Harshly reprimanded by a parent
- Form / Template: F01 / T14
- Natural selector template: T14
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Friends Disagree
- Emotions: EMO_SAD, EMO_ASHAMED
- Compression words: 65

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T14.
- C6: PASS - Receive-remember-give mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi makes a mistake and a parent reacts angrily. Bodhi wanted to feel loved and safe again, but the old thought said When I make mistakes, I'm not loved. After a quiet "Wait," Bodhi chose to look again and understood that I can make mistakes and still be deeply loved. Bodhi chose a different next step, and the problem eased into a warmer, freer ending.

### SIT065 -> T14 - WARNING

- Situation: SIT065 - Getting acne or pimples (older kids)
- Form / Template: F01 / T14
- Natural selector template: T14
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_ASHAMED
- Compression words: 69

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T14.
- C6: PASS - Receive-remember-give mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi notices a new pimple before going to school. Bodhi wanted to hide it or stop worrying about how others will see them, but the old thought said I have to look perfect to be accepted. After a quiet "Wait," Bodhi chose to look again and understood that My appearance doesn't define my value. Bodhi chose a different next step, and the problem eased into a warmer, freer ending.

### SIT051 -> T14 - PASS

- Situation: SIT051 - Close friend moved to another city
- Form / Template: F01 / T14
- Natural selector template: T14
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_SAD, EMO_GRIEVING
- Compression words: 61

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T14.
- C6: PASS - Receive-remember-give mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi's closest friend moves to another city. Bodhi wanted to keep the friendship alive, but the old thought said If someone leaves, our friendship is over. After a quiet "Wait," Bodhi chose to look again and understood that Real friendships can continue across distance and time. Bodhi chose a different next step, and the problem eased into a warmer, freer ending.

### SIT013 -> T14 - PASS

- Situation: SIT013 - Adult doesn't understand what they mean
- Form / Template: F01 / T14
- Natural selector template: T14
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_FRUSTRATED
- Compression words: 66

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T14.
- C6: PASS - Receive-remember-give mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi explains something important to a parent, but the parent misunderstands. Bodhi wanted to be understood, but the old thought said If people don't understand me, something is wrong with me. After a quiet "Wait," Bodhi chose to look again and understood that I can express myself patiently and be myself. Bodhi chose a different next step, and the problem eased into a warmer, freer ending.

### SIT028 -> T15 - PASS

- Situation: SIT028 - Unfamiliar adult
- Form / Template: F01 / T15
- Natural selector template: T15
- Hero: Mitra (Dog)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_UNSURE, EMO_SCARED
- Compression words: 54

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T15.
- C6: PASS - Assumption-then-reversal mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Mitra doesn't know this person yet, and the usual trusted adult isn't right there, and Mitra believed New people won't understand or help me. Mitra paused, chose to look again, and understood that Trust grows one step at a time. Mitra chose a different response, and the ending felt warmer and freer than before.

### SIT024 -> T15 - PASS

- Situation: SIT024 - Parent leaving for a long trip
- Form / Template: F01 / T15
- Natural selector template: T15
- Hero: Mitra (Dog)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_SAD, EMO_WORRIED
- Compression words: 50

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T15.
- C6: PASS - Assumption-then-reversal mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The parent has to leave, and Mitra believed When someone leaves, they might not come back. Mitra paused, chose to look again, and understood that I can trust the people who love and care for me. Mitra chose a different response, and the ending felt warmer and freer than before.

### SIT034 -> T15 - PASS

- Situation: SIT034 - Overheard adults talking about money problems
- Form / Template: F01 / T15
- Natural selector template: T08
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_WORRIED
- Compression words: 66

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T15.
- C6: PASS - Assumption-then-reversal mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Arin overhears parents discussing a money problem. Arin wanted to know whether the family will be okay, but the old thought said We won't be okay if money is tight. After a quiet "Wait," Arin chose to look again and understood that Families work together and find solutions during hard times. Arin chose a different next step, and the problem eased into a warmer, freer ending.

### SIT119 -> T15 - PASS

- Situation: SIT119 - Favourite teacher changes mid-year
- Form / Template: F01 / T15
- Natural selector template: T08
- Hero: Mitra (Dog)
- World: Whispering Forest
- Obstacle: Fear
- Emotions: EMO_SAD, EMO_WORRIED
- Compression words: 67

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T15.
- C6: PASS - Assumption-then-reversal mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Mitra learns that a favourite teacher will leave and be replaced by someone new. Mitra wanted to keep the classroom the way it is, but the old thought said Good things never last. After a quiet "Wait," Mitra chose to look again and understood that New people can also become trusted guides. Mitra chose a different next step, and the problem eased into a warmer, freer ending.

### SIT156 -> T15 - PASS

- Situation: SIT156 - Friend breaks a promise
- Form / Template: F01 / T15
- Natural selector template: T15
- Hero: Mitra (Dog)
- World: Whispering Forest
- Obstacle: Fear
- Emotions: EMO_SAD, EMO_ANGRY
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T15.
- C6: PASS - Assumption-then-reversal mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The friend has already failed to keep their word, and Mitra believed Once trust is broken, it can never be repaired. Mitra paused, chose to look again, and understood that Honest conversations and actions can rebuild trust. Mitra chose a different response, and the ending felt warmer and freer than before.

### SIT142 -> T15 - PASS

- Situation: SIT142 - Someone online asked for their personal password
- Form / Template: F01 / T15
- Natural selector template: T15
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_UNSURE, EMO_SCARED
- Compression words: 53

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T15.
- C6: PASS - Assumption-then-reversal mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Sharing the information could put Arin's account or privacy at risk, and Arin believed Everyone online can be trusted. Arin paused, chose to look again, and understood that I protect myself by making safe choices and asking trusted adults. Arin chose a different response, and the ending felt warmer and freer than before.

### SIT099 -> T15 - WARNING

- Situation: SIT099 - Noisy, overcrowded mall or festival environment
- Form / Template: F01 / T15
- Natural selector template: T15
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_OVERWHELMED
- Compression words: 54

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T15.
- C6: PASS - Assumption-then-reversal mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: There is noise and movement in every direction, and Arin believed I can't cope when everything feels overwhelming. Arin paused, chose to look again, and understood that I can notice what I need and find calm even in busy places. Arin chose a different response, and the ending felt warmer and freer than before.

### SIT137 -> T04 - WARNING

- Situation: SIT137 - Tempted to look at friend's paper during a test
- Form / Template: F01 / T04
- Natural selector template: T04
- Hero: Simha (Lion)
- World: Whispering Forest
- Obstacle: Fear
- Emotions: EMO_TORN, EMO_GUILTY
- Compression words: 66

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T04.
- C6: PASS - Question-chain-then-revelation mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Simha gets stuck on a test question and can see a friend's answer nearby. Simha wanted to get the answer right, but the old thought said Cheating is okay if it helps me succeed. After a quiet "Wait," Simha chose to look again and understood that Honest effort builds real confidence. Simha chose a different next step, and the problem eased into a warmer, freer ending.

### SIT009 -> T09 - WARNING

- Situation: SIT009 - Feeling hungry or extremely tired (hangry)
- Form / Template: F01 / T09
- Natural selector template: T09
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_CRANKY
- Compression words: 55

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T09.
- C6: PASS - Big-attempt-fails-then-quiet-quality mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - Turning-point beat reads too close to the setup beat — nothing concrete seems to change.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Hunger or tiredness is making ordinary things feel much harder, and Arin believed I can't cope when my body feels uncomfortable. Arin paused, chose to look again, and understood that I can care for my body and uncomfortable moments will pass. Arin chose a different response, and the ending felt warmer and freer than before.

### SIT019 -> T09 - WARNING

- Situation: SIT019 - Scratchy clothes
- Form / Template: F01 / T09
- Natural selector template: T09
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_FRUSTRATED
- Compression words: 65

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T09.
- C6: PASS - Big-attempt-fails-then-quiet-quality mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Arin is wearing a shirt that feels scratchy and irritating. Arin wanted to get comfortable, but the old thought said I can't be okay when things feel uncomfortable. After a quiet "Wait," Arin chose to look again and understood that I can stay peaceful even when my surroundings aren't perfect. Arin chose a different next step, and the problem eased into a warmer, freer ending.

### SIT029 -> T09 - WARNING

- Situation: SIT029 - Fear of getting lost in a mall or crowd
- Form / Template: F01 / T09
- Natural selector template: T09
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_SCARED
- Compression words: 67

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T09.
- C6: PASS - Big-attempt-fails-then-quiet-quality mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Arin looks up in a busy place and suddenly cannot see their parent. Arin wanted to find the parent, but the old thought said If I'm alone, I'm not safe. After a quiet "Wait," Arin chose to look again and understood that I can stay calm, make wise choices and find help. Arin chose a different next step, and the problem eased into a warmer, freer ending.

### SIT030 -> T09 - WARNING

- Situation: SIT030 - Accidentally saw a scary or violent video
- Form / Template: F01 / T09
- Natural selector template: T09
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_SCARED
- Compression words: 54

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T09.
- C6: PASS - Big-attempt-fails-then-quiet-quality mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The video is over, but the memory of it remains, and Arin believed The scary things I see will happen to me. Arin paused, chose to look again, and understood that I can separate imagination from reality and seek comfort. Arin chose a different response, and the ending felt warmer and freer than before.

### SIT036 -> T05 - PASS

- Situation: SIT036 - Fear of being laughed at by class
- Form / Template: F01 / T05
- Natural selector template: T05
- Hero: Tara (Turtle)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_NERVOUS, EMO_SCARED
- Compression words: 68

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T05.
- C6: PASS - Mirror-return-then-changed-response mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Tara has to answer, perform or show something in front of the class. Tara wanted to avoid being laughed at, but the old thought said If others laugh at me, I don't matter. After a quiet "Wait," Tara chose to look again and understood that My value isn't decided by other people's opinions. Tara chose a different next step, and the problem eased into a warmer, freer ending.

### SIT057 -> T05 - PASS

- Situation: SIT057 - Not chosen for a special school role
- Form / Template: F01 / T05
- Natural selector template: T05
- Hero: Tara (Turtle)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_DISAPPOINTED, EMO_SAD
- Compression words: 56

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T05.
- C6: PASS - Mirror-return-then-changed-response mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The decision has already been made, and Tara believed If I'm not chosen, I'm not good enough. Tara paused, chose to look again, and understood that My worth isn't decided by awards or roles. Tara chose a different response, and the ending felt warmer and freer than before. The change was clear in what happened next.

### SIT066 -> T05 - PASS

- Situation: SIT066 - Being shortest or tallest in the class line
- Form / Template: F01 / T05
- Natural selector template: T05
- Hero: Tara (Turtle)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_ASHAMED, EMO_COMPARING
- Compression words: 66

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T05.
- C6: PASS - Mirror-return-then-changed-response mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Tara notices they are much shorter or taller than the other children while lining up. Tara wanted to avoid feeling different, but the old thought said Being different makes me less important. After a quiet "Wait," Tara chose to look again and understood that Everyone grows in their own unique way. Tara chose a different next step, and the problem eased into a warmer, freer ending.

### SIT084 -> T05 - PASS

- Situation: SIT084 - Classmate won Student of the Month
- Form / Template: F01 / T05
- Natural selector template: T05
- Hero: Tara (Turtle)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_JEALOUS, EMO_DISAPPOINTED
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T05.
- C6: PASS - Mirror-return-then-changed-response mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The recognition has gone to someone else, and Tara believed Someone else's success means I'm not successful. Tara paused, chose to look again, and understood that I can celebrate others while continuing my own journey. Tara chose a different response, and the ending felt warmer and freer than before. The change was clear in what happened next.

### SIT133 -> T19 - WARNING

- Situation: SIT133 - Tempted to steal something
- Form / Template: F01 / T19
- Natural selector template: T23
- Hero: Simha (Lion)
- World: Whispering Forest
- Obstacle: Fear
- Emotions: EMO_TORN, EMO_GUILTY
- Compression words: 53

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T19.
- C6: PASS - Crossroads-then-deliberate-choice mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Taking it means knowingly stealing, and saying no risks looking uncool, and Simha believed I must follow my friends to belong. Simha paused, chose to look again, and understood that Doing what's right is more important than fitting in. Simha chose a different response, and the ending felt warmer and freer than before.

### SIT137 -> T19 - WARNING

- Situation: SIT137 - Tempted to look at friend's paper during a test
- Form / Template: F01 / T19
- Natural selector template: T04
- Hero: Simha (Lion)
- World: Whispering Forest
- Obstacle: Fear
- Emotions: EMO_TORN, EMO_GUILTY
- Compression words: 66

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T19.
- C6: PASS - Crossroads-then-deliberate-choice mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Simha gets stuck on a test question and can see a friend's answer nearby. Simha wanted to get the answer right, but the old thought said Cheating is okay if it helps me succeed. After a quiet "Wait," Simha chose to look again and understood that Honest effort builds real confidence. Simha chose a different next step, and the problem eased into a warmer, freer ending.

### SIT045 -> T22 - PASS

- Situation: SIT045 - Lost a favourite toy or comfort blanket
- Form / Template: F02 / T22
- Natural selector template: T22
- Hero: Arin (Rabbit)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_SAD
- Compression words: 54

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F02 / T22.
- C6: PASS - Reframe-trail mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Arin discovers that a favourite toy or comfort blanket is missing, while the old thought said I can't be okay without this special thing. Arin searched but couldn't find their toy, until Arin understood that The love and comfort I feel live inside me too. Arin got ready for bed anyway, calmer for it.

### SIT083 -> T22 - PASS

- Situation: SIT083 - Friend got a new toy
- Form / Template: F02 / T22
- Natural selector template: T22
- Hero: Gauri (Cow)
- World: Woodland Village
- Obstacle: Friends Disagree
- Emotions: EMO_JEALOUS, EMO_COMPARING
- Compression words: 62

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F02 / T22.
- C6: PASS - Reframe-trail mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Gauri sees a friend bring a brand-new toy to school, and everyone gathers around to see it, while the old thought said I need what others have to be happy. Gauri kept comparing their own things to it, until Gauri understood that Gratitude brings more joy than comparison. Gauri joined in and shared their own thing too, calmer about it than before.

### SIT139 -> T22 - PASS

- Situation: SIT139 - Broke something by mistake and hid it
- Form / Template: F02 / T22
- Natural selector template: T22
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_GUILTY
- Compression words: 55

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F02 / T22.
- C6: PASS - Reframe-trail mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Kavi accidentally breaks something important and hides what happened instead of telling the truth, while the old thought said Hiding mistakes makes them disappear. Hiding it only made the worry grow, until Kavi understood that Taking responsibility helps rebuild trust. Kavi told the truth instead, and the relief was bigger than the worry had been.

### SIT148 -> T22 - PASS

- Situation: SIT148 - Found something and doesn't know whether to keep it
- Form / Template: F02 / T22
- Natural selector template: T22
- Hero: Ved (Owl)
- World: Temple Courtyard
- Obstacle: Hidden Clue
- Emotions: EMO_TORN
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F02 / T22.
- C6: PASS - Reframe-trail mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Ved finds something valuable or interesting that clearly belongs to someone else, while the old thought said If I found it, it belongs to me. Ved turned the found item over, wondering who it belonged to, until Ved understood that Doing the right thing matters more than getting something extra. Ved returned it, and walked off lighter.

### SIT154 -> T22 - PASS

- Situation: SIT154 - Friend copies their work or idea
- Form / Template: F02 / T22
- Natural selector template: T22
- Hero: Vani (Parrot)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_ANGRY, EMO_FRUSTRATED
- Compression words: 61

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F02 / T22.
- C6: PASS - Reframe-trail mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Vani shares an idea for a drawing, project, game, or creation, and a friend uses the same idea, while the old thought said If someone copies me, I've lost what makes me special. Vani almost stayed quiet about it, until Vani understood that My ideas and creativity remain valuable. Vani spoke up about it, and felt steadier for having said it.

### SIT040 -> T16 - FAIL

- Situation: SIT040 - Fear of getting in trouble with teacher
- Form / Template: F03 / T16
- Natural selector template: T16
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_WORRIED, EMO_SCARED
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F03 / T16.
- C6: PASS - Reinterpretation mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT040, SIT132): "Tara wanted to avoid getting into trouble."

Compression: Tara realizes they made a mistake at school and worries the teacher will be angry, and the old thought said Making mistakes makes me a bad child. Tara told the truth instead of hiding it. Tara and the moment settled, calmer for it. The change was clear in what happened next.

### SIT064 -> T16 - PASS

- Situation: SIT064 - New glasses and feeling 'nerdy' or 'ugly'
- Form / Template: F03 / T16
- Natural selector template: T16
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_ASHAMED, EMO_EMBARRASSED
- Compression words: 55

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F03 / T16.
- C6: PASS - Reinterpretation mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi gets new glasses and feels strange seeing their own face in them, and the old thought said Looking different makes me less lovable. Someone's actual reaction wasn't the one Bodhi had braced for. Bodhi stopped watching for a reaction that was never coming, steadier for it. The change was clear in what happened next.

### SIT067 -> T16 - PASS

- Situation: SIT067 - Being slower at reading than others
- Form / Template: F03 / T16
- Natural selector template: T16
- Hero: Chinu (Squirrel)
- World: Whispering Forest
- Obstacle: Hidden Clue
- Emotions: EMO_ASHAMED
- Compression words: 52

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F03 / T16.
- C6: PASS - Reinterpretation mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Chinu is still working on a reading skill while classmates seem to finish quickly, and the old thought said If I learn slowly, I'm not smart. Chinu tried it out loud, unprompted, just to see. Chinu kept going at their own pace, steadier now. The change was clear in what happened next.

### SIT077 -> T16 - WARNING

- Situation: SIT077 - Why can't you be more like [cousin/friend]?
- Form / Template: F03 / T16
- Natural selector template: T16
- Hero: Tara (Turtle)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_ASHAMED, EMO_COMPARING
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Story keeps one support figure but flattens the larger cast context.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F03 / T16.
- C6: PASS - Reinterpretation mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: An adult tells Tara they should be more like a cousin or friend, and the old thought said I have to be like someone else to be valued. A specific memory surfaced on its own. Tara answered honestly instead of shrinking, standing steadier. The change was clear in what happened next.

### SIT128 -> T16 - WARNING

- Situation: SIT128 - Waiting anxiously for exam results
- Form / Template: F03 / T16
- Natural selector template: T16
- Hero: Chinu (Squirrel)
- World: Ancient Banyan Grove
- Obstacle: Hidden Clue
- Emotions: EMO_WORRIED, EMO_NERVOUS
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F03 / T16.
- C6: PASS - Reinterpretation mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Chinu has finished an important exam and now has to wait several days before the result is released, and the old thought said My marks decide my value. There was nothing new to check or find yet. Chinu let the waiting stop feeling like a verdict, calmer for it. The change was clear in what happened next.

### SIT042 -> T23 - WARNING

- Situation: SIT042 - Friend doesn't want to play today
- Form / Template: F04 / T23
- Natural selector template: T23
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_SAD, EMO_LEFT_OUT
- Compression words: 55

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F04 / T23.
- C6: PASS - Self-reinterpretation mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi asks a friend to play, but the friend says they don't want to play today, and the old thought said If my friend chooses someone else, I'm not important. The same wave came anyway, before Bodhi's friend ran off, same as any other day. Bodhi asked for tomorrow instead of writing the friendship off.

### SIT086 -> T23 - WARNING

- Situation: SIT086 - Parent on work call when child wants to share something
- Form / Template: F04 / T23
- Natural selector template: T23
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_FRUSTRATED, EMO_LEFT_OUT
- Compression words: 61

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F04 / T23.
- C6: PASS - Self-reinterpretation mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Tara has exciting news they have been saving to tell a parent, but the parent starts an important work call, and the old thought said If I have to wait, what I want to say isn't important. Mid-call, Tara still got a caught eye and a mouthed "one minute". Tara let the call end instead of standing there watching the clock.

### SIT089 -> T23 - WARNING

- Situation: SIT089 - New sibling gets all the attention and new things
- Form / Template: F04 / T23
- Natural selector template: T23
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_JEALOUS, EMO_LEFT_OUT
- Compression words: 54

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: WARNING - The Situation has a clear want in metadata, but the manuscript underplays it.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F04 / T23.
- C6: WARNING - Self-reinterpretation structure passes, but the mechanism-specific beat may read formulaically.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi has something they want to show the family, but everyone is gathered around the new baby, and the old thought said The new baby has replaced me. The camera turned toward Bodhi too, without anyone having to ask. Bodhi held the picture up and ended up in the same photo as the baby.

### SIT123 -> T23 - FAIL

- Situation: SIT123 - Friend suddenly acting different or 'cooler'
- Form / Template: F04 / T23
- Natural selector template: T23
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_UNSURE, EMO_WORRIED
- Compression words: 61

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F04 / T23.
- C6: WARNING - Self-reinterpretation structure passes, but the mechanism-specific beat may read formulaically.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT069, SIT123): "That clue did not stay alone for long."

Compression: Bodhi notices that a close friend has started talking, behaving, or dressing differently around other children, and the old thought said I have to change to keep my friends. Bodhi's friend still sat right there at lunch, same seat as always, cooler words and all. Bodhi dropped the copied voice and told the old joke the way that was actually theirs.

### SIT158 -> T23 - PASS

- Situation: SIT158 - Friend apologises after hurting them
- Form / Template: F04 / T23
- Natural selector template: T23
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_SAD, EMO_UNSURE
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F04 / T23.
- C6: PASS - Self-reinterpretation mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: A friend who hurt Bodhi's feelings comes back and apologises, and the old thought said Holding on to hurt keeps me safe. The hurt stayed put in the middle of the chest, right there even after the apology came. Bodhi accepted the apology anyway, without pretending the hurt was already gone.

### SIT006 -> T21 - FAIL

- Situation: SIT006 - Playdate or plan suddenly cancelled
- Form / Template: F05 / T21
- Natural selector template: T21
- Hero: Chinu (Squirrel)
- World: Waterfall Caves
- Obstacle: Hidden Clue
- Emotions: EMO_DISAPPOINTED, EMO_SAD
- Compression words: 52

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F05 / T21.
- C6: WARNING - Disrupted-plan structure passes, but the two-step disruption may read formulaically.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT006, SIT120): "Chinu checked anyway, like it might still happen after all."

Compression: Chinu is ready for a playdate when they learn the friend cannot come, and the old thought said Plans must happen my way. Chinu tried to recreate the same plan alone, and it fell flat. Chinu picked something new instead, and it actually worked. The change was clear in what happened next.

### SIT111 -> T21 - PASS

- Situation: SIT111 - Uncomfortable uniform, flickering lights, strong smells
- Form / Template: F05 / T21
- Natural selector template: T21
- Hero: Arin (Rabbit)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_OVERWHELMED, EMO_FRUSTRATED
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F05 / T21.
- C6: PASS - Disrupted-plan mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: During class, Arin is distracted by an uncomfortable uniform, flickering light, strong smell, or another persistent sensory irritation, and the old thought said I can't cope when things feel uncomfortable. Arin gritted through it, same as any other day, and missed most of what mattered. Arin asked for what would actually help, instead of pushing through alone.

### SIT118 -> T21 - PASS

- Situation: SIT118 - Starting at a completely new school
- Form / Template: F05 / T21
- Natural selector template: T21
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Friends Disagree
- Emotions: EMO_NERVOUS, EMO_UNSURE
- Compression words: 52

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F05 / T21.
- C6: PASS - Disrupted-plan mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi begins at a school where the teachers, children, classrooms, and routines are all unfamiliar, and the old thought said Nobody will accept me. Bodhi picked a direction and walked like it was already familiar — it wasn't. Bodhi asked the next person who walked past, and got pointed the right way.

### SIT120 -> T21 - FAIL

- Situation: SIT120 - Sudden cancellation of a normal routine event
- Form / Template: F05 / T21
- Natural selector template: T21
- Hero: Chinu (Squirrel)
- World: Temple Courtyard
- Obstacle: Hidden Clue
- Emotions: EMO_DISAPPOINTED
- Compression words: 55

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F05 / T21.
- C6: WARNING - Disrupted-plan structure passes, but the two-step disruption may read formulaically.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT006, SIT120): "Chinu checked anyway, like it might still happen after all."

Compression: Chinu has been looking forward to a familiar weekly activity, but learns shortly before it begins that it has been cancelled, and the old thought said Everything has to happen the way I expected. Chinu tried to recreate the same plan alone, and it fell flat. Chinu picked something new instead, and it actually worked.

### SIT164 -> T21 - PASS

- Situation: SIT164 - A younger child wants to join the game
- Form / Template: F05 / T21
- Natural selector template: T21
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_TORN, EMO_LEFT_OUT
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F05 / T21.
- C6: PASS - Disrupted-plan mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi and friends are playing a game when a younger child asks if they can join, and the old thought said Younger children will spoil our fun. Bodhi tried to keep the game exactly the same, and the fun went thin. Bodhi waved them in, and it turned out to be more fun with one more player.

### SIT060 -> T16 - FAIL

- Situation: SIT060 - Intentions were good but they got in trouble anyway
- Form / Template: F03 / T16
- Natural selector template: T16
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_GUILTY, EMO_FRUSTRATED
- Compression words: 52

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F03 / T16.
- C6: PASS - Reinterpretation mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT040, SIT060): "Tara braced for anger, already deciding the mistake meant something bad about who Tara was."

Compression: Tara tries to help someone without being asked, and the attempt accidentally creates a problem, and the old thought said Good intentions don't matter if I make mistakes. Tara told the truth instead of hiding it. Tara and the moment settled, calmer for it. The change was clear in what happened next.

### SIT132 -> T16 - FAIL

- Situation: SIT132 - Told a lie to a parent and feels a 'heavy' stomach
- Form / Template: F03 / T16
- Natural selector template: T16
- Hero: Tara (Turtle)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_GUILTY
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F03 / T16.
- C6: PASS - Reinterpretation mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT040, SIT132): "Tara wanted to avoid getting into trouble."

Compression: Tara has lied to a parent about something and now has to decide whether to tell the truth, and the old thought said Hiding the truth will protect me. The uneasy feeling only got heavier the longer it was carried. Tara said the real thing out loud, and it felt lighter.

### SIT133 -> T23 - PASS

- Situation: SIT133 - Tempted to steal something
- Form / Template: F04 / T23
- Natural selector template: T23
- Hero: Simha (Lion)
- World: Whispering Forest
- Obstacle: Fear
- Emotions: EMO_TORN, EMO_GUILTY
- Compression words: 63

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F04 / T23.
- C6: PASS - Self-reinterpretation mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Simha is with friends at a shop or another child's house, and a friend dares Simha to slip something small into their pocket without paying or asking, and the old thought said I must follow my friends to belong. Simha's own hand stopped on its own, before any decision was made out loud. Simha said no and stayed part of the group anyway.

### SIT141 -> T22 - PASS

- Situation: SIT141 - Saw a parent or teacher break a rule they enforce
- Form / Template: F02 / T22
- Natural selector template: T22
- Hero: Tara (Turtle)
- World: Misty Mountains
- Obstacle: Broken Bridge
- Emotions: EMO_CONFUSED_RIGHT_WRONG
- Compression words: 62

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F02 / T22.
- C6: PASS - Reframe-trail mechanic is visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Tara notices a parent or teacher doing something they have previously told Tara not to do, while the old thought said Rules only matter when they're convenient. Tara kept comparing their own things to it, until Tara understood that I can choose integrity regardless of what others do. Tara joined in and shared their own thing too, calmer about it than before.

### SIT157 -> T21 - FAIL

- Situation: SIT157 - Rumours or gossip spread about them
- Form / Template: F05 / T21
- Natural selector template: T21
- Hero: Simha (Lion)
- World: Ancient Banyan Grove
- Obstacle: Broken Bridge
- Emotions: EMO_EMBARRASSED, EMO_ANGRY
- Compression words: 56

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F05 / T21.
- C6: PASS - Disrupted-plan mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT031, SIT157): "In this situation, that was how the fear spread faster than the real information."

Compression: Simha discovers that other children are spreading a rumour about them, and the old thought said I have to prove myself to everyone. Simha tried to argue the story down, and it only got bigger. Simha stopped chasing the conversation and just kept showing up the same way. The change was clear in what happened next.

### SIT054 -> T02 - WARNING

- Situation: SIT054 - Highly anticipated movie or event cancelled
- Form / Template: F01 / T02
- Natural selector template: T02
- Hero: Chinu (Squirrel)
- World: Ancient Banyan Grove
- Obstacle: Hidden Clue
- Emotions: EMO_DISAPPOINTED, EMO_SAD
- Compression words: 67

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T02.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: WARNING - Sentence reused verbatim across 5 situations (SIT113, SIT054, SIT102, SIT124, SIT168): "While wondering what to do, Chinu noticed a half-open door nearby." (non-blocking: T02 does not have a Realization Contract yet)

Compression: Chinu has been excited about a special outing or event, but it is cancelled. Chinu wanted to have the planned experience happen, but the old thought said If plans change, everything is ruined. After a quiet "Wait," Chinu chose to look again and understood that New opportunities can grow from unexpected changes. Chinu chose a different next step, and the problem eased into a warmer, freer ending.

### SIT102 -> T02 - WARNING

- Situation: SIT102 - Stuck indoors on a rainy day with nothing to do
- Form / Template: F01 / T02
- Natural selector template: T02
- Hero: Chinu (Squirrel)
- World: Waterfall Caves
- Obstacle: Hidden Clue
- Emotions: EMO_BORED
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T02.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: WARNING - Sentence reused verbatim across 5 situations (SIT113, SIT054, SIT102, SIT124, SIT168): "While wondering what to do, Chinu noticed a half-open door nearby." (non-blocking: T02 does not have a Realization Contract yet)

Compression: Chinu cannot go outside and has run out of ideas, and Chinu believed Fun only happens when things go as planned. Chinu paused, chose to look again, and understood that I can create joy wherever I am. Chinu chose a different response, and the ending felt warmer and freer than before.

### SIT124 -> T02 - WARNING

- Situation: SIT124 - Game or app changes interface completely
- Form / Template: F01 / T02
- Natural selector template: T02
- Hero: Chinu (Squirrel)
- World: Temple Courtyard
- Obstacle: Hidden Clue
- Emotions: EMO_FRUSTRATED, EMO_UNSURE
- Compression words: 58

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: WARNING - Solo case introduces extra actor language, though it stays mostly hero-led.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T02.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: WARNING - Sentence reused verbatim across 5 situations (SIT113, SIT054, SIT102, SIT124, SIT168): "While wondering what to do, Chinu noticed a half-open door nearby." (non-blocking: T02 does not have a Realization Contract yet)

Compression: The buttons, menus, and paths Chinu knows are no longer where they used to be, and Chinu believed I don't like change, so I can't enjoy it. Chinu paused, chose to look again, and understood that I can learn new ways of doing things. Chinu chose a different response, and the ending felt warmer and freer than before.

### SIT168 -> T02 - WARNING

- Situation: SIT168 - Group project where everyone has different ideas
- Form / Template: F01 / T02
- Natural selector template: T02
- Hero: Chinu (Squirrel)
- World: Temple Courtyard
- Obstacle: Hidden Clue
- Emotions: EMO_FRUSTRATED, EMO_TORN
- Compression words: 56

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T02.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: WARNING - Sentence reused verbatim across 5 situations (SIT113, SIT054, SIT102, SIT124, SIT168): "While wondering what to do, Chinu noticed a half-open door nearby." (non-blocking: T02 does not have a Realization Contract yet)

Compression: The group cannot agree on which idea to follow, and Chinu believed My idea has to be chosen. Chinu paused, chose to look again, and understood that Great ideas grow when people work together. Chinu chose a different response, and the ending felt warmer and freer than before. The change was clear in what happened next.

### SIT031 -> T08 - FAIL

- Situation: SIT031 - Heard about war or violence on news
- Form / Template: F01 / T08
- Natural selector template: T08
- Hero: Arin (Rabbit)
- World: Secret Library
- Obstacle: Hidden Clue
- Emotions: EMO_WORRIED, EMO_SCARED
- Compression words: 67

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T08.
- C6: PASS - Accumulated-pattern discovery mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: WARNING - Protagonist naming or sentence construction feels repetitive/mechanical.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT031, SIT157): "In this situation, that was how the fear spread faster than the real information."

Compression: Arin overhears a news report about people living through war. Arin wanted to understand whether the family is safe, but the old thought said The world is always dangerous. After a quiet "Wait," Arin chose to look again and understood that There are many people working every day to keep others safe. Arin chose a different next step, and the problem eased into a warmer, freer ending.

### SIT069 -> T08 - FAIL

- Situation: SIT069 - Their clothes aren't as 'cool' as others'
- Form / Template: F01 / T08
- Natural selector template: T08
- Hero: Gauri (Cow)
- World: Woodland Village
- Obstacle: Friends Disagree
- Emotions: EMO_ASHAMED, EMO_COMPARING
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Group/family context stays present and narratively functional.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T08.
- C6: PASS - Accumulated-pattern discovery mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: WARNING - Protagonist naming or sentence construction feels repetitive/mechanical.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT069, SIT123): "That clue did not stay alone for long."

Compression: Gauri cannot suddenly have everything the other children have, and Gauri believed I need nicer things to be accepted. Gauri paused, chose to look again, and understood that Who I am matters more than what I own. Gauri chose a different response, and the ending felt warmer and freer than before.

### SIT123 -> T08 - FAIL

- Situation: SIT123 - Friend suddenly acting different or 'cooler'
- Form / Template: F01 / T08
- Natural selector template: T23
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_UNSURE, EMO_WORRIED
- Compression words: 51

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T08.
- C6: PASS - Accumulated-pattern discovery mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: WARNING - Protagonist naming or sentence construction feels repetitive/mechanical.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT069, SIT123): "That clue did not stay alone for long."

Compression: Bodhi cannot control how the friend chooses to change, and Bodhi believed I have to change to keep my friends. Bodhi paused, chose to look again, and understood that Real friendships accept me for who I am. Bodhi chose a different response, and the ending felt warmer and freer than before.

### SIT140 -> T08 - WARNING

- Situation: SIT140 - Realised some kids don't have food or shoes
- Form / Template: F01 / T08
- Natural selector template: T08
- Hero: Bodhi (Elephant)
- World: Woodland Village
- Obstacle: Fear
- Emotions: EMO_CONFUSED_RIGHT_WRONG, EMO_SAD
- Compression words: 52

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T08.
- C6: PASS - Accumulated-pattern discovery mechanic is clearly visible.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: PASS - Turning point is positioned between setup and resolution, shows new content, and is followed by a consequence.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: WARNING - Protagonist naming or sentence construction feels repetitive/mechanical.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Bodhi does not know what would actually be helpful, and Bodhi believed Other people's struggles have nothing to do with me. Bodhi paused, chose to look again, and understood that Kindness and generosity can make a real difference. Bodhi chose a different response, and the ending felt warmer and freer than before.

### SIT157 -> T08 - FAIL

- Situation: SIT157 - Rumours or gossip spread about them
- Form / Template: F01 / T08
- Natural selector template: T21
- Hero: Simha (Lion)
- World: Ancient Banyan Grove
- Obstacle: Broken Bridge
- Emotions: EMO_EMBARRASSED, EMO_ANGRY
- Compression words: null

Criteria:
- C1: FAIL - Did not reach a locked final story.
- C2: FAIL - Did not reach a locked final story.
- C3: FAIL - Did not reach a locked final story.
- C4: FAIL - Did not reach a locked final story.
- C5: FAIL - Did not reach a locked final story.
- C6: FAIL - Did not reach a locked final story.
- C7: FAIL - Did not reach a locked final story.
- C8: FAIL - Did not reach a locked final story.
- C9: FAIL - Did not reach a locked final story.
- C10: FAIL - Did not reach a locked final story.
- C11: FAIL - Did not reach a locked final story.
- C12: FAIL - Did not reach a locked final story.
- C13: FAIL - Sentence reused verbatim across 2 situations (SIT031, SIT157): "In this situation, that was how the fear spread faster than the real information."

Compression: null

### SIT138 -> T12 - WARNING

- Situation: SIT138 - Told a 'bad' secret they feel should be shared
- Form / Template: F01 / T12
- Natural selector template: T12
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_TORN, EMO_WORRIED
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T12.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Keeping the secret may mean staying silent when a trusted adult needs to know, and Kavi believed Keeping every secret makes me a good friend. Kavi paused, chose to look again, and understood that Safe adults should know secrets that can protect someone. Kavi chose a different response, and the ending felt warmer and freer than before.

### SIT143 -> T12 - WARNING

- Situation: SIT143 - Seeing someone litter
- Form / Template: F01 / T12
- Natural selector template: T12
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_ANGRY, EMO_CONFUSED_RIGHT_WRONG
- Compression words: 66

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T12.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: WARNING - Ending resolves, but leans more on explanation than dramatized change.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: Kavi sees someone drop rubbish in a shared public place and walk away. Kavi wanted to do something about the litter, but the old thought said One person's actions don't matter. After a quiet "Wait," Kavi chose to look again and understood that Small responsible actions help care for our world. Kavi chose a different next step, and the problem eased into a warmer, freer ending.

### SIT159 -> T12 - WARNING

- Situation: SIT159 - They hurt a friend's feelings by mistake
- Form / Template: F01 / T12
- Natural selector template: T12
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_GUILTY, EMO_SAD
- Compression words: 50

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T12.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The words or action cannot be taken back, and Kavi believed One mistake makes me a bad friend. Kavi paused, chose to look again, and understood that I can apologise, repair and learn from my mistakes. Kavi chose a different response, and the ending felt warmer and freer than before.

### SIT161 -> T12 - WARNING

- Situation: SIT161 - Lost during a team game because of their mistake
- Form / Template: F01 / T12
- Natural selector template: T12
- Hero: Kavi (Monkey)
- World: Magic Garden
- Obstacle: Fear
- Emotions: EMO_GUILTY, EMO_ASHAMED
- Compression words: 57

Criteria:
- C1: PASS - Situation remains recognizable through paraphrased concrete detail.
- C2: PASS - Hero has a visible want or pursuit in the story.
- C3: PASS - Supporting character has a visible narrative role.
- C4: PASS - Events remain causally connected through the actual pipeline.
- C5: PASS - Form stays structurally recognizable through F01 / T12.
- C6: WARNING - Template mechanic visibility is not explicitly scored for this template.
- C7: PASS - Obstacle pressure is integrated without obvious forced database scaffolding.
- C8: PASS - No obvious database-label stitching is visible.
- C9: WARNING - No turning-point beat is mapped for this template yet.
- C10: PASS - Ending shows the emotional change through action/feeling.
- C11: PASS - Compression preserves the story spine.
- C12: PASS - Sentence flow avoids obvious repetition and awkward construction.
- C13: PASS - No sentence in this story is reused verbatim in another situation's story.

Compression: The game is already over and Kavi cannot undo the mistake, and Kavi believed Everyone will blame me forever. Kavi paused, chose to look again, and understood that Mistakes are part of teamwork and learning. Kavi chose a different response, and the ending felt warmer and freer than before. The change was clear in what happened next.

## Proposed Fix Directions

- Improve situation-specific noun recovery for T22 so object-driven stories stop defaulting to generic terms like `object` or interchangeable clue language.
- Strengthen supporting-character realization for family/class/group situations so 3+ cast seeds do not collapse into hero-only or hero-plus-one summaries.
- Reduce sentence-template repetition by varying subject openings, pronoun reuse, and beat-to-beat connective phrasing in the prose layer.
- Increase hero-want visibility in the first two pages so stories act on the situation pressure instead of only restating it.
- Deepen visible template mechanics in prose, especially where the event chain is valid but the manuscript still reads as a generalized scaffold.
