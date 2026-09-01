/**
 * Web Speech (TTS) guidance lines, copied from the four Shloka River scene
 * wrappers' local `playGuidanceVoice` maps. In the real app these instruction
 * lines are spoken by the browser's SpeechSynthesis, NOT played as MP3s — so
 * "real audio" mode in the harness has to do the same or guidance is silent.
 *
 * Keyed by the scene id the harness passes to useVoiceGuidance.
 * Keep in sync with:
 *   Scene1/VakratundaGroveSimplified.jsx   (vakratunda-grove)
 *   Scene2/SuryakotiBankSimplified.jsx     (suryakoti-bank)
 *   Scene3/NirvighnamChantSimplified.jsx   (nirvighnam-chant)
 *   scene4/SarvakaryeshuChantSimplified.jsx(sarvakaryeshu-chant)
 */

export const WEB_SPEECH_SCRIPTS = {
  'vakratunda-grove': {
    welcome: "Let's help our friends by the river.",
    instructionListen: 'Listen carefully.',
    instructionTapAndRepeat: "That way's blocked — look for another way around.",
    instructionTapTheElephant: "That way's blocked — look for another way around.",
    hintTapElephant: "That way's blocked — look for another way around.",
    hintLookForGlow: "See the glow? That's the way around.",
    hintKeepBuildingPath: "Keep going — you're finding the way through.",
    vakratundaSetup: 'The frog made it! He found his family!',
    vakratundaClaim: 'I find a new way.',
    mahakayaSetup: 'You chanted… and it grew tall and strong.',
    mahakayaClaim: 'You have that strength too.',
    sceneComplete: "You found another way. There's room for everyone. Both powers are yours now.",
    scene10_vak_intro: 'The frog can see his family, but rocks and logs block the way. Help him find a way around.',
    scene10_vak_current_too_strong: "The river current is too strong there. Let's try another way.",
    scene10_vak_frog_cross: 'The frog can see his family, but rocks and logs block the way. Help him find a way around.',
    scene10_vak_tap_logs: "That way's blocked — look for another way around.",
    scene10_vak_blocked: "That way's blocked — look for another way around.",
    scene10_vak_choose: "That way's blocked — look for another way around.",
    scene10_vak_make_path: 'The frog can see his family, but rocks and logs block the way. Help him find a way around.',
    scene10_vak_drag_leaves: 'Follow the safe water past the rocks.',
    scene10_vak_drag: 'Follow the safe water past the rocks.',
    scene10_vak_drag_pieces: 'Follow the safe water past the rocks.',
    scene10_vak_crossed: 'Vakratunda! You found another way and helped the frog reach his family.',
    scene10_vak_meaning: 'Vakratunda means finding another way.',
    scene10_maha_intro: 'Everyone wants to cross, but the raft is too small. Help make room for them all.',
    scene10_maha_blocking: "The raft's still too small for everyone.",
    scene10_maha_drag_rope: 'Grab another log so everyone can fit.',
    scene10_maha_pull_down: '',
    scene10_maha_log_moving: '',
    scene10_maha_success: 'Mahakaya! You made the raft bigger, and everyone crossed.',
    scene10_maha_meaning: 'Mahakaya means great strength.',
    scene10_maha_strength: 'You have strength inside you too.',
  },

  'suryakoti-bank': {
    welcome: "The river is dark today. Let's bring back the light!",
    scene11_intro: "The river is dark today. Let's bring back the light!",
    scene11_surya_intro: "The bunny can't find her way home in the dark. Help light the path for her.",
    scene11_surya_rub: "The bunny's still lost — light the next spot.",
    scene11_surya_hint: "The bunny's still lost — light the next spot.",
    scene11_surya_success: 'Suryakoti! You brought back the light and helped the bunny home.',
    scene11_surya_done: 'Suryakoti! You brought back the light and helped the bunny home.',
    scene11_surya_meaning: 'Suryakoti means bright as ten million suns.',
    scene11_sama_intro: 'One bird is warm in the light, while the other sits in shadow. Help them share the light.',
    scene11_sama_hint: 'The other bird is still in shadow — even out the light.',
    scene11_sama_done: 'Samaprabha! You spread the light so both birds could see.',
    scene11_sama_meaning: 'Samaprabha means equal brightness.',
    suryakotiSetup: 'The light showed the way.',
    suryakotiClaim: 'Suryakoti lights the way.',
    samaprabhaSetup: "One bird has too much light. Let's share it!",
    samaprabhaClaim: 'Samaprabha helps us share fairly.',
    sceneComplete: 'The light showed the way. Both shine equally now.',
  },

  'nirvighnam-chant': {
    welcome: "Let's help our river friends.",
    scene12_nir_intro: "The turtle's way home is blocked. Clear what's in her path, one thing at a time.",
    scene12_nir_drag: "Something's still blocking the turtle's way.",
    nirv_hint: "Something's still blocking the turtle's way.",
    nirv_done: 'Nirvighnam! You cleared the way and helped the turtle through.',
    nirv_meaning: 'Nirvighnam means removing obstacles.',
    nirvighnamSetup: 'You cleared the path… and the turtle made it home.',
    nirvighnamClaim: 'I clear the way and move forward.',
    scene12_kuru_intro: "Beaver can't build the bridge alone. Help him ask his friends to build it together.",
    scene12_kuru_tap: 'Who can Beaver ask for help next?',
    kuru_hint: 'Who can Beaver ask for help next?',
    kuru_done: 'Kurume Deva! You asked for help and built the beaver’s bridge.',
    kuru_meaning: 'Kuru Me Deva means please help us.',
    kurumedevaSetup: 'You called for help… and friends came.',
    kurumedevaClaim: 'Asking for help is a superpower.',
    sceneComplete: 'The turtle reached her nest. The bridge is ready. Both powers are yours now.',
  },

  'sarvakaryeshu-chant': {
    scene13_puzzle: 'The painting didn’t go as planned. What could help him try a different way?',
    scene13_puzzle_after: 'The Trunk helped him try another way — and the splat became a whale!',
    scene13_sports: 'He feels upset inside. What could help him make room for his feelings?',
    scene13_sports_after: 'The Belly reminded him to make room for his feelings and take a slow breath.',
    scene13_bike: 'Everyone is looking, but they’re missing an important clue. What could help her notice it?',
    scene13_bike_after: 'The Eyes helped her look carefully and notice what everyone else missed.',
    scene13_grandma: 'He wants to finish his special card, but everything keeps pulling his attention away. What could help him stay focused?',
    scene13_grandma_after: 'The Tusk helped him stay focused on what was important.',
    welcome: 'Each friend is stuck in a different way. Look carefully and choose the power that can help.',
    scene13_try_again: 'Try another symbol.',
    scene13_success: 'Sarva-Karyeshu! You chose the right power and solved every task.',
    scene13_meaning: 'Sarva Karyeshu means in everything we do.',
    scene14_intro: "Morning, afternoon, and night, Ganesha's symbols are there to find. Can you spot each one?",
    scene14_morning: "Let's look at the morning memory.",
    scene14_afternoon: 'Now the afternoon memory.',
    scene14_night: 'Now the night memory.',
    scene14_find_symbol: 'Can you find the hidden symbol?',
    scene14_success: 'Sarvada! You found the wisdom in every part of the day.',
    scene14_meaning: 'Sarvada means always.',
    sceneComplete: 'And you can carry them with you, all through your day.',
  },
};

