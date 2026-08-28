import React from 'react';
import {
  Cloud,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Layers,
  Code2,
  Database,
  Cpu,
  Lock,
  Link2,
  Palette,
  Target,
  Compass,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

const ICON_MAP = {
  Cloud,
  Sparkles,
  BarChart3,
  ShieldCheck,
  Layers,
  Code2,
  Database,
  Cpu,
  Lock,
  Link2,
  Palette,
  Target,
  Compass,
};

export const TrendingDomainCard = ({ domain, onSelect, isSelected = false }) => {
  const IconComponent = ICON_MAP[domain.iconName] || Compass;

  const getTagVariant = (tag) => {
    switch (tag?.toLowerCase()) {
      case 'high demand':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'fast growing':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'top salary':
      case 'high salary':
        return 'bg-amber-950/80 text-amber-300 border-amber-800/60';
      case 'emerging tech':
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
      default:
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
    }
  };

  return (
    <div
      onClick={() => onSelect(domain.domainName)}
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between group border relative overflow-hidden ${
        isSelected
          ? 'bg-blue-950/40 border-blue-500 shadow-xl shadow-blue-500/10'
          : 'bg-slate-900/80 hover:bg-slate-900 border-slate-800/90 hover:border-blue-500/50 hover:shadow-lg hover:shadow-blue-500/5'
      }`}
    >
      {/* Background subtle glow */}
      <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-colors pointer-events-none" />

      <div>
        {/* Header: Icon & Popularity Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-slate-800/90 border border-slate-700/60 flex items-center justify-center text-blue-400 group-hover:text-white group-hover:bg-blue-600 transition-all duration-300 shadow-inner">
            <IconComponent className="w-5 h-5" />
          </div>

          <span
            className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${getTagVariant(
              domain.popularityTag
            )}`}
          >
            {domain.popularityTag}
          </span>
        </div>

        {/* Title & Category */}
        <h4 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors mb-1.5 line-clamp-1">
          {domain.domainName}
        </h4>

        <p className="text-xs text-slate-400 leading-relaxed line-clamp-2 mb-4">
          {domain.description}
        </p>
      </div>

      {/* Footer: Category and Launch trigger */}
      <div className="pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          {domain.category}
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 group-hover:translate-x-0.5 transition-transform">
          View Roadmap <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
