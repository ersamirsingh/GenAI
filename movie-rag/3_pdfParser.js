
import fs from "fs";
import pdf from "pdf-parse";

async function parsePDF(pdfPath) {
   // Read PDF as binary buffer (PDFs are binary, not text)
   const dataBuffer = fs.readFileSync(pdfPath);

   // Extract text from all pages
   const pdfData = await pdf(dataBuffer);
   const rawText = pdfData.text;

   console.log(`📄 PDF parsed: ${pdfData.numpages} pages, ${rawText.length} characters`);

   // Split by separator (10+ dashes in a row)
   const movieBlocks = rawText
      .split(/-{10,}/)
      .map((block) => block.trim())
      .filter((block) => block.length > 0 && block.includes("Movie Title"));

   console.log(`🎬 Found ${movieBlocks.length} movie blocks`);
   return movieBlocks;
}

export { parsePDF };