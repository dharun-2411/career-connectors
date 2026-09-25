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
      title="Candidate Application Tracker"
      subtitle="Monitor candidate milestone progression across submitted roles and externship contracts in real-time."
      breadcrumb="Application Tracker"
    >
      {loading ? (
        <Loader message="Loading application statuses..." />
      ) : applications.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-4">
          <FileCheck2 className="w-12 h-12 text-slate-300 mx-auto" />
          <h3 className="text-base font-extrabold text-slate-900">No active applications found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
            You haven't applied to any opportunities yet. Explore our open externship scope listings and submit with your AI match score!
          </p>
          <Link to="/opportunities">
            <Button variant="primary" size="md">
              Browse Open Opportunities
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
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
                className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-5 hover:border-slate-300 shadow-sm transition-all"
              >
                {/* Top Bar */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3.5">
                    {app.companyLogoUrl ? (
                      <img
                        src={app.companyLogoUrl}
                        alt={app.companyName}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-100 shadow-sm"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-extrabold text-sm">
                        {app.companyName?.substring(0, 2).toUpperCase()}
                      </div>
                    )}
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-extrabold text-slate-900">
                          <Link to={`/opportunities/${app.opportunityId}`} className="hover:text-indigo-600 transition-colors">
                            {app.opportunityTitle}
                          </Link>
                        </h3>
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-slate-100 text-slate-600 border border-slate-200">
                          App #{app.id}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-slate-500 mt-0.5 font-medium">
                        <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                        <span>{app.companyName}</span>
                        <span>•</span>
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        <span>Applied on {new Date(app.appliedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    {(app.studentResumeUrl || app.resumeUrl) && (
                      <span className="text-[11px] font-bold text-indigo-700 flex items-center gap-1 bg-indigo-50 border border-indigo-200/70 px-2.5 py-1 rounded-full">
                        <FileText className="w-3.5 h-3.5 text-indigo-600" /> Resume Attached
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
                <div className="pt-3 border-t border-slate-100">
                  <div className="grid grid-cols-4 gap-2 relative">
                    {/* Background connector line */}
                    <div className="absolute top-1/2 left-[12.5%] right-[12.5%] -translate-y-1/2 h-1 bg-slate-100 z-0" />

                    {stages.map((stage) => {
                      const isActive = stage.num <= currentStage;
                      const isCurrent = stage.num === currentStage;

                      return (
                        <div key={stage.num} className="flex flex-col items-center relative z-10 text-center">
                          <div
                            className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all duration-300 ${
                              isCurrent && isSelected
                                ? 'bg-emerald-600 text-white shadow-sm ring-4 ring-emerald-100'
                                : isCurrent && isRejected
                                ? 'bg-rose-600 text-white shadow-sm ring-4 ring-rose-100'
                                : isActive
                                ? 'bg-indigo-600 text-white shadow-sm ring-4 ring-indigo-100'
                                : 'bg-slate-100 text-slate-400 border border-slate-200'
                            }`}
                          >
                            {stage.num < currentStage ? (
                              <CheckCircle2 className="w-4 h-4" />
                            ) : isCurrent && isRejected ? (
                              <XCircle className="w-4 h-4" />
                            ) : (
                              stage.num
                            )}
                          </div>
                          <span
                            className={`text-[11px] font-bold mt-1.5 ${
                              isActive ? 'text-slate-800' : 'text-slate-400'
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
                  <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-600 leading-relaxed">
                    <span className="font-bold text-slate-800 block mb-0.5">Your Submission Note:</span>
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

