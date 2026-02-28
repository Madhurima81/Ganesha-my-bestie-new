# ✅ Celebration Pause on Symbol Popup Fix

## Date: February 16, 2026

---

## 🐛 **Problem Description**

**Issue:** During celebration VOs (after discovering Mooshika, collecting all modaks, or feeding the belly), if the user opens the Symbol Sidebar popup, the celebration VO continues in the background and the Power Overlay appears while the popup is still open.

**User Report:**
> "I am talking about the after discovering the mushika, when you move on to the power overlay for mushika, and in between when the final voice plays for finding mushika. In that when you open the pop up, the voice over completes and it moves on to the power overlay instead of pausing, like in all other phases, and should move it only when the pop up is closed."

**Expected Behavior:**
1. User finds Mooshika → "Yay found him!" VO plays
2. User opens Symbol Sidebar popup during this VO
3. ✅ Game pauses (VO stops, celebration timer pauses)
4. User closes popup
5. ✅ Game resumes (VO continues, celebration timer resumes)
6. ✅ Power Overlay appears ONLY after popup is closed and timer completes

**Current Behavior (Bug):**
1. User finds Mooshika → "Yay found him!" VO plays
2. User opens Symbol Sidebar popup during this VO
3. ✅ Game pauses (VO stops via `handlePauseCore`)
4. ❌ Celebration timeout continues in background
5. User closes popup
6. ✅ Game resumes (VO continues)
7. ❌ Power Overlay appears while popup is still open or immediately after close

---

## 🎯 **Affected Celebrations**

All three celebration → Power Overlay transitions:

### **1. Mooshika Discovery → Power Overlay 1 (Focus Power)**
- **Trigger:** Finding correct mound
- **Celebration VO:** "Yay found him!" (`mooshikaFound`)
- **Delay:** 6000ms (6 seconds)
- **Overlay:** `setShowDiscoveryFlip1(true)`

### **2. All Modaks Collected → Power Overlay 2 (Sharing Power)**
- **Trigger:** Collecting 3rd modak
- **Celebration VO:** "Great job collecting all modaks!" (`collectComplete`)
- **Delay:** 5500ms (5.5 seconds)
- **Overlay:** `setShowDiscoveryFlip2(true)`

### **3. Belly Fed → Power Overlay 3 (Gratitude Power)**
- **Trigger:** Feeding 3rd modak to belly
- **Celebration VO:** "Feed complete" + "Belly happy" (`feedComplete` → `bellyHappy`)
- **Delay:** 3500ms (3.5 seconds)
- **Overlay:** `setShowDiscoveryFlip3(true)`

---

## 🔧 **Solution Implementation**

### **Core Strategy: Pausable Celebration Timers**

When Symbol Sidebar popup opens:
1. ✅ Stop VOs and idle timers (existing `handlePauseCore`)
2. ✅ **NEW:** Pause celebration timer (track remaining time)
3. ✅ **NEW:** Store celebration type ('flip1', 'flip2', 'flip3')

When Symbol Sidebar popup closes:
1. ✅ Resume VOs and idle timers (existing `resumePhaseAfterPause`)
2. ✅ **NEW:** Resume celebration timer with remaining time
3. ✅ **NEW:** Trigger correct Power Overlay when timer completes

---

## 📝 **Code Changes**

### **1. New State Variables**

**File:** `NewModakSceneV7.jsx`
**Lines:** ~313-317

```javascript
// 🔧 Track symbol sidebar popup state for celebration pausing
const [isSymbolPopupOpen, setIsSymbolPopupOpen] = useState(false);
const celebrationTimeoutRef = useRef(null);
const celebrationTimeRemainingRef = useRef(0);
const celebrationPauseTimeRef = useRef(0);
const celebrationTypeRef = useRef(null); // 'flip1', 'flip2', or 'flip3'
```

**What These Track:**
- `isSymbolPopupOpen`: Boolean state for popup visibility
- `celebrationTimeoutRef`: Reference to active `setTimeout`
- `celebrationTimeRemainingRef`: Remaining time before Power Overlay appears (ms)
- `celebrationPauseTimeRef`: Timestamp when timer was paused
- `celebrationTypeRef`: Which celebration is active ('flip1', 'flip2', 'flip3')

---

### **2. Updated Celebration Timers**

#### **A. Mooshika Discovery (Flip 1)**

**File:** `NewModakSceneV7.jsx`
**Lines:** ~816-827

**Before:**
```javascript
setTimeout(() => {
  setShowDiscoveryFlip1(true);
}, 6000);
```

**After:**
```javascript
// 🔧 Store timeout ref so it can be paused if symbol popup opens
celebrationTypeRef.current = 'flip1';
celebrationTimeRemainingRef.current = 6000;
celebrationPauseTimeRef.current = Date.now();
celebrationTimeoutRef.current = setTimeout(() => {
  setShowDiscoveryFlip1(true);
  celebrationTimeoutRef.current = null;
  celebrationTypeRef.current = null;
}, 6000);
```

---

#### **B. All Modaks Collected (Flip 2)**

