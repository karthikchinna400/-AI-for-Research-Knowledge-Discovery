import { getGeminiClient, isGeminiConfigured, getEmbeddingModel } from '../config/gemini.js';
import { logger } from '../utils/logger.js';

export class EmbeddingService {
  public async generateEmbedding(text: string): Promise<number[]> {
    if (!text || text.trim().length === 0) {
      return new Array(768).fill(0);
    }

    if (isGeminiConfigured()) {
      try {
        const ai = getGeminiClient();
        const model = getEmbeddingModel();
        const response = await ai.models.embedContent({
          model,
          contents: text
        });

        const respAny: any = response;
        if (respAny.embedding?.values) {
          return respAny.embedding.values;
        } else if (respAny.embeddings?.[0]?.values) {
          return respAny.embeddings[0].values;
        }
      } catch (err: any) {
        logger.warn({ error: err.message }, 'Failed to generate embedding via Gemini API. Using fallback vector.');
      }
    }

    // Deterministic pseudo-embedding (768 dimensions, normalized)
    return this.createDeterministicVector(text, 768);
  }

  public chunkText(text: string, chunkSize = 1000, overlap = 150): string[] {
    const chunks: string[] = [];
    let start = 0;

    while (start < text.length) {
      const end = Math.min(start + chunkSize, text.length);
      const chunk = text.slice(start, end).trim();
      if (chunk.length > 50) {
        chunks.push(chunk);
      }
      if (end >= text.length) break;
      start += chunkSize - overlap;
    }

    return chunks;
  }

  private createDeterministicVector(text: string, dimensions: number): number[] {
    const vector = new Array(dimensions).fill(0);
    let hash = 0;
    for (let i = 0; i < text.length; i++) {
      hash = (hash << 5) - hash + text.charCodeAt(i);
      hash |= 0;
      const idx = Math.abs(hash) % dimensions;
      vector[idx] += 1;
    }

    // L2 Normalize
    let norm = 0;
    for (let i = 0; i < dimensions; i++) {
      norm += vector[i] * vector[i];
    }
    norm = Math.sqrt(norm) || 1;
    for (let i = 0; i < dimensions; i++) {
      vector[i] = vector[i] / norm;
    }

    return vector;
  }
}

export const embeddingService = new EmbeddingService();
