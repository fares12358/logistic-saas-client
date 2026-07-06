'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { invoicesService } from '@/services/invoices.service';
import { agentsService }   from '@/services/agents.service';
import { bookingsService } from '@/services/bookings.service';
import { usePermission }   from '@/context/PermissionContext';
import { INVOICE_STATUS }  from '@/utils/constants';
import PageHeader    from '@/components/ui/PageHeader';
import Button        from '@/components/ui/Button';
import Badge         from '@/components/ui/Badge';
import Pagination    from '@/components/ui/Pagination';
import EmptyState    from '@/components/ui/EmptyState';
import LoadingSpinner from '@/components/ui/LoadingSpinner';
import ConfirmDialog from '@/components/ui/ConfirmDialog';

import ExportButton from '@/components/ui/ExportButton';

const fmt      = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';
const fmtMoney = (n, c) => n != null ? `${Number(n).toLocaleString('en-US', { minimumFractionDigits: 2 })} ${c || ''}` : '—';

export default function InvoiceList() {
  const router  = useRouter();
  const qc      = useQueryClient();
  const { can } = usePermission();

  const [page,        setPage]        = useState(1);
  const [status,      setStatus]      = useState('');
  const [agentId,     setAgentId]     = useState('');
  const [dateFrom,    setDateFrom]    = useState('');
  const [dateTo,      setDateTo]      = useState('');
  const [deleteTarget,setDeleteTarget]= useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['invoices', page, status, agentId, dateFrom, dateTo],
    queryFn:  () => invoicesService.list({ page, limit: 20, status, agentId, dateFrom, dateTo }).then(r => r.data),
  });

  const { data: agData } = useQuery({
    queryKey: ['agents-dd'],
    queryFn:  () => agentsService.list({ limit: 200, status: 'Active' }).then(r => r.data.data),
  });
  const agents = agData || [];

  const deleteMutation = useMutation({
    mutationFn: (id) => invoicesService.remove(id),
    onSuccess: () => {
      toast.success('Invoice deleted');
      qc.invalidateQueries(['invoices']);
      setDeleteTarget(null);
    },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const invoices   = data?.data || [];
  const pagination = data?.pagination;
  const sc = 'text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white text-gray-700 focus:outline-none focus:border-teal-500 cursor-pointer';

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Invoices"
        subtitle="Manage booking invoices and payment status"
        action={can('invoices', 'create') && (
          <Button onClick={() => router.push('/invoices/new')}>+ New Invoice</Button>
        )}
      />

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2.5 mb-4">
        <select value={agentId} onChange={e => { setAgentId(e.target.value); setPage(1); }} className={sc}>
          <option value="">All Agents</option>
          {agents.map(a => <option key={a._id} value={a._id}>{a.agentCode} — {a.agentName}</option>)}
        </select>
        <select value={status} onChange={e => { setStatus(e.target.value); setPage(1); }} className={sc}>
          <option value="">All Statuses</option>
          {INVOICE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
        <input type="date" value={dateFrom} onChange={e => { setDateFrom(e.target.value); setPage(1); }}
          className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-teal-500" />
        <span className="text-gray-400 text-xs">to</span>
        <input type="date" value={dateTo} onChange={e => { setDateTo(e.target.value); setPage(1); }}
          className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-teal-500" />
        <ExportButton module="invoices" filters={{ agentId, status, dateFrom, dateTo }} selectedIds={[]} onClear={() => {}} />
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? <LoadingSpinner fullPage /> : invoices.length === 0 ? (
          <EmptyState title="No invoices found" message="Create an invoice linked to a booking." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-header">
                  {['Invoice No', 'Booking No', 'Agent', 'Invoice Date', 'Due Date', 'Amount', 'Status', 'Actions'].map(h => (
                    <th key={h}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {invoices.map(inv => (
                  <tr key={inv._id} className="table-row">
                    <td><span className="mono text-xs font-bold text-teal-600">{inv.invoiceNumber}</span></td>
                    <td><span className="mono text-xs font-semibold text-gray-600">{inv.bookingId?.bookingNumber}</span></td>
                    <td className="text-xs text-gray-600">{inv.agentId?.agentName}</td>
                    <td className="text-xs text-gray-600">{fmt(inv.invoiceDate)}</td>
                    <td className={`text-xs font-medium ${new Date(inv.dueDate) < new Date() && inv.status !== 'Paid' ? 'text-red-500' : 'text-gray-600'}`}>
                      {fmt(inv.dueDate)}
                    </td>
                    <td><span className="mono text-xs font-semibold text-gray-700">{fmtMoney(inv.amount, inv.currency)}</span></td>
                    <td><Badge label={inv.status} /></td>
                    <td>
                      <div className="flex items-center gap-3">
                        {can('invoices', 'update') && inv.status !== 'Paid' && (
                          <button onClick={() => router.push(`/invoices/${inv._id}`)}
                            className="text-xs font-medium text-teal-600 hover:text-teal-800 transition">Edit</button>
                        )}
                        {inv.status === 'Paid' && (
                          <span className="text-xs text-gray-400">View only</span>
                        )}
                        {can('invoices', 'delete') && inv.status !== 'Paid' && (
                          <button onClick={() => setDeleteTarget(inv)}
                            className="text-xs font-medium text-red-400 hover:text-red-600 transition">Delete</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {pagination && pagination.total > 0 && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-xs text-gray-400">{pagination.total} invoice{pagination.total !== 1 ? 's' : ''} total</p>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Invoice"
        message={`Delete invoice "${deleteTarget?.invoiceNumber}"? This cannot be undone.`}
      />
    </div>
  );
}
