import { ai } from "../config/gemini.js";
import { pineconeIndex } from "../config/pinecone.js";
import { chunkText } from "./chunker.js";
import { CHUNK_SUMMARY_PROMPT, FINAL_SUMMARY_PROMPT } from "./prompts.js";
import { openRouterGenerate } from "../config/openrouter.js";

type ProcessOptions = {
  embed?: boolean;
  summarize?: boolean;
  sessionId?: string;
};

export async function processText(
  text: string,
  options: ProcessOptions,
): Promise<{ summary?: string; chunkCount?: number }> {
  const chunks = chunkText(text);
  const summaries: string[] = [];

  for (let i = 0; i < chunks.length; i++) {
    const currentChunk = chunks[i];

    // summarization logic for each chunk
    if (options.summarize) {
      const summaryRes = await openRouterGenerate(
        CHUNK_SUMMARY_PROMPT(currentChunk),
      );
      summaries.push(summaryRes || "");
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

  if (options.summarize && summaries.length > 0) {
    const combinedSummaries = summaries.join("\n");

    finalSummary = await openRouterGenerate(
      FINAL_SUMMARY_PROMPT(combinedSummaries),
    );
  }

  return { summary: finalSummary, chunkCount: chunks.length };
}
