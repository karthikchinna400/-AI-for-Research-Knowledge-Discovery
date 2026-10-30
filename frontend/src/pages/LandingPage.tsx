import React from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  ArrowRight,
  Database,
  Brain,
  Network,
  FileCheck2,
  GitCompare,
  Search,
  Shield,
  Layers,
  ChevronRight
} from 'lucide-react';
import { Button } from '../components/common/Button.js';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <nav className="h-20 border-b border-slate-100 px-6 lg:px-12 flex items-center justify-between max-w-7xl mx-auto">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-brand-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
            <Sparkles size={20} />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-900">AI RESEARCH</span>
            <span className="block text-[10px] uppercase font-bold text-brand-600 tracking-wider">Copilot Platform</span>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-600">
          <a href="#problem" className="hover:text-slate-900 transition-colors">The Challenge</a>
          <a href="#features" className="hover:text-slate-900 transition-colors">Features</a>
          <a href="#architecture" className="hover:text-slate-900 transition-colors">Architecture</a>
          <a href="#evidence" className="hover:text-slate-900 transition-colors">Evidence Discovery</a>
        </div>

        <div className="flex items-center gap-3">
          <Link to="/login">
            <Button variant="ghost" size="sm">Sign In</Button>
          </Link>
          <Link to="/register">
            <Button variant="primary" size="sm" icon={<ArrowRight size={14} />}>
              Get Started
            </Button>
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative pt-20 pb-24 px-6 lg:px-12 max-w-5xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6">
          <Sparkles size={14} />
          <span>Evidence Intelligence & Academic Knowledge Discovery</span>
        </div>

        <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-slate-950 leading-[1.15]">
          Turn Research Questions into <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-brand-600 via-indigo-600 to-purple-600 bg-clip-text text-transparent">
            Structured Evidence Intelligence
          </span>
        </h1>

        <p className="mt-6 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
          Autonomous discovery across Crossref, OpenAlex, Semantic Scholar, and Tavily.
          Extract claims, verify citations, compare methodology disagreements, detect literature gaps, and build interactive knowledge graphs.
        </p>

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link to="/research/new" className="w-full sm:w-auto">
            <Button size="lg" className="w-full sm:w-auto font-semibold px-8 py-3" icon={<ArrowRight size={18} />}>
              Start New Investigation
            </Button>
          </Link>
          <Link to="/dashboard" className="w-full sm:w-auto">
            <Button variant="outline" size="lg" className="w-full sm:w-auto font-semibold">
              Explore Research Workspace
            </Button>
          </Link>
        </div>

        {/* Traceability Guarantee Banner */}
        <div className="mt-14 p-4 rounded-2xl bg-slate-50 border border-slate-200/80 flex items-center justify-around gap-6 flex-wrap text-xs font-medium text-slate-600">
          <div className="flex items-center gap-2">
            <Shield className="text-emerald-500" size={16} />
            <span>Strict Evidence Traceability</span>
          </div>
          <div className="flex items-center gap-2">
            <Database className="text-brand-500" size={16} />
            <span>Verified Metadata & DOIs</span>
          </div>
          <div className="flex items-center gap-2">
            <Brain className="text-indigo-500" size={16} />
            <span>Gemini Grounded Reasoning</span>
          </div>
          <div className="flex items-center gap-2">
            <Network className="text-purple-500" size={16} />
            <span>Interactive Knowledge Graph</span>
          </div>
        </div>
      </section>

      {/* Problem Section */}
      <section id="problem" className="py-20 bg-slate-50 border-y border-slate-200/70 px-6 lg:px-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">The Problem</h2>
            <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
              Why Traditional Research Workflows Fall Short
            </h3>
            <p className="text-sm text-slate-600 mt-2">
              Academic literature is fragmented across disconnected databases and dense PDF repositories.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center mb-4">
                <Search size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Scattered Publications</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Researchers waste hours searching across disparate portals, manually extracting metadata, and tracking citation chains.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center mb-4">
                <GitCompare size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Hidden Contradictions</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Conflicting findings and subtle methodological differences are difficult to identify across hundreds of dense publication pages.
              </p>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs">
              <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center mb-4">
                <Brain size={20} />
              </div>
              <h4 className="text-base font-bold text-slate-900">Hallucinated Chatbots</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Unconstrained generative models invent citations and summarize without verifiable proof. Our copilot enforces strict grounding.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Grid */}
      <section id="features" className="py-24 px-6 lg:px-12 max-w-6xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-16">
          <h2 className="text-xs font-bold uppercase tracking-wider text-brand-600">Core Capabilities</h2>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-2">
            A Complete Evidence Intelligence Suite
          </h3>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
            <Search className="text-brand-600 mb-3" size={24} />
            <h4 className="text-sm font-bold text-slate-900">Multi-Provider Discovery</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Live automated query routing across Crossref, OpenAlex, Semantic Scholar, and Tavily with normalized metadata and deduplication.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
            <FileCheck2 className="text-emerald-600 mb-3" size={24} />
            <h4 className="text-sm font-bold text-slate-900">Document Intelligence</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Upload PDF, DOCX, and TXT files with private Supabase Storage, semantic chunking, and pgvector embeddings.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
            <Layers className="text-indigo-600 mb-3" size={24} />
            <h4 className="text-sm font-bold text-slate-900">Structured Claims Extraction</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Extract empirical findings, sample sizes, cohort populations, reported limitations, and confidence scores.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
            <GitCompare className="text-purple-600 mb-3" size={24} />
            <h4 className="text-sm font-bold text-slate-900">Evidence Comparison</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Cross-study synthesis identifying agreements, genuine contradictions, and nuanced methodological variations.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
            <Network className="text-brand-600 mb-3" size={24} />
            <h4 className="text-sm font-bold text-slate-900">Knowledge Graph & Maps</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Interactive React Flow visual graph mapping relationships between inquiries, publications, claims, themes, and gaps.
            </p>
          </div>

          <div className="p-6 rounded-2xl border border-slate-200 bg-white hover:border-slate-300 transition-all">
            <Sparkles className="text-amber-600 mb-3" size={24} />
            <h4 className="text-sm font-bold text-slate-900">Grounded Copilot & Reports</h4>
            <p className="text-xs text-slate-600 mt-2 leading-relaxed">
              Ask follow-up questions with citation links and export formal Markdown, PDF, and DOCX research synthesis reports.
            </p>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-slate-900 text-white px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Ready to Accelerate Your Scientific & Professional Research?
          </h2>
          <p className="mt-4 text-sm sm:text-base text-slate-400 max-w-xl mx-auto">
            Experience evidence-backed knowledge discovery with full citation verification and transparent AI reasoning.
          </p>
          <div className="mt-8 flex justify-center gap-4">
            <Link to="/register">
              <Button size="lg" className="bg-brand-500 hover:bg-brand-600 text-white font-semibold px-8">
                Create Free Account
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-slate-200 py-8 px-6 lg:px-12 text-center text-xs text-slate-500">
        <p>© 2026 AI Research Copilot. Evidence Intelligence & Knowledge Discovery Platform.</p>
      </footer>
    </div>
  );
};

