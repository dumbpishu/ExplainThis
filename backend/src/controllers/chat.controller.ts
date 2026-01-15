import { Request, Response } from "express";
import { ai } from "../config/gemini";
import { pineconeIndex } from "../config/pinecone";
import { getChatHistory, addMessageToChatHistory } from "../utils/chatMemory";
import { openRouter } from "../config/openrouter";

type ChatParams = {
  sessionId: string;
};

type ChatBody = {
  question: string;
};

export const chatWithAI = async (
  req: Request<ChatParams, {}, ChatBody>,
  res: Response
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
      const rewritePrompt = `
      You are rewriting a follow-up question so it is fully self-contained.

      Conversation so far:
      ${chatHistory.map((h) => `${h.role}: ${h.content}`).join("\n")}

      Follow-up question:
      ${question}

      Rewrite the question so it can be understood on its own.
      Return ONLY the rewritten question.
    `;

      // const rewritten = await ai.models.generateContent({
      //   model: "gemini-3-flash-preview",
      //   contents: rewritePrompt,
      // });

      // if (rewritten.text) {
      //   finalQuestion = rewritten.text.trim();
      // }

      // using openrouter for question rewriting
      const rewriteRes = await openRouter.post("/chat/completions", {
        model: "mistralai/mistral-7b-instruct:free",
        messages: [
          {
            role: "system",
            content:
              "Rewrite follow-up questions so they are fully self-contained.",
          },
          {
            role: "user",
            content: rewritePrompt,
          },
        ],
      });

      finalQuestion = rewriteRes.data.choices[0].message.content.trim();
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
    const contents = `
      You are a professional AI assistant.

      Use ONLY the provided context to answer the user's question.
      Follow these rules strictly:
      - Keep the answer concise and professional
      - Use short paragraphs (2–3 lines max)
      - Avoid headings, markdown lists, emojis, or decorative formatting
      - Do not add unnecessary background or storytelling
      - If the context is insufficient, clearly say so in one sentence

      Context:
      ${contexts}

      Question:
      ${finalQuestion}

      Answer:
    `;

    await addMessageToChatHistory(sessionId, {
      role: "user",
      content: finalQuestion,
    });

    // const aiResponse = await ai.models.generateContent({
    //   model: "gemini-3-flash-preview",
    //   contents,
    // });

    // using openrouter for AI response generation
    const answerRes = await openRouter.post("/chat/completions", {
      model: "mistralai/mistral-7b-instruct:free",
      messages: [
        {
          role: "system",
          content: "You are a professional AI assistant.",
        },
        {
          role: "user",
          content: contents,
        },
      ],
    });

    const answer = answerRes.data.choices[0].message.content.trim();

    await addMessageToChatHistory(sessionId, {
      role: "assistant",
      content: answer || "I'm sorry, I couldn't generate a response.",
    });

    res.json({ answer: answer });
  } catch (error) {
    console.error("Error in chatWithAI:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
