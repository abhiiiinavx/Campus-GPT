import fs from "fs";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";

export interface ExtractedDocumentContent {
  text: string;
  pageCount?: number;
  pages?: Array<{ pageNumber: number; text: string }>;
}

export const extractTextFromFile = async (
  filePath: string,
  mimeType: string,
): Promise<ExtractedDocumentContent> => {
  if (!fs.existsSync(filePath)) {
    throw new Error(`File not found at path: ${filePath}`);
  }

  const fileBuffer = fs.readFileSync(filePath);

  if (mimeType === "application/pdf" || filePath.endsWith(".pdf")) {
    try {
      const data = await pdfParse(fileBuffer);
      return {
        text: data.text,
        pageCount: data.numpages || 1,
      };
    } catch (err: any) {
      console.warn(`PDF parse fallback error: ${err?.message}`);
      return { text: fileBuffer.toString("utf-8"), pageCount: 1 };
    }
  }

  if (
    mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document" ||
    filePath.endsWith(".docx")
  ) {
    try {
      const result = await mammoth.extractRawText({ buffer: fileBuffer });
      return {
        text: result.value,
        pageCount: 1,
      };
    } catch (err: any) {
      console.warn(`Docx parse fallback: ${err?.message}`);
      return { text: fileBuffer.toString("utf-8"), pageCount: 1 };
    }
  }

  // Plain text / Markdown / other textual files
  const plainText = fileBuffer.toString("utf-8");
  return {
    text: plainText,
    pageCount: 1,
  };
};
