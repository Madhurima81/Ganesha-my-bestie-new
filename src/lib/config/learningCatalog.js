// GMB Learning Catalog
// Canonical source for Daily Dare + Parent Guide learning content.
// Meanings/affirmations are based on the latest GMB consolidation.
// Keep gameplay success VO, chant pronunciation, and sidebar copy in their own systems.
//
// NOTE: catalog IDs are NOT always identical to the symbol/word keys used by
// ProgressManager / scene code (which use 'belly', 'mahakaya', 'kurumedeva').
// See PROGRESS_KEY_TO_CATALOG_ID in sceneLearningMap.js for the translation —
// do not assume these keys line up 1:1 with saved progress data.

export const LEARNING_CATALOG = {
  // ─────────────────────────────────────────────────────────────
  // Symbol Mountain
  // ─────────────────────────────────────────────────────────────
  mooshika: {
    id: 'mooshika',
    type: 'symbol',
    title: 'Mooshika',
    childMeaning:
      'Big goals can move forward through small, steady steps. I can guide my busy mind and keep going.',
    affirmation: 'I can keep going, one small step at a time.',
    parent: {
      explored:
        'Your child explored how a busy mind can still move something important forward by taking one small step and staying with it.',
      ask:
        'What is something big you want to do? What could one tiny step be?',
      try:
        'Help them choose the smallest useful next step instead of solving the whole problem at once.',
      watchFor:
        'A moment when a task feels too big, or their attention starts jumping away from it.',
    },
    dailyTries: [
      'Pick one big thing you want to do. Take one tiny step today.',
      'Something feels too big? Do only the next small part.',
      'Choose one thing and move it forward just a little.',
    ],
  },

  bigBelly: {
    id: 'bigBelly',
    type: 'symbol',
    title: 'Big Belly',
    childMeaning:
      'I can have different feelings at the same time and still keep going.',
    affirmation: 'I can have lots of feelings and keep going.',
    parent: {
      explored:
        'Your child explored that different feelings and experiences can fit together; they do not have to get rid of one feeling before continuing.',
      ask:
        'What was one hard feeling and one happy feeling you had today?',
      try:
        'Name two feelings that are both present without trying to fix either one immediately.',
      watchFor:
        'Mixed feelings: excitement and nervousness, happiness and disappointment, pride and worry.',
    },
    dailyTries: [
      'Notice two different feelings you have today.',
      'When a hard feeling comes, name it and keep going.',
      'Can two different feelings both be true today?',
    ],
  },

  modak: {
    id: 'modak',
    type: 'symbol',
    title: 'Modak',
    childMeaning:
      'Trying, learning and meaningful effort can bring a good feeling inside.',
    affirmation: 'I can learn, keep trying, and find joy.',
    parent: {
      explored:
        'Your child explored that joy can come from learning and trying—not only from winning or receiving a prize.',
      ask:
        'What was hard at first, but felt good when you kept trying?',
      try:
        'Finish one small thing that takes effort, then pause and notice how it feels.',
      watchFor:
        'Quiet pride or satisfaction after practice, persistence or finally understanding something.',
    },
    dailyTries: [
      'Try something that feels a little hard today.',
      'Keep going with one thing long enough to learn something new.',
      'After you finish something tricky, stop and notice the good feeling inside.',
    ],
  },

  trunk: {
    id: 'trunk',
    type: 'symbol',
    title: 'Trunk',
    childMeaning:
      'Some moments need strength. Others need gentleness. I can choose which one is needed.',
    affirmation: 'I can be strong and gentle.',
    parent: {
      explored:
        'Your child explored how the same trunk can use great strength for a heavy task and delicate control for something fragile.',
      ask:
        'What needed strength today? What needed gentleness?',
      try:
        'Find one task that needs firm effort and one that needs gentle hands.',
      watchFor:
        'Using too much force, or being too tentative when strength is actually needed.',
    },
    dailyTries: [
      'Find one thing today that needs strong hands.',
      'Find one thing that needs gentle hands.',
      'Before you act, ask: strong or gentle?',
    ],
  },

  lotus: {
    id: 'lotus',
    type: 'symbol',
    title: 'Lotus',
    childMeaning:
      'Hard conditions do not stop me from growing.',
    affirmation: 'I can keep growing when things are hard.',
    parent: {
      explored:
        'Your child explored how the lotus can grow and bloom even though the mud around it does not disappear.',
      ask:
        'What is something hard you are still growing through?',
      try:
        'Choose one small action that helps them keep progressing through a difficult situation.',
      watchFor:
        'A setback, difficult practice, friendship problem or challenge that cannot be removed immediately.',
    },
    dailyTries: [
      'Something feels hard today? Take one growing step anyway.',
      'Think of one hard thing you are getting better at.',
      'Do one small thing that helps you grow through a challenge.',
    ],
  },

  eyes: {
    id: 'eyes',
    type: 'symbol',
    title: 'Eyes',
    childMeaning:
      'I can focus on what matters instead of getting pulled by everything around me.',
    affirmation: 'I can focus on what matters.',
    parent: {
      explored:
        'Your child explored looking closely enough to notice the important thing among distractions.',
      ask:
        'What mattered most in that moment?',
      try:
        'Before starting a task, name the one thing that deserves attention first.',
      watchFor:
        'Distraction by interesting but unimportant details, noise, toys or competing tasks.',
    },
    dailyTries: [
      'Choose the most important thing to notice right now.',
      'When lots of things grab your eyes, find what matters most.',
      'Before you begin, decide: what matters here?',
    ],
  },

  ears: {
    id: 'ears',
    type: 'symbol',
    title: 'Ears',
    childMeaning:
      'I do not have to take in every sound or word equally. I can listen for what helps me.',
    affirmation: 'I can listen for what helps me.',
    parent: {
      explored:
        'Your child explored listening deeply and filtering useful or important information from distracting noise.',
      ask:
        'What did you hear today that was actually helpful?',
      try:
        'During one conversation or noisy moment, pause and identify the useful message.',
      watchFor:
        'Getting pulled by every sound, comment or distraction instead of the information that matters.',
    },
    dailyTries: [
      'Listen today for one thing that helps you.',
      'In a noisy moment, find the useful sound or words.',
      'Before reacting to what you hear, ask: does this help me?',
    ],
  },

  tusk: {
    id: 'tusk',
    type: 'symbol',
    title: 'Tusk',
    childMeaning:
      'Something imperfect or broken can still be useful when it serves something important.',
    affirmation: 'I can use what I have for something important.',
    parent: {
      explored:
        'Your child explored that value does not disappear because something is imperfect; what matters is how it can still serve an important purpose.',
      ask:
        'What do you have that you could use for something important?',
      try:
        'Take something limited, imperfect or not ideal and find a meaningful use for it.',
      watchFor:
        '"It\'s ruined," "I can\'t use this," or abandoning something because it is not perfect.',
    },
    dailyTries: [
      'Something is not perfect today? Find one useful thing you can still do with it.',
      'Use what you already have to help with something important.',
      'Before throwing something aside, ask: can this still help?',
    ],
  },

  // ─────────────────────────────────────────────────────────────
  // Shloka River
  // ─────────────────────────────────────────────────────────────
  vakratunda: {
    id: 'vakratunda',
    type: 'shloka',
    title: 'Vakratunda',
    childMeaning:
      'When my first plan does not work, I can change it and find another way.',
    affirmation: 'I can change my plan and try another way.',
    parent: {
      explored:
        'Your child explored flexibility: a blocked path does not mean the goal has to be abandoned.',
      ask:
        'If this way does not work, what else could you try?',
      try:
        'Before helping, invite one genuinely different plan.',
      watchFor:
        'Getting stuck because something "has to" work one particular way.',
    },
    dailyTries: [
      'Stuck today? Change your plan once.',
      'Plan A did not work? Try a different Plan B.',
      'Find another way around one small problem.',
    ],
  },

  mahakaay: {
    id: 'mahakaay',
    type: 'shloka',
    title: 'Mahakaay',
    childMeaning:
      'Being big can mean having room for others, not only being physically strong.',
    affirmation: 'I can make space in my heart for others.',
    parent: {
      explored:
        'Your child explored capacity and inclusion—making space so more people can belong or come along.',
      ask:
        'Who could you make a little more space for today?',
      try:
        'Let someone else\'s idea, turn or need have room alongside their own.',
      watchFor:
        'Excluding someone, insisting only their idea can fit, or struggling to share space or attention.',
    },
    dailyTries: [
      'Make room for someone else\'s idea today.',
      'Invite someone in who might be left out.',
      'Let another person\'s choice have some space too.',
    ],
  },

  suryakoti: {
    id: 'suryakoti',
    type: 'shloka',
    title: 'Suryakoti',
    childMeaning:
      'Even when things feel dark, I can look for hope and light inside me.',
    affirmation: 'I can find hope inside me.',
    parent: {
      explored:
        'Your child explored bringing light back to a difficult situation and connecting that light with hope.',
      ask:
        'What gives you a little hope when something feels difficult?',
      try:
        'In a discouraging moment, identify one thing that is still possible or helpful.',
      watchFor:
        '"Nothing will work," discouragement, or giving up because a situation feels dark.',
    },
    dailyTries: [
      'Something feels difficult? Find one hopeful thing that is still possible.',
      'Notice one little bit of light in a hard moment.',
      'Think of one thing that could get better.',
    ],
  },

  samaprabha: {
    id: 'samaprabha',
    type: 'shloka',
    title: 'Samaprabha',
    childMeaning:
      'A first impression can be frightening or confusing. I can look closely and see what is really there.',
    affirmation: 'I can see what is really there.',
    parent: {
      explored:
        'Your child explored checking more carefully instead of letting the first scary impression decide what is true.',
      ask:
        'What did you think at first? What was really there?',
      try:
        'When something seems worrying, pause and look for actual information before deciding.',
      watchFor:
        'Jumping to a conclusion, especially from a shadow, partial view, rumour or first impression.',
    },
    dailyTries: [
      'Something looks worrying? Look again before you decide.',
      'Check what is really there today instead of guessing.',
      'Notice one first impression—and then look closer.',
    ],
  },

  nirvighnam: {
    id: 'nirvighnam',
    type: 'shloka',
    title: 'Nirvighnam',
    childMeaning:
      'I do not have to solve every obstacle at once. I can work through one thing at a time.',
    affirmation: 'I can solve one thing at a time.',
    parent: {
      explored:
        'Your child explored clearing several blockers by dealing with each one separately.',
      ask:
        'What is the first thing in your way?',
      try:
        'Turn a big problem into one first obstacle and one first action.',
      watchFor:
        'Overwhelm when several problems appear together.',
    },
    dailyTries: [
      'Big problem? Solve only the first part.',
      'Find one thing in your way and work on that.',
      'Clear one obstacle before thinking about the next.',
    ],
  },

  kuruMeDeva: {
    id: 'kuruMeDeva',
    type: 'shloka',
    title: 'Kuru Me Deva',
    childMeaning:
      'Asking for help can be an active, wise choice when I need support.',
    affirmation: 'I can ask for help when I need it.',
    parent: {
      explored:
        'Your child explored recognising when help is needed, choosing someone appropriate and actually asking.',
      ask:
        'Who could help you with this?',
      try:
        'Let the child make the request themselves instead of the adult arranging help automatically.',
      watchFor:
        'Struggling silently, waiting to be rescued, or immediately demanding that someone solve everything.',
    },
    dailyTries: [
      'If you truly need help today, ask clearly.',
      'Choose someone who can help and tell them what you need.',
      'Try first. If you are still stuck, ask for help.',
    ],
  },

  sarvakaryeshu: {
    id: 'sarvakaryeshu',
    type: 'shloka',
    title: 'Sarvakaryeshu',
    childMeaning:
      'Ganesha\'s wisdom can be remembered in the ordinary things I do.',
    affirmation: 'I can remember Ganesha in everything I do.',
    parent: {
      explored:
        'Your child explored choosing a Ganesha symbol or idea that fits different everyday tasks.',
      ask:
        'Which Ganesha idea could help you with this?',
      try:
        'During one ordinary task, deliberately recall one symbol or shloka learning.',
      watchFor:
        'A real-life moment that mirrors a GMB experience—being stuck, distracted, needing help or facing difficulty.',
    },
    dailyTries: [
      'Use one Ganesha idea in something you do today.',
      'When a challenge appears, choose one Bestie reminder.',
      'Before one task today, think: what would Ganesha remind me?',
    ],
  },

  sarvada: {
    id: 'sarvada',
    type: 'shloka',
    title: 'Sarvada',
    childMeaning:
      'Ganesha\'s presence can be remembered through the whole day.',
    affirmation: 'Ganesha is always with me.',
    parent: {
      explored:
        'Your child explored remembering Ganesha across morning, afternoon and night—not only during the game or prayer time.',
      ask:
        'When did you remember Ganesha today?',
      try:
        'Pick one ordinary moment in the day to pause and remember Ganesha.',
      watchFor:
        'Thinking of Ganesha only as something connected to festivals, puja or the app.',
    },
    dailyTries: [
      'Remember Ganesha once during an ordinary moment today.',
      'Morning, afternoon or night—pause once and think of Ganesha.',
      'Notice one moment today when you feel Ganesha close to you.',
    ],
  },
};

export const LEARNING_IDS = Object.keys(LEARNING_CATALOG);

export const SYMBOL_LEARNING_IDS = LEARNING_IDS.filter(
  (id) => LEARNING_CATALOG[id].type === 'symbol'
);

export const SHLOKA_LEARNING_IDS = LEARNING_IDS.filter(
  (id) => LEARNING_CATALOG[id].type === 'shloka'
);

export function getLearningById(id) {
  return LEARNING_CATALOG[id] || null;
}

export default LEARNING_CATALOG;
