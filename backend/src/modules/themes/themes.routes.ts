import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { memSources } from '../discovery/discovery.routes.js';
import { memClaims } from '../evidence/evidence.routes.js';

const router = Router();

let memThemes: any[] = [
  {
    id: '77777777-7777-7777-7777-777777777771',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    name: 'Diagnostic Sensitivity & Signal Classification',
    description: 'Studies evaluating raw 12-lead voltage waveform feature extraction and CNN layer representations.',
    keywords: ['convolutional neural networks', 'voltage classification', 'signal filtering'],
    source_ids: ['33333333-3333-3333-3333-333333333331'],
    claim_ids: ['44444444-4444-4444-4444-444444444441'],
    created_at: new Date().toISOString()
  },
  {
    id: '77777777-7777-7777-7777-777777777772',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    name: 'Cross-Site Generalization & Health Equity',
    description: 'Investigations examining model degradation across diverse demographics, ambulatory vs resting recordings, and clinic hardware disparity.',
    keywords: ['algorithmic bias', 'generalizability', 'external validation', 'dataset distribution'],
    source_ids: ['33333333-3333-3333-3333-333333333332'],
    claim_ids: ['44444444-4444-4444-4444-444444444442'],
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations/:investigationId/analyze-themes
router.post('/:investigationId/analyze-themes', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    let sources: any[] = [];
    let claims: any[] = [];

    if (isSupabaseConfigured()) {
      const { data: sData } = await supabaseAdmin.from('research_sources').select('*').eq('investigation_id', investigationId).eq('user_id', userId);
      const { data: cData } = await supabaseAdmin.from('evidence_claims').select('*').eq('investigation_id', investigationId).eq('user_id', userId);
      sources = sData || [];
      claims = cData || [];
    } else {
      sources = memSources.filter(s => s.investigation_id === investigationId);
      claims = memClaims.filter(c => c.investigation_id === investigationId);
    }

    const aiRes = await aiService.analyzeThemes(sources, claims);

    if (isSupabaseConfigured() && aiRes.themes.length > 0) {
      const inserts = aiRes.themes.map(t => ({
        investigation_id: investigationId,
        user_id: userId,
        name: t.name,
        description: t.description,
        keywords: t.keywords,
        source_ids: t.sourceIds,
        claim_ids: t.claimIds
      }));

      await supabaseAdmin.from('research_themes').insert(inserts);
    } else {
      for (const t of aiRes.themes) {
        memThemes.unshift({
          id: crypto.randomUUID(),
          investigation_id: investigationId,
          user_id: userId,
          ...t,
          created_at: new Date().toISOString()
        });
      }
    }

    sendSuccess(res, { themesIdentified: aiRes.themes.length }, 'Themes analyzed');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/themes
router.get('/:investigationId/themes', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_themes')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Themes retrieved');
    } else {
      const themes = memThemes.filter(t => t.investigation_id === investigationId);
      sendSuccess(res, themes, 'Themes retrieved');
    }
  } catch (err) {
    next(err);
  }
});

export const themeRoutes = router;
export { memThemes };

