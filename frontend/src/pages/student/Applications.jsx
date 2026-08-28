import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import {
  FileCheck2,
  Building2,
  Calendar,
  Clock,
  ArrowRight,
  CheckCircle2,
  AlertCircle,
  XCircle,
  HelpCircle,
  FileText,
} from 'lucide-react';

export const Applications = () => {
  const [applications, setApplications] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchApplications = async (page = 0) => {
    setLoading(true);
    try {
      const res = await applicationApi.getMyApplications(page, 10);
      if (res && res.success) {
        setApplications(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(res.data.pageNumber || 0);
      }
    } catch (err) {
      console.error('Error fetching applications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications(0);
  }, []);

  const getStageIndex = (status) => {
    switch (status) {
      case 'APPLIED': return 1;
      case 'UNDER_REVIEW': return 2;
      case 'SHORTLISTED': return 3;
      case 'SELECTED': return 4;
      case 'REJECTED': return 4;
      default: return 1;
    }
  };

  return (
    <DashboardLayout
      title="My Applications Tracker"
      subtitle="Monitor your candidate progression across submitted roles in real-time."
    >
      {loading ? (
        <Loader message="Loading application statuses..." />
      ) : applications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <FileCheck2 className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active applications found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            You haven't applied to any opportunities yet. Explore our open listings and apply with your AI match score!
          </p>
          <Link to="/opportunities">
            <Button variant="primary" size="md">
              Browse Open Opportunities
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {applications.map((app) => {
            const currentStage = getStageIndex(app.status);
            const isRejected = app.status === 'REJECTED';
            const isSelected = app.status === 'SELECTED';

            const stages = [
              { label: 'Applied', num: 1 },
              { label: 'Under Review', num: 2 },
              { label: 'Shortlisted', num: 3 },
              { label: isRejected ? 'Archived' : 'Selected', num: 4 },
            ];

            return (
              <div
                key={app.id}
                className="p-6 sm:p-7 rounded-3xl bg-slate-900/80 border border-slate-800 space-y-6 hover:border-slate-700 transition-all"
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    {app.companyLogoUrl ? (
                      <img
                        src={app.companyLogoUrl}
                        alt={app.companyName}
                        className="w-12 h-12 rounded-2xl object-cover border border-slate-800"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold">
                        {app.companyName?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-white">
                          <Link to={`/opportunities/${app.opportunityId}`} className="hover:text-blue-400 transition-colors">
                            {app.opportunityTitle}
                          </Link>
                        </h3>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          App #{app.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-400 mt-0.5">
                        <Building2 className="w-3.5 h-3.5 text-blue-400" />
                        <span>{app.companyName}</span>
                        <span>•</span>
                        <Calendar className="w-3.5 h-3.5 text-slate-500" />
                        <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(app.studentResumeUrl || app.resumeUrl) && (
                      <span className="text-[11px] font-semibold text-purple-300 flex items-center gap-1 bg-purple-950/60 border border-purple-800/60 px-2.5 py-1 rounded-xl">
                        <FileText className="w-3.5 h-3.5 text-purple-400" /> Resume Attached
                      </span>
                    )}
                    {app.matchScore && <ScoreMeter score={app.matchScore} size="sm" />}
                    <Link to={`/opportunities/${app.opportunityId}`}>
                      <Button variant="secondary" size="sm">
                        View Role
                      </Button>
                    </Link>
                  </div>
                </div>

                {/* Interactive Status Pipeline Stepper */}
                <div className="pt-4 border-t border-slate-800/80">
                  <div className="grid grid-cols-4 gap-2 relative">
                    {/* Background connector line */}
                    <div className="absolute top-1/2 left-[12.5%] right-[12.5%] -translate-y-1/2 h-1 bg-slate-800 z-0" />

                    {stages.map((stage) => {
                      const isActive = stage.num <= currentStage;
                      const isCurrent = stage.num === currentStage;

                      return (
                        <div key={stage.num} className="flex flex-col items-center relative z-10 text-center">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isCurrent && isSelected
                                ? 'bg-emerald-500 text-white ring-4 ring-emerald-500/20'
                                : isCurrent && isRejected
                                ? 'bg-rose-600 text-white ring-4 ring-rose-600/20'
                                : isActive
                                ? 'bg-blue-600 text-white ring-4 ring-blue-600/20'
                                : 'bg-slate-800 text-slate-500 border border-slate-700'
                            }`}
                          >
                            {stage.num < currentStage ? (
                              <CheckCircle2 className="w-5 h-5" />
                            ) : isCurrent && isRejected ? (
                              <XCircle className="w-5 h-5" />
                            ) : (
                              stage.num
                            )}
                          </div>
                          <span
                            className={`text-xs font-semibold mt-2 ${
                              isActive ? 'text-slate-200' : 'text-slate-500'
                            }`}
                          >
                            {stage.label}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Cover letter snippet */}
                {app.coverLetter && (
                  <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs text-slate-400 leading-relaxed">
                    <span className="font-semibold text-slate-300 block mb-1">Your Submission Note:</span>
                    {app.coverLetter}
                  </div>
                )}
              </div>
            );
          })}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => fetchApplications(p)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};
