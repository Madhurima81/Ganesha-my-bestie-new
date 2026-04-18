# About Me Hut — Scene 20 & 21 Additional Checklist Sections

---

## SCENE 20 — FAVORITE FOOD (Favoritefoodgame.jsx)

### 20E · CORE MECHANICS
- [ ] Circle tap → Opens choice modal for that slot
- [ ] Correct food choice → Sparkle + VO, advances to food-correct phase
- [ ] Wrong food choice → Gentle wiggle, user can retry, no progress lost
- [ ] Color choice sequence → After food correct, child selects favorite color
- [ ] Activity choice sequence → After color correct, child selects favorite activity
- [ ] Friend/animal choice sequence → After activity correct, child selects best friend
- [ ] child-intro transition → All 4 Ganesha phases complete → transition to child section
- [ ] Child food selection → Child picks from 7 food options, advance enabled
- [ ] Child color selection → Child picks favorite color, auto-advance to child-activity-choice
- [ ] Child activity selection → Child picks favorite activity, auto-advance to child-friend-input
- [ ] Friend name input → Child types best friend name, name persists to comparison card
- [ ] friend-celebration auto-advance → 2s celebration → auto-advance to comparison-card
- [ ] Comparison card shows → Ganesha's 4 favorites + Child's 4 favorites displayed side-by-side
- [ ] Completion → comparison-card complete → SceneCompletionCelebration, ProgressManager called

### 20F · VOICE & VO CHECKLIST
- [ ] Intro / opening modal VO → Scene opens with greeting
- [ ] Food phase entry VO → "Hmm... can you guess my favourite food?" + "Tap the one you think I love."
- [ ] Food correct VO → "Yes! Modak is my favourite. Sweet and yummy!"
- [ ] Color phase entry VO → "Can you guess my favourite color?"
- [ ] Color correct VO → "Yes! Yellow is my favourite color, bright like the sun!"
- [ ] Activity phase entry VO → "Can you guess my favourite activity?"
- [ ] Activity correct VO → "Yes! I love to dance. It makes me so happy!"
- [ ] Friend phase entry VO → "Can you guess who my best friend is?"
- [ ] Friend correct VO → "Yes! Mooshika is my little mouse friend!"
- [ ] Transition VO → "Now let's discover your favorite things! It's your turn. Tell me what makes you special."
- [ ] Child food entry VO → "What's your favorite food?"
- [ ] Child color entry VO → "What's your favorite color?"
- [ ] Child activity entry VO → "What do you love to do?"
- [ ] Child friend entry VO → "Who is your best friend?"
- [ ] Comparison card VO → "Now we know each other better. I'm happy we're friends!"
- [ ] Idle hint VO (Ganesha phases) → 4 phase-specific hints at 27s
- [ ] Return hint VO → Tab return in any phase — contextual to phase
- [ ] Tap SFX → All card taps — consistent, not clipping
- [ ] Sparkle SFX → Correct choices + friend-celebration
- [ ] **Audio toggle OFF → Any VO playing — All stop immediately — BLOCKER**

### 20G · VISUAL ASSETS CHECKLIST
- [ ] Background (fav_background.jpg) — No 404, full viewport
- [ ] Ganesha food cards (modak, ladoo, barfi) — All load, visible
- [ ] Child food cards (pizza, burger, icecream, noodles, fruit, dosa, rice) — All 7 load
- [ ] Color options (red, orange, yellow, green, blue, purple, pink, brown) — All 8 load
- [ ] Activity icons (drawing, music, reading, playing, TV, dancing) — All 6 load
- [ ] Friend animals (mouse, cow, peacock) — All 3 load
- [ ] Baby Ganesha SVG — Loads from shared path, correct size
- [ ] Opening modal image — Scene-appropriate, no 404
- [ ] Completion modal icons (food, color, activity) — All load
- [ ] Sparkle/confetti layer — Renders above gameplay, celebratory

---

## SCENE 21 — DREAMS & WISHES (ObstacleRemoverGame.jsx)

