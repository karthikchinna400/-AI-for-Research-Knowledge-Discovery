import { z } from 'zod';

// ====================================================================
// COMMON SCHEMAS
// ====================================================================
export const uuidSchema = z.string().uuid({ message: 'Invalid UUID format' });

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortOrder: z.enum(['asc', 'desc']).default('desc')
});

// ====================================================================
// AUTH & PROFILE SCHEMAS
// ====================================================================
export const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  fullName: z.string().min(2).max(100)
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1, 'Password is required')
});

export const updateProfileSchema = z.object({
  fullName: z.string().min(2).max(100).optional(),
  avatarUrl: z.string().url().optional().nullable(),
  preferredLanguage: z.string().min(2).max(10).optional()
});

// ====================================================================
// RESEARCH PROJECT SCHEMAS
// ====================================================================
export const createProjectSchema = z.object({
  title: z.string().min(3).max(150),
  description: z.string().max(1000).optional(),
  domain: z.string().min(2).max(100).default('Computer Science')
});

export const updateProjectSchema = createProjectSchema.partial().extend({
  status: z.enum(['active', 'archived', 'completed']).optional()
});

// ====================================================================
// RESEARCH PLANNING & INVESTIGATION SCHEMAS
// ====================================================================
export const analyzeQuestionSchema = z.object({
  question: z.string().min(5).max(2000),
  domain: z.string().min(2).default('Computer Science'),
  scope: z.enum([
    'Exploratory',
    'Comparative',
    'Systematic-style evidence review',
    'Literature review',
    'Technical investigation',
    'Trend analysis',
    'Methodology analysis'
  ]).default('Exploratory')
});

export const createInvestigationSchema = z.object({
  projectId: uuidSchema,
  researchQuestion: z.string().min(5).max(2000),
  refinedQuestion: z.string().max(2000).optional(),
  researchObjectives: z.array(z.string()).default([]),
  searchQueries: z.array(z.string()).default([]),
  researchScope: z.enum([
    'Exploratory',
    'Comparative',
    'Systematic-style evidence review',
    'Literature review',
    'Technical investigation',
    'Trend analysis',
    'Methodology analysis'
  ]).default('Exploratory'),
  filters: z.object({
    startYear: z.number().int().min(1900).max(2100).optional(),
    endYear: z.number().int().min(1900).max(2100).optional(),
    sourceTypes: z.array(z.string()).optional(),
    languages: z.array(z.string()).optional(),
    maxSources: z.number().int().min(5).max(100).default(30),
    includeWebResearch: z.boolean().default(true),
    includePreprints: z.boolean().default(true)
  }).default({})
});

export const updateInvestigationSchema = z.object({
  status: z.enum(['draft', 'planning', 'discovering', 'extracting', 'comparing', 'completed', 'failed', 'cancelled']).optional(),
  progress: z.number().int().min(0).max(100).optional(),
  error_message: z.string().nullable().optional()
});

// ====================================================================
// DISCOVERY & SOURCE SCHEMAS
// ====================================================================
export const discoverSourcesSchema = z.object({
  providers: z.array(z.enum(['crossref', 'openalex', 'semantic-scholar', 'tavily'])).default(['crossref', 'openalex', 'tavily']),
  maxSourcesPerProvider: z.number().int().min(1).max(50).default(15)
});

export const updateSourceSchema = z.object({
  peerReviewStatus: z.enum(['verified', 'unknown', 'not_peer_reviewed', 'preprint']).optional(),
  retractionStatus: z.enum(['unretracted', 'retracted', 'unknown']).optional(),
  venue: z.string().optional()
});

// ====================================================================
// EVIDENCE EXTRACTION & COMPARISON SCHEMAS
// ====================================================================
export const extractEvidenceSchema = z.object({
  sourceIds: z.array(uuidSchema).optional()
});

export const compareEvidenceSchema = z.object({
  claimIds: z.array(uuidSchema).min(2, 'At least 2 claims are required for comparison')
});

export const updateClaimSchema = z.object({
  claimText: z.string().min(5).optional(),
  findingText: z.string().min(5).optional(),
  evidenceCategory: z.enum([
    'supporting',
    'contradictory',
    'neutral',
    'methodological',
    'limitation',
    'recommendation',
    'trend',
    'uncertain'
  ]).optional(),
  confidence: z.number().min(0).max(1).optional()
});

// ====================================================================
// COPILOT CHAT SCHEMAS
// ====================================================================
export const createConversationSchema = z.object({
  investigationId: uuidSchema,
  title: z.string().min(1).max(200).default('Research Discussion')
});

export const sendCopilotMessageSchema = z.object({
  conversationId: uuidSchema.optional(),
  investigationId: uuidSchema,
  message: z.string().min(1).max(4000)
});

// ====================================================================
// REPORT SCHEMAS
// ====================================================================
export const generateReportSchema = z.object({
  title: z.string().min(3).max(300).optional(),
  format: z.enum(['markdown', 'pdf', 'docx', 'json']).default('markdown'),
  includeMethodology: z.boolean().default(true),
  includeGaps: z.boolean().default(true),
  includeComparisons: z.boolean().default(true)
});

// ====================================================================
// 10 AI TASK OUTPUT SCHEMAS (Strict Zod validation)
// ====================================================================

// 1. Research Question Analysis
export const aiQuestionAnalysisSchema = z.object({
  originalQuestion: z.string(),
  refinedQuestion: z.string(),
  primaryDomain: z.string(),
  secondaryDomains: z.array(z.string()).default([]),
  objectives: z.array(z.string()).default([]),
  keywords: z.array(z.string()).default([]),
  relatedConcepts: z.array(z.string()).default([]),
  suggestedSearchQueries: z.array(z.string()).default([]),
  scopeConcerns: z.array(z.string()).default([]),
  clarificationNeeded: z.boolean().default(false),
  clarificationQuestions: z.array(z.string()).default([])
});

