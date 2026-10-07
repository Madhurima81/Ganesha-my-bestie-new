# Test Checklists (dev harness)

A floating, step-by-step test runner for the dev harness. Dev-only, not part of the live app.

> **Update 2026-10-07:** the panel now lists only the 13 per-scene **"Continue after leaving to map"** checklists
> (`src/dev/continueChecklists.js`). Run them in the **main app**, because Continue lives on Zone Welcome and the
> game-test harness can't reach it: `npm run dev`, then open `http://localhost:5173/?checklist=1` (dev builds only;
> production builds don't include the panel). Pick a scene from "Share / more". The earlier per-game checklists
> (hints, sidebar, etc.) were moved, in full, to the **"Built-in checklists (moved out of the panel)"** section at the
> bottom of this file.

- Open: `/dev/game-test?game=<key>` (run `npm run dev`). The panel floats over the game.
- Shows one step at a time: **Do this** and **Should happen**. Buttons: Pass and next, Fail, Skip.
- Per step: a note, and screenshots (paste with Ctrl+V into the note, "Add image", or "Capture this tab").
- A numbered strip shows every step's status; click a number to jump.
- "Pop out" moves it into its own small window (Chrome/Edge) so it does not cover the game.
- Results save in the browser (localStorage) per checklist, so you can leave and come back.
- Share: "Share / more" -> **Download report** (one `.html`, screenshots embedded) or **Copy as text**.

The panel is a floating overlay. It stops pointer events from reaching the game, so using it never counts as a touch on the scene.

## Files

| File | Purpose |
|---|---|
| `src/dev/TestChecklistPanel.jsx` | The panel UI, saving, export, pop-out. Rarely needs editing. |
| `src/dev/testChecklists.js` | The built-in checklists. **Add new ones here.** |
| `src/dev/GameTestHarness.jsx` | Mounts the panel (`<TestChecklistPanel gameKey={gameKey} />`). |

## Add a checklist

### Option A: save it in the repo (every session and teammate gets it)

Edit `src/dev/testChecklists.js`. Add an entry to `TEST_CHECKLISTS`, keyed by the harness `?game=` key
(the keys are in `GAMES` / `SCENES` in `GameTestHarness.jsx`):

```js
export const TEST_CHECKLISTS = {
  'modak-game2-new': {
    title: 'Modak Game 2 - Branch phase: hints must ignore random touches',
    items: [
      { text: 'Wait ~18s for L2, then tap sky / grass.', expect: 'L2 hand stays; background taps change nothing.' },
      { text: 'Pull the branch part-way and let go at L3.', expect: 'Hand stays up; level does not reset.' },
    ],
  },
};
```

- `text`: what the tester does. `expect` (optional): what should happen, shown in a green box.
- Plain text only. No emoji.
- If several harness keys mount the same game, add them to `CHECKLIST_ALIASES`
  (`'sm-modak-game2': 'modak-game2-new'`) instead of copying the list.
- A game with no entry gets `GENERIC_CHECKLIST` (the 4-step hint smoke test).
- Every built-in checklist is in the panel's **Checklist** dropdown, whichever game is open.

### Option B: paste it in the panel (one-off, kept only in that browser)

Panel -> **Share / more** -> **New checklist from pasted text**. Paste a list:

```
# Optional title
- First step
  Expected: what should happen
- [ ] Second step
```

One step per line (`-`, `*`, `1.` or `- [ ]`). An `Expected:` line or an indented line under a step becomes its
pass condition. It then appears under **Pasted by you** in the dropdown.

## Writing good steps

- One action per step, with a clear pass condition.
- Say the starting state: "L3 visible", "no hint showing", "first teaching hand".
- Hint-system work: always include the standing check
  **"With L1/L2/L3 visible, tap random background parts of the scene. The hint must not disappear or restart
  unless the touch belongs to the current interactive beat."**

## Sending results

1. Tick through the steps; add notes and screenshots on failures.
2. **Share / more** -> **Download report** and send the `.html`, or **Copy as text** and paste into chat.
3. To reset a checklist: **Share / more** -> **Clear all results for this checklist**.

## Limits

- Screenshots are shrunk to about 900px wide and stored in browser storage. If storage fills, the panel warns you
  to download the report.
- "Capture this tab" depends on the browser's screen-share permission. Pasting or adding a file always works.
- "Pop out" needs Document Picture-in-Picture (Chrome/Edge). It is hidden elsewhere.
- Results live in one browser profile; they do not sync between machines. Download the report to keep them.

---

# Built-in checklists (moved out of the panel)

These were the built-in checklists in `src/dev/testChecklists.js`. They were removed from the panel on 2026-10-07 so the panel only lists the per-scene "Continue after leaving to map" checklists. They are kept here in full. To run one, copy its steps into the panel with **“+ paste checklist”**, or add it back to `TEST_CHECKLISTS` in `testChecklists.js` (the original file is in git history at commit `31cab4cb` and earlier).

21 checklists, 214 steps, grouped as the panel dropdown had them.

## Contents

