'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { auditLogsService } from '../../services/auditLogs.service';
import PageHeader from '../../components/ui/PageHeader';
import SearchBar from '../../components/ui/SearchBar';
import Select from '../../components/ui/Select';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import Badge from '../../components/ui/Badge';
import { MODULES } from '../../utils/constants';
import { formatDateTime } from '../../utils/formatters';

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN:  'bg-gray-100 text-gray-600',
  LOGOUT: 'bg-gray-100 text-gray-600',
};

export default function AuditLogList() {
  const router = useRouter();
  const [page,     setPage]     = useState(1);
  const [search,   setSearch]   = useState('');
  const [module,   setModule]   = useState('');
  const [action,   setAction]   = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo,   setDateTo]   = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['audit-logs', page, search, module, action, dateFrom, dateTo],
    queryFn: () => auditLogsService.list({ page, limit: 20, search, module, action, dateFrom, dateTo }).then(r => r.data),
  });

  const logs       = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <PageHeader title="Audit Log" subtitle="Immutable record of all system actions" />

      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex-1 min-w-48">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search email or record..." />
        </div>
        <Select value={module} onChange={(e) => { setModule(e.target.value); setPage(1); }}
          options={MODULES.map(m => ({ value: m, label: m }))}
          placeholder="All Modules" className="w-44" />
        <Select value={action} onChange={(e) => { setAction(e.target.value); setPage(1); }}
          options={['CREATE','UPDATE','DELETE','LOGIN','LOGOUT'].map(a => ({ value: a, label: a }))}
          placeholder="All Actions" className="w-36" />
        <input type="date" value={dateFrom} onChange={(e) => { setDateFrom(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
        <input type="date" value={dateTo} onChange={(e) => { setDateTo(e.target.value); setPage(1); }}
          className="px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500" />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <LoadingSpinner fullPage /> : logs.length === 0 ? <EmptyState title="No audit log entries" /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Timestamp', 'User', 'Action', 'Module', 'Record', 'IP Address'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {logs.map((log) => (
                <tr key={log._id} onClick={() => router.push(`/audit-logs/${log._id}`)}
                  className="hover:bg-gray-50 cursor-pointer transition-colors">
                  <td className="px-4 py-3 text-gray-500 text-xs whitespace-nowrap">{formatDateTime(log.timestamp)}</td>
                  <td className="px-4 py-3 text-gray-700">{log.userEmail}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex px-2 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[log.action] || 'bg-gray-100 text-gray-600'}`}>
                      {log.action}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-gray-600">{log.module}</td>
                  <td className="px-4 py-3 text-gray-600 font-mono text-xs">{log.recordNumber || log.recordId || '—'}</td>
                  <td className="px-4 py-3 text-gray-400 text-xs">{log.ipAddress || '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}
    </div>
  );
}
