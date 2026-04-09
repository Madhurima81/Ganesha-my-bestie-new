# Voice Over Script — All Scenes
## Ganesha My Bestie

Master VO file for all 22 scenes. Currently includes VO for scenes with finalized scripts.

---

## SCENE 01 — MODAK (Symbol Mountain)

<!--
OLD CONTENT — Pre-recorded MP3 (Updated 2026-04-06)
**Type:** Pre-recorded MP3 | **Status:** Provided by Madhurima

### Opening (Modal Load)
```
"Let's share the mo-dahks."
```

### Phase 1 — Find Mooshika
```
"Can you find Mooshika?"
"You found my friend Mooshika."
"I can focus..."
```

### Phase 2 — Collect the Modaks
```
"Let's collect three mo-dahks."
"I share with joy..."
```

### Phase 3 — Feed Ganesha
```
"Bring the mo-dahks to me."
"I feel... safe inside."
```

### Scene Complete
```
"You focused... and you shared. I am proud of you."
```
-->

---

**Type:** Web Speech API (TTS) | **Status:** FINALIZED

### Opening Modal
```js
opening: "Mooshika is nearby…
Let's find the sweet modaks together."
```

### Phase 1 — Find Mooshika

**Start:**
```js
phase1Start: "Mooshika is hiding under one of these mounds.
Tap a mound and let's look."
```

**When Mooshika is found:**
```js
mooshikaFound: "You found my friend Mooshika!"
```

**Symbol Card — Mooshika:**
```js
mooshikaSymbol: "Mooshika helps me look closely."
```

### Phase 2 — Collect the Modaks

**Start:**
```js
phase2Start: "Look! Sweet modaks.
Tap the modaks and place them in the basket."
```

**When all three collected:**
```js
modaksCollected: "Wonderful… we found them all."
```

**Symbol Card — Modak:**
```js
modakSymbol: "After effort… comes something sweet."
```

### Phase 3 — Feed Ganesha

**Start:**
```js
phase3Start: "Now drag the modaks to me."
```

**When modak reaches Ganesha:**
```js
modakFed: "Ahh… thank you."
```

**Symbol Card — Belly:**
```js
bellySymbol: "My belly stays calm, no matter what."
```

### Scene Complete
```js
complete: "You helped Mooshika find the modaks…
and shared them with me."
```

---

## SCENE 02 — POND (Symbol Mountain)

<!--
OLD CONTENT — Extracted from PondSceneSimplifiedV4.jsx (Updated 2026-04-06)
**Type:** Web Speech API (TTS)

### Opening (Modal Load)
opening: "My pond is ready. Let's bloom it together."

### Phase 1 — Bloom the Lotuses
lotusRound: "My lotus helps me stay calm. Tap the lotuses."

### Idle Hints (Phase 1)
idleLotus: "Look carefully at the lotuses."

### Phase 2 — Tap the Golden Lotus
goldenLotus: "Beautiful. Now tap my golden lotus."

### Idle Hints (Phase 2)
idleGolden: "Look for the golden lotus."

### Phase 3 — Tap Ganesha's Elephant
elephant: "Tap me. My trunk is ready to awaken."
trunkRound: "My trunk is strong and helps me. Tap to reveal it."

### Idle Hints (Phase 3)
idleElephant: "Tap me to continue."

### Scene Complete
complete: "You found my lotus and my trunk. Now I am shining with you."
-->

---

**Type:** Web Speech API (TTS) | **Status:** FINALIZED

### Opening Modal
```js
opening: "A golden lotus bud is waiting in this pond.
Let's help it bloom."
```

### Phase 1 — Bloom the Lotuses

**Start:**
```js
phase1Start: "These lotus flowers are still sleeping.
Tap the lotuses to help them bloom."
```

**When all three bloom:**
```js
lotusesReady: "Beautiful… the pond is ready."
```

**Symbol Card — Lotus:**
```js
lotusSymbol: "Like the lotus… we can stay calm."
```

### Phase 2 — Golden Lotus Appears
```js
goldenLotusAppears: "Look… the golden lotus bud.
Tap it."
```

### Phase 3 — Elephant Appears
```js
elephantAppears: "Can you see the elephant?
Tap it."
```

