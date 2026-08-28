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
      <div className="p-5 rounded-2xl bg-gradient-to-r from-blue-950/40 via-purple-950/30 to-slate-900 border border-blue-800/40 mb-8 space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold text-blue-400 uppercase tracking-wider">
          <Flame className="w-4 h-4 text-amber-400" /> High-Growth Industry Skills
        </div>
        <div className="flex flex-wrap gap-2">
          {data?.trendingSkillsInMarket?.map((sk, i) => (
            <span
              key={i}
              className="px-3 py-1 rounded-lg bg-slate-900 border border-slate-700 text-xs font-semibold text-slate-200"
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
            <TrendingUp className="w-5 h-5 text-blue-400" />
            <h3 className="text-lg font-bold text-white">Suggested High-Synergy Roles</h3>
          </div>

          <div className="space-y-4">
            {data?.suggestedPaths?.map((path, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <h4 className="text-lg font-bold text-white">{path.roleTitle}</h4>
                    <span className="text-xs text-blue-400 font-medium">{path.industry}</span>
                  </div>
                  <Badge variant="success" size="sm">Readiness: {path.readinessLevel}</Badge>
                </div>

                <div className="space-y-2 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400 font-semibold block mb-1">Your Transferrable Strengths:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.transferrableSkills?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50">
                          {s}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2">
                    <span className="text-slate-400 font-semibold block mb-1">Next Skills to Accelerate:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {path.recommendedNextSkills?.map((s, idx) => (
                        <span key={idx} className="px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800/50">
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
            <Code2 className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Recommended Portfolio Projects</h3>
          </div>

          <div className="space-y-4">
            {data?.recommendedProjects?.map((proj, i) => (
              <div
                key={i}
                className="p-6 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <h4 className="text-base font-bold text-white">{proj.title}</h4>
                  <Badge variant="purple" size="sm">{proj.difficulty}</Badge>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>

                <div className="flex flex-wrap gap-1.5">
                  {proj.technologiesUsed?.map((t, idx) => (
                    <span key={idx} className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-slate-300">
                      {t}
                    </span>
                  ))}
                </div>

                <div className="p-3 rounded-xl bg-purple-950/30 border border-purple-900/40 text-xs text-purple-300">
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
