import { Router } from 'express';
import { authRoutes } from '../modules/auth/auth.routes.js';
import { profileRoutes } from '../modules/profile/profile.routes.js';
import { projectRoutes } from '../modules/projects/projects.routes.js';
import { researchRoutes } from '../modules/research/research.routes.js';
import { investigationRoutes } from '../modules/investigations/investigations.routes.js';
import { discoveryRoutes } from '../modules/discovery/discovery.routes.js';
import { sourceRoutes } from '../modules/sources/sources.routes.js';
import { evidenceRoutes } from '../modules/evidence/evidence.routes.js';
import { comparisonRoutes } from '../modules/comparison/comparison.routes.js';
import { gapRoutes } from '../modules/gaps/gaps.routes.js';
import { themeRoutes } from '../modules/themes/themes.routes.js';
import { knowledgeGraphRoutes } from '../modules/knowledge-graph/knowledge-graph.routes.js';
import { documentRoutes } from '../modules/documents/documents.routes.js';
import { copilotRoutes } from '../modules/copilot/copilot.routes.js';
import { reportRoutes } from '../modules/reports/reports.routes.js';
import { jobRoutes } from '../modules/jobs/jobs.routes.js';
import { searchRoutes } from '../modules/search/search.routes.js';

const router = Router();

// Health check under /api/v1/health
router.get('/health', (_req, res) => {
  res.json({
    status: 'ok',
    service: 'AI Research Copilot API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
});

// Mount module sub-routers
router.use('/auth', authRoutes);
router.use('/profile', profileRoutes);
router.use('/projects', projectRoutes);
router.use('/research', researchRoutes);
router.use('/investigations', investigationRoutes);
router.use('/investigations', discoveryRoutes);
router.use('/sources', sourceRoutes);
router.use('/investigations', evidenceRoutes);
router.use('/evidence', evidenceRoutes);
router.use('/investigations', comparisonRoutes);
router.use('/comparisons', comparisonRoutes);
router.use('/investigations', gapRoutes);
router.use('/gaps', gapRoutes);
router.use('/investigations', themeRoutes);
router.use('/themes', themeRoutes);
router.use('/investigations', knowledgeGraphRoutes);
router.use('/documents', documentRoutes);
router.use('/copilot', copilotRoutes);
router.use('/investigations', reportRoutes);
router.use('/reports', reportRoutes);
router.use('/jobs', jobRoutes);
router.use('/', searchRoutes);

export const v1Router = router;