### Golden Lotus Bloom Moment
```js
goldenLotusBloom: "Ahh… the golden lotus has bloomed."
```

**Symbol Card — Trunk:**
```js
trunkSymbol: "My trunk bends… and finds a way."
```

### Scene Complete
```js
complete: "You helped the golden lotus bloom.

Come… the path ahead is shining."
```

---

## SCENE 03 — SYMBOL MOUNTAIN / TUSK (Symbol Mountain)
**Type:** Web Speech API (TTS) | **Status:** Extracted from `SymbolMountainSceneV3.jsx`

### Opening (Modal Load)
```
opening: "My symbols are ready. Let's discover them together."
```

### Phase 1 — Eyes Game
```
eyes: "My big eyes see everything. Tap my eyes."
```

### Idle Hints (Phase 1)
```
idleEyes: "Look carefully at my eyes."
```

### Phase 2 — Ears Game
```
ears: "My big ears hear everything. Tap my ears and match the rhythm."
```

### Idle Hints (Phase 2)
```
idleEars: "Listen carefully to my ears."
```

### Phase 3 — Tusk Game
```
tusk: "My tusk helps me stay brave. Tap the golden notes."
```

### Idle Hints (Phase 3)
```
idleTusk: "Look carefully at the golden notes."
```

### Scene Complete
```
complete: "You found my eyes, ears, and tusk. Now I am shining with you."
```

---

## SCENE 10 — VAKRATUNDA GROVE (Shloka River)
**Type:** Web Speech API (TTS) | **Status:** Provided by Madhurima

### Opening (Modal Load)
```
"Let's grow something beautiful together."
```

### Gameplay Progression
```
"Look! A petal opened."
"The lotus is blooming."
"Wonderful!"
```

### Symbol Reveal — Vakratunda Power
```
"Vakratunda... I am flexible."
```

### Mahakaya Introduction / Next Phase
```
"Now let's grow something even bigger."
"Look! It sprouted."
"It's growing strong."
"Amazing!"
```

### Symbol Reveal — Mahakaya Power
```
"Mahakaya… I am strong."
```

---

## SCENE 04 — SACRED ASSEMBLY / FINAL SCENE (Symbol Mountain)
**Type:** TBD | **Status:** No VOICE_LINES extracted yet
- Opening modal shows all previous symbols
- Child arranges/places symbols
- Final celebration VO TBD

---

## SCENE 20 — FAVORITE FOOD (About Me Hut)
**Type:** Web Speech API (TTS) | **Status:** Extracted from `Favoritefoodgame.jsx`

### Opening (Modal Load)
```
opening: "Let's discover our favorite things."
```

### PART 1 — GANESHA'S FAVORITES

#### Ganesha's Food
```
foodQuestion: "Hmm... can you guess my favourite food?"
foodCorrect: "Yes! Modak is my favourite. Sweet and yummy!"
```

#### Idle Hint (Food)
```
foodHint: "My favourite sweet looks like a little mountain."
```

#### Ganesha's Color
```
colorQuestion: "Can you guess my favourite color?"
colorCorrect: "Yes! Yellow is my favourite color, bright like the sun!"
```

#### Idle Hint (Color)
```
colorHint: "My favourite color shines like the bright sun."
```

#### Ganesha's Activity
```
activityQuestion: "Can you guess my favourite activity?"
activityCorrect: "Yes! I love to dance. It makes me so happy!"
```

#### Idle Hint (Activity)
```
activityHint: "My favourite activity is when my feet move to music."
```

#### Ganesha's Best Friend
```
friendQuestion: "Can you guess who my best friend is?"
friendCorrect: "Yes! Mooshika is my little mouse friend!"
```

#### Idle Hint (Friend)
```
friendHint: "My tiny friend scurries very fast."
```

### PART 2 — TRANSITION TO CHILD

```
childIntro: "Now it's time to learn about YOU! Let's find out what makes you special."
```

### CHILD'S FAVORITES

#### Child's Food
```
childFoodQuestion: "What's your favorite food?"
childFoodCorrect: "Mmm! That sounds yummy!"
```

