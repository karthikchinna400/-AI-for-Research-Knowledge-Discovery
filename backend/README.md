# AI Research Copilot - Backend Service

Production-grade Node.js + Express + TypeScript service powering evidence intelligence, Google Gemini reasoning, academic discovery, and background workers.

## Features
- Google Gemini official SDK integration (`@google/genai`)
- Academic discovery adapters: Crossref, OpenAlex, Semantic Scholar, Tavily
- Document processor: PDF (`pdf-parse`), DOCX (`mammoth`), TXT
- Supabase PostgreSQL with RLS and pgvector (768 dimensions)
- Background research queue worker with atomic claiming and retries
- Zod request validation and structured AI schemas

## Development
```bash
# Install dependencies
npm install

# Start development server with live reload
npm run dev

# Compile TypeScript
npm run build

# Start production server
npm start
```
Health Endpoint: `http://localhost:5000/health`