const stripLeadingSpeechText = (text, leadingText) => {
  if (!text || !leadingText) return text;
  const pattern = new RegExp(
    `^\\s*${leadingText.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\s*[:.!,-]*\\s*`,
    'i',
  );
  return text.replace(pattern, '').trim();
};

/** Speak `text` via the browser's SpeechSynthesis; calls onEnded when done/failed. */
export function speakWebSpeech(text, onEnded) {
  const done = () => { try { onEnded && onEnded(); } catch { /* no-op */ } };
  if (!text || typeof window === 'undefined' || typeof SpeechSynthesisUtterance === 'undefined' || !window.speechSynthesis) {
    done();
    return;
  }
  try {
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(text);
    u.lang = 'en-IN';
    u.rate = 0.95;
    u.pitch = 1;
    u.volume = 0.95;
    u.onend = done;
    u.onerror = done;
    window.speechSynthesis.speak(u);
  } catch {
    done();
  }
}

export function stopWebSpeech() {
  try { window.speechSynthesis && window.speechSynthesis.cancel(); } catch { /* no-op */ }
}

/**
 * Build a voiceGuidance object for "real audio" mode:
 *  - guidance lines  → Web Speech TTS (matches the real scenes)
 *  - syllables/words  → real prerecorded MP3s via the useVoiceGuidance hook
 */
export function makeTtsVoiceGuidance({ sceneId, word, realVG, log = true }) {
  const map = WEB_SPEECH_SCRIPTS[sceneId] || {};
  const tag = (...a) => log && console.log('[ttsVO]', ...a);
  return {
    playVoice: (key, onEnded, opts = {}) => {
      const line = map[key];
      if (line) {
        tag('speak', key, '→', line);
        speakWebSpeech(stripLeadingSpeechText(line, opts.stripLeadingText), onEnded);
        return;
      }
      tag('no TTS line for', key, '— trying MP3');
      realVG.playVoice(key, onEnded, opts);
    },
    playSfx: (k) => realVG.playSfx(k),
    playWord: (w, onEnded) => realVG.playWord(w, onEnded),
    playSyllable: (syllable, onEnded) => realVG.playSyllable(word, syllable, onEnded),
    stopVoice: () => { stopWebSpeech(); realVG.stopVoice(); },
  };
}
