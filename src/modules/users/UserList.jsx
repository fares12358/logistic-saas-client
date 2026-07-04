'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { usersService } from '../../services/users.service';
import { rolesService } from '../../services/roles.service';
import { usePermission } from '../../context/PermissionContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import Badge from '../../components/ui/Badge';
import SearchBar from '../../components/ui/SearchBar';
import Pagination from '../../components/ui/Pagination';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Select from '../../components/ui/Select';
import Modal from '../../components/ui/Modal';
import UserForm from './UserForm';

export default function UserList() {
  const qc = useQueryClient();
  const { can } = usePermission();

  const [page,       setPage]       = useState(1);
  const [search,     setSearch]     = useState('');
  const [status,     setStatus]     = useState('');
  const [modal,      setModal]      = useState(null);   // null | 'create' | 'invite' | { edit: user }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [resendTarget, setResendTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search, status],
    queryFn: () => usersService.list({ page, limit: 20, search, status }).then(r => r.data),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => usersService.remove(id),
    onSuccess: () => { toast.success('User deleted'); qc.invalidateQueries(['users']); setDeleteTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const resendMutation = useMutation({
    mutationFn: (id) => usersService.resendInvite(id),
    onSuccess: () => { toast.success('Invitation resent'); setResendTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Failed to resend'),
  });

  const users      = data?.data || [];
  const pagination = data?.pagination;

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Manage system users and team members"
        action={
          <div className="flex gap-2">
            {can('users', 'create') && (
              <>
                <Button variant="secondary" onClick={() => setModal('invite')}>Send Invitation</Button>
                <Button onClick={() => setModal('create')}>+ Create User</Button>
              </>
            )}
          </div>
        }
      />

      {/* Filters */}
      <div className="flex gap-3 mb-4">
        <div className="flex-1 max-w-sm">
          <SearchBar value={search} onChange={(v) => { setSearch(v); setPage(1); }} placeholder="Search by name or email..." />
        </div>
        <Select value={status} onChange={(e) => { setStatus(e.target.value); setPage(1); }}
          options={[{ value: 'Active', label: 'Active' }, { value: 'Inactive', label: 'Inactive' }]}
          placeholder="All Statuses" className="w-40" />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <LoadingSpinner fullPage /> : users.length === 0 ? <EmptyState /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Name', 'Email', 'Role', 'Status', 'Last Login', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {users.map((u) => (
                <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">
                    {u.name}
                    {u.isInvited && !u.password && (
                      <span className="ml-2 text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full">Pending</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-gray-600">{u.email}</td>
                  <td className="px-4 py-3 text-gray-600">{u.roleId?.name || '—'}</td>
                  <td className="px-4 py-3"><Badge label={u.status} /></td>
                  <td className="px-4 py-3 text-gray-500">
                    {u.lastLogin ? new Date(u.lastLogin).toLocaleDateString('en-GB') : '—'}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      {can('users', 'update') && (
                        <button onClick={() => setModal({ edit: u })}
                          className="text-blue-600 hover:underline text-xs font-medium">Edit</button>
                      )}
                      {can('users', 'update') && u.isInvited && !u.password && (
                        <button onClick={() => setResendTarget(u)}
                          className="text-yellow-600 hover:underline text-xs font-medium">Resend</button>
                      )}
                      {can('users', 'delete') && (
                        <button onClick={() => setDeleteTarget(u)}
                          className="text-red-500 hover:underline text-xs font-medium">Delete</button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {pagination && (
        <Pagination page={pagination.page} totalPages={pagination.totalPages} onPageChange={setPage} />
      )}

      {/* Create / Edit Modal */}
      <Modal
        open={modal !== null && modal !== 'invite'}
        onClose={() => setModal(null)}
        title={modal === 'create' ? 'Create User' : modal?.edit ? 'Edit User' : ''}
        size="md"
      >
        {(modal === 'create' || modal?.edit) && (
          <UserForm
            user={modal?.edit || null}
            mode={modal === 'create' ? 'create' : 'edit'}
            onSuccess={() => { setModal(null); qc.invalidateQueries(['users']); }}
            onCancel={() => setModal(null)}
          />
        )}
      </Modal>

      {/* Invite Modal */}
      <Modal open={modal === 'invite'} onClose={() => setModal(null)} title="Send Invitation" size="md">
        <UserForm
          mode="invite"
          onSuccess={() => { setModal(null); qc.invalidateQueries(['users']); }}
          onCancel={() => setModal(null)}
        />
      </Modal>

      {/* Delete Confirm */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete User"
        message={`Are you sure you want to delete "${deleteTarget?.name}"? This cannot be undone.`}
      />

      {/* Resend Confirm */}
      <ConfirmDialog
        open={!!resendTarget}
        onClose={() => setResendTarget(null)}
        onConfirm={() => resendMutation.mutate(resendTarget._id)}
        loading={resendMutation.isPending}
        title="Resend Invitation"
        message={`Resend invitation email to "${resendTarget?.email}"?`}
        confirmLabel="Resend"
      />
    </div>
  );
}
