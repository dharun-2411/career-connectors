import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Compass, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Navbar } from '../components/layout/Navbar';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col selection:bg-indigo-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-16 pb-20 overflow-hidden border-b border-slate-200">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[400px] bg-indigo-500/10 blur-[130px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[450px] h-[300px] bg-violet-500/10 blur-[110px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-indigo-50 border border-indigo-200 text-xs font-semibold text-indigo-700 mb-6 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            Empowered by LangGraph Multi-Agent Orchestration & Vector Embeddings
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1] text-slate-900">
            Bridge the Gap Between <span className="text-indigo-600">Skills</span> and{' '}
            <span className="text-violet-600">Opportunities</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-600 max-w-2xl mx-auto mt-6 leading-relaxed">
            Career Connectors intelligently matches students with real-world internships, jobs, and projects using AI semantic matching, personalized learning roadmaps, and recruiter ranking pipelines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-8">
            <Link to="/opportunities">
              <Button size="lg" variant="primary" icon={Compass} className="shadow-nexus-sm">
                Explore Opportunities
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary" className="shadow-nexus-sm">
                Create Free Account <ArrowRight className="w-4 h-4 ml-1.5" />
              </Button>
            </Link>
          </div>

          {/* Quick Platform Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-14 pt-10 border-t border-slate-200">
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
              <div className="text-3xl font-black text-indigo-600 tracking-tight">94.8%</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Matching Accuracy</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
              <div className="text-3xl font-black text-emerald-600 tracking-tight">&lt; 300ms</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Evaluation Speed</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
              <div className="text-3xl font-black text-violet-600 tracking-tight">100%</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Explainable AI Scores</div>
            </div>
            <div className="p-4 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm">
              <div className="text-3xl font-black text-slate-800 tracking-tight">3 Roles</div>
              <div className="text-xs text-slate-500 mt-1 font-semibold">Student • Recruiter • Admin</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Highlights */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Engineered for Precision & Career Growth
            </h2>
            <p className="text-slate-500 mt-3 text-base">
              Explore how each component of Career Connectors elevates the recruitment ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm hover:shadow-nexus hover:border-indigo-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600 mb-6 group-hover:bg-indigo-600 group-hover:text-white transition-all shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Semantic Skill Matching</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Combines high-dimensional vector embeddings with rule-based weighted proficiency factors to generate explainable 0-100% match scores.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm hover:shadow-nexus hover:border-violet-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-violet-50 border border-violet-200 flex items-center justify-center text-violet-600 mb-6 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">AI Skill Gap Roadmaps</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Diffs required skills against student proficiencies to identify weak areas and builds custom step-by-step learning paths for target positions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-7 rounded-2xl bg-white border border-slate-200 shadow-nexus-sm hover:shadow-nexus hover:border-emerald-300 transition-all group">
              <div className="w-12 h-12 rounded-xl bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-600 mb-6 group-hover:bg-emerald-600 group-hover:text-white transition-all shadow-sm">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2">Recruiter Applicant Ranking</h3>
              <p className="text-sm text-slate-600 leading-relaxed">
                Multi-dimensional candidate ranking for hiring teams with instant status progression (Applied &rarr; Under Review &rarr; Shortlisted &rarr; Selected).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-200 bg-white text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Career Connectors Platform. Production-grade AI Engineering.</p>
      </footer>
    </div>
  );
};
