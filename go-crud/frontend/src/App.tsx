import React from 'react';
import { RouterProvider } from '@tanstack/react-router';
import { Toaster } from 'sonner';
import { router } from './router';
import { QueryProvider } from './providers/QueryProvider';

export function App() {
  return (
    <QueryProvider>
      <Toaster position="top-right" richColors />
      <RouterProvider router={router} />
    </QueryProvider>
  );
}

export default App;
