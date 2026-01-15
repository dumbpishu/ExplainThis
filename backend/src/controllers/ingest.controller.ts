import { Request, Response } from "express";
import { processText } from "../utils/textProcessor";
import { PDFParse } from "pdf-parse";

export const ingestText = async (req: Request, res: Response) => {
  try {
    const { text, sessionId } = req.body;

    if (!text || !sessionId) {
      return res.status(400).json({ error: "Missing text or sessionId" });
    }

    const result = await processText(text, {
      summarize: true,
      embed: true,
      sessionId,
    });

    return res.status(200).json({
      message: "Text ingested successfully",
      summary: result.summary,
      chunkCount: result.chunkCount,
    });
  } catch (error) {
    console.error("Ingestion error:", error);
    res.status(500).json({ error: "Failed to ingest text." });
  }
};

export const ingestPDF = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.body;
    const file = req.file;

    if (!file || !sessionId) {
      return res.status(400).json({ error: "Missing PDF file or sessionId" });
    }

    // convert buffer to Uint8Array
    const pdfData = new PDFParse(new Uint8Array(file.buffer));
    const text = (await pdfData.getText()).text;

    const result = await processText(text, {
      summarize: true,
      embed: true,
      sessionId,
    });

    return res.status(200).json({
      message: "PDF ingested successfully",
      summary: result.summary,
      chunkCount: result.chunkCount,
    });
  } catch (error) {
    console.error("PDF Ingestion error:", error);
    res.status(500).json({ error: "Failed to ingest PDF." });
  }
};
