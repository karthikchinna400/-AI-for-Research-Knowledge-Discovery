import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { UploadCloud, FileText, Trash2, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { api } from '../services/api.js';
import { Button } from '../components/common/Button.js';
import { Badge } from '../components/common/Badge.js';
import { Spinner } from '../components/common/Spinner.js';
import { EmptyState } from '../components/common/EmptyState.js';

export const DocumentsPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [uploading, setUploading] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['documents'],
    queryFn: () => api.documents.list()
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => api.documents.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    }
  });

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      await api.documents.upload(formData);
      queryClient.invalidateQueries({ queryKey: ['documents'] });
    } catch (err) {
      console.error('File upload failed', err);
      alert('Failed to upload document. Ensure file is PDF, DOCX, or TXT under 20MB.');
    } finally {
      setUploading(false);
      e.target.value = '';
    }
  };

  const documents = data?.data || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Research Documents</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Upload private research PDFs, clinical protocols, and drafts for semantic embedding.
          </p>
        </div>
      </div>

      {/* Upload Dropzone */}
      <div className="border-2 border-dashed border-slate-300 rounded-2xl p-8 bg-white text-center hover:border-brand-500 transition-colors">
        <UploadCloud size={36} className="mx-auto text-brand-600 mb-2" />
        <h3 className="text-sm font-bold text-slate-800">Upload Research Documents</h3>
        <p className="text-xs text-slate-500 mt-1 mb-4">
          PDF, DOCX, or TXT (Max 20MB). Extracted text is embedded into pgvector for private semantic search.
        </p>

        <label className="cursor-pointer">
          <Button size="sm" loading={uploading} className="pointer-events-none">
            Select Document
          </Button>
          <input
            type="file"
            accept=".pdf,.docx,.doc,.txt"
            onChange={handleFileUpload}
            className="hidden"
          />
        </label>
      </div>

      {/* Document List */}
      {isLoading ? (
        <div className="py-12 flex justify-center"><Spinner /></div>
      ) : documents.length === 0 ? (
        <EmptyState
          title="No Documents Uploaded"
          description="Upload your research whitepapers, literature PDFs, or experimental notes to make them searchable by the Copilot."
        />
      ) : (
        <div className="bg-white rounded-xl border border-slate-200 divide-y divide-slate-100 overflow-hidden shadow-2xs">
          {documents.map((doc) => (
            <div key={doc.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
              <div className="flex items-center gap-3 overflow-hidden">
                <div className="w-9 h-9 rounded-lg bg-brand-50 text-brand-600 flex items-center justify-center shrink-0">
                  <FileText size={18} />
                </div>
                <div className="overflow-hidden">
                  <h4 className="text-xs sm:text-sm font-semibold text-slate-900 truncate">{doc.file_name}</h4>
                  <div className="flex items-center gap-2 mt-0.5 text-[11px] text-slate-400">
                    <span>{(doc.file_size / (1024 * 1024)).toFixed(2)} MB</span>
                    <span>•</span>
                    <span>{doc.page_count} pages</span>
                    <span>•</span>
                    <span>{new Date(doc.created_at).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <Badge
                  variant={doc.processing_status === 'completed' ? 'success' : 'primary'}
                  size="sm"
                >
                  {doc.processing_status}
                </Badge>
                <button
                  onClick={() => deleteMutation.mutate(doc.id)}
                  className="text-slate-400 hover:text-rose-600 p-1.5 rounded transition-colors"
                  title="Delete Document"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

