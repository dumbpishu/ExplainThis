const BASE_URL = "http://localhost:8000/api";

export async function uploadText(text: string) {
  const response = await fetch(`${BASE_URL}/ingest-text`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  if (!response.ok) {
    throw new Error("Failed to upload text");
  }

  const data = await response.json();
  return data;
}

export async function uploadPDF(file: File) {
  const formData = new FormData();
  formData.append("file", file);

  const response = await fetch("http://localhost:8000/api/ingest-pdf", {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error("Failed to upload PDF");
  }

  const data = await response.json();
  return data;
}
