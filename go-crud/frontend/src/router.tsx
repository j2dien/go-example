import React from 'react';
import {
  createRootRoute,
  createRoute,
  createRouter,
  redirect,
  Outlet,
} from '@tanstack/react-router';
import { useAuthStore } from './stores/authStore';
import { AuthPage } from './pages/AuthPage';
import { DashboardPage } from './pages/DashboardPage';
import { PostsPage } from './pages/PostsPage';
import { UsersPage } from './pages/UsersPage';
import { Sidebar } from './components/layout/Sidebar';

// Root route
export const rootRoute = createRootRoute({
  component: () => (
    <>
      <Outlet />
    </>
  ),
});

// Index route (/)
export const indexRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/admin/dashboard' });
    } else {
      throw redirect({ to: '/login' });
    }
  },
});

// Login route (/login)
export const loginRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: '/login',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (isAuthenticated) {
      throw redirect({ to: '/admin/dashboard' });
    }
  },
  component: AuthPage,
});

// Admin layout component
const AdminLayout = () => {
  return (
    <div className="app-container">
      <Sidebar />
      <main className="main-content">
        <Outlet />
      </main>
    </div>
  );
};

// Admin layout route (/admin)
export const adminRoute = createRoute({
  getParentRoute: () => rootRoute,
  path: 'admin',
  beforeLoad: () => {
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      throw redirect({ to: '/login' });
    }
  },
  component: AdminLayout,
});

// Dashboard route (/admin/dashboard)
export const dashboardRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'dashboard',
  component: DashboardPage,
});

// Posts route (/admin/posts)
export const postsRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'posts',
  component: PostsPage,
});

// Users route (/admin/users)
export const usersRoute = createRoute({
  getParentRoute: () => adminRoute,
  path: 'users',
  component: UsersPage,
});

// Create route tree
const routeTree = rootRoute.addChildren([
  indexRoute,
  loginRoute,
  adminRoute.addChildren([
    dashboardRoute,
    postsRoute,
    usersRoute,
  ]),
]);

// Create router
export const router = createRouter({
  routeTree,
});

// Register router for type safety
declare module '@tanstack/react-router' {
  interface Register {
    router: typeof router;
  }
}
