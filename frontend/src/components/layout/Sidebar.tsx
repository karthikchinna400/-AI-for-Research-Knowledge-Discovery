import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Compass,
  PlusCircle,
  FolderKanban,
  FileText,
  History,
  Settings,
  ShieldCheck,
  LogOut,
  Sparkles
} from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';

interface SidebarProps {
  onCloseMobile?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ onCloseMobile }) => {
  const { user, signOut } = useAuth();

  const navItems = [
    { to: '/dashboard', label: 'Dashboard', icon: <Compass size={18} /> },
    { to: '/research/new', label: 'New Research', icon: <PlusCircle size={18} />, highlight: true },
    { to: '/projects', label: 'Projects', icon: <FolderKanban size={18} /> },
    { to: '/documents', label: 'Documents', icon: <FileText size={18} /> },
    { to: '/history', label: 'Investigation History', icon: <History size={18} /> },
    { to: '/settings', label: 'Settings', icon: <Settings size={18} /> }
  ];

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col justify-between h-screen text-slate-300">
      <div>
        {/* Brand Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-brand-600 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Sparkles size={18} />
            </div>
            <div>
              <span className="text-sm font-bold text-white tracking-tight">AI RESEARCH</span>
              <span className="block text-[10px] uppercase font-semibold text-brand-400 tracking-wider">Copilot Engine</span>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-1">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              onClick={onCloseMobile}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-brand-600 text-white shadow-xs'
                    : item.highlight
                    ? 'text-brand-300 hover:bg-slate-800/80 hover:text-white border border-brand-500/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                }`
              }
            >
              {item.icon}
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>

      {/* User profile & Logout footer */}
      <div className="p-3 border-t border-slate-800">
        <div className="flex items-center justify-between p-2 rounded-lg bg-slate-800/60 mb-2">
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-8 h-8 rounded-full bg-slate-700 border border-slate-600 flex items-center justify-center text-xs font-semibold text-brand-300 shrink-0">
              {user?.fullName?.charAt(0) || 'R'}
            </div>
            <div className="overflow-hidden">
              <p className="text-xs font-semibold text-slate-200 truncate">{user?.fullName || 'Researcher'}</p>
              <p className="text-[10px] text-slate-400 truncate flex items-center gap-1">
                <ShieldCheck size={10} className="text-emerald-400" /> Verified
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut()}
            title="Log out"
            className="p-1.5 text-slate-400 hover:text-rose-400 rounded-md hover:bg-slate-800 transition-colors"
          >
            <LogOut size={16} />
          </button>
        </div>
        <p className="text-[10px] text-slate-500 text-center">Version 1.0.0 • Supabase RLS Active</p>
      </div>
    </aside>
  );
};

