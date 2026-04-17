# SCENE 22 (My Indian Story) — 22A Work Summary

**Date:** 2026-04-17  
**Session Focus:** Scene 22A (ganesha_home phase mechanics & VO system)  
**Status:** Phase mechanics locked, VO system finalized, idle hints redesigned

---

## ✅ COMPLETED

### 1. **Drag Mechanism (ganesha_home)**
- ✅ Fixed drag detection to trigger location discovery when magnifying glass is *dragged over* a spot
- ✅ Removed fact bubble display (not needed)
- ✅ Cleaned up dead code: removed `handleSpotTap`, `revealedSpots` state
- **Result:** Child drags → locations discovered with sparkle/VO immediately

### 2. **VO System — All Phases**
Updated all entry VO to be simpler, more direct:

| Phase | Entry VO |
|-------|----------|
| **opening** | "Let's explore my Indian story and yours!" |
| **ganesha_home** | "Drag the magnifying glass to find me." |
| **child_home** | "Tap where your family lives in India." |
| **language_ganesha** | "Tap play, then tap the right language." |
| **language_child** | "Tap up to three languages you speak." |
| **festivals_ganesha** | "Tap my favorite festival." |
| **festivals_child** | "Tap the festivals you celebrate." |
| **origin_card** | "Our stories connect in India, [childName]!" |

### 3. **Idle Hint System (3-Level) — REDESIGNED**

#### Level 1 @ 10 seconds
- **Visual:** Soft glow pulse (1.5s, not continuous)
- **Audio:** None
- **Purpose:** "Notice this"

#### Level 2 @ 18 seconds
- **Visual:** Glow pulse continues
- **Audio:** Hint clue
  - Language: "Listen carefully… look for the prayer scroll."
  - Festivals: "Look for the sweet I love!"
- **Purpose:** "Think about this"

#### Level 3 @ 26 seconds
- **Visual:** Stronger glow pulse (1.5s)
- **Audio:** Repeat hint clue
- **Purpose:** "Here's more help, try again"
- **Key Rule:** No pointing emoji, no permanent glow, child still chooses

### 4. **CSS Animations Added**
- ✅ `@keyframes idleGlowPulse` — soft pulse (Level 1–2)
- ✅ `@keyframes idleGlowPulseStrong` — stronger pulse (Level 3)

### 5. **Code Cleanup**
- ✅ Removed debug controls panel
- ✅ Removed pointing emoji displays (language + festival)
- ✅ Removed unused state/functions
- ✅ Fixed animation conditionals for all cards

---

## ✅ COMPLETED (Session 2)

### **Wrong Guess UX — Removed Fade Out**
- ✅ Removed opacity fade from language guess cards (was 0.5)
- ✅ Removed opacity fade from all 12 festival cards (was 0.3)
- ✅ Removed grayscale filter from festival cards
- **Result:** Wrong choices now shake only, stay visible at full opacity/color

### **22B — TAB SWITCH (PRODUCTION BLOCKER)**
- ✅ Fixed: Idle hints reset on tab return (added returnHintNonce to useEffect dependencies)
  - Ganesha home idle hints
  - Language ganesha idle hints
  - Festival ganesha idle hints
- ✅ Fixed: Shake states clear on tab return (added explicit reset in return hint effect)
- ✅ Return hint VO plays (already implemented)
- ✅ Ready to test: dragging mglass + tab return → hint VO plays, idle resets
- ✅ Ready to test: region not selected + tab return → return hint plays
- ✅ Ready to test: mid-guess + tab return → shake state clears
- ✅ Ready to test: selections preserved on return

### **22C — RELOAD / CONTINUE (PRODUCTION BLOCKER)**
- ✅ Resume countdown appears (3s) — already implemented via ResumeCountdown component
- ✅ Fixed: Selections restoration — added sceneActions.updateState calls to save region/languages/festivals
- ✅ Guess state cleared on reload — already implemented via reset useEffect
- ✅ Ready to test: resume countdown appears
- ✅ Ready to test: selections restored on reload
- ✅ Ready to test: guess state cleared on reload

### **22D — IDLE HINTS T27 (PARTIALLY IMPLEMENTED)**
- [ ] child_home: Uncomment/implement idle hint logic (currently commented out)
  - VOICE.child_home_idle exists: "Look closely… can you find your home?"
  - Timer is set but speaker is commented out (line 526)
- [ ] language_child: Implement idle hint (currently missing entirely)
  - Entry VO: "Tap up to three languages you speak."
  - Need to add: 3-level idle hint system (glow/pulse progression + VO clue)
- [ ] festivals_child: Implement idle hint (currently missing entirely)
  - Entry VO: "Tap the festivals you celebrate."
  - Need to add: 3-level idle hint system (glow/pulse progression + VO clue)

### **22E–22I — CORE MECHANICS, ASSETS, CONTENT**
- [ ] Verify 7 region selection works correctly
- [ ] Verify 3-language cap enforcement
- [ ] Verify 4-festival cap enforcement
- [ ] Check all visual assets load (icons, images)
- [ ] Review content strings (region facts, language labels, festival reactions)
- [ ] Verify comparison card displays correctly

### **22G — VISUAL ASSETS**
- [ ] Background (name_background.jpg) loads
- [ ] India map renders correctly (desktop + mobile)
- [ ] All 7 region icons load
- [ ] All 12 language icons + play button load
- [ ] All 12 festival icons + modak image load

---

## 🔧 Key Files Modified

- **MyIndianStoryGame.jsx**
  - Updated VOICE object (all entry VOs)
  - Fixed `checkLocationDiscovery` (drag detection)
  - Added `idleGlowPulse` + `idleGlowPulseStrong` animations
  - Updated Level 3 idle handlers (removed emoji, added VO repeat)
  - Removed fact bubble JSX + related state
  - Updated idle animation conditionals (all cards)

---

## 🎯 Next Session

**Priority 1:** Test 22B (tab switch) and 22C (reload) blockers
**Priority 2:** Implement missing idle hints for child_home, language_child, festivals_child
**Priority 3:** Audit visual assets + content accuracy
**Priority 4:** Full freeze checklist pass (22E–22I)

---

## 📌 Decision Log

✅ **Locked Decision:** Keep 3-level idle hints (no removal)  
✅ **Locked Decision:** Level 3 uses hint repeat + stronger glow, NOT answer reveal  
✅ **Locked Decision:** Drag detection triggers immediately (no tap needed)  
✅ **Locked Decision:** Fact bubble removed (not needed for UX)
