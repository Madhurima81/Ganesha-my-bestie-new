# Symbol Mountain & Shloka River — VO / Affirmation / Sidebar Content

Compiled from the live codebase (2026-09-24). Sources cited under each item.

---

## Symbol Mountain — 8 Symbols

### 1. Mooshika
- **Success VO** (spoken when Mooshika settles, before reveal): *"Mooshika stayed with it and made a little progress."*
  — [NewModakSceneV7.jsx:251](src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx) / `mooshikaFound` in [voiceGuidance.js:366](src/lib/config/content/voiceGuidance.js)
- **Final Mandala VO** (placed on Ganesha in Sacred Assembly finale): *"Mooshika. I can keep going, one small step at a time."*
  — `blessing` field, [SacredAssemblySceneV8.jsx:214](src/zones/symbol-mountain/scenes/final%20scene/SacredAssemblySceneV8.jsx) = `cardMooshika` in voiceGuidance.js:441
- **Affirmation:** *"I can keep going, one small step at a time."* — [discoveryContent.js:70](src/lib/config/content/discoveryContent.js), [symbolCardContent.js:50](src/zones/symbol-mountain/shared/components/symbolCardContent.js)
- **Sidebar content** ([symbolCardContent.js:47-58](src/zones/symbol-mountain/shared/components/symbolCardContent.js)):
  - Ganesha lines: "Do you know why I ride Mooshika? He may be small and restless, but steady little steps can carry big dreams."
  - Invitation: "Think of something big you want to do. What is one tiny step you could take today?"
  - Gift: "Small steps still move you forward."

### 2. Modak
- **Success VO** (on reaching Ganesha, just before reveal): *"You brought the garland to Ganesha — and look, a sweet Modak!"*
  — `MODAK_VO.carryStart`, [NewModakSceneV7.jsx:261](src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx)
- **Final Mandala VO:** *"Modak. I can learn, keep trying, and find joy."*
  — `blessing`, SacredAssemblySceneV8.jsx:175 = `cardModak`, voiceGuidance.js:431
- **Affirmation:** *"I can learn, keep trying, and find joy."* — discoveryContent.js:76, symbolCardContent.js:37
- **Sidebar content** (symbolCardContent.js:34-45):
  - Ganesha lines: "Do you know why I love Modak? Its sweetness reminds us of the joy that can come after learning and trying."
  - Invitation: "Think of something that was hard at first, but you kept trying. How did you feel when you finally did it?"
  - Gift: "Trying and learning can lead to something sweet."

### 3. Big Belly
- **Success VO:** *"You made it! All six flowers."*
  — `marshDone`, [FlowerJourneyGame2.jsx:97](src/zones/symbol-mountain/scenes/modak/FlowerJourneyGame2.jsx) — plays right before the Belly card reveal (correction: originally missed because it lives in the `FlowerJourneyGame2` sub-component, not the parent scene file)
- **Final Mandala VO:** *"Big Belly. I can have lots of feelings and keep going."*
  — `blessing`, SacredAssemblySceneV8.jsx:201 = `cardBelly`, voiceGuidance.js:437
- **Affirmation:** *"I can have lots of feelings and keep going."* — discoveryContent.js:82, symbolCardContent.js:63
- **Sidebar content** (symbolCardContent.js:60-71):
  - Ganesha lines: "My belly can hold a lot. Happy feelings and hard feelings can all be there."
  - Invitation: "Think of one hard feeling and one happy feeling you had today. Can you remember both?"
  - Gift: "You can have lots of feelings and still keep going."

### 4. Lotus
- **Success VO:** *"The lotus bloomed, even in the muddy pond."*
  — `lotusBloomed`, [PondSceneSimplifiedV4.jsx:122](src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx)
- **Final Mandala VO:** *"Lotus. I can keep growing when things are hard."*
  — `blessing`, SacredAssemblySceneV8.jsx:188 = `cardLotus`, voiceGuidance.js:434
