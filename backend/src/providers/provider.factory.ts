import { ResearchProvider, NormalizedSearchResult } from './provider.interface.js';
import { CrossrefProvider } from './crossref/crossref.provider.js';
import { OpenAlexProvider } from './openalex/openalex.provider.js';
import { SemanticScholarProvider } from './semantic-scholar/semantic-scholar.provider.js';
import { TavilyProvider } from './tavily/tavily.provider.js';
import { logger } from '../utils/logger.js';

export class ProviderFactory {
  private providers: Map<string, ResearchProvider> = new Map();

  constructor() {
    this.register(new CrossrefProvider());
    this.register(new OpenAlexProvider());
    this.register(new SemanticScholarProvider());
    this.register(new TavilyProvider());
  }

  public register(provider: ResearchProvider): void {
    this.providers.set(provider.name, provider);
  }

  public get(name: string): ResearchProvider | undefined {
    return this.providers.get(name);
  }

  public getAll(): ResearchProvider[] {
    return Array.from(this.providers.values());
  }

  public async searchAll(
    queries: string[],
    providerNames: string[] = ['crossref', 'openalex', 'tavily'],
    maxResults = 30
  ): Promise<NormalizedSearchResult[]> {
    const activeProviders = providerNames
      .map(name => this.providers.get(name))
      .filter((p): p is ResearchProvider => p !== undefined && p.isAvailable());

    const searchPromises: Promise<NormalizedSearchResult[]>[] = [];

    for (const query of queries) {
      for (const provider of activeProviders) {
        searchPromises.push(
          provider.search(query, { limit: Math.ceil(maxResults / (queries.length * activeProviders.length || 1)) })
            .catch(err => {
              logger.warn({ provider: provider.name, error: err.message }, 'Provider search failed');
              return [];
            })
        );
      }
    }

    const allResultsNested = await Promise.all(searchPromises);
    const combined = allResultsNested.flat();

    // Deduplicate by normalized DOI or normalized title
    return this.deduplicate(combined).slice(0, maxResults);
  }

  public deduplicate(sources: NormalizedSearchResult[]): NormalizedSearchResult[] {
    const seenDois = new Set<string>();
    const seenTitles = new Set<string>();
    const unique: NormalizedSearchResult[] = [];

    for (const source of sources) {
      if (source.doi) {
        const normDoi = source.doi.toLowerCase().trim();
        if (seenDois.has(normDoi)) continue;
        seenDois.add(normDoi);
      }

      const normTitle = source.title.toLowerCase().replace(/[^a-z0-9]/g, '');
      if (normTitle.length > 5) {
        if (seenTitles.has(normTitle)) continue;
        seenTitles.add(normTitle);
      }

      unique.push(source);
    }

    return unique;
  }
}

export const providerFactory = new ProviderFactory();