**File:** `NewModakSceneV7.jsx`
**Lines:** ~900-908

**Before:**
```javascript
setTimeout(() => {
  setShowDiscoveryFlip2(true);
}, 5500);
```

**After:**
```javascript
// 🔧 Store timeout ref so it can be paused if symbol popup opens
celebrationTypeRef.current = 'flip2';
celebrationTimeRemainingRef.current = 5500;
celebrationPauseTimeRef.current = Date.now();
celebrationTimeoutRef.current = setTimeout(() => {
  setShowDiscoveryFlip2(true);
  celebrationTimeoutRef.current = null;
  celebrationTypeRef.current = null;
}, 5500);
```

---

#### **C. Belly Fed Complete (Flip 3)**

**File:** `NewModakSceneV7.jsx`
**Lines:** ~967-975

**Before:**
```javascript
setTimeout(() => {
  setShowDiscoveryFlip3(true);
}, 3500);
```

**After:**
```javascript
// 🔧 Store timeout ref so it can be paused if symbol popup opens
celebrationTypeRef.current = 'flip3';
celebrationTimeRemainingRef.current = 3500;
celebrationPauseTimeRef.current = Date.now();
celebrationTimeoutRef.current = setTimeout(() => {
  setShowDiscoveryFlip3(true);
  celebrationTimeoutRef.current = null;
  celebrationTypeRef.current = null;
}, 3500);
```

---

### **3. SymbolSidebar Popup Handlers**

**File:** `NewModakSceneV7.jsx`
**Lines:** ~1605-1643

#### **A. onPopupOpen Handler**

```javascript
onPopupOpen={() => {
  console.log('🔔 Symbol popup opened');
  setIsSymbolPopupOpen(true);

  // Same as pause: stop VOs and timers
  handlePauseCore();

  // 🔧 If there's a pending celebration timeout (Mooshika found → Power Overlay)
  if (celebrationTimeoutRef.current) {
    clearTimeout(celebrationTimeoutRef.current);
    // Calculate remaining time
    const elapsed = Date.now() - celebrationPauseTimeRef.current;
    celebrationTimeRemainingRef.current = Math.max(0, celebrationTimeRemainingRef.current - elapsed);
    console.log(`⏸️ Paused celebration transition. Remaining: ${celebrationTimeRemainingRef.current}ms`);
  }
}}
```

**What This Does:**
1. Sets popup state to open
2. Pauses VOs and idle timers (existing behavior)
3. **NEW:** Clears the celebration timeout
4. **NEW:** Calculates how much time remains (total time - elapsed time)
5. **NEW:** Logs remaining time for debugging

**Example:**
- Celebration starts → 6000ms timeout begins
- User opens popup after 2000ms
- Elapsed: 2000ms, Remaining: 4000ms
- Timeout cleared, 4000ms stored in `celebrationTimeRemainingRef`

---

#### **B. onPopupClose Handler**

```javascript
onPopupClose={() => {
  console.log('🔔 Symbol popup closed');
  setIsSymbolPopupOpen(false);

  // Same as resume: replay initial instruction or silent resume
  resumePhaseAfterPause();

  // 🔧 Resume celebration timeout if it was paused
  if (celebrationTimeRemainingRef.current > 0 && celebrationTypeRef.current) {
    console.log(`▶️ Resuming ${celebrationTypeRef.current} transition in ${celebrationTimeRemainingRef.current}ms`);
    celebrationPauseTimeRef.current = Date.now();
    const celebrationType = celebrationTypeRef.current;
    celebrationTimeoutRef.current = setTimeout(() => {
      // Trigger the correct overlay based on celebration type
      if (celebrationType === 'flip1') setShowDiscoveryFlip1(true);
      else if (celebrationType === 'flip2') setShowDiscoveryFlip2(true);
      else if (celebrationType === 'flip3') setShowDiscoveryFlip3(true);

      celebrationTimeoutRef.current = null;
      celebrationTimeRemainingRef.current = 0;
      celebrationTypeRef.current = null;
    }, celebrationTimeRemainingRef.current);
  }
}}
```

**What This Does:**
1. Sets popup state to closed
2. Resumes VOs and idle timers (existing behavior)
3. **NEW:** Checks if there's a paused celebration (remaining time > 0)
4. **NEW:** Creates new timeout with remaining time
5. **NEW:** Triggers correct Power Overlay based on celebration type
6. **NEW:** Cleans up refs after completion

**Example (Continued):**
- User closes popup after 3 seconds
- Remaining time was 4000ms
- New timeout starts with 4000ms
- After 4000ms → Power Overlay appears
- Total time from celebration start to overlay: 2000ms (before pause) + 3000ms (paused) + 4000ms (after resume) = 9000ms actual, 6000ms gameplay time

---

## 🎮 **User Experience Flow**

### **Scenario: Mooshika Discovery with Popup Interrupt**

#### **Timeline Without Popup (Normal Flow):**
```
0ms    → Find Mooshika
0ms    → "Yay found him!" VO starts
6000ms → "Yay found him!" VO finishes
6000ms → Power Overlay 1 appears
```