- **Symbol Mountain:** `modak-calm`, `modak-game2-new`, `sm-pond`, `modak-garland`, `sm-eyes`, `sm-ears`, `sm-tusk-live-v2`, `sm-final`
- **Shloka River:** `samaprabha`, `kurumedeva`, `mahakaya`, `nirvighnam`, `sarvakaryeshu`, `sr-finale`, `suryakoti`, `vakratunda`, `sarvada`
- **About Me Hut:** `amh-favorite-food`, `amh-indian-story`, `amh-dreams-wishes`
- **General:** `sidebar-general`

## Symbol Mountain

### Modak Game 1 - Calm Mooshika: teach hold once

Key: `modak-calm` · also opened by harness keys: `sm-modak-game1`, `sm-modak`

1. [ ] Calm Mooshika: hear the opening hold instruction.
   - Should happen: One hold teaching hand appears on the action phrase, then stops.
2. [ ] Calm Mooshika: hold meaningfully past about 20%, release, then wait.
   - Should happen: No teaching hand returns. Mooshika uses ring/pulse help only.
3. [ ] Calm Mooshika: quick-tap without holding a few times.
   - Should happen: First quick tap says "Keep holding."; later help can strengthen, but after a meaningful hold it does not replay the hand.
4. [ ] Open the sidebar mid-line or mid-hint, then close it.
   - Should happen: The line resumes cleanly; retired teaching hands do not come back just because of the sidebar.

### Modak Game 2 - Bush, Branch, Marsh: teach once, then point where

Key: `modak-game2-new` · also opened by harness keys: `sm-modak-game2`

1. [ ] Bush phase: watch the intro.
   - Should happen: One sideways swipe hand appears with "Swipe", then retires.
2. [ ] Bush phase: wait ~18s for L2.
   - Should happen: Bush gives visual movement/pulse and the swipe clue plays. No hand demo returns.
3. [ ] Bush phase: do a short or vertical swipe and let go.
   - Should happen: The bush springs back and gives the relevant short/wrong-direction line once; later repeats are mostly visual.
4. [ ] Bush phase at L3: keep waiting.
   - Should happen: Bush help becomes stronger visually. No final hand demo.
5. [ ] Bush phase: do the real sideways swipe.
   - Should happen: Bush opens, flowers collect, game moves to the Branch phase.
6. [ ] Branch phase: watch the intro.
   - Should happen: One pull-and-hold teaching hand appears with "Pull", then retires.
7. [ ] Branch phase: do NOT touch the branch. Wait ~18s for L2.
   - Should happen: The branch pulses/glows and the placement/action hint plays. No hand demo returns.
8. [ ] Branch phase: keep waiting ~8s after L2 finishes for L3.
   - Should happen: Help becomes stronger visually; no repeated pull-and-hold demo and no repeated final rescue VO.
9. [ ] Branch phase: pull part-way and release, or pull upward.
   - Should happen: You get the specific corrective line for that error type; the branch keeps visual help and does not restart to L0.
10. [ ] Branch phase: do the real pull down + hold until it completes.
   - Should happen: Scene reacts, branch succeeds, hint clears, and Marsh starts fresh.
11. [ ] Marsh first step: watch the intro.
   - Should happen: One drag-to-first-safe-spot teaching hand appears, then retires.
12. [ ] Marsh first step: wait for help.
   - Should happen: The exact next safe spot glows/pulses; no second teaching hand appears.
13. [ ] Marsh: land on the first safe spot, then wait on steps 2-4.
   - Should happen: Only the next safe spot/Mooshika cue appears. No hand re-teaches dragging.
14. [ ] Marsh: drag Mooshika to a wrong place after the hand is retired.
   - Should happen: Mooshika returns, the target safe spot remains clear, and the drag hand does not come back.
15. [ ] Marsh: complete all four safe spots.
   - Should happen: Each correct landing clears the current cue and wakes the next spot.

### Pond: teach rock hold, flower drag, and lotus intro hold once

Key: `sm-pond`

1. [ ] Rock: hear "Press and hold to move it."
   - Should happen: One hold teaching hand appears with the action phrase, then stops.
2. [ ] Rock: release very early once.
   - Should happen: Only "Keep holding." plays. The rock keeps useful hold-ring feedback.
3. [ ] Rock: hold meaningfully past about 20%, release, then wait.
   - Should happen: The teaching hand does not return. Around 12s the rock shows a subtle hold ring; around 25s the visual rescue strengthens only if hold was never meaningfully learned.
4. [ ] Flowers: hear "Gently move them aside."
   - Should happen: One drag teaching hand plays one iteration, not two.
5. [ ] Flowers: drag part-way but not far enough.
   - Should happen: The flowers settle back and "A little farther." plays once; later help is visual/directional, not a repeated drag VO.
6. [ ] Flowers: make a meaningful drag, then stall.
   - Should happen: No teaching hand returns. The flowers gently shift sideways as the reminder/rescue cue.
7. [ ] Lotus: reach "Hold the bud to help it bloom."
   - Should happen: One hold teaching hand appears with the action phrase, then stops.
8. [ ] Lotus: release early.
   - Should happen: "Keep holding." plays. If idle, the bud uses ring/glow reminders only, with no repeated GestureDemo and no second VO.
9. [ ] Complete rock, flowers, and lotus.
   - Should happen: Each mechanic clears cleanly and the scene progresses without repeated tutorial hands.

