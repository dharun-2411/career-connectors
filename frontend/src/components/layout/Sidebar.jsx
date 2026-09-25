import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  Compass,
  FileCheck2,
  User,
  Sparkles,
  Briefcase,
  PlusCircle,
  Users,
  ShieldCheck,
  Building2,
  GraduationCap,
  TrendingUp,
  Map,
  Shield,
  Layers,
  CheckCircle2,
} from 'lucide-react';

export const Sidebar = () => {
  const { isStudent, isCompany, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/opportunities', label: 'Explore Opportunities', icon: Compass },
    { to: '/student/roadmap', label: 'AI Career Roadmap', icon: Map },
    { to: '/student/recommendations', label: 'AI Recommendations', icon: Sparkles },
    { to: '/student/career-suggestions', label: 'Career Trajectories', icon: TrendingUp },
    { to: '/student/skill-gap', label: 'Skill Gap Analyzer', icon: Layers },
    { to: '/student/applications', label: 'My Applications', icon: FileCheck2 },
    { to: '/student/profile', label: 'Profile & Skills', icon: User },
  ];

  const companyLinks = [
    { to: '/company/dashboard', label: 'Recruiter Dashboard', icon: LayoutDashboard },
    { to: '/company/post-opportunity', label: 'Post Opportunity', icon: PlusCircle },
    { to: '/company/opportunities', label: 'Manage Postings', icon: Briefcase },
    { to: '/company/profile', label: 'Company Profile', icon: Building2 },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Platform Analytics', icon: Shield },
    { to: '/admin/students', label: 'Student Directory', icon: GraduationCap },
    { to: '/admin/companies', label: 'Company Verification', icon: ShieldCheck },
    { to: '/admin/opportunities', label: 'Moderate Postings', icon: Briefcase },
  ];

  const links = isStudent ? studentLinks : isCompany ? companyLinks : isAdmin ? adminLinks : [];

  return (
    <aside className="w-64 h-full bg-white border-r border-slate-200 p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-2">
        <div className="px-3 py-1.5 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
          {isStudent ? 'Student Workspace' : isCompany ? 'Employer Console' : 'Administration'}
        </div>
        
        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-nexus-sm'
                      : 'text-slate-600 hover:text-indigo-600 hover:bg-slate-50'
                  }`
                }
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                <span className="truncate">{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Status Card */}
      <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">
            {isStudent ? 'Profile Status' : isCompany ? 'Employer Portal' : 'System Status'}
          </span>
          <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            Active
          </span>
        </div>
        <p className="text-[11px] text-slate-500 leading-snug">
          {isStudent
            ? 'Real-time AI matching active'
            : isCompany
            ? 'Posting & candidate review enabled'
            : 'All platform services operational'}
        </p>
      </div>
    </aside>
  );
};
