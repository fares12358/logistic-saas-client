'use client';

import { useState } from 'react';
import toast from 'react-hot-toast';
import { exportService } from '@/services/export.service';
import { downloadFile, exportFilename } from '@/utils/exportHelper';
import PageHeader from '@/components/ui/PageHeader';

const MODULES = [
  { key: 'vessels',        label: 'Vessels',          icon: '🚢' },
  { key: 'agents',         label: 'Agents',           icon: '👥' },
  { key: 'containerTypes', label: 'Container Types',  icon: '📦' },
  { key: 'expenseTypes',   label: 'Expense Types',    icon: '🏷️' },
  { key: 'services',       label: 'Services',         icon: '🔄' },
  { key: 'rounds',         label: 'Rounds',           icon: '⏱️' },
  { key: 'voyages',        label: 'Voyages',          icon: '⚡' },
  { key: 'bookings',       label: 'Bookings',         icon: '📋' },
  { key: 'expenses',       label: 'Expenses',         icon: '💰' },
  { key: 'invoices',       label: 'Invoices',         icon: '🧾' },
  { key: 'tracking',       label: 'Tracking History', icon: '📍' },
  { key: 'auditLogs',      label: 'Audit Logs',       icon: '📜' },
];

export default function ExportPanel() {
  const [selected,  setSelected]  = useState(new Set());
  const [dateFrom,  setDateFrom]  = useState('');
  const [dateTo,    setDateTo]    = useState('');
  const [loading,   setLoading]   = useState(false);

  const toggle = (key) =>
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });

  const toggleAll = () =>
    setSelected(prev => prev.size === MODULES.length ? new Set() : new Set(MODULES.map(m => m.key)));

  const handleExport = async () => {
    if (selected.size === 0) return toast.error('Select at least one module');

    setLoading(true);
    const filters = {};
    if (dateFrom) filters.dateFrom = dateFrom;
    if (dateTo)   filters.dateTo   = dateTo;

    const exports = [...selected].map(module => ({ module, filters, selectedIds: [] }));

    try {
      if (exports.length === 1) {
        // Single module → Excel
        const res = await exportService.exportExcel({ module: exports[0].module, filters, selectedIds: [] });
        downloadFile(res.data, exportFilename(exports[0].module));
        toast.success('Excel downloaded');
      } else {
        // Multiple modules → ZIP
        const res = await exportService.exportZip(exports);
        downloadFile(res.data, exportFilename('logistics-bulk', 'zip'));
        toast.success(`ZIP downloaded — ${exports.length} modules`);
      }
    } catch (e) {
      toast.error(e.response?.data?.message || 'Export failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-fadeIn max-w-3xl">
      <PageHeader
        title="Bulk Export"
        subtitle="Select one or more modules to download as Excel or ZIP"
      />

      {/* Module grid */}
      <div className="card p-5 mb-4">
        <div className="flex items-center justify-between mb-4">
          <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest">Select Modules</p>
          <button
            onClick={toggleAll}
            className="text-xs font-medium text-teal-600 hover:text-teal-800 transition"
          >
            {selected.size === MODULES.length ? 'Deselect All' : 'Select All'}
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {MODULES.map(m => {
            const active = selected.has(m.key);
            return (
              <button
                key={m.key}
                onClick={() => toggle(m.key)}
                className={`flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  active
                    ? 'bg-teal-50 border-teal-300 text-teal-700'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <span className="text-base leading-none">{m.icon}</span>
                <span className="text-[13px]">{m.label}</span>
                {active && (
                  <svg className="ml-auto w-3.5 h-3.5 text-teal-600 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
                    <path strokeLinecap="round" d="M5 13l4 4L19 7"/>
                  </svg>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Optional date filter */}
      <div className="card p-5 mb-5">
        <p className="text-[11px] font-bold text-gray-400 uppercase tracking-widest mb-3">Date Range Filter (optional)</p>
        <p className="text-xs text-gray-400 mb-3">Applied to modules that support date filtering (expenses, invoices, rounds, etc.)</p>
        <div className="flex flex-wrap gap-3 items-center">
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-teal-500" />
          </div>
          <div>
            <label className="block text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-1">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="text-[13px] border border-gray-200 rounded-lg px-3 py-2 bg-white focus:outline-none focus:border-teal-500" />
          </div>
        </div>
      </div>

      {/* Summary + action */}
      <div className="flex items-center justify-between bg-gray-50 border border-gray-200 rounded-xl px-5 py-4">
        <div>
          {selected.size === 0 ? (
            <p className="text-sm text-gray-400">No modules selected</p>
          ) : (
            <>
              <p className="text-sm font-semibold text-gray-700">
                {selected.size} module{selected.size !== 1 ? 's' : ''} selected
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                {selected.size === 1 ? 'Will download as Excel (.xlsx)' : 'Will download as ZIP with one Excel per module'}
              </p>
            </>
          )}
        </div>

        <button
          onClick={handleExport}
          disabled={loading || selected.size === 0}
          className="btn btn-primary btn-md flex items-center gap-2"
        >
          {loading ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"/>
              </svg>
              Preparing…
            </>
          ) : (
            <>
              <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"/>
              </svg>
              {selected.size > 1 ? 'Download ZIP' : 'Download Excel'}
            </>
          )}
        </button>
      </div>

      {selected.size > 5 && (
        <p className="text-xs text-amber-500 mt-3 text-center">
          ⚠ Exporting many large modules may take a moment to prepare.
        </p>
      )}
    </div>
  );
}