#### Child's Color
```
childColorQuestion: "What's your favorite color?"
childColorCorrect: "That's a beautiful color!"
childColorMatch: "Wow! We both love yellow!"
```

#### Child's Activity
```
childActivityQuestion: "What do you love to do?"
childActivityCorrect: "That sounds like fun!"
childActivityMatch: "Haha! We both love dancing!"
```

#### Child's Best Friend
```
childFriendQuestion: "Who is your best friend?"
childFriendCorrect: "What a wonderful friend to have!"
```

### Scene Connection Moment
```
friendCelebration: "Now we know each other better. I'm happy we're friends!"
```

---

## SCENE 21 — DREAMS & WISHES / OBSTACLE REMOVER (About Me Hut)
**Type:** TBD | **Status:** Extracted from `VO_SCRIPT_dream-big-together.md` (markdown only, not code)

### Opening (Modal Load)
```
"Let's discover... how to make our wishes come true!"
```

### PART 1 — GANESHA REMOVES OBSTACLES

#### Wish 1 — Earth (Happiness)
```
Setup:      "Look at the Earth... It's sad because it needs care."
Action:     "Can you tap... to bring happiness back?"
Celebration: "Yes! ... The Earth is smiling! When we care for nature... happiness grows."
```

#### Wish 2 — Sharing (Abundance)
```
Setup:      "The bowl is empty... It needs to be filled with sharing."
Action:     "Can you tap... to fill it with kindness?"
Celebration: "Yes! ... The bowl is full! When we share... there is enough for everyone."
```

#### Wish 3 — Growth (Beauty)
```
Setup:      "The flower is sleeping... It wants to bloom... but something is blocking it."
Action:     "Can you tap... to help it grow?"
Celebration: "Yes! ... It's blooming! When we help things grow... the world becomes beautiful."
```

### PART 2 — CHILD'S DREAM

```
Transition:    "Do you see... what just happened? You removed obstacles... And made wishes come true! Now... it's time for YOUR dream."

Intro:         "I want to show you something... We all have dreams inside us. Draw your dream here... What do you wish for?"

Clouded:       "Beautiful! But... clouds are covering your dream. Obstacles hide our dreams sometimes. Can you... remove the clouds?"

Clearing:      "Keep going! ... Tap... tap... tap!"

Revealed:      "There it is! ... YOUR dream! Obstacles cannot stop... what you believe in!"

Connection:    "Your dream... my dreams... We dream big together! And I believe... your dream will come true."
```

### Scene Complete
```
"You learned something powerful today... You can remove obstacles. Keep dreaming, little one. I will be with you."
```

---

## SCENES TBD — NO VO EXTRACTED YET

- **Scene 05–09:** Cave of Secrets (Vakratunda, Suryakoti, Nirvighnam, Sarvakaryeshu, Finale)
- **Scene 10–14:** Shloka River (Vakratunda Grove, Suryakoti Bank, Nirvighnam, Sarvakaryeshu, Finale)
- **Scene 15–19:** Festival Square + About Me Hut (Name & Birthday)
- **Scene 22:** Name & Birthday (Personalized completion only)

---

## SUMMARY

| Scene | Zone | Title | Type | Status |
|-------|------|-------|------|--------|
| 01 | Symbol Mountain | Modak | MP3 | ✅ Provided |
| 02 | Symbol Mountain | Pond | TTS | ✅ Extracted |
| 03 | Symbol Mountain | Symbol/Tusk | TTS | ✅ Extracted |
| 04 | Symbol Mountain | Sacred Assembly | TBD | ⏳ TBD |
| 05–09 | Cave of Secrets | Various | TBD | ⏳ TBD |
| 10–14 | Shloka River | Chants | TBD | ⏳ TBD |
| 15–19 | Festival Square | Games | TBD | ⏳ TBD |
| 20 | About Me Hut | Favorite Food | TTS | ✅ Extracted |
| 21 | About Me Hut | Dreams & Wishes | TBD | ⏳ Script drafted |
| 22 | About Me Hut | Name & Birthday | Personalized | ⏳ TBD |

---

**Next:** Finalize VO for remaining scenes (4, 5–19, 22) and update both master files.
