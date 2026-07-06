'use client';

import { usePathname } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';

// derive page title from pathname
const getTitle = (pathname) => {
  const map = {
    '/dashboard':       'Dashboard',
    '/vessels':         'Vessels',
    '/agents':          'Agents',
    '/locations':       'Locations',
    '/container-types': 'Container Types',
    '/expense-types':   'Expense Types',
    '/services':        'Services',
    '/rounds':          'Rounds',
    '/voyages':         'Voyages',
    '/bookings':        'Bookings',
    '/expenses':        'Expenses',
    '/invoices':        'Invoices',
    '/tracking':        'Vessel Tracking',
    '/reports':         'Reports',
    '/export':          'Export',
    '/users':           'Users',
    '/roles':           'Roles & Permissions',
    '/audit-logs':      'Audit Log',
  };
  for (const [key, val] of Object.entries(map)) {
    if (pathname === key || pathname.startsWith(key + '/')) return val;
  }
  return 'Logistics SaaS';
};

export default function Header() {
  const { user } = useAuth();
  const pathname  = usePathname();
  const title     = getTitle(pathname);

  return (
    <header style={{
      height: 56,
      background: 'var(--card)',
      borderBottom: '1px solid var(--border)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0,
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-primary)' }}>
          {title}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {/* Role pill */}
        <span style={{
          fontSize: 11, fontWeight: 500,
          background: 'var(--teal-light)',
          color: 'var(--teal-dark)',
          padding: '3px 10px', borderRadius: 99,
        }}>
          {user?.roleId?.name || 'User'}
        </span>

        {/* Avatar */}
        <div style={{
          width: 32, height: 32, borderRadius: 8,
          background: 'linear-gradient(135deg, var(--teal) 0%, var(--teal-dark) 100%)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 13, fontWeight: 700, color: '#fff', flexShrink: 0,
          boxShadow: '0 1px 4px rgba(13,148,136,0.3)',
        }}>
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
      </div>
    </header>
  );
}
