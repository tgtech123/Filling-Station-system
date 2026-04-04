'use client';
import React, { useState, useEffect } from 'react';
import { ChevronDown } from 'lucide-react';
import useManagerReportsStore from '@/store/useManagerReportsStore';

// ── Duration options — shared by both dropdowns ───────────────────────────────
const DROPDOWN_OPTIONS = [
  { label: 'This week',  value: 'thisweek'  },
  { label: 'This month', value: 'thismonth' },
  { label: 'Last month', value: 'lastmonth' },
  { label: 'This year',  value: 'thisyear'  }, // last 12 months
];

// ── Product colors ────────────────────────────────────────────────────────────
const PRODUCT_COLORS = {
  PMS:      { stroke: '#f97316', bg: 'bg-orange-500' },
  AGO:      { stroke: '#22c55e', bg: 'bg-green-500'  },
  Diesel:   { stroke: '#3b82f6', bg: 'bg-blue-500'   },
  Gas:      { stroke: '#fb923c', bg: 'bg-orange-400' },
  Kerosene: { stroke: '#a855f7', bg: 'bg-purple-500' },
  default:  { stroke: '#6b7280', bg: 'bg-gray-500'   },
};

const getProductColor = (name) => PRODUCT_COLORS[name] || PRODUCT_COLORS.default;

