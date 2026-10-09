// "Continue after leaving to map" checklists — one per live scene (13).
//
// Run these in the MAIN app, not the game-test harness: Continue lives on Zone Welcome.
//   npm run dev  ->  open http://localhost:5173/?checklist=1  (dev builds only)
// The panel floats over the app; pick a scene from "Share / more" -> "Continue after leaving to map".
//
// Every step: play to the state, leave with the back-to-map button (or the zone badge),
// then tap the scene's button on Zone Welcome. It must say "Continue" (not Start / Replay).
// Mid-game states restart the CURRENT beat cleanly by design (the instruction line replays); Shloka River scenes resume at the next unfinished beat;
// a symbol card that was up comes back; a finished scene shows Replay.

const leave = (where) => `${where} Then leave with the back-to-map button (or zone badge) and tap this scene's Continue on Zone Welcome.`;

const COMMON = [
  {
    text: 'Finish the scene, leave on the completion screen, return to Zone Welcome.',
    expect: 'The button says Replay (never Continue). Replay starts fresh with the opening modal.',
  },
  {
    text: 'Mid-game, switch to another browser tab for about 10 seconds, then come back.',
    expect: '3-2-1 countdown, then the game picks up where it was. No double voice line, no restart from scratch.',
  },
  {
    text: 'Mid-game, press the browser refresh (F5).',
    expect: 'Same result as Continue: the current beat restarts cleanly. Never a blank or frozen screen.',
  },
  {
    text: 'Turn voice off, then repeat one Continue.',
    expect: 'Resumes silently and correctly. Replay is disabled while muted.',
  },
  {
    text: 'Wait about 20 seconds on a Continue that looks blank (dev server first load only).',
    expect: 'The scene appears. If it is still blank after 30 seconds, mark Fail with a screenshot.',
  },
];

const list = (title, items) => ({ title: `Continue after leaving to map - ${title}`, items: [...items, ...COMMON] });

