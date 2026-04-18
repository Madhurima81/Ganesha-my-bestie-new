# SCENE 22 — MY INDIAN STORY (MyIndianStoryGame.jsx)

## Production Freeze Checklist
**Date:** 2026-04-17  
**Scene:** My Indian Story (Scene 22 — About Me Hut, Zone 5)  
**Status:** Ready for Production Freeze Verification  
**Scope:** All 9 phases, idle hints, VO system, assets, reload/tab switch handling

---

## 22A · PHASES — All 9 Phases with Entry/Exit Conditions & Reload Scenarios

### Phase Sequence Map
```
opening 
  → ganesha_home (discover 3 locations via magnifying glass drag)
  → child_home (select 1 of 8 region options)
  → language_ganesha (guess Ganesha's language: Sanskrit)
  → language_child (select 1–3 languages from 12-card grid)
  → festivals_ganesha (guess Ganesha's festival: Ganesh Chaturthi)
  → festivals_child (select 1–4 festivals from 12-card grid)
  → origin_card (story comparison card displayed)
  → complete (completion celebration + next scene)
```

### Opening Phase
- [ ] **Entry:** Scene mounts → Opening modal appears immediately
- [ ] **Exit:** "Start" button tapped → clears modal, advances to ganesha_home
- [ ] **Reload in opening:** No resume popup — opening modal shows fresh
- [ ] **Content:** Ganesha 1st person greeting, explains mechanic, age 5–12 language
- [ ] **VO:** Opening VO plays once ("Let's explore my Indian story and yours!")
- [ ] **Tab switch:** Modal remains visible on return

### Ganesha Home Phase (Phase 1)
- [ ] **Entry:** opening phase complete → SceneManager updates phase to ganesha_home
- [ ] **Mechanics:** Child drags magnifying glass over India map to discover 3 spots (Varanasi, Mumbai, Tamil Nadu)
- [ ] **Discovery behavior:** 
  - [ ] Proximity detection: when magnifying glass position within 7% of spot (x/y), location discovered
  - [ ] Each discovery: sparkle SFX + location VO (e.g., "Varanasi", "Mumbai") + mini gesture animation
  - [ ] Active spot fact displayed below map (real-time as dragging over spots)
  - [ ] Discovered location icon appears on map with popIn animation
- [ ] **Exit condition:** All 3 locations discovered → 1.5s delay → celebration (sparkle + hearts float) → "You found all my hiding places! I am everywhere in India!" VO → advance to child_home
- [ ] **Reload in ganesha_home (1/3 discovered):** 
  - [ ] 3s resume countdown appears
  - [ ] Discovered locations preserved and visible on map
  - [ ] Idle hint state reset (ganeshaHomeIdleLevel = 0)
  - [ ] Can resume dragging magnifying glass
- [ ] **Reload in ganesha_home (all 3 discovered, celebration showing):**
  - [ ] 3s countdown → resumes in ganesha_home
  - [ ] Celebration re-triggers with hearts + sparkle + VO
  - [ ] 6s total → auto-advances to child_home
- [ ] **Idle hints:** Implemented (see Section 22E)
- [ ] **Tab switch:** 
  - [ ] VO stops immediately
  - [ ] Magnifying glass position preserved (no reset)
  - [ ] Idle hint level reset
  - [ ] On return: return hint VO plays ("Drag the magnifying glass to find my special places!")

### Child Home Phase (Phase 2)
- [ ] **Entry:** ganesha_home complete → child_home phase → immediate VO "Now tell me where is your home in India? Tap the place where your family lives."
- [ ] **Mechanics:** Child taps one of 8 region buttons on India map OR "Outside India" option
  - [ ] 7 region cards: North, West, Central, East, Northeast, South + Kailash
  - [ ] Selected region highlights (border + background color change) + scale up
  - [ ] Region label VO played (e.g., "North India", "West India")
- [ ] **Kailash special handling:** 
  - [ ] If Kailash selected → special reaction VO: "KAILASH?! That's where my Amma and Appa live! But where does YOUR family live on Earth?"
  - [ ] Kailash treated as region selection (can proceed with it)
  - [ ] Continue button enables 900ms after selection
- [ ] **Outside India option:**
  - [ ] Positioned below main map
  - [ ] Tappable and selectable like region cards
  - [ ] VO: "Outside India"
- [ ] **Exit condition:** Region selected → 900ms delay → Continue button enabled → Continue tapped → advance to language_ganesha
- [ ] **Reload in child_home (no region selected):**
  - [ ] 3s countdown → resumes in child_home
  - [ ] No region pre-selected (clean slate)
  - [ ] Return hint VO plays
- [ ] **Reload in child_home (region pre-selected):**
  - [ ] 3s countdown → resumes with region highlighted and selected state visible
  - [ ] Continue button enabled
- [ ] **Tab switch:** Selection preserved, return hint VO plays

### Language Ganesha Phase (Phase 3)
- [ ] **Entry:** child_home complete → immediate VO: "Can you guess my language? Tap play to listen… then tap the correct card!"
- [ ] **Mechanics:** 
  - [ ] Large circular play button (400×400px) animates with pulse
  - [ ] Tap play → VO speaks "Vakratunda Mahakaya Suryakoti Samaprabha!" (Sanskrit mantra)
  - [ ] Below play button: 2×2 grid of 4 language cards (Hindi, Tamil, Sanskrit, Telugu)
  - [ ] Card styling: gold border, white background, icon + label + script
- [ ] **Guess handling:**
  - [ ] Correct guess (Sanskrit): 
    - [ ] guessPhase = "correct"
    - [ ] playSparkle() + mini gesture
    - [ ] playChime()
    - [ ] VO: "Yes! That's Sanskrit — the language of mantras and shlokas."
    - [ ] 3s delay → guessPhase = "revealed" → phase advances to language_child
  - [ ] Wrong guess (any other):
    - [ ] wrongLangGuesses Set adds language ID
    - [ ] Card shake animation (250ms)
    - [ ] Card opacity → 0.5, grayscale filter applied
    - [ ] Card disabled (cursor: not-allowed)
    - [ ] VO plays language name (e.g., "Hindi", "Tamil")
    - [ ] Retry allowed
- [ ] **Exit condition:** Correct guess → 3s delay → advance to language_child
- [ ] **Reload in language_ganesha (1 wrong guess made):**
  - [ ] 3s countdown
  - [ ] guessPhase reset to "guessing"
  - [ ] wrongLangGuesses cleared (all cards re-enabled)
  - [ ] shakeLang cleared
