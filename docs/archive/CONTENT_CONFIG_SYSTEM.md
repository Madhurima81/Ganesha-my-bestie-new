# Content Configuration System

## 📁 Structure

All scene content is now centralized in `src/lib/config/content/`:

```
src/lib/config/content/
├── index.js              # Central export (import from here)
├── openingModals.js      # All 22 opening modal content
├── sceneHeaders.js       # Phase-specific header text
├── discoveryContent.js   # Discovery overlay content (learning zones only)
└── modalContent.js       # Regular modals, resume messages, success messages
```

---

## 🎯 Content by Zone Type

### **Learning Zones** (Cave, Symbol Mountain, River)
These zones have **5 content surfaces**:

1. ✅ **Opening Modal** - Welcome screen when entering scene
2. ✅ **Headers** - Phase-specific game instructions
3. ✅ **Discovery Overlays** - Symbol reveals + power teachings (2 stages)
4. ✅ **Symbol Sidebar** - Shows unlocked symbols with affirmations
5. ✅ **Resume Messages** - When returning to incomplete scene

### **Play Zones** (Festival Square, About Me Hut)
These zones have **3 content surfaces**:

1. ✅ **Opening Modal** - Welcome screen
2. ✅ **Headers** - Phase-specific instructions
3. ✅ **Regular Modals** - Completion messages (NO discovery overlay)

---

## 📝 Content Files Explained

### 1. `openingModals.js`
**Purpose:** First screen players see when entering a scene

**Structure:**
```javascript
{
  title: "Welcome to Scene!",
  subtitle: "Learn 2 words!",
  description: "Additional context...",
  icons: ['symbol1', 'symbol2'],
  buttonText: "Begin!",
  character: 'ganesha-headphones'
}
```

**Usage:**
```javascript
import { getOpeningModal } from '@/lib/config/content';

const content = getOpeningModal('symbol-mountain', 'modak-scene');
// Returns: { title: "Help Ganesha Save the Forest!", ... }
```

---

### 2. `sceneHeaders.js`
**Purpose:** Dynamic headers shown during gameplay (phase-specific)

**Features:**
- ✅ Phase-based headers (search, collection, feeding, etc.)
- ✅ Variable substitution (e.g., `{count}` for progress)
- ✅ Emoji support for visual appeal

**Structure:**
```javascript
'symbol-mountain': {
  'modak-scene': {
    search: "🔍 WHERE IS MOOSHIKA? Click the mounds!",
    collection: "🍬 HELP MOOSHIKA! Collect {count}/3 modaks!",
    feeding: "🪨 FEED GANESHA! Share {count}/3 modaks!"
  }
}
```

**Usage:**
```javascript
import { getSceneHeader, formatHeader } from '@/lib/config/content';

// Get header template
const template = getSceneHeader('symbol-mountain', 'modak-scene', 'collection');

// Format with variables
const header = formatHeader(template, { count: 2 });
// Returns: "🍬 HELP MOOSHIKA! Collect 2/3 modaks!"
```

---

### 3. `discoveryContent.js`
**Purpose:** Discovery overlay content (ONLY for learning zones)

**Features:**
- ✅ 2-stage reveals (celebration → power teaching)
- ✅ Symbol unlocking animations
- ✅ Power affirmations
- ✅ Mission briefings

**Structure:**
```javascript
{
  celebration: {
    title: "You Found Mooshika!",
    text: "He was hiding, waiting just for you!",
    icon: 'mooshika-happy'
  },
  power: {
    title: "Focus Power Unlocked!",
    text: "Your mind is like a little mouse...",
    affirmation: "I can focus",
    mission: "Let's use this power!",
    buttonText: "Let's Collect Modaks!"
  }
}
```

**Usage:**
```javascript
import { getDiscoveryContent, hasDiscoveryOverlay } from '@/lib/config/content';

// Check if zone uses discovery overlays
if (hasDiscoveryOverlay('symbol-mountain')) {
  const content = getDiscoveryContent('symbol-mountain', 'modak-scene', 'mooshika');

  // Stage 1: Celebration
  console.log(content.celebration.title); // "You Found Mooshika!"

  // Stage 2: Power teaching
  console.log(content.power.affirmation); // "I can focus"
}
```

---

### 4. `modalContent.js`
**Purpose:** Regular modals, resume messages, success messages

**Contains 3 sections:**

#### **A. MODAL_CONTENT**
Regular modals for play zones and cave door completions

```javascript
{
  title: "Door Unlocked!",
  description: "You chanted VAKRATUNDA!",
  icon: 'door-open',
  buttonText: "Start Tracing"
}
```

