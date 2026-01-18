import axios from "axios";
import { ENV } from "./env.js";

const { OPENROUTER_API_KEY, OPENROUTER_BASE_URL } = ENV;

export const OPENROUTER_MODEL = "mistralai/mistral-7b-instruct";

export async function openRouterGenerate(prompt: string): Promise<string> {
  try {
    const res = await axios.post(
      OPENROUTER_BASE_URL,
      {
        model: OPENROUTER_MODEL,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
      },
      {
        headers: {
          Authorization: `Bearer ${OPENROUTER_API_KEY}`,
          "Content-Type": "application/json",
          "HTTP-Referer": "http://localhost",
          "X-Title": "PDF Summarizer",
        },
        timeout: 60_000,
      },
    );

    return res.data?.choices?.[0]?.message?.content || "";
  } catch (error: any) {
    const msg =
      error?.response?.data || error?.message || "Unknown OpenRouter error";

    throw new Error(`OpenRouter error: ${JSON.stringify(msg)}`);
  }
}
