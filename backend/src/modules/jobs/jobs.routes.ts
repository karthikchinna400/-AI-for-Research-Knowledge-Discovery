import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();

// GET /api/v1/jobs/:jobId
router.get('/:jobId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { jobId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_jobs')
        .select('*')
        .eq('id', jobId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Job');
      sendSuccess(res, data, 'Job details retrieved');
    } else {
      sendSuccess(res, {
        id: jobId,
        status: 'completed',
        attempts: 1,
        max_attempts: 3,
        error_message: null
      }, 'Job status retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/jobs
router.get('/investigations/:investigationId/jobs', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_jobs')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Investigation jobs retrieved');
    } else {
      sendSuccess(res, [], 'Investigation jobs retrieved');
    }
  } catch (err) {
    next(err);
  }
});

export const jobRoutes = router;

