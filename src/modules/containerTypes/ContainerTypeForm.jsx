'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { containerTypesService } from '@/services/containerTypes.service';
import { CONTAINER_SIZES, CONTAINER_TYPES_LIST } from '@/utils/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';

export default function ContainerTypeForm({ item = null, onSuccess, onCancel }) {
  const isEdit = !!item;
  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  useEffect(() => {
    reset(isEdit && item
      ? { code: item.code, description: item.description || '', size: item.size, type: item.type }
      : { code: '', description: '', size: '', type: '' }
    );
  }, [item]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? containerTypesService.update(item._id, data) : containerTypesService.create(data),
    onSuccess:  () => { toast.success(isEdit ? 'Container type updated' : 'Container type created'); onSuccess?.(); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  return (
    <form onSubmit={handleSubmit(d => mutation.mutate(d))} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <Input id="code" label="Code" placeholder="e.g. 20DRY" required
        error={errors.code?.message}
        {...register('code', { required: 'Code is required' })} />

      <Input id="description" label="Description" placeholder="e.g. 20ft Dry Container"
        {...register('description')} />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <Select id="size" label="Size" required
          options={CONTAINER_SIZES.map(s => ({ value: s, label: s }))}
          error={errors.size?.message}
          {...register('size', { required: 'Size is required' })} />

        <Select id="type" label="Type" required
          options={CONTAINER_TYPES_LIST.map(t => ({ value: t, label: t }))}
          error={errors.type?.message}
          {...register('type', { required: 'Type is required' })} />
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 8, paddingTop: 8, borderTop: '1px solid var(--border)' }}>
        <Button type="button" variant="secondary" onClick={onCancel}>Cancel</Button>
        <Button type="submit" loading={mutation.isPending}>
          {isEdit ? 'Save Changes' : 'Create'}
        </Button>
      </div>
    </form>
  );
}
