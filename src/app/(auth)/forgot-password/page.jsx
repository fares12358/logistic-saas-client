'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import toast from 'react-hot-toast';
import { authService } from '../../../services/auth.service';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function ForgotPasswordPage() {
  const [sent, setSent] = useState(false);
  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    try {
      await authService.forgotPassword(data.email);
      setSent(true);
    } catch {
      toast.error('Something went wrong. Please try again.');
    }
  };

  if (sent) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Check your email</h2>
          <p className="text-gray-500 text-sm mb-6">
            If that email address exists in our system, we've sent a password reset link. It expires in 1 hour.
          </p>
          <a href="/login" className="text-blue-600 text-sm hover:underline">← Back to login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Forgot Password</h1>
          <p className="text-gray-500 text-sm mt-1">Enter your email and we'll send you a reset link</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input id="email" label="Email Address" type="email" placeholder="you@company.com" required
            error={errors.email?.message}
            {...register('email', { required: 'Email is required', pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email' } })} />
          <Button type="submit" className="w-full" loading={isSubmitting}>Send Reset Link</Button>
        </form>
        <p className="text-center text-sm text-gray-500 mt-6">
          <a href="/login" className="text-blue-600 hover:underline">← Back to login</a>
        </p>
      </div>
    </div>
  );
}
