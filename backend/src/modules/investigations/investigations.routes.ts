import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { createInvestigationSchema, updateInvestigationSchema } from '../../schemas/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { providerFactory } from '../../providers/provider.factory.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();

// In-memory store fallback
let memInvestigations: any[] = [
  {
    id: '22222222-2222-2222-2222-222222222222',
    project_id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    research_question: 'How does artificial intelligence affect early detection of cardiovascular diseases?',
    refined_question: 'A systematic investigation into deep learning architectures for early cardiovascular risk prediction',
    research_objectives: ['Evaluate diagnostic sensitivity', 'Analyze dataset limitations', 'Identify methodological gaps'],
    search_queries: ['AI cardiovascular disease detection', 'deep learning ECG cardiovascular risk'],
    research_scope: 'Exploratory',
    filters: { maxSources: 25, includeWebResearch: true },
    status: 'completed',
    progress: 100,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations
router.post('/', authenticateToken, validate(createInvestigationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const body = req.body;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_investigations')
        .insert({
          project_id: body.projectId,
          user_id: userId,
          research_question: body.researchQuestion,
          refined_question: body.refinedQuestion,
          research_objectives: body.researchObjectives || [],
          search_queries: body.searchQueries || [],
          research_scope: body.researchScope || 'Exploratory',
          filters: body.filters || {},
          status: 'draft',
          progress: 0
        })
        .select()
        .single();

      if (error) throw error;
      sendSuccess(res, data, 'Investigation created successfully', 201);
    } else {
      const newInv = {
        id: crypto.randomUUID(),
        project_id: body.projectId,
        user_id: userId,
        research_question: body.researchQuestion,
        refined_question: body.refinedQuestion,
        research_objectives: body.researchObjectives || [],
        search_queries: body.searchQueries || [],
        research_scope: body.researchScope || 'Exploratory',
        filters: body.filters || {},
        status: 'draft',
        progress: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memInvestigations.unshift(newInv);
      sendSuccess(res, newInv, 'Investigation created successfully', 201);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { projectId } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from('research_investigations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectId) {
        query = query.eq('project_id', projectId);
      }

      const { data, error } = await query;
      if (error) throw error;
      sendSuccess(res, data || [], 'Investigations retrieved');
    } else {
      let filtered = memInvestigations.filter(i => i.user_id === userId);
      if (projectId) {
        filtered = filtered.filter(i => i.project_id === projectId);
      }
      sendSuccess(res, filtered, 'Investigations retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId
router.get('/:investigationId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { investigationId } = req.params;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_investigations')
        .select('*')
        .eq('id', investigationId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Investigation');
      sendSuccess(res, data, 'Investigation retrieved');
    } else {
      const inv = memInvestigations.find(i => i.id === investigationId && i.user_id === userId);
      if (!inv) throw new NotFoundError('Investigation');
      sendSuccess(res, inv, 'Investigation retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/investigations/:investigationId/start
router.post('/:investigationId/start', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { investigationId } = req.params;

    // Get investigation
    let investigation: any = null;
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from('research_investigations')
        .select('*')
        .eq('id', investigationId)
        .eq('user_id', userId)
        .single();
      investigation = data;
    } else {
      investigation = memInvestigations.find(i => i.id === investigationId && i.user_id === userId);
    }

    if (!investigation) throw new NotFoundError('Investigation');

    // Run discovery directly or enqueue
    const queries = investigation.search_queries?.length > 0
      ? investigation.search_queries
      : [investigation.research_question];

    // Trigger source discovery
    const sources = await providerFactory.searchAll(queries, ['crossref', 'openalex', 'tavily'], 20);

    // Save discovered sources
    if (isSupabaseConfigured()) {
      if (sources.length > 0) {
        const inserts = sources.map(s => ({
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

      await supabaseAdmin
        .from('research_investigations')
        .update({
          status: 'completed',
          progress: 100,
          started_at: new Date().toISOString(),
          completed_at: new Date().toISOString()
        })
        .eq('id', investigationId);
    } else {
      investigation.status = 'completed';
      investigation.progress = 100;
    }

    sendSuccess(res, {
      status: 'completed',
      sourcesDiscovered: sources.length,
      message: 'Investigation discovery completed successfully'
    }, 'Investigation execution started');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/status
router.get('/:investigationId/status', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_investigations')
        .select('id, status, progress, error_message')
        .eq('id', investigationId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Investigation');
      sendSuccess(res, data, 'Status retrieved');
    } else {
      const inv = memInvestigations.find(i => i.id === investigationId && i.user_id === userId);
      if (!inv) throw new NotFoundError('Investigation');
      sendSuccess(res, { id: inv.id, status: inv.status, progress: inv.progress }, 'Status retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/investigations/:investigationId/cancel
router.post('/:investigationId/cancel', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      await supabaseAdmin
        .from('research_investigations')
        .update({ status: 'cancelled' })
        .eq('id', investigationId)
        .eq('user_id', userId);
    } else {
      const inv = memInvestigations.find(i => i.id === investigationId && i.user_id === userId);
      if (inv) inv.status = 'cancelled';
    }

    sendSuccess(res, { status: 'cancelled' }, 'Investigation cancelled');
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/investigations/:investigationId
router.delete('/:investigationId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      await supabaseAdmin
        .from('research_investigations')
        .delete()
        .eq('id', investigationId)
        .eq('user_id', userId);
    } else {
      memInvestigations = memInvestigations.filter(i => !(i.id === investigationId && i.user_id === userId));
    }

    sendSuccess(res, { id: investigationId }, 'Investigation deleted');
  } catch (err) {
    next(err);
  }
});

export const investigationRoutes = router;

