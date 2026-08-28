import React from 'react';
import { Navbar } from './Navbar';
import { Sidebar } from './Sidebar';
import { useAuth } from '../../context/AuthContext';

export const DashboardLayout = ({ children, title, subtitle, action }) => {
  const { isAuthenticated } = useAuth();

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <div className="flex flex-1 max-w-7xl w-full mx-auto relative">
        {isAuthenticated && (
          <div className="hidden md:block w-64 flex-shrink-0 sticky top-16 h-[calc(100vh-4rem)] self-start z-20">
            <Sidebar />
          </div>
        )}
        <main className="flex-1 min-w-0 p-4 sm:p-6 lg:p-8">
          {(title || action) && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 mb-6 border-b border-slate-800/80">
              <div>
                {title && <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">{title}</h1>}
                {subtitle && <p className="text-sm text-slate-400 mt-1">{subtitle}</p>}
              </div>
              {action && <div className="flex items-center gap-3">{action}</div>}
            </div>
          )}
          {children}
        </main>
      </div>
    </div>
  );
};
