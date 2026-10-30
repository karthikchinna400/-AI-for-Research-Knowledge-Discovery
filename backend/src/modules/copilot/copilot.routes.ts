import { Router, Request, Response, NextFunction } from 'express';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validation.middleware.js';
import { createConversationSchema, sendCopilotMessageSchema } from '../../schemas/index.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { aiService } from '../../services/ai.service.js';
import { sendSuccess } from '../../utils/response.js';
import { NotFoundError } from '../../utils/errors.js';
import { memSources } from '../discovery/discovery.routes.js';
import { memClaims } from '../evidence/evidence.routes.js';

const router = Router();

let memConversations: any[] = [
  {
    id: 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    user_id: '00000000-0000-0000-0000-000000000001',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    title: 'Diagnostic Bounds Discussion',
    created_at: new Date().toISOString()
  }
];

let memMessages: any[] = [
  {
    id: 'cccc1111-cccc-cccc-cccc-cccccccccccc',
    conversation_id: 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    user_id: '00000000-0000-0000-0000-000000000001',
    role: 'user',
    content: 'What do the reviewed studies conclude regarding cross-site validation and generalizability?',
    citations: [],
    created_at: new Date(Date.now() - 60000).toISOString()
  },
  {
    id: 'cccc2222-cccc-cccc-cccc-cccccccccccc',
    conversation_id: 'bbbb1111-bbbb-bbbb-bbbb-bbbbbbbbbbbb',
    user_id: '00000000-0000-0000-0000-000000000001',
    role: 'assistant',
    content: 'The reviewed evidence demonstrates high internal retrospective validation (AUC 0.93), but highlights measurable sensitivity drops (down to 71%) when tested in community outpatient settings due to recording device variability and population demographics.',
    citations: [
      {
        source_id: '33333333-3333-3333-3333-333333333331',
        title: 'Deep learning for automated detection of left ventricular dysfunction from electrocardiograms',
        doi: '10.1016/j.jacc.2023.01.012',
        year: 2023
      },
      {
        source_id: '33333333-3333-3333-3333-333333333332',
        title: 'Evaluating distributional drift and cross-population generalization of cardiovascular prediction models',
        doi: '10.1038/s41746-024-01021-x',
        year: 2024
      }
    ],
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/copilot/conversations
router.post('/conversations', authenticateToken, validate(createConversationSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { investigationId, title } = req.body;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('copilot_conversations')
        .insert({
          user_id: userId,
          investigation_id: investigationId,
          title: title || 'Research Discussion'
        })
        .select()
        .single();

      if (error) throw error;
      sendSuccess(res, data, 'Conversation created', 201);
    } else {
      const newConv = {
        id: crypto.randomUUID(),
        user_id: userId,
        investigation_id: investigationId,
        title: title || 'Research Discussion',
        created_at: new Date().toISOString()
      };
      memConversations.unshift(newConv);
      sendSuccess(res, newConv, 'Conversation created', 201);
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/copilot/conversations
router.get('/conversations', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { investigationId } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from('copilot_conversations')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (investigationId) query = query.eq('investigation_id', investigationId);

      const { data, error } = await query;
      if (error) throw error;
      sendSuccess(res, data || [], 'Conversations retrieved');
    } else {
      let list = memConversations.filter(c => c.user_id === userId);
      if (investigationId) list = list.filter(c => c.investigation_id === investigationId);
      sendSuccess(res, list, 'Conversations retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/copilot/conversations/:conversationId/messages
router.get('/conversations/:conversationId/messages', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { conversationId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('copilot_messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .eq('user_id', userId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      sendSuccess(res, data || [], 'Messages retrieved');
    } else {
      const messages = memMessages.filter(m => m.conversation_id === conversationId);
      sendSuccess(res, messages, 'Messages retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/copilot/ask (Retrieval-Augmented Generation Chat)
router.post('/ask', authenticateToken, validate(sendCopilotMessageSchema), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { investigationId, conversationId, message } = req.body;

    let convId = conversationId;
    if (!convId) {
      if (isSupabaseConfigured()) {
        const { data: newConv } = await supabaseAdmin
          .from('copilot_conversations')
          .insert({
            user_id: userId,
            investigation_id: investigationId,
            title: message.slice(0, 40) + '...'
          })
          .select()
          .single();
        convId = newConv?.id;
      } else {
        convId = crypto.randomUUID();
        memConversations.unshift({
          id: convId,
          user_id: userId,
          investigation_id: investigationId,
          title: message.slice(0, 40) + '...',
          created_at: new Date().toISOString()
        });
      }
    }

    // Retrieve evidence and sources for this investigation
    let sources: any[] = [];
    let claims: any[] = [];
    let chunks: any[] = [];

    if (isSupabaseConfigured()) {
      const { data: s } = await supabaseAdmin.from('research_sources').select('id, title, abstract, authors, publication_year, doi').eq('investigation_id', investigationId).limit(10);
      const { data: c } = await supabaseAdmin.from('evidence_claims').select('id, claim_text, finding_text, supporting_excerpt, source_id, evidence_category').eq('investigation_id', investigationId).limit(10);
      const { data: ch } = await supabaseAdmin.from('document_chunks').select('content, page_number').eq('investigation_id', investigationId).limit(5);
      sources = s || [];
      claims = c || [];
      chunks = ch || [];
    } else {
      sources = memSources.filter(s => s.investigation_id === investigationId);
      claims = memClaims.filter(c => c.investigation_id === investigationId);
    }

    // Call AI with context
    const aiRes = await aiService.askCopilot(message, claims, sources, chunks, []);

    // Build citation chips
    const citations = sources.slice(0, 3).map(s => ({
      source_id: s.id,
      title: s.title,
      doi: s.doi,
      authors: s.authors,
      year: s.publication_year
    }));

    if (isSupabaseConfigured()) {
      await supabaseAdmin.from('copilot_messages').insert([
        { conversation_id: convId, user_id: userId, role: 'user', content: message, citations: [] },
        { conversation_id: convId, user_id: userId, role: 'assistant', content: aiRes.answer, citations }
      ]);
    } else {
      memMessages.push({
        id: crypto.randomUUID(),
        conversation_id: convId,
        user_id: userId,
        role: 'user',
        content: message,
        citations: [],
        created_at: new Date().toISOString()
      });
      memMessages.push({
        id: crypto.randomUUID(),
        conversation_id: convId,
        user_id: userId,
        role: 'assistant',
        content: aiRes.answer,
        citations,
        created_at: new Date().toISOString()
      });
    }

    sendSuccess(res, {
      conversationId: convId,
      answer: aiRes.answer,
      keyPoints: aiRes.keyPoints,
      limitations: aiRes.limitations,
      followUpQuestions: aiRes.followUpQuestions,
      citations
    }, 'Copilot answered successfully');
  } catch (err) {
    next(err);
  }
});

export const copilotRoutes = router;

