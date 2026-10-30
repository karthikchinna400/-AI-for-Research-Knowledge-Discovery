import { ResearchProvider, NormalizedSearchResult } from '../provider.interface.js';
import { providersConfig } from '../../config/providers.js';
import { logger } from '../../utils/logger.js';

export class SemanticScholarProvider implements ResearchProvider {
  public readonly name = 'semantic-scholar';

  public isAvailable(): boolean {
    return true;
  }

  public async search(
    query: string,
    options?: { limit?: number; yearStart?: number; yearEnd?: number }
  ): Promise<NormalizedSearchResult[]> {
    const limit = Math.min(options?.limit || 15, 30);
    const url = new URL(`${providersConfig.semanticScholar.baseUrl}/paper/search`);
    url.searchParams.set('query', query);
    url.searchParams.set('limit', limit.toString());
    url.searchParams.set('fields', 'title,authors,year,abstract,citationCount,venue,publicationTypes,externalIds,url');

    const headers: Record<string, string> = {};
    if (providersConfig.semanticScholar.apiKey) {
      headers['x-api-key'] = providersConfig.semanticScholar.apiKey;
    }

    try {
      const response = await fetch(url.toString(), {
        headers,
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Semantic Scholar API returned non-OK status');
        return [];
      }

      const data = (await response.json()) as any;
      const papers = data.data || [];

      return papers.map((paper: any): NormalizedSearchResult => {
        const authors = Array.isArray(paper.authors)
          ? paper.authors.map((a: any) => a.name).filter(Boolean)
          : [];

        const doi = paper.externalIds?.DOI || null;
        const isPreprint = paper.publicationTypes?.includes('Preprint') || paper.externalIds?.ArXiv != null;

        return {
          provider: 'semantic-scholar',
          providerSourceId: paper.paperId || `s2-${Math.random().toString(36).substring(7)}`,
          title: paper.title || 'Untitled Research',
          abstract: paper.abstract || null,
          authors,
          publicationYear: paper.year || null,
          publicationDate: paper.year ? paper.year.toString() : null,
          doi,
          url: paper.url || (doi ? `https://doi.org/${doi}` : null),
          venue: paper.venue || null,
          publicationType: isPreprint ? 'preprint' : (paper.publicationTypes?.[0] || 'journal-article'),
          citationCount: paper.citationCount || 0,
          peerReviewStatus: isPreprint ? 'preprint' : 'unknown',
          metadata: {
            corpusId: paper.externalIds?.CorpusId
          }
        };
      });
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to query Semantic Scholar API');
      return [];
    }
  }
}
