import React from 'react';
import { ExternalLink, BookOpen, CheckCircle, HelpCircle } from 'lucide-react';
import { ResearchSource } from '../../types/index.js';
import { Badge } from '../common/Badge.js';

interface SourceCardProps {
  source: ResearchSource;
}

export const SourceCard: React.FC<SourceCardProps> = ({ source }) => {
  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 hover:shadow-xs transition-all flex flex-col justify-between">
      <div>
        {/* Header Badges */}
        <div className="flex items-center justify-between gap-2 mb-2.5">
          <div className="flex items-center gap-1.5 flex-wrap">
            <Badge variant="primary" size="sm">
              {source.provider.toUpperCase()}
            </Badge>
            {source.publication_year && (
              <span className="text-xs text-slate-500 font-medium">
                {source.publication_year}
              </span>
            )}
            {source.peer_review_status === 'verified' && (
              <Badge variant="success" size="sm">
                <CheckCircle size={10} /> Peer-Reviewed
              </Badge>
            )}
            {source.peer_review_status === 'preprint' && (
              <Badge variant="warning" size="sm">
                Preprint
              </Badge>
            )}
            {source.peer_review_status === 'unknown' && (
              <Badge variant="neutral" size="sm">
                <HelpCircle size={10} /> Status Unknown
              </Badge>
            )}
          </div>
          {source.citation_count !== undefined && source.citation_count > 0 && (
            <span className="text-xs text-slate-500 font-mono bg-slate-50 px-2 py-0.5 rounded border border-slate-200">
              {source.citation_count} citations
            </span>
          )}
        </div>

        {/* Title */}
        <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2 mb-1.5">
          {source.title}
        </h4>

        {/* Authors & Venue */}
        <p className="text-xs text-slate-500 mb-2 truncate">
          {source.authors?.length > 0 ? source.authors.slice(0, 3).join(', ') : 'Authors not listed'}
          {source.venue ? ` • ${source.venue}` : ''}
        </p>

        {/* Abstract */}
        {source.abstract ? (
          <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed mb-3 bg-slate-50/50 p-2.5 rounded-lg border border-slate-100">
            {source.abstract}
          </p>
        ) : (
          <p className="text-xs italic text-slate-400 mb-3">No abstract provided by discovery provider.</p>
        )}
      </div>

      {/* Footer link */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        {source.doi ? (
          <span className="font-mono text-slate-500 text-[11px] truncate max-w-[200px]">
            DOI: {source.doi}
          </span>
        ) : (
          <span className="text-slate-400 text-[11px]">No DOI</span>
        )}

        {source.url && (
          <a
            href={source.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-brand-600 hover:text-brand-700 font-medium"
          >
            <span>View Publication</span>
            <ExternalLink size={12} />
          </a>
        )}
      </div>
    </div>
  );
};

