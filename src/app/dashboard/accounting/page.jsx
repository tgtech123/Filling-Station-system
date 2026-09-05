'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import Link from 'next/link';
import {
  BookOpen, FileText, Landmark, ReceiptText, Percent, CalendarCheck,
  Building2, BarChart3, RefreshCw,
} from 'lucide-react';
import {
  ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip,
  PieChart, Pie, Cell, BarChart, Bar,
} from 'recharts';
import { api, Card, MetricCard, Hint, fmt, getUserRole } from './shared';
import { extractApiError } from '@/lib/config';

const PIE_COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#84cc16'];

const MODULES = [
  { name: 'Chart of Accounts', href: '/dashboard/accounting/chart-of-accounts', icon: BookOpen, desc: 'GL accounts, hierarchy, import/export' },
  { name: 'Journal Entries', href: '/dashboard/accounting/journals', icon: FileText, desc: 'Manual journals, approvals, reversals' },
  { name: 'Payables (AP)', href: '/dashboard/accounting/payables', icon: ReceiptText, desc: '3-way matching, payment batches, EFT' },
  { name: 'Receivables (AR)', href: '/dashboard/accounting/receivables', icon: Landmark, desc: 'Invoicing, recurring billing, cash application' },
  { name: 'Bank Reconciliation', href: '/dashboard/accounting/bank-reconciliation', icon: RefreshCw, desc: 'Statement import and auto-matching' },
  { name: 'Tax Engine', href: '/dashboard/accounting/tax', icon: Percent, desc: 'VAT, WHT configuration and filings' },
  { name: 'Period Close', href: '/dashboard/accounting/periods', icon: CalendarCheck, desc: 'Sub-ledger close, depreciation, FX revaluation' },
  { name: 'Financial Reports', href: '/dashboard/accounting/reports', icon: BarChart3, desc: 'TB, balance sheet, P&L, cash flow, aging' },
];

export default function AccountingDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  // Managers see the overview only — the working modules belong to the accountant
  const [role, setRole] = useState(null);
  useEffect(() => { setRole(getUserRole()); }, []);

  const load = async () => {
    setLoading(true);
    setError('');
    try {
      const res = await api.get('/api/accounting/reports/dashboard');
      setData(res.data.data);
    } catch (e) {
      setError(extractApiError(e) || 'Failed to load dashboard');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const m = data?.metrics;

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Accounting</h1>
            <p className="text-sm text-gray-500">Executive financial overview</p>
          </div>
          <button onClick={load} className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800" title="Refresh">
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
        </div>

        <Hint>
          This overview summarises the station's financial health: what it owns and owes, this year's profit,
          and how quickly it can pay its bills. The numbers come from the accounting records below — they grow
          as invoices, payments and journal entries are recorded.
        </Hint>

        {error && (
          <div className="bg-red-50 text-red-700 text-sm rounded-lg p-3 mb-4">
            {error} — if this is your first visit, start by creating your accounts in <Link className="underline font-medium" href="/dashboard/accounting/chart-of-accounts">Chart of Accounts</Link>.
          </div>
        )}

        {m && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              <MetricCard label="Total Assets" value={`₦${fmt(m.totalAssets)}`} />
              <MetricCard label="Total Liabilities" value={`₦${fmt(m.totalLiabilities)}`} />
              <MetricCard label="Equity" value={`₦${fmt(m.totalEquity)}`} />
              <MetricCard
                label="YTD Net Income"
                value={`₦${fmt(m.netIncome)}`}
                accent={m.netIncome >= 0 ? 'text-emerald-600' : 'text-red-600'}
                sub={m.netMargin != null ? `${m.netMargin}% net margin` : undefined}
              />
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
              <MetricCard label="Current Ratio" value={m.currentRatio ?? '—'} sub="liquidity" />
              <MetricCard label="Debt / Equity" value={m.debtToEquity ?? '—'} sub="solvency" />
              <MetricCard label="Open Receivables" value={`₦${fmt(m.openReceivables)}`} />
              <MetricCard
                label="Open Payables" value={`₦${fmt(m.openPayables)}`}
                sub={m.pendingApprovals > 0 ? `${m.pendingApprovals} journal(s) awaiting approval` : undefined}
              />
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
              <Card title="Revenue vs Expenses" subtitle="last 12 months" className="lg:col-span-2">
                <ResponsiveContainer width="100%" height={240}>
                  <LineChart data={data.trend}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11 }} />
                    <YAxis tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <Tooltip formatter={(v) => `₦${fmt(v)}`} />
                    <Line type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} dot={false} name="Revenue" />
                    <Line type="monotone" dataKey="expenses" stroke="#ef4444" strokeWidth={2} dot={false} name="Expenses" />
                  </LineChart>
                </ResponsiveContainer>
              </Card>

              <Card title="Asset Allocation">
                {data.assetAllocation?.length ? (
                  <ResponsiveContainer width="100%" height={240}>
                    <PieChart>
                      <Pie data={data.assetAllocation} dataKey="value" nameKey="name" outerRadius={80} label={({ name }) => name.split(' ').slice(1).join(' ')}>
                        {data.assetAllocation.map((_, i) => (
                          <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(v) => `₦${fmt(v)}`} />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <p className="text-sm text-gray-400 text-center py-16">No asset balances yet</p>
                )}
              </Card>
            </div>

            {data.expenseBreakdown?.length > 0 && (
              <Card title="Expense Breakdown" subtitle="year to date" className="mb-6">
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={data.expenseBreakdown} layout="vertical" margin={{ left: 120 }}>
                    <XAxis type="number" tick={{ fontSize: 11 }} tickFormatter={(v) => `${(v / 1000).toFixed(0)}k`} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 11 }} width={120} />
                    <Tooltip formatter={(v) => `₦${fmt(v)}`} />
                    <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </>
        )}

        {role === 'accountant' && (
          <>
            <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-3">Modules</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MODULES.map((mod) => (
                <Link
                  key={mod.href}
                  href={mod.href}
                  className="bg-white dark:bg-gray-900 rounded-xl shadow-sm border border-gray-100 dark:border-gray-800 p-4 hover:shadow-md hover:border-blue-200 transition-all group"
                >
                  <mod.icon size={22} className="text-blue-500 mb-2 group-hover:scale-110 transition-transform" />
                  <p className="font-semibold text-sm text-gray-800 dark:text-gray-100">{mod.name}</p>
                  <p className="text-xs text-gray-400 mt-0.5">{mod.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </DashboardLayout>
  );
}
