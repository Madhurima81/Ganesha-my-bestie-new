// "Still to test" checklists - one per scene, ONLY the changes that have not been tested yet
// (Shloka River only - Symbol Mountain is finished and signed off 2026-10-12; About Me Hut has its own Continue checklists in continueChecklists.js).
// Created 2026-10-12. When a row passes, delete it; when a list is empty, delete the list. The finished
// Continue/sound checklists are archived in TEST_CHECKLISTS.md ("Archive 2026-10-12").
//
// Run in the MAIN app:  npm run dev  ->  http://localhost:5173/?unlockall=1   (dev builds only)
// "Leave" = zone badge / back-to-map button, then tap the scene's Continue on Zone Welcome.

const leave = (where) => `${where} Then leave with the zone badge and tap this scene's Continue on Zone Welcome.`;

// Shared rows: the success-line rule (decided 2026-10-11) and the Zone Welcome card.
const DURING = 'Leave DURING the success line (right after solving).';
const AFTER = 'Wait until the success line has FINISHED, then leave.';

// Run in every scene: these four were never recorded as run in any scene.
const NEVER_RUN = [
  { text: 'Mid-game, switch to another browser tab for about 10 seconds, then come back.', expect: '3-2-1 countdown, then it picks up where it was. No double voice line, no restart from scratch.' },
  { text: 'Mid-game, press the browser refresh (F5).', expect: 'Same as Continue: the current beat restarts cleanly. Never a blank or frozen screen.' },
  { text: 'Turn voice off, then repeat one Continue.', expect: 'Resumes silently and correctly. Replay is disabled while muted.' },
  { text: 'Wait about 20 seconds on a Continue that looks blank (dev server first load only).', expect: 'The scene appears. If still blank after 30 seconds, mark Fail with a screenshot.' },
];

const PLAY_AGAIN_ROW = (what) => ({
  text: `With ${what} saved, tap Play Again on the completion modal (or Replay on Zone Welcome).`,
  expect: 'Starts fresh at the opening modal and the first beat. Nothing saved comes back (the new checkpoint and success-line fields are cleared).',
});

const OPENING_VO_ROW = {
  text: 'Tap Play Again (or Replay) and watch the opening modal.',
  expect: 'The opening line is spoken (shared OpeningModal fix: in dev it used to be silent after Play Again).',
};

const ZONE_WELCOME_ROW = {
  text: 'Finish the scene once. Replay it, play part-way, then leave with the zone badge.',
  expect: 'The card shows Continue + the replay arrow (not only Replay), the zone still counts as complete, and Continue resumes your replay.',
};

const list = (title, items) => ({ title: `Still to test - ${title}`, items: [...items, ...NEVER_RUN] });

