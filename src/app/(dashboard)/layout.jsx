'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { usePermission } from '@/context/PermissionContext';
import Sidebar from '@/components/layout/Sidebar';
import Header from '@/components/layout/Header';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

// Ordered list of fallback routes for non-SuperAdmin users.
// First route where can(module,'read') is true becomes the landing page.
const FALLBACK_NAV = [
  { href: '/rounds',          module: 'rounds' },
  { href: '/voyages',         module: 'voyages' },
  { href: '/bookings',        module: 'bookings' },
  { href: '/tracking',        module: 'tracking' },
  { href: '/expenses',        module: 'expenses' },
  { href: '/invoices',        module: 'invoices' },
  { href: '/vessels',         module: 'vessels' },
  { href: '/agents',          module: 'agents' },
  { href: '/services',        module: 'services' },
  { href: '/reports',         module: 'reports' },
  { href: '/export',          module: 'export' },
  { href: '/locations',       module: 'locations' },
  { href: '/container-types', module: 'containerTypes' },
  { href: '/expense-types',   module: 'expenseTypes' },
  { href: '/users',           module: 'users' },
  { href: '/roles',           module: 'roles' },
];

export default function DashboardLayout({ children }) {
  const { isAuthenticated, isLoading, user } = useAuth();
  const { can, isHidden, permissionsLoaded } = usePermission();
  const router = useRouter();

  const isSuperAdmin = user?.roleId?.isSystem === true;

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace('/login');
      return;
    }

    // Once permissions are loaded, redirect non-SuperAdmin away from /dashboard
    const pathname = typeof window !== 'undefined' ? window.location.pathname : '';
    const isOnDashboard = pathname === '/dashboard' || pathname.startsWith('/dashboard/');

    if (
      !isLoading &&
      isAuthenticated &&
      !isSuperAdmin &&
      permissionsLoaded &&
      isOnDashboard
    ) {
      const firstAllowed = FALLBACK_NAV.find(
        ({ module }) => !isHidden(module) && can(module, 'read')
      );
      if (firstAllowed) {
        router.replace(firstAllowed.href);
      }
    }
  }, [isLoading, isAuthenticated, isSuperAdmin, permissionsLoaded]);

  if (isLoading || (!isSuperAdmin && !permissionsLoaded && isAuthenticated)) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--surface)' }}>
        <LoadingSpinner />
      </div>
    );
  }

  if (!isAuthenticated) return null;

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--surface)', overflow: 'clip' }}>
      <Sidebar />
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'clip' }}>
        <Header />
        <main style={{ flex: 1, overflowY: 'auto', padding: 24 }}>
          {children}
        </main>
      </div>
    </div>
  );
}
