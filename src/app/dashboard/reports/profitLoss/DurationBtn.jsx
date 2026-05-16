'use client';
import { useState, useRef, useEffect } from 'react';
import { ChevronDown, ChevronUp, Download } from 'lucide-react';
import useAccountantStore from '@/store/useAccountantStore';

const OPTIONS = [
  { value: 'last3months',  label: 'Last 3 Months'  },
  { value: 'lastquarter',  label: 'Last Quarter'    },
  { value: 'thismonth',    label: 'This Month'      },
  { value: 'thisquarter',  label: 'This Quarter'    },
  { value: 'thisyear',     label: 'This Year'       },
];

export default function DurationBtn({ selectedDuration, onDurationChange }) {
  const [open, setOpen] = useState(false);
  const ref = useRef(null);
  const { profitLoss } = useAccountantStore();

  // Close on outside click
  useEffect(() => {
    function handler(e) {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  function select(value) {
    onDurationChange(value);
    setOpen(false);
  }

  function handleExport() {
    if (!profitLoss?.monthlyBreakdown?.length) return;

    const rows = [
      ['Date', 'Total Revenue (₦)', 'Total Expenses (₦)', 'Profit / Loss (₦)'],
      ...profitLoss.monthlyBreakdown.map(m => [
        m.date,
        Number(m.totalRevenue  || 0).toFixed(2),
        Number(m.totalExpenses || 0).toFixed(2),
        Number(m.profitLoss    || 0).toFixed(2),
      ]),
      [],
      ['Summary', '', '', ''],
      ['Total Revenue',  '', '', Number(profitLoss.summary?.totalRevenueGenerated || 0).toFixed(2)],
      ['Total Expenses', '', '', Number(profitLoss.summary?.totalExpenses         || 0).toFixed(2)],
      ['Net Profit/Loss','', '', Number(profitLoss.summary?.profitLoss            || 0).toFixed(2)],
    ];

    const csv  = rows.map(r => r.map(c => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href     = url;
    a.download = `profit_loss_${selectedDuration}_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  const currentLabel = OPTIONS.find(o => o.value === selectedDuration)?.label || 'Duration';

  return (
    <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">

      {/* Duration dropdown */}
      <div className="relative" ref={ref}>
        <button
          onClick={() => setOpen(v => !v)}
          className="flex items-center gap-3 px-4 py-2 text-neutral-600 font-semibold border-2 border-neutral-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-gray-50 transition-colors min-w-[160px] justify-between"
        >
          {currentLabel}
          {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
        </button>

        {open && (
          <div className="absolute top-full mt-1.5 left-0 w-48 bg-white rounded-xl shadow-xl border border-neutral-200 z-30 overflow-hidden">
            {OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => select(opt.value)}
                className={`w-full text-left px-4 py-2.5 text-sm font-medium transition-colors ${
                  selectedDuration === opt.value
                    ? 'bg-blue-600 text-white'
                    : 'text-neutral-700 hover:bg-blue-50 hover:text-blue-700'
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Export CSV */}
      <button
        onClick={handleExport}
        disabled={!profitLoss?.monthlyBreakdown?.length}
        className="px-4 py-2 flex justify-center items-center gap-2 font-bold bg-[#0080FF] text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Export <Download size={18} />
      </button>
    </div>
  );
}
