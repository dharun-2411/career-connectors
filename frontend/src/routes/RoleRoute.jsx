import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Loader } from '../components/common/Loader';

export const RoleRoute = ({ allowedRoles = [] }) => {
  const { user, isAuthenticated, loading } = useAuth();

  if (loading) {
    return <Loader fullScreen message="Verifying permissions..." />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  const hasRole = allowedRoles.includes(user?.role);
  if (!hasRole) {
    if (user?.role === 'ROLE_STUDENT') {
      return <Navigate to="/student/dashboard" replace />;
    } else if (user?.role === 'ROLE_COMPANY') {
      return <Navigate to="/company/dashboard" replace />;
    } else if (user?.role === 'ROLE_ADMIN') {
      return <Navigate to="/admin/dashboard" replace />;
    }
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};
