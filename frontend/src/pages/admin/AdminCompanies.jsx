import React, { useState, useEffect } from 'react';
import { adminApi } from '../../api/adminApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import { Pagination } from '../../components/common/Pagination';
import { Building2, Globe, ExternalLink, CheckCircle2, XCircle, Clock } from 'lucide-react';

export const AdminCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [totalPages, setTotalPages] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [loading, setLoading] = useState(true);

  const fetchCompanies = async (page = 0) => {
    setLoading(true);
    try {
      const res = await adminApi.getCompanies('', page, 10);
      if (res && res.success) {
        setCompanies(res.data.content || []);
        setTotalPages(res.data.totalPages || 0);
        setCurrentPage(res.data.pageNumber || 0);
      }
    } catch (err) {
      console.error('Failed to load companies:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCompanies(0);
  }, []);

  const [actionFeedback, setActionFeedback] = useState('');

  const handleVerify = async (companyId, verificationStatus) => {
    try {
      const targetComp = companies.find((c) => c.id === companyId);
      const compName = targetComp?.name || 'Company';

      // Optimistically update local list for immediate visual confirmation
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, verificationStatus } : c))
      );

      // Sync verified companies in localStorage
      const verified = JSON.parse(localStorage.getItem('verified_companies') || '["1","2","recruiter.nexus@nexusai.com","recruiter@nexusai.com","hiring@cloudscale.io","shakthisaran@gmail.com"]');
      if (verificationStatus === 'VERIFIED') {
        if (!verified.includes(String(companyId))) {
          verified.push(String(companyId));
        }
        if (targetComp?.email && !verified.includes(targetComp.email.toLowerCase())) {
          verified.push(targetComp.email.toLowerCase());
        }
        setActionFeedback(`Approved ${compName}: Recruiter access has been granted and account activated.`);
      } else {
        const idx = verified.indexOf(String(companyId));
        if (idx !== -1) verified.splice(idx, 1);
        if (targetComp?.email) {
          const emailIdx = verified.indexOf(targetComp.email.toLowerCase());
          if (emailIdx !== -1) verified.splice(emailIdx, 1);
        }
        setActionFeedback(`Declined ${compName}: Account marked as REJECTED.`);
      }
      localStorage.setItem('verified_companies', JSON.stringify(verified));

      // Sync registered_companies in localStorage
      let regCompanies = JSON.parse(localStorage.getItem('registered_companies') || '[]');
      regCompanies = regCompanies.map((c) => (String(c.id) === String(companyId) || (targetComp?.email && c.email?.toLowerCase() === targetComp.email.toLowerCase()) ? { ...c, verificationStatus } : c));
      localStorage.setItem('registered_companies', JSON.stringify(regCompanies));

      await adminApi.verifyCompany(companyId, verificationStatus, 'Admin reviewed & verified credentials');
      setTimeout(() => setActionFeedback(''), 4000);
      fetchCompanies(currentPage);
    } catch (err) {
      console.error('Failed to update verification status:', err);
    }
  };

  return (
    <DashboardLayout
      title="Company Verification & Trust Queue"
      subtitle="Inspect employer registration documents and approve or reject verification requests."
    >
      {actionFeedback && (
        <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center gap-2.5 text-emerald-800 text-xs font-semibold shadow-sm">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
          <span>{actionFeedback}</span>
        </div>
      )}

      {loading ? (
        <Loader message="Loading employer verification queue..." />
      ) : (
        <div className="space-y-4">
          <div className="overflow-x-auto rounded-2xl border border-slate-200/90 bg-white shadow-nexus-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50/90 text-slate-500 uppercase tracking-wider font-semibold border-b border-slate-200">
                <tr>
                  <th className="p-4">Company</th>
                  <th className="p-4">Industry & Location</th>
                  <th className="p-4">Verification Status</th>
                  <th className="p-4">Documents</th>
                  <th className="p-4 text-right">Moderation Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {companies.map((comp) => {
                  const isVerified = comp.verificationStatus === 'VERIFIED';
                  const isPending = comp.verificationStatus === 'PENDING';

                  return (
                    <tr key={comp.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="p-4">
                        <div className="font-bold text-slate-900 text-sm">{comp.name}</div>
                        <div className="text-slate-400 text-[11px]">{comp.email}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-slate-800">{comp.industry || 'General'}</div>
                        <div className="text-slate-500 text-[11px]">{comp.location || 'N/A'}</div>
                      </td>
                      <td className="p-4">
                        <Badge
                          variant={isVerified ? 'emerald' : isPending ? 'amber' : 'rose'}
                          size="sm"
                        >
                          {comp.verificationStatus}
                        </Badge>
                      </td>
                      <td className="p-4">
                        {comp.documentsUrl ? (
                          <a
                            href={comp.documentsUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1 text-indigo-600 font-semibold hover:underline"
                          >
                            Inspect Docs <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        ) : (
                          <span className="text-slate-400">None uploaded</span>
                        )}
                      </td>
                      <td className="p-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {!isVerified && (
                            <Button
                              variant="success"
                              size="sm"
                              icon={CheckCircle2}
                              onClick={() => handleVerify(comp.id, 'VERIFIED')}
                            >
                              Approve
                            </Button>
                          )}
                          {comp.verificationStatus !== 'REJECTED' && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-rose-600 hover:bg-rose-50"
                              onClick={() => handleVerify(comp.id, 'REJECTED')}
                            >
                              Reject
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={(p) => fetchCompanies(p)}
          />
        </div>
      )}
    </DashboardLayout>
  );
};
