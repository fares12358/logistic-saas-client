'use client';

import { QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import queryClient from '@/config/queryClient';
import { AuthProvider } from '@/context/AuthContext';
import { PermissionProvider } from '@/context/PermissionContext';

export default function Providers({ children }) {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <PermissionProvider>
          {children}
          <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
        </PermissionProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
