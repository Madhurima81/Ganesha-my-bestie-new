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
    instructionTapAndRepeat: 'Help guide the lily pad another way.',
    instructionTapTheElephant: 'Help guide the lily pad another way.',
    hintTapElephant: 'Help guide the lily pad another way.',
    hintLookForGlow: 'Drag it to the glowing circle.',
    hintKeepBuildingPath: 'Keep guiding the lily pad.',
    vakratundaSetup: 'The frog made it! He found his family!',
    vakratundaClaim: 'I find a new way.',
    mahakayaSetup: 'You chanted… and it grew tall and strong.',
    mahakayaClaim: 'You have that strength too.',
    sceneComplete: "You found another way. There's room for everyone. Both powers are yours now.",
    scene10_vak_intro: 'The little frog wants to meet his family!',
    scene10_vak_current_too_strong: "The river current is too strong there. Let's try another way.",
    scene10_vak_frog_cross: 'The little frog wants to meet his family!',
    scene10_vak_tap_logs: 'Help guide the lily pad another way.',
    scene10_vak_blocked: 'Oh no... that way is blocked.',
    scene10_vak_choose: 'Help guide the lily pad another way.',
    scene10_vak_make_path: "Let's find another way across.",
    scene10_vak_drag_leaves: 'Drag the lily pad to the glowing circle.',
    scene10_vak_drag: 'Now drag the lily pad to the glowing circle.',
    scene10_vak_drag_pieces: 'Now drag the lily pad to the glowing circle.',
    scene10_vak_crossed: 'Vakratunda! You found another way and helped the frog across.',
    scene10_vak_meaning: 'Vakratunda means finding another way.',
    scene10_maha_intro: "Now let's help the little calf.",
    scene10_maha_blocking: 'A heavy log is trapping him!',
    scene10_maha_drag_rope: 'Drag the rope to the log.',
    scene10_maha_pull_down: 'Now pull down!',
    scene10_maha_log_moving: 'The log is moving.',
    scene10_maha_success: 'Mahakaya! You made the raft bigger, and everyone crossed.',
    scene10_maha_meaning: 'Mahakaya means great strength.',
    scene10_maha_strength: 'You have strength inside you too.',
  },

  'suryakoti-bank': {
    welcome: "The river is dark today. Let's bring back the light!",
    scene11_intro: "The river is dark today. Let's bring back the light!",
    scene11_surya_intro: 'The little bunny wants to find its way home!',
    scene11_surya_rub: 'Rub the darkness away.',
    scene11_surya_hint: 'Rub the darkness away.',
    scene11_surya_success: 'Suryakoti! You brought back the light and helped the bunny home.',
    scene11_surya_done: 'Suryakoti! You brought back the light and helped the bunny home.',
    scene11_surya_meaning: 'Suryakoti means bright as ten million suns.',
    scene11_sama_hint: 'Tap the glowing circle to move the sun.',
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
    scene12_nir_intro: 'The little turtle wants to reach her nest!',
    scene12_nir_drag: 'Drag the obstacles away.',
    nirv_hint: 'Drag the obstacle away.',
    nirv_done: 'Nirvighnam! You cleared the way and helped the turtle through.',
    nirv_meaning: 'Nirvighnam means removing obstacles.',
    nirvighnamSetup: 'You cleared the path… and the turtle made it home.',
    nirvighnamClaim: 'I clear the way and move forward.',
    scene12_kuru_intro: 'The beaver needs help to cross the river!',
    scene12_kuru_tap: 'Drag the help bubble to a friend. Each friend can help build the bridge.',
    kuru_hint: 'Drag the help bubble to the glowing friend.',
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
    welcome: 'Now let us use Ganesha’s powers to help!',
    scene13_try_again: 'Try another symbol.',
    scene13_success: 'Sarva-Karyeshu! You chose the right power and solved every task.',
    scene13_meaning: 'Sarva Karyeshu means in everything we do.',
    scene14_intro: 'Morning, afternoon, and night. Ganesha is with us all day.',
    scene14_morning: 'Tap the morning memory bubble.',
    scene14_afternoon: 'Now tap the afternoon bubble.',
    scene14_night: 'Now tap the night bubble.',
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
