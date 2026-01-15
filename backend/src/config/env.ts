import dotenv from "dotenv";
dotenv.config();

export const ENV = {
  PORT: process.env.PORT || 8000,
  GEMINI_API_KEY: process.env.GEMINI_API_KEY!,
  PINECONE_API_KEY: process.env.PINECONE_API_KEY!,
  PINECONE_INDEX: process.env.PINECONE_INDEX!,
  CORS_ORIGIN: process.env.CORS_ORIGIN || "http://localhost:5173",
  OPENROUTER_API_KEY: process.env.OPENROUTER_API_KEY!,
};
