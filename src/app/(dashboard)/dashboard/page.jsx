'use client';

import { useAuth } from '@/context/AuthContext';

const STAT_CARDS = [
  { label: 'Active Vessels',   value: '—', accent: 'var(--teal)',   bg: 'var(--teal-light)' },
  { label: 'Active Rounds',    value: '—', accent: '#6366F1',       bg: '#EEF2FF' },
  { label: 'Total Bookings',   value: '—', accent: 'var(--amber)',  bg: '#FEF3C7' },
  { label: 'Pending Invoices', value: '—', accent: '#EC4899',       bg: '#FCE7F3' },
];

const QUICK_START = [
  { step: '01', text: 'Add Vessels & Agents',                href: '/vessels',  link: 'Go to Vessels' },
  { step: '02', text: 'Set up Locations (Country → Port)',   href: '/locations', link: 'Go to Locations' },
  { step: '03', text: 'Create a Service with a Route',       href: '/services',  link: 'Go to Services' },
  { step: '04', text: 'Open a Round — voyages auto-generate',href: '/rounds',    link: 'Go to Rounds' },
  { step: '05', text: 'Add Bookings to voyages',             href: '/bookings',  link: 'Go to Bookings' },
];

export default function DashboardPage() {
  const { user } = useAuth();

  return (
    <div className="animate-fadeIn">
      {/* Welcome */}
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.3px', margin: 0 }}>
          Good day, {user?.name?.split(' ')[0] || 'there'} 👋
        </h1>
        <p style={{ fontSize: 13.5, color: 'var(--text-muted)', marginTop: 4 }}>
          Here's an overview of your shipping operations.
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        {STAT_CARDS.map(({ label, value, accent, bg }) => (
          <div key={label} className="stat-card">
            <p className="stat-label">{label}</p>
            <p className="stat-value" style={{ color: accent }}>{value}</p>
            <div style={{ height: 3, background: bg, borderRadius: 99, marginTop: 14 }}>
              <div style={{ width: '40%', height: '100%', background: accent, borderRadius: 99, opacity: 0.6 }} />
            </div>
          </div>
        ))}
      </div>

      {/* Bottom row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>

        {/* Quick start */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            Quick Start Guide
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {QUICK_START.map(({ step, text, href, link }) => (
              <div key={step} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{
                  fontSize: 10, fontWeight: 700, color: 'var(--teal)',
                  background: 'var(--teal-light)', borderRadius: 6,
                  padding: '2px 7px', flexShrink: 0, letterSpacing: '0.04em',
                }}>
                  {step}
                </span>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)', flex: 1 }}>{text}</span>
                <a href={href} style={{
                  fontSize: 12, color: 'var(--teal)', fontWeight: 500,
                  textDecoration: 'none', whiteSpace: 'nowrap', flexShrink: 0,
                }}>
                  {link} →
                </a>
              </div>
            ))}
          </div>
        </div>

        {/* System info */}
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', margin: '0 0 16px' }}>
            System Status
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {[
              { label: 'API Server',   status: 'Operational', ok: true },
              { label: 'Database',     status: 'Connected',   ok: true },
              { label: 'Email (SMTP)', status: 'Ready',       ok: true },
            ].map(({ label, status, ok }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{label}</span>
                <span style={{
                  fontSize: 11.5, fontWeight: 500,
                  color: ok ? '#065F46' : '#991B1B',
                  background: ok ? '#D1FAE5' : '#FEE2E2',
                  padding: '2px 9px', borderRadius: 99,
                }}>
                  {status}
                </span>
              </div>
            ))}
          </div>
          <div style={{ marginTop: 20, padding: 12, background: 'var(--surface)', borderRadius: 8, border: '1px solid var(--border)' }}>
            <p style={{ fontSize: 12, color: 'var(--text-muted)', margin: 0, lineHeight: 1.6 }}>
              Dashboard KPIs will populate with live data as operations are created.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
