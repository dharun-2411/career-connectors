import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { companyApi } from '../../api/companyApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Button } from '../../components/common/Button';
import { Plus, Trash2, Sparkles, CheckCircle2, AlertCircle, Briefcase, Lock, Clock } from 'lucide-react';

export const PostOpportunity = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [profile, setProfile] = useState(null);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const fetchCompanyProfile = async () => {
      try {
        const res = await companyApi.getProfile();
        if (res && res.success) {
          setProfile(res.data);
        }
      } catch (err) {
        console.error('Error loading company profile for posting:', err);
      } finally {
        setCheckingStatus(false);
      }
    };
    fetchCompanyProfile();
  }, []);

  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [type, setType] = useState('INTERNSHIP');
  const [location, setLocation] = useState('');
  const [isRemote, setIsRemote] = useState(false);
  const [stipend, setStipend] = useState('');
  const [duration, setDuration] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('ENTRY_LEVEL');
  const [deadline, setDeadline] = useState('');

  // Required skills list
  const [skills, setSkills] = useState([
    { skillName: 'React.js', weightage: 2.0, requiredProficiency: 'INTERMEDIATE' },
    { skillName: 'JavaScript', weightage: 1.5, requiredProficiency: 'INTERMEDIATE' },
  ]);

  const handleAddSkillRow = () => {
    setSkills([...skills, { skillName: '', weightage: 1.0, requiredProficiency: 'INTERMEDIATE' }]);
  };

  const handleRemoveSkillRow = (index) => {
    setSkills(skills.filter((_, i) => i !== index));
  };

  const handleSkillChange = (index, field, value) => {
    const updated = [...skills];
    updated[index][field] = value;
    setSkills(updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');

    if (profile?.verificationStatus !== 'VERIFIED') {
      setErrorMsg('Your company account must be approved by an administrator before you can post opportunities.');
      return;
    }

    if (skills.length === 0 || skills.some((s) => !s.skillName.trim())) {
      setErrorMsg('Please specify at least one valid required skill');
      return;
    }

    setLoading(true);
    try {
      const payload = {
        title,
        description,
        type,
        location,
        isRemote,
        stipend,
        duration,
        experienceLevel,
        deadline: deadline || null,
        skills: skills.map((s) => ({
          skillName: s.skillName.trim(),
          weightage: parseFloat(s.weightage) || 1.0,
          requiredProficiency: s.requiredProficiency,
        })),
      };

      const res = await companyApi.createOpportunity(payload);
      if (res && res.success) {
        navigate('/company/opportunities');
      }
    } catch (err) {
      setErrorMsg(err.response?.data?.message || err.message || 'Failed to create opportunity');
    } finally {
      setLoading(false);
    }
  };

  if (checkingStatus) {
    return (
      <DashboardLayout title="Post New Work Opportunity" subtitle="Checking company verification status...">
        <div className="py-20 text-center text-slate-400 text-sm">Verifying company credentials...</div>
      </DashboardLayout>
    );
  }

  if (profile && profile.verificationStatus !== 'VERIFIED') {
    return (
      <DashboardLayout
        title="Post New Work Opportunity"
        subtitle="Define position requirements, skill weightages, and candidate expectations for AI matching."
      >
        <div className="max-w-xl mx-auto my-12 p-8 rounded-3xl bg-slate-900 border border-slate-800 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
            <Lock className="w-8 h-8" />
          </div>
          <div className="space-y-2">
            <h3 className="text-xl font-bold text-white">Posting Locked: Admin Approval Required</h3>
            <p className="text-sm text-slate-400">
              Your company account is currently{' '}
              <span className="text-amber-400 font-semibold uppercase">{profile.verificationStatus || 'PENDING'}</span>.
              Only verified companies approved by an administrator in the trust queue can publish opportunities.
            </p>
          </div>
          <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-800">
            <Button variant="secondary" onClick={() => navigate('/company/dashboard')}>
              Return to Dashboard
            </Button>
            <Button variant="primary" onClick={() => navigate('/company/profile')}>
              View Company Profile & Docs
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout
      title="Post New Work Opportunity"
      subtitle="Define position requirements, skill weightages, and candidate expectations for AI matching."
    >
      <form onSubmit={handleSubmit} className="max-w-4xl space-y-8">
        {errorMsg && (
          <div className="p-4 rounded-xl bg-rose-950/80 border border-rose-800/60 text-rose-300 text-sm flex items-center gap-2">
            <AlertCircle className="w-5 h-5 flex-shrink-0" />
            {errorMsg}
          </div>
        )}

        {/* Basic Role Specs */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center gap-2 pb-4 border-b border-slate-800">
            <Briefcase className="w-5 h-5 text-purple-400" />
            <h3 className="text-lg font-bold text-white">Position Overview</h3>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Opportunity Title *
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Full-Stack AI Software Engineering Intern"
              className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Opportunity Type *
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="INTERNSHIP">Internship</option>
                <option value="FULL_TIME">Full-Time</option>
                <option value="PART_TIME">Part-Time</option>
                <option value="PROJECT">Project / Fellowship</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Experience Level
              </label>
              <select
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              >
                <option value="ENTRY_LEVEL">Entry-Level (Students/Grads)</option>
                <option value="JUNIOR">Junior (1-2 years)</option>
                <option value="MID_LEVEL">Mid-Level</option>
                <option value="SENIOR">Senior</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Application Deadline
              </label>
              <input
                type="date"
                value={deadline}
                onChange={(e) => setDeadline(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Location *
              </label>
              <input
                type="text"
                required
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. San Francisco, CA"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Stipend / Salary
              </label>
              <input
                type="text"
                value={stipend}
                onChange={(e) => setStipend(e.target.value)}
                placeholder="e.g. $5,000 / month"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                Duration
              </label>
              <input
                type="text"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                placeholder="e.g. 3 Months (Summer)"
                className="w-full px-3 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 p-3 bg-slate-950 rounded-xl border border-slate-800">
            <input
              type="checkbox"
              id="isRemotePost"
              checked={isRemote}
              onChange={(e) => setIsRemote(e.target.checked)}
              className="w-4 h-4 rounded text-purple-600 bg-slate-900 border-slate-700 focus:ring-purple-500"
            />
            <label htmlFor="isRemotePost" className="text-xs font-semibold text-slate-300 cursor-pointer">
              This position supports 100% remote work
            </label>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
              Role Description & Expectations *
            </label>
            <textarea
              rows={5}
              required
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe project responsibilities, team culture, and learning opportunities..."
              className="w-full p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none leading-relaxed"
            />
          </div>
        </div>

        {/* Required Skills & Weightage Builder */}
        <div className="p-6 sm:p-8 rounded-3xl bg-slate-900/90 border border-slate-800 space-y-6">
          <div className="flex items-center justify-between pb-4 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-purple-400" />
              <h3 className="text-lg font-bold text-white">Skill Requirements & AI Weightages</h3>
            </div>
            <Button variant="secondary" size="sm" icon={Plus} onClick={handleAddSkillRow}>
              Add Required Skill
            </Button>
          </div>

          <p className="text-xs text-slate-400">
            Skill weightages adjust the importance of each competency in our AI matching and candidate ranking algorithms (1.0x = Standard, 3.0x = Critical Core).
          </p>

          <div className="space-y-3">
            {skills.map((skill, index) => (
              <div
                key={index}
                className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3.5 rounded-2xl bg-slate-950 border border-slate-800 items-center"
              >
                <div className="sm:col-span-5">
                  <input
                    type="text"
                    required
                    placeholder="Skill Name (e.g. React.js, Python, PostgreSQL)"
                    value={skill.skillName}
                    onChange={(e) => handleSkillChange(index, 'skillName', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-3">
                  <select
                    value={skill.requiredProficiency}
                    onChange={(e) => handleSkillChange(index, 'requiredProficiency', e.target.value)}
                    className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  >
                    <option value="BEGINNER">Req: Beginner</option>
                    <option value="INTERMEDIATE">Req: Intermediate</option>
                    <option value="ADVANCED">Req: Advanced</option>
                    <option value="EXPERT">Req: Expert</option>
                  </select>
                </div>

                <div className="sm:col-span-3 flex items-center gap-2">
                  <span className="text-xs text-slate-400 whitespace-nowrap">Weight:</span>
                  <input
                    type="number"
                    step="0.5"
                    min="0.5"
                    max="5.0"
                    value={skill.weightage}
                    onChange={(e) => handleSkillChange(index, 'weightage', e.target.value)}
                    className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-xs focus:border-purple-500 focus:outline-none"
                  />
                </div>

                <div className="sm:col-span-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => handleRemoveSkillRow(index)}
                    disabled={skills.length === 1}
                    className="text-slate-500 hover:text-rose-400 p-2 rounded-lg hover:bg-slate-900 disabled:opacity-30"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="ghost" size="lg" onClick={() => navigate('/company/dashboard')}>
            Cancel
          </Button>
          <Button type="submit" variant="accent" size="lg" loading={loading}>
            Publish Opportunity
          </Button>
        </div>
      </form>
    </DashboardLayout>
  );
};
