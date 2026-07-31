import React, { useState, useEffect } from 'react';
import { useAuthStore } from './stores/authStore';
import { AuthPage } from './pages/AuthPage';
import { Sidebar } from './components/layout/Sidebar';
import { DashboardPage } from './pages/DashboardPage';
import { PostsPage } from './pages/PostsPage';
import { UsersPage } from './pages/UsersPage';
import { QueryProvider } from './providers/QueryProvider';

interface MainLayoutProps {
  currentPathname: string;
  setPathname: (path: string) => void;
}

const MainLayout: React.FC<MainLayoutProps> = ({ currentPathname, setPathname }) => {
  const [currentTab, setCurrentTab] = useState(() => {
    if (currentPathname === '/admin/posts') return 'posts';
    if (currentPathname === '/admin/users') return 'users';
    return 'dashboard';
  });

  // Sync tab state when the pathname updates (e.g. through back/forward buttons)
  useEffect(() => {
    if (currentPathname === '/admin/posts') {
      setCurrentTab('posts');
    } else if (currentPathname === '/admin/users') {
      setCurrentTab('users');
    } else {
      setCurrentTab('dashboard');
    }
  }, [currentPathname]);

  const handleTabChange = (tab: string) => {
    setCurrentTab(tab);
    const newPath = tab === 'dashboard' ? '/admin/dashboard' : `/admin/${tab}`;
    window.history.pushState(null, '', newPath);
    setPathname(newPath);
  };

  return (
    <div className="app-container">
      <Sidebar currentTab={currentTab} setCurrentTab={handleTabChange} />
      <main className="main-content">
        {currentTab === 'dashboard' && <DashboardPage />}
        {currentTab === 'posts' && <PostsPage />}
        {currentTab === 'users' && <UsersPage />}
      </main>
    </div>
  );
};

export function App() {
  const { isAuthenticated } = useAuthStore();
  const [pathname, setPathname] = useState(window.location.pathname);

  // Synchronize internal path state with browser history (back/forward)
  useEffect(() => {
    const handlePopState = () => {
      setPathname(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Handle routing redirects based on authentication status and path
  useEffect(() => {
    if (!isAuthenticated) {
      // If NOT logged in and attempting to access an admin page or the root, redirect to /login
      if (pathname.startsWith('/admin') || pathname === '/') {
        window.history.replaceState(null, '', '/login');
        setPathname('/login');
      }
    } else {
      // If logged in and on the login/root path, redirect to /admin/dashboard
      if (pathname === '/login' || pathname === '/') {
        window.history.replaceState(null, '', '/admin/dashboard');
        setPathname('/admin/dashboard');
      }
    }
  }, [isAuthenticated, pathname]);

  return (
    <QueryProvider>
      {isAuthenticated ? (
        <MainLayout currentPathname={pathname} setPathname={setPathname} />
      ) : (
        <AuthPage />
      )}
    </QueryProvider>
  );
}

export default App;
