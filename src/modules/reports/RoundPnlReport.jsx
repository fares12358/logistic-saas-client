'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { reportsService } from '@/services/reports.service';
import { roundsService }  from '@/services/rounds.service';
import ReportLayout       from './ReportLayout';
import { ReportStatCard, ReportEmptyState, rsc, fmtMoney, fmtNum } from './reportHelpers';

const fmt = (d) => d ? new Date(d).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) : '—';

export default function RoundPnlReport() {
  const [roundId, setRoundId] = useState('');

  const { data: roundsData } = useQuery({
    queryKey: ['rounds-dd'],
    queryFn:  () => roundsService.list({ limit: 200 }).then(r => r.data.data),
  });
  const rounds = roundsData || [];

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['report-round-pnl', roundId],
    queryFn:  () => reportsService.getRoundPnL({ roundId }).then(r => r.data.data),
    enabled:  !!roundId,
  });

  const totalExpensesUSD = data?.expenseTotals?.USD ?? 0;
  const netPnL = (data?.totalRevenue ?? 0) - totalExpensesUSD;

  return (
    <ReportLayout
      title="Round P&L"
      subtitle="Revenue vs expenses for a single round"
      filters={
        <div className="flex flex-wrap gap-3 items-center">
          <select value={roundId} onChange={e => setRoundId(e.target.value)} className={rsc} style={{ minWidth: 200 }}>
            <option value="">Select a round…</option>
            {rounds.map(r => (
              <option key={r._id} value={r._id}>{r.roundNumber} — {r.serviceId?.serviceCode || ''}</option>
            ))}
          </select>
        </div>
      }
      summary={data && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <ReportStatCard label="Total Revenue"  value={fmtMoney(data.totalRevenue)}  accent />
          <ReportStatCard label="Total Expenses" value={fmtMoney(totalExpensesUSD)} sub="USD" />
          <ReportStatCard label="Net P&L"        value={fmtMoney(netPnL)} accent={netPnL >= 0} />
          <ReportStatCard label="Bookings"       value={fmtNum(data.bookingCount)} sub={`${data.voyageCount} voyages`} />
        </div>
      )}
    >
      {!roundId && (
        <div className="card flex items-center justify-center py-16 text-gray-400">
          <p className="text-sm">Select a round above to generate the P&L report.</p>
        </div>
      )}

      {roundId && isLoading && (
        <div className="card flex items-center justify-center py-12 text-gray-400">
          <svg className="animate-spin w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
          </svg>
          <span className="text-sm">Calculating…</span>
        </div>
      )}

      {data && (
        <>
          {/* Round info */}
          <div className="card p-5">
            <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Round Details</p>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
              {[
                { label: 'Round',   val: <span className="mono font-bold text-teal-600">{data.round.roundNumber}</span> },
                { label: 'Service', val: `${data.round.service?.serviceCode} — ${data.round.service?.serviceName}` },
                { label: 'Vessel',  val: `${data.round.vessel?.vesselCode} ${data.round.vessel?.vesselName}` },
                { label: 'Status',  val: data.round.status },
                { label: 'Start',   val: fmt(data.round.startDate) },
                { label: 'End',     val: fmt(data.round.endDate) },
                { label: 'Voyages', val: data.voyageCount },
                { label: 'Qty',     val: fmtNum(data.totalQuantity) },
              ].map(({ label, val }) => (
                <div key={label}>
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-0.5">{label}</p>
                  <p className="text-gray-700 font-medium">{val}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Expense breakdown */}
          {data.expenseBreakdown?.length > 0 ? (
            <div className="card overflow-hidden">
              <div className="px-5 py-4 border-b border-gray-100">
                <h3 className="text-sm font-semibold text-gray-700">Expense Breakdown</h3>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="table-header">
                      {['Category', 'Currency', 'Amount', 'Count'].map(h => <th key={h}>{h}</th>)}
                    </tr>
                  </thead>
                  <tbody>
                    {data.expenseBreakdown.map((e, i) => (
                      <tr key={i} className="table-row">
                        <td><span className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">{e.category}</span></td>
                        <td className="mono text-xs font-semibold text-gray-500">{e.currency}</td>
                        <td className="mono text-xs font-semibold text-red-600">{Number(e.total).toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="text-xs text-gray-500">{e.count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            <ReportEmptyState message="No expenses recorded for this round." />
          )}
        </>
      )}
    </ReportLayout>
  );
}
