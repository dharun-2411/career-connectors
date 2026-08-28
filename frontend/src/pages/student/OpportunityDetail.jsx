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
        fetchOpportunity();
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading opportunity specification..." />;
  if (!opp) return <div className="p-8 text-center text-slate-400">Opportunity not found.</div>;

  return (
    <DashboardLayout>
      {/* Back button */}
      <div className="mb-6">
        <Link
          to="/opportunities"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Opportunities
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Main Opportunity Spec */}
        <div className="lg:col-span-2 space-y-8">
          {/* Header Card */}
          <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                {opp.companyLogoUrl ? (
                  <img
                    src={opp.companyLogoUrl}
                    alt={opp.companyName}
                    className="w-14 h-14 rounded-2xl object-cover border border-slate-800"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-slate-800 flex items-center justify-center text-slate-300 font-bold text-lg">
                    {opp.companyName?.substring(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold text-white">{opp.title}</h1>
                  <div className="flex items-center gap-2 mt-1 text-sm text-blue-400 font-medium">
                    <Building2 className="w-4 h-4" />
                    <span>{opp.companyName}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <Badge variant="primary" size="lg">{opp.type.replace('_', ' ')}</Badge>
                {opp.isRemote && <Badge variant="success" size="lg">Remote</Badge>}
              </div>
            </div>

            {/* Quick Details Chips */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Location</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  {opp.isRemote ? 'Remote / Flexible' : opp.location}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Stipend / Comp</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                  <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
                  {opp.stipend || 'Competitive'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Duration</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  {opp.duration || 'Flexible'}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-500 uppercase tracking-wider block font-semibold">Deadline</span>
                <span className="text-xs sm:text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1">
                  <Calendar className="w-3.5 h-3.5 text-amber-400" />
                  {opp.deadline || 'Rolling basis'}
                </span>
              </div>
            </div>

            {/* Opportunity Description */}
            <div>
              <h3 className="text-base font-bold text-white mb-3">Role Overview & Description</h3>
              <p className="text-sm text-slate-300 leading-relaxed whitespace-pre-line">
                {opp.description}
              </p>
            </div>

            {/* Required Skills Matrix */}
            <div>
              <h3 className="text-base font-bold text-white mb-4">Required Technical Skills & Weightages</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {opp.requiredSkills?.map((skill) => (
                  <div
                    key={skill.id}
                    className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-sm font-bold text-white">{skill.skillName}</div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Required: <span className="text-blue-400 font-medium">{skill.requiredProficiency}</span>
                      </div>
                    </div>
                    <span className="text-xs font-semibold px-2.5 py-1 rounded-md bg-slate-900 border border-slate-800 text-slate-300">
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
            <div className="p-6 rounded-3xl bg-gradient-to-b from-blue-950/40 via-slate-900 to-slate-900 border border-blue-900/50 space-y-6 shadow-xl">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">AI Compatibility Assessment</h3>
              </div>

              {/* Large Score Meter */}
              <ScoreMeter score={matchData?.overallScore || opp.matchScore || 0} size="lg" />

              {matchData?.explanation && (
                <p className="text-xs text-slate-300 bg-slate-950/70 p-3.5 rounded-xl border border-slate-800 leading-relaxed">
                  {matchData.explanation}
                </p>
              )}

              {/* Skill Gap Analysis Navigation CTA */}
              <Link to={`/student/skill-gap/${opp.id}`} className="block">
                <Button variant="outline" size="md" className="w-full" icon={Target}>
                  Analyze Skill Gap & Roadmap
                </Button>
              </Link>

              {/* Apply Button */}
              {opp.hasApplied ? (
                <Button variant="ghost" size="lg" disabled className="w-full text-emerald-400 border border-emerald-500/40">
                  <CheckCircle2 className="w-5 h-5 mr-2" /> Application Submitted
                </Button>
              ) : (
                <Button
                  variant="primary"
                  size="lg"
                  className="w-full"
                  onClick={() => setApplyModalOpen(true)}
                >
                  Apply Now
                </Button>
              )}
            </div>
          )}

          {/* Company Mini Card */}
          <div className="p-6 rounded-3xl bg-slate-900 border border-slate-800 space-y-4">
            <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">About the Company</h4>
            <div className="text-sm font-bold text-white">{opp.companyName}</div>
            <p className="text-xs text-slate-400 leading-relaxed">
              Verified employer offering real-world career growth and mentorship.
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
            <div className="w-14 h-14 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-400 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-lg font-bold text-white">Your application was submitted!</h4>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
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
              <div className="p-3 rounded-xl bg-rose-950/70 border border-rose-800/60 text-rose-300 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                {applyError}
              </div>
            )}

            {/* Mandatory Resume Attachment Section */}
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-purple-400" /> Attached Candidate Resume
                </span>
                {(tailoredResumeUrl || studentProfile?.resumeUrl) ? (
                  <span className="text-[11px] font-semibold text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-950 border border-emerald-800/60 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> {tailoredResumeUrl ? 'Tailored Resume Ready' : 'Profile Resume Ready'}
                  </span>
                ) : (
                  <span className="text-[11px] font-semibold text-rose-400 px-2 py-0.5 rounded-full bg-rose-950 border border-rose-800/60">
                    Mandatory
                  </span>
                )}
              </div>

              {(tailoredResumeUrl || studentProfile?.resumeUrl) ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800">
                    <div className="flex items-center gap-2 truncate">
                      <FileText className={`w-4 h-4 flex-shrink-0 ${tailoredResumeUrl ? 'text-blue-400' : 'text-purple-400'}`} />
                      <div className="truncate">
                        <div className="truncate font-semibold text-white">
                          {tailoredResumeName || studentProfile?.resumeFileName || `${studentProfile?.name || 'Candidate'}_Resume.pdf`}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {tailoredResumeUrl ? 'Domain-specific tailored resume for this application' : 'Default profile resume'}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 ml-2">
                      <label className="text-xs text-blue-400 hover:text-blue-300 font-semibold cursor-pointer">
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
                          className="text-[10px] text-slate-400 hover:text-slate-200 underline"
                        >
                          Use Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-amber-300/90 leading-relaxed">
                    Upload your domain-specific resume for this role to proceed.
                  </p>
                  <label className="w-full py-2.5 px-4 rounded-xl border border-dashed border-purple-500/50 hover:border-purple-400 bg-purple-950/20 hover:bg-purple-950/40 text-purple-300 text-xs font-semibold flex items-center justify-center gap-2 cursor-pointer transition-colors">
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
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Cover Note / Why are you a great fit? (Optional)
              </label>
              <textarea
                rows={3}
                value={coverLetter}
                onChange={(e) => setCoverLetter(e.target.value)}
                placeholder="Share relevant projects, portfolio highlights, or key skills..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <Button variant="ghost" size="md" onClick={() => setApplyModalOpen(false)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={applying}
                disabled={!studentProfile?.resumeUrl || uploadingResume}
              >
                {!studentProfile?.resumeUrl ? 'Upload Resume to Apply' : 'Submit Application'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};
