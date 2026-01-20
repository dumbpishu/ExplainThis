export const CHUNK_SUMMARY_PROMPT = (text: string) => `
You are an expert at clear and simple summaries.

TASK:
Summarize the text into very short bullet points.

STRICT RULES:
- Output ONLY bullet points
- Exactly 3 bullet points
- One clear sentence per bullet
- Maximum 15 words per bullet
- Use simple, everyday English
- Do NOT add or assume anything
- No explanations or extra text

TEXT:
${text}

OUTPUT FORMAT:
- Bullet 1
- Bullet 2
- Bullet 3
`;

export const FINAL_SUMMARY_PROMPT = (summaries: string) => `
You are great at creating clean, easy-to-read summaries.

TASK:
Combine the points below into one final summary.

STRICT RULES:
- Output ONLY bullet points
- Exactly 5 bullet points
- One short sentence per bullet
- Maximum 18 words per bullet
- Use very simple, human-friendly English
- Remove repeated or similar ideas
- Do NOT add new information
- No headings, titles, or introductions

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
You are a specialist at resolving unclear and context-dependent questions.

Conversation history (latest first):
${history.map((h) => `${h.role}: ${h.content}`).join("\n")}

Current user question:
${question}

TASK:
Rewrite the current question so it is fully understandable on its own.

THINKING STEPS (do silently):
1. Decide whether the question is complete and meaningful by itself.
2. If yes, return it unchanged.
3. If not, identify the most recent relevant USER question in the history.
4. Combine that topic with the current question to make it clear.

STRICT RULES:
- Preserve the user’s original intent exactly.
- Do NOT guess missing information.
- Do NOT introduce new topics.
- Do NOT add explanations, opinions, or extra detail.
- Keep the final question short, natural, and human-like.
- If no relevant past question exists, return the question unchanged.

OUTPUT:
Return ONLY the rewritten question.
`;

export const ANSWER_PROMPT = (context: string, question: string) => `
You are a helpful, friendly AI assistant.

Answer the user's question using ONLY the context below.

STYLE RULES:
- Be clear, simple, and to the point
- Use short paragraphs (2–3 lines max)
- Sound natural and human
- No headings, markdown, or emojis
- No unnecessary background

IMPORTANT:
- If the question is NOT related to the context:
  Respond with a light, friendly joke and clearly say you lack information.
  Example tone:
  "I searched my brain, but this topic is not in the notes I have 😄"

Context:
${context}

Question:
${question}

Answer:
`;