### Modak Scene 1 (Garland): tap flowers, carry once, rescue is visual

Key: `modak-garland` · also opened by harness keys: `sm-modak-game3`

1. [ ] Intro line is playing: open and close the sidebar 3-4 times quickly.
   - Should happen: Intro replays once; hints still start afterwards (no freeze).
2. [ ] Build: tap a few flowers, then stop and wait. Time L1, L2, L3.
   - Should happen: L1 about 10s: remaining flowers bob/pulse. L2 about 18s: voice says "Tap any flower." L3 about 8s after: one remaining flower gets the stronger glow. No tap hand and no "Tap this flower." VO.
3. [ ] Build with NO flower tapped yet: wait for L2.
   - Should happen: The voice says "Tap any flower." (never "another").
4. [ ] Carry: after the garland completes, listen to the ready line.
   - Should happen: One drag-to-Ganesha teaching hand appears with "Drag", then retires.
5. [ ] Carry: wait for L2, then start dragging the garland and drop it away from Ganesha.
   - Should happen: The carry clue plays and Ganesha can glow; the hand does not come back or reset to L0.
6. [ ] Carry: miss 3 times quickly.
   - Should happen: Help becomes visual on Ganesha. No "Drag the garland onto Ganesha." final rescue VO.
7. [ ] Carry with no hint showing: drag part-way and drop it away.
   - Should happen: Idle clock restarts quietly; later help is destination-focused.
8. [ ] Drop the garland on Ganesha.
   - Should happen: Success; hint clears.

### Symbol Mountain, Eyes game: 2-step hints (clue + bush cue -> one exact object), no wrong-tap voice

Key: `sm-eyes` · also opened by harness keys: `sm-eyes`, `sm-symbol`

1. [ ] Intro line playing: open and close the sidebar several times quickly.
   - Should happen: Intro replays; the game and hints continue (no freeze).
2. [ ] After the intro ends, do nothing for ~10s.
   - Should happen: Nothing happens: no bush breathing, no voice.
3. [ ] Keep waiting to ~13s.
   - Should happen: "Look near the bushes. Something is peeking out." plays and ONLY the bush(es) of the next remaining object pulse. The object itself does not glow.
4. [ ] Keep waiting ~9s after the clue ends.
   - Should happen: ONE remaining object gets the strong glow and keeps it until found. No voice (no "Tap the glowing bushes").
5. [ ] Tap empty space 3 times (fresh target).
   - Should happen: Only a shimmer each time, no voice. On the 3rd the clue + bush cue arrive early.
6. [ ] Keep missing to 6 taps.
   - Should happen: The exact object glow comes early; a clue still speaking is not cut.
7. [ ] Tap a wrong (distractor) item.
   - Should happen: Soft pulse only: no voice and no text line. The clock is not restarted.
8. [ ] Find the first object with neither object found yet.
   - Should happen: Only that object glowed (never both at once). Success line, then "Now find the ..." and a fresh cycle for the other object.
9. [ ] Find the feather and the mango.
   - Should happen: Each find clears the hint; next target starts a fresh clock.
10. [ ] Find the mango, then tap the feather quickly (while the mango line or "Now find the feather" is still speaking).
   - Should happen: The feather-found line plays; "Now find the feather" does NOT play afterwards, because the feather is already found.

### Symbol Mountain, Ears sound-match: replay all -> clue + sound -> source glow; wrong taps escalate; no numbers

Key: `sm-ears` · also opened by harness keys: `sm-ears`

1. [ ] During the intro or a prompt line, switch to another tab and come back.
   - Should happen: The round does not advance while you are away; the line replays once on return.
2. [ ] Open and close the sidebar several times quickly during a line.
   - Should happen: Line replays; round and hints continue.
3. [ ] Look at the three sound sources.
   - Should happen: No 1/2/3 numbers on them; the playing source pulses.
4. [ ] On the choosing screen do nothing to ~10s.
   - Should happen: All three sounds replay once. No voice.
5. [ ] Keep waiting to ~18s.
   - Should happen: Clue (e.g. "Listen for the water drip.") then ONLY the target sound.
6. [ ] Keep waiting ~8s after the clue + sound finish.
   - Should happen: Correct source glows and stays; its sound replays once; NO "Tap the glowing place."
7. [ ] New round: tap a wrong zone once.
   - Should happen: Wobble, "Listen again.", then ALL three sounds replay (not the target alone).
8. [ ] Tap a wrong zone a 2nd time.
   - Should happen: Clue line plus the target sound.
9. [ ] Tap a wrong zone a 3rd time.
   - Should happen: Correct source glows persistently; no voice line (target sound once).
10. [ ] Tap the right zone.
   - Should happen: Reveal plays; next round starts with fresh hint state.

### Symbol Mountain, Tusk nest (BeatPlayer): twig teaches how once; reminder line + nudge; nest glow rescue

Key: `sm-tusk-live-v2` · also opened by harness keys: `sm-tusk-beatplayer`, `sm-tusk-nest-debug`

1. [ ] Twig (first item): hear the opening line.
   - Should happen: The teaching hand appears ONCE on the word "Drag" and travels toward the nest.
2. [ ] Grass, leaf, feather openings ("What about the short grass?" etc.).
   - Should happen: No teaching hand on any of them.
