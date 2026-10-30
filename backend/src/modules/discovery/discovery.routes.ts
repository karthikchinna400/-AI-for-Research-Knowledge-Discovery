import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { providerFactory } from '../../providers/provider.factory.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// Default initial sample sources when starting fresh in offline/mock mode
let memSources: any[] = [
  {
    id: '33333333-3333-3333-3333-333333333331',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    provider: 'crossref',
    provider_source_id: '10.1016/j.jacc.2023.01.012',
    title: 'Deep learning for automated detection of left ventricular dysfunction from electrocardiograms',
    abstract: 'Artificial intelligence-enabled electrocardiography algorithms achieve high area under the curve in multi-center retrospective validation cohorts, highlighting translational opportunities in asymptomatic cardiovascular screening.',
    authors: ['Attia, Z. I.', 'Kapa, S.', 'Lopez-Jimenez, F.', 'Friedman, P. A.'],
    publication_year: 2023,
    publication_date: '2023-04-15',
    doi: '10.1016/j.jacc.2023.01.012',
    url: 'https://doi.org/10.1016/j.jacc.2023.01.012',
    venue: 'Journal of the American College of Cardiology',
    publication_type: 'journal-article',
    citation_count: 142,
    peer_review_status: 'verified',
    retraction_status: 'unretracted',
    metadata: { publisher: 'Elsevier' },
    source_quality: { score: 95, verifiedMetadata: true, hasDoi: true, hasAbstract: true, peerReviewed: 'verified' },
    created_at: new Date().toISOString()
  },
  {
    id: '33333333-3333-3333-3333-333333333332',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    provider: 'openalex',
    provider_source_id: 'https://openalex.org/W3128919283',
    title: 'Evaluating distributional drift and cross-population generalization of cardiovascular prediction models',
    abstract: 'We systematically evaluate machine learning cardiovascular risk algorithms across five international health systems, demonstrating notable performance degradation in underrepresented demographic groups.',
    authors: ['Chen, J.', 'Rahman, M.', 'Patel, S.'],
    publication_year: 2024,
    publication_date: '2024-02-10',
    doi: '10.1038/s41746-024-01021-x',
    url: 'https://doi.org/10.1038/s41746-024-01021-x',
    venue: 'npj Digital Medicine',
    publication_type: 'journal-article',
    citation_count: 38,
    peer_review_status: 'verified',
    retraction_status: 'unretracted',
    metadata: { openAccess: true },
    source_quality: { score: 90, verifiedMetadata: true, hasDoi: true, hasAbstract: true, peerReviewed: 'verified' },
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations/:investigationId/discover
router.post('/:investigationId/discover', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;
    const { providers = ['crossref', 'openalex'], queries = [], maxSources = 25 } = req.body;

    // Run real academic provider discovery
    const results = await providerFactory.searchAll(queries.length > 0 ? queries : ['AI cardiology machine learning'], providers, maxSources);

    if (isSupabaseConfigured()) {
      if (results.length > 0) {
        const inserts = results.map(s => ({
          investigation_id: investigationId,
          user_id: userId,
          provider: s.provider,
          provider_source_id: s.providerSourceId,
          title: s.title,
          abstract: s.abstract,
          authors: s.authors,
          publication_year: s.publicationYear,
          publication_date: s.publicationDate,
          doi: s.doi,
          url: s.url,
          venue: s.venue,
          publication_type: s.publicationType,
          citation_count: s.citationCount,
          peer_review_status: s.peerReviewStatus,
          metadata: s.metadata,
          source_quality: {
            score: (s.abstract ? 40 : 10) + (s.doi ? 30 : 0) + (s.peerReviewStatus === 'verified' ? 30 : 10),
            verifiedMetadata: Boolean(s.doi),
            hasDoi: Boolean(s.doi),
            hasAbstract: Boolean(s.abstract),
            peerReviewed: s.peerReviewStatus
          }
        }));

        await supabaseAdmin.from('research_sources').upsert(inserts, {
          onConflict: 'investigation_id,provider,provider_source_id',
          ignoreDuplicates: true
        });
      }
    } else {
      for (const s of results) {
        memSources.unshift({
          id: crypto.randomUUID(),
          investigation_id: investigationId,
          user_id: userId,
          ...s,
          source_quality: {
            score: (s.abstract ? 40 : 10) + (s.doi ? 30 : 0) + (s.peerReviewStatus === 'verified' ? 30 : 10),
            verifiedMetadata: Boolean(s.doi),
            hasDoi: Boolean(s.doi),
            hasAbstract: Boolean(s.abstract),
            peerReviewed: s.peerReviewStatus
          },
          created_at: new Date().toISOString()
        });
      }
    }

    sendSuccess(res, { discovered: results.length }, 'Source discovery complete');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/sources
router.get('/:investigationId/sources', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_sources')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .order('publication_year', { ascending: false, nullsFirst: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Sources retrieved');
    } else {
      const sources = memSources.filter(s => s.investigation_id === investigationId);
      sendSuccess(res, sources, 'Sources retrieved');
    }
  } catch (err) {
    next(err);
  }
});

export const discoveryRoutes = router;
export { memSources };

