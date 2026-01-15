import { apiConfig, handleResponse } from "./config";

export const deleteSession = async (sessionId: string): Promise<void> => {
  const response = await fetch(`${apiConfig.baseURL}/sessions/${sessionId}`, {
    method: "DELETE",
  });

  return handleResponse<void>(response);
};
