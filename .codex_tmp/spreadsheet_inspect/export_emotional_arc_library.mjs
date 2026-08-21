import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/Madhurima Agarwal/Downloads/Prana_Kids_Full_Library_v11.xlsx";
const outputDir = "C:/Users/Madhurima Agarwal/ganesha-my-bestie/outputs/emotional-arc-library";
const outputPath = `${outputDir}/Emotional_Arc_Library_full_list.txt`;

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const table = await workbook.inspect({
  kind: "table",
  sheetId: "Emotional Arc Library",
  range: "A1:H83",
  include: "values",
  tableMaxRows: 120,
  tableMaxCols: 12,
  maxChars: 50000,
});

const record = JSON.parse(String(table.ndjson).trim());
const rows = record.values;

const lines = rows.map((row) =>
  row
    .map((cell) => (cell ?? "").toString())
    .join("\t")
    .replace(/\t+$/, ""),
);

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(outputPath, lines.join("\n"), "utf8");

console.log(`OUTPUT_PATH:${outputPath}`);