#### **B. RESUME_MESSAGES**
Shown when player returns to incomplete scene

```javascript
{
  collectionInProgress: "Continue collecting modaks! You have {count}/3 in the basket!"
}
```

#### **C. SUCCESS_MESSAGES**
Quick celebration messages

```javascript
{
  syllableMatched: "Great match!",
  symbolUnlocked: "Symbol unlocked!",
  perfectScore: "Perfect score!"
}
```

**Usage:**
```javascript
import { getModalContent, getResumeMessage, getSuccessMessage } from '@/lib/config/content';

// Get modal
const modal = getModalContent('meaning-cave', 'vakratunda-mahakaya', 'door1Complete');

// Get resume message with variables
const resume = getResumeMessage('symbol-mountain', 'modak-scene', 'collectionInProgress', { count: 2 });

// Get success message
const success = getSuccessMessage('symbolUnlocked');
```

---

## 🔧 How to Use in Scenes

### **Step 1: Import content helpers**
```javascript
import {
  getOpeningModal,
  getSceneHeader,
  formatHeader,
  getDiscoveryContent,
  getModalContent,
  getResumeMessage
} from '../../../lib/config/content';
```

### **Step 2: Get content in component**
```javascript
const ModakScene = ({ zoneId = 'symbol-mountain', sceneId = 'modak-scene' }) => {
  // Opening modal
  const openingModal = getOpeningModal(zoneId, sceneId);

  // Headers (use formatHeader for dynamic content)
  const searchHeader = getSceneHeader(zoneId, sceneId, 'search');
  const collectionHeader = formatHeader(
    getSceneHeader(zoneId, sceneId, 'collection'),
    { count: modaksCollected }
  );

  // Discovery content
  const mooshikaDiscovery = getDiscoveryContent(zoneId, sceneId, 'mooshika');

  // Resume message
  const resumeMsg = getResumeMessage(zoneId, sceneId, 'collectionInProgress', {
    count: modaksCollected
  });

  return (
    <div>
      {/* Use content in JSX */}
      <h1>{openingModal.title}</h1>
      <p>{openingModal.subtitle}</p>
      {/* ... */}
    </div>
  );
};
```

---

## ✅ Current Status

### **Completed (3 Learning Zones):**
- ✅ Cave: vakratunda-mahakaya scene (fully populated)
- ✅ Symbol Mountain: modak-scene (fully populated)
- ✅ Shloka River: vakratunda-grove scene (fully populated)

### **TODO (Remaining Scenes):**
All items marked with `TODO:` need content from actual scene files:

**Cave (4 scenes):**
- suryakoti-samaprabha
- nirvighnam-kurumedeva
- sarvakaryeshu-sarvada
- final-meaning-scene

**Symbol Mountain (2 scenes):**
- pond-scene
- tusk-scene

**Shloka River (4 scenes):**
- suryakoti-bank
- nirvighnam-chant
- sarvakaryeshu-chant
- shloka-river-finale

**Festival Square (4 scenes):**
- piano-game
- rangoli-game
- cooking-game
- mandap-decor

**About Me Hut (4 scenes):**
- name-scene
- family-tree
- food-scene
- enjoy-scene

---

## 🎯 Next Steps

### **Phase 1: Fill in TODO Content**
1. Read actual scene files (one zone at a time)
2. Extract hardcoded text strings
3. Replace TODO placeholders with actual content
4. Test in one scene per zone

### **Phase 2: Update Scene Components**
1. Replace hardcoded strings with content imports
2. Update opening modals to use config
3. Update headers to use config
4. Update discovery overlays to use config
5. Update modals to use config

### **Phase 3: Cleanup**
1. Remove all hardcoded text from scenes
2. Verify all 22 scenes use content configs
3. Document any scene-specific content patterns

---

## 💡 Benefits of This System

1. ✅ **Single Source of Truth** - All content in one place
2. ✅ **Easy Updates** - Change text without touching scene files
3. ✅ **Consistency** - Same message format across all scenes
4. ✅ **Localization Ready** - Easy to add multiple languages later
5. ✅ **Type Safety** - Can add TypeScript types for content structure
6. ✅ **Testing** - Easy to test content without rendering scenes
7. ✅ **Reusability** - Common messages (success, errors) used everywhere

---

## 📚 File Locations

- **Content Configs:** `src/lib/config/content/`
- **Helper Functions:** Exported from each config file
- **Central Import:** `src/lib/config/content/index.js`
- **This Documentation:** `CONTENT_CONFIG_SYSTEM.md`

---

**Last Updated:** January 24, 2026
**Status:** Phase 0 Complete - Content structure created with 3 learning zones populated
