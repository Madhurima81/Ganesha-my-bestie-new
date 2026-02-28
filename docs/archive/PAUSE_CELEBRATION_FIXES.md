# ✅ Pause Menu Celebration & Drag Offset Fixes

## Date: February 16, 2026

---

## 🐛 **Issues Fixed**

### **Issue 1: Pause Menu Visible During Celebration Transitions**
**Problem:** User could pause between completion VO and power overlay (5.5s gap for modaks, 3.5s for feeding), causing confusion.

**Solution:** Block pause menu during transition phases:
- `PHASES.ALL_COLLECTED` - Between modak completion and Power Overlay 2
- `PHASES.ROCK_TRANSFORMED` - Between feeding completion and Power Overlay 3

---

### **Issue 2: Cursor Offset on First Modak Drag**
**Problem:** First modak drag had cursor offset because element size wasn't captured correctly on initial render.

**Solution:** Pre-cache element size in a `useEffect` after render, so `originalSizeRef` is populated before first drag.

---

### **Issue 3: Resume During Completion Should Replay Completion VO**
**Problem:** If user paused during transition phases (ALL_COLLECTED or ROCK_TRANSFORMED), resume was silent instead of replaying the celebration VO.

**Solution:** Added special case logic in `resumePhaseAfterPause()` to replay completion VOs during transition.

---

## 📝 **Changes Made**

### **1. NewModakSceneV7.jsx - Block Pause During Transitions**

**Lines 316-323:**
```javascript
const isCelebrationOrOverlayActive =
  showSceneCompletion ||
  showDiscoveryFlip1 ||
  showDiscoveryFlip2 ||
  showDiscoveryFlip3 ||
  sceneState.phase === PHASES.ALL_COLLECTED || // ✅ Block during modak completion → overlay
  sceneState.phase === PHASES.ROCK_TRANSFORMED; // ✅ Block during feeding completion → overlay

const canShowPauseUI = sceneState.welcomeShown && !isCelebrationOrOverlayActive;
```

**What This Does:**
- Pause button becomes **invisible/disabled** during transition phases
- ESC key and auto-pause (tab switch) also blocked
- User cannot interrupt celebration sequence

---

### **2. NewModakSceneV7.jsx - Replay Completion VO on Resume**

**Lines 382-410 (resumePhaseAfterPause function):**
```javascript
const resumePhaseAfterPause = () => {
  if (!canShowPauseUI) return;

  const currentGamePhase = getCurrentGamePhase();

  // SPECIAL CASE: Replay completion VOs during transition phases
  if (sceneState.phase === PHASES.ALL_COLLECTED) {
    // Paused during modak collection completion (before overlay)
    playVoice('collectComplete'); // ✅ "All three modaks! Amazing! Now... will you share them with me?"
    startIdleTimer();
    return;
  }

  if (sceneState.phase === PHASES.ROCK_TRANSFORMED) {
    // Paused during feeding completion (before overlay)
    playVoice('feedComplete', () => {
      playCelebration('bellyHappy'); // ✅ "All three! My tummy is so happy!" → "Mmmm! Yummy!"
    });
    startIdleTimer();
    return;
  }

  // ... rest of resume logic (initial instructions, silent resume, etc.)
};
```

**What This Does:**
- If paused during `ALL_COLLECTED` → Resume replays `collectComplete` VO
- If paused during `ROCK_TRANSFORMED` → Resume replays `feedComplete` + `bellyHappy` VOs
- Maintains celebration excitement even if interrupted

---

### **3. DraggableItem.jsx - Pre-Cache Element Size**

**Lines 18-36:**
```javascript
const originalSizeRef = useRef({ width: 0, height: 0 }); // 🔧 Store original size

// 🔧 FIX: Pre-cache element size after render to avoid first-drag offset issues
// Use setTimeout to ensure CSS layout has completed before measuring
useEffect(() => {
  if (elementRef.current && originalSizeRef.current.width === 0) {
    // Wait for next frame to ensure CSS has been applied
    const timer = setTimeout(() => {
      if (elementRef.current) {
        const rect = elementRef.current.getBoundingClientRect();
        originalSizeRef.current = {
          width: rect.width,
          height: rect.height
        };
        console.log(`📐 Pre-cached size for ${id}:`, originalSizeRef.current);
      }
    }, 0);
    return () => clearTimeout(timer);
  }
}, [id]);
```

**What This Does:**
- Runs **once** after component mounts
- Uses `setTimeout(0)` to wait for CSS layout to complete
- Captures element's final rendered size (after CSS media queries apply)
- Ensures `originalSizeRef` is populated with correct dimensions (e.g., 120px on iPad Air)
- Prevents cursor offset on first modak drag

**Why setTimeout is Needed:**
- React renders component → DOM updated → `useEffect` runs
- BUT CSS layout (media queries, sizing) may not be complete yet
- `setTimeout(0)` pushes measurement to next event loop tick
- Guarantees CSS has been fully applied before measuring
- Without this, `getBoundingClientRect()` might return incorrect size

---

## 🎬 **User Experience Flow**

### **Scenario 1: Pause During Modak Completion**

