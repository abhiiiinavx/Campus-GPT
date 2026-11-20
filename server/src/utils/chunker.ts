export interface TextChunk {
  content: string;
  chunkIndex: number;
  pageNumber: number;
}

export const cleanText = (rawText: string): string => {
  return rawText
    .replace(/\r\n/g, "\n")
    .replace(/\r/g, "\n")
    .replace(/\t/g, " ")
    .replace(/[^\x20-\x7E\n]/g, " ") // Clean non-printable characters while keeping standard ASCII and newlines
    .replace(/ +/g, " ")
    .replace(/\n\s*\n\s*\n/g, "\n\n")
    .trim();
};

export const chunkText = (
  text: string,
  chunkSize = 600,
  chunkOverlap = 100,
): TextChunk[] => {
  const cleaned = cleanText(text);
  if (!cleaned) return [];

  const chunks: TextChunk[] = [];
  let startIndex = 0;
  let chunkIdx = 0;

  while (startIndex < cleaned.length) {
    let endIndex = startIndex + chunkSize;

    if (endIndex < cleaned.length) {
      // Find clean break point (newline or period or space)
      const nextBreak = cleaned.lastIndexOf("\n", endIndex);
      const nextPeriod = cleaned.lastIndexOf(". ", endIndex);
      const nextSpace = cleaned.lastIndexOf(" ", endIndex);

      if (nextBreak > startIndex + chunkSize / 2) {
        endIndex = nextBreak + 1;
      } else if (nextPeriod > startIndex + chunkSize / 2) {
        endIndex = nextPeriod + 2;
      } else if (nextSpace > startIndex + chunkSize / 2) {
        endIndex = nextSpace + 1;
      }
    } else {
      endIndex = cleaned.length;
    }

    const chunkContent = cleaned.slice(startIndex, endIndex).trim();
    if (chunkContent.length > 20) {
      // Approximate page number (roughly 2000 characters per typical page)
      const pageNumber = Math.floor(startIndex / 2000) + 1;

      chunks.push({
        content: chunkContent,
        chunkIndex: chunkIdx++,
        pageNumber,
      });
    }

    startIndex = endIndex - chunkOverlap;
    if (startIndex >= cleaned.length - chunkOverlap) {
      break;
    }
  }

  return chunks;
};
