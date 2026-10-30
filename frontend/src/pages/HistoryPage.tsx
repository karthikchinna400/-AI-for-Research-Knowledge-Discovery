import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { History, Compass, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { Badge } from '../components/common/Badge.js';
import { Spinner } from '../components/common/Spinner.js';

export const HistoryPage: React.FC = () => {
  const { data, isLoading } = useQuery({
    queryKey: ['history'],
    queryFn: () => api.search.getHistory()
  });

  const historyItems = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Investigation History</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Audit trail and archival log of previous research inquiries and discovery runs.
        </p>
      </div>

      {isLoading ? (
        <div className="py-20 flex justify-center"><Spinner /></div>
      ) : historyItems.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-slate-200">
          <History size={32} className="mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No History Logged</h4>
          <p className="text-xs text-slate-500 mt-1">Start investigations to build your research log.</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 shadow-2xs">
          {historyItems.map((item: any) => (
            <Link
              key={item.id}
              to={`/research/${item.id}`}
              className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
            >
              <div className="flex items-center gap-3 overflow-hidden pr-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center shrink-0">
                  <Compass size={16} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-brand-600 transition-colors truncate">
                    {item.research_question}
                  </h4>
                  <span className="text-[11px] text-slate-400 block mt-0.5">
                    Logged: {new Date(item.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Badge variant={item.status === 'completed' ? 'success' : 'primary'} size="sm">
                  {item.status}
                </Badge>
                <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-600" />
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
};

