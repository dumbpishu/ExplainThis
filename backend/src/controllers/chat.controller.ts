import { Request, Response } from "express";
import { ai } from "../config/gemini.js";
import { pineconeIndex } from "../config/pinecone.js";
import {
  getChatHistory,
  addMessageToChatHistory,
} from "../utils/chatMemory.js";
import { generateWithFallback } from "../utils/generateWithFallback.js";
import { REWRITE_QUESTION_PROMPT, ANSWER_PROMPT } from "../utils/prompts.js";

const GENERATION_MODELS = ["gemini-2.5-flash-lite", "gemini-2.5-flash"];

type ChatParams = {
  sessionId: string;
};

type ChatBody = {
  question: string;
};

export const chatWithAI = async (
  req: Request<ChatParams, {}, ChatBody>,
  res: Response,
) => {
  try {
    const { sessionId } = req.params;
    const { question } = req.body;

    if (!sessionId || !question) {
      return res.status(400).json({ error: "Missing sessionId or question" });
    }

    // rewrite question with chat history
    const chatHistory = await getChatHistory(sessionId);
    let finalQuestion = question;

    if (chatHistory.length > 0) {
      const rewritten = await generateWithFallback(GENERATION_MODELS, {
        contents: REWRITE_QUESTION_PROMPT(chatHistory, question),
      });

      if (rewritten.text) {
        finalQuestion = rewritten.text.trim();
      }
    }

    // embed the question
    const queryEmbedding = await ai.models.embedContent({
      model: "text-embedding-004",
      contents: finalQuestion,
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

    const results = await pineconeIndex.namespace(sessionId).query({
      vector: Array.from(embeddingValues),
      topK: 5,
      includeMetadata: true,
    });

    const contexts = results.matches
      .map((match) => match.metadata?.text)
      .filter(Boolean)
      .join("\n");

    // generate AI response

    await addMessageToChatHistory(sessionId, {
      role: "user",
      content: finalQuestion,
    });

    const aiResponse = await generateWithFallback(GENERATION_MODELS, {
      contents: ANSWER_PROMPT(contexts, finalQuestion),
    });

    await addMessageToChatHistory(sessionId, {
      role: "assistant",
      content: aiResponse.text || "I'm sorry, I couldn't generate a response.",
    });

    res.json({ answer: aiResponse.text });
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
