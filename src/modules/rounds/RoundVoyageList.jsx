'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { voyagesService } from '@/services/voyages.service';
import { usePermission } from '@/context/PermissionContext';
import Badge from '@/components/ui/Badge';
import Modal from '@/components/ui/Modal';
import VoyageEditForm from '../voyages/VoyageEditForm';

const fmt     = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtTime = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : null;

export default function RoundVoyageList({ roundId, round }) {
  const qc      = useQueryClient();
  const { can } = usePermission();
  const [editTarget, setEditTarget] = useState(null);

  const { data: voyages = [], isLoading } = useQuery({
    queryKey: ['round-voyages', roundId],
    queryFn:  () => voyagesService.list({ roundId, limit: 100 }).then(r => r.data.data),
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12 text-gray-400">
        <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
        </svg>
        <span className="text-sm">Loading voyages…</span>
      </div>
    );
  }

  if (voyages.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400">
        <svg className="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
          <path strokeLinecap="round" d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4"/>
        </svg>
        <p className="text-sm">No voyages generated for this round.</p>
      </div>
    );
  }

  return (
    <>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="table-header">
              {['#', 'Voyage No', 'POL', 'POD', 'ETD', 'ETA', 'ATD', 'ATA', 'Status', 'Actions'].map(h => (
                <th key={h}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {voyages.map((v) => (
              <tr key={v._id} className="table-row">

                {/* Sequence */}
                <td>
                  <span className="inline-flex items-center justify-center w-6 h-6 text-[11px] font-bold text-teal-700 bg-teal-50 border border-teal-200 rounded-full">
                    {String(v.sequence).padStart(2, '0')}
                  </span>
                </td>

                {/* Voyage number */}
                <td>
                  <span className="mono text-xs font-bold text-gray-700">{v.voyageNumber}</span>
                </td>

                {/* POL */}
                <td>
                  <div>
                    <span className="font-medium text-gray-800 text-sm">{v.polId?.name}</span>
                    {v.polId?.code && <span className="ml-1 mono text-[10px] text-gray-400">{v.polId.code}</span>}
                  </div>
                </td>

                {/* POD */}
                <td>
                  <div>
                    <span className="font-medium text-gray-800 text-sm">{v.podId?.name}</span>
                    {v.podId?.code && <span className="ml-1 mono text-[10px] text-gray-400">{v.podId.code}</span>}
                  </div>
                </td>

                {/* Dates */}
                <td className={`text-xs ${v.etd ? 'text-gray-600' : 'text-gray-300'}`}>{fmt(v.etd)}</td>
                <td className={`text-xs ${v.eta ? 'text-gray-600' : 'text-gray-300'}`}>{fmt(v.eta)}</td>
                <td className={`text-xs ${v.atd ? 'text-blue-600 font-medium' : 'text-gray-300'}`}>{fmt(v.atd)}</td>
                <td className={`text-xs ${v.ata ? 'text-blue-600 font-medium' : 'text-gray-300'}`}>{fmt(v.ata)}</td>

                {/* Status */}
                <td><Badge label={v.status} /></td>

                {/* Actions */}
                <td>
                  {can('voyages', 'update') && (
                    <button
                      onClick={() => setEditTarget(v)}
                      className="text-xs font-medium text-teal-600 hover:text-teal-800 transition"
                    >
                      Edit
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Edit Voyage Modal */}
      <Modal
        open={!!editTarget}
        onClose={() => setEditTarget(null)}
        title={`Edit Voyage — ${editTarget?.voyageNumber || ''}`}
        size="md"
      >
        {editTarget && (
          <VoyageEditForm
            voyage={editTarget}
            onSuccess={() => {
              setEditTarget(null);
              qc.invalidateQueries(['round-voyages', roundId]);
              qc.invalidateQueries(['voyages']);
            }}
            onCancel={() => setEditTarget(null)}
          />
        )}
      </Modal>
    </>
  );
}
