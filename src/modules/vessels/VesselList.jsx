'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { vesselsService } from '../../services/vessels.service';
import { usePermission } from '../../context/PermissionContext';
import { downloadFile } from '../../utils/exportHelper';
import { VESSEL_STATUS } from '../../utils/constants';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function VesselList() {
  const router = useRouter();
  const qc     = useQueryClient();
  const { can } = usePermission();

  const [page,         setPage]         = useState(1);
  const [search,       setSearch]       = useState('');
  const [status,       setStatus]       = useState('');
  const [selected,     setSelected]     = useState([]);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [exporting,    setExporting]    = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ['vessels', page, search, status],
    queryFn:  () => vesselsService.list({ page, limit: 20, search, status }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => vesselsService.remove(id),
    onSuccess:  () => { toast.success('Vessel deleted'); qc.invalidateQueries(['vessels']); setDeleteTarget(null); setSelected([]); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const vessels    = data?.data || [];
  const pagination = data?.pagination;

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll    = () => setSelected(prev => prev.length === vessels.length ? [] : vessels.map(v => v._id));

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const filters     = { search, status };
      const selectedIds = type === 'selected' ? selected : [];
      const res         = await vesselsService.export(filters, selectedIds);
      downloadFile(res.data, `vessels-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Vessels"
        subtitle="Manage your fleet master data"
        action={
          <div className="flex items-center gap-2">
            {can('vessels', 'create') && (
              <Button onClick={() => router.push('/vessels/new')}>+ New Vessel</Button>
            )}
          </div>
        }
      />

      {/* Filters & Export */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); setSelected([]); }} placeholder="Search code, name, IMO..." />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); setSelected([]); }}
          options={VESSEL_STATUS.map(s => ({ value: s, label: s }))}
          placeholder="All Statuses" className="w-44" />
        <Button variant="secondary" size="sm" onClick={() => handleExport('all')} loading={exporting} disabled={exporting}>
          Export All
        </Button>
        {selected.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => handleExport('selected')} loading={exporting}>
            Export Selected ({selected.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <LoadingSpinner fullPage /> : vessels.length === 0 ? <EmptyState title="No vessels found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={selected.length === vessels.length && vessels.length > 0}
                      onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                  </th>
                  {['Code', 'Name', 'IMO', 'Flag', 'Ownership', 'TEU', 'DWT', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {vessels.map((v) => (
                  <tr key={v._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(v._id)} onChange={() => toggleSelect(v._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">{v.vesselCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{v.vesselName}</td>
                    <td className="px-4 py-3 text-gray-500 font-mono text-xs">{v.imoNumber || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.flag || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.ownershipType}</td>
                    <td className="px-4 py-3 text-gray-600">{v.teuCapacity?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{v.dwt?.toLocaleString() || '—'}</td>
                    <td className="px-4 py-3"><Badge label={v.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {can('vessels', 'update') && (
                          <button onClick={() => router.push(`/vessels/${v._id}`)}
                            className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                        )}
                        {can('vessels', 'delete') && (
                          <button onClick={() => setDeleteTarget(v)}
                            className="text-red-500 hover:underline text-xs font-medium">Delete</button>
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

      {pagination && (
        <div className="flex items-center justify-between mt-4">
          <p className="text-sm text-gray-400">
            {pagination.total} vessel{pagination.total !== 1 ? 's' : ''} total
            {selected.length > 0 && ` · ${selected.length} selected`}
          </p>
          <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Vessel"
        message={`Delete vessel "${deleteTarget?.vesselName}" (${deleteTarget?.vesselCode})? This cannot be undone.`}
      />
    </div>
  );
}