// 2. Search Query Generation
export const aiSearchQueriesSchema = z.object({
  queries: z.array(z.object({
    query: z.string(),
    purpose: z.string(),
    domain: z.string(),
    priority: z.enum(['high', 'medium', 'low']).default('high')
  }))
});

// 3. Source Metadata Normalization
export const aiSourceNormalizationSchema = z.object({
  provider: z.string(),
  providerSourceId: z.string(),
  title: z.string(),
  abstract: z.string().nullable(),
  authors: z.array(z.string()).default([]),
  publicationYear: z.number().nullable(),
  publicationDate: z.string().nullable(),
  doi: z.string().nullable(),
  url: z.string().nullable(),
  venue: z.string().nullable(),
  publicationType: z.string().nullable(),
  citationCount: z.number().nullable(),
  metadataCompleteness: z.enum(['full', 'partial', 'minimal']).default('partial')
});

// 4. Evidence Extraction
export const aiEvidenceExtractionSchema = z.object({
  claims: z.array(z.object({
    claim: z.string(),
    finding: z.string(),
    supportingExcerpt: z.string().nullable(),
    pageNumber: z.number().nullable(),
    sectionName: z.string().nullable(),
    methodology: z.string().nullable(),
    population: z.string().nullable(),
    sampleSize: z.string().nullable(),
    datasetDescription: z.string().nullable(),
    evidenceCategory: z.enum([
      'supporting',
      'contradictory',
      'neutral',
      'methodological',
      'limitation',
      'recommendation',
      'trend',
      'uncertain'
    ]).default('supporting'),
    evidenceType: z.enum([
      'empirical',
      'theoretical',
      'observational',
      'computational',
      'review',
      'meta-analysis'
    ]).default('empirical'),
    limitations: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1).default(0.85),
    sourceId: z.string()
  }))
});

// 5. Evidence Comparison
export const aiEvidenceComparisonSchema = z.object({
  comparisons: z.array(z.object({
    comparisonType: z.enum([
      'agreement',
      'contradiction',
      'complementary',
      'methodological_difference',
      'scope_difference',
      'inconclusive'
    ]),
    summary: z.string(),
    claimIds: z.array(z.string()),
    supportingSourceIds: z.array(z.string()),
    methodologicalDifferences: z.array(z.string()).default([]),
    explanation: z.string(),
    confidence: z.number().min(0).max(1).default(0.85)
  }))
});

// 6. Research Gap Identification
export const aiResearchGapSchema = z.object({
  gaps: z.array(z.object({
    title: z.string(),
    description: z.string(),
    relatedThemes: z.array(z.string()).default([]),
    supportingSourceIds: z.array(z.string()).default([]),
    supportingClaimIds: z.array(z.string()).default([]),
    rationale: z.string(),
    suggestedResearchQuestion: z.string(),
    confidence: z.number().min(0).max(1).default(0.80),
    limitations: z.array(z.string()).default([])
  }))
});

// 7. Research Theme Detection
export const aiResearchThemeSchema = z.object({
  themes: z.array(z.object({
    name: z.string(),
    description: z.string(),
    keywords: z.array(z.string()).default([]),
    sourceIds: z.array(z.string()).default([]),
    claimIds: z.array(z.string()).default([])
  }))
});

// 8. Knowledge Graph Generation
export const aiKnowledgeGraphSchema = z.object({
  entities: z.array(z.object({
    entityType: z.enum([
      'research_question',
      'publication',
      'author',
      'research_theme',
      'claim',
      'method',
      'dataset',
      'research_gap',
      'concept'
    ]),
    name: z.string(),
    description: z.string(),
    metadata: z.record(z.any()).default({})
  })),
  relationships: z.array(z.object({
    sourceEntityId: z.string(),
    targetEntityId: z.string(),
    relationshipType: z.enum([
      'supports',
      'contradicts',
      'extends',
      'evaluates',
      'utilizes',
      'authored_by',
      'identifies_gap',
      'belongs_to',
      'relates_to'
    ]),
    explanation: z.string(),
    supportingSourceIds: z.array(z.string()).default([]),
    confidence: z.number().min(0).max(1).default(0.85)
  }))
});

// 9. Research Copilot Answer
export const aiCopilotAnswerSchema = z.object({
  answer: z.string(),
  keyPoints: z.array(z.string()).default([]),
  evidenceClaims: z.array(z.object({
    claimId: z.string(),
    sourceIds: z.array(z.string()),
    explanation: z.string()
  })).default([]),
  limitations: z.array(z.string()).default([]),
  uncertainties: z.array(z.string()).default([]),
  followUpQuestions: z.array(z.string()).default([]),
  evidenceSufficient: z.boolean().default(true)
});

// 10. Research Report Generation
export const aiReportGenerationSchema = z.object({
  title: z.string(),
  executiveSummary: z.string(),
  researchQuestion: z.string(),
  objectives: z.array(z.string()).default([]),
  methodology: z.string(),
  sourcesReviewed: z.array(z.string()).default([]),
  keyFindings: z.array(z.string()).default([]),
  evidenceComparisons: z.array(z.string()).default([]),
  contradictions: z.array(z.string()).default([]),
  researchThemes: z.array(z.string()).default([]),
  potentialResearchGaps: z.array(z.string()).default([]),
  limitations: z.array(z.string()).default([]),
  futureResearchDirections: z.array(z.string()).default([]),
  references: z.array(z.object({
    sourceId: z.string(),
    citationText: z.string()
  })).default([])
});

