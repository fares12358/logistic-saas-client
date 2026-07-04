'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import toast from 'react-hot-toast';
import { rolesService } from '../../services/roles.service';
import { usePermission } from '../../context/PermissionContext';
import PageHeader from '../../components/ui/PageHeader';
import Button from '../../components/ui/Button';
import EmptyState from '../../components/ui/EmptyState';
import LoadingSpinner from '../../components/ui/LoadingSpinner';
import ConfirmDialog from '../../components/ui/ConfirmDialog';
import Modal from '../../components/ui/Modal';
import Input from '../../components/ui/Input';
import { useForm } from 'react-hook-form';

export default function RoleList() {
  const qc = useQueryClient();
  const router = useRouter();
  const { can } = usePermission();

  const [modal,        setModal]        = useState(null); // null | 'create' | { edit: role }
  const [deleteTarget, setDeleteTarget] = useState(null);

  const { data, isLoading } = useQuery({
    queryKey: ['roles'],
    queryFn: () => rolesService.list().then(r => r.data.data),
  });

  const saveMutation = useMutation({
    mutationFn: (d) => modal?.edit ? rolesService.update(modal.edit._id, d) : rolesService.create(d),
    onSuccess: () => { toast.success(modal?.edit ? 'Role updated' : 'Role created'); qc.invalidateQueries(['roles']); setModal(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Operation failed'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => rolesService.remove(id),
    onSuccess: () => { toast.success('Role deleted'); qc.invalidateQueries(['roles']); setDeleteTarget(null); },
    onError: (e) => toast.error(e.response?.data?.message || 'Delete failed'),
  });

  const { register, handleSubmit, reset, formState: { errors } } = useForm();

  const openEdit = (role) => { reset({ name: role.name, description: role.description }); setModal({ edit: role }); };
  const openCreate = () => { reset({ name: '', description: '' }); setModal('create'); };

  const roles = data || [];

  return (
    <div>
      <PageHeader
        title="Roles & Permissions"
        subtitle="Manage roles and configure module permissions"
        action={can('roles', 'create') && <Button onClick={openCreate}>+ New Role</Button>}
      />

      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        {isLoading ? <LoadingSpinner fullPage /> : roles.length === 0 ? <EmptyState /> : (
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                {['Role Name', 'Description', 'System', 'Actions'].map(h => (
                  <th key={h} className="px-4 py-3 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {roles.map((r) => (
                <tr key={r._id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-800">{r.name}</td>
                  <td className="px-4 py-3 text-gray-500">{r.description || '—'}</td>
                  <td className="px-4 py-3">
                    {r.isSystem && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">System</span>}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <button onClick={() => router.push(`/roles/${r._id}`)}
                        className="text-blue-600 hover:underline text-xs font-medium">Permissions</button>
                      {can('roles', 'update') && !r.isSystem && (
                        <button onClick={() => openEdit(r)}
                          className="text-gray-600 hover:underline text-xs font-medium">Edit</button>
                      )}
                      {can('roles', 'delete') && !r.isSystem && (
                        <button onClick={() => setDeleteTarget(r)}
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

      {/* Create / Edit Modal */}
      <Modal open={!!modal} onClose={() => setModal(null)}
        title={modal?.edit ? 'Edit Role' : 'Create Role'} size="sm">
        <form onSubmit={handleSubmit((d) => saveMutation.mutate(d))} className="space-y-4">
          <Input id="roleName" label="Role Name" placeholder="e.g. Operations Manager" required
            error={errors.name?.message}
            {...register('name', { required: 'Role name is required' })} />
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium text-gray-700">Description</label>
            <textarea rows={3} placeholder="Optional description..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              {...register('description')} />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" onClick={() => setModal(null)}>Cancel</Button>
            <Button type="submit" loading={saveMutation.isPending}>
              {modal?.edit ? 'Save Changes' : 'Create Role'}
            </Button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={() => deleteMutation.mutate(deleteTarget._id)}
        loading={deleteMutation.isPending}
        title="Delete Role"
        message={`Delete role "${deleteTarget?.name}"? Users assigned to this role will be affected.`}
      />
    </div>
  );
}