- **Affirmation:** *"I can keep growing when things are hard."* — discoveryContent.js:90, symbolCardContent.js:76
- **Sidebar content** (symbolCardContent.js:73-84):
  - Ganesha lines: "The lotus grows up through muddy water. The mud doesn't stop it from rising and blooming."
  - Invitation: "Think of something hard you kept trying until you could do it. How did that feel?"
  - Gift: "Hard things can help you grow."

### 5. Trunk
- **Success VO:** *"The water reached the lotus."*
  — `trunkSuccess`, [PondSceneSimplifiedV4.jsx:116](src/zones/symbol-mountain/scenes/pond/PondSceneSimplifiedV4.jsx)
- **Final Mandala VO:** *"Trunk. I can be strong and gentle."*
  — `blessing`, SacredAssemblySceneV8.jsx:149 = `cardTrunk`, voiceGuidance.js:425
- **Affirmation:** *"I can be strong and gentle."* — discoveryContent.js:96, symbolCardContent.js:89
- **Sidebar content** (symbolCardContent.js:86-97):
  - Ganesha lines: "My trunk can lift something heavy… …and gently hold something tiny."
  - Invitation: "What would you hold with strong hands? What would you hold very gently?"
  - Gift: "You can choose when to be strong and when to be gentle."

### 6. Eyes
- **Success VO:** *"You looked closely and found them all."*
  — `eyesSetup`, [SymbolMountainSceneV3.jsx:91](src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx)
- **Final Mandala VO:** *"Eyes. I can focus on what matters."*
  — `blessing`, SacredAssemblySceneV8.jsx:123 = `cardEyes`, voiceGuidance.js:419
- **Affirmation:** *"I can focus on what matters."* — discoveryContent.js:104, symbolCardContent.js (eyesCard, line 10)
- **Sidebar content** (symbolCardContent.js:7-18):
  - Ganesha lines: "My eyes help me look carefully. They remind me to notice what is good, beautiful, and worth seeing."
  - Invitation: "Think of a time lots of things were happening. What did you need to focus on?"
  - Gift: "You can choose to notice something good."

### 7. Ears
- **Success VO:** *"You listened carefully and found every sound."*
  — `earsSetup`, [SymbolMountainSceneV3.jsx:92](src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx)
- **Final Mandala VO:** *"Ears. I can listen for what helps me."*
  — `blessing`, SacredAssemblySceneV8.jsx:136 = `cardEars`, voiceGuidance.js:422
- **Affirmation (RESOLVED 2026-09-24):** *"I can listen for what helps me."* — locked as canonical (matches the final-scene mandala/blessing text; more specific, ties to the child-life invitation, keeps Ears distinct from generic listening-skills content). *"I can listen with care."* (discoveryContent.js:110, symbolCardContent.js earCard:23) is now **legacy/superseded** — code still has the old string in those two files and needs updating to match.
- **Sidebar content** (symbolCardContent.js:20-31):
  - Ganesha lines: "My big ears are shaped like little filters. They remind me to listen carefully and notice the sounds and words worth keeping."
  - Invitation: "Think of a time you heard lots of things at once. Which voice or sound helped you?"
  - Gift: "Careful listening helps you notice more."

