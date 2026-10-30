import React from 'react';
import { Download, FileText, CheckCircle2, Bookmark } from 'lucide-react';
import { ResearchReport } from '../../types/index.js';
import { Button } from '../common/Button.js';
import { api } from '../../services/api.js';

interface ReportPreviewProps {
  report: ResearchReport;
}

export const ReportPreview: React.FC<ReportPreviewProps> = ({ report }) => {
  const content = report.content || {};

  const handleDownload = () => {
    window.open(api.reports.downloadUrl(report.id, 'markdown'), '_blank');
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-8 space-y-6 shadow-xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-slate-200">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-brand-600">
            {report.report_type || 'Comprehensive Synthesis'}
          </span>
          <h2 className="text-xl font-bold text-slate-900 mt-1">{report.title}</h2>
          <p className="text-xs text-slate-500 mt-1">Generated: {new Date(report.created_at).toLocaleDateString()}</p>
        </div>
        <Button onClick={handleDownload} variant="primary" size="sm" icon={<Download size={14} />}>
          Download Markdown (.md)
        </Button>
      </div>

      {/* Executive Summary */}
      <div>
        <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">1. Executive Summary</h3>
        <div className="bg-slate-50 p-4 rounded-lg border border-slate-200 text-xs md:text-sm text-slate-700 leading-relaxed">
          {content.executiveSummary || 'No executive summary provided.'}
        </div>
      </div>

      {/* Key Findings */}
      {content.keyFindings && content.keyFindings.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">2. Key Empirical Findings</h3>
          <ul className="space-y-2">
            {content.keyFindings.map((f: string, i: number) => (
              <li key={i} className="text-xs md:text-sm text-slate-700 flex items-start gap-2.5">
                <CheckCircle2 size={16} className="text-emerald-500 shrink-0 mt-0.5" />
                <span>{f}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Evidence Comparisons */}
      {content.evidenceComparisons && content.evidenceComparisons.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">3. Evidence Synthesis & Comparisons</h3>
          <div className="space-y-2">
            {content.evidenceComparisons.map((c: string, i: number) => (
              <div key={i} className="p-3 bg-slate-50 border border-slate-200 rounded-lg text-xs md:text-sm text-slate-700">
                {c}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Research Gaps */}
      {content.potentialResearchGaps && content.potentialResearchGaps.length > 0 && (
        <div>
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2">4. Identified Research Gaps</h3>
          <div className="bg-amber-50/60 border border-amber-200 p-4 rounded-lg space-y-1.5">
            {content.potentialResearchGaps.map((g: string, i: number) => (
              <p key={i} className="text-xs md:text-sm text-amber-900 leading-relaxed">
                • {g}
              </p>
            ))}
          </div>
        </div>
      )}

      {/* References */}
      {content.references && content.references.length > 0 && (
        <div className="pt-4 border-t border-slate-200">
          <h3 className="text-sm font-bold uppercase tracking-wider text-slate-800 mb-2 flex items-center gap-1.5">
            <Bookmark size={16} className="text-brand-600" /> References
          </h3>
          <ul className="space-y-1.5 pl-4 list-decimal text-xs text-slate-600">
            {content.references.map((r: any, i: number) => (
              <li key={i}>{r.citationText || r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
};

