// "Continue after leaving to map" checklists — one per live scene (13).
//
// Run these in the MAIN app, not the game-test harness: Continue lives on Zone Welcome.
//   npm run dev  ->  open http://localhost:5173/?checklist=1  (dev builds only)
// The panel floats over the app; pick a scene from "Share / more" -> "Continue after leaving to map".
//
// Every step: play to the state, leave with the back-to-map button (or the zone badge),
// then tap the scene's button on Zone Welcome. It must say "Continue" (not Start / Replay).
// Mid-game states restart the CURRENT beat cleanly by design (the instruction line replays);
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
    { text: leave('Mooshika card is showing.'), expect: 'The Mooshika card comes back, then the scene moves on to the mud crossing.' },
    { text: leave('Flower Journey (mud / leaves / branch): part-way through.'), expect: 'That mini-game restarts from its beginning with the flower count reset. Not blank.' },
    { text: leave('Garland: after threading some flowers.'), expect: 'Garland restarts with all 6 flowers available and the instruction replays.' },
    { text: leave('Belly card is showing.'), expect: 'The Big Belly card comes back.' },
    { text: leave('Carrying the garland to Ganesha, mid-drag.'), expect: 'The carry beat restarts cleanly.' },
    { text: leave('Modak card is showing.'), expect: 'The Modak card comes back.' },
    { text: leave('During the fireworks and mandala.'), expect: 'Fireworks play again, then the completion modal. After finishing, Zone Welcome shows Replay.' },
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
    { text: leave('Eyes game: found one or two clues.'), expect: 'Eyes game restarts and plays; not blank.' },
    { text: leave('Eyes card is showing.'), expect: 'The Eyes card comes back, then the Ears game starts.' },
    { text: leave('Ears game: part-way through the rhythm.'), expect: 'Ears game restarts from its first note.' },
    { text: leave('Ears card is showing.'), expect: 'The Ears card comes back, then the Tusk game.' },
    { text: leave('Tusk nest game: part-way through.'), expect: 'Nest game restarts cleanly from its first beat.' },
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
    { text: leave('Vakratunda game: part-way through a round.'), expect: 'Game restarts at its own start; the instruction replays.' },
    { text: leave('Vakratunda card is showing.'), expect: 'The Vakratunda card comes back, then the Mahakaya game.' },
    { text: leave('Mahakaya game: part-way through.'), expect: 'Mahakaya game restarts cleanly; Vakratunda stays learned.' },
    { text: leave('Mahakaya card is showing.'), expect: 'The Mahakaya card comes back, then the mandala and completion modal.' },
  ]),

  'continue-suryakoti': list('Suryakoti Bank (Shloka River 2)', [
    { text: leave('Suryakoti game: part-way through.'), expect: 'Game restarts at its start; the instruction replays.' },
    { text: leave('Suryakoti card is showing.'), expect: 'The Suryakoti card comes back, then the Samaprabha game.' },
    { text: leave('Samaprabha game: while holding on a shadow.'), expect: 'Samaprabha restarts at the first clue.' },
    { text: leave('Samaprabha card is showing.'), expect: 'The Samaprabha card comes back, then the mandala and completion modal.' },
  ]),

  'continue-nirvighnam': list('Nirvighnam Chant (Shloka River 3)', [
    { text: leave('Nirvighnam game (rock): part-way through.'), expect: 'Game restarts; the instruction replays.' },
    { text: leave('Nirvighnam card is showing.'), expect: 'The Nirvighnam card comes back, then the Kurumedeva game.' },
    { text: leave('Kurumedeva game: part-way through.'), expect: 'Kurumedeva restarts cleanly.' },
    { text: leave('Kurumedeva card is showing.'), expect: 'The Kurumedeva card comes back, then the mandala and completion modal.' },
  ]),

  'continue-sarvakaryeshu': list('Sarvakaryeshu Chant (Shloka River 4)', [
    { text: leave('Sarvakaryeshu game: part-way through.'), expect: 'Game restarts and shows the scene (not a blank screen).' },
    { text: leave('Sarvakaryeshu card is showing.'), expect: 'The card comes back, then the Sarvada game.' },
    { text: leave('Sarvada game: part-way through.'), expect: 'Sarvada restarts cleanly.' },
    { text: leave('Sarvada card is showing.'), expect: 'The card comes back, then the mandala and completion modal.' },
  ]),

  'continue-sr-finale': list('Shloka River Finale (Shloka River 5)', [
    { text: leave('Arranging the shloka: some words placed.'), expect: 'Arrange step restarts; the current word plays; you can place words again.' },
    { text: leave('Success: during the completed-shloka playback.'), expect: 'Board shows filled; playback and the Home modal appear.' },
    { text: 'Finish the finale. Check Zone Welcome.', expect: 'All 5 Shloka River scenes show Replay.' },
  ]),

  'continue-family-tree': list('Family Tree (About Me Hut 1)', [
    { text: leave("Ganesha's tree: 2 of 4 members placed."), expect: 'Placed members stay; a resume message like "2/4" shows for a few seconds.' },
    { text: leave("Ganesha's tree: all 4 placed, before tapping Continue."), expect: 'A message says the tree is complete; the Continue button is available.' },
    { text: leave('Your tree: 1 family member added.'), expect: 'Added member stays; a message shows how many are added.' },
    { text: leave('A name modal is open (typing a name).'), expect: 'The modal is closed; the family built so far is kept. No stale text.' },
    { text: leave('Side-by-side trees showing.'), expect: 'Both trees show; completion works.' },
  ]),

  'continue-favorite-food': list('Favourite Food (About Me Hut 2)', [
    { text: leave('A Ganesha question is showing (food, colour, activity or friend).'), expect: 'That question restarts and its line replays.' },
    { text: leave('Right after a correct answer (celebration).'), expect: 'Question restarts; the cheer does not double-play.' },
    { text: leave('Your food: the drawing pad is open with a few strokes.'), expect: 'The drawing pad comes back with Done and Save, not the food choices.' },
    { text: leave('Your food: the typing box is open.'), expect: 'The typing box comes back.' },
    { text: leave('Your colour / activity / friend name step.'), expect: 'The same step shows with your earlier choices kept.' },
    { text: leave('Comparison card is showing.'), expect: 'The comparison card comes back.' },
  ]),

  'continue-dreams': list('Dreams and Wishes (About Me Hut 3)', [
    { text: leave('Wish 1: after 2 taps.'), expect: 'Wish 1 restarts with taps reset; its line replays.' },
    { text: leave('Wish 2: after finishing wish 2 (before wish 3).'), expect: 'Wish 2 comes back with the bowls and plates (never an empty background).' },
    { text: leave('Wish 3: part-way through.'), expect: 'Wish 3 restarts with items reset.' },
    { text: leave('Dream drawing: the pad is open.'), expect: 'The drawing pad comes back with Done and Save.' },
    { text: leave('Dream clearing (tapping the trunk).'), expect: 'Clearing restarts; the cloud line replays.' },
    { text: leave('Comparison card is showing.'), expect: 'The comparison card comes back.' },
  ]),

  'continue-indian-story': list('My Indian Story (About Me Hut 4)', [
    { text: leave("Ganesha's home: after finding one or two places."), expect: 'Step restarts with the places reset; the magnifier is back; the line replays.' },
    { text: leave('Your home: a region chosen.'), expect: 'Step restarts with the region cleared; you can choose again.' },
    { text: leave('Languages step (Ganesha or yours).'), expect: 'The same step shows; your earlier choices are kept.' },
    { text: leave('Festivals step (Ganesha or yours).'), expect: 'The same step shows; choices are kept.' },
    { text: leave('Origin card is showing.'), expect: 'The origin card comes back.' },
  ]),
};

export const CONTINUE_GROUP_LABEL = 'Continue after leaving to map (all 13 scenes)';
