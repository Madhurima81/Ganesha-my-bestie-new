import json
import os
import sys
from pathlib import Path

from reportlab.lib.pagesizes import inch
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfgen import canvas
from pypdf import PdfReader


def main():
    if len(sys.argv) != 3:
        print("Usage: python scripts/build_phase9_pdf.py <export-json> <output-root>", file=sys.stderr)
        sys.exit(1)

    export_json = Path(sys.argv[1])
    output_root = Path(sys.argv[2])
    bundle_root = output_root.parent if output_root.name == "print" else output_root
    payload = json.loads(export_json.read_text(encoding="utf-8"))
    story_package = payload["storyPackage"]
    layout = payload["layout"]
    final_story = payload["finalStory"]

    output_root.mkdir(parents=True, exist_ok=True)
    pdf_path = output_root / "story-book.pdf"

    page_size = (8.5 * inch, 8.5 * inch)
    doc = canvas.Canvas(str(pdf_path), pagesize=page_size)
    doc.setTitle(story_package["metadata"]["title"])
    doc.setAuthor(story_package["metadata"].get("author", "Prana Story Engine"))
    doc.setSubject("Production-ready story export")
    doc.setCreator("Prana Story Engine Export")

    for index, page in enumerate(layout["pages"]):
        illustration = page["illustration"]
        text = page["text"]
        story_page = final_story["pages"][index]
        asset_location = next(item["assetLocation"] for item in story_package["illustrations"] if item["assetId"] == illustration["assetId"])
        asset_path = bundle_root / asset_location.replace("./", "")
        if not asset_path.exists():
            asset_filename = f"{illustration['assetId'].lower().replace('asset_page_', 'asset-page-')}.png"
            fallback = bundle_root / "assets" / asset_filename
            if fallback.exists():
                asset_path = fallback

        doc.drawImage(
            ImageReader(str(asset_path)),
            0,
            0,
            width=page_size[0],
            height=page_size[1],
            preserveAspectRatio=True,
            mask="auto",
        )

        x = text["position"]["x"] * inch
        y = page_size[1] - ((text["position"]["y"] + text["height"]) * inch)
        width = text["width"] * inch
        height = text["height"] * inch

        doc.setFillColorRGB(1, 0.985, 0.95)
        doc.roundRect(x - 8, y - 8, width + 16, height + 16, 12, fill=1, stroke=0)
        doc.setFillColorRGB(0.18, 0.15, 0.12)
        font_name = "Helvetica-Bold" if page["page"] in (1, len(layout["pages"])) else "Helvetica"
        font_size = text.get("fontSize", 16)
        doc.setFont(font_name, font_size)

        text_object = doc.beginText()
        text_object.setTextOrigin(x, y + height - font_size)
        text_object.setLeading(font_size * 1.35)
        for line in wrap_text(story_page["text"], font_name, font_size, width):
            text_object.textLine(line)
        doc.drawText(text_object)

        doc.setFont("Helvetica-Bold", 10)
        doc.setFillColorRGB(0.56, 0.35, 0.18)
        doc.drawRightString(page_size[0] - 0.45 * inch, 0.35 * inch, f"Page {page['page']}")
        doc.showPage()

    doc.save()

    reader = PdfReader(str(pdf_path))
    extracted = "\n".join((page.extract_text() or "") for page in reader.pages)
    integrity = {
        "pdfPath": str(pdf_path),
        "pageCount": len(reader.pages),
        "expectedPageCount": len(final_story["pages"]),
        "title": story_package["metadata"]["title"],
        "containsTrueBelief": final_story["pages"][-1]["text"][:40] in extracted or "I can pause and choose my response" in extracted,
    }
    (output_root / "pdf-integrity.json").write_text(json.dumps(integrity, indent=2), encoding="utf-8")
    print(json.dumps(integrity, indent=2))


def wrap_text(text, font_name, font_size, width):
    words = text.split()
    lines = []
    current = ""
    for word in words:
      test = f"{current} {word}".strip()
      if pdfmetrics.stringWidth(test, font_name, font_size) <= width or not current:
          current = test
      else:
          lines.append(current)
          current = word
    if current:
        lines.append(current)
    return lines


if __name__ == "__main__":
    main()
