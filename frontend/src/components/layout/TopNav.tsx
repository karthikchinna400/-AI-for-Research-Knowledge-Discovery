import React, { useState } from 'react';
import { Search, Bell, Menu, ExternalLink } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext.js';
import { api } from '../../services/api.js';
import { Link } from 'react-router-dom';

interface TopNavProps {
  onToggleMobileMenu?: () => void;
}

export const TopNav: React.FC<TopNavProps> = ({ onToggleMobileMenu }) => {
  const { user } = useAuth();
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setIsSearching(true);
    try {
      const res = await api.search.global(searchQuery);
      setSearchResults(res.data);
    } catch {
      setSearchResults(null);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <header className="h-16 bg-white border-b border-slate-200/80 px-6 flex items-center justify-between sticky top-0 z-30 shadow-2xs">
      <div className="flex items-center gap-4">
        {onToggleMobileMenu && (
          <button
            onClick={onToggleMobileMenu}
            className="md:hidden p-1.5 text-slate-500 hover:text-slate-700 rounded-lg"
          >
            <Menu size={20} />
          </button>
        )}

        {/* Global Search Bar */}
        <div className="relative">
          <form onSubmit={handleSearch} className="relative flex items-center w-72 md:w-96">
            <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Search projects, sources, claims..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (!e.target.value) setSearchResults(null);
              }}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-800 placeholder:text-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-brand-500/20 focus:border-brand-500 transition-all"
            />
          </form>

          {/* Search Dropdown Results */}
          {searchResults && (
            <div className="absolute top-full left-0 mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 p-3 z-50 max-h-80 overflow-y-auto">
              <div className="flex items-center justify-between pb-2 border-b border-slate-100">
                <span className="text-xs font-semibold text-slate-700">Search Results</span>
                <button
                  onClick={() => setSearchResults(null)}
                  className="text-[10px] text-slate-400 hover:text-slate-600"
                >
                  Close
                </button>
              </div>

              {searchResults.sources?.length > 0 && (
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Sources</span>
                  {searchResults.sources.map((s: any) => (
                    <div key={s.id} className="p-1.5 hover:bg-slate-50 rounded text-xs text-slate-700 truncate">
                      {s.title}
                    </div>
                  ))}
                </div>
              )}

              {searchResults.projects?.length > 0 && (
                <div className="mt-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Projects</span>
                  {searchResults.projects.map((p: any) => (
                    <Link
                      key={p.id}
                      to="/projects"
                      onClick={() => setSearchResults(null)}
                      className="block p-1.5 hover:bg-slate-50 rounded text-xs text-brand-600 truncate"
                    >
                      {p.title}
                    </Link>
                  ))}
                </div>
              )}

              {(!searchResults.sources?.length && !searchResults.projects?.length) && (
                <p className="text-xs text-slate-400 py-3 text-center">No matching entities found.</p>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="flex items-center gap-3">
        <a
          href="https://openalex.org"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden lg:flex items-center gap-1.5 text-xs text-slate-500 hover:text-brand-600 px-2.5 py-1 rounded-md hover:bg-slate-50 border border-slate-200"
        >
          <span>Academic Graph Connected</span>
          <ExternalLink size={12} />
        </a>

        <button className="relative p-2 text-slate-500 hover:text-slate-700 rounded-lg hover:bg-slate-100">
          <Bell size={18} />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-brand-500 rounded-full"></span>
        </button>

        <div className="w-px h-6 bg-slate-200"></div>

        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center text-xs font-bold">
            {user?.fullName?.charAt(0) || 'U'}
          </div>
          <span className="hidden sm:inline text-xs font-semibold text-slate-800">
            {user?.fullName || 'Researcher'}
          </span>
        </div>
      </div>
    </header>
  );
};

