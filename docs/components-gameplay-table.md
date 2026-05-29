# Components and Gameplay Mapping

| Component | File | Gameplay Role | Key Inputs (Props) | Player Interaction / Progress |
|---|---|---|---|---|
| `TextInputModal` | `src/components/Textinputmodal.jsx` | Generic answer-entry modal used where the game asks open-text responses. | `prompt`, `onSave`, `onCancel`, `maxLength`, `initialValue`, `onAutoSave` | Player types response; Save enabled only for non-empty text; Enter submits (without Shift). Supports autosave while typing. |
| `GaneshaIntroStory` | `src/components/GaneshaIntroStory.jsx` | Intro story sequence before gameplay begins; introduces narrative and starts adventure flow. | `profileId`, `childName`, `onComplete` | Player taps through slides, can skip, sees end screen CTA. On finish sets `ganeshaStoryShown_<profileId>` in localStorage and triggers `onComplete`. Also attempts voice-over narration per slide. |
| `TapGate` | `src/components/welcome/TapGate.jsx` | First user-gesture gate to unlock browser audio/speech for later scenes. | `onUnlock` | Player taps “Tap to continue”; component unlocks HTML audio + speech synthesis and stores `ganesha_audio_enabled=true`, then calls `onUnlock`. |
| `ChantLearning` | `src/components/chant/ChantLearning.jsx` | Chant-learning mini experience with guided listening and practice mode line tracking. | `chant`, `audioSrc`, `onComplete` | Player plays/pauses chant audio, watches active line highlight by timestamp, can switch to Practice Mode and tap lines. Updates game progress via `updateProgress('chant', %)` and calls `onComplete` when practice run ends. |
| `Flipbook` | `src/components/flipbook/flipbook.jsx` | Page-flip story/learning module with sequential progression through pages. | `pages`, `onComplete` | Player navigates Previous/Next with flip animation. Updates progress via `updateProgress('book', %)` on page change and calls `onComplete` on final page. |

## Style-Only Component Files

These files support presentation/animation but do not contain gameplay logic:

- `src/components/Textinputmodal.css`
- `src/components/GaneshaIntroStory.css`
- `src/components/welcome/TapGate.css`
