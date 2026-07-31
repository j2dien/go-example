import React from 'react';
import { useAuthStore } from '../../stores/authStore';
import { LayoutDashboard, Users, FileText, LogOut, Sparkles, ShieldAlert, ShieldCheck, User as UserIcon } from 'lucide-react';
import { UserRole } from '../../types/global.types';
import { Link, useRouter } from '@tanstack/react-router';

export const Sidebar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const router = useRouter();

  const menuItems = [
    { to: '/admin/dashboard' as const, label: 'Dashboard', icon: LayoutDashboard },
    { to: '/admin/posts' as const, label: 'Posts Management', icon: FileText },
    { to: '/admin/users' as const, label: 'Users Directory', icon: Users },
  ];

  const handleLogout = () => {
    logout();
    router.navigate({ to: '/login' });
  };

  const getRoleBadge = (role?: UserRole) => {
    switch (role) {
      case 'superadmin':
        return { label: 'Superadmin', icon: ShieldAlert, color: '#ef4444', bg: 'rgba(239, 68, 68, 0.15)' };
      case 'admin':
        return { label: 'Admin', icon: ShieldCheck, color: '#3b82f6', bg: 'rgba(59, 130, 246, 0.15)' };
      default:
        return { label: 'User', icon: UserIcon, color: '#10b981', bg: 'rgba(16, 185, 129, 0.15)' };
    }
  };

  const badge = getRoleBadge(user?.role);
  const BadgeIcon = badge.icon;

  return (
    <aside className="sidebar">
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
        <div style={{ background: 'var(--accent-gradient)', padding: '0.5rem', borderRadius: '10px', display: 'flex' }}>
          <Sparkles size={24} color="white" />
        </div>
        <div>
          <h2 style={{ fontSize: '1.2rem', fontWeight: '700', letterSpacing: '-0.5px' }}>GoCRUD App</h2>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Production Ready</span>
        </div>
      </div>

      {/* Logged user role indicator */}
      <div style={{
        backgroundColor: badge.bg,
        border: `1px solid ${badge.color}40`,
        borderRadius: '8px',
        padding: '0.6rem 0.8rem',
        marginBottom: '1.5rem',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem'
      }}>
        <BadgeIcon size={16} color={badge.color} />
        <span style={{ fontSize: '0.8rem', fontWeight: '600', color: badge.color }}>
          Role: {badge.label}
        </span>
      </div>

      <nav style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <Link
              key={item.to}
              to={item.to}
              className="btn"
              activeProps={{
                style: {
                  justifyContent: 'flex-start',
                  backgroundColor: 'rgba(99, 102, 241, 0.15)',
                  color: 'var(--accent-primary)',
                  fontWeight: '600',
                  borderLeft: '3px solid var(--accent-primary)',
                  borderRadius: '4px',
                }
              }}
              inactiveProps={{
                style: {
                  justifyContent: 'flex-start',
                  backgroundColor: 'transparent',
                  color: 'var(--text-muted)',
                  fontWeight: 'normal',
                  borderLeft: '3px solid transparent',
                  borderRadius: '4px',
                }
              }}
            >
              <Icon size={18} />
              {item.label}
            </Link>
          );
        })}
      </nav>

      <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)' }}>
        <div style={{ marginBottom: '1rem' }}>
          <p style={{ fontWeight: '600', fontSize: '0.9rem' }}>{user?.name}</p>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>{user?.email}</p>
        </div>
        <button
          onClick={handleLogout}
          className="btn btn-secondary"
          style={{ width: '100%', justifyContent: 'center' }}
        >
          <LogOut size={16} /> Logout
        </button>
      </div>
    </aside>
  );
};
