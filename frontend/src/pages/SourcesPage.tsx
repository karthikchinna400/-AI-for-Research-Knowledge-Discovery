import React, { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Search, RefreshCw, Filter, Sparkles } from 'lucide-react';
import { api } from '../services/api.js';
import { SourceCard } from '../components/sources/SourceCard.js';
import { Button } from '../components/common/Button.js';
import { Spinner } from '../components/common/Spinner.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const SourcesPage: React.FC = () => {
  const { id: investigationId } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [providerFilter, setProviderFilter] = useState<string>('all');
  const [searchFilter, setSearchFilter] = useState<string>('');

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['sources', investigationId],
    queryFn: () => api.discovery.getSources(investigationId!),
    enabled: Boolean(investigationId)
  });

  const discoverMutation = useMutation({
    mutationFn: () => api.discovery.discover(investigationId!, { maxSources: 25 }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['sources', investigationId] });
    }
  });

  const sources = data?.data || [];

  const filtered = sources.filter((s) => {
    const matchProvider = providerFilter === 'all' || s.provider === providerFilter;
    const matchSearch =
      !searchFilter ||
      s.title.toLowerCase().includes(searchFilter.toLowerCase()) ||
      (s.abstract && s.abstract.toLowerCase().includes(searchFilter.toLowerCase()));
    return matchProvider && matchSearch;
  });

  return (
    <div className="space-y-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-xl border border-slate-200">
        <div className="flex items-center gap-3 flex-1 max-w-md">
          <div className="relative w-full">
            <Search size={15} className="absolute left-3 top-2.5 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Filter discovered publications..."
              value={searchFilter}
              onChange={(e) => setSearchFilter(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500"
            />
          </div>
          <select
            value={providerFilter}
            onChange={(e) => setProviderFilter(e.target.value)}
            className="bg-slate-50 border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs text-slate-700 focus:outline-none"
          >
            <option value="all">All Providers</option>
            <option value="crossref">Crossref</option>
            <option value="openalex">OpenAlex</option>
            <option value="semantic-scholar">Semantic Scholar</option>
            <option value="tavily">Tavily Web</option>
          </select>
        </div>

        <div className="flex items-center gap-2">
          <Button
            onClick={() => discoverMutation.mutate()}
            loading={discoverMutation.isPending}
            size="sm"
            icon={<Sparkles size={14} />}
          >
            Dispatch Deep Discovery
          </Button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <EmptyState
          title="No Sources Found"
          description="Initiate discovery to query academic databases and retrieve verified scientific papers."
          actionLabel="Discover Sources"
          onAction={() => discoverMutation.mutate()}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {filtered.map((source) => (
            <SourceCard key={source.id} source={source} />
          ))}
        </div>
      )}
    </div>
  );
};

