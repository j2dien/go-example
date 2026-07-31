import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { postsApi } from '../api/endpoints';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { postSchema, PostInput } from '../lib/schemas';
import { Plus, Edit2, Trash2, Search, X } from 'lucide-react';
import { Post } from '../types/global.types';
import { useAuthStore } from '../stores/authStore';
import { toast } from 'sonner';

export const PostsPage: React.FC = () => {
  const { user, isSuperAdmin, isAdmin } = useAuthStore();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingPost, setEditingPost] = useState<Post | null>(null);

  const queryClient = useQueryClient();

  const { data, isLoading } = useQuery({
    queryKey: ['posts', page, search],
    queryFn: () => postsApi.getAll(page, 10, search),
  });

  const createMutation = useMutation({
    mutationFn: postsApi.create,
    onSuccess: () => {
      toast.success('Post berhasil dibuat!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal membuat post.');
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: string; data: PostInput }) => postsApi.update(id, data),
    onSuccess: () => {
      toast.success('Post berhasil diperbarui!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
      closeModal();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal mengedit post.');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: postsApi.delete,
    onSuccess: () => {
      toast.success('Post berhasil dihapus!');
      queryClient.invalidateQueries({ queryKey: ['posts'] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || 'Gagal menghapus post.');
    },
  });

  const form = useForm<PostInput>({
    resolver: zodResolver(postSchema),
    defaultValues: {
      title: '',
      content: '',
      status: 'draft',
    },
  });

  const openCreateModal = () => {
    setEditingPost(null);
    form.reset({ title: '', content: '', status: 'draft' });
    setIsModalOpen(true);
  };

  const openEditModal = (post: Post) => {
    const canEdit = post.user_id === user?.id || isSuperAdmin();
    if (!canEdit) {
      toast.error(`Akses ditolak: Role ${user?.role} tidak memiliki hak untuk mengedit post milik pengguna lain.`);
      return;
    }
    setEditingPost(post);
    form.reset({
      title: post.title,
      content: post.content,
      status: post.status,
    });
    setIsModalOpen(true);
  };

  const handleDeletePost = (post: Post) => {
    const canDelete = post.user_id === user?.id || isAdmin() || isSuperAdmin();
    if (!canDelete) {
      toast.error(`Akses ditolak: Role ${user?.role} tidak memiliki hak untuk menghapus post milik pengguna lain.`);
      return;
    }
    if (window.confirm(`Apakah Anda yakin ingin menghapus post "${post.title}"?`)) {
      deleteMutation.mutate(post.id);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingPost(null);
    form.reset();
  };

  const onSubmit = (formData: PostInput) => {
    if (editingPost) {
      updateMutation.mutate({ id: editingPost.id, data: formData });
    } else {
      createMutation.mutate(formData);
    }
  };

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: '700' }}>Posts Management</h1>
          <p style={{ color: 'var(--text-muted)' }}>Manage blog posts and articles</p>
        </div>
        <button onClick={openCreateModal} className="btn btn-primary">
          <Plus size={18} /> Create Post
        </button>
      </div>

      {/* Search & Filters */}
      <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: '400px' }}>
          <Search size={18} style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }} />
          <input
            type="text"
            placeholder="Search posts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="form-input"
            style={{ width: '100%', paddingLeft: '2.5rem' }}
          />
        </div>
      </div>

      {/* Grid view of Posts */}
      {isLoading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>Loading posts...</div>
      ) : data?.data.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }} className="glass-panel">
          No posts found. Create your first post!
        </div>
      ) : (
        <div className="card-grid">
          {data?.data.map((post) => {
            const canEdit = post.user_id === user?.id || isSuperAdmin();
            const canDelete = post.user_id === user?.id || isAdmin() || isSuperAdmin();

            return (
              <div key={post.id} className="card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                  <span className={`badge badge-${post.status}`}>{post.status}</span>
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      onClick={() => openEditModal(post)}
                      disabled={!canEdit}
                      title={canEdit ? 'Edit Post' : `Role ${user?.role} tidak dapat mengedit post pengguna lain`}
                      style={{
                        background: 'none',
                        color: canEdit ? 'var(--text-muted)' : '#64748b',
                        opacity: canEdit ? 1 : 0.4,
                        cursor: canEdit ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Edit2 size={16} />
                    </button>
                    <button
                      onClick={() => handleDeletePost(post)}
                      disabled={!canDelete}
                      title={canDelete ? 'Delete Post' : `Role ${user?.role} tidak dapat menghapus post pengguna lain`}
                      style={{
                        background: 'none',
                        color: canDelete ? 'var(--danger)' : '#64748b',
                        opacity: canDelete ? 1 : 0.4,
                        cursor: canDelete ? 'pointer' : 'not-allowed',
                      }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                <h3 style={{ fontSize: '1.1rem', fontWeight: '600', marginBottom: '0.5rem' }}>{post.title}</h3>
                <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '1rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {post.content}
                </p>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem', display: 'flex', justifyContent: 'space-between' }}>
                  <span>Author: {post.author?.name || 'Unknown'}</span>
                  <span>{post.created_at.split(' ')[0]}</span>
                </div>
              </div>
            );
          })}
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

      {/* Modal Form */}
      {isModalOpen && (
        <div style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-panel" style={{ width: '100%', maxWidth: '500px', padding: '2rem', background: 'var(--bg-secondary)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: '600' }}>{editingPost ? 'Edit Post' : 'Create New Post'}</h2>
              <button onClick={closeModal} style={{ background: 'none', color: 'var(--text-muted)' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={form.handleSubmit(onSubmit)}>
              <div className="form-group">
                <label className="form-label">Title</label>
                <input {...form.register('title')} placeholder="Post title..." className="form-input" />
                {form.formState.errors.title && <span className="form-error">{form.formState.errors.title.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Content</label>
                <textarea {...form.register('content')} rows={5} placeholder="Write post content..." className="form-input" style={{ resize: 'vertical' }} />
                {form.formState.errors.content && <span className="form-error">{form.formState.errors.content.message}</span>}
              </div>

              <div className="form-group">
                <label className="form-label">Status</label>
                <select {...form.register('status')} className="form-input">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
                <button type="button" onClick={closeModal} className="btn btn-secondary">
                  Cancel
                </button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="btn btn-primary">
                  {editingPost ? 'Update Post' : 'Create Post'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
