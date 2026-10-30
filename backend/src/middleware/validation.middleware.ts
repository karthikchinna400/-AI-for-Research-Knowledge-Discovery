import { Request, Response, NextFunction } from 'express';
import { ZodSchema, ZodError } from 'zod';
import { ValidationError } from '../utils/errors.js';

export function validate(schema: ZodSchema, source: 'body' | 'query' | 'params' = 'body') {
  return (req: Request, _res: Response, next: NextFunction): void => {
    try {
      const parsed = schema.parse(req[source]);
      req[source] = parsed;
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const details = err.errors.map(e => ({
          field: e.path.join('.'),
          message: e.message
        }));
        return next(new ValidationError('Validation failed for incoming request', details));
      }
      next(err);
    }
  };
}

