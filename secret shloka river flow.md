# Secret Shloka River Flow

This file documents the actual visual flow implemented in code for Shloka River (`App.jsx` route mapping):
- `vakratunda-grove` -> `Scene1/VakratundaGroveSimplified.jsx`
- `suryakoti-bank` -> `Scene2/SuryakotiBankSimplified.jsx`
- `nirvighnam-chant` -> `Scene3/NirvighnamChantSimplified.jsx`
- `sarvakaryeshu-chant` -> `scene4/SarvakaryeshuChantSimplified.jsx`
- `shloka-river-finale` -> `scene5/ShlokaRiverFinale.jsx`

Core visual behavior for Scenes 1-4 comes from `MemoryGameEngine` + `configs/gameConfigs.js`.

---

## Scene 1: Vakratunda Grove

## Base look
- Background: `vakratundachant-bg-new2.svg`
- Character: Ganesha with headphones
- Shared UI: Home button, Zone badge, Audio toggle, sidebar apps, gesture cue, opening modal

## Phase flow
1. `INITIAL`
- Opening modal only.

2. `VAKRATUNDA_GAME`
- Clickers: baby elephants (left/right depending on round config).
- Center reward object is lotus progression.
- Round visual progression:
- Round 1: lotus bud -> bit bloom
- Round 2: bit bloom -> half bloom
- Round 3: half bloom -> full bloom

3. `VAKRATUNDA_COMPLETE` -> `VAKRATUNDA_POWER`
- `SymbolAutoReveal` card for `vakratunda` appears center.
- Card flies to sidebar target (`sidebar-vakratunda`).

4. `MAHAKAYA_GAME`
- Clickers: adult elephants.
- Center reward object is banyan progression.
- Round visual progression:
- Round 1: sprout -> sapling
- Round 2: sapling -> half tree
- Round 3: half tree -> full banyan

5. `MAHAKAYA_COMPLETE` -> `MAHAKAYA_POWER`
- `SymbolAutoReveal` card for `mahakaya` appears and flies to sidebar.

6. `COMPLETE`
- Final fireworks overlays.
- Scene completion celebration modal.

---

## Scene 2: Suryakoti Bank

## Base look
- Background: `Scene2-bg.png`
- Shared UI and overlay stack same pattern as Scene 1

## Phase flow
1. `INITIAL`
- Opening modal.

2. `SURYAKOTI_GAME_ACTIVE`
- Clickers: sun orbs.
- Center object: flower progression per round.
- Round visual progression:
- Round 1 (sur+ya): sunflower close -> sunflower open
- Round 2 (ko+ti): daisy close -> daisy open
- Round 3 (sur+ya+ko+ti): rose close -> rose open
- (Tulip assets exist, not used in current 3-round config.)

3. `SURYAKOTI_LEARNING`
- `SymbolAutoReveal` for `suryakoti`, then flies to sidebar.

4. `SAMAPRABHA_GAME_ACTIVE`
- Clickers: rainbow elements (red/blue/green/purple).
- Center object: animal mood transforms per round.
- Round visual progression:
- Round 1: bunny sad -> bunny happy
- Round 2: kitten sad -> kitten happy
- Round 3: puppy sad -> puppy happy
- (Round 4 mapping exists in config: squirrel sad -> squirrel happy, but active scene path is 3-round flow.)

5. `SAMAPRABHA_LEARNING`
- `SymbolAutoReveal` for `samaprabha`, then flies to sidebar.

6. `COMPLETE`
- Fireworks + completion celebration.

---

## Scene 3: Nirvighnam Chant

## Base look
- Background switches by active word phase:
- Nirvighnam phase: `nirvighnam-bg.png`
- Kurumedeva phase: `kuru-bg.png`

## Phase flow
1. `INITIAL`
- Opening modal.

2. `NIRVIGHNAM_GAME_ACTIVE`
- Clickers: frog, snail, turtle.
- Center object: stone transformation (grayscale to colored).
- Round visual progression:
- Round 1: stone1 bw -> stone1 color
- Round 2: stone2 bw -> stone2 color
- Round 3: stone3 bw -> stone3 color

