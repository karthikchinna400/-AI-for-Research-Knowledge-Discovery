import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, Mail, CheckCircle2, ArrowLeft } from 'lucide-react';
import { forgotPasswordSchema } from '../schemas/index.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';

export const ForgotPasswordPage: React.FC = () => {
  const { resetPassword } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<{ email: string }>({
    resolver: zodResolver(forgotPasswordSchema)
  });

  const onSubmit = async (data: { email: string }) => {
    setLoading(true);
    try {
      await resetPassword(data.email);
      setSubmitted(true);
    } catch {
      setSubmitted(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">AI RESEARCH COPILOT</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Reset your password
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          We'll send password recovery instructions to your email address.
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {submitted ? (
            <div className="text-center space-y-4">
              <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 size={24} />
              </div>
              <h3 className="text-sm font-bold text-slate-900">Recovery link dispatched</h3>
              <p className="text-xs text-slate-500">
                Check your inbox for a secure password reset link.
              </p>
              <Link to="/login" className="inline-block mt-4">
                <Button variant="outline" size="sm" icon={<ArrowLeft size={14} />}>
                  Back to Sign In
                </Button>
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Registered Email"
                type="email"
                placeholder="researcher@university.edu"
                icon={<Mail size={16} />}
                error={errors.email?.message}
                {...register('email')}
              />
              <Button type="submit" loading={loading} className="w-full">
                Send Reset Link
              </Button>
              <div className="text-center pt-2">
                <Link to="/login" className="text-xs font-medium text-slate-500 hover:text-slate-800 flex items-center justify-center gap-1">
                  <ArrowLeft size={12} /> Back to Sign In
                </Link>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

