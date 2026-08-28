import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Sparkles, LogOut, User as UserIcon, Briefcase, Shield, Compass, BookOpen, Layers, PlusCircle, Users } from 'lucide-react';
import { Button } from '../common/Button';

export const Navbar = () => {
  const { user, isAuthenticated, logout, isStudent, isCompany, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-md border-b border-slate-800/80">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-3 group">
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

            {/* Public / Quick Navigation */}
            <div className="hidden md:flex items-center gap-6 text-sm font-medium text-slate-300">
              {!isCompany && (
                <Link to="/opportunities" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                  <Compass className="w-4 h-4 text-blue-400" />
                  Explore Opportunities
                </Link>
              )}
              {isStudent && (
                <>
                  <Link to="/student/recommendations" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-amber-400" />
                    AI Feed
                  </Link>
                  <Link to="/student/career-suggestions" className="hover:text-blue-400 transition-colors flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-emerald-400" />
                    Career Paths
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
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
