import { geminiProvider } from "./geminiProvider.js";
import { documentRepository } from "../repositories/document.repository.js";
import { RAGSource } from "../types/index.js";

export class RAGService {
  /**
   * Calculates cosine similarity between two numeric vectors
   */
  private cosineSimilarity(vecA: number[], vecB: number[]): number {
    if (!vecA || !vecB || vecA.length === 0 || vecB.length === 0) return 0;
    const len = Math.min(vecA.length, vecB.length);

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < len; i++) {
      dotProduct += vecA[i] * vecB[i];
      normA += vecA[i] * vecA[i];
      normB += vecB[i] * vecB[i];
    }

    const denominator = Math.sqrt(normA) * Math.sqrt(normB);
    if (denominator === 0) return 0;

    return dotProduct / denominator;
  }

  /**
   * Performs semantic search across all indexed document chunks
   */
  async retrieveContext(
    query: string,
    topK = 4,
    minSimilarity = 0.25,
  ): Promise<{
    contextText: string;
    sources: RAGSource[];
  }> {
    const queryEmbedding = await geminiProvider.generateEmbedding(query);
    const allChunks = await documentRepository.getAllChunksWithEmbeddings();

    if (allChunks.length === 0) {
      return { contextText: "", sources: [] };
    }

    const scoredChunks: Array<{
      chunk: (typeof allChunks)[0];
      similarity: number;
    }> = [];

    for (const chunk of allChunks) {
      let chunkEmbedding: number[] = [];
      if (Array.isArray(chunk.embedding)) {
        chunkEmbedding = chunk.embedding as number[];
      } else if (typeof chunk.embedding === "string") {
        try {
          chunkEmbedding = JSON.parse(chunk.embedding);
        } catch {
          chunkEmbedding = [];
        }
      }

      if (chunkEmbedding.length > 0) {
        const similarity = this.cosineSimilarity(
          queryEmbedding,
          chunkEmbedding,
        );
        if (similarity >= minSimilarity) {
          scoredChunks.push({ chunk, similarity });
        }
      }
    }

    // Sort descending by similarity
    scoredChunks.sort((a, b) => b.similarity - a.similarity);
    const topChunks = scoredChunks.slice(0, topK);

    if (topChunks.length === 0) {
      return { contextText: "", sources: [] };
    }

    const sources: RAGSource[] = topChunks.map(({ chunk, similarity }) => ({
      documentId: chunk.documentId,
      title: chunk.document.title,
      page: chunk.pageNumber,
      category: chunk.document.category,
      similarity: Number(similarity.toFixed(3)),
      snippet: chunk.content.slice(0, 150) + "...",
    }));

    const contextText = topChunks
      .map(
        ({ chunk }, idx) =>
          `[Source ${idx + 1}: "${chunk.document.title}" (Page ${chunk.pageNumber})]\n${chunk.content}`,
      )
      .join("\n\n");

    return { contextText, sources };
  }
}

export const ragService = new RAGService();