3. `NIRVIGHNAM_LEARNING`
- `SymbolAutoReveal` for `nirvighnam`.

4. `KURUMEDEVA_GAME_ACTIVE`
- Clickers: animal set for ku/ru/me/de/va positions.
- Center object: decoration assets (`decor1..decor4`) per round.
- In current config, initial and reward use same getter for each decoration round, so this phase is mainly reveal/placement style, not strong before/after swap.

5. `KURUMEDEVA_LEARNING`
- `SymbolAutoReveal` for `kurumedeva`.

6. `COMPLETE`
- Fireworks + completion celebration.

---

## Scene 4: Sarvakaryeshu Chant

## Base look
- Background switches by phase:
- Sarvakaryeshu phase: `sarvakaryeshu-bg.png`
- Sarvada phase: `sarvada-bg.png`

## Phase flow
1. `INITIAL`
- Opening modal.

2. `SARVAKARYESHU_GAME_ACTIVE`
- Clickers: helper animals (squirrel/bird/duck/rabbit helper variants).
- Center object: sad -> happy transformations.
- Round visual progression:
- Round 1: squirrel sad -> squirrel happy
- Round 2: bird sad -> bird happy
- Round 3: duck sad -> duck happy

3. `SARVAKARYESHU_LEARNING`
- `SymbolAutoReveal` for `sarvakaryeshu`.

4. `SARVADA_GAME_ACTIVE`
- Clickers: butterfly/fawn/hedgehog helper variants.
- Center object: sad -> happy transformations.
- Round visual progression:
- Round 1: butterfly sad -> butterfly happy
- Round 2: fawn sad -> fawn happy
- Round 3: hedgehog sad -> hedgehog happy

5. `SARVADA_LEARNING`
- `SymbolAutoReveal` for `sarvada`.

6. `COMPLETE`
- Fireworks + completion celebration.

---

## Scene 5: Shloka River Finale

This scene is not `MemoryGameEngine`-driven. It uses custom two-level assembly UI.

## Base look
- Background: `scene5/assets/images/bg.png`
- Shared UI: Home, zone badge, audio toggle, pause menu

## Flow states (`gamePhase`)
1. `intro`
- Opening modal.

2. `mode-select`
- Three visual cards/buttons:
- Full Journey
- Practice
- Quick Play

3. `word-select` (practice path)
- Grid of 8 word cards with word + meaning.

4. `level-select` (practice path)
- Choose: Level 1, Level 2, or Both.

5. `level1`
- Visual metaphor: lily pads (empty slots) + river stones (scrambled syllables).
- Child taps lily pad slot, then taps stone to place syllable.
- Correct/incorrect is shown as simple `?` / `?` feedback on slot.
- If wrong, `Hear Word` modal shows the correct syllable sequence with timed highlight.
- On correct word, popup celebration with word + meaning.

6. `level1-complete`
- Transition screen: all 8 words built.

7. `level2`
- Visual metaphor: 8 boats (word slots) + word cards.
- Child selects boat slot and places completed word cards in order.

8. `shloka-complete`
- Short completion popup, then advances to scene complete.

9. `scene-complete`
- SceneCompletionCelebration for finale.

---

## Cross-scene visual pattern (Scenes 1-4)

Each word-pair scene follows this recurring visual grammar:
1. Opening modal
2. Word A game in 3 rounds (clickers + center transformation)
3. SymbolAutoReveal for word A (center card -> sidebar)
4. Word B game in 3 rounds
5. SymbolAutoReveal for word B
6. Fireworks + scene completion modal

The important visual difference between scenes is the object family:
- Scene 1: elephants + lotus/banyan growth
- Scene 2: sun/rainbow + flower or animal mood changes
- Scene 3: animals + stone/decor progression
- Scene 4: helper animals + sad/happy helper outcomes
- Scene 5: lily-pad/stone assembly + boat/word-order assembly
