import { apiConfig, handleResponse } from "./config";

export interface UploadResponse {
  sessionId: string;
  summary: string;
  chunkCount: number;
}

export const uploadPDF = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch(`${apiConfig.baseURL}/ingest-pdf`, {
    method: "POST",
    body: formData,
  });

  return handleResponse<UploadResponse>(response);
};

export const uploadText = async (text: string): Promise<UploadResponse> => {
  const response = await fetch(`${apiConfig.baseURL}/ingest-text`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ text }),
  });

  return handleResponse<UploadResponse>(response);
};
