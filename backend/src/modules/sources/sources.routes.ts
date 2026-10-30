import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';
import { memSources } from '../discovery/discovery.routes.js';

const router = Router();

// GET /api/v1/sources/:sourceId
router.get('/:sourceId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sourceId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_sources')
        .select('*')
        .eq('id', sourceId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Source');
      sendSuccess(res, data, 'Source details retrieved');
    } else {
      const source = memSources.find(s => s.id === sourceId);
      if (!source) throw new NotFoundError('Source');
      sendSuccess(res, source, 'Source details retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/sources/:sourceId
router.delete('/:sourceId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { sourceId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      await supabaseAdmin
        .from('research_sources')
        .delete()
        .eq('id', sourceId)
        .eq('user_id', userId);
    } else {
      const idx = memSources.findIndex(s => s.id === sourceId);
      if (idx !== -1) memSources.splice(idx, 1);
    }

    sendSuccess(res, { id: sourceId }, 'Source removed');
  } catch (err) {
    next(err);
  }
});

export const sourceRoutes = router;

