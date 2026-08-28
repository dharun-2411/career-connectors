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
    try {
      await adminApi.deleteOpportunity(id);
      fetchOpportunities(currentPage);
    } catch (err) {
      console.error('Failed to delete opportunity:', err);
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
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/90">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Position Title</th>
                  <th className="p-4">Company</th>
                  <th className="p-4">Type & Location</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Moderation</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {opportunities.map((opp) => (
                  <tr key={opp.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4 font-bold text-white text-sm">
                      <Link to={`/opportunities/${opp.id}`} className="hover:text-blue-400">
                        {opp.title}
                      </Link>
                    </td>
                    <td className="p-4 font-semibold text-slate-200">{opp.companyName}</td>
                    <td className="p-4">
                      <div>{opp.type.replace('_', ' ')}</div>
                      <div className="text-slate-400 text-[11px]">{opp.isRemote ? 'Remote' : opp.location}</div>
                    </td>
                    <td className="p-4">
                      <Badge variant={opp.status === 'OPEN' ? 'success' : 'default'} size="sm">
                        {opp.status}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => handleDelete(opp.id)}
                        title="Remove Posting"
                        className="p-2 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-950 transition-colors"
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
