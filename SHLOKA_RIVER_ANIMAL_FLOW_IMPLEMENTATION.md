# Shloka River Animal Flow Implementation

This document captures the implemented Shloka River flow for scenes 10-14.
It focuses on the actual animal-based gameplay and progression, not the older text-first draft.

Source notes used:
- `secret shloka river flow.md`
- `scene_flow.md`
- `CONTENT.md` for the current modal copy

---

## Scene 10 - Vakratunda Grove

### Opening Modal
- Title: `Grow the Lotus`
- Description: `Let's grow something beautiful together. Watch the lotus bloom.`
- Button Text: `Let's Grow`

### Gameplay Flow
1. Scene starts in `INITIAL` with the opening modal.
2. Vakratunda phase begins with `baby elephants` as the clickers.
3. The center reward object is a `lotus` that progresses through bloom states.
4. Round 1 builds the first chunk of the word and advances the lotus.
5. Round 2 builds the second chunk and advances the lotus again.
6. Round 3 reinforces the full word and fully blooms the lotus.
7. `Vakratunda` auto-reveals and flies to the sidebar.
8. Mahakaya phase begins with `adult elephants` as the clickers.
9. The center reward object becomes a `banyan tree` that grows across rounds.
10. Round 1 grows the sprout into a sapling.
11. Round 2 grows the sapling into a half tree.
12. Round 3 grows the half tree into a full banyan.
13. `Mahakaya` auto-reveals and flies to the sidebar.

### Animal Check
- Clickers: baby elephants, then adult elephants
- Growth object: lotus, then banyan tree

### Learning Goal
- Pronunciation confidence, sequencing, adaptability, and inner strength.

### Completion Modal
- Title: `The Lotus and Tree Are Ready!`
- Subtitle: `Flexibility and strength flow through you.`
- Button Text: `Back to Map` / `Next Scene`

---

## Scene 11 - Suryakoti Bank

### Opening Modal
- Title: `The Second Shloka`
- Description: `A new melody arrives at the river. Listen carefully.`
- Button Text: `Let's Listen`

### Gameplay Flow
1. Scene starts in `INITIAL` with the opening modal.
2. `Suryakoti` phase uses `sun orbs` as the clickers.
3. The center object is a flower progression.
4. Round 1 uses `sunflower close -> sunflower open`.
5. Round 2 uses `daisy close -> daisy open`.
6. Round 3 uses `rose close -> rose open`.
7. `Suryakoti` auto-reveals and flies to the sidebar.
8. `Samaprabha` phase begins.
9. `Rainbow elements` become the clickers.
10. The center object switches to `animal mood transforms` per round.
11. Round 1: `bunny sad -> bunny happy`.
12. Round 2: `kitten sad -> kitten happy`.
13. Round 3: `puppy sad -> puppy happy`.
14. A round 4 mapping exists in config: `squirrel sad -> squirrel happy`, but the active scene path currently uses 3 rounds.
15. `Samaprabha` auto-reveals and flies to the sidebar.

### Animal Check
- Clickers: sun orbs, then rainbow elements
- Animal transform targets: bunny, kitten, puppy

### Learning Goal
- Listening accuracy and confident repetition.

### Completion Modal
- Title: `You Learned Suryakoti!`
- Subtitle: `The sun's wisdom shines within you.`
- Button Text: `Back to Map` / `Next Scene`

---

## Scene 12 - Nirvighnam Chant

### Opening Modal
- Title: `Clear the Path`
- Description: `The third shloka removes all obstacles. Hear it in your heart.`
- Button Text: `Let's Listen`

