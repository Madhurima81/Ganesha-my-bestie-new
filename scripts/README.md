# 🎨 UI Consistency Checker Agent

An automated agent that scans your Ganesha learning app codebase for UI consistency issues and generates a detailed report.

## 🚀 Quick Start

### Run the Agent

```bash
# Generate a report (default mode)
npm run check-ui

# Interactive mode (coming soon)
npm run check-ui:interactive

# Auto-fix mode (coming soon)
npm run check-ui:fix
```

## 📊 What It Checks

The agent analyzes 214+ scene files across 4 zones and checks for:

### 1. **Scene Headers**
- ✅ Standard header structure and class names
- ⚠️ Hardcoded inline styles (should use CSS classes)
- ⚠️ Missing Framer Motion animations
- ⚠️ Inconsistent h1/h2/h3 usage

### 2. **Modals**
- ✅ Standard modal class patterns (`modal-overlay`, `modal-content`)
- ⚠️ Non-standard modal classes
- ⚠️ Close button positioning (should be top-right)
- ⚠️ Inconsistent modal structures

### 3. **Completion Screens**
- 📊 Usage of completion components (SceneCompletionCelebration, DivineBlessingRain)
- ⚠️ Hardcoded star emojis (should use StarDisplay component)
- 📊 Pattern analysis across scenes

### 4. **Zone Colors**
- 🎨 Hardcoded hex colors that should use CSS variables
- 📊 Color usage statistics
- 💡 Recommended CSS variable system

### 5. **Animations**
- ⏱️ Animation duration consistency
- ⚠️ Unusual durations (too fast < 0.2s or too slow > 2.0s)
- 📊 Most common duration recommendations

### 6. **Button Classes**
- ✅ Standard button class usage (`primary-btn`)
- ⚠️ Non-standard variations (`button-primary`, `btn-primary`)

## 📁 Output

The agent generates a comprehensive markdown report:

**Location:** `UI-CONSISTENCY-REPORT.md` (in project root)

**Report includes:**
- Summary statistics (files scanned, total issues)
- Issues grouped by file with line numbers
- Pattern usage analysis
- Color usage statistics
- Recommended standardized components
- CSS templates for consistency
- Prioritized next steps

## 🎯 How to Use the Report in VS Code

1. **Open the report:**
   ```bash
   code UI-CONSISTENCY-REPORT.md
   ```

2. **Navigate to issues:**
   - Press `Ctrl+G` (Windows/Linux) or `Cmd+G` (Mac)
   - Type the line number from the report
   - Jump directly to the issue

3. **Fix issues manually:**
   - Review the current code
   - Apply suggested changes
   - Use Find & Replace for bulk changes

4. **Re-run the agent:**
   ```bash
   npm run check-ui
   ```
   - Verify your fixes reduced the issue count
   - Track progress over time

## 📈 Current Stats (First Run)

- **Files Scanned:** 214
- **Total Issues:** 4,967
- **High Priority:** 4,216 (hardcoded inline styles)
- **Medium Priority:** 292 (zone colors, modal structures)
- **Low Priority:** 459 (animation timings)

## 💡 Recommended Actions

### Phase 1: Setup CSS Variables (Foundation)
Create a `src/styles/zone-colors.css` file:

```css
:root {
  /* Symbol Mountain - Earthy brown/orange */
  --zone-symbol-mountain-primary: #8B4513;
  --zone-symbol-mountain-secondary: #CD853F;
  --zone-symbol-mountain-accent: #FFD700;

  /* Cave of Secrets - Deep purple */
  --zone-cave-of-secrets-primary: #4A148C;
  --zone-cave-of-secrets-secondary: #7B1FA2;
  --zone-cave-of-secrets-accent: #9C27B0;

  /* Shloka River - Blue */
  --zone-shloka-river-primary: #0277BD;
  --zone-shloka-river-secondary: #0288D1;
  --zone-shloka-river-accent: #03A9F4;

  /* Festival Square - Pink/Celebration */
  --zone-festival-square-primary: #E91E63;
  --zone-festival-square-secondary: #F06292;
  --zone-festival-square-accent: #FF4081;
}
```

### Phase 2: Create Reusable Components
Build standardized components (see report for templates):
- `SceneHeader.jsx` - Consistent scene titles
- `StandardModal.jsx` - Unified modal structure

### Phase 3: Gradual Refactoring
- Start with one zone (e.g., Symbol Mountain)
- Replace hardcoded styles with CSS classes
- Use CSS variables for colors
- Adopt standardized components
- Test thoroughly

### Phase 4: Verify Improvements
```bash
npm run check-ui
```
Watch the issue count decrease!

## 🛠️ Future Enhancements

### Interactive Mode (Coming Soon)
```bash
npm run check-ui:interactive
```
- Review each issue one-by-one
- Choose to apply suggested fixes
- Skip issues you want to keep

### Auto-Fix Mode (Coming Soon)
```bash
npm run check-ui:fix
```
- Automatically fix safe issues:
  - Button class standardization
  - Simple CSS variable replacements
- Manual review for complex changes

## 📝 Notes

- The agent is **non-destructive** in report-only mode
- It scans all `.jsx` and `.js` files in `src/zones/`
- Exit code 1 indicates issues were found (expected)
- Exit code 0 indicates no issues (you're consistent!)

## 🐛 Troubleshooting

**Issue:** Script fails with "require is not defined"
**Solution:** Ensure script has `.cjs` extension (package.json uses ES modules)

**Issue:** No report generated
**Solution:** Check that `src/zones/` directory exists

**Issue:** Too many issues, overwhelming
**Solution:** Focus on one category at a time (e.g., start with just colors)

## 📚 Related Documentation

- [Framer Motion Docs](https://www.framer.com/motion/) - For animation best practices
- [CSS Variables Guide](https://developer.mozilla.org/en-US/docs/Web/CSS/Using_CSS_custom_properties) - For color system

---

**Happy Refactoring!** 🎨✨
