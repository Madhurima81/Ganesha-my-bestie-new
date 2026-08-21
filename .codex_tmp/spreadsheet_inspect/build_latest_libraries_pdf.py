from pathlib import Path
import json

from reportlab.lib import colors
from reportlab.lib.enums import TA_CENTER
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import ParagraphStyle, getSampleStyleSheet
from reportlab.lib.units import inch
from reportlab.platypus import (
    KeepTogether,
    PageBreak,
    Paragraph,
    SimpleDocTemplate,
    Spacer,
    Table,
    TableStyle,
)


BASE_DIR = Path(r"C:/Users/Madhurima Agarwal/Downloads/prana-story-v10/prana-story-v10/libraries")
OUTPUT_DIR = Path(r"C:/Users/Madhurima Agarwal/ganesha-my-bestie/output/pdf")
OUTPUT_PDF = OUTPUT_DIR / "prana_kids_selected_libraries_latest.pdf"

LIBRARIES = [
    ("Situation Library", "childhoodSituations.json"),
    ("Character Library", "mainCharacters.json"),
    ("Symbol Library", "wisdomElements.json"),
    ("Mission Library", "missions.json"),
    ("World Library", "storyWorlds.json"),
    ("Obstacle Library", "obstacles.json"),
    ("Story Structure Library", "storyStructures.json"),
    ("Emotional Arc Library", "emotionalArcs.json"),
    ("Opening Library", "openings.json"),
    ("Ending Library", "endings.json"),
    ("Replay Hook Library", "replayHooks.json"),
    ("Read-Aloud Library", "readAloudDevices.json"),
]


def clean_text(value):
    if value is None:
        return "-"
    if isinstance(value, list):
        return ", ".join(clean_text(v) for v in value)
    if isinstance(value, dict):
        return "; ".join(f"{k}: {clean_text(v)}" for k, v in value.items())
    return str(value)


def pretty_label(key: str) -> str:
    parts = []
    current = ""
    for char in key:
        if char.isupper() and current:
            parts.append(current)
            current = char
        else:
            current += char
    if current:
        parts.append(current)
    return " ".join(part.capitalize() for part in parts)


def build_story():
    styles = getSampleStyleSheet()
    title_style = ParagraphStyle(
        "DocTitle",
        parent=styles["Title"],
        fontName="Helvetica-Bold",
        fontSize=20,
        leading=24,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#1F3A5F"),
        spaceAfter=16,
    )
    subtitle_style = ParagraphStyle(
        "SubTitle",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=10,
        leading=14,
        alignment=TA_CENTER,
        textColor=colors.HexColor("#4B5563"),
        spaceAfter=20,
    )
    section_style = ParagraphStyle(
        "Section",
        parent=styles["Heading1"],
        fontName="Helvetica-Bold",
        fontSize=16,
        leading=20,
        textColor=colors.HexColor("#0F4C5C"),
        spaceBefore=8,
        spaceAfter=10,
    )
    small_style = ParagraphStyle(
        "Small",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=8.5,
        leading=11,
        textColor=colors.HexColor("#374151"),
    )
    body_style = ParagraphStyle(
        "Body",
        parent=styles["BodyText"],
        fontName="Helvetica",
        fontSize=9,
        leading=12,
        textColor=colors.black,
    )
    key_style = ParagraphStyle(
        "Key",
        parent=body_style,
        fontName="Helvetica-Bold",
    )

    story = []
    story.append(Spacer(1, 0.6 * inch))
    story.append(Paragraph("Prana Kids Library PDF", title_style))
    story.append(
        Paragraph(
            "Combined export from the latest JSON files in the prana-story-v10 libraries folder.",
            subtitle_style,
        )
    )

    toc_rows = [["Library", "Source File"]]
    for label, filename in LIBRARIES:
        toc_rows.append([label, filename])
    toc = Table(toc_rows, colWidths=[2.4 * inch, 3.3 * inch], repeatRows=1)
    toc.setStyle(
        TableStyle(
            [
                ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#D9EAF4")),
                ("TEXTCOLOR", (0, 0), (-1, 0), colors.HexColor("#0F172A")),
                ("FONTNAME", (0, 0), (-1, 0), "Helvetica-Bold"),
                ("FONTSIZE", (0, 0), (-1, 0), 9),
                ("GRID", (0, 0), (-1, -1), 0.35, colors.HexColor("#B8C4D4")),
                ("FONTSIZE", (0, 1), (-1, -1), 8.5),
                ("LEADING", (0, 0), (-1, -1), 11),
                ("VALIGN", (0, 0), (-1, -1), "TOP"),
                ("ROWBACKGROUNDS", (0, 1), (-1, -1), [colors.white, colors.HexColor("#F8FAFC")]),
            ]
        )
    )
    story.append(toc)
    story.append(PageBreak())

    for lib_index, (label, filename) in enumerate(LIBRARIES):
        file_path = BASE_DIR / filename
        with file_path.open("r", encoding="utf-8") as f:
            items = json.load(f)

        story.append(Paragraph(label, section_style))
        story.append(
            Paragraph(
                f"Source: {filename} | Entries: {len(items)}",
                small_style,
            )
        )
        story.append(Spacer(1, 0.12 * inch))

        for idx, item in enumerate(items, start=1):
            title = item.get("name") or item.get("title") or item.get("slug") or f"Entry {idx}"
            header = Paragraph(f"{idx}. {title}", key_style)

            lines = []
            for key, value in item.items():
                if key == "name":
                    continue
                lines.append(
                    Paragraph(
                        f"<b>{pretty_label(key)}:</b> {clean_text(value)}",
                        body_style,
                    )
                )
            block = [header, Spacer(1, 0.04 * inch)] + lines + [Spacer(1, 0.08 * inch)]

            box = Table([[block]], colWidths=[6.8 * inch])
            box.setStyle(
                TableStyle(
                    [
                        ("BOX", (0, 0), (-1, -1), 0.5, colors.HexColor("#CBD5E1")),
                        ("BACKGROUND", (0, 0), (-1, -1), colors.HexColor("#FFFFFF")),
                        ("LEFTPADDING", (0, 0), (-1, -1), 8),
                        ("RIGHTPADDING", (0, 0), (-1, -1), 8),
                        ("TOPPADDING", (0, 0), (-1, -1), 7),
                        ("BOTTOMPADDING", (0, 0), (-1, -1), 7),
                    ]
                )
            )
            story.append(KeepTogether(box))
            story.append(Spacer(1, 0.08 * inch))

        if lib_index < len(LIBRARIES) - 1:
            story.append(PageBreak())

    return story


def add_page_number(canvas, doc):
    canvas.saveState()
    canvas.setFont("Helvetica", 8)
    canvas.setFillColor(colors.HexColor("#6B7280"))
    canvas.drawRightString(7.4 * inch, 0.45 * inch, f"Page {doc.page}")
    canvas.restoreState()


def main():
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)
    doc = SimpleDocTemplate(
        str(OUTPUT_PDF),
        pagesize=A4,
        leftMargin=0.45 * inch,
        rightMargin=0.45 * inch,
        topMargin=0.5 * inch,
        bottomMargin=0.65 * inch,
        title="Prana Kids Selected Libraries",
        author="Codex",
    )
    doc.build(build_story(), onFirstPage=add_page_number, onLaterPages=add_page_number)
    print(str(OUTPUT_PDF))


if __name__ == "__main__":
    main()
