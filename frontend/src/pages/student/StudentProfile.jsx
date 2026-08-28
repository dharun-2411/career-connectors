import React, { useState, useEffect } from 'react';
import { studentApi } from '../../api/studentApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Modal } from '../../components/common/Modal';
import { Loader } from '../../components/common/Loader';
import {
  User,
  GraduationCap,
  Sparkles,
  Plus,
  Trash2,
  CheckCircle2,
  FileText,
  Upload,
  Globe,
  Github,
  Linkedin,
  Phone,
  Mail,
  AlertCircle,
  Award,
} from 'lucide-react';

export const StudentProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saveLoading, setSaveLoading] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  // Edit Profile Form State
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    dob: '',
    education: '',
    university: '',
    graduationYear: 2025,
    bio: '',
    githubUrl: '',
    linkedinUrl: '',
    portfolioUrl: '',
    resumeUrl: '',
  });

  // Add Skill Modal State
  const [addSkillOpen, setAddSkillOpen] = useState(false);
  const [skillName, setSkillName] = useState('');
  const [skillCategory, setSkillCategory] = useState('Programming');
  const [proficiency, setProficiency] = useState('INTERMEDIATE');

  // Resume upload parsing simulator state
  const [parseModalOpen, setParseModalOpen] = useState(false);
  const [resumeText, setResumeText] = useState('');
  const [parsing, setParsing] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await studentApi.getProfile();
      if (res && res.success) {
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          phone: res.data.phone || '',
          dob: res.data.dob || '',
          education: res.data.education || '',
          university: res.data.university || '',
          graduationYear: res.data.graduationYear || 2025,
          bio: res.data.bio || '',
          githubUrl: res.data.githubUrl || '',
          linkedinUrl: res.data.linkedinUrl || '',
          portfolioUrl: res.data.portfolioUrl || '',
          resumeUrl: res.data.resumeUrl || '',
        });
      }
    } catch (err) {
      console.error('Failed to load profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    setSaveLoading(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await studentApi.updateProfile(formData);
      if (res && res.success) {
        setProfile(res.data);
        setSuccessMsg('Profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update profile');
    } finally {
      setSaveLoading(false);
    }
  };

  const handleAddSkill = async (e) => {
    e.preventDefault();
    if (!skillName.trim()) return;

    try {
      const res = await studentApi.addSkill({
        skillName: skillName.trim(),
        category: skillCategory,
        proficiencyLevel: proficiency,
        source: 'MANUAL',
      });
      if (res && res.success) {
        setAddSkillOpen(false);
        setSkillName('');
        fetchProfile();
      }
    } catch (err) {
      console.error('Failed to add skill:', err);
    }
  };

  const handleRemoveSkill = async (skillId) => {
    try {
      await studentApi.removeSkill(skillId);
      fetchProfile();
    } catch (err) {
      console.error('Failed to remove skill:', err);
    }
  };

  const handleProficiencyChange = async (skillId, newProf) => {
    try {
      await studentApi.updateSkillProficiency(skillId, newProf);
      fetchProfile();
    } catch (err) {
      console.error('Failed to change proficiency:', err);
    }
  };

  // Mock Resume NLP extractor
  const handleSimulateResumeExtraction = () => {
    setParsing(true);
    setTimeout(async () => {
      // Add simulated skills automatically from parsed resume
      const mockExtracted = [
        { name: 'FastAPI', category: 'Framework', proficiency: 'ADVANCED' },
        { name: 'Docker', category: 'Cloud/DevOps', proficiency: 'INTERMEDIATE' },
        { name: 'Kubernetes', category: 'Cloud/DevOps', proficiency: 'BEGINNER' },
      ];

      for (const sk of mockExtracted) {
        try {
          await studentApi.addSkill({
            skillName: sk.name,
            category: sk.category,
            proficiencyLevel: sk.proficiency,
            source: 'AI_EXTRACTED',
          });
        } catch (e) {
          // ignore duplicate
        }
      }

      setParsing(false);
      setParseModalOpen(false);
      fetchProfile();
      setSuccessMsg('Resume parsed! 3 skills extracted and added to your profile.');
      setTimeout(() => setSuccessMsg(''), 4000);
    }, 1200);
  };

  if (loading) return <Loader fullScreen message="Loading student profile & skills..." />;

  return (
    <DashboardLayout
      title="Student Profile & Skills Hub"
      subtitle="Manage your academic background, resume, and skills verified by our AI matching engine."
      action={
        <Button variant="accent" size="sm" icon={Sparkles} onClick={() => setParseModalOpen(true)}>
          AI Resume Extractor
        </Button>
      }
    >
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-950/80 border border-emerald-800/60 text-emerald-300 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Edit Profile Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleProfileSubmit} className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
              <User className="w-5 h-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Personal & Academic Credentials</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Phone Number
                </label>
                <input
                  type="text"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+1 (555) 000-0000"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  University / College
                </label>
                <input
                  type="text"
                  value={formData.university}
                  onChange={(e) => setFormData({ ...formData, university: e.target.value })}
                  placeholder="e.g. Stanford University"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Graduation Year
                </label>
                <input
                  type="number"
                  value={formData.graduationYear}
                  onChange={(e) => setFormData({ ...formData, graduationYear: parseInt(e.target.value) || 2025 })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Degree & Major
              </label>
              <input
                type="text"
                value={formData.education}
                onChange={(e) => setFormData({ ...formData, education: e.target.value })}
                placeholder="e.g. B.S. in Computer Science"
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Professional Bio / Summary
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Brief summary of your passions, projects, and career aspirations..."
                className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              />
            </div>

            {/* Social & Portfolio links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  GitHub Profile
                </label>
                <input
                  type="url"
                  value={formData.githubUrl}
                  onChange={(e) => setFormData({ ...formData, githubUrl: e.target.value })}
                  placeholder="https://github.com/username"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  LinkedIn Profile
                </label>
                <input
                  type="url"
                  value={formData.linkedinUrl}
                  onChange={(e) => setFormData({ ...formData, linkedinUrl: e.target.value })}
                  placeholder="https://linkedin.com/in/username"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Portfolio / Website
                </label>
                <input
                  type="url"
                  value={formData.portfolioUrl}
                  onChange={(e) => setFormData({ ...formData, portfolioUrl: e.target.value })}
                  placeholder="https://portfolio.dev"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
                />
              </div>
            </div>

            {/* Resume Upload & Attachment Zone */}
            <div className="pt-4 border-t border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-purple-400" />
                  <div>
                    <h4 className="text-sm font-bold text-white">Official Resume / Curriculum Vitae</h4>
                    <p className="text-xs text-slate-400">Required for job and internship applications</p>
                  </div>
                </div>
                {formData.resumeUrl && (
                  <span className="px-2.5 py-1 rounded-full bg-emerald-950/80 border border-emerald-800/60 text-emerald-400 text-xs font-semibold flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Resume Attached
                  </span>
                )}
              </div>

              {formData.resumeUrl ? (
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-purple-950 border border-purple-800 flex items-center justify-center text-purple-400 flex-shrink-0">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="text-sm font-bold text-white truncate max-w-xs sm:max-w-md">
                        {formData.resumeFileName || `${formData.name || 'Candidate'}_Resume.pdf`}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>PDF / Document format</span>
                        <span>•</span>
                        <span className="text-emerald-400">Ready for recruiter evaluation</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <a
                      href={formData.resumeUrl}
                      download={`${formData.name || 'Candidate'}_Resume.pdf`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-blue-400 hover:text-blue-300 flex items-center gap-1.5 transition-colors"
                    >
                      <FileText className="w-3.5 h-3.5" /> View
                    </a>

                    <label className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold text-slate-300 hover:text-white cursor-pointer flex items-center gap-1.5 transition-colors">
                      <Upload className="w-3.5 h-3.5" /> Replace
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          const reader = new FileReader();
                          reader.onload = (event) => {
                            const dataUrl = event.target.result;
                            setFormData((prev) => ({
                              ...prev,
                              resumeUrl: dataUrl,
                              resumeFileName: file.name,
                            }));
                          };
                          reader.readAsDataURL(file);
                        }}
                      />
                    </label>

                    <button
                      type="button"
                      onClick={() => setFormData((prev) => ({ ...prev, resumeUrl: '', resumeFileName: '' }))}
                      className="p-2 rounded-xl text-slate-500 hover:text-rose-400 hover:bg-slate-900 transition-colors"
                      title="Remove resume"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="border-2 border-dashed border-slate-800 hover:border-purple-500/60 rounded-2xl p-6 flex flex-col items-center justify-center text-center cursor-pointer bg-slate-950/40 hover:bg-slate-950 transition-all group">
                  <div className="w-12 h-12 rounded-2xl bg-purple-950/50 border border-purple-900/60 flex items-center justify-center text-purple-400 mb-3 group-hover:scale-105 transition-transform">
                    <Upload className="w-6 h-6" />
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-purple-300 transition-colors">
                    Click to upload or drag and drop your resume
                  </span>
                  <span className="text-xs text-slate-400 mt-1">
                    Supports PDF, DOCX, DOC up to 10MB
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (!file) return;
                      const reader = new FileReader();
                      reader.onload = (event) => {
                        const dataUrl = event.target.result;
                        setFormData((prev) => ({
                          ...prev,
                          resumeUrl: dataUrl,
                          resumeFileName: file.name,
                        }));
                      };
                      reader.readAsDataURL(file);
                    }}
                  />
                </label>
              )}
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-800">
              <Button type="submit" variant="primary" size="md" loading={saveLoading}>
                Save Profile Changes
              </Button>
            </div>
          </form>
        </div>

        {/* Right Col: Skills Manager */}
        <div className="space-y-6">
          <div className="p-6 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Award className="w-5 h-5 text-blue-400" />
                <h3 className="text-base font-bold text-white">Skills Matrix</h3>
              </div>
              <Button variant="primary" size="sm" icon={Plus} onClick={() => setAddSkillOpen(true)}>
                Add Skill
              </Button>
            </div>

            <div className="space-y-3">
              {profile?.skills?.map((skill) => (
                <div
                  key={skill.id}
                  className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between gap-3 group"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white">{skill.skillName}</span>
                      {skill.source === 'AI_EXTRACTED' && (
                        <span className="text-[10px] px-2 py-0.5 rounded bg-purple-950 text-purple-300 border border-purple-800/60 flex items-center gap-1">
                          <Sparkles className="w-2.5 h-2.5" /> AI Extracted
                        </span>
                      )}
                    </div>

                    {/* Proficiency dropdown */}
                    <select
                      value={skill.proficiencyLevel}
                      onChange={(e) => handleProficiencyChange(skill.skillId, e.target.value)}
                      className="text-xs px-2 py-1 bg-slate-900 border border-slate-700 rounded-md text-blue-400 font-semibold focus:outline-none"
                    >
                      <option value="BEGINNER">Beginner</option>
                      <option value="INTERMEDIATE">Intermediate</option>
                      <option value="ADVANCED">Advanced</option>
                      <option value="EXPERT">Expert</option>
                    </select>
                  </div>

                  <button
                    onClick={() => handleRemoveSkill(skill.skillId)}
                    className="text-slate-500 hover:text-rose-400 p-1.5 rounded-lg hover:bg-slate-900 transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}

              {profile?.skills?.length === 0 && (
                <div className="p-6 text-center text-slate-500 text-xs rounded-xl bg-slate-950 border border-slate-800">
                  No skills listed yet. Add skills or use our AI resume parser to build your profile.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Add Skill Modal */}
      <Modal isOpen={addSkillOpen} onClose={() => setAddSkillOpen(false)} title="Add Skill to Profile">
        <form onSubmit={handleAddSkill} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Skill Name
            </label>
            <input
              type="text"
              required
              value={skillName}
              onChange={(e) => setSkillName(e.target.value)}
              placeholder="e.g. React.js, Java, Docker, Machine Learning..."
              className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Category
              </label>
              <select
                value={skillCategory}
                onChange={(e) => setSkillCategory(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="Programming">Programming</option>
                <option value="Framework">Framework</option>
                <option value="Cloud/DevOps">Cloud/DevOps</option>
                <option value="Database">Database</option>
                <option value="AI/Data Science">AI/Data Science</option>
                <option value="Architecture">Architecture</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Proficiency Level
              </label>
              <select
                value={proficiency}
                onChange={(e) => setProficiency(e.target.value)}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-blue-500 focus:outline-none"
              >
                <option value="BEGINNER">Beginner</option>
                <option value="INTERMEDIATE">Intermediate</option>
                <option value="ADVANCED">Advanced</option>
                <option value="EXPERT">Expert</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={() => setAddSkillOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md">
              Add Skill
            </Button>
          </div>
        </form>
      </Modal>

      {/* AI Resume Parser Modal */}
      <Modal isOpen={parseModalOpen} onClose={() => setParseModalOpen(false)} title="AI Resume Skill Parser">
        <div className="space-y-4">
          <p className="text-xs text-slate-400 leading-relaxed">
            Paste your resume text or let our LangGraph NLP extractor auto-populate verified technical competencies and domain expertise directly onto your profile.
          </p>

          <textarea
            rows={5}
            value={resumeText}
            onChange={(e) => setResumeText(e.target.value)}
            placeholder="Paste raw resume text or highlights here..."
            className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
          />

          <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
            <Button variant="ghost" size="md" onClick={() => setParseModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="accent"
              size="md"
              loading={parsing}
              icon={Sparkles}
              onClick={handleSimulateResumeExtraction}
            >
              Extract & Sync Skills
            </Button>
          </div>
        </div>
      </Modal>
    </DashboardLayout>
  );
};