3. [ ] Do nothing on an item, wait ~12s.
   - Should happen: "Add the <item> to the nest." plays once and the item gives a small nudge. No hand, no glow yet.
4. [ ] Keep waiting ~8s after that line ends.
   - Should happen: The nest glows clearly and stays lit. No voice, no hand.
5. [ ] Drop the item just outside the nest, then just inside it.
   - Should happen: Just outside = a miss; just inside = success.
6. [ ] On a FRESH item, drop it wrong once.
   - Should happen: It springs back quietly; no voice, no hand, no glow.
7. [ ] Drop it wrong a 2nd time.
   - Should happen: The nest glow comes early and stays. No new voice line, no hand, the idle clock is not restarted.
8. [ ] Twig only: never drag it, wait for the nest glow.
   - Should happen: The hand may re-show once with the glow (never-dragged child only). It does NOT show after a real drag.
9. [ ] Drag part-way and release with no hint showing.
   - Should happen: Idle clock restarts.
10. [ ] Tap empty areas at the line and at the glow.
   - Should happen: Hints keep playing; nothing restarts.
11. [ ] Open and close the sidebar during a line.
   - Should happen: Replays once; hints restart fresh.
12. [ ] Drop all four items in the nest.
   - Should happen: Each success clears the glow; the next item starts a fresh clock; final line "You did it! All those little things helped rebuild the nest."

### Symbol Mountain, Sacred Assembly: small tap markers

Key: `sm-final`

1. [ ] Reach the first symbol card, let it slide/flip into play, then look at Ganesha before tapping.
   - Should happen: Small cream/gold circle markers appear on all available body-part choices. No large purple/white full-zone ovals or debug-looking hitbox fields are visible.
2. [ ] On round 1 only, watch the markers when play begins.
   - Should happen: All available markers pulse together twice, then settle into faint/static markers.
3. [ ] Complete round 1, then begin rounds 2 and 3.
   - Should happen: Markers appear during play but do not do the intro pulse again.
4. [ ] Before play begins for a round (card appearing, sliding, or flipping), watch Ganesha.
   - Should happen: No tap markers are visible until the scene is actually waiting for the child to choose.
5. [ ] Tap one wrong available body part.
   - Should happen: Only the tapped marker gives a short wobble/SFX. There is no "Try another place" VO and no full-zone glow.
6. [ ] On the same round, tap a second wrong body part.
   - Should happen: The placement clue comes forward early, using a body-part retrieval cue rather than repeating the affirmation.
7. [ ] Tap close to a marker but within the old large tappable area.
   - Should happen: The tap still works as a forgiving hit target; the visible marker remains small.
8. [ ] Tap the correct body part.
   - Should happen: The marker disappears as that part fills in, and markers hide during feedback/completion before the next card.
9. [ ] Leave a round idle until the clue plays.
   - Should happen: The clue is VO-only and helps with placement, e.g. "Which part helps you see what matters?" Markers remain neutral and no correct full-zone oval appears.
10. [ ] Keep waiting until the final rescue hint.
   - Should happen: Only the correct small marker gets a stronger gold halo/pulse. There is no extra final-rescue VO and no large target oval.
11. [ ] At final rescue, tap a wrong body part.
   - Should happen: The wrong marker wobbles locally and the correct small marker remains highlighted; the hint ladder does not restart.
12. [ ] Place the 3rd symbol and continue.
   - Should happen: No 3-symbol milestone VO plays; the next card flow stays smooth.
13. [ ] Place the 6th symbol.
   - Should happen: The only progress milestone VO plays: "Almost there — six symbols are back with Ganesha."
14. [ ] Open Hint Debug, select a zone, and drag/nudge its debug overlay.
   - Should happen: The red debug overlay is still available for tuning, and the visible marker follows the updated zone position.
15. [ ] Check a narrow/mobile viewport.
   - Should happen: Markers are slightly smaller, readable, and do not cover labels, art, or each other.

## Shloka River

### Samaprabha: 3 hint states (teach / find / keep holding); hand only in clue 1

Key: `samaprabha`

1. [ ] Clue 1: first-time teaching hand is playing. Tap empty sky / ground (not on the shadow).
   - Should happen: Hand finishes its pass; intro VO is not cut.
2. [ ] Clue 1, never touch the shadow: wait ~10s.
   - Should happen: Current shadow area pulses.
3. [ ] Clue 1: keep waiting to ~18s. Tap empty areas.
   - Should happen: "Press and hold on the shadow." plays to the end; no hand yet; taps change nothing.
4. [ ] Clue 1: keep waiting to ~26s.
   - Should happen: One full hold hand demo plays (once).
5. [ ] Clue 1: hold only a sliver (under ~10% of the ring), release, wait.
   - Should happen: Still the TEACH ladder (pulse, then "Press and hold", then hand).
6. [ ] Clue 1: hold past ~25% of the ring, release early, wait ~9s.
   - Should happen: "Keep holding." plays once with a soft glow. NO hand, no search hint.
7. [ ] Hold the shadow until the ring completes.
   - Should happen: Clue lights, "find another" plays, next clue starts a fresh clock.
8. [ ] Clue 2-4, do nothing for ~12s.
   - Should happen: Shadow area pulses and "Look for another part of the shadow." plays.
