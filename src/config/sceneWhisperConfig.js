// src/config/sceneWhisperConfig.js
// ─────────────────────────────────
// All GaneshaSceneWhisper voice lines.
// NAME_TOKEN gets replaced with child's
// actual name at runtime.
// Pre-recorded files referenced by path.
//
// Keys match the REAL scene IDs from App.jsx SCENE_MAPPING.
// Legacy keys (symbol-mountain-scene-N, cave-scene-N, etc.)
// are kept so any direct usage still resolves.

const NAME = '{{name}}' // replaced at runtime

export const ZONE_WELCOMES = {
  'symbol-mountain': {
    text: `${NAME}! You made it to Symbol Mountain — where my eight secret powers are hiding. Each one has been waiting for exactly the right person to find them. Ready to climb?`,
    preRecorded: null,
  },
  'cave-of-secrets': {
    text: `Ssshh, ${NAME}. The Cave of Secrets only opens for children who are truly ready. Inside are words so powerful, they have been whispered for thousands of years. Are you brave enough?`,
    preRecorded: null,
  },
  'shloka-river': {
    text: `${NAME}, the Shloka River is alive. Every word you learn here makes the water rise higher. By the end — you will have done that. Just you.`,
    preRecorded: null,
  },
  'festival-square': {
    text: `${NAME}! Can you hear the drums?! Ganesh Chaturthi has started and everyone is waiting — the piano, the rangoli, the modaks — all of it needs YOU. Let us celebrate!`,
    preRecorded: null,
  },
  'about-me-hut': {
    text: `This is my favourite place, ${NAME}. The About Me Hut is just for you — where we find out what makes you, YOU. I have been curious about that for a while, actually.`,
    preRecorded: null,
  },
}

