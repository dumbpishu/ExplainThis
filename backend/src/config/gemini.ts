import { GoogleGenAI } from "@google/genai";
import { ENV } from "./env";

export const ai = new GoogleGenAI({
  apiKey: ENV.GEMINI_API_KEY,
});
