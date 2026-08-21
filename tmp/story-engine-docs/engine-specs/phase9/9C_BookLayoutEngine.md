# Phase 9C — Book Layout Engine

Version: 1.0
Status: LOCKED

## 1. Purpose

The Book Layout Engine combines the LOCKED page manuscript and approved illustration assets into a coherent book layout.

It determines the placement of:

- Text
- Illustrations
- White space
- Page elements
- Safe areas
- Bleed areas

It does not rewrite the story.

## 2. Position in Engine

Page Manuscript
        +
Illustration Assets
        ↓
9C Book Layout Engine
        ↓
Book Layout
        ↓
9D Production QA

## 3. Inputs

- LOCKED Final Story
- Page Manuscript
- Illustration Plan
- Illustration Assets
- Typography specifications
- Book specifications
- Layout rules

## 4. Outputs

- Layout
- Page geometry
- Text areas
- Illustration areas
- Safe areas
- Bleed specifications
- Typography assignments

## 5. Resources Used

- Layout specifications
- Typography specifications
- Book specifications
- Illustration Plan
- Page Manuscript
- Illustration assets

## 6. Responsibilities

For every page determine:

- Layout template
- Illustration placement
- Text placement
- Text area
- Illustration area
- Safe area
- Bleed
- Typography
- White space
- Page number placement where required

Use layout zones where possible rather than hard-coded coordinates.

## 7. Workflow

```text
Load Page Manuscript
        ↓
Load Illustration Assets
        ↓
Load Layout Specifications
        ↓
Select Layout Strategy
        ↓
Place Illustration
        ↓
Place Text
        ↓
Apply Typography
        ↓
Check Safe Areas
        ↓
Check Visual Balance
        ↓
Generate Layout
        ↓
Validate
```

## 8. Rules

BL-001 Never change story text.

BL-002 Never crop important visual information.

BL-003 Text must remain readable.

BL-004 Text must remain within safe areas.

BL-005 Illustration must remain visually dominant where appropriate.

BL-006 Preserve adequate white space.

BL-007 Do not place text over important character faces or story-critical objects.

BL-008 Respect bleed specifications.

BL-009 Maintain typography consistency.

BL-010 Layout must support the intended page rhythm.

## 9. Validation

Validate:

- Every page has layout data.
- Every page has required assets.
- Text fits.
- Safe areas are respected.
- Bleed is correct.
- No important artwork is obscured.
- Typography is valid.
- Layout is visually balanced.

## 10. Failure Handling

If a layout fails:

1. Identify page.
2. Identify failed layout constraint.
3. Attempt layout adjustment.
4. Do not alter story text.
5. Escalate unresolved conflicts to production QA.

## 11. Deliverables

- Book Layout
- Layout validation report

## 12. Dependencies

Inputs

- Final Story
- Page Manuscript
- Illustration assets
- Layout specifications
- Typography specifications

Next

- 9D Production QA

## 13. Runtime Notes

- Stateful: No
- Expected execution order: After illustration planning/assets
- Idempotent: Yes
- Cacheable: Yes

## 14. Example Input

```json
{
  "page": 1,
  "text": "...",
  "illustration": "asset_001",
  "layoutTemplate": "FULL_PAGE_BOTTOM_TEXT"
}
```

## 15. Example Output

```json
{
  "layout": [
    {
      "page": 1,
      "template": "FULL_PAGE_BOTTOM_TEXT",
      "textArea": {},
      "illustrationArea": {},
      "safeArea": {},
      "bleed": {}
    }
  ]
}
```
