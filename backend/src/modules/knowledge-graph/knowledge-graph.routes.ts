import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { memSources } from '../discovery/discovery.routes.js';
import { memClaims } from '../evidence/evidence.routes.js';
import { memThemes } from '../themes/themes.routes.js';

const router = Router();

let memEntities: any[] = [
  {
    id: '88888888-8888-8888-8888-888888888881',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    entity_type: 'research_question',
    name: 'Cardiovascular Risk AI Detection',
    description: 'Central research inquiry',
    metadata: {},
    created_at: new Date().toISOString()
  },
  {
    id: '88888888-8888-8888-8888-888888888882',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    entity_type: 'publication',
    name: 'Attia et al., JACC 2023',
    description: 'ECG left ventricular dysfunction neural network benchmark',
    metadata: { doi: '10.1016/j.jacc.2023.01.012' },
    created_at: new Date().toISOString()
  },
  {
    id: '88888888-8888-8888-8888-888888888883',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    entity_type: 'research_theme',
    name: 'Cross-Site Generalization',
    description: 'Generalizability and demographic calibration',
    metadata: {},
    created_at: new Date().toISOString()
  },
  {
    id: '88888888-8888-8888-8888-888888888884',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    entity_type: 'research_gap',
    name: 'Lack of Prospective RCTs',
    description: 'Underrepresented prospective screening clinical outcomes',
    metadata: {},
    created_at: new Date().toISOString()
  }
];

let memRelationships: any[] = [
  {
    id: '99999999-9999-9999-9999-999999999991',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    source_entity_id: '88888888-8888-8888-8888-888888888882',
    target_entity_id: '88888888-8888-8888-8888-888888888881',
    relationship_type: 'supports',
    explanation: 'Publication provides primary empirical evidence supporting early ECG screening feasibility.',
    supporting_source_ids: ['33333333-3333-3333-3333-333333333331'],
    confidence: 0.94,
    created_at: new Date().toISOString()
  },
  {
    id: '99999999-9999-9999-9999-999999999992',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    user_id: '00000000-0000-0000-0000-000000000001',
    source_entity_id: '88888888-8888-8888-8888-888888888883',
    target_entity_id: '88888888-8888-8888-8888-888888888884',
    relationship_type: 'identifies_gap',
    explanation: 'Theme analysis indicates external validation sensitivity demands future randomized prospective trials.',
    supporting_source_ids: ['33333333-3333-3333-3333-333333333332'],
    confidence: 0.88,
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/investigations/:investigationId/generate-map
router.post('/:investigationId/generate-map', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    let sources: any[] = [];
    let claims: any[] = [];
    let themes: any[] = [];

    if (isSupabaseConfigured()) {
      const { data: s } = await supabaseAdmin.from('research_sources').select('*').eq('investigation_id', investigationId).eq('user_id', userId);
      const { data: c } = await supabaseAdmin.from('evidence_claims').select('*').eq('investigation_id', investigationId).eq('user_id', userId);
      const { data: t } = await supabaseAdmin.from('research_themes').select('*').eq('investigation_id', investigationId).eq('user_id', userId);
      sources = s || [];
      claims = c || [];
      themes = t || [];
    } else {
      sources = memSources.filter(s => s.investigation_id === investigationId);
      claims = memClaims.filter(c => c.investigation_id === investigationId);
      themes = memThemes.filter(t => t.investigation_id === investigationId);
    }

    const aiRes = await aiService.generateKnowledgeGraph(sources, claims, themes, []);

    if (isSupabaseConfigured() && aiRes.entities.length > 0) {
      // Clear previous graph records for this investigation
      await supabaseAdmin.from('knowledge_relationships').delete().eq('investigation_id', investigationId);
      await supabaseAdmin.from('knowledge_entities').delete().eq('investigation_id', investigationId);

      const entityInserts = aiRes.entities.map(e => ({
        investigation_id: investigationId,
        user_id: userId,
        entity_type: e.entityType,
        name: e.name,
        description: e.description,
        metadata: e.metadata || {}
      }));

      const { data: createdEntities } = await supabaseAdmin
        .from('knowledge_entities')
        .insert(entityInserts)
        .select();

      if (createdEntities && createdEntities.length >= 2 && aiRes.relationships.length > 0) {
        const relInserts = aiRes.relationships.map((r, i) => ({
          investigation_id: investigationId,
          user_id: userId,
          source_entity_id: createdEntities[0].id,
          target_entity_id: createdEntities[1].id,
          relationship_type: r.relationshipType,
          explanation: r.explanation,
          supporting_source_ids: r.supportingSourceIds,
          confidence: r.confidence
        }));
        await supabaseAdmin.from('knowledge_relationships').insert(relInserts);
      }
    }

    sendSuccess(res, { entities: aiRes.entities.length, relationships: aiRes.relationships.length }, 'Knowledge graph generated');
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/investigations/:investigationId/map
router.get('/:investigationId/map', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { investigationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data: entities } = await supabaseAdmin
        .from('knowledge_entities')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId);

      const { data: relationships } = await supabaseAdmin
        .from('knowledge_relationships')
        .select('*')
        .eq('investigation_id', investigationId)
        .eq('user_id', userId);

      sendSuccess(res, {
        entities: entities || [],
        relationships: relationships || []
      }, 'Knowledge graph retrieved');
    } else {
      const entities = memEntities.filter(e => e.investigation_id === investigationId);
      const relationships = memRelationships.filter(r => r.investigation_id === investigationId);
      sendSuccess(res, { entities, relationships }, 'Knowledge graph retrieved');
    }
  } catch (err) {
    next(err);
  }
});

export const knowledgeGraphRoutes = router;

