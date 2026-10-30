import { ResearchProvider, NormalizedSearchResult } from '../provider.interface.js';
import { providersConfig } from '../../config/providers.js';
import { logger } from '../../utils/logger.js';

export class CrossrefProvider implements ResearchProvider {
  public readonly name = 'crossref';

  public isAvailable(): boolean {
    return true; // Crossref is a free public REST API
  }

  public async search(
    query: string,
    options?: { limit?: number; yearStart?: number; yearEnd?: number }
  ): Promise<NormalizedSearchResult[]> {
    const limit = Math.min(options?.limit || 15, 30);
    const url = new URL(`${providersConfig.crossref.baseUrl}/works`);
    url.searchParams.set('query', query);
    url.searchParams.set('rows', limit.toString());
    url.searchParams.set('select', 'DOI,title,author,published,publisher,container-title,abstract,type,is-referenced-by-count');

    try {
      const response = await fetch(url.toString(), {
        headers: {
          'User-Agent': providersConfig.crossref.userAgent
        },
        signal: AbortSignal.timeout(12000)
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Crossref API returned error status');
        return [];
      }

      const data = (await response.json()) as any;
      const items = data.message?.items || [];

      return items.map((item: any): NormalizedSearchResult => {
        const title = Array.isArray(item.title) ? item.title[0] : item.title || 'Untitled Publication';
        const authors = Array.isArray(item.author)
          ? item.author.map((a: any) => `${a.given || ''} ${a.family || ''}`.trim()).filter(Boolean)
          : [];
        
        let pubYear: number | null = null;
        if (item.published?.['date-parts']?.[0]?.[0]) {
          pubYear = item.published['date-parts'][0][0];
        }

        const venue = Array.isArray(item['container-title']) ? item['container-title'][0] : item['container-title'] || null;

        return {
          provider: 'crossref',
          providerSourceId: item.DOI || `crossref-${Math.random().toString(36).substring(7)}`,
          title,
          abstract: item.abstract ? item.abstract.replace(/<[^>]*>/g, '') : null,
          authors,
          publicationYear: pubYear,
          publicationDate: pubYear ? pubYear.toString() : null,
          doi: item.DOI || null,
          url: item.DOI ? `https://doi.org/${item.DOI}` : null,
          venue,
          publicationType: item.type || 'journal-article',
          citationCount: item['is-referenced-by-count'] || 0,
          peerReviewStatus: item.type === 'journal-article' ? 'verified' : 'unknown',
          metadata: {
            publisher: item.publisher
          }
        };
      });
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to query Crossref API');
      return [];
    }
  }
}
