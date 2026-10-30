import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { GitCompare, Sparkles, CheckCircle, AlertTriangle, Scale } from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { Spinner } from '../components/common/Spinner.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const ComparisonPage: React.FC = () => {
  const { id: investigationId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['comparisons', investigationId],
    queryFn: () => api.comparison.list(investigationId!),
    enabled: Boolean(investigationId)
  });

  const compareMutation = useMutation({
    mutationFn: () => api.comparison.compare(investigationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['comparisons', investigationId] });
    }
  });

  const comparisons = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Evidence Comparison & Contradiction Analysis</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Cross-evaluate empirical findings, detect conflicts, and analyze cohort variances.
          </p>
        </div>
        <Button
          onClick={() => compareMutation.mutate()}
          loading={compareMutation.isPending}
          size="sm"
          icon={<Sparkles size={14} />}
        >
          Run Comparative Synthesis
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : comparisons.length === 0 ? (
        <EmptyState
          title="No Comparisons Synthesized Yet"
          description="Synthesize evidence across multiple studies to identify direct agreements, contradictions, and methodological divergences."
          actionLabel="Run Evidence Comparison"
          onAction={() => compareMutation.mutate()}
        />
      ) : (
        <div className="space-y-4">
          {comparisons.map((comp) => {
            const isContradiction = comp.comparison_type === 'contradiction';
            const isAgreement = comp.comparison_type === 'agreement';

            return (
              <div
                key={comp.id}
                className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Badge variant={isContradiction ? 'danger' : isAgreement ? 'success' : 'primary'}>
                      {comp.comparison_type.toUpperCase().replace('_', ' ')}
                    </Badge>
                    <span className="text-xs text-slate-400">
                      Confidence: {Math.round((comp.confidence || 0.85) * 100)}%
                    </span>
                  </div>
                </div>

                <h4 className="text-sm md:text-base font-bold text-slate-900">
                  {comp.summary}
                </h4>

                {comp.explanation && (
                  <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg text-xs md:text-sm text-slate-700 leading-relaxed">
                    <span className="font-semibold text-slate-900 block mb-1">Synthesis & Rationale:</span>
                    {comp.explanation}
                  </div>
                )}

                {comp.methodological_differences && comp.methodological_differences.length > 0 && (
                  <div className="pt-2">
                    <span className="text-xs font-semibold text-slate-700 block mb-1.5 flex items-center gap-1.5">
                      <Scale size={14} className="text-brand-600" /> Methodological & Scope Differences:
                    </span>
                    <ul className="list-disc pl-5 space-y-1 text-xs text-slate-600">
                      {comp.methodological_differences.map((diff: string, i: number) => (
                        <li key={i}>{diff}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

