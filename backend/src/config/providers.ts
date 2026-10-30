import { env } from './env.js';

export const providersConfig = {
  crossref: {
    baseUrl: env.CROSSREF_API_BASE_URL,
    userAgent: `AIResearchCopilot/1.0 (mailto:${env.OPENALEX_EMAIL})`
  },
  openalex: {
    baseUrl: env.OPENALEX_API_BASE_URL,
    email: env.OPENALEX_EMAIL
  },
  semanticScholar: {
    baseUrl: 'https://api.semanticscholar.org/graph/v1',
    apiKey: env.SEMANTIC_SCHOLAR_API_KEY
  },
  tavily: {
    baseUrl: 'https://api.tavily.com',
    apiKey: env.TAVILY_API_KEY
  }
};

