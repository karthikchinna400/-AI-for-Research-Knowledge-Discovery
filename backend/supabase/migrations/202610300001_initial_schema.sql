-- ====================================================================
-- AI RESEARCH COPILOT - INITIAL DATABASE MIGRATION
-- Migration: 202610300001_initial_schema.sql
-- Description: Complete schema with 17 tables, RLS, indexes, and vector support
-- ====================================================================

-- 1. EXTENSIONS
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
CREATE EXTENSION IF NOT EXISTS "vector";

-- 2. HELPER FUNCTIONS & TRIGGERS
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT,
    avatar_url TEXT,
    preferred_language VARCHAR(10) DEFAULT 'en',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_profiles_updated_at
BEFORE UPDATE ON public.profiles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Auto-create profile on auth.users insert
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, full_name, avatar_url)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Researcher'),
        NEW.raw_user_meta_data->>'avatar_url'
    )
    ON CONFLICT (id) DO NOTHING;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
AFTER INSERT ON auth.users
FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 4. RESEARCH PROJECTS TABLE
CREATE TABLE IF NOT EXISTS public.research_projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    domain VARCHAR(100) NOT NULL DEFAULT 'Computer Science',
    status VARCHAR(50) NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'archived', 'completed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_research_projects_updated_at
BEFORE UPDATE ON public.research_projects
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 5. RESEARCH INVESTIGATIONS TABLE
CREATE TABLE IF NOT EXISTS public.research_investigations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    research_question TEXT NOT NULL,
    refined_question TEXT,
    research_objectives JSONB DEFAULT '[]'::jsonb,
    search_queries JSONB DEFAULT '[]'::jsonb,
    research_scope VARCHAR(100) DEFAULT 'Exploratory' CHECK (research_scope IN ('Exploratory', 'Comparative', 'Systematic-style evidence review', 'Literature review', 'Technical investigation', 'Trend analysis', 'Methodology analysis')),
    filters JSONB DEFAULT '{}'::jsonb,
    status VARCHAR(50) NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'planning', 'discovering', 'extracting', 'comparing', 'completed', 'failed', 'cancelled')),
    progress INTEGER NOT NULL DEFAULT 0 CHECK (progress >= 0 AND progress <= 100),
    error_message TEXT,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_research_investigations_updated_at
BEFORE UPDATE ON public.research_investigations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 6. RESEARCH SOURCES TABLE
CREATE TABLE IF NOT EXISTS public.research_sources (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    provider VARCHAR(50) NOT NULL,
    provider_source_id TEXT NOT NULL,
    title TEXT NOT NULL,
    abstract TEXT,
    authors JSONB DEFAULT '[]'::jsonb,
    publication_year INTEGER,
    publication_date VARCHAR(50),
    doi TEXT,
    url TEXT,
    venue TEXT,
    publication_type VARCHAR(100),
    citation_count INTEGER DEFAULT 0,
    peer_review_status VARCHAR(50) DEFAULT 'unknown' CHECK (peer_review_status IN ('verified', 'unknown', 'not_peer_reviewed', 'preprint')),
    retraction_status VARCHAR(50) DEFAULT 'unretracted' CHECK (retraction_status IN ('unretracted', 'retracted', 'unknown')),
    metadata JSONB DEFAULT '{}'::jsonb,
    source_quality JSONB DEFAULT '{"score": 50, "verifiedMetadata": false, "hasDoi": false, "hasAbstract": false, "peerReviewed": "unknown"}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_investigation_provider_source UNIQUE (investigation_id, provider, provider_source_id)
);

