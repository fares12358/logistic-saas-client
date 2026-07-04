'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { rolesService, permissionsService } from '../../services/roles.service';
import { MODULES } from '../../utils/constants';
import Button from '../../components/ui/Button';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import PageHeader from '../../components/ui/PageHeader';

const ACTIONS = ['view', 'read', 'create', 'update', 'delete', 'hidden'];

const MODULE_LABELS = {
  users: 'Users', roles: 'Roles', vessels: 'Vessels', agents: 'Agents',
  locations: 'Locations', containerTypes: 'Container Types', expenseTypes: 'Expense Types',
  services: 'Services', routes: 'Routes', rounds: 'Rounds', voyages: 'Voyages',
  bookings: 'Bookings', expenses: 'Expenses', invoices: 'Invoices',
  tracking: 'Tracking', reports: 'Reports', export: 'Export', auditLogs: 'Audit Logs',
};

export default function PermissionMatrix({ roleId }) {
  const router = useRouter();
  const [perms, setPerms] = useState({});

  const { data: roleData } = useQuery({
    queryKey: ['role', roleId],
    queryFn: () => rolesService.getById(roleId).then(r => r.data.data),
  });

  const { data: permData, isLoading } = useQuery({
    queryKey: ['permissions', roleId],
    queryFn: () => permissionsService.getByRoleId(roleId).then(r => r.data.data),
  });

  useEffect(() => {
    if (permData) {
      const map = {};
      permData.forEach(p => { map[p.module] = { ...p.actions }; });
      setPerms(map);
    }
  }, [permData]);

  const saveMutation = useMutation({
    mutationFn: () => {
      const payload = Object.entries(perms).map(([module, actions]) => ({ module, actions }));
      return permissionsService.saveByRoleId(roleId, payload);
    },
    onSuccess: () => toast.success('Permissions saved successfully'),
    onError: (e) => toast.error(e.response?.data?.message || 'Save failed'),
  });

  const toggle = (module, action) => {
    setPerms(prev => ({
      ...prev,
      [module]: { ...prev[module], [action]: !prev[module]?.[action] },
    }));
  };

  const setAll = (module, value) => {
    setPerms(prev => ({
      ...prev,
      [module]: { view: value, read: value, create: value, update: value, delete: value, hidden: false },
    }));
  };

  if (isLoading) return <LoadingSpinner fullPage />;

  const isSystem = roleData?.isSystem;

  return (
    <div>
      <PageHeader
        title={`Permissions — ${roleData?.name || '...'}`}
        subtitle="Configure module-level access for this role"
        action={
          <div className="flex gap-3">
            <Button variant="secondary" onClick={() => router.back()}>← Back</Button>
            {!isSystem && (
              <Button onClick={() => saveMutation.mutate()} loading={saveMutation.isPending}>
                Save Permissions
              </Button>
            )}
          </div>
        }
      />

      {isSystem && (
        <div className="mb-4 bg-purple-50 border border-purple-200 rounded-lg px-4 py-3 text-sm text-purple-700">
          SuperAdmin has full access to all modules. Permissions cannot be modified for system roles.
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b border-gray-100">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase w-40">Module</th>
              {ACTIONS.map(a => (
                <th key={a} className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">{a}</th>
              ))}
              {!isSystem && <th className="px-4 py-3 text-center text-xs font-semibold text-gray-500 uppercase">All</th>}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {Object.keys(MODULE_LABELS).map((mod) => (
              <tr key={mod} className="hover:bg-gray-50 transition-colors">
                <td className="px-4 py-3 font-medium text-gray-700">{MODULE_LABELS[mod]}</td>
                {ACTIONS.map(action => (
                  <td key={action} className="px-4 py-3 text-center">
                    {isSystem ? (
                      <span className="inline-block w-4 h-4 bg-green-500 rounded-sm" title="Granted" />
                    ) : (
                      <input type="checkbox"
                        checked={perms[mod]?.[action] === true}
                        onChange={() => toggle(mod, action)}
                        className="w-4 h-4 rounded border-gray-300 text-blue-600 cursor-pointer"
                      />
                    )}
                  </td>
                ))}
                {!isSystem && (
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => setAll(mod, true)}
                      className="text-xs text-blue-600 hover:underline mr-2">All</button>
                    <button onClick={() => setAll(mod, false)}
                      className="text-xs text-red-500 hover:underline">None</button>
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
