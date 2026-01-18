import { redisClient } from "../config/redis.js";

export type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

const MAX_MESSAGES = 10;
const CHAT_TTL_SECONDS = 60 * 60; // 1 hour

const getKey = (sessionId: string) => `chat:history:${sessionId}`;

export const getChatHistory = async (
  sessionId: string,
): Promise<ChatMessage[]> => {
  const data = await redisClient.get(getKey(sessionId));
  return data ? JSON.parse(data) : [];
};

export const addMessageToChatHistory = async (
  sessionId: string,
  message: ChatMessage,
): Promise<void> => {
  const key = getKey(sessionId);
  const history = await getChatHistory(sessionId);

  history.push(message);

  if (history.length > MAX_MESSAGES) {
    history.shift();
  }

  await redisClient.set(key, JSON.stringify(history), {
    EX: CHAT_TTL_SECONDS,
  });
};

export const clearChatHistory = async (sessionId: string): Promise<void> => {
  await redisClient.del(getKey(sessionId));
};
