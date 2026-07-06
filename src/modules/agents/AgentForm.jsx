'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { agentsService } from '@/services/agents.service';
import { AGENT_STATUS } from '@/utils/constants';
import Input from '@/components/ui/Input';
import Select from '@/components/ui/Select';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import PageHeader from '@/components/ui/PageHeader';

const SectionTitle = ({ children }) => (
  <div style={{ marginBottom: 16 }}>
    <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-secondary)', textTransform: 'uppercase', letterSpacing: '0.06em', margin: 0 }}>
      {children}
    </h3>
    <div style={{ height: 1, background: 'var(--border)', marginTop: 8 }} />
  </div>
);

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
    onSuccess:  () => { toast.success(isEdit ? 'Agent updated' : 'Agent created'); router.push('/agents'); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  if (isEdit && isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 780 }}>
      <PageHeader
        title={isEdit ? 'Edit Agent' : 'New Agent'}
        subtitle={isEdit ? `Editing: ${agentData?.agentName || '…'}` : 'Register a new shipping agent'}
        action={<Button variant="secondary" onClick={() => router.push('/agents')}>← Back to Agents</Button>}
      />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
        {/* Identity */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle>Agent Identity</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input id="agentCode" label="Agent Code" placeholder="e.g. AGT001" required
              error={errors.agentCode?.message}
              {...register('agentCode', { required: 'Agent code is required' })} />
            <Input id="agentName" label="Agent Name" placeholder="e.g. Red Sea Shipping Agency" required
              error={errors.agentName?.message}
              {...register('agentName', { required: 'Agent name is required' })} />
          </div>
        </div>

        {/* Location */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle>Location</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input id="country" label="Country" placeholder="e.g. Saudi Arabia" {...register('country')} />
            <Input id="city"    label="City"    placeholder="e.g. Jeddah"       {...register('city')} />
            <Input id="port"    label="Port"    placeholder="e.g. Jeddah Port"  {...register('port')} />
          </div>
          <div style={{ marginTop: 16 }}>
            <Input id="address" label="Full Address" placeholder="Street address…" {...register('address')} />
          </div>
        </div>

        {/* Contact */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle>Contact Information</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input id="contactPerson" label="Contact Person" placeholder="e.g. Ahmed Hassan" {...register('contactPerson')} />
            <Input id="mobile"        label="Mobile"         placeholder="+966 5X XXX XXXX"  {...register('mobile')} />
            <Input id="email"         label="Email"          type="email" placeholder="agent@company.com"
              error={errors.email?.message}
              {...register('email')} />
          </div>
        </div>

        {/* Status */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <SectionTitle>Status</SectionTitle>
          <Select id="status" label="Status"
            options={AGENT_STATUS.map(s => ({ value: s, label: s }))}
            style={{ maxWidth: 200 }}
            {...register('status')} />
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button type="button" variant="secondary" onClick={() => router.push('/agents')}>Cancel</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Agent'}
          </Button>
        </div>
      </form>
    </div>
  );
}
