import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { aiApi } from '../../api/aiApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  Sparkles,
  ArrowLeft,
  Target,
  BookOpen,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GraduationCap,
} from 'lucide-react';

export const SkillGap = () => {
  const { id } = useParams();
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSkillGap = async () => {
      try {
        const res = await aiApi.getSkillGap(id);
        if (res && res.success) {
          setGapData(res.data);
        }
      } catch (err) {
        console.error('Failed to load skill gap report:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchSkillGap();
  }, [id]);

  if (loading) return <Loader fullScreen message="Synthesizing AI Skill Gap & Learning Roadmap..." />;
  if (!gapData) return <div className="p-8 text-center text-slate-400">Skill gap report not available.</div>;

  return (
    <DashboardLayout
      title="AI Skill-Gap & Learning Roadmap"
      subtitle={`Comprehensive competency analysis for ${gapData.opportunityTitle} at ${gapData.companyName}.`}
    >
      {/* Back button */}
      <div className="mb-6">
        <Link
          to={`/opportunities/${id}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Opportunity Details
        </Link>
      </div>

      {/* Summary Score Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-blue-400 uppercase tracking-wider">
            <Target className="w-4 h-4" /> Competency Match Analysis
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-white leading-snug">
            {gapData.summary}
          </h2>
          <p className="text-xs text-slate-400">
            Target Role: <span className="text-slate-200 font-semibold">{gapData.opportunityTitle}</span> • {gapData.companyName}
          </p>
        </div>

        <div className="w-full md:w-auto flex justify-center">
          <ScoreMeter score={gapData.matchPercentage} size="lg" />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Missing & Weak Skills Identification */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-400" />
              <h3 className="text-lg font-bold text-white">Identified Competency Gaps</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">
              {gapData.missingSkills?.length || 0} Areas to Boost
            </span>
          </div>

          {gapData.missingSkills?.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-950/30 border border-emerald-800/40 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-2" />
              <h4 className="text-base font-bold text-white">Zero Skill Gaps Detected!</h4>
              <p className="text-xs text-slate-300">
                You satisfy all technical competencies required for this opportunity.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {gapData.missingSkills?.map((skill, index) => (
                <div
                  key={index}
                  className="p-4 rounded-2xl bg-slate-900 border border-slate-800 space-y-2.5"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{skill.skillName}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                        {skill.category}
                      </span>
                    </div>
                    {skill.priority === 'HIGH' ? (
                      <Badge variant="danger" size="sm">High Priority</Badge>
                    ) : (
                      <Badge variant="warning" size="sm">Medium Priority</Badge>
                    )}
                  </div>

                  <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-800/80">
                    <div className="text-slate-400">
                      Required Level:{' '}
                      <span className="font-semibold text-blue-400">{skill.requiredProficiency}</span>
                    </div>
                    <div className="text-slate-400">
                      Current Level:{' '}
                      <span className="font-semibold text-slate-300">{skill.currentProficiency || 'None'}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right Col: AI Generated Learning Roadmap */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Actionable Learning Roadmap</h3>
            </div>
            <span className="text-xs text-slate-400 font-semibold">Custom AI Curriculum</span>
          </div>

          <div className="space-y-4">
            {gapData.learningRoadmap?.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-900/80 border border-slate-800 space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-purple-400">{item.skill}</span>
                      <span className="text-slate-600">•</span>
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.estimatedTimeToLearn}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-white">{item.title}</h4>
                  </div>
                  <Badge variant="purple" size="sm">{item.difficulty}</Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                  <span className="text-xs text-slate-400">{item.type}</span>
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-blue-400 hover:text-blue-300"
                  >
                    Start Learning <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
