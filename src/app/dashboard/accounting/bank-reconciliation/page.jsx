'use client';
import { useState, useEffect } from 'react';
import DashboardLayout from '@/components/Dashboard/DashboardLayout';
import toast from 'react-hot-toast';
import { Upload, Wand2, CheckCircle2, ArrowLeft, Plus, Trash2, Link2 } from 'lucide-react';
import { api, Card, Modal, Field, inputCls, Btn, StatusBadge, Table, fmt, fmtDate } from '../shared';

export default function BankReconciliationPage() {
  const [statements, setStatements] = useState([]);
  const [rules, setRules] = useState([]);
  const [bankAccounts, setBankAccounts] = useState([]);
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Detail view
  const [detail, setDetail] = useState(null); // { statement, unreconciledGlLines }
  const [matchingLine, setMatchingLine] = useState(null);

  const [showImport, setShowImport] = useState(false);
  const [importForm, setImportForm] = useState({ bankAccountId: '', source: 'csv', content: '', openingBalance: '', closingBalance: '' });
  const [showRule, setShowRule] = useState(false);
  const [ruleForm, setRuleForm] = useState({ name: '', descriptionContains: '', direction: 'any', postToAccountId: '' });

  const load = async () => {
    setLoading(true);
    try {
      const [st, ru] = await Promise.all([
        api.get('/api/accounting/bank/statements'),
        api.get('/api/accounting/bank/rules'),
      ]);
      setStatements(st.data.data);
      setRules(ru.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    api.get('/api/accounting/accounts').then((r) => {
      setAccounts(r.data.data.filter((a) => a.status === 'Active'));
      setBankAccounts(r.data.data.filter((a) => a.isReconcilable && a.status === 'Active'));
    }).catch(() => {});
  }, []);

  async function openDetail(id) {
    try {
      const res = await api.get(`/api/accounting/bank/statements/${id}`);
      setDetail(res.data.data);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Failed to open statement');
    }
  }

  async function runImport(e) {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.post('/api/accounting/bank/statements', importForm);
      toast.success(res.data.message);
      setShowImport(false);
      setImportForm({ bankAccountId: '', source: 'csv', content: '', openingBalance: '', closingBalance: '' });
      load();
      openDetail(res.data.data._id);
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Import failed');
    } finally {
      setSaving(false);
    }
  }

  async function autoMatch() {
    try {
      const res = await api.post(`/api/accounting/bank/statements/${detail.statement._id}/automatch`);
      toast.success(res.data.message);
      openDetail(detail.statement._id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Auto-match failed');
    }
  }

  async function manualMatch(glLine) {
    try {
      await api.post(`/api/accounting/bank/statements/${detail.statement._id}/match`, {
        lineId: matchingLine._id,
        journalId: glLine.journalId,
        journalLineId: glLine.journalLineId,
      });
      toast.success('Matched');
      setMatchingLine(null);
      openDetail(detail.statement._id);
    } catch (e) {
      toast.error(e.response?.data?.message || 'Match failed');
    }
  }

  async function complete(force = false) {
    try {
      const res = await api.post(`/api/accounting/bank/statements/${detail.statement._id}/complete`, { force });
      toast.success(res.data.message);
      setDetail(null);
      load();
    } catch (e) {
      const msg = e.response?.data?.message;
      if (msg?.includes('unmatched') && confirm(`${msg}\n\nComplete anyway?`)) return complete(true);
      if (!msg?.includes('unmatched')) toast.error(msg || 'Failed');
    }
  }

  async function saveRule(e) {
    e.preventDefault();
    try {
      await api.post('/api/accounting/bank/rules', ruleForm);
      toast.success('Rule created');
      setShowRule(false);
      setRuleForm({ name: '', descriptionContains: '', direction: 'any', postToAccountId: '' });
      load();
    } catch (e2) {
      toast.error(e2.response?.data?.message || 'Failed');
    }
  }

  // ── Detail view ──────────────────────────────────────────────────────────────
  if (detail) {
    const st = detail.statement;
    return (
      <DashboardLayout>
        <div className="w-full px-4 sm:px-6 py-4">
          <button onClick={() => setDetail(null)} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800 mb-3">
            <ArrowLeft size={15} /> All statements
          </button>
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">
                {st.bankAccount?.code} — {st.bankAccount?.name}
              </h1>
              <p className="text-sm text-gray-500">
                Statement {fmtDate(st.statementDate)} · {st.matchedCount}/{st.lines.length} matched · <StatusBadge status={st.status} />
              </p>
            </div>
            {st.status !== 'completed' && (
              <div className="flex gap-2">
                <Btn variant="outline" onClick={autoMatch}><Wand2 size={15} /> Auto-Match</Btn>
                <Btn variant="success" onClick={() => complete(false)}><CheckCircle2 size={15} /> Complete Reconciliation</Btn>
              </div>
            )}
          </div>

          <Card title="Statement Lines">
            <Table headers={['Date', 'Description', 'Reference', { label: 'Amount', right: true }, 'Match', '']}>
              {st.lines.map((l) => (
                <tr key={l._id} className={l.matched ? 'opacity-60' : ''}>
                  <td className="py-2 pr-3 text-xs">{fmtDate(l.date)}</td>
                  <td className="py-2 pr-3 text-xs max-w-[280px] truncate">{l.description}</td>
                  <td className="py-2 pr-3 text-xs text-gray-400">{l.reference || '—'}</td>
                  <td className={`py-2 pr-3 text-right font-mono text-xs ${l.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>
                    {l.amount < 0 ? '−' : '+'}₦{fmt(Math.abs(l.amount))}
                  </td>
                  <td className="py-2 pr-3 text-xs">
                    {l.matched
                      ? <span className="text-emerald-600 capitalize">✓ {l.matchRule}</span>
                      : <span className="text-amber-600">unmatched</span>}
                  </td>
                  <td className="py-2">
                    {!l.matched && st.status !== 'completed' && (
                      <button onClick={() => setMatchingLine(l)} className="p-1 text-gray-400 hover:text-blue-600" title="Match manually">
                        <Link2 size={15} />
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </Table>
          </Card>

          {matchingLine && (
            <Modal title={`Match: ${matchingLine.description} (₦${fmt(Math.abs(matchingLine.amount))})`} onClose={() => setMatchingLine(null)} wide>
              <p className="text-xs text-gray-500 mb-2">Pick the GL transaction this bank line settles:</p>
              <Table headers={['Entry #', 'Date', 'Memo', { label: 'Amount', right: true }, '']}
                empty={detail.unreconciledGlLines.length === 0 ? 'No unreconciled GL lines on this bank account' : null}>
                {detail.unreconciledGlLines.map((g) => (
                  <tr key={`${g.journalId}-${g.journalLineId}`}>
                    <td className="py-1.5 pr-3 font-mono text-xs">{g.entryNumber}</td>
                    <td className="py-1.5 pr-3 text-xs">{fmtDate(g.date)}</td>
                    <td className="py-1.5 pr-3 text-xs max-w-[220px] truncate">{g.memo || '—'}</td>
                    <td className={`py-1.5 pr-3 text-right font-mono text-xs ${g.amount < 0 ? 'text-red-600' : 'text-emerald-600'}`}>₦{fmt(Math.abs(g.amount))}</td>
                    <td className="py-1.5">
                      <Btn small variant={Math.abs(g.amount - matchingLine.amount) < 0.01 ? 'success' : 'outline'} onClick={() => manualMatch(g)}>
                        Match
                      </Btn>
                    </td>
                  </tr>
                ))}
              </Table>
            </Modal>
          )}
        </div>
      </DashboardLayout>
    );
  }

  // ── List view ────────────────────────────────────────────────────────────────
  return (
    <DashboardLayout>
      <div className="w-full px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800 dark:text-gray-100">Bank Reconciliation</h1>
            <p className="text-sm text-gray-500">Import statements, match against the ledger</p>
          </div>
          <Btn onClick={() => setShowImport(true)}><Upload size={15} /> Import Statement</Btn>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <Card title="Statements" className="lg:col-span-2">
            <Table
              headers={['Bank Account', 'Date', 'Source', 'Matched', 'Status', '']}
              empty={!loading && statements.length === 0 ? 'No statements imported yet' : null}
            >
              {statements.map((s) => (
                <tr key={s._id} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 cursor-pointer" onClick={() => openDetail(s._id)}>
                  <td className="py-2 pr-3">{s.bankAccount?.code} — {s.bankAccount?.name}</td>
                  <td className="py-2 pr-3 text-xs">{fmtDate(s.statementDate)}</td>
                  <td className="py-2 pr-3 text-xs uppercase">{s.source}</td>
                  <td className="py-2 pr-3 text-xs">{s.matchedCount}/{s.lines?.length ?? s.matchedCount + s.unmatchedCount}</td>
                  <td className="py-2 pr-3"><StatusBadge status={s.status} /></td>
                  <td className="py-2 text-xs text-blue-600">Open →</td>
                </tr>
              ))}
            </Table>
          </Card>

          <Card title="Matching Rules" subtitle="auto-post recurring narrations"
            actions={<Btn small variant="outline" onClick={() => setShowRule(true)}><Plus size={13} /> Rule</Btn>}>
            {rules.length === 0 ? (
              <p className="text-xs text-gray-400 py-4 text-center">
                No rules. Example: narration contains "SMS CHARGE" → post to Bank Charges.
              </p>
            ) : (
              <ul className="divide-y divide-gray-50 dark:divide-gray-800 text-sm">
                {rules.map((r) => (
                  <li key={r._id} className="py-2 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-gray-700 dark:text-gray-200">{r.name}</p>
                      <p className="text-xs text-gray-400">
                        contains “{r.descriptionContains}” → {r.postToAccount ? `${r.postToAccount.code} ${r.postToAccount.name}` : 'match only'}
                      </p>
                    </div>
                    <button onClick={async () => { await api.delete(`/api/accounting/bank/rules/${r._id}`); load(); }} className="text-gray-300 hover:text-red-500">
                      <Trash2 size={14} />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>

        {showImport && (
          <Modal title="Import Bank Statement" onClose={() => setShowImport(false)} wide>
            <form onSubmit={runImport}>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Bank Account *">
                  <select className={inputCls} value={importForm.bankAccountId} onChange={(e) => setImportForm({ ...importForm, bankAccountId: e.target.value })} required>
                    <option value="">Select…</option>
                    {bankAccounts.map((a) => <option key={a._id} value={a._id}>{a.code} — {a.name}</option>)}
                  </select>
                </Field>
                <Field label="Format *">
                  <select className={inputCls} value={importForm.source} onChange={(e) => setImportForm({ ...importForm, source: e.target.value })}>
                    <option value="csv">CSV (date, description, reference, amount)</option>
                    <option value="mt940">MT940 (SWIFT)</option>
                  </select>
                </Field>
              </div>
              <Field
                label="Statement content *"
                hint={importForm.source === 'csv'
                  ? 'Columns: date,description,reference,amount — credits positive, debits negative'
                  : 'Paste the raw MT940 text from your bank'}
              >
                <textarea
                  className={`${inputCls} h-44 font-mono text-xs`}
                  value={importForm.content}
                  onChange={(e) => setImportForm({ ...importForm, content: e.target.value })}
                  placeholder={importForm.source === 'csv'
                    ? 'date,description,reference,amount\n2026-06-01,TRANSFER FROM XYZ LTD,INV-2026-000001,150000\n2026-06-02,SMS CHARGE,,-50'
                    : ':61:2606010601C150000NTRF//REF123\n:86:TRANSFER FROM XYZ LTD'}
                  required
                />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Opening Balance">
                  <input type="number" step="0.01" className={inputCls} value={importForm.openingBalance} onChange={(e) => setImportForm({ ...importForm, openingBalance: e.target.value })} />
                </Field>
                <Field label="Closing Balance">
                  <input type="number" step="0.01" className={inputCls} value={importForm.closingBalance} onChange={(e) => setImportForm({ ...importForm, closingBalance: e.target.value })} />
                </Field>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Btn variant="secondary" onClick={() => setShowImport(false)}>Cancel</Btn>
                <Btn type="submit" disabled={saving}>{saving ? 'Importing…' : 'Import'}</Btn>
              </div>
            </form>
          </Modal>
        )}

        {showRule && (
          <Modal title="New Matching Rule" onClose={() => setShowRule(false)}>
            <form onSubmit={saveRule}>
              <Field label="Rule Name *">
                <input className={inputCls} value={ruleForm.name} onChange={(e) => setRuleForm({ ...ruleForm, name: e.target.value })} required />
              </Field>
              <Field label="Narration Contains *" hint="case-insensitive substring of the bank description">
                <input className={inputCls} value={ruleForm.descriptionContains} onChange={(e) => setRuleForm({ ...ruleForm, descriptionContains: e.target.value })} required />
              </Field>
              <div className="grid grid-cols-2 gap-3">
                <Field label="Direction">
                  <select className={inputCls} value={ruleForm.direction} onChange={(e) => setRuleForm({ ...ruleForm, direction: e.target.value })}>
                    <option value="any">Any</option>
                    <option value="credit">Money in</option>
                    <option value="debit">Money out</option>
                  </select>
                </Field>
                <Field label="Auto-post To" hint="creates the missing JE">
                  <select className={inputCls} value={ruleForm.postToAccountId} onChange={(e) => setRuleForm({ ...ruleForm, postToAccountId: e.target.value })}>
                    <option value="">No auto-post</option>
                    {accounts.filter((a) => !a.isControlAccount).map((a) => (
                      <option key={a._id} value={a._id}>{a.code} — {a.name}</option>
                    ))}
                  </select>
                </Field>
              </div>
              <div className="flex justify-end gap-2 mt-3">
                <Btn variant="secondary" onClick={() => setShowRule(false)}>Cancel</Btn>
                <Btn type="submit">Create Rule</Btn>
              </div>
            </form>
          </Modal>
        )}
      </div>
    </DashboardLayout>
  );
}
