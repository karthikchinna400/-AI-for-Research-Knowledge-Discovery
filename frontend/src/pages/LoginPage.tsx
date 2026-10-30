import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { loginSchema, LoginFormValues } from '../schemas/index.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';

export const LoginPage: React.FC = () => {
  const { signIn } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: 'dr.karthik@research.ai',
      password: 'password123'
    }
  });

  const onSubmit = async (data: LoginFormValues) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signIn(data.email, data.password);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Failed to sign in. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link to="/" className="inline-flex items-center gap-2.5 mb-4">
          <div className="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
            <Sparkles size={20} />
          </div>
          <span className="text-xl font-extrabold tracking-tight text-slate-900">AI RESEARCH COPILOT</span>
        </Link>
        <h2 className="text-2xl font-bold tracking-tight text-slate-900">
          Sign in to your research workspace
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Don't have an account?{' '}
          <Link to="/register" className="font-semibold text-brand-600 hover:text-brand-500">
            Create an account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-white py-8 px-6 shadow-sm border border-slate-200/80 rounded-2xl sm:px-10">
          {authError && (
            <div className="mb-5 p-3 rounded-lg bg-rose-50 border border-rose-200 flex items-start gap-2.5 text-xs text-rose-700">
              <AlertCircle size={16} className="shrink-0 mt-0.5" />
              <span>{authError}</span>
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input
              label="Email Address"
              type="email"
              placeholder="researcher@university.edu"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <div className="flex items-center justify-between text-xs">
              <span className="text-slate-500">Supabase Secure Auth</span>
              <Link to="/forgot-password" className="font-medium text-brand-600 hover:text-brand-500">
                Forgot password?
              </Link>
            </div>

            <Button type="submit" loading={loading} className="w-full mt-2" icon={<ArrowRight size={16} />}>
              Sign In to Workspace
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

