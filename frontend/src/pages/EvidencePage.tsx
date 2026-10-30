import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Layers, Sparkles, Filter, CheckCircle2 } from 'lucide-react';
import { api } from '../services/api.js';
import { EvidenceCard } from '../components/evidence/EvidenceCard.js';
import { Button } from '../components/common/Button.js';
import { Spinner } from '../components/common/Spinner.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const EvidencePage: React.FC = () => {
  const { id: investigationId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  const { data, isLoading } = useQuery({
    queryKey: ['evidence', investigationId],
    queryFn: () => api.evidence.list(investigationId!),
    enabled: Boolean(investigationId)
  });

  const extractMutation = useMutation({
    mutationFn: () => api.evidence.extract(investigationId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['evidence', investigationId] });
    }
  });

  const claims = data?.data || [];

  const filtered = claims.filter((c) => {
    if (categoryFilter === 'all') return true;
    return c.evidence_category === categoryFilter;
  });

  return (
    <div className="space-y-6">
      {/* Action Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Filter Category:</span>
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Categories ({claims.length})</option>
            <option value="supporting">Supporting Evidence</option>
            <option value="contradictory">Contradictory Evidence</option>
            <option value="methodological">Methodological Observations</option>
            <option value="limitation">Reported Limitations</option>
            <option value="recommendation">Recommendations</option>
            <option value="trend">Emerging Trends</option>
          </select>
        </div>

        <Button
          onClick={() => extractMutation.mutate()}
          loading={extractMutation.isPending}
          size="sm"
          icon={<Sparkles size={14} />}
        >
          Extract Structured Claims
        </Button>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Evidence Claims Extracted"
          description="Extract empirical findings, methodologies, sample sizes, and limitations directly from discovered sources."
          actionLabel="Extract Evidence Claims"
          onAction={() => extractMutation.mutate()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((claim) => (
            <EvidenceCard key={claim.id} claim={claim} />
          ))}
        </div>
      )}
    </div>
  );
};

