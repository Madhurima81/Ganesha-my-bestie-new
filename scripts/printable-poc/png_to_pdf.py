from __future__ import annotations

import sys
from pathlib import Path

from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas


def main() -> int:
    if len(sys.argv) != 3:
        print("Usage: png_to_pdf.py <input_png> <output_pdf>", file=sys.stderr)
        return 1

    input_png = Path(sys.argv[1])
    output_pdf = Path(sys.argv[2])

    if not input_png.exists():
      print(f"PNG not found: {input_png}", file=sys.stderr)
      return 1

    output_pdf.parent.mkdir(parents=True, exist_ok=True)

    width, height = A4
    pdf = canvas.Canvas(str(output_pdf), pagesize=A4)
    pdf.drawImage(str(input_png), 0, 0, width=width, height=height, preserveAspectRatio=True, mask="auto")
    pdf.showPage()
    pdf.save()
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
