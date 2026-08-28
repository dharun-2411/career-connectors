import React, { useState, useEffect } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { applicationApi } from '../../api/applicationApi';
import { aiApi } from '../../api/aiApi';
import { companyApi } from '../../api/companyApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import {
  Users,
  Sparkles,
  CheckCircle2,
  XCircle,
  FileText,
  ExternalLink,
  GraduationCap,
  Mail,
  Filter,
  Eye,
  Download,
} from 'lucide-react';

export const ApplicantReview = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const opportunityId = searchParams.get('opportunityId');

  const [opportunities, setOpportunities] = useState([]);
  const [applicants, setApplicants] = useState([]);
  const [aiRanking, setAiRanking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [selectedApplicant, setSelectedApplicant] = useState(null);
  const [viewingResume, setViewingResume] = useState(null);

  const handleOpenResume = (resumeUrl, candidateName, roleTitle = '') => {
    if (!resumeUrl) return;
    setViewingResume({
      url: resumeUrl,
      name: candidateName || 'Candidate',
      role: roleTitle,
    });
  };

  const handleDownloadResume = (resumeUrl, candidateName) => {
    if (!resumeUrl) return;
    try {
      if (resumeUrl.startsWith('data:')) {
        const link = document.createElement('a');
        link.href = resumeUrl;
        let ext = 'pdf';
        if (resumeUrl.startsWith('data:image/jpeg') || resumeUrl.startsWith('data:image/jpg')) {
          ext = 'jpg';
        } else if (resumeUrl.startsWith('data:image/png')) {
          ext = 'png';
        }
        link.download = `${(candidateName || 'Candidate').replace(/\s+/g, '_')}_Resume.${ext}`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      } else {
        window.open(resumeUrl, '_blank', 'noopener,noreferrer');
      }
    } catch (e) {
      console.error('Error downloading resume:', e);
      window.open(resumeUrl, '_blank');
    }
  };

  const fetchOpportunitiesList = async () => {
    try {
      const res = await companyApi.getMyOpportunities(0, 50);
      if (res && res.success) {
        setOpportunities(res.data.content || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const fetchApplicantsData = async () => {
    setLoading(true);
    try {
      if (opportunityId) {
        // Fetch AI Ranked applicants
        const [appRes, aiRes] = await Promise.allSettled([
          applicationApi.getOpportunityApplicants(opportunityId, 0, 50),
          aiApi.rankApplicants(opportunityId),
        ]);

        if (appRes.status === 'fulfilled' && appRes.value.success) {
          setApplicants(appRes.value.data.content || []);
        }
        if (aiRes.status === 'fulfilled' && aiRes.value.success) {
          setAiRanking(aiRes.value.data);
        }
      } else {
        const appRes = await applicationApi.getAllCompanyApplicants(0, 50);
        if (appRes && appRes.success) {
          setApplicants(appRes.data.content || []);
          setAiRanking(null);
        }
      }
    } catch (err) {
      console.error('Failed to load applicants:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunitiesList();
  }, []);

  useEffect(() => {
    fetchApplicantsData();
  }, [opportunityId]);

  const [updatingAppId, setUpdatingAppId] = useState(null);
  const [statusNotification, setStatusNotification] = useState(null);

  const handleStatusUpdate = async (applicationId, newStatus) => {
    if (!applicationId) return;
    setUpdatingAppId(applicationId);

    // 1. Optimistic instant UI update
    setApplicants((prev) =>
      prev.map((app) => (app.id === applicationId ? { ...app, status: newStatus } : app))
    );
    if (aiRanking?.rankedApplicants) {
      setAiRanking((prev) => ({
        ...prev,
        rankedApplicants: prev.rankedApplicants.map((a) =>
          a.applicationId === applicationId ? { ...a, status: newStatus } : a
        ),
      }));
    }
    if (selectedApplicant) {
      setSelectedApplicant((prev) => ({ ...prev, status: newStatus }));
    }

    try {
      await applicationApi.updateStatus(applicationId, newStatus);
      setStatusNotification(`Candidate status updated to ${newStatus.replace('_', ' ')}`);
      setTimeout(() => setStatusNotification(null), 3000);

      // Background data sync
      if (opportunityId) {
        const [appRes, aiRes] = await Promise.allSettled([
          applicationApi.getOpportunityApplicants(opportunityId, 0, 50),
          aiApi.rankApplicants(opportunityId),
        ]);
        if (appRes.status === 'fulfilled' && appRes.value?.success) {
          setApplicants(appRes.value.data.content || []);
        }
        if (aiRes.status === 'fulfilled' && aiRes.value?.success) {
          setAiRanking(aiRes.value.data);
        }
      } else {
        const appRes = await applicationApi.getAllCompanyApplicants(0, 50);
        if (appRes.status === 'fulfilled' && appRes.value?.success) {
          setApplicants(appRes.value.data.content || []);
        }
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      setStatusNotification('Failed to update candidate status. Please try again.');
      setTimeout(() => setStatusNotification(null), 4000);
    } finally {
      setUpdatingAppId(null);
    }
  };

  return (
    <DashboardLayout
      title="Applicant Evaluation & AI Ranking Pipeline"
      subtitle="Review candidate compatibility, analyze technical alignment, and advance applications through the hiring funnel."
    >
      {/* Toast Notification */}
      {statusNotification && (
        <div className="mb-6 p-4 rounded-2xl bg-blue-950/90 border border-blue-800 text-blue-200 text-sm font-semibold flex items-center gap-2 shadow-lg animate-fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
          <span>{statusNotification}</span>
        </div>
      )}

      {/* Opportunity Filter selector */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <Filter className="w-5 h-5 text-purple-400" />
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Filter by Job Posting:</span>
          <select
            value={opportunityId || ''}
            onChange={(e) => setSearchParams(e.target.value ? { opportunityId: e.target.value } : {})}
            className="px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-xs font-semibold focus:outline-none focus:border-purple-500"
          >
            <option value="">All Active Postings ({applicants.length} Total)</option>
            {opportunities.map((opp) => (
              <option key={opp.id} value={opp.id}>
                {opp.title} ({opp.applicantCount || 0} applicants)
              </option>
            ))}
          </select>
        </div>

        {opportunityId && aiRanking && (
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-purple-950/80 border border-purple-800/60 text-xs font-semibold text-purple-300">
            <Sparkles className="w-4 h-4 text-purple-400" />
            AI Multidimensional Ranking Active
          </div>
        )}
      </div>

      {loading ? (
        <Loader message="Loading applicants and ranking data..." />
      ) : applicants.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-slate-900/60 border border-slate-800 space-y-3">
          <Users className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No applicants found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto">
            Applications submitted for this posting will appear here with AI compatibility rankings.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* If AI Ranking available for this specific opportunity, display ranked cards */}
          {aiRanking?.rankedApplicants ? (
            aiRanking.rankedApplicants.map((applicant) => {
              const isUpdating = updatingAppId === applicant.applicationId;
              const currentStatus = applicant.status;

              return (
                <div
                  key={applicant.applicationId}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-purple-500/40 transition-all shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      {/* Rank Badge */}
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 flex items-center justify-center font-extrabold text-white text-lg shadow-lg shadow-purple-500/20 flex-shrink-0">
                        #{applicant.rank}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <h4 className="text-base font-bold text-white">{applicant.studentName}</h4>
                          <Badge
                            variant={
                              currentStatus === 'SELECTED'
                                ? 'success'
                                : currentStatus === 'SHORTLISTED'
                                ? 'purple'
                                : currentStatus === 'UNDER_REVIEW'
                                ? 'primary'
                                : 'default'
                            }
                            size="sm"
                          >
                            {currentStatus}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-400">
                          <span className="flex items-center gap-1">
                            <GraduationCap className="w-3.5 h-3.5 text-slate-500" />
                            {applicant.university || 'University Graduate'}
                          </span>
                          <span>•</span>
                          <span className="flex items-center gap-1">
                            <Mail className="w-3.5 h-3.5 text-slate-500" />
                            {applicant.email}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <ScoreMeter score={applicant.compositeScore} size="md" />
                      {(applicant.resumeUrl || applicant.studentResumeUrl) ? (
                        <button
                          type="button"
                          onClick={() => handleOpenResume(applicant.resumeUrl || applicant.studentResumeUrl, applicant.studentName, currentOpp?.title)}
                          className="px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-800 text-blue-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                          title="View role-specific candidate resume"
                        >
                          <FileText className="w-4 h-4 text-blue-400" /> View Resume
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-medium flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-500" /> No Resume
                        </span>
                      )}
                    </div>
                  </div>

                  {/* AI Recommendation breakdown summary */}
                  <div className="p-4 rounded-2xl bg-slate-950/80 border border-slate-800/80 space-y-2 text-xs">
                    <div className="text-slate-300 leading-relaxed font-medium">
                      <span className="text-purple-400 font-bold">AI Assessment: </span>
                      {applicant.aiRecommendationSummary}
                    </div>

                    <div className="flex flex-wrap items-center gap-4 pt-2 border-t border-slate-800/60">
                      {applicant.topMatchingSkills?.length > 0 && (
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-slate-400 font-semibold">Matched Skills:</span>
                          {applicant.topMatchingSkills.map((s, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800/50 text-[11px]">
                              {s}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Status Action Buttons */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                    <span className="text-xs text-slate-400 font-medium">
                      Advance Candidate Pipeline:
                    </span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(applicant.applicationId, 'UNDER_REVIEW')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'UNDER_REVIEW'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Under Review {currentStatus === 'UNDER_REVIEW' && '✓'}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(applicant.applicationId, 'SHORTLISTED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'SHORTLISTED'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-purple-300'
                        }`}
                      >
                        Shortlist {currentStatus === 'SHORTLISTED' && '✓'}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(applicant.applicationId, 'SELECTED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'SELECTED'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-emerald-300'
                        }`}
                      >
                        Select {currentStatus === 'SELECTED' && '✓'}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(applicant.applicationId, 'REJECTED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'REJECTED'
                            ? 'bg-rose-900 text-rose-200 ring-2 ring-rose-500'
                            : 'bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-800'
                        }`}
                      >
                        Reject {currentStatus === 'REJECTED' && '✓'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          ) : (
            // Standard listing across all postings
            applicants.map((app) => {
              const isUpdating = updatingAppId === app.id;
              const currentStatus = app.status;

              return (
                <div
                  key={app.id}
                  className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-4 hover:border-slate-700 transition-all shadow-lg"
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1.5">
                      <div className="flex items-center gap-2">
                        <h4 className="text-base font-bold text-white">{app.studentName}</h4>
                        <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          App #{app.id}
                        </span>
                        <Badge
                          variant={
                            currentStatus === 'SELECTED'
                              ? 'success'
                              : currentStatus === 'SHORTLISTED'
                              ? 'purple'
                              : currentStatus === 'UNDER_REVIEW'
                              ? 'primary'
                              : 'default'
                          }
                          size="sm"
                        >
                          {currentStatus}
                        </Badge>
                      </div>
                      <div className="text-xs text-slate-400">
                        Applied for: <strong className="text-slate-200">{app.opportunityTitle}</strong> • {app.studentUniversity}
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      {app.matchScore && <ScoreMeter score={app.matchScore} size="sm" />}
                      {(app.resumeUrl || app.studentResumeUrl) ? (
                        <button
                          type="button"
                          onClick={() => handleOpenResume(app.resumeUrl || app.studentResumeUrl, app.studentName, app.opportunityTitle)}
                          className="px-3 py-2 rounded-xl bg-blue-950/70 hover:bg-blue-900 border border-blue-800 text-blue-300 hover:text-white flex items-center gap-1.5 text-xs font-semibold shadow-sm transition-all cursor-pointer"
                          title="View role-specific candidate resume"
                        >
                          <FileText className="w-4 h-4 text-blue-400" /> View Resume
                        </button>
                      ) : (
                        <span className="px-2.5 py-1.5 rounded-xl bg-slate-800/50 border border-slate-700/50 text-slate-400 text-xs font-medium flex items-center gap-1">
                          <FileText className="w-3.5 h-3.5 text-slate-500" /> No Resume
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Status Action Buttons for general list */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-800/60">
                    <span className="text-xs text-slate-400 font-medium">Candidate Stage:</span>
                    <div className="flex items-center gap-2 flex-wrap">
                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(app.id, 'UNDER_REVIEW')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'UNDER_REVIEW'
                            ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 ring-2 ring-blue-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                        }`}
                      >
                        Under Review {currentStatus === 'UNDER_REVIEW' && '✓'}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(app.id, 'SHORTLISTED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'SHORTLISTED'
                            ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30 ring-2 ring-purple-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-purple-300'
                        }`}
                      >
                        Shortlist {currentStatus === 'SHORTLISTED' && '✓'}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(app.id, 'SELECTED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'SELECTED'
                            ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30 ring-2 ring-emerald-400'
                            : 'bg-slate-800 hover:bg-slate-700 text-emerald-300'
                        }`}
                      >
                        Select {currentStatus === 'SELECTED' && '✓'}
                      </button>

                      <button
                        type="button"
                        disabled={isUpdating}
                        onClick={() => handleStatusUpdate(app.id, 'REJECTED')}
                        className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                          currentStatus === 'REJECTED'
                            ? 'bg-rose-900 text-rose-200 ring-2 ring-rose-500'
                            : 'bg-slate-900 hover:bg-rose-950 text-rose-400 border border-slate-800'
                        }`}
                      >
                        Reject {currentStatus === 'REJECTED' && '✓'}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      )}

      {/* In-App Candidate Resume Preview Modal */}
      {viewingResume && (
        <Modal
          isOpen={!!viewingResume}
          onClose={() => setViewingResume(null)}
          title={`Candidate Resume • ${viewingResume.name} ${viewingResume.role ? `(${viewingResume.role})` : ''}`}
          maxWidth="max-w-4xl"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-950 border border-slate-800 text-xs">
              <div className="flex items-center gap-2 text-slate-300">
                <FileText className="w-4 h-4 text-purple-400" />
                <span className="font-semibold">
                  {viewingResume.role ? `Tailored for ${viewingResume.role}` : `${viewingResume.name}_Resume`}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="primary"
                  size="sm"
                  icon={Download}
                  onClick={() => handleDownloadResume(viewingResume.url, viewingResume.name)}
                >
                  Download Document
                </Button>
                {viewingResume.url.startsWith('http') && (
                  <a
                    href={viewingResume.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-3 py-1.5 rounded-lg border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" /> Open in Tab
                  </a>
                )}
              </div>
            </div>

            <div className="w-full h-[65vh] bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden flex items-center justify-center p-2">
              {viewingResume.url.startsWith('data:image/') ? (
                <img
                  src={viewingResume.url}
                  alt={`${viewingResume.name} Resume`}
                  className="max-h-full max-w-full object-contain rounded-lg shadow-md"
                />
              ) : viewingResume.url.startsWith('data:application/pdf') || viewingResume.url.endsWith('.pdf') ? (
                <iframe
                  src={viewingResume.url}
                  title={`${viewingResume.name} Resume Preview`}
                  className="w-full h-full border-0 rounded-lg bg-white"
                />
              ) : (
                <div className="p-8 text-center space-y-4">
                  <div className="w-16 h-16 rounded-2xl bg-purple-950/60 border border-purple-800 flex items-center justify-center text-purple-400 mx-auto">
                    <FileText className="w-8 h-8" />
                  </div>
                  <div>
                    <h4 className="text-base font-bold text-white mb-1">Resume Attached</h4>
                    <p className="text-xs text-slate-400 max-w-sm mx-auto">
                      Click the button below to download and view the candidate's document in your preferred viewer.
                    </p>
                  </div>
                  <Button
                    variant="primary"
                    size="md"
                    icon={Download}
                    onClick={() => handleDownloadResume(viewingResume.url, viewingResume.name)}
                  >
                    Download Candidate Resume
                  </Button>
                </div>
              )}
            </div>
          </div>
        </Modal>
      )}
    </DashboardLayout>
  );
};
