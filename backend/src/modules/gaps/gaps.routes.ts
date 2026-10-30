import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { memSources } from '../discovery/discovery.routes.js';
import { memClaims } from '../evidence/evidence.routes.js';

const router = Router();

let memGaps: any[] = [
  {
    id: '66666666-6666-6666-6666-666666666661',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Absence of Prospective Longitudinal Randomized Screening Trials',
    description: 'Potential gap in the sources reviewed: Studies overwhelmingly concentrate on retrospective digital records; prospective blinded RCTs evaluating patient morbidity and mortality outcomes remain scarce.',
    related_themes: ['Clinical Validation', 'Prospective Deployment'],
    supporting_source_ids: ['33333333-3333-3333-3333-333333333331'],
    supporting_claim_ids: ['44444444-4444-4444-4444-444444444441'],
    rationale: 'Retrospective analyses cannot establish whether early algorithmic alert generation translates into timely therapy or improved long-term survival.',
    suggested_research_question: 'Does algorithmic opportunistic ECG screening reduce 5-year heart failure hospitalization in asymptomatic adults?',
    confidence: 0.84,
    limitations: ['Gap observation is based exclusively on the publications gathered within this workspace.'],
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations/:investigationId/analyze-gaps
router.post('/:investigationId/analyze-gaps', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
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

    const aiRes = await aiService.analyzeGaps(sources, claims);

    if (isSupabaseConfigured() && aiRes.gaps.length > 0) {
      const inserts = aiRes.gaps.map(g => ({
        investigation_id: investigationId,
        user_id: userId,
        title: g.title,
        description: g.description,
        related_themes: g.relatedThemes,
        supporting_source_ids: g.supportingSourceIds,
        supporting_claim_ids: g.supportingClaimIds,
        rationale: g.rationale,
        suggested_research_question: g.suggestedResearchQuestion,
        confidence: g.confidence,
        limitations: g.limitations
      }));

      await supabaseAdmin.from('research_gaps').insert(inserts);
    } else {
      for (const g of aiRes.gaps) {
        memGaps.unshift({
          id: crypto.randomUUID(),
          investigation_id: investigationId,
          user_id: userId,
          ...g,
          created_at: new Date().toISOString()
        });
      }
    }

    sendSuccess(res, { gapsIdentified: aiRes.gaps.length }, 'Research gap analysis completed');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/gaps
router.get('/:investigationId/gaps', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_gaps')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Research gaps retrieved');
    } else {
      const gaps = memGaps.filter(g => g.investigation_id === investigationId);
      sendSuccess(res, gaps, 'Research gaps retrieved');
    }
  } catch (err) {
    next(err);
  }
});

export const gapRoutes = router;

