import { Request, Response } from "express";
import { processText } from "../utils/textProcessor.js";
import { PDFParse } from "pdf-parse";
import { generateSessionId } from "../utils/session.js";
import { extractTextFromOCR } from "../utils/ocr.js";
import { cleanText } from "../utils/text.js";
import { isReadableText } from "../utils/text.js";

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
    if (!file) {
      return res.status(400).json({ error: "Missing PDF file" });
    }

    const sessionId = generateSessionId();

    let extractedText = "";

    try {
      const pdfData = new PDFParse(new Uint8Array(file.buffer));
      const rawText = (await pdfData.getText()).text || "";
      extractedText = cleanText(rawText);
    } catch (error) {
      extractedText = "";
    }

    if (!isReadableText(extractedText)) {
      console.log("Running OCR (scanned / handwritten PDF)...");
      const ocrText = await extractTextFromOCR(file.buffer);
      extractedText = cleanText(ocrText);
    }

    if (!isReadableText(extractedText)) {
      return res.status(400).json({
        error: "Unable to extract readable text from PDF",
      });
    }

    const result = await processText(extractedText, {
      summarize: true,
      embed: true,
      sessionId,
    });

    return res.status(200).json({
      message: "PDF ingested successfully",
      summary: result.summary,
      chunkCount: result.chunkCount,
      sessionId,
    });
  } catch (error) {
    console.error("PDF Ingestion error:", error);
    res.status(500).json({ error: "Failed to ingest PDF." });
  }
};
