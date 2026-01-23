# Unified Modal System - Implementation Guide

## 📋 Overview

A **single modal component** that works across all 5 zones with consistent cream background and zone-adaptive borders/shadows.

---

## 🎨 Design Philosophy

### **The Constant: Cream Background**
- **Background**: `#FFF9F2` (Warm Cream) - NEVER changes
- Creates a consistent "paper sticker" feel across all zones

### **The Variable: Zone Colors**
- **Border**: Uses `--zone-current-accent` (changes per zone)
- **Shadow**: Uses `--zone-current-shadow` (3D depth effect)
- Automatically adapts when placed in different zones

---

## 📦 Files Created

### 1. **UnifiedModal.jsx**
Location: `src/lib/components/ui/Modal/UnifiedModal.jsx`

A reusable React component with:
- Cream background (constant)
- Zone-adaptive borders (variable)
- Icon/image support
- Flexible button configuration
- Size variants (small, medium, large)
- Responsive design

### 2. **UnifiedModal.css**
Location: `src/lib/components/ui/Modal/UnifiedModal.css`

Features:
- Uses CSS variables for zone colors
- 3D sticker effect (5px border + 10px solid shadow)
- Responsive breakpoints
- Accessibility support
- Smooth animations

---

## 🏛️ Zone Color System

### **Updated Cave Colors** (Changed from Purple → Warm Earth)

| Element | Old (Purple) | New (Warm Earth) |
|---------|-------------|------------------|
| Base | `#F2F1F7` (Indigo) | `#EEDCC5` (Warm Sand) |
| Accent | `#6A4C93` (Purple) | `#8D4E2A` (Burnt Sienna) |
| Shadow | Purple 20% | `rgba(93, 51, 29, 0.3)` |
| Soft | `#DED9E8` (Lavender) | `#F5E6D3` (Soft Cream) |

### **All 5 Zone Colors**

| Zone | Base | Accent | Shadow |
|------|------|--------|--------|
| **About-Me Hut** | `#FFFDF2` (Cream) | `#8D4B38` (Terracotta) | Brown 20% |
| **Symbol Mountain** | `#F0F7F7` (Mist) | `#52727E` (Slate) | Gray 20% |
| **Festival Square** | `#FFF9F0` (Saffron) | `#E67E22` (Marigold) | Orange 20% |
| **Meaning Cave** | `#EEDCC5` (Sand) | `#8D4E2A` (Sienna) | Brown 30% |
| **Shloka River** | `#F4F9F4` (Moss) | `#2D5A27` (Forest) | Green 20% |

---

## 💡 Usage Examples

### **Basic Modal**
```jsx
import UnifiedModal from '../lib/components/ui/Modal/UnifiedModal';

<UnifiedModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Door Unlocked!"
  confirmText="Start Challenge"
  onConfirm={handleStart}
>
  <p>You completed the word! Click to continue.</p>
</UnifiedModal>
```

### **Modal with Icon**
```jsx
<UnifiedModal
  isOpen={showModal}
  onClose={() => setShowModal(false)}
  title="Amazing Work!"
  iconImage={vakratundaSymbol}
  iconSize="120px"
  confirmText="Continue Adventure"
  confirmVariant="info"
  onConfirm={handleContinue}
>
  <p>You discovered the power of Vakratunda!</p>
</UnifiedModal>
```

### **Modal with Cancel Button**
```jsx
<UnifiedModal
  isOpen={showPauseModal}
  title="Take a Break?"
  confirmText="Keep Playing"
  cancelText="Exit to Menu"
  onConfirm={handleResume}
  onCancel={handleExit}
  closeOnOverlayClick={false}
>
  <p>Your progress is saved! 🌟</p>
</UnifiedModal>
```

### **Zone-Specific Styling (Auto)**
```jsx
// In Festival Square scene
<div data-zone="festival-square">
  <UnifiedModal /* Will use orange border */ />
</div>

// In Meaning Cave scene
<div data-zone="meaning-cave">
  <UnifiedModal /* Will use brown border */ />
</div>
```

