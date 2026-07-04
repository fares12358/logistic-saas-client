'use client';

import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { vesselsService } from '../../services/vessels.service';
import { VESSEL_STATUS, OWNERSHIP_TYPES } from '../../utils/constants';
import Input from '../../components/ui/Input';
import Select from '../../components/ui/Select';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';

export default function VesselForm({ id = null }) {
  const router  = useRouter();
  const isEdit  = !!id;

  const { data: vesselData, isLoading: loadingVessel } = useQuery({
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
        imoNumber:        vesselData.imoNumber   || '',
        flag:             vesselData.flag         || '',
        callSign:         vesselData.callSign     || '',
        ownershipType:    vesselData.ownershipType,
        ownerName:        vesselData.ownerName    || '',
        charterStartDate: vesselData.charterStartDate ? vesselData.charterStartDate.split('T')[0] : '',
        charterEndDate:   vesselData.charterEndDate   ? vesselData.charterEndDate.split('T')[0]   : '',
        teuCapacity:      vesselData.teuCapacity  ?? '',
        dwt:              vesselData.dwt           ?? '',
        builtYear:        vesselData.builtYear     ?? '',
        status:           vesselData.status,
        notes:            vesselData.notes         || '',
      });
    }
  }, [vesselData, isEdit]);

  const mutation = useMutation({
    mutationFn: (data) => isEdit ? vesselsService.update(id, data) : vesselsService.create(data),
    onSuccess: () => {
      toast.success(isEdit ? 'Vessel updated successfully' : 'Vessel created successfully');
      router.push('/vessels');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  if (isEdit && loadingVessel) return <LoadingSpinner fullPage />;

  return (
    <div className="max-w-3xl">
      <PageHeader
        title={isEdit ? 'Edit Vessel' : 'New Vessel'}
        subtitle={isEdit ? `Editing: ${vesselData?.vesselName || ''}` : 'Add a vessel to your fleet'}
        action={<Button variant="secondary" onClick={() => router.push('/vessels')}>← Back</Button>}
      />

      <form onSubmit={handleSubmit(d => mutation.mutate(d))} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 space-y-6">

        {/* Basic Info */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Input id="vesselCode" label="Vessel Code" placeholder="e.g. VSL001" required
              error={errors.vesselCode?.message}
              {...register('vesselCode', { required: 'Vessel code is required' })} />
            <Input id="vesselName" label="Vessel Name" placeholder="e.g. MV Ocean Star" required
              error={errors.vesselName?.message}
              {...register('vesselName', { required: 'Vessel name is required' })} />
            <Input id="imoNumber" label="IMO Number" placeholder="7 digits (optional)"
              error={errors.imoNumber?.message}
              {...register('imoNumber')} />
            <Input id="flag" label="Flag" placeholder="e.g. Panama"
              {...register('flag')} />
            <Input id="callSign" label="Call Sign" placeholder="e.g. A8BC1"
              {...register('callSign')} />
          </div>
        </div>

        {/* Ownership */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Ownership</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select id="ownershipType" label="Ownership Type" required
              options={OWNERSHIP_TYPES.map(o => ({ value: o, label: o }))}
              error={errors.ownershipType?.message}
              {...register('ownershipType', { required: 'Ownership type is required' })} />
            <Input id="ownerName" label="Owner Name" placeholder="e.g. Star Shipping LLC"
              {...register('ownerName')} />
            {ownershipType === 'Chartered' && (
              <>
                <Input id="charterStartDate" label="Charter Start Date" type="date" required
                  error={errors.charterStartDate?.message}
                  {...register('charterStartDate', { required: ownershipType === 'Chartered' ? 'Required for chartered vessels' : false })} />
                <Input id="charterEndDate" label="Charter End Date" type="date" required
                  error={errors.charterEndDate?.message}
                  {...register('charterEndDate', { required: ownershipType === 'Chartered' ? 'Required for chartered vessels' : false })} />
              </>
            )}
          </div>
        </div>

        {/* Specs */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Vessel Specifications</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input id="teuCapacity" label="TEU Capacity" type="number" min="0" placeholder="e.g. 2500"
              {...register('teuCapacity')} />
            <Input id="dwt" label="DWT (tonnes)" type="number" min="0" placeholder="e.g. 30000"
              {...register('dwt')} />
            <Input id="builtYear" label="Built Year" type="number" min="1800" max={new Date().getFullYear() + 1} placeholder="e.g. 2010"
              {...register('builtYear')} />
          </div>
        </div>

        {/* Status & Notes */}
        <div>
          <h3 className="text-sm font-semibold text-gray-700 mb-4 pb-2 border-b border-gray-100">Status & Notes</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Select id="status" label="Status"
              options={VESSEL_STATUS.map(s => ({ value: s, label: s }))}
              {...register('status')} />
            <div className="md:col-span-2 flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Notes</label>
              <textarea rows={3} placeholder="Optional notes about this vessel..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                {...register('notes')} />
            </div>
          </div>
        </div>

        <div className="flex justify-end gap-3 pt-2 border-t border-gray-100">
          <Button type="button" variant="secondary" onClick={() => router.push('/vessels')}>Cancel</Button>
          <Button type="submit" loading={isSubmitting || mutation.isPending}>
            {isEdit ? 'Save Changes' : 'Create Vessel'}
          </Button>
        </div>
      </form>
    </div>
  );
}
