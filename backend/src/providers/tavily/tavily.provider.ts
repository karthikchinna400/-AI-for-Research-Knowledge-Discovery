import { ResearchProvider, NormalizedSearchResult } from '../provider.interface.js';
import { providersConfig } from '../../config/providers.js';
import { logger } from '../../utils/logger.js';

export class TavilyProvider implements ResearchProvider {
  public readonly name = 'tavily';

  public isAvailable(): boolean {
    return Boolean(providersConfig.tavily.apiKey);
  }

  public async search(
    query: string,
    options?: { limit?: number; yearStart?: number; yearEnd?: number }
  ): Promise<NormalizedSearchResult[]> {
    if (!this.isAvailable()) {
      logger.info('Tavily API key not configured, skipping web search discovery.');
      return [];
    }

    const limit = Math.min(options?.limit || 10, 20);

    try {
      const response = await fetch(`${providersConfig.tavily.baseUrl}/search`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          api_key: providersConfig.tavily.apiKey,
          query: `${query} academic research study paper findings`,
          search_depth: 'advanced',
          include_answer: false,
          max_results: limit
        }),
        signal: AbortSignal.timeout(15000)
      });

      if (!response.ok) {
        logger.warn({ status: response.status }, 'Tavily API returned error status');
        return [];
      }

      const data = (await response.json()) as any;
      const results = data.results || [];

      return results.map((item: any): NormalizedSearchResult => {
        let domain = 'Web Publication';
        try {
          domain = new URL(item.url).hostname;
        } catch {}

        return {
          provider: 'tavily',
          providerSourceId: item.url || `tavily-${Math.random().toString(36).substring(7)}`,
          title: item.title || 'Web Research Source',
          abstract: item.content || null,
          authors: [domain],
          publicationYear: new Date().getFullYear(),
          publicationDate: new Date().toISOString().split('T')[0],
          doi: null,
          url: item.url || null,
          venue: domain,
          publicationType: 'web-publication',
          citationCount: 0,
          peerReviewStatus: 'unknown',
          metadata: {
            score: item.score
          }
        };
      });
    } catch (err: any) {
      logger.error({ err: err.message }, 'Failed to query Tavily API');
      return [];
    }
  }
}
