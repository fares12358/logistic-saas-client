'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { useAuth } from '@/context/AuthContext';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

export default function LoginPage() {
  const { login, isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (!isLoading && isAuthenticated) router.replace('/dashboard');
  }, [isAuthenticated, isLoading]);

  if (isLoading) return <div className="login-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}><LoadingSpinner /></div>;

  const onSubmit = async (data) => {
    try {
      await login(data.email, data.password);
      router.replace('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid email or password.');
    }
  };

  return (
    <div className="login-bg" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
      <div className="login-card animate-fadeIn" style={{ width: '100%', maxWidth: 420, padding: '40px 36px' }}>

        {/* Brand mark */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 52, height: 52, borderRadius: 14,
            background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 4px 16px rgba(13,148,136,0.35)',
          }}>
            <svg width="26" height="26" fill="none" stroke="white" strokeWidth="2" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--navy)', letterSpacing: '-0.4px', margin: 0 }}>
            Logistics SaaS
          </h1>
          <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 6 }}>
            Sign in to your operations platform
          </p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <Input
            id="email" label="Email address" type="email"
            placeholder="you@company.com" required value='admin@logistics.com'
            error={errors.email?.message}
            {...register('email', {
              required: 'Email is required',
              pattern: { value: /\S+@\S+\.\S+/, message: 'Enter a valid email' },
            })}
          />

          <div>
            <Input
              id="password" label="Password" type="password" value="Admin@123456"
              placeholder="••••••••" required
              error={errors.password?.message}
              {...register('password', { required: 'Password is required' })}
            />
            <div style={{ textAlign: 'right', marginTop: 6 }}>
              <a href="/forgot-password" style={{ fontSize: 12.5, color: 'var(--teal)', textDecoration: 'none', fontWeight: 500 }}
                onMouseEnter={e => e.currentTarget.style.textDecoration = 'underline'}
                onMouseLeave={e => e.currentTarget.style.textDecoration = 'none'}>
                Forgot password?
              </a>
            </div>
          </div>

          <Button type="submit" size="lg" className="w-full" loading={isSubmitting}
            style={{ marginTop: 8, width: '100%', justifyContent: 'center' }}>
            Sign in
          </Button>
        </form>

        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-muted)', marginTop: 24 }}>
          Logistics & Shipping Operations Platform
        </p>
      </div>
    </div>
  );
}
