import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, registerSchema, LoginInput, RegisterInput } from '../lib/schemas';
import { authApi } from '../api/endpoints';
import { useAuthStore } from '../stores/authStore';
import { Lock, Mail, User as UserIcon, Sparkles } from 'lucide-react';

export const AuthPage: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore((state: any) => state.setAuth);

  const loginForm = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const registerForm = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
  });

  const onLoginSubmit = async (data: LoginInput) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await authApi.login(data);
      setAuth(res.user, res.access_token, res.refresh_token);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
  };

  const onRegisterSubmit = async (data: RegisterInput) => {
    try {
      setLoading(true);
      setErrorMsg('');
      const res = await authApi.register(data);
      setAuth(res.user, res.access_token, res.refresh_token);
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Registration failed.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: 'radial-gradient(circle at top right, #1e1b4b, #0f172a)',
      }}
    >
      <div className="glass-panel" style={{ width: '100%', maxWidth: '420px', padding: '2.5rem' }}>
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div
            style={{
              display: 'inline-flex',
              padding: '0.75rem',
              borderRadius: '12px',
              background: 'var(--accent-gradient)',
              marginBottom: '1rem',
            }}
          >
            <Sparkles size={28} color="white" />
          </div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: '700' }}>
            {isLogin ? 'Welcome Back' : 'Create Account'}
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
            {isLogin ? 'Sign in to access your dashboard' : 'Join us to get started'}
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'rgba(239, 68, 68, 0.15)',
              border: '1px solid var(--danger)',
              color: 'var(--danger)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.875rem',
              marginBottom: '1.5rem',
              textAlign: 'center',
            }}
          >
            {errorMsg}
          </div>
        )}

        {isLogin ? (
          <form onSubmit={loginForm.handleSubmit(onLoginSubmit)}>
            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
                />
                <input
                  {...loginForm.register('email')}
                  type="email"
                  placeholder="admin@example.com"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
              {loginForm.formState.errors.email && (
                <span className="form-error">{loginForm.formState.errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
                />
                <input
                  {...loginForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
              {loginForm.formState.errors.password && (
                <span className="form-error">{loginForm.formState.errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.8rem' }}
            >
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        ) : (
          <form onSubmit={registerForm.handleSubmit(onRegisterSubmit)}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <UserIcon
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
                />
                <input
                  {...registerForm.register('name')}
                  type="text"
                  placeholder="John Doe"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
              {registerForm.formState.errors.name && (
                <span className="form-error">{registerForm.formState.errors.name.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Email</label>
              <div style={{ position: 'relative' }}>
                <Mail
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
                />
                <input
                  {...registerForm.register('email')}
                  type="email"
                  placeholder="user@example.com"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
              {registerForm.formState.errors.email && (
                <span className="form-error">{registerForm.formState.errors.email.message}</span>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <div style={{ position: 'relative' }}>
                <Lock
                  size={18}
                  style={{ position: 'absolute', left: '12px', top: '12px', color: 'var(--text-muted)' }}
                />
                <input
                  {...registerForm.register('password')}
                  type="password"
                  placeholder="••••••••"
                  className="form-input"
                  style={{ width: '100%', paddingLeft: '2.5rem' }}
                />
              </div>
              {registerForm.formState.errors.password && (
                <span className="form-error">{registerForm.formState.errors.password.message}</span>
              )}
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center', marginTop: '1rem', padding: '0.8rem' }}
            >
              {loading ? 'Creating Account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div style={{ textAlign: 'center', marginTop: '1.5rem' }}>
          <button
            onClick={() => {
              setIsLogin(!isLogin);
              setErrorMsg('');
            }}
            style={{ background: 'none', color: 'var(--accent-primary)', fontSize: '0.875rem' }}
          >
            {isLogin ? "Don't have an account? Sign Up" : 'Already have an account? Sign In'}
          </button>
        </div>
      </div>
    </div>
  );
};