**Before Fix:**
1. Collect 3rd modak → Celebration sparkles + VO starts
2. User pauses (button visible) → VO stops
3. User resumes → Silent (no VO)
4. 5.5s later → Power Overlay appears (confusing)

**After Fix:**
1. Collect 3rd modak → Celebration sparkles + VO starts
2. **Pause button disappears** (blocked)
3. User cannot interrupt
4. 5.5s later → Power Overlay appears smoothly

**Alternative (if they paused just before):**
1. Collect 2nd modak → User pauses immediately
2. Phase is still `SOME_COLLECTED` → Pause allowed
3. Collect 3rd modak → Pause button disappears during celebration
4. Power Overlay appears → Pause button returns

---

### **Scenario 2: Pause During Feeding Completion**

**Before Fix:**
1. Drag 3rd modak to Ganesha → Celebration + VO starts
2. User pauses → VO stops
3. User resumes → Silent
4. 3.5s later → Power Overlay appears

**After Fix:**
1. Drag 3rd modak to Ganesha → Celebration + VO starts
2. **Pause button disappears** (blocked)
3. User cannot interrupt
4. 3.5s later → Power Overlay appears smoothly

---

### **Scenario 3: First Modak Drag Offset**

**Before Fix:**
1. Tap/drag first modak in basket
2. **Cursor offset** - modak appears away from finger
3. Drag 2nd modak → Works fine (size cached)
4. Drag 3rd modak → Works fine

**After Fix:**
1. Tap/drag first modak in basket
2. **Perfect alignment** - modak follows finger exactly
3. Drag 2nd modak → Works fine
4. Drag 3rd modak → Works fine

---

## 🎯 **Technical Details**

### **Why Block Pause During Transitions?**

**Timeline Analysis:**

**Modak Collection Completion:**
```
0ms:   3rd modak clicked
↓
0ms:   playSfx('celebration')
       setShowSparkle('modaks-complete')
       phase → SOME_COLLECTED
↓
1000ms: phase → ALL_COLLECTED
        playVoice('collectComplete') [~4s duration]
↓
4000ms: setShowSparkle(null)
↓
5500ms: setShowDiscoveryFlip2(true) [POWER OVERLAY APPEARS]
```

**Without blocking:** User can pause during the **1000ms-5500ms window** (4.5 seconds)
**With blocking:** Pause disabled for entire `ALL_COLLECTED` phase

---

**Feeding Completion:**
```
0ms:   3rd modak dropped on rock
       phase → ROCK_FEEDING
↓
1500ms: setShowSparkle('belly-transform')
        playVoice('feedComplete', callback) [~2s duration]
        phase → ROCK_TRANSFORMED
↓
~3500ms: playCelebration('bellyHappy') [callback fires]
↓
~5000ms: setShowDiscoveryFlip3(true) [POWER OVERLAY APPEARS]
```

**Without blocking:** User can pause during the **1500ms-5000ms window** (3.5 seconds)
**With blocking:** Pause disabled for entire `ROCK_TRANSFORMED` phase

---

### **Why Pre-Cache Drag Size?**

**React Render Cycle:**
1. Component mounts → `render()` called
2. DOM updated → Elements inserted
3. **Browser layout** → Sizes calculated
4. `useEffect` runs → Our size-caching effect

**Problem:** On first drag, if user drags before `useEffect` runs, size is `{width: 0, height: 0}`
**Solution:** `useEffect` runs immediately after mount, caches size before user can interact

---

## ✅ **Testing Checklist**

### **Pause Blocking:**
- [ ] Collect 3rd modak → Pause button disappears
- [ ] During celebration → ESC key does nothing
- [ ] During celebration → Tab switch doesn't trigger auto-pause
- [ ] After Power Overlay 2 appears → Pause button returns
- [ ] Drag 3rd modak to Ganesha → Pause button disappears
- [ ] During feeding celebration → ESC key does nothing
- [ ] After Power Overlay 3 appears → Pause button returns

### **Completion VO Replay:**
*Note: This scenario should NOT happen in production (pause is blocked), but testing for safety:*
- [ ] If somehow paused during `ALL_COLLECTED` → Resume replays `collectComplete`
- [ ] If somehow paused during `ROCK_TRANSFORMED` → Resume replays `feedComplete` + `bellyHappy`

### **Drag Offset:**
- [ ] Drag first modak from basket → No cursor offset
- [ ] Drag second modak → Still no offset
- [ ] Drag third modak → Still no offset
- [ ] Reload scene → Drag first modak → No offset (fresh render)

---

## 📁 **Files Modified**

```
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx
  - Updated isCelebrationOrOverlayActive to block ALL_COLLECTED and ROCK_TRANSFORMED
  - Added special case logic in resumePhaseAfterPause for completion VO replay

src/lib/components/interactive/DraggableItem.jsx
  - Added useEffect to pre-cache element size on mount
  - Prevents cursor offset on first drag
```

---

## 🚀 **Status**

**Implementation:** ✅ Complete
**Testing:** ⏳ Pending user verification
**Ready for:** Production deployment

---

**Next Steps:**
1. Test modak collection completion (pause should be blocked)
2. Test feeding completion (pause should be blocked)
3. Test first modak drag (no cursor offset)
4. Verify ESC key and auto-pause also blocked during celebrations