CREATE TRIGGER update_research_sources_updated_at
BEFORE UPDATE ON public.research_sources
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 7. EVIDENCE CLAIMS TABLE
CREATE TABLE IF NOT EXISTS public.evidence_claims (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    source_id UUID NOT NULL REFERENCES public.research_sources(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    claim_text TEXT NOT NULL,
    finding_text TEXT NOT NULL,
    supporting_excerpt TEXT,
    page_number INTEGER,
    section_name VARCHAR(150),
    methodology TEXT,
    population TEXT,
    sample_size VARCHAR(100),
    dataset_description TEXT,
    limitations JSONB DEFAULT '[]'::jsonb,
    evidence_category VARCHAR(100) NOT NULL DEFAULT 'supporting' CHECK (evidence_category IN ('supporting', 'contradictory', 'neutral', 'methodological', 'limitation', 'recommendation', 'trend', 'uncertain')),
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.85 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    evidence_type VARCHAR(100) NOT NULL DEFAULT 'empirical' CHECK (evidence_type IN ('empirical', 'theoretical', 'observational', 'computational', 'review', 'meta-analysis')),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. EVIDENCE COMPARISONS TABLE
CREATE TABLE IF NOT EXISTS public.evidence_comparisons (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    claim_ids JSONB NOT NULL DEFAULT '[]'::jsonb,
    comparison_type VARCHAR(50) NOT NULL CHECK (comparison_type IN ('agreement', 'contradiction', 'complementary', 'methodological_difference', 'scope_difference', 'inconclusive')),
    summary TEXT NOT NULL,
    supporting_sources JSONB DEFAULT '[]'::jsonb,
    methodological_differences JSONB DEFAULT '[]'::jsonb,
    explanation TEXT NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.85 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. RESEARCH GAPS TABLE
CREATE TABLE IF NOT EXISTS public.research_gaps (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    description TEXT NOT NULL,
    related_themes JSONB DEFAULT '[]'::jsonb,
    supporting_source_ids JSONB DEFAULT '[]'::jsonb,
    supporting_claim_ids JSONB DEFAULT '[]'::jsonb,
    rationale TEXT NOT NULL,
    suggested_research_question TEXT NOT NULL,
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.80 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    limitations JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. RESEARCH THEMES TABLE
CREATE TABLE IF NOT EXISTS public.research_themes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name VARCHAR(200) NOT NULL,
    description TEXT NOT NULL,
    source_ids JSONB DEFAULT '[]'::jsonb,
    claim_ids JSONB DEFAULT '[]'::jsonb,
    keywords JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. KNOWLEDGE ENTITIES TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_entities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    entity_type VARCHAR(100) NOT NULL CHECK (entity_type IN ('research_question', 'publication', 'author', 'research_theme', 'claim', 'method', 'dataset', 'research_gap', 'concept')),
    name VARCHAR(250) NOT NULL,
    description TEXT,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. KNOWLEDGE RELATIONSHIPS TABLE
CREATE TABLE IF NOT EXISTS public.knowledge_relationships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    source_entity_id UUID NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
    target_entity_id UUID NOT NULL REFERENCES public.knowledge_entities(id) ON DELETE CASCADE,
    relationship_type VARCHAR(100) NOT NULL CHECK (relationship_type IN ('supports', 'contradicts', 'extends', 'evaluates', 'utilizes', 'authored_by', 'identifies_gap', 'belongs_to', 'relates_to')),
    explanation TEXT NOT NULL,
    supporting_source_ids JSONB DEFAULT '[]'::jsonb,
    confidence NUMERIC(3, 2) NOT NULL DEFAULT 0.85 CHECK (confidence >= 0.0 AND confidence <= 1.0),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. DOCUMENTS TABLE
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID NOT NULL REFERENCES public.research_projects(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES public.research_investigations(id) ON DELETE SET NULL,
    file_name VARCHAR(255) NOT NULL,
    storage_path TEXT NOT NULL,
    mime_type VARCHAR(100) NOT NULL,
    file_size BIGINT NOT NULL,
    checksum VARCHAR(64),
    processing_status VARCHAR(50) NOT NULL DEFAULT 'uploaded' CHECK (processing_status IN ('uploaded', 'queued', 'processing', 'completed', 'partially_completed', 'failed')),
    extracted_text_status VARCHAR(50) DEFAULT 'pending' CHECK (extracted_text_status IN ('pending', 'extracted', 'ocr_required', 'failed')),
    page_count INTEGER DEFAULT 0,
    metadata JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_documents_updated_at
BEFORE UPDATE ON public.documents
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 14. DOCUMENT CHUNKS TABLE (with pgvector embedding vector(768))
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES public.research_investigations(id) ON DELETE SET NULL,
    chunk_index INTEGER NOT NULL,
    content TEXT NOT NULL,
    page_number INTEGER,
    section_name VARCHAR(200),
    token_count INTEGER DEFAULT 0,
    embedding vector(768),
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. COPILOT CONVERSATIONS TABLE
CREATE TABLE IF NOT EXISTS public.copilot_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL DEFAULT 'Research Discussion',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_copilot_conversations_updated_at
BEFORE UPDATE ON public.copilot_conversations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 16. COPILOT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS public.copilot_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.copilot_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL CHECK (role IN ('user', 'assistant', 'system')),
    content TEXT NOT NULL,
    citations JSONB DEFAULT '[]'::jsonb,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 17. RESEARCH REPORTS TABLE
CREATE TABLE IF NOT EXISTS public.research_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    title VARCHAR(300) NOT NULL,
    report_type VARCHAR(100) NOT NULL DEFAULT 'Comprehensive Research Report',
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    storage_path TEXT,
    format VARCHAR(20) NOT NULL DEFAULT 'markdown' CHECK (format IN ('markdown', 'pdf', 'docx', 'json')),
    status VARCHAR(50) NOT NULL DEFAULT 'completed' CHECK (status IN ('generating', 'completed', 'failed')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_research_reports_updated_at
BEFORE UPDATE ON public.research_reports
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 18. RESEARCH ACTIVITY TABLE
CREATE TABLE IF NOT EXISTS public.research_activity (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    project_id UUID REFERENCES public.research_projects(id) ON DELETE CASCADE,
    investigation_id UUID REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    activity_type VARCHAR(100) NOT NULL,
    description TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 19. RESEARCH JOBS TABLE (Background job queue)
CREATE TABLE IF NOT EXISTS public.research_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    investigation_id UUID NOT NULL REFERENCES public.research_investigations(id) ON DELETE CASCADE,
    job_type VARCHAR(100) NOT NULL CHECK (job_type IN ('discovery', 'document_processing', 'evidence_extraction', 'comparison', 'gap_analysis', 'theme_detection', 'graph_generation', 'report_generation')),
    status VARCHAR(50) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'running', 'completed', 'failed', 'cancelled')),
    attempts INTEGER NOT NULL DEFAULT 0,
    max_attempts INTEGER NOT NULL DEFAULT 3,
    payload JSONB NOT NULL DEFAULT '{}'::jsonb,
    result JSONB DEFAULT '{}'::jsonb,
    error_message TEXT,
    locked_at TIMESTAMPTZ,
    started_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TRIGGER update_research_jobs_updated_at
BEFORE UPDATE ON public.research_jobs
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- 20. INDEXES FOR HIGH-PERFORMANCE QUERIES
CREATE INDEX IF NOT EXISTS idx_research_projects_user ON public.research_projects(user_id);
CREATE INDEX IF NOT EXISTS idx_investigations_project ON public.research_investigations(project_id);
CREATE INDEX IF NOT EXISTS idx_investigations_user ON public.research_investigations(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_investigation ON public.research_sources(investigation_id);
CREATE INDEX IF NOT EXISTS idx_sources_user ON public.research_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_sources_doi ON public.research_sources(doi);
CREATE INDEX IF NOT EXISTS idx_sources_year ON public.research_sources(publication_year);
CREATE INDEX IF NOT EXISTS idx_sources_provider ON public.research_sources(provider);

CREATE INDEX IF NOT EXISTS idx_evidence_investigation ON public.evidence_claims(investigation_id);
CREATE INDEX IF NOT EXISTS idx_evidence_source ON public.evidence_claims(source_id);
CREATE INDEX IF NOT EXISTS idx_evidence_category ON public.evidence_claims(evidence_category);

CREATE INDEX IF NOT EXISTS idx_comparisons_investigation ON public.evidence_comparisons(investigation_id);
CREATE INDEX IF NOT EXISTS idx_gaps_investigation ON public.research_gaps(investigation_id);
CREATE INDEX IF NOT EXISTS idx_themes_investigation ON public.research_themes(investigation_id);
CREATE INDEX IF NOT EXISTS idx_entities_investigation ON public.knowledge_entities(investigation_id);
CREATE INDEX IF NOT EXISTS idx_relationships_investigation ON public.knowledge_relationships(investigation_id);

CREATE INDEX IF NOT EXISTS idx_documents_user ON public.documents(user_id);
CREATE INDEX IF NOT EXISTS idx_documents_project ON public.documents(project_id);
CREATE INDEX IF NOT EXISTS idx_chunks_document ON public.document_chunks(document_id);
CREATE INDEX IF NOT EXISTS idx_chunks_investigation ON public.document_chunks(investigation_id);

CREATE INDEX IF NOT EXISTS idx_copilot_conv_user ON public.copilot_conversations(user_id);
CREATE INDEX IF NOT EXISTS idx_copilot_conv_investigation ON public.copilot_conversations(investigation_id);
CREATE INDEX IF NOT EXISTS idx_copilot_msg_conv ON public.copilot_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_reports_investigation ON public.research_reports(investigation_id);
CREATE INDEX IF NOT EXISTS idx_activity_user ON public.research_activity(user_id);
CREATE INDEX IF NOT EXISTS idx_jobs_status ON public.research_jobs(status, locked_at);

-- Full text search indexes
CREATE INDEX IF NOT EXISTS idx_sources_title_fts ON public.research_sources USING gin(to_tsvector('english', title));
CREATE INDEX IF NOT EXISTS idx_evidence_claim_fts ON public.evidence_claims USING gin(to_tsvector('english', claim_text));
CREATE INDEX IF NOT EXISTS idx_chunks_content_fts ON public.document_chunks USING gin(to_tsvector('english', content));

-- Vector similarity index (HNSW for cosine distance)
CREATE INDEX IF NOT EXISTS idx_document_chunks_embedding 
ON public.document_chunks 
USING hnsw (embedding vector_cosine_ops);

-- 21. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_investigations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.evidence_comparisons ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_gaps ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_entities ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_relationships ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.copilot_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_activity ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.research_jobs ENABLE ROW LEVEL SECURITY;

-- Profiles: users manage their own profile
CREATE POLICY "Users can view their own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update their own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert their own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Research Projects
CREATE POLICY "Users can view own projects" ON public.research_projects FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own projects" ON public.research_projects FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own projects" ON public.research_projects FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own projects" ON public.research_projects FOR DELETE USING (auth.uid() = user_id);

-- Research Investigations
CREATE POLICY "Users can view own investigations" ON public.research_investigations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own investigations" ON public.research_investigations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own investigations" ON public.research_investigations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own investigations" ON public.research_investigations FOR DELETE USING (auth.uid() = user_id);

-- Research Sources
CREATE POLICY "Users can view own sources" ON public.research_sources FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own sources" ON public.research_sources FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own sources" ON public.research_sources FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own sources" ON public.research_sources FOR DELETE USING (auth.uid() = user_id);

-- Evidence Claims
CREATE POLICY "Users can view own claims" ON public.evidence_claims FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own claims" ON public.evidence_claims FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own claims" ON public.evidence_claims FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own claims" ON public.evidence_claims FOR DELETE USING (auth.uid() = user_id);

-- Evidence Comparisons
CREATE POLICY "Users can view own comparisons" ON public.evidence_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comparisons" ON public.evidence_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own comparisons" ON public.evidence_comparisons FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own comparisons" ON public.evidence_comparisons FOR DELETE USING (auth.uid() = user_id);

-- Research Gaps
CREATE POLICY "Users can view own gaps" ON public.research_gaps FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own gaps" ON public.research_gaps FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own gaps" ON public.research_gaps FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own gaps" ON public.research_gaps FOR DELETE USING (auth.uid() = user_id);

-- Research Themes
CREATE POLICY "Users can view own themes" ON public.research_themes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own themes" ON public.research_themes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own themes" ON public.research_themes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own themes" ON public.research_themes FOR DELETE USING (auth.uid() = user_id);

-- Knowledge Entities
CREATE POLICY "Users can view own entities" ON public.knowledge_entities FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own entities" ON public.knowledge_entities FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entities" ON public.knowledge_entities FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own entities" ON public.knowledge_entities FOR DELETE USING (auth.uid() = user_id);

-- Knowledge Relationships
CREATE POLICY "Users can view own relationships" ON public.knowledge_relationships FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own relationships" ON public.knowledge_relationships FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own relationships" ON public.knowledge_relationships FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own relationships" ON public.knowledge_relationships FOR DELETE USING (auth.uid() = user_id);

-- Documents
CREATE POLICY "Users can view own documents" ON public.documents FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own documents" ON public.documents FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own documents" ON public.documents FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own documents" ON public.documents FOR DELETE USING (auth.uid() = user_id);

-- Document Chunks
CREATE POLICY "Users can view own chunks" ON public.document_chunks FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own chunks" ON public.document_chunks FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own chunks" ON public.document_chunks FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own chunks" ON public.document_chunks FOR DELETE USING (auth.uid() = user_id);

-- Copilot Conversations
CREATE POLICY "Users can view own conversations" ON public.copilot_conversations FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own conversations" ON public.copilot_conversations FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own conversations" ON public.copilot_conversations FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own conversations" ON public.copilot_conversations FOR DELETE USING (auth.uid() = user_id);

-- Copilot Messages
CREATE POLICY "Users can view own messages" ON public.copilot_messages FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own messages" ON public.copilot_messages FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Research Reports
CREATE POLICY "Users can view own reports" ON public.research_reports FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reports" ON public.research_reports FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reports" ON public.research_reports FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reports" ON public.research_reports FOR DELETE USING (auth.uid() = user_id);

-- Research Activity
CREATE POLICY "Users can view own activity" ON public.research_activity FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own activity" ON public.research_activity FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Research Jobs
CREATE POLICY "Users can view own jobs" ON public.research_jobs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own jobs" ON public.research_jobs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own jobs" ON public.research_jobs FOR UPDATE USING (auth.uid() = user_id);

-- 22. SUPABASE STORAGE BUCKET & POLICIES
INSERT INTO storage.buckets (id, name, public) 
VALUES ('research-documents', 'research-documents', false)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Allow authenticated users to upload documents"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (bucket_id = 'research-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to read their own documents"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'research-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

CREATE POLICY "Allow users to delete their own documents"
ON storage.objects FOR DELETE TO authenticated
USING (bucket_id = 'research-documents' AND (storage.foldername(name))[1] = auth.uid()::text);

