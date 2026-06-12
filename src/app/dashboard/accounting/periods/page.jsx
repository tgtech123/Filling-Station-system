'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Lock, LockOpen, Unlock, CalendarClock, TrendingUp, Globe, RefreshCw, Plus } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, StatusBadge, Table, Hint, fmt, fmtDate } from '../shared';

const LEDGERS = [
  { key: 'ap', label: 'Payables (AP)' },
  { key: 'ar', label: 'Receivables (AR)' },
  { key: 'inventory', label: 'Inventory' },
  { key: 'gl', label: 'General Ledger' },
];

const currentPeriod = () => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
};

export default function PeriodsPage() {
  const [periods, setPeriods] = useState([]);
  const [depRuns, setDepRuns] = useState([]);
  const [fxRuns, setFxRuns] = useState([]);
  const [fxRates, setFxRates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [runPeriod, setRunPeriod] = useState(currentPeriod());
  const [showRate, setShowRate] = useState(false);
  const [rateForm, setRateForm] = useState({ currency: 'USD', rate: '', date: new Date().toISOString().split('T')[0] });
  const [salesRuns, setSalesRuns] = useState([]);
  const [salesPreview, setSalesPreview] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const [p, d, f, r, s] = await Promise.all([
        api.get('/api/accounting/periods'),
        api.get('/api/accounting/depreciation/runs'),
        api.get('/api/accounting/fx/revaluations'),
        api.get('/api/accounting/fx/rates'),
        api.get('/api/accounting/sales-postings'),
      ]);
      setPeriods(p.data.data);
      setDepRuns(d.data.data);
      setFxRuns(f.data.data);
      setFxRates(r.data.data);
      setSalesRuns(s.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load periods');
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => { load(); }, []);

  async function closeLedger(period, ledger, mode) {
    const warning = mode === 'hard'
      ? `HARD-close ${ledger.toUpperCase()} for ${period}? This is IRREVERSIBLE.${ledger === 'gl' && period.endsWith('-12') ? ' Year-end closing entries will post (temporary accounts → Retained Earnings).' : ''}`
      : `Soft-close ${ledger.toUpperCase()} for ${period}? It can be reopened for review adjustments.`;
    if (!confirm(warning)) return;
    try {
      const res = await api.post(`/api/accounting/periods/${period}/close`, { ledger, mode });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Close failed');
    }
  }

  async function reopen(period, ledger) {
    try {
      const res = await api.post(`/api/accounting/periods/${period}/reopen`, { ledger });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Reopen failed');
    }
  }

  async function previewSales() {
    try {
      const res = await api.get(`/api/accounting/sales-postings/preview?period=${runPeriod}`);
      setSalesPreview(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Preview failed');
    }
  }

  async function runSalesPosting() {
    try {
      const res = await api.post('/api/accounting/sales-postings/run', { period: runPeriod });
      toast.success(res.data.message);
      setSalesPreview(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Sales posting failed');
    }
  }

  async function runDepreciation() {
    if (!confirm(`Post monthly depreciation for ${runPeriod}? One journal posts for all assets.`)) return;
    try {
      const res = await api.post('/api/accounting/depreciation/run', { period: runPeriod });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Depreciation run failed');
    }
  }

  async function runRevaluation() {
    if (!confirm(`Run FX revaluation for ${runPeriod}? Unrealized gains/losses will post.`)) return;
    try {
      const res = await api.post('/api/accounting/fx/revaluation', { period: runPeriod });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Revaluation failed');
    }
  }

  async function fetchRates() {
    try {
      const res = await api.post('/api/accounting/fx/rates/fetch', { currencies: ['USD', 'EUR', 'GBP'] });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || 'Rate fetch failed');
    }
  }

  async function saveRate(e) {
    e.preventDefault();
    try {
      await api.post('/api/accounting/fx/rates', rateForm);
      toast.success('Rate saved');
      setShowRate(false);
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed');
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Period Close</h1>
            <p className="text-sm text-gray-500">Sub-ledgers close independently before the GL · soft close = review lock, hard close = final</p>
          </div>
        </div>

        <Hint>
          Closing a period locks a month so nothing can change after you've checked it. Close the sub-ledgers
          (Payables, Receivables, Inventory) first, then the General Ledger last. A soft close is a temporary
          lock you can reopen for corrections; a hard close is permanent. Hard-closing December's GL runs the
          year-end procedure: the year's revenue and expenses are zeroed into Retained Earnings. Before closing
          a month, run the two month-end procedures below — depreciation and FX revaluation.
        </Hint>

        <Card title="Accounting Periods" className="mb-4">
          <Table headers={['Period', ...LEDGERS.map((l) => l.label), 'Year-End']}
            empty={!loading && periods.length === 0 ? 'No periods yet' : null}>
            {periods.map((p) => (
              <tr key={p._id}>
                <td className="py-2 pr-3 font-mono text-sm font-bold">{p.period}</td>
                {LEDGERS.map((l) => {
                  const st = p.ledgers[l.key];
                  return (
                    <td key={l.key} className="py-2 pr-3">
                      <div className="flex items-center gap-1.5">
                        <StatusBadge status={st} />
                        {st === 'open' && (
                          <>
                            <button onClick={() => closeLedger(p.period, l.key, 'soft')} title="Soft close (review lock)" className="text-gray-300 hover:text-amber-500">
                              <LockOpen size={14} />
                            </button>
                            <button onClick={() => closeLedger(p.period, l.key, 'hard')} title="Hard close (irreversible)" className="text-gray-300 hover:text-red-500">
                              <Lock size={14} />
                            </button>
                          </>
                        )}
                        {st === 'soft_closed' && (
                          <>
                            <button onClick={() => reopen(p.period, l.key)} title="Reopen" className="text-gray-300 hover:text-emerald-500">
                              <Unlock size={14} />
                            </button>
                            <button onClick={() => closeLedger(p.period, l.key, 'hard')} title="Hard close" className="text-gray-300 hover:text-red-500">
                              <Lock size={14} />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  );
                })}
                <td className="py-2 text-xs">
                  {p.isYearEndClosed ? <span className="text-emerald-600 font-medium">✓ Closed to R/E</span> : '—'}
                </td>
              </tr>
            ))}
          </Table>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
          <Card title="Month-End Procedures" subtitle="run before closing the period"
            actions={<input type="month" className={`${inputCls} !w-40 !py-1`} value={runPeriod} onChange={(e) => setRunPeriod(e.target.value)} />}>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5"><CalendarClock size={15} className="text-emerald-500" /> Post Product Sales</p>
                  <p className="text-xs text-gray-400">Books the month's fuel, lubricant and gas sales into the ledger — each product credits its own revenue account (PMS 4010, Diesel 4020, Kerosene 4030, Lubricant 4100, Gas 4200)</p>
                </div>
                <Btn small variant="success" onClick={previewSales}>Preview</Btn>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5"><TrendingUp size={15} className="text-blue-500" /> Monthly Depreciation</p>
                  <p className="text-xs text-gray-400">Dr Depreciation Expense / Cr Accumulated Depreciation — all assets, one journal</p>
                </div>
                <Btn small onClick={runDepreciation}>Run</Btn>
              </div>
              <div className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                <div>
                  <p className="text-sm font-medium flex items-center gap-1.5"><Globe size={15} className="text-purple-500" /> FX Revaluation</p>
                  <p className="text-xs text-gray-400">Restates foreign-currency balances at closing rate; books unrealized gain/loss</p>
                </div>
                <Btn small onClick={runRevaluation}>Run</Btn>
              </div>
            </div>

            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-2">Recent Sales Postings</p>
            {salesRuns.length === 0 ? <p className="text-xs text-gray-400">None yet</p> : (
              <ul className="text-sm divide-y divide-gray-50 dark:divide-gray-800">
                {salesRuns.slice(0, 6).map((r) => (
                  <li key={r._id} className="py-1.5 flex justify-between">
                    <span className="font-mono text-xs">{r.period}</span>
                    <span className="text-xs text-gray-400">{r.lines.map((l) => l.product).join(', ')}</span>
                    <span className="font-mono text-xs">₦{fmt(r.totalAmount)}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-2">Recent Depreciation Runs</p>
            {depRuns.length === 0 ? <p className="text-xs text-gray-400">None yet</p> : (
              <ul className="text-sm divide-y divide-gray-50 dark:divide-gray-800">
                {depRuns.slice(0, 6).map((r) => (
                  <li key={r._id} className="py-1.5 flex justify-between">
                    <span className="font-mono text-xs">{r.period}</span>
                    <span className="text-xs text-gray-400">{r.lines.length} assets</span>
                    <span className="font-mono text-xs">₦{fmt(r.totalAmount)}</span>
                  </li>
                ))}
              </ul>
            )}

            <p className="text-xs font-semibold text-gray-500 uppercase mt-4 mb-2">Recent FX Revaluations</p>
            {fxRuns.length === 0 ? <p className="text-xs text-gray-400">None yet</p> : (
              <ul className="text-sm divide-y divide-gray-50 dark:divide-gray-800">
                {fxRuns.slice(0, 6).map((r) => (
                  <li key={r._id} className="py-1.5 flex justify-between">
                    <span className="font-mono text-xs">{r.period}</span>
                    <span className="text-xs text-emerald-600">+₦{fmt(r.totalGain)}</span>
                    <span className="text-xs text-red-500">−₦{fmt(r.totalLoss)}</span>
                  </li>
                ))}
              </ul>
            )}
          </Card>

          <Card title="FX Rates" subtitle="1 unit of foreign currency in NGN"
            actions={
              <div className="flex gap-2">
                <Btn small variant="outline" onClick={fetchRates}><RefreshCw size={13} /> Fetch Daily</Btn>
                <Btn small variant="outline" onClick={() => setShowRate(true)}><Plus size={13} /> Manual</Btn>
              </div>
            }>
            <Table headers={['Currency', { label: 'Rate (₦)', right: true }, 'Date', 'Source']}
              empty={fxRates.length === 0 ? 'No rates yet — fetch daily rates or add manually' : null}>
              {fxRates.slice(0, 15).map((r) => (
                <tr key={r._id}>
                  <td className="py-1.5 pr-3 font-mono text-xs font-bold">{r.currency}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-xs">₦{fmt(r.rate)}</td>
                  <td className="py-1.5 pr-3 text-xs">{fmtDate(r.date)}</td>
                  <td className="py-1.5 text-xs uppercase text-gray-400">{r.source}</td>
                </tr>
              ))}
            </Table>
          </Card>
        </div>

        {salesPreview && (
          <Modal title={`Sales Posting Preview — ${salesPreview.period}`} onClose={() => setSalesPreview(null)}>
            {salesPreview.alreadyPosted && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                Sales for this month were already posted — running again is blocked.
              </p>
            )}
            <Table headers={['Product', 'Source', 'Sales', { label: 'Amount', right: true }]}
              empty={salesPreview.lines.length === 0 ? 'No sales recorded in this month' : null}>
              {salesPreview.lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-1.5 pr-3 font-medium">{l.product}</td>
                  <td className="py-1.5 pr-3 text-xs text-gray-400 capitalize">{l.source}</td>
                  <td className="py-1.5 pr-3 text-xs">{l.count}</td>
                  <td className="py-1.5 text-right font-mono text-xs">₦{fmt(l.amount)}</td>
                </tr>
              ))}
              {salesPreview.lines.length > 0 && (
                <tr className="font-bold border-t-2 border-gray-200">
                  <td colSpan={3} className="py-2 pr-3 text-right">Total to post</td>
                  <td className="py-2 text-right font-mono">₦{fmt(salesPreview.total)}</td>
                </tr>
              )}
            </Table>
            <div className="flex justify-end gap-2 mt-4">
              <Btn variant="secondary" onClick={() => setSalesPreview(null)}>Close</Btn>
              {!salesPreview.alreadyPosted && salesPreview.lines.length > 0 && (
                <Btn variant="success" onClick={runSalesPosting}>Post to Ledger</Btn>
              )}
            </div>
          </Modal>
        )}

        {showRate && (
          <Modal title="Add FX Rate" onClose={() => setShowRate(false)}>
            <form onSubmit={saveRate}>
              <div className="grid grid-cols-3 gap-3">
                <Field label="Currency *">
                  <input className={inputCls} value={rateForm.currency} onChange={(e) => setRateForm({ ...rateForm, currency: e.target.value.toUpperCase() })} maxLength={3} required />
                </Field>
                <Field label="Rate (₦) *">
                  <input type="number" step="0.0001" min="0" className={inputCls} value={rateForm.rate} onChange={(e) => setRateForm({ ...rateForm, rate: e.target.value })} required />
                </Field>
                <Field label="Date *">
                  <input type="date" className={inputCls} value={rateForm.date} onChange={(e) => setRateForm({ ...rateForm, date: e.target.value })} required />
                </Field>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Btn variant="secondary" onClick={() => setShowRate(false)}>Cancel</Btn>
                <Btn type="submit">Save</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