9. [ ] Clue 2-4, keep waiting to ~25s.
   - Should happen: Exact shadow region stays lit quietly. No extra VO. NO hand at any point.
10. [ ] Clue 2-4: wait 25s+ and tap empty areas.
   - Should happen: Nothing restarts or escalates; the lit region stays.
11. [ ] Clue 2-4: hold the correct region ~30%, release, wait ~9s.
   - Should happen: Only "Keep holding." plays once. No "look for another part", no hand.
12. [ ] Clue 2-4: press the correct shadow during the hint line.
   - Should happen: Line is cut, ring fills, no stuck hint after release.
13. [ ] Complete a clue, then reach the next clue and leave it idle.
   - Should happen: Hint states reset per clue: it is Find again, not Keep.
14. [ ] Open the sidebar mid-hint, then close it.
   - Should happen: Hint pauses and resumes cleanly; no hand appears after clue 1.

### Kurumedeva: teach the bubble and the first plank, then step back

Key: `kurumedeva`

1. [ ] Ask Elephant: hear the instruction.
   - Should happen: One teaching hand drags the bubble, timed to the action word.
2. [ ] Ask Elephant: drag the bubble a real distance and drop it far from Elephant.
   - Should happen: Bubble returns; Elephant glows (clearer helper); NO hand appears.
3. [ ] Ask Elephant: drag a little, open the sidebar, close it.
   - Should happen: The teaching hand does NOT come back.
4. [ ] Ask Elephant: drop the bubble on Elephant.
   - Should happen: Elephant helps; hint clears; next beat starts a fresh clock.
5. [ ] Ask Monkey: hear the question, then do nothing for ~12s.
   - Should happen: NO teaching hand. Bubble wiggles twice and "Who can help tie the rope?" plays once.
6. [ ] Ask Monkey: keep waiting to ~25s.
   - Should happen: Monkey glows quietly and stays. No hand, no further lines.
7. [ ] Ask Monkey: drop the bubble away from Monkey.
   - Should happen: Monkey glows right away; no hand; ladder does not restart.
8. [ ] Plank 1: hear the instruction.
   - Should happen: One teaching hand drags the plank to the slot.
9. [ ] Plank 1: drag a plank a real distance and drop it in the wrong place.
   - Should happen: Plank returns; the slot glows; NO hand appears.
10. [ ] Place plank 1.
   - Should happen: "Good. Continue dragging the planks." plays once.
11. [ ] Planks 2-3: do nothing for ~12s.
   - Should happen: The top plank nudges twice. No hand, no new line.
12. [ ] Planks 2-3: keep waiting to ~25s.
   - Should happen: The slot glows quietly and stays. No hand, no L3 line.
13. [ ] Tap empty areas at any hint stage.
   - Should happen: Hints keep playing; nothing restarts.
14. [ ] Place planks 2 and 3.
   - Should happen: Bridge completes; crossing starts.

### Mahakaya: teach on log 1, then step back

Key: `mahakaya`

1. [ ] Log 1: do nothing. Wait for L2 (hand + "Drag the log into the water."). Grab the log and let go without finishing.
   - Should happen: Hand stays up; the L2 line plays again on release; no reset to L0.
2. [ ] Log 1: drag the log a real distance and miss the raft, twice.
   - Should happen: After the 2nd miss the exact spot shows and "Put the log here." plays once. No hand appears.
3. [ ] Log 1: drag a little (real movement), open the sidebar, close it.
   - Should happen: The teaching hand does NOT come back.
4. [ ] Log 1: place it. Hear "Keep adding logs to the raft."
   - Should happen: Plays once, not again on logs 2-4.
5. [ ] Logs 2-4: do nothing for ~12s.
   - Should happen: The log nudges twice and "Drag the next log." plays once. No hand.
6. [ ] Logs 2-4: keep waiting to ~25s.
   - Should happen: The exact spot glows quietly and stays. No hand, no further lines.
7. [ ] Logs 2-4: miss the raft twice.
   - Should happen: The exact spot shows early; "Put the log here." plays once; a pointing hand (not a drag) appears on the drop spot.
8. [ ] Tap empty sky/ground at any hint stage.
   - Should happen: Hints keep playing; nothing restarts.
9. [ ] Drag each log to finish.
   - Should happen: Stage completes; hint clears; next log starts a fresh clock.

### Nirvighnam: grabbing an obstacle keeps a visible hint

Key: `nirvighnam` · also opened by harness keys: `sr-nirvighnam`

1. [ ] Wait for L2 on the rock. Press the rock briefly and let go.
   - Should happen: L2 hand stays up.
2. [ ] Repeat for the branch and the reed at L2 or L3.
   - Should happen: Hand stays up each time; teaching hand is gone after a real touch.
3. [ ] Tap empty areas at L2 and L3.
   - Should happen: Hints keep playing; nothing restarts.
4. [ ] Clear each obstacle for real.
   - Should happen: Hint clears; next obstacle starts a fresh clock.

### Sarvakaryeshu: wrong picks escalate help, never clear it

Key: `sarvakaryeshu` · also opened by harness keys: `sr-sarvakaryeshu`

