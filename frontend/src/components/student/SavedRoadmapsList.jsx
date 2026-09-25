import React from 'react';
import { Bookmark, Clock, ArrowRight, CheckCircle2, Sparkles } from 'lucide-react';
import { Button } from '../common/Button';

export const SavedRoadmapsList = ({
  savedRoadmaps = [],
  onSelectRoadmap,
  loading = false,
}) => {
  if (loading) {
    return (
      <div className="p-8 text-center text-xs text-slate-400">
        Loading your saved career roadmaps...
      </div>
    );
  }

  if (savedRoadmaps.length === 0) {
    return (
      <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 shadow-nexus-sm space-y-3">
        <div className="w-12 h-12 rounded-xl bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
          <Bookmark className="w-6 h-6" />
        </div>
        <h4 className="text-sm font-bold text-slate-900">No saved roadmaps yet</h4>
        <p className="text-xs text-slate-500 max-w-sm mx-auto">
          Search any domain or click a trending topic above, then click "Save to My Roadmaps" to track your progress here.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
      {savedRoadmaps.map((item) => (
        <div
          key={item.id}
          className="p-5 rounded-2xl bg-white border border-slate-200 hover:border-indigo-300 shadow-nexus-sm hover:shadow-nexus transition-all flex flex-col justify-between space-y-4 group"
        >
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-semibold text-indigo-600 flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" />
                {item.totalDuration}
              </span>
              <span className="text-[11px] font-bold text-emerald-600">
                {item.progressPercentage || 0}% Complete
              </span>
            </div>

            <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
              {item.domainName}
            </h4>

            <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed">
              {item.overview}
            </p>
          </div>

          {/* Progress bar */}
          <div className="space-y-3 pt-3 border-t border-slate-100">
            <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden border border-slate-200">
              <div
                className="h-full bg-indigo-600 rounded-full transition-all duration-300"
                style={{ width: `${item.progressPercentage || 0}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">
                {item.completedStepsCount || 0} / {item.totalStepsCount || 6} milestones
              </span>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => onSelectRoadmap(item.domainName)}
                className="text-xs"
              >
                Resume <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </Button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
