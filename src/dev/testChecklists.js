// Built-in test checklists for the dev harness (TestChecklistPanel).
// Keyed by the harness `?game=` key. Any checklist can also be pasted in from the
// panel ("＋ paste checklist"), so new test plans never need a code change.
//
// Item: { text, expect? }  — `expect` is the pass condition shown under the step.

export const TEST_CHECKLISTS = {
  'modak-game2-new': {
    title: 'Modak Game 2 — Branch phase: hints must ignore random touches',
    items: [
      { text: 'Play Bush phase to reach the Branch phase. Wait for the intro line to finish.' },
      {
        text: 'Do NOT touch the branch. Wait ~18s for L2. Tap sky / grass / empty space.',
        expect: 'L2 hand stays visible, L2 VO plays, background taps change nothing.',
      },
      {
        text: 'Keep waiting ~8s after L2 finishes for L3. Tap the background again.',
        expect: 'L3 hand stays visible; VO continues; nothing restarts.',
      },
      {
        text: 'At L3: pull the branch part-way down and let go.',
        expect: 'L3 hand stays up (a partial pull is not progress). Level does not reset.',
      },
      {
        text: 'At L2 (reload the phase): pull the branch part-way and let go.',
        expect: 'L2 hand stays up; no reset to L0. Wrong-direction pull (up) also keeps the hint.',
      },
      {
        text: 'At L3: do the REAL pull down + hold until it completes.',
        expect: 'Scene reacts, branch succeeds, hand disappears because the scene turned it off.',
      },
      {
        text: 'Reload the phase. While the FIRST teaching hand is playing, tap randomly.',
        expect: 'Hand finishes its pass instead of vanishing on the tap.',
      },
      {
        text: 'While a hand is on screen, open then close the sidebar.',
        expect: 'Hand hides while the sidebar is open; replays from the start on close.',
      },
      {
        text: 'With NO hint showing (first ~10s), do a partial pull and release.',
        expect: 'Idle clock restarts (L1 comes ~10s after the pull, not earlier).',
      },
    ],
  },
};

TEST_CHECKLISTS['modak-game2-bush-marsh'] = {
  title: 'Modak Game 2 - Bush and Marsh: partial attempts keep the hint',
  items: [
    { text: 'Bush phase: wait ~18s for L2 (hand + VO). Do a short or vertical swipe and let go.', expect: 'L2 hand stays up; the bush springs back; no reset to L0.' },
    { text: 'Bush phase at L3: do a short swipe again.', expect: 'L3 hand stays up.' },
    { text: 'Bush phase with NO hint showing (first ~10s): do a short swipe.', expect: 'Idle clock restarts; L1 comes ~10s after the swipe.' },
    { text: 'Bush phase: do the real sideways swipe.', expect: 'Bush opens, flowers collect, game moves to the Branch phase.' },
    { text: 'Marsh phase: wait for L2, then start dragging Mooshika but drop on the wrong spot.', expect: 'L2 hand stays up while you drag and after the wrong drop.' },
    { text: 'Marsh phase at L3: drag part-way and let go.', expect: 'L3 hand stays up; no reset.' },
    { text: 'Marsh phase: tap the sky / grass at L2 and L3.', expect: 'Nothing changes; hand and VO continue.' },
    { text: 'Marsh phase: drop Mooshika on the correct safe spot.', expect: 'Hint clears, the next spot pulses, and a fresh idle clock starts.' },
  ],
};

