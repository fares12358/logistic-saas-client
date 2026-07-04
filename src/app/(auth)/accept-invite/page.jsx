'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useSearchParams, useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { usersService } from '../../../services/users.service';
import Input from '../../../components/ui/Input';
import Button from '../../../components/ui/Button';

export default function AcceptInvitePage() {
  const params = useSearchParams();
  const router = useRouter();
  const token  = params.get('token');
  const [done, setDone] = useState(false);

  const { register, handleSubmit, watch, formState: { errors, isSubmitting } } = useForm();

  const onSubmit = async (data) => {
    if (!token) return toast.error('Invalid invitation link');
    try {
      await usersService.acceptInvite({ token, password: data.password });
      setDone(true);
      setTimeout(() => router.replace('/login'), 3000);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invitation link is invalid or expired');
    }
  };

  if (!token) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8 text-center">
          <p className="text-red-500 font-medium">Invalid or missing invitation token.</p>
          <p className="text-gray-500 text-sm mt-2">Please contact your administrator.</p>
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
          <h2 className="text-xl font-bold text-gray-800 mb-2">Account Activated!</h2>
          <p className="text-gray-500 text-sm">Welcome aboard. Redirecting you to login...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 to-blue-900 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-800">Accept Invitation</h1>
          <p className="text-gray-500 text-sm mt-1">Set your password to activate your account</p>
        </div>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          <Input id="password" label="Password" type="password" placeholder="••••••••" required
            error={errors.password?.message}
            {...register('password', {
              required: 'Password is required',
              minLength: { value: 8, message: 'Minimum 8 characters' },
              pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include uppercase letter and number' },
            })} />
          <Input id="confirmPassword" label="Confirm Password" type="password" placeholder="••••••••" required
            error={errors.confirmPassword?.message}
            {...register('confirmPassword', {
              required: 'Please confirm your password',
              validate: (v) => v === watch('password') || 'Passwords do not match',
            })} />
          <Button type="submit" className="w-full" loading={isSubmitting}>Activate Account</Button>
        </form>
      </div>
    </div>
  );
}
