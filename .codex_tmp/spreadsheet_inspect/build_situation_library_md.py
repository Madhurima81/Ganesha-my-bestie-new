from pathlib import Path
import json


INPUT_PATH = Path(r"C:/Users/Madhurima Agarwal/Downloads/prana-story-v10/prana-story-v10/libraries/childhoodSituations.json")
OUTPUT_DIR = Path(r"C:/Users/Madhurima Agarwal/ganesha-my-bestie/outputs/situation-library-latest")
OUTPUT_PATH = OUTPUT_DIR / "Situation_Library_latest.md"


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
    lines.append("# Situation Library")
    lines.append("")
    lines.append("Source: `childhoodSituations.json`")
    lines.append("")
    lines.append(f"Entries: {len(items)}")
    lines.append("")

    for item in items:
        lines.append(f"## {item['id']}. {item['name']}")
        lines.append("")
        lines.append(f"- `Slug`: {fmt(item.get('slug'))}")
        lines.append(f"- `Category`: {fmt(item.get('category'))}")
        lines.append(f"- `Core Need`: {fmt(item.get('coreNeed'))}")
        lines.append(f"- `False Belief`: {fmt(item.get('falseBelief'))}")
        lines.append(f"- `True Belief`: {fmt(item.get('trueBelief'))}")
        lines.append(f"- `Feeling`: {fmt(item.get('feeling'))}")
        lines.append(f"- `Parent Teach`: {fmt(item.get('parentTeach'))}")
        lines.append(f"- `Wisdom Element`: {fmt(item.get('wisdomElement'))}")
        lines.append(f"- `Secondary Wisdom Element`: {fmt(item.get('secondaryWisdomElement'))}")
        lines.append(f"- `Life Domains`: {fmt(item.get('lifeDomains'))}")
        lines.append(f"- `Priority`: {fmt(item.get('priority'))}")
        lines.append("")

    OUTPUT_PATH.write_text("\n".join(lines), encoding="utf-8")
    print(str(OUTPUT_PATH))


if __name__ == "__main__":
    main()