### 21E · CORE MECHANICS
- [ ] wish1-intro VO plays → Sets context for wish 1 (kindness)
- [ ] **wish1-active bubble spawning → Bubbles appear with kind/unkind action images**
- [ ] **Bubble tap (kind action) → Removes bubble, increments counter, sparkle plays**
- [ ] **Bubble tap (unkind action) → No removal, gentle shake feedback, VO nudge**
- [ ] wish1 counter threshold → 4+ kind bubbles tapped → wish1-complete phase
- [ ] wish1-complete celebration → Earth transitions from sad to happy state
- [ ] Auto-transition to wish2 → 2-3s after wish1-complete
- [ ] wish2-intro context → Sets up food-sharing mechanic
- [ ] **wish2-active drag/drop → Drag food items from top to plates below**
- [ ] **Plate collision detection → Food placed on plate = accepted, sparkle SFX**
- [ ] **Wrong placement → Food returns to original position, gentle feedback**
- [ ] wish2 complete condition → All bowls full (all bowlStates === true)
- [ ] wish2-complete celebration → Bowls transform, satisfied VO
- [ ] Auto-transition to wish3 → 2-3s after wish2-complete
- [ ] wish3-intro context → Sets up forest-growth mechanic
- [ ] **wish3-active spot tapping → Child taps forest spots to reveal nature elements**
- [ ] **Each spot reveal → Grass, butterfly, slide appear with sparkle**
- [ ] wish3 complete condition → All 3 spots revealed (parkStates all true)
- [ ] wish3-complete celebration → Forest full of life, VO praise
- [ ] Auto-transition to all-wishes-complete → No separate dream-intro phase (T40)
- [ ] dream-drawing phase → Child draws wish on canvas
- [ ] dream-clouded phase → Child taps trunk to clear clouds covering dream
- [ ] **Trunk tap counter → Increments, clouds fade progressively**
- [ ] dream-clearing animation → Clouds dissolve, dream becoming visible
- [ ] dream-revealed state → Dream fully visible, celebratory VO
- [ ] Comparison card → Wishes + dream shown side-by-side
- [ ] Completion → All phases done → SceneCompletionCelebration, ProgressManager called

### 21F · VOICE & VO CHECKLIST
- [ ] Intro / opening modal VO → "Let's discover my dreams and yours."
- [ ] wish1-intro VO → "I have three giant wishes for the whole world! Will you help me make them come true?"
- [ ] wish1-active entry VO → "My wish is for a kinder world. Tap the bubbles that show kind actions!"
- [ ] wish1-complete VO → "The Earth is smiling. Thank you for helping the world."
- [ ] wish2-intro VO → "My second wish… is to share our food. So no one stays hungry."
- [ ] wish2-active entry VO → "My next wish is to share our food. Drag the food to the plates so everyone can eat."
- [ ] wish2-complete VO → "Wonderful! The bowls are full. Sharing makes everyone happy."
- [ ] wish3-intro VO → "My last wish… is for a green world full of life. Let's help this forest grow!"
- [ ] wish3-active entry VO → "My last wish is for a green world. Tap the spots on the land and help the garden grow."
- [ ] wish3-complete VO → "Wow! The forest is full of life. You helped nature grow."
- [ ] all-wishes-complete transition VO → "You made the world brighter. Now it's your turn. Draw your happy wish."
- [ ] dream-drawing prompt VO → "What would you draw?"
- [ ] dream-clouded entry VO → "Your dream is beautiful… but clouds are hiding it. Tap my trunk to clear them."
- [ ] dream-clearing nudge VO → "Keep tapping my trunk to clear the clouds!"
- [ ] dream-revealed VO → "There it is… your dream. Dream big, little friend. I believe in you."
- [ ] Comparison card VO → "My wishes… and your dream… When we help each other… dreams grow stronger."
- [ ] Ending VO → "Dream big, little friend. I'm always cheering for you."
- [ ] Return hint VO → Tab return in any phase — contextual to phase
- [ ] Idle hint VO (wish phases) → Contextual nudge at 15s+ idle
- [ ] Tap SFX → All bubble/spot taps — consistent, celebratory tone
- [ ] Sparkle SFX → Correct actions, kind bubbles, forest reveals
- [ ] **Audio toggle OFF → Any VO playing — All stop immediately — BLOCKER**

### 21G · VISUAL ASSETS CHECKLIST
- [ ] Background (dream_background.jpg) — No 404, full viewport
- [ ] wish1-active bubble images → Kind actions (helping, sharing, hugging, gifting) + Unkind actions (angry, fighting, hitting, teasing) — All 8 load
- [ ] wish1 Earth states → wish-earth-sad, wish-earth-happy — Both load, transition smooth
- [ ] wish2-active food items (7 total) → apple, banana, bread, broccoli, carrot, milk, rice — All draggable, visible
- [ ] wish2 bowl/plate states → wish-bowl-empty, wish-bowl-full, plate — All load, collision zones visible
- [ ] wish3-active forest states (4 backgrounds) → wish-forest-1, wish-forest-2, wish-forest-3, wish-forest-4 — All load, correct scale
- [ ] wish3 nature element icons → Grass, butterfly, slide — All load, appear on tap
- [ ] Wish phase icons → wish-icon-earth, wish-icon-flower, wish-icon-share, heart-icon, shootingstar-icon, world-icon — All 6 load
- [ ] Companion animals (mouse, cow, peacock) — All load, correct size
- [ ] Ganesha assets → babyGaneshaImg, babyGaneshaSit, cloud image — All load
- [ ] Drawing canvas → Renders correctly, no lag on draw events
- [ ] Sparkle/confetti layer → Renders above gameplay, celebratory

---

**Total Checks Added:**
- Scene 20: 43 checks (14 + 19 + 10)
- Scene 21: 57 checks (25 + 20 + 12)
- **Combined: 100 production checklist items**
