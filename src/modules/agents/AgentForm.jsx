'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { agentsService } from '../../services/agents.service';
import { AGENT_STATUS } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';

export default function AgentForm({ id = null }) {
  const router = useRouter();
  const isEdit = !!id;

  const { data: agentData, isLoading } = useQuery({
    queryKey: ['agent', id],
    queryFn:  () => agentsService.getById(id).then(r => r.data.data),
    enabled:  isEdit,
  });

  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm();

  useEffect(() => {
    if (isEdit && agentData) {
      reset({
        agentCode:     agentData.agentCode,
        agentName:     agentData.agentName,
        country:       agentData.country       || '',
        city:          agentData.city          || '',
        port:          agentData.port          || '',
        address:       agentData.address       || '',
        contactPerson: agentData.contactPerson || '',
        mobile:        agentData.mobile        || '',
        email:         agentData.email         || '',
        status:        agentData.status,
      });
    }
  }, [agentData, isEdit]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? agentsService.update(id, data) : agentsService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Agent updated successfully' : 'Agent created successfully');
      router.push('/agents');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  if (isEdit && isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? 'Edit Agent' : 'New Agent'}
        subtitle={isEdit ? `Editing: ${agentData?.agentName || ''}` : 'Add a new agent to the system'}
        action={<Button variant="secondary" onClick={() => router.push('/agents')}>← Back</Button>}
      />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* Identity */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Agent Identity</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="agentCode" label="Agent Code" placeholder="e.g. AGT001" required
              error={errors.agentCode?.message}
              {...register('agentCode', { required: 'Agent code is required' })} />
            <Input id="agentName" label="Agent Name" placeholder="e.g. Red Sea Shipping Agency" required
              error={errors.agentName?.message}
              {...register('agentName', { required: 'Agent name is required' })} />
          </div>
        </div>

        {/* Location */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Location</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input id="country" label="Country" placeholder="e.g. Saudi Arabia" {...register('country')} />
            <Input id="city"    label="City"    placeholder="e.g. Jeddah"       {...register('city')} />
            <Input id="port"    label="Port"    placeholder="e.g. Jeddah Port"  {...register('port')} />
            <div className="md:col-span-3">
              <Input id="address" label="Full Address" placeholder="Street address..." {...register('address')} />
            </div>
          </div>
        </div>

        {/* Contact */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input id="contactPerson" label="Contact Person" placeholder="e.g. Ahmed Hassan"
              {...register('contactPerson')} />
            <Input id="mobile" label="Mobile" placeholder="+966 5X XXX XXXX"
              {...register('mobile')} />
            <Input id="email" label="Email" type="email" placeholder="agent@company.com"
              error={errors.email?.message}
              {...register('email')} />
          </div>
        </div>

        {/* Status */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Status</h3>
          <Select id="status" label="Status" className="w-48"
            options={AGENT_STATUS.map(s => ({ value: s, label: s }))}
            {...register('status')} />
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={() => router.push('/agents')}>Cancel</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
}
