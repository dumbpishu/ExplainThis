import { Request, Response } from "express";
import { pineconeIndex } from "../config/pinecone";
import { redisClient } from "../config/redis";

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;

    if (!sessionId) {
      return res.status(400).json({ message: "Session ID is required" });
    }

    await pineconeIndex.deleteMany({
      filter: { sessionId },
    });

    await redisClient.del(`chat:history:${sessionId}`);

    res.status(200).json({ message: "Session deleted successfully" });
  } catch (error) {
    console.error("Error deleting session:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
