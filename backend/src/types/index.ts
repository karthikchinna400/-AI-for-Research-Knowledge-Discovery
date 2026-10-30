// ====================================================================
// AI RESEARCH COPILOT - SYSTEM DATA TYPES & INTERFACES
// ====================================================================

export type ProjectStatus = 'active' | 'archived' | 'completed';

export type InvestigationStatus = 
  | 'draft' 
  | 'planning' 
  | 'discovering' 
  | 'extracting' 
  | 'comparing' 
  | 'completed' 
  | 'failed' 
  | 'cancelled';

export type ResearchScope = 
  | 'Exploratory' 
  | 'Comparative' 
  | 'Systematic-style evidence review' 
  | 'Literature review' 
  | 'Technical investigation' 
  | 'Trend analysis' 
  | 'Methodology analysis';

export type EvidenceCategory = 
  | 'supporting' 
  | 'contradictory' 
  | 'neutral' 
  | 'methodological' 
  | 'limitation' 
  | 'recommendation' 
  | 'trend' 
  | 'uncertain';

export type EvidenceType = 
  | 'empirical' 
  | 'theoretical' 
  | 'observational' 
  | 'computational' 
  | 'review' 
  | 'meta-analysis';

export type ComparisonType = 
  | 'agreement' 
  | 'contradiction' 
  | 'complementary' 
  | 'methodological_difference' 
  | 'scope_difference' 
  | 'inconclusive';

export type EntityType = 
  | 'research_question' 
  | 'publication' 
  | 'author' 
  | 'research_theme' 
  | 'claim' 
  | 'method' 
  | 'dataset' 
  | 'research_gap' 
  | 'concept';

export type RelationshipType = 
  | 'supports' 
  | 'contradicts' 
  | 'extends' 
  | 'evaluates' 
  | 'utilizes' 
  | 'authored_by' 
  | 'identifies_gap' 
  | 'belongs_to' 
  | 'relates_to';

export type DocumentProcessingStatus = 
  | 'uploaded' 
  | 'queued' 
  | 'processing' 
  | 'completed' 
  | 'partially_completed' 
  | 'failed';

export type ExtractedTextStatus = 
  | 'pending' 
  | 'extracted' 
  | 'ocr_required' 
  | 'failed';

export type JobType = 
  | 'discovery' 
  | 'document_processing' 
  | 'evidence_extraction' 
  | 'comparison' 
  | 'gap_analysis' 
  | 'theme_detection' 
  | 'graph_generation' 
  | 'report_generation';

export type JobStatus = 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';

// User & Profile
export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
  created_at: string;
  updated_at: string;
}

// Research Project
export interface ResearchProject {
  id: string;
  user_id: string;
  title: string;
  description?: string | null;
  domain: string;
  status: ProjectStatus;
  created_at: string;
  updated_at: string;
}

