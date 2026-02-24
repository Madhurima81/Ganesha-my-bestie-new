# ✅ Symbol Sidebar & Wrong Mound Tap - Fixes & Analysis

## Date: February 16, 2026

---

## 🐛 **Issues Addressed**

### **Issue 1: Symbol Sidebar Hidden During All Celebrations**
**Problem:** Symbol sidebar was hidden during ALL celebration phases (power overlays, transitions, fireworks), but should only hide during final fireworks celebration.

**User Request:** "the SymbolSidebar, when I meant the celebration meant in the final celebration only in the fireworks time, hide the SymbolSidebar. Otherwise, it should be visible at all times"

**Solution:** Changed visibility condition from `!isCelebrationOrOverlayActive` to `showSparkle !== 'final-fireworks'`

---

### **Issue 2: Wrong Mound Tap VO Repeating 4 Times**
**Observation:** User tapped 4 wrong mounds and heard "Not there! Try somewhere else!" 4 times.

**User Question:** "do we need to say the voice over after each wrong bound tap?"

**Current Behavior:** VO plays after EACH wrong mound tap (working as designed).

**Design Decision Needed:** Should VO play after every wrong tap, or only once/conditionally?

---

## 📝 **Changes Made**

### **1. Symbol Sidebar Visibility Fix**

**File:** `NewModakSceneV7.jsx`
**Line:** ~1400

**Before:**
```javascript
{sceneState.welcomeShown && !isCelebrationOrOverlayActive && (
  <SymbolSidebar ... />
)}
```

**After:**
```javascript
{sceneState.welcomeShown && showSparkle !== 'final-fireworks' && (
  <SymbolSidebar ... />
)}
```

**What This Does:**
- Sidebar **remains visible** during:
  - ✅ Power Overlay 1 (Focus Power)
  - ✅ Power Overlay 2 (Sharing Power)
  - ✅ Power Overlay 3 (Gratitude Power)
  - ✅ ALL_COLLECTED transition phase (modak completion → overlay)
  - ✅ ROCK_TRANSFORMED transition phase (feeding completion → overlay)
  - ✅ All sparkle animations except final-fireworks

- Sidebar **hides only during**:
  - ❌ Final fireworks celebration (6 seconds)

**Why This is Better:**
- Users can access the symbol sidebar during power overlays to review discovered symbols
- Only hides during the climactic final celebration when fireworks are the main focus
- Maintains educational access throughout most of the game

---

## 🎮 **Wrong Mound Tap Analysis**

### **Current Implementation:**

**File:** `NewModakSceneV7.jsx`
**Lines:** 816-824

```javascript
} else {
  // Wrong mound - stop any idle hint VO, then play SFX + VO
  stopVoice();
  playWrong();
  playVoice('wrongTap'); // "Not there! Try somewhere else!"
  setShowSparkle(`mound-${moundIndex}`);
  sceneActions.updateState({ moundStates });
  setTimeout(() => setShowSparkle(null), 1000);
}
```

**Voice Over Config:**
- **File:** `modak-wrong-tap.mp3`
- **Text:** "Not there! Try somewhere else!"
- **Duration:** ~2 seconds

---

### **UX Analysis: Should VO Play After Each Wrong Tap?**

#### **Option A: Current Behavior (VO Every Time) ✅**

**Pros:**
- Immediate feedback for every mistake
- Reinforces learning through repetition
- Child knows each tap was wrong
- Prevents confusion ("Did it register?")
- Encourages systematic search

**Cons:**
- Can feel repetitive if child taps rapidly
- May frustrate if child is exploring intentionally
- VO queue can stack if tapping very fast

**Best For:**
- Younger children (3-5 years) who need consistent feedback
- First-time players learning game mechanics
- Players who tap slowly and deliberately

---

#### **Option B: VO Only on First Wrong Tap**

**Implementation:**
```javascript
// Track if wrong tap VO has played this phase
const [wrongTapVOPlayed, setWrongTapVOPlayed] = useState(false);

// In handleMoundClick:
if (!wrongTapVOPlayed) {
  playVoice('wrongTap');
  setWrongTapVOPlayed(true);
} else {
  playWrong(); // Just SFX, no VO
}

// Reset on correct mound found:
setWrongTapVOPlayed(false);
```

**Pros:**
- Less repetitive
- Allows faster exploration
- Feels less naggy

**Cons:**
- Child might not hear VO if they tap wrong mound first before VO finishes
- Less immediate feedback for subsequent mistakes
- Might miss the hint if exploring rapidly

**Best For:**
- Older children (6-8 years) who understand faster
- Replay sessions where child already knows mechanics

---

#### **Option C: VO with Cooldown (Recommended) ⭐**

**Implementation:**
```javascript
// Track last wrong tap VO time
const lastWrongTapVOTimeRef = useRef(0);
const WRONG_TAP_VO_COOLDOWN = 3000; // 3 seconds

// In handleMoundClick:
const now = Date.now();
if (now - lastWrongTapVOTimeRef.current > WRONG_TAP_VO_COOLDOWN) {
  playVoice('wrongTap');
  lastWrongTapVOTimeRef.current = now;
} else {
  playWrong(); // Just SFX, no VO
}
```

**Pros:**
- Balanced feedback (not too much, not too little)
- First tap always gets VO
- Subsequent rapid taps get SFX only
- After 3s cooldown, VO plays again if still making mistakes
- Prevents VO spam during exploration