1. [ ] Pick a wrong symbol once.
   - Should happen: Gentle "Try another symbol"; hints not cleared.
2. [ ] Pick a wrong symbol a 2nd time.
   - Should happen: L2 help starts early.
3. [ ] At L2: pick wrong again.
   - Should happen: L3 follows only after the L2 line finishes.
4. [ ] Wait for L3 on any card.
   - Should happen: The correct symbol pulses 3 times (about 8s), then stays as a soft static gold highlight; ONE "Remember? ..." line plays once and does not repeat.
5. [ ] At L3: tap a wrong symbol.
   - Should happen: The correct symbol stays highlighted; the ladder does not restart; the "Remember?" line does not repeat.
6. [ ] Pick the correct symbol.
   - Should happen: Success; fresh clock for the next card.

### Shloka River Finale: 2-step recall hints (clue → rescue); wrong boats never cut or reset help

Key: `sr-finale`

1. [ ] Wait for the opening shloka / reinforcement audio to finish, then do nothing for ~10s.
   - Should happen: No hint yet. The boats do NOT pulse or nudge at any point.
2. [ ] Keep waiting to ~13s.
   - Should happen: The meaning-clue VO plays once (describes the word, does not name it). No hand.
3. [ ] Keep waiting to ~25s.
   - Should happen: The correct boat glows gold and bobs, and the word is spoken once.
4. [ ] Keep waiting past ~40s. Tap empty areas.
   - Should happen: Correct boat stays lit; no new VO, no repeats.
5. [ ] After the rescue is showing: tap a wrong boat.
   - Should happen: Soft wrong sound; the correct boat stays lit; nothing restarts.
6. [ ] During the clue VO: tap a wrong boat.
   - Should happen: Clue keeps playing to the end (not cut).
7. [ ] During the clue VO: drag a wrong boat and drop it away from the slot.
   - Should happen: Clue keeps playing; boat settles back; no reset.
8. [ ] On a new slot with no hint showing: tap a wrong boat twice.
   - Should happen: The meaning clue plays early after the 2nd wrong (once); the correct boat does NOT glow yet.
9. [ ] After the early clue: wait.
   - Should happen: Clue does not repeat at ~13s; the rescue still arrives at ~25s from the slot start.
10. [ ] With a hint showing: grab the correct boat but do not place it.
   - Should happen: Hint stays until it is placed.
11. [ ] Tap or drag the correct boat while a clue is playing.
   - Should happen: Clue stops, success plays, the word audio is heard.
12. [ ] Move to the next slot and leave it idle.
   - Should happen: Ladder is fresh: nothing, then clue (~13s), then rescue (~25s). Clue is that slot's own word.
13. [ ] Place all 8 boats and look at the fleet (iPad 1024x670).
   - Should happen: Boats follow the LEFT of the river in a zig-zag; the top boats are spaced apart; no word label sits on another boat's sail; the new-boat ripple lands on each boat's spot.
14. [ ] Final "say it together" recap: watch each word being chanted.
   - Should happen: The chanted boat glows and comes to the front, and its symbol shows large in the open water to the right of the fleet (not hidden behind any boat). The symbol changes with each word and disappears at the end.

### Suryakoti (rub): teach first, then remind once

Key: `suryakoti` · also opened by harness keys: `sr-suryakoti`

1. [ ] First-time teaching hand plays on the first patch. Rub somewhere else on screen.
   - Should happen: The hand finishes its pass; nothing restarts.
2. [ ] First patch, NOTHING rubbed yet: do nothing and time L1 / L2 / L3.
   - Should happen: L1 about 10s: a clearly visible small glow spot, no voice. L2 about 18s: a short scratch hand + "Rub the glowing spot.". L3 about 8s after that line: the longer 2-pass hand with NO voice.
3. [ ] Rub a little of the first patch, then stop and do nothing.
   - Should happen: No hand and no glow spot. After about 10s a single "Keep rubbing." and nothing else repeats.
4. [ ] Finish the first three patches (Sur, ya, ko), then on the LAST patch (ti) rub a little and stop.
   - Should happen: After about 10s it says "Almost there!" (the whole game is about 75% done). On the first three patches the reminder is "Keep rubbing.", never "Almost there!".
5. [ ] After the reminder, keep doing nothing until about 25s.
   - Should happen: A soft warm light wash covers the active patch and pulses twice (about 5s), clearly lighting whatever is still dark in it, then stops. No voice. After that nothing more happens (no hand, no repeated lines).
6. [ ] Rub a big blob in the middle of a patch, then wait for the 25s wash.
   - Should happen: The wash covers the patch and visibly lights up the parts you have NOT rubbed; the cleared area just looks normal.
7. [ ] Finish a patch, then stop on the next patch without rubbing it.
   - Should happen: The same as step 3: about 10s a single "Keep rubbing.", about 25s the quiet glow. No hands on later patches.
8. [ ] Rub part of a patch, lift your finger, do nothing, then rub again and stop again.
   - Should happen: The reminder timing restarts after each rub (it never stays silent after a partial rub), and the reminder speaks again only after you have rubbed again.
9. [ ] Rub somewhere that has no darkness left, or tap the screen.
   - Should happen: The hint timing is not restarted by that.
