import React from 'react';
import { useParams, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  Compass,
  Search,
  Layers,
  GitCompare,
  AlertCircle,
  Network,
  Bot,
  FileCheck2,
  RefreshCw
} from 'lucide-react';
import { api } from '../services/api.js';
import { Badge } from '../components/common/Badge.js';
import { Spinner } from '../components/common/Spinner.js';

export const ResearchWorkspacePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const location = useLocation();

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['investigation', id],
    queryFn: () => api.investigations.get(id!),
    enabled: Boolean(id)
  });

  const investigation = data?.data;

  const tabs = [
    { to: `/research/${id}/sources`, label: 'Sources', icon: <Search size={15} /> },
    { to: `/research/${id}/evidence`, label: 'Evidence Browser', icon: <Layers size={15} /> },
    { to: `/research/${id}/comparison`, label: 'Comparisons', icon: <GitCompare size={15} /> },
    { to: `/research/${id}/gaps`, label: 'Research Gaps', icon: <AlertCircle size={15} /> },
    { to: `/research/${id}/map`, label: 'Evidence Map', icon: <Network size={15} /> },
    { to: `/research/${id}/copilot`, label: 'AI Copilot', icon: <Bot size={15} /> },
    { to: `/research/${id}/reports`, label: 'Reports', icon: <FileCheck2 size={15} /> }
  ];

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Workspace Header */}
      <div className="bg-white border border-slate-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                {investigation?.research_scope || 'Investigation'}
              </span>
              <Badge variant={investigation?.status === 'completed' ? 'success' : 'primary'} size="sm">
                {investigation?.status || 'Active'}
              </Badge>
            </div>
            <h1 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
              {investigation?.research_question || 'Research Inquiry Workspace'}
            </h1>
            {investigation?.refined_question && (
              <p className="text-xs text-slate-500 italic">
                AI Refined: {investigation.refined_question}
              </p>
            )}
          </div>
          <button
            onClick={() => refetch()}
            className="self-start md:self-center inline-flex items-center gap-1.5 text-xs text-slate-500 hover:text-slate-800 border border-slate-200 px-3 py-1.5 rounded-lg hover:bg-slate-50 transition-colors shrink-0"
          >
            <RefreshCw size={13} />
            <span>Sync Investigation</span>
          </button>
        </div>

        {/* Progress Bar */}
        {investigation?.progress !== undefined && (
          <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-3">
            <span className="text-xs text-slate-400 font-medium">Investigation Progress:</span>
            <div className="flex-1 bg-slate-100 h-2 rounded-full overflow-hidden">
              <div
                className="bg-brand-600 h-full rounded-full transition-all duration-500"
                style={{ width: `${investigation.progress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-slate-700">{investigation.progress}%</span>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="mt-6 border-t border-slate-100 pt-3 flex items-center gap-1 overflow-x-auto no-scrollbar">
          {tabs.map((tab) => {
            const isActive = location.pathname === tab.to;
            return (
              <NavLink
                key={tab.to}
                to={tab.to}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-slate-900 text-white shadow-xs'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                {tab.icon}
                <span>{tab.label}</span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Nested Sub-Tab Content */}
      <div>
        <Outlet />
      </div>
    </div>
  );
};

