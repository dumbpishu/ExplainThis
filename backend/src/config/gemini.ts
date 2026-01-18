import { GoogleGenAI } from "@google/genai";
import { ENV } from "./env.js";

export const ai = new GoogleGenAI({
  apiKey: ENV.GEMINI_API_KEY,
});
