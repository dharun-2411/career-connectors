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
  MapPin,
  Layers,
  Map,
} from 'lucide-react';

export const Sidebar = () => {
  const { isStudent, isCompany, isAdmin } = useAuth();

  const studentLinks = [
    { to: '/student/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/opportunities', label: 'Explore Opportunities', icon: Compass },
    { to: '/student/roadmap', label: 'AI Career Roadmap', icon: Map },
    { to: '/student/recommendations', label: 'AI Recommendations', icon: Sparkles },
    { to: '/student/career-suggestions', label: 'Career Trajectories', icon: TrendingUp },
    { to: '/student/applications', label: 'My Applications', icon: FileCheck2 },
    { to: '/student/profile', label: 'Profile & Skills', icon: User },
  ];

  const companyLinks = [
    { to: '/company/dashboard', label: 'Recruiter Dashboard', icon: LayoutDashboard },
    { to: '/company/post-opportunity', label: 'Post Opportunity', icon: PlusCircle },
    { to: '/company/opportunities', label: 'Manage Postings', icon: Briefcase },
    { to: '/company/applicants', label: 'Applicant Pipeline', icon: Users },
    { to: '/company/profile', label: 'Company Profile', icon: Building2 },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Platform Analytics', icon: LayoutDashboard },
    { to: '/admin/students', label: 'Student Directory', icon: GraduationCap },
    { to: '/admin/companies', label: 'Company Verification', icon: ShieldCheck },
    { to: '/admin/opportunities', label: 'Moderate Postings', icon: Briefcase },
  ];

  const links = isStudent ? studentLinks : isCompany ? companyLinks : isAdmin ? adminLinks : [];

  return (
    <aside className="w-64 h-full bg-slate-900/60 backdrop-blur-md border-r border-slate-800/80 p-4 flex flex-col justify-between overflow-y-auto">
      <div className="space-y-1">
        <div className="px-3 py-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          {isStudent ? 'Student Workspace' : isCompany ? 'Recruiter Console' : 'Administration'}
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                  isActive
                    ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg shadow-blue-500/20'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="p-3 rounded-2xl bg-gradient-to-r from-blue-950/40 to-indigo-950/40 border border-blue-900/40 text-center space-y-1">
        <div className="text-xs font-bold text-blue-400">AI Compatibility Engine</div>
        <div className="text-[11px] text-slate-400">Dense Vector & Skill Matching Active</div>
      </div>
    </aside>
  );
};
