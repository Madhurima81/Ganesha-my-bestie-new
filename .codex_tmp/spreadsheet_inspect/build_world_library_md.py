from pathlib import Path
import json


INPUT_PATH = Path(r"C:/Users/Madhurima Agarwal/Downloads/prana-story-v10/prana-story-v10/libraries/storyWorlds.json")
OUTPUT_DIR = Path(r"C:/Users/Madhurima Agarwal/ganesha-my-bestie/outputs/world-library-latest")
OUTPUT_PATH = OUTPUT_DIR / "World_Library_latest.md"


def fmt(value):
    if value is None:
        return "-"
    if isinstance(value, list):
        return ", ".join(str(item) for item in value) if value else "-"
    return str(value)


def main():
    items = json.loads(INPUT_PATH.read_text(encoding="utf-8"))
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    lines = []
    lines.append("# World Library")
    lines.append("")
    lines.append("Source: `storyWorlds.json`")
    lines.append("")
    lines.append(f"Entries: {len(items)}")
    lines.append("")

    for item in items:
        lines.append(f"## {item['id']}. {item['name']}")
        lines.append("")
        lines.append(f"- `Slug`: {fmt(item.get('slug'))}")
        lines.append(f"- `Best Adventure Archetypes`: {fmt(item.get('bestAdventureArchetypes'))}")
        lines.append("")

    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(str(OUTPUT_PATH))


if __name__ == "__main__":
    main()
