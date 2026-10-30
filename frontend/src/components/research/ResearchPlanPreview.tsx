import React from 'react';
import { Sparkles, CheckCircle2, Search, Target, AlertTriangle } from 'lucide-react';

interface ResearchPlanPreviewProps {
  analysis: {
    originalQuestion: string;
    refinedQuestion: string;
    primaryDomain: string;
    secondaryDomains?: string[];
    objectives?: string[];
    keywords?: string[];
    suggestedSearchQueries?: string[];
    scopeConcerns?: string[];
  };
}

export const ResearchPlanPreview: React.FC<ResearchPlanPreviewProps> = ({ analysis }) => {
  return (
    <div className="space-y-5 bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
      <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
        <Sparkles className="text-brand-600" size={20} />
        <h4 className="text-base font-semibold text-slate-900">AI-Synthesized Research Plan</h4>
      </div>

      {/* Refined Research Question */}
      <div className="bg-brand-50/50 border border-brand-100 p-4 rounded-lg">
        <span className="text-[10px] font-bold uppercase text-brand-600 tracking-wider">Refined Question</span>
        <p className="text-sm font-semibold text-slate-800 mt-1">{analysis.refinedQuestion}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Objectives */}
        <div className="border border-slate-200 p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <Target size={16} className="text-brand-500" />
            <span className="text-xs font-semibold text-slate-700">Investigation Objectives</span>
          </div>
          <ul className="space-y-1.5">
            {(analysis.objectives || []).map((obj, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                <CheckCircle2 size={14} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{obj}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Suggested Queries */}
        <div className="border border-slate-200 p-4 rounded-lg">
          <div className="flex items-center gap-1.5 mb-2">
            <Search size={16} className="text-brand-500" />
            <span className="text-xs font-semibold text-slate-700">Generated Discovery Queries</span>
          </div>
          <div className="space-y-1.5">
            {(analysis.suggestedSearchQueries || []).map((q, i) => (
              <div key={i} className="text-xs bg-slate-50 border border-slate-200 px-2.5 py-1.5 rounded text-slate-700 font-mono">
                {q}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Scope Considerations */}
      {analysis.scopeConcerns && analysis.scopeConcerns.length > 0 && (
        <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg flex items-start gap-2.5">
          <AlertTriangle size={16} className="text-amber-600 shrink-0 mt-0.5" />
          <div className="text-xs text-amber-800">
            <span className="font-semibold">Scope & Boundary Advisory: </span>
            {analysis.scopeConcerns.join(' ')}
          </div>
        </div>
      )}
    </div>
  );
};

