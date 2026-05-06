# Daily Dare Changes

## Core Behavior
- Replaced full-screen Daily Dare with bottom dock card on map (`dare-root--map`).
- Added smooth slide-up entry and soft fade-out on completion.
- Card now anchors low on map (`bottom: 12px`) for dock feel.

## Flow Simplification
- Removed heavy multi-step modal behavior and separate celebration screen.
- Kept single-card two-phase flow:
  - Phase 1: gratitude prompt
  - Phase 2: dare action
- Auto-transition from Phase 1 to Phase 2 after input (`1500ms`), no Next button.

## Content Architecture
- Kept dare content in `dareBank` and used directly in Phase 2:
  - `const dare = getTodaysDare(childAge)`
  - render `dare.text`
- Added dedicated gratitude system for Phase 1:
  - `src/lib/config/gratitudeBank.js`
  - `getTodaysGratitude(age)` with age-grouped banks (`5-7`, `8-10`, `11-12`)
  - avoids repeating last 5 prompts per age group.
- Centralized remaining UI copy in:
  - `src/lib/config/content/dailyDareContent.js`

## Voice Behavior
- VO now minimal and once/day:
  - speaks only gratitude prompt (`gratitude.text`) once per day using `voKey` guard.
- Removed extra VO responses and dare readout.

## Mic + Input
- Reused mic icon from `SyllableVoiceChallenge` asset:
  - `src/zones/shloka-river/core/assets/images/mic-icon.png`
- Styled mic as soft glowing orb with idle pulse.
- Improved speech fallback:
  - if recognition unavailable/errors/no transcript end, inline type input appears.

## UI Polish
- Reduced card visual weight, softened close icon.
- Improved readability hierarchy:
  - label softer
  - dare task text stronger and larger
  - CTA softened but readable
- Removed emojis from card copy.

## CTA / Reward
- CTA changed to: `I'll do it`
- Success state: `Yay!`
- Micro reward retained (tiny sparkle marker + quick close).

## Close Button Fix
- Fixed close reliability by:
  - explicit click handler (`preventDefault`, `stopPropagation`, `onClose`)
  - increased hit area and z-index.

## Map Integration
- Added map-trigger behavior in app flow.
- Added and retained `Test Daily Dare` map button for QA testing.
- Added chip flow support (`Share a happy moment`) for reopen state.

## Ambient Audio
- Reduced main map ambient volume from `0.20` to `0.10`.

## Files Added
- `src/lib/config/gratitudeBank.js`
- `dailydare.md` (this document)

## Files Updated (primary)
- `src/lib/components/twg/DailyDarePopup.jsx`
- `src/lib/components/twg/DailyDarePopup.css`
- `src/lib/config/content/dailyDareContent.js`
- `src/lib/config/content/index.js`
- `src/App.jsx`
- `src/pages/CleanMapZone.jsx`

## Backup Files Created Earlier
- `src/lib/components/twg/DailyDarePopup.original.jsx`
- `src/lib/components/twg/DailyDarePopup.original.css`
