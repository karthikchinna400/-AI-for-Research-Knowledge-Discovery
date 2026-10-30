# AI Research Copilot - REST API Documentation

Base URL: `/api/v1`  
Protocol: `HTTPS` (Production) / `HTTP` (Local development)  
Authentication: Bearer Token (`Authorization: Bearer <SUPABASE_ACCESS_TOKEN>`)

---

## 1. Health Endpoints
- `GET /health` - Root health check
- `GET /api/v1/health` - API health check

---

## 2. Authentication & Profile
- `GET /api/v1/auth/me` - Retrieve authenticated user session and profile
- `GET /api/v1/profile` - Retrieve current user profile
- `PATCH /api/v1/profile` - Update profile name, avatar, and language preferences

---

## 3. Research Projects
- `POST /api/v1/projects` - Create research project
- `GET /api/v1/projects` - List all projects owned by authenticated user
- `GET /api/v1/projects/:projectId` - Retrieve single project details
- `PATCH /api/v1/projects/:projectId` - Update project title, domain, or status
- `DELETE /api/v1/projects/:projectId` - Delete project and cascade records

---

## 4. Research Planning & Advisory
- `POST /api/v1/research/analyze-question` - AI decomposes natural language research question into refined scope, objectives, and keywords
- `POST /api/v1/research/generate-search-queries` - Generates diverse Boolean and natural search queries
- `POST /api/v1/research/validate-plan` - Pre-flight plan validation

---

## 5. Investigations
- `POST /api/v1/investigations` - Create investigation record
- `GET /api/v1/investigations` - List user investigations (supports `?projectId=`)
- `GET /api/v1/investigations/:investigationId` - Retrieve investigation
- `POST /api/v1/investigations/:investigationId/start` - Execute automated discovery workflow
- `GET /api/v1/investigations/:investigationId/status` - Poll investigation progress
- `POST /api/v1/investigations/:investigationId/cancel` - Cancel active investigation
- `DELETE /api/v1/investigations/:investigationId` - Delete investigation

---

## 6. Academic Source Discovery
- `POST /api/v1/investigations/:investigationId/discover` - Trigger academic search across Crossref, OpenAlex, Semantic Scholar, and Tavily
- `GET /api/v1/investigations/:investigationId/sources` - List discovered sources with metadata and quality scores
- `GET /api/v1/sources/:sourceId` - Retrieve source details
- `DELETE /api/v1/sources/:sourceId` - Delete source

---

## 7. Evidence Intelligence
- `POST /api/v1/investigations/:investigationId/extract-evidence` - AI extracts empirical claims, findings, methods, and limitations
- `GET /api/v1/investigations/:investigationId/evidence` - List extracted claims
- `GET /api/v1/evidence/:claimId` - Get claim details
- `DELETE /api/v1/evidence/:claimId` - Delete claim

---

## 8. Evidence Comparison
- `POST /api/v1/investigations/:investigationId/compare` - Compare claims across studies
- `GET /api/v1/investigations/:investigationId/comparisons` - List comparison records

---

## 9. Research Gaps & Themes
- `POST /api/v1/investigations/:investigationId/analyze-gaps` - Detect literature gaps
- `GET /api/v1/investigations/:investigationId/gaps` - List research gaps
- `POST /api/v1/investigations/:investigationId/analyze-themes` - Group findings into themes
- `GET /api/v1/investigations/:investigationId/themes` - List research themes

---

## 10. Knowledge Graph
- `POST /api/v1/investigations/:investigationId/generate-map` - Generate nodes and relationships
- `GET /api/v1/investigations/:investigationId/map` - Retrieve interactive graph data

---

## 11. Documents
- `POST /api/v1/documents/upload` - Upload PDF/DOCX/TXT file (multipart/form-data)
- `GET /api/v1/documents` - List uploaded documents
- `GET /api/v1/documents/:documentId` - Get document details
- `DELETE /api/v1/documents/:documentId` - Delete document and chunks

---

## 12. AI Research Copilot Chat
- `GET /api/v1/copilot/conversations` - List conversations
- `POST /api/v1/copilot/conversations` - Create conversation
- `GET /api/v1/copilot/conversations/:conversationId/messages` - Retrieve message history
- `POST /api/v1/copilot/ask` - Retrieval-Augmented Generation query

---

## 13. Reports
- `POST /api/v1/investigations/:investigationId/reports` - Generate structured report
- `GET /api/v1/investigations/:investigationId/reports` - List reports
- `GET /api/v1/reports/:reportId` - Retrieve report
- `GET /api/v1/reports/:reportId/download` - Download formatted Markdown report

