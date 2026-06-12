'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Plus, Trash2, CheckCircle2, XCircle, Undo2, Eye } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, StatusBadge, Table, Hint, fmt, fmtDate } from '../shared';

const EMPTY_LINE = { account: '', description: '', debit: '', credit: '' };

export default function JournalsPage() {
  const [journals, setJournals] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [showCreate, setShowCreate] = useState(false);
  const [viewing, setViewing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], memo: '', lines: [{ ...EMPTY_LINE }, { ...EMPTY_LINE }] });

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page, limit: 25 });
      if (statusFilter) params.set('status', statusFilter);
      const res = await api.get(`/api/accounting/journals?${params}`);
      setJournals(res.data.data);
      setTotal(res.data.total);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load journals');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [page, statusFilter]);
  useEffect(() => {
    api.get('/api/accounting/accounts').then((res) => setAccounts(res.data.data)).catch(() => {});
  }, []);

  const totalDebit = form.lines.reduce((s, l) => s + (Number(l.debit) || 0), 0);
  const totalCredit = form.lines.reduce((s, l) => s + (Number(l.credit) || 0), 0);
  const balanced = Math.abs(totalDebit - totalCredit) < 0.005 && totalDebit > 0;

  function setLine(i, key, val) {
    const lines = [...form.lines];
    lines[i] = { ...lines[i], [key]: val };
    // a line is debit OR credit
    if (key === 'debit' && val) lines[i].credit = '';
    if (key === 'credit' && val) lines[i].debit = '';
    setForm({ ...form, lines });
  }

  async function submit(e) {
    e.preventDefault();
    if (!balanced) return toast.error('Entry must balance (debits = credits)');
    setSaving(true);
    try {
      const res = await api.post('/api/accounting/journals', {
        date: form.date,
        memo: form.memo,
        lines: form.lines
          .filter((l) => l.account && (Number(l.debit) || Number(l.credit)))
          .map((l) => ({ account: l.account, description: l.description, debit: Number(l.debit) || 0, credit: Number(l.credit) || 0 })),
      });
      toast.success(res.data.message);
      setShowCreate(false);
      setForm({ date: new Date().toISOString().split('T')[0], memo: '', lines: [{ ...EMPTY_LINE }, { ...EMPTY_LINE }] });
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed to create entry');
    } finally {
      setSaving(false);
    }
  }

  async function action(id, verb, body = {}) {
    try {
      const method = verb === 'reverse' ? 'post' : 'patch';
      const res = await api[method](`/api/accounting/journals/${id}/${verb}`, body);
      toast.success(res.data.message);
      setViewing(null);
      load();
    } catch (e) {
      toast.error(e.response?.data?.message || `${verb} failed`);
    }
  }

  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Journal Entries</h1>
            <p className="text-sm text-gray-500">{total} entries — control accounts only accept system postings</p>
          </div>
          <Btn onClick={() => setShowCreate(true)}><Plus size={15} /> New Entry</Btn>
        </div>

        <Hint>
          A journal entry is the basic record of accounting — every entry moves money between at least two
          accounts and the two sides (debit and credit) must be equal. Large entries wait for a second person's
          approval, posted entries can never be edited (only reversed), and accounts managed by the system
          (AP, AR, Inventory) cannot be posted to by hand — that keeps the books tamper-proof.
        </Hint>

        <div className="flex gap-1.5 mb-4 flex-wrap">
          {['', 'posted', 'pending_approval', 'rejected', 'reversed'].map((s) => (
            <button
              key={s}
              onClick={() => { setStatusFilter(s); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-xs font-medium capitalize ${statusFilter === s ? 'bg-blue-600 text-white' : 'bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300'}`}
            >
              {s === '' ? 'All' : s.replace('_', ' ')}
            </button>
          ))}
        </div>

        <Card>
          <Table
            headers={['Entry #', 'Date', 'Memo', 'Source', { label: 'Amount', right: true }, 'Status', '']}
            empty={!loading && journals.length === 0 ? 'No journal entries yet' : null}
          >
            {journals.map((j) => (
              <tr key={j._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50">
                <td className="py-2 pr-3 font-mono text-xs">{j.entryNumber}</td>
                <td className="py-2 pr-3 text-xs">{fmtDate(j.date)}</td>
                <td className="py-2 pr-3 max-w-[260px] truncate">{j.memo || '—'}</td>
                <td className="py-2 pr-3 text-xs text-gray-400 capitalize">{j.source.replace(/_/g, ' ')}</td>
                <td className="py-2 pr-3 text-right font-mono text-xs">₦{fmt(j.totalDebit)}</td>
                <td className="py-2 pr-3"><StatusBadge status={j.status} /></td>
                <td className="py-2">
                  <button onClick={() => setViewing(j)} className="p-1 text-gray-400 hover:text-blue-600"><Eye size={15} /></button>
                </td>
              </tr>
            ))}
          </Table>
          {total > 25 && (
            <div className="flex justify-between items-center mt-3 text-sm">
              <Btn variant="outline" small disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</Btn>
              <span className="text-gray-400 text-xs">Page {page} of {Math.ceil(total / 25)}</span>
              <Btn variant="outline" small disabled={page >= Math.ceil(total / 25)} onClick={() => setPage(page + 1)}>Next</Btn>
            </div>
          )}
        </Card>

        {showCreate && (
          <Modal title="New Journal Entry" onClose={() => setShowCreate(false)} wide>
            <form onSubmit={submit}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Date *">
                  <input type="date" className={inputCls} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value })} required />
                </Field>
                <Field label="Memo">
                  <input className={inputCls} value={form.memo} onChange={(e) => setForm({ ...form, memo: e.target.value })} placeholder="What is this entry for?" />
                </Field>
              </div>

              <div className="border border-gray-100 dark:border-gray-800 rounded-lg overflow-hidden mb-3">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 dark:bg-gray-800 text-xs text-gray-500">
                    <tr>
                      <th className="text-left px-2 py-2">Account</th>
                      <th className="text-left px-2 py-2">Description</th>
                      <th className="text-right px-2 py-2 w-28">Debit</th>
                      <th className="text-right px-2 py-2 w-28">Credit</th>
                      <th className="w-8" />
                    </tr>
                  </thead>
                  <tbody>
                    {form.lines.map((l, i) => (
                      <tr key={i} className="border-t border-gray-50 dark:border-gray-800">
                        <td className="px-2 py-1">
                          <select className={`${inputCls} !py-1`} value={l.account} onChange={(e) => setLine(i, 'account', e.target.value)}>
                            <option value="">Select…</option>
                            {accounts.filter((a) => a.status === 'Active').map((a) => (
                              <option key={a._id} value={a._id} disabled={a.isControlAccount}>
                                {a.code} — {a.name}{a.isControlAccount ? ' (control)' : ''}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-2 py-1">
                          <input className={`${inputCls} !py-1`} value={l.description} onChange={(e) => setLine(i, 'description', e.target.value)} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="number" step="0.01" min="0" className={`${inputCls} !py-1 text-right`} value={l.debit} onChange={(e) => setLine(i, 'debit', e.target.value)} />
                        </td>
                        <td className="px-2 py-1">
                          <input type="number" step="0.01" min="0" className={`${inputCls} !py-1 text-right`} value={l.credit} onChange={(e) => setLine(i, 'credit', e.target.value)} />
                        </td>
                        <td className="px-1">
                          {form.lines.length > 2 && (
                            <button type="button" onClick={() => setForm({ ...form, lines: form.lines.filter((_, x) => x !== i) })} className="text-gray-300 hover:text-red-500">
                              <Trash2 size={14} />
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                  <tfoot className="bg-gray-50 dark:bg-gray-800 text-xs font-mono">
                    <tr>
                      <td colSpan={2} className="px-2 py-2 text-right font-sans font-medium">Totals</td>
                      <td className="px-2 py-2 text-right">₦{fmt(totalDebit)}</td>
                      <td className="px-2 py-2 text-right">₦{fmt(totalCredit)}</td>
                      <td />
                    </tr>
                  </tfoot>
                </table>
              </div>

              <div className="flex items-center justify-between">
                <Btn variant="outline" small onClick={() => setForm({ ...form, lines: [...form.lines, { ...EMPTY_LINE }] })}>
                  <Plus size={13} /> Add line
                </Btn>
                <span className={`text-xs font-medium ${balanced ? 'text-emerald-600' : 'text-red-500'}`}>
                  {balanced ? '✓ Balanced' : `Out of balance by ₦${fmt(Math.abs(totalDebit - totalCredit))}`}
                </span>
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Btn variant="secondary" onClick={() => setShowCreate(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving || !balanced}>{saving ? 'Posting…' : 'Post Entry'}</Btn>
              </div>
            </form>
          </Modal>
        )}

        {viewing && (
          <Modal title={`${viewing.entryNumber} — ${viewing.status.replace('_', ' ')}`} onClose={() => setViewing(null)} wide>
            <div className="text-sm space-y-1 mb-4">
              <p><span className="text-gray-400">Date:</span> {fmtDate(viewing.date)} <span className="text-gray-400 ml-3">Period:</span> {viewing.period}</p>
              <p><span className="text-gray-400">Memo:</span> {viewing.memo || '—'}</p>
              <p><span className="text-gray-400">Source:</span> <span className="capitalize">{viewing.source.replace(/_/g, ' ')}</span> {viewing.sourceRef && <span className="font-mono text-xs">({viewing.sourceRef})</span>}</p>
              <p><span className="text-gray-400">Created by:</span> {viewing.createdBy?.firstName} {viewing.createdBy?.lastName}
                {viewing.approvedBy && <> · <span className="text-gray-400">Approved by:</span> {viewing.approvedBy.firstName} {viewing.approvedBy.lastName}</>}
              </p>
            </div>
            <Table headers={['Account', 'Description', { label: 'Debit', right: true }, { label: 'Credit', right: true }]}>
              {viewing.lines.map((l, i) => (
                <tr key={i}>
                  <td className="py-1.5 pr-3 text-xs">{l.account?.code} — {l.account?.name}</td>
                  <td className="py-1.5 pr-3 text-xs text-gray-500">{l.description || '—'}</td>
                  <td className="py-1.5 pr-3 text-right font-mono text-xs">{l.debit ? `₦${fmt(l.debit)}` : ''}</td>
                  <td className="py-1.5 text-right font-mono text-xs">{l.credit ? `₦${fmt(l.credit)}` : ''}</td>
                </tr>
              ))}
            </Table>
            <div className="flex justify-end gap-2 mt-4">
              {viewing.status === 'pending_approval' && (
                <>
                  <Btn variant="danger" onClick={() => action(viewing._id, 'reject')}><XCircle size={15} /> Reject</Btn>
                  <Btn variant="success" onClick={() => action(viewing._id, 'approve')}><CheckCircle2 size={15} /> Approve & Post</Btn>
                </>
              )}
              {viewing.status === 'posted' && (
                <Btn variant="outline" onClick={() => { if (confirm('Reverse this entry? A mirror-image entry will be posted.')) action(viewing._id, 'reverse'); }}>
                  <Undo2 size={15} /> Reverse
                </Btn>
              )}
            </div>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
