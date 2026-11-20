import fs from "fs";
import path from "path";
import { DocumentCategory, ProcessingStatus } from "../types/enums.js";
import { documentRepository } from "../repositories/document.repository.js";
import { extractTextFromFile } from "../utils/textExtractor.js";
import { chunkText } from "../utils/chunker.js";
import { geminiProvider } from "../ai/geminiProvider.js";
import { AppError } from "../middleware/errorHandler.js";
import { JwtUserPayload } from "../types/index.js";

export class DocumentService {
  async uploadAndProcessDocument(
    user: JwtUserPayload,
    file: Express.Multer.File,
    data: {
      title: string;
      description?: string;
      category?: DocumentCategory;
    },
  ) {
    if (!file) {
      throw new AppError("File is required for document upload.", 400);
    }

    // 1. Create document record in PENDING state
    const document = await documentRepository.create({
      title: data.title,
      description: data.description,
      category: data.category || DocumentCategory.GENERAL,
      fileName: file.originalname,
      fileUrl: file.path,
      mimeType: file.mimetype,
      fileSize: file.size,
      uploader: { connect: { id: user.id } },
      processingStatus: ProcessingStatus.PROCESSING,
    });

    // 2. Process asynchronous RAG indexing
    this.processRAGIndexing(document.id, file.path, file.mimetype).catch(
      (err) => {
        console.error(`Document RAG indexing failed for ${document.id}:`, err);
      },
    );

    return document;
  }

  private async processRAGIndexing(
    documentId: string,
    filePath: string,
    mimeType: string,
  ) {
    try {
      // 1. Text extraction
      const extracted = await extractTextFromFile(filePath, mimeType);
      if (!extracted.text.trim()) {
        await documentRepository.update(documentId, {
          processingStatus: ProcessingStatus.COMPLETED,
        });
        return;
      }

      // 2. Semantic chunking
      const chunks = chunkText(extracted.text, 600, 100);

      // 3. Generate embeddings
      const chunkData: Array<{
        content: string;
        chunkIndex: number;
        pageNumber: number;
        embedding: number[];
        metadata: any;
      }> = [];

      for (const chunk of chunks) {
        const embedding = await geminiProvider.generateEmbedding(chunk.content);
        chunkData.push({
          content: chunk.content,
          chunkIndex: chunk.chunkIndex,
          pageNumber: chunk.pageNumber,
          embedding,
          metadata: {
            length: chunk.content.length,
          },
        });
      }

      // 4. Store chunks
      await documentRepository.createChunks(documentId, chunkData);

      // 5. Update status
      await documentRepository.update(documentId, {
        processingStatus: ProcessingStatus.COMPLETED,
      });
    } catch (err: any) {
      console.error(`Error during document processing: ${err?.message}`);
      await documentRepository.update(documentId, {
        processingStatus: ProcessingStatus.FAILED,
      });
    }
  }

  async getDocumentById(id: string) {
    const doc = await documentRepository.findById(id);
    if (!doc) {
      throw new AppError("Document not found.", 404);
    }
    return doc;
  }

  async listDocuments(filter?: {
    category?: DocumentCategory;
    search?: string;
  }) {
    return documentRepository.list(filter);
  }

  async updateDocument(
    id: string,
    data: {
      title?: string;
      description?: string;
      category?: DocumentCategory;
    },
  ) {
    const existing = await documentRepository.findById(id);
    if (!existing) {
      throw new AppError("Document not found.", 404);
    }

    return documentRepository.update(id, {
      ...(data.title ? { title: data.title } : {}),
      ...(data.description !== undefined
        ? { description: data.description }
        : {}),
      ...(data.category ? { category: data.category } : {}),
    });
  }

  async deleteDocument(id: string) {
    const existing = await documentRepository.findById(id);
    if (!existing) {
      throw new AppError("Document not found.", 404);
    }

    // Delete physical file from disk if present
    if (existing.fileUrl && fs.existsSync(existing.fileUrl)) {
      try {
        fs.unlinkSync(existing.fileUrl);
      } catch (err) {
        console.warn(`Could not delete file from disk: ${existing.fileUrl}`);
      }
    }

    return documentRepository.delete(id);
  }
}

export const documentService = new DocumentService();
