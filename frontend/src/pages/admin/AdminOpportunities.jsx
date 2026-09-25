import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { adminApi } from '../../api/adminApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { Briefcase, MapPin, Trash2, ExternalLink } from 'lucide-react';

export const AdminOpportunities = () => {
  const [opportunities, setOpportunities] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchOpportunities = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminApi.getOpportunities(page, 10);
      if (res && res.success) {
        setOpportunities(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(res.data.pageNumber || 0);
      }
    } catch (err) {
      console.error('Failed to load opportunities for admin:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOpportunities(0);
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm('Moderate & remove this posting platform-wide?')) return;
    setOpportunities((prev) => prev.filter((o) => o.id !== id));
    try {
      await adminApi.deleteOpportunity(id);
      fetchOpportunities(currentPage);
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
      fetchOpportunities(currentPage);
    }
  };

  return (
    <DashboardLayout
      title="Platform Opportunity Moderation"
      subtitle="Supervise all posted internships, full-time jobs, and research fellowships."
    >
      {loading ? (
        <Loader message="Loading postings for moderation..." />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-nexus-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Position Title</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Type & Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4 font-bold text-slate-900 text-sm">
                      <Link to={`/opportunities/${opp.id}`} className="hover:text-indigo-600 transition-colors">
                        {opp.title}
                      </Link>
                    </td>
                    <td className="p-4 font-semibold text-slate-800">{opp.companyName}</td>
                    <td className="p-4">
                      <div className="font-medium text-slate-800">{opp.type.replace('_', ' ')}</div>
                      <div className="text-slate-400 text-[11px]">{opp.isRemote ? 'Remote' : opp.location}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={opp.status === 'OPEN' ? 'emerald' : 'default'} size="sm">
                        {opp.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(opp.id)}
                        title="Remove Posting"
                        className="p-2 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => fetchOpportunities(p)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};
