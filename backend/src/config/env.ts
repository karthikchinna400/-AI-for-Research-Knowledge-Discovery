import dotenv from 'dotenv';
import { z } from 'zod';
import { logger } from '../utils/logger.js';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().default(5000),
  FRONTEND_URL: z.string().default('http://localhost:5173'),

  SUPABASE_URL: z.string().default('https://placeholder-project.supabase.co'),
  SUPABASE_ANON_KEY: z.string().default('placeholder-anon-key'),
  SUPABASE_SERVICE_ROLE_KEY: z.string().default('placeholder-service-role-key'),

  GEMINI_API_KEY: z.string().default(''),
  GEMINI_MODEL: z.string().default('gemini-2.0-flash'),
  GEMINI_EMBEDDING_MODEL: z.string().default('text-embedding-004'),

  TAVILY_API_KEY: z.string().default(''),

  CROSSREF_API_BASE_URL: z.string().default('https://api.crossref.org'),
  OPENALEX_API_BASE_URL: z.string().default('https://api.openalex.org'),
  OPENALEX_EMAIL: z.string().default('researcher@example.com'),
  SEMANTIC_SCHOLAR_API_KEY: z.string().default(''),

  MAX_FILE_SIZE_MB: z.coerce.number().default(20),
  MAX_RESEARCH_SOURCES: z.coerce.number().default(50),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().default(100),

  AI_REQUEST_TIMEOUT_MS: z.coerce.number().default(60000),
  AI_MAX_RETRIES: z.coerce.number().default(2),

  LOG_LEVEL: z.string().default('info')
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  logger.error({ errors: parsed.error.format() }, 'Invalid environment configuration');
  process.exit(1);
}

export const env = parsed.data;

