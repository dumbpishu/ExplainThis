import { Pinecone } from "@pinecone-database/pinecone";
import { ENV } from "./env.js";

export const pinecone = new Pinecone({
  apiKey: ENV.PINECONE_API_KEY,
});

export const pineconeIndex = pinecone.Index(ENV.PINECONE_INDEX);
