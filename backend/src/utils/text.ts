export const cleanText = (text: string) =>
  text
    .replace(/--\s*\d+\s*of\s*\d+\s*--/gi, "")
    .replace(/\s+/g, " ")
    .trim();

export const isReadableText = (text: string) => {
  if (!text) return false;

  const cleaned = text.replace(/\s/g, "");
  if (cleaned.length < 50) return false;

  const alphaCount = (cleaned.match(/[a-zA-Z]/g) || []).length;
  const ratio = alphaCount / cleaned.length;

  return ratio > 0.3; // 30% real characters
};
