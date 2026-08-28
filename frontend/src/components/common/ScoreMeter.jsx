import React from 'react';
import { Sparkles } from 'lucide-react';

export const ScoreMeter = ({ score, size = 'md', showLabel = true, className = '' }) => {
  const numericScore = typeof score === 'number' ? score : parseFloat(score) || 0;

  // Determine color scheme based on score
  const getColorScheme = (val) => {
    if (val >= 80) {
      return {
        bg: 'from-emerald-500 to-teal-400',
        text: 'text-emerald-400',
        border: 'border-emerald-500/30',
        glow: 'shadow-emerald-500/20',
        label: 'Top Match',
      };
    }
    if (val >= 60) {
      return {
        bg: 'from-blue-500 to-sky-400',
        text: 'text-blue-400',
        border: 'border-blue-500/30',
        glow: 'shadow-blue-500/20',
        label: 'Strong Fit',
      };
    }
    if (val >= 40) {
      return {
        bg: 'from-amber-500 to-yellow-400',
        text: 'text-amber-400',
        border: 'border-amber-500/30',
        glow: 'shadow-amber-500/20',
        label: 'Moderate',
      };
    }
    return {
      bg: 'from-slate-500 to-slate-400',
      text: 'text-slate-400',
      border: 'border-slate-500/30',
      glow: 'shadow-slate-500/20',
      label: 'Developing',
    };
  };

  const scheme = getColorScheme(numericScore);

  if (size === 'sm') {
    return (
      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-900/90 border ${scheme.border} ${className}`}>
        <Sparkles className={`w-3.5 h-3.5 ${scheme.text}`} />
        <span className={`text-xs font-bold ${scheme.text}`}>{numericScore.toFixed(0)}%</span>
      </div>
    );
  }

  if (size === 'lg') {
    return (
      <div className={`flex flex-col items-center p-4 rounded-2xl bg-slate-900/80 border ${scheme.border} shadow-lg ${scheme.glow} ${className}`}>
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className={`w-5 h-5 ${scheme.text}`} />
          <span className="text-xs font-medium text-slate-400 tracking-wider uppercase">AI Match Score</span>
        </div>
        <div className="relative flex items-center justify-center my-2">
          <span className={`text-4xl font-extrabold tracking-tight ${scheme.text}`}>
            {numericScore.toFixed(1)}%
          </span>
        </div>
        {/* Linear progress bar */}
        <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-2">
          <div
            className={`h-full bg-gradient-to-r ${scheme.bg} transition-all duration-700 ease-out`}
            style={{ width: `${Math.min(100, Math.max(0, numericScore))}%` }}
          />
        </div>
        {showLabel && (
          <span className={`text-xs font-semibold mt-2 px-2.5 py-0.5 rounded-md bg-slate-800 ${scheme.text}`}>
            {scheme.label}
          </span>
        )}
      </div>
    );
  }

  // Medium (Default)
  return (
    <div className={`flex items-center gap-3 px-3 py-1.5 rounded-xl bg-slate-900/80 border ${scheme.border} ${className}`}>
      <div className="flex items-center gap-1.5">
        <Sparkles className={`w-4 h-4 ${scheme.text}`} />
        <span className={`text-sm font-bold ${scheme.text}`}>{numericScore.toFixed(0)}%</span>
      </div>
      <div className="w-16 bg-slate-800 h-2 rounded-full overflow-hidden">
        <div
          className={`h-full bg-gradient-to-r ${scheme.bg} transition-all duration-500`}
          style={{ width: `${Math.min(100, Math.max(0, numericScore))}%` }}
        />
      </div>
      {showLabel && (
        <span className="text-xs text-slate-400 font-medium hidden sm:inline">{scheme.label}</span>
      )}
    </div>
  );
};
