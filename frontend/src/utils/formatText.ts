export const extractCleanSummary = (rawSummary: string): string => {
  if (!rawSummary) return "";

  // If it's already in bullet format (starts with dash), return as is
  if (rawSummary.trim().startsWith("- ")) {
    return rawSummary.trim();
  }

  // Handle other formats if needed
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
        "",
      )
      .replace(/### Response:/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

    return cleaned;
  }

  return cleanText(rawSummary);
};

export const parseResumeSummary = (summary: string): string[] => {
  if (!summary) return [];

  // Split by newlines and filter out empty lines
  const lines = summary.split("\n").filter((line) => line.trim().length > 0);

  const bulletPoints: string[] = [];

  lines.forEach((line) => {
    const trimmedLine = line.trim();

    // Handle your specific format that starts with " - "
    if (trimmedLine.startsWith("- ")) {
      // Remove the leading dash and clean up
      let point = trimmedLine.substring(2).trim();

      if (point.length > 0) {
        // Capitalize first letter if it's not already
        if (point.length > 0 && !/[A-Z"'(]/.test(point.charAt(0))) {
          point = point.charAt(0).toUpperCase() + point.slice(1);
        }

        // Ensure it ends with proper punctuation
        if (!/[.!?]$/.test(point.trim())) {
          point = point.trim() + ".";
        }

        bulletPoints.push(point);
      }
    } else if (trimmedLine.length > 5) {
      // Handle any other non-empty lines
      let point = trimmedLine;

      // Ensure it ends with proper punctuation
      if (!/[.!?]$/.test(point.trim())) {
        point = point.trim() + ".";
      }

      bulletPoints.push(point);
    }
  });

  return bulletPoints;
};

// Optional: Keep the generic formatSummary for other cases
export const formatSummary = (text: string): string => {
  const points = parseResumeSummary(text);
  return points.join("\n");
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
