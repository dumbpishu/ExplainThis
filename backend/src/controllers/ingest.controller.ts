import { Request, Response } from "express";
import { processText } from "../utils/textProcessor";

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