- [ ] **Idle hints:** langGuessIdleLevel 0→1→2→3 with cards wobble + VO + pointing emoji (see 22E)
- [ ] **Tab switch:** 
  - [ ] guessPhase + wrongLangGuesses state preserved
  - [ ] shakeLang cleared (no residual shake)
  - [ ] Return hint VO: "Tap play and choose the correct language card."

### Language Child Phase (Phase 4)
- [ ] **Entry:** language_ganesha correct → immediate VO: "Which language does your family speak at home? Tap the cards to choose."
- [ ] **Mechanics:**
  - [ ] Grid layout: "Most Spoken At Home" (4 cards: Hindi, English, Tamil, Marathi) + "More Languages" (8 cards: Gujarati, Bengali, Kannada, Malayalam, Punjabi, Telugu, Sanskrit, Other)
  - [ ] Child selects up to 3 languages
  - [ ] On tap: lang toggle → add/remove from selectedLanguages array
  - [ ] Selected card styling: gold border, light background, checkmark in top-right
  - [ ] Selection counter: "Pick up to 3 languages. X of 3 selected"
  - [ ] Continue button enables once ≥1 language selected
- [ ] **Cap enforcement:**
  - [ ] If selectedLanguages.length >= 3 and new tap on unselected card:
    - [ ] Tap ignored OR card opacity = 0.6, cursor = not-allowed
  - [ ] Clear visual feedback when limit reached
- [ ] **Exit condition:** Continue button tapped → VO "Wonderful! These are the languages your family speaks." → playUiTap() → safeSetTimeout 2s → advance to festivals_ganesha
- [ ] **Reload in language_child (1 language selected):**
  - [ ] 3s countdown
  - [ ] selectedLanguages restored and visible (card checkmarks appear)
  - [ ] Continue button enabled
- [ ] **Reload in language_child (no selection):**
  - [ ] 3s countdown
  - [ ] Empty state, Continue disabled
- [ ] **Tab switch:** Selections preserved, return hint VO plays

### Festivals Ganesha Phase (Phase 5)
- [ ] **Entry:** language_child complete → immediate VO: "I have a favourite festival! Can you guess which one?"
- [ ] **Mechanics:**
  - [ ] Grid of 5 festival cards (2 top row centered, 3 bottom row centered):
    - [ ] Pongal, Holi (top)
    - [ ] Janmashtami, Ganesh Chaturthi (correct), Diwali (bottom)
  - [ ] Each card: large icon (220×220px), borders, white background
- [ ] **Guess handling:**
  - [ ] Correct guess (Ganesh Chaturthi):
    - [ ] guessPhase = "correct"
    - [ ] Card highlight: gold border + light background + scale(1.05)
    - [ ] playSparkle() + triggerMiniGesture()
    - [ ] playChime()
    - [ ] VO: "Yes! Ganesh Chaturthi is my favorite festival!"
    - [ ] 3s delay → guessPhase = "revealed" → phase advances to festivals_child
  - [ ] Wrong guess (any other):
    - [ ] wrongGuesses Set adds festival ID
    - [ ] Card shake, opacity 0.3, grayscale filter
    - [ ] Card disabled
    - [ ] VO plays festival label (e.g., "Pongal", "Holi")
    - [ ] Retry allowed
- [ ] **Exit condition:** Correct guess → 3s delay → advance to festivals_child
- [ ] **Reload in festivals_ganesha (no wrong guesses):**
  - [ ] 3s countdown → resumes in festivals_ganesha
  - [ ] guessPhase reset to "guessing"
  - [ ] wrongGuesses cleared
- [ ] **Idle hints:** festGuessIdleLevel 0→1→2→3 with cards wobble + VO + pointing emoji (see 22E)
- [ ] **Tab switch:** 
  - [ ] guessPhase + wrongGuesses state preserved
  - [ ] Return hint VO: "Tap my favourite festival card."

### Festivals Child Phase (Phase 6)
- [ ] **Entry:** festivals_ganesha correct → immediate VO: "Wonderful! Which festivals does your family celebrate?"
- [ ] **Mechanics:**
  - [ ] Grid layout: "Common Festivals" (4 cards: Diwali, Holi, Ganesh Chaturthi, Navratri) + "Other Festivals" (8 cards: Pongal, Onam, Janmashtami, Durga Puja, Dussehra, Eid, Christmas, Rakhi)
  - [ ] Child selects up to 4 festivals
  - [ ] On tap: festival toggle → add/remove from selectedFestivals
  - [ ] Selected card styling: gold border, light background, checkmark
  - [ ] Selection counter: "Pick up to 4 festivals. X of 4 selected"
  - [ ] Continue button enables once ≥1 festival selected
- [ ] **Cap enforcement:**
  - [ ] If selectedFestivals.length >= 4 and new tap on unselected:
    - [ ] Tap ignored OR card opacity = 0.6, cursor = not-allowed
- [ ] **Exit condition:** "See Our Story 🌟" button tapped → advance to origin_card (no additional VO here)
- [ ] **Reload in festivals_child (2 festivals selected):**
  - [ ] 3s countdown
  - [ ] selectedFestivals restored and visible
  - [ ] Continue button enabled
- [ ] **Reload in festivals_child (no selection):**
  - [ ] 3s countdown
  - [ ] Empty state, Continue disabled
- [ ] **Tab switch:** Selections preserved

### Origin Card Phase (Phase 7)
- [ ] **Entry:** festivals_child complete → AboutMeComparisonCard component rendered
- [ ] **Card content:**
  - [ ] Left column: Ganesha's connection (Home: All of India, Language: Sanskrit, Celebration: Ganesh Chaturthi)
  - [ ] Right column: Child's connection (Home: selectedRegion.label, Languages: selectedLanguages.length count, Celebrations: selectedFestivals.length count)
  - [ ] Both columns shown side-by-side
  - [ ] Comparison card VO: "Look, [childName]! Our stories meet right here in India."
- [ ] **Card interaction:**
  - [ ] "Continue" button → playUiTap() + playChime() → handleComplete()
- [ ] **Exit condition:** Continue tapped → handleComplete() → phase = COMPLETE → SceneCompletionCelebration renders
- [ ] **Reload in origin_card:**
  - [ ] 3s countdown → resumes in origin_card
  - [ ] All selections visible
- [ ] **Tab switch:** Card state preserved

