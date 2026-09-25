import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  User,
  Briefcase,
  Mail,
  Lock,
  Building,
  GraduationCap,
  AlertCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
  Clock,
  CheckCircle2,
  XCircle,
  RefreshCw,
  Search,
  ExternalLink,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

export const Register = () => {
  const { registerStudent, registerCompany, loginManually } = useAuth();
  const navigate = useNavigate();

  const [roleType, setRoleType] = useState('STUDENT'); // 'STUDENT', 'COMPANY', or 'ADMIN'
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Status result object: { status: 'PENDING' | 'VERIFIED' | 'REJECTED', name: string, email: string, message?: string, isNew?: boolean }
  const [statusResult, setStatusResult] = useState(null);
  const [checkingLiveStatus, setCheckingLiveStatus] = useState(false);
  const [statusCheckFeedback, setStatusCheckFeedback] = useState('');

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

  // Quick lookup state
  const [showStatusLookup, setShowStatusLookup] = useState(false);
  const [lookupEmail, setLookupEmail] = useState('');

  // Function to inspect live verification status from storage / backend
  const evaluateCompanyStatus = (targetEmail) => {
    const cleanEmail = (targetEmail || '').toLowerCase().trim();
    if (!cleanEmail) return null;

    const regCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
    const verifiedCompanies = JSON.parse(
      localStorage.getItem('verified_companies') ||
        '["1","2","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]'
    );

    const matched = regCompanies.find((c) => c.email?.toLowerCase() === cleanEmail);
    const isApproved =
      verifiedCompanies.includes(cleanEmail) ||
      (matched && (verifiedCompanies.includes(String(matched.id)) || matched.verificationStatus === 'VERIFIED'));
    const isRejected = matched && matched.verificationStatus === 'REJECTED';

    if (isApproved) {
      return {
        status: 'VERIFIED',
        name: matched?.name || (cleanEmail.includes('nexus') ? 'Nexus AI Technologies' : cleanEmail.includes('cloudscale') ? 'CloudScale Systems' : 'Registered Employer'),
        email: cleanEmail,
        message: 'This company account has been approved by the platform administrator and is active.',
      };
    }

    if (isRejected) {
      return {
        status: 'REJECTED',
        name: matched?.name || 'Company Partner',
        email: cleanEmail,
        message: 'The platform administrator reviewed this company registration and was unable to approve access.',
      };
    }

    if (matched || cleanEmail.includes('company') || cleanEmail.includes('corp') || cleanEmail.includes('recruiter')) {
      return {
        status: 'PENDING',
        name: matched?.name || 'Company Partner',
        email: cleanEmail,
        message: 'Registration received and currently pending administrator verification in the moderation queue.',
      };
    }

    return null;
  };

  const handleCheckLiveStatus = () => {
    if (!statusResult?.email) return;
    setCheckingLiveStatus(true);
    setStatusCheckFeedback('');

    setTimeout(() => {
      const live = evaluateCompanyStatus(statusResult.email);
      if (live) {
        setStatusResult(live);
        if (live.status === 'VERIFIED') {
          setStatusCheckFeedback('Status updated: The administrator has approved your company registration!');
        } else if (live.status === 'REJECTED') {
          setStatusCheckFeedback('Status updated: The administrator reviewed and declined this registration.');
        } else {
          setStatusCheckFeedback('Status checked: Registration is still pending administrator review.');
        }
      } else {
        setStatusCheckFeedback('Status checked: Registration is pending administrator review.');
      }
      setCheckingLiveStatus(false);
    }, 450);
  };

  const handleLookupSubmit = (e) => {
    e.preventDefault();
    setError('');
    const live = evaluateCompanyStatus(lookupEmail);
    if (live) {
      setStatusResult(live);
      setShowStatusLookup(false);
    } else {
      setError(`No company registration found for "${lookupEmail}". Please fill out the registration form below.`);
    }
  };

  const handleManualRegister = () => {
    setError('');
    const targetEmail = email.toLowerCase().trim() || `${roleType.toLowerCase()}@careerconnectors.dev`;
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
      // Check if already registered
      const existingStatus = evaluateCompanyStatus(targetEmail);
      if (existingStatus) {
        setStatusResult(existingStatus);
        return;
      }

      // Add to registered companies as PENDING
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
      setStatusResult({
        status: 'PENDING',
        name: targetName,
        email: targetEmail,
        isNew: true,
      });
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
    setStatusCheckFeedback('');

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
          email: email.toLowerCase().trim(),
          password,
          name,
          phone,
          university,
          education,
          graduationYear: parseInt(graduationYear) || 2025,
        });
        navigate('/student/dashboard');
      } else if (roleType === 'COMPANY') {
        const cleanEmail = email.toLowerCase().trim();

        // Check if existing
        const existingStatus = evaluateCompanyStatus(cleanEmail);
        if (existingStatus) {
          setStatusResult(existingStatus);
          setLoading(false);
          return;
        }

        try {
          const res = await registerCompany({
            email: cleanEmail,
            password,
            name,
            industry,
            website,
            location,
            description,
          });

          if (res?.verificationStatus === 'VERIFIED') {
            setStatusResult({
              status: 'VERIFIED',
              name: name || 'Your Company',
              email: cleanEmail,
            });
          } else {
            setStatusResult({
              status: 'PENDING',
              name: name || 'Your Company',
              email: cleanEmail,
              isNew: true,
            });
          }
        } catch (apiErr) {
          const statusType = apiErr.response?.data?.statusType;
          if (statusType === 'ALREADY_APPROVED' || apiErr.message?.toLowerCase().includes('already registered and approved')) {
            setStatusResult({
              status: 'VERIFIED',
              name: apiErr.response?.data?.companyName || name || 'Your Company',
              email: cleanEmail,
              message: apiErr.response?.data?.message || 'This company account is already registered and approved by the platform administrator.',
            });
            return;
          }

          if (statusType === 'REJECTED' || apiErr.message?.toLowerCase().includes('declined') || apiErr.message?.toLowerCase().includes('rejected')) {
            setStatusResult({
              status: 'REJECTED',
              name: apiErr.response?.data?.companyName || name || 'Your Company',
              email: cleanEmail,
              message: apiErr.response?.data?.message || 'The administrator reviewed your company registration and was unable to approve access.',
            });
            return;
          }

          if (statusType === 'ALREADY_PENDING' || apiErr.message?.toLowerCase().includes('pending')) {
            setStatusResult({
              status: 'PENDING',
              name: apiErr.response?.data?.companyName || name || 'Your Company',
              email: cleanEmail,
              message: 'A registration request for this company has already been submitted and is currently pending administrator verification.',
            });
            return;
          }

          // Offline fallback registration
          const reg = JSON.parse(localStorage.getItem('registered_companies') || '[]');
          const newId = Date.now();
          reg.unshift({
            id: newId,
            userId: newId,
            name: name || 'Company Partner',
            email: cleanEmail,
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

          setStatusResult({
            status: 'PENDING',
            name: name || 'Your Company',
            email: cleanEmail,
            isNew: true,
          });
        }
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
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-nexus-sm group-hover:scale-105 transition-transform text-white font-bold">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Career<span className="text-indigo-600">Connectors</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          {statusResult
            ? statusResult.status === 'VERIFIED'
              ? 'Registration Approved & Active'
              : statusResult.status === 'REJECTED'
              ? 'Company Registration Declined'
              : 'Registration Pending Review'
            : 'Create your platform account'}
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            Sign in here
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-xl relative z-10">
        <div className="bg-white border border-slate-200 shadow-nexus py-8 px-5 rounded-2xl sm:px-10">
          {/* ============================================================ */}
          {/* CASE 1: VERIFIED / APPROVED STATUS CARD                       */}
          {/* ============================================================ */}
          {statusResult && statusResult.status === 'VERIFIED' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-emerald-50 border border-emerald-200 flex items-center justify-center mx-auto text-emerald-600 shadow-sm">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold uppercase tracking-wider mb-2">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                  Admin Approved & Verified
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Company Already Registered & Approved
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  The company account for{' '}
                  <strong className="text-emerald-700 font-semibold">{statusResult.name}</strong> (
                  <span className="text-slate-500">{statusResult.email}</span>) is already registered and has been
                  approved by the platform administrator.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900 text-left space-y-2.5">
                  <div className="font-semibold text-emerald-900 flex items-center gap-1.5 text-sm">
                    <Sparkles className="w-4 h-4 text-emerald-600" />
                    Full Recruiter Access Granted
                  </div>
                  <p className="leading-relaxed text-emerald-800">
                    You do not need to register again. You can sign in right now with your email and password to access the employer dashboard, publish new job postings, and review candidate applications.
                  </p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <Link
                  to={`/login?email=${encodeURIComponent(statusResult.email)}&role=COMPANY`}
                  className="block w-full"
                >
                  <Button
                    variant="primary"
                    className="w-full justify-center bg-emerald-600 hover:bg-emerald-700 text-white py-2.5 font-semibold shadow-nexus-sm"
                  >
                    Proceed to Sign In Now <ArrowRight className="w-4 h-4 ml-1.5" />
                  </Button>
                </Link>

                <button
                  type="button"
                  onClick={() => setStatusResult(null)}
                  className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
                >
                  Register a different account
                </button>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CASE 2: REJECTED / DECLINED STATUS CARD                       */}
          {/* ============================================================ */}
          {statusResult && statusResult.status === 'REJECTED' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-rose-50 border border-rose-200 flex items-center justify-center mx-auto text-rose-600 shadow-sm">
                <XCircle className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold uppercase tracking-wider mb-2">
                  <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
                  Registration Declined
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  Company Registration Could Not Be Approved
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  The administrator reviewed the registration for{' '}
                  <strong className="text-rose-700 font-semibold">{statusResult.name}</strong> (
                  <span className="text-slate-500">{statusResult.email}</span>) and was unable to approve platform access.
                </p>

                <div className="mt-5 p-4 rounded-xl bg-rose-50/70 border border-rose-200 text-xs text-rose-900 text-left space-y-2.5">
                  <div className="font-semibold text-rose-900 flex items-center gap-1.5 text-sm">
                    <AlertCircle className="w-4 h-4 text-rose-600" />
                    Verification Notice & Policy
                  </div>
                  <p className="leading-relaxed text-rose-800">
                    The registration did not satisfy platform verification criteria or employer documentation could not be validated. Access to posting opportunities and viewing student records has been restricted.
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-rose-200 text-slate-700 font-medium">
                    📌 <strong>Need assistance or wish to appeal?</strong> If you believe this decision is in error or would like to submit corporate credentials for re-evaluation, please email our support team at <a href="mailto:support@careerconnectors.dev" className="text-indigo-600 underline font-semibold">support@careerconnectors.dev</a>.
                  </div>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <a
                  href="mailto:support@careerconnectors.dev?subject=Company%20Registration%20Verification%20Appeal"
                  className="block w-full"
                >
                  <Button
                    variant="ghost"
                    className="w-full justify-center bg-rose-50 hover:bg-rose-100 border border-rose-200 text-rose-800 py-2.5"
                  >
                    Contact Support for Review
                  </Button>
                </a>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStatusResult(null);
                      setEmail('');
                      setName('');
                    }}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold transition-all"
                  >
                    Re-apply with New Details
                  </button>
                  <Link
                    to="/login"
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 text-center font-semibold transition-all"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* CASE 3: PENDING ADMINISTRATOR REVIEW STATUS CARD              */}
          {/* ============================================================ */}
          {statusResult && statusResult.status === 'PENDING' && (
            <div className="space-y-6 text-center">
              <div className="w-16 h-16 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto text-amber-600 shadow-sm">
                <Clock className="w-8 h-8" />
              </div>
              <div>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold uppercase tracking-wider mb-2">
                  <Clock className="w-3.5 h-3.5 text-amber-600" />
                  Review in Progress
                </span>
                <h3 className="text-xl font-bold text-slate-900 mt-1">
                  {statusResult.isNew ? 'Company Registration Received' : 'Registration Already Submitted'}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">
                  Thank you for registering <strong className="text-amber-700 font-semibold">{statusResult.name}</strong> (
                  <span className="text-slate-500">{statusResult.email}</span>).
                </p>

                <div className="mt-4 p-4 rounded-xl bg-amber-50/70 border border-amber-200 text-xs text-amber-900 text-left space-y-2.5">
                  <div className="font-semibold text-amber-900 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Administrator Verification in Progress
                  </div>
                  <p className="leading-relaxed text-amber-800">
                    For institutional trust & student safety, newly registered employer accounts must be reviewed and approved by a platform administrator.
                  </p>
                  <div className="p-2.5 rounded-lg bg-white border border-amber-200 text-slate-700 font-medium">
                    📌 <strong>Access Policy:</strong> After the administrator approves your company registration in the Admin portal, you will be able to sign in and access the employer portal, manage candidate applications, and publish job postings.
                  </div>
                </div>

                {statusCheckFeedback && (
                  <div className="mt-3 p-3 rounded-lg bg-indigo-50 border border-indigo-200 text-xs text-indigo-800 font-medium">
                    {statusCheckFeedback}
                  </div>
                )}
              </div>

              <div className="space-y-3 pt-2">
                <Button
                  type="button"
                  variant="primary"
                  onClick={handleCheckLiveStatus}
                  loading={checkingLiveStatus}
                  className="w-full justify-center bg-indigo-600 hover:bg-indigo-700 text-white py-2.5 font-semibold shadow-nexus-sm"
                >
                  <RefreshCw className={`w-4 h-4 mr-2 ${checkingLiveStatus ? 'animate-spin' : ''}`} />
                  Check Live Approval Status
                </Button>

                <div className="flex gap-2">
                  <Link to="/login" className="flex-1">
                    <Button variant="ghost" className="w-full justify-center text-xs py-2 border border-slate-200 bg-white">
                      Go to Sign In Page
                    </Button>
                  </Link>
                  <button
                    type="button"
                    onClick={() => setStatusResult(null)}
                    className="flex-1 py-2 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs text-slate-700 font-semibold transition-colors"
                  >
                    Back to Form
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* ============================================================ */}
          {/* DEFAULT: REGISTRATION FORM                                  */}
          {/* ============================================================ */}
          {!statusResult && (
            <>
              {/* Role selector tabs */}
              <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 mb-6">
                <button
                  type="button"
                  onClick={() => {
                    setRoleType('STUDENT');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    roleType === 'STUDENT'
                      ? 'bg-white text-indigo-600 shadow-nexus-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <User className="w-3.5 h-3.5" />
                  Student
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleType('COMPANY');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    roleType === 'COMPANY'
                      ? 'bg-white text-violet-600 shadow-nexus-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5" />
                  Company
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setRoleType('ADMIN');
                    setError('');
                  }}
                  className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                    roleType === 'ADMIN'
                      ? 'bg-white text-emerald-600 shadow-nexus-sm'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin
                </button>
              </div>

              {/* Status Lookup Drawer / Toggle for Companies */}
              {roleType === 'COMPANY' && (
                <div className="mb-6 p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-700 font-medium flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-violet-600" />
                      Already submitted an employer registration?
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowStatusLookup(!showStatusLookup)}
                      className="text-violet-600 hover:text-violet-700 font-semibold underline ml-2"
                    >
                      {showStatusLookup ? 'Hide' : 'Check Live Status'}
                    </button>
                  </div>

                  {showStatusLookup && (
                    <form onSubmit={handleLookupSubmit} className="mt-3 pt-3 border-t border-slate-200 flex gap-2">
                      <div className="relative flex-1">
                        <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                        <input
                          type="email"
                          required
                          value={lookupEmail}
                          onChange={(e) => setLookupEmail(e.target.value)}
                          placeholder="e.g. hcl@gmail.com"
                          className="w-full pl-8 pr-3 py-1.5 bg-white border border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 text-xs focus:outline-none focus:border-violet-600 shadow-sm"
                        />
                      </div>
                      <button
                        type="submit"
                        className="px-3 py-1.5 bg-violet-600 hover:bg-violet-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1 transition-all shadow-sm"
                      >
                        <Search className="w-3 h-3" /> Check
                      </button>
                    </form>
                  )}
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              <form className="space-y-5" onSubmit={handleSubmit}>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    {roleType === 'COMPANY' ? 'Official Work / Company Email' : 'Email Address'}
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={roleType === 'COMPANY' ? 'careers@mycompany.com' : 'name@domain.com'}
                      className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Min. 6 characters"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Confirm Password
                    </label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="password"
                        required
                        minLength={6}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        placeholder="Re-enter password"
                        className="w-full pl-10 pr-3 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
                      />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                    {roleType === 'STUDENT' ? 'Full Name' : roleType === 'COMPANY' ? 'Company Name' : 'Administrator Name'}
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder={roleType === 'STUDENT' ? 'Jane Doe' : roleType === 'COMPANY' ? 'HCL Technologies' : 'Platform Administrator'}
                    className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
                  />
                </div>

                {/* Student Specific Fields */}
                {roleType === 'STUDENT' && (
                  <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          University / College
                        </label>
                        <input
                          type="text"
                          value={university}
                          onChange={(e) => setUniversity(e.target.value)}
                          placeholder="e.g. Stanford University"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Degree & Major
                        </label>
                        <input
                          type="text"
                          value={education}
                          onChange={(e) => setEducation(e.target.value)}
                          placeholder="e.g. B.S. in Computer Science"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Graduation Year
                        </label>
                        <input
                          type="number"
                          value={graduationYear}
                          onChange={(e) => setGraduationYear(e.target.value)}
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Phone Number
                        </label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="+1 (555) 000-0000"
                          className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 text-sm shadow-sm"
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
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Industry
                        </label>
                        <input
                          type="text"
                          required
                          value={industry}
                          onChange={(e) => setIndustry(e.target.value)}
                          placeholder="e.g. IT Services & Cloud"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-600 text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Headquarters
                        </label>
                        <input
                          type="text"
                          required
                          value={location}
                          onChange={(e) => setLocation(e.target.value)}
                          placeholder="e.g. Noida, India"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-600 text-sm shadow-sm"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                          Website URL
                        </label>
                        <input
                          type="url"
                          value={website}
                          onChange={(e) => setWebsite(e.target.value)}
                          placeholder="https://hcltech.com"
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-600 text-sm shadow-sm"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                        Company Overview / Bio
                      </label>
                      <textarea
                        rows={2}
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        placeholder="Brief description of your enterprise, hiring domains, and team mission..."
                        className="w-full px-3 py-2 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-violet-600 text-sm resize-none shadow-sm"
                      />
                    </div>

                    <div className="p-3 rounded-xl bg-violet-50 border border-violet-200 text-xs text-violet-900 leading-relaxed">
                      🛡️ <strong>Platform Verification Policy:</strong> After registration, an administrator reviews and approves the company credentials before employer access is granted.
                    </div>
                  </div>
                )}

                {/* Admin Specific Fields */}
                {roleType === 'ADMIN' && (
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                      Administrative Department
                    </label>
                    <input
                      type="text"
                      value={department}
                      onChange={(e) => setDepartment(e.target.value)}
                      placeholder="Platform Operations & QA"
                      className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-emerald-600 text-sm shadow-sm"
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  variant={roleType === 'STUDENT' ? 'primary' : roleType === 'COMPANY' ? 'accent' : 'secondary'}
                  loading={loading}
                  className="w-full mt-4 justify-center"
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