export const SCENE_INVITES = {

  // ── SYMBOL MOUNTAIN — real scene IDs from App.jsx ────
  'modak': {
    text: `${NAME}, modaks are my most favourite thing in the whole world — and today, you are going to make one. Five steps. Let us do this together.`,
    preRecorded: null,
  },
  'pond': {
    text: `${NAME}, there is a golden lotus hiding somewhere in this pond. It only blooms for someone who is gentle and patient. Can you find it?`,
    preRecorded: null,
  },
  'symbol': {
    text: `My broken tusk has a secret, ${NAME}. I broke it on purpose — to finish writing something very important. Come inside and find out what.`,
    preRecorded: null,
  },
  'final-scene': {
    text: `The Sacred Assembly, ${NAME}. All eight symbols — together for the first time. This is the final scene. And you have earned every single one.`,
    preRecorded: null,
  },

  // ── SYMBOL MOUNTAIN — legacy keys (kept for safety) ──
  'symbol-mountain-scene-1': {
    text: `The Lotus is hiding somewhere on this mountain, ${NAME}. It only shows itself to someone who looks carefully. Slow down. It is there.`,
    preRecorded: null,
  },
  'symbol-mountain-scene-2': {
    text: `${NAME}, behind this door is my Axe. It looks sharp — but it is really about being brave enough to cut through what is in your way.`,
    preRecorded: null,
  },
  'symbol-mountain-scene-3': {
    text: `My broken tusk is in this scene, ${NAME}. I broke it myself — on purpose. Come inside and find out why.`,
    preRecorded: null,
  },
  'symbol-mountain-scene-4': {
    text: `The Sacred Assembly, ${NAME}. All eight symbols together. This is the final scene — and you have earned every one of them.`,
    preRecorded: null,
  },

  // ── CAVE OF SECRETS — real scene IDs from App.jsx ────
  'vakratunda-mahakaya': {
    text: `${NAME}, the first secret word is Vakratunda Mahakaya. Two powerful names hiding inside one ancient shloka. The cave door is listening. Are you ready?`,
    preRecorded: null,
  },
  'suryakoti-samaprabha': {
    text: `${NAME}, Suryakoti Samaprabha. The second secret. It means the brightness of a million suns. Say it and see what the cave does.`,
    preRecorded: null,
  },
  'nirvighnam-kurumedeva': {
    text: `Nirvighnam Kurumedeva, ${NAME}. No obstacles. Make it happen. The cave is deeper now — but you have been here before. Go in.`,
    preRecorded: null,
  },
  'sarvakaryeshu-sarvada': {
    text: `${NAME}, Sarvakaryeshu Sarvada. Always successful in everything. This is the fourth secret of the cave. And honestly — it suits you perfectly.`,
    preRecorded: null,
  },
  'final-meaning-scene': {
    text: `The Cave Finale, ${NAME}. Everything you have learned is being tested here. All four secrets. All eight words. This is the moment you have been building towards.`,
    preRecorded: null,
  },

  // ── CAVE OF SECRETS — legacy keys ────────────────────
  'cave-scene-1': {
    text: `The first door only opens when you know the secret syllable, ${NAME}. I will teach you. But you have to say it out loud — the cave needs to hear your voice.`,
    preRecorded: null,
  },
  'cave-scene-2': {
    text: `${NAME}, two syllables this time. The cave is testing you. But you opened the first door — this one is yours too.`,
    preRecorded: null,
  },
  'cave-scene-3': {
    text: `Deeper into the cave, ${NAME}. The words are getting longer — and more powerful. Are you ready?`,
    preRecorded: null,
  },
  'cave-scene-4': {
    text: `${NAME}, this is Nirvighnam — no obstacles. Say it and feel what happens in your chest.`,
    preRecorded: null,
  },
  'cave-scene-5': {
    text: `The Cave Finale, ${NAME}. Everything you have learned comes together here. This is the moment.`,
    preRecorded: null,
  },

  // ── SHLOKA RIVER — real scene IDs (already matched) ──
  'vakratunda-grove': {
    text: `${NAME}, in this scene we are going to use the power of Vakratunda Mahakaya to bloom flowers and grow trees. Every time you say it — something beautiful grows.`,
    preRecorded: null,
  },
  'suryakoti-bank': {
    text: `Suryakoti means the brightness of a million suns, ${NAME}. In this scene — YOU are that brightness. Let us light up the river.`,
    preRecorded: null,
  },
  'nirvighnam-chant': {
    text: `Nirvighnam means no obstacles, ${NAME}. And in this scene — there are some big ones in the way. But you have the word now. Use it.`,
    preRecorded: null,
  },
  'sarvakaryeshu-chant': {
    text: `Sarvakaryeshu Sarvada, ${NAME}. Always successful in everything. That is what this shloka means. And today — it is yours.`,
    preRecorded: null,
  },
  'shloka-river-finale': {
    text: `${NAME}. You have learned every word in the Shloka River. This finale is your celebration. The whole river has been waiting for you.`,
    preRecorded: null,
  },

  // ── FESTIVAL SQUARE — real scene IDs from App.jsx ────
  'game1': {
    text: `${NAME}! The piano is ready — and Ganesh Chaturthi needs music. Play Ganesha's songs and watch what happens!`,
    preRecorded: null,
  },
  'game2': {
    text: `Every rangoli is different — just like the person who makes it, ${NAME}. This one will be yours. Nobody will ever make one exactly like it.`,
    preRecorded: null,
  },
  'game3': {
    text: `${NAME}, we are making modaks — my absolute favourite thing in the whole world. Five steps. Let us do this together.`,
    preRecorded: null,
  },
  'game4': {
    text: `The mandap needs decorating, ${NAME}. Four missions. Every decoration you place makes the celebration more beautiful.`,
    preRecorded: null,
  },

  // ── FESTIVAL SQUARE — legacy keys ────────────────────
  'festival-piano': {
    text: `${NAME}! The piano is ready — and Ganesh Chaturthi needs music. Play Ganesha's songs and watch what happens!`,
    preRecorded: null,
  },
  'rangoli-art': {
    text: `Every rangoli is different — just like the person who makes it, ${NAME}. This one will be yours. Nobody will ever make one exactly like it.`,
    preRecorded: null,
  },
  'modak-cooking': {
    text: `${NAME}, we are making modaks — my absolute favourite thing in the whole world. Five steps. Let us do this together.`,
    preRecorded: null,
  },
  'mandap-decoration': {
    text: `The mandap needs decorating, ${NAME}. Four missions. Every decoration you place makes the celebration more beautiful.`,
    preRecorded: null,
  },

  // ── ABOUT ME HUT — real scene IDs from App.jsx ───────
  // Note: App.jsx SCENE_MAPPING keys are swapped vs their file names.
  // Whisper text matches the CARD LABEL shown to the child in ZoneWelcome.
  'family-tree': {
    text: `${NAME}, every person in your family has a story. The Family Tree is where we put them all together. Who do you want to add first?`,
    preRecorded: null,
  },
  'favorite-food': {
    text: `${NAME}, what is your most favourite food in the whole world? I want to know everything. The things you love are clues to who you are.`,
    preRecorded: null,
  },
  'dreams-wishes': {
    text: `${NAME}, what do you dream about? What do you wish for? These are important questions. Only you know the answers — and I really want to hear them.`,
    preRecorded: null,
  },
  'name-birthday': {
    text: `Your name and your birthday, ${NAME}. Both are special. Both were chosen just for you. Let us celebrate them.`,
    preRecorded: null,
  },

  // ── ABOUT ME HUT — legacy keys ───────────────────────
  'favourite-things': {
    text: `This is my favourite game, ${NAME}. What do YOU love? Let us find out — because the things you love say a lot about who you are.`,
    preRecorded: null,
  },
  'obstacle-remover': {
    text: `${NAME}, removing obstacles is literally my job. Tell me what is in your way — and let us remove it together.`,
    preRecorded: null,
  },
}