### Complete Phase (Phase 8)
- [ ] **Entry:** origin_card complete → SceneCompletionCelebration renders
- [ ] **Celebration content:**
  - [ ] Title: "Our Stories Connect!"
  - [ ] Subtitle: "You discovered where your roots meet Ganesha's world."
  - [ ] Affirmation: Culturally grounded, celebratory tone
  - [ ] 3 discovery icons: home, language, festival
  - [ ] "Next Scene" button → onNavigate('scene-complete-continue') or onComplete()
  - [ ] "Replay" button → clearProgress() + reset all state + phase = OPENING
  - [ ] "Explore Zones" button → onNavigate('zone-welcome')
  - [ ] "Home" button → onNavigate('home')
- [ ] **Confetti/sparkles:** Fire once only, celebratory animation
- [ ] **ProgressManager call:** updateProgress() called with scene ID + completion status
- [ ] **Reload after completion:**
  - [ ] Completion state persists
  - [ ] Modal still visible
  - [ ] All buttons functional
- [ ] **Tab switch:** Completion resumes visually, no jank

---

## 22B · CORE MECHANICS — Drag Magnifying Glass, Region Selection, Language/Festival Guessing, Discovery Flow, Comparisons

### Magnifying Glass Drag Mechanics (Phase 1)
- [ ] **FreeDraggableItem component:**
  - [ ] ID: "magnifying-glass"
  - [ ] Position state: mglassPosition = { top, left } (percentage-based)
  - [ ] Bounds: { top: 0, left: 0, right: 100, bottom: 100 }
  - [ ] onPositionChange callback: handleMglassMove(newPosition)
  - [ ] Width/height: 160px × 160px
  - [ ] Z-index: 20 (above map, below hints)
  - [ ] Cursor: grab (default), grabbing (while dragging)
- [ ] **Dragging behavior:**
  - [ ] Smooth drag with no lag (CSS-based transforms preferred)
  - [ ] Stays within map bounds (no off-screen drag)
  - [ ] Visual feedback: cursor changes, no jitter
- [ ] **Location discovery on drag:**
  - [ ] checkLocationDiscovery() called on each move
  - [ ] Proximity check: |percentX - spot.x| < 7 && |percentY - spot.y| < 7
  - [ ] If match: discoverLocation(index) called
  - [ ] activeSpotFact shows real-time as dragging over spots
  - [ ] activeSpotFact hides when dragging away

### Region Selection Mechanics (Phase 2)
- [ ] **Region button tap:**
  - [ ] Tap region card → handleRegionSelect(region) called
  - [ ] playUiTap() + triggerMiniGesture() + triggerSparkle() triggered
  - [ ] selectedRegion state updated
  - [ ] Selected region visual feedback:
    - [ ] Border color change (gold/accent color)
    - [ ] Background color change (light gold)
    - [ ] Scale up slightly (1.08 transform)
    - [ ] Enhanced shadow
  - [ ] Unselected regions: normal state
- [ ] **Region VO:**
  - [ ] speakIfUnmuted(region.label, { age, moment: 'story' })
- [ ] **Continue button state:**
  - [ ] Before selection: disabled (gray, no-pointer-events)
  - [ ] After selection: enabled (orange, pointer)
  - [ ] 900ms delay after selection before enable (UX pause)
- [ ] **Kailash handling:**
  - [ ] Selectable like other regions
  - [ ] Special VO reaction played
  - [ ] Treated as a valid region selection (can proceed)
- [ ] **Outside India:**
  - [ ] Positioned below map (82% top, 36% left)
  - [ ] Same selection mechanics as other regions
  - [ ] VO: "Outside India"

### Language Guessing Mechanics (Phase 3)
- [ ] **Play button:**
  - [ ] Large circular button (400×400px) in center
  - [ ] Animates with pulse (scale 1 → 1.08 → 1) while not correct
  - [ ] Tap triggers VO: "Vakratunda Mahakaya Suryakoti Samaprabha!"
  - [ ] playUiTap() SFX on tap
- [ ] **Card selection:**
  - [ ] 4 cards in 2×2 grid
  - [ ] Each card: 280px height, 28px padding, gold border, white background
  - [ ] Card tap: handleLanguageGuess(guessLang) called
  - [ ] Visual feedback: selection highlight
- [ ] **Correct guess (Sanskrit):**
  - [ ] Card border + background highlight (gold)
  - [ ] Scale(1.05)
  - [ ] Shadow glow
  - [ ] langGuessPhase = "correct"
  - [ ] playSparkle() + playChime() + VO celebration
  - [ ] All other cards disabled (opacity 0.5)
- [ ] **Wrong guess:**
  - [ ] Card shake (250ms)
  - [ ] Card opacity 0.5, grayscale
  - [ ] Card disabled (cursor: not-allowed)
  - [ ] Added to wrongLangGuesses Set
  - [ ] VO: language name
  - [ ] Retry allowed on remaining cards

### Festival Guessing Mechanics (Phase 5)
- [ ] **Card selection:**
  - [ ] 5 cards: 2 top (centered), 3 bottom (centered)
  - [ ] Each card: 220×220px, gold border, white background
  - [ ] Card tap: handleFestivalGuess(fest) called
