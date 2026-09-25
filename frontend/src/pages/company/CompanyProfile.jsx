import React, { useState, useEffect } from 'react';
import { companyApi } from '../../api/companyApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  Building2,
  Globe,
  MapPin,
  FileCheck2,
  CheckCircle2,
  AlertCircle,
  Clock,
  Upload,
} from 'lucide-react';

export const CompanyProfile = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');
  const [errorMsg, setErrorMsg] = useState('');

  const [formData, setFormData] = useState({
    name: '',
    industry: '',
    website: '',
    location: '',
    description: '',
    logoUrl: '',
    documentsUrl: '',
  });

  const fetchProfile = async () => {
    try {
      const res = await companyApi.getProfile();
      if (res && res.success) {
        setProfile(res.data);
        setFormData({
          name: res.data.name || '',
          industry: res.data.industry || '',
          website: res.data.website || '',
          location: res.data.location || '',
          description: res.data.description || '',
          logoUrl: res.data.logoUrl || '',
          documentsUrl: res.data.documentsUrl || '',
        });
      }
    } catch (err) {
      console.error('Error loading company profile:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setSuccessMsg('');
    setErrorMsg('');

    try {
      const res = await companyApi.updateProfile(formData);
      if (res && res.success) {
        setProfile(res.data);
        setSuccessMsg('Company profile updated successfully!');
        setTimeout(() => setSuccessMsg(''), 3000);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Failed to update company profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <Loader fullScreen message="Loading company profile..." />;

  const isVerified = profile?.verificationStatus === 'VERIFIED';
  const isPending = profile?.verificationStatus === 'PENDING';

  return (
    <DashboardLayout
      title="Company & Recruiter Profile"
      subtitle="Manage your employer brand, contact channels, and official verification documents."
    >
      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-500" />
          {successMsg}
        </div>
      )}

      {errorMsg && (
        <div className="mb-6 p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-sm flex items-center gap-2">
          <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
          {errorMsg}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Form */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSubmit} className="p-6 sm:p-8 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm space-y-6">
            <div className="flex items-center justify-between pb-4 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <h3 className="text-lg font-bold text-slate-900">Employer Details</h3>
              </div>
              <Badge variant={isVerified ? 'emerald' : isPending ? 'amber' : 'rose'} size="md">
                {profile?.verificationStatus}
              </Badge>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Company Name *
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Industry Focus
                </label>
                <input
                  type="text"
                  value={formData.industry}
                  onChange={(e) => setFormData({ ...formData, industry: e.target.value })}
                  placeholder="e.g. Artificial Intelligence, Cloud Services"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Headquarters / Primary Location
                </label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g. San Francisco, CA"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                  Official Website
                </label>
                <input
                  type="url"
                  value={formData.website}
                  onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                  placeholder="https://company.com"
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Company Logo URL
              </label>
              <input
                type="url"
                value={formData.logoUrl}
                onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Company Description & Mission
              </label>
              <textarea
                rows={4}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Share your company vision, engineering culture, and growth opportunities for candidates..."
                className="w-full p-3.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:outline-none leading-relaxed transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-600 uppercase tracking-wider mb-2">
                Verification Documents Link (Certificate of Incorporation / License)
              </label>
              <input
                type="url"
                value={formData.documentsUrl}
                onChange={(e) => setFormData({ ...formData, documentsUrl: e.target.value })}
                placeholder="https://docs.company.com/business-license.pdf"
                className="w-full px-3.5 py-2.5 bg-white border border-slate-200 rounded-xl text-slate-900 text-sm focus:border-indigo-500 focus:ring-4 focus:ring-indigo-50 focus:outline-none transition-all"
              />
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100">
              <Button type="submit" variant="primary" size="md" loading={saving}>
                Save Company Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Right Col: Employer Brand Card */}
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm space-y-4">
            <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Public Brand Preview</h4>
            <div className="flex items-center gap-4">
              {formData.logoUrl ? (
                <img
                  src={formData.logoUrl}
                  alt={formData.name}
                  className="w-14 h-14 rounded-xl object-cover border border-slate-200"
                />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-indigo-50 border border-indigo-100 flex items-center justify-center font-bold text-indigo-700 text-lg">
                  {formData.name?.substring(0, 2).toUpperCase() || 'CO'}
                </div>
              )}
              <div>
                <div className="text-base font-bold text-slate-900">{formData.name || 'Company Name'}</div>
                <div className="text-xs text-indigo-600 font-medium">{formData.industry || 'Industry'}</div>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed line-clamp-4">
              {formData.description || 'No description provided yet.'}
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
