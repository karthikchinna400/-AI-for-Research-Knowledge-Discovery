import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Shield, User, Globe, Key, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.js';
import { api } from '../services/api.js';
import { updateProfileSchema, UpdateProfileFormValues } from '../schemas/index.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';

export const SettingsPage: React.FC = () => {
  const { user, profile } = useAuth();
  const [successMsg, setSuccessMsg] = useState(false);
  const [saving, setSaving] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<UpdateProfileFormValues>({
    resolver: zodResolver(updateProfileSchema),
    defaultValues: {
      fullName: user?.fullName || 'Dr. Karthik',
      preferredLanguage: profile?.preferred_language || 'en'
    }
  });

  const onSubmit = async (data: UpdateProfileFormValues) => {
    setSaving(true);
    setSuccessMsg(false);
    try {
      await api.auth.updateProfile(data);
      setSuccessMsg(true);
      setTimeout(() => setSuccessMsg(false), 3000);
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="max-w-3xl space-y-8">
      <div className="pb-4 border-b border-slate-200">
        <h2 className="text-xl font-bold text-slate-900">Account & Preferences</h2>
        <p className="text-xs text-slate-500 mt-0.5">
          Manage your researcher profile, academic credentials, and privacy configurations.
        </p>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <User size={16} className="text-brand-600" />
          <span>Researcher Profile</span>
        </h3>

        {successMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-center gap-2">
            <CheckCircle2 size={16} className="text-emerald-600" />
            <span>Profile settings saved successfully.</span>
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <Input
            label="Full Name / Academic Title"
            placeholder="Dr. Jane Doe, Ph.D."
            error={errors.fullName?.message}
            {...register('fullName')}
          />

          <div>
            <label className="text-xs font-semibold text-slate-700 uppercase tracking-wider block mb-1">
              Registered Email
            </label>
            <input
              type="text"
              disabled
              value={user?.email || 'researcher@domain.ai'}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3.5 py-2 text-xs text-slate-500 cursor-not-allowed"
            />
          </div>

          <Input
            label="Preferred Research Language"
            placeholder="en"
            error={errors.preferredLanguage?.message}
            {...register('preferredLanguage')}
          />

          <div className="pt-2">
            <Button type="submit" size="sm" loading={saving}>
              Save Profile
            </Button>
          </div>
        </form>
      </div>

      <div className="bg-white p-6 sm:p-8 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
          <Shield size={16} className="text-emerald-600" />
          <span>Security & Data Isolation</span>
        </h3>
        <p className="text-xs text-slate-600 leading-relaxed">
          Your workspace documents and research inquiries are protected by Row Level Security (RLS) in PostgreSQL. Private storage bucket access is strictly isolated by authenticated user IDs.
        </p>
      </div>
    </div>
  );
};

