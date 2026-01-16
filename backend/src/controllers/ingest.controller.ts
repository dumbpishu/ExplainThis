import { Request, Response } from "express";
import { processText } from "../utils/textProcessor";
import { PDFParse } from "pdf-parse";
import { generateSessionId } from "../utils/session";

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
    console.log("Received file:", file?.originalname);

    if (!file) {
      return res.status(400).json({ error: "Missing PDF file" });
    }

    const sessionId = generateSessionId();

    // convert buffer to Uint8Array
    const pdfData = new PDFParse(new Uint8Array(file.buffer));
    const text = (await pdfData.getText()).text;

    const result = await processText(text, {
      summarize: true,
      embed: true,
      sessionId,
    });

    console.log("PDF ingestion result:", result);

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
