import { ai } from "../config/gemini";
import { pineconeIndex } from "../config/pinecone";
import { chunkText } from "./chunker";
import { openRouter } from "../config/openrouter";

const SUMMARY_MODEL = "mistralai/mistral-7b-instruct:free";

type ProcessOptions = {
  embed?: boolean;
  summarize?: boolean;
  sessionId?: string;
};

export async function processText(
  text: string,
  options: ProcessOptions
): Promise<{ summary?: string; chunkCount?: number }> {
  const chunks = chunkText(text);
  const summaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const currentChunk = chunks[i];

    // summarization logic for each chunk
    // if (options.summarize) {
    //   const summaryRes = await ai.models.generateContent({
    //     model: "gemini-3-flash-preview",
    //     contents: `Summarize the following text:\n\n${currentChunk}`,
    //   });

    //   summaries.push(summaryRes.text || "");
    // }

    // using openrouter for summarization
    if (options.summarize) {
      const summaryRes = await openRouter.post("/chat/completions", {
        model: SUMMARY_MODEL,
        messages: [
          {
            role: "user",
            content: `Summarize the following text clearly and concisely:\n\n${currentChunk}`,
          },
        ],
      });

      summaries.push(summaryRes.data.choices[0].message.content.trim());
    }

    // embedding logic
    if (options.embed && options.sessionId) {
      const embeddingRes = await ai.models.embedContent({
        model: "text-embedding-004",
        contents: [currentChunk],
      });

      if (!embeddingRes.embeddings || embeddingRes.embeddings.length === 0) {
        throw new Error("Failed to generate embeddings for chunk");
      }

      await pineconeIndex.namespace(options.sessionId).upsert([
        {
          id: `chunk-${i}`,
          values: embeddingRes.embeddings[0].values,
          metadata: {
            sessionId: options.sessionId,
            chunkIndex: i,
            text: currentChunk,
          },
        },
      ]);
    }
  }

  let finalSummary: string | undefined;

  // if (options.summarize && summaries.length > 0) {
  //   const combinedSummaries = summaries.join("\n");
  //   const finalSummaryRes = await ai.models.generateContent({
  //     model: "gemini-3-flash-preview",
  //     contents: `Summarize the following text:\n\n${combinedSummaries}`,
  //   });

  //   finalSummary = finalSummaryRes.text || "";
  // }

  // using openrouter for final summarization
  if (options.summarize && summaries.length > 0) {
    const finalSummaryRes = await openRouter.post("/chat/completions", {
      model: SUMMARY_MODEL,
      messages: [
        {
          role: "user",
          content: `Create a concise final summary from the following summaries:\n\n${summaries.join(
            "\n"
          )}`,
        },
      ],
    });

    finalSummary = finalSummaryRes.data.choices[0].message.content.trim();
  }

  return { summary: finalSummary, chunkCount: chunks.length };
}