**Cons:**
- Slightly more complex implementation
- Timing needs to be tuned

**Best For:**
- All age groups
- Balance between feedback and exploration

---

### **Recommended Decision:**

**Keep Option A (Current Behavior)** for now because:

1. **Game Design:** There are only 5 mounds, so worst case is 4 wrong taps
2. **Short Duration:** VO is only ~2 seconds
3. **Educational Value:** Consistent feedback helps learning
4. **Tap Prevention:** The VO duration naturally slows down spam tapping
5. **Clear Feedback:** Child knows each tap registered

**Alternative:** If testing shows it feels too repetitive, switch to **Option C (Cooldown)** with 3-4 second window.

---

## 🎯 **User Experience Examples**

### **Scenario: Symbol Sidebar During Celebrations**

**Before Fix:**
1. Collect 3rd modak → Celebration + VO
2. Power Overlay 2 appears → **Sidebar disappears**
3. User cannot access symbol info during overlay
4. Power Overlay closes → Sidebar returns

**After Fix:**
1. Collect 3rd modak → Celebration + VO
2. Power Overlay 2 appears → **Sidebar remains visible**
3. User can tap sidebar to see Mooshika info during overlay
4. Sidebar pauses game (handlePauseCore) while open
5. Final fireworks start → **Sidebar disappears** (only during this)
6. Scene completion modal → Sidebar not needed anymore

---

### **Scenario: Wrong Mound Tapping**

**Current Behavior (Option A):**
1. Child taps mound 1 → ❌ "Not there! Try somewhere else!" + sparkle
2. Child taps mound 3 → ❌ "Not there! Try somewhere else!" + sparkle
3. Child taps mound 4 → ❌ "Not there! Try somewhere else!" + sparkle
4. Child taps mound 5 → ❌ "Not there! Try somewhere else!" + sparkle
5. Child taps mound 2 → ✅ "Yay! Found Mooshika!" + success animation

**Total Wrong Tap VOs:** 4 (one per wrong tap)
**User Perception:** Consistent feedback, clear that each was wrong

---

## 🧪 **Testing Checklist**

### **Symbol Sidebar Visibility:**
- [ ] During Power Overlay 1 (Focus) → Sidebar visible
- [ ] During Power Overlay 2 (Sharing) → Sidebar visible
- [ ] During Power Overlay 3 (Gratitude) → Sidebar visible
- [ ] During ALL_COLLECTED transition → Sidebar visible
- [ ] During ROCK_TRANSFORMED transition → Sidebar visible
- [ ] During final fireworks (6s) → **Sidebar hidden**
- [ ] After scene completion modal → Sidebar not shown (game complete)
- [ ] Tapping sidebar during overlay → Game pauses, popup opens
- [ ] Closing sidebar popup → Game resumes with smart logic

### **Wrong Mound Tap Feedback:**
- [ ] Tap wrong mound → Hear "Not there! Try somewhere else!"
- [ ] Tap 2nd wrong mound → Hear VO again
- [ ] Tap 3rd wrong mound → Hear VO again
- [ ] Rapid tapping wrong mounds → Each tap plays VO (or queues)
- [ ] VO duration prevents rapid spam (natural throttle)
- [ ] SFX (playWrong) plays every time

---

## 📁 **Files Modified**

```
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx
  - Line ~1400: Changed SymbolSidebar visibility condition
  - FROM: !isCelebrationOrOverlayActive
  - TO: showSparkle !== 'final-fireworks'
```

**Files Analyzed (No Changes):**
```
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx
  - Lines 816-824: Wrong mound tap logic
  - Current: playVoice('wrongTap') on every wrong tap

src/lib/config/content/voiceGuidance.js
  - Lines 373-376: wrongTap VO config
  - Text: "Not there! Try somewhere else!"
  - File: modak-wrong-tap.mp3
```

---

## 💡 **Design Recommendations**

### **For Symbol Sidebar:**
**Status:** ✅ **Implemented** - Sidebar now only hides during final fireworks

**Reasoning:**
- Educational access throughout game
- Symbol review during power overlays is valuable
- Only hides during climactic moment (fireworks)
- Maintains clean UX during final celebration

---

### **For Wrong Mound Tap VO:**
**Status:** ⏳ **Awaiting User Decision**

**Recommendation:** Keep current behavior (VO every time) because:
1. Only 5 mounds → max 4 wrong taps
2. Natural throttle from VO duration (~2s)
3. Consistent feedback is educational
4. Prevents "did it register?" confusion

**Alternative:** If testing shows too repetitive:
- Implement Option C (cooldown mechanism)
- 3-4 second cooldown window
- First tap always gets VO, rapid subsequent taps get SFX only

**Question for User:**
*"Should we keep the current behavior (VO after every wrong tap), or implement a cooldown so rapid taps only play SFX?"*

---

## 🚀 **Status**

**Symbol Sidebar Fix:** ✅ Complete
**Wrong Tap Analysis:** ✅ Complete
**Wrong Tap Implementation:** ⏳ Pending user decision
**Testing:** ⏳ Pending user verification
**Ready for:** Production deployment (sidebar fix)

---

**Next Steps:**
1. Test symbol sidebar visibility during power overlays
2. Verify sidebar hides only during final fireworks
3. Decide on wrong tap VO behavior (keep current or add cooldown)
4. Test wrong tap feedback with target age group (3-8 years)