---

## 🔧 Props Reference

### **Core Props**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `isOpen` | boolean | - | Show/hide modal |
| `onClose` | function | - | Close handler |
| `title` | string | - | Modal title |
| `children` | ReactNode | - | Modal content |

### **Icon/Image**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `iconImage` | string | - | Image URL |
| `iconSize` | string | `'120px'` | Icon dimensions |

### **Buttons**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `confirmText` | string | `'Continue'` | Confirm button text |
| `onConfirm` | function | - | Confirm handler |
| `cancelText` | string | - | Cancel button text (optional) |
| `onCancel` | function | - | Cancel handler |
| `confirmVariant` | string | `'primary'` | Button variant |
| `cancelVariant` | string | `'secondary'` | Cancel button variant |

### **Options**
| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `showCloseButton` | boolean | `false` | Show X button |
| `closeOnOverlayClick` | boolean | `false` | Close when clicking outside |
| `size` | string | `'medium'` | `'small'`, `'medium'`, `'large'` |
| `zone` | string | - | Override zone (optional) |

---

## 📱 Responsive Behavior

### **Desktop** (>768px)
- Max width: 500px (medium)
- Padding: 40px 50px
- Border: 5px solid
- Shadow: 10px bottom

### **Tablet** (768px)
- Max width: 90%
- Padding: 30px 35px
- Border: 4px solid
- Shadow: 8px bottom

### **Mobile** (<480px)
- Padding: 25px 25px
- Border radius: 20px
- Smaller text sizes
- Icon: 90px

### **Landscape** (height <600px)
- Reduced padding
- Max height: 85vh
- Scrollable content

---

## 🔄 Migration Guide

### **Replace Old Modals**

**Before** (Zone-specific modal):
```jsx
import DoorUnlockedModal from './DoorUnlockedModal';

<DoorUnlockedModal
  show={showModal}
  title="Door Unlocked!"
  description="You completed the word!"
  buttonText="Start"
  onStart={handleStart}
  symbolImage={symbol}
/>
```

**After** (Unified modal):
```jsx
import UnifiedModal from '../lib/components/ui/Modal/UnifiedModal';

<UnifiedModal
  isOpen={showModal}
  title="Door Unlocked!"
  iconImage={symbol}
  confirmText="Start"
  onConfirm={handleStart}
>
  <p>You completed the word!</p>
</UnifiedModal>
```

---

## 📊 Files Updated

### **New Files Created:**
1. ✅ `src/lib/components/ui/Modal/UnifiedModal.jsx`
2. ✅ `src/lib/components/ui/Modal/UnifiedModal.css`

### **Updated Files:**
1. ✅ `src/lib/styles/zone-themes.css` - Updated cave colors
2. ✅ `src/zones/meaning cave/components/UnifiedHeaderV2.css` - Updated cave header colors

---

## 🎯 Next Steps

### **To Use in Cave Scene:**
1. Import UnifiedModal in CaveSceneFixedV2.jsx
2. Replace DoorUnlockedModal with UnifiedModal
3. Wrap scene in `<div data-zone="meaning-cave">`

### **To Roll Out to All Zones:**
1. Update each scene to import UnifiedModal
2. Replace zone-specific modals
3. Ensure parent has correct `data-zone` attribute
4. Test color adaptation in each zone

---

## ✅ Benefits

- **Consistency**: Same modal look across all 22 scenes
- **Maintainability**: One component to update instead of 5
- **Automatic Theming**: Colors change based on zone
- **Responsive**: Works on all devices
- **Accessible**: Keyboard navigation, screen reader support
- **Professional**: Clean, modern 3D sticker design

---

**Version**: 1.0.0
**Created**: January 2026
**Zones**: All 5 zones (About-Me, Symbol Mountain, Festival, Cave, River)
