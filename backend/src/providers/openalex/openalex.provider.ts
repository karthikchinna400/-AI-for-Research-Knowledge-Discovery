import { ResearchProvider, NormalizedSearchResult } from '../provider.interface.js';
import { providersConfig } from '../../config/providers.js';
import { logger } from '../../utils/logger.js';

export class OpenAlexProvider implements ResearchProvider {
  public readonly name = 'openalex';

  public isAvailable(): boolean {
    return true; // OpenAlex provides open access API
  }

  public async search(
    query: string,
    options?: { limit?: number; yearStart?: number; yearEnd?: number }
  ): Promise<NormalizedSearchResult[]> {
    const limit = Math.min(options?.limit || 15, 30);
    const url = new URL(`${providersConfig.openalex.baseUrl}/works`);
    url.searchParams.set('search', query);
    url.searchParams.set('per-page', limit.toString());
    if (providersConfig.openalex.email) {
      url.searchParams.set('mailto', providersConfig.openalex.email);
    }

    try {
      const response = await fetch(url.toString(), {
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'OpenAlex API returned error status');
        return [];
      }

      const data = (await response.json()) as any;
      const results = data.results || [];

      return results.map((item: any): NormalizedSearchResult => {
        const authors = Array.isArray(item.authorships)
          ? item.authorships.map((auth: any) => auth.author?.display_name).filter(Boolean)
          : [];

        // OpenAlex inverted abstract reconstruction
        let abstract: string | null = null;
        if (item.abstract_inverted_index) {
          try {
            const wordPositions: [string, number][] = [];
            for (const [word, positions] of Object.entries(item.abstract_inverted_index)) {
              for (const pos of (positions as number[])) {
                wordPositions.push([word, pos]);
              }
            }
            wordPositions.sort((a, b) => a[1] - b[1]);
            abstract = wordPositions.map(pair => pair[0]).join(' ');
          } catch {
            abstract = null;
          }
        }

        const doi = item.doi ? item.doi.replace('https://doi.org/', '') : null;
        const venue = item.primary_location?.source?.display_name || null;
        const isPeerReviewed = item.type === 'article' || item.type === 'book-chapter';

        return {
          provider: 'openalex',
          providerSourceId: item.id || `openalex-${Math.random().toString(36).substring(7)}`,
          title: item.title || item.display_name || 'Untitled Work',
          abstract,
          authors,
          publicationYear: item.publication_year || null,
          publicationDate: item.publication_date || null,
          doi,
          url: item.doi || item.primary_location?.landing_page_url || null,
          venue,
          publicationType: item.type || 'journal-article',
          citationCount: item.cited_by_count || 0,
          peerReviewStatus: isPeerReviewed ? 'verified' : 'unknown',
          metadata: {
            openAccess: item.open_access?.is_oa,
            concepts: (item.concepts || []).slice(0, 5).map((c: any) => c.display_name)
          }
        };
      });
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to query OpenAlex API');
      return [];
    }
  }
}
