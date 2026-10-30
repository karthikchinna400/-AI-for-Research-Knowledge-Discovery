import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// GET /api/v1/auth/me
router.get('/me', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const user = req.user;
    let profile = null;

    if (isSupabaseConfigured() && user) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      profile = data;
    } else {
      profile = {
        id: user?.id || '00000000-0000-0000-0000-000000000001',
        full_name: 'Lead AI Researcher',
        avatar_url: null,
        preferred_language: 'en'
      };
    }

    sendSuccess(res, { user, profile }, 'Current user profile retrieved');
  } catch (err) {
    next(err);
  }
});

export const authRoutes = router;

