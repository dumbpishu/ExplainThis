import { Request, Response } from "express";
import { generateSessionId } from "../utils/session";

export const createSession = (req: Request, res: Response) => {
  const sessionId = generateSessionId();
  res.status(201).json({ sessionId });
};
