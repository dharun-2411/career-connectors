import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { RoleRoute } from './RoleRoute';

// Public Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/auth/Login';
import { Register } from '../pages/auth/Register';
import { Opportunities } from '../pages/student/Opportunities';
import { OpportunityDetail } from '../pages/student/OpportunityDetail';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { StudentProfile } from '../pages/student/StudentProfile';
import { Applications } from '../pages/student/Applications';
import { SkillGap } from '../pages/student/SkillGap';
import { AIRecommendations } from '../pages/student/AIRecommendations';
import { CareerSuggestions } from '../pages/student/CareerSuggestions';
import { CareerRoadmap } from '../pages/student/CareerRoadmap';

// Company Pages
import { CompanyDashboard } from '../pages/company/CompanyDashboard';
import { PostOpportunity } from '../pages/company/PostOpportunity';
import { ManageOpportunities } from '../pages/company/ManageOpportunities';
import { ApplicantReview } from '../pages/company/ApplicantReview';
import { CompanyProfile } from '../pages/company/CompanyProfile';

// Admin Pages
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { AdminStudents } from '../pages/admin/AdminStudents';
import { AdminCompanies } from '../pages/admin/AdminCompanies';
import { AdminOpportunities } from '../pages/admin/AdminOpportunities';

export const AppRoutes = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/opportunities" element={<Opportunities />} />
      <Route path="/opportunities/:id" element={<OpportunityDetail />} />

      {/* Authenticated Routes */}
      <Route element={<ProtectedRoute />}>
        {/* Student Routes */}
        <Route element={<RoleRoute allowedRoles={['ROLE_STUDENT']} />}>
          <Route path="/student/dashboard" element={<StudentDashboard />} />
          <Route path="/student/roadmap" element={<CareerRoadmap />} />
          <Route path="/student/profile" element={<StudentProfile />} />
          <Route path="/student/applications" element={<Applications />} />
          <Route path="/student/skill-gap/:id" element={<SkillGap />} />
          <Route path="/student/recommendations" element={<AIRecommendations />} />
          <Route path="/student/career-suggestions" element={<CareerSuggestions />} />
        </Route>

        {/* Company Routes */}
        <Route element={<RoleRoute allowedRoles={['ROLE_COMPANY']} />}>
          <Route path="/company/dashboard" element={<CompanyDashboard />} />
          <Route path="/company/post-opportunity" element={<PostOpportunity />} />
          <Route path="/company/opportunities" element={<ManageOpportunities />} />
          <Route path="/company/applicants" element={<ApplicantReview />} />
          <Route path="/company/profile" element={<CompanyProfile />} />
        </Route>

        {/* Admin Routes */}
        <Route element={<RoleRoute allowedRoles={['ROLE_ADMIN']} />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/students" element={<AdminStudents />} />
          <Route path="/admin/companies" element={<AdminCompanies />} />
          <Route path="/admin/opportunities" element={<AdminOpportunities />} />
        </Route>
      </Route>

      {/* Fallback Route */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
