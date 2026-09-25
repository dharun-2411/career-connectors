import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Briefcase,
  Shield,
  Compass,
  PlusCircle,
  Users,
  Menu,
  X,
  Map,
  FileCheck2,
  ShieldCheck,
  GraduationCap,
  Building2,
  TrendingUp,
  Search,
  Bell,
  Layers,
} from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isCompany, isAdmin } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/opportunities?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isTabActive = (path) => {
    if (path === '/' && location.pathname === '/') return true;
    if (path !== '/' && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <nav className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 gap-4">
          
          {/* Left: Brand Logo */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center shadow-nexus-sm group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div className="flex flex-col">
                <span className="text-base font-bold tracking-tight text-slate-900 leading-tight">
                  Career<span className="text-indigo-600">Connectors</span>
                </span>
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider -mt-0.5 hidden sm:block">
                  AI Career Platform
                </span>
              </div>
            </Link>
          </div>

          {/* Center: Navigation Pill Tabs (Only for unauthenticated guests) */}
          {!isAuthenticated && (
            <div className="hidden lg:flex items-center gap-1.5 p-1 bg-slate-100/90 rounded-full border border-slate-200">
              <Link
                to="/"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isTabActive('/')
                    ? 'bg-white text-indigo-600 shadow-nexus-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Home
              </Link>
              <Link
                to="/opportunities"
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-all ${
                  isTabActive('/opportunities')
                    ? 'bg-white text-indigo-600 shadow-nexus-sm'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Explore Opportunities
              </Link>
            </div>
          )}

          {/* Right: Search Bar, Role Badge, Notification, User Profile */}
          <div className="flex items-center gap-3">
            
            {/* Global Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative hidden md:block w-48 xl:w-60">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search jobs, skills..."
                className="w-full pl-8 pr-3 py-1.5 bg-slate-50 hover:bg-slate-100/80 focus:bg-white text-xs text-slate-800 placeholder-slate-400 rounded-full border border-slate-200 focus:border-indigo-600 focus:outline-none transition-all"
              />
            </form>

            {isAuthenticated ? (
              <div className="flex items-center gap-2.5">
                
                {/* Status Pill */}
                {isStudent && (
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-[11px] font-semibold text-indigo-700">
                    <span className="w-2 h-2 rounded-full bg-indigo-600"></span>
                    <span>Student Member</span>
                  </div>
                )}

                {isCompany && (
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-[11px] font-semibold text-emerald-700">
                    <span className="w-2 h-2 rounded-full bg-emerald-600"></span>
                    <span>Verified Employer</span>
                  </div>
                )}

                {isAdmin && (
                  <div className="hidden sm:inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-purple-50 border border-purple-200 text-[11px] font-semibold text-purple-700">
                    <span className="w-2 h-2 rounded-full bg-purple-600"></span>
                    <span>Platform Admin</span>
                  </div>
                )}

                {/* User Profile Chip */}
                <div className="flex items-center gap-2 pl-1 sm:pl-2 border-l border-slate-200">
                  <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
                    {user?.name ? user.name.substring(0, 2).toUpperCase() : 'CC'}
                  </div>
                  
                  <div className="hidden md:flex flex-col text-left">
                    <span className="text-xs font-bold text-slate-800 leading-tight">
                      {user?.name || (isStudent ? 'Student Member' : isCompany ? 'Employer Partner' : 'Admin')}
                    </span>
                    <span className="text-[10px] text-slate-500 font-medium leading-tight">
                      {user?.email || ''}
                    </span>
                  </div>

                  {/* Logout Button */}
                  <button
                    onClick={handleLogout}
                    title="Sign out"
                    className="p-1.5 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors ml-1"
                  >
                    <LogOut className="w-4 h-4" />
                  </button>
                </div>

                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 lg:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/login">
                  <Button variant="ghost" size="sm">
                    Sign In
                  </Button>
                </Link>
                <Link to="/register">
                  <Button variant="primary" size="sm">
                    Get Started
                  </Button>
                </Link>
                {/* Mobile Menu Button */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 lg:hidden text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Mobile Drawer Menu */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-white border-b border-slate-200 p-4 space-y-3 shadow-lg">
          <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-2">
            Navigation Menu
          </div>

          <div className="space-y-1">
            {isStudent && (
              <>
                <Link
                  to="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Student Dashboard</span>
                </Link>
                <Link
                  to="/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Compass className="w-4 h-4 text-indigo-600" />
                  <span>Explore Opportunities</span>
                </Link>
                <Link
                  to="/student/recommendations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <span>AI Recommendations Feed</span>
                </Link>
                <Link
                  to="/student/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Map className="w-4 h-4 text-indigo-600" />
                  <span>AI Career Roadmap</span>
                </Link>
                <Link
                  to="/student/career-suggestions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-600" />
                  <span>Career Paths</span>
                </Link>
                <Link
                  to="/student/skill-gap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Layers className="w-4 h-4 text-sky-600" />
                  <span>Skill Gap Analyzer</span>
                </Link>
                <Link
                  to="/student/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <FileCheck2 className="w-4 h-4 text-purple-600" />
                  <span>My Applications Tracker</span>
                </Link>
                <Link
                  to="/student/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-indigo-600" />
                  <span>Profile &amp; Skills Matrix</span>
                </Link>
              </>
            )}

            {isCompany && (
              <>
                <Link
                  to="/company/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Recruiter Dashboard</span>
                </Link>
                <Link
                  to="/company/post-opportunity"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-indigo-600" />
                  <span>Post Opportunity</span>
                </Link>
                <Link
                  to="/company/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Manage Postings</span>
                </Link>
                <Link
                  to="/company/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-indigo-600" />
                  <span>Company Profile</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Shield className="w-4 h-4 text-purple-600" />
                  <span>Platform Analytics</span>
                </Link>
                <Link
                  to="/admin/students"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-indigo-600" />
                  <span>Student Directory</span>
                </Link>
                <Link
                  to="/admin/companies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-600" />
                  <span>Company Verifications</span>
                </Link>
                <Link
                  to="/admin/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:bg-indigo-50 hover:text-indigo-700 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-indigo-600" />
                  <span>Moderate Postings</span>
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
};