export const CONTINUE_CHECKLISTS = {
  'continue-modak': list('Modak (Symbol Mountain 1)', [
    { text: leave('Game 1: while holding Mooshika, before the card.'), expect: 'Mooshika game restarts; the opening line replays; you can hold again.' },
    { text: leave('Mooshika card is showing.'), expect: 'The Mooshika card comes back, then the Flower Journey starts at the Bush.' },
    { text: leave('Flower Journey, Bush: part-way through (before the bush opens).'), expect: 'The Bush beat restarts fresh: instruction line replays, 0 flowers in the basket.' },
    { text: leave('Bush done (2 flowers in the basket), Branch not finished.'), expect: 'Starts at the Branch beat: bush already open, 2 flowers in the basket, branch instruction plays. No Bush replay.' },
    { text: leave('Branch: mid-pull or mid-hold (2 flowers in the basket).'), expect: 'Branch restarts fresh, not half-pulled: ring empty, no old hint, 2 flowers in the basket.' },
    { text: leave('Branch done (4 flowers in the basket), Marsh not finished.'), expect: 'Starts at the Marsh beat: branch already pulled, 4 flowers, marsh instruction plays. No Bush or Branch replay.' },
    { text: leave('Marsh: mid-crossing, Mooshika on a stepping stone (4 flowers in the basket).'), expect: 'Marsh restarts from its first stone, not mid-drag; 4 flowers in the basket.' },
    { text: leave('Marsh done (6 flowers), belly beat playing, before the Belly card.'), expect: 'Starts at the belly beat (not Bush, Branch or Marsh); the Belly card then appears once only.' },
    { text: leave('Garland: after threading some flowers.'), expect: 'Garland restarts with all 6 flowers available and the instruction replays.' },
    { text: 'Any Flower Journey Continue above: check for leftovers.', expect: 'No old voice line, no stale hint level, no half-filled hold ring, no leftover gesture hand, and no duplicate card.' },
    { text: leave('Belly card is showing.'), expect: 'The Big Belly card comes back.' },
    { text: leave('Carrying the garland to Ganesha, mid-drag.'), expect: 'The carry beat restarts cleanly.' },
    { text: leave('Modak card is showing.'), expect: 'The Modak card comes back.' },
    { text: 'Completion modal showing: leave with the zone badge, return to Zone Welcome.', expect: 'The Modak card says Play Again (Replay on phone), never Continue. Fireworks and mandala have no zone badge, so they are not a leave point.' },
    { text: 'After the above, tap Play Again.', expect: 'Starts fresh at the opening modal and the first beat (Bush counts reset), not at a saved beat.' },
  ]),

  'continue-pond': list('Pond (Symbol Mountain 2)', [
    { text: leave('Rock: holding the rock part-way.'), expect: 'Rock is back in place; "Press and hold to move it" replays.' },
    { text: leave('Rock already moved; reeds not yet parted.'), expect: 'Rock stays moved; the reeds step is ready; its line replays.' },
    { text: leave('Trunk card is showing.'), expect: 'The Trunk card comes back, then the lotus step.' },
    { text: leave('Lotus step: holding the lotus part-way.'), expect: 'Lotus is ready to hold again; water already reaches it.' },
    { text: leave('Lotus card is showing.'), expect: 'The Lotus card comes back, then the completion modal.' },
    { text: 'Check that the rock, reeds, lotus and turtle sit where they did before leaving.', expect: 'Same layout in both visits (no jump, no overlap).' },
  ]),

  'continue-tusk': list('Eyes, Ears and Tusk (Symbol Mountain 3)', [
    { text: leave('Eyes game: before finding anything, or mid-flight with a feather or mango just tapped.'), expect: 'Eyes game restarts with the full intro; nothing is marked found.' },
    { text: leave('Eyes game: one of the two (feather or mango) fully delivered, the other not found.'), expect: 'The delivered one stays done (animal happy, object gone). The line says "Now find the ..." for the other; no long intro.' },
    { text: leave('Eyes card is showing.'), expect: 'The Eyes card comes back, then the Ears game starts.' },
    { text: leave('Ears game: Elephant round part-way (before Elephant is solved).'), expect: 'Ears restarts with the intro and the Elephant round from the beginning.' },
    { text: leave('Ears game: Elephant solved and revealed, Cow round not finished.'), expect: 'Starts at the Cow round: Elephant stays happy, no intro, Cow prompt plays, three sounds replay.' },
    { text: leave('Ears card is showing.'), expect: 'The Ears card comes back, then the Tusk game.' },
    { text: leave('Tusk nest game: first item (twig) not dropped yet, or mid-drag.'), expect: 'Nest game restarts at the first beat (twig), with the instruction line.' },
    { text: leave('Tusk nest game: twig dropped (nest grown), grass not dropped yet.'), expect: 'Starts at the grass beat with the nest already at stage 1; no twig beat replay.' },
    { text: leave('Tusk nest game: three items dropped, feather beat mid-drag.'), expect: 'Starts at the feather beat fresh (not half-dragged), nest at stage 3.' },
    { text: leave('Tusk nest game: all four items dropped, baby bird settling.'), expect: 'Goes straight to the final settle beat; the bird is happy once, no item beats replay.' },
    { text: leave('Tusk card is showing.'), expect: 'The Tusk card comes back.' },
    { text: leave('All three done, completion modal showing.'), expect: 'Completion modal comes back (not a blank scene). After finishing, Zone Welcome shows Replay.' },
  ]),

  'continue-final': list('Sacred Assembly (Symbol Mountain 4)', [
    { text: leave('Round 1 or 2: nothing or one symbol placed.'), expect: 'The right card for that round appears; nothing placed is lost.' },
    { text: leave('Mid-game: 3 to 5 symbols placed.'), expect: 'Placed symbols are still placed; the game resumes at the correct next round.' },
    { text: leave('A symbol card is showing, not yet placed.'), expect: 'No stale card is left; the round restarts cleanly.' },
    { text: leave('All 8 placed, during the final fireworks.'), expect: 'Final celebration, then the zone completion modal.' },
    { text: 'Check the Zone Welcome badge row after finishing.', expect: 'All 4 Symbol Mountain scenes show Replay.' },
  ]),

  'continue-vakratunda': list('Vakratunda Grove (Shloka River 1)', [
    { text: leave('Opening modal showing, Start not tapped.'), expect: 'Scene starts fresh with the opening modal and its line.' },
    { text: leave('Frog trace: part-way (frog mid-drag or on a lily pad).'), expect: 'Whole trace restarts: frog at the bank, intro line replays, VA-KRA-TUN-DA unlit.' },
    { text: leave('Vakratunda card is showing.'), expect: 'The Vakratunda card comes back once, then the Mahakaya logs.' },
    { text: leave('Mahakaya: 0 logs placed, a log held mid-drag.'), expect: 'Logs beat starts fresh: empty raft, no log held, instruction replays.' },
    { text: leave('Mahakaya: 1 log placed on the raft.'), expect: 'Raft shows 1 log, MA lit, next log waiting; starts at log 2. Not log 1 again.' },
    { text: leave('Mahakaya: 2 logs placed, third log mid-drag.'), expect: 'Raft shows 2 logs, MA-HA lit; the third log restarts at its waiting spot, not mid-drag.' },
    { text: leave('Mahakaya: 3 logs placed.'), expect: 'Raft shows 3 logs, MA-HA-KA lit; only the last log is left.' },
    { text: 'Mahakaya: place a log, then leave within 1 second and tap Continue.', expect: 'Continue still shows that log placed (never one log behind).' },
    { text: leave('Mahakaya card is showing.'), expect: 'The Mahakaya card comes back once, then the celebration and completion modal.' },
    { text: 'Collect the Mahakaya card, tap the zone badge within 2 seconds, then Continue.', expect: 'The Mahakaya card does NOT come back; you go on to fireworks, mandala and the completion modal. (Production build; the dev server cancels this timer.)' },
    { text: 'Any Continue above: check for leftovers.', expect: 'No old voice line, no stale hint level, no half-filled hold, no mid-drag position, no leftover gesture hand, no duplicate card.' },
    { text: 'With 2 logs saved, tap Replay on Zone Welcome (or Play Again on completion).', expect: 'Starts at beat 1: opening modal, empty raft. Continue afterwards does not bring back the 2 logs.' },
  ]),

  'continue-suryakoti': list('Suryakoti Bank (Shloka River 2)', [
    { text: leave('Suryakoti rub: part-way, some darkness cleared.'), expect: 'The whole rub restarts: darkness back, nothing lit, instruction replays (by design; the canvas is not saved).' },
    { text: leave('Suryakoti card is showing.'), expect: 'The Suryakoti card comes back once, then the Samaprabha game.' },
    { text: leave('Samaprabha: 0-3 clues revealed, mid-hold on a clue.'), expect: 'Samaprabha restarts at the first clue with an empty hold ring (by design: too short to checkpoint).' },
    { text: leave('Samaprabha card is showing.'), expect: 'The Samaprabha card comes back once.' },
    { text: 'Collect the Samaprabha card, tap the zone badge within 2 seconds, then Continue.', expect: 'No card again; goes on to the completion modal. (Production build.)' },
    { text: 'Any Continue above: check for leftovers.', expect: 'No old voice line, no stale hint level, no half-filled hold, no mid-drag position, no leftover gesture hand, no duplicate card.' },
    { text: 'Tap Replay / Play Again after any of the above.', expect: 'Starts at the opening modal and the rub game, nothing resumed.' },
  ]),

  'continue-nirvighnam': list('Nirvighnam Chant (Shloka River 3)', [
    { text: leave('Nirvighnam: stone hold part-way (ring half full).'), expect: 'Stone beat restarts: empty ring, stone instruction replays.' },
    { text: leave('Nirvighnam: stone cleared, branch not yet dragged.'), expect: 'Turtle at the first node, NIR lit, stone gone; the BRANCH instruction plays (not the stone one).' },
    { text: leave('Nirvighnam: branch mid-drag.'), expect: 'Branch is back in place, not mid-drag; NIR lit; branch instruction plays.' },
    { text: leave('Nirvighnam: stone and branch cleared, reeds not yet swiped.'), expect: 'NIR-VIGH lit; the REEDS instruction plays; no stone or branch replay.' },
    { text: 'Clear the branch, then leave within 1 second and tap Continue.', expect: 'Continue shows the branch cleared.' },
    { text: leave('Nirvighnam card is showing.'), expect: 'The Nirvighnam card comes back once, then Kurumedeva.' },
    { text: leave('Kurumedeva: round 1 (ask Elephant) not finished.'), expect: 'Round 1 restarts: no bridge, Elephant waiting, "ask Elephant" line plays.' },
    { text: leave('Kurumedeva: round 1 done (logs bridge built, KURU lit).'), expect: 'Log bridge built, Elephant helping, Monkey waiting; the "ask Monkey" line plays. No round 1 replay.' },
    { text: leave('Kurumedeva: round 2 done (rope), planks not placed.'), expect: 'KURU-ME lit, rope bridge, plank round starts with the plank instruction; 0 planks placed.' },
    { text: leave('Kurumedeva: 1 or 2 planks placed.'), expect: 'Plank round restarts with 0 planks (by design; the plank round is one beat).' },
    { text: leave('Kurumedeva card is showing.'), expect: 'The Kurumedeva card comes back once.' },
    { text: 'Collect the Kurumedeva card, tap the zone badge within 2 seconds, then Continue.', expect: 'No card again; goes on to the completion modal. (Production build.)' },
    { text: 'Any Continue above: check for leftovers.', expect: 'No old voice line, no stale hint level, no half-filled hold, no mid-drag position, no leftover gesture hand, no duplicate card.' },
    { text: 'With obstacles or rounds saved, tap Replay / Play Again.', expect: 'Starts at the opening modal and the stone; Kurumedeva starts at round 1.' },
  ]),

  'continue-sarvakaryeshu': list('Sarvakaryeshu Chant (Shloka River 4)', [
    { text: leave('Sarvakaryeshu: card 1 showing, not answered.'), expect: 'Card 1 shows again with its line; scene visible (not blank).' },
    { text: leave('Sarvakaryeshu: card 1 answered, card 2 showing.'), expect: 'Starts at card 2: SAR lit, card 2 line plays. No card 1.' },
    { text: leave('Sarvakaryeshu: card 3 showing (2 answered).'), expect: 'Starts at card 3: SAR-VA lit.' },
    { text: leave('Sarvakaryeshu: card 4 showing (3 answered).'), expect: 'Starts at card 4: SAR-VA-KAR lit.' },
    { text: 'Answer a card correctly, then leave within 1 second and tap Continue.', expect: 'Continue starts at the next card (never the one just answered).' },
    { text: leave('Sarvakaryeshu card is showing.'), expect: 'The card comes back once, then the Sarvada game.' },
    { text: leave('Sarvada: morning, symbol not found yet.'), expect: 'Morning restarts: scene line, then "find the symbol".' },
    { text: leave('Sarvada: morning found, afternoon showing.'), expect: 'Starts at the afternoon: SAR lit; no scene intro; afternoon line plays.' },
    { text: leave('Sarvada: afternoon found, night showing.'), expect: 'Starts at night: SAR-VA lit.' },
    { text: 'Find a symbol, then leave within 1 second and tap Continue.', expect: 'Continue starts at the next time of day.' },
    { text: leave('Sarvada card is showing.'), expect: 'The card comes back once.' },
    { text: 'Collect the Sarvada card, tap the zone badge within 2 seconds, then Continue.', expect: 'No card again; goes on to the completion modal. (Production build.)' },
    { text: 'Any Continue above: check for leftovers.', expect: 'No old voice line, no stale hint level, no half-filled hold, no mid-drag position, no leftover gesture hand, no duplicate card.' },
    { text: 'With cards or times saved, tap Replay / Play Again.', expect: 'Starts at the opening modal and card 1; Sarvada starts at morning.' },
  ]),

  'continue-sr-finale': list('Shloka River Finale (Shloka River 5)', [
    { text: leave('Opening modal showing, Start not tapped.'), expect: 'Fresh opening modal.' },
    { text: leave('Arranging: 0 words placed.'), expect: 'Empty board; the first word plays; you can place words.' },
    { text: leave('Arranging: 3 words placed.'), expect: '3 boats stay placed in order; the 4th slot is next. No target-word audio giving the answer, no whole-shloka intro.' },
    { text: leave('Arranging: 7 words placed.'), expect: '7 boats placed; only the last slot is left.' },
    { text: 'Place a word, then leave within 1 second and tap Continue.', expect: 'Continue shows that word placed (never one behind).' },
    { text: 'Place a word wrongly, then leave and tap Continue.', expect: 'The wrong boat is not counted; Continue resumes at the same slot.' },
    { text: leave('Success: during the completed-shloka playback.'), expect: 'Board shows filled; playback restarts cleanly, then the orbs celebration.' },
    { text: 'Any Continue above: check for leftovers.', expect: 'No old voice line, no stale hint level, no half-filled hold, no mid-drag position, no leftover gesture hand, no duplicate card.' },
    { text: 'With 3 words saved, tap Replay on Zone Welcome.', expect: 'Starts at the opening modal with an empty board. Continue afterwards does not bring back the 3 boats.' },
    { text: 'Finish the finale. Check Zone Welcome.', expect: 'All 5 Shloka River scenes show Replay.' },
  ]),

  'continue-family-tree': list('Family Tree (About Me Hut 1)', [
    { text: 'Place a family member (Ganesha tree or your tree), then leave within 1 second and tap Continue.', expect: 'That member is still placed (saved instantly).' },
    { text: 'With members placed, tap Replay on Zone Welcome.', expect: 'Starts at the opening with an empty tree.' },
    { text: leave("Ganesha's tree: 2 of 4 members placed."), expect: 'Placed members stay; a resume message like "2/4" shows for a few seconds.' },
    { text: leave("Ganesha's tree: all 4 placed, before tapping Continue."), expect: 'A message says the tree is complete; the Continue button is available.' },
    { text: leave('Your tree: 1 family member added.'), expect: 'Added member stays; a message shows how many are added.' },
    { text: leave('A name modal is open (typing a name).'), expect: 'The modal is closed; the family built so far is kept. No stale text.' },
    { text: leave('Side-by-side trees showing.'), expect: 'Both trees show; completion works.' },
  ]),

  'continue-favorite-food': list('Favourite Food (About Me Hut 2)', [
    { text: leave('A Ganesha question is showing (food, colour, activity or friend).'), expect: 'That question restarts and its line replays.' },
    { text: leave('Right after a correct food answer (celebration).'), expect: 'Resumes at the NEXT question (colour) with Modak already collected. The food question is not asked again; no old cheer.' },
    { text: leave('Right after a correct colour answer, then after activity, then after friend.'), expect: 'Resumes at the next question each time (activity, friend, then your own intro). Never the question you just answered.' },
    { text: 'Answer a question correctly, then leave within 1 second and tap Continue.', expect: 'Continue is at the next question (the answer was saved instantly, never one step behind).' },
    { text: 'With answers saved, tap Replay on Zone Welcome.', expect: 'Starts at the opening modal and the food question; earlier answers are gone.' },
    { text: leave('Your food: the drawing pad is open with a few strokes.'), expect: 'The drawing pad comes back with Done and Save, not the food choices.' },
    { text: leave('Your food: the typing box is open.'), expect: 'The typing box comes back.' },
    { text: leave('Your colour / activity / friend name step.'), expect: 'The same step shows with your earlier choices kept.' },
    { text: leave('Comparison card is showing.'), expect: 'The comparison card comes back.' },
  ]),

  'continue-dreams': list('Dreams and Wishes (About Me Hut 3)', [
    { text: leave('Wish 1: after 2 taps.'), expect: 'Wish 1 restarts with taps reset; its line replays.' },
    { text: leave('Wish 1 finished (completion modal showing).'), expect: 'Resumes at wish 2 (bowls and plates visible, never an empty background). Wish 1 is not redone.' },
    { text: leave('Wish 2 finished (completion modal showing).'), expect: 'Resumes at wish 3, not wish 2.' },
    { text: leave('Wish 3 finished.'), expect: 'Resumes at the all-wishes celebration, then the dream drawing.' },
    { text: 'Finish a wish, then leave within 1 second and tap Continue.', expect: 'Continue is at the next wish (saved instantly).' },
    { text: 'With wishes saved, tap Replay on Zone Welcome.', expect: 'Starts at the opening modal and wish 1.' },
    { text: leave('Wish 3: part-way through.'), expect: 'Wish 3 restarts with items reset.' },
    { text: leave('Dream drawing: the pad is open.'), expect: 'The drawing pad comes back with Done and Save.' },
    { text: leave('Dream clearing (tapping the trunk).'), expect: 'Clearing restarts; the cloud line replays.' },
    { text: leave('Comparison card is showing.'), expect: 'The comparison card comes back.' },
  ]),

  'continue-indian-story': list('My Indian Story (About Me Hut 4)', [
    { text: 'Finish a step (e.g. pick a region), go to the next step, then leave within 1 second and tap Continue.', expect: 'Continue starts at the step you reached, restarted fresh (saved instantly).' },
    { text: 'Midway through the story, tap Replay after finishing, or Play Again.', expect: 'Starts at the opening, nothing from the old run comes back.' },
    { text: leave("Ganesha's home: after finding one or two places."), expect: 'Step restarts with the places reset; the magnifier is back; the line replays.' },
    { text: leave('Your home: a region chosen.'), expect: 'Step restarts with the region cleared; you can choose again.' },
    { text: leave('Languages step (Ganesha or yours).'), expect: 'The same step shows; your earlier choices are kept.' },
    { text: leave('Festivals step (Ganesha or yours).'), expect: 'The same step shows; choices are kept.' },
    { text: leave('Origin card is showing.'), expect: 'The origin card comes back.' },
  ]),
};

export const CONTINUE_GROUP_LABEL = 'Continue after leaving to map (all 13 scenes)';
