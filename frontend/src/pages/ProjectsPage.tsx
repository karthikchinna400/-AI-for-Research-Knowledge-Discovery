import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { FolderKanban, Plus, Trash2, ArrowRight } from 'lucide-react';
import { api } from '../services/api.js';
import { createProjectSchema, CreateProjectFormValues } from '../schemas/index.js';
import { Button } from '../components/common/Button.js';
import { Input } from '../components/common/Input.js';
import { Select } from '../components/common/Select.js';
import { TextArea } from '../components/common/TextArea.js';
import { Modal } from '../components/common/Modal.js';
import { Spinner } from '../components/common/Spinner.js';

const DOMAIN_OPTIONS = [
  { value: 'Computer Science', label: 'Computer Science' },
  { value: 'Artificial Intelligence', label: 'Artificial Intelligence' },
  { value: 'Machine Learning', label: 'Machine Learning' },
  { value: 'Healthcare and Medicine', label: 'Healthcare and Medicine' },
  { value: 'Data Science', label: 'Data Science' },
  { value: 'Biotechnology', label: 'Biotechnology' },
  { value: 'Economics', label: 'Economics' },
  { value: 'Cybersecurity', label: 'Cybersecurity' }
];

export const ProjectsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [modalOpen, setModalOpen] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: () => api.projects.list()
  });

  const createMutation = useMutation({
    mutationFn: (values: CreateProjectFormValues) => api.projects.create(values),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
      setModalOpen(false);
      reset();
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.projects.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    }
  });

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors }
  } = useForm<CreateProjectFormValues>({
    resolver: zodResolver(createProjectSchema),
    defaultValues: {
      domain: 'Computer Science'
    }
  });

  const onSubmit = (formData: CreateProjectFormValues) => {
    createMutation.mutate(formData);
  };

  const projects = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Projects</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Manage your persistent research workspaces and domain partitions.
          </p>
        </div>
        <Button onClick={() => setModalOpen(true)} size="sm" icon={<Plus size={16} />}>
          Create New Project
        </Button>
      </div>

      {isLoading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-300">
          <FolderKanban size={32} className="mx-auto text-slate-400 mb-2" />
          <h4 className="text-sm font-semibold text-slate-800">No Projects Found</h4>
          <p className="text-xs text-slate-500 mt-1 mb-4">Create your first research project to get started.</p>
          <Button onClick={() => setModalOpen(true)} size="sm">Create Project</Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {projects.map((proj) => (
            <div
              key={proj.id}
              className="bg-white rounded-xl border border-slate-200 p-5 flex flex-col justify-between hover:shadow-xs transition-all"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-brand-600 bg-brand-50 px-2.5 py-0.5 rounded-full">
                    {proj.domain}
                  </span>
                  <button
                    onClick={() => deleteMutation.mutate(proj.id)}
                    className="text-slate-400 hover:text-rose-600 p-1 rounded transition-colors"
                    title="Delete project"
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-900 line-clamp-1">{proj.title}</h3>
                <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                  {proj.description || 'No description provided.'}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between text-xs text-slate-400">
                <span>Created {new Date(proj.created_at).toLocaleDateString()}</span>
                <span className="text-brand-600 font-semibold flex items-center gap-1">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} title="Create Research Project">
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Project Title"
            placeholder="e.g. Multi-Modal Medical Foundation Models"
            error={errors.title?.message}
            {...register('title')}
          />

          <Select
            label="Primary Domain"
            options={DOMAIN_OPTIONS}
            error={errors.domain?.message}
            {...register('domain')}
          />

          <TextArea
            label="Description (Optional)"
            placeholder="Provide context and boundaries for this research workspace..."
            error={errors.description?.message}
            {...register('description')}
          />

          <div className="flex justify-end gap-2.5 pt-2">
            <Button type="button" variant="outline" size="sm" onClick={() => setModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={createMutation.isPending}>
              Create Project
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

