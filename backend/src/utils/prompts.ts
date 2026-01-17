export const CHUNK_SUMMARY_PROMPT = (text: string) => `
You are a professional summarizer.

TASK:
Summarize the text into SHORT bullet points.

STRICT RULES:
- Output ONLY bullet points
- Exactly 3 bullet points
- Each bullet must be ONE simple sentence
- Maximum 15 words per bullet
- Use simple, everyday English
- Do NOT add new information
- Do NOT write paragraphs

TEXT:
${text}

OUTPUT FORMAT:
- Bullet 1
- Bullet 2
- Bullet 3
`;

export const FINAL_SUMMARY_PROMPT = (summaries: string) => `
You are a professional summarizer.

TASK:
Create ONE final summary from the points below.

STRICT RULES (DO NOT BREAK):
- Output ONLY bullet points
- Exactly 5 bullet points
- Each bullet must be ONE short sentence
- Maximum 18 words per bullet
- Use very simple, human-readable English
- Remove repeated ideas
- Do NOT write paragraphs
- Do NOT add headings or introductions
- Do NOT mention "summary", "text", or "document"

INPUT:
${summaries}

OUTPUT FORMAT:
- Bullet 1
- Bullet 2
- Bullet 3
- Bullet 4
- Bullet 5
`;

export const REWRITE_QUESTION_PROMPT = (
  history: { role: string; content: string }[],
  question: string,
) => `
You are rewriting a follow-up question so it is fully self-contained.

Conversation so far:
${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

Follow-up question:
${question}

Rewrite the question so it can be understood on its own.
Return ONLY the rewritten question.
`;

export const ANSWER_PROMPT = (context: string, question: string) => `
You are a professional AI assistant.

Use ONLY the provided context to answer the user's question.

RULES:
- Keep the answer concise and professional
- Use short paragraphs (2–3 lines max)
- Avoid headings, markdown lists, emojis, or decorative formatting
- Do not add unnecessary background or storytelling
- If the context is insufficient, clearly say so in one sentence

Context:
${context}

Question:
${question}

Answer:
`;
