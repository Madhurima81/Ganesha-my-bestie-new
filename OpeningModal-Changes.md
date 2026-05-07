# OpeningModal CSS — iPad Sizing Fixes

All changes go in `OpeningModal.css`.

---

## 1. Replace `.game-modal-content` (base)

```css
.game-modal-content {
  position: relative;
  width: 95%;
  max-width: 1700px;
  max-height: 80vh;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 26px;
  padding: 0 60px;
  transform: translateY(-20px);
}
```

---

## 2. Replace `.game-modal-card` (base)

```css
.game-modal-card {
  position: relative;
  flex: 0 0 45%;
  max-width: 560px;
  min-height: auto;
  max-height: min(70vh, 560px);
  background: linear-gradient(180deg, #FFFDF4 0%, #FFF4D8 100%);
  box-shadow: 0 20px 60px rgba(0,0,0,0.18), 0 0 0 6px rgba(255,255,255,0.35);
  border-radius: 32px;
  padding: clamp(20px, 3vh, 36px) clamp(24px, 3vw, 40px);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  animation: cardEntry 0.6s cubic-bezier(0.22, 1, 0.36, 1) 0.25s both;
  overflow-y: auto;
}
```

---

## 3. Replace `.game-modal-character img, .game-modal-character .game-modal-ganesha` (base)

```css
.game-modal-character img,
.game-modal-character .game-modal-ganesha {
  position: relative !important;
  left: auto !important;
  right: auto !important;
  top: auto !important;
  transform: scaleX(-1) !important;
  margin-right: -30px;
  width: 100%;
  max-width: 420px;
  height: auto;
  filter: drop-shadow(0 8px 20px rgba(0, 0, 0, 0.25));
  animation:
    ganeshaEntry 0.65s cubic-bezier(0.22, 1, 0.36, 1) 0.55s both,
    charBreathe 3s ease-in-out 1.3s infinite;
}
```

---

## 4. Replace `.game-modal-title` and `.game-modal-subtitle` (base)

```css
.game-modal-title {
  font-family: 'Baloo 2', system-ui, sans-serif;
  font-size: clamp(28px, 3vw, 44px) !important;
  font-weight: 800;
  color: var(--modal-text-primary);
  margin-bottom: 18px;
  line-height: 1.1;
  width: 100%;
}

.game-modal-subtitle {
  font-family: 'Nunito', sans-serif;
  font-size: clamp(16px, 1.6vw, 22px) !important;
  color: var(--modal-text-secondary);
  line-height: 1.4;
  margin-bottom: 20px !important;
  max-width: 90%;
}
```

---

## 5. Replace icon size clamps (both rules)

```css
.game-modal-icon-item img,
.game-modal-icon-circle {
  width: clamp(70px, 6vw, 100px);
  height: clamp(70px, 6vw, 100px);
  object-fit: contain;
  filter: drop-shadow(0 4px 6px rgba(0,0,0,0.06));
  animation:
    iconAppear 0.7s cubic-bezier(0.22, 1, 0.36, 1) 1.1s both,
    iconBreatheSoft 5s ease-in-out 1.8s infinite;
  background: transparent;
  border-radius: 0;
  padding: 0;
  border: none;
}

.game-modal-icons .game-modal-icon-circle,
.game-modal-icons .game-modal-icon-item img {
  width: clamp(70px, 6vw, 100px) !important;
  height: clamp(70px, 6vw, 100px) !important;
  background: transparent !important;
  border: none !important;
  border-radius: 0 !important;
  box-shadow: none !important;
  padding: 0 !important;
}
```

---

## 6. Replace `.game-modal-button` (base)