### Gameplay Flow
1. Scene starts in `INITIAL` with the opening modal.
2. `Nirvighnam` phase uses `frog`, `snail`, and `turtle` as the clickers.
3. The center object is a stone transformation.
4. Round 1 changes `stone1` from black-and-white to color.
5. Round 2 changes `stone2` from black-and-white to color.
6. Round 3 changes `stone3` from black-and-white to color.
7. `Nirvighnam` auto-reveals.
8. `Kurumedeva` phase begins.
9. This phase uses an `animal set` for the `ku/ru/me/de/va` positions.
10. The center object is a decoration progression using `decor1` to `decor4`.
11. In the current config, this phase is mostly reveal and placement style.
12. `Kurumedeva` auto-reveals.

### Animal Check
- Clickers: frog, snail, turtle
- Secondary animal set: ku/ru/me/de/va positions

### Learning Goal
- Resilience and clear sequencing.

### Completion Modal
- Title: `You Learned Nirvighnam!`
- Subtitle: `The path forward is open.`
- Button Text: `Back to Map` / `Next Scene`

---

## Scene 13 - Sarvakaryeshu Chant

### Opening Modal
- Title: `Work with Purpose`
- Description: `The fourth shloka teaches about doing your work with care.`
- Button Text: `Let's Listen`

### Gameplay Flow
1. Scene starts in `INITIAL` with the opening modal.
2. `Sarvakaryeshu` phase uses `helper animals` as the clickers.
3. The helper set includes `squirrel`, `bird`, `duck`, and `rabbit` variants.
4. The center object moves through `sad -> happy` transformations.
5. Round 1: `squirrel sad -> squirrel happy`.
6. Round 2: `bird sad -> bird happy`.
7. Round 3: `duck sad -> duck happy`.
8. `Sarvakaryeshu` auto-reveals.
9. `Sarvada` phase begins.
10. `butterfly`, `fawn`, and `hedgehog` become the helper variants.
11. The center object again transforms from `sad -> happy`.
12. Round 1: `butterfly sad -> butterfly happy`.
13. Round 2: `fawn sad -> fawn happy`.
14. Round 3: `hedgehog sad -> hedgehog happy`.
15. `Sarvada` auto-reveals.

### Animal Check
- Clickers: squirrel, bird, duck, rabbit variants
- Secondary helpers: butterfly, fawn, hedgehog

### Learning Goal
- Careful action and responsibility.

### Completion Modal
- Title: `You Learned Sarvakaryeshu!`
- Subtitle: `Purpose flows through your actions.`
- Button Text: `Back to Map` / `Next Scene`

---

## Scene 14 - Shloka River Finale

### Opening Modal
- Title: `The River Flows as One`
- Description: `All four shlokas unite in harmony. Sing them together.`
- Button Text: `Let's Celebrate`

### Gameplay Flow
1. Scene starts in `intro` with the opening modal.
2. The scene shifts into a custom two-level assembly style.
3. `Level 1` uses lily pads and river stones.
4. Child taps a lily pad slot, then taps a stone to place the syllable.
5. Correct and incorrect feedback appears directly on the slot.
6. If needed, a `Hear Word` modal shows the correct syllable sequence with timed highlight.
7. On correct completion, a celebration popup shows the word and meaning.
8. `Level 1 complete` transitions when all 8 words are built.
9. `Level 2` uses boats as word slots plus word cards.
10. Child places completed word cards into the correct order.
11. The scene ends with a short completion popup and then scene completion celebration.

### Animal / Nature Check
- Assembly elements: lily pads, river stones, boats
- Final combine state: all 8 learned words in sequence

### Learning Goal
- Integration, memory, and confident completion.

### Completion Modal
- Title: `The Shloka River Flows Through You!`
- Subtitle: `All sacred words now flow together.`
- Button Text: `Back to Map` / `Next Scene`

---

## Summary

The implemented Shloka River flow is:
1. Scene 10: elephant-led lotus and banyan growth
2. Scene 11: sun orbs, rainbow elements, and animal mood changes
3. Scene 12: frog/snail/turtle clickers with stone color progression
4. Scene 13: helper animals with sad-to-happy transformations
5. Scene 14: lily-pad and boat assembly finale

