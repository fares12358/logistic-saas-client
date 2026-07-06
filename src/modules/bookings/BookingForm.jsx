'use client';

import { useEffect, useMemo } from 'react';
import { useForm, useWatch } from 'react-hook-form';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { bookingsService } from '@/services/bookings.service';
import { voyagesService }   from '@/services/voyages.service';
import { agentsService }    from '@/services/agents.service';
import { containerTypesService } from '@/services/containerTypes.service';
import { BOOKING_STATUS }   from '@/utils/constants';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}` : '—';

/* ── shared input / label styles ─────────────────────────────────────────── */
const ic = (err) =>
  `w-full text-[13px] border rounded-lg px-3 py-2 bg-white text-gray-800
   focus:outline-none focus:ring-2 transition
   ${err ? 'border-red-400 focus:ring-red-400/20' : 'border-gray-200 focus:border-teal-500 focus:ring-teal-500/10'}`;
const lc = 'block text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5';
const ec = 'mt-1 text-[11px] text-red-500';

function FieldLabel({ children, required }) {
  return (
    <label className={lc}>
      {children}{required && <span className="text-red-400 ml-0.5">*</span>}
    </label>
  );
}

export default function BookingForm({ item, onSuccess, onCancel }) {
  const qc        = useQueryClient();
  const isEditing = !!item;

  const { register, handleSubmit, control, setValue, watch,
          formState: { errors } } = useForm({
    defaultValues: {
      voyageId:        item?.voyageId?._id  || item?.voyageId  || '',
      agentId:         item?.agentId?._id   || item?.agentId   || '',
      shipper:         item?.shipper        || '',
      consignee:       item?.consignee      || '',
      polId:           item?.polId?._id     || item?.polId     || '',
      podId:           item?.podId?._id     || item?.podId     || '',
      containerTypeId: item?.containerTypeId?._id || item?.containerTypeId || '',
      quantity:        item?.quantity       || 1,
      slotCount:       item?.slotCount      || 1,
      freightRate:     item?.freightRate    || 0,
      commodity:       item?.commodity      || '',
      remarks:         item?.remarks        || '',
      status:          item?.status         || 'Pending',
    },
  });

  const watchedVoyageId   = watch('voyageId');
  const watchedQuantity   = watch('quantity');
  const watchedFreight    = watch('freightRate');
  const liveTotal         = useMemo(
    () => (Number(watchedQuantity) || 0) * (Number(watchedFreight) || 0),
    [watchedQuantity, watchedFreight]
  );

  /* ── Active voyages for dropdown ───────────────────────────────────────── */
  const { data: voyageData } = useQuery({
    queryKey: ['voyages-dropdown'],
    queryFn:  () => voyagesService.list({ limit: 200 }).then(r => r.data.data),
  });
  const voyages = (voyageData || []).filter(v => !['Cancelled', 'Completed'].includes(v.status));

  /* ── Selected voyage info ───────────────────────────────────────────────── */
  const selectedVoyage = voyages.find(v => v._id === watchedVoyageId);

  /* ── Voyage ports for POL/POD dropdowns ─────────────────────────────────── */
  const { data: voyagePorts = [] } = useQuery({
    queryKey: ['voyage-ports', watchedVoyageId],
    queryFn:  () => bookingsService.getVoyagePorts(watchedVoyageId).then(r => r.data.data),
    enabled:  !!watchedVoyageId,
  });

  // Reset POL/POD when voyage changes (create mode only)
  useEffect(() => {
    if (!isEditing && watchedVoyageId) {
      setValue('polId', '');
      setValue('podId', '');
    }
  }, [watchedVoyageId, isEditing, setValue]);

  /* ── Agents dropdown ─────────────────────────────────────────────────────── */
  const { data: agentData } = useQuery({
    queryKey: ['agents-dropdown'],
    queryFn:  () => agentsService.list({ limit: 200, status: 'Active' }).then(r => r.data.data),
  });
  const agents = agentData || [];

  /* ── Container types dropdown ────────────────────────────────────────────── */
  const { data: ctData } = useQuery({
    queryKey: ['container-types-dropdown'],
    queryFn:  () => containerTypesService.list({ limit: 200 }).then(r => r.data.data),
  });
  const containerTypes = ctData || [];

  /* ── Save ────────────────────────────────────────────────────────────────── */
  const mutation = useMutation({
    mutationFn: (data) =>
      isEditing
        ? bookingsService.update(item._id, data)
        : bookingsService.create(data),
    onSuccess: (res) => {
      toast.success(isEditing ? 'Booking updated' : 'Booking created');
      qc.invalidateQueries(['bookings']);
      onSuccess?.(res.data.data);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  const onSubmit = (data) => {
    // Never send totalFreight — server computes it
    const { totalFreight: _ignored, ...payload } = data;
    mutation.mutate(payload);
  };

  const isCancelled = item?.status === 'Cancelled';

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5">

      {/* ── Cancelled warning ────────────────────────────────────────────── */}
      {isCancelled && (
        <div className="flex items-center gap-2 bg-red-50 border border-red-200 rounded-xl px-4 py-3">
          <svg className="w-4 h-4 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/>
          </svg>
          <p className="text-sm text-red-600">Cancelled bookings cannot be edited.</p>
        </div>
      )}

      {/* ── Section: Voyage ──────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col gap-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Voyage</p>

        <div>
          <FieldLabel required>Voyage</FieldLabel>
          <select
            {...register('voyageId', { required: 'Voyage is required' })}
            disabled={isEditing || isCancelled}
            className={`${ic(errors.voyageId)} ${isEditing ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}
          >
            <option value="">Select voyage…</option>
            {voyages.map(v => (
              <option key={v._id} value={v._id}>
                {v.voyageNumber} — {v.polId?.name ?? '?'} → {v.podId?.name ?? '?'}
              </option>
            ))}
          </select>
          {errors.voyageId && <p className={ec}>{errors.voyageId.message}</p>}
          {isEditing && <p className="mt-1 text-[11px] text-amber-500">Voyage cannot be changed on an existing booking</p>}
        </div>

        {/* Voyage info strip */}
        {selectedVoyage && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {[
              { label: 'Voyage No',  val: <span className="mono font-bold text-teal-600">{selectedVoyage.voyageNumber}</span> },
              { label: 'Status',     val: selectedVoyage.status },
              { label: 'ETD',        val: fmt(selectedVoyage.etd) },
              { label: 'ETA',        val: fmt(selectedVoyage.eta) },
            ].map(({ label, val }) => (
              <div key={label} className="bg-white border border-gray-200 rounded-lg px-3 py-2">
                <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                <p className="text-[13px] font-medium text-gray-700">{val}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Section: Parties ─────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col gap-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Parties</p>

        <div>
          <FieldLabel required>Agent</FieldLabel>
          <select
            {...register('agentId', { required: 'Agent is required' })}
            disabled={isCancelled}
            className={`${ic(errors.agentId)} cursor-pointer`}
          >
            <option value="">Select agent…</option>
            {agents.map(a => (
              <option key={a._id} value={a._id}>{a.agentCode} — {a.agentName}</option>
            ))}
          </select>
          {errors.agentId && <p className={ec}>{errors.agentId.message}</p>}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>Shipper</FieldLabel>
            <input
              {...register('shipper', { required: 'Shipper is required', maxLength: { value: 200, message: 'Max 200 chars' } })}
              placeholder="Shipper company name"
              disabled={isCancelled}
              className={ic(errors.shipper)}
            />
            {errors.shipper && <p className={ec}>{errors.shipper.message}</p>}
          </div>
          <div>
            <FieldLabel required>Consignee</FieldLabel>
            <input
              {...register('consignee', { required: 'Consignee is required', maxLength: { value: 200, message: 'Max 200 chars' } })}
              placeholder="Consignee company name"
              disabled={isCancelled}
              className={ic(errors.consignee)}
            />
            {errors.consignee && <p className={ec}>{errors.consignee.message}</p>}
          </div>
        </div>
      </div>

      {/* ── Section: Ports ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col gap-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Port of Loading / Discharge</p>

        {!watchedVoyageId && (
          <p className="text-xs text-gray-400 italic">Select a voyage first to load available ports.</p>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <FieldLabel required>POL (Port of Loading)</FieldLabel>
            <select
              {...register('polId', { required: 'POL is required' })}
              disabled={!watchedVoyageId || isCancelled}
              className={`${ic(errors.polId)} cursor-pointer disabled:opacity-50`}
            >
              <option value="">Select POL…</option>
              {voyagePorts.map(p => (
                <option key={p._id} value={p._id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
              ))}
            </select>
            {errors.polId && <p className={ec}>{errors.polId.message}</p>}
          </div>
          <div>
            <FieldLabel required>POD (Port of Discharge)</FieldLabel>
            <select
              {...register('podId', { required: 'POD is required' })}
              disabled={!watchedVoyageId || isCancelled}
              className={`${ic(errors.podId)} cursor-pointer disabled:opacity-50`}
            >
              <option value="">Select POD…</option>
              {voyagePorts.map(p => (
                <option key={p._id} value={p._id}>{p.name}{p.code ? ` (${p.code})` : ''}</option>
              ))}
            </select>
            {errors.podId && <p className={ec}>{errors.podId.message}</p>}
          </div>
        </div>
      </div>

      {/* ── Section: Cargo ───────────────────────────────────────────────── */}
      <div className="rounded-xl border border-gray-100 bg-gray-50/60 p-4 flex flex-col gap-4">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Cargo & Freight</p>

        <div>
          <FieldLabel required>Container Type</FieldLabel>
          <select
            {...register('containerTypeId', { required: 'Container type is required' })}
            disabled={isCancelled}
            className={`${ic(errors.containerTypeId)} cursor-pointer`}
          >
            <option value="">Select container type…</option>
            {containerTypes.map(ct => (
              <option key={ct._id} value={ct._id}>{ct.code} — {ct.size} {ct.type}</option>
            ))}
          </select>
          {errors.containerTypeId && <p className={ec}>{errors.containerTypeId.message}</p>}
        </div>

        <div className="grid grid-cols-3 gap-3">
          <div>
            <FieldLabel required>Quantity</FieldLabel>
            <input
              type="number" min="1"
              {...register('quantity', { required: 'Required', min: { value: 1, message: 'Min 1' }, valueAsNumber: true })}
              disabled={isCancelled}
              className={ic(errors.quantity)}
            />
            {errors.quantity && <p className={ec}>{errors.quantity.message}</p>}
          </div>
          <div>
            <FieldLabel required>Slot Count</FieldLabel>
            <input
              type="number" min="1"
              {...register('slotCount', { required: 'Required', min: { value: 1, message: 'Min 1' }, valueAsNumber: true })}
              disabled={isCancelled}
              className={ic(errors.slotCount)}
            />
            {errors.slotCount && <p className={ec}>{errors.slotCount.message}</p>}
          </div>
          <div>
            <FieldLabel required>Freight Rate ($)</FieldLabel>
            <input
              type="number" min="0" step="0.01"
              {...register('freightRate', { required: 'Required', min: { value: 0, message: 'Min 0' }, valueAsNumber: true })}
              disabled={isCancelled}
              className={ic(errors.freightRate)}
            />
            {errors.freightRate && <p className={ec}>{errors.freightRate.message}</p>}
          </div>
        </div>

        {/* Live total freight display */}
        <div className="flex items-center justify-between bg-teal-50 border border-teal-200 rounded-xl px-4 py-3">
          <div>
            <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Total Freight</p>
            <p className="text-[11px] text-teal-500 mt-0.5">Qty × Rate — computed by server on save</p>
          </div>
          <span className="text-xl font-bold text-teal-700 mono">
            {fmtMoney(liveTotal)}
          </span>
        </div>

        <div>
          <FieldLabel>Commodity</FieldLabel>
          <input
            {...register('commodity')}
            placeholder="e.g. Electronics, Textiles…"
            disabled={isCancelled}
            className={ic(false)}
          />
        </div>

        <div>
          <FieldLabel>Remarks</FieldLabel>
          <textarea
            {...register('remarks')}
            rows={3}
            placeholder="Optional notes…"
            disabled={isCancelled}
            className={`${ic(false)} resize-none`}
          />
        </div>
      </div>

      {/* ── Status ───────────────────────────────────────────────────────── */}
      {isEditing && (
        <div>
          <FieldLabel>Status</FieldLabel>
          <select
            {...register('status')}
            disabled={isCancelled}
            className={`${ic(false)} cursor-pointer`}
          >
            {BOOKING_STATUS.map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      )}

      {/* ── Actions ──────────────────────────────────────────────────────── */}
      <div className="flex justify-end gap-2 pt-1">
        <button type="button" onClick={onCancel} className="btn btn-secondary btn-md">
          Cancel
        </button>
        <button
          type="submit"
          disabled={mutation.isPending || isCancelled}
          className="btn btn-primary btn-md flex items-center gap-1.5"
        >
          {mutation.isPending ? (
            <>
              <svg className="animate-spin w-3.5 h-3.5" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Saving…
            </>
          ) : isEditing ? 'Save Changes' : 'Create Booking'}
        </button>
      </div>
    </form>
  );
}
