'use client';

import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { auditLogsService } from '../../services/auditLogs.service';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import { formatDateTime } from '../../utils/formatters';

const ACTION_COLORS = {
  CREATE: 'bg-green-100 text-green-700',
  UPDATE: 'bg-blue-100 text-blue-700',
  DELETE: 'bg-red-100 text-red-700',
  LOGIN:  'bg-gray-100 text-gray-600',
  LOGOUT: 'bg-gray-100 text-gray-600',
};

const MODULE_PATHS = {
  users: '/users', roles: '/roles', vessels: '/vessels', agents: '/agents',
  rounds: '/rounds', voyages: '/voyages', bookings: '/bookings',
  expenses: '/expenses', invoices: '/invoices',
};

export default function AuditLogDetail({ id }) {
  const router = useRouter();
  const { data, isLoading } = useQuery({
    queryKey: ['audit-log', id],
    queryFn: () => auditLogsService.getById(id).then(r => r.data.data),
  });

  if (isLoading) return <LoadingSpinner fullPage />;
  if (!data) return <p className="text-gray-500 p-6">Log entry not found.</p>;

  const recordPath = MODULE_PATHS[data.module] && data.recordId
    ? `${MODULE_PATHS[data.module]}/${data.recordId}`
    : null;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center gap-4 mb-6">
        <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
        <h1 className="text-2xl font-bold text-gray-800">Audit Log Detail</h1>
      </div>

      {/* Summary card */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
          <div><p className="text-gray-400 text-xs uppercase font-semibold mb-1">Timestamp</p><p className="text-gray-800 font-medium">{formatDateTime(data.timestamp)}</p></div>
          <div><p className="text-gray-400 text-xs uppercase font-semibold mb-1">User</p><p className="text-gray-800">{data.userId?.name || '—'}<br/><span className="text-gray-500 text-xs">{data.userEmail}</span></p></div>
          <div><p className="text-gray-400 text-xs uppercase font-semibold mb-1">Action</p>
            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-xs font-medium ${ACTION_COLORS[data.action]}`}>{data.action}</span>
          </div>
          <div><p className="text-gray-400 text-xs uppercase font-semibold mb-1">Module</p><p className="text-gray-800 capitalize">{data.module}</p></div>
          <div><p className="text-gray-400 text-xs uppercase font-semibold mb-1">Record</p>
            {recordPath ? (
              <button onClick={() => router.push(recordPath)} className="text-blue-600 hover:underline text-sm font-mono">
                {data.recordNumber || data.recordId}
              </button>
            ) : <p className="text-gray-800 font-mono text-xs">{data.recordNumber || data.recordId || '—'}</p>}
          </div>
          <div><p className="text-gray-400 text-xs uppercase font-semibold mb-1">IP Address</p><p className="text-gray-600 text-xs font-mono">{data.ipAddress || '—'}</p></div>
        </div>
      </div>

      {/* Old vs New values */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-red-400 rounded-full"></span> Previous Values
          </h3>
          {data.oldValues ? (
            <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(data.oldValues, null, 2)}
            </pre>
          ) : <p className="text-xs text-gray-400 italic">No previous values (new record)</p>}
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
          <h3 className="text-sm font-semibold text-gray-600 mb-3 flex items-center gap-2">
            <span className="w-2 h-2 bg-green-400 rounded-full"></span> New Values
          </h3>
          {data.newValues ? (
            <pre className="text-xs text-gray-600 bg-gray-50 rounded-lg p-3 overflow-x-auto whitespace-pre-wrap">
              {JSON.stringify(data.newValues, null, 2)}
            </pre>
          ) : <p className="text-xs text-gray-400 italic">No new values (deleted record)</p>}
        </div>
      </div>
    </div>
  );
}
