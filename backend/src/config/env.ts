import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 8000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
  PINECONE_INDEX: process.env.PINECONE_INDEX!,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  REDIS_URL: process.env.REDIS_URL || "redis://localhost:6379",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,
  OPENROUTER_BASE_URL:
    process.env.OPENROUTER_BASE_URL ||
    "https://openrouter.ai/api/v1/chat/completions",
};
