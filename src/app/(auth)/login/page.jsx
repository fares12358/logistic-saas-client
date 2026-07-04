'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '../../../context/AuthContext';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';
import LoadingSpinner from '../../../components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  // If already authenticated, redirect away from login
  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace('/dashboard');
    }
  }, [isAuthenticated, isLoading]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <LoadingSpinner />
      </div>
    );
  }

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed. Check your credentials.');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Logistics SaaS</h1>
          <p className="text-gray-500 text-sm mt-1">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input
            id="email"
            label="Email Address"
            type="email"
            placeholder="you@company.com"
            required
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' },
            })}
          />

          <Input
            id="password"
            label="Password"
            type="password"
            placeholder="••••••••"
            required
            error={errors.password?.message}
            {...register('password', { required: 'Password is required' })}
          />

          <div className="flex justify-end">
            <a href="/forgot-password" className="text-sm text-blue-600 hover:underline">
              Forgot password?
            </a>
          </div>

          <Button type="submit" className="w-full" size="lg" loading={isSubmitting}>
            Sign In
          </Button>
        </form>
      </div>
    </div>
  );
}
