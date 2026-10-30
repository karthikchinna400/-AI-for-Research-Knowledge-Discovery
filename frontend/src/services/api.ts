import { apiClient } from '../lib/axios.js';
import {
  ResearchProject,
  ResearchInvestigation,
  ResearchSource,
  EvidenceClaim,
  EvidenceComparison,
  ResearchGap,
  ResearchTheme,
  KnowledgeEntity,
  KnowledgeRelationship,
  ResearchDocument,
  CopilotMessage,
  ResearchReport,
  ApiResponse
} from '../types/index.js';

export const api = {
  // Auth & Profile
  auth: {
    getMe: () => apiClient.get<any, ApiResponse>('/auth/me'),
    getProfile: () => apiClient.get<any, ApiResponse>('/profile'),
    updateProfile: (data: any) => apiClient.patch<any, ApiResponse>('/profile', data)
  },

  // Research Projects
  projects: {
    list: () => apiClient.get<any, ApiResponse<ResearchProject[]>>('/projects'),
    get: (id: string) => apiClient.get<any, ApiResponse<ResearchProject>>(`/projects/${id}`),
    create: (data: { title: string; description?: string; domain: string }) =>
      apiClient.post<any, ApiResponse<ResearchProject>>('/projects', data),
    update: (id: string, data: Partial<ResearchProject>) =>
      apiClient.patch<any, ApiResponse<ResearchProject>>(`/projects/${id}`, data),
    delete: (id: string) => apiClient.delete<any, ApiResponse>(`/projects/${id}`)
  },

  // Research Planning AI
  research: {
    analyzeQuestion: (data: { question: string; domain: string; scope: string }) =>
      apiClient.post<any, ApiResponse<any>>('/research/analyze-question', data),
    generateSearchQueries: (data: { refinedQuestion: string; keywords: string[]; domain: string }) =>
      apiClient.post<any, ApiResponse<any>>('/research/generate-search-queries', data),
    validatePlan: (data: any) => apiClient.post<any, ApiResponse<any>>('/research/validate-plan', data)
  },

  // Investigations
  investigations: {
    list: (projectId?: string) =>
      apiClient.get<any, ApiResponse<ResearchInvestigation[]>>('/investigations', {
        params: { projectId }
      }),
    get: (id: string) =>
      apiClient.get<any, ApiResponse<ResearchInvestigation>>(`/investigations/${id}`),
    create: (data: any) =>
      apiClient.post<any, ApiResponse<ResearchInvestigation>>('/investigations', data),
    start: (id: string) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${id}/start`),
    getStatus: (id: string) =>
      apiClient.get<any, ApiResponse<any>>(`/investigations/${id}/status`),
    cancel: (id: string) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${id}/cancel`),
    delete: (id: string) =>
      apiClient.delete<any, ApiResponse>(`/investigations/${id}`)
  },

  // Academic Source Discovery
  discovery: {
    discover: (investigationId: string, options?: { providers?: string[]; queries?: string[]; maxSources?: number }) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${investigationId}/discover`, options || {}),
    getSources: (investigationId: string) =>
      apiClient.get<any, ApiResponse<ResearchSource[]>>(`/investigations/${investigationId}/sources`)
  },

  sources: {
    get: (id: string) => apiClient.get<any, ApiResponse<ResearchSource>>(`/sources/${id}`),
    delete: (id: string) => apiClient.delete<any, ApiResponse>(`/sources/${id}`)
  },

  // Evidence Extraction
  evidence: {
    extract: (investigationId: string) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${investigationId}/extract-evidence`),
    list: (investigationId: string) =>
      apiClient.get<any, ApiResponse<EvidenceClaim[]>>(`/investigations/${investigationId}/evidence`),
    get: (claimId: string) =>
      apiClient.get<any, ApiResponse<EvidenceClaim>>(`/evidence/${claimId}`),
    delete: (claimId: string) =>
      apiClient.delete<any, ApiResponse>(`/evidence/${claimId}`)
  },

  // Evidence Comparison
  comparison: {
    compare: (investigationId: string) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${investigationId}/compare`),
    list: (investigationId: string) =>
      apiClient.get<any, ApiResponse<EvidenceComparison[]>>(`/investigations/${investigationId}/comparisons`)
  },

  // Research Gaps
  gaps: {
    analyze: (investigationId: string) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${investigationId}/analyze-gaps`),
    list: (investigationId: string) =>
      apiClient.get<any, ApiResponse<ResearchGap[]>>(`/investigations/${investigationId}/gaps`)
  },

  // Research Themes
  themes: {
    analyze: (investigationId: string) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${investigationId}/analyze-themes`),
    list: (investigationId: string) =>
      apiClient.get<any, ApiResponse<ResearchTheme[]>>(`/investigations/${investigationId}/themes`)
  },

  // Knowledge Graph
  knowledgeGraph: {
    generate: (investigationId: string) =>
      apiClient.post<any, ApiResponse<any>>(`/investigations/${investigationId}/generate-map`),
    get: (investigationId: string) =>
      apiClient.get<any, ApiResponse<{ entities: KnowledgeEntity[]; relationships: KnowledgeRelationship[] }>>(
        `/investigations/${investigationId}/map`
      )
  },

  // Documents
  documents: {
    list: (projectId?: string) =>
      apiClient.get<any, ApiResponse<ResearchDocument[]>>('/documents', { params: { projectId } }),
    get: (id: string) =>
      apiClient.get<any, ApiResponse<ResearchDocument>>(`/documents/${id}`),
    upload: (formData: FormData) =>
      apiClient.post<any, ApiResponse<ResearchDocument>>('/documents/upload', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      }),
    delete: (id: string) =>
      apiClient.delete<any, ApiResponse>(`/documents/${id}`)
  },

  // AI Copilot
  copilot: {
    listConversations: (investigationId: string) =>
      apiClient.get<any, ApiResponse<any[]>>('/copilot/conversations', { params: { investigationId } }),
    getMessages: (conversationId: string) =>
      apiClient.get<any, ApiResponse<CopilotMessage[]>>(`/copilot/conversations/${conversationId}/messages`),
    ask: (data: { investigationId: string; conversationId?: string; message: string }) =>
      apiClient.post<any, ApiResponse<any>>('/copilot/ask', data)
  },

  // Reports
  reports: {
    list: (investigationId: string) =>
      apiClient.get<any, ApiResponse<ResearchReport[]>>(`/investigations/${investigationId}/reports`),
    get: (id: string) =>
      apiClient.get<any, ApiResponse<ResearchReport>>(`/reports/${id}`),
    generate: (investigationId: string, data?: { title?: string; format?: string }) =>
      apiClient.post<any, ApiResponse<ResearchReport>>(`/investigations/${investigationId}/reports`, data || {}),
    downloadUrl: (id: string, format = 'markdown') =>
      `${import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api/v1'}/reports/${id}/download?format=${format}`
  },

  // Global Search, Activity, History
  search: {
    global: (query: string) => apiClient.get<any, ApiResponse<any>>('/search', { params: { q: query } }),
    getActivity: () => apiClient.get<any, ApiResponse<any[]>>('/activity'),
    getHistory: () => apiClient.get<any, ApiResponse<any[]>>('/history')
  }
};

