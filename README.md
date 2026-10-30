# AI RESEARCH COPILOT – Evidence Intelligence & Knowledge Discovery Platform

An elite, full-stack, production-ready research intelligence platform designed to transform natural language research inquiries into structured, transparent, and citation-traceable evidence maps.

---

## 1. Project Title
**AI Research Copilot – Evidence Intelligence & Knowledge Discovery Platform**

## 2. Problem Statement
Researchers, analysts, and students lose hundreds of hours sifting through fragmented academic portals, reading dense multi-page PDFs, identifying contradictions, and cross-comparing empirical methodologies. Existing general-purpose chatbots hallucinate citations, invent facts, and fail to provide verifiable source provenance.

## 3. Proposed Solution
An autonomous research copilot that systematically searches academic databases (Crossref, OpenAlex, Semantic Scholar, Tavily), processes research documents, extracts structured empirical findings with page references, identifies methodological disagreements and research gaps, generates interactive knowledge graphs, and synthesizes citation-backed reports.

## 4. Key Objectives
- Transform research questions into structured evidence intelligence.
- Guarantee strict provenance: every claim links to real source identifiers.
- Differentiate peer-reviewed works from preprints.
- Clarify methodological boundaries and communicate scientific uncertainty.
- Eliminate fabricated citations and unsupported generative claims.

## 5. Core Features
- **Authentication & User Isolation:** Supabase Auth with Row Level Security on all 17 database tables.
- **AI Research Advisory:** Decomposes complex questions into refined scopes, keywords, and queries.
- **Academic Source Discovery:** Integrated adapters for Crossref, OpenAlex, Semantic Scholar, and Tavily.
- **Document Processing:** PDF, DOCX, and TXT parsing with semantic chunking and pgvector embeddings.
- **Evidence Extraction:** Extracts empirical findings, sample sizes, cohort demographics, and limitations.
- **Evidence Comparison:** Side-by-side synthesis detecting agreements and genuine contradictions.
- **Research Gap Identification:** Uncovers underexplored areas and suggests future research directions.
- **Interactive Knowledge Graph:** React Flow visual network connecting inquiries, papers, themes, and gaps.
- **Grounded AI Copilot:** RAG conversational assistant with citation reference chips.
- **Report Generation:** Generates comprehensive reports with downloadable Markdown files.
- **Background Worker:** Asynchronous job execution with atomic locking and retry handling.

## 6. Technology Stack
- **Frontend:** React 18, Vite, TypeScript, Tailwind CSS, TanStack Query, React Flow, Recharts, Lucide React.
- **Backend:** Node.js, Express, TypeScript, `@google/genai` (Official SDK), Supabase JS, Zod, Multer, pdf-parse, mammoth, Pino, Helmet, CORS.
- **Database:** Supabase PostgreSQL 15+, pgvector (768-dimensional embeddings), Row Level Security (RLS).
- **Deployment:** Vercel (Frontend), Render (Backend & Background Worker).

## 7. Architecture Diagram
```
+-------------------------------------------------------------+
|                 REACT + VITE FRONTEND (Vercel)              |
+------------------------------+------------------------------+
                               |
                               | HTTPS / REST (/api/v1)
                               v
+-------------------------------------------------------------+
|               NODE.JS + EXPRESS BACKEND (Render)            |
+---------------+-----------------------------+---------------+
                |                             |
                v                             v
+-------------------------------+ +---------------------------+
|      GOOGLE GEMINI AI         | |     RESEARCH PROVIDERS    |
| - @google/genai SDK           | | - Crossref API            |
| - Gemini 2.0 Flash            | | - OpenAlex API            |
| - text-embedding-004 (768d)   | | - Semantic Scholar API    |
+---------------+---------------+ | - Tavily Search API       |
                |                 +-------------+-------------+
                |                               |
                +--------------+----------------+
                               |
                               v
+-------------------------------------------------------------+
|                     SUPABASE POSTGRESQL                     |
|  - 17 Relational Tables + RLS Policies                      |
|  - pgvector (Cosine Vector Similarity)                      |
|  - Private Storage Bucket (`research-documents`)            |
+-------------------------------------------------------------+
```

