export const GRATITUDE_BANK = {
  '5-7': [
    'What made you happy today?',
    'What made you smile today?',
    'What made you laugh?',
    'Who did you enjoy playing with?',
    'What was your favorite part of today?',
    'What fun thing did you do?',
    'What did you enjoy doing today?',
    'Who made you feel happy?',
    'What made your heart feel nice?',
    'What was the best thing today?',
    'What did you love doing today?',
    'What made you giggle?',
    'What made today fun?',
    'What made you feel good inside?',
    'What made you feel proud?',
    'What did you enjoy the most?',
    'What made your day bright?',
    'What made you feel calm?',
    'What made you feel excited?',
    'What made you feel special?',
    'What made you feel loved?',
    'What made today a good day?',
    'What made you feel brave?',
    'What made you feel strong?',
    'What did you like today?',
    'What made you feel cozy?',
    'What made you feel peaceful?',
    'What made you feel kind?',
    'What made you feel happy with someone?',
    'What made you feel safe?',
  ],
  '8-10': [
    'What was the best part of your day?',
    'What made you feel happy today?',
    'Did someone do something kind for you?',
    'What made you feel proud today?',
    'What did you enjoy learning today?',
    'What made you feel excited today?',
    'What made today better than yesterday?',
    'What went well today?',
    'What made you smile the most?',
    'What made you feel calm today?',
    'What made you feel strong today?',
    'What made you feel brave today?',
    'What made you feel grateful today?',
    'What made you feel loved today?',
    'What made you feel included?',
    'What made you feel confident today?',
    'What made you feel peaceful today?',
    'What was a small good moment today?',
    'What surprised you in a good way?',
    'What made you feel proud of yourself?',
    'What made you feel kind today?',
    'What did you enjoy doing the most?',
    'What made you feel relaxed?',
    'What made you feel helpful?',
    'What made your day interesting?',
    'What made you feel thankful?',
    'What made you feel supported?',
    'What made you feel happy about someone else?',
    'What made you feel joyful?',
    'What made you feel lucky today?',
  ],
  '11-12': [
    'What are you grateful for today?',
    'What went well today?',
    'What made today meaningful?',
    'What made you feel good today?',
    'What lifted your mood today?',
    'What made you feel at peace today?',
    'What made you feel proud today?',
    'What made you feel connected to someone?',
    'What made you feel supported today?',
    'What made today better than expected?',
    'What made you feel calm today?',
    'What made you feel confident today?',
    'What made you feel strong today?',
    'What made you feel appreciated?',
    'What made you feel understood?',
    'What made you feel happy today?',
    'What made you feel hopeful today?',
    'What made you feel positive today?',
    'What made you feel relaxed today?',
    'What made you feel content today?',
    'What made you feel inspired today?',
    'What made you feel balanced today?',
    'What made you feel kind today?',
    'What made you feel thankful today?',
    'What made you feel proud of someone else?',
    'What made you feel closer to someone?',
    'What made you feel good about yourself?',
    'What made you feel peaceful inside?',
    'What made today a good day?',
    'What small thing made you smile?',
  ],
};

function getAgeGroup(age) {
  if (age <= 7) return '5-7';
  if (age <= 10) return '8-10';
  return '11-12';
}

export function getTodaysGratitude(age) {
  const group = getAgeGroup(age);
  const prompts = GRATITUDE_BANK[group];
  const historyKey = `gmb_gratitude_prompt_history_${group}`;

  let recent = [];
  try {
    recent = JSON.parse(localStorage.getItem(historyKey) || '[]');
  } catch (_) {
    recent = [];
  }

  const avoid = new Set(recent.slice(-5));
  const pool = prompts.filter((p) => !avoid.has(p));
  const source = pool.length > 0 ? pool : prompts;
  const text = source[Math.floor(Math.random() * source.length)];

  const nextHistory = [...recent, text].slice(-20);
  localStorage.setItem(historyKey, JSON.stringify(nextHistory));

  return { text };
}