export const SCENE_BRIDGES = {

  // ── SYMBOL MOUNTAIN — real scene IDs ─────────────────
  'modak-complete': {
    text: `${NAME}, you just made modaks — MY favourite thing in the whole world. The Pond is next — and there is something golden hiding in the water. Can you find it?`,
    preRecorded: null,
  },
  'pond-complete': {
    text: `You found the golden lotus, ${NAME}. Even in muddy water — it stays beautiful. Just like you. The Symbol scene is next — and it has my most personal story inside.`,
    preRecorded: null,
  },
  'symbol-complete': {
    text: `${NAME} — you know about my broken tusk now. I broke it and kept going. You just did the same thing. The Sacred Assembly is the final scene. All eight symbols. You are ready.`,
    preRecorded: null,
  },

  // ── SYMBOL MOUNTAIN — legacy keys ────────────────────
  'symbol-mountain-scene-1-complete': {
    text: `You found the Lotus, ${NAME}. Even in muddy water — it stays beautiful. Just like you. Scene 2 is waiting — and it has something sharp and brave inside.`,
    preRecorded: null,
  },
  'symbol-mountain-scene-2-complete': {
    text: `The Axe and the Lotus, ${NAME}. Calm AND courage. That is a rare combination. Scene 3 has my most personal symbol — come and see.`,
    preRecorded: null,
  },
  'symbol-mountain-scene-3-complete': {
    text: `${NAME} — you know about my broken tusk now. I broke it and kept going. You just did the same thing. Scene 4 is the Sacred Assembly. All eight symbols. You are ready.`,
    preRecorded: null,
  },

  // ── CAVE OF SECRETS — real scene IDs ─────────────────
  'vakratunda-mahakaya-complete': {
    text: `Vakratunda Mahakaya, ${NAME}. You said the first two words of the secret shloka. The cave opened. Now Scene 2 — Suryakoti Samaprabha. A million suns.`,
    preRecorded: null,
  },
  'suryakoti-samaprabha-complete': {
    text: `${NAME}, two secrets down. The cave trusts you more with every word. Nirvighnam Kurumedeva is next — no obstacles. Go deeper.`,
    preRecorded: null,
  },
  'nirvighnam-kurumedeva-complete': {
    text: `${NAME}, three secrets learned. You know Nirvighnam — no obstacles — and you are living it. One more — Sarvakaryeshu Sarvada. The most powerful one.`,
    preRecorded: null,
  },
  'sarvakaryeshu-sarvada-complete': {
    text: `${NAME}. All four secrets. The Cave Finale is the last door — and it is waiting for you to bring everything together.`,
    preRecorded: null,
  },

  // ── CAVE OF SECRETS — legacy keys ────────────────────
  'cave-scene-1-complete': {
    text: `You spoke the first secret word out loud and the cave door opened, ${NAME}. That took courage. Scene 2 has two syllables. Harder — but you just proved you can do this.`,
    preRecorded: null,
  },
  'cave-scene-2-complete': {
    text: `Two doors open, ${NAME}. The cave trusts you more now. Scene 3 goes deeper — and the words get more powerful.`,
    preRecorded: null,
  },
  'cave-scene-3-complete': {
    text: `${NAME}, you are halfway through the Cave of Secrets. The words you know now — very few children know them. Scene 4 is Nirvighnam. No obstacles.`,
    preRecorded: null,
  },
  'cave-scene-4-complete': {
    text: `Nirvighnam, ${NAME}. You said it. And you meant it. One more scene — the finale. Everything comes together there.`,
    preRecorded: null,
  },

  // ── SHLOKA RIVER ─────────────────────────────────────
  'vakratunda-grove-complete': {
    text: `${NAME} — you said Vakratunda Mahakaya and the whole river heard it. Look — the flowers are still blooming. Now Scene 2 is calling. Suryakoti. A million suns. Think you can hold that much light?`,
    preRecorded: null,
  },
  'suryakoti-bank-complete': {
    text: `You brought a million suns to the river, ${NAME}. Now Nirvighnam is next — no obstacles. And you are proving that every single day.`,
    preRecorded: null,
  },
  'nirvighnam-chant-complete': {
    text: `${NAME}, three shlokas. You have removed every obstacle in this river. One more — Sarvakaryeshu Sarvada. Always successful in everything. That one is for you.`,
    preRecorded: null,
  },
  'sarvakaryeshu-chant-complete': {
    text: `${NAME}. Sarvakaryeshu Sarvada. You said all of them. The Finale is next — and the whole river wants to celebrate with you.`,
    preRecorded: null,
  },
  // legacy key
  'sarvakaryeshu-complete': {
    text: `${NAME}. Sarvakaryeshu Sarvada. You said all of them. The Finale is next — and the whole river wants to celebrate with you.`,
    preRecorded: null,
  },

  // ── FESTIVAL SQUARE — real scene IDs ─────────────────
  'game1-complete': {
    text: `You played Ganesha's song on a piano, ${NAME}. Now the colours want to dance too — Rangoli is next. Same celebration, different language.`,
    preRecorded: null,
  },
  'game2-complete': {
    text: `${NAME}, you made something beautiful that never existed before. Now it is time for modaks — my favourite. Come on. I have been waiting for this one.`,
    preRecorded: null,
  },
  'game3-complete': {
    text: `You made MY favourite thing in the whole world, ${NAME}. The mandap is next — the most important decoration of the whole festival. It is ready for you.`,
    preRecorded: null,
  },

  // ── FESTIVAL SQUARE — legacy keys ────────────────────
  'festival-piano-complete': {
    text: `You played Ganesha's song on a piano, ${NAME}. Now the colours want to dance too — Rangoli is next. Same celebration, different language.`,
    preRecorded: null,
  },
  'rangoli-art-complete': {
    text: `${NAME}, you made something beautiful that never existed before. Now it is time for modaks — my favourite. Come on. I have been waiting for this one.`,
    preRecorded: null,
  },
  'modak-cooking-complete': {
    text: `You made MY favourite thing in the whole world, ${NAME}. The mandap is next — the most important decoration of the whole festival. It is ready for you.`,
    preRecorded: null,
  },

  // ── ABOUT ME HUT — real scene IDs ────────────────────
  'family-tree-complete': {
    text: `${NAME}, look at all those people who love you. Your family is your whole world — and now it lives here too. Favourite Things is next. This one is all about YOU.`,
    preRecorded: null,
  },
  'favorite-food-complete': {
    text: `${NAME}, now I know your favourite food. And that tells me something important about you. Dreams and Wishes is next — and I have been curious about that one.`,
    preRecorded: null,
  },
  'dreams-wishes-complete': {
    text: `${NAME}, you shared your dreams with me. That takes courage. The last scene is Name and Birthday — and we are going to celebrate everything that makes you, YOU.`,
    preRecorded: null,
  },

  // ── ABOUT ME HUT — legacy keys ───────────────────────
  'favourite-things-complete': {
    text: `Now I know what you love, ${NAME}. And knowing what you love is how you know who you are. The Obstacle Remover is next — and I have been waiting to help with that one.`,
    preRecorded: null,
  },
  'obstacle-remover-complete': {
    text: `${NAME}, you named your obstacle. That is the bravest thing. Even I cannot remove what I cannot see. One more scene — your Name and Birthday. Let us celebrate you.`,
    preRecorded: null,
  },
}

// ─── Pre-recorded audio check ──────────────────────
// When you record audio files, update preRecorded paths above.
// Format: '/audio/[scene-id]-[type].mp3'
// Example: '/audio/modak-invite.mp3'
//
// The component checks preRecorded first.
// Falls back to Web Speech if null.
//
// ─── About Me Hut scene mapping note ──────────────
// App.jsx SCENE_MAPPING keys are currently mismatched
// with their component files (keys are swapped).
// Whisper text above matches the CARD LABEL the child
// sees in ZoneWelcome — not the loaded component.
// Fix the SCENE_MAPPING keys to resolve the mismatch.
