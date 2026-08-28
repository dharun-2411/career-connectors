import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { Search, GraduationCap, Mail, Phone, ShieldAlert, Trash2 } from 'lucide-react';

export const AdminStudents = () => {
  const [students, setStudents] = useState([]);
  const [search, setSearch] = useState('');
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchStudents = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminApi.getStudents(search, page, 10);
      if (res && res.success) {
        setStudents(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(res.data.pageNumber || 0);
      }
    } catch (err) {
      console.error('Failed to load students:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayFn = setTimeout(() => {
      fetchStudents(0);
    }, 300);
    return () => clearTimeout(delayFn);
  }, [search]);

  const handleToggleStatus = async (userId, currentStatus) => {
    const nextStatus = currentStatus === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    try {
      await adminApi.updateUserStatus(userId, nextStatus);
      fetchStudents(currentPage);
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this student user?')) return;
    try {
      await adminApi.deleteUser(userId);
      fetchStudents(currentPage);
    } catch (err) {
      console.error('Failed to delete student:', err);
    }
  };

  return (
    <DashboardLayout
      title="Student Directory Administration"
      subtitle="View, search, and manage student accounts and platform access."
    >
      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-slate-900 border border-slate-800 mb-8 max-w-md">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, university..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 text-sm"
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching student directory..." />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-3xl border border-slate-800 bg-slate-900/90">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-800">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">University & Degree</th>
                  <th className="p-4">Verified Skills</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-slate-300">
                {students.map((st) => (
                  <tr key={st.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="p-4">
                      <div className="font-bold text-white text-sm">{st.name}</div>
                      <div className="text-slate-500 text-[11px]">{st.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-200">{st.university || 'N/A'}</div>
                      <div className="text-slate-400 text-[11px]">{st.education || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {st.skills?.slice(0, 3).map((sk) => (
                          <span key={sk.id} className="px-2 py-0.5 rounded bg-slate-800 text-[10px] text-slate-300">
                            {sk.skillName}
                          </span>
                        ))}
                        {st.skills?.length > 3 && (
                          <span className="text-[10px] text-slate-500">+{st.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-400">{st.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant="secondary"
                          size="sm"
                          onClick={() => handleToggleStatus(st.userId, 'ACTIVE')}
                        >
                          Suspend
                        </Button>
                        <button
                          onClick={() => handleDelete(st.userId)}
                          className="p-1.5 rounded-lg text-slate-500 hover:text-rose-400 hover:bg-slate-950"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => fetchStudents(p)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};