TEST_CHECKLISTS.samaprabha = {
  title: 'Samaprabha: 3 hint states (teach / find / keep holding); hand only in clue 1',
  items: [
    { text: 'Clue 1: first-time teaching hand is playing. Tap empty sky / ground (not on the shadow).', expect: 'Hand finishes its pass; intro VO is not cut.' },
    { text: 'Clue 1, never touch the shadow: wait ~10s.', expect: 'Current shadow area pulses.' },
    { text: 'Clue 1: keep waiting to ~18s. Tap empty areas.', expect: '"Press and hold on the shadow." plays to the end; no hand yet; taps change nothing.' },
    { text: 'Clue 1: keep waiting to ~26s.', expect: 'One full hold hand demo plays (once).' },
    { text: 'Clue 1: hold only a sliver (under ~10% of the ring), release, wait.', expect: 'Still the TEACH ladder (pulse, then "Press and hold", then hand).' },
    { text: 'Clue 1: hold past ~25% of the ring, release early, wait ~9s.', expect: '"Keep holding." plays once with a soft glow. NO hand, no search hint.' },
    { text: 'Hold the shadow until the ring completes.', expect: 'Clue lights, "find another" plays, next clue starts a fresh clock.' },
    { text: 'Clue 2-4, do nothing for ~12s.', expect: 'Shadow area pulses and "Look for another part of the shadow." plays.' },
    { text: 'Clue 2-4, keep waiting to ~25s.', expect: 'Exact shadow region stays lit quietly. No extra VO. NO hand at any point.' },
    { text: 'Clue 2-4: wait 25s+ and tap empty areas.', expect: 'Nothing restarts or escalates; the lit region stays.' },
    { text: 'Clue 2-4: hold the correct region ~30%, release, wait ~9s.', expect: 'Only "Keep holding." plays once. No "look for another part", no hand.' },
    { text: 'Clue 2-4: press the correct shadow during the hint line.', expect: 'Line is cut, ring fills, no stuck hint after release.' },
    { text: 'Complete a clue, then reach the next clue and leave it idle.', expect: 'Hint states reset per clue: it is Find again, not Keep.' },
    { text: 'Open the sidebar mid-hint, then close it.', expect: 'Hint pauses and resumes cleanly; no hand appears after clue 1.' },
  ],
};

TEST_CHECKLISTS.kurumedeva = {
  title: 'Kurumedeva: teach the bubble and the first plank, then step back',
  items: [
    { text: 'Ask Elephant: hear the instruction.', expect: 'One teaching hand drags the bubble, timed to the action word.' },
    { text: 'Ask Elephant: drag the bubble a real distance and drop it far from Elephant.', expect: 'Bubble returns; Elephant glows (clearer helper); NO hand appears.' },
    { text: 'Ask Elephant: drag a little, open the sidebar, close it.', expect: 'The teaching hand does NOT come back.' },
    { text: 'Ask Elephant: drop the bubble on Elephant.', expect: 'Elephant helps; hint clears; next beat starts a fresh clock.' },
    { text: 'Ask Monkey: hear the question, then do nothing for ~12s.', expect: 'NO teaching hand. Bubble wiggles twice and "Who can help tie the rope?" plays once.' },
    { text: 'Ask Monkey: keep waiting to ~25s.', expect: 'Monkey glows quietly and stays. No hand, no further lines.' },
    { text: 'Ask Monkey: drop the bubble away from Monkey.', expect: 'Monkey glows right away; no hand; ladder does not restart.' },
    { text: 'Plank 1: hear the instruction.', expect: 'One teaching hand drags the plank to the slot.' },
    { text: 'Plank 1: drag a plank a real distance and drop it in the wrong place.', expect: 'Plank returns; the slot glows; NO hand appears.' },
    { text: 'Place plank 1.', expect: '"Good. Continue dragging the planks." plays once.' },
    { text: 'Planks 2-3: do nothing for ~12s.', expect: 'The top plank nudges twice. No hand, no new line.' },
    { text: 'Planks 2-3: keep waiting to ~25s.', expect: 'The slot glows quietly and stays. No hand, no L3 line.' },
    { text: 'Tap empty areas at any hint stage.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Place planks 2 and 3.', expect: 'Bridge completes; crossing starts.' },
  ],
};

