import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { updateProfileSchema } from '../../schemas/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// GET /api/v1/profile
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    let profile = null;

    if (isSupabaseConfigured()) {
      const { data } = await supabaseAdmin
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      profile = data;
    } else {
      profile = {
        id: userId,
        full_name: 'Lead AI Researcher',
        avatar_url: null,
        preferred_language: 'en'
      };
    }

    sendSuccess(res, profile, 'Profile retrieved');
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/profile
router.patch('/', authenticateToken, validate(updateProfileSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { fullName, avatarUrl, preferredLanguage } = req.body;

    let updated = null;
    if (isSupabaseConfigured()) {
      const updates: any = {};
      if (fullName !== undefined) updates.full_name = fullName;
      if (avatarUrl !== undefined) updates.avatar_url = avatarUrl;
      if (preferredLanguage !== undefined) updates.preferred_language = preferredLanguage;

      const { data, error } = await supabaseAdmin
        .from('profiles')
        .update(updates)
        .eq('id', userId)
        .select()
        .single();

      if (error) throw error;
      updated = data;
    } else {
      updated = {
        id: userId,
        full_name: fullName || 'Lead AI Researcher',
        avatar_url: avatarUrl || null,
        preferred_language: preferredLanguage || 'en'
      };
    }

    sendSuccess(res, updated, 'Profile updated successfully');
  } catch (err) {
    next(err);
  }
});

export const profileRoutes = router;

