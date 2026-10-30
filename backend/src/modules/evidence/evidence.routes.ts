import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';
import { memSources } from '../discovery/discovery.routes.js';

const router = Router();

// In-memory store fallback
let memClaims: any[] = [
  {
    id: '44444444-4444-4444-4444-444444444441',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    source_id: '33333333-3333-3333-3333-333333333331',
    user_id: '00000000-0000-0000-0000-000000000001',
    claim_text: 'Deep neural networks enable non-invasive identification of asymptomatic left ventricular ejection fraction reduction.',
    finding_text: 'The AI model achieved an AUC of 0.93 (95% CI, 0.91-0.94) with 86.3% sensitivity and 85.7% specificity in multi-center validation.',
    supporting_excerpt: 'When applied to 12-lead ECG waveforms, the neural network identified patients with ejection fraction <= 35% with high diagnostic accuracy.',
    page_number: 3,
    section_name: 'Diagnostic Performance',
    methodology: 'Retrospective convolutional neural network evaluation',
    population: 'Multi-center clinical adult cohort',
    sample_size: 'n = 44,959',
    datasetDescription: 'Standard digital 12-lead resting ECGs',
    limitations: ['Retrospective validation design', 'Imbalanced patient referral patterns'],
    evidence_category: 'supporting',
    confidence: 0.93,
    evidence_type: 'empirical',
    created_at: new Date().toISOString()
  },
  {
    id: '44444444-4444-4444-4444-444444444442',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    source_id: '33333333-3333-3333-3333-333333333332',
    user_id: '00000000-0000-0000-0000-000000000001',
    claim_text: 'Performance of ECG deep learning models degrades when deployed across disparate socioeconomic health centers.',
    finding_text: 'Cross-population evaluation revealed drop in sensitivity from 88% in primary development centers to 71% in community rural sites.',
    supporting_excerpt: 'Significant variance in calibration curves was observed when testing outside metropolitan tertiary facilities.',
    page_number: 5,
    section_name: 'External Cross-Site Validation',
    methodology: 'Multi-institutional cross-sectional cohort analysis',
    population: 'Diverse community health system patients',
    sample_size: 'n = 18,200',
    datasetDescription: 'De-identified electronic health record data',
    limitations: ['Differences in recording hardware and ambient electrical noise'],
    evidence_category: 'limitation',
    confidence: 0.89,
    evidence_type: 'observational',
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations/:investigationId/extract-evidence
router.post('/:investigationId/extract-evidence', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    // Fetch sources for this investigation
    let sources: any[] = [];
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from('research_sources')
        .select('id, title, abstract, venue')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .limit(10);
      sources = data || [];
    } else {
      sources = memSources.filter(s => s.investigation_id === investigationId);
    }

    if (sources.length === 0) {
      return sendSuccess(res, { extracted: 0, message: 'No sources available for evidence extraction' });
    }

    const aiRes = await aiService.extractEvidence(sources);

    if (isSupabaseConfigured() && aiRes.claims.length > 0) {
      const inserts = aiRes.claims.map(c => ({
        investigation_id: investigationId,
        source_id: c.sourceId && sources.some(s => s.id === c.sourceId) ? c.sourceId : sources[0].id,
        user_id: userId,
        claim_text: c.claim,
        finding_text: c.finding,
        supporting_excerpt: c.supportingExcerpt,
        page_number: c.pageNumber,
        section_name: c.sectionName,
        methodology: c.methodology,
        population: c.population,
        sample_size: c.sampleSize,
        dataset_description: c.datasetDescription,
        limitations: c.limitations,
        evidence_category: c.evidenceCategory,
        confidence: c.confidence,
        evidence_type: c.evidenceType
      }));

      await supabaseAdmin.from('evidence_claims').insert(inserts);
    } else {
      for (const c of aiRes.claims) {
        memClaims.unshift({
          id: crypto.randomUUID(),
          investigation_id: investigationId,
          source_id: c.sourceId || sources[0].id,
          user_id: userId,
          claim_text: c.claim,
          finding_text: c.finding,
          supporting_excerpt: c.supportingExcerpt,
          page_number: c.pageNumber,
          section_name: c.sectionName,
          methodology: c.methodology,
          population: c.population,
          sample_size: c.sampleSize,
          dataset_description: c.datasetDescription,
          limitations: c.limitations,
          evidence_category: c.evidenceCategory,
          confidence: c.confidence,
          evidence_type: c.evidenceType,
          created_at: new Date().toISOString()
        });
      }
    }

    sendSuccess(res, { extracted: aiRes.claims.length }, 'Evidence claims extracted');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/evidence
router.get('/:investigationId/evidence', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('evidence_claims')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Evidence claims retrieved');
    } else {
      const claims = memClaims.filter(c => c.investigation_id === investigationId);
      sendSuccess(res, claims, 'Evidence claims retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/evidence/:claimId
router.get('/:claimId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('evidence_claims')
        .select('*')
        .eq('id', claimId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Evidence Claim');
      sendSuccess(res, data, 'Claim retrieved');
    } else {
      const claim = memClaims.find(c => c.id === claimId);
      if (!claim) throw new NotFoundError('Evidence Claim');
      sendSuccess(res, claim, 'Claim retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/evidence/:claimId
router.delete('/:claimId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { claimId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      await supabaseAdmin
        .from('evidence_claims')
        .delete()
        .eq('id', claimId)
        .eq('user_id', userId);
    } else {
      const idx = memClaims.findIndex(c => c.id === claimId);
      if (idx !== -1) memClaims.splice(idx, 1);
    }

    sendSuccess(res, { id: claimId }, 'Claim deleted');
  } catch (err) {
    next(err);
  }
});

export const evidenceRoutes = router;
export { memClaims };

