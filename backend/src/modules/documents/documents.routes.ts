import { Router, Request, Response, NextFunction } from 'express';
import multer from 'multer';
import crypto from 'crypto';
import { authenticateToken } from '../../middleware/auth.middleware.js';
import { supabaseAdmin, isSupabaseConfigured } from '../../config/supabase.js';
import { documentProcessor } from '../../services/document-processor.service.js';
import { sendSuccess } from '../../utils/response.js';
import { ValidationError, NotFoundError } from '../../utils/errors.js';

const router = Router();

const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 20 * 1024 * 1024 // 20 MB limit
  },
  fileFilter: (_req, file, cb) => {
    const allowed = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'application/msword',
      'text/plain'
    ];
    if (allowed.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new ValidationError('Invalid file type. Only PDF, DOCX, and TXT are supported.'));
    }
  }
});

let memDocuments: any[] = [
  {
    id: 'aaaa1111-aaaa-aaaa-aaaa-aaaaaaaaaaaa',
    user_id: '00000000-0000-0000-0000-000000000001',
    project_id: '11111111-1111-1111-1111-111111111111',
    investigation_id: '22222222-2222-2222-2222-222222222222',
    file_name: 'Cardiovascular_AI_Validation_Protocol.pdf',
    storage_path: 'uploads/sample-protocol.pdf',
    mime_type: 'application/pdf',
    file_size: 1420500,
    processing_status: 'completed',
    extracted_text_status: 'extracted',
    page_count: 14,
    created_at: new Date().toISOString()
  }
];

// POST /api/v1/documents/upload
router.post('/upload', authenticateToken, upload.single('file'), async (req: Request, res: Response, next: NextFunction) => {
  try {
    const file = req.file;
    if (!file) throw new ValidationError('No document file was uploaded');

    const userId = req.user!.id;
    const { projectId, investigationId } = req.body;
    const checksum = crypto.createHash('sha256').update(file.buffer).digest('hex');
    const storagePath = `${userId}/${projectId || 'global'}/${Date.now()}_${file.originalname}`;

    let createdDoc: any = null;

    if (isSupabaseConfigured()) {
      // 1. Upload to Supabase Storage
      const { error: storageErr } = await supabaseAdmin.storage
        .from('research-documents')
        .upload(storagePath, file.buffer, {
          contentType: file.mimetype,
          upsert: true
        });

      if (storageErr) {
        throw new Error(`Storage upload failed: ${storageErr.message}`);
      }

      // 2. Insert document record
      const { data, error: insertErr } = await supabaseAdmin
        .from('documents')
        .insert({
          user_id: userId,
          project_id: projectId || '11111111-1111-1111-1111-111111111111',
          investigation_id: investigationId || null,
          file_name: file.originalname,
          storage_path: storagePath,
          mime_type: file.mimetype,
          file_size: file.size,
          checksum,
          processing_status: 'uploaded'
        })
        .select()
        .single();

      if (insertErr) throw insertErr;
      createdDoc = data;

      // 3. Process document in background
      documentProcessor.processDocument(createdDoc.id, file.buffer).catch(() => {});
    } else {
      createdDoc = {
        id: crypto.randomUUID(),
        user_id: userId,
        project_id: projectId || '11111111-1111-1111-1111-111111111111',
        investigation_id: investigationId || null,
        file_name: file.originalname,
        storage_path: storagePath,
        mime_type: file.mimetype,
        file_size: file.size,
        checksum,
        processing_status: 'completed',
        extracted_text_status: 'extracted',
        page_count: 5,
        created_at: new Date().toISOString()
      };
      memDocuments.unshift(createdDoc);
    }

    sendSuccess(res, createdDoc, 'Document uploaded successfully', 201);
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents
router.get('/', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const userId = req.user!.id;
    const { projectId, investigationId } = req.query;

    if (isSupabaseConfigured()) {
      let query = supabaseAdmin
        .from('documents')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (projectId) query = query.eq('project_id', projectId);
      if (investigationId) query = query.eq('investigation_id', investigationId);

      const { data, error } = await query;
      if (error) throw error;
      sendSuccess(res, data || [], 'Documents retrieved');
    } else {
      let list = memDocuments.filter(d => d.user_id === userId);
      if (projectId) list = list.filter(d => d.project_id === projectId);
      if (investigationId) list = list.filter(d => d.investigation_id === investigationId);
      sendSuccess(res, list, 'Documents retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/documents/:documentId
router.get('/:documentId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      const { data, error } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .eq('user_id', userId)
        .single();

      if (error || !data) throw new NotFoundError('Document');
      sendSuccess(res, data, 'Document details retrieved');
    } else {
      const doc = memDocuments.find(d => d.id === documentId && d.user_id === userId);
      if (!doc) throw new NotFoundError('Document');
      sendSuccess(res, doc, 'Document details retrieved');
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/documents/:documentId
router.delete('/:documentId', authenticateToken, async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { documentId } = req.params;
    const userId = req.user!.id;

    if (isSupabaseConfigured()) {
      await supabaseAdmin.from('documents').delete().eq('id', documentId).eq('user_id', userId);
    } else {
      memDocuments = memDocuments.filter(d => !(d.id === documentId && d.user_id === userId));
    }

    sendSuccess(res, { id: documentId }, 'Document deleted');
  } catch (err) {
    next(err);
  }
});

export const documentRoutes = router;

