'use client';
import axios from 'axios';
import { X } from 'lucide-react';

// Same-origin client: requests hit this app's own /api/accounting/* proxy
// route, which forwards server-side to the backend. Direct cross-origin calls
// to the API host fail on some mobile browsers ("Load failed") — every other
// feature in this app proxies the same way.
export const api = axios.create({
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('token') || sessionStorage.getItem('token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Who is logged in (role-based UI gating)
export function getUserRole() {
  if (typeof window === 'undefined') return null;
  try {
    const raw = localStorage.getItem('user') || sessionStorage.getItem('user');
    return raw ? JSON.parse(raw)?.role?.toLowerCase() ?? null : null;
  } catch {
    return null;
  }
}

export function fmt(n) {
  return Number(n || 0).toLocaleString('en-NG', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function fmtDate(d) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-NG', { day: 'numeric', month: 'short', year: 'numeric' });
}

/**
 * Tiny explanatory text for users who are new to accounting — every feature
 * page carries one of these so nothing needs outside knowledge.
 */
export function Hint({ children }) {
  return (
    <div className="flex gap-2 items-start bg-blue-50/70 dark:bg-gray-800/60 border border-blue-100 dark:border-gray-700 rounded-lg px-3 py-2 mb-4">
      <span className="text-blue-400 text-xs leading-4 mt-0.5">ⓘ</span>
      <p className="text-[11px] leading-4 text-gray-600 dark:text-gray-300">{children}</p>
    </div>
  );
}

export function Card({ title, subtitle, actions, children, className = '' }) {
  return (
    <div className={`bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 ${className}`}>
      {(title || actions) && (
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100 dark:border-gray-800">
          <div>
            <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
            {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
          </div>
          {actions && <div className="flex items-center gap-2">{actions}</div>}
        </div>
      )}
      <div className="p-4">{children}</div>
    </div>
  );
}

export function Modal({ title, onClose, children, wide = false }) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 p-0 sm:p-4 overflow-y-auto"
      onClick={onClose}
    >
      <div
        className={`bg-white dark:bg-gray-900 rounded-t-2xl sm:rounded-xl shadow-xl w-full ${wide ? 'sm:max-w-3xl' : 'sm:max-w-lg'} max-h-[92vh] sm:max-h-[90vh] overflow-y-auto`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-3 border-b border-gray-100 dark:border-gray-800 sticky top-0 bg-white dark:bg-gray-900 z-10">
          <h3 className="font-semibold text-gray-800 dark:text-gray-100">{title}</h3>
          <button onClick={onClose} className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800">
            <X size={18} />
          </button>
        </div>
        <div className="p-4 sm:p-5">{children}</div>
      </div>
    </div>
  );
}

export function Field({ label, children, hint }) {
  return (
    <label className="block mb-3 min-w-0">
      <span className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">{label}</span>
      {children}
      {hint && <span className="block text-xs text-gray-400 mt-0.5">{hint}</span>}
    </label>
  );
}

export const inputCls =
  'w-full min-w-0 max-w-full border border-gray-200 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500';

export function Btn({ children, onClick, variant = 'primary', disabled, type = 'button', small }) {
  const base = `inline-flex items-center gap-1.5 rounded-lg font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${small ? 'px-2.5 py-1.5 text-xs' : 'px-4 py-2 text-sm'}`;
  const variants = {
    primary: 'bg-blue-600 text-white hover:bg-blue-700',
    secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-200 dark:hover:bg-gray-700',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
    outline: 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-800',
  };
  return (
    <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]}`}>
      {children}
    </button>
  );
}

const STATUS_COLORS = {
  // generic
  draft: 'bg-gray-100 text-gray-600', posted: 'bg-emerald-50 text-emerald-700',
  pending_approval: 'bg-amber-50 text-amber-700', approved: 'bg-blue-50 text-blue-700',
  rejected: 'bg-red-50 text-red-600', reversed: 'bg-purple-50 text-purple-600',
  // AP/AR
  booked: 'bg-blue-50 text-blue-700', partially_paid: 'bg-amber-50 text-amber-700',
  paid: 'bg-emerald-50 text-emerald-700', void: 'bg-gray-100 text-gray-500',
  sent: 'bg-blue-50 text-blue-700', overdue: 'bg-red-50 text-red-600',
  matched: 'bg-emerald-50 text-emerald-700', unmatched: 'bg-gray-100 text-gray-600',
  variance: 'bg-red-50 text-red-600',
  executed: 'bg-emerald-50 text-emerald-700', cancelled: 'bg-gray-100 text-gray-500',
  open: 'bg-blue-50 text-blue-700', applied: 'bg-emerald-50 text-emerald-700',
  // periods
  soft_closed: 'bg-amber-50 text-amber-700', hard_closed: 'bg-red-50 text-red-600',
  // bank rec
  matching: 'bg-amber-50 text-amber-700', completed: 'bg-emerald-50 text-emerald-700',
  importing: 'bg-gray-100 text-gray-600',
  // assets
  active: 'bg-emerald-50 text-emerald-700', disposed: 'bg-gray-100 text-gray-500',
  fully_depreciated: 'bg-amber-50 text-amber-700',
};

export function StatusBadge({ status }) {
  const cls = STATUS_COLORS[status] || 'bg-gray-100 text-gray-600';
  return (
    <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${cls}`}>
      {String(status || '').replace(/_/g, ' ')}
    </span>
  );
}

export function Table({ headers, children, empty }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="text-left text-xs uppercase text-gray-400 border-b border-gray-100 dark:border-gray-800">
            {headers.map((h, i) => (
              <th key={i} className={`py-2 pr-3 font-medium ${h.right ? 'text-right' : ''}`}>
                {h.label ?? h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50 dark:divide-gray-800">{children}</tbody>
      </table>
      {empty && <p className="text-center text-sm text-gray-400 py-8">{empty}</p>}
    </div>
  );
}

export function MetricCard({ label, value, sub, accent = 'text-gray-800' }) {
  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4">
      <p className="text-xs text-gray-400 uppercase tracking-wide">{label}</p>
      <p className={`text-xl font-bold mt-1 dark:text-gray-100 ${accent}`}>{value}</p>
      {sub && <p className="text-xs text-gray-400 mt-0.5">{sub}</p>}
    </div>
  );
}

export function downloadBlob(content, filename, mime = 'text/csv') {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportRowsAsCsv(headers, rows, filename) {
  const esc = (v) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const csv = [headers.join(','), ...rows.map((r) => r.map(esc).join(','))].join('\n');
  downloadBlob(csv, filename);
}
