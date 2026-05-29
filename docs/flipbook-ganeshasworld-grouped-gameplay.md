# Grouped Gameplay Map: flipbook-app vs ganeshas-world

## Grouped by Similar Gameplay

| Gameplay Group | flipbook-app Components | ganeshas-world Components | Common Pattern |
|---|---|---|---|
| Welcome / Navigation Hub | `WelcomePage`, `EnhancedWelcomePage` | `WelcomePage`, `Navigation` | Entry flow, screen routing, section selection |
| About / Profile Learning | `GaneshaAboutMe`, `GaneshaProfile`, `GaneshaPassport` | `AboutMeQuiz` | Intro-to-Ganesha identity and personal facts/progress |
| Quiz - Multiple Choice | `GaneshaQuizGame`, `GaneshaStoryQuiz`, `GaneshaTempleQuiz`, `MultipleChoice` | `AboutMeQuiz` | Question-answer progression with scoring/results |
| Quiz - Drag / Match / Symbolism | `GaneshaDraggableQuiz`, `GaneshaSymbolismMatch`, `GaneshaSymbolismWheel`, `BenefitsWheel` | `ArrangeShloka` (order puzzle) | Meaning mapping, categorization, sequence correctness |
| Memory Matching | `GaneshaMemoryGame`, `MemoryGame` | `MemoryGame` | Flip/select matching pairs and complete all matches |
| Coloring Activities | `GaneshaColoringActivity`, `GaneshaColoringActivityInline`, `SimpleGaneshaColoring`, `ColoringTest`, `SimplestColoringTest` | `ColoringActivity` | Tap/select color and fill parts; creative + learning |
| Chant / Shloka Learning | `ChantLearner`, `EnhancedChantLearner`, `ChantLearnerDemo`, `MusicalShlokaBuilder` | `ShlokaLearning`, `ArrangeShloka` | Learn lines/meaning/order, practice chanting |
| Action / Reflex Games | `ObstacleCourse`, `GaneshaObstacleCourse`, `ShlokaJump` | `WordBalloonGame` | Real-time reaction gameplay with speed/timing pressure |
| Power-up / Progress Mechanics | `PowerUpMeter`, `ShlokaPowerUps`, `ShlokaSuperpower` | `ShlokaLearning` (line progress + obstacle clear cycle) | Progress feedback, unlock feeling, level-up style loop |
| Story-based Interactives | `StoryBuilder`, `BeforeAfterScenes`, `GaneshaStoryHighlight` | `WelcomePage` (speech bubble interactions) | Narrative interaction and guided story moments |
| Creative Construction / Assembly | `BuildGaneshaPuzzle`, `BuildingBlocksChallenge`, `JigsawPuzzleWordMeaning` | `DecorateAltar` | Build/place/assemble items toward completion |
| Word / Language Games | `WordScramble`, `WisdomBubbles`, `GaneshaBubbles`, `FeelingsHelper` | `WordBalloonGame` | Vocabulary, meaning recall, language-linked play |
| Audio / Voice Utilities | `AudioPlayer`, `AudioReader`, `AudioRecorder`, `SoundEffects` | (inline sound hooks in multiple files) | Playback/recording/SFX support for learning games |
| Daily Habit / Reflection | `DailyMomentsClock` | (none direct) | Routine and value-linked daily interaction |
| Celebration / Ritual-Themed Play | (indirect via profile/passport and story flows) | `DecorateAltar` | Completion through themed ritual actions |

## Directly Similar Pairs (Closest Match)

| flipbook-app | ganeshas-world | Why Similar |
|---|---|---|
| `GaneshaMemoryGame` / `MemoryGame` | `MemoryGame` | Same memory-card matching loop |
| `GaneshaColoringActivity` | `ColoringActivity` | Same color-and-learn interaction |
| `ChantLearner` / `EnhancedChantLearner` | `ShlokaLearning` | Shloka learning with guided progression |
| `MusicalShlokaBuilder` | `ArrangeShloka` | Shloka arrangement/build structure |
| `GaneshaQuizGame` | `AboutMeQuiz` | MCQ learning quiz pattern |
| `ObstacleCourse` / `GaneshaObstacleCourse` | `WordBalloonGame` | Fast reaction gameplay with score/time pressure |
| `StoryBuilder` / `BeforeAfterScenes` | `WelcomePage` interactive bubbles | Narrative-first engagement |

## Notes

- `flipbook-app` has broader variation and more parallel versions (base/enhanced/test components).
- `ganeshas-world` is more compact and classroom-like, with clear progression from welcome -> learning -> mini-games.
