import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import {
  Briefcase,
  Users,
  PlusCircle,
  MapPin,
  Calendar,
  Trash2,
  Lock,
  ExternalLink,
  User,
  GraduationCap,
  Sparkles,
} from 'lucide-react';

export const ManageOpportunities = () => {
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async (page = 0) => {
    setLoading(true);
    try {
      const [oppRes, profRes] = await Promise.allSettled([
        companyApi.getMyOpportunities(page, 10),
        companyApi.getProfile(),
      ]);
      if (oppRes.status === 'fulfilled' && oppRes.value.success) {
        setOpportunities(oppRes.value.data.content || []);
        setTotalPages(oppRes.value.data.totalPages || 0);
        setCurrentPage(oppRes.value.data.pageNumber || 0);
      }
      if (profRes.status === 'fulfilled' && profRes.value.success) {
        setProfile(profRes.value.data);
      }
    } catch (err) {
      console.error('Error loading company opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(0);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this opportunity?')) return;
    try {
      await companyApi.deleteOpportunity(id);
      fetchOpportunities(currentPage);
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
    }
  };

  const handleClosePosting = async (opp) => {
    try {
      await companyApi.updateOpportunity(opp.id, {
        status: opp.status === 'OPEN' ? 'CLOSED' : 'OPEN',
      });
      fetchOpportunities(currentPage);
    } catch (err) {
      console.error('Failed to toggle status:', err);
    }
  };

  const isVerified = profile?.verificationStatus === 'VERIFIED';

  return (
    <DashboardLayout
      title="Manage Opportunity Postings"
      subtitle="View, edit, toggle availability, and review registered student candidate lists for your listings."
      action={
        isVerified ? (
          <Link to="/company/post-opportunity">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Post New Role
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" size="sm" icon={Lock} disabled title="Company account must be verified by admin to post opportunities">
            Post New Role (Pending Approval)
          </Button>
        )
      }
    >
      {/* Verification notice if pending */}
      {!isVerified && profile && (
        <div className="mb-6 p-4 rounded-2xl bg-amber-950/60 border border-amber-800/60 flex items-center justify-between text-amber-300 text-sm">
          <div className="flex items-center gap-3">
            <Lock className="w-5 h-5 flex-shrink-0 text-amber-400" />
            <span>
              Your company is currently <strong>Pending Admin Review</strong>. Once approved, you can create new postings and receive candidate applicants.
            </span>
          </div>
          <Link to="/company/profile">
            <Button variant="secondary" size="sm">
              Review Profile
            </Button>
          </Link>
        </div>
      )}
      {loading ? (
        <Loader message="Loading your opportunity postings..." />
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <Briefcase className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No active postings yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Post an opportunity to begin receiving AI-scored candidate applications.
          </p>
          <Link to="/company/post-opportunity">
            <Button variant="primary" size="md">
              Create Your First Posting
            </Button>
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {opportunities.map((opp) => (
            <div
              key={opp.id}
              className="p-6 sm:p-7 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-5 hover:border-slate-700 transition-all shadow-lg"
            >
              {/* Header row */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                <div className="space-y-2 flex-1">
                  <div className="flex items-center gap-2">
                    <Badge variant={opp.status === 'OPEN' ? 'success' : 'default'} size="sm">
                      {opp.status}
                    </Badge>
                    <Badge variant="primary" size="sm">{opp.type.replace('_', ' ')}</Badge>
                    {opp.isRemote && <Badge variant="cyan" size="sm">Remote</Badge>}
                  </div>

                  <h3 className="text-xl font-bold text-white">
                    <Link to={`/opportunities/${opp.id}`} className="hover:text-blue-400 transition-colors">
                      {opp.title}
                    </Link>
                  </h3>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-slate-500" />
                      {opp.location}
                    </span>
                    <span>•</span>
                    <span>Stipend: <strong className="text-slate-200">{opp.stipend || 'Competitive'}</strong></span>
                    <span>•</span>
                    <span>Deadline: <strong className="text-slate-200">{opp.deadline || 'Rolling'}</strong></span>
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center gap-3">
                  <Link to={`/company/applicants?opportunityId=${opp.id}`}>
                    <Button variant="accent" size="sm" icon={Users}>
                      Pipeline ({opp.applicantCount || 0})
                    </Button>
                  </Link>

                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => handleClosePosting(opp)}
                  >
                    {opp.status === 'OPEN' ? 'Close' : 'Reopen'}
                  </Button>

                  <button
                    onClick={() => handleDelete(opp.id)}
                    title="Delete Posting"
                    className="p-2.5 rounded-xl border border-slate-800 text-slate-500 hover:text-rose-400 hover:bg-slate-950 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Applicant Student Names List */}
              <div className="pt-4 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-purple-400" /> Registered Student Applicants ({opp.applicantCount || 0})
                  </span>
                  {opp.recentApplicants?.length > 0 && (
                    <Link
                      to={`/company/applicants?opportunityId=${opp.id}`}
                      className="text-blue-400 hover:text-blue-300 font-semibold flex items-center gap-1"
                    >
                      Evaluate in Pipeline &rarr;
                    </Link>
                  )}
                </div>

                {opp.recentApplicants && opp.recentApplicants.length > 0 ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 pt-1">
                    {opp.recentApplicants.map((app) => (
                      <Link
                        key={app.applicationId || app.studentId}
                        to={`/company/applicants?opportunityId=${opp.id}`}
                        className="p-3 rounded-xl bg-slate-950/80 border border-slate-800/80 hover:border-purple-500/50 flex items-center justify-between gap-3 group transition-all"
                      >
                        <div className="flex items-center gap-2.5 truncate">
                          <div className="w-7 h-7 rounded-lg bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-300 font-bold text-xs flex-shrink-0">
                            {app.studentName ? app.studentName.substring(0, 1).toUpperCase() : 'S'}
                          </div>
                          <div className="truncate">
                            <span className="text-xs font-bold text-white group-hover:text-purple-300 transition-colors block truncate">
                              {app.studentName}
                            </span>
                            <span className="text-[10px] text-slate-500 block truncate">
                              {app.studentUniversity || app.studentEmail}
                            </span>
                          </div>
                        </div>

                        <Badge
                          variant={
                            app.status === 'SELECTED'
                              ? 'success'
                              : app.status === 'SHORTLISTED'
                              ? 'purple'
                              : app.status === 'UNDER_REVIEW'
                              ? 'primary'
                              : 'default'
                          }
                          size="sm"
                        >
                          {app.status}
                        </Badge>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <div className="p-3.5 rounded-xl bg-slate-950/40 border border-slate-800/60 text-xs text-slate-500 flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-slate-600" />
                    <span>No students have submitted applications for this role yet.</span>
                  </div>
                )}
              </div>
            </div>
          ))}

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => fetchOpportunities(p)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};
