# Symbol Mtn Scenes - VO - 29th April 2026

Date: April 29, 2026
Zone: Symbol Mountain
Scenes covered: 1 to 4

## Scene 1 - Modak (`symbol-mountain/modak`)
Source: `src/lib/config/content/voiceGuidance.js` + scene flow in `NewModakSceneV7.jsx`

- `welcome`: "Welcome to Symbol Mountain! Can you find my friend Mooshika? He's hiding somewhere..."
- `findMooshika`: "Tap the little mound to find Mooshika!"
- `mooshikaFound`: "You found Mooshika! He's my little mouse friend. He teaches us about FOCUS!"
- `focusPower`: "Your mind is like a little mouse - sometimes it runs around! But YOU can call it back. Say with me: I can focus!"
- `collectStart`: "Now help Mooshika collect 3 modaks for me! Tap each golden modak you find!"
- `sharingPower`: "When you share something special, it feels even MORE special! Say with me: I love to share!"
- `feedGanesha`: "Drag the modaks to feed Ganesha!"
- `gratitudePower`: "You helped Mooshika, collected with care, and shared with love. That's GRATITUDE! Say with me: I am grateful!"
- `kindHeartPower`: "You have a kind heart!"
- `symbolDiscovery`: "You found 3 special symbols! Tap each one to learn their secret!"
- `sceneComplete`: "Amazing work, little explorer! You did it! Focus, sweet reward, and sharing - all done! I'm so proud of you!"

### Hint / Idle VO
- `findMooshikaIdle`: "Tap the small brown hills. Mooshika is hiding in one of them!"
- `collectIdleHint`: "Look behind the trees and bushes. Tap the modaks."
- `feedIdleHint`: "Drag a modak from the plate to Ganesha."

### Scene 1 - Updated Locked Script (Web Speech API)

| # | Trigger | VO |
|---|---|---|
| 1 | Welcome | "Welcome! Let's help Mooshika share the modaks." |
| 2 | Find Mooshika | "Mooshika is hiding. Tap the mounds." |
| 3 | Mooshika Found | "There he is! My little friend." |
| 4a | Focus setup | "He sits so still. That's focus." |
| 4b | Focus claim | "Say it with me... I can focus." |
| 5 | Collect Start | "Now help him. Tap the modaks." |
| 6a | Joy setup | "These modaks feel happy. Warm and sweet." |
| 6b | Joy claim | "Say it with me... I am full of joy." |
| 7 | Feed Ganesha | "Let's share these. Drag them here." |
| 8a | Safety setup | "Feel inside. Soft and still." |
| 8b | Safety claim | "Say it with me... I feel safe inside." |
| 9 | Scene Complete | "Focused mind. Happy heart. All yours." |

#### Updated Locked Idle Hints

| Trigger | VO |
|---|---|
| `findMooshikaIdle` | "Tap the little hills. He's in one!" |
| `collectIdleHint` | "Tap the modaks. Look near the trees." |
| `feedIdleHint` | "Drag a modak to me." |

## Scene 2 - Pond (`symbol-mountain/pond`)
Source: `PondSceneSimplifiedV4.jsx` scene prompts

- `opening`: "Let us bloom the golden lotus."
- `lotusRound`: "Press and hold to make the lotus bloom."
- `idleLotus`: "Hold a lotus gently. Watch it bloom."
- `lotusBloomPower`: "Calm blooms from patience. Say with me: I stay calm!"
- `waterPathPower`: "Following the path leads to the goal. Say with me: I find my way!"
- `complete`: "You stayed calm and went with the flow. The lotus shines because of you!"

### Hint / Idle VO
- `idleLotus`: "Hold a lotus gently. Watch it bloom."

## Scene 3 - Symbol/Tusk (`symbol-mountain/symbol`)
Source: `SymbolMountainSceneV3.jsx` + embedded game components

### Core scene prompts
- `opening`: "Let's discover my symbols."
- `eyes`: "Tap my eyes."
- `ears`: "Tap my ears."
- `tusk`: "Drag the golden notes to the tusk."
- `idleEyes`: "Look carefully at my eyes."
- `idleEars`: "Listen carefully to my ears."
- `idleTusk`: "Look carefully at the golden notes."
- `complete`: "You found my eyes, ears, and tusk. Now I am shining with you."

### Ears Rhythm round VO (start/end)
- `startRound1`: "Listen carefully."
- `round1TapNow`: "Now tap the instruments in the right order."
- `startRound2`: "Round two. Listen carefully and tap."
- `successRound1`: "You earned a music note!"
- `successRound2`: "Another note! Two down!"
- `successRound3`: "All three notes! You did it!"
Note: No separate `startRound3` line in current logic.

### Eyes Telescope game VO
- Opening cue: "Drag the magnifying glass to find the hidden instruments."
- Idle hint: "Drag the magnifying glass to find the instruments."
- Instrument callouts on discovery: "Tabla", "Dholak", "Harmonium", "Tanpura"

## Scene 4 - Sacred Assembly (`symbol-mountain/final-scene`)
Source: `src/lib/config/content/voiceGuidance.js` + `SacredAssemblySceneV8.jsx`

### Opening/Card VO
- `openingModalPrompt`: "All my symbols are ready... let's place them together."
- `cardEyes`: "Eyes."
- `cardEars`: "Ears."
- `cardTrunk`: "Trunk."
- `cardTusk`: "Tusk."
- `cardModak`: "Modak."
- `cardLotus`: "Lotus."
- `cardBelly`: "Belly."
- `cardMooshika`: "Mooshika."

### Hint VO (Web API text)
- `hintEyes`: "I see clearly."
- `hintEars`: "I listen with care."
- `hintTrunk`: "I find my way."
- `hintTusk`: "I finish what I start."
- `hintModak`: "I am full of joy."
- `hintLotus`: "I stay calm."
- `hintBelly`: "I feel safe inside."
- `hintMooshika`: "I can focus."

### Guidance / Correct / Wrong / Final VO
- `onboardingTapRightPart`: "Tap the right part of me."
- `correctYes`: "Yes."
- `correctThatsRight`: "Beautiful."
- `correctYouFoundIt`: "You remember."
- `correctWellDone`: "Perfect."
- `wrongTryAgain`: "Hmm... try again."
- `finalYouFoundAll`: "You found all my symbols..."
- `finalNowComplete`: "Now I am complete."
- `finalAlwaysWithYou`: "And I am always with you."

## Audio storage notes
- VO config entries are defined in `src/lib/config/content/voiceGuidance.js`.
- File-backed audio paths mostly point under `public/audio/voicenew/...`.
- Some lines are Web Speech API text-only (no `file`), especially Scene 4 hint lines.