export const STILL_TO_TEST_CHECKLISTS = {
  // About Me Hut: one list per scene, in the order a tester plays it (zone order: Family Tree, Food,
  // Dreams, Indian Story). Each list runs: normal play -> leave mid-game -> leave during / after a success
  // line -> leave within 1 s of a solve -> unsolved beat -> comparison/completion -> tab switch -> Play Again.
  'todo-aboutme-1-family-tree': list('About Me Hut 1 - Family Tree', [
    { text: 'Play it through WITHOUT leaving: place the 3 family members, wait for "And that\'s me", tap Continue, make your tree, tap Done.', expect: 'One chime per member (not two). "You met everyone in my family" plays after Done. After your Done, "Our family trees are different..." plays. Normal flow is unchanged.' },
    { text: leave('Ganesha tree: place 2 or 3 family members.'), expect: 'The scene resumes, the placed members stay, nothing freezes.' },
    { text: 'Ganesha tree: place a member, then leave DURING "This is my father..." (or any member line), and tap Continue.', expect: 'That member stays placed. Continue replays the line of the member you were on once, then says "Continue tapping." Leaving AFTER the line finished gives only "Continue tapping."' },
    { text: 'Ganesha tree: place all 4 members, leave, tap Continue.', expect: 'The all-placed sparkle shows and the Continue button is there. If you left during a member line it replays, then a short line tells you to tap Continue.' },
    { text: 'Ganesha tree: all 4 placed, tap Continue, then leave DURING "You met everyone in my family".', expect: 'Zone Welcome speaks alone. Continue replays that line once (about half a second after load), then moves to "Now let\'s make your family tree".' },
    { text: 'Ganesha tree: tap Continue, then leave within 1 second and tap Continue on Zone Welcome.', expect: 'Same as above: the Continue tap was saved instantly.' },
    { text: 'Ganesha tree: tap Continue, wait for the line to finish and the transition screen to show, then leave.', expect: 'Continue shows the transition screen. The "You met everyone" line is NOT replayed.' },
    { text: 'In the Ganesha tree tap Continue twice quickly, or tap Continue then the zone badge immediately.', expect: 'Never a frozen scene; Continue does not skip the transition.' },
    { text: 'Your tree: add a family member, leave within 1 second, tap Continue.', expect: 'The member is still there with the name you gave it.' },
    { text: leave('Your tree: a name modal is open (typing a name).'), expect: 'The modal is closed; the family built so far is kept. No stale text.' },
    { text: 'Your tree: tap Done to see both trees, then leave and Continue.', expect: 'Both trees show and "Our family trees are different..." plays.' },
    { text: 'Your tree, idle: switch to another browser tab for about 10 seconds, come back.', expect: 'No hint voice while the tab was hidden. 3-2-1 countdown on return, then the hint works normally.' },
    PLAY_AGAIN_ROW('family members'),
  ]),

  'todo-aboutme-2-food': list('About Me Hut 2 - Favourite Food', [
    { text: 'Play it through WITHOUT leaving: answer all four of Ganesha\'s questions, then your food (draw it), colour, activity and friend name.', expect: 'Normal flow is unchanged. Your drawn food shows as your drawing in the header (not a pencil). The comparison line plays.' },
    { text: leave('Favourite Food: a question is showing (Ganesha\'s or yours), not answered yet.'), expect: 'The scene resumes about half a second after load. The question line plays ONCE, whole (not "Cho... Choose your colour").' },
    { text: 'Ganesha food: tap Modak, then leave within 1 second and tap Continue.', expect: 'The answer was saved at the tap: Continue shows the celebration, replays "Yes - I love modak!" once, then asks the colour question. Modak is in the header.' },
    { text: `Ganesha colour, activity, friend: ${DURING}`, expect: 'Continue shows the celebration state, replays that success line once, then the next question. The header shows every answer found so far.' },
    { text: `Ganesha colour, activity, friend: ${AFTER}`, expect: 'Continue goes straight to the next question after about half a second. The success line is NOT replayed.' },
    { text: 'Leave by the back button (not the badge) while a line is playing.', expect: 'No timer advances the game after you left; Continue resumes where you were.' },
    { text: `Your food, colour, activity (pick, drawing or typed): ${DURING}`, expect: 'Continue keeps your choice (a drawing shows as your drawing), replays the success line once ("Yummy!" etc.), then asks the next question. It is not asked again.' },
    { text: `Your food, colour, activity: ${AFTER}`, expect: 'Continue keeps your choice and goes straight to the next question with no replay.' },
    { text: `Your friend name: ${DURING}`, expect: 'Your typed name is kept, "Thanks for telling me!" replays once, then the comparison card shows.' },
    { text: 'Continue on the comparison card.', expect: 'The card shows your food, colour, activity and friend, and "Now we know some things we each enjoy." plays.' },
    { text: 'Ganesha question and your question, idle: switch to another browser tab for about 10 seconds, come back.', expect: 'No hint voice or glow while the tab was hidden. 3-2-1 countdown on return, the question replays, then hints work normally (they start after the question ends).' },
    PLAY_AGAIN_ROW('answers'),
  ]),

  'todo-aboutme-3-dreams': list('About Me Hut 3 - Dreams and Wishes', [
    { text: 'Play it through WITHOUT leaving: wish 1, wish 2, wish 3, then draw your dream, clear the clouds, comparison.', expect: 'Normal flow is unchanged: each wish plays its intro, instruction and success line, then moves on.' },
    { text: leave('Wish 1 or wish 3 part-way (not solved).'), expect: 'The wish restarts and you hear BOTH lines: "My first/next wish is for..." then the instruction.' },
    { text: leave('Wish 2 part-way (not solved).'), expect: 'The plates restart empty and the instruction plays once.' },
    { text: 'Tap the zone badge during the wish 1 (or wish 3) intro line.', expect: 'Zone Welcome speaks alone; the instruction line does NOT start after you left.' },
    { text: `Wish 1, 2 and 3: ${DURING}`, expect: 'Continue shows the finished board (header has Kindness/Sharing/Nature), replays the success line once, then the next wish starts.' },
    { text: `Wish 1, 2 and 3: ${AFTER}`, expect: 'Continue shows the finished board, then the next wish starts after about half a second. The success line is NOT replayed.' },
    { text: 'Solve a wish, then leave within 1 second and tap Continue.', expect: 'The wish is still solved (saved at the solving move), never restarted.' },
    { text: leave('Dream drawing: the pad is open with a few strokes.'), expect: 'The drawing pad comes back with Done and Save.' },
    { text: 'Dream drawing: tap Done, then leave during the success part. Also leave on the cloud-clearing step.', expect: 'Your drawing is kept every time; the clouds restart.' },
    { text: leave('Comparison card is showing.'), expect: 'The comparison card comes back with your drawing and its line plays.' },
    PLAY_AGAIN_ROW('wishes'),
  ]),

  'todo-aboutme-4-indian-story': list('About Me Hut 4 - My Indian Story (Step 1 voice fixes; the single-source-of-truth work is a separate session)', [
    { text: 'Play it through WITHOUT leaving.', expect: 'Normal flow is unchanged: each step plays its entry line, each correct guess plays its success line and moves on.' },
    { text: leave('Indian Story: any step.'), expect: 'The entry line plays about half a second after load, once. A fresh start from the opening modal has no extra delay.' },
    { text: 'Pick the correct language (or festival), then tap the zone badge during the success line.', expect: 'Zone Welcome speaks alone; the scene does not advance after you left.' },
    PLAY_AGAIN_ROW('story choices'),
  ]),

  'todo-aboutme-5-all-four': list('About Me Hut - all four scenes', [
    { text: 'In each of the four: tap the zone badge, then Continue, a few times in a row.', expect: 'Never a frozen scene and never a line firing right after the badge tap.' },
    ZONE_WELCOME_ROW,
  ]),

  // Sparkle cleanup (2026-10-14): all four games use AboutMeSparkle (gold star) and Dreams/Food share DiscoveryFlight.
  // Looks only - no voice, resume or save changes. Rows are added one game at a time, in the order Dreams, Food, Family Tree, Indian Story.
  'todo-aboutme-6-sparkle': {
    title: 'Still to test - About Me Hut sparkle cleanup',
    items: [
      { text: 'Dreams, wish 1: tap the earth once, then finish all three.', expect: 'A small gold star pop on each tap, a bigger gold star shower when all three are done. No coloured or round glow dots, nothing left on screen afterwards.' },
      { text: 'Dreams, wish 2 (plates): drop one right item, then finish the set. Then wish 3.', expect: 'Wish 2 shows the SAME gold stars as wish 1: a small pop on the plate, then the big shower. Wish 3 and the cloud clearing show the same two sizes.' },
      { text: 'Dreams: the three "wish complete" screens (smiley, heart, flower).', expect: 'One gold star shower over the screen instead of floating emoji. They fade out by themselves after about 2-3 seconds. Ganesha still bounces.' },
      { text: 'Dreams: clear the clouds to reveal the dream.', expect: 'A gold star burst around your drawing for about 3 seconds, then it stops (it no longer loops). The drawing still pulses.' },
      { text: 'Dreams: comparison card "We Both Have Wishes".', expect: 'Soft gold stars behind the card, then they fade out after about 3 seconds (they must NOT stay on screen).' },
      { text: 'Dreams: each time a wish icon pops up in the middle and flies to the top (wishes 1, 2, 3).', expect: 'Icon appears centred, pulses twice, flies up and fades; the success line starts at the same moment as before (not earlier or later). Same size as before.' },
      { text: 'Turn on "Reduce motion" in the device accessibility settings and replay a wish.', expect: 'The wish icon only fades in and out in the middle (no flying, no pulsing). Nothing breaks.' },
      { text: 'Food: answer each of the 4 questions (food, colour, activity, friend) correctly.', expect: 'A small gold star pop each time; a bigger gold shower on the last question of a step. Same gold stars as Dreams, no round glow dots. They fade out by themselves.' },
      { text: 'Food: the picked food / colour / friend icon in the middle of the screen (the flight).', expect: 'Same flight as before: icon centred, pulses twice, floats up. Child choices and the Modak keep their glow; the name label still shows where it did. The success line starts at the same moment as before.' },
      { text: 'Food: watch the Ganesha celebrating pictures and the comparison card at the end.', expect: 'Ganesha still bounces; the friend pair on the comparison card looks exactly as before.' },
      { text: 'Food: finish the scene and tap Play Again on the completion modal.', expect: 'Starts fresh at the opening modal; sparkles and flight work again.' },
      { text: 'Food and Dreams: after any icon flies up in the middle, watch for a second sparkle.', expect: 'No extra sparkle emoji after the gold stars; the flight is just the icon. The comparison card (titled Friends Now) shows soft gold stars that fade out after about 3 seconds.' },
      { text: 'Family Tree: place the Ganesha-tree members one by one, then wait about 5 seconds after the last one.', expect: 'A small gold star pop each time a member lands (including Ganesha filling himself in). Then, about 5 seconds after the last one, one bigger gold star shower (same as Dreams and Food), gone after about 2.5 seconds. "Tap Continue" still works at once and the tap clears it. No old round glow dots.' },
      { text: 'Family Tree: on the add-your-family screen, add a few members, then press Done!. Also press Continue on the Ganesha tree.', expect: 'A small gold star pop every time you add a member. A BIG gold star shower when you press Done! (it carries over onto the next screen), and the same big shower when you press Continue on the Ganesha tree, together with the chime and the line. The shower is gone after about 2.5 seconds.' },
      { text: 'Family Tree: reach the "Our Families!" side-by-side screen.', expect: 'Gold stars twinkle behind the two trees and stay while the screen is showing (this one is meant to stay).' },
      { text: 'Family Tree: play to the end, then Play Again on the completion modal.', expect: 'Fresh start; sparkles work again; no leftover stars from the last run.' },
      { text: 'My Indian Story: find each place on the India map in the first step.', expect: 'A small GOLD star pop on the spot you tapped (it used to be blue/cyan). When all places are found, the little hearts and the bigger gold shower play, then the line.' },
      { text: 'My Indian Story: pick your region, then your language, then your festivals.', expect: 'A small gold star pop around the thing you tapped each time; a bigger gold shower when a step is complete. Same gold stars as the other three games.' },
      { text: 'My Indian Story: the "your answer is correct" screen at the end of a guess.', expect: 'Soft gold stars for about 3 seconds, no leftover stars after they fade. Nothing is cut off early.' },
      { text: 'My Indian Story: the comparison card at the end, then Play Again on the completion modal.', expect: 'Soft gold stars behind the card (they fade after about 3 seconds). Play Again starts fresh at the opening modal.' },
      { text: 'Dreams: finish the scene and tap Play Again on the completion modal.', expect: 'Starts fresh at the opening modal; sparkles play again normally on the next run.' },
    ],
  },

  'todo-css-clash-batch-1': {
    title: 'Still to test - CSS clash batch 1 (Symbol Mountain scene-only)',
    items: [
      { text: 'Pond: solve the reeds/lotus flow and watch the lotus hint glow plus the final confetti.', expect: 'The hint glow still follows the lotus/target shape; the confetti still falls normally; no rectangular glow or wrong-speed pulse.' },
      { text: 'Pond: watch the water spray / falling droplet effect near the trunk interaction.', expect: 'Droplets still fall/fade as before; no map-style falling animation leaks in.' },
      { text: 'Symbol Mountain Tusk scene: trigger the telescope/tusk reveal and the final warm aura.', expect: 'The aura expands softly from the tusk reveal; symbol materialize/glow still looks the same; no shared zone-completion aura shape appears.' },
      { text: 'Symbol Mountain Tusk scene: watch hint glows and any musical-note/gentle-pulse moments.', expect: 'Hints still pulse in place; no About Me/Food gentle pulse leaks in.' },
      { text: 'Eye/Ear/Tusk legacy scene screen: check breathing, fade, slide, bounce and confetti moments if reachable from the harness.', expect: 'Entrances/exits still use the same motion locally; no shared AnimationWrapper motion leaks into this scene.' },
      { text: 'Sacred Assembly: tap a wrong marker, then complete enough symbols to see the association card and success/confetti effects.', expect: 'Wrong tap still shakes gently; association icon bounces; success/confetti floats as before.' },
      { text: 'Modak legacy scene CSS path, if reachable from an old harness route: trigger any fade-out visual.', expect: 'Fade-out still looks local and does not affect AnimationWrapper fadeOut.' },
      { text: 'Parent PIN screen (Parent Dashboard): enter a wrong PIN.', expect: 'The PIN dots shake side to side once (about half a second), the same as before; nothing else on the page moves.' },
      { text: 'Dreams (Wish 1 bubbles): tap a wrong (unkind) bubble.', expect: 'That one bubble shakes and dims briefly, the same as before; the other bubbles stay still.' },
      { text: 'Modak: play the whole scene once, from the opening modal to the completion screen.', expect: 'Nothing looks or behaves differently (an unused modal import was removed from the scene; a modal that never rendered cannot disappear).' },
      { text: 'Symbol Mountain: complete a symbol and watch its icon bloom in the sidebar.', expect: 'A quick (about 0.9 s) bloom with a soft gold ring around the icon.' },
      { text: 'Shloka River: complete a word and watch its icon bloom in the sidebar.', expect: 'A slightly slower (about 1.2 s) bloom with a bright gold glow around the icon.' },
      { text: 'Go Symbol Mountain, then Shloka River, then back to Symbol Mountain; complete one icon in each.', expect: 'Each zone keeps its OWN bloom (ring in Symbol Mountain, glow in Shloka River) in every order.' },
      { text: 'Both sidebars, otherwise: look at icon sizes, locked vs unlocked icons and the collection.', expect: 'Exactly as before; only the bloom changed.' },
    ],
  },

  'todo-symbol-mountain-eyes-ears-nest-voice-watchdog': {
    title: 'Still to test - Symbol Mountain Eyes, Ears and nest voice/watchdog',
    items: [
      { text: 'Finish Eyes.', expect: 'The Eyes reveal card appears once, and only once.' },
      { text: 'Finish Ears.', expect: 'The Ears reveal card appears once, and only once.' },
      { text: 'Finish the nest / Tusk game.', expect: 'The Tusk reveal card appears once, and only once.' },
      { text: 'Leave during the Eyes reveal, then Continue from Zone Welcome.', expect: 'The Eyes reveal card appears once; no blank screen or freeze.' },
      { text: 'Leave during the Ears reveal, then Continue from Zone Welcome.', expect: 'The Ears reveal card appears once; no blank screen or freeze.' },
      { text: 'Leave during the Tusk reveal, then Continue from Zone Welcome.', expect: 'The Tusk reveal card appears once; no blank screen or freeze.' },
      { text: 'Switch tabs during any reveal card, wait about 10 seconds, then return.', expect: 'The reveal continues once after the countdown; no duplicate card or stuck overlay.' },
      { text: 'Finish Eyes/Ears/nest once, then tap Play Again from the completion modal or Replay from Zone Welcome.', expect: 'Fresh run starts normally; the first game line after the opening modal is audible.' },
    ],
  },

  'todo-symbol-mountain-pond-watchdog': {
    title: 'Still to test - Symbol Mountain Pond watchdog',
    items: [
      { text: 'Finish Pond and watch the Trunk and Lotus reveal cards.', expect: 'Each card appears once; no duplicate card and no freeze.' },
      { text: 'Leave during each Pond reveal, then tap Continue on Zone Welcome.', expect: 'The interrupted card appears once after Continue; no blank screen, duplicate card or freeze.' },
      { text: 'Switch tabs during each Pond reveal, wait about 10 seconds, then return.', expect: 'The reveal continues once after the countdown; no duplicate card or stuck overlay.' },
      PLAY_AGAIN_ROW('Pond progress'),
    ],
  },

  'todo-vakratunda': list('Vakratunda Grove + Mahakaya (Shloka River 1)', [
    { text: leave('Mahakaya: 1 log placed.'), expect: 'You hear "Keep placing the logs on the raft" - NOT the intro and NOT the first-log hint.' },
    { text: leave('Mahakaya: 2 or 3 logs placed.'), expect: 'You hear "Keep placing the logs on the raft" - NOT the intro and NOT the first-log hint.' },
    { text: leave('Mahakaya: 0 logs placed.'), expect: 'The full intro plays, as before.' },
    { text: 'Vakratunda: stay idle until the hint glow shows on the frog/object.', expect: 'A soft glow that follows the shape of the object, with no rectangle and no jump.' },
    { text: leave('Vakratunda card is showing.'), expect: 'Continue shows the Vakratunda card once, about 1 second after the scene loads (it used to be missing in dev).' },
    { text: leave('Mahakaya card is showing.'), expect: 'Continue shows the Mahakaya card once, then the finale.' },
    { text: 'Play Vakratunda and Mahakaya start to finish without leaving.', expect: 'Both cards still appear once each after their games (the card fix must not break normal play).' },
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: 'Mahakaya: 1, 2 or 3 logs placed, then leave with the zone badge and tap Continue (do the 3 cases if you can).', expect: 'You hear ONE line, "Keep placing the logs on the raft" (never the intro, never log-specific). The hint cycle starts only after it ends: idle ~12s for the first nudge. (This replaces the older "Keep adding logs" / "Drag the next log" rows above.)' },
    { text: 'Mahakaya: play 4 logs normally without leaving; idle on log 2 or 3.', expect: 'The normal flow is unchanged: "Keep adding logs to the raft" after log 1, the "Drag the next log" nudge when idle, and NO resume line.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some logs placed'),
  ]),

  'todo-vakratunda-watchdog': {
    title: 'Still to test - Vakratunda watchdog',
    items: [
      { text: 'Finish Vakratunda and watch both reveal cards.', expect: 'Each card appears once; no duplicate card and no freeze.' },
      { text: 'Leave during each Vakratunda reveal, then tap Continue on Zone Welcome.', expect: 'The interrupted card appears once after Continue; no blank screen, duplicate card or freeze.' },
      { text: 'Switch tabs during each Vakratunda reveal.', expect: 'The reveal continues once after returning; no duplicate card or stuck overlay.' },
      PLAY_AGAIN_ROW('Vakratunda progress'),
      { text: 'Cold Continue into Vakratunda.', expect: 'The first line plays or the scene becomes interactive; no silent freeze.' },
    ],
  },

  'todo-suryakoti': list('Suryakoti + Samaprabha (Shloka River 2)', [
    { text: 'Samaprabha: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent - no line from Samaprabha carries on over it.' },
    { text: 'Suryakoti rub game: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent.' },
    { text: 'During Suryakoti rubbing, wait for the nudge.', expect: '"Keep rubbing to bring back more light." plays once; the rub flow remains interactive.' },
    { text: 'Play Samaprabha normally without leaving (several clues).', expect: 'Hints and the next lines still arrive; nothing stalls (the voice fix must not break normal play).' },
    { text: 'Finish the Suryakoti rub in normal play and watch the bunny.', expect: 'The bunny hops, then the Suryakoti card appears (the old freeze is gone).' },
    { text: leave('Suryakoti card is showing.'), expect: 'Continue shows the Suryakoti card once, about 1 second after load. (If the card does not appear, note whether the checklist window had focus.)' },
    { text: 'Start Suryakoti fresh (Start or Play Again) and wait.', expect: 'The intro line is spoken after a short pause and the rub game is usable.' },
    { text: 'Enter Samaprabha (after the Suryakoti card) and leave then Continue in it.', expect: 'The Samaprabha intro is spoken about half a second after it opens, both on first entry and on Continue.' },
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: leave('Samaprabha: 1 clue revealed, its line and "find another" finished.'), expect: 'Starts at clue 2; you hear ONE line, "Keep pressing and holding to look closely" (clue 1 line not replayed). Hints start only after it ends.' },
    { text: 'Samaprabha: hold clue 3 to the end, leave within 1 second (its line is playing), then Continue.', expect: 'Starts at clue 4; the clue 3 line replays once, then "Keep pressing and holding to look closely"; hints start fresh after it.' },
    { text: leave('Samaprabha: 2 of 4 clues revealed, line finished.'), expect: 'Starts at clue 3: 2 syllables lit, 2 shadows faded, no intro line, empty hold ring, the resume line plays.' },
    { text: 'Samaprabha: play all 4 clues normally without leaving.', expect: 'After clue 1 you still hear "Press and hold another part of the shadow"; NO resume line; the word and success line finish the game.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('Suryakoti progress'),
    { text: 'Finish Suryakoti and Samaprabha normally.', expect: 'Both reveal cards appear exactly once; no duplicate card or freeze.' },
    { text: 'Leave during each reveal and tap Continue.', expect: 'The correct reveal card appears once after Continue; no overlapping or missing line.' },
    { text: 'Switch tabs during each reveal.', expect: 'The card and line recover once; no duplicate card or freeze.' },
    { text: 'Cold Continue into Samaprabha with 1, 2, 3, and 4 saved clues; repeat with each clue line unfinished where applicable.', expect: 'Only the exact saved-state line plays: branch/reeds/stump reveal where pending, then scene11_sama_resume only for states that own it; no intro or generic fallback.' },
  ]),

  'todo-nirvighnam': list('Nirvighnam + Kurumedeva (Shloka River 3)', [
    { text: 'Kurumedeva: stay idle until the Elephant / Monkey friend glow shows.', expect: 'A soft glow that follows the animal shape; the animal does NOT jump right/down while it glows (CSS clash fix).' },
    { text: 'Kurumedeva: stay idle on the plank round until the plank pile and the drop pad pulse.', expect: 'The plank pile pulses and the dashed drop pad pulses; nothing jumps.' },
    { text: leave('Nirvighnam card is showing.'), expect: 'Continue shows the Nirvighnam card once, about 1 second after load.' },
    { text: leave('Nirvighnam: stone cleared.'), expect: 'The branch line is spoken (after about half a second), not silent and not the stone line.' },
    { text: 'Open Kurumedeva (after the Nirvighnam card) fresh, and again after a Continue.', expect: 'The Kurumedeva intro is spoken after a short pause; the game then works.' },
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    OPENING_VO_ROW,
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('Nirvighnam / Kurumedeva progress'),
  ]),

  'todo-sarvakaryeshu': list('Sarvakaryeshu + Sarvada (Shloka River 4)', [
    OPENING_VO_ROW,
    { text: 'Open the scene and look at the syllable row (e.g. ma ha ka ya) in the top-left, under the zone badge.', expect: 'The row sits fully below the badge, not covered by it. Check an iPad size and a phone landscape size.' },
    { text: 'Sarvakaryeshu: stay idle until the strongest hint (L3) shows on the right symbol.', expect: 'The circle pulses 3 times and keeps a gold border; no jump.' },
    { text: 'Sarvakaryeshu: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent - no line carries on over it.' },
    { text: 'Sarvakaryeshu: answer a card correctly, then leave within 1 second and tap Continue.', expect: 'Starts at the NEXT card (never the one you just answered); the syllables lit so far stay lit.' },
    { text: 'Sarvakaryeshu: answer card 4, leave during the success line, then Continue.', expect: 'The word "sarvakaryeshu" and the success line play, then the card. Card 4 does not come back.' },
    { text: leave('Sarvakaryeshu card is showing.'), expect: 'Continue shows the Sarvakaryeshu card once, about 1 second after load.' },
    { text: 'Start Sarvada fresh and wait.', expect: 'The scene intro is spoken, then the first "find the symbol" round starts.' },
    { text: 'Sarvada: stay idle until the symbol ring hint shows.', expect: 'The ring glows with a gentle scale; no rectangle, no jump.' },
    { text: 'Sarvada: tap the zone badge in the middle of a spoken line.', expect: 'Zone Welcome is silent.' },
    { text: 'Sarvada: find a symbol, then leave within 1 second and tap Continue.', expect: 'Starts at the next time of day (never the one you just found).' },
    { text: leave('Sarvada: first time of day finished.'), expect: 'Continue starts the next round after about half a second, with its line audible, and the game does not freeze.' },
    { text: 'Play Sarvada through a time-of-day change without leaving.', expect: 'The next round starts; nothing stalls after the progress is saved (checks the callback-ref fix).' },
    { text: 'Sarvada: find the night symbol, leave during the ending, then Continue.', expect: 'The boat scene with Ganesha, the word "sarvada" and the success line play, then the card. Night does not come back.' },
    { text: 'Play both normally without leaving.', expect: 'Hints and the next lines still arrive; nothing stalls.' },
    { text: 'Play Sarvakaryeshu (4 cards) and Sarvada (3 times of day) normally without leaving.', expect: 'Normal play is unchanged: syllable, reveal line, next card or time of day; nothing skipped or doubled.' },
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some cards answered'),
  ]),

  'todo-finale': list('Shloka River Finale (Shloka River 5)', [
    OPENING_VO_ROW,
    { text: 'Finale: place 8 boats normally without leaving.', expect: 'Normal flow is unchanged ("choose the next one" / "Great! Keep choosing"); the resume line does NOT play.' },
    { text: leave('Finale: 1 to 7 boats placed.'), expect: 'Boats stay placed; you hear ONE line, "Keep putting the word boats in the right order" (no boat-specific line, no target-word audio). The hint cycle starts only after it ends.' },
    { text: 'Finale: after the last boat, watch the zone-completion fireworks and orbs.', expect: 'The zone badge is hidden while the fireworks and orbs play and comes back after; the badge is visible during normal play.' },
    { text: leave('Success: after the last word is placed, during the recap.'), expect: 'Continue plays the recap once, about half a second after load, then the celebration (checks the resume timer fix).' },
    { text: leave('Success: during the full-shloka recap.'), expect: 'The recap plays once (not twice, not skipped), then the orbs celebration.' },
    { text: 'Play the Finale normally, placing all words without leaving.', expect: 'The recap plays once and the scene finishes (normal flow still works).' },
    ZONE_WELCOME_ROW,
    PLAY_AGAIN_ROW('some words placed'),
  ]),
  // Netlify preview only (needs two deploys; the service worker is off on localhost).
  'todo-pwa-update': {
    title: 'Still to test - PWA update (Netlify preview, two deploys)',
    items: [
      { text: 'Open the preview URL once, close it, open it again (so the service worker is active). Play to the map.', expect: 'App loads normally; no "Refresh" banner on a fresh install.' },
      { text: 'Deploy a new staging build. On the installed/second-visit tab, reload ONCE while on the map.', expect: 'Either the new version is running, or the page reloads itself once by itself, or a purple "Refresh" banner appears. Never a blank screen, never a red lazy-chunk error.' },
      { text: 'Deploy again. Open any scene and play for a minute while the deploy finishes (leave the tab open).', expect: 'NO banner and NO reload while you are in the scene.' },
      { text: 'Leave the scene with the zone badge and wait on Zone Welcome or the map.', expect: 'The "A new version is ready" banner now appears (big Refresh button). Tapping it loads the new version.' },
      { text: 'On the map with the banner showing, tap Refresh, then open Modak and Shloka River.', expect: 'The new build works everywhere; progress is kept.' },
      { text: 'After a deploy that changes an image in /public (for example a symbol icon), open the app on a device that had the old one.', expect: 'The new image shows after the update (the images cache is renamed ganesha-images-v2; bump it again when public images change).' },
      { text: 'Check the Soft-wrong sound (Pond wrong drop, Vakratunda bump).', expect: 'Plays the new wooden tap (file sfx-soft-wrong-2.wav), not the old two-note sound.' },
      { text: 'If you ever see "Tap to refresh" (big card) in the middle of a scene, tap it.', expect: 'The app reloads and you can continue from the map or Zone Welcome Continue.' },
    ],
  },
};

export const STILL_TO_TEST_GROUP_LABEL = 'Still to test - About Me Hut (4 scenes), CSS clash batch 1, Shloka River, PWA update';
