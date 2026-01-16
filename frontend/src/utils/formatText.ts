export const extractCleanSummary = (rawSummary: string): string => {
  if (!rawSummary) return "";

  if (!rawSummary.includes("### Response:")) {
    return cleanText(rawSummary);
  }

  const responseSections = rawSummary.split("### Response:");

  if (responseSections.length > 0) {
    const lastResponse = responseSections[responseSections.length - 1];

    const cleaned = lastResponse
      .replace(/\[\/s\]/g, "")
      .replace(/<s>/g, "")
      .replace(/<\/INST>/g, "")
      .replace(/---/g, "")
      .replace(
        /Create a concise final summary from the following summaries:/g,
        ""
      )
      .replace(/### Response:/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .replace(/\s+/g, " ")
      .trim();
    return cleaned;
  }

  return cleanText(rawSummary);
};

export const formatSummary = (text: string): string => {
  if (!text) return "";

  const paragraphs = text.split("\n").filter((p) => p.trim().length > 0);

  if (paragraphs.length === 0) return "";

  const formatted = paragraphs
    .map((paragraph) => {
      let cleaned = paragraph.trim();

      cleaned = cleaned
        .replace(/\[\/s\]/g, "")
        .replace(/<s>/g, "")
        .replace(/<\/INST>/g, "")
        .replace(/---/g, "");

      if (cleaned.length > 0) {
        const firstChar = cleaned.charAt(0).toUpperCase();
        const rest = cleaned.slice(1);
        cleaned = firstChar + rest;
      }

      if (cleaned.length > 0 && !/[.!?]$/.test(cleaned.trim())) {
        cleaned = cleaned.trim() + ".";
      }

      return cleaned.trim();
    })
    .filter((p) => p.length > 0)
    .join("\n\n");

  return formatted;
};

export const cleanText = (text: string): string => {
  if (!text) return "";

  const cleaned = text
    .replace(/[^\w\s.,!?;:'"()\-\n]/g, " ")
    .replace(/\s+/g, " ")
    .replace(/\n\s*\n/g, "\n")
    .trim();

  return cleaned;
};
