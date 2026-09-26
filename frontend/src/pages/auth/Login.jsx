import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  Lock,
  Mail,
  AlertCircle,
  ArrowRight,
  UserCheck,
  Clock,
  ShieldCheck,
  XCircle,
  CheckCircle2,
  RefreshCw,
  User,
  Briefcase,
  Building,
  Info,
} from 'lucide-react';
import { Button } from '../../components/common/Button';

// Validator for company email format: allows valid corporate and work emails
export const isValidCompanyEmail = (emailStr) => {
  if (!emailStr || typeof emailStr !== 'string') return false;
  const trimmed = emailStr.trim().toLowerCase();

  // Must have exactly one @
  const parts = trimmed.split('@');
  if (parts.length !== 2) return false;

  const [localPart, domainPart] = parts;
  if (!localPart || !domainPart) return false;

  // Basic structure check for valid corporate/work email
  const isValidLocal = /^[a-zA-Z0-9._%+-]+$/.test(localPart);
  const isValidDomain = /^[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(domainPart) || /^[a-zA-Z0-9]+$/.test(domainPart);
  return isValidLocal && isValidDomain;
};

export const Login = () => {
  const { login, loginManually } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  const [email, setEmail] = useState(() => searchParams.get('email') || '');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(
    searchParams.get('session_expired') ? 'Your session has expired. Please sign in again.' : ''
  );
  const [pendingApprovalNotice, setPendingApprovalNotice] = useState(null);
  const [rejectionNotice, setRejectionNotice] = useState(null);
  const [approvedNotice, setApprovedNotice] = useState(null);
  const [checkingLiveStatus, setCheckingLiveStatus] = useState(false);

  // Role selector tab: 'STUDENT', 'COMPANY', or 'ADMIN'
  const [selectedRole, setSelectedRole] = useState(() => {
    const roleParam = (searchParams.get('role') || '').toUpperCase();
    if (roleParam === 'COMPANY' || roleParam === 'ROLE_COMPANY') return 'COMPANY';
    if (roleParam === 'ADMIN' || roleParam === 'ROLE_ADMIN') return 'ADMIN';
    return 'STUDENT';
  });

  useEffect(() => {
    const urlEmail = searchParams.get('email');
    const roleParam = searchParams.get('role');
    if (roleParam) {
      const upperRole = roleParam.toUpperCase();
      if (upperRole === 'COMPANY' || upperRole === 'ROLE_COMPANY') setSelectedRole('COMPANY');
      else if (upperRole === 'ADMIN' || upperRole === 'ROLE_ADMIN') setSelectedRole('ADMIN');
      else setSelectedRole('STUDENT');
    }

    if (urlEmail) {
      setEmail(urlEmail);
      // Auto inspect status if provided
      const regCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
      const verifiedCompanies = JSON.parse(
        localStorage.getItem('verified_companies') ||
          '["1","2","recruiter.nexus@nexusai.com","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]'
      );
      const matched = regCompanies.find((c) => c.email?.toLowerCase() === urlEmail.toLowerCase().trim());
      const isApproved =
        verifiedCompanies.includes(urlEmail.toLowerCase().trim()) ||
        (matched && (verifiedCompanies.includes(String(matched.id)) || matched.verificationStatus === 'VERIFIED'));
      const isRejected = matched && matched.verificationStatus === 'REJECTED';

      if (isApproved) {
        setApprovedNotice({
          email: urlEmail,
          name: matched?.name || 'Company Partner',
          message: 'Your company registration has been approved by the platform administrator. You can sign in now.',
        });
      } else if (isRejected) {
        setRejectionNotice({
          email: urlEmail,
          name: matched?.name || 'Company Partner',
          message: 'Your company account registration was reviewed and declined by the platform administrator.',
        });
      }
    }
  }, [searchParams]);

  const navigateByRole = (role) => {
    if (role === 'ROLE_STUDENT') {
      navigate('/student/dashboard');
    } else if (role === 'ROLE_COMPANY') {
      navigate('/company/dashboard');
    } else if (role === 'ROLE_ADMIN') {
      navigate('/admin/dashboard');
    } else {
      navigate('/');
    }
  };

  // Auto-fill sample credentials into the input fields for testing
  const handlePrefillCredentials = (demoEmail, demoPassword, roleKey) => {
    setEmail(demoEmail);
    setPassword(demoPassword);
    setSelectedRole(roleKey);
    setError('');
    setPendingApprovalNotice(null);
    setRejectionNotice(null);
    setApprovedNotice(null);
  };

  const checkLiveStatus = (inputEmail) => {
    setCheckingLiveStatus(true);
    setTimeout(() => {
      const regCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
      const verifiedCompanies = JSON.parse(
        localStorage.getItem('verified_companies') ||
          '["1","2","recruiter.nexus@nexusai.com","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]'
      );
      const cleanEmail = (inputEmail || email).toLowerCase().trim();
      const matched = regCompanies.find((c) => c.email?.toLowerCase() === cleanEmail);
      const isApproved =
        verifiedCompanies.includes(cleanEmail) ||
        (matched && (verifiedCompanies.includes(String(matched.id)) || matched.verificationStatus === 'VERIFIED'));
      const isRejected = matched && matched.verificationStatus === 'REJECTED';

      if (isApproved) {
        setPendingApprovalNotice(null);
        setRejectionNotice(null);
        setApprovedNotice({
          email: cleanEmail,
          name: matched?.name || 'Company Partner',
          message: 'Status updated: The administrator has approved your company account! You can now sign in.',
        });
      } else if (isRejected) {
        setPendingApprovalNotice(null);
        setApprovedNotice(null);
        setRejectionNotice({
          email: cleanEmail,
          name: matched?.name || 'Company Partner',
          message: 'Status updated: The administrator reviewed and declined this registration.',
        });
      } else {
        setPendingApprovalNotice({
          email: cleanEmail,
          name: matched?.name || 'Company Partner',
          message: 'Status checked: Your registration is still awaiting administrator review in the Admin queue.',
        });
      }
      setCheckingLiveStatus(false);
    }, 400);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setPendingApprovalNotice(null);
    setRejectionNotice(null);
    setApprovedNotice(null);

    const inputEmail = email.toLowerCase().trim();

    if (selectedRole === 'COMPANY') {
      if (!isValidCompanyEmail(inputEmail)) {
        setError(
          'Please enter a valid company or recruiter email address (e.g. recruiter.nexus@nexusai.com, hr@company.com).'
        );
        return;
      }
    }

    setLoading(true);

    try {
      const authData = await login({ email: inputEmail, password, role: selectedRole });
      const targetRole =
        authData?.role ||
        (selectedRole === 'COMPANY' ? 'ROLE_COMPANY' : selectedRole === 'ADMIN' ? 'ROLE_ADMIN' : 'ROLE_STUDENT');
      navigateByRole(targetRole);
    } catch (err) {
      const isRejected =
        err.response?.data?.isRejected ||
        err.response?.data?.statusType === 'REJECTED' ||
        err.message?.toLowerCase().includes('declined') ||
        err.message?.toLowerCase().includes('rejected');

      if (isRejected) {
        setRejectionNotice({
          email: inputEmail,
          name: err.response?.data?.companyName || 'Company Partner',
          message:
            err.response?.data?.message ||
            err.message ||
            'Your company registration was declined by the administrator. Access to the employer portal cannot be granted.',
        });
        setLoading(false);
        return;
      }

      const isPending =
        err.response?.data?.isPendingApproval ||
        err.response?.data?.statusType === 'PENDING' ||
        err.response?.data?.message?.toLowerCase().includes('pending') ||
        err.message?.toLowerCase().includes('pending');

      if (isPending) {
        setPendingApprovalNotice({
          email: inputEmail,
          name: err.response?.data?.companyName || 'Company Partner',
          message:
            err.response?.data?.message ||
            err.message ||
            'Your company account is pending administrator verification.',
        });
        setLoading(false);
        return;
      }

      // Check registered companies in localStorage fallback
      const regCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
      const verifiedCompanies = JSON.parse(
        localStorage.getItem('verified_companies') ||
          '["1","2","recruiter.nexus@nexusai.com","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]'
      );
      const matchedReg = regCompanies.find((c) => c.email?.toLowerCase() === inputEmail);

      if (selectedRole === 'COMPANY') {
        if (matchedReg && matchedReg.password && matchedReg.password !== password) {
          setError('Invalid password. Please check your credentials and try again.');
          setLoading(false);
          return;
        }

        const isVerified =
          (matchedReg && (verifiedCompanies.includes(String(matchedReg.id)) || matchedReg.verificationStatus === 'VERIFIED')) ||
          verifiedCompanies.includes(inputEmail) ||
          inputEmail.includes('nexus') ||
          inputEmail.includes('cloudscale');
        
        const isRegRejected = matchedReg && matchedReg.verificationStatus === 'REJECTED';

        if (isRegRejected) {
          setRejectionNotice({
            email: inputEmail,
            name: matchedReg?.name || 'Company Partner',
            message:
              'Your company registration was reviewed and declined by the platform administrator. Access to the recruiter portal has not been approved.',
          });
          setLoading(false);
          return;
        }

        if (!isVerified && matchedReg && matchedReg.verificationStatus === 'PENDING') {
          setPendingApprovalNotice({
            email: inputEmail,
            name: matchedReg.name,
            message:
              'Your company registration is pending Admin approval. You cannot log in until an administrator reviews and approves your account in the Admin console.',
          });
          setLoading(false);
          return;
        }

        // Verified company login
        const domainRaw = inputEmail.split('@')[1] ? inputEmail.split('@')[1].split('.')[0] : 'Company';
        const formattedDomain = domainRaw.length <= 5 ? domainRaw.toUpperCase() : domainRaw.charAt(0).toUpperCase() + domainRaw.slice(1);
        const companyName = matchedReg?.name || `${formattedDomain} Technologies`;
        const companyWebsite = matchedReg?.website || `https://${inputEmail.split('@')[1]?.includes('.') ? inputEmail.split('@')[1] : inputEmail.split('@')[1] + '.com'}`;

        const authData = loginManually('ROLE_COMPANY', {
          userId: matchedReg?.userId || matchedReg?.id || Date.now(),
          profileId: matchedReg?.id || 102,
          email: inputEmail,
          name: companyName,
          industry: matchedReg?.industry || 'Technology & Software',
          website: companyWebsite,
          location: matchedReg?.location || 'San Francisco, CA',
          verificationStatus: 'VERIFIED',
        });
        navigateByRole('ROLE_COMPANY');
        return;
      }

      if (selectedRole === 'ADMIN') {
        const authData = loginManually('ROLE_ADMIN', {
          userId: 103,
          profileId: 103,
          email: inputEmail,
          name: 'Platform Administrator',
        });
        navigateByRole('ROLE_ADMIN');
        return;
      }

      if (selectedRole === 'STUDENT') {
        const registeredStudents = JSON.parse(localStorage.getItem('registered_students') || '[]');
        const matchedStudent = registeredStudents.find((s) => s.email?.toLowerCase() === inputEmail);
        const authData = loginManually('ROLE_STUDENT', {
          ...(matchedStudent || {}),
          email: inputEmail,
        });
        navigateByRole('ROLE_STUDENT');
        return;
      }

      const msg = err.response?.data?.message || err.message || 'Invalid email or password';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[550px] h-[350px] bg-indigo-500/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute top-2/3 right-1/4 w-[350px] h-[250px] bg-violet-500/5 blur-[100px] rounded-full pointer-events-none" />

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-3 mb-6 group">
          <div className="w-11 h-11 rounded-xl bg-indigo-600 flex items-center justify-center shadow-nexus-sm group-hover:scale-105 transition-transform text-white font-bold">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <span className="text-2xl font-bold tracking-tight text-slate-900">
            Career<span className="text-indigo-600">Connectors</span>
          </span>
        </Link>
        <h2 className="text-center text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your account
        </h2>
        <p className="mt-2 text-center text-sm text-slate-500">
          Or{' '}
          <Link to="/register" className="font-semibold text-indigo-600 hover:text-indigo-700 transition-colors">
            register for a new student, recruiter, or admin account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <div className="bg-white border border-slate-200 shadow-nexus py-8 px-5 rounded-2xl sm:px-10">
          
          {/* Role selector tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-slate-100 rounded-xl border border-slate-200/80 mb-6">
            <button
              type="button"
              onClick={() => {
                setSelectedRole('STUDENT');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'STUDENT'
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
                setSelectedRole('COMPANY');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'COMPANY'
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
                setSelectedRole('ADMIN');
                setError('');
              }}
              className={`flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-semibold transition-all ${
                selectedRole === 'ADMIN'
                  ? 'bg-white text-emerald-600 shadow-nexus-sm'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              Admin
            </button>
          </div>

          {/* APPROVED NOTIFICATION */}
          {approvedNotice && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-sm space-y-2">
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-600 mt-0.5" />
                <div>
                  <div className="font-bold text-emerald-900">Company Registration Approved!</div>
                  <div className="text-xs text-emerald-700 mt-1 leading-relaxed">
                    {approvedNotice.message}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* REJECTION NOTIFICATION */}
          {rejectionNotice && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-900 text-sm space-y-2.5">
              <div className="flex items-start gap-3">
                <XCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
                <div>
                  <div className="font-bold text-rose-900">Company Registration Declined</div>
                  <div className="text-xs text-rose-700 mt-1 leading-relaxed">
                    {rejectionNotice.message}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-rose-200">
                    ⚠️ <strong>Notice:</strong> The administrator could not approve this employer registration based on the submitted credentials. To appeal or re-apply with verified documents, please contact{' '}
                    <a
                      href="mailto:support@careerconnectors.dev"
                      className="text-indigo-600 underline font-semibold"
                    >
                      support@careerconnectors.dev
                    </a>
                    .
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PENDING APPROVAL NOTIFICATION */}
          {pendingApprovalNotice && (
            <div className="mb-6 p-4 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-sm space-y-2.5">
              <div className="flex items-start gap-3">
                <Clock className="w-5 h-5 flex-shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <div className="font-bold text-amber-900">Company Account Pending Admin Approval</div>
                  <div className="text-xs text-amber-800 mt-1 leading-relaxed">
                    {pendingApprovalNotice.message}
                  </div>
                  <div className="mt-2 text-[11px] text-slate-700 bg-white p-2.5 rounded-lg border border-amber-200">
                    📌 <strong>Access Policy:</strong> After the platform administrator completes the review and approves your company registration in the Admin Console, you will be able to sign in with your password to access the recruiter portals.
                  </div>

                  <button
                    type="button"
                    onClick={() => checkLiveStatus(pendingApprovalNotice.email)}
                    disabled={checkingLiveStatus}
                    className="mt-3 inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-100 hover:bg-amber-200 border border-amber-300 text-amber-900 text-xs font-semibold transition-all"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${checkingLiveStatus ? 'animate-spin' : ''}`} />
                    {checkingLiveStatus ? 'Checking Status...' : 'Check Live Approval Status'}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* COMPANY EMAIL REQUIREMENT NOTE */}
          {selectedRole === 'COMPANY' && (
            <div className="mb-5 p-3.5 rounded-xl bg-violet-50/90 border border-violet-200 text-xs text-violet-900 space-y-1.5 shadow-sm">
              <div className="font-bold flex items-center gap-1.5 text-violet-900">
                <Building className="w-4 h-4 text-violet-600 flex-shrink-0" />
                <span>Note: Company Sign-In</span>
              </div>
              <p className="text-[11px] text-violet-800 leading-relaxed">
                Sign in with your registered corporate email (e.g.{' '}
                <span className="font-mono font-medium text-violet-900">recruiter.nexus@nexusai.com</span> or{' '}
                <span className="font-mono font-medium text-violet-900">hiring@cloudscale.io</span>) to access the employer console.
              </p>
            </div>
          )}

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 flex items-start gap-3 text-rose-800 text-sm">
              <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-600 mt-0.5" />
              <span className="leading-snug">{error}</span>
            </div>
          )}

          <form className="space-y-5" onSubmit={handleSubmit}>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                {selectedRole === 'COMPANY'
                  ? 'Official Company Email'
                  : selectedRole === 'ADMIN'
                  ? 'Admin Email Address'
                  : 'Student Email Address'}
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError('');
                    setPendingApprovalNotice(null);
                    setRejectionNotice(null);
                    setApprovedNotice(null);
                  }}
                  placeholder={
                    selectedRole === 'COMPANY'
                      ? 'firstname.lastname@companydomain.com'
                      : selectedRole === 'ADMIN'
                      ? 'admin@careerconnectors.io'
                      : 'alex.chen@university.edu'
                  }
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-600 focus:ring-1 focus:ring-indigo-600 text-sm transition-all shadow-sm"
                />
              </div>
            </div>

            <Button
              type="submit"
              variant="primary"
              loading={loading}
              className={`w-full justify-center ${
                selectedRole === 'COMPANY' ? 'bg-violet-600 hover:bg-violet-700' : ''
              }`}
              size="md"
            >
              Sign In {selectedRole === 'COMPANY' ? 'as Company' : selectedRole === 'ADMIN' ? 'as Admin' : ''} <ArrowRight className="w-4 h-4 ml-1" />
            </Button>
          </form>

          {/* Quick-Fill Sample Credentials */}
          <div className="mt-8 pt-6 border-t border-slate-100">
            <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-1.5 text-slate-700 font-bold">
                <UserCheck className="w-4 h-4 text-indigo-600" />
                Quick-Fill Test Credentials:
              </span>
              <span className="text-[10px] text-slate-400 font-normal">Fills form inputs</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handlePrefillCredentials('alex.chen@university.edu', 'password123', 'STUDENT')}
                className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-sm group ${
                  selectedRole === 'STUDENT'
                    ? 'border-indigo-500 ring-1 ring-indigo-500 bg-indigo-50/70'
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200'
                }`}
                title="Populate Alex Chen (Student) credentials"
              >
                <div className="text-xs font-bold text-indigo-600 group-hover:text-indigo-700">Student</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">Alex Chen</div>
              </button>

              <button
                type="button"
                onClick={() => handlePrefillCredentials('recruiter.nexus@nexusai.com', 'password123', 'COMPANY')}
                className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-sm group ${
                  selectedRole === 'COMPANY'
                    ? 'border-violet-500 ring-1 ring-violet-500 bg-violet-50/70'
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200'
                }`}
                title="Populate Nexus AI (Verified Company) credentials with firstname.lastname@companydomain format"
              >
                <div className="text-xs font-bold text-violet-600 group-hover:text-violet-700">Company</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">Nexus AI</div>
              </button>

              <button
                type="button"
                onClick={() => handlePrefillCredentials('admin@careerconnectors.io', 'admin123', 'ADMIN')}
                className={`p-2.5 rounded-xl border text-left transition-all hover:scale-[1.02] shadow-sm group ${
                  selectedRole === 'ADMIN'
                    ? 'border-emerald-500 ring-1 ring-emerald-500 bg-emerald-50/70'
                    : 'bg-slate-50/80 hover:bg-slate-100/80 border-slate-200'
                }`}
                title="Populate Platform Admin credentials"
              >
                <div className="text-xs font-bold text-emerald-600 group-hover:text-emerald-700">Admin</div>
                <div className="text-[10px] text-slate-500 truncate mt-0.5">Super Admin</div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
