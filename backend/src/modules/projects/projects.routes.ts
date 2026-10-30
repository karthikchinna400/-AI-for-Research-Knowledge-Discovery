import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { createProjectSchema, updateProjectSchema } from '../../schemas/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';

const router = Router();

// In-memory store fallback for development mode without Supabase connection
let memProjects: any[] = [
  {
    id: '11111111-1111-1111-1111-111111111111',
    user_id: '00000000-0000-0000-0000-000000000001',
    title: 'AI in Cardiovascular Disease Early Detection',
    description: 'Systematic investigation of deep learning methods and diagnostic boundaries.',
    domain: 'Healthcare and Medicine',
    status: 'active',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
];

// POST /api/v1/projects
router.post('/', authenticateToken, validate(createProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { title, description, domain } = req.body;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_projects')
        .insert({
          user_id: userId,
          title,
          description,
          domain: domain || 'Computer Science'
        })
        .select()
        .single();

      if (error) throw error;
      sendSuccess(res, data, 'Project created successfully', 201);
    } else {
      const newProj = {
        id: crypto.randomUUID(),
        user_id: userId,
        title,
        description,
        domain: domain || 'Computer Science',
        status: 'active',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      memProjects.unshift(newProj);
      sendSuccess(res, newProj, 'Project created successfully', 201);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/projects
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_projects')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      sendSuccess(res, data || [], 'Projects retrieved');
    } else {
      const userProjects = memProjects.filter(p => p.user_id === userId);
      sendSuccess(res, userProjects, 'Projects retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/projects/:projectId
router.get('/:projectId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_projects')
        .select('*')
        .eq('id', projectId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Project');
      sendSuccess(res, data, 'Project details retrieved');
    } else {
      const project = memProjects.find(p => p.id === projectId && p.user_id === userId);
      if (!project) throw new NotFoundError('Project');
      sendSuccess(res, project, 'Project details retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// PATCH /api/v1/projects/:projectId
router.patch('/:projectId', authenticateToken, validate(updateProjectSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;
    const updates = req.body;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('research_projects')
        .update(updates)
        .eq('id', projectId)
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      sendSuccess(res, data, 'Project updated successfully');
    } else {
      const idx = memProjects.findIndex(p => p.id === projectId && p.user_id === userId);
      if (idx === -1) throw new NotFoundError('Project');
      memProjects[idx] = { ...memProjects[idx], ...updates, updated_at: new Date().toISOString() };
      sendSuccess(res, memProjects[idx], 'Project updated successfully');
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/projects/:projectId
router.delete('/:projectId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { projectId } = req.params;

    if (isSupabaseConfigured()) {
      const { error } = await supabaseAdmin
        .from('research_projects')
        .delete()
        .eq('id', projectId)
        .eq('user_id', userId);

      if (error) throw error;
    } else {
      memProjects = memProjects.filter(p => !(p.id === projectId && p.user_id === userId));
    }

    sendSuccess(res, { id: projectId }, 'Project deleted successfully');
  } catch (err) {
    next(err);
  }
});

export const projectRoutes = router;

