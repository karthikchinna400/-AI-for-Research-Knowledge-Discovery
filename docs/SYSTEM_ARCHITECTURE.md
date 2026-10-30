# System Architecture Documentation

## Architecture Diagram

```
+-------------------------------------------------------------+
|                 REACT + VITE FRONTEND (Vercel)              |
|  - TanStack Query (Server State)                            |
|  - React Flow (Interactive Knowledge Graph)                 |
|  - Tailwind CSS (Accessible SaaS UI)                        |
|  - Supabase Auth Client (JWT Session)                       |
+------------------------------+------------------------------+
                               |
                               | HTTPS / REST (/api/v1)
                               v
+-------------------------------------------------------------+
|               NODE.JS + EXPRESS BACKEND (Render)            |
|  - Helmet & CORS Security Headers                           |
|  - Rate Limiting Middleware                                 |
|  - Bearer Token Auth Verification                           |
|  - Zod Request & AI Output Validation                       |
|  - Background Worker (Job Polling & Processing)             |
+---------------+-----------------------------+---------------+
                |                             |
                v                             v
+-------------------------------+ +---------------------------+
|      GOOGLE GEMINI AI         | |     RESEARCH PROVIDERS    |
| - @google/genai SDK           | | - Crossref API            |
| - Gemini 2.0 Flash            | | - OpenAlex API            |
| - text-embedding-004 (768d)   | | - Semantic Scholar API    |
| - Structured JSON Outputs     | | - Tavily Search API       |
+---------------+---------------+ +-------------+-------------+
                |                             |
                +--------------+--------------+
                               |
                               v
+-------------------------------------------------------------+
|                     SUPABASE POSTGRESQL                     |
|  - 17 Relational Tables                                     |
|  - Row Level Security (RLS) On All Tables                   |
|  - pgvector (768-dimensional Cosine Vector Search)          |
|  - Private Storage Bucket (`research-documents`)            |
|  - Automated Updated_at Triggers                            |
+-------------------------------------------------------------+
```

## Data Isolation & Multi-Tenancy

Every user record is explicitly isolated by `user_id`:
1. **Row Level Security (RLS):** All 17 tables have RLS enabled with PostgreSQL security policies verifying `auth.uid() = user_id`.
2. **Backend Verification:** In addition to database RLS, ownership middlewares explicitly verify that any project, investigation, source, or document referenced in a route belongs to the caller.
3. **Private Storage:** Document files in Supabase Storage reside in user-scoped folders (`{userId}/{projectId}/{filename}`).