- [ ] **Correct guess (Ganesh Chaturthi):**
  - [ ] Card border highlight (gold)
  - [ ] Background light yellow (#FFF4D8)
  - [ ] Scale(1.05)
  - [ ] Shadow glow
  - [ ] guessPhase = "correct"
  - [ ] playSparkle() + playChime() + VO: "Yes! Ganesh Chaturthi is my favorite festival!"
  - [ ] Sparkle animation (star type, 20 particles, 2s duration)
  - [ ] All other cards disabled
- [ ] **Wrong guess:**
  - [ ] Card shake (300ms)
  - [ ] Card opacity 0.3, grayscale
  - [ ] Card disabled
  - [ ] Added to wrongGuesses Set
  - [ ] VO: festival label
  - [ ] Retry allowed

### Language/Festival Selection Mechanics (Phases 4 & 6)
- [ ] **Card tap toggle:**
  - [ ] Language: selectedLanguages array toggle
  - [ ] Festival: selectedFestivals array toggle
  - [ ] On tap: playUiTap() + triggerMiniGesture() + triggerSparkle()
- [ ] **Visual selected state:**
  - [ ] Selected card: gold border + light background + checkmark (✓) in top-right
  - [ ] Selected card: scale(1.05) + enhanced shadow
  - [ ] Unselected card: light border + white background
- [ ] **Cap enforcement:**
  - [ ] Language max: 3 languages
  - [ ] Festival max: 4 festivals
  - [ ] On attempt to exceed:
    - [ ] New card tap ignored OR disabled appearance (opacity 0.6, cursor not-allowed)
    - [ ] Clear visual feedback
- [ ] **Selection counter display:**
  - [ ] Language: "Pick up to 3 languages. X of 3 selected" (centered below grid)
  - [ ] Festival: "Pick up to 4 festivals. X of 4 selected"
- [ ] **Continue button:**
  - [ ] Enables when selectedLanguages.length >= 1 OR selectedFestivals.length >= 1
  - [ ] Disabled otherwise (gray, no-pointer-events)

### Comparison Card (Phase 7)
- [ ] **AboutMeComparisonCard component rendered:**
  - [ ] Left column: Ganesha's connection
    - [ ] Header: Ganesha icon/image (96×96px)
    - [ ] Title: "Ganesha's Connection"
    - [ ] Items: Home, Language, Celebration
  - [ ] Right column: Child's connection
    - [ ] Header: Child avatar circle (96×96px, initials)
    - [ ] Title: "[childName]'s Connection"
    - [ ] Items with correct data displayed
  - [ ] All data displayed accurately and side-by-side
  - [ ] VO: "Look, [childName]! Our stories meet right here in India."

### Discovery Flow & Progress
- [ ] **Location discovery (Phase 1):**
  - [ ] discoverLocation(index) adds to discoveredLocations array
  - [ ] discoveredRef tracks discovered indices (Set)
  - [ ] Each discovery: sparkle SFX + location VO + mini gesture + icon popIn animation
  - [ ] Last discovery → 1.5s delay → celebration (hearts floating + sparkles)
- [ ] **Phase transitions:**
  - [ ] Automatic on win conditions (no manual button in most phases)
  - [ ] Smooth timing (no abrupt jump)
  - [ ] VO plays for new phase
- [ ] **State restoration:**
  - [ ] sceneActions.updateState({ phase: NEXT_PHASE }) used for all transitions
  - [ ] SceneManager handles state persistence

---

## 22C · VOICE & VO CHECKLIST — All Voice Lines, Idle Hints, Tab Switch Hints, SFX, Audio Toggle Behavior

### Voice Lines by Phase

#### Opening Phase
- [ ] **opening VO:** "Let's explore my Indian story and yours!"
  - [ ] Triggers: Phase enters (STEPS.OPENING)
  - [ ] Moment: 'greeting'
  - [ ] Duration: ~3s
  - [ ] Deduped: wasStepVoSpokenRecently() check

#### Ganesha Home Phase (Phase 1)
- [ ] **ganesha_home entry VO:** "I live in three special places in India. Drag the magnifying glass to find me!"
  - [ ] Triggers: Phase enters
  - [ ] Moment: 'story'
  - [ ] Idle hint VO (Level 2): "Drag the magnifying glass to find my special places!"
  - [ ] Location discovery VO: Each spot (Varanasi, Mumbai, Tamil Nadu) spoken by name
  - [ ] All locations discovered VO: "You found all my hiding places! I am everywhere in India!"
    - [ ] Moment: 'celebration'
    - [ ] Triggers: 1.5s after 3rd discovery

#### Child Home Phase (Phase 2)
- [ ] **child_home entry VO:** "Now tell me where is your home in India? Tap the place where your family lives."
  - [ ] Triggers: Phase enters (one-time via useEffect)
  - [ ] Moment: 'default'
  - [ ] Duration: ~3s
- [ ] **Region selection VO:** Region label (e.g., "North India", "West India", "Outside India")
  - [ ] Triggers: On region button tap
  - [ ] Moment: 'story'
- [ ] **Kailash special VO:** "KAILASH?! That's where my Amma and Appa live! But where does YOUR family live on Earth?"
  - [ ] Triggers: Kailash button tapped
  - [ ] Moment: 'default'

#### Language Ganesha Phase (Phase 3)
- [ ] **language_ganesha entry VO:** "Can you guess my language? Tap play to listen… then tap the correct card!"
  - [ ] Triggers: Phase enters
  - [ ] Moment: 'default'
- [ ] **Play button audio:** "Vakratunda Mahakaya Suryakoti Samaprabha!"
  - [ ] Triggers: Play button tapped
  - [ ] Moment: 'default'
- [ ] **Correct guess VO:** "Yes! That's Sanskrit — the language of mantras and shlokas."
  - [ ] Triggers: Sanskrit card tapped
  - [ ] Moment: 'celebration'
- [ ] **Wrong guess VO:** Language label name (e.g., "Hindi", "Tamil", "Telugu")
  - [ ] Triggers: Non-Sanskrit card tapped
  - [ ] Moment: 'default'
- [ ] **Idle hint VO (Level 2):** "This is the language I speak!"
  - [ ] Triggers: 18s idle in guessing phase
  - [ ] Moment: 'default'

#### Language Child Phase (Phase 4)
- [ ] **language_child entry VO:** "Which language does your family speak at home? Tap the cards to choose."
  - [ ] Triggers: Phase enters
  - [ ] Moment: 'default'
- [ ] **Language selection VO:** Language name (e.g., "Hindi", "Tamil")
  - [ ] Triggers: Language card tapped (toggle)
  - [ ] Moment: 'encouragement'
- [ ] **Confirmation VO:** "Wonderful! These are the languages your family speaks."
  - [ ] Triggers: Continue button tapped
  - [ ] Moment: 'celebration'

#### Festivals Ganesha Phase (Phase 5)
- [ ] **festivals_ganesha entry VO:** "I have a favourite festival! Can you guess which one?"
  - [ ] Triggers: Phase enters
  - [ ] Moment: 'default'
- [ ] **Correct guess VO:** "Yes! Ganesh Chaturthi is my favorite festival!"
  - [ ] Triggers: Ganesh Chaturthi card tapped
  - [ ] Moment: 'celebration'
- [ ] **Wrong guess VO:** Festival label name (e.g., "Pongal", "Holi", "Diwali")
  - [ ] Triggers: Non-Ganesh Chaturthi card tapped
  - [ ] Moment: 'default'
- [ ] **Idle hint VO (Level 2):** "This is my favorite festival!"
  - [ ] Triggers: 18s idle in guessing phase
  - [ ] Moment: 'default'

#### Festivals Child Phase (Phase 6)
- [ ] **festivals_child entry VO:** "Wonderful! Which festivals does your family celebrate?"
  - [ ] Triggers: Phase enters
  - [ ] Moment: 'default' (or 'celebration' from previous phase)
- [ ] **Festival selection VO:** Festival label name
  - [ ] Triggers: Festival card tapped (toggle)
  - [ ] Moment: 'encouragement'

#### Origin Card Phase (Phase 7)
- [ ] **origin_card entry VO:** "Look, [childName]! Our stories meet right here in India."
  - [ ] Triggers: Phase enters
  - [ ] Moment: 'gratitude'
  - [ ] Child name interpolated

### Return Hint VO (Tab Switch Return)
- [ ] **getPhaseReminderLine() function:**
  - [ ] GANESHA_HOME: "Drag the magnifying glass to find my special places!"
  - [ ] CHILD_HOME: "Tap where your family lives in India."
  - [ ] LANGUAGE_GANESHA: "Tap play and choose the correct language card."
  - [ ] LANGUAGE_CHILD: "Choose up to three languages your family speaks."
  - [ ] FESTIVALS_GANESHA: "Tap my favourite festival card."
  - [ ] FESTIVALS_CHILD: "Choose the festivals your family celebrates."
  - [ ] ORIGIN_CARD: "Our stories connect in India, [childName]!"
- [ ] **Trigger:** onReturnHint() called via useVoiceGuidance hook
- [ ] **Timing:** After 3s resume delay (resumeDelay = 3000ms)
- [ ] **Moment:** 'encouragement'

### Sound Effects (SFX)
- [ ] **playUiTap():** All card/button taps
  - [ ] Volume: sfxVolume (0.7 default)
  - [ ] No clipping or harsh sound
- [ ] **playSparkle():** Location discovery, correct guess
  - [ ] Volume: sfxVolume
  - [ ] Celebratory tone
- [ ] **playChime():** Correct guess confirmation
  - [ ] High-quality, celebratory tone
  - [ ] Not used for wrong guesses (no negative tone)

### Audio Toggle Behavior (Critical Blocker)
- [ ] **Toggle OFF → All VO stops IMMEDIATELY:**
  - [ ] **No stutter or tail-off**
  - [ ] useAudioPreference().toggleAudio() called
  - [ ] isAudioOn state updated to false
  - [ ] useGaneshaVoice.stop() called immediately
  - [ ] All pending VO lines cancelled
  - [ ] No restart of stopped VO on toggle ON
- [ ] **Toggle OFF → All SFX stops IMMEDIATELY:**
  - [ ] playUiTap() checks isAudioOn before playing
  - [ ] playSparkle() checks isAudioOn before playing
  - [ ] playChime() checks isAudioOn before playing
  - [ ] No SFX queued or buffered if OFF
- [ ] **Toggle ON → VO resumes without replay:**
  - [ ] Next VO line triggers normally
  - [ ] No duplication of previous VO
  - [ ] Queue maintained cleanly
- [ ] **Persistence across scenes:**
  - [ ] localStorage persists isAudioOn state
  - [ ] Preference applies to all About Me scenes (19–22)
  - [ ] Audio state consistent on reload
- [ ] **Visual indicator:**
  - [ ] AudioToggle component shows clear on/off state
  - [ ] Icon or text indicates muted status
  - [ ] Position: top-right UI area (consistent)

---

## 22D · VISUAL ASSETS CHECKLIST — Images, Icons, Backgrounds, Animations, Sparkles

### Background Images
- [ ] **name_background.jpg:** 
  - [ ] Loads from correct path: `./assets/images/name_background.jpg`
  - [ ] No 404 in DevTools Network tab
  - [ ] Fills full viewport width × height
  - [ ] No tiling or stretching
  - [ ] Appropriate for About Me theme (warm, inviting colors)
  - [ ] Readable text overlay contrast maintained

### India Map Image
- [ ] **india-map.png:**
  - [ ] Loads from correct path: `./assets/images/ganeshaplace/india-map.png`
  - [ ] No 404
  - [ ] Rendered in Phase 1 (ganesha_home) and Phase 2 (child_home)
  - [ ] Dimensions: 900px × 980px (responsive via maxWidth: 90vw)
  - [ ] Accurate geography (states/regions visible)
  - [ ] Color scheme: natural, not oversaturated

### Magnifying Glass Asset
- [ ] **mglass.png:**
  - [ ] Loads from correct path: `./assets/images/ganeshaplace/mglass.png`
  - [ ] No 404
  - [ ] Rendered as draggable item (FreeDraggableItem)
  - [ ] Dimensions: 160px × 160px
  - [ ] Transparent background (PNG with alpha)
  - [ ] Visually clear and proportionate to map

### Ganesha Spot Icons (Phase 1)
- [ ] **mumbaiIcon, varansiIcon, tamilNaduIcon:**
  - [ ] All load (no 404)
  - [ ] Renders on discovery
  - [ ] Appropriate scale (120px × 120px on discover)

### Region Icons (Phase 2)
- [ ] **All 7 region icons:**
  - [ ] All load (no 404)
  - [ ] Rendered as region button images (46px × 46px)
  - [ ] Color scheme matches region
  - [ ] Visual clarity: distinct from each other

### Language Icons (Phases 3 & 4)
- [ ] **All 12 language icons:**
  - [ ] All load (no 404)
  - [ ] Rendered in language selection grids
  - [ ] Color codes visible
  - [ ] Language script labels render without tofu boxes

### Festival Icons (Phases 5 & 6)
- [ ] **All 12 festival icons:**
  - [ ] All load (no 404)
  - [ ] Rendered in festival grids
  - [ ] Visual variety: distinct from each other
  - [ ] Culturally appropriate imagery

### Progress Header Icons
- [ ] **storyHouseIcon, storyLanguageIcon, storyFestivalIcon:**
  - [ ] All load correctly (no 404)
  - [ ] Rendered in StoryProgressHeader component

### Ganesha Assets
- [ ] **babyGaneshaImg** (from `/images/ganesha-final-new.svg`):
  - [ ] Loads from shared SVG path
  - [ ] No 404
  - [ ] Renders at correct size (64–200px depending on context)
  - [ ] SVG renders crisply (no pixelation)

### Animations & Sparkles
- [ ] **SparkleAnimation component (Phase 1 final):**
  - [ ] Type: 'magic' on all locations discovered
  - [ ] Count: 34 particles
  - [ ] Color: rgba(0, 229, 255, 0.78) (cyan)
  - [ ] Size: 10px
  - [ ] Duration: 2200ms
  - [ ] Renders above gameplay (z-index correct)
  - [ ] No clipping at viewport edges
- [ ] **CSS animations (all smooth):**
  - [ ] popIn: icon scaling entrance (0 → 1)
  - [ ] floatUp: heart emoji floating upward
  - [ ] idleWobble: card/element gentle rotation (±3deg)
  - [ ] idleGlow: cyan glow box-shadow (location targets)
  - [ ] bounce: emoji vertical bounce (↑↓)
  - [ ] shake: card horizontal shake on wrong guess

### Responsive Design
- [ ] **Desktop (1280×800):**
  - [ ] All images visible, no overflow
  - [ ] Text readable
  - [ ] Cards sized appropriately
- [ ] **Tablet (768×1024):**
  - [ ] Images scale smoothly
  - [ ] Cards adapt to viewport
  - [ ] Touch targets ≥60px
- [ ] **Mobile (375×812):**
  - [ ] Images fit viewport (no cut-off)
  - [ ] Cards stack or wrap (no horizontal overflow)
  - [ ] maxWidth: 90vw applied to map container

---

## 22E · IDLE HINT SYSTEM — Progressive Levels (0–3) for Each Guessing Phase with Timings and Visual/Audio Cues

### Ganesha Home Phase Idle Hints (Phase 1)

**State:** ganeshaHomeIdleLevel (0–3)

- [ ] **Entry to phase:** Level set to 0
- [ ] **Level 0 (0–10s):** No hints visible
- [ ] **Level 1 (@ 10s):**
  - [ ] **Visual:** Undiscovered location icons glow with cyan box-shadow
  - [ ] **Visual:** Magnifying glass wobbles
  - [ ] **Audio:** None at this level
- [ ] **Level 2 (@ 18s total, 8s after Level 1):**
  - [ ] **Visual:** Undiscovered locations glow with repeating intensity pulses
  - [ ] **Visual:** Magnifying glass continues wobbling
  - [ ] **Audio:** VO hint plays (once): "Drag the magnifying glass to find my special places!"
- [ ] **Level 3 (@ 26s total, 8s after Level 2):**
  - [ ] **Visual:** Pointing emoji (👇) appears above first undiscovered spot
  - [ ] **Visual:** Locations remain glowing (steady glow)
  - [ ] **Audio:** No additional VO at this level

**Reset conditions:**
- [ ] User drags magnifying glass → setGaneshaHomeIdleLevel(0)
- [ ] User discovers location → idleVoiceRef reset
- [ ] Exit phase → idleLevel reset, timer cleared
- [ ] Tab switch → idleLevel reset

**Timings:**
- 0s → idle timer starts
- 10s → Level 1 (glow + wobble)
- 18s → Level 2 (repeating glow + VO)
- 26s → Level 3 (pointing emoji + steady glow)

### Language Ganesha Phase Idle Hints (Phase 3)

**State:** langGuessIdleLevel (0–3)

- [ ] **Entry to phase:** Level set to 0
- [ ] **Level 0 (0–10s):** No hints
- [ ] **Level 1 (@ 10s):**
  - [ ] **Visual:** Language cards wobble
  - [ ] **Audio:** None
- [ ] **Level 2 (@ 18s total):**
  - [ ] **Visual:** Cards continue wobbling
  - [ ] **Audio:** VO hint plays (once): "This is the language I speak!"
- [ ] **Level 3 (@ 26s total):**
  - [ ] **Visual:** Pointing emoji (👇) appears above Sanskrit card (correct answer)
  - [ ] **Audio:** No additional VO

**Reset conditions:**
- [ ] User taps any language card → setLangGuessIdleLevel(0)
- [ ] User makes guess (wrong) → idleLevel cleared
- [ ] Phase transition → idleLevel reset
- [ ] Tab switch → idleLevel reset

### Festivals Ganesha Phase Idle Hints (Phase 5)

**State:** festGuessIdleLevel (0–3)

- [ ] **Entry to phase:** Level set to 0
- [ ] **Level 0 (0–10s):** No hints
- [ ] **Level 1 (@ 10s):**
  - [ ] **Visual:** Festival cards wobble
  - [ ] **Audio:** None
- [ ] **Level 2 (@ 18s total):**
  - [ ] **Visual:** Cards continue wobbling
  - [ ] **Audio:** VO hint plays (once): "This is my favorite festival!"
- [ ] **Level 3 (@ 26s total):**
  - [ ] **Visual:** Pointing emoji (👇) appears above Ganesh Chaturthi card (correct)
  - [ ] **Audio:** No additional VO

**Reset conditions:**
- [ ] User taps any festival card → setFestGuessIdleLevel(0)
- [ ] User makes guess (wrong) → idleLevel cleared
- [ ] Phase transition → idleLevel reset
- [ ] Tab switch → idleLevel reset

---

## 22F · RELOAD & TAB SWITCH — Recovery for All Phases, Mid-Gesture Handling, VO State Management

### Reload Recovery (All Phases)

#### Reload in Opening Phase
- [ ] **Behavior:** No resume popup
- [ ] **UI:** Opening modal appears fresh
- [ ] **Action:** User must tap "Start" to proceed
- [ ] **State:** All progress cleared

#### Reload in Ganesha Home (Phase 1)
- [ ] **No discovery:** 
  - [ ] 3s resume countdown → resumes in ganesha_home
  - [ ] Magnifying glass at default position (top: 30%, left: 20%)
  - [ ] Map visible, no discoveries shown
  - [ ] Idle hint level reset to 0
- [ ] **Partial discovery (1–2 spots):**
  - [ ] 3s countdown → resumes
  - [ ] Discovered locations preserved and visible on map
  - [ ] Idle hint level reset
- [ ] **All 3 discovered (celebrating):**
  - [ ] 3s countdown
  - [ ] All 3 location icons visible
  - [ ] Celebration auto-triggers: sparkles + hearts + VO
  - [ ] 6s total → auto-advances to child_home

#### Reload in Child Home (Phase 2)
- [ ] **No region selected:**
  - [ ] 3s countdown → resumes in child_home
  - [ ] All region cards visible, no selection highlighted
  - [ ] Continue button disabled
- [ ] **Region selected:**
  - [ ] 3s countdown → resumes
  - [ ] Selected region highlighted
  - [ ] Continue button enabled

#### Reload in Language Ganesha (Phase 3)
- [ ] **No guesses yet:**
  - [ ] 3s countdown
  - [ ] All 4 language cards visible, enabled
  - [ ] Play button enabled
  - [ ] Idle hint level reset
- [ ] **Wrong guess made:**
  - [ ] 3s countdown
  - [ ] Wrong guesses cleared
  - [ ] All cards re-enabled
- [ ] **Correct guess (celebrating):**
  - [ ] 3s countdown
  - [ ] guessPhase in "correct" state
  - [ ] 3s timeout → phase auto-advances to language_child

#### Reload in Language Child (Phase 4)
- [ ] **No languages selected:**
  - [ ] 3s countdown → resumes
  - [ ] All 12 language cards visible, enabled
  - [ ] Continue button disabled
- [ ] **1–3 languages selected:**
  - [ ] 3s countdown
  - [ ] selectedLanguages restored
  - [ ] Selected cards show checkmarks
  - [ ] Continue button enabled

#### Reload in Festivals Ganesha (Phase 5)
- [ ] **No guesses yet:**
  - [ ] 3s countdown
  - [ ] All 5 festival cards visible, enabled
  - [ ] Idle hint level reset
- [ ] **Wrong guess made:**
  - [ ] 3s countdown
  - [ ] Wrong guesses cleared
  - [ ] All cards re-enabled

#### Reload in Festivals Child (Phase 6)
- [ ] **No festivals selected:**
  - [ ] 3s countdown → resumes
  - [ ] All 12 festival cards visible, enabled
  - [ ] Continue button disabled
- [ ] **1–4 festivals selected:**
  - [ ] 3s countdown
  - [ ] selectedFestivals restored
  - [ ] Selected cards show checkmarks
  - [ ] Continue button enabled

#### Reload in Origin Card (Phase 7)
- [ ] **Behavior:**
  - [ ] 3s countdown → resumes in origin_card
  - [ ] AboutMeComparisonCard rendered with all selections
  - [ ] All data displayed accurately

#### Reload After Completion (Phase 8)
- [ ] **Behavior:**
  - [ ] Completion state persists
  - [ ] SceneCompletionCelebration modal still visible
  - [ ] Progress saved to permanent storage (ProgressManager)
  - [ ] All buttons functional

### Tab Switch Recovery (All Phases)

#### Tab Switch in Ganesha Home (Phase 1)
- [ ] **onHide (tab hidden):**
  - [ ] speak.stop() called
  - [ ] All idle hint timers cleared
  - [ ] Magnifying glass position preserved (no reset)
  - [ ] Any playing VO stops immediately
- [ ] **onShow (tab returned after 3s):**
  - [ ] 3s countdown timer shows
  - [ ] Return hint VO plays: "Drag the magnifying glass to find my special places!"
  - [ ] Magnifying glass still at previous position

#### Tab Switch in Child Home (Phase 2)
- [ ] **onHide:**
  - [ ] speak.stop()
  - [ ] All timers cleared
- [ ] **onShow:**
  - [ ] 3s countdown shows
  - [ ] selectedRegion preserved (if selected)
  - [ ] Return hint VO plays

#### Tab Switch in Language Ganesha (Phase 3)
- [ ] **onHide:**
  - [ ] speak.stop()
  - [ ] langGuessIdleLevel reset
  - [ ] shakeLang cleared
- [ ] **onShow:**
  - [ ] 3s countdown
  - [ ] guessPhase state preserved
  - [ ] wrongLangGuesses state preserved
  - [ ] Return hint VO plays

#### Tab Switch in Language Child (Phase 4)
- [ ] **onHide:**
  - [ ] speak.stop()
  - [ ] All timers cleared
- [ ] **onShow:**
  - [ ] 3s countdown
  - [ ] selectedLanguages preserved
  - [ ] Continue button state preserved

#### Tab Switch in Festivals Ganesha (Phase 5)
- [ ] **onHide:**
  - [ ] speak.stop()
  - [ ] festGuessIdleLevel reset
  - [ ] shakeLang cleared
- [ ] **onShow:**
  - [ ] 3s countdown
  - [ ] guessPhase state preserved
  - [ ] wrongGuesses state preserved

#### Tab Switch in Festivals Child (Phase 6)
- [ ] **onHide:**
  - [ ] speak.stop()
- [ ] **onShow:**
  - [ ] 3s countdown
  - [ ] selectedFestivals preserved
  - [ ] Continue button state preserved

#### Tab Switch in Origin Card (Phase 7)
- [ ] **onHide:**
  - [ ] speak.stop()
- [ ] **onShow:**
  - [ ] 3s countdown
  - [ ] Comparison card still visible
  - [ ] All selections intact

### VO State Management

#### Deduping & Stale Key Cleanup
- [ ] **STEP_VO_DEDUPE_MS = 1800ms:**
  - [ ] RECENT_STEP_VO Map tracks VO keys by phase
  - [ ] wasStepVoSpokenRecently() checks if VO played in last 1.8s
  - [ ] If already spoken, skip (no duplicate)
- [ ] **Return hint VO:**
  - [ ] onReturnHint() increments returnHintNonce
  - [ ] Plays hint without duplication

#### VO Queueing
- [ ] **Multiple VO triggers:**
  - [ ] speak() function from useGaneshaVoice hook
  - [ ] No overlap: VO lines queued
  - [ ] Previous line stops before new line plays
  - [ ] stop() called on toggle OFF or phase change
  - [ ] speakIfUnmuted() wraps all speak() calls

---

## 22G · EDGE CASES & SIGN-OFF — Rapid Interactions, Network Latency, Cross-Browser, Test Matrix

### Rapid Interaction Edge Cases

#### Double-Tap Same Button
- [ ] **Magnifying glass:**
  - [ ] Rapid drag movements (no double-tap issue)
  - [ ] checkLocationDiscovery() called per move (throttled if needed)
  - [ ] No duplicate discovery SFX or VO
- [ ] **Region card double-tap:**
  - [ ] handleRegionSelect() called once per tap
  - [ ] playUiTap() plays once
  - [ ] Continue button 900ms delay prevents second tap
- [ ] **Language/festival card double-tap:**
  - [ ] Toggle called once per tap
  - [ ] Selection count accurate (no double-add)
  - [ ] SFX plays once per tap
- [ ] **Guess card double-tap (Language or Festival):**
  - [ ] Correct guess: guessPhase = "correct" locks further taps
  - [ ] Wrong guess: card added to Set once

#### Continue Button Rapid Taps
- [ ] **All Continue buttons:**
  - [ ] Single tap processes cleanly
  - [ ] No duplicate phase transitions
  - [ ] React batches updates correctly

#### Tap While VO Playing
- [ ] **Tap during long VO:**
  - [ ] Tap registers immediately
  - [ ] VO responsive (no lag > 100ms)
- [ ] **Tab switch → return → continue immediately:**
  - [ ] 3s countdown does not re-trigger
  - [ ] Phase state stable

### Network Latency Edge Cases

#### Slow Image Load
- [ ] **India map image slow (> 2s):**
  - [ ] Phase renders but map appears gradually
  - [ ] Magnifying glass appears even if map not loaded
  - [ ] Child can begin dragging once map visible
  - [ ] No hung state

#### Missing Asset Fallback
- [ ] **Icon 404:**
  - [ ] Button renders with placeholder (no crash)
  - [ ] Selection still works
  - [ ] DevTools shows 404 (flagged for QA)

#### VO File Latency
- [ ] **Mantra VO slow to load:**
  - [ ] Play button tap does not stall UI
  - [ ] VO plays when ready
  - [ ] Child can retry (tap play again)

### Cross-Browser Testing

#### Chrome (Latest)
- [ ] **Animations smooth (60 FPS)**
- [ ] **Touch & click responsive**
- [ ] **Audio works**
- [ ] **DevTools: No console errors or critical 404s**

#### Safari (iOS + macOS)
- [ ] **Touch gestures work**
- [ ] **Audio works (check autoplay restrictions)**
- [ ] **CSS animations smooth**
- [ ] **Font rendering clear**

#### Firefox
- [ ] **Similar to Chrome: Smooth animations, responsive, audio works**

### Test Matrix

#### Desktop (1280×800)
- [ ] **All phases, full playthrough (opening → complete)**
- [ ] **Audio ON: All VO lines play, all SFX play, no overlaps**
- [ ] **Audio OFF: All sound stops immediately, toggle ON restarts without duplication**
- [ ] **Tab switch 3× per phase: Return hint VO plays, state recovered**
- [ ] **Mid-scene reload 2× per phase: Progress preserved, 404 errors = 0**
- [ ] **End-to-end timing: Scene load < 2s, no hangs, memory stable**

#### Tablet (768×1024)
- [ ] **Landscape + portrait: Layout adapts, no horizontal scroll**
- [ ] **Drag smooth, tap accurate, touch targets ≥60px**

#### Mobile (375×812)
- [ ] **Portrait: All content fits vertically (no cut-off)**
- [ ] **Horizontal scroll: NONE**
- [ ] **Touch targets ≥60px**
- [ ] **Responsive fonts: Readable at all sizes**
- [ ] **Magnifying glass drag: Smooth, accurate**
- [ ] **Performance: 30+ FPS, no jank**

#### Audio & VO Verification (All Browsers)
- [ ] **VO files present: 16+ lines recorded, no 404s**
- [ ] **VO timing: Syncs with animations, no cutoffs**
- [ ] **SFX: tap, sparkle, chime — consistent, no clipping**
- [ ] **Audio toggle: OFF stops immediately, ON resumes without replay**

### Accessibility Considerations
- [ ] **Color contrast: Text on backgrounds ≥4.5:1 ratio (WCAG AA)**
- [ ] **Touch targets: All interactive elements ≥60px**
- [ ] **Alt text: All images have meaningful alt text**

### Content Accuracy & Cultural Review
- [ ] **7 region ganeshaFact strings: Geographically accurate, respectful, joyful tone**
- [ ] **12 language script labels: Render without tofu boxes, correct scripts**
- [ ] **12 festival ganeshaReact strings: Culturally accurate, celebratory tone, no stereotypes**
- [ ] **origin_card story text: Culturally grounded, age-appropriate, inspiring**

### Responsive Design Verification (Detailed)
- [ ] **Magnifying glass & map (Phase 1): Draggable at all breakpoints, hitbox maintains accuracy**
- [ ] **Region cards (Phase 2): Scale proportionally, text readable, Continue accessible**
- [ ] **Language grid (Phases 3 & 4): Adapts to viewport, cards maintain padding, single column mobile**
- [ ] **Festival grid (Phases 5 & 6): Wraps cleanly, cards maintain touch target size**
- [ ] **Fonts & text scaling: Baloo 2 & Nunito, readable at all sizes, no oversized text**

---

## FINAL SIGN-OFF

### Pre-Launch Gates (Every Row Must Be ✓ or N/A)

- [ ] **22A · Phases:** All 9 phases present, entry/exit conditions met, reload scenarios verified
- [ ] **22B · Core Mechanics:** Drag, selection, guessing, comparisons all functional
- [ ] **22C · Voice & VO:** All voice lines trigger, idle hints + return hints work, audio toggle **BLOCKER** passes
- [ ] **22D · Visual Assets:** Zero 404s, all images load, animations smooth, responsive at all breakpoints
- [ ] **22E · Idle Hints:** Levels 0–3 progress correctly, visual/audio cues clear, reset conditions work
- [ ] **22F · Reload & Tab Switch:** All phases safe on reload, state recovered, VO managed, no duplicates
- [ ] **22G · Edge Cases:** Rapid interactions safe, network latency handled, cross-browser verified, test matrix passed
- [ ] **Cross-zone integration:** Scene 22 completion → next scene chain works, progress saved, audio pref syncs
- [ ] **Desktop (1280×800):** Full playthrough, all features work, no errors
- [ ] **Mobile (375×812):** Layout responsive, tap targets work, no overflow
- [ ] **Tablet (768×1024):** Intermediate viewport verified
- [ ] **Audio:** All VO + SFX files present, toggle works, preference persists
- [ ] **Content review:** All region facts, language scripts, festival reactions, origin story verified for accuracy + age-appropriateness
- [ ] **Performance:** Load time < 2s, smooth animations (60 FPS target), no memory leaks
- [ ] **Accessibility:** Text contrast ≥4.5:1, tap targets ≥60px, keyboard navigation functional (if applicable)

### QA & Approval Sign-Off

| Role | Name | Date | Status |
|------|------|------|--------|
| **QA Tester** | | | PENDING |
| **Senior UI/UX Reviewer** | | | PENDING |
| **Product Owner / Madhurima** | | | PENDING |

**Freeze only after ALL red bold rows (blockers) are ✓ and all 3 sign-offs obtained.**  
**Any FAIL on a blocker = no ship.**

---

**End of Scene 22 Production Freeze Checklist**
