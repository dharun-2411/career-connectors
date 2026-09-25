import React from 'react';
import { Sparkles } from 'lucide-react';

export const ScoreMeter = ({ score, size = 'md', showLabel = true, className = '' }) => {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  // Determine color scheme based on score
  const getColorScheme = (val) => {
    if (val >= 80) {
      return {
        bg: 'from-emerald-500 to-teal-500',
        badgeBg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200/80',
        track: 'bg-emerald-100',
        label: 'Top Match',
      };
    }
    if (val >= 60) {
      return {
        bg: 'from-indigo-600 to-blue-500',
        badgeBg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200/80',
        track: 'bg-indigo-100',
        label: 'Strong Fit',
      };
    }
    if (val >= 40) {
      return {
        bg: 'from-amber-500 to-yellow-500',
        badgeBg: 'bg-amber-50',
        text: 'text-amber-700',
        border: 'border-amber-200/80',
        track: 'bg-amber-100',
        label: 'Moderate',
      };
    }
    return {
      bg: 'from-slate-400 to-slate-500',
      badgeBg: 'bg-slate-100',
      text: 'text-slate-600',
      border: 'border-slate-200',
      track: 'bg-slate-100',
      label: 'Developing',
    };
  };

  const scheme = getColorScheme(numericScore);

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full ${scheme.badgeBg} border ${scheme.border} ${className}`}>
        <Sparkles className={`w-3.5 h-3.5 ${scheme.text}`} />
        <span className={`text-xs font-bold ${scheme.text}`}>{numericScore.toFixed(0)}%</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-center p-5 rounded-2xl bg-white border ${scheme.border} shadow-sm ${className}`}>
        <div className="flex items-center gap-1.5 mb-1.5">
          <Sparkles className={`w-4 h-4 ${scheme.text}`} />
          <span className="text-[11px] font-bold text-slate-500 tracking-wider uppercase">AI Match Quality</span>
        </div>
        <div className="relative flex items-center justify-center my-1.5">
          <span className={`text-3xl font-extrabold tracking-tight ${scheme.text}`}>
            {numericScore.toFixed(1)}%
          </span>
        </div>
        {/* Linear progress bar */}
        <div className={`w-full ${scheme.track} h-2 rounded-full overflow-hidden mt-2`}>
          <div
            className={`h-full bg-gradient-to-r ${scheme.bg} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, numericScore))}%` }}
          />
        </div>
        {showLabel && (
          <span className={`text-xs font-bold mt-2.5 px-2.5 py-0.5 rounded-full ${scheme.badgeBg} border ${scheme.border} ${scheme.text}`}>
            {scheme.label}
          </span>
        )}
      </div>
    );
  }

  // Medium (Default)
  return (
    <div className={`flex items-center gap-2.5 px-3 py-1.5 rounded-full ${scheme.badgeBg} border ${scheme.border} ${className}`}>
      <div className="flex items-center gap-1.5">
        <Sparkles className={`w-3.5 h-3.5 ${scheme.text}`} />
        <span className={`text-xs font-bold ${scheme.text}`}>{numericScore.toFixed(0)}%</span>
      </div>
      <div className={`w-14 ${scheme.track} h-1.5 rounded-full overflow-hidden`}>
        <div
          className={`h-full bg-gradient-to-r ${scheme.bg} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, numericScore))}%` }}
        />
      </div>
      {showLabel && (
        <span className={`text-[11px] font-bold ${scheme.text} hidden sm:inline`}>{scheme.label}</span>
      )}
    </div>
  );
};

