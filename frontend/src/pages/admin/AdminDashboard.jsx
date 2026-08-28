import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Loader } from '../../components/common/Loader';
import {
  Users,
  Building2,
  Briefcase,
  FileCheck2,
  Sparkles,
  ShieldAlert,
  Award,
  TrendingUp,
  BarChart3,
  PieChart,
} from 'lucide-react';

export const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await adminApi.getStats();
        if (res && res.success) {
          setStats(res.data);
        }
      } catch (err) {
        console.error('Failed to load admin stats:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) return <Loader fullScreen message="Loading platform analytics..." />;

  return (
    <DashboardLayout
      title="Platform Operations & Analytics"
      subtitle="Holistic visibility across all students, registered employers, active postings, and match quality."
    >
      {/* Top Level Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Students</span>
            <Users className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats?.totalStudents || 0}</div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Companies</span>
            <Building2 className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">{stats?.totalCompanies || 0}</div>
          {stats?.pendingCompanyVerifications > 0 && (
            <div className="text-[11px] text-amber-400 font-semibold pt-1">
              {stats.pendingCompanyVerifications} Pending Verification
            </div>
          )}
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Postings</span>
            <Briefcase className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-white">
            {stats?.activeOpportunities || 0} / {stats?.totalOpportunities || 0}
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Avg Match Quality</span>
            <Sparkles className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl sm:text-3xl font-extrabold text-emerald-400">
            {stats?.averageMatchScore || '88.5'}%
          </div>
        </div>
      </div>

      {/* Analytics Breakdown Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Top Demanded Skills Matrix */}
        <div className="lg:col-span-2 p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h3 className="text-base font-bold text-white">Most Demanded Skills on Platform</h3>
          </div>

          <div className="space-y-3">
            {stats?.topSkillsDemand &&
              Object.entries(stats.topSkillsDemand).map(([skill, count], idx) => {
                const maxCount = Math.max(...Object.values(stats.topSkillsDemand), 1);
                const percent = Math.round((count / maxCount) * 100);

                return (
                  <div key={skill} className="space-y-1">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-white">{skill}</span>
                      <span className="text-slate-400">{count} Postings</span>
                    </div>
                    <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-sky-400 rounded-full transition-all duration-500"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })}
          </div>
        </div>

        {/* Application Funnel & Types */}
        <div className="space-y-6">
          {/* Applications by status */}
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4">
            <div className="flex items-center gap-2 pb-3 border-b border-slate-800">
              <PieChart className="w-5 h-5 text-purple-400" />
              <h3 className="text-base font-bold text-white">Application Pipeline</h3>
            </div>

            <div className="space-y-2.5">
              {stats?.applicationsByStatus &&
                Object.entries(stats.applicationsByStatus).map(([status, count]) => (
                  <div
                    key={status}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-950 border border-slate-800/80 text-xs"
                  >
                    <span className="text-slate-300 font-medium">{status.replace('_', ' ')}</span>
                    <span className="font-bold text-white px-2 py-0.5 rounded bg-slate-900">
                      {count}
                    </span>
                  </div>
                ))}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
