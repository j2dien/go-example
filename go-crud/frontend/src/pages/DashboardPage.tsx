import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { postsApi, usersApi } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import { FileText, Users, CheckCircle, Clock, ShieldAlert, ShieldCheck } from 'lucide-react';

export const DashboardPage: React.FC = () => {
  const { isSuperAdmin } = useAuthStore();

  const { data: postsData } = useQuery({
    queryKey: ['posts', 1],
    queryFn: () => postsApi.getAll(1, 100),
  });

  const { data: usersData } = useQuery({
    queryKey: ['users', 1],
    queryFn: () => usersApi.getAll(1, 100),
  });

  const totalPosts = postsData?.meta.total || 0;
  const totalUsers = usersData?.meta.total || 0;
  const publishedPosts = postsData?.data.filter((p) => p.status === 'published').length || 0;
  const draftPosts = postsData?.data.filter((p) => p.status === 'draft').length || 0;

  const totalSuperAdmins = usersData?.data.filter((u) => u.role === 'superadmin').length || 0;
  const totalAdmins = usersData?.data.filter((u) => u.role === 'admin').length || 0;

  const stats = [
    { title: 'Total Posts', value: totalPosts, icon: FileText, color: '#6366f1' },
    { title: 'Published Posts', value: publishedPosts, icon: CheckCircle, color: '#22c55e' },
    { title: 'Draft Posts', value: draftPosts, icon: Clock, color: '#eab308' },
    { title: 'Total Users', value: totalUsers, icon: Users, color: '#a855f7' },
  ];

  if (isSuperAdmin()) {
    stats.push(
      { title: 'Superadmins', value: totalSuperAdmins, icon: ShieldAlert, color: '#ef4444' },
      { title: 'Admins', value: totalAdmins, icon: ShieldCheck, color: '#3b82f6' }
    );
  }

  return (
    <div>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Dashboard</h1>
        <p style={{ color: 'var(--text-muted)' }}>System metrics and recent activity overview</p>
      </div>

      <div className="card-grid" style={{ marginBottom: '2.5rem' }}>
        {stats.map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} className="card" style={{ display: 'flex', alignItems: 'center', gap: '1.25rem' }}>
              <div style={{ backgroundColor: `${stat.color}20`, padding: '1rem', borderRadius: '12px', display: 'flex' }}>
                <Icon size={28} color={stat.color} />
              </div>
              <div>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{stat.title}</p>
                <p style={{ fontSize: '1.75rem', fontWeight: '700' }}>{stat.value}</p>
              </div>
            </div>
          );
        })}
      </div>

      <div className="glass-panel" style={{ padding: '1.5rem' }}>
        <h2 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '1rem' }}>Recent Posts</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {postsData?.data.slice(0, 5).map((post) => (
            <div
              key={post.id}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '0.75rem 1rem',
                backgroundColor: 'var(--bg-primary)',
                borderRadius: '8px',
              }}
            >
              <div>
                <p style={{ fontWeight: '500' }}>{post.title}</p>
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>By {post.author?.name || 'User'}</p>
              </div>
              <span className={`badge badge-${post.status}`}>{post.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
