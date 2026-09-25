import React, { useState, useEffect } from 'react';
import { aiApi } from '../../api/aiApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  TrendingUp,
  Sparkles,
  Compass,
  Code2,
  BookOpen,
  ArrowRight,
  Flame,
  Layers,
  Award,
} from 'lucide-react';

export const CareerSuggestions = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSuggestions = async () => {
      try {
        const res = await aiApi.getCareerSuggestions();
        if (res && res.success) {
          setData(res.data);
        }
      } catch (err) {
        console.error('Failed to load career suggestions:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSuggestions();
  }, []);

  if (loading) return <Loader fullScreen message="Evaluating career trajectories and project recommendations..." />;

  return (
    <DashboardLayout
      title="AI Career Trajectory & Project Roadmap"
      subtitle="Strategic role recommendations and portfolio project ideas tailored to your current skill profile."
    >
      {/* Trending Market Skills Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-purple-50/80 border border-indigo-100 shadow-nexus-sm mb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-500" /> High-Growth Industry Skills
        </div>
        <div className="flex flex-wrap gap-2">
          {data?.trendingSkillsInMarket?.map((sk, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-lg bg-white border border-indigo-100 text-xs font-semibold text-indigo-700 shadow-sm"
            >
              #{sk}
            </span>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Career Paths */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-indigo-600" />
            <h3 className="text-lg font-bold text-slate-900">Suggested High-Synergy Roles</h3>
          </div>

          <div className="space-y-4">
            {data?.suggestedPaths?.map((path, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-nexus-sm hover:shadow-nexus transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-slate-900">{path.roleTitle}</h4>
                    <span className="text-xs text-indigo-600 font-medium">{path.industry}</span>
                  </div>
                  <Badge variant="emerald" size="sm">Readiness: {path.readinessLevel}</Badge>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
                  <div>
                    <span className="text-slate-500 font-semibold block mb-1">Your Transferrable Strengths:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.transferrableSkills?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-500 font-semibold block mb-1">Next Skills to Accelerate:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.recommendedNextSkills?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Col: Recommended Projects */}
        <div className="space-y-6">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-purple-600" />
            <h3 className="text-lg font-bold text-slate-900">Recommended Portfolio Projects</h3>
          </div>

          <div className="space-y-4">
            {data?.recommendedProjects?.map((proj, i) => (
              <div
                key={i}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-nexus-sm hover:shadow-nexus transition-all space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-slate-900">{proj.title}</h4>
                  <Badge variant="purple" size="sm">{proj.difficulty}</Badge>
                </div>

                <p className="text-xs text-slate-600 leading-relaxed">{proj.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {proj.technologiesUsed?.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-50 border border-slate-200 text-[11px] text-slate-600 font-medium">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-purple-50 border border-purple-200 text-xs text-purple-800">
                  <span className="font-bold">Portfolio Impact:</span> {proj.portfolioImpact}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