// Research Investigation
export interface ResearchInvestigation {
  id: string;
  project_id: string;
  user_id: string;
  research_question: string;
  refined_question?: string | null;
  research_objectives: string[];
  search_queries: string[];
  research_scope: ResearchScope;
  filters: Record<string, any>;
  status: InvestigationStatus;
  progress: number;
  error_message?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Source Quality Assessment
export interface SourceQuality {
  score: number;
  verifiedMetadata: boolean;
  hasDoi: boolean;
  hasAbstract: boolean;
  peerReviewed: 'verified' | 'unknown' | 'not_peer_reviewed' | 'preprint';
  citationCount?: number;
  criteriaSummary?: string;
}

// Research Source
export interface ResearchSource {
  id: string;
  investigation_id: string;
  user_id: string;
  provider: string;
  provider_source_id: string;
  title: string;
  abstract?: string | null;
  authors: string[];
  publication_year?: number | null;
  publication_date?: string | null;
  doi?: string | null;
  url?: string | null;
  venue?: string | null;
  publication_type?: string | null;
  citation_count?: number;
  peer_review_status: 'verified' | 'unknown' | 'not_peer_reviewed' | 'preprint';
  retraction_status: 'unretracted' | 'retracted' | 'unknown';
  metadata: Record<string, any>;
  source_quality: SourceQuality;
  created_at: string;
  updated_at: string;
}

// Evidence Claim
export interface EvidenceClaim {
  id: string;
  investigation_id: string;
  source_id: string;
  user_id: string;
  claim_text: string;
  finding_text: string;
  supporting_excerpt?: string | null;
  page_number?: number | null;
  section_name?: string | null;
  methodology?: string | null;
  population?: string | null;
  sample_size?: string | null;
  dataset_description?: string | null;
  limitations: string[];
  evidence_category: EvidenceCategory;
  confidence: number;
  evidence_type: EvidenceType;
  metadata: Record<string, any>;
  created_at: string;
}

// Evidence Comparison
export interface EvidenceComparison {
  id: string;
  investigation_id: string;
  user_id: string;
  claim_ids: string[];
  comparison_type: ComparisonType;
  summary: string;
  supporting_sources: string[];
  methodological_differences: string[];
  explanation: string;
  confidence: number;
  created_at: string;
}

// Research Gap
export interface ResearchGap {
  id: string;
  investigation_id: string;
  user_id: string;
  title: string;
  description: string;
  related_themes: string[];
  supporting_source_ids: string[];
  supporting_claim_ids: string[];
  rationale: string;
  suggested_research_question: string;
  confidence: number;
  limitations: string[];
  created_at: string;
}

// Research Theme
export interface ResearchTheme {
  id: string;
  investigation_id: string;
  user_id: string;
  name: string;
  description: string;
  source_ids: string[];
  claim_ids: string[];
  keywords: string[];
  created_at: string;
}

// Knowledge Entities & Relationships
export interface KnowledgeEntity {
  id: string;
  investigation_id: string;
  user_id: string;
  entity_type: EntityType;
  name: string;
  description?: string | null;
  metadata: Record<string, any>;
  created_at: string;
}

export interface KnowledgeRelationship {
  id: string;
  investigation_id: string;
  user_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: RelationshipType;
  explanation: string;
  supporting_source_ids: string[];
  confidence: number;
  created_at: string;
}

// Document & Chunks
export interface ResearchDocument {
  id: string;
  user_id: string;
  project_id: string;
  investigation_id?: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  checksum?: string | null;
  processing_status: DocumentProcessingStatus;
  extracted_text_status: ExtractedTextStatus;
  page_count: number;
  metadata: Record<string, any>;
  error_message?: string | null;
  created_at: string;
  updated_at: string;
}

export interface DocumentChunk {
  id: string;
  document_id: string;
  user_id: string;
  investigation_id?: string | null;
  chunk_index: number;
  content: string;
  page_number?: number | null;
  section_name?: string | null;
  token_count: number;
  embedding?: number[];
  metadata: Record<string, any>;
  created_at: string;
}

// Copilot Chat
export interface CopilotConversation {
  id: string;
  user_id: string;
  investigation_id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface CopilotCitation {
  source_id: string;
  claim_id?: string;
  title?: string;
  url?: string;
  doi?: string;
  authors?: string[];
  year?: number;
  page?: number;
  excerpt?: string;
}

export interface CopilotMessage {
  id: string;
  conversation_id: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  citations: CopilotCitation[];
  metadata: Record<string, any>;
  created_at: string;
}

// Research Report
export interface ResearchReport {
  id: string;
  user_id: string;
  investigation_id: string;
  title: string;
  report_type: string;
  content: Record<string, any>;
  storage_path?: string | null;
  format: 'markdown' | 'pdf' | 'docx' | 'json';
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

// Background Job
export interface ResearchJob {
  id: string;
  user_id: string;
  investigation_id: string;
  job_type: JobType;
  status: JobStatus;
  attempts: number;
  max_attempts: number;
  payload: Record<string, any>;
  result?: Record<string, any> | null;
  error_message?: string | null;
  locked_at?: string | null;
  started_at?: string | null;
  completed_at?: string | null;
  created_at: string;
  updated_at: string;
}

// Standard API Responses
export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

export interface PaginatedResponse<T> extends ApiResponse<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

// AI Schema Response Types
export interface AIQuestionAnalysis {
  originalQuestion: string;
  refinedQuestion: string;
  primaryDomain: string;
  secondaryDomains: string[];
  objectives: string[];
  keywords: string[];
  relatedConcepts: string[];
  suggestedSearchQueries: string[];
  scopeConcerns: string[];
  clarificationNeeded: boolean;
  clarificationQuestions: string[];
}

export interface AISearchQueries {
  queries: Array<{
    query: string;
    purpose: string;
    domain: string;
    priority: 'high' | 'medium' | 'low';
  }>;
}

export interface AINormalizedSource {
  provider: string;
  providerSourceId: string;
  title: string;
  abstract: string | null;
  authors: string[];
  publicationYear: number | null;
  publicationDate: string | null;
  doi: string | null;
  url: string | null;
  venue: string | null;
  publicationType: string | null;
  citationCount: number | null;
  metadataCompleteness: 'full' | 'partial' | 'minimal';
}

export interface AIExtractedClaims {
  claims: Array<{
    claim: string;
    finding: string;
    supportingExcerpt: string | null;
    pageNumber: number | null;
    sectionName: string | null;
    methodology: string | null;
    population: string | null;
    sampleSize: string | null;
    datasetDescription: string | null;
    evidenceCategory: EvidenceCategory;
    evidenceType: EvidenceType;
    limitations: string[];
    confidence: number;
    sourceId: string;
  }>;
}

export interface AIEvidenceComparisons {
  comparisons: Array<{
    comparisonType: ComparisonType;
    summary: string;
    claimIds: string[];
    supportingSourceIds: string[];
    methodologicalDifferences: string[];
    explanation: string;
    confidence: number;
  }>;
}

export interface AIResearchGaps {
  gaps: Array<{
    title: string;
    description: string;
    relatedThemes: string[];
    supportingSourceIds: string[];
    supportingClaimIds: string[];
    rationale: string;
    suggestedResearchQuestion: string;
    confidence: number;
    limitations: string[];
  }>;
}

export interface AIResearchThemes {
  themes: Array<{
    name: string;
    description: string;
    keywords: string[];
    sourceIds: string[];
    claimIds: string[];
  }>;
}

export interface AIKnowledgeGraph {
  entities: Array<{
    entityType: EntityType;
    name: string;
    description: string;
    metadata: Record<string, any>;
  }>;
  relationships: Array<{
    sourceEntityId: string;
    targetEntityId: string;
    relationshipType: RelationshipType;
    explanation: string;
    supportingSourceIds: string[];
    confidence: number;
  }>;
}

export interface AICopilotAnswer {
  answer: string;
  keyPoints: string[];
  evidenceClaims: Array<{
    claimId: string;
    sourceIds: string[];
    explanation: string;
  }>;
  limitations: string[];
  uncertainties: string[];
  followUpQuestions: string[];
  evidenceSufficient: boolean;
}

export interface AIResearchReport {
  title: string;
  executiveSummary: string;
  researchQuestion: string;
  objectives: string[];
  methodology: string;
  sourcesReviewed: string[];
  keyFindings: string[];
  evidenceComparisons: string[];
  contradictions: string[];
  researchThemes: string[];
  potentialResearchGaps: string[];
  limitations: string[];
  futureResearchDirections: string[];
  references: Array<{
    sourceId: string;
    citationText: string;
  }>;
}