```css
.game-modal-button {
  font-family: 'Baloo 2', system-ui, sans-serif;
  background: var(--modal-btn-bg);
  color: var(--modal-btn-text);
  border: 2px solid var(--modal-btn-border, transparent);
  min-height: 54px;
  padding: clamp(12px, 1.5vw, 18px) clamp(32px, 4vw, 56px);
  font-size: clamp(18px, 1.8vw, 24px);
  font-weight: 800;
  border-radius: 90px;
  cursor: pointer;
  transition: box-shadow 0.15s ease;
  box-shadow: 0 10px 28px var(--modal-btn-shadow);
  text-transform: capitalize;
  white-space: nowrap;
  margin-top: 16px;
}
```

---

## 7. Replace existing iPad media query

Find: `@media (min-width: 768px) and (max-width: 1024px)`

Replace entire block with:

```css
/* iPAD PORTRAIT (Gen 6, Air, Pro 11 portrait) */
@media (min-width: 768px) and (max-width: 1024px) and (orientation: portrait) {
  .game-modal-content {
    max-height: 75vh;
    max-width: 92%;
    padding: 0 24px;
    gap: 12px;
  }

  .game-modal-card {
    flex: 0 0 55%;
    max-width: 480px;
    max-height: 560px;
    padding: 28px 28px;
    border-radius: 28px;
  }

  .game-modal-character {
    flex: 0 0 40%;
    margin-right: -30px;
  }

  .game-modal-character img,
  .game-modal-character .game-modal-ganesha {
    max-width: 320px;
  }

  .game-modal-title {
    font-size: 30px !important;
    margin-bottom: 12px;
  }

  .game-modal-subtitle {
    font-size: 17px !important;
    margin-bottom: 14px !important;
  }

  .game-modal-icons {
    gap: 12px;
    margin: 8px 0 16px;
  }

  .game-modal-icon-item img,
  .game-modal-icon-circle {
    width: 80px !important;
    height: 80px !important;
  }

  .game-modal-button {
    font-size: 19px;
    min-height: 50px;
    padding: 12px 40px;
    margin-top: 8px;
  }
}
```

---

## 8. Add iPad landscape block (NEW — append to end of file)

```css
/* iPAD LANDSCAPE — short height (Gen 6, Air, Pro 11 landscape) */
@media (min-width: 1024px) and (max-width: 1366px) and (max-height: 820px) {
  .game-modal-content {
    max-height: 90vh;
    max-width: 920px;
    padding: 0 24px;
    gap: 16px;
    transform: translateY(0);
  }

  .game-modal-card {
    flex: 0 0 50%;
    max-width: 460px;
    max-height: 88vh;
    padding: 20px 28px;
    border-radius: 26px;
    overflow-y: auto;
  }

  .game-modal-character {
    flex: 0 0 38%;
    margin-right: -20px;
  }

  .game-modal-character img,
  .game-modal-character .game-modal-ganesha {
    max-width: 280px;
    max-height: 70vh;
  }

  .game-modal-title {
    font-size: 26px !important;
    margin-bottom: 8px;
  }

  .game-modal-subtitle {
    font-size: 16px !important;
    margin-bottom: 10px !important;
    line-height: 1.3;
  }

  .game-modal-icons {
    gap: 10px;
    margin: 4px 0 10px;
  }

  .game-modal-icon-item img,
  .game-modal-icon-circle {
    width: 64px !important;
    height: 64px !important;
  }

  .game-modal-button {
    font-size: 17px;
    min-height: 44px;
    padding: 10px 32px;
    margin-top: 4px;
  }
}
```

---

## Coverage check

| Device | Orientation | Block triggered |
|---|---|---|
| iPhone | portrait | mobile portrait (`max-width: 600px`) |
| iPhone | landscape | mobile landscape (`568–1019px landscape`) |
| iPad Gen 6 / Air / Pro 11 | portrait (768×1024) | iPad portrait |
| iPad Gen 6 / Air / Pro 11 | landscape (1024×768) | iPad landscape |
| iPad Pro 12.9 | portrait (1024×1366) | iPad portrait |
| iPad Pro 12.9 | landscape (1366×1024) | base + landscape (height>820 falls to base) |
| Desktop | — | base |
