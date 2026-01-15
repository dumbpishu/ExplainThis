import { Request, Response } from "express";
import { ai } from "../config/gemini";
import { pineconeIndex } from "../config/pinecone";

export const chatWithAI = async (req: Request, res: Response) => {
  try {
    const { sessionId, question } = req.body;

    if (!sessionId || !question) {
      return res.status(400).json({ error: "Missing sessionId or question" });
    }

    // embed the question
    const queryEmbedding = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: question,
    });

    if (!queryEmbedding.embeddings || queryEmbedding.embeddings.length === 0) {
      return res.status(400).json({ error: "Failed to generate embedding" });
    }

    // query Pinecone for relevant context
    const embeddingValues = queryEmbedding.embeddings[0].values;
    if (!embeddingValues) {
      return res
        .status(400)
        .json({ error: "Failed to extract embedding values" });
    }

    const results = await pineconeIndex.query({
      vector: Array.from(embeddingValues),
      topK: 5,
      filter: { sessionId },
    });

    const contexts = results.matches
      .map((match) => match.metadata?.text)
      .join("\n");

    // generate AI response
    const contents = `You are an AI assistant. Use the following context to answer the question.\n\nContext:\n${contexts}\n\nQuestion: ${question}\n\nAnswer:`;

    const aiResponse = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents,
    });

    res.json({ answer: aiResponse.text });
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
