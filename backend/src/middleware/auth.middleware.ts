import { Request, Response, NextFunction } from 'express';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { AuthenticationError } from '../utils/errors.js';
import { logger } from '../utils/logger.js';

export interface AuthenticatedUser {
  id: string;
  email?: string;
  role?: string;
  token?: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}

export async function authenticateToken(req: Request, _res: Response, next: NextFunction): Promise<void> {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // In local development mode without Supabase keys, supply a deterministic mock user for testing
      if (!isSupabaseConfigured()) {
        req.user = {
          id: '00000000-0000-0000-0000-000000000001',
          email: 'dev.researcher@example.com',
          role: 'authenticated'
        };
        return next();
      }
      throw new AuthenticationError('Missing or malformed Authorization header');
    }

    const token = authHeader.substring(7);

    if (!isSupabaseConfigured()) {
      req.user = {
        id: '00000000-0000-0000-0000-000000000001',
        email: 'dev.researcher@example.com',
        role: 'authenticated',
        token
      };
      return next();
    }

    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !user) {
      logger.warn({ error: error?.message }, 'Authentication failed with Supabase');
      throw new AuthenticationError('Invalid or expired authentication token');
    }

    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
      token
    };

    next();
  } catch (err) {
    next(err);
  }
}