10. [ ] Open and close the sidebar mid-rub.
   - Should happen: Rub stops cleanly; hints restart fresh.

### Vakratunda (frog): start-drag hint and stuck help

Key: `vakratunda` · also opened by harness keys: `sr-vakratunda`

1. [ ] After the intro do nothing.
   - Should happen: Start-drag hint ladder arrives about 10s / 18s / 26s.
2. [ ] Start dragging the frog.
   - Should happen: Start-drag hint stops for good.
3. [ ] Push the frog into a blocked spot repeatedly.
   - Should happen: Stuck help escalates after repeated real bumps.
4. [ ] Tap empty areas during hints.
   - Should happen: Nothing restarts.

### Sarvada: two-step search support (clue, then exact ring)

Key: `sarvada`

1. [ ] Each round: hear the instruction, then do nothing for ~12s.
   - Should happen: ONE meaning clue plays ("Think of the symbol that helps us listen." / "...hold lots of feelings." / "Think of the sweet that reminds us of joy.") with the broad glow. No hand.
2. [ ] Keep waiting to ~25s.
   - Should happen: The broad glow disappears and the exact ring appears with no voice, and it stays.
3. [ ] Keep waiting another 30s.
   - Should happen: Nothing else happens: no voice, no new animation.
4. [ ] While the clue is speaking, tap somewhere wrong.
   - Should happen: Tiny ripple only; the clue is NOT cut off; the timer does not restart.
5. [ ] Find the symbol.
   - Should happen: Symbol flies to the syllable; next phase starts a fresh clock.

## About Me Hut

### Favorite Things: Ganesha questions = clue (~13s) then correct-choice glow; child questions = one repeat

Key: `amh-favorite-food`

1. [ ] Ganesha question: after the question line, do nothing for ~10s.
   - Should happen: No wobble or movement on any choice.
2. [ ] Keep waiting to ~13s.
   - Should happen: One short meaning clue plays (e.g. "Look for the sweet I love."). Choices still do not move.
3. [ ] Keep waiting after the clue ENDS (~10s).
   - Should happen: The correct choice gets the strong gold glow and stays lit. No extra voice.
4. [ ] Wait longer. Tap empty areas.
   - Should happen: Glow stays; nothing repeats.
5. [ ] On a FRESH question (remount or a new question), within the first ~10s and before any clue: tap a wrong choice.
   - Should happen: Wrong sound, shake, the option name is spoken; the clue timer is NOT restarted.
6. [ ] While the clue is speaking: tap a wrong choice.
   - Should happen: Wrong sound and shake only. The clue is NOT interrupted and the option name is NOT read.
7. [ ] After the glow is showing: tap a wrong choice.
   - Should happen: Wrong sound and shake; the correct choice stays glowing.
8. [ ] Tap the correct choice (at any point).
   - Should happen: Success; hint clears; the next question starts a fresh clock.
9. [ ] Check all four Ganesha questions (food, color, activity, friend).
   - Should happen: Each has its own clue line and the same timing; no choice-wobble on any of them.
10. [ ] Activity question: count the choices.
   - Should happen: 7 activities plus "My own" (8). "Games" is not shown.
11. [ ] Child question (own favorite food/color/activity/friend): wait ~10s.
   - Should happen: The question repeats ONCE, then nothing. No glow, no answer rescue.

### My Indian Story: 2-step hints (clue → rescue); wrong answers never clear help; personal phases = one repeat

Key: `amh-indian-story`

1. [ ] Ganesha Home: first time, wait for "Move the magnifying glass around the map…" to start.
   - Should happen: The teaching hand plays ONCE (one pass, not two), in sync with the line.
2. [ ] Ganesha Home: never touch the magnifier; wait ~12s.
   - Should happen: "Move the magnifying glass around the map." plays and the magnifier gives a short nudge (3 quick wobbles, then still). It never wobbles forever.
3. [ ] Ganesha Home: keep waiting ~10s after that line.
   - Should happen: The teaching hand replays once. No spot glows yet.
4. [ ] Ganesha Home: drag the magnifier once (no find), then stop and wait ~12s.
   - Should happen: ONE undiscovered spot glows softly. No voice. The magnifier does NOT wobble. No hand.
5. [ ] Ganesha Home: keep waiting to ~25s from your last find/start.
   - Should happen: That same single spot gets a ring that stays until found. The other undiscovered spots are NOT highlighted.
6. [ ] Ganesha Home: drag around with the ring showing.
   - Should happen: The ring stays; dragging does not clear it.
7. [ ] Ganesha Home: find that spot.
   - Should happen: Hints clear; a fresh cycle starts and points at the next undiscovered spot.
8. [ ] Language guess: press Play. Does the Play button keep pulsing forever?
   - Should happen: It pulses twice then rests. If you do not press it for ~11s, "Tap play and listen carefully." repeats once and it pulses twice more.
9. [ ] Language guess: after the chant, wait ~10s.
   - Should happen: No wobble on the cards.
10. [ ] Language guess: wait to ~12s.
   - Should happen: "Think of the language many shlokas are in." plays (once). Cards still do not move.
11. [ ] Language guess: wait ~10s after the clue ends.
   - Should happen: Sanskrit gets the strong persistent glow. No extra voice.
