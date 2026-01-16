import { ai } from "../config/gemini";

type GenerateArgs = {
  contents: string;
};

export async function generateWithFallback(
  models: string[],
  args: GenerateArgs
) {
  let lastError: any;

  for (const model of models) {
    try {
      const res = await ai.models.generateContent({
        model,
        contents: args.contents,
      });

      if (!res?.text) {
        throw new Error("Empty response from model");
      }

      return {
        text: res.text,
        modelUsed: model,
      };
    } catch (error: any) {
      lastError = error;

      console.error(
        `[LLM FALLBACK] Model failed: ${model}`,
        error?.message || error
      );

      // non-retryable errors
      if (error?.status === 400) {
        break; // bad request → no retry
      }
    }
  }

  throw lastError || new Error("All LLM models failed");
}
