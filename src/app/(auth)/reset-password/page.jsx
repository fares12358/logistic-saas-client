'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { authService } from '../../../services/auth.service';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function ResetPasswordPage() {
  const params   = useSearchParams();
  const router   = useRouter();
  const token    = params.get('token');
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    if (!token) return toast.error('Invalid reset link');
    try {
      await authService.resetPassword(token, data.newPassword);
      setDone(true);
      setTimeout(() => router.replace('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Reset link is invalid or expired');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <p className="text-red-500 font-medium">Invalid or missing reset token.</p>
          <a href="/forgot-password" className="text-blue-600 text-sm hover:underline mt-4 block">Request a new link</a>
        </div>
      </div>
    );
  }

  if (done) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-xl font-bold text-gray-800 mb-2">Password Reset!</h2>
          <p className="text-gray-500 text-sm">Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Set New Password</h1>
          <p className="text-gray-500 text-sm mt-1">Choose a strong password for your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input id="newPassword" label="New Password" type="password" placeholder="••••••••" required
            error={errors.newPassword?.message}
            {...register('newPassword', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include uppercase letter and number' },
            })} />
          <Input id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === watch('newPassword') || 'Passwords do not match',
            })} />
          <Button type="submit" className="w-full" loading={isSubmitting}>Reset Password</Button>
        </form>
      </div>
    </div>
  );
}
