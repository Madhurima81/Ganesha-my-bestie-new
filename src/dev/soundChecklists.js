// Tablet listening checks for the Sanskrit audio + SFX rules - one checklist per scene.
// Pass = every Sanskrit syllable/word is heard in full, with no SFX or English over it.
// Run on a real tablet (the pane/headless browsers throttle timers and animation).
// Always do each fast step twice: once at a calm pace, once as fast as a child would.

const FAST = 'Repeat it as fast as a child would.';
const full = (what) => `${what} heard in full, in order, nothing on top of it.`;

const list = (title, items) => ({ title: `Sound check - ${title}`, items });

export const SOUND_CHECKLISTS = {
  'sound-vakratunda': list('Vakratunda Rescue (Shloka River 1)', [
    { text: `Drag the frog across the pads at a calm pace. ${FAST}`, expect: `${full('Va-kra-tun-da')} Frog stays responsive; reunion plays only after "da".` },
    { text: 'Bump the logs 3 times without getting past.', expect: 'One soft wooden tap on the third bump only. Never over Sanskrit.' },
    { text: 'Leave the frog stuck for ~10s, then ~20s.', expect: 'Help voice never interrupts a Sanskrit syllable. No tick before a hint.' },
  ]),
  'sound-mahakaya': list('Mahakaya Rescue (Shloka River 1)', [
    { text: `Place the logs one by one, calmly. ${FAST}`, expect: `${full('Ma-ha-ka-ya')} Place sound drops (never replays) while Sanskrit plays.` },
    { text: 'Finish the last log and watch the word and the crossing.', expect: 'Full word and crossing wait until "ya" has finished.' },
  ]),
  'sound-suryakoti': list('Suryakoti (Shloka River 2)', [
    { text: `Scrub the dark canvas left to right at a calm pace. ${FAST}`, expect: `${full('sur-ya-ko-ti')} "Keep rubbing" never cuts "sur"; it plays after it if still needed.` },
    { text: 'Finish the last patch.', expect: 'Whole word "Suryakoti" starts only after "ti" ends, then the ending line.' },
  ]),
  'sound-samaprabha': list('Samaprabha (Shloka River 2)', [
    { text: `Hold each clue until it reveals. ${FAST} Press the next clue right after a syllable starts.`, expect: `${full('sa-ma-pra-bha')} A touch on the next clue never cuts a syllable.` },
    { text: 'Finish the last clue.', expect: 'Whole word waits for "bha", then the ending line.' },
  ]),
  'sound-nirvighnam': list('Nirvighnam (Shloka River 3)', [
    { text: 'Hold the stone, then grab the branch immediately. Then the reeds immediately.', expect: `${full('nir-vigh-nam')} Grabbing the next obstacle never cuts a syllable.` },
    { text: 'Do it slowly instead.', expect: 'Each syllable is followed by that obstacle\'s instruction line.' },
  ]),
  'sound-kurumedeva': list('Kurumedeva (Shloka River 3)', [
    { text: 'Drag the help bubble to the elephant, then to the monkey, then place planks.', expect: `${full('Ku-ru / me / de-va')} "Now drag the planks" starts only after "me" ends.` },
    { text: 'Grab a plank as soon as the plank round opens.', expect: 'The touch does not cut "me".' },
  ]),
  'sound-sarvakaryeshu': list('Sarvakaryeshu (Shloka River 4)', [
    { text: 'Answer all four cards (try a wrong power first, then the right one).', expect: `${full('Sar-va-kar-yeshu')} Wrong picks are gentle; English "after" line follows each syllable.` },
  ]),
  'sound-sarvada': list('Sarvada (Shloka River 4)', [
    { text: 'Find the hidden symbol in morning, afternoon and night.', expect: `${full('Sar-va-da')} Next scene line starts only after the syllable.` },
  ]),
  'sound-finale': list('Shloka River Finale', [
    { text: 'Place each word of the shloka.', expect: 'No chime or sparkle on any word, none on the final word. Only the Sanskrit.' },
  ]),
  'sound-pond': list('Pond (Symbol Mountain 2)', [
    { text: 'Wake the lotus.', expect: 'The power-up sound plays once, not twice. Sanskrit is clean.' },
  ]),
  'sound-mandala': list('Final Mandala (symbol completion)', [
    { text: 'Watch the symbols reveal one by one.', expect: 'No chime before each symbol voiceover. Glow and voiceover unchanged.' },
  ]),
  'sound-everywhere': list('Everywhere (all scenes)', [
    { text: 'Idle ~10s in any game.', expect: 'Hint is voice only. No tick before it.' },
    { text: 'Open welcome, home and map screens.', expect: 'One background sound only, never doubled. Plays on first touch if the tablet blocked autoplay.' },
    { text: 'Press the Home mute button.', expect: 'Everything goes silent (SFX, voice, ambience). Unmute restores it.' },
    { text: 'Open and close the sidebar mid-line.', expect: 'Ambience dips while a line plays and returns after.' },
  ]),
};

export const SOUND_GROUP_LABEL = 'Sound check (tablet listening)';
