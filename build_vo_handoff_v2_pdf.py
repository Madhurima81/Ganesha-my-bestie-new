# -*- coding: utf-8 -*-
# Simple PDF handoff for the VO artist: (1) record essentials (words), (2) scenes.
# Content comes from build_vo_handoff_v2.py (verified against the live code).
import importlib.util
import io
from xml.sax.saxutils import escape

import pymupdf
import PIL.Image as PI
from reportlab.lib import colors
from reportlab.lib.pagesizes import letter
from reportlab.lib.styles import ParagraphStyle
from reportlab.lib.units import inch
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.platypus import Image as RLImage
from reportlab.platypus import KeepTogether, PageBreak, Paragraph, SimpleDocTemplate, Spacer, Table, TableStyle

spec = importlib.util.spec_from_file_location("v2", "build_vo_handoff_v2.py")
v2 = importlib.util.module_from_spec(spec)
spec.loader.exec_module(v2)

F = "C:/Windows/Fonts/"
pdfmetrics.registerFont(TTFont("Ar", F + "arial.ttf"))
pdfmetrics.registerFont(TTFont("ArB", F + "arialbd.ttf"))
pdfmetrics.registerFont(TTFont("ArI", F + "ariali.ttf"))
pdfmetrics.registerFontFamily("Ar", normal="Ar", bold="ArB", italic="ArI", boldItalic="ArB")

OUT = "VO_Artist_Handoff_v2.pdf"
INK = colors.HexColor("#222222")
GREY = colors.HexColor("#666666")
RULE = colors.HexColor("#CCCCCC")


def S(name, **k):
    k.setdefault("fontName", "Ar")
    k.setdefault("leading", k.get("fontSize", 10) * 1.28)
    return ParagraphStyle(name, **k)


st = dict(
    title=S("t", fontName="ArB", fontSize=22, textColor=INK, spaceAfter=4),
    part=S("p", fontName="ArB", fontSize=17, textColor=INK, spaceBefore=2, spaceAfter=6),
    scene=S("sc", fontName="ArB", fontSize=14, textColor=INK, spaceAfter=2),
    does=S("do", fontName="ArI", fontSize=9.5, textColor=GREY, spaceAfter=6),
    body=S("b", fontSize=10, spaceAfter=3),
    cell=S("c", fontSize=9.5, textColor=colors.HexColor("#444444")),
    bold=S("bo", fontName="ArB", fontSize=11, textColor=INK, leading=14),
    id=S("i", fontSize=8, textColor=GREY),
    note=S("n", fontName="ArI", fontSize=8.5, textColor=GREY, leading=11),
    hd=S("hd", fontName="ArB", fontSize=9, textColor=INK),
)

_ARCH = pymupdf.Archive("C:/Windows/Fonts")
_CSS = "@font-face {font-family: nirm; src: url(Nirmala.ttf);} p {font-family: nirm; font-size: 40px; margin: 0; line-height: 2.2;}"


def P(t, s):
    return Paragraph(escape(t), st[s])


def dev_img(text, max_w=1.1):
    """Devanagari shaped by MuPDF (reportlab cannot shape Indic scripts)."""
    doc = pymupdf.open()
    page = doc.new_page(width=900, height=160)
    page.insert_htmlbox(pymupdf.Rect(4, 10, 896, 156), "<p>%s</p>" % escape(text), css=_CSS, archive=_ARCH)
    pix = page.get_pixmap(dpi=216, alpha=False)
    im = PI.frombytes("RGB", (pix.width, pix.height), pix.samples)
    bbox = PI.eval(im.convert("L"), lambda v: 255 - v).getbbox()
    im = im.crop((max(bbox[0] - 4, 0), max(bbox[1] - 4, 0), bbox[2] + 4, bbox[3] + 4))
    buf = io.BytesIO()
    im.save(buf, "PNG")
    buf.seek(0)
    w = im.width / 3 * 0.36          # constant scale so all words share one text size
    h = im.height / 3 * 0.36
    if w > max_w * inch:             # long entries shrink to fit the column
        h, w = h * max_w * inch / w, max_w * inch
    img = RLImage(buf, width=w, height=h)
    img.hAlign = "LEFT"
    return img


def table(data, widths):
    t = Table(data, colWidths=[w * inch for w in widths], repeatRows=1)
    t.setStyle(TableStyle([
        ("LINEBELOW", (0, 0), (-1, 0), 0.8, INK),
        ("LINEBELOW", (0, 1), (-1, -1), 0.4, RULE),
        ("VALIGN", (0, 0), (-1, -1), "MIDDLE"),
        ("TOPPADDING", (0, 0), (-1, -1), 4),
        ("BOTTOMPADDING", (0, 0), (-1, -1), 4),
        ("LEFTPADDING", (0, 0), (-1, -1), 3),
    ]))
    return t


