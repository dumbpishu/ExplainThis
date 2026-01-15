export async function askQuestion(sessionId: string, question: string) {
  const response = await fetch(`http://localhost:8000/api/chat/${sessionId}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ question }),
  });

  if (!response.ok) {
    throw new Error("Failed to ask question");
  }

  const data = await response.json();
  return data;
}