## 8. Folder Structure
```text
AI-RESEARCH-COPILOT/
├── backend/
│   ├── src/
│   │   ├── config/          # Environment, Supabase, Gemini, Provider config
│   │   ├── middleware/      # Auth, ownership, validation, error, rate-limiting
│   │   ├── modules/         # Auth, projects, investigations, discovery, evidence, etc.
│   │   ├── providers/       # Crossref, OpenAlex, Semantic Scholar, Tavily adapters
│   │   ├── services/        # AI service, embeddings, document processor
│   │   ├── workers/         # Background queue worker
│   │   ├── prompts/         # AI prompts with strict system instructions
│   │   ├── schemas/         # Zod schemas for requests & 10 AI outputs
│   │   ├── types/           # TypeScript domain models and interfaces
│   │   ├── utils/           # Logger, custom errors, response helpers
│   │   ├── routes/v1.ts     # Main API v1 router
│   │   ├── app.ts           # Express application setup
│   │   └── server.ts        # Server entry point
│   ├── supabase/
│   │   ├── migrations/      # 202610300001_initial_schema.sql
│   │   ├── seed.sql
│   │   └── config.toml
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── components/      # Common, layout, research, sources, evidence, graph, etc.
│   │   ├── contexts/        # AuthContext with Supabase & local dev mode
│   │   ├── lib/             # Supabase & Axios clients
│   │   ├── pages/           # Landing, Dashboard, Research, Workspace sub-pages
│   │   ├── routes/          # ProtectedRoute guard
│   │   ├── services/        # Typed API service
│   │   ├── schemas/         # React Hook Form validation schemas
│   │   ├── types/           # Frontend TypeScript interfaces
│   │   ├── styles/          # Tailwind directives and custom scrollbars
│   │   ├── App.tsx          # Router configuration
│   │   └── main.tsx         # Root mounting point
│   └── package.json
├── docs/                    # Architecture, API, Security, Schema, Deployment guides
└── package.json             # Root runner scripts
```

## 9. Prerequisites
- Node.js >= 20.x (tested on v24.15.0)
- npm >= 10.x
- Git

## 10. Installation Instructions
```bash
# Clone the repository
git clone <YOUR_REPOSITORY_URL>
cd ai-research-copilot

# Install root, backend, and frontend dependencies
npm run install:all
```

## 11. Backend Setup
```bash
cd backend
npm install
npm run build
```

## 12. Frontend Setup
```bash
cd frontend
npm install
npm run build
```

## 13. Environment Configuration
Create `.env` in `backend/` from `backend/.env.example`.
Create `.env` in `frontend/` from `frontend/.env.example`.

## 14. Supabase Setup & Account
1. Create a project at [supabase.com](https://supabase.com).
2. Go to Project Settings > API to copy `Project URL`, `anon public key`, and `service_role secret key`.

## 15. SQL Migration Execution
Navigate to the SQL Editor in your Supabase dashboard and run the script in:
`backend/supabase/migrations/202610300001_initial_schema.sql`

## 16. Supabase Storage Configuration
The migration automatically creates the `research-documents` bucket and sets RLS policies ensuring only file owners can view or download objects.

## 17. Google Gemini Configuration
Obtain an API key from Google AI Studio. Set `GEMINI_API_KEY` in `backend/.env`.

## 18. Research Provider Configurations
- **Crossref:** Free public REST API (User-Agent header required).
- **OpenAlex:** Free open access API (include `OPENALEX_EMAIL` for polite pool).
- **Semantic Scholar:** Optional API key for elevated rate limits.
- **Tavily:** Academic web discovery (set `TAVILY_API_KEY`).

## 19. Local Development
To run both backend and frontend concurrently:
```bash
npm run dev
```
- Frontend: `http://localhost:5173`
- Backend: `http://localhost:5000`
- API Health: `http://localhost:5000/health`

## 20. Testing & Verification
```bash
# Typecheck backend
cd backend && npx tsc --noEmit

# Typecheck frontend
cd frontend && npx tsc -b
```

## 21. Deployment on Vercel (Frontend)
- Framework: Vite
- Root Directory: `frontend`
- Build Command: `npm run build`
- Output Directory: `dist`

## 22. Deployment on Render (Backend)
- Root Directory: `backend`
- Build Command: `npm install && npm run build`
- Start Command: `npm start`

## 23. Troubleshooting
- **Missing API Keys:** If `GEMINI_API_KEY` or Supabase credentials are not yet set, the platform will start cleanly in local development mode with deterministic intelligence fallbacks.
- **CORS Issues:** Add your production frontend domain to `FRONTEND_URL` in `backend/.env`.

## 24. License
MIT License.

#   - A I - f o r - R e s e a r c h - K n o w l e d g e - D i s c o v e r y  
 #   - A I - f o r - R e s e a r c h - K n o w l e d g e - D i s c o v e r y  
 