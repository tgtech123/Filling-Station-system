"use client"
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  ResponsiveContainer, BarChart, LineChart, Bar, Line,
  XAxis, YAxis, CartesianGrid, Tooltip, Cell,
} from 'recharts';
import useTrendsStore from '@/store/useTrendsStore';

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtCurrency = (v) => {
  if (!v && v !== 0) return '₦0';
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${Number(v).toLocaleString('en-US')}`;
};

const fmtVolume = (v) => {
  if (!v && v !== 0) return '0L';
  if (v >= 1_000) return `${(v / 1_000).toFixed(0)}KL`;
  return `${Number(v).toLocaleString('en-US')}L`;
};

// ── Custom tooltips ───────────────────────────────────────────────────────────

const PaymentTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1">
      <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
      <p className="text-gray-600 dark:text-gray-300">Share: <span className="font-bold text-blue-600">{d?.percentage?.toFixed(1)}%</span></p>
      <p className="text-gray-600 dark:text-gray-300">Transactions: <span className="font-semibold">{d?.transactions}</span></p>
      <p className="text-gray-600 dark:text-gray-300">Amount: <span className="font-semibold">{fmtCurrency(d?.amount)}</span></p>
    </div>
  );
};

const CommissionTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  const d = payload[0]?.payload;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg px-4 py-3 text-xs space-y-1">
      <p className="font-semibold text-gray-800 dark:text-gray-200">{label}</p>
      <p className="text-gray-600 dark:text-gray-300">Commission: <span className="font-bold text-blue-600">{fmtCurrency(d?.commission)}</span></p>
      <p className="text-gray-600 dark:text-gray-300">Rate: <span className="font-semibold">{d?.rate}%</span></p>
      <p className="text-gray-600 dark:text-gray-300">Volume: <span className="font-semibold">{fmtVolume(d?.volume)}</span></p>
    </div>
  );
};

// ── Bar colours per payment method ────────────────────────────────────────────
const METHOD_COLORS = {
  Cash:     '#f97316',
  POS:      '#f59e0b',
  Transfer: '#3b82f6',
};

// ── Component ─────────────────────────────────────────────────────────────────

const PaymentCommissionPage = () => {
  const { paymentMethods, commissionPayouts, loading } = useTrendsStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark     = mounted && theme === 'dark';
  const axisColor  = isDark ? '#9ca3af' : '#6b7280';
  const gridColor  = isDark ? '#374151' : '#f3f4f6';
  const cardClass  = "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5";

  const EMPTY_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const pmData = paymentMethods?.length
    ? paymentMethods
    : [
        { method: 'Cash',     percentage: 0, transactions: 0, amount: 0 },
        { method: 'POS',      percentage: 0, transactions: 0, amount: 0 },
        { method: 'Transfer', percentage: 0, transactions: 0, amount: 0 },
      ];

  const cpData = commissionPayouts?.length
    ? commissionPayouts
    : EMPTY_MONTHS.map(m => ({ month: m, commission: 0, rate: 0, volume: 0 }));

  // ── Skeleton ─────────────────────────────────────────────────────────────────
  if (loading.dashboard) {
    return (
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">
        {[1, 2].map(i => (
          <div key={i} className={`${cardClass} animate-pulse`}>
            <div className="h-5 bg-gray-200 dark:bg-gray-600 rounded w-1/2 mb-4" />
            <div className="h-64 bg-gray-100 dark:bg-gray-700 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid lg:grid-cols-2 grid-cols-1 gap-3">

      {/* ── Payment Methods ─────────────────────────────────────────────────── */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Payment Methods
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">
            Breakdown by payment type
          </p>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <BarChart data={pmData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="method"
              tick={{ fill: axisColor, fontSize: 12 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => `${v.toFixed(0)}%`}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              domain={[0, 100]}
              width={40}
            />
            <Tooltip content={<PaymentTooltip />} />
            <Bar dataKey="percentage" name="Share %" radius={[6, 6, 0, 0]} maxBarSize={60}>
              {pmData.map((entry, index) => (
                <Cell key={index} fill={METHOD_COLORS[entry.method] ?? '#6b7280'} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>

        {/* Summary cards under chart */}
        <div className="grid grid-cols-3 gap-3 mt-4">
          {pmData.map((pm) => (
            <div
              key={pm.method}
              className="rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 text-center"
            >
              <div
                className="w-3 h-3 rounded-full mx-auto mb-1"
                style={{ backgroundColor: METHOD_COLORS[pm.method] ?? '#6b7280' }}
              />
              <p className="text-xs font-semibold text-gray-700 dark:text-gray-200">{pm.method}</p>
              <p className="text-lg font-bold" style={{ color: METHOD_COLORS[pm.method] }}>
                {pm.percentage?.toFixed(0)}%
              </p>
              <p className="text-[10px] text-gray-500 dark:text-gray-400">{pm.transactions} txns</p>
              <p className="text-[10px] font-medium text-gray-600 dark:text-gray-300">{fmtCurrency(pm.amount)}</p>
            </div>
          ))}
        </div>
      </div>

      {/* ── Commission Payouts ──────────────────────────────────────────────── */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Commission Payouts
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last 12 months</p>
        </div>

        <div className="flex gap-5 mb-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <span className="w-3 h-3 rounded-full bg-blue-500 inline-block" /> Commission (₦)
          </span>
        </div>

        <ResponsiveContainer width="100%" height={220}>
          <LineChart data={cpData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmtCurrency}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<CommissionTooltip />} />
            <Line
              type="monotone"
              dataKey="commission"
              name="Commission"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 4, fill: '#3b82f6', strokeWidth: 0 }}
              activeDot={{ r: 6, fill: '#2563eb' }}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Latest commission summary */}
        {cpData.length > 0 && (() => {
          const latest = cpData[cpData.length - 1];
          return (
            <div className="mt-4 flex gap-3">
              {[
                { label: 'Latest Commission', value: fmtCurrency(latest.commission), color: 'text-blue-600 dark:text-blue-400' },
                { label: 'Avg Rate',          value: `${latest.rate}%`,             color: 'text-emerald-600 dark:text-emerald-400' },
                { label: 'Volume',            value: fmtVolume(latest.volume),      color: 'text-orange-500 dark:text-orange-400' },
              ].map((s) => (
                <div key={s.label} className="flex-1 rounded-xl p-3 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-700 text-center">
                  <p className="text-[10px] text-gray-500 dark:text-gray-400 mb-0.5">{s.label}</p>
                  <p className={`text-sm font-bold ${s.color}`}>{s.value}</p>
                </div>
              ))}
            </div>
          );
        })()}
      </div>

    </div>
  );
};

export default PaymentCommissionPage;