### 8. Tusk
- **Success VO:** *"You did it! All those little things helped rebuild the nest."*
  — [tuskNestFlow.json:1944](src/zones/symbol-mountain/scenes/tusk/tuskNestFlow.json), confirmed by matching `description` field at [SymbolMountainSceneV3.jsx:1126](src/zones/symbol-mountain/scenes/tusk/SymbolMountainSceneV3.jsx) (correction: originally missed because it lives in the beat-player JSON, not the scene JSX's inline VO map)
- **Final Mandala VO:** *"Tusk. I can use what I have for something important."*
  — `blessing`, SacredAssemblySceneV8.jsx:162 = `cardTusk`, voiceGuidance.js:428
- **Affirmation:** *"I can use what I have for something important."* — discoveryContent.js:116, symbolCardContent.js:108
- **Sidebar content** (symbolCardContent.js:105-116):
  - Ganesha lines: "Ganesha's tusk reminds us: even broken things can still help. Something broken, bent, torn, or short can still be useful for an important purpose."
  - Invitation: "Think of something old or broken. What could it still help with?"
  - Gift: "You can use what you have for something important."

---

## Shloka River — 8 Sanskrit Words

> Note: Shloka River's finale (`ShlokaRiverFinale.jsx`) is a recap/sorting game (word-boats), not a body-mandala like Symbol Mountain's. There is no per-word "blessing" placement line — instead each word has a **hint line** (used if the child struggles during the recap) plus generic scene VO (`arrangeStart`, `sceneComplete`, `finalCelebration`) and the word's real pre-recorded Sanskrit audio plays on placement. Hint lines are listed below as the closest equivalent.

### 1. Vakratunda
- **Success VO:** *"Vakratunda! You found another way and helped Frog reach his family."*
  — `scene10_vak_crossed`, [VakratundaGroveSimplified.jsx:404](src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx) = voiceGuidance.js:67
- **Finale hint (recap VO):** *"Remember Ganesha's curved trunk."* — `hintMeaningVakratunda`, voiceGuidance.js:321
- **Affirmation:** *"I can change my plan and try another way."* — [discoveryContent.js:127](src/lib/config/content/discoveryContent.js)
- **Sidebar content** ([chantCardContent.js:11-23](src/zones/shloka-river/shared/components/chantCardContent.js)):
  - Ganesha lines: "My trunk can bend and curve. It reminds me that I don't always have to keep going the same way."
  - Invitation: "Think of something that didn't go the way you planned. What is one different thing you could try?"
  - Gift: "When plans change, you can change with them."

### 2. Mahakaya
- **Success VO:** *"Mahakaay! You made space so everyone could come along."*
  — `scene10_maha_success`, VakratundaGroveSimplified.jsx:411 = voiceGuidance.js:88
- **Finale hint:** *"Think of Ganesha's great form."* — `hintMeaningMahakaya`, voiceGuidance.js:324
- **Affirmation:** *"I can make space in my heart for others."* — discoveryContent.js:133
- **Sidebar content** (chantCardContent.js:25-37):
  - Ganesha lines: "My great form can hold a lot. It reminds us that our hearts can always make space for someone else."
  - Invitation: "Think of someone you could make a little more space for today - in your game, your seat, or your turn."
  - Gift: "There is always room in your heart for one more."

### 3. Suryakoti
- **Success VO:** *"Suryakoti! You brought back the light and helped Bunny home."*
  — `scene11_surya_success`/`scene11_surya_done`, [SuryakotiBankSimplified.jsx:296-297](src/zones/shloka-river/scenes/Scene2/SuryakotiBankSimplified.jsx) = voiceGuidance.js:138
- **Finale hint:** *"Think of a light as bright as millions of suns."* — `hintMeaningSuryakoti`, voiceGuidance.js:327
- **Affirmation:** *"I can find hope inside me."* — discoveryContent.js:141
- **Sidebar content** (chantCardContent.js:39-51):
  - Ganesha lines: "My light shines like millions of suns. Even when things feel gloomy, there can still be a little hope inside you."
  - Invitation: "Think of a time something didn't go the way you wanted. What helped you feel that things could get better?"
  - Gift: "That little hope can help you keep going."

### 4. Samaprabha
- **Success VO:** *"Samaprabha! You looked closely and helped Deer feel safe."*
  — `scene11_sama_done`, SuryakotiBankSimplified.jsx:305 = voiceGuidance.js:141
- **Finale hint:** *"Think of steady, equal brightness."* — `hintMeaningSamaprabha`, voiceGuidance.js:330
- **Affirmation:** *"I can see what is really there."* — discoveryContent.js:147
- **Sidebar content** (chantCardContent.js:53-65):
  - Ganesha lines: "Samaprabha means a steady, even light. When something looks scary, looking carefully can help us see what is really there."
  - Invitation: "Think of something that looked scary at first. What did you notice when you looked again?"
  - Gift: "Looking carefully can help you see past the fear."

### 5. Nirvighnam
- **Success VO:** *"Nirvighnam! You cleared the way and helped Turtle through."*
  — `nirv_done`/`scene12NirvDone`, [NirvighnamChantSimplified.jsx:296](src/zones/shloka-river/scenes/Scene3/NirvighnamChantSimplified.jsx) = voiceGuidance.js:165
- **Finale hint:** *"Remember the word about clearing obstacles."* — `hintMeaningNirvighnam`, voiceGuidance.js:333
- **Affirmation:** *"I can solve one thing at a time."* — discoveryContent.js:155
- **Sidebar content** (chantCardContent.js:67-79):
  - Ganesha lines: "Sometimes a problem can feel like a lot. But we can take it one small part at a time."
  - Invitation: "Think of something that feels hard. What is one small part you could do first?"
  - Gift: "One small step at a time can help you move forward."

### 6. Kurumedeva
- **Success VO:** *"Kuru Me Deva! You asked for help and finished the bridge."*
  — `kuru_done`/`scene12KuruDone`, NirvighnamChantSimplified.jsx:312 = voiceGuidance.js:168
- **Finale hint:** *"Remember the words that ask for help."* — `hintMeaningKurumedeva`, voiceGuidance.js:336
- **Affirmation:** *"I can ask for help when I need it."* — discoveryContent.js:161
- **Sidebar content** (chantCardContent.js:81-93):
  - Ganesha lines: "Everyone needs help sometimes. When something is too hard to do alone, we can ask someone to help."
  - Invitation: "Think of something that feels too hard to do alone. Who could you ask for help?"
  - Gift: "You don't have to do everything by yourself."

### 7. Sarvakaryeshu
- **Success VO:** *"Sarvakaryeshu! You chose a Ganesha symbol for each task."*
  — `scene13_success`, [SarvakaryeshuChantSimplified.jsx:311](src/zones/shloka-river/scenes/scene4/SarvakaryeshuChantSimplified.jsx)
- **Finale hint:** *"Think of the word for everything we do."* — `hintMeaningSarvakaryeshu`, voiceGuidance.js:339
- **Affirmation:** *"I can remember Ganesha in everything I do."* — discoveryContent.js:169
- **Sidebar content** (chantCardContent.js:95-107):
  - Ganesha lines: "Every day is full of different things to do. Playing, learning, helping, trying - you can remember me in all of them."
  - Invitation: "Think of something you'll do today. Can you remember Ganesha while you do it?"
  - Gift: "You can carry Ganesha with you into everything you do."

### 8. Sarvada
- **Success VO:** *"Sarvada! You found Ganesha through the whole day."*
  — `scene14_success`, SarvakaryeshuChantSimplified.jsx:317 = voiceGuidance.js:294
- **Finale hint:** *"Remember the word that means always."* — `hintMeaningSarvada`, voiceGuidance.js:342
- **Affirmation:** *"Ganesha is always with me."* — discoveryContent.js:175
- **Sidebar content** (chantCardContent.js:109-121):
  - Ganesha lines: "Sarvada means always. Morning, afternoon and night - I am with you through it all."
  - Invitation: "Think of one part of your day - morning, afternoon, or night. Can you imagine Ganesha there with you?"
  - Gift: "Wherever you are in your day, you can remember I am with you."

---

## Sources
- Success VO: in-scene `MODAK_VO`/`webSpeechMap` objects (the code actually calling `playVoice`/`speak`), cross-checked against `src/lib/config/content/voiceGuidance.js`; Belly and Tusk corrected against `FlowerJourneyGame2.jsx` and `tuskNestFlow.json` respectively (sub-component/beat-player files missed in the first pass)
- Final mandala VO: `blessing` field in [SacredAssemblySceneV8.jsx](src/zones/symbol-mountain/scenes/final%20scene/SacredAssemblySceneV8.jsx) (Symbol Mountain); hint lines in [ShlokaRiverFinale.jsx](src/zones/shloka-river/scenes/scene5/ShlokaRiverFinale.jsx) (Shloka River, no true mandala equivalent)
- Affirmation: [discoveryContent.js](src/lib/config/content/discoveryContent.js)
- Sidebar content: [symbolCardContent.js](src/zones/symbol-mountain/shared/components/symbolCardContent.js) (Symbol Mountain), [chantCardContent.js](src/zones/shloka-river/shared/components/chantCardContent.js) (Shloka River)
