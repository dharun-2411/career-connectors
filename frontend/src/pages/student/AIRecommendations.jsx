import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { aiApi } from '../../api/aiApi';
import { studentApi } from '../../api/studentApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  Sparkles,
  Building2,
  MapPin,
  Target,
  ArrowRight,
  TrendingUp,
  Award,
  ThumbsUp,
  ThumbsDown,
  RefreshCw,
  CheckCircle2,
  BookOpen,
} from 'lucide-react';

export const AIRecommendations = () => {
  const [recommendations, setRecommendations] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [feedbackSent, setFeedbackSent] = useState({});

  const fetchData = async () => {
    try {
      const [recRes, profRes] = await Promise.allSettled([
        aiApi.getRecommendations(),
        studentApi.getProfile(),
      ]);
      if (recRes.status === 'fulfilled' && recRes.value?.success) {
        setRecommendations(recRes.value.data.recommendations || []);
      }
      if (profRes.status === 'fulfilled' && profRes.value?.success) {
        setProfile(profRes.value.data);
      }
    } catch (err) {
      console.error('Error loading AI recommendations:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleRefreshFeed = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleFeedback = async (oppId, rating) => {
    try {
      await aiApi.submitFeedback({
        entityType: 'OPPORTUNITY_RECOMMENDATION',
        entityId: oppId,
        rating,
        comment: rating === 5 ? 'Helpful match' : 'Not relevant',
      });
      setFeedbackSent((prev) => ({ ...prev, [oppId]: rating }));
    } catch (e) {
      console.error('Feedback submission failed:', e);
    }
  };

  if (loading) return <Loader fullScreen message="Synthesizing personalized AI recommendation feed..." />;

  const verifiedSkillsCount = profile?.skills?.length || 0;
  const advancedSkillsCount = profile?.skills?.filter(s => s.proficiencyLevel === 'ADVANCED' || s.proficiencyLevel === 'EXPERT').length || 0;

  return (
    <DashboardLayout
      title="Personalized AI Opportunity Feed"
      subtitle="Ranked dynamically using your profile embeddings, skill proficiencies, and career growth trajectories."
      action={
        <Button
          variant="secondary"
          size="sm"
          onClick={handleRefreshFeed}
          loading={refreshing}
          icon={RefreshCw}
        >
          Re-Sync with Profile
        </Button>
      }
    >
      {/* Student Progress & Dynamic Skill Alignment Banner */}
      <div className="mb-8 p-6 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 border border-indigo-100 shadow-nexus-sm space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" /> Active Profile Progress Tracking
            </div>
            <h3 className="text-lg font-bold text-slate-900">
              AI Matching Engine synced with {profile?.name || 'Your Profile'}
            </h3>
            <p className="text-xs text-slate-600">
              Evaluated across {verifiedSkillsCount} verified skills ({advancedSkillsCount} Advanced/Expert) and real-time career trajectories.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <Link to="/student/profile">
              <Button variant="secondary" size="sm" icon={Award}>
                Update Skills Matrix
              </Button>
            </Link>
            <Link to="/student/roadmap">
              <Button variant="ghost" size="sm" icon={BookOpen}>
                Career Roadmap
              </Button>
            </Link>
          </div>
        </div>

        {/* Quick Skill Tags Preview */}
        {profile?.skills?.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap pt-3 border-t border-indigo-100/70 text-xs">
            <span className="text-slate-500 font-semibold">Active Match Factors:</span>
            {profile.skills.map((sk) => (
              <span
                key={sk.id}
                className="px-2.5 py-1 rounded-lg bg-white border border-indigo-100 text-indigo-700 font-medium text-xs flex items-center gap-1.5 shadow-sm"
              >
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                {sk.skillName} ({sk.proficiencyLevel})
              </span>
            ))}
          </div>
        )}
      </div>

      {recommendations.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600">
            <Sparkles className="w-6 h-6" />
          </div>
          <h3 className="text-lg font-bold text-slate-900">No recommendations available yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto">
            Add skills to your profile to let our LangGraph agent evaluate match compatibility!
          </p>
          <div className="pt-2">
            <Link to="/student/profile">
              <Button variant="primary" size="md">
                Update Skills Profile
              </Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="space-y-6">
          {recommendations.map((item) => (
            <div
              key={item.opportunity.id}
              className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-nexus-sm hover:shadow-nexus transition-all space-y-5"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-4">
                  {item.opportunity.companyLogoUrl ? (
                    <img
                      src={item.opportunity.companyLogoUrl}
                      alt={item.opportunity.companyName}
                      className="w-12 h-12 rounded-xl object-cover border border-slate-200 bg-slate-50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-700 font-bold">
                      {item.opportunity.companyName?.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                  <div>
                    <h3 className="text-xl font-bold text-slate-900">
                      <Link to={`/opportunities/${item.opportunity.id}`} className="hover:text-indigo-600 transition-colors">
                        {item.opportunity.title}
                      </Link>
                    </h3>
                    <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="font-medium text-slate-700">{item.opportunity.companyName}</span>
                      <span>•</span>
                      <MapPin className="w-3.5 h-3.5 text-slate-400" />
                      <span>{item.opportunity.isRemote ? 'Remote' : item.opportunity.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <ScoreMeter score={item.matchScore} size="md" />
                </div>
              </div>

              {/* AI Reasoning Pill */}
              <div className="p-4 rounded-xl bg-indigo-50/60 border border-indigo-100/90 space-y-2">
                <div className="flex items-center gap-2 text-xs font-bold text-indigo-700 uppercase tracking-wider">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" /> AI Recommendation Reasoning
                </div>
                <p className="text-xs text-slate-700 leading-relaxed font-normal">{item.matchReason}</p>
                <div className="flex items-center gap-2 pt-1">
                  <span className="text-[11px] text-slate-500 font-semibold">Trajectory Fit:</span>
                  <Badge variant="indigo" size="sm">{item.careerTrajectoryFit}</Badge>
                </div>
              </div>

              {/* Key Strengths matching */}
              {item.keyStrengths?.length > 0 && (
                <div className="flex items-center gap-2 flex-wrap text-xs">
                  <span className="text-slate-500 font-semibold">Matching Strengths:</span>
                  {item.keyStrengths.map((st, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-[11px] font-medium">
                      {st}
                    </span>
                  ))}
                </div>
              )}

              {/* Actions & Feedback */}
              <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div className="flex items-center gap-2 text-xs text-slate-500">
                  <span>Is this recommendation relevant?</span>
                  <button
                    onClick={() => handleFeedback(item.opportunity.id, 5)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      feedbackSent[item.opportunity.id] === 5
                        ? 'bg-emerald-50 border-emerald-300 text-emerald-600'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                    }`}
                    title="Helpful match"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleFeedback(item.opportunity.id, 1)}
                    className={`p-1.5 rounded-lg border transition-colors ${
                      feedbackSent[item.opportunity.id] === 1
                        ? 'bg-rose-50 border-rose-300 text-rose-600'
                        : 'border-slate-200 hover:bg-slate-100 text-slate-400'
                    }`}
                    title="Not relevant"
                  >
                    <ThumbsDown className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <Link to={`/student/skill-gap/${item.opportunity.id}`}>
                    <Button variant="secondary" size="sm" icon={Target}>
                      Skill Gap
                    </Button>
                  </Link>
                  <Link to={`/opportunities/${item.opportunity.id}`}>
                    <Button variant="primary" size="sm">
                      View Opportunity <ArrowRight className="w-3.5 h-3.5 ml-1" />
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
};
