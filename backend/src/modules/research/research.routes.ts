import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { analyzeQuestionSchema } from '../../schemas/index.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';

const router = Router();

// POST /api/v1/research/analyze-question
router.post('/analyze-question', authenticateToken, validate(analyzeQuestionSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { question, domain, scope } = req.body;
    const analysis = await aiService.analyzeQuestion(question, domain, scope);
    sendSuccess(res, analysis, 'Research question analyzed successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/research/generate-search-queries
router.post('/generate-search-queries', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { refinedQuestion, keywords, domain } = req.body;
    const queries = await aiService.generateSearchQueries(refinedQuestion || '', keywords || [], domain || 'Computer Science');
    sendSuccess(res, queries, 'Search queries generated successfully');
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/research/validate-plan
router.post('/validate-plan', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { researchQuestion, domain, scope, objectives, searchQueries } = req.body;
    const isValid = Boolean(researchQuestion && domain);
    sendSuccess(res, {
      isValid,
      summary: `Research plan validated for: ${researchQuestion}`,
      readyForDiscovery: true
    }, 'Research plan validated');
  } catch (err) {
    next(err);
  }
});

export const researchRoutes = router;

