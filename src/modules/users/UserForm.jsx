'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService } from '../../services/users.service';
import { rolesService } from '../../services/roles.service';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';

// mode: 'create' | 'edit' | 'invite'
export default function UserForm({ user = null, mode = 'create', onSuccess, onCancel }) {
  const isEdit   = mode === 'edit';
  const isInvite = mode === 'invite';

  const { data: rolesData } = useQuery({
    queryKey: ['roles-list'],
    queryFn: () => rolesService.list().then(r => r.data.data),
  });

  const roleOptions = (rolesData || []).map(r => ({ value: r._id, label: r.name }));

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm({
    defaultValues: isEdit && user ? {
      name:   user.name,
      email:  user.email,
      roleId: user.roleId?._id || user.roleId,
      status: user.status,
    } : {},
  });

  useEffect(() => {
    if (isEdit && user) {
      reset({ name: user.name, email: user.email, roleId: user.roleId?._id || user.roleId, status: user.status });
    }
  }, [user]);

  const mutation = useMutation({
    mutationFn: (data) => {
      if (isEdit)   return usersService.update(user._id, data);
      if (isInvite) return usersService.invite(data);
      return usersService.create(data);
    },
    onSuccess: () => {
      toast.success(isEdit ? 'User updated' : isInvite ? 'Invitation sent!' : 'User created');
      onSuccess?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  return (
    <form onSubmit={handleSubmit((d) => mutation.mutate(d))} className="space-y-4">

      <Input id="name" label="Full Name" placeholder="John Smith" required
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })} />

      <Input id="email" label="Email Address" type="email" placeholder="john@company.com" required
        disabled={isEdit}
        error={errors.email?.message}
        {...register('email', {
          required: 'Email is required',
          pattern: { value: /\S+@\S+\.\S+/, message: 'Invalid email format' },
        })} />

      {/* Password only for direct create (not invite, not edit) */}
      {mode === 'create' && (
        <Input id="password" label="Password" type="password" placeholder="Min 8 chars, 1 uppercase, 1 number" required
          error={errors.password?.message}
          {...register('password', {
            required: 'Password is required',
            minLength: { value: 8, message: 'Minimum 8 characters' },
            pattern: { value: /(?=.*[A-Z])(?=.*[0-9])/, message: 'Must include uppercase letter and number' },
          })} />
      )}

      <Select id="roleId" label="Role" required
        options={roleOptions}
        placeholder="Select a role..."
        error={errors.roleId?.message}
        {...register('roleId', { required: 'Role is required' })} />

      {isEdit && (
        <Select id="status" label="Status"
          options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
          {...register('status')} />
      )}

      {isInvite && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
          <p className="text-sm text-blue-700">
            An invitation email will be sent to this address. The link expires in <strong>24 hours</strong>.
            The user will set their own password.
          </p>
        </div>
      )}

      <div className="flex justify-end gap-3 pt-2">
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={isSubmitting || mutation.isPending}>
          {isEdit ? 'Save Changes' : isInvite ? 'Send Invitation' : 'Create User'}
        </Button>
      </div>
    </form>
  );
}
