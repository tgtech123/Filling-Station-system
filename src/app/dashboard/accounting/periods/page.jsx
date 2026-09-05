'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Lock, LockOpen, Unlock, CalendarClock, TrendingUp, Globe, RefreshCw, Plus, Boxes } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, StatusBadge, Table, Hint, fmt, fmtDate } from '../shared';
import { extractApiError } from '@/lib/config';

const STOCK_PRODUCTS = ['PMS', 'AGO (Diesel)', 'Kerosene', 'Lubricant', 'Gas'];

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
  const [valuation, setValuation] = useState({ valuations: [], totalValue: 0 });
  const [showOpening, setShowOpening] = useState(false);
  const [openForm, setOpenForm] = useState({ product: 'PMS', qty: '', unitCost: '', date: new Date().toISOString().split('T')[0], postToGL: true });

  const load = async () => {
    setLoading(true);
    try {
      const [p, d, f, r, s, v] = await Promise.all([
        api.get('/api/accounting/periods'),
        api.get('/api/accounting/depreciation/runs'),
        api.get('/api/accounting/fx/revaluations'),
        api.get('/api/accounting/fx/rates'),
        api.get('/api/accounting/sales-postings'),
        api.get('/api/accounting/inventory/valuation'),
      ]);
      setPeriods(p.data.data);
      setDepRuns(d.data.data);
      setFxRuns(f.data.data);
      setFxRates(r.data.data);
      setSalesRuns(s.data.data);
      setValuation(v.data.data);
    } catch (e) {
      toast.error(extractApiError(e) || 'Failed to load periods');
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
      toast.error(extractApiError(e) || 'Close failed');
    }
  }

  async function reopen(period, ledger) {
    try {
      const res = await api.post(`/api/accounting/periods/${period}/reopen`, { ledger });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(extractApiError(e) || 'Reopen failed');
    }
  }

  async function saveOpening(e) {
    e.preventDefault();
    try {
      const res = await api.post('/api/accounting/inventory/opening', {
        product: openForm.product,
        qty: Number(openForm.qty),
        unitCost: Number(openForm.unitCost),
        date: openForm.date,
        postToGL: openForm.postToGL,
      });
      toast.success(res.data.message);
      setShowOpening(false);
      setOpenForm({ product: 'PMS', qty: '', unitCost: '', date: new Date().toISOString().split('T')[0], postToGL: true });
      load();
    } catch (e2) {
      toast.error(extractApiError(e2) || 'Failed to record stock');
    }
  }

  async function previewSales() {
    try {
      const res = await api.get(`/api/accounting/sales-postings/preview?period=${runPeriod}`);
      setSalesPreview(res.data.data);
    } catch (e) {
      toast.error(extractApiError(e) || 'Preview failed');
    }
  }

  async function runSalesPosting() {
    try {
      const res = await api.post('/api/accounting/sales-postings/run', { period: runPeriod });
      toast.success(res.data.message);
      setSalesPreview(null);
      load();
    } catch (e) {
      toast.error(extractApiError(e) || 'Sales posting failed');
    }
  }

  async function runDepreciation() {
    if (!confirm(`Post monthly depreciation for ${runPeriod}? One journal posts for all assets.`)) return;
    try {
      const res = await api.post('/api/accounting/depreciation/run', { period: runPeriod });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(extractApiError(e) || 'Depreciation run failed');
    }
  }

  async function runRevaluation() {
    if (!confirm(`Run FX revaluation for ${runPeriod}? Unrealized gains/losses will post.`)) return;
    try {
      const res = await api.post('/api/accounting/fx/revaluation', { period: runPeriod });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(extractApiError(e) || 'Revaluation failed');
    }
  }

  async function fetchRates() {
    try {
      const res = await api.post('/api/accounting/fx/rates/fetch', { currencies: ['USD', 'EUR', 'GBP'] });
      toast.success(res.data.message);
      load();
    } catch (e) {
      toast.error(extractApiError(e) || 'Rate fetch failed');
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
      toast.error(extractApiError(e2) || 'Failed');
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
                  <li key={r._id} className="py-1.5 flex justify-between items-center gap-2">
                    <span className="font-mono text-xs">{r.period}</span>
                    <span className="text-xs text-gray-400 flex-1 truncate">{r.lines.map((l) => l.product).join(', ')}</span>
                    <span className="font-mono text-xs">₦{fmt(r.totalAmount)}</span>
                    <span className="font-mono text-[11px] text-emerald-600" title="gross margin">+₦{fmt(r.totalMargin ?? 0)}</span>
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

        <Card
          title="Inventory Valuation"
          subtitle="Perpetual weighted-average cost — what's on hand and what it's worth"
          className="mb-4"
          actions={<Btn small variant="outline" onClick={() => setShowOpening(true)}><Plus size={13} /> Opening / Adjust Stock</Btn>}
        >
          <Hint>
            The system values stock at weighted-average cost: each purchase blends into the average, and every
            sale is costed at that average — that's the cost of sales booked when you post sales. If you started
            using FuelDesk mid-stream, record your current stock and its cost here once so the first cost of
            sales is accurate instead of estimated.
          </Hint>
          <Table headers={['Product', 'Unit', { label: 'On Hand', right: true }, { label: 'Avg Cost', right: true }, { label: 'Stock Value', right: true }]}
            empty={valuation.valuations.length === 0 ? 'No stock tracked yet — purchases and opening balances build this automatically' : null}>
            {valuation.valuations.map((v) => (
              <tr key={v._id}>
                <td className="py-1.5 pr-3 font-medium">{v.productKey}</td>
                <td className="py-1.5 pr-3 text-xs text-gray-400">{v.unit}</td>
                <td className={`py-1.5 pr-3 text-right font-mono text-xs ${v.qtyOnHand < 0 ? 'text-red-600' : ''}`}>{fmt(v.qtyOnHand)}</td>
                <td className="py-1.5 pr-3 text-right font-mono text-xs">₦{fmt(v.avgUnitCost)}</td>
                <td className="py-1.5 text-right font-mono text-xs">₦{fmt(v.totalValue)}</td>
              </tr>
            ))}
            {valuation.valuations.length > 0 && (
              <tr className="font-bold border-t-2 border-gray-200">
                <td colSpan={4} className="py-2 pr-3 text-right">Total inventory value</td>
                <td className="py-2 text-right font-mono">₦{fmt(valuation.totalValue)}</td>
              </tr>
            )}
          </Table>
        </Card>

        {salesPreview && (
          <Modal title={`Sales & Cost Posting Preview — ${salesPreview.period}`} onClose={() => setSalesPreview(null)} wide>
            {salesPreview.alreadyPosted && (
              <p className="text-xs text-amber-600 bg-amber-50 rounded-lg px-3 py-2 mb-3">
                Sales for this month were already posted — running again is blocked.
              </p>
            )}
            <p className="text-[11px] text-gray-400 mb-2">
              Cost is estimated at the current average cost. The actual posting first blends in every recorded
              purchase up to month-end, so booked cost of sales may differ slightly. A ⚠ means no purchase cost
              is on record yet for that product — record opening stock so its cost of sales is accurate.
            </p>
            <Table headers={['Product', 'Source', 'Qty', { label: 'Revenue', right: true }, { label: 'Est. Cost', right: true }, { label: 'Est. Margin', right: true }]}
              empty={salesPreview.lines.length === 0 ? 'No sales recorded in this month' : null}>
              {salesPreview.lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-1.5 pr-3 font-medium">
                    {l.product}{l.estUnitCost <= 0 && <span title="No purchase cost on record" className="text-amber-500 ml-1">⚠</span>}
                  </td>
                  <td className="py-1.5 pr-3 text-xs text-gray-400 capitalize">{l.source}</td>
                  <td className="py-1.5 pr-3 text-xs font-mono">{fmt(l.qty)}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-xs">₦{fmt(l.amount)}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-xs text-gray-500">₦{fmt(l.estCogs)}</td>
                  <td className={`py-1.5 text-right font-mono text-xs ${l.estMargin >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>₦{fmt(l.estMargin)}</td>
                </tr>
              ))}
              {salesPreview.lines.length > 0 && (
                <tr className="font-bold border-t-2 border-gray-200">
                  <td colSpan={3} className="py-2 pr-3 text-right">Totals</td>
                  <td className="py-2 pr-3 text-right font-mono">₦{fmt(salesPreview.total)}</td>
                  <td className="py-2 pr-3 text-right font-mono text-gray-500">₦{fmt(salesPreview.totalEstCogs)}</td>
                  <td className="py-2 text-right font-mono text-emerald-700">₦{fmt(salesPreview.totalEstMargin)}</td>
                </tr>
              )}
            </Table>
            <div className="flex justify-end gap-2 mt-4">
              <Btn variant="secondary" onClick={() => setSalesPreview(null)}>Close</Btn>
              {!salesPreview.alreadyPosted && salesPreview.lines.length > 0 && (
                <Btn variant="success" onClick={runSalesPosting}>Post Sales & Cost</Btn>
              )}
            </div>
          </Modal>
        )}

        {showOpening && (
          <Modal title="Record Opening / Adjustment Stock" onClose={() => setShowOpening(false)}>
            <p className="text-xs text-gray-500 mb-3">
              Tell the costing engine what stock you hold and what it cost. This blends into the weighted
              average — use it for opening balances or to correct a count.
            </p>
            <form onSubmit={saveOpening}>
              <Field label="Product *">
                <select className={inputCls} value={openForm.product} onChange={(e) => setOpenForm({ ...openForm, product: e.target.value })}>
                  {STOCK_PRODUCTS.map((p) => <option key={p} value={p}>{p}</option>)}
                </select>
              </Field>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <Field label="Quantity *" hint="litres / units / kg">
                  <input type="number" step="0.01" min="0" className={inputCls} value={openForm.qty} onChange={(e) => setOpenForm({ ...openForm, qty: e.target.value })} required />
                </Field>
                <Field label="Unit Cost (₦) *" hint="what you paid per unit">
                  <input type="number" step="0.01" min="0" className={inputCls} value={openForm.unitCost} onChange={(e) => setOpenForm({ ...openForm, unitCost: e.target.value })} required />
                </Field>
              </div>
              <Field label="Date *">
                <input type="date" className={inputCls} value={openForm.date} onChange={(e) => setOpenForm({ ...openForm, date: e.target.value })} required />
              </Field>
              <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300 mt-1">
                <input type="checkbox" checked={openForm.postToGL} onChange={(e) => setOpenForm({ ...openForm, postToGL: e.target.checked })} />
                Also book to ledger (Dr Inventory, Cr Owner's Capital)
              </label>
              <div className="flex justify-end gap-2 mt-4">
                <Btn variant="secondary" onClick={() => setShowOpening(false)}>Cancel</Btn>
                <Btn type="submit">Record Stock</Btn>
              </div>
            </form>
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
