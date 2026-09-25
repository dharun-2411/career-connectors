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
    const nextStatus = currentStatus === 'SUSPENDED' ? 'ACTIVE' : 'SUSPENDED';
    setStudents((prev) =>
      prev.map((s) => (s.userId === userId ? { ...s, status: nextStatus } : s))
    );
    try {
      await adminApi.updateUserStatus(userId, nextStatus);
      fetchStudents(currentPage);
    } catch (err) {
      console.error('Failed to update status:', err);
      fetchStudents(currentPage);
    }
  };

  const handleDelete = async (userId) => {
    if (!window.confirm('Are you sure you want to delete this student user?')) return;
    setStudents((prev) => prev.filter((s) => s.userId !== userId));
    try {
      await adminApi.deleteUser(userId);
      fetchStudents(currentPage);
    } catch (err) {
      console.error('Failed to delete student:', err);
      fetchStudents(currentPage);
    }
  };

  return (
    <DashboardLayout
      title="Student Directory Administration"
      subtitle="View, search, and manage student accounts and platform access."
    >
      {/* Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm mb-8 max-w-md">
        <div className="relative">
          <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search students by name, email, university..."
            className="w-full pl-11 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-900 placeholder-slate-400 focus:outline-none focus:border-indigo-500 text-sm focus:bg-white transition-all"
          />
        </div>
      </div>

      {loading ? (
        <Loader message="Fetching student directory..." />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-nexus-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Student</th>
                  <th className="p-4">University & Degree</th>
                  <th className="p-4">Verified Skills</th>
                  <th className="p-4">Contact</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {students.map((st) => (
                  <tr key={st.id || st.userId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 text-sm">{st.name}</span>
                        <Badge variant={st.status === 'SUSPENDED' ? 'rose' : 'emerald'} size="sm">
                          {st.status || 'ACTIVE'}
                        </Badge>
                      </div>
                      <div className="text-slate-400 text-[11px]">{st.email}</div>
                    </td>
                    <td className="p-4">
                      <div className="font-semibold text-slate-800">{st.university || 'N/A'}</div>
                      <div className="text-slate-500 text-[11px]">{st.education || 'N/A'}</div>
                    </td>
                    <td className="p-4">
                      <div className="flex flex-wrap gap-1 max-w-xs">
                        {st.skills?.slice(0, 3).map((sk) => (
                          <span key={sk.id} className="px-2 py-0.5 rounded bg-indigo-50 border border-indigo-100 text-[10px] text-indigo-700 font-medium">
                            {sk.skillName}
                          </span>
                        ))}
                        {st.skills?.length > 3 && (
                          <span className="text-[10px] text-slate-400 font-medium">+{st.skills.length - 3}</span>
                        )}
                      </div>
                    </td>
                    <td className="p-4">
                      <div className="text-slate-500">{st.phone || 'N/A'}</div>
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <Button
                          variant={st.status === 'SUSPENDED' ? 'success' : 'secondary'}
                          size="sm"
                          onClick={() => handleToggleStatus(st.userId, st.status || 'ACTIVE')}
                        >
                          {st.status === 'SUSPENDED' ? 'Activate' : 'Suspend'}
                        </Button>
                        <button
                          onClick={() => handleDelete(st.userId)}
                          title="Delete User"
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-slate-100 transition-colors"
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
