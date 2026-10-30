import { supabaseAdmin, isSupabaseConfigured } from '../config/supabase.js';
import { providerFactory } from '../providers/provider.factory.js';
import { aiService } from '../services/ai.service.js';
import { logger } from '../utils/logger.js';

export class ResearchWorker {
  private isRunning = false;
  private intervalId: NodeJS.Timeout | null = null;

  public start(pollIntervalMs = 5000): void {
    if (this.isRunning) return;
    this.isRunning = true;
    logger.info('Research background worker started.');

    this.intervalId = setInterval(async () => {
      await this.processNextJob().catch(err => {
        logger.error({ error: err.message }, 'Error in worker job polling');
      });
    }, pollIntervalMs);
  }

  public stop(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isRunning = false;
    logger.info('Research background worker stopped.');
  }

  public async processNextJob(): Promise<void> {
    if (!isSupabaseConfigured()) {
      return;
    }

    // Atomic claim of pending job
    const now = new Date().toISOString();
    const { data: jobs, error: claimErr } = await supabaseAdmin
      .from('research_jobs')
      .select('*')
      .eq('status', 'pending')
      .order('created_at', { ascending: true })
      .limit(1);

    if (claimErr || !jobs || jobs.length === 0) {
      return;
    }

    const job = jobs[0];

    // Lock job
    const { error: lockErr } = await supabaseAdmin
      .from('research_jobs')
      .update({
        status: 'running',
        locked_at: now,
        started_at: now,
        attempts: job.attempts + 1
      })
      .eq('id', job.id)
      .eq('status', 'pending');

    if (lockErr) {
      return; // Already claimed by another worker instance
    }

    logger.info({ jobId: job.id, jobType: job.job_type }, 'Processing background research job');

    try {
      let result: any = {};

      switch (job.job_type) {
        case 'discovery': {
          const { queries, providers, maxSources } = job.payload;
          const sources = await providerFactory.searchAll(queries || [], providers || ['crossref', 'openalex'], maxSources || 25);
          
          // Insert sources
          if (sources.length > 0) {
            const inserts = sources.map(s => ({
              investigation_id: job.investigation_id,
              user_id: job.user_id,
              provider: s.provider,
              provider_source_id: s.providerSourceId,
              title: s.title,
              abstract: s.abstract,
              authors: s.authors,
              publication_year: s.publicationYear,
              publication_date: s.publicationDate,
              doi: s.doi,
              url: s.url,
              venue: s.venue,
              publication_type: s.publicationType,
              citation_count: s.citationCount,
              peer_review_status: s.peerReviewStatus,
              metadata: s.metadata,
              source_quality: {
                score: (s.abstract ? 40 : 10) + (s.doi ? 30 : 0) + (s.peerReviewStatus === 'verified' ? 30 : 10),
                verifiedMetadata: Boolean(s.doi),
                hasDoi: Boolean(s.doi),
                hasAbstract: Boolean(s.abstract),
                peerReviewed: s.peerReviewStatus
              }
            }));

            await supabaseAdmin.from('research_sources').upsert(inserts, {
              onConflict: 'investigation_id,provider,provider_source_id',
              ignoreDuplicates: true
            });
          }

          // Update investigation progress
          await supabaseAdmin
            .from('research_investigations')
            .update({ status: 'discovering', progress: 40 })
            .eq('id', job.investigation_id);

          result = { sourcesDiscovered: sources.length };
          break;
        }

        case 'evidence_extraction': {
          const { data: sources } = await supabaseAdmin
            .from('research_sources')
            .select('id, title, abstract, venue')
            .eq('investigation_id', job.investigation_id)
            .limit(15);

          if (sources && sources.length > 0) {
            const aiRes = await aiService.extractEvidence(sources);
            if (aiRes.claims.length > 0) {
              const claimInserts = aiRes.claims.map(c => ({
                investigation_id: job.investigation_id,
                source_id: c.sourceId || sources[0].id,
                user_id: job.user_id,
                claim_text: c.claim,
                finding_text: c.finding,
                supporting_excerpt: c.supportingExcerpt,
                page_number: c.pageNumber,
                section_name: c.sectionName,
                methodology: c.methodology,
                population: c.population,
                sample_size: c.sampleSize,
                dataset_description: c.datasetDescription,
                limitations: c.limitations,
                evidence_category: c.evidenceCategory,
                confidence: c.confidence,
                evidence_type: c.evidenceType
              }));

              await supabaseAdmin.from('evidence_claims').insert(claimInserts);
            }
            result = { claimsExtracted: aiRes.claims.length };
          }

          await supabaseAdmin
            .from('research_investigations')
            .update({ status: 'extracting', progress: 70 })
            .eq('id', job.investigation_id);

          break;
        }

        default:
          result = { message: `Completed processing for job ${job.job_type}` };
          break;
      }

      // Mark job as completed
      await supabaseAdmin
        .from('research_jobs')
        .update({
          status: 'completed',
          result,
          completed_at: new Date().toISOString(),
          error_message: null
        })
        .eq('id', job.id);

      logger.info({ jobId: job.id }, 'Job completed successfully');
    } catch (err: any) {
      logger.error({ jobId: job.id, error: err.message }, 'Job execution failed');
      await supabaseAdmin
        .from('research_jobs')
        .update({
          status: job.attempts >= job.max_attempts ? 'failed' : 'pending',
          error_message: err.message
        })
        .eq('id', job.id);
    }
  }
}

export const researchWorker = new ResearchWorker();

