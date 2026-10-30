import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// GET /api/v1/search
router.get('/search', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const query = String(req.query.q || '').trim();

    if (!query) {
      return sendSuccess(res, { projects: [], investigations: [], sources: [], claims: [] }, 'Empty search query');
    }

    if (isSupabaseConfigured()) {
      const [pRes, iRes, sRes, cRes] = await Promise.all([
        supabaseAdmin.from('research_projects').select('id, title, domain').eq('user_id', userId).ilike('title', `%${query}%`).limit(5),
        supabaseAdmin.from('research_investigations').select('id, research_question, status').eq('user_id', userId).ilike('research_question', `%${query}%`).limit(5),
        supabaseAdmin.from('research_sources').select('id, title, authors, venue').eq('user_id', userId).ilike('title', `%${query}%`).limit(5),
        supabaseAdmin.from('evidence_claims').select('id, claim_text, evidence_category').eq('user_id', userId).ilike('claim_text', `%${query}%`).limit(5)
      ]);

      sendSuccess(res, {
        projects: pRes.data || [],
        investigations: iRes.data || [],
        sources: sRes.data || [],
        claims: cRes.data || []
      }, 'Global search results retrieved');
    } else {
      sendSuccess(res, {
        projects: [
          { id: '11111111-1111-1111-1111-111111111111', title: 'AI in Cardiovascular Disease Early Detection', domain: 'Healthcare and Medicine' }
        ],
        investigations: [
          { id: '22222222-2222-2222-2222-222222222222', research_question: 'How does artificial intelligence affect early detection of cardiovascular diseases?', status: 'completed' }
        ],
        sources: [
          { id: '33333333-3333-3333-3333-333333333331', title: 'Deep learning for automated detection of left ventricular dysfunction from electrocardiograms' }
        ],
        claims: []
      }, 'Global search results retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/activity
router.get('/activity', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_activity')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(20);

      if (error) throw error;
      sendSuccess(res, data || [], 'Recent activity retrieved');
    } else {
      sendSuccess(res, [
        {
          id: 'act-1',
          activity_type: 'source_discovery',
          description: 'Discovered 18 academic research sources via Crossref and OpenAlex',
          created_at: new Date(Date.now() - 3600000).toISOString()
        },
        {
          id: 'act-2',
          activity_type: 'evidence_extraction',
          description: 'Extracted 12 structured empirical findings and confidence scores',
          created_at: new Date(Date.now() - 7200000).toISOString()
        },
        {
          id: 'act-3',
          activity_type: 'report_generation',
          description: 'Generated comprehensive evidence review report in Markdown format',
          created_at: new Date(Date.now() - 86400000).toISOString()
        }
      ], 'Recent activity retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/history
router.get('/history', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from('research_investigations')
        .select('id, research_question, status, progress, created_at, updated_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });
      sendSuccess(res, data || [], 'Investigation history retrieved');
    } else {
      sendSuccess(res, [
        {
          id: '22222222-2222-2222-2222-222222222222',
          research_question: 'How does artificial intelligence affect early detection of cardiovascular diseases?',
          status: 'completed',
          progress: 100,
          created_at: new Date().toISOString()
        }
      ], 'Investigation history retrieved');
    }
  } catch (err) {
    next(err);
  }
});

export const searchRoutes = router;