def footer(c, d):
    c.saveState()
    c.setFont("Ar", 8)
    c.setFillColor(GREY)
    c.drawCentredString(letter[0] / 2, 0.35 * inch, "Ganesha My Bestie — VO Artist Handoff · page %d" % d.page)
    c.restoreState()


story = [P("Ganesha My Bestie — Voice-Over Script", "title"),
         P("Narrator: Ganesha — warm, joyful and gentle, speaking to a child of 5–12. Clear and a little slower than "
           "normal speech, with short pauses between sentences. Hint lines are quiet nudges, never a scold. "
           "Lines marked “child repeats” are said with the child, so leave a short gap after them. "
           "Please name each audio file with its ID (for example SM1-07).", "body"),
         Spacer(1, 10)]

# ── Section 1: record essentials
story.append(P("1. Record Essentials — Hindi / Sanskrit Words", "part"))
story.append(P("The eight shloka words are played in the app one syllable at a time as well as whole, so please record every syllable on its own (table below) and then the full word.", "body"))
story.append(P("The eight shloka words", "bold"))
story.append(Spacer(1, 3))
rows = [[P(h, "hd") for h in ("Word", "Devanagari", "Say it as", "Syllables", "In English")]]
for w, d, say, syl, mean in v2.SHLOKA_WORDS:
    rows.append([P(w, "bold"), dev_img(d), P(say, "bold"), P(syl, "cell"), P(mean, "cell")])
story.append(table(rows, [1.2, 1.05, 1.5, 1.35, 2.3]))

story += [Spacer(1, 12), P("Syllables — record each one on its own", "bold"), Spacer(1, 3)]
SYL = [
    ("Vakratunda", ["va", "kra", "tun", "da"]),
    ("Mahakaya", ["ma", "ha", "ka", "ya"]),
    ("Suryakoti", ["sur", "ya", "ko", "ti"]),
    ("Samaprabha", ["sa", "ma", "pra", "bha"]),
    ("Nirvighnam", ["nir", "vigh", "nam"]),
    ("Kuru Me Deva", ["ku-ru", "me", "de", "va"]),
    ("Sarva Karyeshu", ["sar", "va", "kar", "rye", "shu"]),
    ("Sarvada", ["sar", "va", "da"]),
]
rows = [[P(h, "hd") for h in ("Word", "1", "2", "3", "4", "5")]]
for w, syls in SYL:
    rows.append([P(w, "bold")] + [P(x, "bold") for x in syls] + [P("", "cell")] * (5 - len(syls)))
story.append(table(rows, [1.6, 1.1, 1.1, 1.1, 1.1, 1.1]))
story.append(PageBreak())
for gi, (gtitle, grows) in enumerate(v2.WORD_GROUPS):
    rows = [[P(h, "hd") for h in ("Word", "Hindi", "Say it as", "In English")]]
    for w, d, say, mean in grows:
        rows.append([P(w, "bold"), dev_img(d), P(say, "cell"), P(mean, "cell")])
    story.append(KeepTogether([P(gtitle, "bold"), Spacer(1, 3), table(rows, [1.4, 1.35, 1.6, 3.05])]))
    story.append(Spacer(1, 12))
story.pop()  # no trailing spacer (it caused a blank page)
story.append(PageBreak())

# ── Section 2: scenes
story.append(P("2. Scenes", "part"))
first = True
for group in (v2.APP, v2.SM, v2.SR, v2.AH):
    for sc in group:
        if not first:
            story.append(PageBreak())
        first = False
        story.append(P(sc["title"], "scene"))
        story.append(P(sc["does"], "does"))
        rows = [[P(h, "hd") for h in ("ID", "Line to record", "Note", "Done")]]
        n = 0
        for _sec, items in sc["sections"]:
            for _when, line, note in items:
                n += 1
                rows.append([P("%s-%02d" % (sc["code"], n), "id"), P(line, "bold"), P(note, "note"), P("☐", "bold")])
        story.append(table(rows, [0.7, 4.5, 1.6, 0.55]))

SimpleDocTemplate(OUT, pagesize=letter, leftMargin=0.6 * inch, rightMargin=0.6 * inch,
                  topMargin=0.6 * inch, bottomMargin=0.6 * inch,
                  title="Ganesha My Bestie — VO Artist Handoff").build(story, onFirstPage=footer, onLaterPages=footer)
print(OUT)
