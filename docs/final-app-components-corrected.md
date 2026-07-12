# Final App Components Corrected

This restores the full master note and corrects the Shloka River sidebar entry.

## App Flow

| Section | Final component / file | Notes |
|---|---|---|
| Loading | [App.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/App.jsx:1101) | Initial loading screen with Mushika loader |
| Main opening | [MainWelcomeScreen.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/MainWelcomeScreen.jsx:10) | Title screen / begin |
| Profile create / select | [CleanProfileSelector.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/CleanProfileSelector.jsx:10) | New profile + avatar selection |
| Profile welcome | [CleanGameWelcomeScreen.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/CleanGameWelcomeScreen.jsx:15) | Continue journey / start adventure |
| Intro story | [GaneshaIntroStory.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/components/GaneshaIntroStory.jsx:5) | First-time story flow |
| Map | [CleanMapZone.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/pages/CleanMapZone.jsx:9) | Zone map |
| Zone welcome | [ZoneWelcome.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/zone/ZoneWelcome.jsx:114) | Per-zone card screen |
| Parent dashboard | [ParentDashboard.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/ParentDashboard.jsx:1) | Parent area |
| Daily dare popup | [App.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/App.jsx:1443) | Map overlay popup |
| TWG hub | [App.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/App.jsx:1358) | Extra hub view |

## Shared Components

| Shared component | Final file | Purpose |
|---|---|---|
| `OpeningModal` | [OpeningModal.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shared/components/OpeningModal.jsx:1) | Opening / intro modal before scene starts |
| `SceneCompletionCelebration` | [SceneCompletionCelebration.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/SceneCompletionCelebration.jsx:1) | Completion / closing modal |
| `SymbolAutoReveal` | [SymbolAutoReveal.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/reveal/SymbolAutoReveal.jsx:1) | Symbol card reveal, affirmation, fly-to-sidebar |
| `InnerMandala` | [InnerMandala.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/InnerMandala.jsx:66) | Mandala/progress display |
| `ProgressPopup` | [ProgressPopup.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/ProgressPopup.jsx:1) | Popup inside clean welcome screen |
| `AppSidebar` | [AppSidebar.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/shared/AppSidebar.jsx:29) | Shloka River app sidebar used in the main learning scenes |
| `SanskritVoiceRecorder` | [SanskritVoiceRecorder.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/audio/SanskritVoiceRecorder.jsx:1) | Sanskrit chant / word recorder popup |
| `SymbolSidebar` | [SymbolSidebar.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/shared/components/SymbolSidebar.jsx:1) | Symbol Mountain sidebar |
| `SymbolCardModal` | [SymbolCardModal.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/shared/components/SymbolCardModal.jsx:1) | Symbol info popup from sidebar |
| Meaning Cave `SymbolSidebar` | [SymbolSidebar.jsx](</C:/Users/Madhurima Agarwal/ganesha-my-bestie/src/zones/meaning cave/components/SymbolSidebar.jsx:1>) | Meaning Cave sidebar |

## Clean Welcome Popup

| Component | Final file | Note |
|---|---|---|
| `ProgressPopup` | [ProgressPopup.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/ProgressPopup.jsx:1) | Popup used in clean welcome screen |
| `CleanGameWelcomeScreen` | [CleanGameWelcomeScreen.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/navigation/CleanGameWelcomeScreen.jsx:15) | Opens the popup and uses `InnerMandala` |

## Map Zones

| Zone ID | Zone name in final config | Status on map |
|---|---|---|
| `symbol-mountain` | Modak Mountain | Visible |
| `shloka-river` | Shloka River | Visible |
| `about-me-hut` | Mooshika's Hut | Visible |
| `festival-square` | Lotus Square | Visible |
| `story-treehouse` | Tusk Treehouse | Coming soon |
| `cave-of-secrets` | Wonder Caves | Exists in data, hidden from visible map |

## Zone-Wise Final Scenes

