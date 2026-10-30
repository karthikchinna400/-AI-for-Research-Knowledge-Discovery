import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Sparkles, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { registerSchema, RegisterFormValues } from '../schemas/index.js';
import { useAuth } from '../contexts/AuthContext.js';
import { Input } from '../components/common/Input.js';
import { Button } from '../components/common/Button.js';

export const RegisterPage: React.FC = () => {
  const { signUp } = useAuth();
  const navigate = useNavigate();
  const [authError, setAuthError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors }
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      fullName: '',
      email: '',
      password: '',
      confirmPassword: ''
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setLoading(true);
    setAuthError(null);
    try {
      await signUp(data.email, data.password, data.fullName);
      navigate('/dashboard');
    } catch (err: any) {
      setAuthError(err.message || 'Registration failed. Please try again.');
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
          Create your researcher account
        </h2>
        <p className="mt-1.5 text-xs text-slate-500">
          Already registered?{' '}
          <Link to="/login" className="font-semibold text-brand-600 hover:text-brand-500">
            Sign in here
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
              label="Full Name"
              type="text"
              placeholder="Dr. Karthik / Jane Doe"
              icon={<User size={16} />}
              error={errors.fullName?.message}
              {...register('fullName')}
            />

            <Input
              label="Email Address"
              type="email"
              placeholder="researcher@university.edu"
              icon={<Mail size={16} />}
              error={errors.email?.message}
              {...register('email')}
            />

            <Input
              label="Password (min 8 characters)"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.password?.message}
              {...register('password')}
            />

            <Input
              label="Confirm Password"
              type="password"
              placeholder="••••••••"
              icon={<Lock size={16} />}
              error={errors.confirmPassword?.message}
              {...register('confirmPassword')}
            />

            <Button type="submit" loading={loading} className="w-full mt-2" icon={<ArrowRight size={16} />}>
              Create Researcher Account
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
};

