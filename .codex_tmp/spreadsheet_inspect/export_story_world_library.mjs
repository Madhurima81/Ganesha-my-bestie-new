import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/Madhurima Agarwal/Downloads/Prana_Kids_Full_Library_v11.xlsx";
const outputDir = "C:/Users/Madhurima Agarwal/ganesha-my-bestie/outputs/story-world-library";
const outputPath = `${outputDir}/Story_World_Library_full_list.txt`;

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const table = await workbook.inspect({
  kind: "table",
  sheetId: "Story World Library",
  range: "A1:C66",
  include: "values",
  tableMaxRows: 100,
  tableMaxCols: 10,
  maxChars: 30000,
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