| Zone | Scene ID | Final scene file | Shared components used |
|---|---|---|---|
| Symbol Mountain | `modak` | [NewModakSceneV7.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx:1) | `OpeningModal`, `SymbolAutoReveal`, `SymbolSidebar`, `SceneCompletionCelebration`, `InnerMandala` |
| Symbol Mountain | `pond` | [PondSceneSimplifiedV4.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx:1) | `OpeningModal`, `SymbolAutoReveal`, `SymbolSidebar`, `SceneCompletionCelebration`, `InnerMandala` |
| Symbol Mountain | `symbol` | [SymbolMountainSceneV3.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx:1) | `OpeningModal`, `SymbolAutoReveal`, `SymbolSidebar`, `SceneCompletionCelebration`, `InnerMandala` |
| Symbol Mountain | `final-scene` | [SacredAssemblySceneV8.jsx](</C:/Users/Madhurima Agarwal/ganesha-my-bestie/src/zones/symbol-mountain/scenes/final scene/SacredAssemblySceneV8.jsx:1>) | `OpeningModal`, `SymbolSidebar`, `SceneCompletionCelebration` |
| Cave of Secrets | `vakratunda-mahakaya` | [CaveSceneFixedV2.jsx](</C:/Users/Madhurima Agarwal/ganesha-my-bestie/src/zones/meaning cave/scenes/VakratundaMahakaya/CaveSceneFixedV2.jsx:1>) | Final scene file wired from `App.jsx`; shared list not fully re-expanded here |
| Cave of Secrets | `suryakoti-samaprabha` | [SuryakotiSceneV4.jsx](</C:/Users/Madhurima Agarwal/ganesha-my-bestie/src/zones/meaning cave/scenes/suryakoti-samaprabha/SuryakotiSceneV4.jsx:1>) | `OpeningModal`, `SymbolAutoReveal`, Meaning Cave `SymbolSidebar`, `SceneCompletionCelebration` |
| Cave of Secrets | `nirvighnam-kurumedeva` | [NirvighnamSceneV5.jsx](</C:/Users/Madhurima Agarwal/ganesha-my-bestie/src/zones/meaning cave/scenes/nirvighnam-kurumedeva/NirvighnamSceneV5.jsx:1>) | `OpeningModal`, `SymbolAutoReveal`, Meaning Cave `SymbolSidebar`, `SceneCompletionCelebration` |
| Cave of Secrets | `sarvakaryeshu-sarvada` | [SarvakaryeshuSarvadaV7.jsx](</C:/Users/Madhurima Agarwal/ganesha-my-bestie/src/zones/meaning cave/scenes/sarvakaryeshu-sarvada/SarvakaryeshuSarvadaV7.jsx:1>) | Meaning Cave `SymbolSidebar`, `SceneCompletionCelebration` |
| Cave of Secrets | `final-meaning-scene` | [Cavescene5memoryfinale.jsx](</C:/Users/Madhurima Agarwal/ganesha-my-bestie/src/zones/meaning cave/scenes/final meaning scene/Cavescene5memoryfinale.jsx:1>) | `OpeningModal`, Meaning Cave `SymbolSidebar`, `SceneCompletionCelebration` |
| Shloka River | `vakratunda-grove` | [VakratundaGroveSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx:1) | `OpeningModal`, `SymbolAutoReveal`, `SceneCompletionCelebration`, `InnerMandala`, `AppSidebar` |
| Shloka River | `suryakoti-bank` | [SuryakotiBankSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx:1) | `OpeningModal`, `SymbolAutoReveal`, `SceneCompletionCelebration`, `InnerMandala`, `AppSidebar` |
| Shloka River | `nirvighnam-chant` | [NirvighnamChantSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx:1) | `OpeningModal`, `SymbolAutoReveal`, `SceneCompletionCelebration`, `InnerMandala`, `AppSidebar` |
| Shloka River | `sarvakaryeshu-chant` | [SarvakaryeshuChantSimplified.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx:1) | `OpeningModal`, `SymbolAutoReveal`, `SceneCompletionCelebration`, `InnerMandala`, `AppSidebar` |
| Shloka River | `shloka-river-finale` | [ShlokaRiverFinale.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx:1) | `OpeningModal`, `SceneCompletionCelebration`, `SanskritVoiceRecorder` |
| Festival Square | `game1` | [FestivalPianoGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/festival-square/Game1-piano/FestivalPianoGame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |
| Festival Square | `game2` | [FestivalRangoliGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/festival-square/Game2-Rangoli/FestivalRangoliGame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |
| Festival Square | `game3` | [ModakCookingGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/festival-square/game3-cooking/ModakCookingGame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |
| Festival Square | `game4` | [MandapDecorationGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/festival-square/Game4-mandapdecor/MandapDecorationGame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |
| About Me Hut | `family-tree` | [Familytreegame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/family-tree/Familytreegame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |
| About Me Hut | `favorite-food` | [Favoritefoodgame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/food/Favoritefoodgame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |
| About Me Hut | `dreams-wishes` | [ObstacleRemoverGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/enjoy/ObstacleRemoverGame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |
| About Me Hut | `my-indian-story` | [MyIndianStoryGame.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/about-me-hut/indian-story/MyIndianStoryGame.jsx:1) | `OpeningModal`, `SceneCompletionCelebration` |

## Shloka River Sidebar Correction

| Item | Correct component | Final file |
|---|---|---|
| Shloka River scene sidebar | `AppSidebar` | [AppSidebar.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/zones/shloka-river/shared/AppSidebar.jsx:29) |

This replaces the earlier incorrect sidebar note.

## Sanskrit Recorder

| Shared component | Final file | Purpose |
|---|---|---|
| `SanskritVoiceRecorder` | [SanskritVoiceRecorder.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/audio/SanskritVoiceRecorder.jsx:1) | Sanskrit chant / word recorder popup |

## Where Sanskrit Recorder Appears

| Component | File | How it is used |
|---|---|---|
| `SanskritVoiceRecorder` | [SanskritVoiceRecorder.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/audio/SanskritVoiceRecorder.jsx:1) | Opened from completion/app practice flow |
| Caller | [SceneCompletionCelebration.jsx](/C:/Users/Madhurima%20Agarwal/ganesha-my-bestie/src/lib/components/celebration/SceneCompletionCelebration.jsx:1) | Used when `containerType="apps"` and app icons are tapped |
