# Ganeshas World Components and Gameplay

Source scanned: `C:\Users\Madhurima Agarwal\ganeshas-world\src\components`

| Component | File | Gameplay / Experience (from code) |
|---|---|---|
| `WelcomePage` | `WelcomePage.js` | Intro hub screen. Clickable Ganesha/Mouse show speech bubbles. Cards navigate to sections (`about`, `why-chant`, `learn-shloka`, `games`), plus a `Start Adventure` CTA. |
| `Navigation` | `Navigation.js` | Main router/container for the app sections. Handles mobile/desktop menu and switches pages between Welcome, About Quiz, Coloring, Shloka Learning, Memory, Balloon Pop, Arrange Shloka, and Decorate Altar. |
| `AboutMeQuiz` | `AboutMeQuiz.js` | 10-question MCQ quiz about Ganesha. Single answer lock per question, auto-advance after 1.5s, score tracking, progress bar, and result screen tiers (perfect / good / keep learning) with replay. |
| `ColoringActivity` | `ColoringActivity.js` | Interactive SVG coloring game. Player picks palette color and taps Ganesha parts (head, trunk, ears, tusk, belly, mouse, axe, modak). Shows educational fact per tapped part and completion message when all parts are colored. |
| `ShlokaLearning` | `ShlokaLearning.js` | Line-by-line shloka practice with meaning. After marking a line learned, an obstacle phase appears; “chant” simulation clears obstacle after timed sequence, then moves to next line. Progress % updates and full completion alert on finishing all 4 lines. |
| `MemoryGame` | `MemoryGame.js` | Card-match game with 8 Ganesha symbols (16 shuffled cards total). Flip two cards, match logic, move counter, symbol info popups on match, win state when all matched, restart support. |
| `WordBalloonGame` | `WordBalloonGame.js` | Timed (60s) balloon pop vocabulary game. Player pops balloons matching the meaning of a target word. Scoring: +10 correct, -5 wrong, level-up every 50 points (up to level 5), spawn speed scales with level, game-over screen with replay. |
| `ArrangeShloka` | `ArrangeShloka.js` | Ordering puzzle for 4 shloka lines. Player moves lines from shuffled pool to arrangement area, can remove/rearrange, uses hints, and wins only when line IDs are in exact order. Tracks moves/hints and shows final transliteration+meaning on success. |
| `DecorateAltar` | `DecorateAltar.js` | Decoration placement game across categories (idols, flowers, lights, foods, incense). Toggling items places/removes from altar. Celebration triggers when at least one item from every category is placed; includes reset flow and feedback messages. |

## Notes

- Several files include placeholder `console.log` sound calls (audio hooks not fully wired).
- Some emoji/Devanagari text appears mojibake-encoded in source display, but gameplay logic is clear.
