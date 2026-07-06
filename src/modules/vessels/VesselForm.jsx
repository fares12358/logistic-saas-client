'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { vesselsService } from '@/services/vessels.service';
import { VESSEL_STATUS, OWNERSHIP_TYPES } from '@/utils/constants';
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

export default function VesselForm({ id = null }) {
  const router = useRouter();
  const isEdit = !!id;

  const { data: vesselData, isLoading } = useQuery({
    queryKey: ['vessel', id],
    queryFn:  () => vesselsService.getById(id).then(r => r.data.data),
    enabled:  isEdit,
  });

  const { register, handleSubmit, watch, reset, formState: { errors, isSubmitting } } = useForm();
  const ownershipType = watch('ownershipType');

  useEffect(() => {
    if (isEdit && vesselData) {
      reset({
        vesselCode:       vesselData.vesselCode,
        vesselName:       vesselData.vesselName,
        imoNumber:        vesselData.imoNumber        || '',
        flag:             vesselData.flag              || '',
        callSign:         vesselData.callSign          || '',
        ownershipType:    vesselData.ownershipType,
        ownerName:        vesselData.ownerName         || '',
        charterStartDate: vesselData.charterStartDate  ? vesselData.charterStartDate.split('T')[0] : '',
        charterEndDate:   vesselData.charterEndDate    ? vesselData.charterEndDate.split('T')[0]   : '',
        teuCapacity:      vesselData.teuCapacity       ?? '',
        dwt:              vesselData.dwt               ?? '',
        builtYear:        vesselData.builtYear         ?? '',
        status:           vesselData.status,
        notes:            vesselData.notes             || '',
      });
    }
  }, [vesselData, isEdit]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? vesselsService.update(id, data) : vesselsService.create(data),
    onSuccess:  () => { toast.success(isEdit ? 'Vessel updated' : 'Vessel created'); router.push('/vessels'); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  if (isEdit && isLoading) return <LoadingSpinner fullPage />;

  return (
    <div className="animate-fadeIn" style={{ maxWidth: 780 }}>
      <PageHeader
        title={isEdit ? 'Edit Vessel' : 'New Vessel'}
        subtitle={isEdit ? `Editing: ${vesselData?.vesselName || '…'}` : 'Register a vessel in your fleet'}
        action={
          <Button variant="secondary" onClick={() => router.push('/vessels')}>
            ← Back to Vessels
          </Button>
        }
      />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))}>
        {/* Basic Info */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle>Basic Information</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Input id="vesselCode" label="Vessel Code" placeholder="e.g. VSL001" required
              error={errors.vesselCode?.message}
              {...register('vesselCode', { required: 'Vessel code is required' })} />
            <Input id="vesselName" label="Vessel Name" placeholder="e.g. MV Ocean Star" required
              error={errors.vesselName?.message}
              {...register('vesselName', { required: 'Vessel name is required' })} />
            <Input id="imoNumber" label="IMO Number" placeholder="7-digit number (optional)"
              error={errors.imoNumber?.message}
              {...register('imoNumber')} />
            <Input id="flag" label="Flag" placeholder="e.g. Panama" {...register('flag')} />
            <Input id="callSign" label="Call Sign" placeholder="e.g. A8BC1" {...register('callSign')} />
          </div>
        </div>

        {/* Ownership */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle>Ownership</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <Select id="ownershipType" label="Ownership Type" required
              options={OWNERSHIP_TYPES.map(o => ({ value: o, label: o }))}
              error={errors.ownershipType?.message}
              {...register('ownershipType', { required: 'Ownership type is required' })} />
            <Input id="ownerName" label="Owner Name" placeholder="e.g. Star Shipping LLC" {...register('ownerName')} />
            {ownershipType === 'Chartered' && (
              <>
                <Input id="charterStartDate" label="Charter Start Date" type="date" required
                  error={errors.charterStartDate?.message}
                  {...register('charterStartDate', { required: 'Required for chartered vessels' })} />
                <Input id="charterEndDate" label="Charter End Date" type="date" required
                  error={errors.charterEndDate?.message}
                  {...register('charterEndDate', { required: 'Required for chartered vessels' })} />
              </>
            )}
          </div>
        </div>

        {/* Specs */}
        <div className="card" style={{ padding: 28, marginBottom: 16 }}>
          <SectionTitle>Vessel Specifications</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
            <Input id="teuCapacity" label="TEU Capacity" type="number" min="0" placeholder="e.g. 2500" {...register('teuCapacity')} />
            <Input id="dwt" label="DWT (tonnes)" type="number" min="0" placeholder="e.g. 30000" {...register('dwt')} />
            <Input id="builtYear" label="Built Year" type="number" min="1800" placeholder="e.g. 2010" {...register('builtYear')} />
          </div>
        </div>

        {/* Status & Notes */}
        <div className="card" style={{ padding: 28, marginBottom: 24 }}>
          <SectionTitle>Status & Notes</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 16 }}>
            <Select id="status" label="Status"
              options={VESSEL_STATUS.map(s => ({ value: s, label: s }))}
              {...register('status')} />
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>Notes</label>
              <textarea rows={3} placeholder="Optional notes about this vessel…"
                className="input-base" style={{ resize: 'vertical', fontFamily: 'inherit' }}
                {...register('notes')} />
            </div>
          </div>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
          <Button type="button" variant="secondary" onClick={() => router.push('/vessels')}>Cancel</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Vessel'}
          </Button>
        </div>
      </form>
    </div>
  );
}
