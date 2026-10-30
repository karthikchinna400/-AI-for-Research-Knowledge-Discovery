import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { AlertCircle, Sparkles, HelpCircle, ArrowRight, ShieldAlert } from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { Spinner } from '../components/common/Spinner.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const GapsPage: React.FC = () => {
  const { id: investigationId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['gaps', investigationId],
    queryFn: () => api.gaps.list(investigationId!),
    enabled: Boolean(investigationId)
  });

  const gapMutation = useMutation({
    mutationFn: () => api.gaps.analyze(investigationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['gaps', investigationId] });
    }
  });

  const gaps = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div>
          <h3 className="text-sm font-bold text-slate-900">Research Gap Identification</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            Detect unexplored areas, dataset limitations, and missing clinical validations.
          </p>
        </div>
        <Button
          onClick={() => gapMutation.mutate()}
          loading={gapMutation.isPending}
          size="sm"
          icon={<Sparkles size={14} />}
        >
          Analyze Literature Gaps
        </Button>
      </div>

      {/* Uncertainty Advisory Notice */}
      <div className="p-3 bg-amber-50/70 border border-amber-200 rounded-xl text-xs text-amber-900 flex items-start gap-2.5">
        <ShieldAlert size={16} className="text-amber-600 shrink-0 mt-0.5" />
        <span>
          <strong>Scientific Epistemic Notice: </strong> Gaps identified represent potential absences within the collection of sources reviewed in this workspace, rather than an exhaustive claim across all universal human literature.
        </span>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : gaps.length === 0 ? (
        <EmptyState
          title="No Research Gaps Identified"
          description="Analyze the collected evidence to detect underexplored demographics, missing comparisons, and emerging research questions."
          actionLabel="Identify Research Gaps"
          onAction={() => gapMutation.mutate()}
        />
      ) : (
        <div className="space-y-5">
          {gaps.map((gap) => (
            <div
              key={gap.id}
              className="bg-white border border-slate-200 rounded-xl p-6 shadow-2xs space-y-4"
            >
              <div className="flex items-center justify-between">
                <Badge variant="warning">
                  POTENTIAL GAP IN REVIEWED SOURCES
                </Badge>
                <span className="text-xs text-slate-400 font-medium">
                  Confidence: {Math.round((gap.confidence || 0.8) * 100)}%
                </span>
              </div>

              <h4 className="text-base font-bold text-slate-900">{gap.title}</h4>
              <p className="text-xs md:text-sm text-slate-700 leading-relaxed">{gap.description}</p>

              {gap.rationale && (
                <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-lg text-xs text-slate-600">
                  <span className="font-semibold text-slate-900 block mb-0.5">Underlying Rationale:</span>
                  {gap.rationale}
                </div>
              )}

              {gap.suggested_research_question && (
                <div className="bg-brand-50/50 border border-brand-100 p-3.5 rounded-lg text-xs text-brand-900">
                  <span className="font-bold text-brand-700 uppercase tracking-wider block mb-1">
                    Suggested Future Research Question:
                  </span>
                  <p className="font-semibold text-slate-800">{gap.suggested_research_question}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