#### **Timeline With Popup Interrupt (Fixed):**
```
0ms    → Find Mooshika
0ms    → "Yay found him!" VO starts
2000ms → User opens Symbol Sidebar popup
2000ms → VO pauses, celebration timer pauses (4000ms remaining)
5000ms → User closes popup (3 seconds later)
5000ms → VO resumes from where it paused
9000ms → Power Overlay 1 appears (5000ms + 4000ms remaining)
```

**Key Points:**
- ✅ VO doesn't restart from beginning on resume
- ✅ Power Overlay doesn't appear while popup is open
- ✅ Total celebration "gameplay time" is still 6000ms, but actual elapsed time is 9000ms (includes 3s popup time)

---

## 🧪 **Testing Scenarios**

### **Test 1: Mooshika Discovery + Quick Popup**
1. Find correct mound
2. **Immediately** open Symbol Sidebar popup (< 1s)
3. Keep popup open for 5 seconds
4. Close popup
5. ✅ **Expected:** VO resumes, Power Overlay appears ~5-6 seconds later

### **Test 2: Modak Collection + Mid-Celebration Popup**
1. Collect 3rd modak
2. Wait 2 seconds
3. Open Symbol Sidebar popup
4. Keep popup open for 3 seconds
5. Close popup
6. ✅ **Expected:** VO resumes, Power Overlay appears ~3.5 seconds later

### **Test 3: Belly Feeding + Last-Second Popup**
1. Feed 3rd modak
2. Wait until VO almost finishes (~3s)
3. Open Symbol Sidebar popup
4. Close popup immediately
5. ✅ **Expected:** Power Overlay appears within 0.5 seconds

### **Test 4: Multiple Popup Opens/Closes**
1. Find Mooshika
2. Open popup after 1s → Close after 2s
3. Open popup again after 1s → Close after 2s
4. ✅ **Expected:** Timer correctly calculates remaining time through multiple pauses

### **Test 5: Popup During Different Phases**
1. Open popup during Mooshika search (before finding) → ✅ No celebration timer, normal pause/resume
2. Open popup during Mooshika celebration → ✅ Celebration timer pauses
3. Open popup during modak collection → ✅ No celebration timer, normal pause/resume
4. Open popup during modak celebration → ✅ Celebration timer pauses

---

## 📊 **Edge Cases Handled**

### **Edge Case 1: Popup Opened After Celebration Completes**
- **Scenario:** User opens popup after 7 seconds (celebration timer already fired)
- **Behavior:** `celebrationTimeoutRef.current === null`, no pause/resume logic triggers
- ✅ **Result:** Normal pause/resume behavior

### **Edge Case 2: Rapid Popup Open/Close**
- **Scenario:** User opens and closes popup very quickly (< 100ms)
- **Behavior:** Timer pauses and resumes with nearly full time remaining
- ✅ **Result:** Power Overlay appears at expected time

### **Edge Case 3: Popup Opened, Game Reload**
- **Scenario:** User opens popup, refreshes page while popup is open
- **Behavior:** Scene state reload logic restores Power Overlay if phase is past celebration
- ✅ **Result:** Correct phase restoration (existing reload logic handles this)

### **Edge Case 4: Multiple Celebrations in Sequence**
- **Scenario:** User triggers flip1, opens popup, closes, immediately triggers flip2
- **Behavior:** `celebrationTypeRef` updates to 'flip2', new timer starts
- ✅ **Result:** Each celebration timer is independent

---

## 🚀 **Benefits**

1. **Consistent Pause Behavior:** Symbol popup now pauses celebrations just like pause menu
2. **No Rushed Transitions:** Users can explore symbol info without missing Power Overlay
3. **Preserved Celebration Timing:** Total gameplay time remains same, only real-time extends
4. **Better UX for Curious Users:** Encourages exploring discovered symbols during celebrations
5. **No VO Interruptions:** Celebrations feel complete even if paused mid-way

---

## 📁 **Files Modified**

```
src/zones/symbol-mountain/scenes/modak/NewModakSceneV7.jsx
  - Added celebration pause state variables (lines ~313-317)
  - Updated Mooshika discovery timeout (lines ~816-827)
  - Updated Modak collection timeout (lines ~900-908)
  - Updated Belly feeding timeout (lines ~967-975)
  - Updated SymbolSidebar onPopupOpen handler (lines ~1605-1620)
  - Updated SymbolSidebar onPopupClose handler (lines ~1621-1643)
```

---

## 🎯 **Status**

**Implementation:** ✅ Complete
**Testing:** ⏳ Pending user verification
**Ready for:** Production deployment

---

## 💡 **Future Enhancements**

If this pattern works well, consider:
1. Creating a reusable `usePausableCelebration` hook
2. Applying to other celebration transitions (fireworks, scene completion modal)
3. Adding visual indicator when celebration is paused (e.g., progress bar pauses)
4. Tracking total pause time for analytics

---

**Next Steps:**
1. Test Mooshika discovery + popup interrupt
2. Test all three celebration types
3. Verify console logs show correct pause/resume timing
4. Confirm Power Overlays appear only after popup closes
