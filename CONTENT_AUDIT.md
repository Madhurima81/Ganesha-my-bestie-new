# Ganesha My Bestie — Content Audit
## Tone, voice, and child experience check across all 22 scenes

---

## How to generate this file

Run this in Claude Code for each scene:
"Read CONTENT_AUDIT.md and sceneRegistry.js.
Then read [scene file path].
Find all text content — UI labels, instructions,
V/O scripts, modal text, hint text, celebration text.
Fill in the scene section below.
Flag issues and suggest fixes.
Update the SUMMARY section when done."

Always start with Scene 01 (NewModakSceneV7) as benchmark.

---

## The GMB Content Standard
Every piece of text in the app must feel like:
- Ganesha is your best friend talking directly to you
- A 5 year old can understand every word
- A 12 year old still finds it engaging — not babyish
- It makes the child feel proud, seen, and excited
- It connects their roots to their real life
- It never talks down to the child

---

## What Claude Code checks per scene

### 1. Ganesha voice — first person
- Does Ganesha speak as "I" not "Ganesha says"?
- Does it feel like a real friend talking, not a teacher?
- Is the tone warm, playful, and encouraging?
- Flag any text that sounds stiff, formal, or generic

### 2. Child-friendly language (age 5–12)
- Are words simple enough for a 5 year old to understand?
- Can a 12 year old still find it engaging — not babyish?
- Are sentences short and clear — one action at a time?
- Does the language feel age-appropriate across the range?
- Flag any word a 5 year old might not understand
  → note: TOO YOUNG
- Flag any text that feels too babyish for a 10–12 year old
  → note: TOO YOUNG-SKEWING
- Flag any sentence longer than 10 words

### 3. Emotional warmth
- Does the text make the child feel good about themselves?
- Is there celebration language when they succeed?
- Is the redirect gentle when they get something wrong?
- Does it connect to real feelings kids have?
- Flag any text that feels cold, robotic, or punishing

### 4. NRI identity connection
- Does the content help the child feel proud of their heritage?
- Does it connect Indian culture to their everyday life?
- Does it avoid making culture feel "foreign" or "other"?
- Flag any text that feels disconnected from a real NRI child's life

### 5. Cultural accuracy
- Is all Sanskrit correctly spelled and transliterated?
- Are cultural references accurate and respectful?
- Is Ganesha always portrayed as joyful and powerful?
- Flag any cultural inaccuracy immediately

### 6. Consistency across zones
- Does the tone match the benchmark (Scene 01)?
- Does Zone 4 feel as warm as Zone 1?
- Are celebration phrases varied — not the same line repeated?
- Flag any scene that feels tonally different from the rest

---

## Scoring per scene
Claude Code rates each scene out of 5 for each check:
5 = excellent, matches GMB standard perfectly
4 = good, minor tweaks needed
3 = okay, some rewrites needed
2 = below standard, significant rewrites needed
1 = does not meet GMB standard, full rewrite needed

---

## Age flag key
- 🔴 TOO HARD — a 5 year old won't understand this
- 🟡 TOO YOUNG-SKEWING — feels babyish for a 10–12 year old
- ✅ Works for full 5–12 range

## Format key
- ✅ Meets standard
- ⚠️ Minor fix needed — suggestion included
- ❌ Does not meet standard — rewrite needed
- 💡 Opportunity to make it more magical

---

## IMPORTANT — content change rule
Claude Code may FLAG and SUGGEST rewrites only.
Never change content without Madhurima's approval.
All suggested rewrites go in the "Suggested fixes" field.
Madhurima reviews and approves before any text is changed in the JSX.

---

## Scenes

---

### Scene 01 — Modak (NewModakSceneV7) ← BENCHMARK

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person**
- Score: /5
- Issues: —
- Suggested fixes: —

**Child-friendly language (5–12)**
- Score: /5
- Age flags: —
- Words to simplify: —
- Long sentences: —
- Suggested fixes: —

**Emotional warmth**
- Score: /5
- Issues: —
- Suggested fixes: —

**NRI identity connection**
- Score: /5
- Issues: —
- Suggested fixes: —

**Cultural accuracy**
- Score: /5
- Issues: —
- Suggested fixes: —

**Consistency with benchmark**
- Score: /5
- Issues: —
- Suggested fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 02 — Pond (PondSceneSimplifiedV4)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 03 — Symbol (SymbolMountainSceneV3)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 04 — Final Scene (SacredAssemblySceneV8)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 05 — Vakratunda Mahakaya (CaveSceneFixedV2)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 06 — Suryakoti Samaprabha (SuryakotiSceneV4)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 07 — Nirvighnam Kurumedeva (NirvighnamSceneV5)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 08 — Sarvakaryeshu Sarvada (SarvakaryeshuSarvadaV7)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 09 — Cave Finale (Cavescene5memoryfinale)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 10 — Vakratunda Grove (VakratundaGroveSimplified)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 11 — Suryakoti Bank (SuryakotiBankSimplified)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 12 — Nirvighnam Chant (NirvighnamChantSimplified)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 13 — Sarvakaryeshu Chant (SarvakaryeshuChantSimplified)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 14 — Shloka River Finale (ShlokaRiverFinale)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 15 — Piano Game (FestivalPianoGame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 16 — Rangoli Game (FestivalRangoliGame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 17 — Modak Cooking (ModakCookingGame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 18 — Mandap Decoration (MandapDecorationGame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 19 — Family Tree (Namebirthdaygame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 20 — Favorite Food (Familytreegame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 21 — Dreams Wishes (Favoritefoodgame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

### Scene 22 — Name Birthday (ObstacleRemoverGame)

**All text found in JSX:**
- Opening modal text:
- Instructions:
- Hint text:
- Celebration text:
- Completion text:
- Other:

**Ganesha voice — first person** — Score: /5 / Issues: — / Fixes: —
**Child-friendly language (5–12)** — Score: /5 / Age flags: — / Issues: — / Fixes: —
**Emotional warmth** — Score: /5 / Issues: — / Fixes: —
**NRI identity connection** — Score: /5 / Issues: — / Fixes: —
**Cultural accuracy** — Score: /5 / Issues: — / Fixes: —
**Consistency with benchmark** — Score: /5 / Issues: — / Fixes: —

**Overall score: /30**
**Priority fixes:**
- [ ]

---

## Summary
*Claude Code fills this after scanning all 22 scenes*

**Scenes scoring below 18/30 — need priority attention:**
- [ ]

**Most common issue across all scenes:**
- [ ]

**Scenes with cultural accuracy flags:**
- [ ]

**Scenes where language skews too young (10–12 year olds underserved):**
- [ ]

**Scenes where language is too hard for a 5 year old:**
- [ ]

**Celebration phrases used — check for repetition:**
- [ ]

**Overall app content score: /660**
**Target: 600+ before launch**