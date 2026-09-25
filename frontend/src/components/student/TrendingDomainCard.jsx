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
        return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'fast growing':
        return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'top salary':
      case 'high salary':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'emerging tech':
        return 'bg-sky-50 text-sky-700 border-sky-200';
      default:
        return 'bg-indigo-50 text-indigo-700 border-indigo-200';
    }
  };

  return (
    <div
      onClick={() => onSelect(domain.domainName)}
      className={`p-5 rounded-2xl cursor-pointer transition-all duration-300 flex flex-col justify-between group border relative overflow-hidden ${
        isSelected
          ? 'bg-indigo-50/50 border-indigo-500 shadow-nexus'
          : 'bg-white hover:bg-slate-50/50 border-slate-200 hover:border-indigo-300 shadow-nexus-sm hover:shadow-nexus'
      }`}
    >
      <div>
        {/* Header: Icon & Popularity Badge */}
        <div className="flex items-center justify-between gap-2 mb-3.5">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600 group-hover:text-white group-hover:bg-indigo-600 transition-all duration-300 shadow-sm">
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
        <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5 line-clamp-1">
          {domain.domainName}
        </h4>

        <p className="text-xs text-slate-500 leading-relaxed line-clamp-2 mb-4">
          {domain.description}
        </p>
      </div>

      {/* Footer: Category and Launch trigger */}
      <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
        <span className="text-[11px] font-medium text-slate-500 uppercase tracking-wider">
          {domain.category}
        </span>

        <span className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 group-hover:translate-x-0.5 transition-transform">
          View Roadmap <ArrowRight className="w-3.5 h-3.5" />
        </span>
      </div>
    </div>
  );
};
