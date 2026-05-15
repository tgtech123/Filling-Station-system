'use client'
import React, { useEffect, useState } from 'react';
import { useTheme } from 'next-themes';
import {
  ResponsiveContainer, ComposedChart, AreaChart, Area,
  Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
} from 'recharts';
import useTrendsStore from '@/store/useTrendsStore';

// ── Formatters ────────────────────────────────────────────────────────────────

const fmtRevenue = (v) => {
  if (!v && v !== 0) return '₦0';
  if (v >= 1_000_000) return `₦${(v / 1_000_000).toFixed(1)}M`;
  if (v >= 1_000)     return `₦${(v / 1_000).toFixed(0)}K`;
  return `₦${v.toLocaleString('en-US')}`;
};

const fmtVolume = (v) => {
  if (!v && v !== 0) return '0L';
  if (v >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}ML`;
  if (v >= 1_000)     return `${(v / 1_000).toFixed(0)}KL`;
  return `${v.toLocaleString('en-US')}L`;
};

// ── Custom tooltips ───────────────────────────────────────────────────────────

const SalesTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {p.name === 'Revenue' ? fmtRevenue(p.value) : fmtVolume(p.value)}
        </p>
      ))}
    </div>
  );
};

const ProfitTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-lg px-4 py-3 text-xs">
      <p className="font-semibold text-gray-700 dark:text-gray-200 mb-1">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-medium">
          {p.name}: {fmtRevenue(p.value)}
        </p>
      ))}
    </div>
  );
};

// ── Component ─────────────────────────────────────────────────────────────────

const SalesProfitPage = () => {
  const { salesRevenueTrend, profitAnalysis, loading } = useTrendsStore();
  const { theme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const isDark = mounted && theme === 'dark';
  const axisColor   = isDark ? '#9ca3af' : '#6b7280';
  const gridColor   = isDark ? '#374151' : '#f3f4f6';
  const cardClass   = "bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 p-5";

  const EMPTY_MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  const salesData = salesRevenueTrend?.length
    ? salesRevenueTrend
    : EMPTY_MONTHS.map(m => ({ month: m, volume: 0, revenue: 0 }));

  const profitData = profitAnalysis?.length
    ? profitAnalysis
    : EMPTY_MONTHS.map(m => ({ month: m, grossProfit: 0, netProfit: 0 }));

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

      {/* ── Sales & Revenue Trends ──────────────────────────────────────────── */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Sales &amp; Revenue Trends
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last 12 months</p>
        </div>

        <div className="flex gap-5 mb-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <span className="w-3 h-3 rounded-sm bg-blue-500 inline-block" /> Revenue
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <span className="w-3 h-3 rounded-sm bg-orange-400 inline-block" /> Volume (L)
          </span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <ComposedChart data={salesData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="revenue"
              orientation="left"
              tickFormatter={fmtRevenue}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <YAxis
              yAxisId="volume"
              orientation="right"
              tickFormatter={fmtVolume}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<SalesTooltip />} />
            <Bar
              yAxisId="volume"
              dataKey="volume"
              name="Volume"
              fill="#fb923c"
              radius={[3, 3, 0, 0]}
              opacity={0.75}
              maxBarSize={28}
            />
            <Line
              yAxisId="revenue"
              type="monotone"
              dataKey="revenue"
              name="Revenue"
              stroke="#3b82f6"
              strokeWidth={2.5}
              dot={{ r: 3, fill: '#3b82f6' }}
              activeDot={{ r: 5 }}
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>

      {/* ── Profit Analysis ─────────────────────────────────────────────────── */}
      <div className={cardClass}>
        <div className="mb-4">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">
            Profit Analysis
          </h2>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-0.5">Last 12 months</p>
        </div>

        <div className="flex gap-5 mb-4 text-xs">
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <span className="w-3 h-3 rounded-full bg-purple-500 inline-block" /> Gross Profit
          </span>
          <span className="flex items-center gap-1.5 text-gray-600 dark:text-gray-300">
            <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block" /> Net Profit
          </span>
        </div>

        <ResponsiveContainer width="100%" height={260}>
          <AreaChart data={profitData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="grossGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#a855f7" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#a855f7" stopOpacity={0}    />
              </linearGradient>
              <linearGradient id="netGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#10b981" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}    />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
            <XAxis
              dataKey="month"
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={fmtRevenue}
              tick={{ fill: axisColor, fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={52}
            />
            <Tooltip content={<ProfitTooltip />} />
            <Area
              type="monotone"
              dataKey="grossProfit"
              name="Gross Profit"
              stroke="#a855f7"
              strokeWidth={2.5}
              fill="url(#grossGrad)"
              dot={{ r: 3, fill: '#a855f7' }}
              activeDot={{ r: 5 }}
            />
            <Area
              type="monotone"
              dataKey="netProfit"
              name="Net Profit"
              stroke="#10b981"
              strokeWidth={2.5}
              fill="url(#netGrad)"
              dot={{ r: 3, fill: '#10b981' }}
              activeDot={{ r: 5 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

    </div>
  );
};

export default SalesProfitPage;
