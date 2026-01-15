// Function to clean text by removing special characters except newlines and basic punctuation
export const cleanText = (text: string): string => {
  if (!text) return "";

  // Keep newlines, spaces, letters, numbers, and basic punctuation
  const cleaned = text
    .replace(/[^\w\s.,!?;:'"()\-\n]/g, " ") // Remove special chars, keep punctuation and newlines
    .replace(/\s+/g, " ") // Replace multiple spaces with single space
    .replace(/\n\s*\n/g, "\n") // Replace multiple newlines with single newline
    .trim();

  return cleaned;
};
