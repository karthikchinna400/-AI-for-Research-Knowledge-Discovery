import pdfParse from 'pdf-parse';
import mammoth from 'mammoth';
import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { embeddingService } from './embedding.service.js';
import { logger } from '../utils/logger.js';

export class DocumentProcessorService {
  public async extractText(buffer: Buffer, mimeType: string): Promise<{ text: string; pageCount: number; ocrRequired: boolean }> {
    try {
      if (mimeType === 'application/pdf') {
        const data = await pdfParse(buffer);
        const text = data.text?.trim() || '';
        const ocrRequired = text.length < 50 && data.numpages > 0;
        return {
          text,
          pageCount: data.numpages || 1,
          ocrRequired
        };
      } else if (
        mimeType === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' ||
        mimeType === 'application/msword'
      ) {
        const result = await mammoth.extractRawText({ buffer });
        return {
          text: result.value?.trim() || '',
          pageCount: 1,
          ocrRequired: false
        };
      } else if (mimeType === 'text/plain') {
        return {
          text: buffer.toString('utf-8').trim(),
          pageCount: 1,
          ocrRequired: false
        };
      }

      throw new Error(`Unsupported document MIME type: ${mimeType}`);
    } catch (err: any) {
      logger.error({ error: err.message, mimeType }, 'Document text extraction error');
      throw err;
    }
  }

  public async processDocument(documentId: string, fileBuffer: Buffer): Promise<void> {
    if (!isSupabaseConfigured()) {
      logger.info('Supabase not configured. Skipping persistent chunk insertion.');
      return;
    }

    try {
      // Fetch document record
      const { data: doc, error: fetchErr } = await supabaseAdmin
        .from('documents')
        .select('*')
        .eq('id', documentId)
        .single();

      if (fetchErr || !doc) {
        throw new Error(`Document not found: ${documentId}`);
      }

      // Update status to processing
      await supabaseAdmin
        .from('documents')
        .update({ processing_status: 'processing' })
        .eq('id', documentId);

      // Extract text
      const { text, pageCount, ocrRequired } = await this.extractText(fileBuffer, doc.mime_type);

      if (ocrRequired) {
        await supabaseAdmin
          .from('documents')
          .update({
            processing_status: 'partially_completed',
            extracted_text_status: 'ocr_required',
            page_count: pageCount,
            error_message: 'Document contains scanned images. OCR required to extract text.'
          })
          .eq('id', documentId);
        return;
      }

      // Chunk text
      const chunks = embeddingService.chunkText(text);

      // Generate embeddings and insert chunks
      const chunkInserts = [];
      for (let i = 0; i < chunks.length; i++) {
        const chunkContent = chunks[i];
        const vector = await embeddingService.generateEmbedding(chunkContent);

        chunkInserts.push({
          document_id: doc.id,
          user_id: doc.user_id,
          investigation_id: doc.investigation_id,
          chunk_index: i,
          content: chunkContent,
          page_number: Math.floor((i / chunks.length) * pageCount) + 1,
          token_count: Math.round(chunkContent.length / 4),
          embedding: vector
        });
      }

      if (chunkInserts.length > 0) {
        const { error: insertErr } = await supabaseAdmin
          .from('document_chunks')
          .insert(chunkInserts);

        if (insertErr) {
          throw insertErr;
        }
      }

      // Mark completed
      await supabaseAdmin
        .from('documents')
        .update({
          processing_status: 'completed',
          extracted_text_status: 'extracted',
          page_count: pageCount,
          error_message: null
        })
        .eq('id', documentId);

      logger.info({ documentId, chunksCount: chunks.length }, 'Document processing completed successfully');
    } catch (err: any) {
      logger.error({ err: err.message, documentId }, 'Document processing failed');
      if (isSupabaseConfigured()) {
        await supabaseAdmin
          .from('documents')
          .update({
            processing_status: 'failed',
            error_message: err.message
          })
          .eq('id', documentId);
      }
      throw err;
    }
  }
}

export const documentProcessor = new DocumentProcessorService();

