# UnifiedButtonV2 - Duplicate Files Found

## Summary

Found **3 identical UnifiedButtonV2.jsx files** in different locations. They are exact duplicates (only comment header differs).

---

## Duplicate Locations

### ✅ **Main/Lib Version (Should be the only one)**
**File:** `src/lib/components/ui/Button/UnifiedButtonV2.jsx`
**Status:** This is the correct location
**Line Count:** 38 lines

### ❌ **Duplicate 1 - River Zone**
**File:** `src/zones/shloka-river/core/UnifiedButtonV2.jsx`
**Status:** DUPLICATE - Should be deleted
**Line Count:** 38 lines
**Difference:** Only comment header (line 1)

### ❌ **Duplicate 2 - Cave Zone**
**File:** `src/zones/meaning cave/components/UnifiedButtonV2.jsx`
**Status:** DUPLICATE - Should be deleted
**Line Count:** 38 lines
**Difference:** Only comment header (line 1)

---

## Which Files Use Which Button

### **Using Lib Version (Correct ✅):**
- `src/zones/symbol-mountain/scenes/modak/NewModakSceneV6.jsx`
  - Import: `import UnifiedButtonV2 from '../../../../lib/components/ui/Button/UnifiedButtonV2';`

### **Using River Duplicate (Need to Fix ⚠️):**
- `src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx`
  - Import: `import UnifiedButtonV2 from '../../core/UnifiedButtonV2';`
- `src/zones/shloka-river/core/ManualRoundMode.jsx`
  - Import: `import UnifiedButtonV2 from './UnifiedButtonV2';`
- `src/zones/shloka-river/core/PauseModal.jsx`
  - Import: `import UnifiedButtonV2 from './UnifiedButtonV2';`

### **Using Cave Duplicate (Need to Fix ⚠️):**
- `src/zones/meaning cave/components/DoorUnlockedModal.jsx`
  - Import: `import UnifiedButtonV2 from './UnifiedButtonV2';`
- `src/zones/meaning cave/components/RescueModal.jsx`
  - Import: `import UnifiedButtonV2 from './UnifiedButtonV2';`

### **Not Using UnifiedButton:**
- About Me scenes (name-birthday, family-tree, favorite-food, dreams-wishes)
- Most other zones

---

## Recommendation: Consolidate

### **Step 1: Update Imports**

**River Files (3 files):**
```javascript
// Change FROM:
import UnifiedButtonV2 from '../../core/UnifiedButtonV2';
import UnifiedButtonV2 from './UnifiedButtonV2';

// Change TO:
import UnifiedButtonV2 from '../../../../lib/components/ui/Button/UnifiedButtonV2';
```

**Files to update:**
1. `src/zones/shloka-river/scenes/Scene1/VakratundaGroveSimplified.jsx`
2. `src/zones/shloka-river/core/ManualRoundMode.jsx`
3. `src/zones/shloka-river/core/PauseModal.jsx`

**Cave Files (2 files):**
```javascript
// Change FROM:
import UnifiedButtonV2 from './UnifiedButtonV2';

// Change TO:
import UnifiedButtonV2 from '../../../lib/components/ui/Button/UnifiedButtonV2';
```

**Files to update:**
1. `src/zones/meaning cave/components/DoorUnlockedModal.jsx`
2. `src/zones/meaning cave/components/RescueModal.jsx`

### **Step 2: Delete Duplicates**

After updating imports, delete these files:
1. ❌ `src/zones/shloka-river/core/UnifiedButtonV2.jsx`
2. ❌ `src/zones/meaning cave/components/UnifiedButtonV2.jsx`

Also delete associated CSS files if they exist:
1. ❌ `src/zones/shloka-river/core/UnifiedButtonV2.css` (if exists)
2. ❌ `src/zones/meaning cave/components/UnifiedButtonV2.css` (if exists)

---

## CSS File Status

Need to check if CSS duplicates exist:
- `src/lib/components/ui/Button/UnifiedButtonV2.css` (main)
- `src/zones/shloka-river/core/UnifiedButtonV2.css` (check if exists)
- `src/zones/meaning cave/components/UnifiedButtonV2.css` (check if exists)

---

## Impact Analysis

**Total Files Affected: 5 files**
- 3 River zone files
- 2 Cave zone files

**Risk Level:** LOW
- Simple import path change
- No logic changes needed
- Button component is identical across all 3 files

**Testing Needed:**
- Test River scenes after update (VakratundaGroveSimplified + modal components)
- Test Cave scenes after update (DoorUnlockedModal, RescueModal)

---

## Why This Happened

**Pattern:** Zone-specific copies were likely created during development:
1. Original button created in lib
2. River zone copied it locally for quick iteration
3. Cave zone also copied it locally
4. All 3 versions stayed in sync (38 lines each)
5. Symbol Mountain correctly uses lib version

**Solution:** Consolidate to single source of truth in `/lib/components/ui/Button/`

---

**Status:** Duplicates identified
**Date:** January 24, 2026
**Total Duplicates:** 2 files (River + Cave)
**Files Using Lib Version:** 1 (Modak scene)
**Files Using Duplicates:** 5 (3 River + 2 Cave)

