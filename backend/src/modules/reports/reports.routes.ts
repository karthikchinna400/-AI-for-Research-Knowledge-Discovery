import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';
import { memSources } from '../discovery/discovery.routes.js';
import { memClaims } from '../evidence/evidence.routes.js';

const router = Router();

let memReports: any[] = [
  {
    id: 'dddd1111-dddd-dddd-dddd-dddddddddddd',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'Cardiovascular AI Evidence Synthesis Report',
    report_type: 'Comprehensive Systematic Review',
    format: 'markdown',
    status: 'completed',
    content: {
      title: 'Cardiovascular AI Evidence Synthesis Report',
      executiveSummary: 'This evidence intelligence report synthesizes findings across multi-center electrocardiography deep learning literature.',
      keyFindings: [
        'Validated algorithms report high retrospective sensitivity in detecting ejection fraction reduction.',
        'External testing across community centers demonstrates notable calibration shifts.'
      ],
      methodology: 'Literature discovery across Crossref, OpenAlex, Semantic Scholar and Tavily.',
      potentialResearchGaps: ['Potential gap in the sources reviewed: Lack of prospective multi-year clinical trial outcomes.'],
      references: [
        { citationText: 'Attia et al., Journal of the American College of Cardiology, 2023. DOI: 10.1016/j.jacc.2023.01.012' }
      ]
    },
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations/:investigationId/reports
router.post('/:investigationId/reports', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;
    const { title, format = 'markdown' } = req.body;

    let sources: any[] = [];
    let claims: any[] = [];

    if (isSupabaseConfigured()) {
      const { data: s } = await supabaseAdmin.from('research_sources').select('*').eq('investigation_id', investigationId);
      const { data: c } = await supabaseAdmin.from('evidence_claims').select('*').eq('investigation_id', investigationId);
      sources = s || [];
      claims = c || [];
    } else {
      sources = memSources.filter(s => s.investigation_id === investigationId);
      claims = memClaims.filter(c => c.investigation_id === investigationId);
    }

    const aiRes = await aiService.generateReport(
      { id: investigationId },
      sources,
      claims,
      [],
      [],
      []
    );

    const reportTitle = title || aiRes.title || 'Research Evidence Intelligence Report';

    let savedReport: any = null;
    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_reports')
        .insert({
          user_id: userId,
          investigation_id: investigationId,
          title: reportTitle,
          report_type: 'Comprehensive Evidence Review',
          content: aiRes,
          format,
          status: 'completed'
        })
        .select()
        .single();

      if (error) throw error;
      savedReport = data;
    } else {
      savedReport = {
        id: crypto.randomUUID(),
        investigation_id: investigationId,
        user_id: userId,
        title: reportTitle,
        report_type: 'Comprehensive Evidence Review',
        content: aiRes,
        format,
        status: 'completed',
        created_at: new Date().toISOString()
      };
      memReports.unshift(savedReport);
    }

    sendSuccess(res, savedReport, 'Report generated successfully', 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/reports
router.get('/:investigationId/reports', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_reports')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Reports retrieved');
    } else {
      const reports = memReports.filter(r => r.investigation_id === investigationId);
      sendSuccess(res, reports, 'Reports retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/reports/:reportId
router.get('/:reportId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_reports')
        .select('*')
        .eq('id', reportId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Report');
      sendSuccess(res, data, 'Report retrieved');
    } else {
      const report = memReports.find(r => r.id === reportId);
      if (!report) throw new NotFoundError('Report');
      sendSuccess(res, report, 'Report retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/reports/:reportId/download
router.get('/:reportId/download', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { reportId } = req.params;
    const { format = 'markdown' } = req.query;

    let report: any = null;
    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin.from('research_reports').select('*').eq('id', reportId).single();
      report = data;
    } else {
      report = memReports.find(r => r.id === reportId);
    }

    if (!report) throw new NotFoundError('Report');

    const content = report.content;
    const markdown = `# ${content.title || report.title}

## Executive Summary
${content.executiveSummary || ''}

## Research Objectives
${(content.objectives || []).map((o: string) => `- ${o}`).join('\n')}

## Methodology
${content.methodology || ''}

## Key Findings
${(content.keyFindings || []).map((f: string) => `- ${f}`).join('\n')}

## Evidence Comparisons
${(content.evidenceComparisons || []).map((c: string) => `- ${c}`).join('\n')}

## Potential Research Gaps
${(content.potentialResearchGaps || []).map((g: string) => `- ${g}`).join('\n')}

## Limitations
${(content.limitations || []).map((l: string) => `- ${l}`).join('\n')}

## Future Research Directions
${(content.futureResearchDirections || []).map((d: string) => `- ${d}`).join('\n')}

## References
${(content.references || []).map((r: any) => `- ${r.citationText || r}`).join('\n')}
`;

    res.setHeader('Content-Type', 'text/markdown; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="${report.title.replace(/[^a-zA-Z0-9_-]/g, '_')}.md"`);
    res.send(markdown);
  } catch (err) {
    next(err);
  }
});

export const reportRoutes = router;

