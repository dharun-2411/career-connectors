import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowRight, ShieldCheck, Zap, Compass, Users, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '../components/common/Button';
import { Navbar } from '../components/layout/Navbar';

export const Landing = () => {
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-500 selection:text-white">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 overflow-hidden border-b border-slate-800/60">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[350px] bg-blue-600/15 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-[400px] h-[250px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/50 text-xs font-semibold text-blue-300 mb-8 animate-pulse-slow">
            <Sparkles className="w-3.5 h-3.5 text-blue-400" />
            Empowered by LangGraph Multi-Agent Orchestration & Vector Embeddings
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-4xl mx-auto leading-[1.1]">
            Bridge the Gap Between <span className="gradient-text">Skills</span> and <span className="gradient-accent-text">Opportunities</span>
          </h1>

          <p className="text-lg sm:text-xl text-slate-400 max-w-2xl mx-auto mt-6 leading-relaxed">
            Career Connectors intelligently matches students with real-world internships, jobs, and projects using AI semantic matching, personalized learning roadmaps, and recruiter ranking pipelines.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mt-10">
            <Link to="/opportunities">
              <Button size="lg" variant="primary" icon={Compass}>
                Explore Opportunities
              </Button>
            </Link>
            <Link to="/register">
              <Button size="lg" variant="secondary">
                Create Free Account <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            </Link>
          </div>

          {/* Quick Platform Metrics Banner */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto mt-16 pt-12 border-t border-slate-800/80">
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-extrabold text-blue-400">94.8%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Matching Accuracy</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-extrabold text-emerald-400">&lt; 300ms</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Evaluation Speed</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-extrabold text-purple-400">100%</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Explainable AI Scores</div>
            </div>
            <div className="p-4 rounded-2xl bg-slate-900/50 border border-slate-800">
              <div className="text-3xl font-extrabold text-sky-400">3 Roles</div>
              <div className="text-xs text-slate-400 mt-1 font-medium">Student • Recruiter • Admin</div>
            </div>
          </div>
        </div>
      </section>

      {/* Core Feature Highlights */}
      <section className="py-20 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Engineered for Precision & Career Growth
            </h2>
            <p className="text-slate-400 mt-4 text-base">
              Explore how each component of Career Connectors elevates the recruitment ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Feature 1 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-blue-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Semantic Skill Matching</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Combines high-dimensional vector embeddings with rule-based weighted proficiency factors to generate explainable 0-100% match scores.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-purple-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-purple-600/15 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">AI Skill Gap Roadmaps</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Diffs required skills against student proficiencies to identify weak areas and builds custom step-by-step learning paths for target positions.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="p-6 rounded-2xl bg-slate-900/70 border border-slate-800 hover:border-emerald-500/40 transition-all">
              <div className="w-12 h-12 rounded-xl bg-emerald-600/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-6">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Recruiter Applicant Ranking</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Multi-dimensional candidate ranking for hiring teams with instant status progression (Applied &rarr; Under Review &rarr; Shortlisted &rarr; Selected).
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto py-8 border-t border-slate-900 bg-slate-950 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} Career Connectors Platform. Production-grade AI Engineering.</p>
      </footer>
    </div>
  );
};
