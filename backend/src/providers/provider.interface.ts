export interface NormalizedSearchResult {
  provider: 'crossref' | 'openalex' | 'semantic-scholar' | 'tavily';
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
  citationCount: number;
  peerReviewStatus: 'verified' | 'unknown' | 'not_peer_reviewed' | 'preprint';
  metadata: Record<string, any>;
}

export interface ResearchProvider {
  readonly name: string;
  search(query: string, options?: { limit?: number; yearStart?: number; yearEnd?: number }): Promise<NormalizedSearchResult[]>;
  isAvailable(): boolean;
}

