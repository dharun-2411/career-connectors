import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { studentApi } from '../../api/studentApi';
import { applicationApi } from '../../api/applicationApi';
import { aiApi } from '../../api/aiApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Sparkles, FileCheck2, Compass, ArrowRight, BookOpen, Clock, Building2, MapPin } from 'lucide-react';

export const StudentDashboard = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const [profRes, appRes, recRes] = await Promise.allSettled([
          studentApi.getProfile(),
          applicationApi.getMyApplications(0, 4),
          aiApi.getRecommendations(),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value.success) {
          setProfile(profRes.value.data);
        }
        if (appRes.status === 'fulfilled' && appRes.value.success) {
          setApplications(appRes.value.data.content || []);
        }
        if (recRes.status === 'fulfilled' && recRes.value.success) {
          setRecommendations(recRes.value.data.recommendations || []);
        }
      } catch (err) {
        console.error('Error loading student dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) return <Loader fullScreen message="Loading student workspace..." />;

  const totalSkills = profile?.skills?.length || 0;
  const activeApplicationsCount = applications.filter(a => a.status !== 'REJECTED').length;

  return (
    <DashboardLayout
      title={`Welcome back, ${profile?.name || user?.name || 'Student'}!`}
      subtitle="Here is your AI-curated talent match summary and application progress."
      action={
        <Link to="/opportunities">
          <Button variant="primary" size="sm" icon={Compass}>
            Browse Opportunities
          </Button>
        </Link>
      }
    >
      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{totalSkills}</div>
            <div className="text-xs text-slate-400 font-medium">Verified Profile Skills</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400">
            <FileCheck2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{applications.length}</div>
            <div className="text-xs text-slate-400 font-medium">Total Applications ({activeApplicationsCount} Active)</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-slate-800 flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-white">{recommendations.length}</div>
            <div className="text-xs text-slate-400 font-medium">AI Matched Opportunities</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: AI Recommendations Preview */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-bold text-white">Top AI Recommendations</h2>
            </div>
            <Link to="/student/recommendations" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-4">
            {recommendations.slice(0, 3).map((rec) => (
              <div
                key={rec.opportunity.id}
                className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800/80 hover:border-blue-500/40 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-blue-400 flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {rec.opportunity.companyName}
                    </span>
                    <span className="text-slate-600">•</span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5" />
                      {rec.opportunity.location}
                    </span>
                  </div>
                  <h3 className="text-base font-bold text-white group-hover:text-blue-400 transition-colors">
                    <Link to={`/opportunities/${rec.opportunity.id}`}>{rec.opportunity.title}</Link>
                  </h3>
                  <p className="text-xs text-slate-400 line-clamp-1">{rec.matchReason}</p>
                </div>

                <div className="flex items-center gap-3">
                  <ScoreMeter score={rec.matchScore} size="sm" />
                  <Link to={`/opportunities/${rec.opportunity.id}`}>
                    <Button variant="secondary" size="sm">
                      Details
                    </Button>
                  </Link>
                </div>
              </div>
            ))}

            {recommendations.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-slate-900/40 border border-slate-800 text-slate-400 text-sm">
                No personalized recommendations yet. Complete your skills profile to generate real-time AI feeds!
              </div>
            )}
          </div>
        </div>

        {/* Right Col: Active Applications Progress */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <FileCheck2 className="w-5 h-5 text-purple-400" />
              <h2 className="text-lg font-bold text-white">Application Tracker</h2>
            </div>
            <Link to="/student/applications" className="text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1">
              View All <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {applications.map((app) => {
              const getStatusBadge = (status) => {
                switch (status) {
                  case 'SELECTED': return <Badge variant="success">Selected</Badge>;
                  case 'SHORTLISTED': return <Badge variant="purple">Shortlisted</Badge>;
                  case 'UNDER_REVIEW': return <Badge variant="primary">Under Review</Badge>;
                  case 'REJECTED': return <Badge variant="danger">Archived</Badge>;
                  default: return <Badge variant="default">Applied</Badge>;
                }
              };

              return (
                <div key={app.id} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-slate-400 truncate max-w-[140px]">
                      {app.companyName}
                    </span>
                    {getStatusBadge(app.status)}
                  </div>
                  <h4 className="text-sm font-bold text-white truncate">{app.opportunityTitle}</h4>
                  {app.matchScore && (
                    <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs text-slate-400">
                      <span>AI Compatibility</span>
                      <span className="font-semibold text-emerald-400">{app.matchScore}%</span>
                    </div>
                  )}
                </div>
              );
            })}

            {applications.length === 0 && (
              <div className="p-6 text-center rounded-xl bg-slate-900/40 border border-slate-800 text-slate-400 text-xs">
                You have not submitted any applications yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