12. [ ] Language guess: tap a wrong card BEFORE the clue.
   - Should happen: Shakes and says its name. The clue timer is NOT restarted (the clue still arrives on schedule).
13. [ ] Language guess: tap a wrong card WHILE the clue is speaking.
   - Should happen: Shake only. The clue is NOT cut and the language name is not read.
14. [ ] Language guess: tap a wrong card once the Sanskrit glow is showing.
   - Should happen: Shake only; the Sanskrit glow stays.
15. [ ] Festival guess: same three checks (wait ~12s, then ~10s more).
   - Should happen: "Think of the festival that celebrates Ganesha." at ~12s with no card wobble; then Ganesh Chaturthi gets the persistent glow. No extra voice.
16. [ ] Festival guess: tap a wrong card before, during and after the clue.
   - Should happen: Name spoken only BEFORE the clue; shake only after. The timers are never restarted; the glow stays once shown.
17. [ ] Child home / child languages / child festivals: wait ~10s on each.
   - Should happen: The prompt repeats ONCE, then nothing. No glow, no rescue.
18. [ ] Child languages: trigger the reminder (replay button).
   - Should happen: Says "Choose up to three languages you use or hear." (not "you speak").
19. [ ] Make the correct guess in each Ganesha phase.
   - Should happen: Hints clear and the phase moves on.

### Dreams and Wishes: 2-step hints (reminder → rescue); no hand after the first drag; no visible hit-boxes

Key: `amh-dreams-wishes`

1. [ ] Wish 1: after the instruction ends, do nothing for ~10s.
   - Should happen: No pulse on any bubble.
2. [ ] Wish 1: keep waiting to ~13s.
   - Should happen: One clue plays: "Look for actions that help or care for someone." Bubbles still do not move.
3. [ ] Wish 1: wait ~10s after the clue ends.
   - Should happen: The remaining KIND bubbles glow and stay lit. No second voice line (the four answers are NOT read out).
4. [ ] Wish 1: tap an unkind bubble (before, during and after the clue).
   - Should happen: Shake + dim only. No spoken "that's not kind". A playing clue is NOT cut. Hint timing is not reset.
5. [ ] Wish 1: tap a kind bubble.
   - Should happen: Progress advances; the 2-step cycle restarts for the next kind action.
6. [ ] Wish 2: first time, wait for "Drag food…" to start.
   - Should happen: Teaching hand plays once, in sync with the line.
7. [ ] Wish 2: place NO food and wait ~12s.
   - Should happen: Reminder "Drag one food toward an empty plate." plus the hand once more; then the empty plate glows (~10s after the line).
8. [ ] Wish 2: place one food, then wait ~12s.
   - Should happen: Line is "There's still an empty plate." Only ONE remaining food nudges and the empty plate softly shows. NO hand.
9. [ ] Wish 2: keep waiting after that line.
   - Should happen: The exact empty plate gets the full glow and the food glows. No extra voice.
10. [ ] Wish 3: look at the garden before tapping anything.
   - Should happen: NO dashed ovals or pale fills. Each bare spot shows only a small golden twinkle. Tapping around the plant (large invisible zone) still works.
11. [ ] Wish 3: wait ~12s.
   - Should happen: "There's still space for more to grow." plays; ONE remaining spot pulses (not all three).
12. [ ] Wish 3: wait ~10s more.
   - Should happen: That one spot glows stronger and stays lit. No extra voice.
13. [ ] Wish 3: tap a spot, then wait again.
   - Should happen: The hint restarts, points at a remaining spot, and never behaves as if tapping is new.
14. [ ] Dream clouds: do not tap for ~12s.
   - Should happen: "Tap me to clear the clouds." plays; then Ganesha glows (~10s later). No arrow, no multi-stage nudges.
15. [ ] Dream clouds: clear one cloud, then stall ~12s.
   - Should happen: "Keep tapping." plays, then the Ganesha glow.
16. [ ] Dream drawing: sit idle.
   - Should happen: No hint ladder at all.
17. [ ] Tap empty background during any hint.
   - Should happen: Nothing restarts.

## General

### Sidebar check (any scene that has a sidebar)

Key: `sidebar-general`

1. [ ] While an intro line is speaking, open and close the sidebar 3-4 times quickly.
   - Should happen: The line replays once from the start; the scene then carries on.
2. [ ] While a hint line (L2) is speaking, open the sidebar then close it.
   - Should happen: The line replays once; hints restart fresh (about 10s / 18s / 26s).
3. [ ] Open the sidebar and leave it open for 30s.
   - Should happen: Nothing advances or speaks behind it; timers are frozen.
4. [ ] Switch to another browser tab and back during a line.
   - Should happen: The game does not advance while away; the line replays on return.

## Default checklist (still in the panel)

`GENERIC_CHECKLIST` stays in the code as the fallback for any game with no checklist:

1. [ ] L1/L2/L3 visible then tap random background.
   - Should happen: Hint/gesture stays; timer does not restart.
2. [ ] L3 visible then do the real valid action.
   - Should happen: Scene reacts; hint clears.
3. [ ] Teaching hand then tap randomly.
   - Should happen: Hand finishes its pass.
4. [ ] Sidebar open/close during a hand.
   - Should happen: Hides while paused; replays on return.
