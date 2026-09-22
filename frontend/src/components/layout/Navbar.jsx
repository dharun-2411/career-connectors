import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  Sparkles,
  LogOut,
  User as UserIcon,
  Briefcase,
  Shield,
  Compass,
  BookOpen,
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
} from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isCompany, isAdmin } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    setMobileMenuOpen(false);
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group" onClick={() => setMobileMenuOpen(false)}>
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-sky-500 to-indigo-500 flex items-center justify-center shadow-lg shadow-blue-500/25 group-hover:scale-105 transition-transform">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <span className="text-lg font-bold tracking-tight text-white block">
                  Career<span className="text-blue-400">Connectors</span>
                </span>
                <span className="text-[10px] uppercase tracking-widest text-slate-400 font-semibold block -mt-1">
                  AI Talent Platform
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <div className="hidden lg:flex items-center gap-5 text-sm font-medium text-slate-300">
              {!isCompany && (
                <Link to="/opportunities" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-400" />
                  Explore Opportunities
                </Link>
              )}
              {isStudent && (
                <>
                  <Link to="/student/roadmap" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <Map className="w-4 h-4 text-sky-400" />
                    AI Roadmap
                  </Link>
                  <Link to="/student/recommendations" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Feed
                  </Link>
                  <Link to="/student/career-suggestions" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <TrendingUp className="w-4 h-4 text-emerald-400" />
                    Career Paths
                  </Link>
                  <Link to="/student/applications" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <FileCheck2 className="w-4 h-4 text-purple-400" />
                    Applications
                  </Link>
                </>
              )}
              {isCompany && (
                <>
                  <Link to="/company/post-opportunity" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <PlusCircle className="w-4 h-4 text-purple-400" />
                    Post Role
                  </Link>
                  <Link to="/company/opportunities" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    Manage Postings
                  </Link>
                  <Link to="/company/applicants" className="hover:text-purple-400 transition-colors flex items-center gap-1.5">
                    <Users className="w-4 h-4 text-purple-400" />
                    Applicant Pipeline
                  </Link>
                </>
              )}
              {isAdmin && (
                <>
                  <Link to="/admin/dashboard" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <Shield className="w-4 h-4 text-emerald-400" />
                    Platform Analytics
                  </Link>
                  <Link to="/admin/students" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <GraduationCap className="w-4 h-4 text-blue-400" />
                    Students
                  </Link>
                  <Link to="/admin/companies" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    Verifications
                  </Link>
                  <Link to="/admin/opportunities" className="hover:text-emerald-400 transition-colors flex items-center gap-1.5">
                    <Briefcase className="w-4 h-4 text-purple-400" />
                    Moderation
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Right Action / Profile area */}
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <div className="flex items-center gap-3">
                {/* Role Badge */}
                <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-900 border border-slate-800 text-slate-300">
                  {isStudent && <UserIcon className="w-3.5 h-3.5 text-blue-400" />}
                  {isCompany && <Briefcase className="w-3.5 h-3.5 text-purple-400" />}
                  {isAdmin && <Shield className="w-3.5 h-3.5 text-emerald-400" />}
                  {user?.name || user?.email}
                </span>

                {/* Dashboard button */}
                <Link to={isStudent ? '/student/dashboard' : isCompany ? '/company/dashboard' : '/admin/dashboard'}>
                  <Button variant="secondary" size="sm">
                    Dashboard
                  </Button>
                </Link>

                {/* Logout */}
                <button
                  onClick={handleLogout}
                  title="Log out"
                  className="p-2 text-slate-400 hover:text-rose-400 hover:bg-slate-900 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" />
                </button>

                {/* Mobile Menu Toggle */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 lg:hidden text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
                  aria-label="Toggle navigation menu"
                >
                  {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link to="/opportunities" className="hidden sm:inline-flex text-xs font-semibold text-slate-300 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors">
                  Opportunities
                </Link>
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
                {/* Mobile Menu Toggle for Guests */}
                <button
                  onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                  className="p-2 sm:hidden text-slate-400 hover:text-white hover:bg-slate-900 rounded-xl transition-colors"
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
        <div className="lg:hidden bg-slate-950/95 border-b border-slate-800 p-4 space-y-3 animate-fade-in backdrop-blur-xl">
          <div className="text-xs font-bold text-slate-400 uppercase tracking-wider px-2">
            Navigation Menu
          </div>

          <div className="space-y-1">
            {!isCompany && (
              <Link
                to="/opportunities"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
              >
                <Compass className="w-4 h-4 text-blue-400" />
                <span>Explore Opportunities</span>
              </Link>
            )}

            {isStudent && (
              <>
                <Link
                  to="/student/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Compass className="w-4 h-4 text-blue-400" />
                  <span>Student Dashboard</span>
                </Link>
                <Link
                  to="/student/roadmap"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Map className="w-4 h-4 text-sky-400" />
                  <span>AI Career Roadmap</span>
                </Link>
                <Link
                  to="/student/recommendations"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  <span>AI Recommendations Feed</span>
                </Link>
                <Link
                  to="/student/career-suggestions"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <TrendingUp className="w-4 h-4 text-emerald-400" />
                  <span>Career Trajectories</span>
                </Link>
                <Link
                  to="/student/applications"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <FileCheck2 className="w-4 h-4 text-purple-400" />
                  <span>My Applications Tracker</span>
                </Link>
                <Link
                  to="/student/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <UserIcon className="w-4 h-4 text-blue-400" />
                  <span>Profile & Skills Matrix</span>
                </Link>
              </>
            )}

            {isCompany && (
              <>
                <Link
                  to="/company/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Recruiter Dashboard</span>
                </Link>
                <Link
                  to="/company/post-opportunity"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <PlusCircle className="w-4 h-4 text-purple-400" />
                  <span>Post Opportunity</span>
                </Link>
                <Link
                  to="/company/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-purple-400" />
                  <span>Manage Postings</span>
                </Link>
                <Link
                  to="/company/applicants"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Users className="w-4 h-4 text-purple-400" />
                  <span>Applicant Pipeline</span>
                </Link>
                <Link
                  to="/company/profile"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Building2 className="w-4 h-4 text-purple-400" />
                  <span>Company Profile</span>
                </Link>
              </>
            )}

            {isAdmin && (
              <>
                <Link
                  to="/admin/dashboard"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Shield className="w-4 h-4 text-emerald-400" />
                  <span>Platform Analytics</span>
                </Link>
                <Link
                  to="/admin/students"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <GraduationCap className="w-4 h-4 text-blue-400" />
                  <span>Student Directory</span>
                </Link>
                <Link
                  to="/admin/companies"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  <span>Company Verifications</span>
                </Link>
                <Link
                  to="/admin/opportunities"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-slate-300 hover:text-white hover:bg-slate-900 transition-colors"
                >
                  <Briefcase className="w-4 h-4 text-purple-400" />
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
