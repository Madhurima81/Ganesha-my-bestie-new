// ShlokaRiverFinaleData.js
// All 8 Sanskrit words + animals + VO hints for the Chanting Circle

export const SHLOKA_WORDS = [
  {
    id: 1,
    word: "Vakratunda",
    meaning: "Curved Trunk",
    animalName: "Elephant",
    animalImage: "vakratundaElephant",
    wordAudio: "/audio/words/vakratunda.mp3",
    voHint: "The curved-trunk elephant starts our sacred prayer!",
    emoji: "🐘",
  },
  {
    id: 2,
    word: "Mahakaya",
    meaning: "Big Body",
    animalName: "Elephant",
    animalImage: "mahakayaElephant",
    wordAudio: "/audio/words/mahakaya.mp3",
    voHint: "The big, strong-bodied elephant chants next!",
    emoji: "🐘",
  },
  {
    id: 3,
    word: "Suryakoti",
    meaning: "Million Suns",
    animalName: "Fairy",
    animalImage: "suryakotiFairy",
    wordAudio: "/audio/words/suryakoti.mp3",
    voHint: "The fairy shines bright like a million suns!",
    emoji: "✨",
  },
  {
    id: 4,
    word: "Samaprabha",
    meaning: "Equal Radiance",
    animalName: "Kitten",
    animalImage: "samaprabhaKitten",
    wordAudio: "/audio/words/samaprabha.mp3",
    voHint: "The kitten glows with equal light everywhere!",
    emoji: "🐱",
  },
  {
    id: 5,
    word: "Nirvighnam",
    meaning: "Without Obstacles",
    animalName: "Snail",
    animalImage: "nirvighnamSnail",
    wordAudio: "/audio/words/nirvighnam.mp3",
    voHint: "The snail moves forward without any obstacles!",
    emoji: "🐌",
  },
  {
    id: 6,
    word: "Kurumedeva",
    meaning: "Please Do For Me, O Lord",
    animalName: "Peacock",
    animalImage: "kurumedevaPeacock",
    wordAudio: "/audio/words/kurumedeva.mp3",
    voHint: "The peacock dances with divine beauty and grace!",
    emoji: "🦚",
  },
  {
    id: 7,
    word: "Sarvakaryeshu",
    meaning: "In All Tasks",
    animalName: "Duck",
    animalImage: "sarvakaryeshuDuck",
    wordAudio: "/audio/words/sarvakaryeshu.mp3",
    voHint: "The duck does all its tasks with joy!",
    emoji: "🦆",
  },
  {
    id: 8,
    word: "Sarvada",
    meaning: "Always",
    animalName: "Fawn",
    animalImage: "sarvadaFawn",
    wordAudio: "/audio/words/sarvada.mp3",
    voHint: "The fawn is always gentle and kind!",
    emoji: "🦌",
  },
];

// Full shloka audio (all 8 words together)
export const FULL_SHLOKA_AUDIO = "/audio/words/complete-shloka.mp3";

/**
 * Generate a random round with 1 correct animal + 2 random decoys
 * @param {number} roundNumber - 1-8
 * @returns {object} { correct, decoys, options }
 */
export const generateRound = (roundNumber) => {
  const correct = SHLOKA_WORDS[roundNumber - 1]; // 1-indexed
  const allOthers = SHLOKA_WORDS.filter((w) => w.id !== roundNumber);

  // Pick 2 random decoys from the remaining 7
  const shuffled = [...allOthers].sort(() => Math.random() - 0.5);
  const decoys = shuffled.slice(0, 2);

  // Shuffle all 3 options for display
  const options = [correct, ...decoys].sort(() => Math.random() - 0.5);

  return {
    roundNumber,
    correct,
    decoys,
    options, // randomized order for display
  };
};

/**
 * Pre-generate all 8 rounds (done once at scene start)
 * @returns {array} Array of round objects
 */
export const generateAllRounds = () => {
  return Array.from({ length: 8 }, (_, i) => generateRound(i + 1));
};

// Celebration messages
export const CELEBRATION_MESSAGES = {
  perAnimal: "One more friend aboard! 🚤",
  midpoint: "You chanted the first line! 🙏",
  complete: "The sacred prayer is complete! ✨",
};
