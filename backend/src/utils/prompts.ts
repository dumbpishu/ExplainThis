export const CHUNK_SUMMARY_PROMPT = (text: string) => `
You are an expert technical summarizer.

TASK:
Summarize the text below clearly and concisely.

RULES:
- Focus only on important ideas and facts
- Remove examples, filler, and repetition
- Use simple, clear English
- Do NOT add new information
- Write 3–5 bullet points maximum
- Each bullet must be one short sentence

TEXT:
${text}
`;

export const FINAL_SUMMARY_PROMPT = (summaries: string) => `
You are an expert summarizer.

TASK:
Combine and refine the summaries below into ONE final summary.

RULES:
- Remove repeated points
- Keep only the most important information
- Write in clear, simple English
- Maximum 1 short paragraph OR 5 bullet points
- Do NOT mention "this text" or "the summary"

SUMMARIES:
${summaries}
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
