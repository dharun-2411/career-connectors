import React, { useState } from 'react';
import {
  CheckCircle2,
  Circle,
  Clock,
  BookOpen,
  Code2,
  Sparkles,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Award,
  Layers,
  Check,
  Download,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { Button } from '../common/Button';

import { generateRoadmapPdf } from '../../utils/roadmapPdfGenerator';

export const RoadmapTimeline = ({
  roadmap,
  progress = {},
  onToggleStep,
  onSaveRoadmap,
  saving = false,
  isSaved = false,
}) => {
  const [expandedPhases, setExpandedPhases] = useState({ phase_1: true, phase_2: true });

  const togglePhaseExpand = (phaseId) => {
    setExpandedPhases((prev) => ({
      ...prev,
      [phaseId]: !prev[phaseId],
    }));
  };

  const handleDownloadRoadmap = () => {
    if (!roadmap) return;
    try {
      generateRoadmapPdf(roadmap, progress);
    } catch (err) {
      console.error('Failed to generate PDF roadmap:', err);
    }
  };

  // Calculate overall progress percentage
  const totalMilestones = roadmap.phases?.reduce(
    (acc, p) => acc + (p.milestones?.length || 1),
    0
  ) || 1;

  const completedCount = Object.values(progress).filter(Boolean).length;
  const progressPercent = Math.min(100, Math.round((completedCount / totalMilestones) * 100));

  return (
    <div className="space-y-8">
      {/* Roadmap Overview Banner */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 border border-indigo-100 shadow-nexus-sm space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 flex-1">
            <div className="inline-flex items-center gap-2 text-xs font-bold text-indigo-600 uppercase tracking-wider">
              <Sparkles className="w-4 h-4 text-amber-500" /> AI-Generated Career Preparation Roadmap
            </div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
              {roadmap.domainName}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed max-w-3xl">
              {roadmap.overview}
            </p>
          </div>

          {/* Quick Metrics and Actions */}
          <div className="flex flex-col sm:flex-row md:flex-col items-start sm:items-center md:items-end gap-3 flex-shrink-0">
            <div className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-700 shadow-sm">
              <Clock className="w-4 h-4 text-indigo-600" />
              <span>{roadmap.totalDuration}</span>
            </div>

            <div className="flex items-center gap-2">
              <Button
                variant="secondary"
                size="md"
                onClick={handleDownloadRoadmap}
                icon={Download}
              >
                Download Roadmap (PDF)
              </Button>

              <Button
                variant={isSaved ? 'success' : 'primary'}
                size="md"
                loading={saving}
                onClick={onSaveRoadmap}
                icon={isSaved ? Check : Sparkles}
              >
                {isSaved ? 'Saved to My Roadmaps' : 'Save to My Roadmaps'}
              </Button>
            </div>
          </div>
        </div>

        {/* Progress bar tracker */}
        <div className="p-4 rounded-xl bg-white border border-indigo-100 space-y-2 shadow-sm">
          <div className="flex items-center justify-between text-xs font-semibold">
            <span className="text-slate-600">Roadmap Completion Progress</span>
            <span className="text-emerald-600 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden border border-slate-200">
            <div
              className="h-full bg-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Industry Demand Summary */}
        {roadmap.industryDemandSummary && (
          <div className="text-xs text-slate-600 bg-white/80 p-4 rounded-xl border border-indigo-100 leading-relaxed">
            <span className="font-bold text-indigo-600">Industry Hiring Outlook: </span>
            {roadmap.industryDemandSummary}
          </div>
        )}
      </div>

      {/* Phased Timeline Stepper */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            Step-by-Step Preparation Phases
          </h3>
          <span className="text-xs text-slate-500 font-medium">
            {roadmap.phases?.length || 0} Progressive Milestones
          </span>
        </div>

        <div className="space-y-6 relative before:absolute before:inset-0 before:left-5 before:w-0.5 before:bg-slate-200 before:z-0">
          {roadmap.phases?.map((phase, idx) => {
            const phaseId = phase.phaseId || `phase_${phase.orderIndex || phase.phaseNumber || idx + 1}`;
            const isExpanded = expandedPhases[phaseId] ?? true;
            const orderNum = phase.orderIndex || phase.phaseNumber || (idx + 1);
            const phaseTitle = phase.title || phase.phaseName || `Phase ${orderNum}`;
            const phaseCompleted = phase.milestones?.every(
              (m, mIdx) => progress[`${phaseId}_m_${mIdx}`]
            );

            return (
              <div
                key={phaseId}
                className="relative z-10 pl-12 space-y-4 group"
              >
                {/* Timeline node circle */}
                <div
                  className={`absolute left-2.5 top-5 -translate-x-1/2 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                    phaseCompleted
                      ? 'bg-emerald-500 text-white ring-4 ring-emerald-100'
                      : 'bg-indigo-600 text-white ring-4 ring-indigo-100'
                  }`}
                >
                  {phaseCompleted ? <CheckCircle2 className="w-4 h-4" /> : orderNum}
                </div>

                {/* Phase Container Card */}
                <div className="p-6 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 transition-all space-y-5 shadow-nexus-sm">
                  {/* Top Bar: Title & Duration */}
                  <div
                    onClick={() => togglePhaseExpand(phaseId)}
                    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer select-none"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-indigo-600 uppercase tracking-wider">
                          Phase {orderNum}
                        </span>
                        <span className="text-slate-300">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" /> {phase.duration}
                        </span>
                      </div>
                      <h4 className="text-lg font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {phaseTitle}
                      </h4>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        className="p-1.5 rounded-lg bg-slate-50 text-slate-500 hover:text-slate-900 transition-colors border border-slate-200"
                      >
                        {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed">
                    {phase.description}
                  </p>

                  {/* Expandable Phase Details */}
                  {isExpanded && (
                    <div className="space-y-6 pt-4 border-t border-slate-100 animate-in fade-in duration-300">
                      {/* Topics & Skills Tags */}
                      {phase.topics?.length > 0 && (
                        <div className="space-y-2">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block">
                            Key Competencies to Master:
                          </span>
                          <div className="flex flex-wrap gap-2">
                            {phase.topics.map((t, i) => (
                              <span
                                key={i}
                                className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Curated Resources */}
                      {phase.resources?.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <BookOpen className="w-3.5 h-3.5 text-indigo-600" />
                            Curated Learning Materials:
                          </span>
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            {phase.resources.map((res, i) => (
                              <div
                                key={i}
                                className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200 flex items-start justify-between gap-3 text-xs"
                              >
                                <div className="space-y-1 flex-1">
                                  <div className="flex items-center gap-2">
                                    <span className="font-bold text-slate-900">{res.name || res.title}</span>
                                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-50 text-indigo-700 border border-indigo-200 font-medium">
                                      {res.type}
                                    </span>
                                  </div>
                                  <p className="text-[11px] text-slate-500 leading-snug">
                                    {res.description || 'Curated reference guide & documentation.'}
                                  </p>
                                </div>
                                {(res.url || res.resourceUrl) && (
                                  <a
                                    href={res.url || res.resourceUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="p-1.5 rounded-lg text-indigo-600 hover:text-indigo-700 hover:bg-indigo-50 transition-colors flex-shrink-0"
                                    title="Open Official Documentation"
                                  >
                                    <ExternalLink className="w-3.5 h-3.5" />
                                  </a>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Suggested Projects */}
                      {phase.suggested_projects?.length > 0 && (
                        <div className="space-y-2.5">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider flex items-center gap-1.5">
                            <Code2 className="w-3.5 h-3.5 text-emerald-600" />
                            Suggested Hands-on Project:
                          </span>
                          <div className="space-y-3">
                            {phase.suggested_projects.map((prj, i) => (
                              <div
                                key={i}
                                className="p-4 rounded-xl bg-slate-50/70 border border-slate-200 space-y-2 text-xs"
                              >
                                <div className="flex items-center justify-between">
                                  <h5 className="font-bold text-slate-900">{prj.title}</h5>
                                  <Badge variant="purple" size="sm">{prj.difficulty}</Badge>
                                </div>
                                <p className="text-slate-600 leading-relaxed">{prj.description}</p>
                                {prj.technologies?.length > 0 && (
                                  <div className="flex flex-wrap gap-1.5 pt-1">
                                    {prj.technologies.map((tech, tIdx) => (
                                      <span
                                        key={tIdx}
                                        className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[10px] text-slate-600 font-medium"
                                      >
                                        {tech}
                                      </span>
                                    ))}
                                  </div>
                                )}
                                {prj.portfolioImpact && (
                                  <div className="text-[11px] text-emerald-700 font-medium pt-1">
                                    Portfolio Impact: {prj.portfolioImpact}
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Milestones Checklist */}
                      {phase.milestones?.length > 0 && (
                        <div className="space-y-2 pt-2 border-t border-slate-100">
                          <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider block mb-2">
                            Phase Completion Milestones:
                          </span>
                          <div className="space-y-2">
                            {phase.milestones.map((m, mIdx) => {
                              const stepKey = `${phaseId}_m_${mIdx}`;
                              const isChecked = !!progress[stepKey];

                              return (
                                <label
                                  key={mIdx}
                                  className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200 cursor-pointer transition-colors"
                                >
                                  <input
                                    type="checkbox"
                                    checked={isChecked}
                                    onChange={() => onToggleStep(stepKey)}
                                    className="mt-0.5 w-4 h-4 rounded text-indigo-600 bg-white border-slate-300 focus:ring-indigo-500"
                                  />
                                  <span
                                    className={`text-xs ${
                                      isChecked
                                        ? 'text-slate-400 line-through'
                                        : 'text-slate-700 font-medium'
                                    }`}
                                  >
                                    {m}
                                  </span>
                                </label>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Certifications, Core Tools & Capstone Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 pt-4">
        {/* Core Technologies */}
        {roadmap.coreTechnologies?.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Code2 className="w-4 h-4 text-indigo-600" />
              Core Technologies
            </h4>
            <div className="flex flex-wrap gap-2">
              {roadmap.coreTechnologies.map((tech, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
                >
                  {tech}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* Recommended Certifications */}
        {roadmap.recommendedCertifications?.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Award className="w-4 h-4 text-amber-500" />
              Industry Certifications
            </h4>
            <div className="space-y-2">
              {roadmap.recommendedCertifications.map((cert, i) => (
                <div
                  key={i}
                  className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 font-medium flex items-center gap-2"
                >
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>{cert}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Adjacent Domains */}
        {roadmap.adjacentDomains?.length > 0 && (
          <div className="p-6 rounded-2xl bg-white border border-slate-200/90 shadow-nexus-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-purple-600" />
              Adjacent Career Paths
            </h4>
            <div className="flex flex-wrap gap-2">
              {roadmap.adjacentDomains.map((adj, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-purple-50 border border-purple-200 text-xs text-purple-700 font-medium"
                >
                  {adj}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
