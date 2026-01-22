import { fromBuffer } from "pdf2pic";
import { createWorker } from "tesseract.js";
import fs from "fs";
import sharp from "sharp";
import path from "path";

const TEMP_DIR = path.resolve(process.cwd(), "tmp");

if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

export const extractTextFromOCR = async (buffer: Buffer) => {
  // convert pdf to image
  const converter = fromBuffer(buffer, {
    density: 200,
    savePath: "./tmp",
    format: "png",
    width: 1654,
    height: 2339,
  });

  const pages = await converter.bulk(-1, { responseType: "image" });

  let finalText = "";
  const worker = await createWorker("eng");

  // OCR each page
  for (const page of pages) {
    // pre-process image
    const processedImage = await sharp(page.path)
      .grayscale()
      .normalize()
      .threshold(150)
      .resize({ width: 1800 })
      .toBuffer();

    const result = await worker.recognize(processedImage);
    finalText += result.data.text + "\n";

    if (page.path) fs.unlinkSync(page.path);
  }

  await worker.terminate();
  return finalText.trim();
};
