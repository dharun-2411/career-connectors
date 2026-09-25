import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { opportunityApi } from '../../api/opportunityApi';
import { applicationApi } from '../../api/applicationApi';
import { studentApi } from '../../api/studentApi';
import { aiApi } from '../../api/aiApi';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import {
  Building2,
  MapPin,
  Calendar,
  Clock,
  DollarSign,
  Briefcase,
  Sparkles,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Target,
  Upload,
  FileText,
} from 'lucide-react';

export const OpportunityDetail = () => {
  const { id } = useParams();
  const { isStudent, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const [opp, setOpp] = useState(null);
  const [matchData, setMatchData] = useState(null);
  const [studentProfile, setStudentProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Apply Modal state
  const [applyModalOpen, setApplyModalOpen] = useState(false);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [tailoredResumeUrl, setTailoredResumeUrl] = useState(null);
  const [tailoredResumeName, setTailoredResumeName] = useState('');

  const fetchOpportunity = async () => {
    try {
      const res = await opportunityApi.getOpportunityDetails(id);
      if (res && res.success) {
        setOpp(res.data);
      }
    } catch (err) {
      console.error('Failed to load opportunity:', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatchBreakdown = async () => {
    if (!isStudent) return;
    try {
      const res = await aiApi.getMatchScore(id);
      if (res && res.success) {
        setMatchData(res.data);
      }
    } catch (err) {
      console.warn('AI matching service unavailable, relying on default match:', err);
    }
  };

  const fetchStudentProfile = async () => {
    if (!isStudent) return;
    try {
      const res = await studentApi.getProfile();
      if (res && res.success) {
        setStudentProfile(res.data);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchOpportunity();
    if (isStudent) {
      fetchMatchBreakdown();
      fetchStudentProfile();
    }
  }, [id, isStudent]);

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    setApplying(true);
    setApplyError('');

    try {
      const effectiveResumeUrl = tailoredResumeUrl || studentProfile?.resumeUrl;
      const effectiveResumeName = tailoredResumeName || studentProfile?.resumeFileName;
      const res = await applicationApi.apply(id, coverLetter, effectiveResumeUrl, effectiveResumeName);
      if (res && res.success) {
        setApplySuccess(true);
        setOpp((prev) => (prev ? { ...prev, hasApplied: true } : prev));
        fetchOpportunity();
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading opportunity specification..." />;
  if (!opp) return <div className="p-8 text-center text-slate-500">Opportunity not found.</div>;

  return (
    <DashboardLayout breadcrumb="Opportunity Scope">
      {/* Back button */}
      <div className="mb-4">
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Opportunities
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Main Opportunity Spec */}
        <div className="lg:col-span-2 space-y-6">
          {/* Header Card */}
          <div className="p-6 sm:p-7 rounded-2xl bg-white border border-slate-200/90 shadow-sm space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {opp.companyLogoUrl ? (
                  <img
                    src={opp.companyLogoUrl}
                    alt={opp.companyName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-100 shadow-sm"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-extrabold text-lg">
                    {opp.companyName?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight">{opp.title}</h1>
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-indigo-600 font-bold">
                    <Building2 className="w-3.5 h-3.5" />
                    <span>{opp.companyName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="primary" size="md">{opp.type.replace('_', ' ')}</Badge>
                {opp.isRemote && <Badge variant="success" size="md">Remote</Badge>}
              </div>
            </div>

            {/* Quick Details Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-slate-50 border border-slate-200/80">
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Location</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opp.isRemote ? 'Remote / Flexible' : opp.location}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Stipend / Comp</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-600" />
                  {opp.stipend || 'Competitive'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Duration</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {opp.duration || 'Flexible'}
                </span>
              </div>
              <div>
                <span className="text-[10px] text-slate-400 uppercase tracking-wider block font-bold">Deadline</span>
                <span className="text-xs font-bold text-slate-800 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-500" />
                  {opp.deadline || 'Rolling basis'}
                </span>
              </div>
            </div>

            {/* Opportunity Description */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-2">Role Overview &amp; Description</h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed whitespace-pre-line">
                {opp.description}
              </p>
            </div>

            {/* Required Skills Matrix */}
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 mb-3">Required Technical Skills &amp; Weightages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opp.requiredSkills?.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-bold text-slate-900">{skill.skillName}</div>
                      <div className="text-[11px] text-slate-500 mt-0.5">
                        Required: <span className="text-indigo-600 font-bold">{skill.requiredProficiency}</span>
                      </div>
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-white border border-slate-200 text-slate-600">
                      Weight: {skill.weightage}x
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Right Col: AI Match Widget & Application Trigger */}
        <div className="space-y-6">
          {isStudent && (
            <div className="p-6 rounded-2xl bg-white border border-slate-200/90 space-y-5 shadow-sm">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-amber-500" />
                <h3 className="text-sm font-extrabold text-slate-900">AI Compatibility Assessment</h3>
              </div>

              {/* Large Score Meter */}
              <ScoreMeter score={matchData?.overallScore || opp.matchScore || 0} size="lg" />

              {matchData?.explanation && (
                <p className="text-xs text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200 leading-relaxed">
                  {matchData.explanation}
                </p>
              )}

              {/* Skill Gap Analysis Navigation CTA */}
              <Link to={`/student/skill-gap/${opp.id}`} className="block">
                <Button variant="secondary" size="md" className="w-full text-xs font-bold" icon={Target}>
                  Analyze Skill Gap &amp; Roadmap
                </Button>
              </Link>

              {/* Apply Button */}
              {opp.hasApplied ? (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-center font-bold text-xs flex items-center justify-center gap-2">
                  <CheckCircle2 className="w-4 h-4" /> Application Submitted
                </div>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full text-xs font-bold"
                  onClick={() => setApplyModalOpen(true)}
                >
                  Apply to Deliverable Role
                </Button>
              )}
            </div>
          )}

          {/* Company Mini Card */}
          <div className="p-5 rounded-2xl bg-white border border-slate-200/90 space-y-2 shadow-sm">
            <h4 className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider">About the Employer Host</h4>
            <div className="text-xs font-bold text-slate-900">{opp.companyName}</div>
            <p className="text-[11px] text-slate-500 leading-relaxed">
              Verified externship host offering real-world career acceleration and mentorship.
            </p>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      <Modal
        isOpen={applyModalOpen}
        onClose={() => setApplyModalOpen(false)}
        title={applySuccess ? 'Application Received!' : `Apply to ${opp.title}`}
      >
        {applySuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Your application was submitted!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              Your profile, contact details, and AI skill assessment have been transmitted to {opp.companyName}.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link to="/student/applications">
                <Button variant="primary" size="md">
                  View in Applications Tracker
                </Button>
              </Link>
              <Button variant="secondary" size="md" onClick={() => setApplyModalOpen(false)}>
                Close
              </Button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleApplySubmit} className="space-y-4">
            {applyError && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {applyError}
              </div>
            )}

            {/* Mandatory Resume Attachment Section */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-600" /> Attached Candidate Resume
                </span>
                {(tailoredResumeUrl || studentProfile?.resumeUrl) ? (
                  <span className="text-[11px] font-bold text-emerald-700 px-2 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {tailoredResumeUrl ? 'Tailored Resume Ready' : 'Profile Resume Ready'}
                  </span>
                ) : (
                  <span className="text-[11px] font-bold text-rose-700 px-2 py-0.5 rounded-full bg-rose-50 border border-rose-200">
                    Mandatory
                  </span>
                )}
              </div>

              {(tailoredResumeUrl || studentProfile?.resumeUrl) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-700 bg-white p-3 rounded-xl border border-slate-200">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${tailoredResumeUrl ? 'text-indigo-600' : 'text-purple-600'}`} />
                      <div className="truncate">
                        <div className="truncate font-bold text-slate-900">
                          {tailoredResumeName || studentProfile?.resumeFileName || `${studentProfile?.name || 'Candidate'}_Resume.pdf`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tailoredResumeUrl ? 'Domain-specific tailored resume for this application' : 'Default profile resume'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <label className="text-xs text-indigo-600 hover:text-indigo-800 font-bold cursor-pointer">
                        {uploadingResume ? 'Saving...' : 'Upload Tailored'}
                        <input
                          type="file"
                          accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                          className="hidden"
                          disabled={uploadingResume}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (!file) return;
                            setUploadingResume(true);
                            const reader = new FileReader();
                            reader.onload = async (event) => {
                              try {
                                const dataUrl = event.target.result;
                                setTailoredResumeUrl(dataUrl);
                                setTailoredResumeName(file.name);
                                await studentApi.updateProfile({
                                  resumeUrl: dataUrl,
                                  resumeFileName: file.name,
                                });
                                setStudentProfile((prev) => ({
                                  ...(prev || {}),
                                  resumeUrl: dataUrl,
                                  resumeFileName: file.name,
                                }));
                              } catch (err) {
                                console.error('Failed to attach tailored resume:', err);
                              } finally {
                                setUploadingResume(false);
                              }
                            };
                            reader.readAsDataURL(file);
                          }}
                        />
                      </label>
                      {tailoredResumeUrl && (
                        <button
                          type="button"
                          onClick={() => {
                            setTailoredResumeUrl(null);
                            setTailoredResumeName('');
                          }}
                          className="text-[10px] text-slate-400 hover:text-slate-600 underline"
                        >
                          Use Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-slate-500 leading-relaxed">
                    Upload your domain-specific resume for this role to proceed.
                  </p>
                  <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-indigo-300 hover:border-indigo-500 bg-indigo-50/50 hover:bg-indigo-50 text-indigo-700 text-xs font-bold flex items-center justify-center gap-2 cursor-pointer transition-colors">
                    <Upload className="w-4 h-4" />
                    {uploadingResume ? 'Attaching Resume...' : 'Upload Role Resume (PDF / DOCX)'}
                    <input
                      type="file"
                      accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                      className="hidden"
                      disabled={uploadingResume}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (!file) return;
                        setUploadingResume(true);
                        const reader = new FileReader();
                        reader.onload = async (event) => {
                          try {
                            const dataUrl = event.target.result;
                            setTailoredResumeUrl(dataUrl);
                            setTailoredResumeName(file.name);
                            await studentApi.updateProfile({
                              resumeUrl: dataUrl,
                              resumeFileName: file.name,
                            });
                            setStudentProfile((prev) => ({
                              ...(prev || {}),
                              resumeUrl: dataUrl,
                              resumeFileName: file.name,
                            }));
                          } catch (err) {
                            console.error('Failed to save resume:', err);
                            setApplyError(err.response?.data?.message || err.message || 'Failed to upload resume');
                          } finally {
                            setUploadingResume(false);
                          }
                        };
                        reader.readAsDataURL(file);
                      }}
                    />
                  </label>
                </div>
              )}
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">
                Cover Note / Why are you a great fit? (Optional)
              </label>
              <textarea
                rows={3}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Share relevant projects, portfolio highlights, or key skills..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" size="md" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={applying}
                disabled={(!studentProfile?.resumeUrl && !tailoredResumeUrl) || uploadingResume}
              >
                {!studentProfile?.resumeUrl && !tailoredResumeUrl ? 'Upload Resume to Apply' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};
