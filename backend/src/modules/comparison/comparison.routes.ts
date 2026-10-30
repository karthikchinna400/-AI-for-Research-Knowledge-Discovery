import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';
import { memClaims } from '../evidence/evidence.routes.js';

const router = Router();

let memComparisons: any[] = [
  {
    id: '55555555-5555-5555-5555-555555555551',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    claim_ids: ['44444444-4444-4444-4444-444444444441', '44444444-4444-4444-4444-444444444442'],
    comparison_type: 'methodological_difference',
    summary: 'High reported internal validation sensitivity versus notable external cross-site performance decline.',
    supporting_sources: ['33333333-3333-3333-3333-333333333331', '33333333-3333-3333-3333-333333333332'],
    methodological_differences: [
      'Study 1 utilized tertiary center academic health data with curated ECG hardware.',
      'Study 2 tested real-world heterogeneous community clinics with ambulatory devices.'
    ],
    explanation: 'The disagreement in generalizability is primarily methodological: retrospective single-network curation produces optimistic ROC-AUC figures that attenuate under community deployment noise.',
    confidence: 0.91,
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations/:investigationId/compare
router.post('/:investigationId/compare', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    let claims: any[] = [];
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from('evidence_claims')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId);
      claims = data || [];
    } else {
      claims = memClaims.filter(c => c.investigation_id === investigationId);
    }

    if (claims.length < 2) {
      return sendSuccess(res, { comparisons: [] }, 'At least 2 claims are required for comparative analysis.');
    }

    const aiRes = await aiService.compareEvidence(claims);

    if (isSupabaseConfigured() && aiRes.comparisons.length > 0) {
      const inserts = aiRes.comparisons.map(c => ({
        investigation_id: investigationId,
        user_id: userId,
        claim_ids: c.claimIds.length > 0 ? c.claimIds : [claims[0].id, claims[1].id],
        comparison_type: c.comparisonType,
        summary: c.summary,
        supporting_sources: c.supportingSourceIds,
        methodological_differences: c.methodologicalDifferences,
        explanation: c.explanation,
        confidence: c.confidence
      }));

      await supabaseAdmin.from('evidence_comparisons').insert(inserts);
    } else {
      for (const c of aiRes.comparisons) {
        memComparisons.unshift({
          id: crypto.randomUUID(),
          investigation_id: investigationId,
          user_id: userId,
          claim_ids: c.claimIds.length > 0 ? c.claimIds : [claims[0].id, claims[1].id],
          comparison_type: c.comparisonType,
          summary: c.summary,
          supporting_sources: c.supportingSourceIds,
          methodological_differences: c.methodologicalDifferences,
          explanation: c.explanation,
          confidence: c.confidence,
          created_at: new Date().toISOString()
        });
      }
    }

    sendSuccess(res, { compared: aiRes.comparisons.length }, 'Evidence comparison completed');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/comparisons
router.get('/:investigationId/comparisons', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('evidence_comparisons')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Comparisons retrieved');
    } else {
      const comps = memComparisons.filter(c => c.investigation_id === investigationId);
      sendSuccess(res, comps, 'Comparisons retrieved');
    }
  } catch (err) {
    next(err);
  }
});

export const comparisonRoutes = router;

