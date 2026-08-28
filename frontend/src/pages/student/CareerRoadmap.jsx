import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { roadmapApi } from '../../api/roadmapApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { RoadmapSearchBox } from '../../components/student/RoadmapSearchBox';
import { TrendingDomainCard } from '../../components/student/TrendingDomainCard';
import { RoadmapTimeline } from '../../components/student/RoadmapTimeline';
import { SavedRoadmapsList } from '../../components/student/SavedRoadmapsList';
import { Button } from '../../components/common/Button';
import {
  Sparkles,
  TrendingUp,
  Bookmark,
  Compass,
  AlertCircle,
  RefreshCw,
  Search,
} from 'lucide-react';

export const CareerRoadmap = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialDomain = searchParams.get('domain') || '';

  const [activeTab, setActiveTab] = useState('explore'); // 'explore' | 'saved'
  const [trendingDomains, setTrendingDomains] = useState([]);
  const [currentRoadmap, setCurrentRoadmap] = useState(null);
  const [savedRoadmaps, setSavedRoadmaps] = useState([]);
  const [progressState, setProgressState] = useState({});

  // Loading and Error States
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [roadmapLoading, setRoadmapLoading] = useState(false);
  const [savingLoading, setSavingLoading] = useState(false);
  const [savedRoadmapsLoading, setSavedRoadmapsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [selectedDomainName, setSelectedDomainName] = useState(initialDomain);

  // Fetch initial trending domains and saved roadmaps
  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const [domainsRes, savedRes] = await Promise.allSettled([
          roadmapApi.getTrendingDomains(),
          roadmapApi.getSavedRoadmaps(),
        ]);

        if (domainsRes.status === 'fulfilled' && domainsRes.value.success) {
          setTrendingDomains(domainsRes.value.data || []);
        }
        if (savedRes.status === 'fulfilled' && savedRes.value.success) {
          setSavedRoadmaps(savedRes.value.data || []);
        }
      } catch (err) {
        console.error('Error loading roadmap data:', err);
      } finally {
        setTrendingLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Handle URL query parameter search on mount
  useEffect(() => {
    if (initialDomain) {
      handleSearchDomain(initialDomain);
    }
  }, [initialDomain]);

  const handleSearchDomain = async (domainName) => {
    if (!domainName || !domainName.trim()) return;

    setRoadmapLoading(true);
    setErrorMessage('');
    setSelectedDomainName(domainName);
    setSearchParams({ domain: domainName });
    setActiveTab('explore');

    try {
      const res = await roadmapApi.searchRoadmap(domainName.trim());
      if (res && res.success) {
        setCurrentRoadmap(res.data);
        // Initialize progress JSON
        try {
          const parsed = JSON.parse(res.data.progressJson || '{}');
          setProgressState(parsed);
        } catch (e) {
          setProgressState({});
        }
      }
    } catch (err) {
      console.error('Failed to generate roadmap:', err);
      setErrorMessage(
        err.response?.data?.message ||
          'Failed to generate roadmap for this domain. Please select a trending domain below.'
      );
    } finally {
      setRoadmapLoading(false);
    }
  };

  const handleToggleStep = async (stepKey) => {
    const nextProgress = {
      ...progressState,
      [stepKey]: !progressState[stepKey],
    };
    setProgressState(nextProgress);

    // If this roadmap is saved in DB, automatically sync progress
    if (currentRoadmap?.id && currentRoadmap.isSaved) {
      try {
        // Find saved roadmap record ID
        const matchedSaved = savedRoadmaps.find(
          (s) => s.roadmapId === currentRoadmap.id
        );
        if (matchedSaved) {
          await roadmapApi.updateProgress(
            matchedSaved.id,
            JSON.stringify(nextProgress)
          );
          // Refresh saved list
          const savedRes = await roadmapApi.getSavedRoadmaps();
          if (savedRes.success) setSavedRoadmaps(savedRes.data || []);
        }
      } catch (e) {
        console.warn('Failed to sync progress to database:', e);
      }
    }
  };

  const handleSaveRoadmap = async () => {
    if (!currentRoadmap?.id) return;
    setSavingLoading(true);

    try {
      const progressJson = JSON.stringify(progressState);
      const res = await roadmapApi.saveRoadmap(currentRoadmap.id, progressJson);
      if (res && res.success) {
        setCurrentRoadmap((prev) => ({ ...prev, isSaved: true }));
        // Refresh saved list
        const savedRes = await roadmapApi.getSavedRoadmaps();
        if (savedRes.success) setSavedRoadmaps(savedRes.data || []);
      }
    } catch (err) {
      console.error('Failed to save roadmap:', err);
    } finally {
      setSavingLoading(false);
    }
  };

  const handleLoadSavedTab = async () => {
    setActiveTab('saved');
    setSavedRoadmapsLoading(true);
    try {
      const res = await roadmapApi.getSavedRoadmaps();
      if (res && res.success) {
        setSavedRoadmaps(res.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSavedRoadmapsLoading(false);
    }
  };

  return (
    <DashboardLayout
      title="AI Career Preparation Roadmap"
      subtitle="Search any tech domain or explore trending paths to generate a structured, stepwise curriculum with hands-on projects and milestones."
    >
      {/* Top Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 mb-8">
        <div className="flex items-center gap-6">
          <button
            type="button"
            onClick={() => setActiveTab('explore')}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'explore'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Compass className="w-4 h-4 text-blue-400" />
            <span>Generate Roadmap</span>
          </button>

          <button
            type="button"
            onClick={handleLoadSavedTab}
            className={`pb-3 text-sm font-bold flex items-center gap-2 border-b-2 transition-all ${
              activeTab === 'saved'
                ? 'border-blue-500 text-white'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bookmark className="w-4 h-4 text-purple-400" />
            <span>My Saved Roadmaps</span>
            {savedRoadmaps.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-slate-800 text-[11px] text-blue-400 font-semibold">
                {savedRoadmaps.length}
              </span>
            )}
          </button>
        </div>
      </div>

      {activeTab === 'saved' ? (
        /* Saved Roadmaps Tab View */
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-white">Your Bookmarked Career Roadmaps</h3>
            <span className="text-xs text-slate-400">
              Track your phase completions and milestones
            </span>
          </div>

          <SavedRoadmapsList
            savedRoadmaps={savedRoadmaps}
            loading={savedRoadmapsLoading}
            onSelectRoadmap={(domain) => handleSearchDomain(domain)}
          />
        </div>
      ) : (
        /* Explore & Generate Tab View */
        <div className="space-y-10">
          {/* Search Header */}
          <div className="text-center space-y-4 max-w-2xl mx-auto pt-2">
            <h2 className="text-xl sm:text-2xl font-bold text-white">
              What career domain would you like to master?
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
              Enter any specialized field or click a trending topic below. Our AI evaluates foundational prerequisites, core toolchains, and real-world portfolio requirements.
            </p>

            <RoadmapSearchBox
              onSearch={handleSearchDomain}
              trendingDomains={trendingDomains}
              initialValue={selectedDomainName}
              loading={roadmapLoading}
            />
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-4 rounded-2xl bg-rose-950/80 border border-rose-800/60 text-rose-300 text-xs sm:text-sm flex items-center gap-3 max-w-3xl mx-auto">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Skeleton Loader during Roadmap Generation */}
          {roadmapLoading && (
            <div className="p-8 rounded-3xl bg-slate-900/60 border border-slate-800/80 space-y-6 animate-pulse max-w-4xl mx-auto">
              <div className="h-6 bg-slate-800 rounded-lg w-1/3" />
              <div className="h-4 bg-slate-800/60 rounded w-3/4" />
              <div className="h-3 bg-slate-800/40 rounded w-1/2" />
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div className="h-20 bg-slate-800/50 rounded-2xl" />
                <div className="h-20 bg-slate-800/50 rounded-2xl" />
                <div className="h-20 bg-slate-800/50 rounded-2xl" />
              </div>
              <div className="text-center text-xs text-blue-400 font-semibold pt-4">
                Synthesizing AI phases, projects, and certifications for {selectedDomainName}...
              </div>
            </div>
          )}

          {/* Rendered Roadmap Timeline */}
          {!roadmapLoading && currentRoadmap && (
            <div className="max-w-4xl mx-auto">
              <RoadmapTimeline
                roadmap={currentRoadmap}
                progress={progressState}
                onToggleStep={handleToggleStep}
                onSaveRoadmap={handleSaveRoadmap}
                saving={savingLoading}
                isSaved={currentRoadmap.isSaved}
              />
            </div>
          )}

          {/* Trending Domains Section */}
          <div className="space-y-5 pt-4 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white">Trending Industry Domains</h3>
              </div>
              <span className="text-xs text-slate-400 font-medium">
                Curated high-growth tech paths
              </span>
            </div>

            {trendingLoading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((n) => (
                  <div key={n} className="h-32 rounded-2xl bg-slate-900 animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {trendingDomains.map((domain) => (
                  <TrendingDomainCard
                    key={domain.id || domain.domainName}
                    domain={domain}
                    isSelected={
                      selectedDomainName?.toLowerCase() === domain.domainName.toLowerCase()
                    }
                    onSelect={(dName) => handleSearchDomain(dName)}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </DashboardLayout>
  );
};
