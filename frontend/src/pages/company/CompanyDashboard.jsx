import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { applicationApi } from '../../api/applicationApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  Briefcase,
  Users,
  CheckCircle2,
  PlusCircle,
  Clock,
  Sparkles,
  ArrowRight,
  TrendingUp,
  FileText,
  Lock,
} from 'lucide-react';

export const CompanyDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [opportunities, setOpportunities] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [profRes, oppRes, appRes] = await Promise.allSettled([
          companyApi.getProfile(),
          companyApi.getMyOpportunities(0, 5),
          applicationApi.getAllCompanyApplicants(0, 5),
        ]);

        if (profRes.status === 'fulfilled' && profRes.value.success) {
          setProfile(profRes.value.data);
        }
        if (oppRes.status === 'fulfilled' && oppRes.value.success) {
          setOpportunities(oppRes.value.data.content || []);
        }
        if (appRes.status === 'fulfilled' && appRes.value.success) {
          setApplicants(appRes.value.data.content || []);
        }
      } catch (err) {
        console.error('Error loading company dashboard:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) return <Loader fullScreen message="Loading recruiter dashboard..." />;

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const shortlistedCount = applicants.filter((a) => a.status === 'SHORTLISTED' || a.status === 'SELECTED').length;

  return (
    <DashboardLayout
      title={`Recruiter Console • ${profile?.name || 'Company'}`}
      subtitle="Manage your posted opportunities, view AI-ranked applicants, and streamline candidate selections."
      action={
        isVerified ? (
          <Link to="/company/post-opportunity">
            <Button variant="primary" size="sm" icon={PlusCircle}>
              Post New Opportunity
            </Button>
          </Link>
        ) : (
          <Button variant="secondary" size="sm" icon={Lock} disabled title="Company account must be approved by admin before posting opportunities">
            Post Opportunity (Pending Approval)
          </Button>
        )
      }
    >
      {/* Verification status notice */}
      {!isVerified ? (
        <div className="mb-8 p-5 rounded-2xl bg-amber-50 border border-amber-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-amber-900 text-sm">
          <div className="flex items-start sm:items-center gap-3">
            <Clock className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5 sm:mt-0" />
            <div>
              <div className="font-bold text-amber-900">Company Verification Pending Admin Review</div>
              <div className="text-xs text-amber-700 mt-0.5">
                Your employer profile is currently awaiting administrator review. Once verified by the platform administrator, you will unlock job posting, applicant pipeline management, and recruitment tools.
              </div>
            </div>
          </div>
          <Link to="/company/profile" className="flex-shrink-0">
            <Button variant="secondary" size="sm">
              Review Profile & Docs
            </Button>
          </Link>
        </div>
      ) : (
        <div className="mb-8 p-3.5 px-4 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-between text-xs text-emerald-800">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Verified Employer Account</strong>: Approved by admin. You can post work opportunities, review applicants, and hire talent.</span>
          </div>
          <span className="font-bold text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full border border-emerald-200 text-[11px]">
            VERIFIED
          </span>
        </div>
      )}

      {/* Metrics Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <Briefcase className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{opportunities.length}</div>
            <div className="text-xs text-slate-500 font-medium">Active Postings</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{applicants.length}</div>
            <div className="text-xs text-slate-500 font-medium">Total Applicants Received</div>
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-100 flex items-center justify-center text-emerald-600">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-bold text-slate-900">{shortlistedCount}</div>
            <div className="text-xs text-slate-500 font-medium">Shortlisted / Selected Candidates</div>
          </div>
        </div>
      </div>

      {/* Active Postings & Pipeline Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Active Postings */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Your Posted Opportunities</h3>
            <Link to="/company/opportunities" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Manage All &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {opportunities.map((opp) => (
              <div
                key={opp.id}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-nexus-sm hover:shadow-nexus transition-all flex items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <Badge variant="indigo" size="sm">{opp.type.replace('_', ' ')}</Badge>
                    <span className="text-xs text-slate-500">{opp.location}</span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900">{opp.title}</h4>
                  <div className="text-xs text-slate-500">
                    Applicants: <span className="font-semibold text-slate-800">{opp.applicantCount || 0}</span>
                  </div>
                </div>

                <Link to={`/company/applicants?opportunityId=${opp.id}`}>
                  <Button variant="secondary" size="sm">
                    View Applicants
                  </Button>
                </Link>
              </div>
            ))}

            {opportunities.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs shadow-nexus-sm">
                You have not posted any opportunities yet.
              </div>
            )}
          </div>
        </div>

        {/* Incoming Applicants Pipeline */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">Recent Candidates Pipeline</h3>
            <Link to="/company/applicants" className="text-xs font-semibold text-indigo-600 hover:text-indigo-700">
              Review Pipeline &rarr;
            </Link>
          </div>

          <div className="space-y-3">
            {applicants.map((app) => (
              <div
                key={app.id}
                className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-slate-900">{app.studentName}</span>
                  {app.matchScore && <ScoreMeter score={app.matchScore} size="sm" />}
                </div>
                <div className="text-xs text-slate-500 flex items-center justify-between">
                  <span>Applied for: <strong className="text-slate-800">{app.opportunityTitle}</strong></span>
                  <div className="flex items-center gap-2">
                    {(app.studentResumeUrl || app.resumeUrl) && (
                      <Link
                        to={`/company/applicants?opportunityId=${app.opportunityId}`}
                        className="px-2 py-0.5 rounded-lg bg-indigo-50 border border-indigo-100 text-indigo-700 hover:text-indigo-800 flex items-center gap-1 text-[11px] font-semibold transition-colors"
                      >
                        <FileText className="w-3 h-3" /> Resume
                      </Link>
                    )}
                    <Badge variant={app.status === 'SELECTED' ? 'emerald' : app.status === 'SHORTLISTED' ? 'purple' : 'default'} size="sm">
                      {app.status}
                    </Badge>
                  </div>
                </div>
              </div>
            ))}

            {applicants.length === 0 && (
              <div className="p-8 text-center rounded-2xl bg-white border border-slate-200 text-slate-500 text-xs shadow-nexus-sm">
                No candidate applications received yet.
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
