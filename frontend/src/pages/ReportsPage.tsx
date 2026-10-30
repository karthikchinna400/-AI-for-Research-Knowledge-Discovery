import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileCheck2, Sparkles, Download, Eye, FileText } from 'lucide-react';
import { api } from '../services/api.js';
import { ReportPreview } from '../components/reports/ReportPreview.js';
import { Button } from '../components/common/Button.js';
import { Spinner } from '../components/common/Spinner.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const ReportsPage: React.FC = () => {
  const { id: investigationId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedReport, setSelectedReport] = useState<any>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['reports', investigationId],
    queryFn: () => api.reports.list(investigationId!),
    enabled: Boolean(investigationId)
  });

  const generateMutation = useMutation({
    mutationFn: () => api.reports.generate(investigationId!, { format: 'markdown' }),
    onSuccess: (res) => {
      queryClient.invalidateQueries({ queryKey: ['reports', investigationId] });
      setSelectedReport(res.data);
    }
  });

  const reports = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Research Intelligence Reports</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Compile systematic literature summaries, evidence tables, gaps, and bibliographies.
          </p>
        </div>
        <Button
          onClick={() => generateMutation.mutate()}
          loading={generateMutation.isPending}
          size="sm"
          icon={<Sparkles size={14} />}
        >
          Generate Comprehensive Report
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : reports.length === 0 ? (
        <EmptyState
          title="No Reports Generated Yet"
          description="Generate a professional research synthesis document with executive summary, empirical findings, and full bibliographic citations."
          actionLabel="Generate Research Report"
          onAction={() => generateMutation.mutate()}
        />
      ) : (
        <div className="space-y-6">
          {selectedReport ? (
            <div>
              <div className="mb-4">
                <Button variant="outline" size="sm" onClick={() => setSelectedReport(null)}>
                  ← Back to Reports List
                </Button>
              </div>
              <ReportPreview report={selectedReport} />
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {reports.map((rep) => (
                <div
                  key={rep.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 hover:shadow-xs transition-all flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                        {rep.format.toUpperCase()}
                      </span>
                      <span className="text-xs text-slate-400">
                        {new Date(rep.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900 line-clamp-1">{rep.title}</h4>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {rep.content?.executiveSummary || 'Evidence intelligence synthesis report.'}
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                    <Button
                      onClick={() => setSelectedReport(rep)}
                      variant="outline"
                      size="sm"
                      icon={<Eye size={13} />}
                    >
                      Preview Report
                    </Button>
                    <a
                      href={api.reports.downloadUrl(rep.id, 'markdown')}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1"
                    >
                      <Download size={13} />
                      <span>Download</span>
                    </a>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

