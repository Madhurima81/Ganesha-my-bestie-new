import fs from "node:fs/promises";
import { FileBlob, SpreadsheetFile } from "@oai/artifact-tool";

const inputPath = "C:/Users/Madhurima Agarwal/Downloads/Prana_Kids_Full_Library_v11.xlsx";
const outputDir = "C:/Users/Madhurima Agarwal/ganesha-my-bestie/outputs/rename-action-domain-sheet";
const outputPath = `${outputDir}/Prana_Kids_Full_Library_v11_renamed.xlsx`;

const input = await FileBlob.load(inputPath);
const workbook = await SpreadsheetFile.importXlsx(input);

const sheet = workbook.worksheets.getItem("Action Domain Library");
sheet.name = "Life Domain Library";

const verify = await workbook.inspect({
  kind: "sheet",
  include: "id,name",
  maxChars: 12000,
});
console.log("VERIFY_SHEETS_START");
console.log(verify.ndjson);
console.log("VERIFY_SHEETS_END");

const preview = await workbook.render({
  sheetName: "Life Domain Library",
  range: "A1:C19",
  scale: 2,
  format: "png",
});

await fs.mkdir(outputDir, { recursive: true });
await fs.writeFile(`${outputDir}/Life_Domain_Library_preview.png`, new Uint8Array(await preview.arrayBuffer()));

const output = await SpreadsheetFile.exportXlsx(workbook);
await output.save(outputPath);

console.log(`OUTPUT_PATH:${outputPath}`);
