import React, { useState, useEffect, useRef } from 'react';
import { Search, Sparkles, X, Clock, ArrowRight } from 'lucide-react';

export const RoadmapSearchBox = ({
  onSearch,
  trendingDomains = [],
  initialValue = '',
  loading = false,
}) => {
  const [query, setQuery] = useState(initialValue);
  const [isOpen, setIsOpen] = useState(false);
  const [recentSearches, setRecentSearches] = useState([]);
  const wrapperRef = useRef(null);

  useEffect(() => {
    setQuery(initialValue);
  }, [initialValue]);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('career_roadmap_recent_searches');
      if (saved) {
        setRecentSearches(JSON.parse(saved));
      }
    } catch (e) {
      console.warn('Failed to read recent searches from localStorage', e);
    }
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const saveRecentSearch = (term) => {
    if (!term || !term.trim()) return;
    const clean = term.trim();
    const updated = [clean, ...recentSearches.filter((s) => s.toLowerCase() !== clean.toLowerCase())].slice(0, 5);
    setRecentSearches(updated);
    try {
      localStorage.setItem('career_roadmap_recent_searches', JSON.stringify(updated));
    } catch (e) {
      console.warn('Failed to save recent search', e);
    }
  };

  const handleSelect = (domainName) => {
    setQuery(domainName);
    setIsOpen(false);
    saveRecentSearch(domainName);
    onSearch(domainName);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setIsOpen(false);
    saveRecentSearch(query);
    onSearch(query.trim());
  };

  const filteredTrending = query.trim()
    ? trendingDomains.filter((d) =>
        d.domainName.toLowerCase().includes(query.toLowerCase()) ||
        d.category.toLowerCase().includes(query.toLowerCase())
      )
    : trendingDomains.slice(0, 6);

  return (
    <div ref={wrapperRef} className="relative w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative flex items-center">
          <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIsOpen(true);
            }}
            onFocus={() => setIsOpen(true)}
            placeholder="Search a career domain (e.g. Cloud Computing, AI/ML, Cybersecurity, MLOps...)"
            className="w-full pl-12 pr-28 py-3.5 bg-slate-900/90 border border-slate-700/80 rounded-2xl text-white placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 text-sm shadow-xl transition-all"
          />

          {query && (
            <button
              type="button"
              onClick={() => setQuery('')}
              className="absolute right-24 text-slate-400 hover:text-white p-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}

          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="absolute right-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:opacity-50 text-white font-semibold text-xs rounded-xl flex items-center gap-1.5 transition-all shadow-md"
          >
            {loading ? (
              <span className="inline-block animate-spin">⏳</span>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5" />
                <span>Generate</span>
              </>
            )}
          </button>
        </div>
      </form>

      {/* Autocomplete Dropdown */}
      {isOpen && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-slate-900/95 backdrop-blur-xl border border-slate-800 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-slate-800/60 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* Autocomplete matching trending domains */}
          {filteredTrending.length > 0 && (
            <div className="p-3">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center justify-between">
                <span>Matching Domains</span>
                <span className="text-blue-400">AI Suggested</span>
              </div>
              <div className="space-y-1 mt-1">
                {filteredTrending.map((domain) => (
                  <button
                    key={domain.id || domain.domainName}
                    type="button"
                    onClick={() => handleSelect(domain.domainName)}
                    className="w-full px-3 py-2 text-left rounded-xl hover:bg-slate-800/80 flex items-center justify-between group transition-colors"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-2 h-2 rounded-full bg-blue-500 group-hover:scale-125 transition-transform" />
                      <div>
                        <div className="text-sm font-semibold text-white group-hover:text-blue-400 transition-colors">
                          {domain.domainName}
                        </div>
                        <div className="text-xs text-slate-400 line-clamp-1">
                          {domain.description}
                        </div>
                      </div>
                    </div>
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 group-hover:bg-blue-950 group-hover:text-blue-300">
                      {domain.popularityTag}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Recent Searches */}
          {recentSearches.length > 0 && (
            <div className="p-3 bg-slate-950/40">
              <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2 py-1 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-slate-500" />
                <span>Recent Searches</span>
              </div>
              <div className="flex flex-wrap gap-1.5 mt-2 px-1">
                {recentSearches.map((term, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => handleSelect(term)}
                    className="px-2.5 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-xs text-slate-300 flex items-center gap-1 transition-colors"
                  >
                    <span>{term}</span>
                    <ArrowRight className="w-3 h-3 text-slate-500" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
