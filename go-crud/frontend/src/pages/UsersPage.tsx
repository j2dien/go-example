import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, adminApi } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import { Trash2, Search, User as UserIcon, ShieldAlert, ShieldCheck, Edit3, X } from 'lucide-react';
import { User, UserRole } from '../types/global.types';
import { toast } from 'sonner';

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');

  const { user: currentUser, isSuperAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getAll(page, 10, search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => (isSuperAdmin() ? adminApi.deleteUser(id) : usersApi.delete(id)),
    onSuccess: () => {
      toast.success('Pengguna berhasil dihapus!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus pengguna.');
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => adminApi.changeRole(id, role),
    onSuccess: () => {
      toast.success('Role pengguna berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengubah role pengguna.');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, name, email, role }: { id: string; name: string; email: string; role: UserRole }) =>
      adminApi.updateUser(id, { name, email, role }),
    onSuccess: () => {
      toast.success('Data pengguna berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengedit data pengguna.');
    },
  });

  const handleEditClick = (u: User) => {
    if (!isSuperAdmin()) {
      toast.error(`Akses ditolak: Role ${currentUser?.role} tidak memiliki izin untuk mengedit pengguna.`);
      return;
    }
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
  };

  const handleDeleteUser = (u: User) => {
    if (!isSuperAdmin()) {
      toast.error(`Akses ditolak: Role ${currentUser?.role} tidak memiliki izin untuk menghapus pengguna.`);
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus user ${u.name}?`)) {
      deleteMutation.mutate(u.id);
    }
  };

  const handleSaveUser = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingUser) return;
    updateUserMutation.mutate({
      id: editingUser.id,
      name: editName,
      email: editEmail,
      role: editRole,
    });
  };

  const getRoleBadgeStyle = (role: UserRole) => {
    switch (role) {
      case 'superadmin':
        return { bg: 'rgba(239, 68, 68, 0.2)', color: '#ef4444', icon: ShieldAlert, label: 'Superadmin' };
      case 'admin':
        return { bg: 'rgba(59, 130, 246, 0.2)', color: '#3b82f6', icon: ShieldCheck, label: 'Admin' };
      default:
        return { bg: 'rgba(16, 185, 129, 0.2)', color: '#10b981', icon: UserIcon, label: 'User' };
    }
  };

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Users Directory</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isSuperAdmin()
            ? 'Superadmin Access: Manage users, assign roles, and modify details'
            : 'System User Directory (Management restricted to Superadmin)'}
        </p>
      </div>

      {/* Search Filter */}
      <div style={{ marginBottom: '1.5rem', display: 'flex', gap: '1rem' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Modal Edit User */}
      {editingUser && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>Edit User Details</h2>
              <button onClick={() => setEditingUser(null)} style={{ background: 'none', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input type="text" className="form-input" style={{ width: '100%' }} value={editName} onChange={(e) => setEditName(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" style={{ width: '100%' }} value={editEmail} onChange={(e) => setEditEmail(e.target.value)} required />
              </div>
              <div>
                <label className="form-label">Role</label>
                <select className="form-input" style={{ width: '100%' }} value={editRole} onChange={(e) => setEditRole(e.target.value as UserRole)}>
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">Cancel</button>
                <button type="submit" disabled={updateUserMutation.isPending} className="btn btn-primary">
                  {updateUserMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Table */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading users...</div>
      ) : (
        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>User</th>
                <th>Role</th>
                <th>Joined Date</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {data?.data.map((u) => {
                const roleBadge = getRoleBadgeStyle(u.role);
                const BadgeIcon = roleBadge.icon;
                const isSelf = u.id === currentUser?.id;
                const canManage = isSuperAdmin();

                return (
                  <tr key={u.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px', height: '36px', borderRadius: '50%', backgroundColor: roleBadge.color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                      }}>
                        <BadgeIcon size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {u.name}
                          {isSelf && <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>You</span>}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </td>
                    <td>
                      {canManage && !isSelf ? (
                        <select
                          value={u.role}
                          onChange={(e) => changeRoleMutation.mutate({ id: u.id, role: e.target.value as UserRole })}
                          style={{
                            backgroundColor: roleBadge.bg,
                            color: roleBadge.color,
                            border: `1px solid ${roleBadge.color}60`,
                            borderRadius: '20px',
                            padding: '0.25rem 0.75rem',
                            fontSize: '0.8rem',
                            fontWeight: '600',
                            cursor: 'pointer',
                          }}
                        >
                          <option value="user">User</option>
                          <option value="admin">Admin</option>
                          <option value="superadmin">Superadmin</option>
                        </select>
                      ) : (
                        <span style={{
                          backgroundColor: roleBadge.bg, color: roleBadge.color, padding: '0.25rem 0.75rem',
                          borderRadius: '20px', fontSize: '0.8rem', fontWeight: '600', display: 'inline-flex', alignItems: 'center', gap: '0.3rem',
                        }}>
                          <BadgeIcon size={12} />
                          {roleBadge.label}
                        </span>
                      )}
                    </td>
                    <td>{u.created_at}</td>
                    <td style={{ textAlign: 'right' }}>
                      <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => handleEditClick(u)}
                          disabled={!canManage}
                          title={canManage ? 'Edit User' : `Role ${currentUser?.role} tidak dapat mengedit data pengguna`}
                          className="btn btn-secondary"
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            opacity: canManage ? 1 : 0.4,
                            cursor: canManage ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <Edit3 size={14} /> Edit
                        </button>

                        <button
                          onClick={() => handleDeleteUser(u)}
                          disabled={!canManage || isSelf}
                          title={canManage && !isSelf ? 'Delete User' : `Role ${currentUser?.role} tidak dapat menghapus pengguna`}
                          className="btn btn-danger"
                          style={{
                            padding: '0.4rem 0.8rem',
                            fontSize: '0.8rem',
                            opacity: canManage && !isSelf ? 1 : 0.4,
                            cursor: canManage && !isSelf ? 'pointer' : 'not-allowed',
                          }}
                        >
                          <Trash2 size={14} /> Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* Pagination */}
      {data?.meta && data.meta.total_page > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '2rem' }}>
          {Array.from({ length: data.meta.total_page }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => setPage(p)}
              className="btn btn-secondary"
              style={{
                backgroundColor: page === p ? 'var(--accent-primary)' : undefined,
                color: page === p ? 'white' : undefined,
              }}
            >
              {p}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
