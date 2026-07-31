import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi, adminApi } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import { Trash2, Search, User as UserIcon, ShieldAlert, ShieldCheck, Edit3, X, Check } from 'lucide-react';
import { User, UserRole } from '../types/global.types';

export const UsersPage: React.FC = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editRole, setEditRole] = useState<UserRole>('user');
  const [errorMessage, setErrorMessage] = useState('');

  const { user: currentUser, isSuperAdmin } = useAuthStore();
  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['users', page, search],
    queryFn: () => usersApi.getAll(page, 10, search),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => (isSuperAdmin() ? adminApi.deleteUser(id) : usersApi.delete(id)),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to delete user');
    },
  });

  const changeRoleMutation = useMutation({
    mutationFn: ({ id, role }: { id: string; role: UserRole }) => adminApi.changeRole(id, role),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to change user role');
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, name, email, role }: { id: string; name: string; email: string; role: UserRole }) =>
      adminApi.updateUser(id, { name, email, role }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['users'] });
      setEditingUser(null);
      setErrorMessage('');
    },
    onError: (err: any) => {
      setErrorMessage(err.response?.data?.message || 'Failed to update user');
    },
  });

  const handleEditClick = (u: User) => {
    setEditingUser(u);
    setEditName(u.name);
    setEditEmail(u.email);
    setEditRole(u.role);
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
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Users Management</h1>
        <p style={{ color: 'var(--text-muted)' }}>
          {isSuperAdmin()
            ? 'Superadmin Access: Manage users, assign roles, and modify details'
            : 'System User Directory'}
        </p>
      </div>

      {errorMessage && (
        <div style={{
          backgroundColor: 'rgba(239, 68, 68, 0.15)',
          border: '1px solid #ef4444',
          color: '#ef4444',
          padding: '0.75rem 1rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          fontSize: '0.875rem',
        }}>
          {errorMessage}
        </div>
      )}

      {/* Search */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search users by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Edit User Modal */}
      {editingUser && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(0, 0, 0, 0.6)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 100,
        }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '450px', padding: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h2 style={{ fontSize: '1.2rem', fontWeight: '600' }}>Edit User (Superadmin)</h2>
              <button onClick={() => setEditingUser(null)} className="btn" style={{ padding: '0.2rem' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSaveUser} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Email Address</label>
                <input
                  type="email"
                  className="form-input"
                  style={{ width: '100%' }}
                  value={editEmail}
                  onChange={(e) => setEditEmail(e.target.value)}
                  required
                />
              </div>

              <div>
                <label className="form-label">Role</label>
                <select
                  className="form-input"
                  style={{ width: '100%' }}
                  value={editRole}
                  onChange={(e) => setEditRole(e.target.value as UserRole)}
                >
                  <option value="user">User</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Superadmin</option>
                </select>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '1rem' }}>
                <button type="button" onClick={() => setEditingUser(null)} className="btn btn-secondary">
                  Cancel
                </button>
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
                {isSuperAdmin() && <th style={{ textAlign: 'right' }}>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {data?.data.map((u) => {
                const roleBadge = getRoleBadgeStyle(u.role);
                const BadgeIcon = roleBadge.icon;
                const isSelf = u.id === currentUser?.id;

                return (
                  <tr key={u.id}>
                    <td style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                      <div style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '50%',
                        backgroundColor: roleBadge.color,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}>
                        <BadgeIcon size={18} color="white" />
                      </div>
                      <div>
                        <div style={{ fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                          {u.name}
                          {isSelf && (
                            <span style={{ fontSize: '0.7rem', backgroundColor: 'rgba(99, 102, 241, 0.2)', color: '#818cf8', padding: '0.1rem 0.4rem', borderRadius: '4px' }}>
                              You
                            </span>
                          )}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{u.email}</div>
                      </div>
                    </td>
                    <td>
                      {isSuperAdmin() && !isSelf ? (
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
                          backgroundColor: roleBadge.bg,
                          color: roleBadge.color,
                          padding: '0.25rem 0.75rem',
                          borderRadius: '20px',
                          fontSize: '0.8rem',
                          fontWeight: '600',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '0.3rem',
                        }}>
                          <BadgeIcon size={12} />
                          {roleBadge.label}
                        </span>
                      )}
                    </td>
                    <td>{u.created_at}</td>
                    {isSuperAdmin() && (
                      <td style={{ textAlign: 'right' }}>
                        <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                          <button
                            onClick={() => handleEditClick(u)}
                            className="btn btn-secondary"
                            style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                          >
                            <Edit3 size={14} /> Edit
                          </button>

                          {!isSelf && u.role !== 'superadmin' && (
                            <button
                              onClick={() => {
                                if (confirm(`Are you sure you want to delete user ${u.name}?`)) {
                                  deleteMutation.mutate(u.id);
                                }
                              }}
                              className="btn btn-danger"
                              style={{ padding: '0.4rem 0.8rem', fontSize: '0.8rem' }}
                            >
                              <Trash2 size={14} /> Delete
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
