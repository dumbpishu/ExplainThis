import { Request, Response } from "express";
import { ai } from "../config/gemini";
import { pineconeIndex } from "../config/pinecone";
import { chunkText } from "../utils/chunker";

export const ingestText = async (req: Request, res: Response) => {
  try {
    const { text, sessionId } = req.body;

    if (!text || !sessionId) {
      return res
        .status(400)
        .json({ error: "Text and sessionId are required." });
    }

    if (text.length > 20000) {
      return res.status(400).json({ error: "Text to large" });
    }

    const chunks = chunkText(text);

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      const embeddingRes = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: [chunk],
      });

      if (!embeddingRes.embeddings || embeddingRes.embeddings.length === 0) {
        throw new Error("Failed to generate embeddings for chunk");
      }

      await pineconeIndex.upsert([
        {
          id: `${sessionId}-chunk-${i}`,
          values: embeddingRes.embeddings[0].values,
          metadata: {
            sessionId,
            chunkIndex: i,
            text: chunk,
          },
        },
      ]);
    }

    return res
      .status(200)
      .json({ message: "Ingestion complete.", chunkCount: chunks.length });
  } catch (error) {
    console.error("Ingestion error:", error);
    res.status(500).json({ error: "Failed to ingest text." });
  }
};
