# Master Story Catalog Format

Use one master catalog for all weeks.

This gives you one place to see:

- every story title
- value/lesson
- main character
- wisdom stream
- illustration reference
- final export status

## Best Setup

Keep both:

1. `story_catalog.csv` for sorting/filtering
2. `story_catalog.md` for easy reading

## Suggested CSV Columns

```text
Week
StoryID
StoryNo
StoryTitle
WisdomTrack
Value
MainCharacterID
MainCharacterName
SupportingCharacterIDs
SymbolID
LayoutRange
IllustrationBriefPath
IllustrationSheetPath
CarouselExportPath
StoryExportPath
ReelExportPath
Status
Notes
```

## Example Row

```text
Week 01,ST-W01-01,01,Arin Rabbit's Wobbly Feet,Bhagavad Gita,Self-Awareness,CHAR-001,Arin Rabbit,CHAR-008,GIT-SYM-006,LAY-L01 to LAY-L09,03_Weeks/Week 01/Story 01/illustration_brief.md,03_Weeks/Week 01/Story 01/illustrationsheet.png,05_Final_Exports/Week 01/ST-W01-01-carousel.pdf,05_Final_Exports/Week 01/ST-W01-01-story.pdf,05_Final_Exports/Week 01/ST-W01-01-reel.mp4,Approved,Ready for reuse
```

## Suggested Markdown View

Use one short row per story:

```text
| Week | Story ID | Title | Value | Character | Symbol | Illustration |
```

This is good for quick review meetings.

## Illustration Reference Rule

Every story should point to one clear illustration source:

- illustration brief markdown file
- original source sheet or storyboard
- final selected illustration set

That way, anyone can find the art without searching through folders.
