import { Request, Response } from "express";
import { processText } from "../utils/textProcessor.js";
import { PDFParse } from "pdf-parse";
import { generateSessionId } from "../utils/session.js";
import { extractTextFromOCR } from "../utils/ocr.js";
import { cleanText } from "../utils/cleanText.js";

const MIN_TEXT_LENGT = 50;

export const ingestText = async (req: Request, res: Response) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ error: "Missing text" });
    }

    const sessionId = generateSessionId();

    const result = await processText(text, {
      summarize: true,
      embed: true,
      sessionId,
    });

    return res.status(200).json({
      message: "Text ingested successfully",
      summary: result.summary,
      chunkCount: result.chunkCount,
      sessionId,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    res.status(500).json({ error: "Failed to ingest text." });
  }
};

export const ingestPDF = async (req: Request, res: Response) => {
  try {
    const file = req.file;
    console.log(file);
    if (!file) {
      return res.status(400).json({ error: "Missing PDF file" });
    }

    const sessionId = generateSessionId();

    let rawText = "";
    let text = "";

    // convert buffer to Uint8Array
    const pdfData = new PDFParse(new Uint8Array(file.buffer));
    rawText = (await pdfData.getText()).text || "";

    text = cleanText(rawText);

    if (!text || text.length < MIN_TEXT_LENGT) {
      console.log("No readable text found. Running OCR...");
      rawText = await extractTextFromOCR(file.buffer);
      text = cleanText(rawText);
    }

    if (!text || text.length < MIN_TEXT_LENGT) {
      return res
        .status(400)
        .json({ error: "Unable to extract text from PDF." });
    }

    console.log("Text: ", text);

    // AI processing
    // const result = await processText(text, {
    //   summarize: true,
    //   embed: true,
    //   sessionId,
    // });

    return res.status(200).json({
      message: "PDF ingested successfully",
      // summary: result.summary,
      // chunkCount: result.chunkCount,
      sessionId,
    });
  } catch (error) {
    console.error("PDF Ingestion error:", error);
    res.status(500).json({ error: "Failed to ingest PDF." });
  }
};
