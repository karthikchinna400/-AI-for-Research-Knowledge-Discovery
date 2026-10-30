import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, ArrowRight, ArrowLeft, CheckCircle2, Sliders, Layers } from 'lucide-react';
import { newResearchSchema, NewResearchFormValues } from '../schemas/index.js';
import { api } from '../services/api.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { TextArea } from '../components/common/TextArea.js';
import { Button } from '../components/common/Button.js';
import { ResearchPlanPreview } from '../components/research/ResearchPlanPreview.js';
import { Spinner } from '../components/common/Spinner.js';

const DOMAIN_OPTIONS = [
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Healthcare and Medicine', label: 'Healthcare and Medicine' },
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Engineering', label: 'Engineering' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Cybersecurity', label: 'Cybersecurity' }
];

const SCOPE_OPTIONS = [
  { value: 'Exploratory', label: 'Exploratory Investigation' },
  { value: 'Comparative', label: 'Comparative Study' },
  { value: 'Systematic-style evidence review', label: 'Systematic Evidence Review' },
  { value: 'Literature review', label: 'Comprehensive Literature Review' },
  { value: 'Technical investigation', label: 'Technical Methodological Audit' },
  { value: 'Trend analysis', label: 'Emerging Trend Analysis' }
];

export const NewResearchPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [analyzing, setAnalyzing] = useState(false);
  const [launching, setLaunching] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<any>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors }
  } = useForm<NewResearchFormValues>({
    resolver: zodResolver(newResearchSchema),
    defaultValues: {
      projectTitle: 'AI in Cardiovascular Disease Detection',
      researchQuestion: 'How does artificial intelligence affect early detection of cardiovascular diseases?',
      domain: 'Healthcare and Medicine',
      scope: 'Exploratory',
      maxSources: 25,
      includeWebResearch: true,
      includePreprints: true
    }
  });

  const question = watch('researchQuestion');
  const domain = watch('domain');
  const scope = watch('scope');

  const handleAnalyzeQuestion = async () => {
    if (!question || question.length < 5) return;
    setAnalyzing(true);
    try {
      const res = await api.research.analyzeQuestion({ question, domain, scope });
      setAnalysisResult(res.data);
      setStep(2);
    } catch (err) {
      console.error('Failed to analyze question', err);
    } finally {
      setAnalyzing(false);
    }
  };

  const onConfirmAndLaunch = async (formData: NewResearchFormValues) => {
    setLaunching(true);
    try {
      // 1. Create project
      const projRes = await api.projects.create({
        title: formData.projectTitle,
        domain: formData.domain,
        description: `Research investigation into: ${formData.researchQuestion.slice(0, 100)}`
      });

      const projectId = projRes.data.id;

      // 2. Create investigation
      const invRes = await api.investigations.create({
        projectId,
        researchQuestion: formData.researchQuestion,
        refinedQuestion: analysisResult?.refinedQuestion || formData.researchQuestion,
        researchObjectives: analysisResult?.objectives || [],
        searchQueries: analysisResult?.suggestedSearchQueries || [formData.researchQuestion],
        researchScope: formData.scope,
        filters: {
          maxSources: formData.maxSources,
          includeWebResearch: formData.includeWebResearch,
          includePreprints: formData.includePreprints
        }
      });

      const investigationId = invRes.data.id;

      // 3. Trigger discovery execution
      await api.investigations.start(investigationId);

      // 4. Navigate to investigation workspace
      navigate(`/research/${investigationId}`);
    } catch (err: any) {
      console.error('Error starting research investigation', err);
      alert('Could not start investigation. Please try again.');
    } finally {
      setLaunching(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Step Indicator */}
      <div className="flex items-center justify-between border-b border-slate-200 pb-5">
        <div>
          <h2 className="text-xl font-bold text-slate-900">New Research Investigation</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Formulate inquiry, synthesize AI research plan, and dispatch academic discovery.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold">
          <span className={`px-2.5 py-1 rounded-full ${step === 1 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            1. Formulate
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 2 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            2. AI Plan
          </span>
          <span className="text-slate-300">→</span>
          <span className={`px-2.5 py-1 rounded-full ${step === 3 ? 'bg-brand-600 text-white' : 'bg-slate-100 text-slate-600'}`}>
            3. Launch
          </span>
        </div>
      </div>

      {/* Step 1: Formulate Inquiry */}
      {step === 1 && (
        <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-5">
          <Input
            label="Project Title"
            placeholder="e.g. AI-Assisted Early Cardiovascular Screening"
            error={errors.projectTitle?.message}
            {...register('projectTitle')}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Domain"
              options={DOMAIN_OPTIONS}
              error={errors.domain?.message}
              {...register('domain')}
            />
            <Select
              label="Investigation Scope"
              options={SCOPE_OPTIONS}
              error={errors.scope?.message}
              {...register('scope')}
            />
          </div>

          <TextArea
            label="Research Question"
            placeholder="State your research question in natural language (e.g. How does artificial intelligence affect early detection of cardiovascular diseases?)..."
            rows={4}
            error={errors.researchQuestion?.message}
            {...register('researchQuestion')}
          />

          <div className="flex justify-end pt-3">
            <Button
              type="button"
              onClick={handleAnalyzeQuestion}
              loading={analyzing}
              icon={<Sparkles size={16} />}
            >
              Analyze with Gemini AI
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Review AI Plan */}
      {step === 2 && (
        <div className="space-y-6">
          {analysisResult && <ResearchPlanPreview analysis={analysisResult} />}
          <div className="flex justify-between items-center">
            <Button variant="outline" size="sm" onClick={() => setStep(1)} icon={<ArrowLeft size={14} />}>
              Back to Question
            </Button>
            <Button size="sm" onClick={() => setStep(3)} icon={<ArrowRight size={14} />}>
              Configure Discovery Options
            </Button>
          </div>
        </div>
      )}

      {/* Step 3: Configure Filters & Launch */}
      {step === 3 && (
        <form onSubmit={handleSubmit(onConfirmAndLaunch)} className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200/80 shadow-xs space-y-6">
          <div className="flex items-center gap-2 pb-3 border-b border-slate-100">
            <Sliders size={18} className="text-brand-600" />
            <h3 className="text-sm font-bold text-slate-900">Academic Provider Configuration</h3>
          </div>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="flex items-center justify-between p-3 rounded-lg border border-slate-200 bg-slate-50/50">
              <div>
                <span className="font-semibold block">Crossref & OpenAlex Discovery</span>
                <span className="text-slate-500">Query over 250M peer-reviewed DOI works & preprints</span>
              </div>
              <span className="text-emerald-600 font-semibold text-[11px] bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Enabled
              </span>
            </div>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                {...register('includeWebResearch')}
              />
              <div>
                <span className="font-semibold block">Include Tavily Web Research</span>
                <span className="text-slate-500">Scan verified academic portals and scientific institutions</span>
              </div>
            </label>

            <label className="flex items-center gap-3 p-3 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 text-brand-600 rounded border-slate-300 focus:ring-brand-500"
                {...register('includePreprints')}
              />
              <div>
                <span className="font-semibold block">Include ArXiv & BioRxiv Preprints</span>
                <span className="text-slate-500">Incorporate recent pre-publication evidence claims with explicit labeling</span>
              </div>
            </label>
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-slate-100">
            <Button type="button" variant="outline" size="sm" onClick={() => setStep(2)} icon={<ArrowLeft size={14} />}>
              Back to Plan
            </Button>
            <Button type="submit" size="md" loading={launching} icon={<Sparkles size={16} />}>
              Dispatch Investigation & Discovery
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};

