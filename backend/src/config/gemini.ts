import { GoogleGenAI } from '@google/genai';
import { env } from './env.js';
import { logger } from '../utils/logger.js';

let geminiClientInstance: GoogleGenAI | null = null;

export function getGeminiClient(): GoogleGenAI {
  if (!geminiClientInstance) {
    if (!env.GEMINI_API_KEY) {
      logger.warn('GEMINI_API_KEY is not configured in backend/.env.');
    }
    geminiClientInstance = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY || 'dummy_key' });
  }
  return geminiClientInstance;
}

export function isGeminiConfigured(): boolean {
  return Boolean(env.GEMINI_API_KEY && env.GEMINI_API_KEY !== 'your_gemini_api_key');
}

export function getGeminiModel(): string {
  return env.GEMINI_MODEL;
}

export function getEmbeddingModel(): string {
  return env.GEMINI_EMBEDDING_MODEL;
}

