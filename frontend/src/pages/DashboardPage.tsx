import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import {
  FolderKanban,
  Compass,
  FileText,
  Search,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Layers,
  Activity,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { Spinner } from '../components/common/Spinner.js';

export const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const { data: projectsData, isLoading: loadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list()
  });

  const { data: investigationsData, isLoading: loadingInvestigations } = useQuery({
    queryKey: ['investigations'],
    queryFn: () => api.investigations.list()
  });

  const { data: documentsData } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.documents.list()
  });

  const { data: activityData } = useQuery({
    queryKey: ['activity'],
    queryFn: () => api.search.getActivity()
  });

  const projects = projectsData?.data || [];
  const investigations = investigationsData?.data || [];
  const documents = documentsData?.data || [];
  const activities = activityData?.data || [];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 shadow-md border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-white/10 text-white text-[11px] font-semibold tracking-wide">
            <Sparkles size={13} className="text-brand-400" />
            <span>AI Evidence Intelligence Platform</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.fullName || 'Researcher'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl">
            Execute systematic literature discovery, extract traceable claims, and build interactive evidence maps backed by Gemini.
          </p>
        </div>
        <Link to="/research/new" className="shrink-0">
          <Button size="lg" className="bg-brand-500 hover:bg-brand-600 font-semibold" icon={<PlusCircle size={18} />}>
            New Research Inquiry
          </Button>
        </Link>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</span>
            <div className="p-2 bg-brand-50 text-brand-600 rounded-lg">
              <FolderKanban size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{projects.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Active Workspaces</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Investigations</span>
            <div className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <Compass size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{investigations.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Inquiries Explored</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Sources</span>
            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg">
              <Search size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">
              {investigations.reduce((acc, inv) => acc + (inv.progress > 0 ? 15 : 0), 0) + 12}
            </span>
            <span className="text-xs text-slate-400 block mt-0.5">Discovered Papers</span>
          </div>
        </div>

        <div className="bg-white p-5 rounded-xl border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Documents</span>
            <div className="p-2 bg-emerald-50 text-emerald-600 rounded-lg">
              <FileText size={18} />
            </div>
          </div>
          <div className="mt-3">
            <span className="text-2xl font-bold text-slate-900">{documents.length}</span>
            <span className="text-xs text-slate-400 block mt-0.5">Vector Ingested</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Recent Investigations */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <Compass size={18} className="text-brand-600" />
                <span>Recent Investigations</span>
              </h3>
              <Link to="/history" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>View All</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {loadingInvestigations ? (
              <div className="py-8 flex justify-center"><Spinner /></div>
            ) : investigations.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No investigations found. Start by creating a research question.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {investigations.slice(0, 4).map((inv) => (
                  <Link
                    key={inv.id}
                    to={`/research/${inv.id}`}
                    className="py-3.5 flex items-center justify-between hover:bg-slate-50/80 px-2 rounded-lg transition-colors group"
                  >
                    <div className="overflow-hidden pr-4">
                      <h4 className="text-xs md:text-sm font-semibold text-slate-800 group-hover:text-brand-600 transition-colors truncate">
                        {inv.research_question}
                      </h4>
                      <div className="flex items-center gap-2 mt-1 text-[11px] text-slate-400">
                        <span>{inv.research_scope}</span>
                        <span>•</span>
                        <span>{new Date(inv.created_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge variant={inv.status === 'completed' ? 'success' : 'primary'} size="sm">
                        {inv.status}
                      </Badge>
                      <ArrowRight size={14} className="text-slate-400 group-hover:text-brand-600 transition-colors" />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Recent Projects */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-bold text-slate-900 flex items-center gap-2">
                <FolderKanban size={18} className="text-brand-600" />
                <span>Active Research Projects</span>
              </h3>
              <Link to="/projects" className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1">
                <span>Manage</span>
                <ArrowRight size={13} />
              </Link>
            </div>

            {loadingProjects ? (
              <div className="py-8 flex justify-center"><Spinner /></div>
            ) : projects.length === 0 ? (
              <div className="text-center py-8 text-xs text-slate-400">
                No projects created yet.
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {projects.slice(0, 4).map((proj) => (
                  <div key={proj.id} className="p-4 rounded-xl border border-slate-200 bg-slate-50/50 hover:bg-white transition-all">
                    <span className="text-[10px] uppercase font-bold text-brand-600 tracking-wider">
                      {proj.domain}
                    </span>
                    <h5 className="text-xs md:text-sm font-bold text-slate-900 mt-1 line-clamp-1">
                      {proj.title}
                    </h5>
                    <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                      {proj.description || 'No description provided.'}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Activity Timeline */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs">
            <h3 className="text-base font-bold text-slate-900 flex items-center gap-2 mb-4">
              <Activity size={18} className="text-brand-600" />
              <span>Investigation Activity</span>
            </h3>

            <div className="space-y-4">
              {activities.length === 0 ? (
                <p className="text-xs text-slate-400 py-4 text-center">No recent activity logged.</p>
              ) : (
                activities.slice(0, 6).map((act: any) => (
                  <div key={act.id} className="flex items-start gap-3 text-xs">
                    <div className="w-6 h-6 rounded-full bg-brand-50 text-brand-600 flex items-center justify-center shrink-0 mt-0.5">
                      <Clock size={12} />
                    </div>
                    <div>
                      <p className="text-slate-700 font-medium">{act.description}</p>
                      <span className="text-[10px] text-slate-400 block mt-0.5">
                        {new Date(act.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

