import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';
import { Home, ChevronRight } from 'lucide-react';

export const DashboardLayout = ({
  children,
  title,
  subtitle,
  action,
  breadcrumb,
}) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      <Navbar />

      <div className="flex flex-1 max-w-[1600px] w-full mx-auto relative">
        {isAuthenticated && (
          <div className="hidden lg:block w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] self-start z-20">
            <Sidebar />
          </div>
        )}

        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8 space-y-6">
          {/* Breadcrumb strip */}
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <Home className="w-3.5 h-3.5 text-slate-400" />
            <span>/</span>
            <span className="text-slate-600 font-medium">Career Connectors</span>
            {breadcrumb && (
              <>
                <span>/</span>
                <span className="text-indigo-600 font-semibold">{breadcrumb}</span>
              </>
            )}
          </div>

          {/* Main Title & Action Bar */}
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
              <div>
                {title && <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">{title}</h1>}
                {subtitle && <p className="text-xs sm:text-sm text-slate-500 mt-1">{subtitle}</p>}
              </div>
              {action && <div className="flex items-center gap-3 flex-shrink-0">{action}</div>}
            </div>
          )}

          {/* Content Slot */}
          <div className="space-y-6">{children}</div>
        </main>
      </div>
    </div>
  );
};


