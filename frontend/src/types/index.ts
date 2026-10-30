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

export interface User {
  id: string;
  email?: string;
  fullName?: string;
}

export interface Profile {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  preferred_language: string;
}

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

export interface SourceQuality {
  score: number;
  verifiedMetadata: boolean;
  hasDoi: boolean;
  hasAbstract: boolean;
  peerReviewed: 'verified' | 'unknown' | 'not_peer_reviewed' | 'preprint';
}

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
  source_quality: SourceQuality;
  created_at: string;
}

export interface EvidenceClaim {
  id: string;
  investigation_id: string;
  source_id: string;
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
  created_at: string;
}

export interface EvidenceComparison {
  id: string;
  investigation_id: string;
  claim_ids: string[];
  comparison_type: ComparisonType;
  summary: string;
  supporting_sources: string[];
  methodological_differences: string[];
  explanation: string;
  confidence: number;
  created_at: string;
}

export interface ResearchGap {
  id: string;
  investigation_id: string;
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

export interface ResearchTheme {
  id: string;
  investigation_id: string;
  name: string;
  description: string;
  keywords: string[];
  source_ids: string[];
  claim_ids: string[];
  created_at: string;
}

export interface KnowledgeEntity {
  id: string;
  investigation_id: string;
  entity_type: string;
  name: string;
  description?: string | null;
  metadata: Record<string, any>;
}

export interface KnowledgeRelationship {
  id: string;
  investigation_id: string;
  source_entity_id: string;
  target_entity_id: string;
  relationship_type: string;
  explanation: string;
  supporting_source_ids: string[];
  confidence: number;
}

export interface ResearchDocument {
  id: string;
  project_id: string;
  investigation_id?: string | null;
  file_name: string;
  storage_path: string;
  mime_type: string;
  file_size: number;
  processing_status: 'uploaded' | 'queued' | 'processing' | 'completed' | 'failed';
  extracted_text_status: 'pending' | 'extracted' | 'ocr_required' | 'failed';
  page_count: number;
  created_at: string;
}

export interface CopilotMessage {
  id: string;
  conversation_id: string;
  role: 'user' | 'assistant';
  content: string;
  citations: Array<{
    source_id: string;
    title?: string;
    doi?: string;
    year?: number;
    authors?: string[];
  }>;
  created_at: string;
}

export interface ResearchReport {
  id: string;
  investigation_id: string;
  title: string;
  report_type: string;
  content: any;
  format: 'markdown' | 'pdf' | 'docx' | 'json';
  status: 'generating' | 'completed' | 'failed';
  created_at: string;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data: T;
  message?: string;
  error?: {
    code: string;
    message: string;
    details?: any[];
  };
}

