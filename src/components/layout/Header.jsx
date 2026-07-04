'use client';

import { useAuth } from '../../context/AuthContext';

export default function Header({ title }) {
  const { user } = useAuth();
  return (
    <header className="h-14 bg-white border-b border-gray-200 flex items-center justify-between px-6 flex-shrink-0">
      <h2 className="text-sm font-medium text-gray-600">{title || 'Dashboard'}</h2>
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-semibold">
          {user?.name?.[0]?.toUpperCase() || 'U'}
        </div>
        <span className="text-sm text-gray-700 font-medium">{user?.name}</span>
      </div>
    </header>
  );
}