TEST_CHECKLISTS.mahakaya = {
  title: 'Mahakaya: teach on log 1, then step back',
  items: [
    { text: 'Log 1: do nothing. Wait for L2 (hand + "Drag the log into the water."). Grab the log and let go without finishing.', expect: 'Hand stays up; the L2 line plays again on release; no reset to L0.' },
    { text: 'Log 1: drag the log a real distance and miss the raft, twice.', expect: 'After the 2nd miss the exact spot shows and "Put the log here." plays once. No hand appears.' },
    { text: 'Log 1: drag a little (real movement), open the sidebar, close it.', expect: 'The teaching hand does NOT come back.' },
    { text: 'Log 1: place it. Hear "Keep adding logs to the raft."', expect: 'Plays once, not again on logs 2-4.' },
    { text: 'Logs 2-4: do nothing for ~12s.', expect: 'The log nudges twice and "Drag the next log." plays once. No hand.' },
    { text: 'Logs 2-4: keep waiting to ~25s.', expect: 'The exact spot glows quietly and stays. No hand, no further lines.' },
    { text: 'Logs 2-4: miss the raft twice.', expect: 'The exact spot shows early; "Put the log here." plays once; a pointing hand (not a drag) appears on the drop spot.' },
    { text: 'Tap empty sky/ground at any hint stage.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Drag each log to finish.', expect: 'Stage completes; hint clears; next log starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS.nirvighnam = {
  title: 'Nirvighnam: grabbing an obstacle keeps a visible hint',
  items: [
    { text: 'Wait for L2 on the rock. Press the rock briefly and let go.', expect: 'L2 hand stays up.' },
    { text: 'Repeat for the branch and the reed at L2 or L3.', expect: 'Hand stays up each time; teaching hand is gone after a real touch.' },
    { text: 'Tap empty areas at L2 and L3.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Clear each obstacle for real.', expect: 'Hint clears; next obstacle starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS.sarvakaryeshu = {
  title: 'Sarvakaryeshu: wrong picks escalate help, never clear it',
  items: [
    { text: 'Pick a wrong symbol once.', expect: 'Gentle "Try another symbol"; hints not cleared.' },
    { text: 'Pick a wrong symbol a 2nd time.', expect: 'L2 help starts early.' },
    { text: 'At L2: pick wrong again.', expect: 'L3 follows only after the L2 line finishes.' },
    { text: 'Wait for L3 on any card.', expect: 'The correct symbol pulses 3 times (about 8s), then stays as a soft static gold highlight; ONE "Remember? ..." line plays once and does not repeat.' },
    { text: 'At L3: tap a wrong symbol.', expect: 'The correct symbol stays highlighted; the ladder does not restart; the "Remember?" line does not repeat.' },
    { text: 'Pick the correct symbol.', expect: 'Success; fresh clock for the next card.' },
  ],
};

TEST_CHECKLISTS['amh-favorite-food'] = {
  title: 'Favorite Things: Ganesha questions = clue (~13s) then correct-choice glow; child questions = one repeat',
  items: [
    { text: 'Ganesha question: after the question line, do nothing for ~10s.', expect: 'No wobble or movement on any choice.' },
    { text: 'Keep waiting to ~13s.', expect: 'One short meaning clue plays (e.g. "Look for the sweet I love."). Choices still do not move.' },
    { text: 'Keep waiting after the clue ENDS (~10s).', expect: 'The correct choice gets the strong gold glow and stays lit. No extra voice.' },
    { text: 'Wait longer. Tap empty areas.', expect: 'Glow stays; nothing repeats.' },
    { text: 'Before the clue: tap a wrong choice.', expect: 'Wrong sound, shake, the option name is spoken; the clue timer is NOT restarted.' },
    { text: 'While the clue is speaking: tap a wrong choice.', expect: 'Wrong sound and shake only. The clue is NOT interrupted and the option name is NOT read.' },
    { text: 'After the glow is showing: tap a wrong choice.', expect: 'Wrong sound and shake; the correct choice stays glowing.' },
    { text: 'Tap the correct choice (at any point).', expect: 'Success; hint clears; the next question starts a fresh clock.' },
    { text: 'Check all four Ganesha questions (food, color, activity, friend).', expect: 'Each has its own clue line and the same timing; no choice-wobble on any of them.' },
    { text: 'Activity question: count the choices.', expect: '7 activities plus "My own" (8). "Games" is not shown.' },
    { text: 'Child question (own favorite food/color/activity/friend): wait ~10s.', expect: 'The question repeats ONCE, then nothing. No glow, no answer rescue.' },
  ],
};

TEST_CHECKLISTS['sr-finale'] = {
  title: 'Shloka River Finale: 2-step recall hints (clue → rescue); wrong boats never cut or reset help',
  items: [
    { text: 'Wait for the opening shloka / reinforcement audio to finish, then do nothing for ~10s.', expect: 'No hint yet. The boats do NOT pulse or nudge at any point.' },
    { text: 'Keep waiting to ~13s.', expect: 'The meaning-clue VO plays once (describes the word, does not name it). No hand.' },
    { text: 'Keep waiting to ~25s.', expect: 'The correct boat glows gold and bobs, and the word is spoken once.' },
    { text: 'Keep waiting past ~40s. Tap empty areas.', expect: 'Correct boat stays lit; no new VO, no repeats.' },
    { text: 'After the rescue is showing: tap a wrong boat.', expect: 'Soft wrong sound; the correct boat stays lit; nothing restarts.' },
    { text: 'During the clue VO: tap a wrong boat.', expect: 'Clue keeps playing to the end (not cut).' },
    { text: 'During the clue VO: drag a wrong boat and drop it away from the slot.', expect: 'Clue keeps playing; boat settles back; no reset.' },
    { text: 'On a new slot with no hint showing: tap a wrong boat twice.', expect: 'The meaning clue plays early after the 2nd wrong (once); the correct boat does NOT glow yet.' },
    { text: 'After the early clue: wait.', expect: 'Clue does not repeat at ~13s; the rescue still arrives at ~25s from the slot start.' },
    { text: 'With a hint showing: grab the correct boat but do not place it.', expect: 'Hint stays until it is placed.' },
    { text: 'Tap or drag the correct boat while a clue is playing.', expect: 'Clue stops, success plays, the word audio is heard.' },
    { text: 'Move to the next slot and leave it idle.', expect: 'Ladder is fresh: nothing, then clue (~13s), then rescue (~25s). Clue is that slot\'s own word.' },
    { text: 'Place all 8 boats and look at the fleet (iPad 1024x670).', expect: 'Boats follow the LEFT of the river in a zig-zag; the top boats are spaced apart; no word label sits on another boat\'s sail; the new-boat ripple lands on each boat\'s spot.' },
    { text: 'Final "say it together" recap: watch each word being chanted.', expect: 'The chanted boat glows and comes to the front, and its symbol shows large in the open water to the right of the fleet (not hidden behind any boat). The symbol changes with each word and disappears at the end.' },
  ],
};

TEST_CHECKLISTS['sm-pond'] = {
  title: 'Pond: partial holds and drags keep a visible hint',
  items: [
    { text: 'Rock: wait for L2. Hold the rock about a third of the way, then let go. Repeat.', expect: 'Hand stays; the 2nd short hold earns L2/L3 help early.' },
    { text: 'Rock with no hint showing: hold briefly and release.', expect: 'Idle clock restarts.' },
    { text: 'Reeds and lotus: do a partial drag/hold at L2.', expect: 'Hand stays up each time.' },
    { text: 'Tap empty areas while the intro hand plays.', expect: 'Hand finishes (it hides only when you really hold or drag).' },
    { text: 'Complete rock, reeds and lotus.', expect: 'Each step clears its hint.' },
  ],
};

TEST_CHECKLISTS['amh-indian-story'] = {
  title: 'My Indian Story: 2-step hints (clue → rescue); wrong answers never clear help; personal phases = one repeat',
  items: [
    { text: 'Ganesha Home: first time, wait for "Move the magnifying glass around the map…" to start.', expect: 'The teaching hand plays ONCE (one pass, not two), in sync with the line.' },
    { text: 'Ganesha Home: never touch the magnifier; wait ~12s.', expect: '"Move the magnifying glass around the map." plays and the magnifier gives a short nudge (3 quick wobbles, then still). It never wobbles forever.' },
    { text: 'Ganesha Home: keep waiting ~10s after that line.', expect: 'The teaching hand replays once. No spot glows yet.' },
    { text: 'Ganesha Home: drag the magnifier once (no find), then stop and wait ~12s.', expect: 'ONE undiscovered spot glows softly. No voice. The magnifier does NOT wobble. No hand.' },
    { text: 'Ganesha Home: keep waiting to ~25s from your last find/start.', expect: 'That same single spot gets a ring that stays until found. The other undiscovered spots are NOT highlighted.' },
    { text: 'Ganesha Home: drag around with the ring showing.', expect: 'The ring stays; dragging does not clear it.' },
    { text: 'Ganesha Home: find that spot.', expect: 'Hints clear; a fresh cycle starts and points at the next undiscovered spot.' },
    { text: 'Language guess: press Play. Does the Play button keep pulsing forever?', expect: 'It pulses twice then rests. If you do not press it for ~11s, "Tap play and listen carefully." repeats once and it pulses twice more.' },
    { text: 'Language guess: after the chant, wait ~10s.', expect: 'No wobble on the cards.' },
    { text: 'Language guess: wait to ~12s.', expect: '"Think of the language many shlokas are in." plays (once). Cards still do not move.' },
    { text: 'Language guess: wait ~10s after the clue ends.', expect: 'Sanskrit gets the strong persistent glow. No extra voice.' },
    { text: 'Language guess: tap a wrong card BEFORE the clue.', expect: 'Shakes and says its name. The clue timer is NOT restarted (the clue still arrives on schedule).' },
    { text: 'Language guess: tap a wrong card WHILE the clue is speaking.', expect: 'Shake only. The clue is NOT cut and the language name is not read.' },
    { text: 'Language guess: tap a wrong card once the Sanskrit glow is showing.', expect: 'Shake only; the Sanskrit glow stays.' },
    { text: 'Festival guess: same three checks (wait ~12s, then ~10s more).', expect: '"Think of the festival that celebrates Ganesha." at ~12s with no card wobble; then Ganesh Chaturthi gets the persistent glow. No extra voice.' },
    { text: 'Festival guess: tap a wrong card before, during and after the clue.', expect: 'Name spoken only BEFORE the clue; shake only after. The timers are never restarted; the glow stays once shown.' },
    { text: 'Child home / child languages / child festivals: wait ~10s on each.', expect: 'The prompt repeats ONCE, then nothing. No glow, no rescue.' },
    { text: 'Child languages: trigger the reminder (replay button).', expect: 'Says "Choose up to three languages you use or hear." (not "you speak").' },
    { text: 'Make the correct guess in each Ganesha phase.', expect: 'Hints clear and the phase moves on.' },
  ],
};

TEST_CHECKLISTS['modak-garland'] = {
  title: 'Modak Game 3 (Garland): carry hints, L3 waits for L2, sidebar in intro',
  items: [
    { text: 'Intro line is playing: open and close the sidebar 3-4 times quickly.', expect: 'Intro replays once; hints still start afterwards (no freeze).' },
    { text: 'Build: tap a few flowers, then stop and wait. Time L1, L2, L3.', expect: 'L1 about 10s: flowers bob 3 times, no voice. L2 about 18s: flowers keep bobbing, voice "Tap any flower.". L3 about 8s after: a tap hand taps the first remaining flower twice, voice "Tap this flower.", then a quiet static ring stays on it.' },
    { text: 'Build with NO flower tapped yet: wait for L2.', expect: 'The voice says "Tap any flower." (never "another").' },
    { text: 'Carry: wait for L2 (hand + VO). Start dragging the garland and drop it away from Ganesha.', expect: 'Hand stays up; no reset to L0.' },
    { text: 'Carry: miss 3 times quickly.', expect: 'L3 starts only after the L2 line finishes (no cut-off).' },
    { text: 'Carry with no hint showing: drag part-way and drop it away.', expect: 'Idle clock restarts.' },
    { text: 'Drop the garland on Ganesha.', expect: 'Success; hint clears.' },
  ],
};

TEST_CHECKLISTS['sm-eyes'] = {
  title: 'Symbol Mountain, Eyes game: misses, L3 after L2, sidebar',
  items: [
    { text: 'Intro line playing: open and close the sidebar several times quickly.', expect: 'Intro replays; the game and hints continue (no freeze).' },
    { text: 'Tap empty space 3 or more times.', expect: 'Help comes earlier (L2, then L3 after more misses).' },
    { text: 'Misses until L3 is due while the L2 line is speaking.', expect: 'L3 waits for the L2 line to finish.' },
    { text: 'Do nothing: time L1 / L2 (VO) / L3.', expect: 'About 10s / 18s / 8s after the L2 line.' },
    { text: 'Find the feather, then the mango.', expect: 'Each find clears the hint; next target starts a fresh clock.' },
    { text: 'Find the mango, then tap the feather quickly (while the mango line or "Now find the feather" is still speaking).', expect: 'The feather-found line plays; "Now find the feather" does NOT play afterwards, because the feather is already found.' },
  ],
};

TEST_CHECKLISTS['sm-ears'] = {
  title: 'Symbol Mountain, Ears sound-match: tab switch, sidebar, L2/L3',
  items: [
    { text: 'During the intro or a prompt line, switch to another tab and come back.', expect: 'The round does not advance while you are away; the line replays once on return.' },
    { text: 'Open and close the sidebar several times quickly during a line.', expect: 'Line replays; round and hints continue.' },
    { text: 'On the choosing screen do nothing: L1 replay, L2 clue, then L3 reveal.', expect: 'L3 comes only after the L2 clue and sound finish.' },
    { text: 'Tap a wrong zone.', expect: 'Gentle "listen again"; no stuck state.' },
    { text: 'Tap the right zone.', expect: 'Reveal plays; next round starts.' },
  ],
};

TEST_CHECKLISTS['sm-tusk-live-v2'] = {
  title: 'Symbol Mountain, Tusk nest (BeatPlayer): drags and hints',
  items: [
    { text: 'Start of each nest item (teaching hand) and at L2 / L3: watch the hand.', expect: 'The hand starts on the item and TRAVELS toward the nest (a third of the way at the start/L1, more at L2, all the way into the nest at L3). It must not sit still on the item.' },
    { text: 'Drop zone: drop the item just outside the nest, then just inside it.', expect: 'Just outside = a miss; just inside = success. The zone is smaller than before (width 12, was 16).' },
    { text: 'Wait for L2 on a nest item. Drag it part-way and let go.', expect: 'L2 hand stays up; no reset.' },
    { text: 'Drop the item on the wrong place 3 times quickly.', expect: 'L3 starts only after the L2 line finishes (no cut-off).' },
    { text: 'On a FRESH item, drop wrong 2 times, pause, then a 3rd and a 4th time (let each line play).', expect: 'You hear the L2 line after the 2nd wrong drop, the L3 line after the 3rd, and the L3 line again after the 4th. A line is never restarted while it is still speaking.' },
    { text: 'With no hint showing: drag part-way and release.', expect: 'Idle clock restarts.' },
    { text: 'Tap empty areas at L2 and L3.', expect: 'Hints keep playing; nothing restarts.' },
    { text: 'Open and close the sidebar during a line.', expect: 'Replays once; hints restart fresh.' },
    { text: 'Drop the item in the nest.', expect: 'Success; next item starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS['sm-final'] = {
  title: 'Symbol Mountain, Sacred Assembly: small tap markers',
  items: [
    {
      text: 'Reach the first symbol card, let it slide/flip into play, then look at Ganesha before tapping.',
      expect: 'Small cream/gold circle markers appear on all available body-part choices. No large purple/white full-zone ovals or debug-looking hitbox fields are visible.',
    },
    {
      text: 'On round 1 only, watch the markers when play begins.',
      expect: 'All available markers pulse together twice, then settle into faint/static markers.',
    },
    {
      text: 'Complete round 1, then begin rounds 2 and 3.',
      expect: 'Markers appear during play but do not do the intro pulse again.',
    },
    {
      text: 'Before play begins for a round (card appearing, sliding, or flipping), watch Ganesha.',
      expect: 'No tap markers are visible until the scene is actually waiting for the child to choose.',
    },
    {
      text: 'Tap a wrong available body part.',
      expect: 'Only the tapped marker gives a short wobble. Other markers stay still; Ganesha does not show a full-zone glow.',
    },
    {
      text: 'Tap close to a marker but within the old large tappable area.',
      expect: 'The tap still works as a forgiving hit target; the visible marker remains small.',
    },
    {
      text: 'Tap the correct body part.',
      expect: 'The marker disappears as that part fills in, and markers hide during feedback/completion before the next card.',
    },
    {
      text: 'Leave a round idle until the semantic clue plays.',
      expect: 'The clue is VO-only; markers remain neutral and no correct full-zone oval appears.',
    },
    {
      text: 'Keep waiting until the final rescue hint.',
      expect: 'Only the correct small marker gets a stronger gold halo/pulse. There is no extra final-rescue VO and no large target oval.',
    },
    {
      text: 'At final rescue, tap a wrong body part.',
      expect: 'The wrong marker wobbles locally and the correct small marker remains highlighted; the hint ladder does not restart.',
    },
    {
      text: 'Open Hint Debug, select a zone, and drag/nudge its debug overlay.',
      expect: 'The red debug overlay is still available for tuning, and the visible marker follows the updated zone position.',
    },
    {
      text: 'Check a narrow/mobile viewport.',
      expect: 'Markers are slightly smaller, readable, and do not cover labels, art, or each other.',
    },
  ],
};

TEST_CHECKLISTS['suryakoti'] = {
  title: 'Suryakoti (rub): teach first, then remind once',
  items: [
    { text: 'First-time teaching hand plays on the first patch. Rub somewhere else on screen.', expect: 'The hand finishes its pass; nothing restarts.' },
    { text: 'First patch, NOTHING rubbed yet: do nothing and time L1 / L2 / L3.', expect: 'L1 about 10s: a clearly visible small glow spot, no voice. L2 about 18s: a short scratch hand + "Rub the glowing spot.". L3 about 8s after that line: the longer 2-pass hand with NO voice.' },
    { text: 'Rub a little of the first patch, then stop and do nothing.', expect: 'No hand and no glow spot. After about 10s a single "Keep rubbing." and nothing else repeats.' },
    { text: 'Finish the first three patches (Sur, ya, ko), then on the LAST patch (ti) rub a little and stop.', expect: 'After about 10s it says "Almost there!" (the whole game is about 75% done). On the first three patches the reminder is "Keep rubbing.", never "Almost there!".' },
    { text: 'After the reminder, keep doing nothing until about 25s.', expect: 'A soft warm light wash covers the active patch and pulses twice (about 5s), clearly lighting whatever is still dark in it, then stops. No voice. After that nothing more happens (no hand, no repeated lines).' },
    { text: 'Rub a big blob in the middle of a patch, then wait for the 25s wash.', expect: 'The wash covers the patch and visibly lights up the parts you have NOT rubbed; the cleared area just looks normal.' },
    { text: 'Finish a patch, then stop on the next patch without rubbing it.', expect: 'The same as step 3: about 10s a single "Keep rubbing.", about 25s the quiet glow. No hands on later patches.' },
    { text: 'Rub part of a patch, lift your finger, do nothing, then rub again and stop again.', expect: 'The reminder timing restarts after each rub (it never stays silent after a partial rub), and the reminder speaks again only after you have rubbed again.' },
    { text: 'Rub somewhere that has no darkness left, or tap the screen.', expect: 'The hint timing is not restarted by that.' },
    { text: 'Open and close the sidebar mid-rub.', expect: 'Rub stops cleanly; hints restart fresh.' },
  ],
};

TEST_CHECKLISTS['vakratunda'] = {
  title: 'Vakratunda (frog): start-drag hint and stuck help',
  items: [
    { text: 'After the intro do nothing.', expect: 'Start-drag hint ladder arrives about 10s / 18s / 26s.' },
    { text: 'Start dragging the frog.', expect: 'Start-drag hint stops for good.' },
    { text: 'Push the frog into a blocked spot repeatedly.', expect: 'Stuck help escalates after repeated real bumps.' },
    { text: 'Tap empty areas during hints.', expect: 'Nothing restarts.' },
  ],
};

TEST_CHECKLISTS['sarvada'] = {
  title: 'Sarvada: two-step search support (clue, then exact ring)',
  items: [
    { text: 'Each round: hear the instruction, then do nothing for ~12s.', expect: 'ONE meaning clue plays ("Think of the symbol that helps us listen." / "...hold lots of feelings." / "Think of the sweet that reminds us of joy.") with the broad glow. No hand.' },
    { text: 'Keep waiting to ~25s.', expect: 'The broad glow disappears and the exact ring appears with no voice, and it stays.' },
    { text: 'Keep waiting another 30s.', expect: 'Nothing else happens: no voice, no new animation.' },
    { text: 'While the clue is speaking, tap somewhere wrong.', expect: 'Tiny ripple only; the clue is NOT cut off; the timer does not restart.' },
    { text: 'Find the symbol.', expect: 'Symbol flies to the syllable; next phase starts a fresh clock.' },
  ],
};

TEST_CHECKLISTS['amh-dreams-wishes'] = {
  title: 'Dreams and Wishes: wrong bubble does not reset hints',
  items: [
    { text: 'Wish 1: wait for the hints. Tap an unkind bubble.', expect: 'Shake and gentle redirect; the hint ladder is NOT reset.' },
    { text: 'Tap kind bubbles.', expect: 'Progress advances; hints reset only on kind taps.' },
    { text: 'Complete the three wishes and the trunk taps.', expect: 'Each step works; no stuck hint.' },
    { text: 'Tap empty background during hints.', expect: 'Nothing restarts.' },
  ],
};

TEST_CHECKLISTS['sidebar-general'] = {
  title: 'Sidebar check (any scene that has a sidebar)',
  items: [
    { text: 'While an intro line is speaking, open and close the sidebar 3-4 times quickly.', expect: 'The line replays once from the start; the scene then carries on.' },
    { text: 'While a hint line (L2) is speaking, open the sidebar then close it.', expect: 'The line replays once; hints restart fresh (about 10s / 18s / 26s).' },
    { text: 'Open the sidebar and leave it open for 30s.', expect: 'Nothing advances or speaks behind it; timers are frozen.' },
    { text: 'Switch to another browser tab and back during a line.', expect: 'The game does not advance while away; the line replays on return.' },
  ],
};

// Other harness keys that mount the same game share a checklist.
export const CHECKLIST_ALIASES = {
  'sm-modak-game2': 'modak-game2-new',
  'sm-modak': 'modak-game2-new',
  'sm-modak-game3': 'modak-garland',
  'sm-eyes': 'sm-eyes',
  'sm-ears': 'sm-ears',
  'sm-tusk-beatplayer': 'sm-tusk-live-v2',
  'sm-tusk-nest-debug': 'sm-tusk-live-v2',
  'sm-symbol': 'sm-eyes',
  'sr-vakratunda': 'vakratunda',
  'sr-suryakoti': 'suryakoti',
  'sr-nirvighnam': 'nirvighnam',
  'sr-sarvakaryeshu': 'sarvakaryeshu',
};

// Dropdown grouping (zone -> games). Any checklist not listed here still appears under "Other".
export const TEST_CHECKLIST_GROUPS = {
  'Symbol Mountain': ['modak-game2-new', 'modak-game2-bush-marsh', 'modak-garland', 'sm-pond', 'sm-eyes', 'sm-ears', 'sm-tusk-live-v2', 'sm-final'],
  'Shloka River': ['vakratunda', 'mahakaya', 'suryakoti', 'samaprabha', 'nirvighnam', 'kurumedeva', 'sarvakaryeshu', 'sarvada', 'sr-finale'],
  'About Me Hut': ['amh-dreams-wishes', 'amh-favorite-food', 'amh-indian-story'],
  General: ['sidebar-general'],
};

export const GENERIC_CHECKLIST = {
  title: 'Scene hint smoke test',
  items: [
    { text: 'L1/L2/L3 visible then tap random background.', expect: 'Hint/gesture stays; timer does not restart.' },
    { text: 'L3 visible then do the real valid action.', expect: 'Scene reacts; hint clears.' },
    { text: 'Teaching hand then tap randomly.', expect: 'Hand finishes its pass.' },
    { text: 'Sidebar open/close during a hand.', expect: 'Hides while paused; replays on return.' },
  ],
};
