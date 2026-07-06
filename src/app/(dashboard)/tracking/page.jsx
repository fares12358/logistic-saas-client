'use client';

import { useState } from 'react';
import PageHeader          from '@/components/ui/PageHeader';
import TrackingForm        from '@/modules/tracking/TrackingForm';
import TrackingHistoryTable from '@/modules/tracking/TrackingHistoryTable';

export default function TrackingPage() {
  const [activeVoyageId, setActiveVoyageId] = useState('');
  const [refreshKey,     setRefreshKey]     = useState(0);

  const handleEntryAdded = (voyageId) => {
    setActiveVoyageId(voyageId);
    setRefreshKey(k => k + 1);
  };

  return (
    <div className="animate-fadeIn">
      <PageHeader
        title="Vessel Tracking"
        subtitle="Record immutable position updates — history is append-only"
      />

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5 mt-2">

        {/* ── Form (left / top on mobile) ─────────────────────────────────── */}
        <div className="lg:col-span-2">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-teal-600">
                  <path strokeLinecap="round" d="M17.657 16.657L13.414 20.9a2 2 0 01-2.828 0l-4.243-4.243a8 8 0 1111.314 0z"/>
                  <circle cx="12" cy="11" r="3"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">New Position Update</h2>
                <p className="text-xs text-gray-400">Each save creates a new immutable record</p>
              </div>
            </div>
            <TrackingForm onEntryAdded={handleEntryAdded} />
          </div>
        </div>

        {/* ── History (right / bottom on mobile) ──────────────────────────── */}
        <div className="lg:col-span-3">
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-5 pb-4 border-b border-gray-100">
              <div className="w-8 h-8 rounded-lg bg-gray-50 border border-gray-200 flex items-center justify-center flex-shrink-0">
                <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2" className="text-gray-500">
                  <path strokeLinecap="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
                </svg>
              </div>
              <div>
                <h2 className="text-sm font-semibold text-gray-800">Position History</h2>
                <p className="text-xs text-gray-400">
                  {activeVoyageId
                    ? 'Showing history for selected voyage — most recent first'
                    : 'Select a voyage in the form to view its history'}
                </p>
              </div>
            </div>
            <TrackingHistoryTable voyageId={activeVoyageId} refreshKey={refreshKey} />
          </div>
        </div>
      </div>
    </div>
  );
}
