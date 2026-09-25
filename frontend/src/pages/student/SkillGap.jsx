import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { aiApi } from '../../api/aiApi';
import { opportunityApi } from '../../api/opportunityApi';
import { DashboardLayout } from '../../components/layout/DashboardLayout';
import { ScoreMeter } from '../../components/common/ScoreMeter';
import { Badge } from '../../components/common/Badge';
import { Button } from '../../components/common/Button';
import { Loader } from '../../components/common/Loader';
import {
  Sparkles,
  ArrowLeft,
  Target,
  BookOpen,
  Clock,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Flame,
  GraduationCap,
  Layers,
  ChevronRight,
  Briefcase,
  TrendingUp,
  Award,
  Zap,
  Check,
} from 'lucide-react';

export const SkillGap = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [opportunities, setOpportunities] = useState([]);
  const [selectedOppId, setSelectedOppId] = useState(id ? parseInt(id, 10) : 1);
  const [gapData, setGapData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [simulatedSkills, setSimulatedSkills] = useState([]);

  // Fetch opportunities list for the selector
  useEffect(() => {
    const fetchOpportunities = async () => {
      try {
        const res = await opportunityApi.getOpportunities({ size: 10 });
        if (res && res.success && res.data) {
          const list = res.data.content || res.data;
          setOpportunities(Array.isArray(list) ? list : []);
        }
      } catch (err) {
        console.error('Failed to load opportunities list:', err);
      }
    };
    fetchOpportunities();
  }, []);

  // Update selectedOppId if URL param id changes
  useEffect(() => {
    if (id) {
      setSelectedOppId(parseInt(id, 10));
    }
  }, [id]);

  // Fetch skill gap report whenever selectedOppId changes
  useEffect(() => {
    const fetchSkillGap = async () => {
      if (!selectedOppId) return;
      setAnalyzing(true);
      try {
        const res = await aiApi.getSkillGap(selectedOppId);
        if (res && res.success) {
          setGapData(res.data);
          setSimulatedSkills([]);
        }
      } catch (err) {
        console.error('Failed to load skill gap report:', err);
      } finally {
        setAnalyzing(false);
        setLoading(false);
      }
    };

    fetchSkillGap();
  }, [selectedOppId]);

  const handleOpportunityChange = (oppId) => {
    setSelectedOppId(oppId);
    navigate(`/student/skill-gap/${oppId}`);
  };

  const toggleSimulatedSkill = (skillName) => {
    setSimulatedSkills((prev) =>
      prev.includes(skillName) ? prev.filter((s) => s !== skillName) : [...prev, skillName]
    );
  };

  if (loading) return <Loader fullScreen message="Synthesizing AI Skill Gap & Learning Roadmap..." />;
  if (!gapData) return <div className="p-8 text-center text-slate-400">Skill gap report not available.</div>;

  // Calculate simulated score if skills are toggled
  const simulatedScore = Math.min(
    100,
    Math.round(
      gapData.matchPercentage +
        simulatedSkills.length *
          ((100 - gapData.matchPercentage) / Math.max(1, gapData.missingSkills?.length || 1))
    )
  );

  const matchedCount = gapData.matchedSkills?.length || 4;
  const missingCount = gapData.missingSkills?.length || 0;
  const highPriorityCount = gapData.missingSkills?.filter((s) => s.priority === 'HIGH').length || 0;

  return (
    <DashboardLayout
      title="AI Skill-Gap & Learning Roadmap"
      subtitle={`Detailed competency breakdown and custom curriculum for ${gapData.opportunityTitle} at ${gapData.companyName}.`}
    >
      {/* Top Controls: Back button & Target Opportunity Switcher */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <Link
          to={`/opportunities/${selectedOppId}`}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Opportunity Scope
        </Link>

        {/* Opportunity Selector Dropdown */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500 whitespace-nowrap">Target Role:</span>
          <select
            value={selectedOppId}
            onChange={(e) => handleOpportunityChange(parseInt(e.target.value, 10))}
            className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-800 shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          >
            {opportunities.length > 0 ? (
              opportunities.map((opp) => (
                <option key={opp.id} value={opp.id}>
                  {opp.title} ({opp.companyName})
                </option>
              ))
            ) : (
              <>
                <option value={1}>Full Stack AI Engineering Intern (Nexus AI Technologies)</option>
                <option value={2}>Junior Cloud Backend Engineer (CloudScale Systems)</option>
                <option value={3}>Quantitative Systems Fellow (FinTech Innovations Corp)</option>
              </>
            )}
          </select>
        </div>
      </div>

      {/* Metric Quick Stats Strip */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Alignment</span>
            <Target className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-2xl font-black text-indigo-600 mt-1">
            {simulatedSkills.length > 0 ? `${simulatedScore}%` : `${gapData.matchPercentage}%`}
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {simulatedSkills.length > 0 ? (
              <span className="text-emerald-600 font-semibold">+{simulatedScore - gapData.matchPercentage}% simulated boost</span>
            ) : (
              'Vector semantic match'
            )}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Verified Skills</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-2xl font-black text-emerald-600 mt-1">{matchedCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">Satisfied competencies</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Skill Gaps</span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-black text-amber-600 mt-1">{missingCount}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">
            {highPriorityCount > 0 ? `${highPriorityCount} high priority` : 'Moderate upskilling'}
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Curriculum</span>
            <BookOpen className="w-4 h-4 text-violet-600" />
          </div>
          <div className="text-2xl font-black text-violet-600 mt-1">
            {gapData.learningRoadmap?.length || 0} Modules
          </div>
          <div className="text-[11px] text-slate-500 mt-0.5">Tailored learning path</div>
        </div>
      </div>

      {/* Summary Score Card */}
      <div className="p-6 sm:p-8 rounded-2xl bg-gradient-to-r from-indigo-50/80 via-white to-sky-50/80 border border-indigo-100 shadow-nexus-sm mb-8 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="space-y-2 flex-1">
          <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 uppercase tracking-wider">
            <Target className="w-4 h-4" /> Competency Match Analysis
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-slate-900 leading-snug">
            {gapData.summary}
          </h2>
          <p className="text-xs text-slate-500">
            Target Role: <span className="text-slate-800 font-semibold">{gapData.opportunityTitle}</span> • {gapData.companyName}
          </p>
        </div>

        <div className="w-full md:w-auto flex flex-col items-center justify-center">
          <ScoreMeter score={simulatedSkills.length > 0 ? simulatedScore : gapData.matchPercentage} size="lg" />
          {simulatedSkills.length > 0 && (
            <span className="text-[11px] font-bold text-emerald-600 mt-2 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Simulated Readiness
            </span>
          )}
        </div>
      </div>

      {/* Matched Competencies Strip */}
      {gapData.matchedSkills && gapData.matchedSkills.length > 0 && (
        <div className="p-5 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm mb-8 space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <h3 className="text-base font-bold text-slate-900">Satisfied &amp; Verified Competencies</h3>
            </div>
            <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200">
              {gapData.matchedSkills.length} Skills Matched
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 pt-2">
            {gapData.matchedSkills.map((skill, idx) => (
              <div
                key={idx}
                className="p-3 rounded-xl bg-emerald-50/50 border border-emerald-100 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="text-xs font-bold text-slate-800">{skill.skillName}</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-700 bg-white px-2 py-0.5 rounded border border-emerald-200">
                  {skill.proficiency || 'VERIFIED'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Two Column Section: Gaps on Left, Roadmap on Right */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Left Col: Missing & Weak Skills Identification */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-amber-500" />
              <h3 className="text-lg font-bold text-slate-900">Identified Competency Gaps</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">
              {gapData.missingSkills?.length || 0} Areas to Boost
            </span>
          </div>

          {gapData.missingSkills?.length === 0 ? (
            <div className="p-8 rounded-2xl bg-emerald-50 border border-emerald-200 text-center space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
              <h4 className="text-base font-bold text-slate-900">Zero Skill Gaps Detected!</h4>
              <p className="text-xs text-slate-600">
                You satisfy all technical competencies required for this opportunity.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-3 bg-indigo-50/70 border border-indigo-100 rounded-xl text-xs text-indigo-800 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Zap className="w-4 h-4 text-indigo-600" />
                  <span>Check off skills to simulate match score improvement:</span>
                </div>
                {simulatedSkills.length > 0 && (
                  <button
                    onClick={() => setSimulatedSkills([])}
                    className="text-[11px] font-bold text-indigo-600 underline hover:text-indigo-800"
                  >
                    Reset
                  </button>
                )}
              </div>

              {gapData.missingSkills?.map((skill, index) => {
                const isSimulated = simulatedSkills.includes(skill.skillName);
                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl bg-white border transition-all space-y-2.5 shadow-nexus-sm ${
                      isSimulated ? 'border-emerald-400 ring-2 ring-emerald-100 bg-emerald-50/20' : 'border-slate-200/90'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2.5">
                        <button
                          onClick={() => toggleSimulatedSkill(skill.skillName)}
                          title="Simulate acquiring this skill"
                          className={`w-5 h-5 rounded-md flex items-center justify-center border transition-all ${
                            isSimulated
                              ? 'bg-emerald-600 border-emerald-600 text-white'
                              : 'border-slate-300 hover:border-indigo-500 bg-white text-transparent'
                          }`}
                        >
                          <Check className="w-3.5 h-3.5" />
                        </button>
                        <span className={`text-sm font-bold ${isSimulated ? 'text-emerald-900 line-through' : 'text-slate-900'}`}>
                          {skill.skillName}
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-medium">
                          {skill.category}
                        </span>
                      </div>
                      {skill.priority === 'HIGH' ? (
                        <Badge variant="rose" size="sm">High Priority</Badge>
                      ) : (
                        <Badge variant="amber" size="sm">Medium Priority</Badge>
                      )}
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs pt-2 border-t border-slate-100">
                      <div className="text-slate-500">
                        Required Level:{' '}
                        <span className="font-semibold text-indigo-600">{skill.requiredProficiency}</span>
                      </div>
                      <div className="text-slate-500">
                        Current Level:{' '}
                        <span className="font-semibold text-slate-800">{skill.currentProficiency || 'None'}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Col: AI Generated Learning Roadmap */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600" />
              <h3 className="text-lg font-bold text-slate-900">Actionable Learning Roadmap</h3>
            </div>
            <span className="text-xs text-slate-500 font-semibold">Custom AI Curriculum</span>
          </div>

          <div className="space-y-4">
            {gapData.learningRoadmap?.map((item, index) => (
              <div
                key={index}
                className="p-5 rounded-2xl bg-white border border-slate-200/90 hover:border-indigo-300 shadow-nexus-sm hover:shadow-nexus transition-all space-y-3"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-indigo-600">{item.skill}</span>
                      <span className="text-slate-300">•</span>
                      <span className="text-xs text-slate-500 flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {item.estimatedTimeToLearn}
                      </span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{item.title}</h4>
                  </div>
                  <Badge variant="purple" size="sm">{item.difficulty}</Badge>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">{item.type}</span>
                  <a
                    href={item.resourceUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-600 hover:text-indigo-700"
                  >
                    Start Learning <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Additional Quick Action Card */}
          <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-900 to-indigo-800 text-white space-y-3 shadow-nexus-sm">
            <div className="flex items-center gap-2 text-indigo-200 text-xs font-semibold">
              <Award className="w-4 h-4 text-amber-400" /> Verified Skill Matrix
            </div>
            <h4 className="text-sm font-bold text-white">Have you completed new courses or projects?</h4>
            <p className="text-xs text-indigo-200 leading-relaxed">
              Update your student profile skills matrix to automatically re-evaluate your match score across all open opportunities.
            </p>
            <div className="pt-1">
              <Link to="/student/profile">
                <Button variant="secondary" size="sm" className="bg-white text-indigo-900 hover:bg-indigo-50 border-0">
                  Update Skills in Profile
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

