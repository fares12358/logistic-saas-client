'use client';

import { useAuth } from '../../../context/AuthContext';
import PageHeader from '../../../components/ui/PageHeader';

const STAT_CARDS = [
  { label: 'Active Vessels',   color: 'text-blue-600' },
  { label: 'Active Rounds',    color: 'text-purple-600' },
  { label: 'Total Bookings',   color: 'text-green-600' },
  { label: 'Pending Invoices', color: 'text-yellow-600' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div>
      <PageHeader
        title={`Welcome back, ${user?.name?.split(' ')[0] || 'User'}`}
        subtitle="Here's an overview of your logistics operations"
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {STAT_CARDS.map(({ label, color }) => (
          <div key={label} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
            <p className="text-sm text-gray-500 mb-1">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>—</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Recent Activity</h3>
          <p className="text-sm text-gray-400">Activity feed will populate as operations are created.</p>
        </div>
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-sm font-semibold text-gray-700 mb-3">Quick Start</h3>
          <ul className="text-sm text-gray-500 space-y-2">
            <li>1. Add <a href="/vessels" className="text-blue-600 hover:underline">Vessels</a> and <a href="/agents" className="text-blue-600 hover:underline">Agents</a></li>
            <li>2. Set up <a href="/locations" className="text-blue-600 hover:underline">Locations</a> (Country → Port)</li>
            <li>3. Create a <a href="/services" className="text-blue-600 hover:underline">Service</a> with a Route</li>
            <li>4. Open a <a href="/rounds" className="text-blue-600 hover:underline">Round</a> → Voyages auto-generate</li>
            <li>5. Add <a href="/bookings" className="text-blue-600 hover:underline">Bookings</a> to voyages</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
