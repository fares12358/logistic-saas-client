'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { expenseTypesService } from '@/services/expenseTypes.service';
import { EXPENSE_CATEGORIES } from '@/utils/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function ExpenseTypeForm({ item = null, onSuccess, onCancel }) {
  const isEdit = !!item;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    reset(isEdit && item
      ? { name: item.name, category: item.category }
      : { name: '', category: '' }
    );
  }, [item]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? expenseTypesService.update(item._id, data) : expenseTypesService.create(data),
    onSuccess:  () => { toast.success(isEdit ? 'Expense type updated' : 'Expense type created'); onSuccess?.(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input id="name" label="Expense Type Name" placeholder="e.g. Port Dues" required
        error={errors.name?.message}
        {...register('name', { required: 'Name is required' })} />

      <Select id="category" label="Category" required
        options={EXPENSE_CATEGORIES.map(c => ({ value: c, label: c }))}
        error={errors.category?.message}
        {...register('category', { required: 'Category is required' })} />

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={mutation.isPending}>
          {isEdit ? 'Save Changes' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
