# First-Time User Audio Flow (VO / Ambient / SFX)

This is a flow-wise audio sheet for first-time journey: loading -> welcome -> profile -> intro story -> map -> scene progression.

Legend:
- `VO`: voice-over lines used
- `Ambient`: background ambience/music present
- `SFX`: tap/feedback/transition effects present

| Flow Step | Screen / Scene | VO Used | Ambient | SFX |
|---|---|---|---|---|
| 1 | Tap Gate (audio unlock) | "Tap to continue." | - | - |
| 2 | Main Welcome Screen | "Hi bestie... I'm Ganesha. Come play with me." / "Start." | - | - |
| 3 | Profile Welcome / Dashboard | "Welcome to the adventure, little explorer." | - | - |
| 4 | Intro Story Slide 1 | "Are you ready? Let's meet Ganesha!" | - | - |
| 5 | Intro Story Slide 2 | "My mom Parvati made me with love and brought me to life!" | - | - |
| 6 | Intro Story Slide 3 | "Mom said, Guard the door! But uh-oh, the visitor was Dad Shiva!" | - | - |
| 7 | Intro Story Slide 4 | "Mom felt very sad, so Dad gave me a magical elephant head!" | - | - |
| 8 | Intro Story Slide 5 | "Now we were together again, as one happy family!" | - | - |
| 9 | Intro Story End Screen | "And now, let's explore my world together!" | - | - |
| 10 | Map Screen (first load) | "Tap Symbol Mountain - that's where we start!" | ? (`/audio/ambient/map ambient sound.wav`) | ? (zone click/unlock synth SFX) |
| 11 | Map unlock events | "Look! The Shloka River is flowing!" / "Come inside! The About Me Hut is open!" / "The cave doors are opening!" / "The festival has begun!" | ? | ? |
| 12 | Zone Welcome Screen (generic) | "Welcome to {Zone Name}! Tap a card to begin." | (varies by zone scene implementation) | ? |
| 13 | Scene 1 - Modak | "Mooshika is nearby. Let's find the sweet modaks." (+ phase lines + idle hints) | ? (music track available globally via `useVoiceGuidance`) | ? |
| 14 | Scene 2 - Pond | "A golden lotus bud is waiting in this pond. Let's help it bloom." (+ phase lines + idle hints) | ? | ? |
| 15 | Scene 3 - Symbol | "Look, listen, and find what awakens the tusk." (+ phase lines + idle hints) | ? | ? |
| 16 | Scene 4 - Sacred Assembly | "You found every symbol... let's place them together." (+ phase lines + idle hints) | ? | ? |
| 17 | Scene 5 - Vakratunda Mahakaya | "Build the strength. Trace the curve slowly and feel the strength grow." (+ phase lines + idle hints) | ? | ? |
| 18 | Scene 6 - Suryakoti Samaprabha | "Spread the light. Tiny suns glow in the dark. Find them and let the cave shine." (+ phase lines + idle hints) | ? | ? |
| 19 | Scene 7 - Nirvighnam Kurumedeva | "Clear the way. Guide the path and move forward with ease." (+ phase lines + idle hints) | ? | ? |
| 20 | Scene 8 - Sarvakaryeshu Sarvada | "Choose with Ganesha. Take a quiet moment and choose wisely." (+ phase lines + idle hints) | ? | ? |
| 21 | Scene 9 - Cave Finale | "All meanings together. Match each Sanskrit word with its meaning." (+ idle hints) | ? | ? |
| 22 | Scene 10 - Vakratunda Grove | "Bloom the flowers. Listen and repeat." (+ phase lines + idle hints) | ? | ? |
| 23 | Scene 11 - Suryakoti Bank | "Sun and smiles. Call the light forward." (+ phase lines + idle hints) | ? | ? |
| 24 | Scene 12 - Nirvighnam Chant | "Clear the path with steady rhythm." (+ phase lines + idle hints) | ? | ? |
| 25 | Scene 13 - Sarvakaryeshu Chant | "Care and share. Say the words with heart." (+ phase lines + idle hints) | ? | ? |
| 26 | Scene 14 - Shloka River Finale | "All words flow together. Let your voice lead the river." (+ phase lines + idle hints) | ? | ? |
| 27 | Scene 15 - Piano Game | "Festival beats. Play and feel the rhythm." (+ idle hints) | ? | ? |
| 28 | Scene 16 - Rangoli Game | "Sparkly rangoli. Create something bright and beautiful." (+ idle hints) | ? | ? |
| 29 | Scene 17 - Modak Cooking | "Modak party. Sweet ingredients are ready." (+ idle hints) | ? | ? |
| 30 | Scene 18 - Mandap Decoration | "Mandap magic. Decorate in your own way." (+ idle hints) | ? | ? |
| 31 | Scene 19 - Family Tree | "Let's meet my family and yours!" (+ phase lines + idle hints) | ? | ? |
| 32 | Scene 20 - Favorite Food | "Let's explore my favorite things and yours!" (+ phase lines + idle hints) | ? | ? |
| 33 | Scene 21 - Dreams and Wishes | "Let's help and dream together!" (+ phase lines + idle hints) | ? | ? |
| 34 | Scene 22 - My Indian Story | "Tap to explore my India story and yours!" (+ phase lines + idle hints) | ? | ? |

## Shared SFX and Music Mapping
- Shared SFX keys configured: `tap`, `softWrong`, `discovery`, `revealBloom`, `place`, `transition`, `emotionalGlow`, `celebration`, `idleHint`, plus legacy `success`, `powerUnlock`, `error`, `whoosh`, `pop`, `chime`.
- Shared background music key configured: `ambient` -> `/audio/music/bg-ambient.mp3`.

## Source Files Used
- `VOICEOVER_SCENEWISE_WITH_IDLE_HINTS.md`
- `src/lib/config/content/voiceGuidance.js`
- `src/lib/hooks/useVoiceGuidance.js`
- `src/pages/CleanMapZone.jsx`
- `src/components/GaneshaIntroStory.jsx`
- `src/components/welcome/TapGate.jsx`
