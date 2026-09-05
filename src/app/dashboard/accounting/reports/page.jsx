'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Download } from 'lucide-react';
import { api, Card, inputCls, Btn, Table, Hint, fmt, fmtDate, exportRowsAsCsv } from '../shared';
import { extractApiError } from '@/lib/config';

const TABS = ['Trial Balance', 'Balance Sheet', 'Income Statement', 'Cash Flow', 'Aging', 'General Ledger'];

const today = () => new Date().toISOString().split('T')[0];
const yearStart = () => `${new Date().getFullYear()}-01-01`;

export default function ReportsPage() {
  const [tab, setTab] = useState('Trial Balance');
  const [loading, setLoading] = useState(false);

  // Shared params
  const [asOf, setAsOf] = useState(today());
  const [compareTo, setCompareTo] = useState('');
  const [from, setFrom] = useState(yearStart());
  const [to, setTo] = useState(today());
  const [glAccount, setGlAccount] = useState('');
  const [accounts, setAccounts] = useState([]);

  const [data, setData] = useState(null);

  useEffect(() => {
    api.get('/api/accounting/accounts').then((r) => setAccounts(r.data.data)).catch(() => {});
  }, []);

  useEffect(() => { setData(null); load(); }, [tab]); // eslint-disable-line

  async function load() {
    setLoading(true);
    try {
      let res;
      if (tab === 'Trial Balance') {
        res = await api.get(`/api/accounting/reports/trial-balance?asOf=${asOf}`);
      } else if (tab === 'Balance Sheet') {
        res = await api.get(`/api/accounting/reports/balance-sheet?asOf=${asOf}${compareTo ? `&compareTo=${compareTo}` : ''}`);
      } else if (tab === 'Income Statement') {
        res = await api.get(`/api/accounting/reports/income-statement?from=${from}&to=${to}`);
      } else if (tab === 'Cash Flow') {
        res = await api.get(`/api/accounting/reports/cash-flow?from=${from}&to=${to}`);
      } else if (tab === 'Aging') {
        res = await api.get('/api/accounting/reports/aging');
      } else if (tab === 'General Ledger') {
        if (!glAccount) { setLoading(false); return; }
        res = await api.get(`/api/accounting/reports/general-ledger?accountId=${glAccount}&from=${from}&to=${to}&limit=200`);
      }
      setData(res?.data?.data ?? null);
    } catch (e) {
      toast.error(extractApiError(e) || 'Report failed');
    } finally {
      setLoading(false);
    }
  }

  function exportCurrent() {
    if (!data) return;
    if (tab === 'Trial Balance') {
      exportRowsAsCsv(['Code', 'Account', 'Type', 'Debit', 'Credit'],
        data.rows.map((r) => [r.code, r.name, r.type, r.debit, r.credit]), 'trial-balance.csv');
    } else if (tab === 'Income Statement') {
      const rows = [
        ...(data.revenue || []).map((r) => ['Revenue', r.code, r.name, r.amount]),
        ...(data.gains || []).map((r) => ['Gain', r.code, r.name, r.amount]),
        ...(data.expenses || []).map((r) => ['Expense', r.code, r.name, r.amount]),
        ...(data.losses || []).map((r) => ['Loss', r.code, r.name, r.amount]),
        ['', '', 'NET INCOME', data.totals?.netIncome ?? 0],
      ];
      exportRowsAsCsv(['Section', 'Code', 'Account', 'Amount'], rows, 'income-statement.csv');
    } else if (tab === 'Balance Sheet') {
      const flat = [];
      const walk = (nodes, section, depth = 0) =>
        (nodes || []).forEach((n) => { flat.push([section, n.code, `${'  '.repeat(depth)}${n.name}`, n.balance, n.comparativeBalance ?? '']); walk(n.children, section, depth + 1); });
      walk(data.assets, 'Assets'); walk(data.liabilities, 'Liabilities'); walk(data.equity, 'Equity');
      exportRowsAsCsv(['Section', 'Code', 'Account', 'Balance', 'Comparative'], flat, 'balance-sheet.csv');
    } else if (tab === 'Aging') {
      exportRowsAsCsv(['Side', 'Ref', 'Party', 'DueDate', 'DaysOverdue', 'Bucket', 'Open'],
        [...data.receivables.rows.map((r) => ['AR', r.ref, r.party, r.dueDate, r.daysOverdue, r.bucket, r.open]),
         ...data.payables.rows.map((r) => ['AP', r.ref, r.party, r.dueDate, r.daysOverdue, r.bucket, r.open])],
        'aging.csv');
    } else if (tab === 'General Ledger' && data.rows) {
      exportRowsAsCsv(['Entry', 'Date', 'Memo', 'Debit', 'Credit', 'Balance'],
        data.rows.map((r) => [r.entryNumber, r.date, r.memo || r.description || '', r.debit, r.credit, r.runningBalance]),
        'general-ledger.csv');
    }
  }

  const renderBSNodes = (nodes, depth = 0) =>
    (nodes || []).map((n) => (
      <div key={n.accountId}>
        <div className="flex justify-between py-1 text-sm border-b border-gray-50 dark:border-gray-800" style={{ paddingLeft: depth * 18 }}>
          <span className={depth === 0 ? 'font-medium' : 'text-gray-600 dark:text-gray-400'}>
            <span className="font-mono text-xs text-gray-400 mr-2">{n.code}</span>{n.name}
          </span>
          <span className="font-mono text-xs flex gap-4">
            {data.comparativeAsOf && <span className="text-gray-400 w-24 text-right">₦{fmt(n.comparativeBalance)}</span>}
            <span className="w-24 text-right">₦{fmt(n.balance)}</span>
          </span>
        </div>
        {renderBSNodes(n.children, depth + 1)}
      </div>
    ));

  const cfSection = (label, s = {}) => (
    <div className="mb-4">
      <p className="font-semibold text-sm mb-1">{label}</p>
      {(s.items || []).slice(0, 8).map((it, i) => (
        <div key={i} className="flex justify-between text-xs py-0.5 text-gray-500">
          <span className="truncate max-w-[300px]">{it.name}</span>
          <span className={`font-mono ${it.amount < 0 ? 'text-red-500' : 'text-emerald-600'}`}>{it.amount < 0 ? '−' : '+'}₦{fmt(Math.abs(it.amount))}</span>
        </div>
      ))}
      <div className="flex justify-between text-sm font-medium border-t border-gray-100 dark:border-gray-800 mt-1 pt-1">
        <span>Net {label.toLowerCase()}</span>
        <span className={`font-mono ${s.net < 0 ? 'text-red-600' : 'text-emerald-700'}`}>₦{fmt(s.net)}</span>
      </div>
    </div>
  );

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Financial Reports</h1>
          <Btn variant="outline" onClick={exportCurrent} disabled={!data}><Download size={15} /> Export CSV</Btn>
        </div>

        <Hint>
          Six standard financial statements, all built live from your posted entries. Trial Balance — every account's
          balance, used to prove the books are in balance. Balance Sheet — what the station owns vs owes on a date
          (add a second date to compare). Income Statement — profit or loss over a period. Cash Flow — where cash
          actually came from and went. Aging — who owes you and whom you owe, grouped by how overdue. General
          Ledger — the full transaction history of any single account with a running balance. Everything exports
          to CSV for Excel.
        </Hint>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {TABS.map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium ${tab === t ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}>
              {t}
            </button>
          ))}
        </div>

        {/* Param bar */}
        <div className="flex flex-wrap items-end gap-3 mb-4">
          {(tab === 'Trial Balance' || tab === 'Balance Sheet') && (
            <label className="text-xs text-gray-500">As of<br />
              <input type="date" className={`${inputCls} !w-40`} value={asOf} onChange={(e) => setAsOf(e.target.value)} />
            </label>
          )}
          {tab === 'Balance Sheet' && (
            <label className="text-xs text-gray-500">Compare to (optional)<br />
              <input type="date" className={`${inputCls} !w-40`} value={compareTo} onChange={(e) => setCompareTo(e.target.value)} />
            </label>
          )}
          {(tab === 'Income Statement' || tab === 'Cash Flow' || tab === 'General Ledger') && (
            <>
              <label className="text-xs text-gray-500">From<br />
                <input type="date" className={`${inputCls} !w-40`} value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="text-xs text-gray-500">To<br />
                <input type="date" className={`${inputCls} !w-40`} value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </>
          )}
          {tab === 'General Ledger' && (
            <label className="text-xs text-gray-500">Account<br />
              <select className={`${inputCls} !w-64`} value={glAccount} onChange={(e) => setGlAccount(e.target.value)}>
                <option value="">Select account…</option>
                {accounts.map((a) => <option key={a._id} value={a._id}>{a.code} — {a.name}</option>)}
              </select>
            </label>
          )}
          {tab !== 'Aging' && <Btn onClick={load} disabled={loading}>{loading ? 'Loading…' : 'Run Report'}</Btn>}
        </div>

        {/* ── Trial Balance ── */}
        {tab === 'Trial Balance' && data && (
          <Card title={`Trial Balance as of ${fmtDate(data.asOf)}`}
            subtitle={data.balanced ? '✓ In balance' : '⚠ OUT OF BALANCE'}>
            <Table headers={['Code', 'Account', 'Type', { label: 'Debit', right: true }, { label: 'Credit', right: true }]}
              empty={(data.rows || []).length === 0 ? 'No posted activity' : null}>
              {(data.rows || []).map((r) => (
                <tr key={r.accountId}>
                  <td className="py-1.5 pr-3 font-mono text-xs">{r.code}</td>
                  <td className="py-1.5 pr-3">{r.name}</td>
                  <td className="py-1.5 pr-3 text-xs text-gray-400">{r.type}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-xs">{r.debit ? `₦${fmt(r.debit)}` : ''}</td>
                  <td className="py-1.5 text-right font-mono text-xs">{r.credit ? `₦${fmt(r.credit)}` : ''}</td>
                </tr>
              ))}
              <tr className="font-bold border-t-2 border-gray-200">
                <td colSpan={3} className="py-2 pr-3 text-right">Totals</td>
                <td className="py-2 pr-3 text-right font-mono">₦{fmt(data.totalDebit)}</td>
                <td className="py-2 text-right font-mono">₦{fmt(data.totalCredit)}</td>
              </tr>
            </Table>
          </Card>
        )}

        {/* ── Balance Sheet ── */}
        {tab === 'Balance Sheet' && data && (
          <Card title={`Balance Sheet as of ${fmtDate(data.asOf)}`}
            subtitle={`${data.comparativeAsOf ? `compared with ${fmtDate(data.comparativeAsOf)} · ` : ''}${data.balanced ? '✓ Balanced' : '⚠ Imbalance — check unposted periods'}`}>
            {data.comparativeAsOf && (
              <div className="flex justify-end text-xs text-gray-400 gap-4 mb-1 pr-0">
                <span className="w-24 text-right">{fmtDate(data.comparativeAsOf)}</span>
                <span className="w-24 text-right">{fmtDate(data.asOf)}</span>
              </div>
            )}
            <p className="font-bold text-sm text-blue-700 mt-2 mb-1">ASSETS</p>
            {renderBSNodes(data.assets)}
            <div className="flex justify-between font-bold text-sm py-1.5 border-t-2 border-gray-200">
              <span>Total Assets</span><span className="font-mono">₦{fmt(data.totals?.assets)}</span>
            </div>

            <p className="font-bold text-sm text-red-700 mt-4 mb-1">LIABILITIES</p>
            {renderBSNodes(data.liabilities)}
            <div className="flex justify-between font-semibold text-sm py-1.5 border-t border-gray-200">
              <span>Total Liabilities</span><span className="font-mono">₦{fmt(data.totals?.liabilities)}</span>
            </div>

            <p className="font-bold text-sm text-emerald-700 mt-4 mb-1">EQUITY</p>
            {renderBSNodes(data.equity)}
            <div className="flex justify-between text-sm py-1 text-gray-600">
              <span>Current period net income</span><span className="font-mono">₦{fmt(data.netIncomeInEquity)}</span>
            </div>
            <div className="flex justify-between font-semibold text-sm py-1.5 border-t border-gray-200">
              <span>Total Equity</span><span className="font-mono">₦{fmt(data.totals?.equity)}</span>
            </div>
            <div className="flex justify-between font-bold text-sm py-2 border-t-2 border-gray-300 mt-2">
              <span>Total Liabilities + Equity</span><span className="font-mono">₦{fmt(data.totals?.liabilitiesAndEquity)}</span>
            </div>
          </Card>
        )}

        {/* ── Income Statement ── */}
        {tab === 'Income Statement' && data && (
          <Card title={`Income Statement — ${fmtDate(data.from)} to ${fmtDate(data.to)}`}>
            {[['Revenue', data.revenue || [], data.totals?.revenue], ['Gains', data.gains || [], data.totals?.gains],
              ['Expenses', data.expenses || [], data.totals?.expenses], ['Losses', data.losses || [], data.totals?.losses]].map(([label, rows, total]) => (
              rows.length > 0 && (
                <div key={label} className="mb-3">
                  <p className="font-bold text-sm mb-1">{label.toUpperCase()}</p>
                  {rows.map((r) => (
                    <div key={r.accountId} className="flex justify-between text-sm py-0.5">
                      <span className="text-gray-600 dark:text-gray-400"><span className="font-mono text-xs text-gray-400 mr-2">{r.code}</span>{r.name}</span>
                      <span className="font-mono text-xs">₦{fmt(r.amount)}</span>
                    </div>
                  ))}
                  <div className="flex justify-between text-sm font-semibold border-t border-gray-100 pt-1">
                    <span>Total {label}</span><span className="font-mono">₦{fmt(total)}</span>
                  </div>
                </div>
              )
            ))}
            <div className={`flex justify-between font-bold py-2 border-t-2 border-gray-300 ${(data.totals?.netIncome ?? 0) >= 0 ? 'text-emerald-700' : 'text-red-700'}`}>
              <span>NET {(data.totals?.netIncome ?? 0) >= 0 ? 'INCOME' : 'LOSS'}</span>
              <span className="font-mono">₦{fmt(Math.abs(data.totals?.netIncome ?? 0))}</span>
            </div>
          </Card>
        )}

        {/* ── Cash Flow ── */}
        {tab === 'Cash Flow' && data && (
          <Card title={`Statement of Cash Flows — ${fmtDate(data.from)} to ${fmtDate(data.to)}`}>
            {cfSection('Operating Activities', data.operating)}
            {cfSection('Investing Activities', data.investing)}
            {cfSection('Financing Activities', data.financing)}
            <div className="border-t-2 border-gray-300 pt-2 text-sm space-y-1">
              <div className="flex justify-between"><span>Opening cash</span><span className="font-mono">₦{fmt(data.openingCash)}</span></div>
              <div className="flex justify-between font-medium"><span>Net change in cash</span><span className={`font-mono ${data.netChange < 0 ? 'text-red-600' : 'text-emerald-700'}`}>₦{fmt(data.netChange)}</span></div>
              <div className="flex justify-between font-bold"><span>Closing cash</span><span className="font-mono">₦{fmt(data.closingCash)}</span></div>
            </div>
          </Card>
        )}

        {/* ── Aging ── */}
        {tab === 'Aging' && data?.receivables && data?.payables && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {[['Receivables Aging', data.receivables], ['Payables Aging', data.payables]].map(([label, side]) => (
              <Card key={label} title={label} subtitle={`Total open: ₦${fmt(side.total)}`}>
                <div className="grid grid-cols-5 gap-1 mb-3">
                  {Object.entries(side.byBucket).map(([bucket, amt]) => (
                    <div key={bucket} className="text-center p-2 bg-gray-50 dark:bg-gray-800 rounded-lg">
                      <p className="text-[10px] text-gray-400 uppercase">{bucket}</p>
                      <p className="text-xs font-mono font-bold">₦{fmt(amt)}</p>
                    </div>
                  ))}
                </div>
                <Table headers={['Ref', 'Party', 'Due', 'Days', { label: 'Open', right: true }]}
                  empty={side.rows.length === 0 ? 'Nothing outstanding' : null}>
                  {side.rows.slice(0, 30).map((r, i) => (
                    <tr key={i}>
                      <td className="py-1.5 pr-3 font-mono text-xs">{r.ref}</td>
                      <td className="py-1.5 pr-3 text-xs">{r.party}</td>
                      <td className="py-1.5 pr-3 text-xs">{fmtDate(r.dueDate)}</td>
                      <td className={`py-1.5 pr-3 text-xs ${r.daysOverdue > 60 ? 'text-red-600 font-bold' : r.daysOverdue > 0 ? 'text-amber-600' : ''}`}>{r.daysOverdue || '—'}</td>
                      <td className="py-1.5 text-right font-mono text-xs">₦{fmt(r.open)}</td>
                    </tr>
                  ))}
                </Table>
              </Card>
            ))}
          </div>
        )}

        {/* ── General Ledger ── */}
        {tab === 'General Ledger' && data?.account && (
          <Card title={`${data.account.code} — ${data.account.name}`}
            subtitle={`Opening balance: ₦${fmt(data.openingBalance)} · ${data.total} transactions`}>
            <Table headers={['Entry', 'Date', 'Memo / Description', 'Source', { label: 'Debit', right: true }, { label: 'Credit', right: true }, { label: 'Balance', right: true }]}
              empty={(data.rows || []).length === 0 ? 'No transactions in this range' : null}>
              {(data.rows || []).map((r, i) => (
                <tr key={i}>
                  <td className="py-1.5 pr-3 font-mono text-xs">{r.entryNumber}</td>
                  <td className="py-1.5 pr-3 text-xs">{fmtDate(r.date)}</td>
                  <td className="py-1.5 pr-3 text-xs max-w-[240px] truncate">{r.description || r.memo || '—'}</td>
                  <td className="py-1.5 pr-3 text-xs text-gray-400 capitalize">{r.source?.replace(/_/g, ' ')}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-xs">{r.debit ? `₦${fmt(r.debit)}` : ''}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-xs">{r.credit ? `₦${fmt(r.credit)}` : ''}</td>
                  <td className="py-1.5 text-right font-mono text-xs font-medium">₦{fmt(r.runningBalance)}</td>
                </tr>
              ))}
            </Table>
          </Card>
        )}
      </div>
    </DashboardLayout>
  );
}
