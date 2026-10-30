import React, { useState } from 'react';
import { ChevronDown, ChevronUp, Quote, ShieldAlert, CheckCircle2 } from 'lucide-react';
import { EvidenceClaim } from '../../types/index.js';
import { Badge } from '../common/Badge.js';

interface EvidenceCardProps {
  claim: EvidenceClaim;
}

export const EvidenceCard: React.FC<EvidenceCardProps> = ({ claim }) => {
  const [expanded, setExpanded] = useState(false);

  const categoryVariants: Record<string, 'primary' | 'success' | 'warning' | 'danger' | 'neutral' | 'purple'> = {
    supporting: 'success',
    contradictory: 'danger',
    neutral: 'neutral',
    methodological: 'primary',
    limitation: 'warning',
    recommendation: 'purple',
    trend: 'primary',
    uncertain: 'warning'
  };

  const confidencePct = Math.round((claim.confidence || 0.85) * 100);

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 hover:border-slate-300 transition-all shadow-2xs">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="flex items-center gap-2">
          <Badge variant={categoryVariants[claim.evidence_category] || 'neutral'} size="sm">
            {claim.evidence_category.toUpperCase()}
          </Badge>
          <span className="text-[11px] font-mono text-slate-500 uppercase">
            {claim.evidence_type}
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-500">
          <span>Confidence:</span>
          <span className="font-semibold text-slate-800">{confidencePct}%</span>
          <div className="w-12 h-1.5 bg-slate-100 rounded-full overflow-hidden">
            <div
              className={`h-full ${confidencePct >= 80 ? 'bg-emerald-500' : 'bg-amber-500'}`}
              style={{ width: `${confidencePct}%` }}
            />
          </div>
        </div>
      </div>

      {/* Claim Text */}
      <h4 className="text-sm font-semibold text-slate-900 mb-2 leading-relaxed">
        {claim.claim_text}
      </h4>

      {/* Primary Finding */}
      <div className="bg-slate-50 border border-slate-100 rounded-lg p-3 text-xs text-slate-700 leading-relaxed mb-3">
        <span className="font-semibold text-slate-900 block mb-0.5">Empirical Finding:</span>
        {claim.finding_text}
      </div>

      {/* Supporting Excerpt */}
      {claim.supporting_excerpt && (
        <div className="flex items-start gap-2 text-xs italic text-slate-600 bg-brand-50/30 border border-brand-100/60 p-2.5 rounded-lg mb-3">
          <Quote size={14} className="text-brand-400 shrink-0 mt-0.5" />
          <span>"{claim.supporting_excerpt}"</span>
        </div>
      )}

      {/* Collapsible Details */}
      {expanded && (
        <div className="pt-3 border-t border-slate-100 space-y-2 text-xs text-slate-600 animate-in fade-in duration-150">
          {claim.methodology && (
            <p><span className="font-medium text-slate-800">Methodology:</span> {claim.methodology}</p>
          )}
          {claim.sample_size && (
            <p><span className="font-medium text-slate-800">Sample Size:</span> {claim.sample_size}</p>
          )}
          {claim.population && (
            <p><span className="font-medium text-slate-800">Cohort Population:</span> {claim.population}</p>
          )}
          {claim.limitations && claim.limitations.length > 0 && (
            <div>
              <span className="font-medium text-slate-800 block mb-1">Reported Limitations:</span>
              <ul className="list-disc pl-4 space-y-0.5 text-slate-500">
                {claim.limitations.map((lim, i) => (
                  <li key={i}>{lim}</li>
                ))}
              </ul>
            </div>
          )}
          {claim.page_number && (
            <p className="text-[11px] text-slate-400">Section: {claim.section_name || 'General'} • Page: {claim.page_number}</p>
          )}
        </div>
      )}

      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full mt-2 pt-2 border-t border-slate-100 flex items-center justify-center gap-1 text-xs text-brand-600 font-medium hover:text-brand-700"
      >
        <span>{expanded ? 'Show Less Details' : 'View Methodology & Limitations'}</span>
        {expanded ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
      </button>
    </div>
  );
};

