import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { AuthorizationError, NotFoundError } from '../utils/errors.js';

export function requireProjectOwnership(paramName = 'projectId') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const projectId = req.params[paramName] || req.body[paramName];
      const userId = req.user?.id;

      if (!projectId || !userId) {
        return next();
      }

      if (!isSupabaseConfigured()) {
        return next();
      }

      const { data, error } = await supabaseAdmin
        .from('research_projects')
        .select('user_id')
        .eq('id', projectId)
        .single();

      if (error || !data) {
        throw new NotFoundError('Project');
      }

      if (data.user_id !== userId) {
        throw new AuthorizationError('You do not have access to this project');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireInvestigationOwnership(paramName = 'investigationId') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const investigationId = req.params[paramName] || req.body[paramName];
      const userId = req.user?.id;

      if (!investigationId || !userId) {
        return next();
      }

      if (!isSupabaseConfigured()) {
        return next();
      }

      const { data, error } = await supabaseAdmin
        .from('research_investigations')
        .select('user_id')
        .eq('id', investigationId)
        .single();

      if (error || !data) {
        throw new NotFoundError('Investigation');
      }

      if (data.user_id !== userId) {
        throw new AuthorizationError('You do not have access to this investigation');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireSourceOwnership(paramName = 'sourceId') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const sourceId = req.params[paramName];
      const userId = req.user?.id;

      if (!sourceId || !userId) {
        return next();
      }

      if (!isSupabaseConfigured()) {
        return next();
      }

      const { data, error } = await supabaseAdmin
        .from('research_sources')
        .select('user_id')
        .eq('id', sourceId)
        .single();

      if (error || !data) {
        throw new NotFoundError('Source');
      }

      if (data.user_id !== userId) {
        throw new AuthorizationError('You do not have access to this source');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

export function requireDocumentOwnership(paramName = 'documentId') {
  return async (req: Request, _res: Response, next: NextFunction): Promise<void> => {
    try {
      const documentId = req.params[paramName];
      const userId = req.user?.id;

      if (!documentId || !userId) {
        return next();
      }

      if (!isSupabaseConfigured()) {
        return next();
      }

      const { data, error } = await supabaseAdmin
        .from('documents')
        .select('user_id')
        .eq('id', documentId)
        .single();

      if (error || !data) {
        throw new NotFoundError('Document');
      }

      if (data.user_id !== userId) {
        throw new AuthorizationError('You do not have access to this document');
      }

      next();
    } catch (err) {
      next(err);
    }
  };
}