// ── Dropdown ──────────────────────────────────────────────────────────────────
const Dropdown = ({ isOpen, setIsOpen, selected, onSelect, options }) => (
  <div className="relative">
    <button
      onClick={() => setIsOpen(!isOpen)}
      className="lg:flex flex-wrap items-center gap-2 px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium hover:bg-gray-50"
    >
      {options.find((o) => o.value === selected)?.label ?? 'Select'}
      <ChevronDown className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
    </button>

    {isOpen && (
      <div className="absolute top-full mt-1 left-0 bg-white border border-blue-600 rounded-lg shadow-lg z-10 min-w-full">
        {options.map((option) => (
          <button
            key={option.value}
            onClick={() => { onSelect(option.value); setIsOpen(false); }}
            className="w-full text-left px-3 py-2 text-sm hover:bg-blue-600 hover:text-white hover:rounded-2xl"
          >
            {option.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

// ── Main Component ────────────────────────────────────────────────────────────
const SalesAndProductChart = () => {
  const [leftDropdownOpen,  setLeftDropdownOpen]  = useState(false);
  const [rightDropdownOpen, setRightDropdownOpen] = useState(false);

  // Both panels share one duration — changing either dropdown refetches once.
  // Default to 'thismonth' to match the store's initial salesOverviewDuration.
  const [duration, setDuration] = useState('thismonth');

  const salesOverview      = useManagerReportsStore((state) => state.salesOverview);
  const fetchSalesOverview = useManagerReportsStore((state) => state.fetchSalesOverview);
  const chartLoading       = useManagerReportsStore((state) => state.loading.salesChart);

  // On duration change, pass isChartRefetch=true → only loading.salesChart
  // is set, so stat cards in the parent are never re-skeletonised.
  useEffect(() => {
    fetchSalesOverview(duration, true);
  }, [duration]);

  // ── Sales Trend ───────────────────────────────────────────────────────────
  const salesTrend  = salesOverview?.salesTrend ?? [];
  const trendValues = salesTrend.map((d) => d.sales);
  const maxVal      = Math.max(...trendValues, 1);
  const minVal      = Math.min(...trendValues, 0);
  const range       = maxVal - minVal || 1;
  const avgSales    = trendValues.length
    ? Math.round(trendValues.reduce((a, b) => a + b, 0) / trendValues.length)
    : 0;

  const WIDTH  = 600;
  const HEIGHT = 200;

  const getX = (i) => (i / Math.max(salesTrend.length - 1, 1)) * WIDTH;
  const getY = (v) => HEIGHT - ((v - minVal) / range) * (HEIGHT * 0.8) - HEIGHT * 0.1;

  const linePath = salesTrend
    .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)},${getY(d.sales)}`)
    .join(' ');

  const areaPath = salesTrend.length
    ? `M 0,${HEIGHT} L ${salesTrend.map((d, i) => `${getX(i)},${getY(d.sales)}`).join(' L ')} L ${WIDTH},${HEIGHT} Z`
    : '';

  // ── Product Distribution ──────────────────────────────────────────────────
  const rawProducts   = salesOverview?.productSalesDistribution ?? [];
  const totalLitres   = rawProducts.reduce((sum, p) => sum + (p.litres || 0), 0);
  const CIRCUMFERENCE = 2 * Math.PI * 70;

  const products = rawProducts.map((p) => ({
    ...p,
    pct: totalLitres > 0 ? Math.round((p.litres / totalLitres) * 100) : 0,
  }));

  let cumulativeDash = 0;
  const segments = products.map((p) => {
    const dash   = (p.pct / 100) * CIRCUMFERENCE;
    const offset = -cumulativeDash;
    cumulativeDash += dash;
    return { ...p, dash, offset };
  });

  const selectedLabel = DROPDOWN_OPTIONS.find((o) => o.value === duration)?.label ?? '';

  return (
    <div className="mt-[1.5rem]">
      <div className="flex gap-7 w-full">

        {/* ── Sales Trend Chart ──────────────────────────────────────────────── */}
        <div className="rounded-xl flex-1 p-2 border-2 border-neutral-200">
          <div className="flex justify-between items-center mb-[1.5rem]">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Sales Trend</h3>
              <p className="text-sm text-gray-500">Over the selected duration</p>
            </div>
            {/* Now fully wired — shares the same duration state as the right panel */}
            <Dropdown
              isOpen={leftDropdownOpen}
              setIsOpen={setLeftDropdownOpen}
              selected={duration}
              onSelect={setDuration}
              options={DROPDOWN_OPTIONS}
            />
          </div>

          <div className="relative">
            {chartLoading ? (
              <div className="w-full h-48 rounded-xl bg-neutral-100 animate-pulse" />
            ) : salesTrend.length === 0 ? (
              <div className="w-full h-48 flex items-center justify-center text-sm text-gray-400">
                No trend data available
              </div>
            ) : (
              <>
                <svg viewBox="0 0 600 200" className="w-full h-48">
                  <defs>
                    <linearGradient id="areaGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%"   stopColor="#f97316" stopOpacity="0.3" />
                      <stop offset="100%" stopColor="#f97316" stopOpacity="0.1" />
                    </linearGradient>
                  </defs>

                  <path d={areaPath} fill="url(#areaGradient)" />

                  <path
                    d={linePath}
                    stroke="#f97316"
                    strokeWidth="3"
                    fill="none"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {salesTrend.map((item, index) => (
                    <circle
                      key={index}
                      cx={getX(index)}
                      cy={getY(item.sales)}
                      r="4"
                      fill="#f97316"
                      stroke="white"
                      strokeWidth="2"
                    />
                  ))}

                  <g transform="translate(280, 60)">
                    <rect x="-40" y="-55" width="6.625rem" height="3.0625rem" rx="15" fill="#FFAF51" />
                    <text x="12" y="-40" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="10" fontWeight="500">
                      Average Sale Value
                    </text>
                    <text x="12" y="-20" textAnchor="middle" dominantBaseline="middle" fill="white" fontSize="14" fontWeight="600">
                      ₦{avgSales.toLocaleString()}
                    </text>
                  </g>
                </svg>

                <div className="flex justify-between mt-4 px-1">
                  {salesTrend.map((item, index) => (
                    <span key={index} className="text-xs text-gray-500">{item.month}</span>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* ── Product Sales Distribution ─────────────────────────────────────── */}
        <div className="flex-1 rounded-xl p-2 border-2 border-neutral-200">
          <div className="lg:flex flex-wrap lg:justify-between items-center mb-[1.5rem]">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Product Sales Distribution</h3>
              <p className="text-sm text-gray-500">{selectedLabel}</p>
            </div>
            {/* Shares the same duration state — one dropdown change updates both panels */}
            <Dropdown
              isOpen={rightDropdownOpen}
              setIsOpen={setRightDropdownOpen}
              selected={duration}
              onSelect={setDuration}
              options={DROPDOWN_OPTIONS}
            />
          </div>

          <div className="lg:flex flex-wrap items-center lg:justify-between">
            {chartLoading ? (
              <div className="flex items-center gap-8 w-full">
                <div className="w-[200px] h-[200px] rounded-full bg-neutral-100 animate-pulse flex-shrink-0" />
                <div className="flex flex-col gap-4 flex-1">
                  {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-5 rounded-md bg-neutral-100 animate-pulse" />
                  ))}
                </div>
              </div>
            ) : products.length === 0 ? (
              <div className="w-[200px] h-[200px] flex items-center justify-center text-sm text-gray-400">
                No data available
              </div>
            ) : (
              <>
                <div className="relative">
                  <svg width="200" height="200" className="transform -rotate-90">
                    <circle cx="100" cy="100" r="70" fill="none" stroke="#e5e7eb" strokeWidth="40" />
                    {segments.map((p, i) => (
                      <circle
                        key={i}
                        cx="100"
                        cy="100"
                        r="70"
                        fill="none"
                        stroke={getProductColor(p.product).stroke}
                        strokeWidth="40"
                        strokeDasharray={`${p.dash} ${CIRCUMFERENCE}`}
                        strokeDashoffset={p.offset}
                        className="transition-all duration-500"
                      />
                    ))}
                  </svg>
                </div>

                <div className="space-y-4 ml-6">
                  {segments.map((p, index) => (
                    <div key={index} className="flex items-center justify-between min-w-[200px]">
                      <div className="flex items-center gap-3">
                        <div className={`w-3 h-3 rounded-full ${getProductColor(p.product).bg}`} />
                        <span className="text-gray-600 font-medium">{p.product}</span>
                        <span className="text-gray-400 text-sm">{p.pct}%</span>
                      </div>
                      <span className="text-gray-500 text-sm ml-4">
                        {(p.litres || 0).toLocaleString()} Litres
                      </span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};

export default SalesAndProductChart;