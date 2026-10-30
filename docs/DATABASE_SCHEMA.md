# Database Schema Documentation

Database Engine: **Supabase PostgreSQL 15+**  
Extensions: `pgcrypto`, `vector` (pgvector)  
Migration File: `backend/supabase/migrations/202610300001_initial_schema.sql`

---

## Tables Overview

1. **`profiles`**
   - User identity profile referencing `auth.users(id)`.
   - Columns: `id`, `full_name`, `avatar_url`, `preferred_language`, `created_at`, `updated_at`.

2. **`research_projects`**
   - High-level research project container.
   - Columns: `id`, `user_id`, `title`, `description`, `domain`, `status`, timestamps.

3. **`research_investigations`**
   - Core research investigation record.
   - Columns: `id`, `project_id`, `user_id`, `research_question`, `refined_question`, `research_objectives` (JSONB), `search_queries` (JSONB), `research_scope`, `filters` (JSONB), `status`, `progress`, `error_message`, timestamps.

4. **`research_sources`**
   - Academic publication or web source records retrieved from Crossref, OpenAlex, Semantic Scholar, or Tavily.
   - Columns: `id`, `investigation_id`, `user_id`, `provider`, `provider_source_id`, `title`, `abstract`, `authors` (JSONB), `publication_year`, `doi`, `url`, `venue`, `citation_count`, `peer_review_status`, `source_quality` (JSONB), timestamps.
   - Constraint: Unique on `(investigation_id, provider, provider_source_id)`.

5. **`evidence_claims`**
   - Extracted empirical claims and findings.
   - Columns: `id`, `investigation_id`, `source_id`, `user_id`, `claim_text`, `finding_text`, `supporting_excerpt`, `page_number`, `section_name`, `methodology`, `population`, `sample_size`, `limitations` (JSONB), `evidence_category`, `confidence`, `evidence_type`, timestamps.

6. **`evidence_comparisons`**
   - Cross-study syntheses and contradiction analyses.
   - Columns: `id`, `investigation_id`, `user_id`, `claim_ids` (JSONB), `comparison_type`, `summary`, `supporting_sources` (JSONB), `methodological_differences` (JSONB), `explanation`, `confidence`, `created_at`.

7. **`research_gaps`**
   - Identified absences or limitations in reviewed sources.
   - Columns: `id`, `investigation_id`, `user_id`, `title`, `description`, `related_themes` (JSONB), `supporting_source_ids` (JSONB), `rationale`, `suggested_research_question`, `confidence`, `limitations` (JSONB), `created_at`.

8. **`research_themes`**
   - Conceptual themes clustering claims and sources.
   - Columns: `id`, `investigation_id`, `user_id`, `name`, `description`, `source_ids` (JSONB), `claim_ids` (JSONB), `keywords` (JSONB), `created_at`.

9. **`knowledge_entities`**
   - Nodes in the knowledge graph.
   - Columns: `id`, `investigation_id`, `user_id`, `entity_type`, `name`, `description`, `metadata` (JSONB), `created_at`.

10. **`knowledge_relationships`**
    - Edges in the knowledge graph.
    - Columns: `id`, `investigation_id`, `user_id`, `source_entity_id`, `target_entity_id`, `relationship_type`, `explanation`, `supporting_source_ids` (JSONB), `confidence`, `created_at`.

11. **`documents`**
    - Uploaded files in private Supabase Storage.
    - Columns: `id`, `user_id`, `project_id`, `investigation_id`, `file_name`, `storage_path`, `mime_type`, `file_size`, `processing_status`, `page_count`, timestamps.

12. **`document_chunks`**
    - Chunked text segments with pgvector embeddings for RAG retrieval.
    - Columns: `id`, `document_id`, `user_id`, `investigation_id`, `chunk_index`, `content`, `page_number`, `embedding` (vector(768)), timestamps.

13. **`copilot_conversations`** & **`copilot_messages`**
    - Grounded chat conversation and message records with citation lists.

14. **`research_reports`**
    - Generated synthesis documents in Markdown, JSON, or PDF formats.

15. **`research_activity`**
    - User activity audit trail.

16. **`research_jobs`**
    - Background job queue table for atomic claiming and asynchronous execution.

