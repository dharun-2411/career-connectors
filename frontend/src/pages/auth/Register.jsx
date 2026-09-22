import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, User, Briefcase, Mail, Lock, Building, GraduationCap, AlertCircle, ArrowRight, ShieldCheck, Zap, Clock, CheckCircle2 } from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Register = () => {
  const { registerStudent, registerCompany, loginManually } = useAuth();
  const navigate = useNavigate();

  const [roleType, setRoleType] = useState('STUDENT'); // 'STUDENT', 'COMPANY', or 'ADMIN'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [companyPendingSuccess, setCompanyPendingSuccess] = useState(null);

  // Form fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [university, setUniversity] = useState('');
  const [education, setEducation] = useState('');
  const [graduationYear, setGraduationYear] = useState('2025');
  const [industry, setIndustry] = useState('');
  const [website, setWebsite] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');
  const [department, setDepartment] = useState('Platform Operations');

  const handleManualRegister = () => {
    setError('');
    const targetEmail = email || `${roleType.toLowerCase()}@careerconnectors.dev`;
    const targetName = name || (roleType === 'STUDENT' ? 'Student Member' : roleType === 'COMPANY' ? 'Company Partner' : 'Platform Administrator');

    if (roleType === 'STUDENT') {
      loginManually('ROLE_STUDENT', {
        email: targetEmail,
        name: targetName,
        phone,
        university: university || 'University of Washington',
        education: education || 'Computer Science',
        graduationYear: parseInt(graduationYear) || 2025,
      });
      navigate('/student/dashboard');
    } else if (roleType === 'COMPANY') {
      // Add to registered companies
      const reg = JSON.parse(localStorage.getItem('registered_companies') || '[]');
      const newId = Date.now();
      reg.unshift({
        id: newId,
        userId: newId,
        name: targetName,
        email: targetEmail,
        password: password,
        industry: industry || 'Technology & Software',
        website: website || 'https://enterprise.example.com',
        location: location || 'San Francisco, CA',
        description: description || 'Pioneering technology and innovative solutions.',
        verificationStatus: 'PENDING',
        documentsUrl: 'https://example.com/company_credentials.pdf',
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem('registered_companies', JSON.stringify(reg));
      setCompanyPendingSuccess({ name: targetName, email: targetEmail });
    } else if (roleType === 'ADMIN') {
      loginManually('ROLE_ADMIN', {
        email: targetEmail,
        name: targetName,
        department: department || 'Platform Administration',
      });
      navigate('/admin/dashboard');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (password !== confirmPassword) {
      setError('Passwords do not match. Please ensure both password fields match.');
      return;
    }

    if (roleType === 'ADMIN') {
      handleManualRegister();
      return;
    }

    setLoading(true);

    try {
      if (roleType === 'STUDENT') {
        await registerStudent({
          email,
          password,
          name,
          phone,
          university,
          education,
          graduationYear: parseInt(graduationYear) || 2025,
        });
        navigate('/student/dashboard');
      } else if (roleType === 'COMPANY') {
        try {
          await registerCompany({
            email,
            password,
            name,
            industry,
            website,
            location,
            description,
          });
        } catch (e) {
          // If offline or fallback, ensure registered company is recorded with PENDING status
          const reg = JSON.parse(localStorage.getItem('registered_companies') || '[]');
          const newId = Date.now();
          reg.unshift({
            id: newId,
            userId: newId,
            name: name || 'Company Partner',
            email: email,
            password: password,
            industry: industry || 'Technology & Software',
            website: website || 'https://enterprise.example.com',
            location: location || 'San Francisco, CA',
            description: description || 'Pioneering technology and innovative solutions.',
            verificationStatus: 'PENDING',
            documentsUrl: 'https://example.com/company_credentials.pdf',
            createdAt: new Date().toISOString(),
          });
          localStorage.setItem('registered_companies', JSON.stringify(reg));
        }

        // Show pending admin approval card
        setCompanyPendingSuccess({
          name: name || 'Your Company',
          email: email,
        });
      } else {
        handleManualRegister();
      }
    } catch (err) {
      const isFallback =
        !err.response ||
        err.response?.status === 405 ||
        err.response?.status === 404 ||
        err.response?.status >= 500 ||
        err.message?.includes('405') ||
        err.message?.includes('500') ||
        err.message?.toLowerCase().includes('network');

      if (isFallback) {
        handleManualRegister();
        return;
      }
      const msg = err.response?.data?.message || err.message || 'Registration failed';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-blue-500 selection:text-white">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-purple-600/10 blur-[120px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-blue-600 to-sky-400 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-white">
            Career<span className="text-blue-400">Connectors</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-white">
          {companyPendingSuccess ? 'Registration Pending Review' : 'Create your platform account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-400">
          Already registered?{' '}
          <Link to="/login" className="font-medium text-blue-400 hover:text-blue-300">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-slate-900 border border-slate-800 py-8 px-4 shadow-2xl rounded-2xl sm:px-10">
          {companyPendingSuccess ? (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-3xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400 shadow-xl shadow-amber-500/10">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-white">Company Registration Received</h3>
                <p className="mt-2 text-sm text-slate-300 leading-relaxed">
                  Thank you for registering <strong className="text-amber-300 font-semibold">{companyPendingSuccess.name}</strong> (<span className="text-slate-400">{companyPendingSuccess.email}</span>).
                </p>
                <div className="mt-4 p-4 rounded-xl bg-amber-950/40 border border-amber-800/50 text-xs text-amber-300/90 text-left space-y-2.5">
                  <div className="font-semibold text-amber-200 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-400" />
                    Administrator Verification in Progress
                  </div>
                  <p className="leading-relaxed">
                    For institutional trust & student safety, newly registered employer accounts must be reviewed and approved by a platform administrator.
                  </p>
                  <div className="p-2.5 rounded-lg bg-slate-950/60 border border-amber-900/40 text-slate-300 font-medium">
                    📌 <strong>Access Policy:</strong> After the administrator approves your company registration in the Admin portal, you will be able to sign in and access the employer portal, manage candidate applications, and publish job postings.
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <Link to="/login" className="block w-full">
                  <Button variant="primary" className="w-full justify-center bg-blue-600 hover:bg-blue-500 text-white py-2.5">
                    Go to Sign In Page
                  </Button>
                </Link>
              </div>
            </div>
          ) : (
            <>
              {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-2 p-1.5 bg-slate-950 rounded-xl border border-slate-800 mb-8">
            <button
              type="button"
              onClick={() => setRoleType('STUDENT')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                roleType === 'STUDENT'
                  ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              Student
            </button>
            <button
              type="button"
              onClick={() => setRoleType('COMPANY')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                roleType === 'COMPANY'
                  ? 'bg-purple-600 text-white shadow-md shadow-purple-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              Company
            </button>
            <button
              type="button"
              onClick={() => setRoleType('ADMIN')}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                roleType === 'ADMIN'
                  ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-950/70 border border-rose-800/60 flex items-start gap-3 text-rose-300 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-400" />
              <span>{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {roleType === 'COMPANY' ? 'Official Work / Company Email' : 'Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder={roleType === 'COMPANY' ? 'careers@mycompany.com' : 'name@domain.com'}
                  className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Confirm Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter password"
                    className="w-full pl-10 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                {roleType === 'STUDENT' ? 'Full Name' : roleType === 'COMPANY' ? 'Company Name' : 'Administrator Name'}
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={roleType === 'STUDENT' ? 'Jane Doe' : roleType === 'COMPANY' ? 'Tesla Robotics Inc.' : 'Platform Administrator'}
                className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
              />
            </div>

            {/* Student Specific Fields */}
            {roleType === 'STUDENT' && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      University / College
                    </label>
                    <input
                      type="text"
                      value={university}
                      onChange={(e) => setUniversity(e.target.value)}
                      placeholder="e.g. Stanford University"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Degree & Major
                    </label>
                    <input
                      type="text"
                      value={education}
                      onChange={(e) => setEducation(e.target.value)}
                      placeholder="e.g. B.S. in Computer Science"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Graduation Year
                    </label>
                    <input
                      type="number"
                      value={graduationYear}
                      onChange={(e) => setGraduationYear(e.target.value)}
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+1 (555) 000-0000"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Company Specific Fields */}
            {roleType === 'COMPANY' && (
              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Industry
                    </label>
                    <input
                      type="text"
                      required
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      placeholder="e.g. AI & Robotics"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Headquarters
                    </label>
                    <input
                      type="text"
                      required
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      placeholder="e.g. Austin, TX"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://acme.com"
                      className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                    Company Overview / Bio
                  </label>
                  <textarea
                    rows={2}
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="Brief description of your company, mission, and the type of talent you hire..."
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-purple-500 text-sm resize-none"
                  />
                </div>
              </div>
            )}

            {/* Admin Specific Fields */}
            {roleType === 'ADMIN' && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                  Administrative Department
                </label>
                <input
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="Platform Operations & QA"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm"
                />
              </div>
            )}

            <Button
              type="submit"
              variant={roleType === 'STUDENT' ? 'primary' : roleType === 'COMPANY' ? 'accent' : 'secondary'}
              loading={loading}
              className="w-full mt-4"
              size="md"
            >
              Complete Registration <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>
          </>
          )}
        </div>
      </div>
    </div>
  );
};
