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
    hintLookForGlow: "Try going around — see the open water?",
    hintKeepBuildingPath: "Keep going — you're finding the way through.",
    vakratundaSetup: 'The frog made it! He found his family!',
    vakratundaClaim: 'I find a new way.',
    mahakayaSetup: 'You chanted… and it grew tall and strong.',
    mahakayaClaim: 'You have that strength too.',
    sceneComplete: "You found another way. There's room for everyone. Both powers are yours now.",
    scene10_vak_intro: 'The frog can see his family, but rocks and logs block the way. Drag the frog to help him find a way around.',
    scene10_vak_current_too_strong: "The river current is too strong there. Let's try another way.",
    scene10_vak_hint_another_way: "Try going around it.",
    scene10_vak_frog_cross: 'The frog can see his family, but rocks and logs block the way. Drag the frog to help him find a way around.',
    scene10_vak_tap_logs: "That way's blocked — look for another way around.",
    scene10_vak_blocked: "That way's blocked — look for another way around.",
    scene10_vak_choose: "That way's blocked — look for another way around.",
    scene10_vak_make_path: 'The frog can see his family, but rocks and logs block the way. Drag the frog to help him find a way around.',
    scene10_vak_drag_leaves: 'Follow the safe water past the rocks.',
    scene10_vak_drag: 'Follow the safe water past the rocks.',
    scene10_vak_drag_pieces: 'Follow the safe water past the rocks.',
    scene10_vak_crossed: 'Vakratunda! You found another way and helped the frog reach his family.',
    scene10_vak_meaning: 'Vakratunda means finding another way.',
    scene10_maha_intro: 'Everyone wants to cross the river. Drag the logs to build a raft.',
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
    scene11_sama_intro: 'Deer sees a strange shadow. Press and hold to look closely.',
    scene11_sama_hint: 'Press and hold on the shadow.',
    scene11_sama_hint_hold: 'Keep holding to look closely.',
    scene11_sama_find_another: 'Press and hold another part of the shadow.',
    scene11_sama_hint_find: 'Look for another part of the shadow.',
    scene11_sama_hint_keep: 'Keep holding.',
    scene11_sama_hint_look: 'Look closely.',
    scene11_sama_reveal_branch: 'That part is just a branch.',
    scene11_sama_reveal_reeds: 'Those are just reeds and leaves.',
    scene11_sama_reveal_stump: 'That part is a tree stump.',
    scene11_sama_reveal_rocks: 'And those are just rocks and grass.',
    scene11_sama_done: 'Samaprabha! You looked closely and found what was really there.',
    scene11_sama_meaning: 'Samaprabha means equal brightness.',
    suryakotiSetup: 'The light showed the way.',
    suryakotiClaim: 'Suryakoti lights the way.',
    samaprabhaSetup: "A shadow looks scary until we understand it.",
    samaprabhaClaim: 'Samaprabha helps us see clearly.',
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
    scene12_kuru_intro: 'Baby Beaver is across the river.',
    scene12_kuru_tap: 'The logs are too heavy. Drag the help bubble to someone who can help.',
    kuru_hint: 'The logs are too heavy. Drag the help bubble to someone who can help.',
    kuru_done: 'Kuru Me Deva! You asked for help and built the bridge.',
    kuru_meaning: 'Kuru Me Deva means please help us.',
    kurumedevaSetup: 'Baby Beaver is across the river.',
    kurumedevaClaim: 'Asking for help is a superpower.',
    sceneComplete: 'The turtle reached her nest. The bridge is ready. Both powers are yours now.',
  },

  'sarvakaryeshu-chant': {
    scene13_puzzle: "So much to do. Which symbol can help him start small?",
    scene13_puzzle_after: "Mooshika helped him begin with one small thing.",
    scene13_sports: "So many distractions. Which symbol can help him focus?",
    scene13_sports_after: "The Eyes helped him focus on what mattered.",
    scene13_bike: "Heavy here, gentle there. Which symbol can help?",
    scene13_bike_after: "The Trunk helped him use strength, then gentleness.",
    scene13_grandma: "The crayon is broken. Which symbol can help?",
    scene13_grandma_after: "The Tusk reminded her that something broken can still help.",
    welcome: "Let’s see where Ganesha is with you today.",
    scene13_try_again: "Try another symbol.",
    scene13_success: "Sarvakaryeshu! You chose a Ganesha symbol for each task.",
    scene14_intro: "Morning, afternoon and night — let’s find Ganesha through your day.",
    scene14_morning: "Let’s look at the morning.",
    scene14_afternoon: "Now the afternoon.",
    scene14_night: "Now the night.",
    scene14_find_symbol: "Can you find the hidden symbol?",
    scene14_success: "Sarvada! You found Ganesha through the whole day.",
    sceneComplete: "From morning to night, Ganesha was with you.",
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

import { attachSpeechCue } from '../lib/utils/speechCue';

/** Speak `text` via the browser's SpeechSynthesis; calls onEnded when done/failed.
 *  `cue` = { word, onCue } fires onCue when that word is spoken (same as the real scenes). */
export function speakWebSpeech(text, onEnded, onStart, cue = null) {
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
    u.onstart = () => { try { onStart && onStart(); } catch { /* no-op */ } };
    attachSpeechCue(u, text, cue);
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
        speakWebSpeech(stripLeadingSpeechText(line, opts.stripLeadingText), onEnded, opts.onStart, opts.cue);
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
