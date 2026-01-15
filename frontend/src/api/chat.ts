import { apiConfig, handleResponse } from "./config";

export interface ChatResponse {
  answer: string;
}

export const askQuestion = async (
  sessionId: string,
  question: string
): Promise<ChatResponse> => {
  const response = await fetch(`${apiConfig.baseURL}/chat/${sessionId}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ question }),
  });

  return handleResponse<ChatResponse>(response);
};
