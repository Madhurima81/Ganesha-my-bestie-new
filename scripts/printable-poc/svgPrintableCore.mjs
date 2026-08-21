import fs from "node:fs/promises";
import path from "node:path";

import { chromium } from "playwright";
import sharp from "sharp";

export const PAGE_WIDTH_PX = 794;
export const PAGE_HEIGHT_PX = 1123;
export const PX_PER_MM = PAGE_WIDTH_PX / 210;

export function escapeXml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll("\"", "&quot;")
    .replaceAll("'", "&apos;");
}

export function estimateTextWidth(text, fontSize) {
  return String(text).length * fontSize * 0.56;
}

export function wrapText(text, config, slotId) {
  if (!text) {
    return [];
  }

  const words = String(text).trim().split(/\s+/);
  const lines = [];
  let current = "";

  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word;
    if (estimateTextWidth(candidate, config.fontSize) <= config.width) {
      current = candidate;
      continue;
    }

    if (!current) {
      throw new Error(`Word "${word}" does not fit slot ${slotId}.`);
    }

    lines.push(current);
    current = word;
  }

  if (current) {
    lines.push(current);
  }

  if (lines.length > config.maxLines) {
    throw new Error(`Text does not fit slot ${slotId}: needs ${lines.length} lines, limit is ${config.maxLines}.`);
  }

  return lines;
}

export function buildTextElement(slotId, value, originalOpenTag, config) {
  const safeValue = String(value || "").trim();
  const lines = wrapText(safeValue, config, slotId);

  if (lines.length === 0) {
    return `${originalOpenTag}</text>`;
  }

  const startY = lines.length === 1
    ? config.y
    : config.y - ((lines.length - 1) * config.lineHeight) / 2;

  const tspans = lines.map((line, index) => (
    `<tspan x="${config.x}" y="${startY + index * config.lineHeight}">${escapeXml(line)}</tspan>`
  )).join("");

  return `${originalOpenTag}${tspans}</text>`;
}

export function replaceTextSlot(svg, slotId, value, manifestSlot, slotLayout) {
  const regex = new RegExp(`<text\\s+id="${slotId}"([^>]*)>([\\s\\S]*?)<\\/text>`);
  const match = svg.match(regex);
  if (!match) {
    throw new Error(`SVG text slot not found: ${slotId}`);
  }

  if (manifestSlot?.max_chars && String(value || "").length > manifestSlot.max_chars) {
    throw new Error(`Slot ${slotId} exceeds max_chars ${manifestSlot.max_chars}.`);
  }

  const config = slotLayout[slotId];
  if (!config) {
    throw new Error(`No layout config defined for ${slotId}.`);
  }

  const originalOpenTag = `<text id="${slotId}"${match[1]}>`;
  return svg.replace(regex, buildTextElement(slotId, value || "", originalOpenTag, config));
}

export function replaceGroupContents(svg, slotId, markup) {
  const regex = new RegExp(`<g\\s+id="${slotId}"([^>]*)>([\\s\\S]*?)<\\/g>`);
  const match = svg.match(regex);
  if (!match) {
    throw new Error(`SVG group slot not found: ${slotId}`);
  }
  return svg.replace(regex, `<g id="${slotId}"${match[1]}>${markup}</g>`);
}

export async function readAssetDataUri(assetPath) {
  const absolutePath = path.resolve(process.cwd(), assetPath);
  const buffer = await fs.readFile(absolutePath);
  const ext = path.extname(absolutePath).toLowerCase();
  const mime = ext === ".svg"
    ? "image/svg+xml"
    : ext === ".png"
      ? "image/png"
      : ext === ".webp"
        ? "image/webp"
        : "application/octet-stream";
  return `data:${mime};base64,${buffer.toString("base64")}`;
}

export async function buildAssetImageMarkup(assetId, registry, geometry, preserveAspectRatio = "xMidYMid meet") {
  const assetPath = registry[assetId];
  if (!assetPath) {
    throw new Error(`Unknown asset_id: ${assetId}`);
  }

  const dataUri = await readAssetDataUri(assetPath);
  return `<image href="${dataUri}" x="${geometry.x}" y="${geometry.y}" width="${geometry.width}" height="${geometry.height}" preserveAspectRatio="${preserveAspectRatio}"/>`;
}

export function findUnresolvedSlots(svg) {
  return [...svg.matchAll(/\{\{([A-Z0-9_]+)\}\}/g)].map((match) => match[1]);
}

export function validateA4Dimensions(svg) {
  const errors = [];
  if (!svg.includes('width="210mm"') || !svg.includes('height="297mm"')) {
    errors.push("Template SVG does not declare A4 dimensions 210mm x 297mm.");
  }
  return errors;
}

export function validateRectsWithinSafeMargin(rects, safeMarginMm) {
  const errors = [];
  const safeMarginPx = safeMarginMm * PX_PER_MM;

  for (const rect of rects) {
    if (
      rect.x < safeMarginPx ||
      rect.y < safeMarginPx ||
      rect.x + rect.width > PAGE_WIDTH_PX - safeMarginPx ||
      rect.y + rect.height > PAGE_HEIGHT_PX - safeMarginPx
    ) {
      errors.push(`Content block "${rect.name}" exceeds the safe margin.`);
    }
  }

  return errors;
}

export async function vectorPdfFromSvg(svgPath, pdfPath) {
  const svgMarkup = await fs.readFile(svgPath, "utf8");
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>@page{size:A4;margin:0}html,body{margin:0;padding:0;background:white}body{width:210mm;height:297mm}svg{display:block;width:210mm;height:297mm}</style></head><body>${svgMarkup}</body></html>`;
  const browser = await chromium.launch({ headless: true });
  try {
    const page = await browser.newPage();
    await page.setContent(html, { waitUntil: "load" });
    await page.pdf({
      path: pdfPath,
      width: "210mm",
      height: "297mm",
      printBackground: true,
      preferCSSPageSize: true,
      margin: { top: "0mm", right: "0mm", bottom: "0mm", left: "0mm" },
    });
  } finally {
    await browser.close();
  }
}

export async function previewPngFromSvg(svgMarkup, pngPath) {
  await sharp(Buffer.from(svgMarkup)).png().toFile(pngPath);
}
