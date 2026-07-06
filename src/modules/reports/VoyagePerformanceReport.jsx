'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService }  from '@/services/reports.service';
import { servicesService } from '@/services/services.service';
import { roundsService }   from '@/services/rounds.service';
import { VOYAGE_STATUS }   from '@/utils/constants';
import ReportLayout        from './ReportLayout';
import { ReportStatCard, ReportEmptyState, rsc, fmtMoney, fmtNum } from './reportHelpers';
import LoadingSpinner from '@/components/ui/LoadingSpinner';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day:'2-digit', month:'short', year:'numeric' }) : '—';

export default function VoyagePerformanceReport() {
  const [serviceId, setServiceId] = useState('');
  const [roundId,   setRoundId]   = useState('');
  const [status,    setStatus]    = useState('');
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');
  const [run,       setRun]       = useState(false);

  const { data: svcData } = useQuery({ queryKey: ['services-active-dropdown'], queryFn: () => servicesService.listActive().then(r => r.data.data) });
  const { data: rdData }  = useQuery({ queryKey: ['rounds-dd'], queryFn: () => roundsService.list({ limit: 200 }).then(r => r.data.data) });
  const services = svcData || [];
  const rounds   = (rdData || []).filter(r => !serviceId || String(r.serviceId?._id || r.serviceId) === serviceId);

  const { data, isLoading } = useQuery({
    queryKey: ['report-voyage-perf', serviceId, roundId, status, dateFrom, dateTo],
    queryFn:  () => reportsService.getVoyagePerformance({ serviceId, roundId, status, dateFrom, dateTo }).then(r => r.data.data),
    enabled:  run,
  });

  const rows   = data?.rows    || [];
  const totals = data?.totals  || {};

  return (
    <ReportLayout
      title="Voyage Performance"
      subtitle="Booking counts, freight and slot utilisation per voyage"
      filters={
        <div className="flex flex-wrap gap-3 items-end">
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Service</p>
            <select value={serviceId} onChange={e => { setServiceId(e.target.value); setRoundId(''); }} className={rsc}>
              <option value="">All Services</option>
              {services.map(s => <option key={s._id} value={s._id}>{s.serviceCode}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Round</p>
            <select value={roundId} onChange={e => setRoundId(e.target.value)} className={rsc}>
              <option value="">All Rounds</option>
              {rounds.map(r => <option key={r._id} value={r._id}>{r.roundNumber}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">Status</p>
            <select value={status} onChange={e => setStatus(e.target.value)} className={rsc}>
              <option value="">All</option>
              {VOYAGE_STATUS.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">ETD From</p>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">ETD To</p>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-teal-500" />
          </div>
          <button onClick={() => setRun(true)} className="btn btn-primary btn-md">Run Report</button>
        </div>
      }
      summary={rows.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ReportStatCard label="Voyages"       value={fmtNum(rows.length)} />
          <ReportStatCard label="Total Bookings" value={fmtNum(totals.bookingCount)} />
          <ReportStatCard label="Total Freight"  value={fmtMoney(totals.totalFreight)} accent />
          <ReportStatCard label="Total Slots"    value={fmtNum(totals.totalSlots)} sub={`${fmtNum(totals.totalQty)} units`} />
        </div>
      )}
    >
      {isLoading ? <LoadingSpinner fullPage /> :
       !run ? (
        <div className="card flex items-center justify-center py-16 text-gray-400">
          <p className="text-sm">Set filters and click "Run Report".</p>
        </div>
       ) : rows.length === 0 ? <ReportEmptyState /> : (
        <div className="card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="table-header">
                  {['Voyage', 'Service', 'Round', 'POL', 'POD', 'ETD', 'ETA', 'Bookings', 'Slots', 'Freight', 'Status'].map(h => <th key={h}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {rows.map(r => (
                  <tr key={r._id} className="table-row">
                    <td><span className="mono text-xs font-bold text-teal-600">{r.voyageNumber}</span></td>
                    <td><span className="mono text-xs text-gray-500">{r.serviceCode}</span></td>
                    <td><span className="mono text-xs text-gray-500">{r.roundNumber}</span></td>
                    <td className="text-sm text-gray-700">{r.polName}</td>
                    <td className="text-sm text-gray-700">{r.podName}</td>
                    <td className="text-xs text-gray-500">{fmt(r.etd)}</td>
                    <td className="text-xs text-gray-500">{fmt(r.eta)}</td>
                    <td className="text-xs text-gray-600">{fmtNum(r.bookingCount)}</td>
                    <td className="text-xs text-gray-600">{fmtNum(r.totalSlots)}</td>
                    <td><span className="mono text-xs font-semibold text-teal-700">{fmtMoney(r.totalFreight)}</span></td>
                    <td><span className="text-xs text-gray-500">{r.status}</span></td>
                  </tr>
                ))}
                {/* Totals row */}
                <tr className="bg-gray-50 font-semibold border-t-2 border-gray-200">
                  <td colSpan={7} className="px-4 py-2 text-xs text-gray-500">TOTALS</td>
                  <td className="px-4 py-2 text-xs">{fmtNum(totals.bookingCount)}</td>
                  <td className="px-4 py-2 text-xs">{fmtNum(totals.totalSlots)}</td>
                  <td className="px-4 py-2 text-xs mono text-teal-700">{fmtMoney(totals.totalFreight)}</td>
                  <td />
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      )}
    </ReportLayout>
  );
}
