import prisma from "../prisma/client.js";
import { Document, DocumentChunk, Prisma } from "@prisma/client";
import { DocumentCategory, ProcessingStatus } from "../types/enums.js";

export class DocumentRepository {
  async findById(id: string) {
    return prisma.document.findUnique({
      where: { id },
      include: {
        uploader: {
          select: { id: true, fullName: true, email: true },
        },
        chunks: {
          select: {
            id: true,
            chunkIndex: true,
            pageNumber: true,
            content: true,
            createdAt: true,
          },
          orderBy: { chunkIndex: "asc" },
        },
      },
    });
  }

  async create(data: Prisma.DocumentCreateInput): Promise<Document> {
    return prisma.document.create({
      data,
      include: {
        uploader: {
          select: { id: true, fullName: true, email: true },
        },
      },
    });
  }

  async update(
    id: string,
    data: Prisma.DocumentUpdateInput,
  ): Promise<Document> {
    return prisma.document.update({
      where: { id },
      data,
    });
  }

  async delete(id: string): Promise<Document> {
    return prisma.document.delete({
      where: { id },
    });
  }

  async list(filter?: { category?: DocumentCategory; search?: string }) {
    return prisma.document.findMany({
      where: {
        ...(filter?.category ? { category: filter.category } : {}),
        ...(filter?.search
          ? {
              OR: [
                { title: { contains: filter.search } },
                {
                  description: { contains: filter.search },
                },
              ],
            }
          : {}),
      },
      include: {
        uploader: {
          select: { id: true, fullName: true, email: true },
        },
        _count: {
          select: { chunks: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
  }

  async createChunks(
    documentId: string,
    chunks: Array<{
      content: string;
      chunkIndex: number;
      pageNumber: number;
      embedding?: number[];
      metadata?: any;
    }>,
  ) {
    // Delete existing chunks if re-processing
    await prisma.documentChunk.deleteMany({
      where: { documentId },
    });

    return prisma.documentChunk.createMany({
      data: chunks.map((c) => ({
        documentId,
        content: c.content,
        chunkIndex: c.chunkIndex,
        pageNumber: c.pageNumber,
        embedding: c.embedding ? JSON.stringify(c.embedding) : null,
        metadata: c.metadata ? JSON.stringify(c.metadata) : null,
      })),
    });
  }

  async getAllChunksWithEmbeddings(): Promise<
    (DocumentChunk & {
      document: { id: string; title: string; category: DocumentCategory };
    })[]
  > {
    return prisma.documentChunk.findMany({
      where: {
        document: {
          processingStatus: ProcessingStatus.COMPLETED,
        },
      },
      include: {
        document: {
          select: {
            id: true,
            title: true,
            category: true,
          },
        },
      },
    }) as any;
  }
}

export const documentRepository = new DocumentRepository();
