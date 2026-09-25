import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { opportunityApi } from '../../api/opportunityApi';
import { applicationApi } from '../../api/applicationApi';
import { studentApi } from '../../api/studentApi';
import { useAuth } from '../../context/AuthContext';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { Search, Filter, MapPin, DollarSign, Clock, Building2, Sparkles, CheckCircle2, AlertCircle, Upload, FileText, ArrowRight } from 'lucide-react';

export const Opportunities = () => {
  const { isStudent, isAuthenticated } = useAuth();
  const [opportunities, setOpportunities] = useState([]);
  const [studentProfile, setStudentProfile] = useState(null);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  // Filter States
  const [search, setSearch] = useState('');
  const [type, setType] = useState('');
  const [isRemote, setIsRemote] = useState(false);

  // Apply Modal State
  const [selectedOpp, setSelectedOpp] = useState(null);
  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [applySuccess, setApplySuccess] = useState(false);
  const [applyError, setApplyError] = useState('');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [tailoredResumeUrl, setTailoredResumeUrl] = useState(null);
  const [tailoredResumeName, setTailoredResumeName] = useState('');

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
    fetchStudentProfile();
  }, [isStudent]);

  const fetchOpportunities = async (page = 0) => {
    setLoading(true);
    try {
      const res = await opportunityApi.getOpportunities({
        search,
        type: type || undefined,
        isRemote: isRemote ? true : undefined,
        page,
        size: 9,
      });
      if (res && res.success) {
        setOpportunities(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(res.data.pageNumber || 0);
      }
    } catch (err) {
      console.error('Error fetching opportunities:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchOpportunities(0);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [search, type, isRemote]);

  const handleOpenApplyModal = (opp) => {
    setSelectedOpp(opp);
    setCoverLetter('');
    setApplySuccess(false);
    setApplyError('');
    setTailoredResumeUrl(null);
    setTailoredResumeName('');
  };

  const handleApplySubmit = async (e) => {
    e.preventDefault();
    if (!selectedOpp) return;
    setApplying(true);
    setApplyError('');

    try {
      const effectiveResumeUrl = tailoredResumeUrl || studentProfile?.resumeUrl;
      const effectiveResumeName = tailoredResumeName || studentProfile?.resumeFileName;
      const res = await applicationApi.apply(selectedOpp.id, coverLetter, effectiveResumeUrl, effectiveResumeName);
      if (res && res.success) {
        setApplySuccess(true);
        setOpportunities((prev) =>
          prev.map((o) => (o.id === selectedOpp.id ? { ...o, hasApplied: true, applicantCount: (o.applicantCount || 0) + 1 } : o))
        );
        fetchOpportunities(currentPage);
      }
    } catch (err) {
      setApplyError(err.response?.data?.message || err.message || 'Failed to submit application');
    } finally {
      setApplying(false);
    }
  };

  return (
    <DashboardLayout
      title="Opportunity Scope & Externships"
      subtitle="Discover internships, project roles, and full-time positions intelligently matched to your verified skillset."
      breadcrumb="Opportunity Scope"
    >
      {/* Search & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 mb-6 shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          {/* Keyword Search */}
          <div className="md:col-span-2 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by role, skill (e.g. React, Databricks, Python), company..."
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-medium transition-all"
            />
          </div>

          {/* Type Filter */}
          <div>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-semibold transition-all"
            >
              <option value="">All Opportunity Types</option>
              <option value="INTERNSHIP">Internship</option>
              <option value="FULL_TIME">Full-Time</option>
              <option value="PART_TIME">Part-Time</option>
              <option value="PROJECT">Project / Externship</option>
            </select>
          </div>

          {/* Remote Checkbox */}
          <div className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl">
            <input
              type="checkbox"
              id="remoteCheck"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500"
            />
            <label htmlFor="remoteCheck" className="text-xs font-bold text-slate-700 cursor-pointer select-none">
              Remote Scope Only
            </label>
          </div>
        </div>
      </div>

      {/* Opportunity Cards Grid */}
      {loading ? (
        <Loader message="Fetching matching opportunities..." />
      ) : opportunities.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/90 shadow-sm">
          <Building2 className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-extrabold text-slate-900 mb-1">No opportunities found</h3>
          <p className="text-xs text-slate-500">Try adjusting your filters or search keywords.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {opportunities.map((opp) => {
            return (
              <div
                key={opp.id}
                className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
              >
                <div>
                  {/* Top Bar: Company info & Match pill */}
                  <div className="flex items-start justify-between gap-3 mb-4">
                    <div className="flex items-center gap-3">
                      {opp.companyLogoUrl ? (
                        <img
                          src={opp.companyLogoUrl}
                          alt={opp.companyName}
                          className="w-10 h-10 rounded-xl object-cover border border-slate-100 shadow-sm"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-700 border border-indigo-100 flex items-center justify-center font-extrabold text-xs">
                          {opp.companyName?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div>
                        <span className="text-xs font-bold text-slate-800 block truncate max-w-[150px]">
                          {opp.companyName}
                        </span>
                        <div className="flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <MapPin className="w-3 h-3" />
                          {opp.isRemote ? 'Remote' : opp.location}
                        </div>
                      </div>
                    </div>

                    {isStudent && opp.matchScore !== null && opp.matchScore !== undefined && (
                      <ScoreMeter score={opp.matchScore} size="sm" />
                    )}
                  </div>

                  {/* Title & Type */}
                  <div className="mb-3">
                    <div className="flex items-center gap-2 mb-1.5">
                      <Badge variant="primary" size="sm">{opp.type.replace('_', ' ')}</Badge>
                      {opp.experienceLevel && (
                        <Badge variant="default" size="sm">{opp.experienceLevel.replace('_', ' ')}</Badge>
                      )}
                    </div>
                    <h3 className="text-base font-extrabold text-slate-900 group-hover:text-indigo-600 transition-colors line-clamp-1">
                      <Link to={`/opportunities/${opp.id}`}>{opp.title}</Link>
                    </h3>
                  </div>

                  <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-4">
                    {opp.description}
                  </p>

                  {/* Required Skill Chips */}
                  <div className="flex flex-wrap gap-1.5 mb-6">
                    {opp.requiredSkills?.slice(0, 4).map((sk) => (
                      <span
                        key={sk.id}
                        className="px-2.5 py-0.5 rounded-full bg-slate-50 border border-slate-200 text-[11px] font-semibold text-slate-600"
                      >
                        {sk.skillName}
                      </span>
                    ))}
                    {opp.requiredSkills?.length > 4 && (
                      <span className="px-2 py-0.5 rounded-full bg-slate-100 text-[11px] font-semibold text-slate-500">
                        +{opp.requiredSkills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>

                {/* Footer: Details, Stipend & Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-700 truncate">
                    {opp.stipend || 'Competitive Stipend'}
                  </div>

                  <div className="flex items-center gap-2">
                    <Link to={`/opportunities/${opp.id}`}>
                      <Button variant="secondary" size="sm">
                        Scope
                      </Button>
                    </Link>

                    {isStudent && (
                      opp.hasApplied ? (
                        <span className="text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-xl">
                          Applied
                        </span>
                      ) : (
                        <Button variant="primary" size="sm" onClick={() => handleOpenApplyModal(opp)}>
                          Apply
                        </Button>
                      )
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={(p) => fetchOpportunities(p)}
      />

      {/* 1-Click Application Submission Modal */}
      <Modal
        isOpen={!!selectedOpp}
        onClose={() => setSelectedOpp(null)}
        title={applySuccess ? 'Application Received!' : `Apply to ${selectedOpp?.title}`}
      >
        {applySuccess ? (
          <div className="text-center py-6 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900">Your application was successfully submitted!</h4>
            <p className="text-xs text-slate-500 max-w-md mx-auto leading-relaxed">
              {selectedOpp?.companyName} has received your profile, resume, and AI skill compatibility evaluation. You can track status on your applications board.
            </p>
            <div className="pt-4 flex justify-center gap-3">
              <Link to="/student/applications">
                <Button variant="primary" size="md">
                  View in Applications Tracker
                </Button>
              </Link>
              <Button variant="secondary" size="md" onClick={() => setSelectedOpp(null)}>
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

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Employer Host</span>
                <span className="font-bold text-slate-900">{selectedOpp?.companyName}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-slate-500">
                <span>Deliverable Role</span>
                <span className="font-bold text-slate-900">{selectedOpp?.title}</span>
              </div>
              {selectedOpp?.matchScore !== null && selectedOpp?.matchScore !== undefined && (
                <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-200">
                  <span>AI Compatibility Match</span>
                  <span className="font-extrabold text-emerald-700">{selectedOpp?.matchScore}%</span>
                </div>
              )}
            </div>

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
                placeholder="Share relevant projects, passion for the domain, or key experiences..."
                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white text-xs font-medium"
              />
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100">
              <Button variant="ghost" size="md" onClick={() => setSelectedOpp(null)}>
                Cancel
              </Button>
              <Button
                type="submit"
                variant="primary"
                size="md"
                loading={applying}
                disabled={(!studentProfile?.resumeUrl && !tailoredResumeUrl) || uploadingResume}
              >
                {!studentProfile?.resumeUrl && !tailoredResumeUrl ? 'Upload Resume to Apply' : 'Confirm Application'}
              </Button>
            </div>
          </form>
        )}
      </Modal>
    </DashboardLayout>
  );
};

