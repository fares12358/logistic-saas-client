'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { agentsService } from '../../services/agents.service';
import { usePermission } from '../../context/PermissionContext';
import { downloadFile } from '../../utils/exportHelper';
import { AGENT_STATUS } from '../../utils/constants';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';

export default function AgentList() {
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
    queryKey: ['agents', page, search, status],
    queryFn:  () => agentsService.list({ page, limit: 20, search, status }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => agentsService.remove(id),
    onSuccess:  () => { toast.success('Agent deleted'); qc.invalidateQueries(['agents']); setDeleteTarget(null); setSelected([]); },
    onError:    (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const agents     = data?.data || [];
  const pagination = data?.pagination;

  const toggleSelect = (id) => setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  const toggleAll    = () => setSelected(prev => prev.length === agents.length ? [] : agents.map(a => a._id));

  const handleExport = async (type) => {
    setExporting(true);
    try {
      const filters     = { search, status };
      const selectedIds = type === 'selected' ? selected : [];
      const res         = await agentsService.export(filters, selectedIds);
      downloadFile(res.data, `agents-export-${new Date().toISOString().split('T')[0]}.xlsx`);
      toast.success('Export downloaded');
    } catch { toast.error('Export failed'); }
    finally { setExporting(false); }
  };

  return (
    <div>
      <PageHeader
        title="Agents"
        subtitle="Manage port agents and shipping agents"
        action={
          can('agents', 'create') && (
            <Button onClick={() => router.push('/agents/new')}>+ New Agent</Button>
          )
        }
      />

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); setSelected([]); }} placeholder="Search code, name, email..." />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); setSelected([]); }}
          options={AGENT_STATUS.map(s => ({ value: s, label: s }))}
          placeholder="All Statuses" className="w-40" />
        <Button variant="secondary" size="sm" onClick={() => handleExport('all')} loading={exporting}>Export All</Button>
        {selected.length > 0 && (
          <Button variant="secondary" size="sm" onClick={() => handleExport('selected')} loading={exporting}>
            Export Selected ({selected.length})
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <LoadingSpinner fullPage /> : agents.length === 0 ? <EmptyState title="No agents found" /> : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead className="bg-gray-50 border-b border-gray-100">
                <tr>
                  <th className="w-10 px-4 py-3">
                    <input type="checkbox" checked={selected.length === agents.length && agents.length > 0}
                      onChange={toggleAll} className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                  </th>
                  {['Code', 'Name', 'Country', 'City', 'Contact Person', 'Email', 'Status', 'Actions'].map(h => (
                    <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {agents.map((a) => (
                  <tr key={a._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      <input type="checkbox" checked={selected.includes(a._id)} onChange={() => toggleSelect(a._id)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer" />
                    </td>
                    <td className="px-4 py-3 font-mono font-semibold text-gray-800">{a.agentCode}</td>
                    <td className="px-4 py-3 font-medium text-gray-800">{a.agentName}</td>
                    <td className="px-4 py-3 text-gray-600">{a.country || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.city || '—'}</td>
                    <td className="px-4 py-3 text-gray-600">{a.contactPerson || '—'}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">{a.email || '—'}</td>
                    <td className="px-4 py-3"><Badge label={a.status} /></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        {can('agents', 'update') && (
                          <button onClick={() => router.push(`/agents/${a._id}`)}
                            className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                        )}
                        {can('agents', 'delete') && (
                          <button onClick={() => setDeleteTarget(a)}
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
            {pagination.total} agent{pagination.total !== 1 ? 's' : ''} total
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
        title="Delete Agent"
        message={`Delete agent "${deleteTarget?.agentName}" (${deleteTarget?.agentCode})? This cannot be undone.`}
      />
    </div>
  );
}
