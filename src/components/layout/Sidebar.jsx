'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { usePermission } from '../../context/PermissionContext';
import { useAuth } from '../../context/AuthContext';

const NAV = [
  { section: 'Main', items: [
    { label: 'Dashboard', href: '/dashboard', module: null },
  ]},
  { section: 'Operations', items: [
    { label: 'Rounds',   href: '/rounds',   module: 'rounds' },
    { label: 'Voyages',  href: '/voyages',  module: 'voyages' },
    { label: 'Bookings', href: '/bookings', module: 'bookings' },
    { label: 'Expenses', href: '/expenses', module: 'expenses' },
    { label: 'Invoices', href: '/invoices', module: 'invoices' },
    { label: 'Tracking', href: '/tracking', module: 'tracking' },
  ]},
  { section: 'Masters', items: [
    { label: 'Vessels',         href: '/vessels',         module: 'vessels' },
    { label: 'Agents',          href: '/agents',          module: 'agents' },
    { label: 'Locations',       href: '/locations',       module: 'locations' },
    { label: 'Container Types', href: '/container-types', module: 'containerTypes' },
    { label: 'Expense Types',   href: '/expense-types',   module: 'expenseTypes' },
    { label: 'Services',        href: '/services',        module: 'services' },
  ]},
  { section: 'Analytics', items: [
    { label: 'Reports', href: '/reports', module: 'reports' },
    { label: 'Export',  href: '/export',  module: 'export' },
  ]},
  { section: 'Administration', items: [
    { label: 'Users',     href: '/users',      module: 'users' },
    { label: 'Roles',     href: '/roles',      module: 'roles' },
    { label: 'Audit Log', href: '/audit-logs', module: 'auditLogs' },
  ]},
];

export default function Sidebar() {
  const pathname    = usePathname();
  const { isHidden } = usePermission();
  const { user, logout } = useAuth();

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col h-screen flex-shrink-0 ">
      {/* Logo */}
      <div className="px-6 py-5 border-b border-slate-700">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
            <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">Logistics SaaS</h1>
            <p className="text-xs text-slate-400">Operations Platform</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-5 hide_Scollbar">
        {NAV.map(({ section, items }) => (
          <div key={section}>
            <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider px-3 mb-1">
              {section}
            </p>
            {items.map(({ label, href, module }) => {
              if (module && isHidden(module)) return null;
              const active = pathname === href || (href !== '/dashboard' && pathname.startsWith(href));
              return (
                <Link key={href} href={href}
                  className={`flex items-center px-3 py-2 text-sm rounded-lg mb-0.5 transition-colors
                    ${active
                      ? 'bg-blue-600 text-white font-medium'
                      : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                    }`}>
                  {label}
                </Link>
              );
            })}
          </div>
        ))}
      </nav>

      {/* User footer */}
      <div className="px-4 py-4 border-t border-slate-700">
        <div className="flex items-center gap-3 mb-3">
          <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
            {user?.name?.[0]?.toUpperCase() || 'U'}
          </div>
          <div className="overflow-hidden">
            <p className="text-sm font-medium text-white truncate">{user?.name}</p>
            <p className="text-xs text-slate-400 truncate">{user?.roleId?.name || 'User'}</p>
          </div>
        </div>
        <button
          onClick={logout}
          className="w-full text-left text-xs text-slate-400 hover:text-red-400 transition-colors py-1">
          Sign out →
        </button>
      </div>
    </aside>
  );
}
