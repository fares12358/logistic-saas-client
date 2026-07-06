'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { bookingsService } from '@/services/bookings.service';
import { usePermission }   from '@/context/PermissionContext';
import Badge   from '@/components/ui/Badge';
import Modal   from '@/components/ui/Modal';
import { useState } from 'react';
import BookingForm from '@/modules/bookings/BookingForm';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

const fmt      = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n) => n != null ? `$${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })}` : '—';

function InfoRow({ label, value, mono, highlight }) {
  return (
    <div className="flex flex-col gap-0.5">
      <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{label}</p>
      <p className={`text-[13.5px] font-medium ${highlight ? 'text-teal-700' : 'text-gray-700'} ${mono ? 'font-mono' : ''}`}>
        {value ?? <span className="text-gray-300">—</span>}
      </p>
    </div>
  );
}

export default function BookingDetailCard({ booking, onMutated }) {
  const router     = useRouter();
  const qc         = useQueryClient();
  const { can }    = usePermission();
  const [editOpen, setEditOpen]     = useState(false);
  const [delOpen,  setDelOpen]      = useState(false);

  const deleteMutation = useMutation({
    mutationFn: () => bookingsService.remove(booking._id),
    onSuccess: () => {
      toast.success('Booking deleted');
      qc.invalidateQueries(['bookings']);
      router.push('/bookings');
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const cancelMutation = useMutation({
    mutationFn: () => bookingsService.update(booking._id, { status: 'Cancelled' }),
    onSuccess: () => {
      toast.success('Booking cancelled');
      qc.invalidateQueries(['bookings']);
      qc.invalidateQueries(['booking', booking._id]);
      onMutated?.();
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Cancel failed'),
  });

  const isCancelled  = booking.status === 'Cancelled';
  const isConfirmed  = booking.status === 'Confirmed';
  const canCancel    = can('bookings', 'update') && !isCancelled;
  const canEdit      = can('bookings', 'update') && !isCancelled;
  const canDelete    = can('bookings', 'delete');

  return (
    <>
      <div className="card p-6 flex flex-col gap-6">

        {/* ── Header ───────────────────────────────────────────────────── */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1 flex-wrap">
              <span className="mono text-lg font-bold text-gray-800">{booking.bookingNumber}</span>
              <Badge label={booking.status} />
            </div>
            <p className="text-sm text-gray-400">
              Created {fmt(booking.createdAt)}
            </p>
          </div>

          {/* Actions */}
          <div className="flex gap-2 flex-wrap">
            {canEdit && (
              <button onClick={() => setEditOpen(true)} className="btn btn-secondary btn-sm">
                Edit
              </button>
            )}
            {canCancel && booking.status !== 'Cancelled' && (
              <button
                onClick={() => cancelMutation.mutate()}
                disabled={cancelMutation.isPending}
                className="btn btn-secondary btn-sm text-amber-600 hover:bg-amber-50 border-amber-200"
              >
                {cancelMutation.isPending ? 'Cancelling…' : 'Cancel Booking'}
              </button>
            )}
            {canDelete && (
              <button onClick={() => setDelOpen(true)} className="btn btn-danger btn-sm">
                Delete
              </button>
            )}
          </div>
        </div>

        {/* ── Total Freight highlight ───────────────────────────────────── */}
        <div className="bg-gradient-to-r from-teal-50 to-teal-100/50 border border-teal-200 rounded-xl px-5 py-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold text-teal-600 uppercase tracking-wider">Total Freight</p>
            <p className="text-xs text-teal-500 mt-0.5">
              {booking.quantity} × {fmtMoney(booking.freightRate)} / unit
            </p>
          </div>
          <span className="text-3xl font-bold text-teal-700 mono">
            {fmtMoney(booking.totalFreight)}
          </span>
        </div>

        {/* ── Info grid ────────────────────────────────────────────────── */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-6 gap-y-5">
          <InfoRow label="Voyage"        value={booking.voyageId?.voyageNumber} mono />
          <InfoRow label="Agent"         value={`${booking.agentId?.agentCode} — ${booking.agentId?.agentName}`} />
          <InfoRow label="Container Type" value={`${booking.containerTypeId?.code} (${booking.containerTypeId?.size} ${booking.containerTypeId?.type})`} />
          <InfoRow label="Shipper"       value={booking.shipper} />
          <InfoRow label="Consignee"     value={booking.consignee} />
          <InfoRow label="Commodity"     value={booking.commodity} />
          <InfoRow label="POL"           value={`${booking.polId?.name}${booking.polId?.code ? ` (${booking.polId.code})` : ''}`} />
          <InfoRow label="POD"           value={`${booking.podId?.name}${booking.podId?.code ? ` (${booking.podId.code})` : ''}`} />
          <div />
          <InfoRow label="Quantity"      value={booking.quantity?.toLocaleString()} />
          <InfoRow label="Slot Count"    value={booking.slotCount?.toLocaleString()} />
          <InfoRow label="Freight Rate"  value={fmtMoney(booking.freightRate)} />
        </div>

        {/* ── Remarks ──────────────────────────────────────────────────── */}
        {booking.remarks && (
          <div className="border-t border-gray-100 pt-4">
            <p className="text-[11px] font-semibold text-gray-400 uppercase tracking-wider mb-1.5">Remarks</p>
            <p className="text-sm text-gray-600 leading-relaxed">{booking.remarks}</p>
          </div>
        )}
      </div>

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title={`Edit Booking — ${booking.bookingNumber}`} size="lg">
        {editOpen && (
          <BookingForm
            item={booking}
            onSuccess={() => {
              setEditOpen(false);
              qc.invalidateQueries(['booking', booking._id]);
              qc.invalidateQueries(['bookings']);
              onMutated?.();
            }}
            onCancel={() => setEditOpen(false)}
          />
        )}
      </Modal>

      {/* Delete confirm */}
      <ConfirmDialog
        open={delOpen}
        onClose={() => setDelOpen(false)}
        onConfirm={() => deleteMutation.mutate()}
        loading={deleteMutation.isPending}
        title="Delete Booking"
        message={`Delete booking "${booking.bookingNumber}"? This is permanent and cannot be undone.`}
      />
    </>
  );
}
